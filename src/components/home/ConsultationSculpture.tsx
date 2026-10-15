import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { m, useInView, useSpring } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionPreference } from "../../hooks/useMotionPreference";

gsap.registerPlugin(ScrollTrigger);
const faces = ["front", "back", "left", "right", "top", "bottom"];

/** Decorative geometry uses real CSS depth; no extra WebGL context or assets. */
export function ConsultationSculpture({
  section,
}: {
  section: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const visible = useInView(section, { amount: 0.1 });
  const tiltX = useSpring(0, { stiffness: 75, damping: 22 });
  const tiltY = useSpring(0, { stiffness: 75, damping: 22 });
  useEffect(() => {
    const node = section.current!;
    const move = (event: PointerEvent) => {
      if (
        reduced ||
        event.pointerType !== "mouse" ||
        !matchMedia("(pointer: fine)").matches
      )
        return;
      const bounds = node.getBoundingClientRect();
      tiltX.set((0.5 - (event.clientY - bounds.top) / bounds.height) * 14);
      tiltY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 20);
    };
    const reset = () => {
      tiltX.set(0);
      tiltY.set(0);
    };
    reset();
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", reset);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", reset);
    };
  }, [reduced, section, tiltX, tiltY]);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const node = section.current!;
        const phase = { p: 0 };
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
          onUpdate: () => {
            ref.current!.dataset.progress = phase.p.toFixed(4);
          },
        });
        timeline
          .to(phase, { p: 1, duration: 1 }, 0)
          .fromTo(
            ".consultation-cube--outer",
            { rotationX: -28, rotationY: -42, rotationZ: -6 },
            { rotationX: 24, rotationY: 132, rotationZ: 14, duration: 1 },
            0,
          )
          .fromTo(
            ".consultation-cube--inner",
            { rotationX: 24, rotationY: 20 },
            { rotationX: 72, rotationY: -150, duration: 1 },
            0,
          )
          .fromTo(
            ".consultation-orbit-turn",
            { rotation: -40 },
            { rotation: 75, duration: 1 },
            0,
          )
          .fromTo(
            ref.current,
            { "--cube-spread": "0px" },
            { "--cube-spread": "22px", duration: 0.5 },
            0,
          )
          .to(ref.current, { "--cube-spread": "0px", duration: 0.5 }, 0.5);
        return () => {
          ref.current?.removeAttribute("data-progress");
        };
      },
      ref,
    );
    return () => mm.revert();
  }, [section]);
  return (
    <div
      ref={ref}
      className="consultation-sculpture"
      aria-hidden="true"
      data-motion={visible && !reduced}
    >
      <m.div
        className="consultation-sculpture-float"
        animate={visible && !reduced ? { y: [-7, 7, -7] } : { y: 0 }}
        transition={
          visible && !reduced
            ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        <m.div
          className="consultation-sculpture-pointer"
          style={{ rotateX: reduced ? 0 : tiltX, rotateY: reduced ? 0 : tiltY }}
        >
          <div className="consultation-orbit-turn">
            <div className="consultation-sculpture-orbit">
              <i />
            </div>
          </div>
          <div className="consultation-cube consultation-cube--outer">
            {faces.map((face) => (
              <span
                key={face}
                className={`consultation-cube-face consultation-cube-face--${face}`}
              />
            ))}
          </div>
          <div className="consultation-cube consultation-cube--inner">
            {faces.map((face) => (
              <span
                key={face}
                className={`consultation-cube-face consultation-cube-face--${face}`}
              />
            ))}
          </div>
          <span className="consultation-sculpture-center" />
        </m.div>
      </m.div>
    </div>
  );
}
