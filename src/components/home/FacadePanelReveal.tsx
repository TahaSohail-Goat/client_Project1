import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { photo } from "../../content/media";
import { site } from "../../content/site";
import { PhotoImage } from "../PhotoImage";
import { Arrow } from "../Arrow";
import { VisionPhoto } from "./VisionPhoto";
import { addVisionDepth } from "./visionDepth";

export function FacadePanelReveal({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (embedded) return;
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: "(min-width: 768px)",
        immersive: "(min-width: 1024px) and (min-height: 700px)",
        mobile: "(max-width: 767px)",
        reduced: "(prefers-reduced-motion: reduce)",
        short: "(max-height: 650px)",
      },
      (context) => {
        if (context.conditions?.reduced || context.conditions?.short) return;
        const desktop = context.conditions?.desktop;
        const panel = ref.current!.querySelector<HTMLElement>(".ivory-panel")!;
        panel.inert = true;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "facade",
            trigger: ref.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (desktop ? 1.3 : 1.05)}`,
            pin: true,
            scrub: 0.45,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        tl.to(".facade-photo", { scale: 1.08, yPercent: -2, duration: 0.5 }, 0);
        addVisionDepth(tl, ref.current!, {
          start: 0.24,
          duration: 0.76,
          immersive: !!context.conditions?.immersive,
        });
        tl.to({}, { duration: 0.12 }, 1);
        tl.eventCallback("onUpdate", () => {
          panel.inert = tl.progress() < 0.92;
        });
        return () => {
          panel.inert = false;
        };
      },
      ref,
    );
    return () => mm.revert();
  }, [embedded]);
  return (
    <section
      id="vision"
      className={`facade-scene ${embedded ? "hero-finish" : ""}`}
      ref={ref}
      aria-labelledby="vision-title"
      data-scene="facade"
    >
      <div className="facade-establish">
        <PhotoImage
          item={photo("supplemental-06")}
          className="facade-photo"
          full
        />
        <span className="eyebrow facade-label">
          02 / An architectural point of view
        </span>
      </div>
      <div className="ivory-panel">
        <svg
          className="vision-drafting"
          viewBox="0 0 1200 700"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <g
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          >
            <path
              className="vision-drafting-line"
              pathLength="1"
              strokeDasharray="1"
              d="M30 110V32H110M1090 32H1170V110M1170 590V668H1090M110 668H30V590"
            />
            <path
              className="vision-drafting-line"
              pathLength="1"
              strokeDasharray="1"
              d="M580 32V668M30 375H1170"
            />
            <path
              className="vision-drafting-line"
              pathLength="1"
              strokeDasharray="1"
              d="M700 440L1120 370L1145 605L715 640Z"
            />
          </g>
        </svg>
        <div className="vision-depth-stage">
          <div className="vision-heading">
            <p className="eyebrow vision-kicker">02 / Outside, considered</p>
            <h2 id="vision-title">
              {site.statement.map((line, index) => (
                <span key={line} className="vision-line">
                  <span className={index === 1 ? "serif" : ""}>{line}</span>
                </span>
              ))}
            </h2>
          </div>
          <div className="vision-lower">
            <div className="vision-copy">
              <span className="section-mark" aria-hidden="true">
                ↗
              </span>
              <p>{site.intro}</p>
              <Link to="/?category=Architecture#work" className="line-link">
                Architectural perspectives <Arrow diagonal />
              </Link>
            </div>
            <VisionPhoto />
          </div>
        </div>
      </div>
    </section>
  );
}
