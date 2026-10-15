import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const snapshot = () => window.matchMedia(query).matches;
function subscribe(onChange: () => void) {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

/** Respond to preference changes as well as the initial setting. */
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
