import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { media, type Category, type Photo } from "../../content/media";
import { AccessibleLightbox } from "../portfolio/AccessibleLightbox";
import { PortfolioCard } from "../portfolio/PortfolioCard";
import { CinematicHeading } from "../type/CinematicHeading";
import { SpatialGallery } from "../portfolio/SpatialGallery";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import type { GalleryMode } from "../../content/galleryLayouts";

const categories: ("All" | Category)[] = [
  "All",
  "Architecture",
  "Interiors",
  "Model Studies",
];
const opening = [
  "supplemental-01",
  "interior-display-wall",
  "supplemental-03",
  "interior-bathroom-warmstone",
  "model-front-facade",
  "interior-reading-nook",
];
const collection = [...media].sort((a, b) => {
  const rank = (slug: string) =>
    opening.includes(slug) ? opening.indexOf(slug) : opening.length;
  return rank(a.slug) - rank(b.slug);
});
export default function PortfolioSection() {
  const [params, setParams] = useSearchParams();
  const reduced = useMotionPreference();
  const [mode, setMode] = useState<GalleryMode>("list");
  const category = categories.includes(params.get("category") as Category)
    ? params.get("category")!
    : "All";
  const active = media.find((item) => item.slug === params.get("photo"));
  const filtered = useMemo(
    () =>
      collection.filter(
        (item) => category === "All" || item.category === category,
      ),
    [category],
  );
  const filter = (value: string) => {
    const next = new URLSearchParams(params);
    next.delete("photo");
    if (value === "All") next.delete("category");
    else next.set("category", value);
    setParams(next, { replace: true });
  };
  const open = (item: Photo) => {
    const next = new URLSearchParams(params);
    next.set("photo", item.slug);
    setParams(next, { replace: true });
  };
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("photo");
    setParams(next, { replace: true });
  };
  return (
    <>
      <section
        className="portfolio-showcase"
        id="work"
        aria-labelledby="portfolio-title"
      >
        <div className="section-pad spatial-gallery-top">
          <div className="spatial-collection-meta">
            <p className="eyebrow">The portfolio / An image collection</p>
            <span>{media.length} photographs / 3 disciplines</span>
          </div>
          <div
            className="work-filters"
            role="group"
            aria-label="Filter photographs"
          >
            {categories.map((value) => (
              <button
                key={value}
                aria-pressed={category === value}
                onClick={() => filter(value)}
              >
                {value}
                <sup>
                  {value === "All"
                    ? media.length
                    : media.filter((item) => item.category === value).length}
                </sup>
              </button>
            ))}
          </div>
          <p className="gallery-count" role="status">
            {filtered.length} photographs · {category}
          </p>
        </div>
        {reduced ? (
          <div className="section-pad spatial-static">
            <CinematicHeading
              id="portfolio-title"
              animate={false}
              lines={[{ text: "Selected" }, { text: "work.", italic: true }]}
            />
            <div className="work-grid">
              {filtered.map((item, i) => (
                <PortfolioCard
                  key={item.slug}
                  item={item}
                  index={i}
                  onOpen={open}
                />
              ))}
            </div>
          </div>
        ) : (
          <SpatialGallery
            key={category}
            items={filtered}
            mode={mode}
            onModeChange={setMode}
            onOpen={open}
          />
        )}
        <div className="section-pad spatial-gallery-note">
          <p className="portfolio-note">
            Architecture, interiors and physical model studies, presented
            through the studio’s photographic collection.
          </p>
        </div>
      </section>
      {active && (
        <AccessibleLightbox
          items={
            filtered.some((item) => item.slug === active.slug)
              ? filtered
              : media
          }
          active={active}
          onChange={open}
          onClose={close}
        />
      )}
    </>
  );
}
