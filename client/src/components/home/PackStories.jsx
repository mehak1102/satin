import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { DropText, Title, dropLine } from "../motion/Title";

const stories = [
  {
    key: "xl",
    label: "Satin XL",
    line: "Jee Bhar Kar Jee Lo.",
    note: "Printed on the Satin XL pack, along with “Soft absorbent for bold moves.”",
    image: "/stories/xl-photo.jpg",
    alt: "A woman winking and holding up a Satin XL pack",
    focus: "42% center",
    href: "#pack-satin-xl",
    cta: "See the XL pack",
    light: "#f6d3cd",
    dark: "#d98c86",
    tone: "text-ink",
    pill: "border-ink/70 text-ink hover:bg-ink hover:text-ivory",
  },
  {
    key: "pack-of-2",
    label: "Satin Ultra · Pack of 2",
    line: "For you and a friend in need.",
    note: "Printed on the Ultra pack of 2, right above “Carry it with you.”",
    image: "/stories/pack-of-2-photo.jpg",
    focus: "center",
    alt: "A woman winking and pointing at a Satin Ultra pack of 2",
    href: "#pack-satin-ultra-pack-of-2",
    cta: "See the pack of 2",
    light: "#cfe5f3",
    dark: "#6aa6cf",
    tone: "text-ink",
    pill: "border-ink/70 text-ink hover:bg-ink hover:text-ivory",
  },
  {
    key: "regular",
    label: "Satin Regular",
    line: "Soft absorbent for bold moves.",
    note: "Printed on Satin Regular, with wings and SAP granules.",
    image: "/stories/regular-photo.jpg",
    focus: "center",
    alt: "A woman winking and holding a Satin Regular pack",
    href: "#pack-satin-regular",
    cta: "See the Regular pack",
    light: "#ebdcf4",
    dark: "#b48ccc",
    tone: "text-ink",
    pill: "border-ink/70 text-ink hover:bg-ink hover:text-ivory",
  },
  {
    key: "ultra-8",
    label: "Satin Ultra XL 8",
    line: "Ruko mat.",
    note: "The Ultra XL 8 box carries the full line: “Ruko mat, Jee Bhar Ke Jee Lo.”",
    image: "/stories/ultra-8-photo.jpg",
    focus: "center",
    alt: "A woman winking and pointing at a Satin Ultra XL 8 box",
    href: "#pack-satin-ultra-xl-8",
    cta: "See the Ultra XL 8",
    light: "#2b6a85",
    dark: "#1d4e63",
    tone: "text-ivory",
    pill: "border-ivory/70 text-ivory hover:bg-ivory hover:text-teal",
  },
];

// Scroll distance, in svh, that moves one card off the deck.
const step = 70;

export function PackStories({ reduce }) {
  const deckRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: deckRef, offset: ["start 64px", "end end"] });

  return (
    <section aria-labelledby="pack-stories-title" className="bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-12 text-center sm:pt-24">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">On the packaging</p>
        <motion.h2
          id="pack-stories-title"
          className="relative mx-auto mt-4 inline-block font-display text-5xl leading-[0.95] font-medium sm:text-7xl lg:text-8xl"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={dropLine}
        >
          <DropText text="Straight off the pack" reduce={reduce} />
          <span className="absolute -right-2 -bottom-6 rotate-[-6deg] rounded-md bg-blush px-3 py-1.5 font-sans text-[11px] font-semibold tracking-[0.18em] text-plum uppercase shadow-sm sm:-right-6 sm:text-sm">
            Real art, real lines
          </span>
        </motion.h2>
      </div>

      {reduce ? (
        <div className="mx-auto grid max-w-7xl gap-6 px-5 pb-20">
          {stories.map((story) => (
            <article key={story.key} className="grid h-[min(78svh,560px)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[28px] lg:aspect-[7/3] lg:h-auto lg:grid-cols-[1fr_1.8fr] lg:grid-rows-1">
              <StoryFace story={story} />
            </article>
          ))}
        </div>
      ) : (
        <div ref={deckRef} className="relative" style={{ height: `calc(100svh + ${(stories.length - 1) * step}svh)` }}>
          <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center overflow-hidden px-5 pb-12">
            <div className="relative mx-auto h-[min(70svh,500px)] w-full max-w-7xl lg:h-auto lg:aspect-[7/3]">
              {stories.map((story, index) => (
                <DeckCard key={story.key} story={story} index={index} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// `local` runs from negative (still waiting in the deck) through 0 (front) to 1 (slid off the top).
function DeckCard({ story, index, progress }) {
  const local = useTransform(progress, (value) => value * (stories.length - 1) - index);
  const y = useTransform(local, (l) =>
    l <= 0 ? Math.min(-l, 2.6) * 22 : -Math.min(l, 1.15) * (typeof window === "undefined" ? 900 : window.innerHeight),
  );
  const scale = useTransform(local, (l) => (l <= 0 ? 1 - Math.min(-l, 2.6) * 0.05 : 1 + Math.min(l, 1) * 0.04));
  const opacity = useTransform(local, (l) => (l <= -2 ? Math.max(0, 1 - (-l - 2) / 0.6) : 1));

  return (
    <motion.article
      style={{ y, scale, opacity, zIndex: stories.length - index, transformOrigin: "50% 100%" }}
      className="absolute inset-0 grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[28px] shadow-[0_28px_60px_-32px_rgba(20,56,76,0.55)] lg:grid-cols-[1fr_1.8fr] lg:grid-rows-1"
    >
      <StoryFace story={story} />
    </motion.article>
  );
}

function StoryFace({ story }) {
  const pillClass = `mt-7 inline-flex w-fit items-center gap-3 rounded-full border px-5 py-2.5 text-sm transition-colors ${story.pill}`;
  const pillBody = (
    <>
      <span aria-hidden="true" className="h-px w-4 bg-current" />
      {story.cta}
      <ArrowRight size={15} />
    </>
  );

  return (
    <>
      <div className={`flex flex-col justify-center px-7 py-6 sm:px-10 sm:py-10 lg:px-8 lg:py-6 xl:px-10 xl:py-10 ${story.tone}`} style={{ backgroundColor: story.light }}>
        <p className="text-[11px] tracking-[0.28em] uppercase opacity-70">{story.label}</p>
        <Title as="h3" className="mt-3 font-display text-3xl leading-[1.02] font-medium text-balance sm:mt-4 sm:text-5xl lg:text-4xl xl:text-5xl">{story.line}</Title>
        <p className="mt-3 max-w-sm text-sm leading-6 opacity-80 sm:mt-4">{story.note}</p>
        {story.href.startsWith("#") ? (
          <a href={story.href} className={pillClass}>
            {pillBody}
          </a>
        ) : (
          <Link to={story.href} className={pillClass}>
            {pillBody}
          </Link>
        )}
      </div>
      <div className="order-first p-5 pb-0 sm:p-6 sm:pb-0 lg:order-none lg:flex lg:items-center lg:justify-center lg:p-5 lg:pl-0" style={{ backgroundColor: story.light }}>
        <div className="relative aspect-video w-full overflow-hidden rounded-[20px] lg:aspect-[16/10] lg:max-w-[760px]" style={{ backgroundColor: story.dark }}>
          <img
            src={story.image}
            alt={story.alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={story.focus ? { objectPosition: story.focus } : undefined}
          />
        </div>
      </div>
    </>
  );
}
