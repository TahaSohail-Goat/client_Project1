import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);
export function ScrollEngine() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    let lenis: Lenis | undefined;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const configure = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = undefined;
      if (desktop.matches && !preference.matches) {
        lenis = new Lenis({ autoRaf: false, duration: 0.9, smoothWheel: true, anchors: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(tick);
      }
    };
    configure();
    preference.addEventListener('change', configure);
    desktop.addEventListener('change', configure);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); preference.removeEventListener('change', configure); desktop.removeEventListener('change', configure); };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}
