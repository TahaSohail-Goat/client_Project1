import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { photo } from "../../content/media";
import { site } from "../../content/site";
import { PhotoImage } from "../PhotoImage";
import { Arrow } from "../Arrow";

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
        tl.to(".facade-photo", { scale: 1.08, yPercent: -2, duration: 0.5 }, 0)
          .fromTo(
            ".ivory-panel",
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.42 },
            0.24,
          )
          .fromTo(
            ".vision-line span",
            { yPercent: 112 },
            { yPercent: 0, stagger: 0.08, duration: 0.22 },
            0.48,
          )
          .fromTo(
            ".vision-kicker",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.16 },
            0.47,
          )
          .fromTo(
            ".vision-composition",
            { clipPath: "inset(100% 0% 0% 0%)", y: 28 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.25 },
            0.65,
          )
          .fromTo(
            ".vision-copy",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.2 },
            0.72,
          )
          .to({}, { duration: 0.1 }, 0.92);
        tl.eventCallback("onUpdate", () => {
          panel.inert = tl.progress() < 0.72;
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
          <figure className="vision-composition">
            <PhotoImage
              item={photo("supplemental-07")}
              sizes="(min-width: 768px) 52vw, 100vw"
            />
            <figcaption>
              Exterior study <span>Form / Light / Proportion</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
