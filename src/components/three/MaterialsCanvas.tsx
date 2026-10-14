import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture";
import { Group, MathUtils, PerspectiveCamera, SRGBColorSpace } from "three";
import { photo } from "../../content/media";
import { materialStudies } from "../../content/materials";

type Bridge = {
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
  onSelect: (slug: string) => void;
};
type Pose = [
  x: number,
  y: number,
  z: number,
  rotateY: number,
  rotateX: number,
  rotateZ: number,
  scale: number,
];
// The camera enters the display photograph, then hands over to the timber study.
const photoWidths = [7.2, 6.4];
const beats = [0, 0.22, 0.5, 0.65, 0.85, 1];
const poses: Pose[][] = [
  [
    [2.05, 0.25, -0.3, -0.24, 0.04, -0.04, 1.1],
    [0.6, 0.05, 0, -0.06, 0, -0.01, 1.12],
    [0, 0, 0, 0, 0, 0, 1.08],
    [-4, -0.2, -2, -0.75, 0.06, -0.05, 0.9],
    [-5.8, 0.4, -4, -1.05, 0, -0.1, 0.86],
    [-5.5, 0.35, -3.5, -1, 0, -0.08, 0.86],
  ],
  [
    [3.5, -1.45, 1, 0.26, -0.02, 0.1, 0.7],
    [3.4, -1, -0.5, 0.35, 0, 0.08, 0.65],
    [4.5, -0.6, -2.2, 0.6, -0.1, 0.1, 0.6],
    [2.4, 0, 0, 0.45, 0.04, 0.04, 1],
    [1.15, 0, 0.4, -0.05, 0.01, -0.02, 1.1],
    [1.15, 0, 0.35, -0.02, 0, 0, 1.08],
  ],
];

function segmentAt(p: number) {
  const next = beats.findIndex((beat) => beat > p);
  const from = next < 0 ? beats.length - 2 : Math.max(0, next - 1);
  const t = MathUtils.smoothstep(p, beats[from], beats[from + 1]);
  return { from, t };
}
function poseAt(p: number, index: number): Pose {
  const { from, t } = segmentAt(p);
  return poses[index][from].map((value, axis) =>
    MathUtils.lerp(value, poses[index][from + 1][axis], t),
  ) as Pose;
}

function Photographs({
  progress,
  redraw,
  onReady,
  onFailure,
  onSelect,
}: Bridge) {
  const groups = useRef<(Group | null)[]>([]);
  const textures = useTexture(
    materialStudies.map((study) => photo(study.slug).src),
  );
  const { invalidate, gl, size } = useThree();
  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    });
    redraw.current = invalidate;
    invalidate();
    onReady();
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => {
      canvas.removeEventListener("webglcontextlost", onFailure);
      redraw.current = null;
    };
  }, [gl, invalidate, onFailure, onReady, redraw, textures]);
  useFrame(({ camera, pointer }) => {
    const p = MathUtils.clamp(progress.current, 0, 1);
    groups.current.forEach((group, index) => {
      if (!group) return;
      const [x, y, z, ry, rx, rz, scale] = poseAt(p, index);
      group.position.set(x, y, z);
      group.rotation.set(rx + pointer.y * 0.015, ry + pointer.x * 0.025, rz);
      group.scale.setScalar(scale);
    });
    if (camera instanceof PerspectiveCamera) {
      const halfField = Math.tan((camera.fov * Math.PI) / 360);
      const displayDistance =
        Math.min(
          7.2 / photo(materialStudies[0].slug).aspect_ratio / (2 * halfField),
          7.2 / (2 * halfField * (size.width / size.height)),
        ) * 0.9;
      const detailDistance =
        Math.max(
          photoWidths[1] /
            photo(materialStudies[1].slug).aspect_ratio /
            (2 * halfField),
          photoWidths[1] / (2 * halfField * (size.width / size.height)),
        ) * 1.38;
      const distances = [
        6.6,
        displayDistance + 0.6,
        displayDistance,
        detailDistance + 0.4,
        detailDistance,
        detailDistance,
      ];
      const { from, t } = segmentAt(p);
      const distance = MathUtils.lerp(distances[from], distances[from + 1], t);
      camera.position.set(
        Math.sin(p * Math.PI * 2) * 0.1 + pointer.x * 0.05,
        pointer.y * 0.025,
        distance,
      );
      camera.lookAt(0, 0, 0);
    }
  });
  return materialStudies.map((study, index) => {
    const width = photoWidths[index];
    const height = width / photo(study.slug).aspect_ratio;
    return (
      <group
        key={study.slug}
        ref={(group) => {
          groups.current[index] = group;
        }}
      >
        <mesh position={[-0.16, -0.14, -0.22]} rotation={[0, 0, -0.018]}>
          <planeGeometry args={[width + 0.06, height + 0.06]} />
          <meshBasicMaterial color="#ded5c8" />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[width + 0.035, height + 0.035, 0.075]} />
          <meshStandardMaterial
            color="#b99670"
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>
        <mesh
          position={[0, 0, 0.045]}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(study.slug);
          }}
          onPointerOver={() => {
            gl.domElement.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            gl.domElement.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={textures[index]} toneMapped={false} />
        </mesh>
      </group>
    );
  });
}

export default function MaterialsCanvas(props: Bridge) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 36, near: 0.1, far: 30 }}
      dpr={[1, 1.4]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onPointerMove={() => props.redraw.current?.()}
      onPointerLeave={() => props.redraw.current?.()}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[-4, 4, 6]} intensity={0.7} />
      <Photographs {...props} />
    </Canvas>
  );
}
