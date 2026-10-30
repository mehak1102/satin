import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Price } from "./Price";
import { Title } from "../motion/Title";

export function QuickView({ product, onClose }) {
  const cart = useCart();
  const closeRef = useRef(null);
  const [notice, setNotice] = useState("");
  const image = product.images?.[0]?.url;
  const inStock = product.stock > 0;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function addToCart() {
    if (!inStock) return;
    const result = cart.addItem(product, 1);
    if (result?.added) onClose();
    else setNotice("That's the most this order can take.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button type="button" aria-label="Close quick view" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="relative grid w-full max-w-3xl gap-6 rounded-[1.5rem] bg-paper p-5 sm:grid-cols-2"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full border border-line px-3 py-1 text-sm"
        >
          Close
        </button>
        {image ? (
          <img src={image} alt={product.images[0].alt || product.name} className="aspect-[4/5] w-full rounded-[1.25rem] bg-blush object-contain p-4" />
        ) : (
          <div className="flex aspect-[4/5] items-end rounded-[1.25rem] bg-blush p-5">
            <p className="font-display text-4xl italic text-ink">{product.category}</p>
          </div>
        )}
        <div className="sm:py-6">
          <p className="text-xs tracking-[0.2em] uppercase text-rose">{product.category}</p>
          <Title as="h2" id="quick-view-title" className="mt-2 pr-16 font-display text-4xl text-ink">
            {product.name}
          </Title>
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            product={product}
            className="mt-3 text-sm text-ink"
          />
          {product.shortDescription && <p className="mt-4 text-sm leading-6 text-ink-soft">{product.shortDescription}</p>}
          <p className="mt-4 text-sm">{inStock ? "In stock" : "Out of stock"}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={!inStock} onClick={addToCart} className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-40">
              Add to cart
            </button>
            <Link to={`/product/${product.slug}`} onClick={onClose} className="rounded-full border border-ink/20 px-5 py-2.5 text-sm">
              View pack
            </Link>
          </div>
          {notice && <p className="mt-3 text-sm text-teal">{notice}</p>}
        </div>
      </div>
    </div>
  );
}
