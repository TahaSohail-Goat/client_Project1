import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture";
import { Group, SRGBColorSpace } from "three";
import { photo } from "../../content/media";

type Bridge = {
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};

function Photograph({ progress, redraw, onReady, onFailure }: Bridge) {
  const assembly = useRef<Group>(null);
  const texture = useTexture(
    photo("supplemental-05").src.replace(/\.webp$/, "-768.webp"),
  );
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
    group.rotation.y = Math.sin(p * Math.PI) * 0.16 - (p - 0.5) * 0.05;
    group.rotation.x = Math.sin(p * Math.PI * 1.2) * 0.055;
    group.rotation.z = Math.sin(p * Math.PI) * -0.018;
    group.position.y = Math.sin(p * Math.PI) * 0.055;
    group.position.z = Math.sin(p * Math.PI) * 0.12;
    if (camera && "zoom" in camera) {
      camera.zoom = size.width / 6;
      camera.updateProjectionMatrix();
    }
  });

  return (
    <group ref={assembly}>
      <mesh position={[0, 0, -0.025]}>
        <boxGeometry args={[6.02, 3.02, 0.065]} />
        <meshStandardMaterial color="#b99670" metalness={0.18} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[6, 3]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function VisionPhotoCanvas(props: Bridge) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 8], zoom: 150, near: 0.1, far: 20 }}
      dpr={[1, 1.35]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera, size }) => {
        if ("zoom" in camera) {
          camera.zoom = size.width / 6;
          camera.updateProjectionMatrix();
        }
      }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[-3, 4, 6]} intensity={0.55} />
      <Photograph {...props} />
    </Canvas>
  );
}
