import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Retry } from "../../components/admin/Retry";
import { api, formatPrice } from "../../services/api";
import { Title } from "../../components/motion/Title";

export function AdminHome() {
  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => (await api.get("/admin/overview")).data.overview,
  });

  if (overview.isLoading) return <p className="text-ink-soft">Loading overview…</p>;
  if (overview.isError) return <Retry message="Overview could not be loaded." onRetry={() => overview.refetch()} />;

  const data = overview.data;
  const cards = [
    ["Products", data.products, "/admin/products"],
    ["Low stock", data.lowStock, "/admin/products"],
    ["Orders", data.orders, "/admin/orders"],
    ["Customers", data.customers, "/admin/customers"],
    ["Paid", formatPrice(data.paidTotal), "/admin/orders"],
    ["New messages", data.newMessages, "/admin/messages"],
  ];

  const low = data.lowStockItems || [];

  return (
    <div>
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(([label, value, to]) => (
        <li key={label}>
          <Link to={to} className="block rounded-[1.5rem] bg-paper p-6">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-2 font-display text-4xl text-ink">{value}</p>
          </Link>
        </li>
      ))}
    </ul>
    {low.length > 0 && (
      <section className="mt-8">
        <Title as="h2" className="font-display text-3xl text-ink">Low stock</Title>
        <ul className="mt-4 divide-y divide-line rounded-[1.5rem] bg-paper px-5">
          {low.map((item) => (
            <li key={item._id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <Link to={`/admin/products/${item._id}`} className="font-display text-2xl text-ink">
                {item.name}
              </Link>
              <p className="text-sm text-ink-soft">
                {item.stock} in stock · low at {item.lowStockThreshold}
              </p>
            </li>
          ))}
        </ul>
        {data.lowStock > low.length && (
          <p className="mt-3 text-sm text-ink-soft">
            <Link to="/admin/products" className="underline">
              All products
            </Link>
          </p>
        )}
      </section>
    )}
    </div>
  );
}
