import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { CanvasBoundary } from "../three/CanvasBoundary";
import { HousingPoster } from "../three/HousingPoster";
import { housingChapters } from "../../content/housing";
import { Arrow } from "../Arrow";

const HousingCanvas = lazy(() => import("../three/HousingCanvas"));
gsap.registerPlugin(ScrollTrigger);

export function HousingStudy() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const redraw = useRef<(() => void) | null>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: no-preference)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      setReady(false);
      setLoad(false);
      if (!preference.matches || saveData) return;
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        const probe = document.createElement("canvas");
        const gl = probe.getContext("webgl2");
        if (gl) {
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          setLoad(true);
        } else onFailure();
        observer?.disconnect();
      }, { rootMargin: "900px" });
      observer.observe(section.current!);
    };
    setup();
    preference.addEventListener("change", setup);
    return () => { observer?.disconnect(); preference.removeEventListener("change", setup); };
  }, [onFailure]);

  useLayoutEffect(() => {
    if (!load || failed) return;
    const mm = gsap.matchMedia();
    mm.add({
      desktop: "(min-width: 768px) and (min-height: 651px)",
      motion: "(prefers-reduced-motion: no-preference)",
    }, (context) => {
      if (!context.conditions?.motion) return;
      const desktop = context.conditions.desktop;
      const node = section.current!;
      const value = { p: 0 };
      let previous = -1;
      const tween = gsap.to(value, {
        p: 1, ease: "none",
        scrollTrigger: {
          id: "housing-study", trigger: node,
          start: desktop ? "top top" : "top 70%",
          end: desktop ? () => `+=${innerHeight * 2.5}` : "bottom 30%",
          pin: !!desktop, scrub: desktop ? 0.65 : 0.3,
          invalidateOnRefresh: true, anticipatePin: 1,
        },
        onUpdate: () => {
          progress.current = value.p;
          node.dataset.progress = value.p.toFixed(3);
          node.style.setProperty("--housing-progress", String(value.p));
          redraw.current?.();
          const chapter = value.p < 0.33 ? 0 : value.p < 0.72 ? 1 : 2;
          if (chapter === previous) return;
          previous = chapter;
          node.querySelectorAll<HTMLElement>(".housing-note").forEach((element, i) => {
            element.dataset.active = String(i === chapter);
          });
          node.querySelectorAll<HTMLElement>(".housing-chapter-button").forEach((element, i) => {
            if (i === chapter) element.setAttribute("aria-current", "step");
            else element.removeAttribute("aria-current");
          });
        },
      });
      return () => {
        tween.kill();
        progress.current = 0;
        redraw.current?.();
        node.style.removeProperty("--housing-progress");
        node.removeAttribute("data-progress");
      };
    }, section);
    return () => mm.revert();
  }, [load, failed]);

  const goToChapter = (p: number) => {
    const trigger = ScrollTrigger.getById("housing-study");
    if (!trigger) return;
    window.dispatchEvent(new CustomEvent("studio:scroll-to", { detail: trigger.start + (trigger.end - trigger.start) * p }));
  };
  return <section id="housing" ref={section} className={`housing-study ${ready ? "is-ready" : ""}`}
    aria-labelledby="housing-title" data-animated={load && !failed} data-scroll-offset="0"
    data-renderer={ready ? "webgl" : failed ? "fallback" : load ? "loading" : "static"}>
    <div className="housing-copy">
      <p className="eyebrow">eco28 / A spatial study</p>
      <h2 id="housing-title">Space,<br /><em>unfolded.</em></h2>
      <p className="housing-intro">A contemporary house, explored from the outside in.</p>
    </div>
    <div className="housing-visual" role="img" aria-label="Conceptual 3D house with stone walls, timber details, glazed living spaces, a bedroom and an animated roof that lifts to reveal the floor plan.">
      <div className="housing-poster-wrap"><HousingPoster /></div>
      {load && !failed && <div className="housing-canvas" aria-hidden="true">
        <CanvasBoundary onFailure={onFailure}><Suspense fallback={null}>
          <HousingCanvas progress={progress} redraw={redraw} onReady={onReady} onFailure={onFailure} />
        </Suspense></CanvasBoundary>
      </div>}
      <span className="housing-model-label">Conceptual housing study / Not a client project</span>
    </div>
    <div className="housing-notes">
      {housingChapters.map((chapter, i) => <div key={chapter.title} className="housing-note" data-active={i === 0}>
        <span>0{i + 1}</span><div><h3>{chapter.title}</h3><p>{chapter.text}</p></div>
      </div>)}
    </div>
    <div className="housing-toolbar">
      {load && !failed ? <nav aria-label="Housing study views">
        {housingChapters.map((chapter, i) => <button key={chapter.title} className="housing-chapter-button"
          aria-current={i === 0 ? "step" : undefined} onClick={() => goToChapter(chapter.progress)}>
          <span>0{i + 1}</span>{["Exterior", "Open roof", "Spatial overview"][i]}
        </button>)}
      </nav> : <span className="eyebrow">Form / Shelter / Space</span>}
      <Link to="/#model-studies" className="housing-next">Physical model studies <Arrow /></Link>
      <div className="housing-progress" aria-hidden="true"><span /></div>
    </div>
  </section>;
}
