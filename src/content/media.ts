import manifest from "../../docs/ASSET_MANIFEST.json";

export type Category = "Architecture" | "Interiors" | "Model Studies";
export const categoryNames: Record<string, Category> = {
  exterior: "Architecture",
  interior: "Interiors",
  architectural_model: "Model Studies",
};
export const media = manifest.assets.map((asset) => ({
  ...asset,
  category: categoryNames[asset.category],
  src: `/media/${asset.slug}.webp`,
  title: asset.slug
    .replace(/^(exterior|interior|model)-/, "")
    .replaceAll("-", " "),
}));
export type Photo = (typeof media)[number];
export function photo(slug: string): Photo {
  const result = media.find((item) => item.slug === slug);
  if (!result) throw new Error(`Unknown photograph: ${slug}`);
  return result;
}
