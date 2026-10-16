/** Original four-storey residence; never represented as a completed client project. */
export const heroWalkthrough = {
  enabled: true,
  poster: "/media/hero-study/residence-poster.webp",
  mobilePoster: "/media/hero-study/residence-poster-mobile.webp",
  desktopScroll: 9.2,
  mobileScroll: 8.6,
  sceneEnd: 0.82,
};
export type Tuple3 = [number, number, number];
export type CameraBeat = { at: number; position: Tuple3; target: Tuple3; fov: number };
const beat = (at: number, position: Tuple3, target: Tuple3, fov = 62): CameraBeat => ({ at, position, target, fov });
// Metres. Floor surfaces are 0, 3.5, 7 and 10.5; the stair void is continuous.
// Every ascent follows the two flights and landing of the SAME U-shaped stair.
const ascent = (start: number, end: number, floor: number): CameraBeat[] => {
  const eye = floor * 3.5 + 1.65;
  const t = (p: number) => start + (end - start) * p;
  return [
    beat(t(0), [-4.22, eye, 2.72], [-4.22, eye + 0.65, -1.5]),
    beat(t(0.32), [-4.22, eye + 1.75, -2.75], [-2.1, eye + 1.85, -2.75]),
    beat(t(0.5), [-2.12, eye + 1.75, -2.75], [-2.12, eye + 2.4, 1.8]),
    beat(t(0.84), [-2.12, eye + 3.5, 2.35], [0.8, eye + 3.25, 1.5]),
    beat(t(1), [-0.35, eye + 3.5, 2.5], [3.9, eye + 3.1, 0.1]),
  ];
};
export const cameraBeats: CameraBeat[] = [
  beat(0, [23, 14.3, 30], [0, 5.9, 0], 43),
  beat(0.085, [14, 9.2, 24], [0, 5.3, 0], 47),
  beat(0.14, [3.4, 3.7, 14], [0, 1.8, 2.5], 52),
  beat(0.19, [0, 1.65, 7.7], [0, 1.6, 0], 58),
  beat(0.235, [0, 1.65, 3.7], [3.3, 1.3, 0.6]),
  beat(0.285, [0.55, 1.65, 1.55], [4.3, 1.1, 0.8], 66),
  beat(0.325, [-0.25, 1.65, 0.1], [3.2, 1.2, -3.5], 66),
  beat(0.34, [0.1, 1.65, 2.7], [-3, 1.6, 2.7]),
  ...ascent(0.362, 0.43, 0),
  beat(0.455, [0.6, 5.15, 1.5], [4.1, 4.75, -1.5], 67),
  beat(0.478, [0.3, 5.15, 2.7], [4, 4.6, -3.4], 67),
  ...ascent(0.5, 0.568, 1),
  beat(0.59, [0.3, 8.65, 1.6], [3.7, 7.9, -0.2], 67),
  beat(0.616, [-0.35, 8.65, 1.3], [3.5, 8.1, -4.0], 68),
  beat(0.624, [-0.35, 8.65, 2.7], [-3, 8.6, 2.7]),
  ...ascent(0.641, 0.709, 2),
  beat(0.735, [0.3, 12.15, 0.1], [3.3, 11.7, -3.0], 66),
  beat(0.77, [0.8, 12.15, 2.5], [4.3, 11.5, 3.8], 62),
  beat(0.798, [0.8, 12.15, 5.3], [4.3, 11.5, 3.3], 62),
  beat(0.835, [4.6, 12.5, 5.4], [0.4, 11.7, 2.5], 61),
  beat(0.875, [10.5, 14.5, 10], [0, 8.5, 0], 52),
  beat(0.94, [22, 15.6, 29], [0, 6.4, 0], 44),
  beat(1, [25, 15, 33], [0, 6.0, 0], 43),
];
/** Cubic interpolation with monotone tangents prevents overshooting stair landings. */
export function sampleCamera(progress: number): Omit<CameraBeat, "at"> {
  const p = Math.max(0, Math.min(1, progress));
  const index = Math.min(cameraBeats.length - 2, cameraBeats.findIndex((_, i) => i < cameraBeats.length - 1 && p <= cameraBeats[i + 1].at));
  const a = cameraBeats[index], b = cameraBeats[index + 1];
  const before = cameraBeats[Math.max(0, index - 1)], after = cameraBeats[Math.min(cameraBeats.length - 1, index + 2)];
  const dt = b.at - a.at, t = (p - a.at) / dt;
  const interpolate = (v0: number, v1: number, prev: number, next: number) => {
    const slope = (v1 - v0) / dt;
    const tangent = (s: number) => s * slope <= 0 ? 0 : Math.sign(s) * Math.min(Math.abs(s), 2 * Math.abs(slope));
    const m0 = tangent((v1 - prev) / (b.at - before.at));
    const m1 = tangent((next - v0) / (after.at - a.at));
    return (2*t**3-3*t**2+1)*v0 + (t**3-2*t**2+t)*dt*m0 + (-2*t**3+3*t**2)*v1 + (t**3-t**2)*dt*m1;
  };
  const tuple = (key: "position" | "target") => a[key].map((v, axis) => interpolate(v, b[key][axis], before[key][axis], after[key][axis])) as Tuple3;
  return { position: tuple("position"), target: tuple("target"), fov: interpolate(a.fov,b.fov,before.fov,after.fov) };
}
export const residenceChapters = [
  { at: 0, title: "The residence", subtitle: "Architecture in every detail", level: -1 },
  { at: 0.12, title: "A quiet arrival", subtitle: "Stone, shadow & an open door", level: 0 },
  { at: 0.22, title: "Ground floor", subtitle: "Spaces for coming together", level: 0 },
  { at: 0.362, title: "First floor", subtitle: "A more private kind of living", level: 1 },
  { at: 0.5, title: "Second floor", subtitle: "A retreat within the residence", level: 2 },
  { at: 0.641, title: "Third floor", subtitle: "Room to think. Space to unwind.", level: 3 },
  { at: 0.77, title: "The sky terrace", subtitle: "The upper level, open to the sky", level: 3 },
  { at: 0.89, title: "One home. Four perspectives.", subtitle: "A study in connected living", level: -1 },
];
export const chapterAt = (p: number) => [...residenceChapters].reverse().find(c => p >= c.at) ?? residenceChapters[0];
export type ResidenceCallout = { text: string; anchor: Tuple3; from: number; to: number };
export const residenceCallouts: ResidenceCallout[] = [
  { text: "NATURAL STONE / WARM OAK", anchor: [-5.7, 7.9, 5.65], from: 0.015, to: 0.12 },
  { text: "THE ENTRANCE", anchor: [0.9, 2.4, 5.55], from: 0.145, to: 0.22 },
  { text: "FORMAL LIVING", anchor: [4.1, 0.9, 1.3], from: 0.235, to: 0.3 },
  { text: "DINING & KITCHEN", anchor: [3.8, 1.2, -3.5], from: 0.3, to: 0.344 },
  { text: "THE CONNECTING STAIR", anchor: [-4.15, 2.6, -0.2], from: 0.351, to: 0.386 },
  { text: "FAMILY LOUNGE", anchor: [4.2, 4.4, 0.1], from: 0.423, to: 0.462 },
  { text: "GUEST SUITE", anchor: [4.1, 4.5, -3.5], from: 0.465, to: 0.49 },
  { text: "MASTER SUITE", anchor: [4.2, 7.9, 0.2], from: 0.563, to: 0.602 },
  { text: "DRESSING & BATH", anchor: [4, 8, -3.8], from: 0.603, to: 0.63 },
  { text: "PRIVATE STUDY", anchor: [3.2, 11.5, -3.4], from: 0.704, to: 0.757 },
  { text: "SKY LOUNGE", anchor: [4.3, 11.2, 3.7], from: 0.77, to: 0.839 },
  { text: "PLANTED TERRACE", anchor: [-4.3, 11.4, 4.5], from: 0.82, to: 0.88 },
  ...[0,1,2,3].map(level => ({ text: `LEVEL 0${level}`, anchor: [7, level*3.5+1.3, 5.5] as Tuple3, from: 0.917, to: 1.01 })),
];
