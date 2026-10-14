const pulse = "animate-pulse bg-blush";

export function PackGridSkeleton({ count = 3, columns = "sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`mt-10 grid gap-8 ${columns}`} aria-busy="true">
      <p className="sr-only">Loading packs…</p>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true">
          <div className={`aspect-[5/4] rounded-[28px] ${pulse}`} />
          <div className={`mt-4 h-6 w-2/3 rounded-full ${pulse}`} />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded-full bg-line" />
        </div>
      ))}
    </div>
  );
}

export function PackDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16" aria-busy="true">
      <p className="sr-only">Loading pack…</p>
      <div aria-hidden="true" className={`aspect-square rounded-[32px] ${pulse}`} />
      <div aria-hidden="true" className="space-y-4">
        <div className={`h-4 w-24 rounded-full ${pulse}`} />
        <div className={`h-12 w-2/3 rounded-full ${pulse}`} />
        <div className={`h-6 w-24 rounded-full ${pulse}`} />
        <div className={`h-28 rounded-2xl ${pulse}`} />
      </div>
    </div>
  );
}

export function LoadError({ className = "mt-10", children, onRetry }) {
  return (
    <p className={`${className} text-plum`}>
      {children}{" "}
      <button type="button" className="underline" onClick={onRetry}>
        Try again
      </button>
    </p>
  );
}
