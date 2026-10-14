import { cloneElement, isValidElement, useId } from "react";

export const inputClass =
  "mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3.5 text-ink transition placeholder:text-ink-soft/60 hover:border-ink/30 focus:border-ink aria-[invalid=true]:border-rose";

export function Field({ label, error, children }) {
  const id = useId();
  const errorId = `${id}-error`;
  const single = isValidElement(children);
  const controlId = single ? children.props.id || id : undefined;
  const control = single
    ? cloneElement(children, {
        id: controlId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : children.props["aria-describedby"],
      })
    : children;

  return (
    <div className="text-sm text-ink">
      {single ? (
        <>
          <label htmlFor={controlId} className="font-medium">
            {label}
          </label>
          {control}
        </>
      ) : (
        <label className="block font-medium">
          {label}
          {control}
        </label>
      )}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-rose">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function apiErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}
