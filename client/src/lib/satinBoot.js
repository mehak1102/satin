const MIN_MS = 2000;
const MIN_REDUCED_MS = 400;
const FADE_MS = 620;

function waitForWindow() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

export function dismissSatinBoot() {
  const boot = document.getElementById("satin-boot");
  if (!boot) return;

  const started = performance.now();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const min = reduce ? MIN_REDUCED_MS : MIN_MS;

  Promise.all([document.fonts?.ready ?? Promise.resolve(), waitForWindow()]).then(() => {
    const wait = Math.max(0, min - (performance.now() - started));
    window.setTimeout(() => {
      boot.classList.add("is-done");
      document.body.classList.remove("satin-booting");
      document.dispatchEvent(new Event("satin-boot-done"));
      window.setTimeout(() => boot.remove(), FADE_MS);
    }, wait);
  });
}
