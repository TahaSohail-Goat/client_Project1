import { Link } from "react-router-dom";
import { photo } from "../../content/media";
import { DepthPhoto } from "../DepthPhoto";
import { CinematicHeading } from "../type/CinematicHeading";
import { Arrow } from "../Arrow";
export function MaterialsScene() {
  return (
    <section
      className="section-pad materials"
      aria-labelledby="materials-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">05 / The considered detail</p>
          <CinematicHeading
            id="materials-title"
            lines={[{ text: "A closer" }, { text: "look.", italic: true }]}
          />
        </div>
        <p className="heading-note">
          Warmth, texture and shadow.
          <br />
          Small moments that shape a space.
        </p>
      </div>
      <div className="materials-grid">
        <div className="material-large">
          <Link
            to="/?category=Interiors&photo=interior-display-wall#work"
            className="material-photo"
          >
            <DepthPhoto
              item={photo("interior-display-wall")}
              sizes="(min-width:768px) 55vw, 100vw"
            />
            <span className="image-open">
              <Arrow diagonal />
            </span>
          </Link>
          <p className="image-meta">01 / Display & light</p>
        </div>
        <div className="material-small">
          <Link
            to="/?category=Interiors&photo=interior-bathroom-warmstone#work"
            className="material-photo"
          >
            <DepthPhoto
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
          <Link className="line-link" to="/?category=Interiors#work">
            Explore interior studies <Arrow diagonal />
          </Link>
        </div>
      </div>
    </section>
  );
}
