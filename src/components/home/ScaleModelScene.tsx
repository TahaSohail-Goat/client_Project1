import { Link } from "react-router-dom";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { media } from "../../content/media";
import { PhotoImage } from "../PhotoImage";
import { Reveal } from "../Reveal";
import { CanvasBoundary } from "../three/CanvasBoundary";
import { CinematicHeading } from "../type/CinematicHeading";
const PhotoPlanes = lazy(() => import("../three/PhotoPlanes"));
const models = media.filter((item) => item.category === "Model Studies");
export function ScaleModelScene() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const redraw = useRef<(() => void) | null>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia(
      "(min-width: 1024px) and (min-height: 651px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      setLoad(false);
      setReady(false);
      if (!desktop.matches || connection?.saveData) return;
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl2");
            if (gl) {
              gl.getExtension("WEBGL_lose_context")?.loseContext();
              setLoad(true);
            }
            observer?.disconnect();
          }
        },
        { rootMargin: "180px" },
      );
      observer.observe(ref.current!);
    };
    setup();
    desktop.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      desktop.removeEventListener("change", setup);
    };
  }, []);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const value = { p: 0 };
        gsap.to(value, {
          p: 1,
          ease: "none",
          scrollTrigger: {
            id: "models",
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          onUpdate: () => {
            progress.current = value.p;
            redraw.current?.();
          },
        });
      },
      ref,
    );
    return () => mm.revert();
  }, []);
  return (
    <section
      id="model-studies"
      ref={ref}
      className="section-pad model-section"
      aria-labelledby="model-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">06 / Concept to form</p>
          <CinematicHeading
            id="model-title"
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
        className={`model-depth-stage ${ready ? "canvas-ready" : ""}`}
        aria-hidden="true"
      >
        <div className="model-depth-fallback">
          {models.slice(0, 3).map((item) => (
            <PhotoImage key={item.slug} item={item} sizes="30vw" />
          ))}
        </div>
        {load && !failed && (
          <div className="model-canvas">
            <CanvasBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <PhotoPlanes
                  progress={progress}
                  redraw={redraw}
                  onReady={onReady}
                  onFailure={onFailure}
                />
              </Suspense>
            </CanvasBoundary>
          </div>
        )}
      </div>
      <div className="model-grid">
        {models.map((item, i) => (
          <Reveal key={item.slug}>
            <Link to={`/?category=Model+Studies&photo=${item.slug}#work`}>
              <PhotoImage item={item} sizes="(min-width:768px) 30vw, 100vw" />
              <p className="image-meta">
                0{i + 1} / {item.title}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
