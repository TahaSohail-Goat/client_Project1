import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei/core/Edges";
import { Group, MathUtils, Path, Shape } from "three";

type Props = {
  progress: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};
const colors = [
  "#84917a",
  "#b99670",
  "#f2ede5",
  "#b99670",
  "#84917a",
  "#b99670",
];

function SpatialFrames({
  progress,
  pointer,
  redraw,
  onReady,
  onFailure,
}: Props) {
  const assembly = useRef<Group>(null);
  const frames = useRef<(Group | null)[]>([]);
  const core = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const { invalidate, gl, camera, size } = useThree();
  const shape = useMemo(() => {
    const frame = new Shape();
    frame.moveTo(-2, -1.55);
    frame.lineTo(2, -1.55);
    frame.lineTo(2, 1.55);
    frame.lineTo(-2, 1.55);
    frame.closePath();
    const hole = new Path();
    hole.moveTo(-1.87, -1.42);
    hole.lineTo(-1.87, 1.42);
    hole.lineTo(1.87, 1.42);
    hole.lineTo(1.87, -1.42);
    hole.closePath();
    frame.holes.push(hole);
    return frame;
  }, []);
  useEffect(() => {
    redraw.current = invalidate;
    invalidate();
    onReady();
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => {
      redraw.current = null;
      canvas.removeEventListener("webglcontextlost", onFailure);
    };
  }, [gl, invalidate, onFailure, onReady, redraw]);
  useFrame(() => {
    const p = MathUtils.clamp(progress.current, 0, 1);
    const fan = Math.sin(p * Math.PI);
    if (assembly.current) {
      assembly.current.rotation.set(
        -0.19 + p * 0.13 + pointer.current.y * 0.075,
        -0.65 + p * 1.2 + pointer.current.x * 0.16,
        -0.1 + p * 0.13,
      );
    }
    frames.current.forEach((frame, i) => {
      if (!frame) return;
      const step = i - 2.5;
      frame.position.set(
        step * (0.09 + fan * 0.28),
        Math.sin(i * 0.8) * fan * 0.24,
        step * (0.18 + fan * 0.65),
      );
      frame.rotation.set(
        Math.sin(i * 0.7) * fan * 0.13,
        step * fan * 0.09,
        step * fan * 0.045,
      );
    });
    if (core.current) {
      core.current.rotation.set(p * 0.6, p * 1.5, -0.2 + p * 0.4);
      core.current.scale.setScalar(0.8 + fan * 0.3);
    }
    if (orbit.current)
      orbit.current.rotation.set(1.1 + p * 0.3, p * 0.7, -p * 0.6);
    camera.position.set(6.8 - p * 2.6, 3.4 - p * 1.5, 9.5 - p * 0.7);
    camera.lookAt(0, 0, 0);
    if ("zoom" in camera) {
      camera.zoom = Math.min(size.width / 8.1, size.height / 5.6);
      camera.updateProjectionMatrix();
    }
    gl.domElement.dataset.pose = `${p.toFixed(4)}:${pointer.current.x.toFixed(3)}:${pointer.current.y.toFixed(3)}`;
  });
  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#f2ede5", "#24372b", 1.4]} />
      <directionalLight position={[3, 6, 8]} intensity={3.4} color="#fff0d5" />
      <directionalLight
        position={[-6, 2, -4]}
        intensity={2.2}
        color="#b99670"
      />
      <group ref={assembly}>
        {colors.map((color, i) => (
          <group
            key={i}
            ref={(node) => {
              frames.current[i] = node;
            }}
          >
            <mesh>
              <extrudeGeometry
                args={[
                  shape,
                  {
                    depth: 0.1,
                    bevelEnabled: true,
                    bevelThickness: 0.018,
                    bevelSize: 0.018,
                    bevelSegments: 2,
                    steps: 1,
                  },
                ]}
              />
              <meshStandardMaterial
                color={color}
                metalness={0.7}
                roughness={0.28}
              />
              <Edges
                threshold={35}
                color={i === 2 ? "#f2ede5" : "#b99670"}
                transparent
                opacity={0.5}
              />
            </mesh>
          </group>
        ))}
        <group ref={core}>
          <mesh>
            <boxGeometry args={[0.66, 0.66, 0.66]} />
            <meshStandardMaterial
              color="#84917a"
              transparent
              opacity={0.2}
              metalness={0.5}
              roughness={0.2}
              depthWrite={false}
            />
            <Edges color="#f2ede5" transparent opacity={0.85} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.11, 1]} />
            <meshBasicMaterial color="#b99670" />
          </mesh>
        </group>
      </group>
      <group ref={orbit}>
        <mesh>
          <torusGeometry args={[2.85, 0.007, 4, 120]} />
          <meshBasicMaterial color="#b99670" transparent opacity={0.28} />
        </mesh>
      </group>
      <gridHelper
        args={[12, 20, "#655840", "#28342d"]}
        position={[0, -2.1, 0]}
      />
    </>
  );
}
export default function ApproachCanvas(props: Props) {
  return (
    <Canvas
      orthographic
      camera={{ position: [6, 3, 10], zoom: 60, near: 0.1, far: 60 }}
      dpr={[1, 2]}
      resize={{ offsetSize: true }}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <SpatialFrames {...props} />
    </Canvas>
  );
}
