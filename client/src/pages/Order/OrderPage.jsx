import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, LockKeyhole, PackageSearch, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { PageHero } from "../../components/layout/PageHero";
import { StatePanel, panelClass, primaryButton, secondaryButton } from "../../components/layout/StatePanel";
import { useAuth } from "../../context/AuthContext";
import { api, formatPrice } from "../../services/api";

const ease = [0.22, 1, 0.36, 1];
const steps = ["confirmed", "processing", "shipped", "delivered"];

function retryServerErrors(count, error) {
  const status = error?.response?.status;
  return (!status || status >= 500) && count < 2;
}

export function OrderPage() {
  const { id } = useParams();
  const auth = useAuth();
  const signedIn = Boolean(auth.user);
  const order = useQuery({
    queryKey: ["order", id],
    enabled: signedIn,
    retry: retryServerErrors,
    queryFn: async () => (await api.get(`/orders/${id}`)).data.order,
  });

  const loading = auth.loading || (signedIn && order.isLoading);
  const status = order.error?.response?.status;

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        {loading && <OrderSkeleton />}

        {!loading && !signedIn && (
          <>
            <PageHero eyebrow="Order" title="Your order" size="md" />
            <StatePanel icon={LockKeyhole} title="Sign in to see this order." text="Orders are kept on the account that placed them.">
              <Link to={`/account?next=/order/${id}`} className={primaryButton}>
                Sign in
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/shop" className={secondaryButton}>
                Browse packs
              </Link>
            </StatePanel>
          </>
        )}

        {!loading && signedIn && order.isError && (
          <>
            <PageHero eyebrow="Order" title={status === 404 ? "Not found" : "Not loaded"} size="md" />
            {status === 404 || status === 400 ? (
              <StatePanel
                icon={PackageSearch}
                title="This order is not on your account."
                text="Check that you are signed in with the email used at checkout."
              >
                <Link to="/account" className={primaryButton}>
                  Your orders
                </Link>
                <Link to="/shop" className={secondaryButton}>
                  Browse packs
                </Link>
              </StatePanel>
            ) : (
              <StatePanel icon={RefreshCw} title="This order could not be loaded." text="Check the connection and try again.">
                <button type="button" onClick={() => order.refetch()} className={primaryButton}>
                  Try again
                </button>
              </StatePanel>
            )}
          </>
        )}

        {!loading && signedIn && order.data && <OrderDetails data={order.data} />}
      </section>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Loading order…</p>
      <div aria-hidden="true">
        <div className="h-3 w-24 animate-pulse rounded-full bg-blush" />
        <div className="mt-5 h-20 w-3/4 max-w-xl animate-pulse rounded-3xl bg-blush" />
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="h-72 animate-pulse rounded-[28px] bg-white/60" />
          <div className="h-72 animate-pulse rounded-[28px] bg-white/60" />
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ data }) {
  const reduce = useReducedMotion();
  const paid = data.paymentStatus === "paid";
  const refunded = data.paymentStatus === "refunded";
  const cancelled = data.orderStatus === "cancelled";
  const placed = new Date(data.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const notes = [
    paid && data.confirmationSent && "A confirmation",
    data.shipmentSent && "A shipping note",
    data.deliverySent && "A delivery note",
    data.refundSent && "A refund note",
  ].filter(Boolean);

  const intro = paid
    ? cancelled
      ? "This order has been cancelled."
      : "Payment received. This order is confirmed."
    : refunded
      ? "The payment for this order has been marked refunded."
      : data.paymentStatus === "failed"
        ? "The payment for this order did not go through."
        : "This order is not paid yet.";

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <>
      <PageHero eyebrow={`Order · placed ${placed}`} title={data.orderNumber} size="md" sticker={paid && !cancelled ? "Paid" : refunded ? "Refunded" : null}>
        <p>{intro}</p>
      </PageHero>

      {paid && !cancelled && <Progress current={data.orderStatus} trackingNumber={data.trackingNumber} rise={rise(0.25)} />}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <motion.section {...rise(0.35)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="order-items">
          <h2 id="order-items" className="font-display text-3xl font-medium">
            Items
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {data.items.map((item) => (
              <li key={item.sku} className="flex items-center gap-4 py-4">
                <Link
                  to={`/product/${item.slug}`}
                  className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]"
                >
                  {item.image ? <img src={item.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-2" /> : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.slug}`} className="font-display text-xl leading-tight font-medium hover:underline hover:underline-offset-4">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-display text-lg font-medium">{formatPrice(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </motion.section>

        <div className="space-y-6">
          <motion.section {...rise(0.45)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="order-summary">
            <h2 id="order-summary" className="font-display text-3xl font-medium">
              Summary
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Subtotal" value={formatPrice(data.subtotal)} />
              {data.discount > 0 && <Row label="Discount" value={`− ${formatPrice(data.discount)}`} />}
              <Row label="Shipping" value={formatPrice(data.shipping)} />
              <Row label="Tax" value={formatPrice(data.tax)} />
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-2xl font-medium">{formatPrice(data.total)}</dd>
              </div>
            </dl>
          </motion.section>

          <motion.section {...rise(0.55)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="order-address">
            <h2 id="order-address" className="font-display text-3xl font-medium">
              Delivery
            </h2>
            {data.isGift && (
              <p className="mt-3 inline-flex rounded-sm bg-[#f6a6cf] px-2 py-1 text-[11px] font-medium tracking-[0.14em] text-[#1d1418] uppercase">
                Gift
              </p>
            )}
            <address className="mt-4 text-sm leading-6 not-italic text-ink-soft">
              <span className="text-ink">{data.shippingAddress.fullName}</span>
              <br />
              {data.shippingAddress.line1}
              {data.shippingAddress.line2 ? `, ${data.shippingAddress.line2}` : ""}
              <br />
              {data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.postalCode}
              <br />
              {data.shippingAddress.phone}
            </address>
            {data.isGift && data.giftNote && (
              <p className="mt-4 border-t border-line pt-4 text-sm leading-6 text-ink">
                <span className="block text-[11px] tracking-[0.16em] text-ink-soft uppercase">Gift note</span>
                <span className="mt-1 block">{data.giftNote}</span>
              </p>
            )}
            {notes.length > 0 && (
              <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm text-ink-soft">
                {notes.map((note) => (
                  <li key={note}>
                    {note} was sent to {data.contactEmail}.
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link to="/shop" className={primaryButton}>
          Continue shopping
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link to="/account" className={secondaryButton}>
          Your orders
        </Link>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Progress({ current, trackingNumber, rise }) {
  const reached = Math.max(0, steps.indexOf(current));

  return (
    <motion.div {...rise} className={`${panelClass} mt-10 px-6 py-6 sm:px-8`}>
      <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
        {steps.map((step, index) => {
          const done = index <= reached;
          return (
            <li key={step} className="relative flex flex-col items-center text-center" aria-current={index === reached ? "step" : undefined}>
              {index > 0 && (
                <span aria-hidden="true" className={`absolute top-4 right-1/2 h-0.5 w-full ${done ? "bg-ink" : "bg-line"}`} />
              )}
              <span
                aria-hidden="true"
                className={`relative grid h-8 w-8 place-items-center rounded-full border-2 ${done ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink-soft"}`}
              >
                {done ? <Check size={15} strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              <span className={`mt-2 text-xs capitalize sm:text-sm ${done ? "text-ink" : "text-ink-soft"}`}>{step}</span>
            </li>
          );
        })}
      </ol>
      {trackingNumber && (
        <p className="mt-5 border-t border-line pt-4 text-center text-sm text-ink-soft">
          Tracking number: <span className="font-medium text-ink">{trackingNumber}</span>
        </p>
      )}
    </motion.div>
  );
}
