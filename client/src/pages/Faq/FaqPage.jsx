import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Mail, Phone, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { printedQuestions } from "../../content/packCopy";
import { useSettings } from "../../hooks/useSettings";
import { formatPrice } from "../../services/api";
import { DropText, dropLine, Title } from "../../components/motion/Title";

const slug = (title) => `faq-${title.toLowerCase()}`;

export function FaqPage() {
  const reduce = useReducedMotion();
  const settings = useSettings();
  const [term, setTerm] = useState("");
  const [active, setActive] = useState("");
  const support = settings.data?.support;
  const shipping = settings.data?.shipping;
  const hasShipping = Boolean(shipping?.summary || shipping?.methods?.length);
  const hasReturns = Boolean(settings.data?.returns?.trim());
  const method = shipping?.methods?.[0];

  let shippingAnswer = "Shipping shows the wording saved for this shop.";
  if (settings.isSuccess) {
    if (hasShipping) shippingAnswer = "The current wording is on the Shipping page.";
    else if (method?.name) {
      shippingAnswer = `No shipping policy is published yet. Checkout uses ${method.name} at ${formatPrice(method.price || 0)}.`;
    } else {
      shippingAnswer = "No shipping policy is published yet. Checkout uses the shipping amount saved in settings.";
    }
  }

  const groups = [
    {
      title: "Products",
      items: [
        {
          q: "Who markets Satin?",
          a: support
            ? `Satin is the registered trademark of Parivar Seva Sanstha. ${support.address}`
            : "Satin is the registered trademark of Parivar Seva Sanstha.",
        },
        ...printedQuestions,
      ],
    },
    {
      title: "Usage",
      items: [
        {
          q: "How do I choose a pack?",
          a: "Use the size and the count printed on the pack. Pad length is not printed on the Ultra pack of 2 or the Ultra box.",
        },
      ],
    },
    {
      title: "Orders",
      items: [
        {
          q: "Where are my orders?",
          a: "Paid orders are listed in your account.",
        },
      ],
    },
    {
      title: "Shipping",
      items: [{ q: "Is a shipping policy published?", a: shippingAnswer }],
    },
    {
      title: "Payments",
      items: [
        {
          q: "How is payment taken?",
          a: "Checkout takes payment through Razorpay. Card numbers are not stored on this shop.",
        },
      ],
    },
    {
      title: "Returns",
      items: [
        {
          q: "Is a returns policy published?",
          a: settings.isSuccess
            ? hasReturns
              ? "The current wording is on the Returns page."
              : "No returns policy is published yet."
            : "Returns shows the wording saved for this shop.",
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          q: "How do I reach customer care?",
          a: support
            ? `${support.email}, ${support.phone}${support.tollFree ? `, toll free ${support.tollFree}` : ""}.`
            : "Customer care details load from store settings.",
        },
      ],
    },
  ];

  const needle = term.trim().toLowerCase();
  const shown = groups
    .map((group) => ({
      ...group,
      items: needle ? group.items.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(needle)) : group.items,
    }))
    .filter((group) => group.items.length);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const shownKey = shown.map((group) => group.title).join("|");

  useEffect(() => {
    const sections = shownKey
      .split("|")
      .filter(Boolean)
      .map((title) => document.getElementById(slug(title)))
      .filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [shownKey]);

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">FAQ</p>
        <div className="relative mt-3 inline-block">
          <motion.h1
            className="font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] font-medium tracking-[-0.02em]"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={dropLine}
          >
            <DropText text="Questions" reduce={reduce} />
          </motion.h1>
          <motion.span
            aria-hidden="true"
            className="absolute -top-3 -right-4 bg-[#fbe6a8] px-4 py-2 text-[clamp(0.7rem,1.1vw,0.95rem)] font-semibold tracking-[0.14em] uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.4)] sm:-right-16"
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.9 }}
          >
            {total} answers
          </motion.span>
        </div>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
          Answers below are taken from the packs, from this shop, or from what has been published.
        </p>

        <label className="relative mt-8 block max-w-xl">
          <span className="sr-only">Search questions</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 z-10 -translate-y-1/2 text-ink-soft" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search questions"
            className="w-full rounded-full border border-line bg-white/75 py-4 pr-12 pl-12 text-sm shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur transition outline-none focus:border-ink"
          />
          {term && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setTerm("")}
              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full p-2 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </label>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="FAQ topics" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
              {shown.map((group) => {
                const id = slug(group.title);
                const current = (active || slug(shown[0].title)) === id;
                return (
                  <li key={group.title} className="shrink-0">
                    <a
                      href={`#${id}`}
                      onClick={() => setActive(id)}
                      className={`relative flex items-center justify-between gap-3 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors lg:py-2.5 ${
                        current ? "text-paper" : "border border-line bg-white/60 text-ink hover:border-ink lg:border-transparent lg:bg-transparent lg:hover:bg-ink/5"
                      }`}
                    >
                      {current && (
                        <motion.span
                          layoutId="faq-topic"
                          className="absolute inset-0 rounded-full bg-ink"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{group.title}</span>
                      <span className={`relative text-xs tabular-nums ${current ? "text-paper/70" : "text-ink-soft"}`}>{group.items.length}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 space-y-14">
            {shown.length === 0 && (
              <div className="rounded-[28px] bg-[#f8d6e3] px-8 py-14 text-center">
                <p className="font-display text-3xl font-medium">No questions match “{term.trim()}”.</p>
                <button type="button" onClick={() => setTerm("")} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-paper">
                  Clear search
                </button>
              </div>
            )}
            {shown.map((group) => (
              <section key={group.title} id={slug(group.title)} className="scroll-mt-28">
                <Title as="h2" className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-medium">
                  {group.title}
                </Title>
                <div className="mt-6 space-y-3">
                  {group.items.map((item) => (
                    <Item key={item.q} question={item.q} answer={item.a} reduce={reduce} />
                  ))}
                </div>
              </section>
            ))}

            <p className="text-sm leading-6 text-ink-soft">
              Pack sizes and prices are on each{" "}
              <Link to="/shop" className="underline underline-offset-4">
                product
              </Link>
              . Shipping and returns wording is on those pages when it has been saved.
            </p>

            <div className="rounded-[32px] bg-blush px-7 py-9 sm:px-10 sm:py-11">
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div>
                  <p className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] leading-tight font-medium">Still have a question?</p>
                  {support && (
                    <ul className="mt-5 grid gap-3">
                      <li className="flex items-center gap-3">
                        <Mail size={17} aria-hidden="true" className="text-plum" />
                        <a href={`mailto:${support.email}`} className="hover:underline">
                          {support.email}
                        </a>
                      </li>
                      <li className="flex items-center gap-3">
                        <Phone size={17} aria-hidden="true" className="text-plum" />
                        <span>
                          {support.phone}
                          {support.tollFree ? ` · Toll free ${support.tollFree}` : ""}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-ink/90"
                >
                  Contact
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Item({ question, answer, reduce }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-[24px] border transition-colors duration-300 ${
        open ? "border-transparent bg-white shadow-[0_24px_44px_-34px_rgba(20,56,76,0.55)]" : "border-line bg-white/55 hover:bg-white/80"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left sm:px-7"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-display text-xl leading-snug font-medium sm:text-[1.4rem]">{question}</span>
        <motion.span
          aria-hidden="true"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${open ? "bg-ink text-paper" : "bg-blush text-plum"}`}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
        >
          <Plus size={17} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl px-6 pb-6 leading-7 text-ink-soft sm:px-7">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
