// Keep the directory in the same order as the homepage chapters in App.tsx.
// The hero, visual transitions and studio invitation lead into these chapters.
export const navigation = [
  { label: "Architecture", id: "selected-work" },
  { label: "Interiors", id: "interiors" },
  { label: "Materials", id: "considered-detail" },
  { label: "3D study", id: "housing" },
  { label: "Models", id: "model-studies" },
  { label: "Approach", id: "approach" },
  { label: "Portfolio", id: "work" },
  { label: "Studio", id: "studio" },
  { label: "Expertise", id: "expertise" },
  { label: "Contact", id: "contact" },
] as const;
