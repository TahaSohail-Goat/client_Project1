import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture";
import { Group, SRGBColorSpace } from "three";
import { media } from "../../content/media";

const photos = media.filter((item) => item.category === "Model Studies");
type Bridge = {
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};
function Planes({ progress, redraw, onReady }: Bridge) {
  const group = useRef<Group>(null);
  const textures = useTexture(photos.map((item) => item.src));
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    });
    redraw.current = invalidate;
    invalidate();
    onReady();
    return () => {
      redraw.current = null;
    };
  }, [textures, invalidate, onReady, redraw]);
  useFrame(() => {
    if (!group.current) return;
    const p = progress.current;
    group.current.rotation.y = (p - 0.5) * 0.075;
    group.current.position.y = (p - 0.5) * 0.18;
    group.current.children.forEach((plane, i) => {
      plane.rotation.y = (i - 1) * (1 - p) * 0.05;
      plane.rotation.z = (i - 1) * (1 - p) * 0.025;
      plane.position.z = Math.sin(p * Math.PI) * (i === 1 ? 0.25 : -0.12);
    });
  });
  return (
    <group ref={group}>
      {photos.map((item, i) => (
        <mesh key={item.slug} position={[(i - 1) * 3.35, 0, 0]}>
          <planeGeometry args={[2.95, 2.95 / item.aspect_ratio]} />
          <meshBasicMaterial map={textures[i]} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
export default function PhotoPlanes(props: Bridge) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 8], zoom: 90, near: 0.1, far: 20 }}
      dpr={[1, 1.4]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", props.onFailure, {
          once: true,
        });
      }}
    >
      <Suspense fallback={null}>
        <Planes {...props} />
      </Suspense>
    </Canvas>
  );
}
