import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { photo } from "../../content/media";
import { materialStudies } from "../../content/materials";
import { PhotoImage } from "../PhotoImage";
import { CinematicHeading } from "../type/CinematicHeading";
import { Arrow } from "../Arrow";
import { CanvasBoundary } from "../three/CanvasBoundary";

gsap.registerPlugin(ScrollTrigger);
const MaterialsCanvas = lazy(() => import("../three/MaterialsCanvas"));
const immersiveQuery =
  "(min-width: 1024px) and (min-height: 760px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
function canImmerse() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return matchMedia(immersiveQuery).matches && !connection?.saveData;
}
const destination = (slug: string) => `/?category=Interiors&photo=${slug}#work`;

export function MaterialsScene() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const redraw = useRef<(() => void) | null>(null);
  const [immersive, setImmersive] = useState(canImmerse);
  const [loadCanvas, setLoadCanvas] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setReady(false);
    setFailed(true);
  }, []);
  const onSelect = useCallback(
    (slug: string) => navigate(destination(slug)),
    [navigate],
  );
  const webgl = immersive && loadCanvas && ready && !failed;

  useEffect(() => {
    const query = matchMedia(immersiveQuery);
    const update = () => setImmersive(canImmerse());
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!immersive || loadCanvas) return;
    if (typeof IntersectionObserver === "undefined") {
      setLoadCanvas(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLoadCanvas(true);
        observer.disconnect();
      },
      { rootMargin: "360px 0px" },
    );
    observer.observe(root.current!);
    return () => observer.disconnect();
  }, [immersive, loadCanvas]);
  useLayoutEffect(() => {
    if (!immersive) {
      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          root
            .current!.querySelectorAll<HTMLElement>(".material-photo")
            .forEach((frame) => {
              gsap.fromTo(
                frame,
                { opacity: 0.6, y: 24 },
                {
                  opacity: 1,
                  y: 0,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: frame,
                    start: "top 95%",
                    end: "top 60%",
                    scrub: 0.4,
                  },
                },
              );
            });
        },
        root,
      );
      return () => mm.revert();
    }
    const node = root.current!;
    node.dataset.progress = "0.0000";
    const context = gsap.context(() => {
      const large = node.querySelector(".material-large .material-photo")!;
      const small = node.querySelector(".material-small .material-photo")!;
      gsap.set("#materials-title .cinematic-word", {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        x: 0,
        rotateZ: 0,
      });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "materials",
          trigger: node,
          start: "top top",
          end: () => `+=${innerHeight * 2.8}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          node.dataset.progress = progress.current.toFixed(4);
          redraw.current?.();
        },
      });
      tl.fromTo(progress, { current: 0 }, { current: 1, duration: 1 }, 0)
        .fromTo(
          "#materials-title em .cinematic-word",
          { yPercent: 90, opacity: 0, rotateX: 24, x: -14, rotateZ: -3 },
          {
            yPercent: 0,
            opacity: 1,
            rotateX: 0,
            x: 0,
            rotateZ: 0,
            duration: 0.16,
            ease: "power2.out",
          },
          0,
        )
        .fromTo(
          ".materials-canvas",
          { opacity: 0.65 },
          { opacity: 1, duration: 0.25 },
          0,
        )
        .fromTo(
          large,
          {
            x: -70,
            y: 30,
            rotationY: -22,
            rotationZ: -3,
            z: -140,
            scale: 0.87,
            transformPerspective: 1600,
          },
          {
            x: 0,
            y: 0,
            rotationY: -4,
            rotationZ: 0,
            z: 0,
            scale: 1,
            duration: 0.3,
          },
          0,
        )
        .fromTo(
          small,
          {
            x: 80,
            y: -28,
            rotationY: 24,
            rotationZ: 4,
            z: -200,
            scale: 0.8,
            transformPerspective: 1600,
          },
          {
            x: 0,
            y: 0,
            rotationY: 7,
            rotationZ: 0,
            z: 0,
            scale: 1,
            duration: 0.3,
          },
          0,
        )
        .to(
          large,
          { x: 55, z: 100, rotationY: 4, scale: 1.04, duration: 0.28 },
          0.3,
        )
        .to(
          small,
          { x: 35, z: -100, rotationY: -10, scale: 0.9, duration: 0.28 },
          0.3,
        )
        .to(
          large,
          { x: -40, z: -65, rotationY: 12, scale: 0.95, duration: 0.24 },
          0.58,
        )
        .to(
          small,
          { x: -45, z: 110, rotationY: -4, scale: 1.05, duration: 0.24 },
          0.58,
        )
        .to(
          [large, small],
          {
            x: 0,
            y: 0,
            z: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
            duration: 0.18,
          },
          0.82,
        )
        .fromTo(
          ".material-progress span",
          { scaleX: 0 },
          { scaleX: 1, duration: 1 },
          0,
        );
    }, root);
    return () => {
      context.revert();
      delete node.dataset.progress;
    };
  }, [immersive]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [immersive]);

  return (
    <section
      ref={root}
      id="considered-detail"
      className="section-pad materials"
      aria-labelledby="materials-title"
      data-immersive={immersive}
      data-renderer={webgl ? "webgl" : "fallback"}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">05 / The considered detail</p>
          <CinematicHeading
            id="materials-title"
            animate={!immersive}
            lines={[{ text: "A closer" }, { text: "look.", italic: true }]}
          />
        </div>
        <p className="heading-note">
          Warmth, texture and shadow.
          <br />
          Small moments that shape a space.
        </p>
      </div>
      <div className="material-stage">
        <div className="materials-grid">
          {materialStudies.map((study, index) => (
            <div
              className={index === 0 ? "material-large" : "material-small"}
              key={study.slug}
            >
              <Link
                to={destination(study.slug)}
                className="material-photo"
                tabIndex={webgl ? -1 : undefined}
                aria-hidden={webgl || undefined}
              >
                <div className="material-image">
                  <PhotoImage
                    item={photo(study.slug)}
                    sizes={
                      index === 0
                        ? "(min-width:768px) 55vw, 100vw"
                        : "(min-width:768px) 27vw, 100vw"
                    }
                  />
                </div>
                <span className="image-open">
                  <Arrow diagonal />
                </span>
              </Link>
              <Link
                to={destination(study.slug)}
                className="image-meta material-static-caption"
              >
                {study.number} / {study.label}
                <Arrow diagonal />
              </Link>
              {index === 1 && (
                <div className="material-static-copy">
                  <p className="material-copy">
                    A collection of details, seen through the studio’s interior
                    photography.
                  </p>
                  <Link className="line-link" to="/?category=Interiors#work">
                    Explore interior studies <Arrow diagonal />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="materials-canvas" aria-hidden="true">
          {immersive && loadCanvas && !failed && (
            <CanvasBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <MaterialsCanvas
                  progress={progress}
                  redraw={redraw}
                  onReady={onReady}
                  onFailure={onFailure}
                  onSelect={onSelect}
                />
              </Suspense>
            </CanvasBoundary>
          )}
        </div>
      </div>
      <div className="material-controls">
        <div className="material-caption-links">
          {materialStudies.map((study) => (
            <Link
              key={study.slug}
              to={destination(study.slug)}
              aria-label={`View ${study.label}: ${photo(study.slug).description}`}
            >
              <span className="eyebrow">{study.number}</span>
              {study.label}
              <Arrow diagonal />
            </Link>
          ))}
        </div>
        <Link className="line-link" to="/?category=Interiors#work">
          Explore interior studies <Arrow diagonal />
        </Link>
        <div className="material-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
