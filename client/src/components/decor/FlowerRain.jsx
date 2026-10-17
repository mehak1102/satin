import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const palette = ["#f6a6cf", "#e8b4f0", "#ffc4d6", "#d9aef3", "#ffb8d0", "#f3c4ff"];
const centers = ["#ffe8a8", "#fff4c8", "#ffd6e8"];

function Daisy({ fill, center }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="24"
          cy="14"
          rx="7"
          ry="11"
          fill={fill}
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="7.5" fill={center} />
      <circle cx="24" cy="24" r="3" fill="#fff8e8" opacity="0.7" />
    </svg>
  );
}

function Blossom({ fill, center }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle
          key={deg}
          cx="24"
          cy="13"
          r="9"
          fill={fill}
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="6.5" fill={center} />
    </svg>
  );
}

function Bud({ fill, center }) {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <ellipse cx="20" cy="16" rx="8" ry="12" fill={fill} />
      <ellipse cx="13" cy="20" rx="7" ry="10" fill={fill} opacity="0.9" transform="rotate(-28 13 20)" />
      <ellipse cx="27" cy="20" rx="7" ry="10" fill={fill} opacity="0.9" transform="rotate(28 27 20)" />
      <circle cx="20" cy="22" r="4.5" fill={center} />
    </svg>
  );
}

function TinyPetal({ fill }) {
  return (
    <svg viewBox="0 0 28 36" className="h-full w-full" aria-hidden="true">
      <path
        fill={fill}
        d="M14 2c8 10 12 18 12 24a12 12 0 0 1-24 0c0-6 4-14 12-24z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        d="M14 10c3.5 7 5 13 5 18"
      />
    </svg>
  );
}

const shapes = [Daisy, Blossom, Bud, TinyPetal];

function makeFlakes(count) {
  return Array.from({ length: count }, (_, i) => {
    const Shape = shapes[i % shapes.length];
    return {
      id: i,
      Shape,
      left: `${(i * 37 + 11) % 96}%`,
      size: 18 + ((i * 13) % 22),
      delay: (i % 12) * 0.12 + (i % 5) * 0.04,
      duration: 2.4 + (i % 7) * 0.22,
      sway: 18 + (i % 6) * 8,
      spin: (i % 2 === 0 ? 1 : -1) * (160 + (i % 5) * 40),
      fill: palette[i % palette.length],
      center: centers[i % centers.length],
      opacity: 0.72 + (i % 4) * 0.07,
    };
  });
}

export function FlowerRain() {
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);
  const flakes = useMemo(() => makeFlakes(28), []);

  useEffect(() => {
    if (reduce) return undefined;
    setLive(true);
    const end = window.setTimeout(() => setLive(false), 3400);
    return () => window.clearTimeout(end);
  }, [reduce]);

  if (!live) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] overflow-hidden"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="satin-flower-fall absolute top-0"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            "--fall-delay": `${flake.delay}s`,
            "--fall-duration": `${flake.duration}s`,
            "--fall-sway": `${flake.sway}px`,
            "--fall-spin": `${flake.spin}deg`,
          }}
        >
          <flake.Shape fill={flake.fill} center={flake.center} />
        </span>
      ))}
    </div>
  );
}
