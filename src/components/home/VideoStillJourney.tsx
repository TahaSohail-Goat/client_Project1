import gsap from "gsap";
import { photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";

const stills = [
  {
    slug: "supplemental-22",
    kind: "Model study / Facade",
    title: "Form, held in scale.",
    detail: "A front-facing study of the model's exterior composition.",
  },
  {
    slug: "supplemental-23",
    kind: "Model study / Section",
    title: "A view through the spaces.",
    detail: "An open-section view of the model's interior volumes.",
  },
  {
    slug: "supplemental-24",
    kind: "Model study / Upper view",
    title: "The plan, seen in form.",
    detail: "A raised perspective across the model's roof and rooms.",
  },
] as const;

/** Adds still-photo chapters after the supplied video, to its existing hero pin. */
export function addVideoStillJourney(
  timeline: gsap.core.Timeline,
  root: HTMLElement,
  { start }: { start: number },
) {
  const slides = root.querySelectorAll<HTMLElement>(".video-still-slide");
  const planes = root.querySelectorAll<HTMLElement>(".video-still-plane");
  gsap.set(slides, {
    autoAlpha: 0,
    clipPath: "inset(0% 0% 100% 0%)",
  });
  gsap.set(planes, {
    xPercent: (index) => (index % 2 === 0 ? 5 : -5),
    yPercent: 2,
    z: -220,
    rotationY: (index) => (index % 2 === 0 ? -18 : 18),
    rotationX: 4,
    scale: 0.9,
    transformPerspective: 1600,
    transformOrigin: "50% 50%",
  });
  gsap.set(root.querySelectorAll(".video-still-caption"), {
    autoAlpha: 0,
    y: 32,
    rotationX: -5,
    transformPerspective: 1400,
    transformOrigin: "0% 100%",
  });
  gsap.set(root.querySelectorAll(".video-still-camera"), {
    scale: 1.16,
    xPercent: -1.5,
    yPercent: 1,
  });

  slides.forEach((slide, index) => {
    const at = start + index * 0.2;
    const caption = slide.querySelector<HTMLElement>(".video-still-caption")!;
    const plane = slide.querySelector<HTMLElement>(".video-still-plane")!;
    const camera = slide.querySelector<HTMLElement>(".video-still-camera")!;
    timeline
      .to(
        slide,
        {
          autoAlpha: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.13,
          ease: "power2.out",
        },
        at,
      )
      .to(
        plane,
        { xPercent: 0, yPercent: 0, z: 36, rotationY: 0, rotationX: 0, scale: 1, duration: 0.23, ease: "power2.out" },
        at,
      )
      .to(
        caption,
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: 0.1,
          ease: "power2.out",
        },
        at + 0.02,
      );
    if (camera) {
      timeline.to(
        camera,
        {
          scale: 1.035,
          xPercent: index % 2 === 0 ? 0.6 : -0.6,
          yPercent: -0.4,
          duration: 0.42,
        },
        at,
      );
    }
    if (index > 0) {
      timeline.to(
        slides[index - 1],
        { autoAlpha: 0, duration: 0.09, ease: "power2.in" },
        at + 0.02,
      );
      timeline.to(
        slides[index - 1].querySelector(".video-still-plane"),
        { z: -150, rotationY: index % 2 === 0 ? -10 : 10, scale: 0.94, duration: 0.16, ease: "power2.in" },
        at + 0.02,
      );
      timeline.to(
        slides[index - 1].querySelector(".video-still-caption"),
        { autoAlpha: 0, y: -12, duration: 0.08 },
        at + 0.02,
      );
    }
  });
}

export function VideoStillJourney({ loadImages }: { loadImages: boolean }) {
  return (
    <div
      className="video-stills"
      role="group"
      aria-label="A photographic journey beyond the film"
      inert
    >
      {stills.map((still, index) => (
        <figure
          className="video-still-slide"
          key={still.slug}
          data-still-index={index}
          aria-hidden="true"
          inert
        >
          <div className="video-still-plane">
            <div className="video-still-camera">
              {loadImages && (
                <PhotoImage
                  item={photo(still.slug)}
                  className="video-still-photo"
                  sizes="100vw"
                />
              )}
            </div>
            <div className="video-still-shade" />
          </div>
          <figcaption className="video-still-caption">
            <p className="eyebrow">
              0{index + 2} / {still.kind}
            </p>
            <h2>{still.title}</h2>
            <p>{still.detail}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
