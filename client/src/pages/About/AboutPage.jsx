import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Building2, Factory, Globe, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { printedLines } from "../../content/packCopy";
import { useSettings } from "../../hooks/useSettings";
import { api, formatPrice } from "../../services/api";
import { DropText, dropLine, Title } from "../../components/motion/Title";

const rise = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};
const ease = [0.22, 1, 0.36, 1];
const tile = "bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]";
const heading = "font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-medium text-ink";
const slideMs = 3500;
const photos = [
  { src: "/stories/xl-photo.jpg", alt: "A woman winking and holding up a Satin XL pack", focus: "45% center" },
  { src: "/stories/pack-of-2-photo.jpg", alt: "A woman winking and pointing at a Satin Ultra pack of 2" },
  { src: "/stories/regular-photo.jpg", alt: "A woman winking and holding a Satin Regular pack" },
  { src: "/stories/ultra-8-photo.jpg", alt: "A woman winking and pointing at a Satin Ultra XL 8 box" },
];

function PhotoReel({ reduce }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    photos.slice(1).forEach(({ src }) => {
      new Image().src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % photos.length), slideMs);
    return () => clearInterval(timer);
  }, [index]);

  const photo = photos[index];
  return (
    <motion.figure
      className="relative mt-10 aspect-video overflow-hidden rounded-[32px] bg-[#f3d9de]"
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease, delay: 0.3 }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={photo.src}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9, ease: "easeInOut" }, scale: { duration: slideMs / 1000 + 1, ease: "easeOut" } }}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            fetchPriority={index === 0 ? "high" : undefined}
            className="absolute inset-0 h-full w-full object-cover"
            style={photo.focus ? { objectPosition: photo.focus } : undefined}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
        {photos.map((item, dot) => (
          <button
            key={item.src}
            type="button"
            aria-label={`Show photo ${dot + 1}`}
            aria-current={dot === index ? "true" : undefined}
            onClick={() => setIndex(dot)}
            className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/45 backdrop-blur"
          >
            {dot === index && (
              <motion.span
                key={index}
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                initial={{ width: reduce ? "100%" : "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: reduce ? 0 : slideMs / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.figure>
  );
}

export function AboutPage() {
  const reduce = useReducedMotion();
  const settings = useSettings();
  const products = useQuery({
    queryKey: ["products", "about"],
    queryFn: async () => (await api.get("/products", { params: { limit: 8 } })).data.items,
  });
  const support = settings.data?.support;
  const motionProps = (delay = 0) => (reduce ? {} : { ...rise, transition: { duration: 0.8, ease, delay } });

  const makers = [
    {
      icon: Building2,
      title: "Marketed by",
      text: support?.address || "Parivar Seva Sanstha, C-374, Defence Colony, New Delhi 110024",
    },
    {
      icon: Factory,
      title: "Manufactured by",
      text: "Nikhar Hygiene Products Pvt. Ltd., Kila No. 95// 1/1, 12/3, 19 and 22/1/1, Akbarpur Village, Barota, Sonipat, Haryana 131103.",
    },
  ];

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <article className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">About</p>
            <motion.h1
              className="mt-3 font-display text-[clamp(4.5rem,15vw,12rem)] leading-[0.85] font-medium tracking-[-0.03em]"
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={dropLine}
            >
              <DropText text="Satin" reduce={reduce} />
            </motion.h1>
          </div>
          <motion.div
            className="max-w-md lg:pb-4"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
          >
            <p className="font-display text-3xl leading-tight italic">Soft absorbent for bold moves.</p>
            <p className="mt-3 text-base leading-7 text-ink-soft">Satin is the registered trademark of Parivar Seva Sanstha.</p>
          </motion.div>
        </header>

        <PhotoReel reduce={reduce} />

        <section className="mt-20 grid gap-4 md:grid-cols-2">
          {makers.map(({ icon: Icon, title, text }, index) => (
            <motion.div key={title} {...motionProps(index * 0.1)} className="rounded-[28px] border border-line bg-white/65 p-7 backdrop-blur sm:p-9">
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-blush text-plum">
                <Icon size={22} />
              </span>
              <Title as="h2" className="mt-6 font-display text-3xl font-medium text-ink">
                {title}
              </Title>
              <p className="mt-3 max-w-md leading-7 text-ink-soft">{text}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Title as="h2" className={heading}>
              Printed lines
            </Title>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {printedLines.map((line, index) => (
              <motion.li key={line} {...motionProps(index * 0.06)} className="grid grid-cols-[3.5rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr]">
                <span className="font-display text-3xl font-medium text-rose sm:text-4xl">{String(index + 1).padStart(2, "0")}</span>
                <p className="pt-1.5 text-lg leading-8 text-ink">{line}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="mt-24">
          <div className="flex items-end justify-between gap-4">
            <Title as="h2" className={heading}>
              The packs
            </Title>
            <Link to="/shop" className="shrink-0 text-sm underline underline-offset-4">
              See all
            </Link>
          </div>
          {products.isLoading && <p className="mt-6 text-ink-soft">Loading packs…</p>}
          {products.isError && (
            <p className="mt-6 text-plum">
              Packs could not be loaded.{" "}
              <button type="button" className="underline" onClick={() => products.refetch()}>
                Try again
              </button>
            </p>
          )}
          {products.isSuccess && products.data.length === 0 && <p className="mt-6 text-ink-soft">No packs are listed yet.</p>}
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-5">
            {(products.data || []).map((product, index) => (
              <motion.li key={product.slug} {...motionProps((index % 5) * 0.06)}>
                <Link to={`/product/${product.slug}`} className="group block">
                  <div className={`relative aspect-square overflow-hidden rounded-[24px] ${tile}`}>
                    <span aria-hidden="true" className="absolute bottom-[13%] left-1/2 h-4 w-1/2 -translate-x-1/2 rounded-[50%] bg-[#3a2a2a]/20 blur-md" />
                    {product.images?.[0]?.url && (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain px-[12%] pt-[12%] pb-[20%] transition duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.05]"
                      />
                    )}
                    <span className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow-sm transition group-hover:opacity-100">
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 font-display text-xl leading-tight font-medium">{product.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {product.packSize ? `${product.packSize} pads` : product.size} · {formatPrice(product.price)}
                  </p>
                </Link>
              </motion.li>
            ))}
          </ul>
        </section>

        <motion.section {...motionProps()} className="mt-24 overflow-hidden rounded-[32px] bg-blush px-7 py-10 text-ink sm:px-12 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-plum">Customer care</p>
              {support ? (
                <ul className="mt-6 grid gap-4 text-lg">
                  <li className="flex items-center gap-3">
                    <Mail size={18} aria-hidden="true" className="text-plum" />
                    <a href={`mailto:${support.email}`} className="hover:underline">
                      {support.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={18} aria-hidden="true" className="text-plum" />
                    <span>
                      {support.phone}
                      {support.tollFree ? ` · Toll free ${support.tollFree}` : ""}
                    </span>
                  </li>
                  {support.website && (
                    <li className="flex items-center gap-3">
                      <Globe size={18} aria-hidden="true" className="text-plum" />
                      <a href={support.website} className="hover:underline">
                        {support.website.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-6 font-display text-4xl leading-tight">Soft absorbent for bold moves.</p>
              )}
            </div>
            <Link
              to="/shop"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-ink/90"
            >
              Shop Now
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </motion.section>
      </article>
    </div>
  );
}
