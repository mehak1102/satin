import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatPrice } from "../../services/api";

export function NavSearch({ onClose }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const results = useQuery({
    queryKey: ["nav-search", query],
    enabled: query.length >= 2,
    queryFn: async () => (await api.get("/products", { params: { q: query, limit: 4 } })).data,
  });

  function openShop(event) {
    event.preventDefault();
    const next = term.trim();
    navigate(next ? `/shop?q=${encodeURIComponent(next)}` : "/shop");
    onClose();
  }

  const items = results.data?.items || [];

  return (
    <div className="border-t border-line bg-paper px-5 py-4">
      <form role="search" onSubmit={openShop} className="mx-auto flex max-w-6xl gap-3">
        <label className="sr-only" htmlFor="nav-search">
          Search products
        </label>
        <input
          id="nav-search"
          autoFocus
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          placeholder="Search packs"
          className="w-full rounded-full border border-line bg-ivory px-4 py-3"
        />
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm text-paper">
          Search
        </button>
      </form>
      {query.length >= 2 && (
        <div className="mx-auto mt-4 max-w-6xl">
          {results.isLoading && <p className="text-sm text-ink-soft">Searching…</p>}
          {results.isError && (
            <p className="text-sm text-plum">
              Search could not be loaded.{" "}
              <button type="button" className="underline" onClick={() => results.refetch()}>
                Try again
              </button>
            </p>
          )}
          {results.isSuccess && items.length === 0 && <p className="text-sm text-ink-soft">No products found.</p>}
          {items.length > 0 && (
            <ul className="divide-y divide-line">
              {items.map((product) => (
                <li key={product._id}>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3"
                  >
                    <span className="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-blush">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl text-ink">{product.name}</span>
                      {product.size && <span className="block text-sm text-ink-soft">{product.size}</span>}
                    </span>
                    <span className="text-sm text-ink">{formatPrice(product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {results.isSuccess && results.data.total > items.length && (
            <button type="button" onClick={openShop} className="mt-3 text-sm underline">
              See all results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
