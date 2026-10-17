import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent } from "react";
import type { Photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";
import { Arrow } from "../Arrow";

export function PortfolioCard({
  item,
  index,
  onOpen,
}: {
  item: Photo;
  index: number;
  onOpen: (item: Photo) => void;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 110, damping: 25 });
  const rotateY = useSpring(y, { stiffness: 110, damping: 25 });
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !matchMedia("(pointer: fine) and (min-width: 1024px)").matches
    )
      return;
    const b = event.currentTarget.getBoundingClientRect();
    x.set((0.5 - (event.clientY - b.top) / b.height) * 3);
    y.set(((event.clientX - b.left) / b.width - 0.5) * 4);
  };
  return (
    <m.button
      id={item.slug}
      className={`work-card ${item.aspect_ratio < 1 ? "portrait" : ""}`}
      initial={reduced ? false : { opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: reduced ? 0 : 0.7,
        delay: (index % 2) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={() => onOpen(item)}
      aria-label={`${String(index + 1).padStart(2, "0")} ${item.title} ${item.category} — Open photograph`}
    >
      <m.div
        className="work-image"
        style={{ rotateX, rotateY, transformPerspective: 1400 }}
      >
        <PhotoImage
          item={item}
          sizes="(min-width:1024px) 44vw, (min-width:768px) 45vw, 100vw"
        />
        <span className="work-photo-index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="image-open">
          <Arrow diagonal />
        </span>
      </m.div>{" "}
      <div className="work-card-caption">
        <h3>{item.title}</h3>{" "}
        <span>{item.category}</span>
      </div>
    </m.button>
  );
}
