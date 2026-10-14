import fullLogo from "../../assets/satin-logo.png";
import wordmark from "../../assets/satin-wordmark.png";

export function Logo({ className = "h-8", withTagline = false, light = false }) {
  return (
    <img
      src={withTagline ? fullLogo : wordmark}
      alt={withTagline ? "Satin - soft absorbent for bold moves" : "Satin"}
      width={1024}
      height={withTagline ? 377 : 339}
      className={`${className} w-auto ${light ? "brightness-0 invert" : ""}`}
      draggable="false"
    />
  );
}
