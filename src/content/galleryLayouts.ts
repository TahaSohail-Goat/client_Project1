export const galleryModes = [
  "list",
  "grid",
  "helix",
  "barrel",
  "ring",
  "sphere",
  "stack",
  "coverflow",
] as const;
export type GalleryMode = (typeof galleryModes)[number];
export type GalleryPose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  opacity: number;
};
export type GallerySize = { width: number; height: number };
export type GalleryTransition = "scatter" | "flow" | "fade";
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max));
const degrees = (n: number) => (n * 180) / Math.PI;

/** Independent arrangement math; no Motion+ implementation or assets. */
export function galleryPose(
  mode: GalleryMode,
  index: number,
  focus: number,
  count: number,
  size: GallerySize,
): GalleryPose {
  const d = index - focus,
    a = Math.abs(d);
  const mobile = size.width < 768;
  const width = Math.min(
    mobile ? 260 : 350,
    size.width * (mobile ? 0.67 : 0.24),
  );
  const radius = Math.min(size.width * 0.34, size.height * 0.5);
  const origin =
    mode === "list" || mode === "coverflow" ? size.width * 0.06 : 0;
  const pose: GalleryPose = {
    x: origin,
    y: 35,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
    opacity: 1,
  };
  switch (mode) {
    case "list":
      pose.x += d * width * 0.94;
      pose.y += -d * (mobile ? 48 : 70);
      pose.z = -a * 24;
      pose.ry = clamp(d * -9, -46, 46);
      pose.opacity = clamp(6 - a, 0, 1);
      break;
    case "grid": {
      const columns = mobile ? 2 : 4;
      const gridWidth = mobile
        ? Math.min(150, size.width * 0.37)
        : width;
      pose.x = ((index % columns) - (columns - 1) / 2) * gridWidth * 1.06;
      pose.y =
        (Math.floor(index / columns) - focus / columns) *
          (mobile ? 165 : 210) +
        (mobile ? 0 : 15);
      pose.z = -60;
      pose.rx = 9;
      pose.scale = 0.87;
      pose.opacity = clamp(2.8 - Math.abs(pose.y) / (size.height * 0.5), 0, 1);
      break;
    }
    case "helix": {
      const angle = (d * Math.PI * 2) / 9;
      const r = Math.min(size.width * 0.32, mobile ? 210 : 390);
      pose.x = Math.sin(angle) * r;
      pose.y = d * (mobile ? 57 : 65) + 20;
      pose.z = (Math.cos(angle) - 1) * r;
      pose.ry = degrees(angle);
      pose.scale = 0.84;
      pose.opacity = Math.cos(angle) > -0.1 ? clamp(8 - a, 0, 1) : 0;
      break;
    }
    case "barrel": {
      const angle = (d * Math.PI * 2) / Math.max(count, 9);
      const r = Math.max(
        size.width * 0.42,
        ((width * count) / (Math.PI * 2)) * 0.85,
      );
      pose.x = Math.sin(angle) * r;
      pose.y = 25 + (Math.cos(angle) - 1) * 25;
      pose.z = (Math.cos(angle) - 1) * r;
      pose.ry = degrees(angle);
      pose.rx = -8;
      pose.opacity = Math.cos(angle) < 0 ? 0 : 1;
      break;
    }
    case "ring": {
      const angle = (d * Math.PI * 2) / Math.min(count, 14);
      pose.x = Math.sin(angle) * radius;
      pose.y = -Math.cos(angle) * radius * 0.72 + 35;
      pose.z = (Math.cos(angle) - 1) * 100;
      pose.rz = degrees(angle);
      pose.scale = 0.6;
      pose.opacity = clamp(7 - a, 0, 1);
      break;
    }
    case "sphere": {
      const latitude = Math.asin(1 - (2 * index) / Math.max(1, count - 1));
      const tilt = Math.asin(
        clamp(1 - (2 * focus) / Math.max(1, count - 1), -1, 1),
      );
      const longitude = (index - focus) * Math.PI * (3 - Math.sqrt(5));
      const r = Math.min(size.width * 0.37, size.height * 0.56);
      const x = Math.cos(latitude) * Math.sin(longitude);
      const y = Math.sin(latitude),
        z = Math.cos(latitude) * Math.cos(longitude);
      const py = y * Math.cos(tilt) - z * Math.sin(tilt);
      const pz = y * Math.sin(tilt) + z * Math.cos(tilt);
      pose.x = x * r;
      pose.y = -py * r + 20;
      pose.z = (pz - 1) * r;
      pose.rx = degrees(Math.asin(clamp(py, -1, 1)));
      pose.ry = degrees(Math.atan2(x, pz));
      pose.scale = 0.49;
      pose.opacity = pz > -0.15 ? clamp((pz + 0.15) * 2, 0, 1) : 0;
      break;
    }
    case "stack":
      pose.x = d * 13;
      pose.y = -d * 9 + 25;
      pose.z = -a * 65;
      pose.rz = d * 4;
      pose.scale = Math.max(0.5, 1 - a * 0.025);
      pose.opacity = clamp(5 - a, 0, 1);
      break;
    case "coverflow":
      pose.x +=
        Math.sign(d) *
        (Math.min(a, 1) * width * 0.9 + Math.max(a - 1, 0) * width * 0.42);
      pose.z = -Math.min(a, 10) * width * 0.32;
      pose.ry = -Math.sign(d) * Math.min(a, 1) * 55;
      pose.opacity = clamp(9 - a, 0, 1);
      break;
  }
  return pose;
}

export function blendGalleryPose(
  from: GalleryPose,
  to: GalleryPose,
  blend: number,
  index: number,
  transition: GalleryTransition,
): GalleryPose {
  const t = clamp((blend - (index % 7) * 0.014) / 0.916, 0, 1);
  const p = { ...to };
  for (const key of Object.keys(p) as (keyof GalleryPose)[])
    p[key] = from[key] + (to[key] - from[key]) * t;
  const travel = Math.sin(Math.PI * t);
  if (transition === "scatter") {
    p.x += Math.sin(index * 12.31) * travel * 170;
    p.y += Math.cos(index * 8.73) * travel * 120;
    p.z -= travel * 230;
    p.rz += Math.sin(index * 3.4) * travel * 25;
  } else if (transition === "fade") p.opacity *= 1 - travel * 0.9;
  return p;
}
export const galleryTransform = (p: GalleryPose) =>
  `translate3d(${p.x.toFixed(3)}px,${p.y.toFixed(3)}px,${p.z.toFixed(3)}px) rotateX(${p.rx.toFixed(3)}deg) rotateY(${p.ry.toFixed(3)}deg) rotateZ(${p.rz.toFixed(3)}deg) scale(${p.scale.toFixed(4)})`;
