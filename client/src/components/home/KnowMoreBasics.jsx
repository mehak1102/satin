import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DropText, Title, dropLine } from "../motion/Title";

const topics = [
  {
    key: "pms",
    label: "PMS",
    title: "PMS days, held softly",
    lead: "Those pre-period days when everything sits closer to the skin.",
    href: "/blogs?category=PMS",
    cta: "Read the PMS note",
    wrap: "bg-[#f8e8e4] text-ink",
    bullets: [
      "Tender breasts, cramps, bloating, big feelings, or wanting quiet can show up before bleeding — or barely at all.",
      "Warmth on the belly, softer clothes, water nearby, and an earlier night are small kindnesses many people reach for.",
      "A few lines in a tracker (mood, sleep, cramps) can help you see your own weather over a couple of cycles.",
      "If those days keep you from school, work, or sleep again and again, please ask a clinician — Satin cannot diagnose PMS.",
    ],
  },
  {
    key: "pcod",
    label: "PCOD",
    title: "PCOD: you, not a Google list",
    lead: "When the letters keep showing up in your searches — go gently.",
    href: "/blogs?category=PCOD",
    cta: "Read the PCOD note",
    wrap: "bg-[#eef3e8] text-ink",
    bullets: [
      "PCOD is a short name people often use when talking about polycystic ovary related concerns.",
      "Online checklists are not the same as sitting with a clinician who has heard your full story.",
      "Before a visit, jot cycle timing, skin or hair changes, sleep, mood, and energy — your notes are a map, not a label.",
      "Satin will not invent causes, diets, or cures here. Soft pads and clear packs stay in our lane.",
    ],
  },
  {
    key: "pcos",
    label: "PCOS",
    title: "PCOS: questions first",
    lead: "For the nights the tabs stay open — put yourself, and real care, first.",
    href: "/blogs?category=PCOS",
    cta: "Read the PCOS note",
    wrap: "bg-[#e8eef6] text-ink",
    bullets: [
      "A doctor may discuss PCOS after listening to you and reviewing tests — social media lists are not a diagnosis.",
      "Irregular cycles, skin or hair worries, or questions that sit heavy on your chest deserve an unhurried appointment.",
      "Bring questions. Ask what a word means. “Something feels off with my periods” is enough to start.",
      "Between visits, choose the pad size that feels safe on bleeding days. Care belongs with a clinician, not a shop note.",
    ],
  },
  {
    key: "uti",
    label: "UTI",
    title: "When peeing hurts or won’t wait",
    lead: "A short, calm checklist — not a home diagnosis.",
    href: "/blogs?category=Issues",
    cta: "Read when something feels off",
    wrap: "bg-[#f3ebe3] text-ink",
    bullets: [
      "Burning, urgency, going often, or pain that won’t settle are reasons to ask for care — not to wait it out alone.",
      "A shop note cannot tell you if it is a UTI. Only a clinician can examine you and decide what you need.",
      "While you arrange care, rest when you can, stay hydrated, and tell someone you trust how you are feeling.",
      "Period pads are for menstrual bleeding. They are not treatment for a urinary infection.",
    ],
  },
];

export function KnowMoreBasics({ reduce }) {
  return (
    <div>
      <section aria-labelledby="know-more-basics-title" className="bg-paper text-ink">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Know more</p>
          <motion.h2
            id="know-more-basics-title"
            className="mt-4 max-w-2xl font-display text-4xl leading-[0.98] font-medium sm:text-6xl"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={dropLine}
          >
            <DropText text="Soft points for heavier days" reduce={reduce} />
          </motion.h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft">
            Short, kind bullets on PMS, PCOD, PCOS, and UTI care. Satin sells pads — this is literacy, not medical advice.
          </p>
        </div>
      </section>

      {topics.map((topic, index) => (
        <motion.section
          key={topic.key}
          id={`know-${topic.key}`}
          aria-labelledby={`know-${topic.key}-title`}
          className={topic.wrap}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, ease: "easeOut", delay: reduce ? 0 : Math.min(index * 0.04, 0.12) }}
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft">{topic.label}</p>
              <Title as="h3" id={`know-${topic.key}-title`} className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                {topic.title}
              </Title>
              <p className="mt-4 max-w-sm text-sm leading-7 text-ink-soft">{topic.lead}</p>
              <Link
                to={topic.href}
                className="mt-6 inline-flex items-center gap-2 text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
              >
                {topic.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
            <ul className="border-t border-ink/15">
              {topic.bullets.map((point) => (
                <li key={point} className="flex gap-3 border-b border-ink/15 py-4 text-sm leading-7 text-ink/90">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      ))}
    </div>
  );
}
