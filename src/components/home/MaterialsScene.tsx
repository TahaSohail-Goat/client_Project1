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
const sceneScreens = 3.2;
const immersiveQuery =
  "(min-width: 1024px) and (min-height: 560px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
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
            .forEach((frame, index) => {
              gsap.fromTo(
                frame,
                { opacity: 0.6, y: 40, scale: 0.94, rotation: index ? 2 : -2 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: frame,
                    start: "top 95%",
                    end: "top 45%",
                    scrub: 0.5,
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
      const captions = node.querySelectorAll<HTMLElement>(
        ".material-shot-caption",
      );
      const links = node.querySelectorAll<HTMLElement>(
        ".material-caption-links a",
      );
      gsap.set("#materials-title .cinematic-word", {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        x: 0,
        rotateZ: 0,
      });
      gsap.set(captions, { autoAlpha: 0, y: 36 });
      const update = () => {
        const p = progress.current;
        node.dataset.progress = p.toFixed(4);
        node.dataset.phase =
          p < 0.26 ? "arrival" : p < 0.62 ? "light" : "texture";
        captions.forEach((caption, index) =>
          caption.setAttribute(
            "aria-hidden",
            String(index === 0 ? p < 0.28 || p > 0.65 : p < 0.66),
          ),
        );
        links.forEach((link, index) => {
          link.dataset.active = String(index === (p < 0.62 ? 0 : 1));
        });
        redraw.current?.();
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "materials",
          trigger: node,
          start: "top top",
          end: () => `+=${innerHeight * sceneScreens}`,
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: update,
      });
      tl.fromTo(progress, { current: 0 }, { current: 1, duration: 1 }, 0)
        .to(
          ".materials .section-heading",
          { autoAlpha: 0, y: -55, duration: 0.16 },
          0.12,
        )
        .to(".material-scroll-cue", { opacity: 0, y: 16, duration: 0.1 }, 0.12)
        .to(
          captions[0],
          { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" },
          0.29,
        )
        .to(captions[0], { autoAlpha: 0, y: -28, duration: 0.1 }, 0.55)
        .to(
          captions[1],
          { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" },
          0.66,
        )
        .fromTo(
          large,
          {
            xPercent: 12,
            z: -220,
            rotationY: -28,
            rotationZ: -2,
            scale: 0.88,
            transformPerspective: 1400,
          },
          {
            xPercent: -28,
            z: 180,
            rotationY: 0,
            rotationZ: 0,
            scale: 1.2,
            duration: 0.5,
          },
          0,
        )
        .to(
          large,
          {
            xPercent: -80,
            z: -220,
            rotationY: -55,
            rotationZ: -5,
            scale: 0.7,
            opacity: 0.25,
            duration: 0.35,
          },
          0.55,
        )
        .fromTo(
          small,
          {
            xPercent: 110,
            yPercent: 20,
            rotationY: 35,
            rotationZ: 8,
            z: -300,
            scale: 0.75,
            opacity: 0.35,
            transformPerspective: 1400,
          },
          {
            xPercent: 0,
            yPercent: 0,
            rotationY: 5,
            rotationZ: 0,
            z: 0,
            scale: 1,
            opacity: 1,
            duration: 0.26,
          },
          0.25,
        )
        .to(
          small,
          {
            xPercent: -18,
            yPercent: -15,
            rotationY: -8,
            rotationZ: -3,
            z: 350,
            scale: 1.65,
            duration: 0.3,
          },
          0.6,
        )
        .fromTo(
          ".material-progress span",
          { scaleX: 0 },
          { scaleX: 1, duration: 1 },
          0,
        );
      update();
    }, root);
    return () => {
      context.revert();
      delete node.dataset.progress;
      delete node.dataset.phase;
      node
        .querySelectorAll(".material-shot-caption")
        .forEach((caption) => caption.removeAttribute("aria-hidden"));
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
      data-scroll-distance={sceneScreens}
      data-scroll-offset="0"
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
      <p className="material-scroll-cue">
        <span>Scroll for a closer look</span>
        <span aria-hidden="true">↓</span>
      </p>
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
                        ? "(min-width:768px) 85vw, 100vw"
                        : "(min-width:768px) 45vw, 100vw"
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
                    A collection of details, seen through the studio's interior
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
      <div className="material-readout">
        <div className="material-shot-caption">
          <p className="eyebrow">01 / Display & light</p>
          <h3>
            Light.<em>In the detail.</em>
          </h3>
        </div>
        <div className="material-shot-caption">
          <p className="eyebrow">02 / Texture & reflection</p>
          <h3>
            Texture.<em>Brought closer.</em>
          </h3>
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
