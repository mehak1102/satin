import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { PageHero } from "../../components/layout/PageHero";
import { primaryButton, secondaryButton } from "../../components/layout/StatePanel";
import { PageMeta } from "../../components/seo/PageMeta";

const links = [
  ["/shop", "Shop", "All Satin packs"],
  ["/faq", "FAQ", "Common questions"],
  ["/blogs", "Blog", "Articles and guides"],
  ["/contact", "Contact", "Write to the team"],
];

export function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="relative isolate overflow-hidden">
      <PageMeta
        title="Page not found — Satin"
        description="This Satin page is not available."
        path={pathname}
        robots="noindex"
      />
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <PageHero eyebrow="Error 404" title="Page not found" sticker="404">
          <p>This address is not part of the shop. It may have moved, or the link may be mistyped.</p>
        </PageHero>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/shop" className={primaryButton}>
            Shop now
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/" className={secondaryButton}>
            Home
          </Link>
        </div>
        <ul className="mt-16 grid gap-4 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {links.map(([to, label, text]) => (
            <li key={to}>
              <Link to={to} className="group flex items-center justify-between gap-4 rounded-[22px] border border-line bg-white/60 px-5 py-4 backdrop-blur transition hover:border-ink/40 hover:bg-white">
                <span>
                  <span className="block font-display text-xl font-medium">{label}</span>
                  <span className="text-sm text-ink-soft">{text}</span>
                </span>
                <ArrowRight size={17} aria-hidden="true" className="text-ink-soft transition group-hover:translate-x-1 group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
