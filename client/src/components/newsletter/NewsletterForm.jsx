import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Field, apiErrorMessage, inputClass } from "../form/Field";
import { api } from "../../services/api";

const newsletterForm = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export function NewsletterForm({ tone = "light" }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm({ resolver: zodResolver(newsletterForm), defaultValues: { email: "" } });
  const dark = tone === "dark";

  async function onSubmit(values) {
    setMessage("");
    setError("");
    try {
      const { data } = await api.post("/contact/newsletter", values);
      if (data.already) setMessage("You are already on the list.");
      else if (data.emailed) setMessage("You are on the list. A confirmation was sent.");
      else setMessage("You are on the list.");
      form.reset();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save that email."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {dark ? (
        <label className="block text-sm text-paper">
          Email
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-2xl border border-white/20 bg-paper px-4 py-3 text-ink"
            {...form.register("email")}
          />
          {form.formState.errors.email?.message ? (
            <span className="mt-1 block text-sm text-blush">{form.formState.errors.email.message}</span>
          ) : null}
        </label>
      ) : (
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
        </Field>
      )}
      {message && <p className={`mt-3 text-sm ${dark ? "text-blush" : "text-teal"}`}>{message}</p>}
      {error && <p className="mt-3 text-sm text-rose">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={`rounded-full px-5 py-2.5 text-sm disabled:opacity-40 ${dark ? "bg-paper text-ink" : "bg-ink text-paper"}`}
        >
          {form.formState.isSubmitting ? "Saving…" : "Join"}
        </button>
        <Link to="/leave-notes" className={`text-sm underline underline-offset-4 ${dark ? "text-paper/80" : "text-ink-soft"}`}>
          Leave the list
        </Link>
      </div>
    </form>
  );
}
