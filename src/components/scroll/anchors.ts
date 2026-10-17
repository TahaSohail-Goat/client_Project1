import { ScrollTrigger } from "gsap/ScrollTrigger";

export function sectionId(hash: string) {
  const id = hash.slice(1);
  try { return decodeURIComponent(id); }
  catch { return id; }
}

export function sectionTop(target: HTMLElement) {
  // A pinned chapter's rectangle moves with the viewport, while its start is fixed.
  const pinned = ScrollTrigger.getAll().find(
    (trigger) => trigger.trigger === target && trigger.pin,
  );
  return pinned ? pinned.start : target.getBoundingClientRect().top + window.scrollY;
}

export function sectionScrollPosition(target: HTMLElement) {
  return sectionTop(target) - Number(target.dataset.scrollOffset ?? 100);
}

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  window.dispatchEvent(new CustomEvent("studio:scroll-to", {
    detail: sectionScrollPosition(target),
  }));
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
}
