import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LoadError } from "../product/CatalogStatus";
import { DropText, dropLine } from "../motion/Title";

const tones = [
  "bg-[#fbd3c4] text-[#1b1b18]",
  "bg-[#f8d6e3] text-[#1b1b18]",
  "bg-[#e3d6f5] text-[#1b1b18]",
  "bg-[#e9f2c4] text-[#1b1b18]",
  "bg-[#cfe2f0] text-[#1b1b18]",
  "bg-[#fbe6a8] text-[#1b1b18]",
];
const tilts = [-4, 3, -2, 4, -3, 2];
const drops = [18, 0, 26, 8, 20, 4];

function Stars({ rating }) {
  return (
    <div className="flex gap-1" aria-label={rating ? `${rating} of 5` : "No rating yet"}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={20} strokeWidth={1.6} className={n <= rating ? "fill-current" : "opacity-40"} />
      ))}
    </div>
  );
}

function Initial({ name }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 font-display text-lg font-medium text-[#6d294f]">
      {name.trim().charAt(0).toUpperCase() || "S"}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <>
      <Stars rating={review.rating} />
      <div className="mt-6 flex-1">
        {review.title && <p className="font-display text-xl leading-snug font-medium">{review.title}</p>}
        <p className="mt-2 line-clamp-6 text-[15px] leading-7 opacity-90">{review.comment}</p>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Initial name={review.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{review.name}</p>
          <Link to={`/product/${review.productSlug}`} className="text-xs underline-offset-2 opacity-70 hover:underline">
            {review.productName}
          </Link>
        </div>
      </div>
    </>
  );
}

function PackCard({ pack }) {
  return (
    <>
      <Stars rating={0} />
      <div className="mt-6 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase opacity-60">No notes yet</p>
        <p className="mt-3 font-display text-2xl leading-snug font-medium">{pack.name}</p>
        <p className="mt-3 text-[15px] leading-7 opacity-80">A note can be written on this pack after a paid order.</p>
      </div>
      <Link to={`/product/${pack.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
        View pack
        <ArrowRight size={16} />
      </Link>
    </>
  );
}

function CardFan({ items, reduce }) {
  const [active, setActive] = useState(null);

  return (
    <ul
      className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pt-6 pb-10 lg:mx-0 lg:justify-center lg:gap-0 lg:overflow-visible lg:px-0"
      onMouseLeave={() => setActive(null)}
    >
      {items.map((item, i) => {
        const spread = active === null || active === i ? 0 : i < active ? -36 : 36;
        return (
          <motion.li
            key={item.key}
            className={`flex h-[340px] w-[290px] shrink-0 snap-center flex-col rounded-[28px] p-7 shadow-[0_24px_40px_-28px_rgba(40,20,30,0.55)] lg:w-[310px] ${
              i > 0 ? "lg:-ml-14" : ""
            } ${tones[i % tones.length]}`}
            style={{ zIndex: active === i ? 20 : i }}
            initial={reduce ? { rotate: tilts[i % tilts.length] } : { opacity: 0, y: 120, rotate: tilts[i % tilts.length] }}
            whileInView={{ opacity: 1, y: drops[i % drops.length] }}
            animate={reduce ? undefined : { x: spread, scale: active === i ? 1.04 : 1, rotate: active === i ? 0 : tilts[i % tilts.length] }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ type: "spring", stiffness: 170, damping: 20, delay: active === null ? i * 0.08 : 0 }}
            onMouseEnter={() => setActive(i)}
          >
            {item.content}
          </motion.li>
        );
      })}
    </ul>
  );
}

const marquee = "Ruko mat, Jee Bhar Ke Jee Lo.";

function MarqueeRow({ outline, reverse, reduce }) {
  const words = Array.from({ length: 4 }, () => marquee);
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      >
        {[0, 1].map((copy) => (
          <span
            key={copy}
            aria-hidden={copy === 1 || outline ? "true" : undefined}
            className={`font-poster text-[clamp(4.5rem,10.5vw,10rem)] leading-[0.9] uppercase ${
              outline ? "text-transparent [-webkit-text-stroke:1.2px_#9a9893]" : "text-[#8f8d88]"
            }`}
          >
            {words.map((text, i) => (
              <span key={i} className="pr-[0.4em]">
                {text}
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function BuyerVoices({ reviews, packs, reduce }) {
  const list = reviews.data?.reviews ?? [];
  const items = list.length
    ? list.map((review) => ({ key: review.id, content: <ReviewCard review={review} /> }))
    : packs.map((pack) => ({ key: pack._id, content: <PackCard pack={pack} /> }));

  return (
    <section aria-labelledby="buyer-voices-title" className="overflow-hidden bg-ivory text-[#1b1b18]">
      <div className="px-5 pt-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="relative pb-4">
          <motion.h2
            id="buyer-voices-title"
            className="font-display text-[10.4vw] leading-[0.95] font-medium tracking-[-0.02em] whitespace-nowrap sm:text-[12vw]"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={dropLine}
          >
            <DropText text="What buyers say" reduce={reduce} />
          </motion.h2>
          <motion.span
            aria-hidden="true"
            className="absolute top-[104%] left-[34%] bg-[#fbe6a8] sm:top-[18%] sm:left-[14%] px-4 py-2 font-sans text-[clamp(0.7rem,1.2vw,1.05rem)] font-semibold tracking-[0.14em] uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.4)]"
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            whileInView={{ scale: 1, rotate: -8 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ type: "spring", stiffness: 240, damping: 13, delay: 1.2 }}
          >
            After a paid order
          </motion.span>
        </div>

        <div className="mt-14">
          {reviews.isError ? (
            <LoadError className="text-center" onRetry={() => reviews.refetch()}>
              Buyer notes could not be loaded.
            </LoadError>
          ) : (
            reviews.isSuccess && items.length > 0 && <CardFan items={items} reduce={reduce} />
          )}
        </div>
      </div>

      <div className="relative mt-16 pb-6">
        <MarqueeRow reduce={reduce} />
        <MarqueeRow outline reverse reduce={reduce} />
        <div className="absolute inset-0 grid place-items-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-5 rounded-full bg-[#14384c] px-10 py-4 font-poster text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none text-ivory uppercase shadow-[0_18px_34px_-18px_rgba(20,56,76,0.9)] transition-transform hover:scale-105"
          >
            Shop all packs
            <ArrowRight size={26} strokeWidth={2} />
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className="space-y-1.5 pb-1.5">
        {[0, 1, 2].map((line) => (
          <div key={line} className="h-[3px] bg-[#14384c]" />
        ))}
      </div>
    </section>
  );
}
