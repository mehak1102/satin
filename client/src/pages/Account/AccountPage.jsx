import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarHeart, ChevronRight, Heart, LayoutDashboard, LogOut, MapPin, Package, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { Field, apiErrorMessage, inputClass } from "../../components/form/Field";
import { PageHero } from "../../components/layout/PageHero";
import { StatePanel, panelClass, primaryButton, secondaryButton } from "../../components/layout/StatePanel";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../hooks/useTracker";
import { formatDay } from "../../lib/cycle";
import { api, formatPrice } from "../../services/api";

const ease = [0.22, 1, 0.36, 1];
const smallButton =
  "inline-flex w-fit items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-40";
const headingClass = "font-display text-[clamp(1.85rem,3vw,2.5rem)] leading-none font-medium";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(72),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export function AccountPage() {
  const auth = useAuth();

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        {auth.loading ? (
          <div aria-busy="true">
            <p className="sr-only">Loading account…</p>
            <div aria-hidden="true">
              <div className="h-3 w-24 animate-pulse rounded-full bg-blush" />
              <div className="mt-5 h-20 w-2/3 max-w-lg animate-pulse rounded-3xl bg-blush" />
              <div className="mt-12 h-80 animate-pulse rounded-[28px] bg-white/60" />
            </div>
          </div>
        ) : auth.user ? (
          <SignedIn user={auth.user} onLogout={auth.logout} />
        ) : (
          <SignedOut auth={auth} />
        )}
      </section>
    </div>
  );
}

function SignedOut({ auth }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("login");
  const login = mode === "login";

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
      <div>
        <PageHero eyebrow="Account" title={login ? "Welcome back" : "Join Satin"} size="md">
          <p>
            {login
              ? "Sign in to see your orders, saved addresses and wishlist."
              : "An account keeps your orders, delivery addresses and saved packs in one place."}
          </p>
        </PageHero>
        <ul className="mt-10 hidden max-w-md space-y-4 lg:block">
          {[
            [Package, "Order history and status"],
            [MapPin, "Saved delivery addresses"],
            [Heart, "A wishlist on any device"],
          ].map(([Icon, label]) => (
            <li key={label} className="flex items-center gap-4 text-ink-soft">
              <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-blush text-plum">
                <Icon size={17} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className={`${panelClass} p-6 sm:p-9`}
      >
        <div className="grid grid-cols-2 rounded-full bg-[#f3eee8] p-1 text-sm font-medium">
          {[
            ["login", "Sign in"],
            ["register", "Create account"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-2.5 transition ${mode === value ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {login ? <LoginForm login={auth.login} /> : <RegisterForm register={auth.register} />}
      </motion.div>
    </div>
  );
}

function LoginForm({ login }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [formError, setFormError] = useState("");
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    setFormError("");
    try {
      await login(values);
      navigate(safeNext(params.get("next")));
    } catch (error) {
      setFormError(apiErrorMessage(error, "Could not sign in."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
      </Field>
      <div>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <input type="password" autoComplete="current-password" className={inputClass} {...form.register("password")} />
        </Field>
        <Link to="/forgot-password" className="mt-2.5 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
          Forgot password?
        </Link>
      </div>
      {formError && <p className="text-sm text-rose">{formError}</p>}
      <button type="submit" disabled={form.formState.isSubmitting} className={`${primaryButton} w-full`}>
        {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        {!form.formState.isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
      </button>
    </form>
  );
}

function RegisterForm({ register }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [formError, setFormError] = useState("");
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(values) {
    setFormError("");
    try {
      await register(values);
      navigate(safeNext(params.get("next")));
    } catch (error) {
      setFormError(apiErrorMessage(error, "Could not create the account."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <input autoComplete="name" className={inputClass} {...form.register("name")} />
        </Field>
      </div>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
      </Field>
      <Field label="Phone (optional)" error={form.formState.errors.phone?.message}>
        <input type="tel" autoComplete="tel" className={inputClass} {...form.register("phone")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Password" error={form.formState.errors.password?.message}>
          <input type="password" autoComplete="new-password" className={inputClass} {...form.register("password")} />
        </Field>
        {!form.formState.errors.password && <p className="mt-1.5 text-xs text-ink-soft">At least 8 characters.</p>}
      </div>
      {formError && <p className="text-sm text-rose sm:col-span-2">{formError}</p>}
      <button type="submit" disabled={form.formState.isSubmitting} className={`${primaryButton} w-full sm:col-span-2`}>
        {form.formState.isSubmitting ? "Creating account…" : "Create account"}
        {!form.formState.isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
      </button>
    </form>
  );
}

const orderTone = {
  paid: "bg-[#e3f1e5] text-[#2f6b3b]",
  pending: "bg-[#fbefd5] text-[#8a5a12]",
  failed: "bg-[#f8dede] text-[#8f2f2f]",
  refunded: "bg-[#e8e6f3] text-[#4a427a]",
};

function SignedIn({ user, onLogout }) {
  const reduce = useReducedMotion();
  const orders = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data.orders,
  });
  const firstName = (user.name || "").trim().split(/\s+/)[0] || "Account";

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <PageHero eyebrow="Account" title={`Hi, ${firstName}`} size="md">
          <p>{user.email}</p>
        </PageHero>
        <div className="flex flex-wrap gap-2">
          <Link to="/wishlist" className={secondaryButton}>
            <Heart size={16} aria-hidden="true" />
            Wishlist
          </Link>
          {user.role === "admin" && (
            <Link to="/admin" className={secondaryButton}>
              <LayoutDashboard size={16} aria-hidden="true" />
              Dashboard
            </Link>
          )}
          <button type="button" onClick={onLogout} className={secondaryButton}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>

      <motion.div {...rise(0.2)}>
        <CycleCard />
      </motion.div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-6">
          <motion.section {...rise(0.25)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="account-orders">
            <div className="flex items-end justify-between gap-4">
              <h2 id="account-orders" className={headingClass}>
                Orders
              </h2>
              {orders.data?.length > 0 && <p className="text-sm text-ink-soft">{orders.data.length} in total</p>}
            </div>
            {orders.isLoading && (
              <div aria-hidden="true" className="mt-6 space-y-3">
                {[0, 1].map((key) => (
                  <div key={key} className="h-16 animate-pulse rounded-2xl bg-blush/70" />
                ))}
              </div>
            )}
            {orders.isError && (
              <p className="mt-5 text-sm text-plum">
                Orders could not be loaded.{" "}
                <button type="button" className="underline" onClick={() => orders.refetch()}>
                  Try again
                </button>
              </p>
            )}
            {orders.data?.length === 0 && (
              <StatePanel icon={Package} title="No orders yet." text="Orders you place will show up here." className="mt-6">
                <Link to="/shop" className={primaryButton}>
                  Shop packs
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </StatePanel>
            )}
            {orders.data?.length > 0 && (
              <ul className="mt-5 divide-y divide-line">
                {orders.data.map((order) => (
                  <li key={order._id}>
                    <Link to={`/order/${order._id}`} className="group flex items-center gap-4 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-xl font-medium group-hover:underline group-hover:underline-offset-4">{order.orderNumber}</p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${orderTone[order.paymentStatus] || "bg-line text-ink"}`}>
                        {order.paymentStatus}
                      </span>
                      <p className="w-20 text-right text-sm font-medium">{formatPrice(order.total)}</p>
                      <ChevronRight size={18} aria-hidden="true" className="text-ink-soft transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>

          <motion.section {...rise(0.35)} className={`${panelClass} p-6 sm:p-8`}>
            <Addresses user={user} />
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.section {...rise(0.3)} className={`${panelClass} p-6 sm:p-8`}>
            <PhotoForm user={user} />
          </motion.section>
          <motion.section {...rise(0.4)} className={`${panelClass} p-6 sm:p-8`}>
            <ProfileForm user={user} />
          </motion.section>
          <motion.section {...rise(0.5)} className={`${panelClass} p-6 sm:p-8`}>
            <PasswordForm />
          </motion.section>
        </div>
      </div>
    </>
  );
}

function CycleCard() {
  const tracker = useTracker();
  const { summary } = tracker;
  if (!tracker.ready) return <div aria-hidden="true" className="mt-12 h-24 animate-pulse rounded-[28px] bg-[#f8d6e3]/60" />;

  const title = summary.inPeriod
    ? `Period day ${summary.periodDay}`
    : summary.nextStart
      ? summary.daysUntil === 0
        ? "Next period may start today"
        : `Next period in ${summary.daysUntil} ${summary.daysUntil === 1 ? "day" : "days"}`
      : "Track your cycle";
  const text = summary.nextStart && !summary.inPeriod
    ? `Around ${formatDay(summary.nextStart, { weekday: "short", day: "numeric", month: "short" })}. An estimate from your own log.`
    : summary.inPeriod
      ? "Log each day's flow in the tracker."
      : "Log your period days to see when the next one may start.";

  return (
    <Link
      to="/tracker"
      className="group mt-12 flex items-center gap-5 rounded-[28px] bg-[#f8d6e3] px-6 py-5 transition hover:bg-[#f5cada] sm:px-8"
    >
      <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/70 text-plum">
        <CalendarHeart size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-2xl leading-tight font-medium">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-soft">{text}</span>
      </span>
      <ArrowRight size={18} aria-hidden="true" className="shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}

function safeNext(value) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().max(20).optional(),
});

const savedAddressSchema = z.object({
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(2, "Enter the recipient name").max(80),
  phone: z.string().trim().min(8, "Enter a phone number").max(20),
  line1: z.string().trim().min(3, "Enter the address").max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.string().trim().min(2, "Enter the state").max(80),
  postalCode: z.string().trim().min(4, "Enter the PIN code").max(12),
});

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
};

function PhotoForm({ user }) {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post("/account/avatar", body);
      queryClient.setQueryData(["me"], data.user);
    } catch (err) {
      setError(apiErrorMessage(err, "The photo could not be saved."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.delete("/account/avatar");
      queryClient.setQueryData(["me"], data.user);
    } catch (err) {
      setError(apiErrorMessage(err, "The photo could not be removed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className={headingClass}>Photo</h2>
      <div className="mt-5 flex items-center gap-5">
        {user.avatar?.url ? (
          <img src={user.avatar.url} alt={user.avatar.alt || user.name || ""} className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-white" />
        ) : (
          <span aria-hidden="true" className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blush font-display text-3xl font-medium text-plum ring-4 ring-white">
            {initial}
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-40">
            {busy ? "Saving…" : user.avatar?.url ? "Change" : "Upload photo"}
          </button>
          {user.avatar?.url && (
            <button type="button" disabled={busy} onClick={remove} className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium transition hover:border-ink disabled:opacity-40">
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={upload} />
      <p className="mt-3 text-xs text-ink-soft">PNG, JPEG, or WebP, up to 4 MB.</p>
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
    </div>
  );
}

function ProfileForm({ user }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name || "", phone: user.phone || "" },
  });

  useEffect(() => {
    form.reset({ name: user.name || "", phone: user.phone || "" });
  }, [user.name, user.phone]);

  async function onSubmit(values) {
    setMessage("");
    setFormError("");
    try {
      const { data } = await api.patch("/account/profile", values);
      queryClient.setQueryData(["me"], data.user);
      setMessage("Profile saved.");
    } catch (error) {
      setFormError(apiErrorMessage(error, "Profile could not be saved."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <h2 className={headingClass}>Profile</h2>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <input autoComplete="name" className={inputClass} {...form.register("name")} />
      </Field>
      <Field label="Phone" error={form.formState.errors.phone?.message}>
        <input type="tel" autoComplete="tel" className={inputClass} {...form.register("phone")} />
      </Field>
      {message && <p className="text-sm text-teal">{message}</p>}
      {formError && <p className="text-sm text-rose">{formError}</p>}
      <button type="submit" disabled={form.formState.isSubmitting} className={smallButton}>
        {form.formState.isSubmitting ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(72),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string().min(1, "Confirm the new password"),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function PasswordForm() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const form = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", password: "", confirm: "" },
  });

  async function onSubmit(values) {
    setMessage("");
    setFormError("");
    try {
      const { data } = await api.patch("/account/password", {
        currentPassword: values.currentPassword,
        password: values.password,
      });
      queryClient.setQueryData(["me"], data.user);
      form.reset();
      setMessage("Password updated. Other sessions are signed out.");
    } catch (error) {
      setFormError(apiErrorMessage(error, "The password could not be changed."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <h2 className={headingClass}>Password</h2>
      <Field label="Current password" error={form.formState.errors.currentPassword?.message}>
        <input type="password" autoComplete="current-password" className={inputClass} {...form.register("currentPassword")} />
      </Field>
      <Field label="New password" error={form.formState.errors.password?.message}>
        <input type="password" autoComplete="new-password" className={inputClass} {...form.register("password")} />
      </Field>
      <Field label="Confirm new password" error={form.formState.errors.confirm?.message}>
        <input type="password" autoComplete="new-password" className={inputClass} {...form.register("confirm")} />
      </Field>
      {message && <p className="text-sm text-teal">{message}</p>}
      {formError && <p className="text-sm text-rose">{formError}</p>}
      <button type="submit" disabled={form.formState.isSubmitting} className={smallButton}>
        {form.formState.isSubmitting ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

function Addresses({ user }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const addresses = user.addresses || [];
  const form = useForm({ resolver: zodResolver(savedAddressSchema), defaultValues: emptyAddress });

  function remember(nextUser) {
    queryClient.setQueryData(["me"], nextUser);
  }

  function startNew() {
    setEditingId(null);
    setFormError("");
    form.reset({ ...emptyAddress, fullName: user.name || "", phone: user.phone || "" });
    setOpen(true);
  }

  function startEdit(address) {
    setEditingId(address._id);
    setFormError("");
    form.reset({
      label: address.label || "Home",
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    });
    setOpen(true);
  }

  async function onSubmit(values) {
    setFormError("");
    try {
      const payload = { ...values, country: "India", isDefault: editingId ? undefined : addresses.length === 0 };
      const { data } = editingId
        ? await api.patch(`/account/addresses/${editingId}`, { ...values, country: "India" })
        : await api.post("/account/addresses", payload);
      remember(data.user);
      setOpen(false);
      setEditingId(null);
    } catch (error) {
      setFormError(apiErrorMessage(error, "That address could not be saved."));
    }
  }

  async function remove(address) {
    if (!window.confirm(`Remove the ${address.label || "saved"} address?`)) return;
    setFormError("");
    try {
      const { data } = await api.delete(`/account/addresses/${address._id}`);
      remember(data.user);
      if (editingId === address._id) setOpen(false);
    } catch (error) {
      setFormError(apiErrorMessage(error, "That address could not be removed."));
    }
  }

  async function makeDefault(address) {
    setFormError("");
    try {
      const { data } = await api.patch(`/account/addresses/${address._id}`, {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || "India",
        isDefault: true,
      });
      remember(data.user);
    } catch (error) {
      setFormError(apiErrorMessage(error, "The default address could not be changed."));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className={headingClass}>Addresses</h2>
        {addresses.length >= 8 ? (
          <p className="text-sm text-ink-soft">You can save up to 8 addresses.</p>
        ) : (
          !open && (
            <button type="button" onClick={startNew} className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition hover:border-ink">
              <Plus size={15} aria-hidden="true" />
              Add address
            </button>
          )
        )}
      </div>
      {addresses.length === 0 && !open && <p className="mt-4 text-sm text-ink-soft">No saved addresses yet. Add one to check out faster.</p>}
      {addresses.length > 0 && (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address._id}
              className={`flex flex-col rounded-[22px] border p-5 ${address.isDefault ? "border-ink/30 bg-white" : "border-line bg-white/60"}`}
            >
              <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">
                <MapPin size={13} aria-hidden="true" />
                {address.label || "Home"}
                {address.isDefault && <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] tracking-[0.12em] text-plum">Default</span>}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink">
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.phone}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm">
                <button type="button" className="underline underline-offset-4" onClick={() => startEdit(address)}>
                  Edit
                </button>
                {!address.isDefault && (
                  <button type="button" className="underline underline-offset-4" onClick={() => makeDefault(address)}>
                    Make default
                  </button>
                )}
                <button type="button" className="text-ink-soft underline underline-offset-4 hover:text-ink" onClick={() => remove(address)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {formError && !open && <p className="mt-3 text-sm text-rose">{formError}</p>}
      {open && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-5 rounded-[22px] bg-[#f3eee8]/70 p-5 sm:grid-cols-2 sm:p-6" noValidate>
          <p className="font-display text-xl font-medium sm:col-span-2">{editingId ? "Edit address" : "New address"}</p>
          <Field label="Label" error={form.formState.errors.label?.message}>
            <input className={inputClass} {...form.register("label")} />
          </Field>
          <Field label="Full name" error={form.formState.errors.fullName?.message}>
            <input autoComplete="name" className={inputClass} {...form.register("fullName")} />
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
          {formError && <p className="text-sm text-rose sm:col-span-2">{formError}</p>}
          <div className="flex items-center gap-4 sm:col-span-2">
            <button type="submit" disabled={form.formState.isSubmitting} className={smallButton}>
              {form.formState.isSubmitting ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              className="text-sm underline underline-offset-4"
              onClick={() => {
                setOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
