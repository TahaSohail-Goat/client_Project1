import { useState } from "react";
import type { Photo } from "../content/media";

export function PhotoImage({
  item,
  className = "",
  priority = false,
  sizes = "100vw",
  full = false,
}: {
  item: Photo;
  className?: string;
  priority?: boolean;
  sizes?: string;
  full?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={item.description}
        className={`image-unavailable ${className}`}
      >
        <span>
          Photograph unavailable
          <br />
          <small>{item.title}</small>
        </span>
      </div>
    );
  const responsive = item.src.replace(/\.webp$/, "");
  return (
    <img
      src={item.src}
      srcSet={
        full || !item.src.endsWith(".webp")
          ? undefined
          : `${responsive}-480.webp 480w, ${responsive}-768.webp 768w, ${item.src} ${item.width}w`
      }
      sizes={sizes}
      alt={item.description}
      width={item.width}
      height={item.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
