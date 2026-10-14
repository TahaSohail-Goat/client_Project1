import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
type Line = { text: string; italic?: boolean };

/** DOM words stay selectable; GSAP owns only their inner transforms. */
export function CinematicHeading({
  lines,
  id,
  className = "",
  as: Tag = "h2",
  animate = true,
}: {
  lines: Line[];
  id?: string;
  className?: string;
  as?: "h2" | "h3";
  animate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (!animate) return;
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const words =
          ref.current!.querySelectorAll<HTMLElement>(".cinematic-word");
        gsap.fromTo(
          words,
          {
            yPercent: 110,
            opacity: 0.3,
            rotateX: 22,
            x: (_, word: HTMLElement) => (word.closest("em") ? -14 : 0),
            rotateZ: (_, word: HTMLElement) => (word.closest("em") ? -3 : 0),
          },
          {
            yPercent: 0,
            opacity: 1,
            rotateX: 0,
            x: 0,
            rotateZ: 0,
            stagger: 0.07,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 94%",
              end: "top 54%",
              scrub: 0.45,
            },
          },
        );
      },
      ref,
    );
    return () => mm.revert();
  }, [animate]);
  const words = (text: string) =>
    text.split(" ").map((word, i) => (
      <span className="cinematic-word-mask" key={`${word}-${i}`}>
        <span className="cinematic-word">{word}</span>{" "}
      </span>
    ));
  return (
    <Tag ref={ref} id={id} className={`cinematic-heading ${className}`}>
      {lines.map((line, i) => (
        <span className="cinematic-line" key={i}>
          {line.italic ? <em>{words(line.text)}</em> : words(line.text)}
        </span>
      ))}
    </Tag>
  );
}
