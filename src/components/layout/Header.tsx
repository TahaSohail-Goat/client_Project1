import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { site } from "../../content/site";
import { Arrow } from "../Arrow";

const navigation = [
  { label: "Work", id: "work" },
  { label: "3D study", id: "housing" },
  { label: "Approach", id: "approach" },
  { label: "Studio", id: "studio" },
  { label: "Expertise", id: "expertise" },
  { label: "Contact", id: "contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [overFilm, setOverFilm] = useState(true);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const hero = document.querySelector<HTMLElement>(".video-hero");
      const bounds = hero?.getBoundingClientRect();
      const sequence = hero?.closest<HTMLElement>(".hero-sequence");
      setOverFilm(!!bounds && bounds.top <= 100 && bounds.bottom > 100 &&
        Number(sequence?.dataset.progress ?? 0) < 0.82);
      let current = "";
      let nearest = -Infinity;
      for (const item of navigation) {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= 160 && top > nearest) {
          current = item.id;
          nearest = top;
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("studio:hero-surface", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("studio:hero-surface", schedule);
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const backgrounds = document.querySelectorAll<HTMLElement>("main, footer");
    backgrounds.forEach((element) => { element.inert = true; });
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab") {
        const targets = [toggle.current!, ...Array.from(
          panel.current?.querySelectorAll<HTMLElement>("a") ?? [],
        )];
        const first = targets[0], last = targets.at(-1)!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = prior;
      backgrounds.forEach((element) => { element.inert = false; });
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);

  const navigate = (id: string) => {
    setOpen(false);
    // A repeated anchor still navigates after the user has scrolled away.
    if (location.hash === `#${id}`) {
      requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (!target) return;
        window.dispatchEvent(new CustomEvent("studio:scroll-to", {
          detail: target.getBoundingClientRect().top + scrollY - Number(target.dataset.scrollOffset ?? 100),
        }));
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      });
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`header ${scrolled ? "is-scrolled" : ""} ${overFilm ? "is-over-film" : ""} ${open ? "is-open" : ""}`}>
        <Link to="/#main" className="wordmark" aria-label={`${site.name} home`}
          tabIndex={open ? -1 : undefined} onClick={() => navigate("main")}>
          <span className="wordmark-name">eco<span>28</span><i aria-hidden="true" /></span>
          <span className="wordmark-description">Architecture & interiors</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.filter((item) => item.id !== "contact").map((item) => (
            <Link key={item.id} to={`/#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={active === item.id ? "active" : undefined}
              onClick={() => navigate(item.id)}>{item.label}</Link>
          ))}
        </nav>
        <Link to="/#contact" className="header-inquiry" aria-label="Discuss a project with eco28" onClick={() => navigate("contact")}>
          Discuss a project <span><Arrow diagonal /></span>
        </Link>
        <button className="menu-toggle" ref={toggle} onClick={() => setOpen(!open)}
          aria-expanded={open} aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}>
          <span>{open ? "Close" : "Menu"}</span>
          <i className={open ? "is-open" : ""} aria-hidden="true"><b /><b /></i>
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <m.div id="mobile-navigation" ref={panel} className="mobile-navigation" data-lenis-prevent
            role="dialog" aria-modal="true" aria-label="Site navigation"
            initial={{ opacity: 0, y: reduced ? 0 : -12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            <div className="mobile-navigation-intro"><span className="eyebrow">Explore eco28</span><span>Architecture & interiors</span></div>
            <nav aria-label="Mobile navigation">
              {navigation.map((item, index) => (
                <Link key={item.id} to={`/#${item.id}`} onClick={() => navigate(item.id)}
                  aria-current={active === item.id ? "location" : undefined}>
                  <small>0{index + 1}</small><span>{item.label}</span><Arrow diagonal />
                </Link>
              ))}
            </nav>
            <div className="mobile-navigation-footer"><p>Space, seen <em>as a whole.</em></p><span className="eyebrow">eco28 / Architecture & Interior Design</span></div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
