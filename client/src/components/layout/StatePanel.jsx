export function StatePanel({ icon: Icon, title, text, children, className = "mt-12" }) {
  return (
    <div className={`${className} rounded-[32px] bg-[#f8d6e3] px-7 py-12 text-center text-ink sm:px-10 sm:py-16`}>
      {Icon && (
        <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/70 text-plum">
          <Icon size={22} />
        </span>
      )}
      <p className="mt-6 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] leading-tight font-medium">{title}</p>
      {text && <p className="mx-auto mt-3 max-w-md leading-7 text-ink-soft">{text}</p>}
      {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 bg-white/60 px-7 py-3.5 text-sm font-medium text-ink transition hover:border-ink disabled:opacity-40";

export const panelClass =
  "rounded-[28px] border border-line bg-white/70 shadow-[0_24px_44px_-38px_rgba(20,56,76,0.6)] backdrop-blur";
