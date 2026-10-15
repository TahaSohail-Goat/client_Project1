import { useEffect, useRef } from "react";
import type { Photo } from "../../content/media";
import { PhotoImage } from "../PhotoImage";
import { m } from "motion/react";
import { useMotionPreference } from "../../hooks/useMotionPreference";
export function AccessibleLightbox({
  items,
  active,
  onChange,
  onClose,
}: {
  items: Photo[];
  active: Photo;
  onChange: (item: Photo) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useMotionPreference();
  const initialPhoto = useRef(active.slug);
  const index = items.findIndex((item) => item.slug === active.slug);
  const change = (delta: number) =>
    onChange(items[(index + delta + items.length) % items.length]);
  useEffect(() => {
    const dialog = ref.current!;
    // WebKit does not focus a button on pointer click. Restore the opening card explicitly.
    const focused = document.activeElement as HTMLElement;
    const trigger = document.getElementById(initialPhoto.current) ?? focused;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => {
        if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-labelledby="lightbox-title"
      aria-describedby="lightbox-description"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          change(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          change(-1);
        }
      }}
    >
      <div className="lightbox-toolbar">
        <span className="eyebrow">
          {active.category} / {index + 1} of {items.length}
        </span>
        <button onClick={onClose} autoFocus aria-label="Close photograph">
          Close <span aria-hidden="true">×</span>
        </button>
      </div>
      <m.div
        key={active.slug}
        className="lightbox-image"
        initial={
          reduced ? false : { opacity: 0, scale: 0.91, y: 24, rotateX: 4 }
        }
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <PhotoImage key={active.slug} item={active} full priority />
      </m.div>
      <div className="lightbox-caption">
        <div>
          <h2 id="lightbox-title">{active.title}</h2>
          <p id="lightbox-description">{active.description}</p>
        </div>
        <div className="lightbox-controls">
          <button onClick={() => change(-1)} aria-label="Previous photograph">
            ←
          </button>
          <button onClick={() => change(1)} aria-label="Next photograph">
            →
          </button>
        </div>
      </div>
      <span className="lightbox-hint">
        Use ← → to explore · Escape to close
      </span>
    </dialog>
  );
}
