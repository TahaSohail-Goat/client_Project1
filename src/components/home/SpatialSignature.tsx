import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/** Abstract drafting mark; it makes no claim about a client building. */
export function SpatialSignature({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          ref.current!.querySelectorAll(".signature-line"),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 95%",
              end: "center 45%",
              scrub: 0.6,
            },
          },
        );
        gsap.fromTo(
          ref.current!.querySelector(".signature-orbit"),
          { rotation: -20 },
          {
            rotation: 20,
            transformOrigin: "50% 50%",
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
      },
      ref,
    );
    return () => mm.revert();
  }, []);
  return (
    <svg
      ref={ref}
      className={`spatial-signature ${className}`}
      viewBox="0 0 420 420"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="signature-orbit"
        cx="210"
        cy="210"
        r="173"
        stroke="currentColor"
        strokeDasharray="2 9"
      />
      <g stroke="currentColor" strokeWidth="1.1">
        <path
          className="signature-line"
          pathLength="1"
          strokeDasharray="1"
          d="M90 143L210 74L330 143V280L210 350L90 280Z"
        />
        <path
          className="signature-line"
          pathLength="1"
          strokeDasharray="1"
          d="M90 143L210 213L330 143M210 213V350"
        />
        <path
          className="signature-line"
          pathLength="1"
          strokeDasharray="1"
          d="M145 176V246L210 284L274 246V176M145 246L210 209L274 246"
        />
      </g>
      <g stroke="currentColor" opacity=".35">
        <path d="M210 15V55M210 365V405M15 210H55M365 210H405M44 44L63 63M357 357L376 376" />
      </g>
      <circle cx="210" cy="213" r="4" fill="currentColor" />
    </svg>
  );
}
