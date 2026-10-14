import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../services/api";
import { CartLines } from "./CartLines";
import { Title } from "../motion/Title";

export function CartDrawer() {
  const cart = useCart();
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const panelRef = useRef(null);

  useEffect(() => {
    cart.closeDrawer();
  }, [pathname, cart.closeDrawer]);

  useEffect(() => {
    if (!cart.drawerOpen) return undefined;
    const panel = panelRef.current;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector("[data-cart-close]")?.focus();

    function onKey(event) {
      if (event.key === "Escape") {
        cart.closeDrawer();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll("a, button, input, select, textarea")].filter(
        (node) => !node.disabled && node.tabIndex !== -1,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [cart.drawerOpen, cart.closeDrawer]);

  return (
    <AnimatePresence>
      {cart.drawerOpen && (
        <div key="cart-drawer" className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 bg-ink/30"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            onClick={cart.closeDrawer}
          />
          <motion.aside
            id="cart-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-xl"
            initial={reduce ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Title as="h2" id="cart-drawer-title" className="font-display text-3xl text-ink">
                Cart
              </Title>
              <button
                type="button"
                data-cart-close
                onClick={cart.closeDrawer}
                aria-label="Close cart"
                className="rounded-full p-2 text-ink hover:bg-blush/60"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              {cart.note && <p className="pt-4 text-sm text-plum">{cart.note}</p>}
              {cart.items.length === 0 ? (
                <div className="py-16">
                  <p className="font-display text-3xl text-ink">Your cart is empty</p>
                  <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm text-paper">
                    Shop Now
                  </Link>
                </div>
              ) : (
                <CartLines items={cart.items} setQuantity={cart.setQuantity} removeItem={cart.removeItem} />
              )}
            </div>
            {cart.items.length > 0 && (
              <div className="border-t border-line px-5 py-5">
                <p className="text-lg text-ink">Subtotal {formatPrice(cart.subtotal)}</p>
                <p className="mt-1 text-sm text-ink-soft">Shipping and tax are on the cart page.</p>
                <Link to="/checkout" onClick={cart.closeDrawer} className="mt-4 block rounded-full bg-ink px-6 py-3 text-center text-sm text-paper">
                  Checkout
                </Link>
                <Link to="/cart" onClick={cart.closeDrawer} className="mt-3 block text-center text-sm underline">
                  View cart
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
