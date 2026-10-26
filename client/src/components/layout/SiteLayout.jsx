import { Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Logo } from "../common/Logo";
import { SiteLoader } from "../common/SiteLoader";
import { FlowerRain } from "../decor/FlowerRain";
import { RouteMeta } from "../seo/PageMeta";
import { CartDrawer } from "../cart/CartDrawer";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { WhatsAppHelp } from "./WhatsAppHelp";

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
        <Suspense fallback={<SiteLoader compact />}>
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
      <WhatsAppHelp />
      <div aria-hidden="true" className="pointer-events-none fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
        <Logo className="h-8 opacity-70 drop-shadow-[0_0_10px_rgba(255,253,251,0.9)] sm:h-9" />
      </div>
    </div>
  );
}
