import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarHeart, ChevronLeft, ChevronRight, Download, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { Notice } from "../../components/layout/FormShell";
import { PageHero } from "../../components/layout/PageHero";
import { panelClass, primaryButton, secondaryButton } from "../../components/layout/StatePanel";
import { PageMeta } from "../../components/seo/PageMeta";
import { useCart } from "../../context/CartContext";
import { useTracker } from "../../hooks/useTracker";
import { addDays, daysBetween, formatDay, predictedDays } from "../../lib/cycle";
import { api, formatPrice } from "../../services/api";

const ease = [0.22, 1, 0.36, 1];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const flows = [
  ["", "No period"],
  ["light", "Light"],
  ["medium", "Medium"],
  ["heavy", "Heavy"],
];
const flowTone = {
  light: "bg-[#f8d6e3] text-plum",
  medium: "bg-[#e98aa6] text-white",
  heavy: "bg-plum text-paper",
};

function monthGrid(month) {
  const [year, index] = month.split("-").map(Number);
  const first = `${month}-01`;
  const lead = (new Date(Date.UTC(year, index - 1, 1)).getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(year, index, 0)).getUTCDate();
  const total = Math.ceil((lead + length) / 7) * 7;
  return Array.from({ length: total }, (_, cell) => addDays(first, cell - lead));
}

function shiftMonth(month, by) {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, index - 1 + by, 1));
  return date.toISOString().slice(0, 7);
}

function inDays(count) {
  if (count === 0) return "today";
  if (count === 1) return "tomorrow";
  return `in ${count} days`;
}

export function TrackerPage() {
  const reduce = useReducedMotion();
  const tracker = useTracker();
  const { summary, today, days } = tracker;
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const grid = useMemo(() => monthGrid(month), [month]);
  const predicted = useMemo(() => predictedDays(summary), [summary]);
  const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
  const selectedFuture = daysBetween(today, selected) > 0;

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  const sticker = summary.inPeriod ? `Day ${summary.periodDay}` : summary.nextStart ? inDays(summary.daysUntil) : null;

  return (
    <div className="relative isolate overflow-hidden">
      <PageMeta
        title="Period tracker — Satin"
        description="Log your period days and see when the next one may start. Saved on your device, or on your Satin account if you choose."
        path="/tracker"
      />
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <PageHero eyebrow="Your cycle" title="Tracker" sticker={tracker.ready ? sticker : null}>
          <p>Tap the days of your period to see when the next one may start. Estimates come from your own log and are not medical advice.</p>
        </PageHero>

        {tracker.loadError && (
          <div className="mt-8 max-w-xl">
            <Notice tone="error">
              Your saved log could not be loaded.{" "}
              <button type="button" className="underline" onClick={tracker.retry}>
                Try again
              </button>
            </Notice>
          </div>
        )}
        {tracker.error && (
          <div className="mt-8 max-w-xl">
            <Notice tone="error">{tracker.error}</Notice>
          </div>
        )}

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <motion.section {...rise(0.25)} className={`${panelClass} p-5 sm:p-8`} aria-label="Period calendar">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-[clamp(1.85rem,3vw,2.5rem)] leading-none font-medium">{monthLabel}</h2>
              <div className="flex items-center gap-2">
                {month !== today.slice(0, 7) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMonth(today.slice(0, 7));
                      setSelected(today);
                    }}
                    className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition hover:border-ink"
                  >
                    Today
                  </button>
                )}
                <button type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition hover:border-ink">
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 transition hover:border-ink">
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium tracking-[0.14em] text-ink-soft uppercase sm:gap-2">
              {weekdays.map((day) => (
                <span key={day} aria-hidden="true">
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
              {grid.map((date) => {
                const flow = days[date];
                const outside = date.slice(0, 7) !== month;
                const isToday = date === today;
                const isPredicted = !flow && predicted.has(date);
                const label = [
                  formatDay(date, { weekday: "long", day: "numeric", month: "long" }),
                  flow ? `${flow} flow` : isPredicted ? "estimated period" : "",
                  isToday ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <button
                    key={date}
                    type="button"
                    aria-label={label}
                    aria-pressed={selected === date}
                    onClick={() => {
                      setSelected(date);
                      if (outside) setMonth(date.slice(0, 7));
                    }}
                    className={`relative grid aspect-square place-items-center rounded-2xl text-sm transition sm:text-base ${
                      flow ? flowTone[flow] : isPredicted ? "border-2 border-dashed border-[#e98aa6] text-plum" : "hover:bg-ink/5"
                    } ${outside ? "opacity-35" : ""} ${selected === date ? "ring-2 ring-ink ring-offset-2 ring-offset-white" : ""}`}
                  >
                    <span className={isToday ? "font-semibold" : ""}>{Number(date.slice(8))}</span>
                    {isToday && <span aria-hidden="true" className={`absolute bottom-1.5 h-1 w-1 rounded-full ${flow === "heavy" || flow === "medium" ? "bg-white" : "bg-ink"}`} />}
                  </button>
                );
              })}
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft" aria-label="Legend">
              {flows.slice(1).map(([value, name]) => (
                <li key={value} className="flex items-center gap-2">
                  <span aria-hidden="true" className={`h-3 w-3 rounded-full ${flowTone[value]}`} />
                  {name}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3 w-3 rounded-full border-2 border-dashed border-[#e98aa6]" />
                Estimated
              </li>
            </ul>

            <div className="mt-6 rounded-[22px] bg-[#f3eee8]/80 p-5">
              <p className="font-display text-xl font-medium">
                {selected === today ? "Today" : formatDay(selected, { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {selectedFuture ? (
                <p className="mt-2 text-sm text-ink-soft">Days after today cannot be logged yet.</p>
              ) : (
                <div role="group" aria-label="Flow for this day" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {flows.map(([value, name]) => {
                    const active = (days[selected] || "") === value;
                    return (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={active}
                        disabled={!tracker.ready}
                        onClick={() => tracker.setDay(selected, value || null)}
                        className={`rounded-full px-4 py-2.5 text-sm font-medium transition disabled:opacity-40 ${
                          active ? "bg-ink text-paper" : "border border-ink/15 bg-white/70 text-ink hover:border-ink/40"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>

          <div className="space-y-6">
            <motion.section {...rise(0.3)} className="rounded-[28px] bg-[#f8d6e3] p-6 sm:p-8" aria-live="polite">
              <p className="text-[11px] tracking-[0.28em] text-plum uppercase">
                {summary.inPeriod ? "Now" : summary.nextStart ? "Next period" : "Getting started"}
              </p>
              {summary.inPeriod ? (
                <>
                  <p className="mt-3 font-display text-5xl leading-none font-medium">Day {summary.periodDay}</p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">of your period. Tap each day to log the flow.</p>
                </>
              ) : summary.nextStart ? (
                <>
                  <p className="mt-3 font-display text-5xl leading-none font-medium">Around {formatDay(summary.nextStart)}</p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">That is {inDays(summary.daysUntil)}, based on your last {summary.cycles.length === 1 ? "cycle" : `${summary.cycles.length} cycles`}.</p>
                </>
              ) : (
                <>
                  <p className="mt-3 font-display text-3xl leading-tight font-medium">
                    {summary.periods.length === 1 ? "Log one more period to see an estimate." : "Log your first period to begin."}
                  </p>
                  {!days[today] && (
                    <button type="button" disabled={!tracker.ready} onClick={() => tracker.setDay(today, "medium")} className={`${primaryButton} mt-6`}>
                      <CalendarHeart size={16} aria-hidden="true" />
                      My period started today
                    </button>
                  )}
                </>
              )}
              {summary.nextStart && !summary.inPeriod && !days[today] && (
                <button type="button" onClick={() => tracker.setDay(today, "medium")} className="mt-5 text-sm font-medium underline underline-offset-4">
                  My period started today
                </button>
              )}
            </motion.section>

            <motion.section {...rise(0.4)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="tracker-stats">
              <h2 id="tracker-stats" className="font-display text-3xl leading-none font-medium">
                Your cycle
              </h2>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Average cycle", summary.avgCycle ? `${summary.avgCycle} days` : "—"],
                  ["Average period", summary.avgPeriod ? `${summary.avgPeriod} days` : "—"],
                  ["Periods logged", String(summary.periods.length)],
                ].map(([name, value]) => (
                  <div key={name} className="flex flex-col-reverse rounded-2xl bg-white/80 px-2 py-4">
                    <dt className="mt-1 text-[11px] leading-4 text-ink-soft">{name}</dt>
                    <dd className="font-display text-xl font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              {summary.cycles.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">Recent cycles</p>
                  <ul className="mt-3 space-y-2.5">
                    {summary.cycles
                      .slice()
                      .reverse()
                      .map((cycle) => (
                        <li key={cycle.start} className="grid grid-cols-[64px_minmax(0,1fr)_60px] items-center gap-3 text-sm">
                          <span className="text-ink-soft">{formatDay(cycle.start)}</span>
                          <span className="h-2.5 overflow-hidden rounded-full bg-line">
                            <span className="block h-full rounded-full bg-[#e98aa6]" style={{ width: `${Math.min(100, (cycle.length / 45) * 100)}%` }} />
                          </span>
                          <span className="text-right">{cycle.length} days</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-ink-soft">Gaps shorter than 15 days or longer than 60 days are left out of the average.</p>
            </motion.section>

            <UsualPack signedIn={tracker.signedIn} rise={rise(0.5)} />

            <motion.section {...rise(0.6)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="tracker-data">
              <h2 id="tracker-data" className="flex items-center gap-2 font-display text-3xl leading-none font-medium">
                <ShieldCheck size={22} aria-hidden="true" className="text-plum" />
                Your data
              </h2>
              <p className="mt-4 text-sm leading-6 text-ink-soft">
                {tracker.synced
                  ? "Saved to your Satin account. Only you can see it; it is never used for marketing."
                  : "Saved on this device only. Nothing is sent to Satin."}
              </p>

              {!tracker.signedIn && (
                <Link to="/account?next=/tracker" className={`${secondaryButton} mt-5`}>
                  Sign in to save it to your account
                </Link>
              )}

              {tracker.signedIn && !tracker.synced && tracker.ready && (
                <div className="mt-5">
                  <button type="button" onClick={() => tracker.syncToAccount().catch(() => {})} className={primaryButton}>
                    Save to my account
                  </button>
                  <p className="mt-2 text-xs leading-5 text-ink-soft">Saving to your account lets you use it on any device and turn on email reminders.</p>
                </div>
              )}

              {tracker.synced && (
                <div className="mt-5 rounded-[22px] bg-white/80 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p id="reminder-label" className="text-sm font-medium">
                        Email me 2 days before
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-soft">
                        {tracker.emailReady ? "The email subject says only “A note from Satin”." : "Email reminders are not available yet."}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tracker.reminder}
                      aria-labelledby="reminder-label"
                      disabled={!tracker.emailReady}
                      onClick={() => tracker.setReminder(!tracker.reminder).catch(() => {})}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-40 ${tracker.reminder ? "bg-ink" : "bg-line"}`}
                    >
                      <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${tracker.reminder ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
                <button type="button" onClick={tracker.exportData} disabled={!Object.keys(days).length} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline disabled:opacity-40">
                  <Download size={15} aria-hidden="true" />
                  Download my data
                </button>
                {tracker.synced && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Move your log back to this device and remove it from your account? Reminders will stop.")) tracker.keepOnDevice().catch(() => {});
                    }}
                    className="underline-offset-4 hover:underline"
                  >
                    Keep on this device only
                  </button>
                )}
                <button
                  type="button"
                  disabled={!Object.keys(days).length}
                  onClick={() => {
                    if (window.confirm("Delete every logged day? This cannot be undone.")) tracker.deleteAll().catch(() => {});
                  }}
                  className="inline-flex items-center gap-1.5 text-rose underline-offset-4 hover:underline disabled:opacity-40"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  Delete all
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
}

function UsualPack({ signedIn, rise }) {
  const cart = useCart();
  const orders = useQuery({
    queryKey: ["orders"],
    enabled: signedIn,
    queryFn: async () => (await api.get("/orders")).data.orders,
  });
  const slug = (orders.data || []).find((order) => order.paymentStatus === "paid")?.items?.[0]?.slug;
  const product = useQuery({
    queryKey: ["product", slug],
    enabled: Boolean(slug),
    queryFn: async () => (await api.get(`/products/${slug}`)).data.product,
  });
  const pack = product.data;

  return (
    <motion.section {...rise} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="tracker-pack">
      <h2 id="tracker-pack" className="font-display text-3xl leading-none font-medium">
        {pack ? "Your usual pack" : "Stocked up?"}
      </h2>
      {pack ? (
        <div className="mt-5 flex items-center gap-4">
          <Link to={`/product/${pack.slug}`} className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(180deg,#f3eee8_0%,#e9e2da_100%)]">
            {pack.images?.[0]?.url ? <img src={pack.images[0].url} alt="" className="h-full w-full object-contain p-2" /> : null}
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/product/${pack.slug}`} className="font-display text-xl leading-tight font-medium hover:underline hover:underline-offset-4">
              {pack.name}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{formatPrice(pack.price)}</p>
            <button
              type="button"
              disabled={pack.stock <= 0}
              onClick={() => cart.addItem(pack, 1)}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-40"
            >
              <ShoppingBag size={15} aria-hidden="true" />
              {pack.stock > 0 ? "Add to cart" : "Out of stock"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            {signedIn ? "Once you order, your usual pack shows up here for a quick reorder." : "Keep a pack ready before your next period."}
          </p>
          <Link to="/shop" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
            Shop packs
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </>
      )}
    </motion.section>
  );
}
