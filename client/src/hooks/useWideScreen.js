import { useEffect, useState } from "react";

const wideQuery = "(min-width: 1024px)";

export function useWideScreen() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(wideQuery).matches);

  useEffect(() => {
    const media = window.matchMedia(wideQuery);
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return wide;
}
