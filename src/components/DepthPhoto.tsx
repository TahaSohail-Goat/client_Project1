import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { m, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Photo } from "../content/media";
import { PhotoImage } from "./PhotoImage";

gsap.registerPlugin(ScrollTrigger);
/** Separate planes: Motion handles pointer tilt, GSAP handles scroll depth. */
export function DepthPhoto({
  item,
  sizes = "100vw",
  className = "",
  wide = false,
}: {
  item: Photo;
  sizes?: string;
  className?: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
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
        const image = node.querySelector(".depth-photo-scroll");
        gsap.fromTo(
          image,
          { yPercent: -4, scale: 1.1 },
          {
            yPercent: 4,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: node,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          },
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
                trigger: node,
                start: "top 95%",
                end: "top 30%",
                scrub: 0.4,
              },
            },
          );
      },
      ref,
    );
    return () => mm.revert();
  }, [wide]);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !matchMedia("(pointer: fine) and (min-width: 1024px)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((0.5 - (event.clientY - bounds.top) / bounds.height) * 3);
    y.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 4);
  };
  return (
    <div
      className={`depth-photo ${className}`}
      ref={ref}
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
            <PhotoImage item={item} sizes={sizes} />
          </div>
        </div>
        <span className="depth-photo-corner" aria-hidden="true" />
      </m.div>
    </div>
  );
}
