import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Field, apiErrorMessage, inputClass } from "../../components/form/Field";
import { FormShell, Notice } from "../../components/layout/FormShell";
import { primaryButton } from "../../components/layout/StatePanel";
import { api } from "../../services/api";

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export function LeaveNotesPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const form = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });

  async function stopNotes() {
    setError("");
    setMessage("");
    setPending(true);
    try {
      const { data } = await api.post("/contact/newsletter/unsubscribe", { token });
      setMessage(data.message);
    } catch (err) {
      setError(apiErrorMessage(err, "This link could not be used."));
    } finally {
      setPending(false);
    }
  }

  async function sendLink(values) {
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/contact/newsletter/leave", values);
      setMessage(data.message);
      form.reset();
    } catch (err) {
      setError(apiErrorMessage(err, "The link could not be sent."));
    }
  }

  return (
    <FormShell
      eyebrow="Notes"
      title="Leave the list"
      intro={
        <p>
          {token
            ? "This stops product notes for the email on this link."
            : "Enter the email on the list and a link to leave will be sent there."}
        </p>
      }
      footer={
        <Link to="/" className="inline-flex items-center gap-1.5 text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          <ArrowLeft size={15} aria-hidden="true" />
          Back home
        </Link>
      }
    >
      {token ? (
        <div className="space-y-5">
          {message && <Notice>{message}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          {!message && (
            <button type="button" disabled={pending} onClick={stopNotes} className={`${primaryButton} w-full`}>
              {pending ? "Saving…" : "Stop notes"}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(sendLink)} className="space-y-5" noValidate>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
          </Field>
          {message && <Notice>{message}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          <button type="submit" disabled={form.formState.isSubmitting} className={`${primaryButton} w-full`}>
            {form.formState.isSubmitting ? "Sending…" : "Send link"}
          </button>
        </form>
      )}
    </FormShell>
  );
}
