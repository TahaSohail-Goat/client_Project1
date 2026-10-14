import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { photo } from "../../content/media";
import { heroChapters, heroCopy } from "../../content/hero";
import { site } from "../../content/site";
import { PhotoImage } from "../PhotoImage";
import { Arrow } from "../Arrow";
import { EditorialHeading } from "../type/EditorialHeading";
import { FacadePanelReveal } from "./FacadePanelReveal";
import { addVisionDepth } from "./visionDepth";

gsap.registerPlugin(ScrollTrigger);
export function PhotographicHero({ notice }: { notice?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [loadStory, setLoadStory] = useState(false);
  const [staticStory, setStaticStory] = useState(false);
  const requested = useRef(false);
  const prepareStory = useCallback(() => {
    if (!requested.current) {
      requested.current = true;
      setLoadStory(true);
    }
  }, []);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        desktop: "(min-width: 768px)",
        immersive: "(min-width: 1024px) and (min-height: 700px)",
        mobile: "(max-width: 767px)",
        reduced: "(prefers-reduced-motion: reduce)",
        short:
          "(max-height: 500px), (max-width: 767px) and (max-height: 650px)",
      },
      (context) => {
        const root = ref.current!;
        const frames = Array.from(
          root.querySelectorAll<HTMLElement>("[data-journey-frame]"),
        );
        const intro = root.querySelector<HTMLElement>(".hero-copy")!;
        const panel = root.querySelector<HTMLElement>(".ivory-panel")!;
        const fallback = !!(
          context.conditions?.reduced || context.conditions?.short
        );
        setStaticStory(fallback);
        if (fallback) {
          setLoadStory(true);
          return;
        }
        const desktop = !!context.conditions?.desktop;
        let lastChapter = -1;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "hero",
            trigger: root,
            start: "top top",
            end: () => `+=${window.innerHeight * (desktop ? 6.4 : 4.5333333333)}`,
            pin: true,
            scrub: desktop ? 0.6 : 0.35,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.set(
          [
            ".journey-exterior",
            ".journey-within",
            ".journey-detail",
            ".hero-finish",
          ],
          { opacity: 0 },
        );
        gsap.set(".journey-caption", { opacity: 0, y: 24 });
        gsap.set(".journey-caption .editorial-heading__line > span", {
          opacity: 0,
          yPercent: 115,
          rotation: -1.5,
        });
        gsap.set(".journey-aperture", { opacity: 0, scale: 0.8 });
        // A shared 16-unit timeline preserves the photo journey and extends its spatial finish.
        tl.to(
          ".hero-photo",
          {
            scale: 1.1,
            xPercent: -0.8,
            yPercent: -1.5,
            rotationY: desktop ? 1.2 : 0,
            duration: 2.4,
          },
          0,
        )
          .to(".hero-copy", { opacity: 0, y: -45, duration: 0.75 }, 1.15)
          .fromTo(
            ".journey-exterior",
            { opacity: 1, clipPath: "inset(0% 100% 0% 0%)", xPercent: 4 },
            {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              xPercent: 0,
              duration: 1.1,
              immediateRender: false,
            },
            1.8,
          )
          .fromTo(
            ".journey-exterior .journey-camera",
            { scale: 1.02, rotationY: desktop ? -1.5 : 0 },
            {
              scale: 1.09,
              rotationY: 0,
              xPercent: -0.5,
              duration: 2.2,
              immediateRender: false,
            },
            1.8,
          )
          .to(".caption-outside", { opacity: 1, y: 0, duration: 0.45 }, 2.45)
          .to(
            ".caption-outside .editorial-heading__line > span",
            { opacity: 1, yPercent: 0, rotation: 0, stagger: 0.08, duration: 0.38 },
            2.48,
          )
          .to(".caption-outside", { opacity: 0, y: -18, duration: 0.4 }, 3.4)
          .to(
            ".journey-aperture",
            { opacity: 0.7, scale: 1, duration: 0.4 },
            3.25,
          )
          .fromTo(
            ".journey-within",
            {
              opacity: 1,
              clipPath: desktop
                ? "inset(24% 36% 24% 36%)"
                : "inset(28% 22% 28% 22%)",
            },
            {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.45,
              immediateRender: false,
            },
            3.6,
          )
          .to(
            ".journey-exterior .journey-camera",
            { scale: 1.02, duration: 1.3 },
            3.6,
          )
          .to(
            ".journey-aperture",
            { opacity: 0, scale: 1.8, duration: 0.7 },
            3.85,
          )
          .fromTo(
            ".journey-within .journey-camera",
            { scale: 1.035, yPercent: 1 },
            {
              scale: 1.1,
              yPercent: -1.5,
              duration: 3.15,
              immediateRender: false,
            },
            3.6,
          )
          .to(".caption-within", { opacity: 1, y: 0, duration: 0.5 }, 4.9)
          .to(
            ".caption-within .editorial-heading__line > span",
            { opacity: 1, yPercent: 0, rotation: 0, stagger: 0.08, duration: 0.38 },
            4.94,
          )
          .to(".caption-within", { opacity: 0, y: -20, duration: 0.4 }, 6.25)
          .fromTo(
            ".journey-detail",
            { opacity: 1, clipPath: "inset(100% 0% 0% 0%)", yPercent: 3 },
            {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              yPercent: 0,
              duration: 1.15,
              immediateRender: false,
            },
            6.3,
          )
          .fromTo(
            ".journey-detail .journey-camera",
            { scale: 1.06, xPercent: -1.2, rotationY: desktop ? 1 : 0 },
            {
              scale: 1.1,
              xPercent: 0.6,
              rotationY: 0,
              duration: 2.45,
              immediateRender: false,
            },
            6.3,
          )
          .to(".caption-detail", { opacity: 1, y: 0, duration: 0.45 }, 7.05)
          .to(
            ".caption-detail .editorial-heading__line > span",
            { opacity: 1, yPercent: 0, rotation: 0, stagger: 0.08, duration: 0.38 },
            7.08,
          )
          .to(".caption-detail", { opacity: 0, y: -20, duration: 0.4 }, 8.25)
          .fromTo(
            ".hero-finish",
            { opacity: 0, clipPath: "inset(0% 0% 0% 0%)" },
            { opacity: 1, duration: 0.55, immediateRender: false },
            8.5,
          )
          .fromTo(
            ".facade-photo",
            { scale: 1.02 },
            {
              scale: 1.08,
              yPercent: -1,
              duration: 1.45,
              immediateRender: false,
            },
            8.5,
          )
          .to(".hero-top", { opacity: 0, duration: 0.4 }, 8.65);
        addVisionDepth(tl, root, { start: 9.15, duration: 5.75, immersive: !!context.conditions?.immersive });
        tl.to({}, { duration: 1.1 }, 14.9);
        const update = () => {
          const time = tl.time();
          const index =
            time < 2.3
              ? 0
              : time < 4.4
                ? 1
                : time < 6.8
                  ? 2
                  : time < 9.35
                    ? 3
                    : 4;
          intro.inert = time > 1.9;
          panel.inert = time < 14.9;
          if (time > 0.06) prepareStory();
          if (index === lastChapter) return;
          lastChapter = index;
          root.dataset.chapter = heroChapters[index].id;
          frames.forEach((frame, i) => {
            frame.setAttribute("aria-hidden", String(i !== index));
            frame.inert = i !== index;
          });
        };
        tl.eventCallback("onUpdate", update);
        update();
        return () => {
          frames.forEach((frame) => {
            frame.removeAttribute("aria-hidden");
            frame.inert = false;
          });
          intro.inert = false;
          panel.inert = false;
          delete root.dataset.chapter;
        };
      },
      ref,
    );
    return () => mm.revert();
  }, [prepareStory]);
  const caption = (
    className: string,
    chapter: string,
    lines: readonly string[],
  ) => (
    <div className={`journey-caption ${className}`}>
      <p className="eyebrow">{chapter}</p>
      <EditorialHeading lead={lines[0]} emphasis={lines[1]} />
    </div>
  );
  const image = (slug: string) => (
    <div className="journey-camera">
      {(loadStory || staticStory) && (
        <PhotoImage item={photo(slug)} className="journey-photo" full />
      )}
    </div>
  );
  return (
    <section
      className="hero hero-journey"
      ref={ref}
      aria-labelledby="hero-title"
      data-scene="hero"
    >
      {notice && <p className="video-fallback-notice" role="status">{notice}</p>}
      <div className="hero-world">
        <figure className="journey-plane journey-arrival" data-journey-frame>
          <PhotoImage
            item={photo(heroChapters[0].slug)}
            className="hero-photo journey-photo"
            priority
            full
          />
          <div className="journey-photo-shade" />
          <div className="hero-copy">
            <p className="eyebrow">01 / Form & feeling</p>
            <EditorialHeading
              as="h1"
              id="hero-title"
              lead={site.hero[0]}
              emphasis={site.hero[1]}
            />
            <div className="hero-actions">
              <Link to="/#work" className="line-link">
                Explore the work <Arrow diagonal />
              </Link>
              <Link to="/#contact" className="quiet-link">
                Discuss a project
              </Link>
            </div>
          </div>
        </figure>
        <figure className="journey-plane journey-exterior" data-journey-frame>
          {image(heroChapters[1].slug)}
          <div className="journey-photo-shade" />
          {caption(
            "caption-outside",
            "02 / Architecture in perspective",
            heroCopy.outside,
          )}
          <figcaption className="journey-static-caption">
            Architecture / A different perspective
          </figcaption>
        </figure>
        <figure className="journey-plane journey-within" data-journey-frame>
          {image(heroChapters[2].slug)}
          <div className="journey-photo-shade" />
          {caption(
            "caption-within",
            "03 / The interior collection",
            heroCopy.within,
          )}
          <figcaption className="journey-static-caption">
            Interior study / Living & dining
          </figcaption>
        </figure>
        <figure className="journey-plane journey-detail" data-journey-frame>
          {image(heroChapters[3].slug)}
          <div className="journey-photo-shade" />
          {caption(
            "caption-detail",
            "04 / Interior atmosphere",
            heroCopy.detail,
          )}
          <figcaption className="journey-static-caption">
            Interior study / Lounge & light
          </figcaption>
        </figure>
      </div>
      <div className="journey-aperture" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="hero-top">
        <span className="eyebrow">Architecture & Interior Design</span>
        <span className="eyebrow">{heroCopy.collection}</span>
      </div>
      <div data-journey-frame className="journey-finish-frame">
        <FacadePanelReveal embedded />
      </div>
    </section>
  );
}
