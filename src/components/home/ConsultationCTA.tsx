import { Link } from "react-router-dom";
import { Reveal } from "../Reveal";
import { Arrow } from "../Arrow";
export function ConsultationCTA() {
  return (
    <section
      className="section-pad consultation"
      aria-labelledby="inquiry-title"
    >
      <p className="eyebrow">09 / A new conversation</p>
      <Reveal>
        <h2 id="inquiry-title">
          Let’s shape
          <br />
          <em>your next space.</em>
        </h2>
      </Reveal>
      <div className="consultation-lower">
        <p>
          Every space begins with a conversation.
          <br />
          Tell us what you have in mind.
        </p>
        <Link className="inquiry-button" to="/contact">
          Discuss a project <Arrow diagonal />
        </Link>
      </div>
    </section>
  );
}
