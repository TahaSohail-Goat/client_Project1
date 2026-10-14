import { useRef } from "react";
import { Link } from "react-router-dom";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { photo, type Photo } from "../../content/media";
import { Arrow } from "../Arrow";
import { PhotoImage } from "../PhotoImage";
import { Reveal } from "../Reveal";

function ExteriorCard({
  item,
  number,
  caption,
}: {
  item: Photo;
  number: string;
  caption: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const reduced = useReducedMotion();
  return (
    <Link
      className="exterior-card"
      ref={ref}
      to={`/work?category=Architecture&photo=${item.slug}`}
    >
      <div className="exterior-frame">
        <m.div style={{ y: reduced ? 0 : y }}>
          <PhotoImage item={item} sizes="(min-width: 768px) 60vw, 100vw" />
        </m.div>
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
  return (
    <section
      className="section-pad exterior-works"
      id="selected-work"
      aria-labelledby="work-title"
    >
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">03 / Architectural perspectives</p>
          <h2 id="work-title">
            The shape of
            <br />
            <em>an idea.</em>
          </h2>
        </div>
        <Link className="line-link" to="/work?category=Architecture">
          View architecture <Arrow diagonal />
        </Link>
      </Reveal>
      <div className="exterior-grid">
        <ExteriorCard
          item={photo("exterior-front-twilight")}
          number="01"
          caption="Light & form"
        />
        <ExteriorCard
          item={photo("exterior-side-landscape")}
          number="02"
          caption="An exterior study"
        />
      </div>
      <div className="section-note">
        <span className="eyebrow">A study in perspective</span>
        <p>
          Facades, proportions and the relationship between a building and its
          surroundings.
        </p>
      </div>
    </section>
  );
}
