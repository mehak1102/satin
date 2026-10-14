import { motion, useReducedMotion } from "framer-motion";

const leaf = "M0 0C14-15 46-19 80 0C46 19 14 15 0 0Z";

function Branch({ count = 9, length = 560, bend = 0.07 }) {
  const step = length / (count + 1);
  const yAt = (x) => -2 * (x / length) * (1 - x / length) * bend * length;
  return (
    <g>
      <path d={`M0 0Q${length / 2} ${-bend * length} ${length} 0`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: count }, (_, i) => {
        const x = step * (i + 1);
        const side = i % 2 ? 1 : -1;
        const scale = 1.35 - (i / count) * 0.6;
        return <path key={i} d={leaf} transform={`translate(${x} ${yAt(x)}) rotate(${side * (58 - i * 2)}) scale(${scale})`} />;
      })}
      <path d={leaf} transform={`translate(${length} 0) rotate(4) scale(0.8)`} />
    </g>
  );
}

function Flower({ x, y, size = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse key={angle} cx="17" cy="0" rx="15" ry="9" transform={`rotate(${angle})`} />
      ))}
    </g>
  );
}

function Sway({ reduce, origin, duration, children, className }) {
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: origin }}
      animate={reduce ? undefined : { rotate: [0, 1.6, -0.8, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export function LeafShadows() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-[#3b2730] opacity-[0.075] blur-[2.5px]">
      <Sway reduce={reduce} origin="100% 0%" duration={11} className="absolute -top-16 -right-24 w-[max(460px,min(78vw,880px))]">
        <svg viewBox="0 0 880 620" className="w-full" fill="currentColor">
          <g transform="translate(880 40) rotate(152)">
            <Branch count={11} length={760} />
          </g>
          <g transform="translate(860 230) rotate(178)">
            <Branch count={7} length={430} bend={-0.08} />
          </g>
          <Flower x={430} y={300} size={1.2} />
          <Flower x={560} y={410} size={0.9} />
          <Flower x={300} y={190} size={0.75} />
        </svg>
      </Sway>
      <Sway reduce={reduce} origin="0% 100%" duration={13} className="absolute top-[52rem] -left-28 w-[max(380px,min(62vw,640px))]">
        <svg viewBox="0 0 640 520" className="w-full" fill="currentColor">
          <g transform="translate(0 470) rotate(-38)">
            <Branch count={9} length={600} bend={-0.06} />
          </g>
          <Flower x={330} y={250} size={1} />
          <Flower x={210} y={360} size={0.7} />
        </svg>
      </Sway>
    </div>
  );
}
