import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  m,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { Arrow } from "../Arrow";
import { CinematicHeading } from "../type/CinematicHeading";
import { CanvasBoundary } from "../three/CanvasBoundary";
import { useMotionPreference } from "../../hooks/useMotionPreference";

gsap.registerPlugin(ScrollTrigger);
const ApproachCanvas = lazy(() => import("../three/ApproachCanvas"));
const desktopQuery =
  "(min-width: 1024px) and (min-height: 760px) and (pointer: fine)";
const chapters = ["Outside", "In between", "Within"];

/** An abstract spatial study, independent of the client's built projects. */
export function ApproachEditorial() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const redraw = useRef<(() => void) | null>(null);
  // Subscribe explicitly: the installed Motion hook captures only the initial
  // preference, while this canvas must also unmount on a live setting change.
  const reduced = useMotionPreference();
  const inView = useInView(root, { margin: "500px 0px" });
  const [eligible, setEligible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const load = eligible && inView && !reduced && !failed;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setReady(false);
    setFailed(true);
  }, []);
  const targetX = useMotionValue(0),
    targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 75, damping: 22 });
  const y = useSpring(targetY, { stiffness: 75, damping: 22 });
  const glowX = useTransform(x, [-1, 1], [-90, 90]);
  const glowY = useTransform(y, [-1, 1], [-65, 65]);
  const tiltX = useTransform(y, [-1, 1], [5, -5]);
  const tiltY = useTransform(x, [-1, 1], [-7, 7]);

  useEffect(() => {
    const update = () => {
      pointer.current = { x: x.get(), y: y.get() };
      redraw.current?.();
    };
    const offX = x.on("change", update),
      offY = y.on("change", update);
    return () => {
      offX();
      offY();
    };
  }, [x, y]);

  useEffect(() => {
    const query = matchMedia(desktopQuery);
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    const configure = () => {
      setEligible(query.matches && !saveData);
    };
    configure();
    query.addEventListener("change", configure);
    return () => {
      query.removeEventListener("change", configure);
    };
  }, []);
  useEffect(() => {
    if (!load) setReady(false);
  }, [load]);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: desktopQuery,
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        if (!context.conditions?.motion) return;
        const node = root.current!;
        const desktop = !!context.conditions.desktop;
        const saveData = (
          navigator as Navigator & { connection?: { saveData?: boolean } }
        ).connection?.saveData;
        const pin = desktop && !failed && !saveData;
        // Establish the final chapter height before ScrollTrigger measures it.
        node.dataset.pinned = String(pin);
        const phase = { value: 0 };
        const update = () => {
          progress.current = phase.value;
          node.dataset.progress = phase.value.toFixed(4);
          node.style.setProperty("--approach-progress", String(phase.value));
          const chapter = Math.min(2, Math.floor(phase.value * 3));
          node
            .querySelectorAll<HTMLElement>(".approach-phase")
            .forEach((el, i) => {
              el.dataset.active = String(chapter === i);
            });
          redraw.current?.();
        };
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "approach-spatial",
            trigger: node,
            start: pin ? "top top" : "top 75%",
            end: pin ? () => `+=${innerHeight * 1.8}` : "bottom 35%",
            pin,
            scrub: pin ? 0.65 : 0.3,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        timeline.to(phase, { value: 1, duration: 1, onUpdate: update }, 0);
        timeline.fromTo(
          ".approach-title-plane",
          { z: 0 },
          {
            z: desktop ? -65 : 0,
            y: desktop ? -12 : 0,
            duration: 1,
          },
          0,
        );
        timeline.fromTo(
          ".approach-visual-orbit",
          { rotateZ: -22, rotateX: 54 },
          {
            rotateZ: 38,
            rotateX: 68,
            duration: 1,
          },
          0,
        );
        timeline.fromTo(
          ".approach-fallback-frame",
          {
            x: (i) => (i - 2.5) * 4,
            y: (i) => (i - 2.5) * -3,
            rotation: 0,
          },
          {
            x: (i) => (i - 2.5) * (desktop ? 15 : 9),
            y: (i) => (i - 2.5) * -8,
            rotation: (i) => (i - 2.5) * 5,
            transformOrigin: "50% 50%",
            duration: 1,
          },
          0,
        );
        timeline.fromTo(
          ".approach-copy",
          { y: 22, opacity: 0.85 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
          },
          0,
        );
        ScrollTrigger.sort((a: ScrollTrigger, b: ScrollTrigger) => {
          if (!a.trigger || !b.trigger || a.trigger === b.trigger)
            return a.start - b.start;
          return a.trigger.compareDocumentPosition(b.trigger) &
            Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1;
        });
        const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
        // Other chapters rebuild their pins during the same media-query change.
        const settledRefresh = window.setTimeout(() => ScrollTrigger.refresh(), 250);
        return () => {
          cancelAnimationFrame(frame);
          clearTimeout(settledRefresh);
          progress.current = 0;
          redraw.current?.();
          node.removeAttribute("data-pinned");
          node.removeAttribute("data-progress");
          node.style.removeProperty("--approach-progress");
          node
            .querySelectorAll<HTMLElement>(".approach-phase")
            .forEach((el, i) => {
              el.dataset.active = String(i === 0);
            });
        };
      },
      root,
    );
    return () => mm.revert();
  }, [failed]);

  const move = (event: PointerEvent<HTMLElement>) => {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !matchMedia(desktopQuery).matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    targetY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };
  const webgl = load && ready && !failed && !reduced;
  return (
    <section
      ref={root}
      className="section-pad approach approach-spatial"
      id="approach"
      aria-labelledby="approach-title"
      data-renderer={webgl ? "webgl" : failed ? "fallback" : "static"}
      onPointerMove={move}
      onPointerLeave={() => {
        targetX.set(0);
        targetY.set(0);
      }}
    >
      <m.div
        className="approach-ambient"
        aria-hidden="true"
        style={{ x: glowX, y: glowY }}
      />
      <div className="approach-heading-group">
        <p className="eyebrow">07 / A way of seeing</p>
        <div className="approach-title-plane">
          <CinematicHeading
            id="approach-title"
            lines={[
              { text: "A dialogue between" },
              { text: "space and life.", italic: true },
            ]}
          />
        </div>
      </div>
      <div className="approach-lower">
        <figure
          className="approach-visual"
          aria-label="An abstract study of layered architectural frames, opening and turning with the scroll"
        >
          <div className="approach-visual-orbit" aria-hidden="true" />
          <m.div
            className="approach-fallback"
            aria-hidden="true"
            style={{
              rotateX: reduced ? 0 : tiltX,
              rotateY: reduced ? 0 : tiltY,
              transformPerspective: 1200,
            }}
          >
            <svg viewBox="0 0 620 400" fill="none">
              <g stroke="currentColor">
                {Array.from({ length: 6 }, (_, i) => (
                  <rect
                    key={i}
                    className="approach-fallback-frame"
                    x={164 + i * 11}
                    y={77 + i * 7}
                    width="232"
                    height="218"
                    rx="1"
                    opacity={0.3 + i * 0.13}
                  />
                ))}
                <path d="M306 166L341 185V222L306 242L271 222V185Z M271 185L306 205L341 185 M306 205V242" />
                <path
                  d="M60 330H560M105 350L225 50M515 350L395 50"
                  opacity=".12"
                />
              </g>
            </svg>
          </m.div>
          {load && !reduced && !failed && (
            <div className="approach-three" aria-hidden="true">
              <CanvasBoundary onFailure={onFailure}>
                <Suspense fallback={null}>
                  <ApproachCanvas
                    progress={progress}
                    pointer={pointer}
                    redraw={redraw}
                    onReady={onReady}
                    onFailure={onFailure}
                  />
                </Suspense>
              </CanvasBoundary>
            </div>
          )}
          <figcaption>
            <span>Spatial dialogue</span>
            <span>Form / Light / Life</span>
          </figcaption>
        </figure>
        <div className="approach-copy">
          <span className="approach-copy-rule" aria-hidden="true" />
          <p>{site.approach}</p>
          <m.div
            className="approach-link-wrap"
            whileHover={reduced ? undefined : { x: 6 }}
          >
            <Link to="/#studio" className="line-link">
              Meet the studio <Arrow diagonal />
            </Link>
          </m.div>
          <div className="approach-phases" aria-hidden="true">
            {chapters.map((chapter, i) => (
              <span
                className="approach-phase"
                data-active={i === 0}
                key={chapter}
              >
                <small>0{i + 1}</small>
                {chapter}
              </span>
            ))}
            <div className="approach-track">
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
