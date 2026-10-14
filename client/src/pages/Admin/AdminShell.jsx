import { Suspense } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageMeta } from "../../components/seo/PageMeta";
import { Title } from "../../components/motion/Title";

const links = [
  ["/admin", "Overview"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/customers", "Customers"],
  ["/admin/messages", "Messages"],
  ["/admin/reviews", "Reviews"],
  ["/admin/notes", "Notes"],
  ["/admin/settings", "Settings"],
];

export function AdminNotFound() {
  return (
    <section>
      <Title as="h2" className="font-display text-3xl text-ink">Page not found</Title>
      <p className="mt-3 text-ink-soft">That dashboard page is not available.</p>
      <Link to="/admin" className="mt-4 inline-block text-sm underline">
        Back to overview
      </Link>
    </section>
  );
}

export function AdminRoute() {
  const auth = useAuth();

  const meta = <PageMeta title="Dashboard — Satin" description="Satin shop dashboard." path="/admin" />;

  if (auth.loading) return <>{meta}<p className="mx-auto max-w-5xl px-5 py-16 text-ink-soft">Loading…</p></>;

  if (!auth.user) {
    return (
      <section className="mx-auto max-w-xl px-5 py-20">
        {meta}
        <Title as="h1" className="font-display text-5xl text-ink">Dashboard</Title>
        <p className="mt-4 text-ink-soft">Sign in with an admin account to manage the shop.</p>
        <Link to="/account?next=/admin" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm text-paper">
          Sign in
        </Link>
      </section>
    );
  }

  if (auth.user.role !== "admin") {
    return (
      <section className="mx-auto max-w-xl px-5 py-20">
        {meta}
        <Title as="h1" className="font-display text-5xl text-ink">Dashboard</Title>
        <p className="mt-4 text-ink-soft">This account cannot open the dashboard.</p>
        <Link to="/account" className="mt-6 inline-block text-sm underline">
          Back to account
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {meta}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-rose">Admin</p>
          <Title as="h1" className="mt-1 font-display text-4xl text-ink">Satin</Title>
        </div>
        <Link to="/" className="text-sm underline">
          View shop
        </Link>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Dashboard">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm ${isActive ? "bg-ink text-paper" : "bg-paper text-ink"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8">
        <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
