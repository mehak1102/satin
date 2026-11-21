import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Title } from "../motion/Title";

const easeLuxury = [0.33, 1, 0.68, 1];
const LOOP_END = 12;

export function BlissVisual({ reduce }) {
  const prefersReduce = useReducedMotion();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReduce) return;

    const onTimeUpdate = () => {
      if (video.currentTime >= LOOP_END) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.play().catch(() => {});

    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [prefersReduce]);

  function scrollToBliss() {
    const el = document.getElementById("product-bliss");
    if (el) {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      return;
    }
    document.getElementById("condoms-grid")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section className="relative min-h-svh w-full overflow-hidden" aria-labelledby="bliss-showcase-title">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="bliss-visual-video h-full w-full object-cover object-center"
          autoPlay={!prefersReduce}
          muted
          loop={prefersReduce}
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/condoms/intimacy-moment.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-[#2c1a12]/22" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a0f0a]/12 via-transparent to-[#1a0f0a]/20"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.95, ease: easeLuxury }}
          className="bliss-glass-panel w-full max-w-4xl overflow-hidden rounded-xl border border-paper/30 shadow-[0_28px_90px_-12px_rgba(20,12,8,0.4)] sm:max-w-[44rem] lg:max-w-[48rem] lg:rounded-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[300px]">
            <div className="flex items-center justify-center p-8 sm:p-10 lg:p-12">
              <motion.img
                src="/condoms/night-bliss-pack.png"
                alt="Night Bliss XTRA Pleasure condom pack"
                className="hero-product-shadow max-h-[200px] w-full max-w-md object-contain sm:max-h-[240px] lg:max-h-[280px]"
                loading="lazy"
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, delay: 0.2, ease: easeLuxury }}
              />
            </div>

            <div className="flex flex-col justify-center border-t border-paper/20 px-8 py-10 text-center sm:px-10 sm:py-12 lg:border-t-0 lg:border-l lg:px-12 lg:py-14 lg:text-left">
              <p className="bliss-showcase-type mb-4 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-paper/90">
                01 — Night Bliss™
              </p>
              <Title
                as="h2"
                id="bliss-showcase-title"
                className="bliss-showcase-type font-display text-4xl text-paper sm:text-5xl lg:text-[3.25rem] lg:leading-none"
              >
                Bliss
              </Title>
              <p className="bliss-showcase-type mx-auto mt-5 max-w-sm text-sm leading-relaxed text-paper/80 lg:mx-0 lg:max-w-md lg:text-[0.9375rem]">
                Dotted, contoured, and ribbed — pack lines as printed. Prices on the shelf, not a pitch deck.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <button
                  type="button"
                  onClick={scrollToBliss}
                  className="group inline-flex items-center gap-2.5 bg-plum px-7 py-3.5 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-300 hover:bg-rose hover:shadow-[0_8px_24px_-6px_rgba(109,41,79,0.55)]"
                >
                  Explore Bliss
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
                <Link
                  to="/product/night-bliss-3"
                  className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-paper/85 underline-offset-4 hover:text-paper hover:underline"
                >
                  Pack of 3
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}