import { Link } from "react-router-dom";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  modelStudies,
  modelPose,
  type ModelRibbonLayout,
} from "../../content/models";
import { PhotoImage } from "../PhotoImage";
import { CanvasBoundary } from "../three/CanvasBoundary";
import { CinematicHeading } from "../type/CinematicHeading";
import { Arrow } from "../Arrow";

gsap.registerPlugin(ScrollTrigger);
const PhotoPlanes = lazy(() => import("../three/PhotoPlanes"));
const immersiveQuery =
  "(min-width: 1024px) and (min-height: 560px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const immersiveAllowed = () =>
  matchMedia(immersiveQuery).matches &&
  !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;

export function ScaleModelScene() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const layout = useRef<ModelRibbonLayout>({
    width: 0,
    height: 0,
    distance: 0,
    frames: [],
  });
  const redraw = useRef<(() => void) | null>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [immersive, setImmersive] = useState(immersiveAllowed);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);

  useEffect(() => {
    const query = matchMedia(immersiveQuery);
    const update = () => setImmersive(immersiveAllowed());
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!immersive || load) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLoad(true);
        observer.disconnect();
      },
      { rootMargin: "360px 0px" },
    );
    observer.observe(root.current!);
    return () => observer.disconnect();
  }, [immersive, load]);

  useLayoutEffect(() => {
    if (!immersive) return;
    const section = root.current!;
    const viewport = stage.current!;
    const ribbon = track.current!;
    const cards = Array.from(
      ribbon.querySelectorAll<HTMLElement>(".model-ribbon-card"),
    );
    const images = cards.map(
      (card) => card.querySelector<HTMLElement>(".model-ribbon-photo")!,
    );
    const progressBar = section.querySelector(".model-ribbon-progress span")!;
    const context = gsap.context(() => {
      const measure = () => {
        layout.current = {
          width: viewport.clientWidth,
          height: viewport.clientHeight,
          distance: Math.max(0, ribbon.scrollWidth - viewport.clientWidth),
          frames: cards.map((card, index) => ({
            x: card.offsetLeft,
            y: card.offsetTop,
            width: images[index].offsetWidth,
            height: images[index].offsetHeight,
          })),
        };
      };
      const paint = () => {
        const p = progress.current;
        viewport.scrollLeft = 0;
        section.dataset.progress = p.toFixed(4);
        gsap.set(ribbon, { x: -layout.current.distance * p });
        images.forEach((image, index) => {
          const pose = modelPose(layout.current, p, index);
          gsap.set(image, {
            rotationY: (pose.rotateY * 180) / Math.PI,
            rotation: (pose.rotateZ * 180) / Math.PI,
            y: pose.y,
            scale: pose.scale,
            force3D: true,
          });
        });
        const index = Math.min(
          modelStudies.length - 1,
          Math.round(p * (modelStudies.length - 1)),
        );
        section.querySelector(".model-ribbon-current")!.textContent = String(
          index + 1,
        ).padStart(2, "0");
        gsap.set(progressBar, { scaleX: p });
        redraw.current?.();
      };
      measure();
      gsap.set("#model-title .cinematic-word", {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        x: 0,
        rotateZ: 0,
      });
      timeline.current = gsap
        .timeline({
          scrollTrigger: {
            id: "models",
            trigger: section,
            start: "top top",
            end: () =>
              `+=${Math.max(innerHeight * 2, layout.current.distance * 1.25)}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefreshInit: measure,
            onRefresh: (trigger) => {
              section.dataset.scrollDistance = String(
                trigger.end - trigger.start,
              );
              paint();
            },
          },
          onUpdate: paint,
        })
        .fromTo(
          progress,
          { current: 0 },
          { current: 1, duration: 1, ease: "none" },
        );
      const observer = new ResizeObserver(() => {
        measure();
        paint();
      });
      observer.observe(viewport);
      paint();
      return () => observer.disconnect();
    }, root);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(frame);
      context.revert();
      timeline.current = null;
      progress.current = 0;
      delete section.dataset.progress;
      delete section.dataset.scrollDistance;
    };
  }, [immersive]);

  const revealFocusedCard = (index: number) => {
    if (!immersive) return;
    const trigger = timeline.current?.scrollTrigger;
    const frame = layout.current.frames[index];
    if (!trigger || !frame) return;
    const fraction = Math.max(
      0,
      Math.min(
        1,
        (frame.x + frame.width / 2 - layout.current.width / 2) /
          layout.current.distance,
      ),
    );
    window.dispatchEvent(
      new CustomEvent("studio:scroll-to", {
        detail: trigger.start + (trigger.end - trigger.start) * fraction,
      }),
    );
  };

  return (
    <section
      ref={root}
      id="model-studies"
      className="section-pad model-section"
      aria-labelledby="model-title"
      data-immersive={immersive}
      data-renderer={immersive && ready && !failed ? "webgl" : "fallback"}
      data-scroll-offset="0"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">06 / Concept to form</p>
          <CinematicHeading
            id="model-title"
            animate={!immersive}
            lines={[{ text: "Ideas you" }, { text: "can hold.", italic: true }]}
          />
        </div>
        <p className="heading-note">
          Physical model studies.
          <br />
          Seven photographs, multiple perspectives.
        </p>
      </div>
      <div
        ref={stage}
        className="model-ribbon-stage"
        role="region"
        aria-label="Physical model photographs"
        tabIndex={immersive ? undefined : 0}
        onScroll={(event) => {
          if (immersive) return;
          const viewport = event.currentTarget;
          const distance = viewport.scrollWidth - viewport.clientWidth;
          const p = distance > 0 ? viewport.scrollLeft / distance : 0;
          root.current!.querySelector(".model-ribbon-current")!.textContent =
            String(Math.round(p * (modelStudies.length - 1)) + 1).padStart(
              2,
              "0",
            );
          (
            root.current!.querySelector(
              ".model-ribbon-progress span",
            ) as HTMLElement
          ).style.transform = `scaleX(${p})`;
        }}
      >
        <div ref={track} className="model-ribbon-track">
          {modelStudies.map((item, index) => (
            <Link
              key={item.slug}
              className="model-ribbon-card"
              style={{ "--photo-ratio": item.aspect_ratio } as CSSProperties}
              to={`/?category=Model+Studies&photo=${item.slug}#work`}
              onFocus={() => revealFocusedCard(index)}
            >
              <div className="model-ribbon-photo" data-depth={index < 3}>
                <PhotoImage item={item} sizes="(min-width:1024px) 40vw, 85vw" />
                <span className="image-open">
                  <Arrow diagonal />
                </span>
              </div>
              <div className="image-meta">
                <span>
                  {String(index + 1).padStart(2, "0")} / {item.title}
                </span>
                <Arrow diagonal />
              </div>
            </Link>
          ))}
        </div>
        {immersive && load && !failed && (
          <div className="model-ribbon-canvas" aria-hidden="true">
            <CanvasBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <PhotoPlanes
                  progress={progress}
                  layout={layout}
                  redraw={redraw}
                  onReady={onReady}
                  onFailure={onFailure}
                />
              </Suspense>
            </CanvasBoundary>
          </div>
        )}
      </div>
      <div className="model-ribbon-controls">
        <p className="model-ribbon-cue">
          <span className="model-desktop-cue">Scroll to explore</span>
          <span className="model-mobile-cue">Swipe to explore</span>
          <span aria-hidden="true">&rarr;</span>
        </p>
        <p className="model-ribbon-count">
          <span className="model-ribbon-current">01</span>
          <span> / 07</span>
        </p>
        <Link className="line-link" to="/?category=Model+Studies#work">
          View model studies <Arrow diagonal />
        </Link>
        <div className="model-ribbon-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
