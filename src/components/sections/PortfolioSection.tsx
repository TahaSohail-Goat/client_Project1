import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const updateParams = (next: URLSearchParams) => {
    // Changing a filter or photo must keep the visitor in the gallery chapter.
    navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, {
      replace: true, preventScrollReset: true,
    });
  };
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
    updateParams(next);
  };
  const open = (item: Photo) => {
    const next = new URLSearchParams(params);
    next.set("photo", item.slug);
    updateParams(next);
  };
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("photo");
    updateParams(next);
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
            <p className="eyebrow">The portfolio</p>
            <span>{media.length} photographs / 3 disciplines</span>
          </div>
          <div className="portfolio-heading-row">
            <CinematicHeading
              id="portfolio-title"
              animate={false}
              lines={[{ text: "Selected" }, { text: "work.", italic: true }]}
            />
            <p className="portfolio-introduction">
              Architecture, interiors and physical model studies.
              Select a photograph to explore it in full.
            </p>
          </div>
          <div className="portfolio-filter-row">
            <div
              className="work-filters"
              role="group"
              aria-label="Filter photographs"
            >
              {categories.map((value) => (
                <button
                  type="button"
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
        </div>
        {reduced ? (
          <div className="section-pad spatial-static">
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
