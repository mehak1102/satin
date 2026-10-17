import { motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useWideScreen } from "../../hooks/useWideScreen";

// Sticks below the 64px header and the 64px pack nav, like the pinned pack bands.
const pinTop = 128;
// While pinned, a word shows once its left edge slides past this share of the stage width.
const revealLine = 0.8;
const ease = [0.33, 1, 0.68, 1];

const flowers = {
  bloom: "/flowers/bloom-1.png",
  purple: "/flowers/bloom-2.png",
  rose: "/flowers/rose-1.png",
  topaz: "/flowers/topaz-2.png",
  trio: "/flowers/topaz-trio.png",
};

const line = [
  { word: "Ruko" },
  { word: "mat,", tone: "bg-[#f6a6cf] text-[#1d1418]", tag: { label: "Satin Regular", to: "/product/satin-regular", tone: "bg-[#f6a6cf] text-[#1d1418]", side: "top" } },
  { flower: "rose", size: "h-[1.1em] w-[1.1em]", tip: -8 },
  { doodle: "pen" },
  { word: "Jee" },
  { word: "Bhar" },
  { word: "Ke" },
  { word: "Jee lo.", tone: "bg-[#d9aef3] text-[#1d1418]", tag: { label: "Ultra Box", to: "/product/satin-ultra-box", tone: "bg-[#d9aef3] text-[#1d1418]", side: "bottom" } },
  { flower: "bloom", size: "h-[1.05em] w-[1.05em]", tip: 6 },
  { word: "Stree Clinic", tone: "bg-plum text-ivory", tag: { label: "Shop all packs", to: "/shop", tone: "bg-ivory text-plum", side: "top" } },
];

const heading = {
  hidden: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
  show: { transition: { staggerChildren: 0.35, delayChildren: 0.1 } },
};
const slab = {
  hidden: { rotate: 0, transition: { duration: 0.3 } },
  show: (tilt) => ({ rotate: tilt, transition: { duration: 0.8, ease } }),
};
const slabLetters = {
  hidden: { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.2 } },
};
const plain = {
  hidden: { opacity: 0, y: "-0.45em", filter: "blur(6px)", transition: { duration: 0.3 } },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};
const fill = {
  hidden: { scaleX: 0, transition: { duration: 0.35, ease, delay: 0.15 } },
  show: { scaleX: 1, transition: { duration: 0.5, ease } },
};
const letters = {
  hidden: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } },
};
const letter = {
  hidden: { opacity: 0, y: "-0.8em", rotate: -10, transition: { duration: 0.2 } },
  show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 18 } },
};
const tagIn = (side) => ({
  hidden: { opacity: 0, y: side === "top" ? -10 : 10, rotate: 0, transition: { duration: 0.2 } },
  show: { opacity: 1, y: 0, rotate: side === "top" ? -4 : 3, transition: { duration: 0.6, ease, delay: 0.7 } },
});
const starIn = {
  hidden: { scale: 0, opacity: 0, transition: { duration: 0.25 } },
  show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 240, damping: 14 } },
};
const drawLine = {
  hidden: { pathLength: 0, opacity: 0, transition: { duration: 0.4 } },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1.2, ease } },
};
const handle = {
  hidden: { opacity: 0, scale: 0.4, transition: { duration: 0.2 } },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease, delay: 1.1 } },
};
const pop = (delay) => ({
  hidden: { scale: 0, transition: { duration: 0.2 } },
  show: { scale: 1, transition: { type: "spring", stiffness: 260, damping: 16, delay } },
});

const Reveal = createContext({ pin: false, reduce: false, trackX: null, at: 0 });

// Pinned: shown while the item sits left of the reveal line, so scrolling back up hides it again.
function useShown(ref) {
  const { pin, reduce, trackX, at } = useContext(Reveal);
  const inView = useInView(ref, { amount: 0.5 });
  const [passed, setPassed] = useState(false);

  const check = (x) => {
    if (ref.current && at) setPassed(ref.current.offsetLeft + x < at);
  };
  useLayoutEffect(() => {
    if (pin) check(trackX.get());
  });
  useMotionValueEvent(trackX, "change", (x) => {
    if (pin) check(x);
  });

  if (reduce) return true;
  return pin ? passed : inView;
}

export function MottoStrip({ reduce }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const wide = useWideScreen();
  const pin = wide && !reduce;
  const [size, setSize] = useState({ distance: 0, stage: 0 });

  useLayoutEffect(() => {
    if (!pin) return undefined;
    const measure = () => {
      const stage = stageRef.current.clientWidth;
      setSize({ distance: Math.max(0, trackRef.current.scrollWidth - stage), stage });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(trackRef.current);
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [pin]);

  const { distance } = size;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: [`start ${pinTop}px`, "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const trackX = useTransform(progress, (value) => (pin ? -value * distance : 0));
  const ghostX = useTransform(progress, (value) => (pin ? -value * distance * 0.35 : 0));
  const spin = useTransform(progress, [0, 1], [0, reduce ? 0 : 300]);

  return (
    <section
      ref={sectionRef}
      id="stree-clinic"
      aria-label="Stree Clinic"
      className="bg-paper text-ink"
      style={pin ? { height: `calc(100svh - ${pinTop}px + ${distance}px)` } : undefined}
    >
      <div
        ref={stageRef}
        className={`relative overflow-hidden ${pin ? "sticky top-32 flex h-[calc(100svh-8rem)] items-center" : "py-20"}`}
      >
        <motion.div
          aria-hidden="true"
          style={{ x: ghostX }}
          className="pointer-events-none absolute inset-y-0 left-[4vw] flex items-center font-poster text-[clamp(9rem,30vw,30rem)] leading-none whitespace-nowrap text-ink/[0.05] uppercase select-none"
        >
          Stree Clinic
        </motion.div>

        <FlowerField progress={progress} reduce={reduce} pin={pin} />

        <Reveal.Provider value={{ pin, reduce, trackX, at: size.stage * revealLine }}>
          <motion.div
            ref={trackRef}
            style={{ x: trackX }}
            className={`relative z-10 flex items-center font-poster leading-[0.85] uppercase ${
              pin
                ? "w-max shrink-0 gap-[3vw] pr-[14vw] pl-[6vw] text-[clamp(4.5rem,10vw,9.5rem)] whitespace-nowrap"
                : "flex-wrap gap-x-4 gap-y-14 px-5 text-[clamp(3.5rem,16vw,6rem)]"
            }`}
          >
            <Intro reduce={reduce} pin={pin} />
            {line.map((item, index) =>
              item.doodle ? (
                pin && <Doodle key={index} kind={item.doodle} />
              ) : item.flower ? (
                <LineFlower key={index} kind={item.flower} size={item.size} tip={item.tip} spin={spin} />
              ) : item.tone ? (
                <Block key={index} item={item} pin={pin} />
              ) : (
                <Word key={index} text={item.word} />
              ),
            )}
          </motion.div>
        </Reveal.Provider>
        {pin && <Pointer progress={progress} />}
      </div>
    </section>
  );
}

function FlowerField({ progress, reduce, pin }) {
  const drift = useTransform(progress, [0, 1], [0, pin ? 28 : 0]);
  const floatY = useTransform(progress, [0, 0.5, 1], [0, -18, 8]);
  const sway = useTransform(progress, [0, 1], [-6, 10]);

  const pieces = [
    { src: flowers.rose, className: "right-[4%] bottom-[10%] w-[min(14vw,140px)] opacity-90", x: drift, y: floatY, rotate: sway },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {pieces.map((piece, index) => (
        <motion.img
          key={piece.src + index}
          src={piece.src}
          alt=""
          className={`absolute object-contain drop-shadow-[0_12px_28px_rgba(40,20,40,0.12)] ${piece.className}`}
          style={reduce ? undefined : { x: piece.x, y: piece.y, rotate: piece.rotate }}
          initial={reduce ? false : { opacity: 0, scale: 0.86 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease, delay: 0.08 * index }}
        />
      ))}
    </div>
  );
}

function LineFlower({ kind, size, tip = 0, spin }) {
  const ref = useRef(null);
  const shown = useShown(ref);
  const src = flowers[kind] || flowers.bloom;

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      initial={false}
      animate={shown ? "show" : "hidden"}
      className={`relative inline-block shrink-0 ${size}`}
    >
      <motion.img
        src={src}
        alt=""
        variants={starIn}
        style={{ rotate: spin }}
        className="h-full w-full origin-center object-contain drop-shadow-[0_8px_18px_rgba(40,20,40,0.14)]"
      />
      <motion.span
        aria-hidden="true"
        className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#f6a6cf]"
        style={{ rotate: tip }}
        variants={pop(0.12)}
      />
    </motion.span>
  );
}

function Pointer({ progress }) {
  const x = useTransform(progress, (value) => Math.sin(value * Math.PI * 7) * 70 + Math.sin(value * Math.PI * 2.3) * 40);
  const y = useTransform(progress, (value) => Math.cos(value * Math.PI * 5) * 80 + 60);
  const tilt = useTransform(progress, (value) => Math.sin(value * Math.PI * 9) * 8);

  return (
    <motion.div aria-hidden="true" style={{ x, y }} className="pointer-events-none absolute top-1/2 left-[76%] z-20">
      <motion.svg style={{ rotate: tilt }} width="22" height="26" viewBox="0 0 22 26" className="drop-shadow-[0_2px_3px_rgba(20,56,76,0.3)]">
        <path d="M2 2 L2 21 L7.5 16 L11 24 L14.5 22.5 L11 15 L18.5 15 Z" fill="#1d1418" stroke="#fffdfb" strokeWidth="1.5" strokeLinejoin="round" />
      </motion.svg>
      <span className="ml-4 inline-block rounded-sm bg-[#f6a6cf] px-1.5 py-0.5 font-mono text-[10px] leading-none tracking-wider text-[#1d1418] uppercase">
        Stree Clinic
      </span>
    </motion.div>
  );
}

function Word({ text }) {
  const ref = useRef(null);
  const shown = useShown(ref);

  return (
    <motion.span ref={ref} initial={false} animate={shown ? "show" : "hidden"} variants={plain} className="inline-block text-[#bdb4ad]">
      {text}
    </motion.span>
  );
}

function Doodle({ kind }) {
  const ref = useRef(null);
  const shown = useShown(ref);
  const state = shown ? "show" : "hidden";

  if (kind === "dots") {
    return (
      <motion.span ref={ref} aria-hidden="true" initial={false} animate={state} className="relative inline-block h-[1em] w-[0.9em] shrink-0">
        <motion.span variants={pop(0)} className="absolute top-[-0.35em] left-[0.45em] h-3.5 w-3.5 rounded-full bg-[#d9aef3]" />
        <motion.span variants={pop(0.15)} className="absolute bottom-[-0.05em] left-0 h-[0.32em] w-[0.64em] rounded-t-full bg-[#f6a6cf]" />
      </motion.span>
    );
  }

  return (
    <motion.span ref={ref} aria-hidden="true" initial={false} animate={state} className="relative inline-block h-[1em] w-[1.9em] shrink-0">
      <svg viewBox="0 0 260 150" fill="none" className="absolute inset-x-0 top-[-0.55em] h-[1.1em] w-full overflow-visible">
        <motion.path d="M14 128 C 70 30, 160 120, 238 26" stroke="#1d1418" strokeWidth="5" strokeLinecap="round" variants={drawLine} />
        <motion.g variants={handle} style={{ transformOrigin: "14px 128px" }}>
          <line x1="14" y1="128" x2="78" y2="24" stroke="#c48ae8" strokeWidth="2.5" />
          <circle cx="78" cy="24" r="9" fill="#fffdfb" stroke="#c48ae8" strokeWidth="3" />
        </motion.g>
        <motion.g variants={handle} style={{ transformOrigin: "238px 26px" }}>
          <line x1="238" y1="26" x2="176" y2="134" stroke="#c48ae8" strokeWidth="2.5" />
          <circle cx="176" cy="134" r="9" fill="#fffdfb" stroke="#c48ae8" strokeWidth="3" />
          <rect x="228" y="16" width="20" height="20" fill="#fffdfb" stroke="#1d1418" strokeWidth="3" />
        </motion.g>
      </svg>
    </motion.span>
  );
}

function Intro({ reduce, pin }) {
  return (
    <div className={`shrink-0 font-sans leading-normal normal-case ${pin ? "pr-[4vw] whitespace-normal" : "w-full pb-6"}`}>
      <motion.h2
        aria-label="Stree Clinic. Ruko mat, Jee Bhar Ke Jee Lo."
        className={`font-poster leading-[0.9] uppercase ${pin ? "text-[clamp(3rem,5vw,5rem)] whitespace-nowrap" : "text-[clamp(2.75rem,12vw,4.5rem)]"}`}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ amount: 0.5 }}
        variants={heading}
      >
        <Slab text="Stree Clinic." tilt={-2} tone="bg-[#d9aef3]" />
        <br />
        <Slab text="Ruko mat, Jee Bhar Ke Jee Lo." tilt={1.5} tone="bg-[#f6a6cf]" className="mt-[0.08em] ml-[0.7em]" />
      </motion.h2>
      <motion.p
        className="mt-6 ml-1 max-w-sm text-sm leading-6 text-ink-soft"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.5 }}
        transition={{ duration: 0.8, ease, delay: 0.5 }}
      >
        Five Satin packs, from the carry box to the XL 15. The size and the count are printed on the pack.
      </motion.p>
    </div>
  );
}

function Slab({ text, tilt, tone, className = "" }) {
  return (
    <motion.span aria-hidden="true" custom={tilt} variants={slab} className={`relative inline-block ${className}`}>
      <motion.span variants={fill} className={`absolute inset-0 origin-left ${tone}`} />
      <motion.span variants={slabLetters} className="relative inline-block px-[0.18em] pt-[0.1em] text-[#1d1418]">
        {Array.from(text).map((char, index) => (
          <motion.span key={index} variants={letter} className="inline-block">
            {char === " " ? "\u00a0" : char}
          </motion.span>
        ))}
      </motion.span>
    </motion.span>
  );
}

function Block({ item, pin }) {
  const ref = useRef(null);
  const shown = useShown(ref);
  const { tag } = item;
  // Wrapped lines leave no room above a word, so every tag hangs below it.
  const side = pin ? tag?.side : "bottom";

  return (
    <motion.span ref={ref} className="relative inline-flex shrink-0" initial={false} animate={shown ? "show" : "hidden"}>
      <motion.span aria-hidden="true" variants={fill} className={`absolute inset-0 origin-left ${item.tone}`} />
      <motion.span variants={letters} className={`relative px-[0.14em] pt-[0.1em] ${item.tone.replace(/bg-\S+/, "")}`}>
        {Array.from(item.word).map((char, index) => (
          <motion.span key={index} variants={letter} className={`inline-block ${char === " " ? "w-[0.22em]" : ""}`}>
            {char === " " ? "\u00a0" : char}
          </motion.span>
        ))}
      </motion.span>
      {tag && (
        <motion.span
          variants={tagIn(side)}
          style={{ pointerEvents: shown ? "auto" : "none" }}
          className={`absolute z-10 ${side === "top" ? "bottom-[82%] left-[58%]" : pin ? "top-[86%] left-[46%]" : "top-[92%] left-[30%]"}`}
        >
          <Link
            to={tag.to}
            className={`inline-flex items-center gap-2 font-mono ${pin ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-xs"} tracking-tight whitespace-nowrap normal-case shadow-[0_8px_24px_-12px_rgba(20,56,76,0.45)] ${tag.tone}`}
          >
            {tag.label}
            <ArrowRight size={14} />
          </Link>
        </motion.span>
      )}
    </motion.span>
  );
}
