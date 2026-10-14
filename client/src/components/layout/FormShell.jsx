import { motion, useReducedMotion } from "framer-motion";
import { LeafShadows } from "../decor/LeafShadows";
import { PageHero } from "./PageHero";
import { panelClass } from "./StatePanel";

export function FormShell({ eyebrow, title, intro, footer, children }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto grid max-w-7xl items-start gap-12 px-5 pt-12 pb-24 text-ink sm:px-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
        <PageHero eyebrow={eyebrow} title={title} size="md">
          {intro}
        </PageHero>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className={`${panelClass} p-6 sm:p-9`}>{children}</div>
          {footer && <div className="mt-5 px-2 text-sm">{footer}</div>}
        </motion.div>
      </section>
    </div>
  );
}

export function Notice({ tone = "ok", children }) {
  const tones = {
    ok: "bg-[#e3f1e5] text-[#2f6b3b]",
    error: "bg-[#f8dede] text-[#8f2f2f]",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm leading-6 ${tones[tone]}`}>
      {children}
    </p>
  );
}
