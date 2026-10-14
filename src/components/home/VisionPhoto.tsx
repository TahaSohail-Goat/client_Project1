import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent } from "react";
import { photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";

/** Hover lives on an inner plane so it cannot overwrite the scroll choreography. */
export function VisionPhoto() {
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 95, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 95, damping: 24 });
  const glareX = useTransform(rotateY, [-6, 6], ["-25%", "25%"]);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !matchMedia("(min-width: 1024px) and (pointer: fine)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((0.5 - (event.clientY - bounds.top) / bounds.height) * 8);
    y.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
  };
  return (
    <figure className="vision-composition">
      <m.div
        className="vision-photo-tilt"
        style={{ rotateX, rotateY }}
        onPointerMove={move}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        <div className="vision-photo-stack">
          <div
            className="vision-photo-sheet vision-photo-sheet--back"
            aria-hidden="true"
          />
          <div
            className="vision-photo-sheet vision-photo-sheet--middle"
            aria-hidden="true"
          />
          <div className="vision-photo-face">
            <div className="vision-photo-mask">
              <div className="vision-photo-camera">
                <PhotoImage
                  item={photo("supplemental-07")}
                  sizes="(min-width: 768px) 52vw, 100vw"
                />
              </div>
            </div>
            <m.div
              className="vision-photo-glare"
              style={{ x: glareX }}
              aria-hidden="true"
            />
            <div className="vision-photo-corners" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </m.div>
      <figcaption>
        Exterior study <span>Form / Light / Proportion</span>
      </figcaption>
    </figure>
  );
}
