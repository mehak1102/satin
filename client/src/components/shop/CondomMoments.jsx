import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AmbientVideo } from "../home/AmbientVideo";
import { Title } from "../motion/Title";

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

export function CondomMoments({ reduce }) {
  return (
    <>
      {/* Full-bleed hero — one screen tall */}
      <section aria-labelledby="condoms-hero-title" className="mt-10 w-full overflow-hidden lg:mt-12">
        <div className="relative h-[100svh] min-h-[28rem] w-full bg-neutral-950">
          <AmbientVideo
            src="/home/moments/moment-3.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "28% center" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15 lg:from-black/75 lg:via-black/30 lg:to-transparent" />
          <div className="relative z-10 mx-auto flex h-full min-h-[inherit] max-w-7xl items-end px-5 pb-12 sm:px-8 sm:pb-16 lg:items-center lg:justify-start lg:pb-0">
            <motion.div
              className="max-w-lg text-paper"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="text-[11px] tracking-[0.28em] uppercase text-paper/80">Beyond Satin pads</p>
              <Title as="h2" id="condoms-hero-title" className="mt-3 font-display text-4xl leading-[1.02] font-medium sm:text-5xl lg:text-[3.25rem]">
                Condoms — prices as printed
              </Title>
              <p className="mt-4 max-w-md text-sm leading-7 text-paper/88 sm:text-base">
                {lines.join(", ")}. Pack facts only — ask a clinician when you need guidance.
              </p>
              <a
                href="#condoms-grid"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-medium text-ink shadow-lg transition hover:bg-paper/95"
              >
                Shop packs
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </motion.div>
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
        panel="from-[#e8f0f6] to-[#dce8f2]"
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