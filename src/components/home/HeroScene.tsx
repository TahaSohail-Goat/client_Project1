import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { videoHero } from "../../content/videoHero";
import { heroChapters } from "../../content/hero";
import { site } from "../../content/site";
import { useVideoScrub } from "../../hooks/useVideoScrub";
import { Arrow } from "../Arrow";
import { EditorialHeading } from "../type/EditorialHeading";
import { FacadePanelReveal } from "./FacadePanelReveal";
import { PhotographicHero } from "./PhotographicHero";

gsap.registerPlugin(ScrollTrigger);
function canAnimate() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return !saveData && !matchMedia("(prefers-reduced-motion: reduce), (max-height: 500px)").matches;
}
function ScrollVideoHero({ onFailure }: { onFailure: () => void }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef(0);
  const [enabled, setEnabled] = useState(canAnimate);
  // Keep the loaded rendition through resizes to avoid decoder resets and re-downloads.
  const [small] = useState(() => matchMedia("(max-width: 767px)").matches);
  const source = enabled ? small ? videoHero.mobile : videoHero.desktop : null;
  const { ready, buffering, requestSeek } = useVideoScrub(video, progress, source, onFailure);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce), (max-height: 500px)");
    const update = () => setEnabled(canAnimate());
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    if (!enabled) { progress.current = 0; return; }
    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (context) => {
      const node = root.current!;
      const opening = node.querySelector<HTMLElement>(".video-opening")!;
      const interior = node.querySelector<HTMLElement>(".video-interior-copy")!;
      const editorial = node.querySelector<HTMLElement>(".video-editorial")!;
      const panel = node.querySelector<HTMLElement>(".ivory-panel")!;
      const buttons = Array.from(node.querySelectorAll<HTMLButtonElement>(".journey-chapters button"));
      const bar = node.querySelector<HTMLElement>(".journey-progress-fill")!;
      const status = node.querySelector<HTMLElement>(".journey-status")!;
      const desktop = context.conditions?.desktop;
      let chapter = -1;
      const playhead = { p: 0 };
      gsap.set(panel, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(interior, { opacity: 0, y: 24 });
      gsap.set(".video-editorial .vision-line > span", { yPercent: 112 });
      gsap.set([".video-editorial .vision-copy", ".video-editorial .vision-kicker"], { opacity: 0 });
      gsap.set(".video-editorial .vision-composition", { clipPath: "inset(100% 0% 0% 0%)", y: 24 });
      gsap.from(".video-opening .editorial-heading__line > span", { opacity: 0.45, yPercent: 25, rotation: -1.5, duration: 0.8, stagger: 0.12, ease: "power3.out" });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        id: "hero", trigger: node, start: "top top", end: () => `+=${innerHeight * (desktop ? 4.8 : 3.4)}`,
        pin: true, scrub: desktop ? 0.45 : 0.25, invalidateOnRefresh: true, anticipatePin: 1,
      }});
      tl.to(playhead, { p: 1, duration: 1 }, 0)
        .to(opening, { opacity: 0, y: -44, duration: 0.18 }, 0.12)
        .to(interior, { opacity: 1, y: 0, duration: 0.055 }, 0.56)
        .fromTo(".video-interior-copy .editorial-heading__line > span", { yPercent: 65, rotation: -2 }, { yPercent: 0, rotation: 0, stagger: 0.02, duration: 0.06, immediateRender: false }, 0.57)
        .to(interior, { opacity: 0, y: -20, duration: 0.07 }, 0.71)
        .to(".video-hero .hero-top", { opacity: 0, duration: 0.06 }, 0.77)
        .to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.15 }, 0.8)
        .to(".video-editorial .vision-kicker", { opacity: 1, duration: 0.04 }, 0.85)
        .to(".video-editorial .vision-line > span", { yPercent: 0, stagger: 0.018, duration: 0.065 }, 0.85)
        .to(".video-editorial .vision-composition", { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.065 }, 0.885)
        .to(".video-editorial .vision-copy", { opacity: 1, duration: 0.05 }, 0.91)
        .to(".video-hero .journey-controls", { color: "#171c1a", duration: 0.04 }, 0.8);
      const update = () => {
        const p = playhead.p;
        progress.current = Math.min(1, p / videoHero.filmEnd);
        requestSeek();
        node.dataset.progress = p.toFixed(4);
        bar.style.transform = `scaleX(${p})`;
        opening.inert = p > 0.3;
        opening.setAttribute("aria-hidden", String(p > 0.3));
        interior.setAttribute("aria-hidden", String(p < 0.56 || p > 0.78));
        editorial.inert = p < 0.95;
        editorial.setAttribute("aria-hidden", String(p < 0.95));
        const next = p < 0.19 ? 0 : p < 0.5 ? 1 : p < 0.7 ? 2 : p < 0.84 ? 3 : 4;
        if (next === chapter) return;
        chapter = next;
        node.dataset.chapter = heroChapters[next].id;
        status.textContent = `${String(next + 1).padStart(2, "0")} / ${heroChapters[next].label}`;
        buttons.forEach((button, i) => {
          if (i === next) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
      };
      tl.eventCallback("onUpdate", update);
      update();
      return () => {
        for (const element of [opening, interior, editorial]) { element.inert = false; element.removeAttribute("aria-hidden"); }
        delete node.dataset.progress;
        delete node.dataset.chapter;
        bar.style.transform = "";
      };
    }, root);
    return () => mm.revert();
  }, [enabled, requestSeek]);
  const jump = (p: number) => {
    ScrollTrigger.refresh();
    const trigger = ScrollTrigger.getById("hero");
    if (trigger) window.dispatchEvent(new CustomEvent("studio:scroll-to", { detail: trigger.start + (trigger.end - trigger.start) * p }));
  };
  return <section ref={root} className={`hero video-hero ${ready ? "film-ready" : ""}`} aria-labelledby="hero-title"
    data-scene="hero" data-static={!enabled} data-video-state={!enabled ? "static" : ready ? "ready" : "loading"}>
    <div className="video-media" aria-hidden="true">
      <img className="video-poster" src={videoHero.poster} width="1280" height="720" alt="" fetchPriority="high" />
      {source && <video ref={video} className="hero-video" src={source} poster={videoHero.poster} preload="auto" muted playsInline disablePictureInPicture tabIndex={-1} />}
      <div className="video-shade" />
    </div>
    <div className="hero-top"><span className="eyebrow">Architecture & Interior Design</span><span className="eyebrow">An exterior-to-interior journey</span></div>
    <div className="hero-copy video-opening">
      <p className="eyebrow">eco28 / Form & feeling</p>
      <EditorialHeading as="h1" id="hero-title" lead={site.hero[0]} emphasis={site.hero[1]} />
      <div className="hero-actions"><Link to="/#work" className="line-link">Explore the work <Arrow diagonal /></Link><Link to="/#contact" className="quiet-link">Discuss a project</Link></div>
    </div>
    <div className="video-interior-copy">
      <p className="eyebrow">Spaces for everyday life</p>
      <EditorialHeading lead="Outside." emphasis="Then within." />
    </div>
    <p className="video-loading" role="status" aria-live="polite">
      {enabled && !ready ? "Preparing the film…" : buffering ? "Preparing this view…" : ""}
    </p>
    <div className="video-editorial"><FacadePanelReveal embedded /></div>
    <div className="journey-controls">
      <div className="journey-control-row">
        <span className="journey-status eyebrow" role="status">01 / Arrival</span>
        <nav className="journey-chapters" aria-label="Opening sequence chapters">
          {heroChapters.map((chapter, i) => <button key={chapter.id} type="button" onClick={() => jump(videoHero.chapterProgress[i])}
            aria-label={`Jump to ${chapter.label} chapter`} aria-current={i === 0 ? "step" : undefined}>
            <span className="chapter-number">0{i + 1}</span><span className="chapter-word">{chapter.label}</span>
          </button>)}
        </nav>
        <Link className="journey-skip" to="/#selected-work">Skip sequence <span aria-hidden="true">↓</span></Link>
      </div>
      <div className="journey-progress" aria-hidden="true"><span className="journey-progress-fill" /></div>
    </div>
  </section>;
}
export function HeroScene() {
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  return failed ? <PhotographicHero notice="Film unavailable. Explore the photographic journey." /> : <ScrollVideoHero onFailure={onFailure} />;
}
