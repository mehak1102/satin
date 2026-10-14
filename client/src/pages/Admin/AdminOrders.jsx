import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage, inputClass } from "../../components/form/Field";
import { api, formatPrice } from "../../services/api";
import { Title } from "../../components/motion/Title";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const payments = ["pending", "paid", "failed", "refunded"];

export function AdminOrders() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const orders = useQuery({
    queryKey: ["admin", "orders", q, paymentStatus, orderStatus],
    queryFn: async () =>
      (
        await api.get("/admin/orders", {
          params: {
            ...(q ? { q } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(orderStatus ? { orderStatus } : {}),
          },
        })
      ).data.orders,
  });

  const filtering = Boolean(q || paymentStatus || orderStatus);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm">
          <span className="sr-only">Search orders</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, email, or tracking"
            className="w-full rounded-full border border-line bg-paper px-4 py-3"
          />
        </label>
        <select
          aria-label="Payment"
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
          className="rounded-full border border-line bg-paper px-4 py-3 text-sm"
        >
          <option value="">All payments</option>
          {payments.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          aria-label="Fulfilment"
          value={orderStatus}
          onChange={(event) => setOrderStatus(event.target.value)}
          className="rounded-full border border-line bg-paper px-4 py-3 text-sm"
        >
          <option value="">All fulfilment</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      {orders.isLoading && <p className="mt-6 text-ink-soft">Loading orders…</p>}
      {orders.isError && <Retry className="mt-6" message="Orders could not be loaded." onRetry={() => orders.refetch()} />}
      {orders.data?.length === 0 && (
        <p className="mt-6 text-ink-soft">{filtering ? "No orders match." : "No orders yet."}</p>
      )}
      {orders.data?.length > 0 && (
    <ul className="mt-6 divide-y divide-line rounded-[1.5rem] bg-paper px-5">
      {orders.data.map((order) => (
        <li key={order._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <Link to={`/admin/orders/${order._id}`} className="font-display text-2xl text-ink">
              {order.orderNumber}
            </Link>
            <p className="text-sm text-ink-soft">
              {order.contactEmail} · {order.paymentStatus} · {order.orderStatus}
            </p>
          </div>
          <p className="text-sm">{formatPrice(order.total)}</p>
        </li>
      ))}
    </ul>
      )}
    </div>
  );
}

export function AdminOrder() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const order = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async () => (await api.get(`/admin/orders/${id}`)).data.order,
  });

  const save = useMutation({
    mutationFn: async (values) => (await api.patch(`/admin/orders/${id}`, values)).data,
    onSuccess: (payload) => {
      setError("");
      const order = payload.order;
      const note = payload.emailed
        ? order.orderStatus === "delivered"
          ? `Saved. A delivery note was sent to ${order.contactEmail}.`
          : `Saved. A shipping note was sent to ${order.contactEmail}.`
        : order.orderStatus === "shipped" && order.paymentStatus === "paid" && !order.shipmentSent
          ? "Saved. The shipping note was not sent."
          : order.orderStatus === "delivered" && order.paymentStatus === "paid" && !order.deliverySent
            ? "Saved. The delivery note was not sent."
            : "Saved.";
      setSaved(note);
      queryClient.setQueryData(["admin", "order", id], payload.order);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not update the order.")),
  });

  if (order.isLoading) return <p className="text-ink-soft">Loading order…</p>;
  if (order.isError) return <p className="text-rose">{apiErrorMessage(order.error, "Order not found.")}</p>;

  const data = order.data;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <Link to="/admin/orders" className="text-sm underline">
          All orders
        </Link>
        <Title as="h2" className="mt-3 font-display text-4xl text-ink">{data.orderNumber}</Title>
        <p className="mt-2 text-sm text-ink-soft">
          Payment {data.paymentStatus} · {formatPrice(data.total)}
        </p>
        {data.refundSent && <p className="mt-1 text-sm text-ink-soft">A refund note was sent to {data.contactEmail}.</p>}
        <ul className="mt-6 divide-y divide-line">
          {data.items.map((item) => (
            <li key={item.sku} className="flex justify-between gap-3 py-3 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <address className="mt-6 text-sm not-italic leading-6 text-ink-soft">
          {data.shippingAddress.fullName}
          <br />
          {data.shippingAddress.line1}
          {data.shippingAddress.line2 ? `, ${data.shippingAddress.line2}` : ""}
          <br />
          {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.postalCode}
          <br />
          {data.shippingAddress.phone}
        </address>
      </div>
      <form
        className="h-fit space-y-4 rounded-[1.5rem] bg-paper p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setSaved("");
          save.mutate({
            orderStatus: form.get("orderStatus"),
            trackingNumber: String(form.get("trackingNumber") || ""),
          });
        }}
      >
        <label className="block text-sm">
          Fulfilment
          <select name="orderStatus" defaultValue={data.orderStatus} className={inputClass}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Tracking number
          <input name="trackingNumber" defaultValue={data.trackingNumber || ""} className={inputClass} />
        </label>
        <p className="text-xs leading-5 text-ink-soft">
          Payment status stays with Razorpay. Saving a paid order as shipped or delivered emails the customer once. Add a tracking number before the shipped save if you have one.
        </p>
        {error && <p className="text-sm text-rose">{error}</p>}
        {saved && <p className="text-sm text-teal">{saved}</p>}
        <button type="submit" disabled={save.isPending} className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-40">
          Save order
        </button>
      </form>
    </div>
  );
}
