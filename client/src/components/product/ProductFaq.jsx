import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Title } from "../motion/Title";

export function ProductFaq({ specifications }) {
  const items = (specifications || []).filter((item) => item?.label && item?.value);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
      <div className="rounded-[32px] border border-line bg-white/55 p-5 backdrop-blur sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Title as="h2" className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-medium text-ink">
            On this pack
          </Title>
          <Link to="/faq" className="inline-flex items-center gap-1 text-sm text-ink underline underline-offset-4">
            Shop questions
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="min-w-0 rounded-[20px] bg-ivory px-4 py-4 sm:px-5">
              <dt className="text-[10px] tracking-[0.2em] uppercase text-ink-soft sm:text-[11px]">{item.label}</dt>
              <dd className="mt-1.5 text-sm leading-6 break-words text-ink sm:text-[15px]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
