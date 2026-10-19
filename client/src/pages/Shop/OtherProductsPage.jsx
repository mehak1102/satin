import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LoadError, PackGridSkeleton } from "../../components/product/CatalogStatus";
import { ProductCard } from "../../components/product/ProductCard";
import { api, formatPrice } from "../../services/api";
import { DropText, dropLine } from "../../components/motion/Title";
import { LeafShadows } from "../../components/decor/LeafShadows";

const sorts = [
  ["featured", "Featured"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["newest", "Newest"],
  ["rating", "Rating"],
];

const otherCategories = ["Condoms", "Contraception"];

export function OtherProductsPage() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const urlMin = params.get("minPrice") || "";
  const urlMax = params.get("maxPrice") || "";
  const [search, setSearch] = useState(urlQuery);
  const [minPrice, setMinPrice] = useState(urlMin);
  const [maxPrice, setMaxPrice] = useState(urlMax);
  const pushedQuery = useRef(urlQuery);
  const pushedPrice = useRef(`${urlMin}|${urlMax}`);

  useEffect(() => {
    if (urlQuery === pushedQuery.current) return;
    pushedQuery.current = urlQuery;
    setSearch(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search === pushedQuery.current) return;
      pushedQuery.current = search;
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (search) next.set("q", search);
          else next.delete("q");
          next.delete("page");
          return next.toString() === current.toString() ? current : next;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setParams]);

  useEffect(() => {
    const incoming = `${urlMin}|${urlMax}`;
    if (incoming === pushedPrice.current) return;
    pushedPrice.current = incoming;
    setMinPrice(urlMin);
    setMaxPrice(urlMax);
  }, [urlMin, urlMax]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextPair = `${minPrice}|${maxPrice}`;
      if (nextPair === pushedPrice.current) return;
      pushedPrice.current = nextPair;
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (minPrice !== "" && Number(minPrice) >= 0) next.set("minPrice", minPrice);
          else next.delete("minPrice");
          if (maxPrice !== "" && Number(maxPrice) >= 0) next.set("maxPrice", maxPrice);
          else next.delete("maxPrice");
          next.delete("page");
          return next.toString() === current.toString() ? current : next;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice, setParams]);

  const query = useQuery({
    queryKey: ["products", "other", params.toString()],
    queryFn: async () => {
      const { data } = await api.get("/products", {
        params: { ...Object.fromEntries(params), line: "other", limit: 48 },
      });
      return data;
    },
  });

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  const page = Math.max(1, Number(params.get("page")) || 1);
  const pages = query.data?.pages || 0;
  const items = query.data?.items || [];
  const sortValue = params.get("sort") || "";
  const category = params.get("category") || "";
  const total = query.data?.total;

  const chips = [
    params.get("q") ? ["q", params.get("q")] : null,
    category ? ["category", category] : null,
    params.get("minPrice") ? ["minPrice", `From ${formatPrice(params.get("minPrice"))}`] : null,
    params.get("maxPrice") ? ["maxPrice", `Up to ${formatPrice(params.get("maxPrice"))}`] : null,
    sortValue ? ["sort", sorts.find(([value]) => value === sortValue)?.[1] || sortValue] : null,
  ].filter(Boolean);

  function clearAll() {
    pushedQuery.current = "";
    setSearch("");
    pushedPrice.current = "|";
    setMinPrice("");
    setMaxPrice("");
    setParams({}, { replace: true });
  }

  function clearChip(key) {
    if (key === "q") {
      pushedQuery.current = "";
      setSearch("");
    }
    setFilter(key, "");
  }

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-ink-soft transition hover:text-ink">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Satin packs
        </Link>
        <p className="mt-6 text-[11px] tracking-[0.28em] uppercase text-ink-soft">Other products</p>
        <div className="relative mt-3 inline-block">
          <motion.h1
            className="font-display text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.92] font-medium tracking-[-0.02em]"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={dropLine}
          >
            <DropText text="Care beyond Satin" reduce={reduce} />
          </motion.h1>
          {typeof total === "number" && (
            <motion.span
              aria-hidden="true"
              className="absolute -top-2 -right-4 bg-[#d9e8f4] px-3 py-1.5 font-sans text-[clamp(0.65rem,1vw,0.85rem)] font-semibold tracking-[0.14em] uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.35)] sm:-right-12"
              initial={reduce ? false : { scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.85 }}
            >
              {total === 1 ? "1 item" : `${total} items`}
            </motion.span>
          )}
        </div>
        <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">
          Condoms and contraception from Parivar Seva — prices as printed. Ask a clinician for medical products.
        </p>

        <div className="mt-10 rounded-[28px] border border-line bg-white/70 p-3 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search products</span>
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-soft" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name"
                className={`${field} w-full pr-4 pl-11`}
              />
            </label>
            <PillSelect
              label="Sort"
              value={params.get("sort") || "featured"}
              onChange={(value) => setFilter("sort", value === "featured" ? "" : value)}
            >
              {sorts.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </PillSelect>
            <div className={`${field} flex items-center gap-2 px-4 text-ink-soft`}>
              <span aria-hidden="true">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                aria-label="Lowest price in rupees"
                placeholder="From"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="w-full min-w-0 bg-transparent text-ink outline-none lg:w-16"
              />
              <span aria-hidden="true">–</span>
              <span aria-hidden="true">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                aria-label="Highest price in rupees"
                placeholder="Up to"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="w-full min-w-0 bg-transparent text-ink outline-none lg:w-16"
              />
            </div>
          </div>
          <div role="group" aria-label="Category" className="-mx-3 mt-3 flex gap-1.5 overflow-x-auto border-t border-line px-3 pt-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-2 sm:px-0">
            {["", ...otherCategories].map((value) => {
              const active = category === value;
              return (
                <button
                  key={value || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter("category", value)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors sm:px-5 ${active ? "text-paper" : "text-ink hover:bg-ink/5"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="other-category"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{value || "All other"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex min-h-8 flex-wrap items-center gap-2">
          {query.isSuccess && (
            <p className="mr-2 text-sm text-ink-soft">
              {query.data.total === 1 ? "Showing 1 product" : `Showing ${query.data.total} products`}
            </p>
          )}
          {chips.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => clearChip(key)}
              className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-sm text-ink transition hover:bg-blush/70"
            >
              {label}
              <X size={14} aria-hidden="true" />
              <span className="sr-only">Remove {label}</span>
            </button>
          ))}
          {chips.length > 0 && (
            <button type="button" onClick={clearAll} className="text-sm underline underline-offset-4">
              Clear all
            </button>
          )}
        </div>

        {query.isLoading && <PackGridSkeleton count={6} />}
        {query.isError && <LoadError onRetry={() => query.refetch()}>These products could not load.</LoadError>}
        {query.isSuccess && items.length === 0 && (
          <div className="mt-10 rounded-[28px] bg-[#d9e8f4] px-8 py-14 text-center">
            <p className="font-display text-3xl font-medium">No products match these filters.</p>
            <button type="button" onClick={clearAll} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-paper">
              Clear filters
            </button>
          </div>
        )}
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
        {pages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-3 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setFilter("page", page <= 2 ? "" : String(page - 1))}
              className="rounded-full border border-line px-5 py-2.5 transition hover:border-ink disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-ink-soft">
              Page {page} of {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setFilter("page", String(page + 1))}
              className="rounded-full border border-line px-5 py-2.5 transition hover:border-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="text-sm text-ink-soft">Looking for Satin pads?</p>
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
            Shop Satin packs
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

const field = "rounded-full border border-line bg-paper py-3 text-sm transition focus-within:border-ink focus:outline-none";

function PillSelect({ label, value, onChange, children }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${field} w-full appearance-none pr-10 pl-4 text-ink sm:w-auto sm:min-w-[11rem]`}
      >
        {children}
      </select>
      <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-soft" />
    </label>
  );
}
