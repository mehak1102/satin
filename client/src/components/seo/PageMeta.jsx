import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pages = {
  "/": ["Satin — Soft absorbent for bold moves", "Satin sanitary pads. Soft absorbent for bold moves. Shop Regular, XL, and Ultra packs."],
  "/shop": ["Shop — Satin", "Shop Satin Regular, XL, and Ultra packs."],
  "/other-products": ["Beyond Satin — Satin", "Condoms and medicine from Parivar Seva, separate from Satin packs."],
  "/condoms": ["Condoms — Satin", "Stallion, Rider, Sawan, and Night Bliss. Prices as printed."],
  "/medicine": ["Medicine — Satin", "Contraception and iron tablets from Parivar Seva. Pack facts only."],
  "/about": ["Our story — Satin", "Satin is a trademark of Parivar Seva Sanstha."],
  "/blogs": ["Notes — Satin", "Journal notes from Satin."],
  "/faq": ["FAQ — Satin", "Questions about Satin packs and customer care."],
  "/contact": ["Contact — Satin", "Write to Satin customer care."],
  "/leave-notes": ["Leave the notes list — Satin", "Stop Satin product notes for an email on the list."],
  "/shipping": ["Shipping — Satin", "Shipping information for Satin."],
  "/returns": ["Returns — Satin", "Returns information for Satin."],
  "/privacy": ["Privacy — Satin", "Privacy information for Satin."],
  "/terms": ["Terms — Satin", "Terms for shopping at Satin."],
  "/cart": ["Cart — Satin", "Packs in your Satin cart."],
  "/checkout": ["Checkout — Satin", "Delivery and payment for your Satin order."],
  "/account": ["Account — Satin", "Sign in to your Satin account."],
  "/wishlist": ["Wishlist — Satin", "Packs saved to your Satin account."],
  "/forgot-password": ["Forgot password — Satin", "Request a link to choose a new Satin password."],
  "/reset-password": ["Reset password — Satin", "Choose a new password for your Satin account."],
};

export function clip(value, max = 160) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function setMeta(attr, key, content) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function PageMeta({ title, description, path, image, type = "website", robots = "" }) {
  useEffect(() => {
    const url = `${window.location.origin}${path || "/"}`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image || "");
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image || "");
    setCanonical(url);
  }, [title, description, path, image, type, robots]);

  return null;
}

export function RouteMeta() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/product/") || (pathname.startsWith("/blogs/") && pathname !== "/blogs")) return null;
  if (pathname.startsWith("/order/")) {
    return <PageMeta title="Order — Satin" description="Your Satin order." path={pathname} />;
  }
  const page = pages[pathname];
  if (!page) return null;
  return <PageMeta title={page[0]} description={page[1]} path={pathname} />;
}
