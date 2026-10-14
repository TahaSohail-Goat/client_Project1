import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Edges } from "@react-three/drei/core/Edges";
import { BufferAttribute, Group, MathUtils } from "three";
import {
  houseParts,
  treePositions,
  type HousePart,
} from "../../content/housing";

type HousingCanvasProps = {
  progress: RefObject<number>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onFailure: () => void;
};
const ease = (n: number) => {
  const p = MathUtils.clamp(n, 0, 1);
  return p * p * (3 - 2 * p);
};

function Part({ part }: { part: HousePart }) {
  const glass = part.color === "#4b6560";
  return (
    <mesh position={part.position} castShadow receiveShadow>
      <boxGeometry args={part.size} />
      <meshStandardMaterial
        color={part.color}
        roughness={glass ? 0.16 : 0.78}
        metalness={glass ? 0.35 : 0.06}
        transparent={glass}
        opacity={glass ? 0.48 : 1}
        depthWrite={!glass}
      />
      {part.outline && <Edges color="#58584d" threshold={30} />}
    </mesh>
  );
}
function House({ progress, redraw, onReady, onFailure }: HousingCanvasProps) {
  const house = useRef<Group>(null);
  const roof = useRef<Group>(null);
  const guides = useRef<Group>(null);
  const guidePositions = useMemo(() => new Float32Array(24), []);
  const guideAttribute = useRef<BufferAttribute>(null);
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
    return () => {
      redraw.current = null;
    };
  }, [invalidate, onReady, redraw]);
  useFrame(() => {
    const p = progress.current;
    const lift = ease((p - 0.25) / 0.4);
    if (roof.current)
      roof.current.position.set(-lift * 0.3, lift * 3.2, -lift * 2.8);
    const approach = ease(p / 0.23);
    const orbit = ease((p - 0.3) / 0.7);
    const plan = ease((p - 0.67) / 0.33);
    if (house.current) house.current.rotation.y = -0.18 + orbit * 0.88;
    camera.position.set(
      12 - orbit * 4,
      8.5 + approach * 0.5 + plan * 8,
      13 - orbit * 4,
    );
    camera.lookAt(0, 1.35 + lift * 1.25, -plan * 0.25);
    if (guides.current) guides.current.visible = lift > 0.01;
    [
      [-4.6, -2.9],
      [4.6, -2.9],
      [4.6, 2.9],
      [-4.6, 2.9],
    ].forEach(([x, z], i) => {
      guidePositions.set(
        [x, 0.24, z, x - lift * 0.3, 2.98 + lift * 3.2, z - lift * 2.8],
        i * 6,
      );
    });
    if (guideAttribute.current) guideAttribute.current.needsUpdate = true;
    if ("zoom" in camera) {
      camera.zoom =
        Math.min(size.width / (18 + plan * 2), size.height / (12 + plan * 4)) *
        (1 + approach * 0.055);
      camera.updateProjectionMatrix();
    }
  });
  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#f2ede5", "#84917a", 1.8]} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={3}
        color="#fff2da"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      <directionalLight
        position={[-8, 6, -5]}
        intensity={1.5}
        color="#bacbbf"
      />
      <group ref={house}>
        {houseParts
          .filter((part) => !part.roof)
          .map((part, i) => (
            <Part key={i} part={part} />
          ))}
        <group ref={roof}>
          {houseParts
            .filter((part) => part.roof)
            .map((part, i) => (
              <Part key={i} part={part} />
            ))}
        </group>
        {/* Fine timber battens and floor joints belong to this original concept. */}
        {Array.from({ length: 22 }, (_, i) => (
          <mesh
            key={`batten-${i}`}
            position={[-4.38 + i * 0.125, 1.52, 3.005]}
            castShadow
          >
            <boxGeometry args={[0.035, 2.6, 0.045]} />
            <meshStandardMaterial color="#987650" roughness={0.9} />
          </mesh>
        ))}
        {[-2, -1, 0, 1, 2].map((z) => (
          <mesh key={`joint-${z}`} position={[1.3, 0.224, z]}>
            <boxGeometry args={[5.7, 0.002, 0.008]} />
            <meshStandardMaterial color="#bcb5a8" />
          </mesh>
        ))}
        {[
          [-1.35, 1.5],
          [0.55, 1.5],
          [-0.4, 0.78],
          [-0.4, 2.22],
        ].map(([x, z], i) => (
          <group
            key={`chair-${i}`}
            position={[x, 0, z]}
            rotation={[0, i < 2 ? Math.PI / 2 : 0, 0]}
          >
            <mesh position={[0, 0.69, 0]} castShadow>
              <boxGeometry args={[0.42, 0.08, 0.42]} />
              <meshStandardMaterial color="#b99670" />
            </mesh>
            <mesh position={[0, 0.94, -0.2]} castShadow>
              <boxGeometry args={[0.42, 0.5, 0.045]} />
              <meshStandardMaterial color="#b99670" />
            </mesh>
            {[-0.15, 0.15].flatMap((a) =>
              [-0.15, 0.15].map((b) => (
                <mesh key={`${a}-${b}`} position={[a, 0.44, b]}>
                  <boxGeometry args={[0.035, 0.44, 0.035]} />
                  <meshStandardMaterial color="#292e2b" />
                </mesh>
              )),
            )}
          </group>
        ))}
        <group ref={guides} visible={false}>
          <lineSegments frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute
                ref={guideAttribute}
                attach="attributes-position"
                args={[guidePositions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#b99670"
              transparent
              opacity={0.32}
              depthWrite={false}
            />
          </lineSegments>
        </group>
        {treePositions.map((position, i) => (
          <group key={i} position={position}>
            <mesh position={[0, 0.85, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.07, 1.7, 8]} />
              <meshStandardMaterial color="#8c7155" />
            </mesh>
            <mesh position={[0, 1.9, 0]} scale={[0.7, 0.95, 0.7]} castShadow>
              <icosahedronGeometry args={[0.9, 1]} />
              <meshStandardMaterial color="#78886c" flatShading />
            </mesh>
          </group>
        ))}
      </group>
      <gridHelper
        args={[28, 28, "#576453", "#303c33"]}
        position={[0, -0.4, 0]}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.37, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.26} />
      </mesh>
    </>
  );
}
export default function HousingCanvas(props: HousingCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [12, 9, 13], zoom: 45, near: 0.1, far: 100 }}
      shadows
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <House {...props} />
    </Canvas>
  );
}
