import { motion, useInView } from "framer-motion";
import { Fragment, useRef } from "react";
import { Link } from "react-router-dom";

const ink = "#1b1b18";
const red = "#d9474f";

const packNames = {
  "satin-regular": "Regular",
  "satin-xl": "XL",
  "satin-ultra-pack-of-2": "Ultra pack of 2",
  "satin-ultra-box": "Ultra box",
  "satin-ultra-xl-8": "Ultra XL 8",
};

const tagTones = ["bg-[#fbd3c4]", "bg-[#e9f2c4]", "bg-[#e3d6f5]", "bg-[#cfe2f0]", "bg-[#f8d6e3]"];

const padBody =
  "M-125 0 C-125 -27 -111 -41 -88 -41 C-58 -41 -40 -33 0 -33 C40 -33 58 -41 88 -41 C111 -41 125 -27 125 0 C125 27 111 41 88 41 C58 41 40 33 0 33 C-40 33 -58 41 -88 41 C-111 41 -125 27 -125 0 Z";
const padChannel = "M-86 0 C-86 -13 -76 -19 -60 -19 L60 -19 C76 -19 86 -13 86 0 C86 13 76 19 60 19 L-60 19 C-76 19 -86 13 -86 0 Z";
const wingTop = "M-50 -30 C-44 -58 -36 -66 -22 -68 L22 -68 C36 -66 44 -58 50 -30 Z";
const wingBottom = "M-50 30 C-44 58 -36 66 -22 68 L22 68 C36 66 44 58 50 30 Z";

function PadDefs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#f1e8e2" />
      </linearGradient>
      <pattern id={`${id}-quilt`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0 H8 M0 0 V8" stroke="#e8dcd4" strokeWidth="0.8" fill="none" />
      </pattern>
      <filter id={`${id}-shadow`} x="-30%" y="-40%" width="160%" height="200%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#6b4436" floodOpacity="0.2" />
      </filter>
    </defs>
  );
}

function PadFace({ id, accent = "#e39a86", shadow = true, children }) {
  return (
    <g>
      <path d={padBody} fill={`url(#${id}-face)`} stroke="#e2d3c9" strokeWidth="1.2" filter={shadow ? `url(#${id}-shadow)` : undefined} />
      <path d={padBody} fill={`url(#${id}-quilt)`} />
      <path d={padBody} transform="scale(0.93)" fill="none" stroke="#ebe0d8" strokeWidth="1.4" />
      <path d={padChannel} fill="#fffdfb" stroke={accent} strokeWidth="1.2" strokeDasharray="3 4" />
      {children}
    </g>
  );
}

function Wing({ id, d }) {
  return (
    <>
      <path d={d} fill={`url(#${id}-face)`} stroke="#e2d3c9" strokeWidth="1.2" />
      <path d={d} fill={`url(#${id}-quilt)`} />
    </>
  );
}

// Each row is one line printed on the packs, with only the packs that print it.
const rows = [
  {
    title: "Wings",
    lines: ["Pads with wings"],
    packs: ["satin-regular", "satin-xl", "satin-ultra-pack-of-2", "satin-ultra-box", "satin-ultra-xl-8"],
    card: "bg-[#fbd3c4]",
    Art: WingsArt,
    cursor: { left: ["80%", "72%", "84%", "80%"], top: ["74%", "80%", "68%", "74%"] },
  },
  {
    title: "SAP",
    lines: ["SAP granules with high absorbency", "3 times super absorbent SAP sheet"],
    packs: ["satin-regular", "satin-xl", "satin-ultra-box", "satin-ultra-xl-8"],
    card: "bg-[#e3d6f5]",
    Art: AbsorbArt,
    cursor: { left: ["14%", "22%", "12%", "14%"], top: ["18%", "26%", "30%", "18%"] },
  },
  {
    title: "Ultra thin",
    lines: ["Ultra soft and thin", "Ultra thin protective layer"],
    packs: ["satin-ultra-pack-of-2", "satin-ultra-box", "satin-ultra-xl-8"],
    card: "bg-[#cfe2f0]",
    Art: ThinArt,
    cursor: { left: ["78%", "70%", "82%", "78%"], top: ["80%", "74%", "84%", "80%"] },
  },
  {
    title: "Anti-rash",
    lines: ["Ultra soft and comfortable", "Anti-rash layer"],
    packs: ["satin-ultra-box", "satin-ultra-xl-8"],
    card: "bg-[#e9f2c4]",
    Art: SoftArt,
    cursor: { left: ["80%", "72%", "84%", "80%"], top: ["80%", "86%", "76%", "80%"] },
  },
  {
    title: "IS 5405",
    lines: ["IS 5405", "BIS licence CM/L-8530105818", "Best use 3 years from manufacture"],
    packs: ["satin-regular", "satin-xl", "satin-ultra-pack-of-2"],
    card: "bg-[#f8d6e3]",
    Art: CertArt,
    cursor: { left: ["80%", "72%", "84%", "80%"], top: ["78%", "70%", "84%", "78%"] },
  },
];

export function DropText({ text, reduce }) {
  return (
    <span aria-label={text} className="whitespace-nowrap">
      {text.split(" ").map((word, w) => (
        <Fragment key={`${word}-${w}`}>
          {w > 0 && " "}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((letter, i) => (
              <motion.span
                key={`${letter}-${i}`}
                className="inline-block"
                initial={reduce ? false : { y: "-0.45em", rotate: i % 2 ? 12 : -10, opacity: 0 }}
                whileInView={{ y: 0, rotate: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ type: "spring", stiffness: 260, damping: 17, delay: (w * 4 + i) * 0.035 }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

function Cursor({ path, play }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute flex items-start"
      initial={{ left: path.left[0], top: path.top[0] }}
      animate={play ? path : undefined}
      transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
    >
      <svg width="16" height="18" viewBox="0 0 16 18">
        <path d="M1 1 L14 9 L8 10.2 L5 16.5 Z" fill={ink} stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
      </svg>
      <span className="mt-3.5 -ml-1 rounded-[3px] bg-white px-1.5 py-0.5 font-sans text-[9px] font-semibold tracking-[0.1em] text-[#1b1b18] uppercase shadow-[0_2px_6px_-2px_rgba(0,0,0,0.25)]">
        Satin
      </span>
    </motion.div>
  );
}

const artClass = "absolute inset-0 h-full w-full";

function WingsArt({ play }) {
  const id = "pf-wings";
  const timing = { duration: 3.6, times: [0, 0.32, 0.62, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 };
  const fold = play ? { scaleY: [1, 0.05, 0.05, 1] } : { scaleY: 1 };
  const shade = play ? { opacity: [0, 0.6, 0.6, 0] } : { opacity: 0 };
  const hint = play ? { opacity: [0, 1, 0, 0] } : { opacity: 0 };
  return (
    <svg viewBox="0 0 400 260" className={artClass}>
      <PadDefs id={id} />
      <g fill="none" stroke="#d99a86" strokeWidth="1">
        <rect x="70" y="42" width="260" height="176" />
        <line x1="40" y1="130" x2="360" y2="130" />
        <circle cx="150" cy="130" r="84" />
        <circle cx="250" cy="130" r="84" />
      </g>
      <g transform="translate(200 130)">
        {[wingTop, wingBottom].map((d, i) => (
          <motion.g key={d} style={{ originY: i ? 0 : 1 }} animate={fold} transition={timing}>
            <Wing id={id} d={d} />
            <motion.path d={d} fill="#d98f7a" animate={shade} transition={timing} />
          </motion.g>
        ))}
        <PadFace id={id} />
        <g fill="none" stroke="#c46f5a" strokeWidth="1.6" strokeLinecap="round">
          {[-1, 1].map((side) => (
            <motion.g key={side} animate={hint} transition={timing}>
              <path d={`M62 ${side * 70} C78 ${side * 66} 80 ${side * 50} 70 ${side * 38}`} />
              <path d={`M64 ${side * 44} L70 ${side * 38} L77 ${side * 43}`} />
            </motion.g>
          ))}
        </g>
      </g>
    </svg>
  );
}

const granules = [
  [-14, -12, 6], [4, -16, 5], [18, -6, 6], [-20, 6, 5], [-4, 2, 7], [14, 12, 5], [-10, 18, 5], [24, 20, 4], [-26, -24, 4],
];

function AbsorbArt({ play }) {
  const id = "pf-absorb";
  const timing = { duration: 3.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 };
  return (
    <svg viewBox="0 0 400 260" className={artClass}>
      <PadDefs id={id} />
      <defs>
        <clipPath id={`${id}-lens`}>
          <circle cx="330" cy="58" r="40" />
        </clipPath>
        <radialGradient id={`${id}-stain`}>
          <stop offset="0" stopColor={red} stopOpacity="0.9" />
          <stop offset="0.7" stopColor={red} stopOpacity="0.55" />
          <stop offset="1" stopColor={red} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(188 150)">
        <Wing id={id} d={wingTop} />
        <Wing id={id} d={wingBottom} />
        <PadFace id={id} accent="#b49ad8">
          <motion.ellipse
            rx="34"
            ry="15"
            fill={`url(#${id}-stain)`}
            initial={{ scale: 0, opacity: 0 }}
            animate={play ? { scale: [0, 0, 1, 1.05, 1.05], opacity: [0, 0, 1, 0, 0] } : { scale: 0, opacity: 0 }}
            transition={{ ...timing, times: [0, 0.3, 0.42, 0.85, 1] }}
          />
          <motion.ellipse
            rx="30"
            ry="13"
            fill="none"
            stroke={red}
            strokeWidth="1.2"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={play ? { scale: [0.4, 0.4, 2.2], opacity: [0, 0.7, 0] } : { scale: 0.4, opacity: 0 }}
            transition={{ ...timing, times: [0, 0.32, 0.7] }}
          />
        </PadFace>
        <motion.path
          d="M0 -20 C 8 -8, 13 0, 13 6 A 13 13 0 0 1 -13 6 C -13 0, -8 -8, 0 -20 Z"
          fill={red}
          initial={{ y: -130, opacity: 0 }}
          animate={play ? { y: [-130, -6, -6, -6], opacity: [0, 1, 0, 0] } : { y: -130, opacity: 0 }}
          transition={{ ...timing, times: [0, 0.3, 0.32, 1], ease: "easeIn" }}
        />
      </g>
      <line x1="210" y1="140" x2="300" y2="84" stroke="#9c84cc" strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="330" cy="58" r="42" fill="#fffdfb" stroke="#9c84cc" strokeWidth="2" />
      <g clipPath={`url(#${id}-lens)`}>
        <g stroke="#ece2f6" strokeWidth="1.2">
          {[-30, -18, -6, 6, 18, 30].map((y) => (
            <line key={y} x1="288" y1={58 + y} x2="372" y2={58 + y + 10} />
          ))}
        </g>
        {granules.map(([x, y, r], i) => (
          <motion.circle
            key={i}
            cx={330 + x}
            cy={58 + y}
            r={r}
            initial={{ scale: 1, fill: "#c9b6ea" }}
            animate={
              play
                ? { scale: [1, 1, 1.45, 1.45, 1], fill: ["#c9b6ea", "#c9b6ea", "#e8949a", "#e8949a", "#c9b6ea"] }
                : { scale: 1, fill: "#c9b6ea" }
            }
            transition={{ ...timing, times: [0, 0.38 + (i % 3) * 0.03, 0.55, 0.85, 1] }}
          />
        ))}
      </g>
    </svg>
  );
}

function ThinArt({ play }) {
  const id = "pf-thin";
  const thick = 84;
  const thin = 9;
  const slices = Array.from({ length: 14 }, (_, i) => 1 - i / 14);
  const timing = { duration: 3.4, times: [0, 0.36, 0.7, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 };
  const squeeze = (value) => (play ? { y: [value * thick, value * thin, value * thin, value * thick] } : { y: value * thick });
  return (
    <svg viewBox="0 0 400 260" className={artClass}>
      <PadDefs id={id} />
      <ellipse cx="200" cy="178" rx="122" ry="14" fill="#7ea5c4" opacity="0.22" />
      <g transform="translate(200 128) scale(1 0.44)">
        {slices.map((value) => (
          <motion.path
            key={value}
            d={padBody}
            fill={value === 1 ? "#d9cbc1" : "#efe6df"}
            stroke={value === 1 ? "#d2c2b7" : "none"}
            strokeWidth="1.4"
            initial={{ y: value * thick }}
            animate={squeeze(value)}
            transition={timing}
          />
        ))}
        <PadFace id={id} accent="#7ea5c4" shadow={false} />
      </g>
      <g fill="none" stroke="#4f7ea3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {[150, 250].map((x) => (
          <motion.g key={x} initial={{ y: 0 }} animate={play ? { y: [0, 22, 22, 0] } : { y: 0 }} transition={timing}>
            <path d={`M${x} 30 V58`} />
            <path d={`M${x - 7} 51 L${x} 58 L${x + 7} 51`} />
          </motion.g>
        ))}
        <line x1="334" y1="128" x2="350" y2="128" />
        <motion.line x1="334" y1="128" x2="350" y2="128" initial={{ y: thick * 0.44 }} animate={squeeze(0.44)} transition={timing} />
      </g>
    </svg>
  );
}

function SoftArt({ play }) {
  const id = "pf-soft";
  const drift = { duration: 5.2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" };
  return (
    <svg viewBox="0 0 400 260" className={artClass}>
      <PadDefs id={id} />
      <g transform="translate(200 142)">
        <Wing id={id} d={wingTop} />
        <Wing id={id} d={wingBottom} />
        <PadFace id={id} accent="#a9bf6a" />
      </g>
      {[
        [130, 150],
        [205, 132],
        [270, 152],
      ].map(([x, y], i) => (
        <motion.circle
          key={x}
          cx={x}
          cy={y}
          r="3"
          fill="#ffffff"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={play ? { opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] } : { opacity: 0 }}
          transition={{ duration: 1.8, delay: 0.6 + i * 0.7, repeat: Infinity, repeatDelay: 1.2 }}
        />
      ))}
      <motion.g
        initial={{ x: 60, y: 92, rotate: -16 }}
        animate={play ? { x: [60, 150, 230, 300], y: [92, 116, 92, 112], rotate: [-16, -4, -18, -6] } : { x: 60, y: 92, rotate: -16 }}
        transition={drift}
      >
        <path
          d="M0 0 C 14 -10, 28 -18, 40 -21 L 46 -15 L 50 -23 C 74 -27, 106 -24, 132 -5 C 112 4, 90 10, 70 11 L 64 5 L 58 12 C 36 13, 14 8, 0 0 Z"
          fill="#ffffff"
          stroke="#ddd4c7"
          strokeWidth="1"
          filter={`url(#${id}-shadow)`}
        />
        <g stroke="#ece6dd" strokeWidth="0.9" fill="none">
          {[16, 28, 40, 54, 68, 82, 96, 110].map((x) => (
            <Fragment key={x}>
              <path d={`M${x} ${-1 - x * 0.04} q 8 -8 ${14} ${-16 + Math.abs(x - 70) * 0.12}`} />
              <path d={`M${x} ${-1 - x * 0.04} q 6 6 ${12} ${10 - Math.abs(x - 60) * 0.08}`} />
            </Fragment>
          ))}
        </g>
        <g stroke="#e3dbcf" strokeWidth="1" fill="none" strokeLinecap="round">
          <path d="M-8 3 q -6 -8 -2 -14" />
          <path d="M-4 3 q -2 9 4 12" />
          <path d="M-14 4 q -8 -2 -10 -9" />
        </g>
        <path d="M-20 4 C 20 -2, 80 -8, 132 -5" fill="none" stroke="#c2b6a4" strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function CertArt({ play }) {
  const id = "pf-cert";
  const timing = { duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 };
  const rose = "#c4587a";
  return (
    <svg viewBox="0 0 400 260" className={artClass}>
      <PadDefs id={id} />
      <defs>
        <path id={`${id}-ring`} d="M264 170 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0" />
      </defs>
      <g transform="rotate(-3 200 133)">
        <rect x="66" y="40" width="268" height="186" rx="10" fill="#fffdfb" filter={`url(#${id}-shadow)`} />
        <g transform="translate(148 92) scale(0.5)">
          <Wing id={id} d={wingTop} />
          <Wing id={id} d={wingBottom} />
          <PadFace id={id} accent={rose} shadow={false} />
        </g>
        <g fill="#efe3e7">
          <rect x="88" y="146" width="110" height="7" rx="3.5" />
          <rect x="88" y="162" width="84" height="7" rx="3.5" />
          <rect x="88" y="178" width="58" height="7" rx="3.5" />
        </g>
        <motion.g
          initial={{ opacity: 0 }}
          animate={play ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 1 }}
          transition={{ ...timing, times: [0, 0.29, 0.31, 0.9, 1] }}
        >
          <g transform="rotate(-10 264 170)">
            <circle cx="264" cy="170" r="36" fill="none" stroke={rose} strokeWidth="2.6" />
            <circle cx="264" cy="170" r="24" fill="none" stroke={rose} strokeWidth="1" />
            <text fill={rose} fontFamily="Outfit, sans-serif" fontSize="6" fontWeight="600">
              <textPath href={`#${id}-ring`} textLength="186" lengthAdjust="spacing">
                BIS · CM/L-8530105818 · IS 5405 ·
              </textPath>
            </text>
            <path d="M254 166 L261 173 L275 159" fill="none" stroke={rose} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="264" y="186" textAnchor="middle" fill={rose} fontFamily="Fraunces, serif" fontSize="9" fontWeight="600">
              IS 5405
            </text>
          </g>
        </motion.g>
      </g>
      <motion.ellipse
        cx="264"
        cy="180"
        rx="46"
        ry="8"
        fill="#8f3c58"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={play ? { opacity: [0, 0.25, 0.25, 0, 0], scale: [0.6, 1, 1, 0.6, 0.6] } : { opacity: 0, scale: 0.6 }}
        transition={{ ...timing, times: [0, 0.28, 0.42, 0.62, 1] }}
      />
      <motion.g
        initial={{ y: -96 }}
        animate={play ? { y: [-96, 0, 0, -96, -96] } : { y: -96 }}
        transition={{ ...timing, times: [0, 0.28, 0.42, 0.62, 1] }}
      >
        <ellipse cx="264" cy="112" rx="24" ry="14" fill={rose} />
        <rect x="255" y="120" width="18" height="34" rx="4" fill="#e7a9bd" />
        <rect x="218" y="152" width="92" height="18" rx="5" fill={rose} />
        <rect x="222" y="170" width="84" height="6" rx="2" fill="#8f3c58" />
      </motion.g>
    </svg>
  );
}

function FeatureRow({ row, reduce }) {
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { amount: 0.35 });
  const play = inView && !reduce;
  const { Art } = row;

  return (
    <article className="border-t border-[#1b1b18]/45 bg-[#f4efe7] lg:sticky lg:top-32">
      <div className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-12 lg:py-12">
        <div>
          <h3 className="font-display text-[clamp(3rem,6.4vw,7rem)] leading-[0.95] font-medium tracking-[-0.02em] text-[#1b1b18]">
            <DropText text={row.title} reduce={reduce} />
          </h3>
          <p className="mt-6 text-xs font-semibold tracking-[0.08em] text-[#1b1b18] uppercase">On the pack:</p>
          <ul className="mt-3 flex max-w-md flex-wrap gap-2">
            {row.lines.map((line) => (
              <li key={line} className="rounded-full bg-white px-4 py-2 text-[11px] tracking-wide text-[#1b1b18] uppercase">
                {line}
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex flex-wrap gap-2">
            {row.packs.map((slug, i) => (
              <li key={slug}>
                <Link
                  to={`/product/${slug}`}
                  className={`inline-block px-2.5 py-1 font-sans text-[10px] font-medium tracking-[0.1em] uppercase transition-transform hover:-rotate-2 ${
                    i % 2 ? "rotate-1" : "-rotate-1"
                  } ${tagTones[i % tagTones.length]}`}
                >
                  {packNames[slug]} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div ref={cardRef} className={`relative aspect-[4/3] w-full overflow-hidden rounded-[28px] lg:aspect-[16/10] lg:max-w-[820px] lg:justify-self-end ${row.card}`}>
          <Art play={play} />
          {!reduce && <Cursor path={row.cursor} play={play} />}
        </div>
      </div>
    </article>
  );
}

export function PackFeatures({ reduce }) {
  return (
    <section aria-labelledby="pack-features-title" className="bg-[#f4efe7] text-[#1b1b18]">
      <div className="px-5 pt-16 pb-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="relative pb-12">
          <h2 id="pack-features-title" className="font-display text-[clamp(1.2rem,6.2vw,6.5rem)] leading-none font-medium tracking-[-0.02em] whitespace-nowrap">
            <DropText text="Ruko mat, Jee Bhar Ke Jee Lo." reduce={reduce} />
          </h2>
        </div>
        <div>
          {rows.map((row) => (
            <FeatureRow key={row.title} row={row} reduce={reduce} />
          ))}
        </div>
        <div aria-hidden="true" className="mt-0 space-y-1.5 border-t border-[#1b1b18]/45 pt-1.5">
          {[0, 1, 2].map((line) => (
            <div key={line} className="h-px bg-[#1b1b18]/20" />
          ))}
        </div>
      </div>
    </section>
  );
}
