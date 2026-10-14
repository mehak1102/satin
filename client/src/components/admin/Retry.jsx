export function Retry({ message, onRetry, className = "" }) {
  return (
    <p className={`text-rose ${className}`}>
      {message}{" "}
      <button type="button" className="underline" onClick={onRetry}>
        Try again
      </button>
    </p>
  );
}
