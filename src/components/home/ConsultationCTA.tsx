import { Link } from "react-router-dom";
import { Arrow } from "../Arrow";
import { CinematicHeading } from "../type/CinematicHeading";
import { SpatialSignature } from "./SpatialSignature";
export function ConsultationCTA() {
  return (
    <section
      className="section-pad consultation"
      aria-labelledby="inquiry-title"
    >
      <p className="eyebrow">09 / A new conversation</p>
      <SpatialSignature className="consultation-signature" />
      <CinematicHeading
        id="inquiry-title"
        lines={[
          { text: "Let’s shape" },
          { text: "your next space.", italic: true },
        ]}
      />
      <div className="consultation-lower">
        <p>
          Every space begins with a conversation.
          <br />
          Tell us what you have in mind.
        </p>
        <Link className="inquiry-button" to="/#contact">
          Discuss a project <Arrow diagonal />
        </Link>
      </div>
    </section>
  );
}
