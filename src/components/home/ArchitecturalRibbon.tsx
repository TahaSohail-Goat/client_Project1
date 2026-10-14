import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function ArchitecturalRibbon() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        });
        timeline
          .fromTo(
            ".ribbon-type",
            { xPercent: 8 },
            { xPercent: -18, ease: "none" },
            0,
          )
          .fromTo(
            ".ribbon-rule span",
            { scaleX: 0 },
            { scaleX: 1, ease: "none" },
            0,
          );
      },
      ref,
    );
    return () => mm.revert();
  }, []);
  return (
    <section
      ref={ref}
      className="architectural-ribbon"
      aria-label="From architecture to interior design"
    >
      <div className="ribbon-rule" aria-hidden="true">
        <span />
      </div>
      <div className="ribbon-meta">
        <span className="eyebrow">The outside becomes the inside</span>
        <span className="eyebrow">Form / Feeling / Life</span>
      </div>
      <p className="ribbon-type">
        Form. <em>Feeling.</em> Life.
      </p>
      <div className="ribbon-scale" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </section>
  );
}
