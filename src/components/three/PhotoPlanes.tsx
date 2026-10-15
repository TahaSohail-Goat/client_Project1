import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture";
import { Group, SRGBColorSpace } from "three";
import {
  modelStudies,
  modelPose,
  type ModelRibbonLayout,
} from "../../content/models";

const photos = modelStudies.slice(0, 3);
type Bridge = {
  progress: RefObject<number>;
  layout: RefObject<ModelRibbonLayout>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};
function Planes({ progress, layout, redraw, onReady, onFailure }: Bridge) {
  const groups = useRef<(Group | null)[]>([]);
  const textures = useTexture(
    photos.map((item) => item.src.replace(/\.webp$/, "-768.webp")),
  );
  const { invalidate, gl, size } = useThree();
  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    });
    redraw.current = invalidate;
    invalidate();
    onReady();
    gl.domElement.addEventListener("webglcontextlost", onFailure);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", onFailure);
      redraw.current = null;
    };
  }, [textures, invalidate, onReady, onFailure, redraw, gl]);
  useEffect(() => invalidate(), [invalidate, size]);
  useFrame(() => {
    groups.current.forEach((group, index) => {
      const frame = layout.current.frames[index];
      if (!group || !frame) return;
      const pose = modelPose(layout.current, progress.current, index);
      group.position.set(
        pose.x - size.width / 2,
        size.height / 2 - frame.y - frame.height / 2 - pose.y,
        0,
      );
      group.rotation.set(0, -pose.rotateY, -pose.rotateZ);
      group.scale.set(frame.width * pose.scale, frame.height * pose.scale, 1);
    });
  });
  return photos.map((item, index) => (
    <group
      key={item.slug}
      ref={(group) => {
        groups.current[index] = group;
      }}
    >
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={textures[index]} toneMapped={false} />
      </mesh>
    </group>
  ));
}
export default function PhotoPlanes(props: Bridge) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 3000 }}
      dpr={[1, 1.4]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <Planes {...props} />
    </Canvas>
  );
}
