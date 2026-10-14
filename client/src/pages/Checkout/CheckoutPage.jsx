import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, LockKeyhole, MapPin, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { Field, apiErrorMessage, inputClass } from "../../components/form/Field";
import { Notice } from "../../components/layout/FormShell";
import { PageHero } from "../../components/layout/PageHero";
import { StatePanel, panelClass, primaryButton } from "../../components/layout/StatePanel";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { loadRazorpay } from "../../lib/razorpay";
import { api, formatPrice } from "../../services/api";

const ease = [0.22, 1, 0.36, 1];

function Shell({ children }) {
  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">{children}</section>
    </div>
  );
}

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(8, "Enter a phone number").max(20),
  line1: z.string().trim().min(3, "Enter the address").max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.string().trim().min(2, "Enter the state").max(80),
  postalCode: z.string().trim().min(4, "Enter the PIN code").max(12),
});

const DRAFT_KEY = "satin-checkout-draft";

function readDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

function saveDraft(values) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // Without session storage the address simply has to be typed again.
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function CheckoutPage() {
  const reduce = useReducedMotion();
  const auth = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [payError, setPayError] = useState("");
  const [paying, setPaying] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const filled = useRef(false);

  const items = cart.items.map((item) => ({ productId: item.id, quantity: item.quantity }));
  const quote = useQuery({
    queryKey: ["checkout-quote", items],
    enabled: items.length > 0,
    queryFn: async () => (await api.post("/payments/quote", { items })).data.quote,
  });

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      ...readDraft(),
    },
  });

  const savedAddresses = auth.user?.addresses || [];

  useEffect(() => {
    if (!auth.user || filled.current) return;
    filled.current = true;
    const draft = readDraft();
    if (draft) {
      clearDraft();
      form.reset({ ...draft, email: draft.email || auth.user.email || "" });
      return;
    }
    const saved = savedAddresses.find((item) => item.isDefault) || savedAddresses[0];
    form.reset({
      fullName: saved?.fullName || auth.user.name || "",
      email: auth.user.email || "",
      phone: saved?.phone || auth.user.phone || "",
      line1: saved?.line1 || "",
      line2: saved?.line2 || "",
      city: saved?.city || "",
      state: saved?.state || "",
      postalCode: saved?.postalCode || "",
    });
    if (saved) setSelectedId(saved._id);
  }, [auth.user, form, savedAddresses]);

  if (cart.items.length === 0) {
    return (
      <Shell>
        <PageHero eyebrow="Checkout" title="Checkout" size="md" />
        <StatePanel icon={ShoppingBag} title="Nothing to check out." text="Add a pack to your cart first.">
          <Link to="/shop" className={primaryButton}>
            Shop now
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </StatePanel>
      </Shell>
    );
  }

  async function onSubmit(values) {
    setPayError("");
    if (!auth.user) {
      saveDraft(values);
      navigate("/account?next=/checkout");
      return;
    }
    setPaying(true);
    try {
      if (saveAddress && !selectedId) {
        const { data } = await api.post("/account/addresses", {
          fullName: values.fullName,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2 || "",
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: "India",
          isDefault: savedAddresses.length === 0,
        });
        queryClient.setQueryData(["me"], data.user);
        const added = data.user.addresses?.[data.user.addresses.length - 1];
        if (added?._id) setSelectedId(added._id);
        setSaveAddress(false);
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay could not be loaded.");

      const { data } = await api.post("/payments/create-order", {
        contactEmail: values.email,
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2 || "",
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: "India",
        },
        items,
      });
      const checkout = data.checkout;

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: checkout.keyId,
          amount: checkout.amount,
          currency: checkout.currency,
          order_id: checkout.razorpayOrderId,
          name: "Satin",
          description: checkout.orderNumber,
          prefill: {
            name: values.fullName,
            email: values.email,
            contact: values.phone,
          },
          theme: { color: "#14384c" },
          handler: async (response) => {
            try {
              await api.post("/payments/verify", {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              cart.clear();
              navigate(`/order/${checkout.orderId}`);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment was not completed.")),
          },
        });
        razorpay.on("payment.failed", () => reject(new Error("Payment failed.")));
        razorpay.open();
      });
    } catch (error) {
      setPayError(error?.response ? apiErrorMessage(error, "Payment could not be started.") : error.message);
    } finally {
      setPaying(false);
    }
  }

  function applySaved(address) {
    setSelectedId(address._id);
    setSaveAddress(false);
    form.reset({
      fullName: address.fullName,
      email: form.getValues("email") || auth.user?.email || "",
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    });
  }

  function useNewAddress() {
    setSelectedId("");
    form.reset({
      fullName: auth.user?.name || "",
      email: auth.user?.email || "",
      phone: auth.user?.phone || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
    });
  }

  const summary = quote.data;

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <Shell>
      <PageHero eyebrow="Checkout" title="Delivery" size="md">
        <p>Where should the order go? Payment opens in a secure Razorpay window.</p>
      </PageHero>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <motion.div {...rise(0.25)} className={`${panelClass} p-6 sm:p-9`}>
        {!auth.user && !auth.loading && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-[#f8d6e3] px-5 py-4">
            <p className="flex items-center gap-3 text-sm text-ink">
              <LockKeyhole size={16} aria-hidden="true" className="shrink-0 text-plum" />
              Sign in before paying. Your cart and the address you type stay on this device.
            </p>
            <Link to="/account?next=/checkout" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90">
              Sign in
            </Link>
          </div>
        )}
        {auth.user && savedAddresses.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl font-medium">Saved addresses</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {savedAddresses.map((address) => {
                const active = selectedId === address._id;
                return (
                  <button
                    key={address._id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => applySaved(address)}
                    className={`relative rounded-[22px] border p-4 pr-11 text-left text-sm transition ${active ? "border-ink bg-white shadow-sm" : "border-line bg-white/50 hover:border-ink/40"}`}
                  >
                    <span className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">
                      <MapPin size={13} aria-hidden="true" />
                      {address.label || "Home"}
                      {address.isDefault && <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] tracking-[0.12em] text-plum">Default</span>}
                    </span>
                    <span className="mt-2 block leading-6 text-ink">
                      {address.fullName}, {address.line1}, {address.city} {address.postalCode}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute top-4 right-4 grid h-5 w-5 place-items-center rounded-full border ${active ? "border-ink bg-ink text-paper" : "border-line bg-white"}`}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={!selectedId}
                onClick={useNewAddress}
                className={`flex min-h-24 items-center justify-center gap-2 rounded-[22px] border border-dashed p-4 text-sm font-medium transition ${!selectedId ? "border-ink bg-white text-ink" : "border-ink/25 text-ink-soft hover:border-ink/50 hover:text-ink"}`}
              >
                <Plus size={16} aria-hidden="true" />
                Use a different address
              </button>
            </div>
          </div>
        )}
        <h2 className="font-display text-2xl font-medium">{auth.user && savedAddresses.length > 0 ? "Deliver to" : "Delivery details"}</h2>
        <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-5 sm:grid-cols-2" noValidate>
          <Field label="Full name" error={form.formState.errors.fullName?.message}>
            <input autoComplete="name" className={inputClass} {...form.register("fullName")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
          </Field>
          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <input type="tel" autoComplete="tel" className={inputClass} {...form.register("phone")} />
          </Field>
          <Field label="PIN code" error={form.formState.errors.postalCode?.message}>
            <input autoComplete="postal-code" className={inputClass} {...form.register("postalCode")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address" error={form.formState.errors.line1?.message}>
              <input autoComplete="address-line1" className={inputClass} {...form.register("line1")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Apartment, floor (optional)" error={form.formState.errors.line2?.message}>
              <input autoComplete="address-line2" className={inputClass} {...form.register("line2")} />
            </Field>
          </div>
          <Field label="City" error={form.formState.errors.city?.message}>
            <input autoComplete="address-level2" className={inputClass} {...form.register("city")} />
          </Field>
          <Field label="State" error={form.formState.errors.state?.message}>
            <input autoComplete="address-level1" className={inputClass} {...form.register("state")} />
          </Field>
          {auth.user && !selectedId && (
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ink sm:col-span-2">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
                className="h-4 w-4 rounded border-line accent-ink"
              />
              Save this address to my account
            </label>
          )}
        </form>
      </motion.div>

      <motion.aside {...rise(0.35)} className={`${panelClass} p-6 sm:p-8 lg:sticky lg:top-28`} aria-labelledby="checkout-order">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="checkout-order" className="font-display text-3xl leading-none font-medium">
            Order
          </h2>
          <Link to="/cart" className="text-sm underline underline-offset-4">
            Edit cart
          </Link>
        </div>
        <ul className="mt-5 space-y-4 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]">
                {item.image ? <img src={item.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5" /> : null}
                <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-medium text-paper">
                  {item.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1 leading-5">{item.name}</span>
              <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        {quote.isLoading && (
          <div aria-hidden="true" className="mt-6 space-y-3 border-t border-line pt-5">
            <div className="h-4 animate-pulse rounded-full bg-blush/70" />
            <div className="h-8 animate-pulse rounded-full bg-blush/70" />
          </div>
        )}
        {quote.isError && (
          <p className="mt-5 text-sm text-plum">
            {apiErrorMessage(quote.error, "This cart could not be priced.")}{" "}
            <button type="button" className="underline" onClick={() => quote.refetch()}>
              Try again
            </button>
          </p>
        )}
        {summary && (
          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <Row label="Subtotal" value={formatPrice(summary.subtotal)} />
            <Row label={summary.shippingName ? `Shipping, ${summary.shippingName}` : "Shipping"} value={formatPrice(summary.shipping)} />
            <Row label="Tax" value={formatPrice(summary.tax)} />
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-3xl font-medium">{formatPrice(summary.total)}</dd>
            </div>
          </dl>
        )}
        {payError && (
          <div className="mt-5">
            <Notice tone="error">{payError}</Notice>
          </div>
        )}
        <button type="submit" form="checkout-form" disabled={paying || quote.isLoading || !summary} className={`${primaryButton} mt-6 w-full`}>
          <LockKeyhole size={16} aria-hidden="true" />
          {paying ? "Opening payment…" : `Pay ${summary ? formatPrice(summary.total) : ""}`}
        </button>
        <p className="mt-4 text-xs leading-5 text-ink-soft">The total is calculated on the server from current pack prices. Card details stay with Razorpay.</p>
      </motion.aside>
      </div>
    </Shell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
