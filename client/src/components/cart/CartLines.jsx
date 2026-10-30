import { Link } from "react-router-dom";
import { QuantitySelector } from "../product/QuantitySelector";
import { SaveButton } from "../product/SaveButton";
import { UnitCost } from "../product/Price";
import { formatPrice } from "../../services/api";

export function CartLines({ items, setQuantity, removeItem }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 py-5">
          <Link to={`/product/${item.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-blush">
            {item.image ? (
              <img src={item.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
            ) : null}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/product/${item.slug}`} className="font-display text-2xl text-ink">
                {item.name}
              </Link>
              <SaveButton productId={item.id} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">{formatPrice(item.price)}</p>
            <UnitCost
              product={item}
              className="text-xs text-ink-soft"
            />
            <div className="mt-3 flex items-center gap-3">
              <QuantitySelector
                label={item.name}
                value={item.quantity}
                max={item.stock}
                onChange={(quantity) => setQuantity(item.id, quantity)}
              />
              <button type="button" onClick={() => removeItem(item.id)} className="text-sm underline">
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
