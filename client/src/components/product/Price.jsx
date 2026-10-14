import { formatPrice } from "../../services/api";

export function hasComparePrice(price, compareAtPrice) {
  const compare = Number(compareAtPrice);
  return Number.isFinite(compare) && compare > Number(price);
}

export function Price({ price, compareAtPrice, className = "" }) {
  const compare = hasComparePrice(price, compareAtPrice);
  return (
    <p className={className}>
      <span>{formatPrice(price)}</span>
      {compare && (
        <>
          <span className="sr-only">, compare at </span>
          <span className="ml-2 text-ink-soft line-through">{formatPrice(compareAtPrice)}</span>
        </>
      )}
    </p>
  );
}
