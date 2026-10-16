import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LeadNote, NoteCard } from "../../components/blog/NoteCard";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { periodBasicsTopics } from "../../content/periodBasics";
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
  const [basicsOpen, setBasicsOpen] = useState(true);
  const [otherOpen, setOtherOpen] = useState(true);

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

  const selected = useMemo(() => params.getAll("category").filter(Boolean), [params]);

  const posts = useQuery({
    queryKey: ["blogs", params.toString()],
    queryFn: async () => (await api.get(`/blogs?${params.toString()}`)).data,
  });

  const filters = useQuery({
    queryKey: ["blog-filters"],
    queryFn: async () => (await api.get("/blogs/meta/filters")).data,
  });

  const periodBasics = filters.data?.periodBasics || periodBasicsTopics.map((name) => ({ name, count: 0 }));
  const otherCategories = (filters.data?.categoryCounts || []).filter((item) => !periodBasicsTopics.includes(item.name));

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function toggleCategory(name) {
    const next = new URLSearchParams(params);
    next.delete("category");
    const chosen = selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name];
    for (const item of chosen) next.append("category", item);
    next.delete("page");
    setParams(next);
  }

  function clearAll() {
    pushedQuery.current = "";
    setSearch("");
    setParams({}, { replace: true });
  }

  const filtered = Boolean(params.get("q") || selected.length || params.get("tag"));
  const pages = posts.data?.pages || 0;
  const items = posts.isSuccess ? posts.data?.items || [] : [];
  const total = posts.data?.total;
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

        <div className="mt-8 rounded-[28px] border border-line bg-[#efe9f6]/70 px-5 py-6 sm:px-7">
          <p className="text-[11px] tracking-[0.22em] text-ink-soft uppercase">Period Basics</p>
          <p className="mt-2 max-w-2xl font-display text-2xl leading-tight font-medium sm:text-3xl">Know more</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">Topics you can browse and filter. Notes are assigned to a topic when they are written.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {periodBasicsTopics.map((topic) => {
              const active = selected.includes(topic);
              return (
                <li key={topic}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(topic)}
                    className={`rounded-full px-4 py-2 text-sm transition ${active ? "bg-ink text-paper" : "border border-ink/15 bg-white/80 text-ink hover:border-ink"}`}
                  >
                    {topic}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 rounded-[28px] border border-line bg-white/70 p-3 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur sm:p-4">
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
            {params.get("q") && (
              <Chip
                label={params.get("q")}
                onRemove={() => {
                  pushedQuery.current = "";
                  setSearch("");
                  setFilter("q", "");
                }}
              />
            )}
            {selected.map((name) => (
              <Chip key={name} label={name} onRemove={() => toggleCategory(name)} />
            ))}
            {params.get("tag") && <Chip label={params.get("tag")} onRemove={() => setFilter("tag", "")} />}
            <button type="button" onClick={clearAll} className="text-sm underline underline-offset-4">
              Clear all
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-[24px] border border-line bg-white/80 p-5 shadow-[0_18px_36px_-32px_rgba(20,56,76,0.55)]">
            <FilterGroup title="Period Basics" open={basicsOpen} onToggle={() => setBasicsOpen((value) => !value)}>
              {periodBasics.map((item) => (
                <CategoryCheck
                  key={item.name}
                  name={item.name}
                  count={item.count}
                  checked={selected.includes(item.name)}
                  onChange={() => toggleCategory(item.name)}
                />
              ))}
            </FilterGroup>

            {otherCategories.length > 0 && (
              <FilterGroup title="Other" open={otherOpen} onToggle={() => setOtherOpen((value) => !value)} className="mt-6 border-t border-line pt-5">
                {otherCategories.map((item) => (
                  <CategoryCheck
                    key={item.name}
                    name={item.name}
                    count={item.count}
                    checked={selected.includes(item.name)}
                    onChange={() => toggleCategory(item.name)}
                  />
                ))}
              </FilterGroup>
            )}

            {selected.length > 0 && (
              <button type="button" onClick={() => {
                const next = new URLSearchParams(params);
                next.delete("category");
                next.delete("page");
                setParams(next);
              }} className="mt-5 text-sm text-ink-soft underline underline-offset-4">
                Clear topics
              </button>
            )}
          </aside>

          <div>
            {posts.isLoading && (
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2" aria-busy="true">
                <p className="sr-only">Loading articles…</p>
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} aria-hidden="true">
                    <div className="aspect-[4/3] animate-pulse rounded-[28px] bg-blush" />
                    <div className="mt-5 h-4 w-24 animate-pulse rounded-full bg-blush" />
                    <div className="mt-3 h-7 w-3/4 animate-pulse rounded-full bg-blush" />
                  </div>
                ))}
              </div>
            )}
            {posts.isError && (
              <LoadError onRetry={() => posts.refetch()}>Articles could not be loaded.</LoadError>
            )}
            {posts.isSuccess && items.length === 0 && (
              <div className="rounded-[32px] bg-[#f8d6e3] px-8 py-16 text-center sm:py-20">
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
              <div>
                <LeadNote post={lead} />
              </div>
            )}
            {rest.length > 0 && (
              <div className={`${lead ? "mt-14" : ""} grid gap-x-8 gap-y-14 sm:grid-cols-2`}>
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
          </div>
        </div>
      </section>
    </div>
  );
}

const field = "rounded-full border border-line bg-paper py-3 text-sm transition focus-within:border-ink focus:outline-none";

function Chip({ label, onRemove }) {
  return (
    <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-sm text-ink transition hover:bg-blush/70">
      {label}
      <X size={14} aria-hidden="true" />
      <span className="sr-only">Remove {label}</span>
    </button>
  );
}

function FilterGroup({ title, open, onToggle, children, className = "" }) {
  return (
    <div className={className}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open}>
        <span className="font-display text-xl font-medium text-ink">{title}</span>
        <ChevronDown size={18} aria-hidden="true" className={`text-rose transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <ul className="mt-4 space-y-3">{children}</ul>}
    </div>
  );
}

function CategoryCheck({ name, count, checked, onChange }) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft transition hover:text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-4 shrink-0 rounded border-ink/30 text-ink focus:ring-ink/30"
        />
        <span className="flex-1 leading-5">
          {name} <span className="text-ink/45">({count})</span>
        </span>
      </label>
    </li>
  );
}

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
