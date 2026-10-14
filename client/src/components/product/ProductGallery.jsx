import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const tile = "bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]";

export function ProductGallery({ images = [], name, fallback, badge, action }) {
  const reduce = useReducedMotion();
  const photos = images.filter((image) => image?.url);
  const [index, setIndex] = useState(0);
  const selected = photos[index] || photos[0];

  function step(delta) {
    setIndex((current) => (current + delta + photos.length) % photos.length);
  }

  if (!selected) {
    return (
      <div className={`flex aspect-square items-end rounded-[32px] p-8 ${tile}`}>
        <p className="font-display text-6xl italic text-ink">{fallback || name}</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative aspect-square overflow-hidden rounded-[32px] outline-none focus-visible:ring-2 focus-visible:ring-ink ${tile}`}
        tabIndex={photos.length > 1 ? 0 : undefined}
        onKeyDown={(event) => {
          if (photos.length < 2) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
        }}
      >
        <span aria-hidden="true" className="absolute bottom-[12%] left-1/2 h-7 w-[52%] -translate-x-1/2 rounded-[50%] bg-[#3a2a2a]/20 blur-lg" />
        <AnimatePresence initial={false}>
          <motion.img
            key={selected.url}
            src={selected.url}
            alt={selected.alt || name}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain px-[10%] pt-[10%] pb-[16%]"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        {badge && (
          <span className="pointer-events-none absolute top-5 left-5 rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase backdrop-blur">
            {badge}
          </span>
        )}
        {action && <div className="absolute top-4 right-4">{action}</div>}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => step(-1)}
              className="rounded-full bg-white/85 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs tabular-nums text-ink backdrop-blur" aria-live="polite">
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => step(1)}
              className="rounded-full bg-white/85 p-2.5 text-ink shadow-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <ul className="mt-4 flex gap-3 overflow-x-auto" aria-label="Pack photos">
          {photos.map((image, photoIndex) => {
            const current = photoIndex === index;
            return (
              <li key={`${image.url}-${photoIndex}`} className="shrink-0">
                <button
                  type="button"
                  aria-label={image.alt || `Photo ${photoIndex + 1}`}
                  aria-current={current ? "true" : undefined}
                  onClick={() => setIndex(photoIndex)}
                  className={`h-20 w-24 overflow-hidden rounded-2xl transition ${tile} ${current ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-70 hover:opacity-100"}`}
                >
                  <img src={image.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-2" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
