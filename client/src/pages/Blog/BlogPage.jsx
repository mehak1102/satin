import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NoteCard } from "../../components/blog/NoteCard";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { clip, PageMeta } from "../../components/seo/PageMeta";
import { api } from "../../services/api";
import { DropText, dropLine, Title } from "../../components/motion/Title";

const ease = [0.22, 1, 0.36, 1];

export function BlogPage() {
  const { slug } = useParams();
  const reduce = useReducedMotion();
  const post = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => (await api.get(`/blogs/${slug}`)).data,
  });

  if (post.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16" aria-busy="true">
        <p className="sr-only">Loading article…</p>
        <div aria-hidden="true" className="mx-auto h-5 w-28 animate-pulse rounded-full bg-blush" />
        <div aria-hidden="true" className="mx-auto mt-6 h-14 w-4/5 animate-pulse rounded-full bg-blush" />
        <div aria-hidden="true" className="mt-12 aspect-[16/9] animate-pulse rounded-[32px] bg-blush" />
      </div>
    );
  }
  if (post.isError) {
    const missing = post.error?.response?.status === 404;
    return (
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Title as="h1" className="font-display text-4xl text-ink">{missing ? "Article not found" : "This note could not be loaded"}</Title>
        {missing ? (
          <Link to="/blogs" className="mt-4 inline-block text-sm underline">
            Back to notes
          </Link>
        ) : (
          <p className="mt-4 text-plum">
            Check the connection and try again.{" "}
            <button type="button" className="underline" onClick={() => post.refetch()}>
              Try again
            </button>
          </p>
        )}
      </section>
    );
  }

  const article = post.data.blog;
  const opening = (article.content || "").trimStart().split("\n")[0];
  const dropCap = /^\p{L}/u.test(opening) && opening.length >= 80;
  const related = post.data.related || [];
  const meta = [
    article.authorName,
    article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-IN") : "",
    article.readingMinutes ? `${article.readingMinutes} min read` : "",
  ].filter(Boolean);

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <article className="mx-auto max-w-7xl px-5 pt-8 pb-20 text-ink sm:px-8 lg:pt-10">
        <PageMeta
          title={`${article.title} — Satin`}
          description={clip(article.excerpt || article.content || article.title)}
          path={`/blogs/${article.slug}`}
          image={article.coverImage?.url || ""}
          type="article"
        />
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-soft">
          <Link to="/blogs" className="inline-flex items-center gap-1 rounded-full border border-line bg-white/60 py-1.5 pr-3.5 pl-2 transition hover:border-ink hover:text-ink">
            <ChevronLeft size={15} aria-hidden="true" />
            Notes
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink">{article.title}</span>
        </nav>

        <header className="mx-auto mt-12 max-w-4xl text-center">
          {article.category && (
            <span className="inline-block rounded-full bg-blush px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-plum uppercase">{article.category}</span>
          )}
          <motion.h1
            className="mt-6 font-display text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[0.98] font-medium tracking-[-0.02em] text-balance"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={dropLine}
          >
            <DropText text={article.title} reduce={reduce} />
          </motion.h1>
          <motion.div
            className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-ink-soft"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.6 }}
          >
            {meta.length > 0 && <span>{meta.join(" · ")}</span>}
            <ShareButton title={article.title} />
          </motion.div>
        </header>

        {article.coverImage?.url && (
          <motion.figure
            className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]"
            initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.4 }}
          >
            <img src={article.coverImage.url} alt={article.coverImage.alt || ""} decoding="async" className="w-full object-contain" />
          </motion.figure>
        )}

        <div className="mx-auto mt-14 max-w-2xl">
          {article.excerpt && <p className="font-display text-2xl leading-snug text-ink italic sm:text-[1.65rem]">{article.excerpt}</p>}
          <div
            className={`whitespace-pre-wrap text-lg leading-8 text-ink-soft ${
              dropCap
                ? "first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-ink"
                : ""
            } ${article.excerpt ? "mt-10 border-t border-line pt-10" : ""}`}
          >
            {article.content}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="flex items-end justify-between gap-4 border-t border-line pt-14">
            <Title as="h2" className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-medium text-ink">
              Related notes
            </Title>
            <Link to="/blogs" className="shrink-0 text-sm underline underline-offset-4">
              All notes
            </Link>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <NoteCard key={item.slug} post={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm text-ink transition hover:border-ink"
    >
      {copied ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
