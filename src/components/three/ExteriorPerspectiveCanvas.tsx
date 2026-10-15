import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture";
import { Group, PerspectiveCamera, SRGBColorSpace } from "three";
import type { Photo } from "../../content/media";

type Bridge = {
  item: Photo;
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};

function PhotoPlane({ item, progress, redraw, onReady, onFailure }: Bridge) {
  const assembly = useRef<Group>(null);
  const texture = useTexture(item.src);
  const { invalidate, size, gl } = useThree();

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    redraw.current = invalidate;
    invalidate();
    onReady();
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => {
      canvas.removeEventListener("webglcontextlost", onFailure);
      redraw.current = null;
    };
  }, [gl, invalidate, onFailure, onReady, redraw, texture]);

  useFrame(({ camera }) => {
    const group = assembly.current;
    if (!group) return;
    const p = progress.current;
    group.rotation.y = Math.sin((p - 0.5) * Math.PI) * 0.32;
    group.rotation.x = Math.sin(p * Math.PI) * 0.1;
    group.rotation.z = Math.sin((p - 0.5) * Math.PI) * -0.035;
    group.position.x = Math.sin(p * Math.PI) * 0.08;
    group.position.z = Math.sin(p * Math.PI) * 0.2;
    group.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.025);
    if (camera instanceof PerspectiveCamera) {
      const halfField = Math.tan((camera.fov * Math.PI) / 360);
      const coverDistance = Math.min(
        (6 / item.aspect_ratio) / (2 * halfField),
        6 / (2 * halfField * (size.width / size.height)),
      );
      camera.position.set(
        (p - 0.5) * 0.22,
        Math.sin(p * Math.PI) * 0.035,
        coverDistance * (0.99 - Math.sin(p * Math.PI) * 0.015),
      );
      camera.lookAt(0, 0, 0);
    }
  });

  const photoHeight = 6 / item.aspect_ratio;
  return (
    <group ref={assembly}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[6.06, photoHeight + 0.06, 0.16]} />
        <meshStandardMaterial
          color="#a98158"
          metalness={0.22}
          roughness={0.46}
        />
      </mesh>
      <mesh position={[0, 0, 0.082]}>
        <planeGeometry args={[6, photoHeight]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function ExteriorPerspectiveCanvas(props: Bridge) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 36, near: 0.1, far: 20 }}
      dpr={[1, 2]}
      // Measure layout dimensions, not the card's temporary GSAP scale/tilt.
      resize={{ offsetSize: true }}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[-3, 4, 6]} intensity={0.55} />
      <PhotoPlane {...props} />
    </Canvas>
  );
}
