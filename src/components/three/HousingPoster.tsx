import { houseParts } from "../../content/housing";

const project = ([x, y, z]: number[]) => [500 + (x - z) * 33, 350 + (x + z) * 14 - y * 50];
const points = (vertices: number[][]) => vertices.map((v) => project(v).join(",")).join(" ");

/** The same conceptual geometry in SVG, available without WebGL or animation. */
export function HousingPoster() {
  return (
    <svg viewBox="0 0 1000 650" className="housing-poster" aria-hidden="true">
      <ellipse cx="500" cy="410" rx="310" ry="95" fill="#000" opacity="0.13" />
      {[...houseParts].sort((a, b) => (a.position[0] + a.position[2]) - (b.position[0] + b.position[2])).map((part, index) => {
        const [x, y, z] = part.position;
        const [w, h, d] = part.size.map((n) => n / 2);
        const top = [[x-w,y+h,z-d],[x+w,y+h,z-d],[x+w,y+h,z+d],[x-w,y+h,z+d]];
        const front = [[x-w,y+h,z+d],[x+w,y+h,z+d],[x+w,y-h,z+d],[x-w,y-h,z+d]];
        const side = [[x+w,y+h,z-d],[x+w,y+h,z+d],[x+w,y-h,z+d],[x+w,y-h,z-d]];
        return <g key={index} fill={part.color} stroke="#171c1a" strokeWidth="0.7" strokeOpacity="0.25">
          <polygon points={points(front)} />
          <polygon points={points(side)} /><polygon points={points(side)} fill="#171c1a" opacity="0.2" />
          <polygon points={points(top)} /><polygon points={points(top)} fill="#f2ede5" opacity="0.12" />
        </g>;
      })}
    </svg>
  );
}
