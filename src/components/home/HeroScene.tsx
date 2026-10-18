import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../../content/site";
import { Arrow } from "../Arrow";
import { EditorialHeading } from "../type/EditorialHeading";
import { FacadePanelReveal } from "./FacadePanelReveal";
import { addVisionDepth } from "./visionDepth";
import { canUseVisionThree } from "../three/visionCapabilities";
import { CanvasBoundary } from "../three/CanvasBoundary";
import { heroWalkthrough } from "../../content/heroWalkthrough";
import { ResidenceOverlay } from "./ResidenceOverlay";
import { sectionId } from "../scroll/anchors";

const HeroWalkthroughCanvas = lazy(() => import("../three/HeroWalkthroughCanvas"));

gsap.registerPlugin(ScrollTrigger);
// GSAP exposes these lifecycle events at runtime (also used by ScrollTrigger),
// but the installed declarations omit their signatures.
type MediaEvent = "matchMediaInit" | "matchMedia";
const mediaEvents = gsap as typeof gsap & {
  addEventListener(event: MediaEvent, callback: () => void): void;
  removeEventListener(event: MediaEvent, callback: () => void): void;
};
function canAnimate() {
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return (
    !device.connection?.saveData &&
    !["slow-2g", "2g"].includes(device.connection?.effectiveType ?? "") &&
    (device.deviceMemory === undefined || device.deviceMemory > 2) &&
    !matchMedia("(prefers-reduced-motion: reduce), (max-height: 500px)").matches
  );
}

/** One document pin carries the residence into the editorial chapter. */
export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const sceneRedraw = useRef<(() => void) | null>(null);
  const residenceOverlay = useRef<HTMLDivElement>(null);
  const visionProgress = useRef(0);
  const visionRedraw = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(canAnimate);
  const [failed, setFailed] = useState(false);
  const [loadVision, setLoadVision] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loadScene, setLoadScene] = useState(false);
  const [small] = useState(() => matchMedia("(max-width: 767px)").matches);
  const motion = enabled && !failed;
  const poster = small ? heroWalkthrough.mobilePoster : heroWalkthrough.poster;
  const onFailure = useCallback(() => setFailed(true), []);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const ready = sceneReady;
  const sceneEnd = heroWalkthrough.sceneEnd;

  useEffect(() => {
    if (!motion || !loadScene || sceneReady) return;
    const timer = window.setTimeout(onFailure, 25000);
    return () => clearTimeout(timer);
  }, [motion, loadScene, sceneReady, onFailure]);

  useEffect(() => {
    if (!motion || loadScene) return;
    const target = document.getElementById(sectionId(window.location.hash));
    // A pin refresh can briefly expose the hero during initial deep-link layout.
    // Wait for actual navigation before loading a scene the visitor skipped.
    let awaitingNavigation = !!target && target.id !== "main" && !root.current?.contains(target);
    const allowNavigation = () => {
      if (!awaitingNavigation) return;
      awaitingNavigation = false;
      observer.unobserve(root.current!);
      observer.observe(root.current!);
    };
    const events = ["wheel", "touchstart", "pointerdown", "keydown", "studio:scroll-to", "popstate", "hashchange"];
    events.forEach(event => window.addEventListener(event, allowNavigation, { passive: true }));
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || awaitingNavigation) return;
      setLoadScene(true);
      observer.disconnect();
    });
    // Let initial hash navigation settle before deciding whether the hero is visible.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => observer.observe(root.current!));
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      events.forEach(event => window.removeEventListener(event, allowNavigation));
    };
  }, [motion, loadScene]);

  useEffect(() => {
    const preference = matchMedia(
      "(prefers-reduced-motion: reduce), (max-height: 500px)",
    );
    const update = () => setEnabled(canAnimate());
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (!motion) {
      progress.current = 0;
      return;
    }
    let savedPosition: number | null = null;
    let restoreTimer = 0;
    let viewportWidth = innerWidth;
    let viewportHeight = innerHeight;
    let lastPosition = 0;
    let wasInside = false;
    const rememberPosition = () => {
      if (viewportWidth === innerWidth && viewportHeight === innerHeight)
        return;
      viewportWidth = innerWidth;
      viewportHeight = innerHeight;
      if (savedPosition === null && wasInside) savedPosition = lastPosition;
    };
    const restorePosition = () => {
      if (savedPosition === null) return;
      ScrollTrigger.getById("hero")?.animation?.progress(savedPosition);
      clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        const trigger = ScrollTrigger.getById("hero");
        const p = savedPosition;
        savedPosition = null;
        if (!trigger || p === null) return;
        trigger.animation?.progress(p);
        window.dispatchEvent(
          new CustomEvent("studio:scroll-to", {
            detail: trigger.start + (trigger.end - trigger.start) * p,
          }),
        );
      }, 180);
    };
    const cancelRestore = () => {
      savedPosition = null;
      clearTimeout(restoreTimer);
    };
    // Capture before matchMedia reverts its pin; restore after every chapter has
    // finished measuring. User navigation always takes precedence over resize.
    mediaEvents.addEventListener("matchMediaInit", rememberPosition);
    mediaEvents.addEventListener("matchMedia", restorePosition);
    ScrollTrigger.addEventListener("refresh", restorePosition);
    window.addEventListener("resize", rememberPosition);
    window.addEventListener("wheel", cancelRestore, { passive: true });
    window.addEventListener("pointerdown", cancelRestore);
    window.addEventListener("keydown", cancelRestore);
    window.addEventListener("studio:scroll-to", cancelRestore);
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: "(min-width: 768px)",
        mobile: "(max-width: 767px)",
        immersive: "(min-width: 1024px) and (min-height: 700px)",
      },
      (context) => {
        const node = root.current!;
        const hero = node.querySelector<HTMLElement>(".hero-stage")!;
        const opening = node.querySelector<HTMLElement>(".hero-opening")!;
        const editorial = node.querySelector<HTMLElement>(".hero-editorial")!;
        const desktop = context.conditions?.desktop;
        const playhead = { p: 0 };
        let priorSurface: boolean | null = null;
        gsap.from(".hero-opening .editorial-heading__line > span", {
          opacity: 0.45,
          yPercent: 25,
          rotation: -1.5,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "hero",
            trigger: node,
            start: "top top",
            end: () => `+=${innerHeight * (desktop ? heroWalkthrough.desktopScroll : heroWalkthrough.mobileScroll)}`,
            pin: true,
            scrub: 0.18,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        tl.to(playhead, { p: 1, duration: 2 }, 0);
        tl.to(opening, { autoAlpha: 0, y: -24, duration: 0.12 }, 0.06)
          .fromTo(".residence-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.18)
          .to(".residence-overlay", { autoAlpha: 0, duration: 0.07 }, 1.59)
          .fromTo(".residence-finish", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 1.49)
          .to(".residence-finish", { autoAlpha: 0, duration: 0.05 }, 1.64)
          .to(".hero-top, .hero-credit, .hero-scroll-cue", { autoAlpha: 0, duration: 0.08 }, 1.55);
        addVisionDepth(
          tl,
          node,
          {
            start: 1.64,
            duration: 0.32,
            immersive: !!context.conditions?.immersive,
          },
          { progress: visionProgress, redraw: visionRedraw },
        );
        tl.to({}, { duration: 0.04 }, 1.96);
        const update = () => {
          const p = playhead.p;
          const time = tl.time();
          // ScrollTrigger temporarily resets animations before its matchMedia
          // callbacks. Retain the last pose measured at the previous viewport.
          const stable =
            savedPosition === null &&
            viewportWidth === innerWidth &&
            viewportHeight === innerHeight;
          if (stable) {
            lastPosition = p;
            wasInside = p > 0.0001 && p < 0.9999;
            progress.current = Math.min(1, p / sceneEnd);
            sceneRedraw.current?.();
          }
          visionRedraw.current?.();
          node.dataset.progress = hero.dataset.progress = p.toFixed(4);
          node.dataset.chapter =
            p < 0.27
              ? "outside"
              : p < 0.56
                ? "within"
                : p < sceneEnd
                  ? "detail"
                  : "vision";
          const overScene = p < sceneEnd;
          if (overScene !== priorSurface) {
            priorSurface = overScene;
            window.dispatchEvent(new Event("studio:hero-surface"));
          }
          const openingHidden = time > 0.18;
          opening.inert = openingHidden;
          opening.setAttribute("aria-hidden", String(openingHidden));
          const finish = node.querySelector<HTMLElement>(".residence-finish");
          if (finish) {
            finish.inert = !motion || p < 0.745 || p > 0.835;
            finish.setAttribute("aria-hidden", String(finish.inert));
          }
          editorial.inert = p < 0.94;
          editorial.setAttribute("aria-hidden", String(p < 0.94));
          if (p > 0.7 && canUseVisionThree()) setLoadVision(true);
        };
        tl.eventCallback("onUpdate", update);
        update();
        return () => {
          for (const element of [opening, editorial]) {
            element.inert = false;
            element.removeAttribute("aria-hidden");
          }
          delete node.dataset.progress;
          delete hero.dataset.progress;
          delete node.dataset.chapter;
          window.dispatchEvent(new Event("studio:hero-surface"));
        };
      },
      root,
    );
    return () => {
      cancelRestore();
      mediaEvents.removeEventListener("matchMediaInit", rememberPosition);
      mediaEvents.removeEventListener("matchMedia", restorePosition);
      ScrollTrigger.removeEventListener("refresh", restorePosition);
      window.removeEventListener("resize", rememberPosition);
      window.removeEventListener("wheel", cancelRestore);
      window.removeEventListener("pointerdown", cancelRestore);
      window.removeEventListener("keydown", cancelRestore);
      window.removeEventListener("studio:scroll-to", cancelRestore);
      mm.revert();
    };
  }, [motion, sceneEnd]);

  return (
    <div
      ref={root}
      className="hero-sequence residence-sequence"
      data-static={!motion}
      data-scene="hero"
      data-scene-end={sceneEnd}
      data-renderer={motion ? ready ? "webgl" : "loading" : "static"}
    >
      <section
        className="hero hero-stage"
        aria-labelledby="hero-title"
        data-static={!motion}
        data-scene-state={!motion ? "static" : ready ? "ready" : "loading"}
      >
        <div className="hero-media" aria-hidden="true">
          <picture>
          <source media="(max-width: 767px)" srcSet={heroWalkthrough.mobilePoster} />
          <img
            className="hero-poster"
            src={poster}
            width="1920"
            height="1080"
            alt=""
            fetchPriority="high"
          />
          </picture>
          {motion && loadScene && <div className={`hero-walkthrough ${ready ? "is-ready" : ""}`}>
            <CanvasBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <HeroWalkthroughCanvas progress={progress} redraw={sceneRedraw} overlay={residenceOverlay}
                  onReady={onSceneReady} onFailure={onFailure} />
              </Suspense>
            </CanvasBoundary>
          </div>}
          <div className="hero-shade" />
        </div>
        <ResidenceOverlay overlay={residenceOverlay} />
        <div className="hero-top">
          <span className="eyebrow">Architecture & Interior Design</span>
          <span className="eyebrow">One residence / Four levels</span>
        </div>
        <div className="hero-copy hero-opening">
          <p className="eyebrow">eco28 / Form & feeling</p>
          <EditorialHeading
            as="h1"
            id="hero-title"
            lead={site.hero[0]}
            emphasis={site.hero[1]}
          />
          <div className="hero-actions">
            <Link to="/#work" className="line-link">
              Explore the work <Arrow diagonal />
            </Link>
            <Link to="/#contact" className="quiet-link">
              Discuss a project
            </Link>
          </div>
        </div>
        <div className="residence-finish" inert aria-hidden="true">
          <Link to="/#contact" className="line-link">Imagine your own residence <Arrow diagonal /></Link>
        </div>
        <p className="sr-only">Explore an original four-storey residence concept: enter the ground-floor living and dining spaces, follow the open stair to the first-floor family lounge and guest suite, the second-floor master suite and bathroom, and the third-floor study and sky terrace. Scroll in either direction to explore, or use the navigation to view our work and discuss a project.</p>
        <p className="hero-scroll-cue">
          Scroll to step inside <span aria-hidden="true">&darr;</span>
        </p>
        <a className="hero-credit" href="/media/residence-realism/ATTRIBUTION.txt" target="_blank" rel="noopener noreferrer">
          Concept residence / Visual credits
        </a>
        <p className="hero-loading" role="status" aria-live="polite">
          {failed
            ? "Explore the work below."
            : motion && !ready
              ? "Preparing the walkthrough…"
              : ""}
        </p>
      </section>
      <div className="hero-editorial">
        <FacadePanelReveal
          embedded
          threeDEnabled={motion && loadVision}
          progress={visionProgress}
          redraw={visionRedraw}
        />
      </div>
    </div>
  );
}
