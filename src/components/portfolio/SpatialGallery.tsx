import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  animate,
  m,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Photo } from "../../content/media";
import {
  galleryModes,
  galleryPose,
  blendGalleryPose,
  galleryTransform,
  type GalleryMode,
  type GalleryPose,
  type GallerySize,
  type GalleryTransition,
} from "../../content/galleryLayouts";
import { PhotoImage } from "../PhotoImage";
import { Arrow } from "../Arrow";

type CardProps = {
  item: Photo;
  index: number;
  count: number;
  active: number;
  mode: GalleryMode;
  size: GallerySize;
  focus: MotionValue<number>;
  blend: MotionValue<number>;
  sources: RefObject<Record<string, GalleryPose>>;
  poses: RefObject<Record<string, GalleryPose>>;
  transition: GalleryTransition;
  onOpen: (item: Photo, index: number) => void;
};
function SpatialCard({
  item,
  index,
  count,
  active,
  mode,
  size,
  focus,
  blend,
  sources,
  poses,
  transition,
  onOpen,
}: CardProps) {
  const pose = useTransform(() => {
    const target = galleryPose(mode, index, focus.get(), count, size);
    const p = blendGalleryPose(
      sources.current[item.slug] ?? target,
      target,
      blend.get(),
      index,
      transition,
    );
    poses.current[item.slug] = p;
    return p;
  });
  const transform = useTransform(pose, galleryTransform);
  const opacity = useTransform(pose, (p) => p.opacity);
  const pointerEvents = useTransform(pose, (p) =>
    p.opacity < 0.15 ? "none" : "auto",
  );
  const base = Math.min(
    size.width < 768 ? 260 : 350,
    size.width * (size.width < 768 ? 0.67 : 0.24),
  );
  // Reserve room for the number, caption and hover lift, including tall photos.
  const width = Math.min(
    item.aspect_ratio < 1 ? base * 0.72 : base,
    Math.max(140, size.height - 160) * item.aspect_ratio,
  );
  const height = width / item.aspect_ratio;
  return (
    <m.button
      id={item.slug}
      type="button"
      className="work-card spatial-card"
      tabIndex={active === index ? 0 : -1}
      style={{
        transform,
        opacity,
        pointerEvents,
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
      }}
      aria-label={`${String(index + 1).padStart(2, "0")} ${item.title} — Open photograph`}
      aria-current={active === index ? "true" : undefined}
      onClick={() => onOpen(item, index)}
    >
      <span className="spatial-card-number" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>{" "}
      <m.span
        className="spatial-card-image"
        whileHover={{ scale: 1.025, y: -5 }}
        transition={{ duration: 0.25 }}
      >
        <PhotoImage
          item={item}
          sizes="(min-width: 768px) 350px, 260px"
          priority={index === 2}
        />
      </m.span>
      <span className="spatial-card-caption" aria-hidden="true">
        {item.title}
        <Arrow diagonal />
      </span>
    </m.button>
  );
}

export function SpatialGallery({
  items,
  mode,
  onModeChange,
  onOpen,
}: {
  items: Photo[];
  mode: GalleryMode;
  onModeChange: (mode: GalleryMode) => void;
  onOpen: (item: Photo) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const sources = useRef<Record<string, GalleryPose>>({});
  const poses = useRef<Record<string, GalleryPose>>({});
  const first = Math.min(2, items.length - 1);
  const target = useMotionValue(first);
  const focus = useSpring(target, { stiffness: 105, damping: 25, mass: 0.85 });
  const blend = useMotionValue(1);
  const morph = useRef<ReturnType<typeof animate> | null>(null);
  const [active, setActive] = useState(first);
  const [transition, setTransition] = useState<GalleryTransition>("scatter");
  const [size, setSize] = useState<GallerySize>({ width: 1440, height: 630 });
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    start: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const wheelTimer = useRef(0);
  const clickTimer = useRef(0);
  const limit = useCallback(
    (value: number) => Math.max(0, Math.min(items.length - 1, value)),
    [items.length],
  );
  const select = useCallback(
    (value: number) => {
      const next = limit(Math.round(value));
      target.set(next);
      setActive(next);
    },
    [limit, target],
  );
  const changeMode = (next: GalleryMode) => {
    if (next === mode) return;
    morph.current?.stop();
    sources.current = { ...poses.current };
    blend.set(0);
    onModeChange(next);
    morph.current = animate(blend, 1, {
      duration: 1.05,
      ease: [0.22, 1, 0.36, 1],
    });
  };
  useLayoutEffect(() => {
    const node = viewport.current!;
    const measure = () =>
      setSize({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = viewport.current!;
    const wheel = (event: WheelEvent) => {
      const horizontal =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontal || event.ctrlKey) return;
      event.preventDefault();
      event.stopPropagation();
      target.set(
        limit(
          target.get() + (event.shiftKey ? event.deltaY : event.deltaX) / 200,
        ),
      );
      clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => select(target.get()), 130);
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", wheel);
      clearTimeout(wheelTimer.current);
      clearTimeout(clickTimer.current);
      morph.current?.stop();
    };
  }, [limit, select, target]);
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("select")) return;
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: target.get(),
      moved: false,
    };
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x,
      dy = event.clientY - g.y;
    if (
      !g.moved &&
      (Math.abs(dx) < 7 ||
        (event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)))
    )
      return;
    if (!g.moved) {
      g.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    target.set(limit(g.start - dx / (size.width < 768 ? 145 : 230)));
  };
  const up = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    if (g.moved) {
      select(target.get());
      suppressClick.current = true;
      clearTimeout(clickTimer.current);
      clickTimer.current = window.setTimeout(() => {
        suppressClick.current = false;
      }, 250);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    gesture.current = null;
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLSelectElement) return;
    const step = mode === "grid" ? (size.width < 768 ? 2 : 4) : 1;
    const values: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      ArrowDown: active + step,
      ArrowUp: active - step,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in values) {
      event.preventDefault();
      select(values[event.key]);
    } else if (/^[1-8]$/.test(event.key)) {
      event.preventDefault();
      changeMode(galleryModes[Number(event.key) - 1]);
    } else return;
    // Keep the roving keyboard target on the selected photo, without scrolling
    // the document to an offscreen transformed button.
    if (event.key in values)
      requestAnimationFrame(() =>
        document
          .getElementById(items[limit(values[event.key])].slug)
          ?.focus({ preventScroll: true }),
      );
  };
  const open = (item: Photo, index: number) => {
    select(index);
    onOpen(item);
  };
  return (
    <div
      className="spatial-gallery"
      data-layout={mode}
      data-active={active}
      data-transition={transition}
    >
      <div className="spatial-controls">
        <div
          className="spatial-layouts"
          role="group"
          aria-label="Gallery arrangement"
        >
          {galleryModes.map((value, index) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => changeMode(value)}
            >
              <small aria-hidden="true">{index + 1}</small>
              {value}
            </button>
          ))}
        </div>
        <label className="spatial-mobile-layout">
          Layout
          <select aria-label="Gallery layout" value={mode}
            onChange={(event) => changeMode(event.target.value as GalleryMode)}>
            {galleryModes.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="spatial-transition">
          Transition
          <select
            value={transition}
            onChange={(event) => setTransition(event.target.value as GalleryTransition)}
          >
            <option value="scatter">Scatter</option>
            <option value="flow">Flow</option>
            <option value="fade">Fade</option>
          </select>
        </label>
      </div>
      <div
        className="spatial-viewport"
        ref={viewport}
        role="region"
        aria-label="Selected work 3D gallery"
        aria-describedby="spatial-instructions"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={keyboard}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
      >
        <div className="spatial-camera">
          <div className="spatial-world">
            {items.map((item, index) => (
              <SpatialCard
                key={item.slug}
                item={item}
                index={index}
                count={items.length}
                active={active}
                mode={mode}
                size={size}
                focus={focus}
                blend={blend}
                sources={sources}
                poses={poses}
                transition={transition}
                onOpen={open}
              />
            ))}
          </div>
        </div>
        <div className="spatial-viewport-edge" aria-hidden="true" />
      </div>
      <div className="spatial-bottom">
        <div className="spatial-current" role="status" aria-live="polite">
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </span>
          <p>{items[active].title}</p>
          <small>{items[active].category}</small>
        </div>
        <p id="spatial-instructions">
          Drag or swipe to explore <span>← → to navigate · Enter to open</span>
        </p>
        <div className="spatial-navigation">
          <button
            type="button"
            aria-label="Previous gallery photograph"
            disabled={active === 0}
            onClick={() => select(active - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="View photograph"
            onClick={() => onOpen(items[active])}
          >
            View photograph ↗
          </button>
          <button
            type="button"
            aria-label="Next gallery photograph"
            disabled={active === items.length - 1}
            onClick={() => select(active + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
