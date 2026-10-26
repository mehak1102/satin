import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const auras = [
  { className: "top-[-18%] left-[-10%] h-[60vh] w-[60vh] bg-[#7c3aed]/30", x: [0, 80, 0], y: [0, 50, 0], duration: 22 },
  { className: "right-[4%] bottom-[-25%] h-[70vh] w-[70vh] bg-[#ec4899]/30", x: [0, -90, 0], y: [0, -60, 0], duration: 26 },
  { className: "top-[20%] left-[38%] h-[40vh] w-[40vh] bg-[#f472b6]/15", x: [0, 60, -40, 0], y: [0, -40, 30, 0], duration: 30 },
];

const dust = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 53 + 7) % 100}%`,
  size: 2 + (index % 3),
  duration: 9 + (index % 5) * 2,
  delay: (index % 6) * 1.3,
}));

export function RegularStage({ word, reduce, sectionRef }) {
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const wordX = useTransform(scrollYProgress, [0, 1], ["14%", "-22%"]);
  const pointerX = useMotionValue(0.7);
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
      {auras.map((aura) => (
        <motion.div
          key={aura.className}
          className={`absolute rounded-full blur-3xl ${aura.className}`}
          animate={reduce ? undefined : { x: aura.x, y: aura.y }}
          transition={{ duration: aura.duration, ease: "easeInOut", repeat: Infinity }}
        />
      ))}
      {!reduce && (
        <motion.div
          className="absolute h-[46vh] w-[46vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,190,225,0.22),rgba(255,190,225,0)_65%)]"
          style={{ left: glowX, top: glowY }}
        />
      )}
      <motion.div
        className="absolute -top-[30%] right-[16%] h-[150%] w-[26vw] origin-top rotate-[22deg] bg-[linear-gradient(180deg,rgba(255,220,240,0.2),rgba(255,220,240,0.06)_55%,rgba(255,220,240,0))] blur-2xl"
        animate={reduce ? undefined : { opacity: [0.6, 1, 0.6], rotate: [20, 25, 20] }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
      />
      {!reduce &&
        dust.map((speck) => (
          <motion.span
            key={`${speck.left}-${speck.top}`}
            className="absolute rounded-full bg-[#ffd6ec] shadow-[0_0_8px_2px_rgba(255,170,215,0.6)]"
            style={{ left: speck.left, top: speck.top, width: speck.size, height: speck.size }}
            animate={{ y: [0, -60, -120], opacity: [0, 0.8, 0] }}
            transition={{ duration: speck.duration, delay: speck.delay, ease: "easeOut", repeat: Infinity }}
          />
        ))}
      <div className="absolute inset-0 opacity-[0.13] mix-blend-overlay" style={{ backgroundImage: grain }} />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(14,2,20,0.5),rgba(14,2,20,0))]" />
      {word && (
        <motion.span
          className="absolute right-0 bottom-[-0.12em] hidden max-w-full overflow-hidden font-poster text-[clamp(5rem,12vw,16rem)] leading-none tracking-[0.02em] whitespace-nowrap text-transparent uppercase desk:block"
          style={{ x: reduce ? 0 : wordX, WebkitTextStroke: "1px rgba(255,255,255,0.26)" }}
        >
          {word} · {word}
        </motion.span>
      )}
    </div>
  );
}

export function RegularHalo({ reduce }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden desk:block">
      <span className="absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,150,205,0.32)_0%,rgba(255,150,205,0.09)_45%,rgba(255,150,205,0)_68%)]"
          animate={reduce ? undefined : { opacity: [0.65, 1, 0.65], scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        />
        <span className="absolute inset-[6%] rounded-full border border-white/15" />
        <motion.span
          className="absolute inset-[16%] rounded-full border border-dashed border-white/[0.1]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 90, ease: "linear", repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-[6%]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        >
          <span className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffe1f0] shadow-[0_0_14px_4px_rgba(255,150,205,0.75)]" />
        </motion.span>
        <motion.span
          className="absolute inset-[6%] rounded-full bg-[conic-gradient(from_0deg,rgba(255,200,230,0)_0deg,rgba(255,200,230,0.35)_40deg,rgba(255,200,230,0)_80deg)] [mask:radial-gradient(closest-side,transparent_calc(100%_-_2px),#000_calc(100%_-_1px))]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        />
      </span>
      <span className="absolute top-[71%] left-1/2 h-[16%] w-[86%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,170,215,0.3),rgba(255,170,215,0.08)_60%,rgba(255,170,215,0))]" />
      <span className="absolute top-[74%] left-1/2 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%] border-t border-white/20" />
    </span>
  );
}
