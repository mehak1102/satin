import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Title } from "../motion/Title";
import { AmbientVideo } from "../home/AmbientVideo";

const ease = [0.22, 1, 0.36, 1];

function MomentCta({ moment, className }) {
  const body = (
    <>
      {moment.cta}
      <ArrowRight size={16} aria-hidden="true" />
    </>
  );
  if (moment.href.startsWith("#")) {
    return (
      <a href={moment.href} className={className}>
        {body}
      </a>
    );
  }
  return (
    <Link to={moment.href} className={className}>
      {body}
    </Link>
  );
}

function MomentCopy({ moment, reduce, index, idPrefix, className = "", align = "left" }) {
  const onPanel = moment.layout === "split" || moment.layout === "split-reverse";
  const right = align === "right";
  const titleId = `${idPrefix}-${moment.key}`;
  const ctaClass = `mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition ${
    onPanel ? "bg-ink text-paper hover:bg-ink/90" : "bg-paper text-ink shadow-lg hover:bg-paper/95"
  } ${right ? "ml-auto" : ""}`;

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.65, ease, delay: index * 0.03 }}
    >
      <p className={`text-[11px] tracking-[0.28em] uppercase ${moment.soft}`}>{moment.kicker}</p>
      <Title
        as="h2"
        id={titleId}
        className={`mt-3 font-display text-4xl leading-[1.02] font-medium sm:text-5xl lg:text-[3.15rem] ${moment.text || "text-ink"} ${
          right ? "text-right" : ""
        }`}
      >
        {moment.title}
      </Title>
      <p className={`mt-5 max-w-md text-sm leading-7 sm:text-base ${moment.soft} ${right ? "ml-auto text-right" : ""}`}>
        {moment.body}
      </p>
      <MomentCta moment={moment} className={ctaClass} />
    </motion.div>
  );
}

/** Full-bleed video moment (split, cinematic, or overlay). */
export function MomentSection({ moment, reduce, index = 0, idPrefix = "moment" }) {
  if (moment.layout === "split" || moment.layout === "split-reverse") {
    const reverse = moment.layout === "split-reverse";
    const videoCol = (
      <div
        className="relative min-h-[min(52svh,440px)] w-full lg:min-h-0 lg:h-full"
        style={{ backgroundColor: moment.videoTint || "#1a1a1a" }}
      >
        <AmbientVideo src={moment.src} className="absolute inset-0 h-full w-full object-cover object-center" />
      </div>
    );
    const copyCol = (
      <div
        className={`flex items-center bg-gradient-to-br ${moment.panel} px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20 xl:px-20`}
      >
        <motion.div
          className="w-full max-w-md lg:max-w-lg"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease }}
        >
          <MomentCopy moment={moment} reduce={reduce} index={index} idPrefix={idPrefix} />
        </motion.div>
      </div>
    );

    return (
      <section
        aria-labelledby={`${idPrefix}-${moment.key}`}
        className="grid w-full overflow-hidden lg:h-[100svh] lg:min-h-[32rem] lg:grid-cols-2"
      >
        {reverse ? (
          <>
            <div className="order-2 lg:order-1">{copyCol}</div>
            <div className="order-1 lg:order-2">{videoCol}</div>
          </>
        ) : (
          <>
            {videoCol}
            {copyCol}
          </>
        )}
      </section>
    );
  }

  if (moment.layout === "cinematic") {
    return (
      <section
        aria-labelledby={`${idPrefix}-${moment.key}`}
        className="relative h-[100svh] min-h-[28rem] w-full overflow-hidden bg-neutral-950"
      >
        <AmbientVideo
          src={moment.src}
          className="absolute inset-0 h-full w-full object-cover"
          style={moment.videoPosition ? { objectPosition: moment.videoPosition } : undefined}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent lg:hidden"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-l from-black/80 via-black/40 to-transparent lg:block"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full items-end px-5 pb-12 sm:px-8 sm:pb-14 lg:items-center lg:justify-end lg:px-12 lg:pb-0 xl:px-16 2xl:px-20">
          <div className="w-full max-w-md lg:max-w-[26rem] lg:translate-y-[-4vh]">
            <MomentCopy moment={moment} reduce={reduce} index={index} idPrefix={idPrefix} align="left" />
          </div>
        </div>
      </section>
    );
  }

  const viewportTall = moment.fullViewport;

  return (
    <section aria-labelledby={`${idPrefix}-${moment.key}`} className="relative w-full overflow-hidden bg-neutral-950">
      <motion.div
        className={`relative w-full ${
          viewportTall ? "h-[100svh] min-h-[100svh]" : "min-h-[min(92svh,720px)] sm:min-h-[min(78svh,640px)]"
        }`}
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 0.55, ease }}
      >
        <AmbientVideo src={moment.src} className="absolute inset-0 h-full w-full object-cover" />
        {moment.overlay && (
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${moment.overlay}`} aria-hidden="true" />
        )}

        <motion.div
          className={`relative z-10 mx-auto flex h-full min-h-[inherit] max-w-6xl px-5 sm:px-8 ${
            viewportTall ? "items-center py-10 sm:py-12" : "py-14 sm:py-20"
          } ${moment.align || "justify-start"}`}
        >
          <div className="max-w-lg sm:max-w-md">
            <MomentCopy moment={moment} reduce={reduce} index={index} idPrefix={idPrefix} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}