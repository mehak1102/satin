import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Retry } from "../../components/admin/Retry";
import { apiErrorMessage, inputClass } from "../../components/form/Field";
import { api } from "../../services/api";
import { Title } from "../../components/motion/Title";

export function AdminSettings() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => (await api.get("/admin/settings")).data.settings,
  });

  const save = useMutation({
    mutationFn: async (body) => (await api.put("/admin/settings", body)).data.settings,
    onSuccess: (next) => {
      setError("");
      setSaved(true);
      queryClient.setQueryData(["admin", "settings"], next);
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Settings could not be saved.")),
  });

  if (settings.isLoading) return <p className="text-ink-soft">Loading settings…</p>;
  if (settings.isError) return <Retry message="Settings could not be loaded." onRetry={() => settings.refetch()} />;

  const current = settings.data || {};
  const support = current.support || {};
  const method = current.shipping?.methods?.[0];

  function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("methodName") || "").trim();
    const free = String(form.get("freeAbove") || "").trim();
    setSaved(false);
    save.mutate({
      support: {
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        tollFree: String(form.get("tollFree") || ""),
        website: String(form.get("website") || ""),
        address: String(form.get("address") || ""),
      },
      shippingSummary: String(form.get("shippingSummary") || ""),
      method: name
        ? {
            name,
            description: String(form.get("methodDescription") || ""),
            price: Number(form.get("methodPrice") || 0),
            freeAbove: free === "" ? null : Number(free),
          }
        : null,
      returns: String(form.get("returns") || ""),
      privacy: String(form.get("privacy") || ""),
      terms: String(form.get("terms") || ""),
      taxRate: Number(form.get("taxRate") || 0),
      social: {
        instagram: String(form.get("instagram") || "").trim(),
        facebook: String(form.get("facebook") || "").trim(),
        youtube: String(form.get("youtube") || "").trim(),
      },
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4" key={current.updatedAt || "settings"}>
      <Title as="h2" className="font-display text-3xl text-ink">Customer care</Title>
      <label className="text-sm">Email<input name="email" defaultValue={support.email || ""} className={inputClass} /></label>
      <label className="text-sm">Phone<input name="phone" defaultValue={support.phone || ""} className={inputClass} /></label>
      <label className="text-sm">Toll free<input name="tollFree" defaultValue={support.tollFree || ""} className={inputClass} /></label>
      <label className="text-sm">Website<input name="website" defaultValue={support.website || ""} className={inputClass} /></label>
      <label className="text-sm">Address<textarea name="address" defaultValue={support.address || ""} rows={3} className={inputClass} /></label>
      <Title as="h2" className="mt-4 font-display text-3xl text-ink">Social</Title>
      <p className="text-sm text-ink-soft">Leave a field blank until that address is known. Use a full https link.</p>
      <label className="text-sm">Instagram<input name="instagram" defaultValue={current.social?.instagram || ""} className={inputClass} /></label>
      <label className="text-sm">Facebook<input name="facebook" defaultValue={current.social?.facebook || ""} className={inputClass} /></label>
      <label className="text-sm">YouTube<input name="youtube" defaultValue={current.social?.youtube || ""} className={inputClass} /></label>

      <Title as="h2" className="mt-4 font-display text-3xl text-ink">Shipping</Title>
      <p className="text-sm text-ink-soft">Leave the method name blank if no shipping charge should apply. Checkout uses this first method.</p>
      <label className="text-sm">
        Summary
        <textarea name="shippingSummary" defaultValue={current.shipping?.summary || ""} rows={4} className={inputClass} />
      </label>
      <label className="text-sm">Method name<input name="methodName" defaultValue={method?.name || ""} className={inputClass} /></label>
      <label className="text-sm">Method note<input name="methodDescription" defaultValue={method?.description || ""} className={inputClass} /></label>
      <label className="text-sm">Price ₹<input name="methodPrice" type="number" min="0" step="0.01" defaultValue={method?.price ?? 0} className={inputClass} /></label>
      <label className="text-sm">
        Free above ₹
        <input name="freeAbove" type="number" min="0" step="0.01" defaultValue={method?.freeAbove ?? ""} className={inputClass} />
      </label>

      <Title as="h2" className="mt-4 font-display text-3xl text-ink">Policies</Title>
      <label className="text-sm">Returns<textarea name="returns" defaultValue={current.returns || ""} rows={5} className={inputClass} /></label>
      <label className="text-sm">Privacy<textarea name="privacy" defaultValue={current.privacy || ""} rows={5} className={inputClass} /></label>
      <label className="text-sm">Terms<textarea name="terms" defaultValue={current.terms || ""} rows={5} className={inputClass} /></label>
      <label className="text-sm">
        Tax rate
        <input name="taxRate" type="number" min="0" max="1" step="0.01" defaultValue={current.taxRate ?? 0} className={inputClass} />
      </label>
      <p className="text-xs text-ink-soft">Use a decimal. 0.18 means 18%. Leave 0 until a tax rate is decided.</p>
      {error && <p className="text-sm text-rose">{error}</p>}
      {saved && <p className="text-sm text-teal">Saved. The shop pages read these settings.</p>}
      <button type="submit" disabled={save.isPending} className="w-fit rounded-full bg-ink px-6 py-3 text-sm text-paper disabled:opacity-40">
        Save settings
      </button>
    </form>
  );
}
