import { media } from "./media";

export const modelStudies = media.filter(
  (item) => item.category === "Model Studies",
);
export type ModelRibbonLayout = {
  width: number;
  height: number;
  distance: number;
  frames: { x: number; y: number; width: number; height: number }[];
};
// One pose calculation keeps the semantic photo links and WebGL planes aligned.
export function modelPose(
  layout: ModelRibbonLayout,
  progress: number,
  index: number,
) {
  const frame = layout.frames[index];
  const x = frame ? frame.x + frame.width / 2 - layout.distance * progress : 0;
  const offset = Math.max(
    -1,
    Math.min(1, (x - layout.width / 2) / (layout.width || 1)),
  );
  return {
    x,
    y: Math.sin((progress * 2 + index * 0.35) * Math.PI) * 8,
    rotateY: -offset * 0.35,
    rotateZ: (index % 2 ? 0.02 : -0.02) + offset * 0.02,
    scale: 1 - Math.abs(offset) * 0.04,
  };
}
