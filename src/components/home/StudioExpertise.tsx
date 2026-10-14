import { Link } from "react-router-dom";
import { photo } from "../../content/media";
import { DepthPhoto } from "../DepthPhoto";
import { CinematicHeading } from "../type/CinematicHeading";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
export function StudioExpertise() {
  return (
    <section
      className="section-pad studio-home"
      aria-labelledby="studio-home-title"
    >
      <div className="studio-home-photo">
        <DepthPhoto
          item={photo("interior-reading-nook")}
          sizes="(min-width:768px) 48vw, 100vw"
        />
      </div>
      <div className="studio-home-copy">
        <p className="eyebrow">08 / The studio</p>
        <CinematicHeading
          id="studio-home-title"
          lines={[
            { text: "Outside." },
            { text: "Inside." },
            { text: "Together.", italic: true },
          ]}
        />
        <Reveal>
          <p>
            Architecture and interior design. Two connected ways of thinking
            about the spaces around us.
          </p>
          <div className="expertise-list">
            <Link to="/#architecture">
              Architecture <Arrow diagonal />
            </Link>
            <Link to="/#interior-design">
              Interior Design <Arrow diagonal />
            </Link>
          </div>
          <Link className="line-link" to="/#studio">
            Explore the studio <Arrow diagonal />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
