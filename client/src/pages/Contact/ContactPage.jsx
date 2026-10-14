import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import { LeafShadows } from "../../components/decor/LeafShadows";
import { Field, apiErrorMessage, inputClass } from "../../components/form/Field";
import { Notice } from "../../components/layout/FormShell";
import { PageHero } from "../../components/layout/PageHero";
import { SocialLinks } from "../../components/layout/SocialLinks";
import { panelClass, primaryButton } from "../../components/layout/StatePanel";
import { NewsletterForm } from "../../components/newsletter/NewsletterForm";
import { useSettings } from "../../hooks/useSettings";
import { api } from "../../services/api";

const ease = [0.22, 1, 0.36, 1];

const contactForm = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(2, "Enter a subject").max(140),
  message: z.string().trim().min(10, "Write at least a short message").max(4000),
});

export function ContactPage() {
  const reduce = useReducedMotion();
  const settings = useSettings();
  const support = settings.data?.support;
  const [sent, setSent] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm({
    resolver: zodResolver(contactForm),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  async function onSubmit(values) {
    setFormError("");
    try {
      const { data } = await api.post("/contact", values);
      setEmailed(Boolean(data.emailed));
      setSent(true);
      form.reset();
    } catch (error) {
      setFormError(apiErrorMessage(error, "The message could not be saved."));
    }
  }

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <div className="relative isolate overflow-hidden">
      <LeafShadows />
      <section className="mx-auto max-w-7xl px-5 pt-12 pb-24 text-ink sm:px-8">
        <PageHero eyebrow="Contact" title="Write to us">
          <p>Questions about a pack, an order or delivery? Send a message and customer care will reply by email.</p>
        </PageHero>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <motion.div {...rise(0.25)} className={`${panelClass} p-6 sm:p-9`}>
            {sent ? (
              <div className="py-10 text-center">
                <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush text-plum">
                  <CheckCircle2 size={24} />
                </span>
                <p className="mt-6 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] leading-tight font-medium">Message received.</p>
                <p role="status" className="mx-auto mt-3 max-w-md leading-7 text-ink-soft">
                  {emailed
                    ? "Your message was sent to customer care and saved."
                    : "Your message is saved. Customer care details are on this page if you need a reply sooner."}
                </p>
                <button type="button" onClick={() => setSent(false)} className="mt-8 text-sm underline underline-offset-4">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2" noValidate>
                <Field label="Name" error={form.formState.errors.name?.message}>
                  <input autoComplete="name" className={inputClass} {...form.register("name")} />
                </Field>
                <Field label="Email" error={form.formState.errors.email?.message}>
                  <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
                </Field>
                <Field label="Phone (optional)" error={form.formState.errors.phone?.message}>
                  <input type="tel" autoComplete="tel" className={inputClass} {...form.register("phone")} />
                </Field>
                <Field label="Subject" error={form.formState.errors.subject?.message}>
                  <input className={inputClass} {...form.register("subject")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Message" error={form.formState.errors.message?.message}>
                    <textarea rows={6} className={`${inputClass} resize-y`} {...form.register("message")} />
                  </Field>
                </div>
                {formError && (
                  <div className="sm:col-span-2">
                    <Notice tone="error">{formError}</Notice>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <button type="submit" disabled={form.formState.isSubmitting} className={primaryButton}>
                    {form.formState.isSubmitting ? "Sending…" : "Send message"}
                    {!form.formState.isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          <aside className="space-y-6">
            <motion.section {...rise(0.35)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="contact-care">
              <h2 id="contact-care" className="font-display text-3xl leading-none font-medium">
                Customer care
              </h2>
              {settings.isLoading && (
                <div aria-hidden="true" className="mt-5 space-y-3">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-5 animate-pulse rounded-full bg-blush/70" />
                  ))}
                </div>
              )}
              {settings.isError && (
                <p className="mt-4 text-sm text-plum">
                  Customer care details could not be loaded.{" "}
                  <button type="button" className="underline" onClick={() => settings.refetch()}>
                    Try again
                  </button>
                </p>
              )}
              {settings.isSuccess && support && (
                <ul className="mt-5 space-y-4 text-sm leading-6">
                  {support.email && (
                    <ContactRow icon={Mail}>
                      <a href={`mailto:${support.email}`} className="underline underline-offset-4 hover:text-plum">
                        {support.email}
                      </a>
                    </ContactRow>
                  )}
                  {support.phone && (
                    <ContactRow icon={Phone}>
                      <a href={`tel:${support.phone.replace(/[^\d+]/g, "")}`} className="hover:underline hover:underline-offset-4">
                        {support.phone}
                      </a>
                      {support.tollFree ? <span className="block text-ink-soft">Toll free {support.tollFree}</span> : null}
                    </ContactRow>
                  )}
                  {support.address && (
                    <ContactRow icon={MapPin}>
                      <span className="text-ink-soft">{support.address}</span>
                    </ContactRow>
                  )}
                </ul>
              )}
              {settings.isSuccess && !support && <p className="mt-4 text-sm text-ink-soft">Customer care details have not been saved yet.</p>}
              {settings.isSuccess && <SocialLinks social={settings.data?.social} className="mt-5 space-y-2" />}
            </motion.section>

            <motion.section {...rise(0.45)} className={`${panelClass} p-6 sm:p-8`} aria-labelledby="contact-faq">
              <h2 id="contact-faq" className="font-display text-3xl leading-none font-medium">
                Questions
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-soft">Pack facts and the published shop wording are on the questions page.</p>
              <Link to="/faq" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
                Read the questions
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </motion.section>

            <motion.section {...rise(0.55)} className="rounded-[28px] bg-[#f8d6e3] p-6 sm:p-8" aria-labelledby="contact-notes">
              <h2 id="contact-notes" className="font-display text-3xl leading-none font-medium">
                Notes
              </h2>
              <p className="mt-3 mb-4 text-sm text-ink-soft">Leave an email for product notes.</p>
              <NewsletterForm />
            </motion.section>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ContactRow({ icon: Icon, children }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blush text-plum">
        <Icon size={16} />
      </span>
      <span className="min-w-0 pt-1.5 break-words">{children}</span>
    </li>
  );
}
