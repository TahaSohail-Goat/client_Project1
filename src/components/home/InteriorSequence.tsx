import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";
import { Arrow } from "../Arrow";
export const interiorScenes = [
  {
    slug: "interior-dining-living",
    title: "Places to gather.",
    detail: "Living & dining",
    text: "An interplay of light, furniture and spatial proportion.",
  },
  {
    slug: "interior-lounge-bar",
    title: "A warmer rhythm.",
    detail: "Lounge study",
    text: "Layered shelving, warm lighting and a place to pause.",
  },
  {
    slug: "interior-bedroom-classic",
    title: "The quiet hours.",
    detail: "Bedroom study",
    text: "Soft light and a considered frame for daily life.",
  },
  {
    slug: "interior-walkin-closet",
    title: "Order, beautifully.",
    detail: "Wardrobe study",
    text: "A composed perspective on the everyday.",
  },
];
export function InteriorSequence() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 768px) and (min-height: 651px) and (prefers-reduced-motion: no-preference)",
      () => {
        const frames = gsap.utils.toArray<HTMLElement>(
          ".interior-slide",
          ref.current!,
        );
        const indicators = gsap.utils.toArray<HTMLElement>(
          ".interior-indicators span",
          ref.current!,
        );
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "interiors",
            trigger: ref.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.25}`,
            pin: true,
            scrub: 0.4,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.set(frames.slice(1), { clipPath: "inset(0% 0% 100% 0%)" });
        frames.slice(1).forEach((frame, index) => {
          const start = 0.7 + index * 1.05;
          tl.to(
            frame,
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55 },
            start,
          )
            .fromTo(
              frame.querySelector(".interior-photo"),
              { scale: 1.045 },
              { scale: 1, duration: 0.85 },
              start,
            )
            .fromTo(
              frame.querySelector(".interior-caption"),
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.35 },
              start + 0.25,
            );
        });
        tl.to({}, { duration: 0.5 });
        let previous = -1;
        tl.eventCallback("onUpdate", () => {
          const index = [1, 2.05, 3.1].filter(
            (beat) => tl.time() >= beat,
          ).length;
          if (previous === index) return;
          previous = index;
          indicators.forEach((item, i) => {
            item.dataset.active = String(i === index);
          });
          frames.forEach((item, i) => {
            item.setAttribute("aria-hidden", String(i !== index));
          });
        });
        indicators[0].dataset.active = "true";
        frames.forEach((item, i) =>
          item.setAttribute("aria-hidden", String(i !== 0)),
        );
        return () => {
          frames.forEach((item) => item.removeAttribute("aria-hidden"));
        };
      },
      ref,
    );
    return () => mm.revert();
  }, []);
  return (
    <section
      className="interior-sequence"
      ref={ref}
      aria-labelledby="interior-title"
      data-scene="interiors"
    >
      <div className="interior-heading">
        <p className="eyebrow">04 / Spaces within</p>
        <h2 id="interior-title">
          Life, on the <em>inside.</em>
        </h2>
        <Link to="/?category=Interiors#work" className="line-link">
          All 25 interiors <Arrow diagonal />
        </Link>
      </div>
      <div className="interior-stage">
        {interiorScenes.map((scene, i) => (
          <figure className="interior-slide" key={scene.slug}>
            <PhotoImage
              item={photo(scene.slug)}
              className="interior-photo"
              sizes="(min-width: 768px) 100vw, 100vw"
              full
            />
            <figcaption className="interior-caption">
              <div>
                <span className="eyebrow">
                  0{i + 1} / {scene.detail}
                </span>
                <h3>{scene.title}</h3>
              </div>
              <p>{scene.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="interior-bottom">
        <span>Interior perspectives · Project groupings pending</span>
        <div className="interior-indicators" aria-hidden="true">
          {interiorScenes.map((scene, i) => (
            <span key={scene.slug} data-active={i === 0}>
              0{i + 1}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
