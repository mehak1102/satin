import { motion, useReducedMotion } from "framer-motion";
import { FileText, Truck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { PageHero } from "../../components/layout/PageHero";
import { StatePanel, panelClass } from "../../components/layout/StatePanel";
import { useSettings } from "../../hooks/useSettings";
import { formatPrice } from "../../services/api";

const copy = {
  shipping: {
    title: "Shipping",
    empty: "A shipping policy has not been published yet.",
  },
  returns: {
    title: "Returns",
    empty: "A returns policy has not been published yet.",
  },
  privacy: {
    title: "Privacy",
    empty: "A privacy policy has not been published yet.",
  },
  terms: {
    title: "Terms",
    empty: "Terms have not been published yet.",
  },
};

function blocks(text) {
  const result = [];
  let current = null;
  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      current = null;
    } else if (line.startsWith("## ")) {
      result.push({ type: "heading", text: line.slice(3).trim() });
      current = null;
    } else if (line.startsWith("- ")) {
      if (current?.type !== "list") result.push((current = { type: "list", items: [] }));
      current.items.push(line.slice(2).trim());
    } else {
      if (current?.type !== "text") result.push((current = { type: "text", lines: [] }));
      current.lines.push(line);
    }
  }
  return result.map((block) => (block.type === "text" ? { type: "text", text: block.lines.join("\n") } : block));
}

export function PolicyPage({ kind }) {
  const reduce = useReducedMotion();
  const page = copy[kind];
  const settings = useSettings();
  const shipping = settings.data?.shipping;
  const text = kind === "shipping" ? shipping?.summary || "" : settings.data?.[kind] || "";
  const methods = kind === "shipping" ? shipping?.methods || [] : [];

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <PageHero eyebrow="Policies" title={page.title} />

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {Object.entries(copy).map(([key, item]) => (
                <li key={key} className="shrink-0">
                  <NavLink
                    to={`/${key}`}
                    className={({ isActive }) =>
                      `block rounded-full px-5 py-2.5 text-sm font-medium transition ${isActive ? "bg-ink text-paper" : "border border-line bg-white/60 text-ink-soft hover:border-ink/40 hover:text-ink"}`
                    }
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <motion.article
            key={kind}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="min-w-0"
          >
            {settings.isLoading && (
              <div aria-busy="true" className={`${panelClass} space-y-4 p-6 sm:p-10`}>
                <p className="sr-only">Loading…</p>
                {[0, 1, 2, 3].map((key) => (
                  <div key={key} aria-hidden="true" className="h-4 animate-pulse rounded-full bg-blush/70" style={{ width: `${92 - key * 12}%` }} />
                ))}
              </div>
            )}
            {settings.isError && (
              <StatePanel icon={FileText} title="This page could not be loaded." text="Check the connection and try again." className="">
                <button type="button" className="rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper" onClick={() => settings.refetch()}>
                  Try again
                </button>
              </StatePanel>
            )}
            {settings.isSuccess && !text && methods.length === 0 && (
              <StatePanel icon={FileText} title={page.empty} text="Customer care can answer questions in the meantime." className="" />
            )}

            {methods.length > 0 && (
              <ul className="mb-6 grid gap-4 sm:grid-cols-2">
                {methods.map((method) => (
                  <li key={method.name} className={`${panelClass} p-6`}>
                    <p className="flex items-center gap-2 font-display text-2xl font-medium">
                      <Truck size={18} aria-hidden="true" className="text-plum" />
                      {method.name}
                    </p>
                    {method.description && <p className="mt-2 text-sm leading-6 text-ink-soft">{method.description}</p>}
                    <p className="mt-3 text-sm font-medium">
                      {formatPrice(method.price)}
                      {method.freeAbove != null ? <span className="font-normal text-ink-soft"> · free from {formatPrice(method.freeAbove)}</span> : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {text && (
              <div className={`${panelClass} p-6 sm:p-10`}>
                <div className="max-w-[68ch] space-y-5 leading-8 text-ink-soft">
                  {blocks(text).map((block, index) =>
                    block.type === "heading" ? (
                      <h2 key={index} className="pt-4 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight font-medium text-ink first:pt-0">
                        {block.text}
                      </h2>
                    ) : block.type === "list" ? (
                      <ul key={index} className="space-y-2 pl-1">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-plum" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={index} className="whitespace-pre-line">
                        {block.text}
                      </p>
                    ),
                  )}
                </div>
              </div>
            )}
          </motion.article>
        </div>
      </section>
    </div>
  );
}
