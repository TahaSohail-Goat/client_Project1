import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
// Keep Lenis's elapsed time aligned with the shared GSAP ticker.
gsap.ticker.lagSmoothing(0);
export function ScrollEngine() {
  const { pathname, hash } = useLocation();
  const engine = useRef<Lenis | null>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine)",
    );
    let lenis: Lenis | undefined;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const configure = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = undefined;
      engine.current = null;
      if (desktop.matches && !preference.matches) {
        lenis = new Lenis({
          autoRaf: false,
          duration: 0.9,
          smoothWheel: true,
          anchors: false,
          stopInertiaOnNavigate: true,
        });
        engine.current = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
      }
    };
    configure();
    const navigateSequence = (event: Event) => {
      const position = Number((event as CustomEvent<number>).detail);
      if (!Number.isFinite(position)) return;
      engine.current?.resize();
      if (engine.current)
        engine.current.scrollTo(position, { immediate: true, force: true });
      else window.scrollTo({ top: position, behavior: "instant" });
    };
    window.addEventListener("studio:scroll-to", navigateSequence);
    preference.addEventListener("change", configure);
    desktop.addEventListener("change", configure);
    return () => {
      window.removeEventListener("studio:scroll-to", navigateSequence);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      preference.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
    };
  }, []);
  useEffect(() => {
    if (!hash) {
      engine.current?.scrollTo(0, { immediate: true, force: true });
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
      const offset = Number(anchor.dataset.scrollOffset ?? 100);
      engine.current?.resize();
      const position = anchor.getBoundingClientRect().top + scrollY - offset;
      if (engine.current)
        engine.current.scrollTo(position, { immediate: true, force: true });
      else window.scrollTo({ top: position, behavior: "instant" });
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
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : document.querySelector("main > :first-child");
      if (!element) return;
      anchor = hash ? (element as HTMLElement) : null;
      finished = true;
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          engine.current?.resize();
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
