import { useSearchParams } from "react-router-dom";
import { m, useReducedMotion } from "motion/react";
import { media, type Category, type Photo } from "../content/media";
import { PhotoImage } from "../components/PhotoImage";
import { Arrow } from "../components/Arrow";
import { AccessibleLightbox } from "../components/portfolio/AccessibleLightbox";

const categories: ("All" | Category)[] = [
  "All",
  "Architecture",
  "Interiors",
  "Model Studies",
];
export default function WorkPage() {
  const [params, setParams] = useSearchParams();
  const category = categories.includes(params.get("category") as Category)
    ? params.get("category")!
    : "All";
  const active = media.find((item) => item.slug === params.get("photo"));
  const filtered = media.filter(
    (item) => category === "All" || item.category === category,
  );
  const reduced = useReducedMotion();
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
        <h1>
          Selected <em>work.</em>
        </h1>
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
            <m.button
              key={item.slug}
              id={item.slug}
              className={`work-card ${item.aspect_ratio < 1 ? "portrait" : ""}`}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.025, 0.15) }}
              onClick={() => open(item)}
              aria-label={`Open ${item.title} photograph`}
            >
              <div className="work-image">
                <PhotoImage
                  item={item}
                  sizes="(min-width:1024px) 44vw, (min-width:768px) 45vw, 100vw"
                />
                <span className="image-open">
                  <Arrow diagonal />
                </span>
              </div>
              <div className="work-card-caption">
                <h2>{item.title}</h2>
                <span>{item.category}</span>
              </div>
            </m.button>
          ))}
        </div>
        <p className="portfolio-note">
          Presented by image category. Project names and associations will be
          added when confirmed by the studio.
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
