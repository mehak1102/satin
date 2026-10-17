import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "satin-know-cues";
const SHOW_MS = 5600;

// Only a few pack bands nudge a side toast — not every section.
const cues = {
  "satin-ultra-xl-8": {
    topic: "PCOD",
    title: "Heavier days, held gently",
    line: "XL for absorbency on the pack — not a Google diagnosis.",
    href: "#know-pcod",
    image: "/notes/note-pcod.jpg",
    imageAlt: "Soft notebook moment for PCOD care notes",
    tint: "bg-[#eef3e8]",
    accent: "#7a9a6a",
    chip: "bg-[#dce8d4] text-[#2f4a28]",
  },
  "satin-xl": {
    topic: "PMS",
    title: "Those tender pre-period days",
    line: "Warmth, rest, and a pack you trust. Care if it keeps stopping you.",
    href: "#know-pms",
    image: "/notes/note-pms.jpg",
    imageAlt: "Soft blanket and warm mug for PMS days",
    tint: "bg-[#f8e8e4]",
    accent: "#c47a6a",
    chip: "bg-[#f3d4cc] text-[#5c2f2a]",
  },
  "satin-ultra-pack-of-2": {
    topic: "UTI",
    title: "When something feels off",
    line: "A carry pack is for bleeding surprises — not treating a UTI.",
    href: "#know-uti",
    image: "/notes/note-issues.jpg",
    imageAlt: "Hands held for comfort when something feels off",
    tint: "bg-[#f3ebe3]",
    accent: "#b08968",
    chip: "bg-[#ead9c8] text-[#4a3424]",
  },
};

function readSeen() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}

function Sparkles({ color, reduce }) {
  if (reduce) return null;
  const dots = [
    { top: "12%", left: "8%", size: 5, delay: 0 },
    { top: "28%", right: "10%", size: 4, delay: 0.35 },
    { bottom: "22%", left: "14%", size: 3.5, delay: 0.7 },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: dot.top,
            left: dot.left,
            right: dot.right,
            bottom: dot.bottom,
            width: dot.size,
            height: dot.size,
            backgroundColor: color,
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.7, 0.15, 0.6], scale: [0.4, 1, 0.85, 1], y: [0, -6, -2, -8] }}
          transition={{ duration: 3.2, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function KnowCue({ ready = true }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(null);
  const seenRef = useRef(null);
  const busyRef = useRef(false);
  const timerRef = useRef(0);

  if (seenRef.current === null) {
    seenRef.current = readSeen();
  }

  function dismiss() {
    window.clearTimeout(timerRef.current);
    busyRef.current = false;
    setActive(null);
  }

  function showCue(slug) {
    const cue = cues[slug];
    if (!cue || busyRef.current) return;
    busyRef.current = true;
    setActive({ slug, ...cue });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(dismiss, SHOW_MS);
  }

  useEffect(() => {
    if (!ready || typeof window === "undefined") return undefined;
    const seen = seenRef.current;
    const cleanups = [];

    Object.keys(cues).forEach((slug) => {
      const el = document.getElementById(`pack-${slug}`);
      if (!el || seen.has(slug)) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || seen.has(slug) || busyRef.current) return;
          seen.add(slug);
          writeSeen(seen);
          showCue(slug);
          observer.disconnect();
        },
        { threshold: 0, rootMargin: "-40% 0px -40% 0px" },
      );

      observer.observe(el);
      cleanups.push(() => observer.disconnect());
    });

    return () => {
      cleanups.forEach((fn) => fn());
      window.clearTimeout(timerRef.current);
    };
  }, [ready]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {active && (
        <motion.aside
          key={active.slug}
          role="status"
          aria-live="polite"
          aria-labelledby="know-toast-title"
          className={`pointer-events-auto fixed right-3 bottom-3 z-[70] w-[min(20.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-[26px] ${active.tint} text-ink shadow-[0_22px_50px_-24px_rgba(20,16,30,0.55)] ring-1 ring-ink/10 sm:right-6 sm:bottom-6`}
          initial={reduce ? false : { opacity: 0, x: 72, y: 18, rotate: 2.5 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: 56, y: 10, rotate: 1.5 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.85 }}
        >
          <Sparkles color={active.accent} reduce={reduce} />

          <div className="relative">
            <div className="relative h-28 overflow-hidden sm:h-32">
              <motion.img
                src={active.image}
                alt={active.imageAlt}
                className="h-full w-full object-cover"
                initial={reduce ? false : { scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 5.4, ease: "easeOut" }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent"
              />
              <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase ${active.chip}`}>
                {active.topic}
              </span>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur hover:bg-white"
              >
                <X size={14} />
              </button>
              {!reduce && (
                <motion.img
                  src="/home/why-satin-bouquet.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 -bottom-6 h-20 w-20 object-contain opacity-90 drop-shadow-md"
                  initial={{ opacity: 0, y: 12, rotate: -8 }}
                  animate={{ opacity: 0.95, y: 0, rotate: 0 }}
                  transition={{ delay: 0.15, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
                />
              )}
            </div>

            <div className="relative px-4 pt-3.5 pb-4">
              <p id="know-toast-title" className="font-display text-[1.35rem] leading-snug">
                {active.title}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-ink-soft">{active.line}</p>
              <a
                href={active.href}
                onClick={dismiss}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-ivory"
              >
                Soft points
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {!reduce && (
            <div className="h-1 bg-ink/10">
              <motion.div
                aria-hidden="true"
                className="h-full origin-left"
                style={{ backgroundColor: active.accent }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: SHOW_MS / 1000, ease: "linear" }}
              />
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  );
}
