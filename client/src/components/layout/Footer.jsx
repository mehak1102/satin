import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/useSettings";
import { Logo } from "../common/Logo";
import { NewsletterForm } from "../newsletter/NewsletterForm";
import { savedSocialLinks } from "./SocialLinks";
import { Title } from "../motion/Title";

const columns = [
  {
    title: "Shop",
    links: [
      ["All Packs", "/shop"],
      ["Regular", "/shop?category=Regular"],
      ["XL", "/shop?category=XL"],
      ["Ultra", "/shop?category=Ultra"],
      ["Condoms", "/shop?category=Condoms"],
      ["Contraception", "/shop?category=Contraception"],
    ],
  },
  {
    title: "Learn",
    links: [
      ["Our Story", "/about"],
      ["Blogs", "/blogs"],
      ["Period Tracker", "/tracker"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Contact", "/contact"],
      ["Shipping", "/shipping"],
      ["Returns", "/returns"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function Footer() {
  const settings = useSettings();
  const social = savedSocialLinks(settings.data?.social);

  return (
    <footer className="mt-20 border-t border-line bg-ink font-jost text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo className="h-20" withTagline light />
          <p className="mt-4 max-w-xs text-sm leading-6 text-paper/75">
            Soft absorbent pads for bold moves. Marketed by Parivar Seva Sanstha.
          </p>
          <p className="mt-4 text-sm text-paper/75">
            customercare@parivarseva.org
            <br />
            011-24335055 · Toll free 1800-123-7075
          </p>
        </div>
        {social.length > 0 && (
          <div>
            <Title as="h2" className="text-sm tracking-[0.16em] uppercase text-blush">Social</Title>
            <ul className="mt-4 space-y-2">
              {social.map(([label, url]) => (
                <li key={label}>
                  <a href={url} className="text-sm text-paper/80 hover:text-paper" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {columns.map((column) => (
          <div key={column.title}>
            <Title as="h2" className="text-sm tracking-[0.16em] uppercase text-blush">{column.title}</Title>
            <ul className="mt-4 space-y-2">
              {column.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-paper/80 hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <Title as="h2" className="text-3xl font-medium text-paper">Notes</Title>
          <p className="mt-2 max-w-md text-sm text-paper/75">Leave an email for product notes.</p>
          <div className="mt-4 max-w-sm">
            <NewsletterForm tone="dark" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-paper/60">
        Satin is the registered trademark of Parivar Seva Sanstha.
      </div>
    </footer>
  );
}
