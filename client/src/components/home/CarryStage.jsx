import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const motes = Array.from({ length: 16 }, (_, index) => ({
  left: `${34 + ((index * 37) % 13)}%`,
  top: `${20 + ((index * 53) % 60)}%`,
  size: index % 4 === 0 ? 3 : 2,
  rise: 40 + (index % 5) * 18,
  duration: 7 + (index % 6) * 1.6,
  delay: (index % 8) * 0.9,
}));

export function CarryNight({ reduce, sectionRef }) {
  const pointerX = useMotionValue(0.4);
  const pointerY = useMotionValue(0.5);
  const glowX = useSpring(useTransform(pointerX, (value) => `${value * 100}%`), { stiffness: 60, damping: 20 });
  const glowY = useSpring(useTransform(pointerY, (value) => `${value * 100}%`), { stiffness: 60, damping: 20 });

  useEffect(() => {
    const section = sectionRef.current;
    if (reduce || !section) return undefined;
    function move(event) {
      const box = section.getBoundingClientRect();
      const top = Math.max(box.top, 0);
      const height = Math.min(box.bottom, window.innerHeight) - top;
      pointerX.set((event.clientX - box.left) / box.width);
      pointerY.set(height > 0 ? (event.clientY - top) / height : 0.5);
    }
    section.addEventListener("pointermove", move);
    return () => section.removeEventListener("pointermove", move);
  }, [reduce, sectionRef, pointerX, pointerY]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,rgba(40,90,170,0),rgba(40,90,170,0.16)_35%,rgba(3,10,26,0.65))]" />
      <motion.span
        className="absolute top-0 left-[40%] h-full w-[46vw] -translate-x-1/2 blur-2xl"
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      >
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(200,225,255,0.42),rgba(200,225,255,0.14)_50%,rgba(200,225,255,0)_88%)] [clip-path:polygon(42%_0,58%_0,96%_100%,4%_100%)]" />
      </motion.span>
      <span className="absolute -top-[6%] left-[40%] h-[14%] w-[16vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(235,245,255,0.75),rgba(235,245,255,0))] blur-md" />
      {!reduce &&
        motes.map((mote) => (
          <motion.span
            key={`${mote.left}-${mote.top}`}
            className="absolute rounded-full bg-white/80 shadow-[0_0_6px_1px_rgba(200,225,255,0.7)]"
            style={{ left: mote.left, top: mote.top, width: mote.size, height: mote.size }}
            animate={{ y: [0, -mote.rise], opacity: [0, 0.9, 0] }}
            transition={{ duration: mote.duration, delay: mote.delay, ease: "easeInOut", repeat: Infinity }}
          />
        ))}
      {!reduce && (
        <motion.div
          className="absolute h-[44vh] w-[44vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(150,195,255,0.14),rgba(150,195,255,0)_65%)]"
          style={{ left: glowX, top: glowY }}
        />
      )}
      <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_45%_45%,rgba(0,0,0,0)_55%,rgba(2,6,18,0.55)_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: grain }} />
    </div>
  );
}

export function CarryGlow({ reduce }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <motion.span
        className="absolute top-[52%] left-1/2 aspect-square w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,175,255,0.34)_0%,rgba(120,175,255,0.08)_45%,rgba(120,175,255,0)_68%)]"
        animate={reduce ? undefined : { opacity: [0.75, 1, 0.75], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      />
      <span className="absolute top-[50%] left-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.09]" />
      <span className="absolute top-[50%] left-1/2 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />
      <motion.span
        className="absolute top-[50%] left-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,rgba(210,232,255,0)_0deg,rgba(210,232,255,0.6)_30deg,rgba(210,232,255,0)_70deg)] [mask:radial-gradient(closest-side,transparent_calc(100%_-_1.5px),#000_calc(100%_-_0.5px))]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      />

      <span className="absolute top-[100%] left-1/2 h-[16%] w-[125%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(110,165,245,0.35),rgba(110,165,245,0))] blur-md" />
      <span
        className="absolute top-[90%] left-1/2 h-[11%] w-[78%] -translate-x-1/2 bg-[linear-gradient(90deg,#081a3d_0%,#1d4a8f_22%,#5d93d8_48%,#2a5ea6_70%,#0a1f48_100%)]"
        style={{ borderRadius: "0 0 50% 50% / 0 0 42% 42%" }}
      />
      <span className="absolute top-[90%] left-1/2 h-[11%] w-[78%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0)_40%,rgba(0,0,0,0.25))]" style={{ borderRadius: "0 0 50% 50% / 0 0 42% 42%" }} />
      <span className="absolute top-[84.5%] left-1/2 h-[11%] w-[78%] -translate-x-1/2 rounded-[50%] border border-white/50 bg-[radial-gradient(closest-side,#b9d6fb_0%,#6c9edf_55%,#2f63ad_100%)] shadow-[0_0_36px_-4px_rgba(150,200,255,0.7)]" />
      <motion.span
        className="absolute top-[84.5%] left-1/2 h-[11%] w-[78%] -translate-x-1/2 overflow-hidden rounded-[50%]"
        initial={false}
      >
        <motion.span
          className="absolute inset-y-0 w-[30%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.45),rgba(255,255,255,0))]"
          animate={reduce ? undefined : { left: ["-30%", "100%"] }}
          transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
        />
      </motion.span>
    </span>
  );
}
