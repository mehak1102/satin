import { formatPrice } from "../../services/api";

export function formatUnitPrice(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return formatPrice(0);
  const rounded = Math.round(value * 100) / 100;
  const options =
    Number.isInteger(rounded) ?
      { style: "currency", currency: "INR", maximumFractionDigits: 0 }
    : { style: "currency", currency: "INR", maximumFractionDigits: 2 };
  return new Intl.NumberFormat("en-IN", options).format(rounded);
}

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
  else if (category === "Condoms") unit = "condom";
  else if (category === "Nutrition") unit = "tablet";
  else if (/cycle/i.test(`${product.size || ""} ${product.name || ""}`)) unit = "cycle";
  else if (count === 1) unit = "pack";

  return { amount, unit, text: `${formatUnitPrice(amount)} per ${unit}` };
}

export function UnitCost({ product, className = "text-xs text-ink-soft" }) {
  const unit = unitCost(product);
  if (!unit) return null;
  return <p className={className}>{unit.text}</p>;
}

export function Price({ price, compareAtPrice, product, unitClassName, className = "" }) {
  const compare = hasComparePrice(price, compareAtPrice);
  return (
    <>
      <p className={className}>
        <span>{formatPrice(price)}</span>
        {compare && (
          <>
            <span className="sr-only">, compare at </span>
            <span className="ml-2 text-ink-soft line-through">{formatPrice(compareAtPrice)}</span>
          </>
        )}
      </p>
      {product && <UnitCost product={product} className={unitClassName ?? "mt-1 text-xs text-ink-soft"} />}
    </>
  );
}
