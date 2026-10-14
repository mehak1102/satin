import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage } from "../../components/form/Field";
import { api, formatPrice } from "../../services/api";
import { Title } from "../../components/motion/Title";

export function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const customers = useQuery({
    queryKey: ["admin", "customers", q],
    queryFn: async () => (await api.get("/admin/customers", { params: q ? { q } : {} })).data.customers,
  });

  return (
    <div>
      <label className="block text-sm">
        <span className="sr-only">Search customers</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-full border border-line bg-paper px-4 py-3 sm:max-w-md"
        />
      </label>
      {customers.isLoading && <p className="mt-6 text-ink-soft">Loading customers…</p>}
      {customers.isError && <Retry className="mt-6" message="Customers could not be loaded." onRetry={() => customers.refetch()} />}
      {customers.data?.length === 0 && <p className="mt-6 text-ink-soft">No customers match that search.</p>}
      {customers.data?.length > 0 && (
        <ul className="mt-6 divide-y divide-line rounded-[1.5rem] bg-paper px-5">
          {customers.data.map((customer) => (
            <li key={customer.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link to={`/admin/customers/${customer.id}`} className="font-display text-2xl text-ink">
                  {customer.name}
                </Link>
                <p className="text-sm text-ink-soft">
                  {customer.email}
                  {customer.role === "admin" ? " · Admin" : ""}
                  {customer.isActive ? "" : " · Disabled"}
                </p>
              </div>
              <p className="text-sm text-ink-soft">{customer.orderCount} orders</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminCustomer() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const customer = useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: async () => (await api.get(`/admin/customers/${id}`)).data,
  });

  const update = useMutation({
    mutationFn: async (isActive) => (await api.patch(`/admin/customers/${id}`, { isActive })).data.customer,
    onSuccess: (next) => {
      setError("");
      queryClient.setQueryData(["admin", "customer", id], (current) => (current ? { ...current, customer: { ...current.customer, ...next } } : current));
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "That account could not be updated.")),
  });

  if (customer.isLoading) return <p className="text-ink-soft">Loading customer…</p>;
  if (customer.isError) return <p className="text-rose">{apiErrorMessage(customer.error, "That customer was not found.")}</p>;

  const person = customer.data.customer;
  const orders = customer.data.orders || [];

  function toggle() {
    if (person.isActive && !window.confirm(`Disable ${person.name}'s account? They will not be able to sign in.`)) return;
    update.mutate(!person.isActive);
  }

  return (
    <div>
      <Link to="/admin/customers" className="text-sm underline">
        All customers
      </Link>
      <Title as="h2" className="mt-3 font-display text-4xl text-ink">{person.name}</Title>
      <p className="mt-2 text-sm text-ink-soft">
        {person.email}
        {person.phone ? ` · ${person.phone}` : ""}
        {person.role === "admin" ? " · Admin" : ""}
        {person.isActive ? "" : " · Disabled"}
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={update.isPending}
        className="mt-4 rounded-full border border-ink/20 px-4 py-2 text-sm disabled:opacity-40"
      >
        {person.isActive ? "Disable account" : "Enable account"}
      </button>
      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
      <Title as="h3" className="mt-10 font-display text-3xl text-ink">Orders</Title>
      {orders.length === 0 && <p className="mt-3 text-ink-soft">No orders yet.</p>}
      <ul className="mt-3 divide-y divide-line">
        {orders.map((order) => (
          <li key={order._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <Link to={`/admin/orders/${order._id}`} className="font-display text-2xl text-ink">
                {order.orderNumber}
              </Link>
              <p className="text-sm text-ink-soft">
                {order.paymentStatus} · {order.orderStatus} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <p className="text-sm">{formatPrice(order.total)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
