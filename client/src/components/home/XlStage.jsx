import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Leaves of the foliage shadow cast on the wall, as [x, y, length, angle] along three twigs.
const leaves = [
  [300, 40, 34, -30], [270, 70, 30, 20], [250, 30, 28, -60], [220, 90, 36, 40], [200, 55, 30, -20],
  [170, 110, 34, 60], [160, 70, 26, -40], [130, 130, 30, 30], [330, 120, 32, 70], [300, 150, 36, 10],
  [270, 180, 30, 50], [240, 160, 28, -30], [360, 200, 34, 80], [330, 230, 30, 20], [300, 250, 32, 60],
  [380, 90, 30, -10], [350, 60, 26, 40],
];

export function XlSilk({ reduce, sectionRef }) {
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.4 });
  const shadowX = useTransform(progress, [0, 1], ["2%", "-2%"]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,rgba(255,250,247,0)_0%,rgba(255,250,247,0.55)_30%,rgba(255,246,241,0.75)_100%)]" />
      <span className="absolute inset-x-0 bottom-[34%] h-px bg-[linear-gradient(90deg,rgba(200,140,125,0),rgba(200,140,125,0.18)_40%,rgba(200,140,125,0.18)_70%,rgba(200,140,125,0))]" />

      <motion.svg
        viewBox="0 0 400 300"
        className="absolute -top-[4%] -right-[2%] hidden h-[70%] w-[42%] mix-blend-multiply desk:block"
        style={{ x: reduce ? 0 : shadowX, filter: "blur(7px)" }}
      >
        <motion.g
          style={{ originX: "100%", originY: "0%" }}
          animate={reduce ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          fill="#9b5a4a"
          fillOpacity="0.13"
        >
          <path d="M420 0 C 330 60, 240 90, 120 140" stroke="#9b5a4a" strokeOpacity="0.12" strokeWidth="4" fill="none" />
          <path d="M420 60 C 360 130, 320 190, 290 260" stroke="#9b5a4a" strokeOpacity="0.12" strokeWidth="4" fill="none" />
          {leaves.map(([x, y, length, angle]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={length} ry={length * 0.38} transform={`rotate(${angle} ${x} ${y})`} />
          ))}
        </motion.g>
      </motion.svg>

      <motion.span
        className="absolute -top-[20%] left-[48%] hidden h-[150%] w-[44%] rotate-[22deg] bg-[linear-gradient(90deg,rgba(255,252,249,0)_0%,rgba(255,252,249,0.5)_22%,rgba(255,252,249,0)_38%,rgba(255,252,249,0.38)_58%,rgba(255,252,249,0)_74%)] blur-2xl desk:block"
        animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      <XlDrape reduce={reduce} />
      <XlFloorSilk reduce={reduce} />

      <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_45%,rgba(0,0,0,0)_62%,rgba(140,70,55,0.1)_100%)]" />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply" style={{ backgroundImage: grain }} />
    </div>
  );
}

// Satin drape rising behind the stand on the right; each piece morphs between two folds with matching commands.
const drape = [
  {
    key: "back",
    fill: "url(#xl-drape-deep)",
    d: [
      "M0 500 C 120 420, 200 330, 300 300 C 400 270, 440 330, 520 250 C 560 210, 580 120, 600 60 L 600 250 C 570 300, 540 360, 470 380 C 380 405, 330 360, 250 420 C 180 470, 100 500, 0 500 Z",
      "M0 500 C 130 410, 210 320, 310 290 C 410 262, 450 315, 525 238 C 565 196, 584 110, 600 45 L 600 240 C 572 292, 545 350, 475 372 C 385 398, 335 352, 255 412 C 185 462, 105 500, 0 500 Z",
    ],
  },
  {
    key: "front",
    fill: "url(#xl-drape-light)",
    d: [
      "M200 500 C 300 430, 380 400, 450 350 C 520 300, 560 250, 600 180 L 600 330 C 560 380, 500 420, 430 450 C 360 480, 290 500, 200 500 Z",
      "M190 500 C 295 425, 378 392, 452 340 C 524 290, 562 238, 600 165 L 600 320 C 562 372, 502 414, 432 444 C 362 476, 290 500, 190 500 Z",
    ],
  },
];

const sheen = [
  "M0 500 C 120 420, 200 330, 300 300 C 400 270, 440 330, 520 250 C 560 210, 580 120, 600 60",
  "M0 500 C 130 410, 210 320, 310 290 C 410 262, 450 315, 525 238 C 565 196, 584 110, 600 45",
];

function XlDrape({ reduce }) {
  const drift = { duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 500"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-[4%] -right-[2%] hidden h-[58%] w-[48%] [mask-image:linear-gradient(90deg,transparent_0%,#000_35%)] lg:block"
    >
      <defs>
        <linearGradient id="xl-drape-deep" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f0ad9d" stopOpacity="0.6" />
          <stop offset="0.55" stopColor="#ea9888" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f3b8a9" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="xl-drape-light" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f9d6ca" stopOpacity="0.65" />
          <stop offset="1" stopColor="#f3b9aa" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {drape.map((piece) => (
        <motion.path key={piece.key} fill={piece.fill} initial={false} animate={reduce ? { d: piece.d[0] } : { d: piece.d }} transition={drift} />
      ))}
      <motion.path
        fill="none"
        stroke="#fff8f4"
        strokeOpacity="0.6"
        strokeWidth="3"
        style={{ filter: "blur(1.5px)" }}
        initial={false}
        animate={reduce ? { d: sheen[0] } : { d: sheen }}
        transition={drift}
      />
    </svg>
  );
}

// A chiffon ribbon trailing across the floor and up into the drape, passing behind the stand.
const floorSilk = [
  {
    key: "back",
    fill: "url(#xl-floor-deep)",
    d: [
      "M0 250 C 320 215, 540 280, 820 240 C 1080 205, 1280 150, 1600 80 L 1600 160 C 1290 215, 1090 280, 830 300 C 560 330, 330 280, 0 300 Z",
      "M0 262 C 330 225, 550 270, 830 232 C 1090 198, 1290 140, 1600 70 L 1600 150 C 1300 205, 1100 270, 840 292 C 570 322, 340 290, 0 310 Z",
    ],
  },
  {
    key: "front",
    fill: "url(#xl-floor-light)",
    d: [
      "M200 300 C 500 270, 760 300, 1000 270 C 1220 245, 1420 200, 1600 170 L 1600 230 C 1420 260, 1230 300, 1010 310 C 760 322, 500 300, 200 300 Z",
      "M180 300 C 490 262, 760 292, 1005 262 C 1225 236, 1425 190, 1600 160 L 1600 222 C 1425 252, 1235 292, 1012 304 C 762 318, 495 300, 180 300 Z",
    ],
  },
];

const floorSheen = [
  "M0 250 C 320 215, 540 280, 820 240 C 1080 205, 1280 150, 1600 80",
  "M0 262 C 330 225, 550 270, 830 232 C 1090 198, 1290 140, 1600 70",
];

function XlFloorSilk({ reduce }) {
  const drift = { duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1600 300"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-0 left-0 hidden h-[34%] w-full [mask-image:linear-gradient(90deg,transparent_0%,#000_30%,#000_100%)] lg:block"
    >
      <defs>
        <linearGradient id="xl-floor-deep" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#f3b9ab" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#ec9f8f" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f0ae9f" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="xl-floor-light" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#fbe1d8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f5c3b5" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {floorSilk.map((piece) => (
        <motion.path key={piece.key} fill={piece.fill} initial={false} animate={reduce ? { d: piece.d[0] } : { d: piece.d }} transition={drift} />
      ))}
      <motion.path
        fill="none"
        stroke="#fff8f4"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        style={{ filter: "blur(1.2px)" }}
        initial={false}
        animate={reduce ? { d: floorSheen[0] } : { d: floorSheen }}
        transition={drift}
      />
    </svg>
  );
}
export function XlHalo() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <span className="absolute -top-[8%] bottom-[30%] left-1/2 w-[84%] -translate-x-1/2 rounded-t-full border-[1.5px] border-b-0 border-[#d8a47e]/75 bg-[linear-gradient(180deg,rgba(255,248,243,0.28),rgba(255,248,243,0)_80%)] shadow-[0_0_24px_rgba(255,236,224,0.6),inset_0_0_24px_rgba(255,240,232,0.45)] [mask-image:linear-gradient(180deg,#000_70%,transparent_100%)]" />
    </span>
  );
}