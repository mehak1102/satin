import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { StatePanel } from "../../components/layout/StatePanel";
import { Price } from "../../components/product/Price";
import { ProductCard } from "../../components/product/ProductCard";
import { SaveButton } from "../../components/product/SaveButton";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../hooks/useWishlist";
import { api, formatPrice } from "../../services/api";
import { DropText, dropLine, Title } from "../../components/motion/Title";

const ease = [0.22, 1, 0.36, 1];

function availability(product) {
  if (product.active === false) return { label: "Not listed", dot: "bg-ink-soft/50", canAdd: false };
  if (product.stock <= 0) return { label: "Out of stock", dot: "bg-ink-soft/50", canAdd: false };
  const low = product.stock <= Number(product.lowStockThreshold ?? 0);
  return { label: low ? "Low stock" : "In stock", dot: low ? "bg-[#e0a43a]" : "bg-[#5aa469]", canAdd: true };
}

export function WishlistPage() {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const reduce = useReducedMotion();
  const signedIn = Boolean(auth.user);
  const loading = auth.loading || (signedIn && wishlist.loading);

  const catalog = useQuery({
    queryKey: ["products", "others"],
    enabled: !loading,
    queryFn: async () => (await api.get("/products", { params: { limit: 8 } })).data,
  });

  const items = wishlist.items;
  const ready = items.filter((product) => availability(product).canAdd);
  const readyTotal = ready.reduce((sum, product) => sum + Number(product.price || 0), 0);
  const savedIds = new Set(items.map((product) => product._id));
  const more = (catalog.data?.items || []).filter((product) => !savedIds.has(product._id)).slice(0, 3);

  function addAll() {
    ready.forEach((product) => cart.addItem(product, 1));
  }

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Saved</p>
        <div className="relative mt-3 inline-block">
          <motion.h1
            className="font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] font-medium tracking-[-0.02em]"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={dropLine}
          >
            <DropText text="Wishlist" reduce={reduce} />
          </motion.h1>
          {signedIn && !loading && !wishlist.error && items.length > 0 && (
            <motion.span
              aria-hidden="true"
              className="absolute -top-3 -right-4 bg-[#fbe6a8] px-4 py-2 text-[clamp(0.7rem,1.1vw,0.95rem)] font-semibold tracking-[0.14em] uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.4)] sm:-right-16"
              initial={reduce ? false : { scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 8 }}
              transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.9 }}
            >
              {items.length} saved
            </motion.span>
          )}
        </div>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
          Packs you have saved on this account. Tap the heart to remove one.
        </p>

        {loading && (
          <div aria-busy="true" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <p className="sr-only">Loading wishlist…</p>
            {[0, 1, 2].map((key) => (
              <div key={key} aria-hidden="true" className="rounded-[28px] border border-line bg-white/60 p-3">
                <div className="aspect-[4/3] animate-pulse rounded-[22px] bg-blush" />
                <div className="mt-5 h-6 w-2/3 animate-pulse rounded-full bg-blush" />
                <div className="mt-3 mb-3 h-4 w-1/3 animate-pulse rounded-full bg-blush" />
              </div>
            ))}
          </div>
        )}

        {!loading && !signedIn && (
          <Panel
            title="Sign in to see saved packs."
            text="Saved packs are kept on your account, so they follow you to any device."
          >
            <Link to="/account?next=/wishlist" className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-ink/90">
              Sign in
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/shop" className="rounded-full border border-ink/20 bg-white/60 px-7 py-3.5 text-sm font-medium transition hover:border-ink">
              Browse packs
            </Link>
          </Panel>
        )}

        {!loading && signedIn && wishlist.error && (
          <Panel title="Saved packs could not be loaded." text="Check the connection and try again.">
            <button type="button" onClick={() => wishlist.refetch()} className="rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-ink/90">
              Try again
            </button>
          </Panel>
        )}

        {!loading && signedIn && !wishlist.error && items.length === 0 && (
          <Panel title="Nothing saved yet." text="Tap the heart on any pack to keep it here.">
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-ink/90">
              Shop packs
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Panel>
        )}

        {!loading && signedIn && !wishlist.error && items.length > 0 && (
          <>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[28px] border border-line bg-white/70 px-6 py-5 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur sm:px-8"
            >
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-blush text-plum">
                  <Heart size={18} className="fill-current" />
                </span>
                <p className="text-sm leading-6 text-ink-soft">
                  {ready.length ? (
                    <>
                      One of each available pack:{" "}
                      <span className="font-display text-xl font-medium text-ink">{formatPrice(readyTotal)}</span>
                    </>
                  ) : (
                    "None of your saved packs can be added right now."
                  )}
                </p>
              </div>
              <button
                type="button"
                disabled={!ready.length}
                onClick={addAll}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-40"
              >
                <ShoppingBag size={16} aria-hidden="true" />
                {ready.length > 1 ? `Add all ${ready.length} to cart` : "Add to cart"}
              </button>
            </motion.div>

            <motion.ul layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={!reduce} mode="popLayout">
                {items.map((product, index) => (
                  <SavedCard key={product._id} product={product} index={index} reduce={reduce} onAdd={() => cart.addItem(product, 1)} />
                ))}
              </AnimatePresence>
            </motion.ul>
          </>
        )}

        {!loading && more.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between gap-4">
              <Title as="h2" className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-medium">
                {items.length ? "More packs" : "Packs to start with"}
              </Title>
              <Link to="/shop" className="shrink-0 text-sm underline underline-offset-4">
                See all
              </Link>
            </div>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

function Panel(props) {
  return <StatePanel icon={Heart} {...props} />;
}

function SavedCard({ product, index, reduce, onAdd }) {
  const status = availability(product);
  const image = product.images?.[0]?.url;
  const href = `/product/${product.slug}`;
  const details = [product.size, product.packSize ? `${product.packSize} pads` : ""].filter(Boolean).join(" · ");

  return (
    <motion.li
      layout
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, ease, delay: reduce ? 0 : 0.35 + index * 0.06 }}
      className="group flex flex-col rounded-[28px] border border-line bg-white/70 p-3 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur"
    >
      <div className="relative">
        <Link
          to={href}
          className="relative block aspect-[4/3] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]"
        >
          <span aria-hidden="true" className="absolute bottom-[12%] left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] bg-black/15 blur-md" />
          {image ? (
            <img
              src={image}
              alt={product.images?.[0]?.alt || product.name}
              loading="lazy"
              decoding="async"
              className={`relative h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.04] ${status.canAdd ? "" : "opacity-60 grayscale-[40%]"}`}
            />
          ) : (
            <span className="relative grid h-full place-items-center font-display text-2xl text-ink-soft italic">{product.category}</span>
          )}
        </Link>
        <p className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs text-ink-soft backdrop-blur">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </p>
        <SaveButton productId={product._id} className="absolute top-3 right-3 shadow-sm transition hover:scale-110" />
      </div>

      <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          <Link to={href} className="font-display text-2xl leading-tight font-medium hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} className="shrink-0 font-display text-xl font-medium" />
        </div>
        {details && <p className="mt-1.5 text-sm text-ink-soft">{details}</p>}
        <div className="mt-auto flex gap-2 pt-6">
          <button
            type="button"
            disabled={!status.canAdd}
            onClick={onAdd}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={16} aria-hidden="true" />
            {status.canAdd ? "Add to cart" : status.label}
          </button>
          <Link to={href} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium transition hover:border-ink">
            View
          </Link>
        </div>
      </div>
    </motion.li>
  );
}
