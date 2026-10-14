import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LockKeyhole, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { CartLines } from "../../components/cart/CartLines";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { PageHero } from "../../components/layout/PageHero";
import { StatePanel, panelClass, primaryButton, secondaryButton } from "../../components/layout/StatePanel";
import { useCart } from "../../context/CartContext";
import { api, formatPrice } from "../../services/api";

const ease = [0.22, 1, 0.36, 1];

export function CartPage() {
  const reduce = useReducedMotion();
  const cart = useCart();
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const quoteKey = cart.items.map((item) => `${item.id}:${item.quantity}`).join(",");
  const quote = useQuery({
    queryKey: ["quote", quoteKey],
    enabled: cart.items.length > 0,
    queryFn: async () =>
      (
        await api.post("/payments/quote", {
          items: cart.items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        })
      ).data.quote,
  });

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <PageHero eyebrow="Your bag" title="Cart" sticker={count > 0 ? `${count} ${count === 1 ? "pack" : "packs"}` : null} />
        {cart.note && <p className="mt-5 max-w-xl rounded-2xl bg-[#fbefd5] px-4 py-3 text-sm text-[#8a5a12]">{cart.note}</p>}

        {cart.items.length === 0 ? (
          <StatePanel icon={ShoppingBag} title="Your cart is empty." text="Packs you add will wait here until you are ready to check out.">
            <Link to="/shop" className={primaryButton}>
              Shop now
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/wishlist" className={secondaryButton}>
              Wishlist
            </Link>
          </StatePanel>
        ) : (
          <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            <motion.div {...rise(0.25)} className={`${panelClass} px-6 py-3 sm:px-8`}>
              <CartLines items={cart.items} setQuantity={cart.setQuantity} removeItem={cart.removeItem} />
            </motion.div>

            <motion.aside {...rise(0.35)} className={`${panelClass} p-6 sm:p-8 lg:sticky lg:top-28`} aria-labelledby="cart-summary">
              <h2 id="cart-summary" className="font-display text-3xl leading-none font-medium">
                Summary
              </h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd>{formatPrice(quote.data?.subtotal ?? cart.subtotal)}</dd>
                </div>
                {quote.isSuccess && (
                  <>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">{quote.data.shippingName ? `Shipping, ${quote.data.shippingName}` : "Shipping"}</dt>
                      <dd>{formatPrice(quote.data.shipping)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Tax</dt>
                      <dd>{formatPrice(quote.data.tax)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                      <dt className="font-medium">Total</dt>
                      <dd className="font-display text-3xl font-medium">{formatPrice(quote.data.total)}</dd>
                    </div>
                  </>
                )}
              </dl>
              {quote.isLoading && (
                <div aria-hidden="true" className="mt-4 space-y-3">
                  <div className="h-4 animate-pulse rounded-full bg-blush/70" />
                  <div className="h-8 animate-pulse rounded-full bg-blush/70" />
                </div>
              )}
              {quote.isLoading && <p className="sr-only">Checking shipping and tax…</p>}
              {quote.isError && (
                <p className="mt-4 text-sm text-plum">
                  Shipping and tax could not be confirmed.{" "}
                  <button type="button" className="underline" onClick={() => quote.refetch()}>
                    Try again
                  </button>
                </p>
              )}
              <Link to="/checkout" className={`${primaryButton} mt-6 w-full`}>
                Checkout
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-ink-soft">
                <LockKeyhole size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                {quote.isSuccess ? "Checkout uses these amounts. Payment is handled by Razorpay." : "Payment is handled by Razorpay."}
              </p>
              <Link to="/shop" className="mt-5 block text-center text-sm underline underline-offset-4">
                Keep shopping
              </Link>
            </motion.aside>
          </div>
        )}
      </section>
    </div>
  );
}
