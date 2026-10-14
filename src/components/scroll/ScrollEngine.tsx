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
    const observer = new MutationObserver(() => locate());
    const locate = () => {
      if (finished) return;
      const element = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : document.querySelector("main > :first-child");
      if (!element) return;
      finished = true;
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          engine.current?.resize();
          if (hash) {
            const offset = Number(element.getAttribute("data-scroll-offset") ?? 100);
            if (engine.current)
              engine.current.scrollTo(element as HTMLElement, {
                immediate: true,
                force: true,
                offset: 100 - offset,
              });
            else
              window.scrollTo({
                top: element.getBoundingClientRect().top + scrollY - offset,
                behavior: "instant",
              });
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
      window.clearTimeout(timeout);
    };
  }, [pathname, hash]);
  return null;
}
