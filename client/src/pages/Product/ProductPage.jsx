import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { LoadError, PackDetailSkeleton } from "../../components/product/CatalogStatus";
import { Price } from "../../components/product/Price";
import { ProductCard } from "../../components/product/ProductCard";
import { ProductFaq } from "../../components/product/ProductFaq";
import { ProductGallery } from "../../components/product/ProductGallery";
import { QuantitySelector } from "../../components/product/QuantitySelector";
import { ProductReviews } from "../../components/product/ProductReviews";
import { clip, PageMeta } from "../../components/seo/PageMeta";
import { SaveButton } from "../../components/product/SaveButton";
import { useCart } from "../../context/CartContext";
import { api } from "../../services/api";
import { DropText, dropLine, Title } from "../../components/motion/Title";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const reduce = useReducedMotion();
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setQuantity(1);
    setNotice("");
  }, [slug]);

  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await api.get(`/products/${slug}`)).data.product,
  });

  const others = useQuery({
    queryKey: ["products", "others"],
    enabled: query.isSuccess,
    queryFn: async () => (await api.get("/products", { params: { limit: 8 } })).data,
  });

  if (query.isLoading) return <PackDetailSkeleton />;
  if (query.isError) {
    const missing = query.error?.response?.status === 404;
    return (
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Title as="h1" className="font-display text-4xl text-ink">{missing ? "Product not found" : "This pack could not be loaded"}</Title>
        {missing ? (
          <Link to="/shop" className="mt-4 inline-block text-sm underline">
            Back to shop
          </Link>
        ) : (
          <LoadError className="mt-4" onRetry={() => query.refetch()}>
            Check the connection and try again.
          </LoadError>
        )}
      </section>
    );
  }

  const product = query.data;
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= Number(product.lowStockThreshold ?? 0);
  const more = (others.data?.items || []).filter((item) => item.slug !== product.slug).slice(0, 3);
  const summary = clip(product.shortDescription || product.description || product.name);
  const length = (product.specifications || []).find((spec) => spec.label === "Size")?.value;
  const facts = [
    ["Fit", product.size],
    ["Pads", product.packSize],
    ["Length", length],
  ].filter(([, value]) => value);

  function addToCart() {
    if (!inStock) return;
    const result = cart.addItem(product, quantity);
    setNotice(result?.added ? "Added to cart" : "That's the most this order can take.");
  }

  function buyNow() {
    if (!inStock) return;
    cart.addItem(product, quantity);
    navigate("/checkout");
  }

  return (
    <>
      <PageMeta
        title={`${product.name} — Satin`}
        description={summary}
        path={`/product/${product.slug}`}
        image={product.images?.[0]?.url || ""}
      />
      <div className="relative isolate overflow-hidden">
        <LeafShadows />
        <article className="mx-auto max-w-7xl px-5 pt-8 pb-20 text-ink sm:px-8 lg:pt-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-soft">
            <Link to="/shop" className="inline-flex items-center gap-1 rounded-full border border-line bg-white/60 py-1.5 pr-3.5 pl-2 transition hover:border-ink hover:text-ink">
              <ChevronLeft size={15} aria-hidden="true" />
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-ink">{product.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                key={product.slug}
                images={product.images}
                name={product.name}
                fallback={product.category}
                badge={product.category}
                action={<SaveButton productId={product._id} className="shadow-sm" />}
              />
            </div>

            <motion.div
              className="lg:pt-4"
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}
            >
              <motion.h1
                className="font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.95] font-medium tracking-[-0.02em] text-balance"
                initial={reduce ? false : "hidden"}
                animate="show"
                variants={dropLine}
              >
                <DropText text={product.name} reduce={reduce} />
              </motion.h1>

              <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Price price={product.price} compareAtPrice={product.compareAtPrice} className="font-display text-4xl font-medium" />
                <p className="flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-sm text-ink-soft">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${inStock ? (lowStock ? "bg-[#e0a43a]" : "bg-[#5aa469]") : "bg-ink-soft/50"}`} />
                  {inStock ? `${product.stock} in stock` : "Out of stock"}
                  {lowStock ? " · Low stock" : ""}
                </p>
              </motion.div>

              {facts.length > 0 && (
                <motion.dl variants={rise} className="mt-7 grid grid-cols-3 overflow-hidden rounded-[24px] border border-line bg-white/60 backdrop-blur">
                  {facts.map(([label, value], index) => (
                    <div key={label} className={`px-3.5 py-4 sm:px-5 ${index ? "border-l border-line" : ""}`}>
                      <dt className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">{label}</dt>
                      <dd className="mt-1 font-display text-xl font-medium whitespace-nowrap sm:text-2xl">{value}</dd>
                    </div>
                  ))}
                </motion.dl>
              )}

              <motion.div
                variants={rise}
                className="mt-6 rounded-[28px] border border-line bg-white/70 p-4 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur sm:p-5"
              >
                <div className="flex gap-3">
                  <QuantitySelector label={product.name} value={quantity} max={product.stock} disabled={!inStock} onChange={setQuantity} />
                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={addToCart}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-[0.98] disabled:opacity-40"
                  >
                    <ShoppingBag size={16} aria-hidden="true" />
                    Add to cart
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={buyNow}
                  className="mt-3 w-full rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper disabled:opacity-40"
                >
                  Buy now
                </button>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                  <p className="text-ink-soft">
                    {notice ? <span className="text-teal">{notice}</span> : inStock && product.stock > 20 ? "One order can include up to 20 of this pack." : ""}
                  </p>
                  <Link to="/cart" className="underline underline-offset-4">
                    View cart
                  </Link>
                </div>
              </motion.div>

              <motion.p variants={rise} className="mt-9 leading-7 text-ink-soft">
                {product.description}
              </motion.p>

              {product.features?.length > 0 && (
                <motion.div variants={rise} className="mt-8">
                  <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Printed on the pack</p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6">
                        <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blush text-plum">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          </div>
        </article>

        <ProductFaq specifications={product.specifications} />

        {more.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <Title as="h2" className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-medium text-ink">
                Other packs
              </Title>
              <Link to="/shop" className="shrink-0 text-sm underline underline-offset-4">
                See all
              </Link>
            </div>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((item, index) => (
                <ProductCard key={item._id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}
        {others.isError && (
          <LoadError className="mx-auto max-w-7xl px-5 sm:px-8" onRetry={() => others.refetch()}>
            Other packs could not be loaded.
          </LoadError>
        )}
        <ProductReviews productId={product._id} slug={product.slug} />
      </div>
    </>
  );
}
