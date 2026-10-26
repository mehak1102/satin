import { formatPrice } from "../../services/api";

export function hasComparePrice(price, compareAtPrice) {
  const compare = Number(compareAtPrice);
  return Number.isFinite(compare) && compare > Number(price);
}

const padCategories = new Set(["Regular", "XL", "Ultra"]);

export function unitCost(product) {
  const price = Number(product?.price);
  const count = Number(product?.packSize);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isInteger(count) || count < 1) return null;

  const printed = (product.specifications || []).find((item) => /unit price/i.test(item.label || ""));
  const printedAmount = printed ? Number(String(printed.value).replace(/[^\d.]/g, "")) : NaN;
  const amount = Number.isFinite(printedAmount) && printedAmount > 0 ? printedAmount : price / count;
  const category = product.category || "";
  let unit = "piece";
  if (padCategories.has(category)) unit = "pad";
  else if (category === "Nutrition") unit = "tablet";
  else if (/cycle/i.test(`${product.size || ""} ${product.name || ""}`)) unit = "cycle";
  else if (count === 1) unit = "pack";

  return { amount, unit, text: `${formatPrice(amount)} per ${unit}` };
}

export function UnitCost({ product, className = "text-xs text-ink-soft" }) {
  const unit = unitCost(product);
  if (!unit) return null;
  return <p className={className}>{unit.text}</p>;
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
