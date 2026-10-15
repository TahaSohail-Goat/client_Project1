import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { photo, type Photo } from "../../content/media";
import { Arrow } from "../Arrow";
import { Reveal } from "../Reveal";
import { DepthPhoto } from "../DepthPhoto";
import { CinematicHeading } from "../type/CinematicHeading";

gsap.registerPlugin(ScrollTrigger);

function ExteriorCard({
  item,
  number,
  caption,
  threeD = false,
}: {
  item: Photo;
  number: string;
  caption: string;
  threeD?: boolean;
}) {
  return (
    <Link
      className="exterior-card"
      to={`/?category=Architecture&photo=${item.slug}#work`}
    >
      <div
        className="exterior-frame"
        style={{ "--exterior-photo-ratio": item.aspect_ratio } as CSSProperties}
      >
        <DepthPhoto
          item={item}
          sizes="(min-width: 768px) 65vw, 100vw"
          wide
          threeD={threeD}
        />
        <span className="image-open">
          <Arrow diagonal />
        </span>
      </div>
      <div className="image-meta">
        <span>
          {number} / {caption}
        </span>
        <span>Architecture</span>
      </div>
    </Link>
  );
}
export function ExteriorWorks() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 1024px) and (min-height: 700px)",
      },
      (context) => {
        if (!context.conditions?.motion) return;
        const immersive = !!context.conditions?.desktop;
        const grid = ref.current!.querySelector<HTMLElement>(".exterior-grid")!;
        ref.current!.querySelectorAll<HTMLElement>(".exterior-card").forEach((card, index) => {
          const direction = index === 0 ? -1 : 1;
          const layoutTop = () => grid.getBoundingClientRect().top + scrollY + card.offsetTop;
          gsap.fromTo(
            card,
            {
              opacity: 0.45,
              x: immersive ? direction * 65 : 0,
              y: immersive ? 100 : 25,
              z: immersive ? -200 : 0,
              rotationY: immersive ? direction * 22 : 0,
              rotationX: immersive ? 9 : 0,
              rotationZ: immersive ? direction * 3 : 0,
              scale: immersive ? 0.86 : 0.97,
              transformPerspective: 1400,
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              z: 0,
              rotationY: 0,
              rotationX: 0,
              rotationZ: 0,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: grid,
                start: () => layoutTop() - innerHeight * 0.95,
                end: () => layoutTop() - innerHeight * 0.2,
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      },
      ref,
    );
    return () => mm.revert();
  }, []);
  return (
    <section
      ref={ref}
      className="section-pad exterior-works"
      id="selected-work"
      aria-labelledby="work-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / Architectural perspectives</p>
          <CinematicHeading
            id="work-title"
            lines={[
              { text: "The shape of" },
              { text: "an idea.", italic: true },
            ]}
          />
        </div>
        <Link className="line-link" to="/?category=Architecture#work">
          View architecture <Arrow diagonal />
        </Link>
      </div>
      <div className="exterior-grid">
        <ExteriorCard
          item={photo("supplemental-01")}
          number="01"
          caption="Light & form"
          threeD
        />
        <ExteriorCard
          item={photo("supplemental-03")}
          number="02"
          caption="An exterior study"
        />
      </div>
      <Reveal className="section-note">
        <span className="eyebrow">A study in perspective</span>
        <p>
          Facades, proportions and the relationship between a building and its
          surroundings.
        </p>
      </Reveal>
    </section>
  );
}
