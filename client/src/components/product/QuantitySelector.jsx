import { Minus, Plus } from "lucide-react";

const orderCap = 20;

export function QuantitySelector({ value, max, onChange, label, disabled = false }) {
  const cap = Math.min(orderCap, Math.max(0, Math.floor(Number(max) || 0)));
  const locked = disabled || cap < 1;
  const quantity = Math.max(1, Number(value) || 1);

  function set(next) {
    if (locked) return;
    const digits = String(next).replace(/\D/g, "");
    const parsed = digits ? Number(digits) : 1;
    onChange(Math.min(cap, Math.max(1, parsed)));
  }

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-paper">
      <button
        type="button"
        aria-label={`Decrease quantity for ${label}`}
        disabled={locked || quantity <= 1}
        onClick={() => set(quantity - 1)}
        className="rounded-full p-2 text-ink disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <input
        aria-label={`Quantity for ${label}`}
        inputMode="numeric"
        value={locked ? value : quantity}
        disabled={locked}
        onChange={(event) => set(event.target.value)}
        className="w-8 bg-transparent text-center text-sm text-ink disabled:opacity-40"
      />
      <button
        type="button"
        aria-label={quantity >= cap && cap > 0 ? `Quantity for ${label} is at the maximum` : `Increase quantity for ${label}`}
        disabled={locked || quantity >= cap}
        onClick={() => set(quantity + 1)}
        className="rounded-full p-2 text-ink disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
