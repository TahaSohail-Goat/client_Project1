import { Link } from "react-router-dom";
import { photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
export function MaterialsScene() {
  return (
    <section
      className="section-pad materials"
      aria-labelledby="materials-title"
    >
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">05 / The considered detail</p>
          <h2 id="materials-title">
            A closer
            <br />
            <em>look.</em>
          </h2>
        </div>
        <p className="heading-note">
          Warmth, texture and shadow.
          <br />
          Small moments that shape a space.
        </p>
      </Reveal>
      <div className="materials-grid">
        <Reveal className="material-large">
          <Link
            to="/work?category=Interiors&photo=interior-display-wall"
            className="material-photo"
          >
            <PhotoImage
              item={photo("interior-display-wall")}
              sizes="(min-width:768px) 55vw, 100vw"
            />
            <span className="image-open">
              <Arrow diagonal />
            </span>
          </Link>
          <p className="image-meta">01 / Display & light</p>
        </Reveal>
        <Reveal className="material-small">
          <Link
            to="/work?category=Interiors&photo=interior-bathroom-warmstone"
            className="material-photo"
          >
            <PhotoImage
              item={photo("interior-bathroom-warmstone")}
              sizes="(min-width:768px) 27vw, 100vw"
            />
            <span className="image-open">
              <Arrow diagonal />
            </span>
          </Link>
          <p className="image-meta">02 / Texture & reflection</p>
          <p className="material-copy">
            A collection of details, seen through the studio’s interior
            photography.
          </p>
          <Link className="line-link" to="/work?category=Interiors">
            Explore interior studies <Arrow diagonal />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
