import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Title } from "../motion/Title";

const tile = "bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]";

export function noteMeta(post) {
  return [post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN") : "", post.readingMinutes ? `${post.readingMinutes} min read` : ""]
    .filter(Boolean)
    .join(" · ");
}

function Cover({ post, className }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] ${tile} ${className}`}>
      {post.coverImage?.url ? (
        <img
          src={post.coverImage.url}
          alt={post.coverImage.alt || ""}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 flex items-end p-6 font-display text-4xl text-ink/80 italic">
          {post.category}
        </span>
      )}
      <span className="absolute right-4 bottom-4 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:opacity-100">
        <ArrowUpRight size={17} aria-hidden="true" />
      </span>
    </div>
  );
}

function Tag({ post }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
      {post.featured && <span className="rounded-full bg-[#fbe6a8] px-2.5 py-1 text-ink">Featured</span>}
      {post.category && <span className="rounded-full bg-blush px-2.5 py-1 text-plum">{post.category}</span>}
    </p>
  );
}

export function LeadNote({ post }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="group"
      initial={reduce ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <Link to={`/blogs/${post.slug}`} className="grid gap-8 rounded-[32px] border border-line bg-white/60 p-4 backdrop-blur transition hover:bg-white/80 sm:p-5 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
        <Cover post={post} className="aspect-[16/10]" />
        <div className="px-2 pb-4 lg:pr-8 lg:pb-0">
          <Tag post={post} />
          <Title as="h2" className="mt-5 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-medium text-ink text-balance">
            {post.title}
          </Title>
          {post.excerpt && <p className="mt-4 line-clamp-4 leading-7 text-ink-soft">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-ink-soft">{noteMeta(post)}</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-ink underline underline-offset-4">
              Read note
              <ArrowUpRight size={15} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function NoteCard({ post, index = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="group"
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
    >
      <Link to={`/blogs/${post.slug}`} className="block">
        <Cover post={post} className="aspect-[4/3]" />
        <div className="mt-5">
          <Tag post={post} />
          <h3 className="mt-3 font-display text-[1.6rem] leading-tight font-medium text-ink transition group-hover:text-plum">{post.title}</h3>
          {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">{post.excerpt}</p>}
          <p className="mt-3 text-xs tracking-wide text-ink-soft">{noteMeta(post)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
