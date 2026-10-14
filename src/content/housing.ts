export type HousePart = {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  roof?: boolean;
  outline?: boolean;
};

// Original conceptual geometry. This study does not represent a client commission.
const stone = "#d8d0c1";
const timber = "#b99670";
const glass = "#4b6560";
const charcoal = "#292e2b";
export const houseParts: HousePart[] = [
  { size: [12, 0.3, 9], position: [0, -0.18, 0], color: "#7d8773", outline: true },
  { size: [10.2, 0.24, 7.2], position: [0, 0.1, 0], color: stone, outline: true },
  // Back and side walls; the front elevation is open glazing.
  { size: [9.4, 2.6, 0.2], position: [0, 1.52, -2.9], color: stone },
  { size: [0.2, 2.6, 5.8], position: [-4.6, 1.52, 0], color: stone },
  { size: [0.2, 2.6, 5.8], position: [4.6, 1.52, 0], color: stone },
  { size: [3, 2.6, 0.18], position: [-3, 1.52, 2.9], color: timber },
  { size: [1.05, 2.15, 0.04], position: [-3.15, 1.3, 3.01], color: charcoal },
  { size: [0.04, 0.45, 0.05], position: [-2.73, 1.28, 3.05], color: timber },
  { size: [0.04, 1.4, 2], position: [4.71, 1.7, -0.8], color: glass },
  { size: [5.8, 2.38, 0.08], position: [1.3, 1.42, 2.9], color: glass },
  { size: [0.14, 2.6, 0.16], position: [-1.65, 1.52, 2.9], color: charcoal },
  { size: [0.14, 2.6, 0.16], position: [1.25, 1.52, 2.9], color: charcoal },
  { size: [0.14, 2.6, 0.16], position: [4.15, 1.52, 2.9], color: charcoal },
  { size: [5.8, 0.12, 0.16], position: [1.3, 0.29, 2.9], color: charcoal },
  { size: [5.8, 0.12, 0.16], position: [1.3, 2.64, 2.9], color: charcoal },
  // Bedroom wing and open living space.
  { size: [0.14, 1.75, 4.9], position: [-1.7, 1.1, -0.45], color: stone },
  { size: [2.8, 1.75, 0.14], position: [-3.15, 1.1, -0.35], color: stone },
  { size: [1.85, 0.4, 1.9], position: [-3.1, 0.47, -1.7], color: timber },
  { size: [1.8, 0.16, 1.85], position: [-3.1, 0.75, -1.7], color: "#ede7dd" },
  { size: [0.65, 0.15, 0.42], position: [-3.6, 0.91, -2.26], color: "#bcb4a8" },
  { size: [0.65, 0.15, 0.42], position: [-2.6, 0.91, -2.26], color: "#bcb4a8" },
  { size: [1.8, 0.2, 1.8], position: [-3.1, 0.32, 1.1], color: timber },
  { size: [1.6, 0.04, 1.6], position: [-3.1, 0.44, 1.1], color: "#5b6552" },
  // Kitchen, living furniture, rug and dining table.
  { size: [5.4, 0.94, 0.6], position: [1.5, 0.71, -2.45], color: timber },
  { size: [5.5, 0.08, 0.7], position: [1.5, 1.22, -2.45], color: "#e5dfd5" },
  { size: [2.25, 0.88, 0.82], position: [0.2, 0.65, -0.95], color: timber },
  { size: [2.35, 0.08, 0.92], position: [0.2, 1.13, -0.95], color: "#e5dfd5" },
  { size: [2.8, 0.04, 2.3], position: [2.55, 0.25, 1.12], color: "#c5b6a0" },
  { size: [2.55, 0.4, 0.87], position: [2.6, 0.47, 0.34], color: "#84917a" },
  { size: [2.55, 0.48, 0.17], position: [2.6, 0.86, -0.02], color: "#84917a" },
  { size: [0.2, 0.4, 0.87], position: [1.35, 0.72, 0.34], color: "#84917a" },
  { size: [0.2, 0.4, 0.87], position: [3.85, 0.72, 0.34], color: "#84917a" },
  { size: [1.25, 0.28, 0.72], position: [2.6, 0.4, 1.62], color: timber },
  { size: [1.55, 0.1, 0.75], position: [-0.4, 1.03, 1.5], color: timber },
  { size: [0.12, 0.74, 0.5], position: [-0.4, 0.61, 1.5], color: charcoal },
  // Entry stepping stones and raised courtyard planter.
  { size: [1.4, 0.06, 0.48], position: [-3.15, 0.02, 3.65], color: stone },
  { size: [1.4, 0.06, 0.48], position: [-3.15, 0.02, 4.3], color: stone },
  { size: [1.15, 0.4, 1.1], position: [5.2, 0.13, 2.9], color: timber },
  // Roof assembly moves as one group, exposing the entire plan.
  { size: [6.7, 0.25, 6.4], position: [1.7, 2.98, 0], color: stone, roof: true, outline: true },
  { size: [3.4, 0.25, 3.4], position: [-3.35, 2.98, -1.5], color: stone, roof: true, outline: true },
  { size: [3.4, 0.25, 1.4], position: [-3.35, 2.98, 2.5], color: stone, roof: true, outline: true },
  { size: [10.1, 0.1, 0.13], position: [0, 3.13, 3.12], color: timber, roof: true },
  { size: [10.1, 0.1, 0.13], position: [0, 3.13, -3.12], color: timber, roof: true },
];
export const treePositions: [number, number, number][] = [[5.2, 0.32, 2.9], [-5.4, 0, -2.8], [5.2, 0, -3.4], [-3.1, 0.45, 1.1]];

export const housingChapters = [
  { title: "The exterior", text: "A quiet volume. Deep eaves, warm timber and a glazed living edge.", progress: 0.08 },
  { title: "Open the architecture", text: "The roof lifts. The relationship between shelter and space comes into view.", progress: 0.54 },
  { title: "Life within", text: "Living, gathering and resting: connected spaces revealed in a single view.", progress: 0.94 },
];
