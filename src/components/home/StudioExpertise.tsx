import { Link } from "react-router-dom";
import { photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
export function StudioExpertise() {
  return (
    <section
      className="section-pad studio-home"
      aria-labelledby="studio-home-title"
    >
      <Reveal className="studio-home-photo">
        <PhotoImage
          item={photo("interior-reading-nook")}
          sizes="(min-width:768px) 48vw, 100vw"
        />
      </Reveal>
      <Reveal className="studio-home-copy">
        <p className="eyebrow">08 / The studio</p>
        <h2 id="studio-home-title">
          Outside.
          <br />
          Inside.
          <br />
          <em>Together.</em>
        </h2>
        <p>
          Architecture and interior design. Two connected ways of thinking about
          the spaces around us.
        </p>
        <div className="expertise-list">
          <Link to="/studio#architecture">
            Architecture <Arrow diagonal />
          </Link>
          <Link to="/studio#interior-design">
            Interior Design <Arrow diagonal />
          </Link>
        </div>
        <Link className="line-link" to="/studio">
          Explore the studio <Arrow diagonal />
        </Link>
      </Reveal>
    </section>
  );
}
