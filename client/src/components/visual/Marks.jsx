import { motion, useReducedMotion } from "framer-motion";

export function Petal({ className = "h-16 w-12" }) {
  return (
    <svg className={className} viewBox="0 0 80 120" aria-hidden="true">
      <path
        fill="currentColor"
        d="M40 4c20 22 30 46 30 68 0 26-13 44-30 46C23 116 10 98 10 72 10 50 20 26 40 4z"
      />
      <path fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.4" d="M40 22c9 18 13 34 13 52" />
    </svg>
  );
}

export function Flourish({ className = "h-8 w-28 text-rose" }) {
  return (
    <svg className={className} viewBox="0 0 140 32" fill="none" aria-hidden="true">
      <path
        d="M4 20c18-16 32-16 46 0s28 16 46 0 28-16 40 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="70" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

export function WaveRule({ className = "h-10 w-full text-blush" }) {
  return (
    <svg className={className} viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 24c120 24 240 24 360 0s240-24 360 0 240 24 360 0 240-24 360 0v24H0z" />
    </svg>
  );
}

export function Orbit({ className = "h-full w-full text-plum/70" }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <path id="satin-orbit" d="M200 200 m-158 0 a158 158 0 1 1 316 0 a158 158 0 1 1 -316 0" />
      </defs>
      <text fill="currentColor" fontFamily="Outfit, sans-serif" fontSize="13" letterSpacing="3.5">
        <textPath href="#satin-orbit">
          SOFT ABSORBENT FOR BOLD MOVES · CARRY IT WITH YOU · JEE BHAR KE JEE LO ·
        </textPath>
      </text>
    </svg>
  );
}

export function ArchFrame({ className = "text-blush" }) {
  return (
    <svg className={className} viewBox="0 0 320 420" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 420V180C20 80 80 16 160 16s140 64 140 164v240z"
      />
      <path fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" d="M36 420V186c0-84 52-138 124-138s124 54 124 138v234" />
    </svg>
  );
}

export function Float({ children, className = "", delay = 0, distance = 12 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const ribbon = [
  "Soft absorbent for bold moves",
  "Carry it with you",
  "Ruko mat, Jee Bhar Ke Jee Lo",
  "Jee Bhar Kar Jee Lo",
];

export function Ribbon() {
  const loop = [...ribbon, ...ribbon];
  return (
    <div className="overflow-hidden border-y border-line bg-paper py-3 text-ink">
      <div className="satin-marquee flex w-max gap-10">
        {loop.map((phrase, index) => (
          <span key={`${phrase}-${index}`} className="flex items-center gap-10 text-[11px] tracking-[0.22em] uppercase text-ink-soft">
            {phrase}
            <span aria-hidden="true">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
