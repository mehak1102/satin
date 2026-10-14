import { motion, useReducedMotion } from "framer-motion";
import { DropText, dropLine } from "../motion/Title";

const sizes = {
  lg: "text-[clamp(3.5rem,11vw,9rem)]",
  md: "text-[clamp(3rem,8vw,6.5rem)]",
};

export function PageHero({ eyebrow, title, sticker, size = "lg", children }) {
  const reduce = useReducedMotion();

  return (
    <header>
      {eyebrow && <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">{eyebrow}</p>}
      <div className="relative mt-3 inline-block max-w-full">
        <motion.h1
          className={`font-display ${sizes[size]} leading-[0.9] font-medium tracking-[-0.02em] break-words`}
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={dropLine}
        >
          <DropText text={title} reduce={reduce} />
        </motion.h1>
        {sticker && (
          <motion.span
            aria-hidden="true"
            className="absolute -top-3 -right-2 bg-[#fbe6a8] px-4 py-2 text-[clamp(0.7rem,1.1vw,0.95rem)] font-semibold tracking-[0.14em] whitespace-nowrap uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.4)] sm:-right-16"
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.9 }}
          >
            {sticker}
          </motion.span>
        )}
      </div>
      {children && <div className="mt-5 max-w-xl text-base leading-7 text-ink-soft">{children}</div>}
    </header>
  );
}
