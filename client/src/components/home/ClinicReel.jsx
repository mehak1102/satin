import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { useWideScreen } from "../../hooks/useWideScreen";

// Sticks below the 64px header and the 64px pack nav, like the pinned pack bands.
const pinTop = 128;

const guide = {
  src: "/clinic/pad-guide-illustrated.jpg",
  alt: "How to use a sanitary pad: 1. Take the pad out of the wrapper. 2. Remove the release sheet. 3. Stick the pad onto your underwear. How to dispose: 1. Roll the used pad and wrap it securely. 2. Place it in a disposal bag. 3. Safely dispose in a dustbin.",
};

// The card keeps the guide's 16:9 shape, so the image fills it without cropping any step.
const guideImage = <img src={guide.src} alt={guide.alt} width="1024" height="576" loading="lazy" className="h-full w-full object-cover" />;
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
      <section ref={sectionRef} id="clinic-reel" aria-label="Stree Clinic" className="bg-paper px-5 py-16 text-ink">
        <h2 className="mx-auto flex max-w-6xl justify-between font-poster text-[clamp(3rem,14vw,6rem)] leading-none uppercase">
          <span>Stree</span>
          <span>Clinic</span>
        </h2>
        <div className="mx-auto mt-6 aspect-video max-w-6xl overflow-hidden rounded-3xl bg-[#fbf6f2]">{guideImage}</div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="clinic-reel"
      aria-label="Stree Clinic"
      className="bg-paper text-ink"
      style={{ height: `calc(100svh - ${pinTop}px + 160svh)` }}
    >
      <div className="sticky top-32 flex h-[calc(100svh-8rem)] items-center justify-center overflow-hidden">
        <h2 className="font-poster text-[clamp(4rem,9vw,9.5rem)] leading-none uppercase">
          <motion.span style={{ x: leftX, color: wordColor, opacity: wordFade }} className="absolute top-1/2 right-[calc(50%+19.5vw)] -translate-y-1/2">
            Stree
          </motion.span>
          <motion.span style={{ x: rightX, color: wordColor, opacity: wordFade }} className="absolute top-1/2 left-[calc(50%+19.5vw)] -translate-y-1/2">
            Clinic
          </motion.span>
        </h2>
        <motion.div style={{ "--grow": grow, width: cardWidth, borderRadius: radius }} className="relative z-10 aspect-video overflow-hidden bg-[#fbf6f2]">
          {guideImage}
        </motion.div>
      </div>
    </section>
  );
}
