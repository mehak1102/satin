import { Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { FlowerRain } from "../decor/FlowerRain";
import { RouteMeta } from "../seo/PageMeta";
import { CartDrawer } from "../cart/CartDrawer";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteLayout() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col">
      <RouteMeta />
      <FlowerRain />
      <a
        href="#content"
        className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-full bg-ink px-4 py-2 text-sm text-paper focus:translate-y-0"
      >
        Skip to content
      </a>
      <Navbar />
      <CartDrawer />
      <main id="content" tabIndex={-1} className="flex-1">
        <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16 text-ink-soft">Loading…</p>}>
          <motion.div
            key={pathname}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
