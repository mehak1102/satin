import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const lines = [
  { word: "Soft", tip: "Ultra soft — printed on Ultra packs." },
  { word: "No irritation", tip: "Anti-rash layer on the Ultra box." },
  { word: "No itching", tip: "A calm, soft touch for the day you’re having." },
  { word: "Absorbent", tip: "Soft absorbent for bold moves — on Regular & XL." },
];

const ease = [0.33, 1, 0.68, 1];

export function ComfortAd({ reduce }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : ["-6%", "8%"]);
  const fade = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.25, 0.55, 0.55, 0.3]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="comfort-ad-title"
      className="relative overflow-hidden bg-[#e7f0e4] text-ink"
    >
      <motion.p
        aria-hidden="true"
        style={{ y: drift, opacity: fade }}
        className="pointer-events-none absolute top-[8%] left-[-4%] font-poster text-[clamp(8rem,28vw,22rem)] leading-none tracking-tight text-[#c5d8c0] uppercase select-none"
      >
        Feel
      </motion.p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-18deg, transparent, transparent 22px, rgba(20,56,76,0.18) 22px, rgba(20,56,76,0.18) 23px)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16 lg:py-32">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-ink-soft uppercase">On the pack · how it feels</p>
          <h2 id="comfort-ad-title" className="sr-only">
            Soft, no irritation, no itching, absorbent
          </h2>
          <p className="mt-5 max-w-xs font-display text-2xl leading-snug text-ink sm:text-3xl">
            Quiet comfort, loud absorbency — the feel Satin prints for.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">
            Soft cues from the pack — not a medical promise. Choose by what’s printed.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-[#5a8f4a] px-5 py-3 text-sm font-medium tracking-wide text-paper transition hover:bg-[#4a7a3c]"
          >
            Feel the packs
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <ul className="space-y-1">
          {lines.map((line, index) => (
            <motion.li
              key={line.word}
              initial={reduce ? false : { opacity: 0, x: index % 2 === 0 ? -36 : 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.7, ease, delay: index * 0.08 }}
              className="group border-b border-ink/12 py-5 last:border-b-0"
            >
              <p className="font-poster text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.9] tracking-wide text-ink uppercase">
                <span className="relative inline-block">
                  {line.word}
                  <motion.span
                    aria-hidden="true"
                    className="absolute right-0 -bottom-1 left-0 h-[0.12em] origin-left bg-[#8fbf6e]"
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease, delay: 0.2 + index * 0.08 }}
                  />
                </span>
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft transition group-hover:text-ink">
                {line.tip}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
