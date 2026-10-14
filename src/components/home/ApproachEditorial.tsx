import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
import { CinematicHeading } from "../type/CinematicHeading";
import { SpatialSignature } from "./SpatialSignature";
export function ApproachEditorial() {
  return (
    <section
      className="section-pad approach"
      id="approach"
      aria-labelledby="approach-title"
    >
      <p className="eyebrow">07 / A way of seeing</p>
      <CinematicHeading
        id="approach-title"
        lines={[
          { text: "A dialogue between" },
          { text: "space and life.", italic: true },
        ]}
      />
      <div className="approach-lower">
        <SpatialSignature />
        <Reveal>
          <p>{site.approach}</p>
          <Link to="/#studio" className="line-link">
            Meet the studio <Arrow diagonal />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
