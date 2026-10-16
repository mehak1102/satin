import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "satin-know-cues";
const SHOW_MS = 4200;

// Only a few pack bands nudge a side toast — not every section.
const cues = {
  "satin-ultra-xl-8": {
    topic: "PCOD",
    title: "Heavier days, held gently",
    line: "XL for absorbency on the pack — not a Google diagnosis.",
    href: "#know-pcod",
    tint: "bg-[#eef3e8]",
  },
  "satin-xl": {
    topic: "PMS",
    title: "Those tender pre-period days",
    line: "Warmth, rest, and a pack you trust. Care if it keeps stopping you.",
    href: "#know-pms",
    tint: "bg-[#f8e8e4]",
  },
  "satin-ultra-pack-of-2": {
    topic: "UTI",
    title: "When something feels off",
    line: "A carry pack is for bleeding surprises — not treating a UTI.",
    href: "#know-uti",
    tint: "bg-[#f3ebe3]",
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
          className={`pointer-events-auto fixed right-4 bottom-4 z-[70] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl ${active.tint} text-ink shadow-[0_18px_40px_-22px_rgba(20,16,30,0.45)] ring-1 ring-ink/10 sm:right-6 sm:bottom-6`}
          initial={reduce ? false : { opacity: 0, x: 56 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: 48 }}
          transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className="flex items-start gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">{active.topic}</p>
              <p id="know-toast-title" className="mt-1 font-display text-lg leading-snug">
                {active.title}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-ink-soft">{active.line}</p>
              <a
                href={active.href}
                onClick={dismiss}
                className="mt-2.5 inline-block text-xs font-medium text-ink underline decoration-ink/30 underline-offset-2"
              >
                Soft points
              </a>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/55 hover:bg-ink/5 hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
          {!reduce && (
            <motion.div
              aria-hidden="true"
              className="h-0.5 origin-left bg-ink/25"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: SHOW_MS / 1000, ease: "linear" }}
            />
          )}
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  );
}
