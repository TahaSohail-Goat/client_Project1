import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToSection, sectionId, sectionScrollPosition } from "./anchors";

gsap.registerPlugin(ScrollTrigger);
export function ScrollEngine() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const navigateSequence = (event: Event) => {
      const position = Number((event as CustomEvent<number>).detail);
      if (!Number.isFinite(position)) return;
      window.scrollTo({ top: position, behavior: "instant" });
    };
    let repeatFrame = 0;
    const repeatContentAnchor = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("main a[href]") : null;
      if (!link || link.download || (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname !== window.location.pathname ||
        !destination.hash || destination.hash !== window.location.hash) return;
      // React Router keeps the same hash effect when a content link is reused.
      // Capture the click before it updates the URL, then restore the chapter.
      cancelAnimationFrame(repeatFrame);
      repeatFrame = requestAnimationFrame(() => scrollToSection(sectionId(destination.hash)));
    };
    window.addEventListener("studio:scroll-to", navigateSequence);
    document.addEventListener("click", repeatContentAnchor, true);
    return () => {
      window.removeEventListener("studio:scroll-to", navigateSequence);
      document.removeEventListener("click", repeatContentAnchor, true);
      cancelAnimationFrame(repeatFrame);
    };
  }, []);
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    let frame = 0;
    let timeout = 0;
    let finished = false;
    let anchor: HTMLElement | null = null;
    let userMoved = false;
    let layoutFrame = 0;
    const alignAnchor = () => {
      if (!anchor || userMoved) return;
      const position = sectionScrollPosition(anchor);
      window.scrollTo({ top: position, behavior: "instant" });
    };
    // Media/canvas readiness can add a pin after initial hash navigation.
    // Follow those layout changes until the visitor starts their own navigation.
    const layoutChanged = () => {
      if (!hash || userMoved) return;
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(alignAnchor);
    };
    const userIntent = () => {
      userMoved = true;
    };
    const keyboardIntent = (event: KeyboardEvent) => {
      if (
        [
          "Tab",
          "Enter",
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        userIntent();
    };
    ScrollTrigger.addEventListener("refresh", layoutChanged);
    window.addEventListener("wheel", userIntent, { passive: true });
    window.addEventListener("touchstart", userIntent, { passive: true });
    window.addEventListener("pointerdown", userIntent, { passive: true });
    window.addEventListener("keydown", keyboardIntent);
    window.addEventListener("studio:scroll-to", userIntent);
    const observer = new MutationObserver(() => locate());
    const locate = () => {
      if (finished) return;
      const element = hash
        ? document.getElementById(sectionId(hash))
        : document.querySelector("main > :first-child");
      if (!element) return;
      anchor = hash ? (element as HTMLElement) : null;
      finished = true;
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          if (hash) {
            alignAnchor();
            (element as HTMLElement).tabIndex = -1;
            (element as HTMLElement).focus({ preventScroll: true });
          }
        });
      });
    };
    observer.observe(document.getElementById("main")!, {
      childList: true,
      subtree: true,
    });
    locate();
    timeout = window.setTimeout(() => observer.disconnect(), 5000);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      ScrollTrigger.removeEventListener("refresh", layoutChanged);
      window.removeEventListener("wheel", userIntent);
      window.removeEventListener("touchstart", userIntent);
      window.removeEventListener("pointerdown", userIntent);
      window.removeEventListener("keydown", keyboardIntent);
      window.removeEventListener("studio:scroll-to", userIntent);
      window.clearTimeout(timeout);
    };
  }, [pathname, hash]);
  return null;
}
