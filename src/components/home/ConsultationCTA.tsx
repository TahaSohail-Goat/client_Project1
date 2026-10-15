import { Link } from "react-router-dom";
import { useRef } from "react";
import { Arrow } from "../Arrow";
import { CinematicHeading } from "../type/CinematicHeading";
import { ConsultationSculpture } from "./ConsultationSculpture";
export function ConsultationCTA() {
  const ref = useRef<HTMLElement>(null);
  return (
    <section
      className="section-pad consultation"
      ref={ref}
      aria-labelledby="inquiry-title"
    >
      <p className="eyebrow">09 / A new conversation</p>
      <CinematicHeading
        id="inquiry-title"
        lines={[
          { text: "Let’s shape" },
          { text: "your next space.", italic: true },
        ]}
      />
      <ConsultationSculpture section={ref} />
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
