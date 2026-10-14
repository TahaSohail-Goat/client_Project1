import { Link } from "react-router-dom";
import { photo, type Photo } from "../../content/media";
import { Arrow } from "../Arrow";
import { Reveal } from "../Reveal";
import { DepthPhoto } from "../DepthPhoto";
import { CinematicHeading } from "../type/CinematicHeading";

function ExteriorCard({
  item,
  number,
  caption,
}: {
  item: Photo;
  number: string;
  caption: string;
}) {
  return (
    <Link
      className="exterior-card"
      to={`/?category=Architecture&photo=${item.slug}#work`}
    >
      <div className="exterior-frame">
        <DepthPhoto item={item} sizes="(min-width: 768px) 65vw, 100vw" wide />
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
          item={photo("supplemental-04")}
          number="01"
          caption="Light & form"
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
