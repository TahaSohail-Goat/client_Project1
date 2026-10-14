import gsap from "gsap";

/** Appends a 3D editorial sequence to its owner's timeline; never creates a pin. */
export function addVisionDepth(
  timeline: gsap.core.Timeline,
  root: HTMLElement,
  {
    start,
    duration,
    immersive,
  }: { start: number; duration: number; immersive: boolean },
) {
  const panel = root.querySelector<HTMLElement>(".ivory-panel")!;
  const stage = panel.querySelector<HTMLElement>(".vision-depth-stage")!;
  const heading = panel.querySelectorAll<HTMLElement>(".vision-line > span");
  const kicker = panel.querySelector<HTMLElement>(".vision-kicker")!;
  const photo = panel.querySelector<HTMLElement>(".vision-composition")!;
  const mask = panel.querySelector<HTMLElement>(".vision-photo-mask")!;
  const camera = panel.querySelector<HTMLElement>(".vision-photo-camera")!;
  const back = panel.querySelector<HTMLElement>(".vision-photo-sheet--back")!;
  const middle = panel.querySelector<HTMLElement>(
    ".vision-photo-sheet--middle",
  )!;
  const copy = panel.querySelector<HTMLElement>(".vision-copy")!;
  const mark = panel.querySelector<HTMLElement>(".section-mark")!;
  const drawing = panel.querySelector<SVGElement>(".vision-drafting")!;
  const paths = drawing.querySelectorAll(".vision-drafting-line");
  const at = (phase: number) => start + duration * phase;
  const span = (phase: number) => duration * phase;

  gsap.set(panel, { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(stage, {
    y: immersive ? 100 : 24,
    z: immersive ? -360 : -40,
    rotationX: immersive ? 12 : 3,
    rotationY: immersive ? -7 : 0,
    transformOrigin: "50% 70%",
    transformPerspective: 1800,
  });
  gsap.set(heading, {
    yPercent: 115,
    rotationX: immersive ? 64 : 14,
    x: (index) => (immersive && index === 1 ? -26 : 0),
    rotationZ: (index) => (immersive && index === 1 ? -3 : 0),
    z: immersive ? 100 : 0,
    transformPerspective: 1400,
    transformOrigin: "50% 100%",
  });
  gsap.set(kicker, { opacity: 0, y: 14 });
  gsap.set(photo, {
    opacity: 0,
    xPercent: immersive ? 16 : 0,
    y: immersive ? 60 : 18,
    z: immersive ? 300 : 0,
    scale: immersive ? 0.82 : 0.96,
    rotationY: immersive ? -28 : -5,
    rotationX: immersive ? 14 : 3,
    rotationZ: immersive ? -4 : 0,
    transformPerspective: 1600,
    transformOrigin: "50% 50%",
  });
  gsap.set(mask, { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set(camera, { scale: 1.16, xPercent: -2.5, yPercent: -1 });
  gsap.set(back, {
    x: immersive ? -64 : -14,
    y: immersive ? 50 : 9,
    z: -180,
    rotationZ: -8,
    opacity: 0,
  });
  gsap.set(middle, { x: -32, y: 24, z: -90, rotationZ: -4, opacity: 0 });
  gsap.set(copy, {
    opacity: 0,
    y: 30,
    z: immersive ? 90 : 0,
    rotationY: immersive ? 8 : 0,
  });
  gsap.set(mark, { rotation: -45, scale: 0.65, transformOrigin: "50% 50%" });
  gsap.set(drawing, {
    opacity: 0,
    rotationX: immersive ? 20 : 0,
    z: -150,
    transformOrigin: "50% 50%",
  });
  gsap.set(paths, { strokeDashoffset: 1 });

  timeline
    .to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: span(0.26) }, at(0))
    .to(
      stage,
      {
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        duration: span(0.76),
        ease: "power2.out",
      },
      at(0.08),
    )
    .to(kicker, { opacity: 1, y: 0, duration: span(0.18) }, at(0.13))
    .to(
      heading,
      {
        yPercent: 0,
        rotationX: 0,
        x: 0,
        rotationZ: 0,
        z: 0,
        duration: span(0.37),
        stagger: span(0.055),
        ease: "power3.out",
      },
      at(0.18),
    )
    .to(
      drawing,
      {
        opacity: immersive ? 0.4 : 0.2,
        rotationX: 0,
        z: 0,
        duration: span(0.24),
      },
      at(0.12),
    )
    .to(
      paths,
      {
        strokeDashoffset: 0,
        stagger: span(0.05),
        duration: span(0.36),
        ease: "none",
      },
      at(0.17),
    )
    .to(photo, { opacity: 1, duration: span(0.2) }, at(0.18))
    .to(
      back,
      {
        opacity: 1,
        x: immersive ? -36 : -12,
        y: immersive ? 24 : 8,
        z: -70,
        rotationZ: -4,
        duration: span(0.42),
      },
      at(0.26),
    )
    .to(
      middle,
      {
        opacity: 1,
        x: immersive ? -18 : -6,
        y: immersive ? 12 : 4,
        z: -35,
        rotationZ: -2,
        duration: span(0.42),
      },
      at(0.3),
    )
    .to(
      mask,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: span(0.4),
        ease: "power2.inOut",
      },
      at(0.16),
    )
    .to(
      photo,
      {
        xPercent: immersive ? -3 : 0,
        y: -8,
        z: immersive ? 140 : 0,
        rotationY: immersive ? 5 : 0,
        rotationX: immersive ? -4 : 0,
        rotationZ: 0,
        scale: immersive ? 1.025 : 1,
        duration: span(0.43),
        ease: "power2.out",
      },
      at(0.27),
    )
    .to(
      camera,
      {
        scale: 1.035,
        xPercent: 0,
        yPercent: 0,
        duration: span(0.65),
        ease: "none",
      },
      at(0.3),
    )
    .to(
      copy,
      {
        opacity: 1,
        y: 0,
        z: 0,
        rotationY: 0,
        duration: span(0.3),
        ease: "power2.out",
      },
      at(0.55),
    )
    .to(
      mark,
      { rotation: 0, scale: 1, duration: span(0.26), ease: "power2.out" },
      at(0.57),
    )
    .to(
      photo,
      {
        xPercent: 0,
        y: 0,
        z: 0,
        rotationY: immersive ? -10 : 0,
        rotationX: immersive ? 2 : 0,
        scale: 1,
        duration: span(0.28),
        ease: "power2.inOut",
      },
      at(0.7),
    )
    .to(drawing, { opacity: 0, duration: span(0.18) }, at(0.78));
}
