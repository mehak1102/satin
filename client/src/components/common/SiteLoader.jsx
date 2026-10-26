export function SiteLoader({ compact = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        compact
          ? "relative mx-auto flex min-h-[52vh] max-w-3xl flex-col items-center justify-center px-6 py-10"
          : "relative flex min-h-[70vh] flex-col items-center justify-center px-6"
      }
    >
      <span className="sr-only">Loading Satin</span>
      <img className="satin-boot-bouquet" src="/home/satin-boot-bouquet.png" width={821} height={756} alt="" />
      <img className="satin-boot-logo" src="/satin-wordmark.png" width={1024} height={339} alt="Satin" />
      <p className="satin-boot-heading">Women&apos;s hygiene products</p>
      <span aria-hidden="true" className="satin-boot-dots mt-5 flex gap-1.5">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
