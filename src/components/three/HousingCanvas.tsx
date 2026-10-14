import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei/core/Edges";
import { Group, MathUtils } from "three";
import { houseParts, treePositions, type HousePart } from "../../content/housing";

type HousingCanvasProps = {
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};
const ease = (n: number) => { const p = MathUtils.clamp(n, 0, 1); return p * p * (3 - 2 * p); };

function Part({ part }: { part: HousePart }) {
  return <mesh position={part.position} castShadow receiveShadow>
    <boxGeometry args={part.size} />
    <meshStandardMaterial color={part.color} roughness={0.75} metalness={0.06} />
    {part.outline && <Edges color="#58584d" threshold={30} />}
  </mesh>;
}
function House({ progress, redraw, onReady, onFailure }: HousingCanvasProps) {
  const house = useRef<Group>(null);
  const roof = useRef<Group>(null);
  const { camera, invalidate, size, gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  useEffect(() => {
    redraw.current = invalidate;
    invalidate();
    onReady();
    return () => { redraw.current = null; };
  }, [invalidate, onReady, redraw]);
  useFrame(() => {
    const p = progress.current;
    const lift = ease((p - 0.25) / 0.4);
    if (roof.current) roof.current.position.set(-lift * 0.3, lift * 3.2, -lift * 2.8);
    if (house.current) house.current.rotation.y = -0.18 + ease(p) * 0.92;
    camera.position.set(12 - ease(p) * 3, 9 + ease(p) * 5, 13 - ease(p) * 3);
    camera.lookAt(0, 1.35 + lift * 1.4, 0);
    if ("zoom" in camera) {
      camera.zoom = Math.min(size.width / (18 + ease(p) * 2), size.height / (12 + ease(p) * 2));
      camera.updateProjectionMatrix();
    }
  });
  return <>
    <ambientLight intensity={0.7} />
    <hemisphereLight args={["#f2ede5", "#84917a", 1.8]} />
    <directionalLight position={[6, 12, 8]} intensity={3} color="#fff2da" castShadow
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12}
      shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />
    <directionalLight position={[-8, 6, -5]} intensity={1.5} color="#bacbbf" />
    <group ref={house}>
      {houseParts.filter((part) => !part.roof).map((part, i) => <Part key={i} part={part} />)}
      <group ref={roof}>{houseParts.filter((part) => part.roof).map((part, i) => <Part key={i} part={part} />)}</group>
      {treePositions.map((position, i) => <group key={i} position={position}>
        <mesh position={[0, 0.85, 0]} castShadow><cylinderGeometry args={[0.045, 0.07, 1.7, 8]} /><meshStandardMaterial color="#8c7155" /></mesh>
        <mesh position={[0, 1.9, 0]} scale={[0.7, 0.95, 0.7]} castShadow><icosahedronGeometry args={[0.9, 1]} /><meshStandardMaterial color="#78886c" flatShading /></mesh>
      </group>)}
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.37, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} /><shadowMaterial opacity={0.26} />
    </mesh>
  </>;
}
export default function HousingCanvas(props: HousingCanvasProps) {
  return <Canvas orthographic camera={{ position: [12, 9, 13], zoom: 45, near: 0.1, far: 100 }}
    shadows dpr={[1, 1.5]} frameloop="demand"
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
    <House {...props} />
  </Canvas>;
}
