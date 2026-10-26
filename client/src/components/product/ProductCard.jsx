import { motion, useReducedMotion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Price, UnitCost } from "./Price";
import { QuickView } from "./QuickView";
import { SaveButton } from "./SaveButton";
import { Title } from "../motion/Title";

export function ProductCard({ product, index = 0 }) {
  const cart = useCart();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const image = product.images?.[0]?.url;
  const back = product.images?.[1]?.url;
  const inStock = product.stock > 0;

  function addToCart() {
    if (!inStock) return;
    const result = cart.addItem(product, 1);
    setNotice(result?.added ? "Added to cart" : "That's the most this order can take.");
  }

  return (
    <motion.article
      className="group flex flex-col"
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
    >
      <div
        className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)] transition-shadow duration-500 group-hover:shadow-[0_32px_50px_-32px_rgba(40,20,30,0.5)]"
      >
        <Link to={`/product/${product.slug}`} className="relative block aspect-[5/4]">
          <span
            aria-hidden="true"
            className="absolute bottom-[11%] left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] bg-[#3a2a2a]/20 blur-md transition-all duration-700 group-hover:w-[42%] group-hover:bg-[#3a2a2a]/15"
          />
          {image ? (
            <>
              <img
                src={image}
                alt={product.images[0].alt || product.name}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-contain px-10 pt-8 pb-12 transition duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04] ${
                  back ? "group-hover:opacity-0" : ""
                }`}
              />
              {back && (
                <img
                  src={back}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full -translate-y-2 scale-[1.04] object-contain px-10 pt-8 pb-12 opacity-0 transition duration-700 ease-out group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <span className="absolute inset-0 flex items-end p-6 font-display text-4xl text-ink">{product.category}</span>
          )}
        </Link>
        <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase backdrop-blur">
          {product.category}
        </span>
        <SaveButton productId={product._id} className="absolute top-3 right-3 shadow-sm" />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Title as="h2" className="font-display text-[1.65rem] leading-tight font-medium text-ink">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </Title>
          <p className="mt-1 text-sm text-ink-soft">
            {product.size}
            {["Regular", "XL", "Ultra"].includes(product.category) && product.packSize ? ` · ${product.packSize} pads` : ""}
          </p>
        </div>
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-[0_6px_14px_-10px_rgba(20,56,76,0.6)]"
        />
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs tracking-wide text-ink-soft">
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${inStock ? "bg-[#5aa469]" : "bg-ink-soft/50"}`} />
        {inStock ? "In stock" : "Out of stock"}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={!inStock}
          onClick={addToCart}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-[0.98] disabled:opacity-40"
        >
          <ShoppingBag size={16} />
          Add to cart
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-3 text-sm text-ink transition hover:border-ink"
        >
          <Eye size={16} />
          Quick view
        </button>
      </div>
      {notice && <p className="mt-2 text-sm text-teal">{notice}</p>}
      {open && <QuickView product={product} onClose={() => setOpen(false)} />}
    </motion.article>
  );
}
