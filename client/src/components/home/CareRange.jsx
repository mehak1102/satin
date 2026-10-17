import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice } from "../../services/api";
import { DropText, dropLine } from "../motion/Title";

const timelineSlugs = [
  "stallion-complete-3",
  "rider-long-lasting-4",
  "sawan-premium-3",
  "night-bliss-3",
  "ecroz-gold-cycle",
  "nopreg-injection-150",
];

export function CareRange({ reduce }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 85%"],
  });
  const lineProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const lineScale = useTransform(lineProgress, [0, 1], [0, 1]);

  const care = useQuery({
    queryKey: ["products", "care-timeline"],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { limit: 40 } });
      const bySlug = new Map((data.items || []).map((item) => [item.slug, item]));
      return timelineSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
    },
  });

  const items = care.data || [];
  if (!care.isLoading && items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="care-range-title"
      className="relative overflow-hidden bg-paper text-ink"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Beyond pads</p>
          <motion.h2
            id="care-range-title"
            className="mt-4 font-display text-4xl leading-[0.98] font-medium sm:text-5xl"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={dropLine}
          >
            <DropText text="A short care timeline" reduce={reduce} />
          </motion.h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-ink-soft">
            Follow the line — one pack at a time. Condoms and contraception with prices as printed. Ask a clinician for medical products.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop?category=Condoms"
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-ivory px-5 py-2.5 text-sm text-ink hover:border-ink"
            >
              Shop condoms
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/shop?category=Contraception"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory"
            >
              Shop contraception
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div aria-hidden="true" className="absolute top-0 bottom-0 left-6 w-px bg-ink/10 md:left-1/2 md:-translate-x-px" />
          <motion.div
            aria-hidden="true"
            className="absolute top-0 left-6 w-px origin-top bg-ink md:left-1/2 md:-translate-x-px"
            style={reduce ? { scaleY: 1, height: "100%" } : { scaleY: lineScale, height: "100%" }}
          />

          <ol className="relative space-y-10 md:space-y-16">
            {(items.length ? items : Array.from({ length: 3 })).map((product, index) => {
              if (!product?._id) {
                return <li key={`sk-${index}`} className="h-40 animate-pulse rounded-2xl bg-line/40 md:mx-auto md:max-w-md" />;
              }

              const left = index % 2 === 0;
              const step = String(index + 1).padStart(2, "0");

              return (
                <motion.li
                  key={product._id}
                  className={`relative grid gap-4 pl-14 md:grid-cols-2 md:gap-12 md:pl-0 ${left ? "" : "md:[&>*:first-child]:order-2"}`}
                  initial={reduce ? false : { opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-12% 0px -12% 0px", amount: 0.35 }}
                  transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1], delay: reduce ? 0 : 0.08 }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-3 left-6 z-10 grid h-3 w-3 -translate-x-1/2 place-items-center md:left-1/2"
                  >
                    <motion.span
                      className="absolute h-7 w-7 rounded-full bg-ink/10"
                      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45 }}
                    />
                    <motion.span
                      className="relative h-3 w-3 rounded-full bg-ink ring-4 ring-paper"
                      initial={reduce ? false : { scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
                    />
                  </span>

                  <div className={`md:pt-1 ${left ? "md:pr-10 md:text-right" : "md:pl-10"}`}>
                    <p className="font-display text-sm tracking-[0.16em] text-ink-soft">{step}</p>
                    <p className="mt-1 text-[11px] tracking-[0.2em] uppercase text-ink/45">{product.category}</p>
                    <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                      <Link to={`/product/${product.slug}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </h3>
                    {product.shortDescription && (
                      <p className={`mt-3 text-sm leading-7 text-ink-soft ${left ? "md:ml-auto" : ""} md:max-w-sm`}>
                        {product.shortDescription}
                      </p>
                    )}
                    <p className="mt-4 font-display text-3xl">{formatPrice(product.price)}</p>
                    <Link
                      to={`/product/${product.slug}`}
                      className={`mt-4 inline-flex items-center gap-1.5 text-sm text-ink underline decoration-ink/30 underline-offset-4 ${left ? "md:flex-row-reverse" : ""}`}
                    >
                      View pack
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className={`group relative block overflow-hidden rounded-[28px] border border-line bg-ivory ${left ? "md:ml-2" : "md:mr-2"}`}
                  >
                    <div className="aspect-[5/4]">
                      {product.images?.[0]?.url ? (
                        <motion.img
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          initial={reduce ? false : { scale: 1.06, opacity: 0.7 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      ) : null}
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
