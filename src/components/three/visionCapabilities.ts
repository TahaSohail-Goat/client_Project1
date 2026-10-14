export function canUseVisionThree() {
  if (typeof window === "undefined") return false;
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean };
  }).connection;
  return (
    window.matchMedia(
      "(min-width: 1024px) and (min-height: 700px) and (pointer: fine)",
    ).matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !connection?.saveData
  );
}
