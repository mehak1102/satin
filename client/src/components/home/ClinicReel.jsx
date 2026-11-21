import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useWideScreen } from "../../hooks/useWideScreen";

// Sticks below the 64px header and the 64px pack nav, like the pinned pack bands.
const pinTop = 128;

const guide = {
  src: "/clinic/pad-guide-illustrated.jpg",
  alt: "How to use a sanitary pad: 1. Take the pad out of the wrapper. 2. Remove the release sheet. 3. Stick the pad onto your underwear. How to dispose: 1. Roll the used pad and wrap it securely. 2. Place it in a disposal bag. 3. Safely dispose in a dustbin.",
};

const guideImage = (
  <img
    src={guide.src}
    alt={guide.alt}
    width={1600}
    height={900}
    loading="lazy"
    decoding="async"
    className="h-full w-full object-contain"
  />
);

// Grows from 28vw to 88vw, capped so the card stays within 90% of the pinned stage height.
const cardWidth = "calc(28vw + (min(88vw, (100svh - 8rem) * 1.6) - 28vw) * var(--grow))";

export function ClinicReel({ reduce }) {
  const sectionRef = useRef(null);
  const wide = useWideScreen();
  const pin = wide && !reduce;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: [`start ${pinTop}px`, "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const leftX = useTransform(progress, [0, 0.32], ["-24vw", "0vw"]);
  const rightX = useTransform(progress, [0, 0.32], ["24vw", "0vw"]);
  const wordColor = useTransform(progress, [0, 0.32], ["rgba(20,56,76,0.1)", "rgba(20,56,76,1)"]);
  const wordFade = useTransform(progress, [0.5, 0.7], [1, 0]);
  const grow = useTransform(progress, [0, 0.3, 0.72], [0, 0.14, 1]);
  const radius = useTransform(progress, [0.3, 0.72], [28, 18]);

  if (!pin) {
    return (
      <section ref={sectionRef} id="pad-guide" aria-labelledby="pad-guide-title" className="bg-[#f3eef8] px-5 py-16 text-ink">
        <p className="mx-auto max-w-6xl text-[11px] tracking-[0.28em] uppercase text-ink-soft">Printed on the packs</p>
        <h2 id="pad-guide-title" className="mx-auto mt-3 max-w-6xl font-display text-4xl leading-tight font-medium">
          How to use a pad — and how to dispose
        </h2>
        <p className="mx-auto mt-4 max-w-6xl text-sm leading-7 text-ink-soft">
          Step-by-step art as printed for Satin packs. For health questions,{" "}
          <Link to="/stree-clinic" className="underline underline-offset-4">
            visit Stree Clinic
          </Link>
          .
        </p>
        <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-[24px] border border-ink/10 bg-white shadow-sm">
          {guideImage}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="pad-guide"
      aria-labelledby="pad-guide-title-pinned"
      className="bg-[#f3eef8] text-ink"
      style={{ height: `calc(100svh - ${pinTop}px + 160svh)` }}
    >
      <div className="sticky top-32 flex h-[calc(100svh-8rem)] items-center justify-center overflow-hidden px-5">
        <h2
          id="pad-guide-title-pinned"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 font-poster text-[clamp(4rem,9vw,9.5rem)] leading-none uppercase"
        >
          <motion.span
            style={{ x: leftX, color: wordColor, opacity: wordFade }}
            className="absolute top-1/2 right-[calc(50%+19.5vw)] -translate-y-1/2"
          >
            Stree
          </motion.span>
          <motion.span
            style={{ x: rightX, color: wordColor, opacity: wordFade }}
            className="absolute top-1/2 left-[calc(50%+19.5vw)] -translate-y-1/2"
          >
            Clinic
          </motion.span>
        </h2>
        <motion.div
          style={{ "--grow": grow, width: cardWidth, borderRadius: radius }}
          className="relative z-10 aspect-video max-h-[min(82svh,720px)] overflow-hidden bg-white shadow-[0_32px_60px_-40px_rgba(40,20,40,0.35)]"
        >
          {guideImage}
        </motion.div>
      </div>
    </section>
  );
}