import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { m, useReducedMotion } from "motion/react";
export function Footer() {
  const reduced = useReducedMotion();
  return (
    <footer className="footer">
      <Link className="footer-brand" to="/">
        {site.name}
      </Link>
      <p>Architecture & Interior Design</p>
      <div>
        <Link to="/#work">Explore work</Link>
        <Link to="/#contact">Contact</Link>
        <a href="#main">Back to top ↑</a>
      </div>
      <small>
        {site.brandPending
          ? "Studio preview · Brand & editorial copy pending approval"
          : site.disciplines}
      </small>
      <m.div
        className="footer-signature"
        aria-hidden="true"
        initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)", y: 40 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
        viewport={{ amount: 0.15 }}
        transition={{ duration: reduced ? 0 : 1, ease: [0.22, 1, 0.36, 1] }}
      >
        eco<span>28</span>
        <i />
      </m.div>
    </footer>
  );
}
