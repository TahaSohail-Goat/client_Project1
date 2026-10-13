import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
export function ApproachEditorial() {
  return (
    <section
      className="section-pad approach"
      id="approach"
      aria-labelledby="approach-title"
    >
      <p className="eyebrow">07 / A way of seeing</p>
      <Reveal>
        <h2 id="approach-title">
          A dialogue between
          <br />
          space <em>and life.</em>
        </h2>
      </Reveal>
      <div className="approach-lower">
        <span className="approach-symbol" aria-hidden="true">
          ＋
        </span>
        <Reveal>
          <p>{site.approach}</p>
          <Link to="/studio" className="line-link">
            Meet the studio <Arrow diagonal />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
