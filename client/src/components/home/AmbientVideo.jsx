import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/** Looping, muted background clip. Pauses when the user prefers reduced motion. */
export function AmbientVideo({ src, className = "", style }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.pause();
      return;
    }
    const play = () => el.play().catch(() => {});
    play();
    return () => el.pause();
  }, [reduce, src]);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={src}
      muted
      loop
      playsInline
      autoPlay={!reduce}
      preload="metadata"
      aria-hidden="true"
    />
  );
}