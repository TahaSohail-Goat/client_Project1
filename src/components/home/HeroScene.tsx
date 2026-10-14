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
import { addVisionDepth } from "./visionDepth";
import { addVideoStillJourney, VideoStillJourney } from "./VideoStillJourney";

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
  const [loadStills, setLoadStills] = useState(false);
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
    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)", immersive: "(min-width: 1024px) and (min-height: 700px)" }, (context) => {
      const node = root.current!;
      const opening = node.querySelector<HTMLElement>(".video-opening")!;
      const interior = node.querySelector<HTMLElement>(".video-interior-copy")!;
      const editorial = node.querySelector<HTMLElement>(".video-editorial")!;
      const desktop = context.conditions?.desktop;
      let chapter = -1;
      const playhead = { p: 0 };
      gsap.set(interior, { opacity: 0, y: 24 });
      gsap.from(".video-opening .editorial-heading__line > span", { opacity: 0.45, yPercent: 25, rotation: -1.5, duration: 0.8, stagger: 0.12, ease: "power3.out" });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        id: "hero", trigger: node, start: "top top", end: () => `+=${innerHeight * (desktop ? 9.6 : 6.8)}`,
        pin: true, scrub: desktop ? 0.45 : 0.25, invalidateOnRefresh: true, anticipatePin: 1,
      }});
      tl.to(playhead, { p: 1, duration: 2 }, 0)
        .to(opening, { opacity: 0, y: -44, duration: 0.18 }, 0.12)
        .to(interior, { opacity: 1, y: 0, duration: 0.055 }, 0.56)
        .fromTo(".video-interior-copy .editorial-heading__line > span", { yPercent: 65, rotation: -2 }, { yPercent: 0, rotation: 0, stagger: 0.02, duration: 0.06, immediateRender: false }, 0.57)
        .to(interior, { opacity: 0, y: -20, duration: 0.07 }, 0.71)
        .to(".video-hero .hero-top", { opacity: 0, duration: 0.06 }, 0.77);
      addVideoStillJourney(tl, node, { start: 0.88 });
      addVisionDepth(tl, node, { start: 1.48, duration: 0.46, immersive: !!context.conditions?.immersive });
      tl.to({}, { duration: 0.06 }, 1.94);
      const update = () => {
        const p = playhead.p;
        const time = tl.time();
        progress.current = Math.min(1, p / videoHero.filmEnd);
        requestSeek();
        node.dataset.progress = p.toFixed(4);
        opening.inert = time > 0.3;
        opening.setAttribute("aria-hidden", String(time > 0.3));
        interior.setAttribute("aria-hidden", String(time < 0.56 || time > 0.78));
        editorial.inert = p < 0.92;
        editorial.setAttribute("aria-hidden", String(p < 0.92));
        if (p > 0.34) setLoadStills(true);
        const stillJourney = node.querySelector<HTMLElement>(".video-stills");
        const stillsActive = time >= 0.88 && time < 1.5;
        if (stillJourney) {
          stillJourney.inert = !stillsActive;
          stillJourney.setAttribute("aria-hidden", String(!stillsActive));
          const activeIndex = time < 1.14 ? 0 : time < 1.34 ? 1 : 2;
          stillJourney.querySelectorAll<HTMLElement>(".video-still-slide").forEach((slide, index) => {
            const active = stillsActive && index === activeIndex;
            slide.inert = !active;
            slide.setAttribute("aria-hidden", String(!active));
          });
        }
        const next = time < 0.19 ? 0 : time < 0.5 ? 1 : time < 0.7 ? 2 : time < 0.84 ? 3 : 4;
        if (next === chapter) return;
        chapter = next;
        node.dataset.chapter = heroChapters[next].id;
      };
      tl.eventCallback("onUpdate", update);
      update();
      return () => {
        for (const element of [opening, interior, editorial]) { element.inert = false; element.removeAttribute("aria-hidden"); }
        const stillJourney = node.querySelector<HTMLElement>(".video-stills");
        if (stillJourney) { stillJourney.inert = false; stillJourney.removeAttribute("aria-hidden"); stillJourney.querySelectorAll<HTMLElement>(".video-still-slide").forEach((slide) => { slide.inert = false; slide.removeAttribute("aria-hidden"); }); }
        delete node.dataset.progress;
        delete node.dataset.chapter;
      };
    }, root);
    return () => mm.revert();
  }, [enabled, requestSeek]);
  return <section ref={root} className={`hero video-hero ${ready ? "film-ready" : ""}`} aria-labelledby="hero-title"
    data-scene="hero" data-static={!enabled} data-video-state={!enabled ? "static" : ready ? "ready" : "loading"}>
    <div className="video-media" aria-hidden="true">
      <img className="video-poster" src={videoHero.poster} width="1280" height="720" alt="" fetchPriority="high" />
      {source && <video ref={video} className="hero-video" src={source} poster={videoHero.poster} preload="auto" muted playsInline disablePictureInPicture tabIndex={-1} />}
      <div className="video-shade" />
    </div>
    <VideoStillJourney loadImages={loadStills} />
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
  </section>;
}
export function HeroScene() {
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  return failed ? <PhotographicHero notice="Film unavailable. Explore the photographic journey." /> : <ScrollVideoHero onFailure={onFailure} />;
}
