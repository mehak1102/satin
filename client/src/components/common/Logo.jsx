export function Logo({ className = "h-8" }) {
  return (
    <svg className={className} viewBox="0 0 168 48" role="img" aria-label="Satin">
      <text
        x="0"
        y="36"
        fill="currentColor"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="40"
        fontStyle="italic"
        fontWeight="560"
      >
        Satin
      </text>
    </svg>
  );
}
