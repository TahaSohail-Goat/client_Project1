import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Photo } from "../content/media";
import { PhotoImage } from "./PhotoImage";
import { CanvasBoundary } from "./three/CanvasBoundary";
import { canUseVisionThree } from "./three/visionCapabilities";
import { useMotionPreference } from "../hooks/useMotionPreference";

const ExteriorPerspectiveCanvas = lazy(
  () => import("./three/ExteriorPerspectiveCanvas"),
);

gsap.registerPlugin(ScrollTrigger);
/** Separate planes: Motion handles pointer tilt, GSAP handles scroll depth. */
export function DepthPhoto({
  item,
  sizes = "100vw",
  className = "",
  wide = false,
  threeD = false,
}: {
  item: Photo;
  sizes?: string;
  className?: string;
  wide?: boolean;
  threeD?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const [canvasEnabled, setCanvasEnabled] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const progress = useRef(0);
  const redraw = useRef<(() => void) | null>(null);
  const onReady = useCallback(() => setCanvasReady(true), []);
  const onFailure = useCallback(() => {
    setCanvasReady(false);
    setCanvasFailed(true);
  }, []);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 100, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 100, damping: 24 });
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 768px)",
      },
      (context) => {
        if (!context.conditions?.motion) return;
        const node = ref.current!;
        const card = node.closest<HTMLElement>(".exterior-card");
        const grid = card?.parentElement;
        // Measure the unchanged grid layout, rather than a card that is rotating.
        const layoutTop = () => grid!.getBoundingClientRect().top + scrollY + card!.offsetTop;
        const image = node.querySelector(".depth-photo-scroll");
        const depth = gsap.timeline({
          scrollTrigger: {
            trigger: grid ?? node,
            start: () => grid ? layoutTop() - innerHeight : "top bottom",
            end: () => grid ? layoutTop() + node.offsetHeight : "bottom top",
            scrub: 0.5,
          },
        });
        depth.fromTo(
          image,
          { yPercent: threeD ? -1 : -4, scale: threeD ? 1.035 : 1.1 },
          { yPercent: threeD ? 1 : 4, scale: threeD ? 1.015 : 1.04, ease: "none", duration: 1 },
          0,
        );
        if (threeD)
          depth.fromTo(
            progress,
            { current: 0 },
            {
              current: 1,
              ease: "none",
              duration: 1,
              onUpdate: () => redraw.current?.(),
            },
            0,
          );
        if (context.conditions.desktop)
          gsap.fromTo(
            node.querySelector(".depth-photo-mask"),
            {
              clipPath: wide ? "inset(12% 8% 12% 8%)" : "inset(16% 0% 0% 0%)",
            },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "power1.out",
              scrollTrigger: {
                trigger: grid ?? node,
                start: () => grid ? layoutTop() - innerHeight * 0.95 : "top 95%",
                end: () => grid ? layoutTop() - innerHeight * 0.3 : "top 30%",
                scrub: 0.4,
              },
            },
          );
      },
      ref,
    );
    return () => mm.revert();
  }, [threeD, wide]);
  useEffect(() => {
    if (!threeD) return;
    const desktop = matchMedia(
      "(min-width: 1024px) and (min-height: 700px) and (pointer: fine)",
    );
    let frame = 0;
    let activated = false;
    const activate = () => {
      frame = 0;
      if (reduced || !canUseVisionThree()) {
        setCanvasEnabled(false);
        return;
      }
      const node = ref.current;
      // Perspective transforms can leave an observer watching an old plane.
      // Measure the stable grid while approaching it, then stop watching scroll.
      const bounds = (node?.closest(".exterior-grid") ?? node)?.getBoundingClientRect();
      if (activated || !bounds || (bounds.top <= innerHeight + 240 && bounds.bottom >= -240)) {
        activated = true;
        setCanvasEnabled(true);
        window.removeEventListener("scroll", schedule);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(activate);
    };
    const prepare = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", schedule);
      if (!reduced && canUseVisionThree() && !activated)
        window.addEventListener("scroll", schedule, { passive: true });
      activate();
    };
    prepare();
    desktop.addEventListener("change", prepare);
    window.addEventListener("resize", prepare);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", prepare);
      desktop.removeEventListener("change", prepare);
    };
  }, [reduced, threeD]);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !matchMedia("(pointer: fine) and (min-width: 1024px)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((0.5 - (event.clientY - bounds.top) / bounds.height) * (threeD ? 8 : 3));
    y.set(((event.clientX - bounds.left) / bounds.width - 0.5) * (threeD ? 12 : 4));
  };
  return (
    <div
      className={`depth-photo ${className}`}
      ref={ref}
      data-three-ready={canvasReady && canvasEnabled && !canvasFailed && !reduced}
      style={{ "--photo-ratio": item.aspect_ratio } as CSSProperties}
    >
      <m.div
        className="depth-photo-tilt"
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        onPointerMove={move}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        <div className="depth-photo-mask">
          <div className="depth-photo-scroll">
            <PhotoImage item={item} sizes={sizes} full={threeD} />
          </div>
          {canvasEnabled && !canvasFailed && !reduced && (
            <div className="depth-photo-three" aria-hidden="true">
              <CanvasBoundary onFailure={onFailure}>
                <Suspense fallback={null}>
                  <ExteriorPerspectiveCanvas
                    item={item}
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
        <span className="depth-photo-corner" aria-hidden="true" />
      </m.div>
    </div>
  );
}
