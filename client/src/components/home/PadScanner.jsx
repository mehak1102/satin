import { animate, motion, useInView, useMotionValue } from "framer-motion";
import { ArrowRight, ChevronsLeftRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Title } from "../motion/Title";

const W = 1000;
const H = 560;
const CY = 280;
const FY = 1.15;
const LAYER_GAP = 112;

const padBody =
  "M-125 0 C-125 -27 -111 -41 -88 -41 C-58 -41 -40 -33 0 -33 C40 -33 58 -41 88 -41 C111 -41 125 -27 125 0 C125 27 111 41 88 41 C58 41 40 33 0 33 C-40 33 -58 41 -88 41 C-111 41 -125 27 -125 0 Z";
const padChannel = "M-86 0 C-86 -13 -76 -19 -60 -19 L60 -19 C76 -19 86 -13 86 0 C86 13 76 19 60 19 L-60 19 C-76 19 -86 13 -86 0 Z";
const wingTop = "M-50 -30 C-44 -58 -36 -66 -22 -68 L22 -68 C36 -66 44 -58 50 -30 Z";
const wingBottom = "M-50 30 C-44 58 -36 66 -22 68 L22 68 C36 66 44 58 50 30 Z";

// Every label is a line printed on that pack. Pad length is shown only where the pack prints it.
const scans = [
  {
    id: "ultra",
    tab: "Ultra",
    sx: 2.62,
    layered: true,
    links: [
      ["satin-ultra-box", "Ultra box"],
      ["satin-ultra-xl-8", "Ultra XL 8"],
    ],
    marks: [
      { lx: -84, layer: -1, ly: 0, text: "Ultra soft and comfortable with anti-rash layer" },
      { lx: -6, layer: -1, ly: -56, text: "Pads with wings" },
      { lx: 34, layer: 0, ly: 0, text: "3 times super absorbent SAP sheet for long-lasting dryness" },
      { lx: 92, layer: 1, ly: 0, text: "Ultra thin protective layer to prevent leakage" },
    ],
  },
  {
    id: "carry",
    tab: "Ultra pack of 2",
    sx: 2.62,
    core: "glow",
    links: [["satin-ultra-pack-of-2", "Ultra pack of 2"]],
    marks: [
      { lx: -100, ly: 0, text: "Ultra soft and thin" },
      { lx: -6, ly: -56, text: "Pads with wings" },
      { lx: 46, ly: 0, text: "3 times super absorbent" },
    ],
  },
  {
    id: "xl",
    tab: "XL",
    sx: 2.62,
    core: "granules",
    length: "280 mm",
    links: [["satin-xl", "XL"]],
    marks: [
      { lx: -6, ly: -56, text: "Pads with wings" },
      { lx: 46, ly: 0, text: "High absorbency with SAP granules" },
      { lx: 118, ly: 96, text: "Size 280 mm" },
    ],
  },
  {
    id: "regular",
    tab: "Regular",
    sx: 2.25,
    core: "granules",
    length: "240 mm",
    links: [["satin-regular", "Regular"]],
    marks: [
      { lx: -6, ly: -56, text: "Pads with wings" },
      { lx: 46, ly: 0, text: "SAP granules with high absorbency" },
      { lx: 118, ly: 96, text: "Size 240 mm" },
    ],
  },
];

const granules = Array.from({ length: 46 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: ((a - Math.floor(a)) * 2 - 1) * 74, y: ((b - Math.floor(b)) * 2 - 1) * 14, r: 1.6 + ((a * 7) % 1) * 1.4, d: (i % 7) * 0.35 };
});

function point(scan, mark) {
  const off = (mark.layer || 0) * LAYER_GAP;
  return { x: ((W / 2 + mark.lx * scan.sx) / W) * 100, y: ((CY + off + mark.ly * FY) / H) * 100 };
}

function PadShape({ sx, y = CY, fill, stroke, strokeWidth = 1.4, wingFill, children }) {
  return (
    <g transform={`translate(${W / 2} ${y}) scale(${sx} ${FY})`}>
      <path d={wingTop} fill={wingFill || fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      <path d={wingBottom} fill={wingFill || fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      <path d={padBody} fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      {children}
    </g>
  );
}

function PlainPad({ uid, scan }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3e7e9" />
        </linearGradient>
        <pattern id={`${uid}-quilt`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 H6 M0 0 V6" stroke="#ecdfe2" strokeWidth="0.6" fill="none" />
        </pattern>
        <filter id={`${uid}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <ellipse cx={W / 2} cy={CY + 74} rx={118 * scan.sx} ry="22" fill="#8a3d5a" opacity="0.16" filter={`url(#${uid}-soft)`} />
      <g transform={`translate(${W / 2} ${CY}) scale(${scan.sx} ${FY})`}>
        {[wingTop, wingBottom, padBody].map((d) => (
          <g key={d}>
            <path d={d} fill={`url(#${uid}-face)`} stroke="#e7d4d9" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            <path d={d} fill={`url(#${uid}-quilt)`} />
          </g>
        ))}
        <path d={padBody} transform="scale(0.93)" fill="none" stroke="#efe2e5" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <path d={padChannel} fill="#fffdfd" stroke="#e59bb3" strokeWidth="1.2" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function XrayPad({ uid, scan }) {
  const left = W / 2 - 125 * scan.sx;
  const right = W / 2 + 125 * scan.sx;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <filter id={`${uid}-glow`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id={`${uid}-sheet`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <path d="M0 0 V7" stroke="#7fe3ff" strokeWidth="1.1" opacity="0.55" />
        </pattern>
        <pattern id={`${uid}-soft`} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="0.9" fill="#ffb3d1" opacity="0.7" />
        </pattern>
        <radialGradient id={`${uid}-core`}>
          <stop offset="0" stopColor="#7fe3ff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#7fe3ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {scan.layered ? (
        <>
          {[left, right].map((x) => (
            <line key={x} x1={x} x2={x} y1={CY - LAYER_GAP} y2={CY + LAYER_GAP} stroke="#9fd8f2" strokeOpacity="0.35" strokeDasharray="4 6" />
          ))}
          <PadShape sx={scan.sx} y={CY + LAYER_GAP} fill="rgba(170,205,255,0.10)" stroke="#a9c8ff" strokeWidth={2}>
            <path d={padBody} transform="scale(0.94)" fill="none" stroke="#a9c8ff" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </PadShape>
          <g filter={`url(#${uid}-glow)`}>
            <PadShape sx={scan.sx} fill="rgba(127,227,255,0.06)" stroke="#7fe3ff" strokeWidth={1.6}>
              <path d={padChannel} transform="scale(1.12 1.3)" fill={`url(#${uid}-sheet)`} stroke="#7fe3ff" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              <path className="satin-scan-pulse" d={padChannel} transform="scale(1.12 1.3)" fill={`url(#${uid}-core)`} />
            </PadShape>
          </g>
          <PadShape sx={scan.sx} y={CY - LAYER_GAP} fill={`url(#${uid}-soft)`} stroke="#ff9fcf" strokeWidth={1.6} wingFill="rgba(255,159,207,0.08)" />
        </>
      ) : (
        <>
          <PadShape sx={scan.sx} fill="rgba(170,205,255,0.06)" stroke="#a9c8ff" strokeWidth={1.4} wingFill="rgba(255,159,207,0.1)">
            <path d={wingTop} fill="none" stroke="#ff9fcf" strokeWidth="2" vectorEffect="non-scaling-stroke" filter={`url(#${uid}-glow)`} />
            <path d={wingBottom} fill="none" stroke="#ff9fcf" strokeWidth="2" vectorEffect="non-scaling-stroke" filter={`url(#${uid}-glow)`} />
            <path d={padChannel} fill="rgba(127,227,255,0.06)" stroke="#7fe3ff" strokeWidth="1.4" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            {scan.core === "granules" &&
              granules.map((g, i) => (
                <ellipse
                  key={i}
                  className="satin-scan-pulse"
                  style={{ animationDelay: `${g.d}s` }}
                  cx={g.x}
                  cy={g.y}
                  rx={g.r / scan.sx}
                  ry={g.r / FY}
                  fill="#7fe3ff"
                />
              ))}
            {scan.core === "glow" && <path className="satin-scan-pulse" d={padChannel} transform="scale(1.1 1.25)" fill={`url(#${uid}-core)`} />}
          </PadShape>
          {scan.length && (
            <g stroke="#e9f6ff" strokeOpacity="0.8" fill="#e9f6ff">
              <line x1={left} x2={right} y1={CY + 110} y2={CY + 110} strokeWidth="1.2" />
              {[left, right].map((x) => (
                <line key={x} x1={x} x2={x} y1={CY + 100} y2={CY + 120} strokeWidth="1.2" />
              ))}
              {Array.from({ length: 13 }, (_, i) => left + ((right - left) * (i + 1)) / 14).map((x) => (
                <line key={x} x1={x} x2={x} y1={CY + 106} y2={CY + 114} strokeWidth="0.8" strokeOpacity="0.5" />
              ))}
              <text x={W / 2} y={CY + 146} textAnchor="middle" stroke="none" fontSize="22" letterSpacing="3" fontFamily="Outfit, sans-serif">
                {scan.length}
              </text>
            </g>
          )}
        </>
      )}
    </svg>
  );
}

export function PadScanner({ packs = [], reduce }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const available = new Set(packs.map((product) => product.slug));
  const shown = packs.length ? scans.filter((scan) => scan.links.some(([slug]) => available.has(slug))) : scans;
  const [scanId, setScanId] = useState(shown[0]?.id);
  const scan = shown.find((item) => item.id === scanId) || shown[0];

  const [pos, setPos] = useState(reduce ? 100 : 14);
  const touched = useRef(false);
  const dragging = useRef(false);
  const stageRef = useRef(null);
  const sweep = useRef(null);
  const motionPos = useMotionValue(14);
  const inView = useInView(stageRef, { once: true, amount: 0.55 });

  useEffect(() => motionPos.on("change", (value) => setPos(value)), [motionPos]);

  useEffect(() => {
    if (!inView || reduce || touched.current) return;
    sweep.current = animate(motionPos, [14, 70, 42], { duration: 2.8, ease: "easeInOut", delay: 0.3 });
    return () => sweep.current?.stop();
  }, [inView, reduce, motionPos]);

  if (!scan) return null;

  const take = () => {
    touched.current = true;
    sweep.current?.stop();
  };
  const moveTo = (clientX) => {
    const box = stageRef.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)));
  };
  const onKey = (event) => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[event.key];
    if (step || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      take();
      setPos((value) => (event.key === "Home" ? 0 : event.key === "End" ? 100 : Math.min(100, Math.max(0, value + step))));
    }
  };

  const marks = scan.marks.map((mark) => ({ ...mark, ...point(scan, mark) })).sort((a, b) => a.x - b.x);
  const seen = marks.filter((mark) => pos >= mark.x).length;

  return (
    <section aria-labelledby="pad-scanner-title" className="overflow-hidden bg-[#efe9f6] text-ink">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-ink-soft uppercase">Inside the pack</p>
            <Title as="h2" id="pad-scanner-title" className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Scan a Satin pad.
            </Title>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">Drag the line across the pad. Each label is copied from the pack that prints it.</p>
          </div>
          <div role="tablist" aria-label="Pack" className="flex flex-wrap gap-2">
            {shown.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === scan.id}
                onClick={() => setScanId(item.id)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  item.id === scan.id ? "bg-ink text-ivory" : "border border-ink/15 bg-white/70 text-ink hover:border-ink"
                }`}
              >
                {item.tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-center">
          <div
            ref={stageRef}
            className="relative aspect-[1000/560] w-full cursor-ew-resize overflow-hidden rounded-[28px] shadow-[0_30px_60px_-36px_rgba(20,56,76,0.55)] select-none"
            style={{ touchAction: "pan-y" }}
            onPointerDown={(event) => {
              take();
              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              moveTo(event.clientX);
            }}
            onPointerMove={(event) => dragging.current && moveTo(event.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,#fff6f8_0%,#f8dfe7_60%,#f1d0dc_100%)]">
              <motion.div key={`plain-${scan.id}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <PlainPad uid={`${uid}p`} scan={scan} />
              </motion.div>
              <span className="absolute right-5 bottom-4 text-[10px] tracking-[0.24em] text-[#8a3d5a]/60 uppercase">Pad</span>
            </div>

            <div
              className="absolute inset-0 bg-[#0a1a2f] bg-[linear-gradient(rgba(127,227,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(127,227,255,0.07)_1px,transparent_1px)] bg-[size:28px_28px]"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <motion.div key={`xray-${scan.id}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <XrayPad uid={`${uid}x`} scan={scan} />
              </motion.div>
              <span className="absolute bottom-4 left-5 text-[10px] tracking-[0.24em] text-[#7fe3ff]/70 uppercase">X-ray</span>
            </div>

            {marks.map((mark, index) => (
              <span
                key={mark.text}
                aria-hidden="true"
                className={`absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-ink shadow-[0_0_0_4px_rgba(127,227,255,0.35)] transition-all duration-300 sm:size-7 sm:text-xs ${
                  pos >= mark.x ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              >
                {index + 1}
              </span>
            ))}

            <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
              <div className="absolute inset-y-0 -left-px w-0.5 bg-[#7fe3ff] shadow-[0_0_18px_4px_rgba(127,227,255,0.65)]" />
              <button
                type="button"
                role="slider"
                aria-label="Scanner line"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pos)}
                aria-valuetext={`${seen} of ${marks.length} labels shown`}
                onKeyDown={onKey}
                className="pointer-events-auto absolute top-1/2 left-0 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_24px_-6px_rgba(10,26,47,0.6)] ring-4 ring-[#7fe3ff]/40"
              >
                <ChevronsLeftRight size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div>
            <ol className="space-y-2">
              {marks.map((mark, index) => {
                const on = pos >= mark.x;
                return (
                  <li
                    key={mark.text}
                    className={`flex items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${on ? "bg-white shadow-[0_12px_28px_-20px_rgba(20,56,76,0.6)]" : "bg-transparent"}`}
                  >
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        on ? "bg-ink text-ivory" : "border border-ink/25 text-ink/40"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className={`text-sm leading-6 transition-colors ${on ? "text-ink" : "text-ink/35"}`}>{mark.text}</span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6 flex flex-wrap gap-2">
              {scan.links
                .filter(([slug]) => !packs.length || available.has(slug))
                .map(([slug, name]) => (
                  <Link key={slug} to={`/product/${slug}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory">
                    View {name}
                    <ArrowRight size={16} />
                  </Link>
                ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-ink-soft">Illustration, not a cut-through of the pad.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
