import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DropText, Title, dropLine } from "../motion/Title";

const reasons = [
  {
    n: "01",
    title: "What’s on the pack is what you get",
    body: "Size, pad count, and the lines that matter are printed on the pack — so you choose by what you can read, not by guesswork.",
  },
  {
    n: "02",
    title: "Soft days, bold moves",
    body: "Regular and XL print “Soft absorbent for bold moves,” with wings and SAP granules. Ultra prints soft, thin comfort for the day you’re having.",
  },
  {
    n: "03",
    title: "A carry pack when you need it",
    body: "The Ultra pack of 2 is printed “Carry it with you” — a small box for bags, lockers, and the days that don’t wait.",
  },
  {
    n: "04",
    title: "Standards where they’re printed",
    body: "IS 5405 and BIS licence details are printed on Regular, XL, and the Ultra pack of 2. We don’t invent claims that aren’t on the pack.",
  },
  {
    n: "05",
    title: "Honest shop, soft care",
    body: "Satin is pads and clear pack info. We won’t diagnose online — and we won’t dress up marketing as medical advice.",
  },
];

export function WhyChooseSatin({ reduce }) {
  return (
    <section
      aria-labelledby="why-choose-satin-title"
      className="relative overflow-hidden bg-[linear-gradient(165deg,#f7ebe6_0%,#f3eee8_42%,#e8f0f4_100%)] text-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[#f4c9c4]/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-80 w-80 rounded-full bg-[#c9dce8]/50 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16 lg:py-24">
        <div className="lg:sticky lg:top-28">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">The satin way</p>
          <motion.h2
            id="why-choose-satin-title"
            className="mt-4 max-w-md font-display text-4xl leading-[0.98] font-medium sm:text-6xl"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={dropLine}
          >
            <DropText text="Why choose Satin" reduce={reduce} />
          </motion.h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">
            Five quiet reasons — pulled from what’s printed, not from a pitch deck.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-ivory"
          >
            Shop the packs
            <ArrowRight size={16} />
          </Link>
        </div>

        <ol className="border-t border-ink/15">
          {reasons.map((reason, index) => (
            <motion.li
              key={reason.n}
              className="grid gap-3 border-b border-ink/15 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: reduce ? 0 : Math.min(index * 0.05, 0.2) }}
            >
              <span className="font-display text-sm tracking-[0.12em] text-ink-soft">{reason.n}</span>
              <div>
                <Title as="h3" className="font-display text-2xl leading-tight sm:text-[1.65rem]">
                  {reason.title}
                </Title>
                <p className="mt-2 max-w-lg text-sm leading-7 text-ink-soft">{reason.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
