import manifest from "./photo-manifest.json";

export type Category = "Architecture" | "Interiors" | "Model Studies";
export type Photo = {
  id: number;
  slug: string;
  category: Category;
  description: string;
  width: number;
  height: number;
  aspect_ratio: number;
  src: string;
  title: string;
};
export const categoryNames: Record<string, Category> = {
  exterior: "Architecture",
  interior: "Interiors",
  architectural_model: "Model Studies",
};
const manifestMedia: Photo[] = manifest.assets.map((asset) => ({
  ...asset,
  category: categoryNames[asset.category],
  src: `/media/${asset.slug}.webp`,
  title: asset.slug
    .replace(/^(exterior|interior|model)-/, "")
    .replaceAll("-", " "),
}));

// The supplemental folder is a second client-supplied collection. Its images
// are presented by discipline because no project names or image relationships
// were supplied with the handoff.
const supplementalDescriptions = [
  "Exterior study with a warm, glazed upper volume",
  "Aerial exterior study across a planted hillside",
  "Landscape-facing facade with a deep framed opening",
  "Twilight exterior study with a covered arrival",
  "Long horizontal facade set into a sloped garden",
  "Low-angle exterior study with a retaining wall",
  "Rain-lit exterior study with warm interior glow",
  "Open-plan workplace interior with planted structure",
  "Bedroom interior with layered joinery and soft light",
  "Bedroom interior with marble floor and full-height glazing",
  "Bar and lounge interior with timber shelving",
  "Calm bathroom interior with a backlit vanity",
  "Living interior with a quiet material palette",
  "Bedroom interior with a concealed storage wall",
  "Warm stone bathroom interior study",
  "Linear corridor interior with integrated lighting",
  "Reading and lounge interior framed by glazing",
  "Bedroom interior with warm timber and layered light",
  "Kitchen and dining interior with a planted island",
  "Compact bathroom and dressing interior study",
  "Dining interior study with a framed view",
  "Physical model study, front elevation",
  "Physical model study, open cross-section",
  "Physical model study, upper perspective",
  "Physical model study, cutaway perspective",
];
const supplementalMedia: Photo[] = supplementalDescriptions.map(
  (description, index) => {
    const width = [1080, 1080, 1023, 1080, 1080, 1080, 1080, 1169, 1169,
      904, 1280, 1280, 904, 904, 904, 1280, 1280, 1169, 1280, 904,
      1280, 1363, 1269, 1302, 1444][index];
    const height = [481, 475, 1080, 471, 540, 475, 607, 590, 590, 1280,
      639, 639, 1280, 1280, 1280, 639, 639, 590, 639, 1280, 639,
      1136, 1313, 1068, 1033][index];
    const category: Category = index < 7
      ? "Architecture"
      : index < 21
        ? "Interiors"
        : "Model Studies";
    return {
      id: manifest.assets.length + index + 1,
      slug: `supplemental-${String(index + 1).padStart(2, "0")}`,
      category,
      description,
      width,
      height,
      aspect_ratio: width / height,
      src: `/media/supplemental/supplemental-${String(index + 1).padStart(2, "0")}.webp`,
      title: `${category === "Architecture" ? "Exterior" : category === "Interiors" ? "Interior" : "Model"} study ${String(index + 1).padStart(2, "0")}`,
    };
  },
);

export const media: Photo[] = [...manifestMedia, ...supplementalMedia];
export function photo(slug: string): Photo {
  const result = media.find((item) => item.slug === slug);
  if (!result) throw new Error(`Unknown photograph: ${slug}`);
  return result;
}
