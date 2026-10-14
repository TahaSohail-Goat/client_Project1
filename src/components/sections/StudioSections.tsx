import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { photo } from "../../content/media";
import { DepthPhoto } from "../DepthPhoto";
import { CinematicHeading } from "../type/CinematicHeading";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
export function StudioIntro() {
  return (
    <>
      <section className="page-heading section-pad studio-heading" id="studio">
        <p className="eyebrow">The studio / Architecture & Interior Design</p>
        <CinematicHeading
          lines={[
            { text: "Space, seen" },
            { text: "as a whole.", italic: true },
          ]}
        />
        <div className="page-intro">
          <p>{site.studio}</p>
          <span>
            Studio introduction
            <br />
            Architecture & interiors
          </span>
        </div>
      </section>
      <div className="studio-banner">
        <DepthPhoto item={photo("exterior-rear-facade")} wide />
      </div>
      <section className="section-pad studio-statement">
        <p className="eyebrow">A point of view</p>
        <div>
          <CinematicHeading
            lines={[
              { text: "From the first impression" },
              { text: "to the smallest detail.", italic: true },
            ]}
          />
          <Reveal>
            <p>{site.approach}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function StudioExpertiseSection() {
  return (
    <section
      className="section-pad expertise"
      id="expertise"
      aria-labelledby="expertise-title"
    >
      <p className="eyebrow">The two disciplines</p>
      <CinematicHeading
        id="expertise-title"
        lines={[
          { text: "Architecture." },
          { text: "Interior Design.", italic: true },
        ]}
      />
      <div className="expertise-row">
        <div id="architecture">
          <span className="eyebrow">01 / Architecture</span>
          <h3>
            Form, light
            <br />
            and proportion.
          </h3>
          <p>
            Explore the exterior studies: a collection of facades, garden-facing
            elevations and architectural perspectives.
          </p>
          <Link className="line-link" to="/?category=Architecture#work">
            View architecture <Arrow diagonal />
          </Link>
        </div>
        <DepthPhoto
          item={photo("exterior-side-landscape")}
          sizes="(min-width:768px) 50vw, 100vw"
        />
      </div>
      <div className="expertise-row">
        <div id="interior-design">
          <span className="eyebrow">02 / Interior Design</span>
          <h3>
            Spaces for
            <br />
            everyday life.
          </h3>
          <p>
            Explore the interior studies, from living and dining spaces to
            bedrooms, wardrobes and quiet details.
          </p>
          <Link className="line-link" to="/?category=Interiors#work">
            View interiors <Arrow diagonal />
          </Link>
        </div>
        <DepthPhoto
          item={photo("interior-dining-living")}
          sizes="(min-width:768px) 50vw, 100vw"
        />
      </div>
      <p className="portfolio-note">
        Architecture and interior design, explored through form, light and the
        spaces of everyday life.
      </p>
    </section>
  );
}
