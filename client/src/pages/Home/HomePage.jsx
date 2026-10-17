import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Droplet, Feather, ShieldCheck, ShoppingBag } from "lucide-react";
import { Fragment, Suspense, lazy, useRef } from "react";
import { Link } from "react-router-dom";
import { MottoStrip } from "../../components/home/MottoStrip";
import { ClinicReel } from "../../components/home/ClinicReel";
import { PackFeatures } from "../../components/home/PackFeatures";
import { BuyerVoices } from "../../components/home/BuyerVoices";
import { RegularHalo, RegularStage } from "../../components/home/RegularStage";
import { CarryGlow, CarryNight } from "../../components/home/CarryStage";
import { PackStories } from "../../components/home/PackStories";
import { PadScanner } from "../../components/home/PadScanner";
import { KnowMoreBasics } from "../../components/home/KnowMoreBasics";
import { KnowCue } from "../../components/home/KnowCue";
import { WhyChooseSatin } from "../../components/home/WhyChooseSatin";
import { CareRange } from "../../components/home/CareRange";
import { useWideScreen } from "../../hooks/useWideScreen";
import { LoadError } from "../../components/product/CatalogStatus";
import { printedLines, printedQuestions } from "../../content/packCopy";
import { useCart } from "../../context/CartContext";
import { api, formatPrice } from "../../services/api";
import { DropText, Title, dropLine } from "../../components/motion/Title";

const bandOrder = ["satin-ultra-box", "satin-regular", "satin-ultra-pack-of-2", "satin-xl", "satin-ultra-xl-8"];

const loadModels = () => import("../../components/product/UltraBoxView");
const modelView = (name) => lazy(() => loadModels().then((module) => ({ default: module[name] })));

const bandModels = {
  "satin-ultra-box": modelView("UltraBoxView"),
  "satin-xl": modelView("PinkBoxView"),
  "satin-regular": modelView("RegularBoxView"),
  "satin-ultra-pack-of-2": modelView("CarryBoxView"),
  "satin-ultra-xl-8": modelView("UltraEightBoxView"),
};

// Placeholder sizes must match the canvas frames in UltraBoxView so the page does not jump.
const modelFrame = {
  lead: "mx-auto h-[min(78vh,700px)] w-full",
  band: "mx-auto h-[min(58vh,520px)] w-full",
  "satin-ultra-pack-of-2": "mx-auto h-[min(46vh,420px)] w-full lg:h-[min(58vh,540px)]",
};

const backdrops = {
  "satin-ultra-box": {
    image: "/hero/ultra-satin-bg.jpg",
    shade: "linear-gradient(90deg, rgba(10,48,70,0) 38%, rgba(10,48,70,0.62) 56%, rgba(10,48,70,0.35) 100%)",
    position: "center",
  },
  "satin-regular": {
    paint: [
      "radial-gradient(42% 60% at 74% 56%, rgba(232,76,160,0.42) 0%, rgba(232,76,160,0) 70%)",
      "radial-gradient(38% 50% at 8% 12%, rgba(150,96,240,0.26) 0%, rgba(150,96,240,0) 70%)",
      "radial-gradient(70% 45% at 74% 100%, rgba(18,2,24,0.55) 0%, rgba(18,2,24,0) 70%)",
      "linear-gradient(125deg, #2c0a33 0%, #4d1350 48%, #2a0930 100%)",
    ].join(", "),
  },
  "satin-ultra-pack-of-2": {
    paint: [
      "radial-gradient(38% 55% at 40% 52%, rgba(60,120,225,0.4) 0%, rgba(60,120,225,0) 70%)",
      "radial-gradient(30% 45% at 80% 40%, rgba(90,110,220,0.14) 0%, rgba(90,110,220,0) 70%)",
      "linear-gradient(180deg, #030a1a 0%, #081a3c 55%, #0b2552 100%)",
    ].join(", "),
  },
};

// The closing words of the band line, set in the accent colour with a swash under them.
const bandAccent = {
  "satin-regular": "bold moves.",
  "satin-xl": "bold moves.",
};

// Only lines printed on that pack.
const bandFeatures = {
  "satin-xl": [
    { icon: Feather, label: ["Soft", "absorbent"] },
    { icon: Droplet, label: ["High absorbency", "SAP granules"] },
    { icon: ShieldCheck, label: ["Pads", "with wings"] },
  ],
  "satin-regular": [
    { icon: Feather, label: ["Soft", "absorbent"] },
    { icon: Droplet, label: ["High absorbency", "SAP granules"] },
    { icon: ShieldCheck, label: ["Pads", "with wings"] },
  ],
  "satin-ultra-pack-of-2": [
    { icon: Droplet, label: ["3 times", "super absorbent"] },
    { icon: Feather, label: ["Ultra soft", "& thin"] },
    { icon: ShieldCheck, label: ["Pads", "with wings"] },
  ],
};

// Soft know-more lines on each pack band — literacy only, not medical claims.
const bandKnow = {
  "satin-ultra-xl-8": {
    topic: "PCOD",
    heading: "Heavier days · start with what’s printed on the pack",
    href: "#know-pcod",
    bullets: [
      "XL 8 is for days you want more absorbency — not a PCOD label from a search bar.",
      "Irregular or heavy-feeling cycles deserve a clinician; Satin stays with soft pads.",
    ],
  },
  "satin-ultra-box": {
    topic: "PCOS",
    heading: "Questions first · pads while you wait for real answers",
    href: "#know-pcos",
    bullets: [
      "Ultra is for comfort on bleeding days — it does not diagnose PCOS.",
      "Bring your questions to a clinician; bring this pack for the days you bleed.",
    ],
  },
  "satin-xl": {
    topic: "PMS",
    heading: "Softer hold for the days before it starts",
    href: "#know-pms",
    bullets: [
      "PMS days can feel tender or loud — XL is there when bleeding follows.",
      "If those days keep stopping school or sleep, ask a clinician — not a shop note.",
    ],
  },
  "satin-regular": {
    topic: "PMS",
    heading: "Everyday flow · everyday kindness",
    href: "#know-pms",
    bullets: [
      "Regular fits many ordinary bleeding days when you want soft and simple.",
      "Track mood and cramps if you like — patterns are for you, not for a label.",
    ],
  },
  "satin-ultra-pack-of-2": {
    topic: "UTI",
    heading: "Carry a spare when something feels off",
    href: "#know-uti",
    bullets: [
      "A tiny pack in your bag is for bleeding surprises — not for treating a UTI.",
      "Burning or urgency that won’t settle needs a clinician, not a scroll.",
    ],
  },
};

// While pinned, a box turns as the page scrolls; `spin` is that extra scroll in svh. Bands stick
// below the sticky pack nav (64px header + 64px nav).
const heroPin = { top: 64, spin: 85, stage: "top-16 h-[calc(100svh-4rem)]" };
const bandPin = { top: 128, spin: 150, stage: "top-32 h-[calc(100svh-8rem)]" };
const swash = {
  hidden: { width: 0 },
  show: { width: 320, transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 0.5 } },
};

const bandCopy = {
  "satin-xl": "Soft absorbent for bold moves.",
  "satin-regular": "Soft absorbent for bold moves.",
  "satin-ultra-pack-of-2": "Carry it with you.",
  "satin-ultra-box": "Ruko mat, Jee Bhar Ke Jee Lo.",
  "satin-ultra-xl-8": "Ruko mat, Jee Bhar Ke Jee Lo.",
};

const bandLines = {
  "satin-ultra-pack-of-2": ["Carry it", "with you."],
};

const bandTone = {
  "satin-xl": {
    wrap: "bg-[#f6ddd4] text-ink",
    solid: "bg-[#d4574e] text-white shadow-[0_14px_28px_-14px_rgba(196,71,62,0.85)]",
    ghost: "border border-[#e2b8ab] bg-white/60 text-ink backdrop-blur-md",
    accent: "text-[#c4473e]",
    badge: "border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.75),rgba(255,255,255,0.3))] text-[#c4473e] shadow-[0_10px_22px_-14px_rgba(160,60,50,0.6)] backdrop-blur-md",
  },
  "satin-regular": {
    wrap: "bg-[#3a0e40] text-ivory",
    solid: "bg-ivory text-[#5a1658] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]",
    ghost: "border border-ivory/40 bg-white/5 text-ivory",
    accent: "text-[#ff9fcf] [text-shadow:0_0_28px_rgba(255,120,190,0.55)]",
    badge: "border border-white/20 bg-white/10 text-[#ffd3ea]",
    halo: true,
  },
  "satin-ultra-pack-of-2": {
    wrap: "bg-[#0c2650] text-ivory",
    solid: "bg-ivory text-[#0c2650] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]",
    ghost: "border border-ivory/40 bg-white/5 text-ivory",
    badge: "border border-white/20 bg-white/10 text-[#cfe9ff]",
  },
  "satin-ultra-box": {
    wrap: "bg-teal text-ivory",
    solid: "bg-ivory text-teal",
    ghost: "border border-ivory/40 text-ivory",
  },
  "satin-ultra-xl-8": {
    wrap: "bg-[#d7eef8] text-ink",
    solid: "bg-ink text-ivory",
    ghost: "border border-ink/20 bg-white/70 text-ink",
  },
};

export function HomePage() {
  const reduce = useReducedMotion();
  const featured = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => (await api.get("/products", { params: { featured: "true", limit: 8 } })).data,
  });
  const featuredItems = featured.data?.items || [];
  const catalog = useQuery({
    queryKey: ["products", "home"],
    enabled: featured.isSuccess && featuredItems.length === 0,
    queryFn: async () => (await api.get("/products", { params: { limit: 8 } })).data,
  });
  const packs = featuredItems.length > 0 ? featuredItems : catalog.data?.items || [];
  const ordered = [
    ...bandOrder.map((slug) => packs.find((product) => product.slug === slug)).filter(Boolean),
    ...packs.filter((product) => !bandOrder.includes(product.slug)),
  ];
  const notes = useQuery({
    queryKey: ["blogs", "home"],
    queryFn: async () => (await api.get("/blogs", { params: { limit: 3 } })).data,
  });
  const reviews = useQuery({
    queryKey: ["reviews", "recent"],
    queryFn: async () => (await api.get("/reviews/recent")).data,
  });

  const rise = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <div>
      <KnowCue ready={ordered.length > 0} />
      {(featured.isLoading || catalog.isLoading) && ordered.length === 0 && (
        <section className="bg-teal text-ivory">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <p className="text-[11px] tracking-[0.28em] uppercase opacity-70">Women&apos;s hygiene</p>
            <Title as="h1" className="mt-4 max-w-xl font-display text-5xl leading-[0.95] font-medium sm:text-7xl">
              Ruko mat, Jee Bhar Ke Jee Lo.
            </Title>
            <p className="mt-6 text-sm">Loading packs…</p>
          </div>
        </section>
      )}
      {featured.isError && (
        <LoadError className="mx-auto mt-8 max-w-6xl" onRetry={() => featured.refetch()}>
          Packs could not be loaded.
        </LoadError>
      )}
      {catalog.isError && (
        <LoadError className="mx-auto mt-8 max-w-6xl" onRetry={() => catalog.refetch()}>
          Packs could not be loaded.
        </LoadError>
      )}
      {ordered[0] && <PackBand product={ordered[0]} index={0} lead reduce={reduce} rise={rise} />}
      {!featured.isLoading && !catalog.isLoading && <PackStories reduce={reduce} />}
      {ordered.length > 1 && (
        <nav aria-label="Packs" className="sticky top-16 z-30 border-b border-line/80 bg-ivory/95 backdrop-blur-md">
          <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3">
            {ordered.map((product) => (
              <li key={product._id} className="shrink-0">
                <a
                  href={`#pack-${product.slug}`}
                  className="inline-flex items-baseline gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink hover:border-ink"
                >
                  {product.name.replace(/^Satin\s+/i, "")}
                  <span className="text-ink-soft">{formatPrice(product.price)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {ordered.slice(1).map((product, index) => (
        <Fragment key={product._id}>
          <PackBand product={product} index={index + 1} reduce={reduce} rise={rise} />
          {product.slug === "satin-regular" && <MottoStrip reduce={reduce} />}
          {product.slug === "satin-ultra-pack-of-2" && <ClinicReel reduce={reduce} />}
          {product.slug === "satin-xl" && <PackFeatures reduce={reduce} />}
        </Fragment>
      ))}
      {catalog.isSuccess && ordered.length === 0 && <p className="mx-auto max-w-6xl px-5 py-16 text-ink-soft">No packs are listed yet.</p>}
      {featured.isSuccess && featuredItems.length === 0 && ordered.length > 0 && (
        <p className="mx-auto max-w-6xl px-5 pt-8 text-sm text-ink-soft">None are marked featured, so these are the packs on the shop.</p>
      )}

      <Reveal reduce={reduce} className="bg-paper text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-3">
          <div className="md:col-span-3">
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">How to choose</p>
            <Title as="h2" className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">The size and the count are printed on the pack.</Title>
          </div>
          {[
            ["Fit", "Use the size printed on that pack."],
            ["Count", "The number of pads is printed on that pack."],
            ["Length", "Pad length is not printed on the Ultra pack of 2 or the Ultra box."],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-ink/15 pt-5">
              <Title as="h3" className="font-display text-2xl">{title}</Title>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal reduce={reduce} className="bg-[#FFF3A8] text-ink">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink/55">On the packaging</p>
            <Title as="h2" className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Printed on the packs</Title>
            <p className="mt-6 max-w-sm text-sm leading-7 text-ink/65">
              Satin sells menstrual pads. Choose by the size and count printed on the pack. This shop does not publish medical advice.
            </p>
          </div>
          <ul className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
            {printedLines.map((line) => (
              <li key={line} className="border-t border-ink/15 py-5 text-sm leading-7 text-ink/80">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <WhyChooseSatin reduce={reduce} />

      <CareRange reduce={reduce} />

      <PadScanner packs={ordered} reduce={reduce} />

      <KnowMoreBasics reduce={reduce} />

      <BuyerVoices reviews={reviews} packs={ordered} reduce={reduce} />

      <Reveal reduce={reduce} className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Pack facts</p>
            <Title as="h2" className="mt-3 font-display text-4xl text-ink">Questions</Title>
            <div className="mt-6 border-t border-ink/15">
              {printedQuestions.map((item) => (
                <details key={item.q} className="group border-b border-line py-5">
                  <summary className="cursor-pointer list-none font-display text-2xl text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {item.q}
                      <span aria-hidden="true" className="mt-1 text-ink-soft transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
            <Link to="/faq" className="mt-5 inline-block text-sm text-ink underline">
              Read the questions
            </Link>
          </div>
        </div>
      </Reveal>

      {notes.data?.items?.length > 0 && (
        <Reveal reduce={reduce} className="bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="flex items-end justify-between gap-6">
              <Title as="h2" className="font-display text-4xl text-ink">Notes</Title>
              <Link to="/blogs" className="text-sm text-ink underline">
                All notes
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {notes.data.items.map((post) => (
                <li key={post.slug}>
                  <Link to={`/blogs/${post.slug}`} className="block h-full border border-line bg-ivory p-6 hover:border-ink">
                    <span className="font-display text-2xl text-ink">{post.title}</span>
                    {post.excerpt && <p className="mt-3 text-sm leading-6 text-ink-soft">{post.excerpt}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      <Reveal reduce={reduce} className="bg-[#fcd6d5] text-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-20 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">The shop</p>
            <Title as="h2" className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">Five packs, from the carry box to the XL 15.</Title>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-ivory">
            Shop all packs
            <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function PackBand({ product, index, lead = false, reduce, rise }) {
  const cart = useCart();
  const sectionRef = useRef(null);
  const tone = bandTone[product.slug] || bandTone["satin-xl"];
  const line = bandCopy[product.slug];
  const image = product.images?.[0];
  const flip = index % 2 === 0;
  const inStock = product.stock > 0;
  const Model = bandModels[product.slug];
  const Heading = lead ? motion.h1 : motion.h2;
  const backdrop = backdrops[product.slug];
  const accentWords = bandAccent[product.slug];
  const accent = accentWords && line?.endsWith(accentWords) ? accentWords : null;
  const features = bandFeatures[product.slug];
  const know = bandKnow[product.slug];
  const lines = bandLines[product.slug];
  const carry = product.slug === "satin-ultra-pack-of-2";
  const xl = product.slug === "satin-xl";
  const wide = useWideScreen();
  const pin = !reduce && wide && Boolean(Model);
  const stage = lead ? heroPin : bandPin;
  const soft = carry ? "text-[#b8d4ee]" : "opacity-80";

  function addToCart() {
    if (!inStock) return;
    cart.addItem(product, 1);
  }

  return (
    <section
      ref={sectionRef}
      id={`pack-${product.slug}`}
      className={`scroll-mt-28 ${tone.wrap}`}
      style={pin ? { height: `calc(100svh - ${stage.top}px + ${stage.spin}svh)` } : undefined}
    >
      <div
        className={`bg-cover bg-center ${tone.halo || carry || xl ? `isolate ${pin ? "" : "relative overflow-hidden"}` : ""} ${pin ? `sticky flex items-center overflow-hidden ${stage.stage}` : carry ? "lg:min-h-[calc(100svh-8rem)]" : ""}`}
        style={
          backdrop
            ? {
                backgroundImage: backdrop.paint || (backdrop.shade ? `${backdrop.shade}, url(${backdrop.image})` : `url(${backdrop.image})`),
                ...(backdrop.position ? { backgroundPosition: backdrop.position } : {}),
              }
            : undefined
        }
      >
        {tone.halo && <RegularStage word={product.category} reduce={reduce} sectionRef={sectionRef} />}
        {carry && <CarryNight reduce={reduce} sectionRef={sectionRef} />}
        <div
          className={
            carry && pin
              ? "absolute inset-0"
              : carry
                ? "relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-14"
                : `mx-auto grid w-full max-w-6xl items-center gap-8 px-5 lg:grid-cols-2 lg:gap-12 ${
                    lead ? "py-12 lg:min-h-[calc(100svh-4rem)] lg:py-10" : pin ? "py-4" : "py-16 lg:py-24"
                  }`
          }
        >
          <motion.div
            className={
              carry && pin
                ? "absolute top-1/2 right-[12vw] z-10 w-[min(26rem,32vw)] -translate-y-1/2"
                : carry
                  ? "order-2 mx-auto w-full max-w-md"
                  : `${xl ? "relative z-10" : ""} ${flip ? "lg:order-2" : ""} ${lead ? "xl:max-[1399px]:translate-x-16 min-[1400px]:translate-x-32" : ""} ${
                    product.slug === "satin-regular" ? "lg:-translate-x-4 xl:-translate-x-[clamp(40px,calc(12vw_-_150px),200px)]" : ""
                  }`
            }
            initial={reduce ? false : "hidden"}
            animate={lead && !reduce ? "show" : undefined}
            whileInView={lead || reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-80px" }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.p variants={rise} className="text-[11px] tracking-[0.28em] uppercase opacity-70">
              {product.category}
              {product.size ? ` · ${product.size}` : ""}
            </motion.p>
            <Heading
              variants={dropLine}
              className={`mt-4 max-w-xl font-display font-medium ${
                lines ? "text-5xl leading-[0.92] tracking-[-0.025em] sm:text-6xl lg:text-[4.5rem]" : lead ? "text-5xl leading-[0.98] sm:text-7xl" : "text-4xl leading-[1.05] sm:text-6xl"
              }`}
            >
              {lines ? (
                lines.map((part) => (
                  <span key={part} className="block">
                    <DropText text={part} reduce={reduce} />
                  </span>
                ))
              ) : accent ? (
                <>
                  <DropText text={line.slice(0, -accent.length)} reduce={reduce} />{" "}
                  <span className={tone.accent}>
                    <DropText text={accent} reduce={reduce} />
                  </span>
                </>
              ) : (
                <DropText text={line || product.name} reduce={reduce} />
              )}
            </Heading>
            {accent && (
              <motion.svg viewBox="0 0 320 22" aria-hidden="true" className={`mt-1 h-5 w-64 sm:w-80 ${tone.swash || tone.accent}`}>
                <clipPath id={`swash-${product.slug}`}>
                  <motion.rect x="0" y="0" width="320" height="22" variants={swash} />
                </clipPath>
                <path
                  d="M3 17 C 60 9, 150 5, 317 6 C 318.5 7.5, 316.5 8.6, 314 8.7 C 190 9.6, 100 13, 8 20.6 C 4 21.1, 1 19.2, 3 17 Z"
                  fill="currentColor"
                  clipPath={`url(#swash-${product.slug})`}
                />
              </motion.svg>
            )}
            <motion.p variants={rise} className={`mt-4 font-display ${carry ? "text-[1.65rem] leading-tight font-medium sm:text-[2rem]" : "text-2xl"}`}>
              {product.name}
            </motion.p>
            {product.shortDescription && (
              <motion.p variants={rise} className={`mt-3 max-w-md text-sm leading-6 ${soft}`}>
                {product.shortDescription}
              </motion.p>
            )}
            {know && (
              <motion.div variants={rise} className="mt-5 max-w-md">
                <p className={`text-[11px] tracking-[0.22em] uppercase ${soft}`}>{know.topic}</p>
                <p className="mt-2 flex gap-2 font-display text-lg leading-snug sm:text-xl">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-55" />
                  <span>{know.heading}</span>
                </p>
                <ul className={`mt-3 space-y-2 border-t border-current/15 pt-3 text-sm leading-6 ${soft}`}>
                  {know.bullets.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <a href={know.href} className={`mt-3 inline-flex items-center gap-1.5 text-sm underline decoration-current/30 underline-offset-4 hover:decoration-current ${soft}`}>
                  More on {know.topic}
                  <ArrowRight size={14} />
                </a>
              </motion.div>
            )}
            {features && (
              <motion.ul variants={rise} className="mt-6 flex divide-x divide-current/15">
                {features.map(({ icon: Icon, label }) => (
                  <li key={label.join(" ")} className="flex w-28 flex-col items-center px-3 text-center text-xs leading-5 first:pl-0">
                    <span className={`mb-2 grid h-11 w-11 place-items-center rounded-full ${tone.badge || "border border-current/35 bg-white/10"}`}>
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    {label.map((part) => (
                      <span key={part} className="block opacity-85">
                        {part}
                      </span>
                    ))}
                  </li>
                ))}
              </motion.ul>
            )}
            <motion.p variants={rise} className={`mt-6 text-sm ${soft}`}>
              {product.packSize ? `${product.packSize} pads` : product.size}
              <span className={`mt-1 block font-display opacity-100 ${carry ? "text-5xl text-white" : "text-4xl"}`}>{formatPrice(product.price)}</span>
            </motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
              <Link to={`/product/${product.slug}`} className={`inline-flex items-center gap-2 rounded-full text-sm ${carry ? "px-6 py-3" : "px-5 py-2.5"} ${tone.solid}`}>
                View pack
                <ArrowRight size={16} />
              </Link>
              <button type="button" disabled={!inStock} onClick={addToCart} className={`inline-flex items-center gap-2 rounded-full text-sm disabled:opacity-40 ${carry ? "px-6 py-3" : "px-5 py-2.5"} ${tone.ghost}`}>
                <ShoppingBag size={16} />
                {inStock ? "Add to cart" : "Out of stock"}
              </button>
            </motion.div>
          </motion.div>
          {(image?.url || Model) && (
            <Link
              to={`/product/${product.slug}`}
              aria-label={product.name}
              className={
                carry && pin
                  ? "group absolute top-[56%] left-[22%] z-10 isolate block w-[min(32rem,36vw)] origin-[50%_90%] -translate-y-1/2 scale-[1.22]"
                  : carry
                    ? "group relative isolate order-1 mx-auto block w-full max-w-md"
                    : `group block ${xl ? "relative isolate lg:origin-[46%_75%] lg:scale-[1.2]" : ""} ${flip ? "lg:order-1" : ""} ${lead ? "xl:-translate-x-20" : ""} ${product.slug === "satin-regular" ? "relative isolate lg:-mx-5 lg:translate-x-20 lg:translate-y-[56px] lg:scale-[1.12] xl:-mx-10 xl:translate-x-[clamp(0px,calc(19.7vw_-_260px),370px)]" : ""}`
              }
            >
              {tone.halo && <RegularHalo reduce={reduce} />}
              {carry && <CarryGlow reduce={reduce} />}
              {Model ? (
                <Suspense fallback={<div aria-hidden="true" className={modelFrame[product.slug] || (lead ? modelFrame.lead : modelFrame.band)} />}>
                  <Model sectionRef={sectionRef} reduce={reduce} lead={lead} pin={pin} pinTop={stage.top} pinSweep={lead ? Math.PI : Math.PI * 2} />
                </Suspense>
              ) : (
                <img
                  src={image.url}
                  alt={image.alt || product.name}
                  className="mx-auto h-[min(58vh,520px)] w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                />
              )}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Reveal({ reduce, children, className = "", delay = 0 }) {
  return (
    <motion.section
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.section>
  );
}
