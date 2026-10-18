import { Link, useLocation } from "react-router-dom";
import { site } from "../../content/site";
import { Arrow } from "../Arrow";
import { m, useReducedMotion } from "motion/react";
import { navigation } from "../../content/navigation";
import { scrollToSection } from "../scroll/anchors";

export function Footer() {
  const reduced = useReducedMotion();
  const location = useLocation();
  const navigate = (id: string) => {
    // React Router does not rerun hash navigation when the same link is used twice.
    if (location.pathname !== "/" || location.hash !== `#${id}`) return;
    scrollToSection(id);
  };
  return (
    <footer className="footer" aria-label="eco28 footer">
      <div className="footer-top">
        <div className="footer-identity">
          <Link className="footer-brand" to="/#main" aria-label={`${site.name} home`} onClick={() => navigate("main")}>
            <img src="/media/brand/eco28-logo-light.svg" alt="" width="888" height="624" loading="lazy" />
          </Link>
          <p>Architecture and interiors,<br />considered together.</p>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          <h2 className="eyebrow">Explore</h2>
          {navigation.map(({ label, id }) => <Link key={id} to={`/#${id}`} onClick={() => navigate(id)}>{label}<Arrow diagonal /></Link>)}
        </nav>
        <div className="footer-conversation">
          <h2 className="eyebrow">A new conversation</h2>
          <p>Have a space<br /><em>in mind?</em></p>
          <Link className="footer-project-link" to="/#contact" onClick={() => navigate("contact")}>Discuss your project <Arrow diagonal /></Link>
          {site.inquiry.email && <a className="footer-email" href={`mailto:${site.inquiry.email}`}>{site.inquiry.email}</a>}
          {site.contact.phone && <a className="footer-email" href={`tel:${site.contact.phone.replace(/[^+\d]/g, "")}`}>{site.contact.phone}</a>}
          {site.contact.location && <span className="footer-location">{site.contact.location}</span>}
        </div>
      </div>
      <m.div className="footer-signature" aria-hidden="true"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduced ? 0 : .8, ease: [0.22, 1, 0.36, 1] }}>
        <img src="/media/brand/eco28-wordmark-light.svg" alt="" width="765" height="168" loading="lazy" />
      </m.div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} {site.name}</small>
        <span>Architecture &amp; Interior Design</span>
        <Link to="/#main" onClick={() => navigate("main")}>Back to top <span aria-hidden="true">↑</span></Link>
      </div>
    </footer>
  );
}
