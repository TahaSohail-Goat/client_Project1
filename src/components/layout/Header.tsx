import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { site } from "../../content/site";
import { Arrow } from "../Arrow";
import { navigation } from "../../content/navigation";
import { scrollToSection, sectionTop } from "../scroll/anchors";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
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
      const hero = document.querySelector<HTMLElement>(".hero-stage");
      const bounds = hero?.getBoundingClientRect();
      const sequence = hero?.closest<HTMLElement>(".hero-sequence");
      setOverHero(!!bounds && bounds.top <= 100 && bounds.bottom > 100 &&
        Number(sequence?.dataset.progress ?? 0) < 0.82);
      let current = "";
      for (const item of navigation) {
        const target = document.getElementById(item.id);
        if (target && sectionTop(target) <= window.scrollY + 160) {
          current = item.id;
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
    ScrollTrigger.addEventListener("refresh", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("studio:hero-surface", schedule);
      ScrollTrigger.removeEventListener("refresh", schedule);
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
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
        scrollToSection(id);
      });
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`header ${scrolled ? "is-scrolled" : ""} ${overHero ? "is-over-hero" : ""} ${open ? "is-open" : ""}`}>
        <Link to="/#main" className="wordmark" aria-label={`${site.name} home`}
          tabIndex={open ? -1 : undefined} onClick={() => navigate("main")}>
          <span className="wordmark-art" aria-hidden="true">
            <img className="wordmark-logo wordmark-logo-default" src="/media/brand/eco28-logo.svg" alt="" width="888" height="624" />
            <img className="wordmark-logo wordmark-logo-on-dark" src="/media/brand/eco28-logo-light.svg" alt="" width="888" height="624" />
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.filter((item) => item.id !== "contact").map((item) => (
            <Link key={item.id} to={`/#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={active === item.id ? "active" : undefined}
              onClick={() => navigate(item.id)}>{item.label}</Link>
          ))}
        </nav>
        <Link to="/#contact" className="header-inquiry" aria-label="Contact eco28 about a project"
          aria-current={active === "contact" ? "location" : undefined} onClick={() => navigate("contact")}>
          Contact <span><Arrow diagonal /></span>
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
                  <small>{String(index + 1).padStart(2, "0")}</small><span>{item.label}</span><Arrow diagonal />
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
