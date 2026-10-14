import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LeadNote, NoteCard } from "../../components/blog/NoteCard";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { LoadError } from "../../components/product/CatalogStatus";
import { api } from "../../services/api";
import { DropText, dropLine } from "../../components/motion/Title";

export function BlogsPage() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get("q") || "";
  const [search, setSearch] = useState(urlQuery);
  const pushedQuery = useRef(urlQuery);
  const page = Math.max(1, Number(params.get("page")) || 1);

  useEffect(() => {
    if (urlQuery === pushedQuery.current) return;
    pushedQuery.current = urlQuery;
    setSearch(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search === pushedQuery.current) return;
      pushedQuery.current = search;
      setParams((current) => {
        const next = new URLSearchParams(current);
        if (search) next.set("q", search);
        else next.delete("q");
        next.delete("page");
        return next.toString() === current.toString() ? current : next;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setParams]);

  const posts = useQuery({
    queryKey: ["blogs", params.toString()],
    queryFn: async () => (await api.get("/blogs", { params: Object.fromEntries(params) })).data,
  });

  const filters = useQuery({
    queryKey: ["blog-filters"],
    queryFn: async () => (await api.get("/blogs/meta/filters")).data,
  });

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function clearAll() {
    pushedQuery.current = "";
    setSearch("");
    setParams({}, { replace: true });
  }

  const filtered = Boolean(params.get("q") || params.get("category") || params.get("tag"));
  const pages = posts.data?.pages || 0;
  const items = posts.isSuccess ? posts.data?.items || [] : [];
  const total = posts.data?.total;
  const category = params.get("category") || "";
  const showLead = items.length > 0 && page === 1 && !filtered;
  const [lead, ...rest] = showLead ? items : [null, ...items];

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink-soft">Journal</p>
        <div className="relative mt-3 inline-block">
          <motion.h1
            className="font-display text-[clamp(3.75rem,12vw,10rem)] leading-[0.9] font-medium tracking-[-0.02em]"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={dropLine}
          >
            <DropText text="Notes" reduce={reduce} />
          </motion.h1>
          {typeof total === "number" && total > 0 && (
            <motion.span
              aria-hidden="true"
              className="absolute -top-3 -right-10 bg-[#fbe6a8] px-4 py-2 text-[clamp(0.7rem,1.1vw,0.95rem)] font-semibold tracking-[0.14em] whitespace-nowrap uppercase shadow-[0_8px_16px_-8px_rgba(0,0,0,0.4)] sm:-right-20"
              initial={reduce ? false : { scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 8 }}
              transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.9 }}
            >
              {total === 1 ? "1 note" : `${total} notes`}
            </motion.span>
          )}
        </div>

        <div className="mt-10 rounded-[28px] border border-line bg-white/70 p-3 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search notes</span>
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-ink-soft" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes"
                className={`${field} w-full pr-4 pl-11`}
              />
            </label>
            <PillSelect label="Tag" value={params.get("tag") || ""} onChange={(value) => setFilter("tag", value)}>
              <option value="">All tags</option>
              {(filters.data?.tags || []).map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </PillSelect>
          </div>
          <div role="group" aria-label="Category" className="-mx-3 mt-3 flex gap-1.5 overflow-x-auto border-t border-line px-3 pt-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-2 sm:px-0">
            {["", ...(filters.data?.categories || [])].map((value) => {
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
                      layoutId="blog-category"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{value || "All notes"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {filters.isError && (
          <p className="mt-3 text-sm text-plum">
            Categories could not be loaded.{" "}
            <button type="button" className="underline" onClick={() => filters.refetch()}>
              Try again
            </button>
          </p>
        )}

        {filtered && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {posts.isSuccess && <p className="mr-2 text-sm text-ink-soft">{total === 1 ? "Showing 1 note" : `Showing ${total || 0} notes`}</p>}
            {["q", "category", "tag"]
              .filter((key) => params.get(key))
              .map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "q") {
                      pushedQuery.current = "";
                      setSearch("");
                    }
                    setFilter(key, "");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-sm text-ink transition hover:bg-blush/70"
                >
                  {params.get(key)}
                  <X size={14} aria-hidden="true" />
                  <span className="sr-only">Remove {params.get(key)}</span>
                </button>
              ))}
            <button type="button" onClick={clearAll} className="text-sm underline underline-offset-4">
              Clear all
            </button>
          </div>
        )}

        {posts.isLoading && (
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            <p className="sr-only">Loading articles…</p>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} aria-hidden="true">
                <div className="aspect-[4/3] animate-pulse rounded-[28px] bg-blush" />
                <div className="mt-5 h-4 w-24 animate-pulse rounded-full bg-blush" />
                <div className="mt-3 h-7 w-3/4 animate-pulse rounded-full bg-blush" />
              </div>
            ))}
          </div>
        )}
        {posts.isError && (
          <LoadError className="mt-8" onRetry={() => posts.refetch()}>
            Articles could not be loaded.
          </LoadError>
        )}
        {posts.isSuccess && items.length === 0 && (
          <div className="mt-10 rounded-[32px] bg-[#f8d6e3] px-8 py-16 text-center sm:py-20">
            <p className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight font-medium">{filtered ? "No articles match." : "No articles yet."}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {filtered ? (
                <button type="button" onClick={clearAll} className="rounded-full bg-ink px-6 py-3 text-sm text-paper">
                  Clear filters
                </button>
              ) : (
                <>
                  <Link to="/shop" className="rounded-full bg-ink px-6 py-3 text-sm text-paper transition hover:bg-ink/90">
                    Shop packs
                  </Link>
                  <Link to="/faq" className="rounded-full border border-ink px-6 py-3 text-sm text-ink transition hover:bg-ink hover:text-paper">
                    Read the FAQ
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {lead && (
          <div className="mt-10">
            <LeadNote post={lead} />
          </div>
        )}
        {rest.length > 0 && (
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, index) => (
              <NoteCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        )}

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
        className={`${field} w-full appearance-none pr-10 pl-4 text-ink lg:w-auto lg:min-w-[11rem]`}
      >
        {children}
      </select>
      <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-soft" />
    </label>
  );
}
