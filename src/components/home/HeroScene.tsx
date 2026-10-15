import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { videoHero } from "../../content/videoHero";
import { site } from "../../content/site";
import { useVideoScrub } from "../../hooks/useVideoScrub";
import { Arrow } from "../Arrow";
import { EditorialHeading } from "../type/EditorialHeading";
import { FacadePanelReveal } from "./FacadePanelReveal";
import { addVisionDepth } from "./visionDepth";
import { canUseVisionThree } from "../three/visionCapabilities";

gsap.registerPlugin(ScrollTrigger);
// GSAP exposes these lifecycle events at runtime (also used by ScrollTrigger),
// but the installed declarations omit their signatures.
type MediaEvent = "matchMediaInit" | "matchMedia";
const mediaEvents = gsap as typeof gsap & {
  addEventListener(event: MediaEvent, callback: () => void): void;
  removeEventListener(event: MediaEvent, callback: () => void): void;
};
function canAnimate() {
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  return (
    !saveData &&
    !matchMedia("(prefers-reduced-motion: reduce), (max-height: 500px)").matches
  );
}

/** One document pin carries the independent film into the next editorial chapter. */
export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef(0);
  const visionProgress = useRef(0);
  const visionRedraw = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(canAnimate);
  const [failed, setFailed] = useState(false);
  const [loadVision, setLoadVision] = useState(false);
  const [small] = useState(() => matchMedia("(max-width: 767px)").matches);
  const motion = enabled && !failed;
  const source = motion ? (small ? videoHero.mobile : videoHero.desktop) : null;
  const onFailure = useCallback(() => setFailed(true), []);
  const { ready, buffering, requestSeek } = useVideoScrub(
    video,
    progress,
    source,
    onFailure,
  );

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
        const hero = node.querySelector<HTMLElement>(".video-hero")!;
        const opening = node.querySelector<HTMLElement>(".video-opening")!;
        const interior = node.querySelector<HTMLElement>(
          ".video-interior-copy",
        )!;
        const detail = node.querySelector<HTMLElement>(".video-detail-copy")!;
        const editorial = node.querySelector<HTMLElement>(".video-editorial")!;
        const desktop = context.conditions?.desktop;
        const playhead = { p: 0 };
        gsap.set([interior, detail], { autoAlpha: 0, y: 24 });
        gsap.from(".video-opening .editorial-heading__line > span", {
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
            end: () => `+=${innerHeight * (desktop ? 9.6 : 6.8)}`,
            pin: true,
            scrub: desktop ? 0.45 : 0.25,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        tl.to(playhead, { p: 1, duration: 2 }, 0)
          .to(opening, { autoAlpha: 0, y: -44, duration: 0.2 }, 0.14)
          .to(interior, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.64)
          .fromTo(
            ".video-interior-copy .editorial-heading__line > span",
            { yPercent: 65, rotation: -2 },
            {
              yPercent: 0,
              rotation: 0,
              stagger: 0.035,
              duration: 0.12,
              immediateRender: false,
            },
            0.65,
          )
          .to(interior, { autoAlpha: 0, y: -24, duration: 0.1 }, 0.96)
          .to(detail, { autoAlpha: 1, y: 0, duration: 0.12 }, 1.16)
          .to(detail, { autoAlpha: 0, y: -24, duration: 0.1 }, 1.45)
          .to(
            ".hero-top, .hero-film-credit, .hero-scroll-cue",
            { autoAlpha: 0, duration: 0.08 },
            1.55,
          );
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
            progress.current = Math.min(1, p / videoHero.filmEnd);
            requestSeek();
          }
          visionRedraw.current?.();
          node.dataset.progress = hero.dataset.progress = p.toFixed(4);
          node.dataset.chapter =
            p < 0.27
              ? "outside"
              : p < 0.56
                ? "within"
                : p < videoHero.filmEnd
                  ? "detail"
                  : "vision";
          opening.inert = time > 0.34;
          opening.setAttribute("aria-hidden", String(time > 0.34));
          interior.setAttribute(
            "aria-hidden",
            String(time < 0.64 || time > 1.06),
          );
          detail.setAttribute(
            "aria-hidden",
            String(time < 1.16 || time > 1.55),
          );
          editorial.inert = p < 0.94;
          editorial.setAttribute("aria-hidden", String(p < 0.94));
          if (p > 0.7 && canUseVisionThree()) setLoadVision(true);
        };
        tl.eventCallback("onUpdate", update);
        update();
        return () => {
          for (const element of [opening, interior, detail, editorial]) {
            element.inert = false;
            element.removeAttribute("aria-hidden");
          }
          delete node.dataset.progress;
          delete hero.dataset.progress;
          delete node.dataset.chapter;
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
  }, [motion, requestSeek]);

  return (
    <div
      ref={root}
      className="hero-sequence"
      data-static={!motion}
      data-scene="hero"
      data-film-end={videoHero.filmEnd}
    >
      <section
        className={`hero video-hero ${ready ? "film-ready" : ""}`}
        aria-labelledby="hero-title"
        data-static={!motion}
        data-video-state={!motion ? "static" : ready ? "ready" : "loading"}
      >
        <div className="video-media" aria-hidden="true">
          <img
            className="video-poster"
            src={videoHero.poster}
            width="1920"
            height="1080"
            alt=""
            fetchPriority="high"
          />
          {source && (
            <video
              ref={video}
              className="hero-video"
              src={source}
              poster={videoHero.poster}
              preload="auto"
              muted
              playsInline
              disablePictureInPicture
              tabIndex={-1}
            />
          )}
          <div className="video-shade" />
        </div>
        <div className="hero-top">
          <span className="eyebrow">Architecture & Interior Design</span>
          <span className="eyebrow">Outside, then within</span>
        </div>
        <div className="hero-copy video-opening">
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
        <div className="video-interior-copy">
          <p className="eyebrow">A change of perspective</p>
          <EditorialHeading lead="Outside." emphasis="Then within." />
        </div>
        <div className="video-detail-copy">
          <p className="eyebrow">Light, texture, atmosphere</p>
          <EditorialHeading lead="Space to" emphasis="feel at home." />
        </div>
        <p className="hero-scroll-cue">
          Scroll to step inside <span aria-hidden="true">&darr;</span>
        </p>
        <a
          className="hero-film-credit"
          href={videoHero.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visual study / Film by {videoHero.credit}
        </a>
        <p className="video-loading" role="status" aria-live="polite">
          {failed
            ? "Film unavailable. Explore the work below."
            : motion && !ready
              ? "Preparing the film…"
              : buffering
                ? "Preparing this view…"
                : ""}
        </p>
      </section>
      <div className="video-editorial">
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
