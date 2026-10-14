import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Field, apiErrorMessage, inputClass } from "../../components/form/Field";
import { FormShell, Notice } from "../../components/layout/FormShell";
import { primaryButton } from "../../components/layout/StatePanel";
import { api } from "../../services/api";

const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function BackLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-ink-soft underline-offset-4 hover:text-ink hover:underline">
      <ArrowLeft size={15} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const form = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  async function onSubmit(values) {
    setFormError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/forgot-password", values);
      setMessage(data.message);
    } catch (error) {
      setFormError(apiErrorMessage(error, "The reset email could not be sent."));
    }
  }

  return (
    <FormShell
      eyebrow="Account"
      title="Forgot password"
      intro={<p>Enter the email on your account and a reset link will be sent there. The link expires in 30 minutes.</p>}
      footer={<BackLink to="/account">Back to sign in</BackLink>}
    >
      {message ? (
        <div className="text-center">
          <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush text-plum">
            <MailCheck size={22} />
          </span>
          <p className="mt-5 font-display text-2xl font-medium">Check your inbox</p>
          <p role="status" className="mt-2 text-sm leading-6 text-ink-soft">
            {message}
          </p>
          <button type="button" onClick={() => setMessage("")} className="mt-6 text-sm underline underline-offset-4">
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input type="email" autoComplete="email" className={inputClass} {...form.register("email")} />
          </Field>
          {formError && <Notice tone="error">{formError}</Notice>}
          <button type="submit" disabled={form.formState.isSubmitting} className={`${primaryButton} w-full`}>
            {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </FormShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState("");
  const form = useForm({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirm: "" } });

  async function onSubmit(values) {
    setFormError("");
    try {
      const { data } = await api.post("/auth/reset-password", { token, password: values.password });
      queryClient.setQueryData(["me"], data.user);
      navigate("/account");
    } catch (error) {
      setFormError(apiErrorMessage(error, "The password could not be reset."));
    }
  }

  return (
    <FormShell
      eyebrow="Account"
      title="New password"
      intro={<p>Choose a new password with at least 8 characters. You will be signed in once it is saved.</p>}
      footer={<BackLink to="/forgot-password">Request a new link</BackLink>}
    >
      {!token ? (
        <Notice tone="error">This reset link is incomplete. Request a new one below.</Notice>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Field label="New password" error={form.formState.errors.password?.message}>
            <input type="password" autoComplete="new-password" className={inputClass} {...form.register("password")} />
          </Field>
          <Field label="Confirm password" error={form.formState.errors.confirm?.message}>
            <input type="password" autoComplete="new-password" className={inputClass} {...form.register("confirm")} />
          </Field>
          {formError && <Notice tone="error">{formError}</Notice>}
          <button type="submit" disabled={form.formState.isSubmitting} className={`${primaryButton} w-full`}>
            {form.formState.isSubmitting ? "Saving…" : "Save password"}
          </button>
        </form>
      )}
    </FormShell>
  );
}
