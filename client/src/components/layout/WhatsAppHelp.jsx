import { useSettings } from "../../hooks/useSettings";

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function whatsappNumber(support) {
  const raw = support?.whatsapp || support?.phone || "";
  let digits = digitsOnly(raw);
  if (!digits) return "";
  if (digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  else if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

function WhatsAppIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.38a9.86 9.86 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.77 13.98c-.24.68-1.41 1.25-1.95 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.26-4.79-4.2-4.93-4.39-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.57-.35.76-.35h.55c.17 0 .41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.42.51-.14.14-.29.29-.12.57.17.28.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.28.14.45.12.62-.07.17-.19.71-.83.9-1.11.19-.28.38-.23.64-.14.26.1 1.67.79 1.96.93.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}

export function WhatsAppHelp() {
  const settings = useSettings();
  const number = whatsappNumber(settings.data?.support);
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi, I need help with Satin.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp help"
      className="fixed bottom-4 left-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_-12px_rgba(18,140,70,0.85)] transition hover:scale-[1.03] hover:bg-[#1ebe57] sm:bottom-6 sm:left-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
