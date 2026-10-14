import { useSearchParams } from "react-router-dom";
import { media, type Category, type Photo } from "../../content/media";
import { AccessibleLightbox } from "../portfolio/AccessibleLightbox";
import { PortfolioCard } from "../portfolio/PortfolioCard";
import { CinematicHeading } from "../type/CinematicHeading";

const categories: ("All" | Category)[] = [
  "All",
  "Architecture",
  "Interiors",
  "Model Studies",
];
export default function PortfolioSection() {
  const [params, setParams] = useSearchParams();
  const category = categories.includes(params.get("category") as Category)
    ? params.get("category")!
    : "All";
  const active = media.find((item) => item.slug === params.get("photo"));
  const filtered = media.filter(
    (item) => category === "All" || item.category === category,
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
      <section className="page-heading section-pad work-heading" id="work">
        <p className="eyebrow">The portfolio / An image collection</p>
        <CinematicHeading
          lines={[{ text: "Selected" }, { text: "work.", italic: true }]}
        />
        <div className="page-intro">
          <p>
            Architecture, interiors and physical model studies. A collection of
            perspectives on space, form and the detail in between.
          </p>
          <span>
            {media.length} photographs
            <br />3 disciplines of exploration
          </span>
        </div>
      </section>
      <section
        className="portfolio section-pad"
        aria-label="Portfolio photographs"
      >
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
        <p className="portfolio-note">
          Architecture, interiors and physical model studies, presented through
          the studio’s photographic collection.
        </p>
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
