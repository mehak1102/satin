import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AmbientVideo } from "../home/AmbientVideo";
import { DropText, dropLine, Title } from "../motion/Title";

const ease = [0.22, 1, 0.36, 1];

const lines = ["Stallion", "Rider", "Sawan", "Night Bliss"];

function SplitStory({ id, src, kicker, title, body, reverse, videoTint = "#e8e4e0", panel = "from-[#eaf3f9] to-[#dce8f2]", objectPosition, reduce }) {
  const videoCol = (
    <div className="relative min-h-[min(52svh,440px)] w-full min-w-0 md:min-h-0 md:h-full" style={{ backgroundColor: videoTint }}>
      <AmbientVideo
        src={src}
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
  const copyCol = (
    <div className={`flex min-h-[min(40svh,360px)] min-w-0 items-center bg-gradient-to-br ${panel} px-6 py-12 sm:px-10 sm:py-14 md:min-h-0 md:h-full lg:px-12 lg:py-16 xl:px-16`}>
      <motion.div
        className="w-full max-w-md lg:max-w-lg"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease }}
      >
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">{kicker}</p>
        <Title as="h2" id={id} className="mt-3 font-display text-3xl leading-[1.05] font-medium sm:text-4xl lg:text-[2.35rem]">
          {title}
        </Title>
        <p className="mt-5 text-sm leading-7 text-ink-soft sm:text-base">{body}</p>
        <a
          href="#condoms-grid"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          Browse packs
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </motion.div>
    </div>
  );

  return (
    <section aria-labelledby={id} className="w-full overflow-hidden border-y border-line">
      <div className="grid min-h-0 grid-cols-1 md:grid-cols-2 md:min-h-[min(72svh,640px)]">
        {reverse ? (
          <>
            <div className="min-w-0 md:order-1">{copyCol}</div>
            <div className="min-w-0 md:order-2">{videoCol}</div>
          </>
        ) : (
          <>
            <div className="min-w-0">{videoCol}</div>
            <div className="min-w-0">{copyCol}</div>
          </>
        )}
      </div>
    </section>
  );
}

export function CondomMoments({ reduce, total }) {
  return (
    <>
      {/* Full-bleed hero — page title lives on the video */}
      <section aria-labelledby="condoms-hero-title" className="relative w-full overflow-hidden">
        <div className="relative min-h-[100svh] w-full bg-neutral-950">
          <AmbientVideo
            src="/home/moments/moment-3.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "22% center" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-black/25 lg:bg-gradient-to-l lg:from-black/82 lg:via-black/45 lg:to-black/15" />

          <div className="relative z-10 flex min-h-[100svh] flex-col px-5 pt-6 pb-12 sm:px-8 sm:pt-8 sm:pb-16 lg:pb-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm text-paper/90 transition hover:text-paper"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Back to Satin packs
              </Link>
              <Link
                to="/medicine"
                className="text-sm text-paper/85 underline-offset-4 transition hover:text-paper hover:underline"
              >
                Medicine instead
              </Link>
            </div>

            <div className="mt-auto flex w-full flex-1 items-end justify-end lg:items-center">
              <motion.div
                className="flex w-full max-w-2xl flex-col items-end gap-7 text-right text-paper sm:gap-10 lg:max-w-3xl lg:pr-[clamp(1.5rem,6vw,4.5rem)]"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
              >
                <div className="space-y-4">
                  <p className="text-xs tracking-[0.4em] uppercase text-paper/85 sm:text-[0.8125rem]">Beyond Satin pads</p>
                  <p className="text-[11px] tracking-[0.32em] uppercase text-paper/75 sm:text-xs">{lines.join(" · ")}</p>
                </div>
                <div className="relative self-end">
                  <motion.h1
                    id="condoms-hero-title"
                    className="font-display text-[clamp(3.25rem,10vw,6.75rem)] leading-[1.05] font-medium tracking-[0.04em] bg-gradient-to-br from-paper via-[#f6ebe3] to-[#e8c9d4] bg-clip-text text-transparent"
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    variants={dropLine}
                  >
                    <DropText text="Condoms" reduce={reduce} />
                  </motion.h1>
                  {typeof total === "number" && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute -top-1 -right-2 bg-[#d9e8f4] px-3 py-1.5 font-sans text-[clamp(0.65rem,1vw,0.85rem)] font-semibold tracking-[0.14em] text-ink uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.45)] sm:-right-10"
                      initial={reduce ? false : { scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.7 }}
                    >
                      {total === 1 ? "1 item" : `${total} items`}
                    </motion.span>
                  )}
                </div>
                <p className="max-w-lg text-lg leading-[1.9] tracking-[0.05em] text-paper/90 sm:text-xl sm:leading-9 lg:max-w-xl">
                  Prices as printed on the pack. Pack facts only — ask a clinician when you need guidance.
                </p>
                <a
                  href="#condoms-grid"
                  className="mt-1 inline-flex items-center gap-2.5 rounded-full border-2 border-ink/35 bg-[#d9e8f4] px-8 py-3.5 text-base font-medium tracking-[0.06em] text-ink shadow-[0_12px_32px_-8px_rgba(20,56,76,0.45)] transition hover:border-ink/55 hover:bg-[#c5dce8]"
                >
                  Shop packs
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <motion.div
          className="mx-auto mt-10 flex max-w-7xl flex-wrap items-end justify-between gap-3 px-5 sm:px-8 lg:mt-12"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">The line</p>
            <Title as="h2" id="condoms-stories-title" className="mt-2 font-display text-3xl font-medium sm:text-4xl">
              Carry it. Choose it. Live it.
            </Title>
          </div>
          <a href="#condoms-grid" className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            Jump to all packs
          </a>
        </motion.div>

      <SplitStory
        reduce={reduce}
        id="condom-story-carry"
        src="/home/moments/moment-2.mp4"
        kicker="On the go"
        title="Carry a pack with you"
        body="Compact counts for bags and drawers — Stallion, Rider, Sawan, and Night Bliss as printed on the pack."
        videoTint="#d4a0b0"
      />

      <SplitStory
        reduce={reduce}
        id="condom-story-steady"
        src="/home/moments/moment-1.mp4"
        kicker="Everyday rhythm"
        title="Close moments, clear choices"
        body="Pick the line and count that match what’s on the shelf. Pack facts only — ask a clinician when you need guidance."
        reverse
        panel="from-[#f6f0e8] to-[#ebe4db]"
      />

      <motion.div
        className="mx-auto mt-10 max-w-7xl px-5 sm:px-8 lg:mt-12"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.55, ease }}
      >
      {/* Facts + brands */}
      <section
        aria-labelledby="condoms-facts-title"
        className="rounded-[28px] border border-line bg-gradient-to-br from-[#d9e8f4] to-[#e8f0f6] px-6 py-8 sm:px-10 sm:py-10"
      >
        <Title as="h2" id="condoms-facts-title" className="sr-only">
          Condom lines on this shop
        </Title>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <ul className="flex flex-wrap gap-2">
            {lines.map((name) => (
              <li
                key={name}
                className="rounded-full border border-ink/10 bg-paper/80 px-4 py-2 text-sm font-medium text-ink backdrop-blur"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-7 text-ink-soft">
            This shop lists pack names, counts, and prices as printed. It does not publish medical advice — speak with a clinician
            when you need guidance.
          </p>
        </div>
      </section>
      </motion.div>
    </>
  );
}