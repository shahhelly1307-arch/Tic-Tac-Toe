import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles, Environment } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { Board, Cell } from "@/game/ai";

interface Props {
  board: Board;
  winningLine: number[] | null;
  onCellClick: (i: number) => void;
  disabled: boolean;
  status: "playing" | "won" | "lost" | "draw";
  aiThinking: boolean;
}

const CELL_SIZE = 1.1;
const GAP = 0.12;

// Compute 3D position for cell index 0..8 (top-left to bottom-right)
function cellPosition(i: number): [number, number, number] {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const step = CELL_SIZE + GAP;
  return [(col - 1) * step, 0.06, (row - 1) * step];
}

function XPiece({ glow = 1 }: { glow?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
    }
  });
  const barGeo = useMemo(() => new THREE.BoxGeometry(0.72, 0.14, 0.14), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#00e7ff"),
        emissive: new THREE.Color("#00e7ff"),
        emissiveIntensity: 1.4 * glow,
        metalness: 0.6,
        roughness: 0.2,
      }),
    [glow],
  );
  return (
    <group ref={ref} position={[0, 0.32, 0]}>
      <mesh geometry={barGeo} material={mat} rotation={[0, 0, Math.PI / 4]} castShadow />
      <mesh geometry={barGeo} material={mat} rotation={[0, 0, -Math.PI / 4]} castShadow />
      <pointLight color="#00e7ff" intensity={0.7} distance={2} />
    </group>
  );
}

function OPiece({ glow = 1 }: { glow?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.8;
    }
  });
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ff3df0"),
        emissive: new THREE.Color("#ff3df0"),
        emissiveIntensity: 1.4 * glow,
        metalness: 0.6,
        roughness: 0.2,
      }),
    [glow],
  );
  return (
    <group position={[0, 0.32, 0]}>
      <mesh ref={ref} material={mat} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.32, 0.09, 16, 48]} />
      </mesh>
      <pointLight color="#ff3df0" intensity={0.7} distance={2} />
    </group>
  );
}

function PiecePop({ children, win }: { children: React.ReactNode; win: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const [t, setT] = useState(0);
  useFrame((_, delta) => {
    setT((p) => Math.min(p + delta * 3.5, 1));
    if (ref.current) {
      const s = 0.2 + t * 0.8 + (win ? Math.sin(performance.now() * 0.006) * 0.05 : 0);
      ref.current.scale.set(s, s, s);
      ref.current.position.y = (1 - t) * 0.6;
    }
  });
  return <group ref={ref}>{children}</group>;
}

function Cell3D({
  index,
  value,
  isWin,
  isHoverable,
  onClick,
}: {
  index: number;
  value: Cell;
  isWin: boolean;
  isHoverable: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const pos = cellPosition(index);
  const baseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (baseRef.current) {
      const target = hover && isHoverable && !value ? 0.18 : 0;
      baseRef.current.position.y = THREE.MathUtils.lerp(baseRef.current.position.y, target, 0.15);
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = isWin
        ? 0.55 + Math.sin(state.clock.elapsedTime * 4) * 0.25
        : hover && isHoverable && !value
          ? 0.35
          : 0.12;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.2);
    }
  });

  return (
    <group position={pos}>
      {/* Glow underlay */}
      <mesh ref={glowRef} position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CELL_SIZE * 1.05, CELL_SIZE * 1.05]} />
        <meshBasicMaterial
          color={isWin ? "#ffeb3b" : "#00e7ff"}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Base tile */}
      <mesh
        ref={baseRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = isHoverable && !value ? "pointer" : "default";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isHoverable && !value) onClick();
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[CELL_SIZE, 0.12, CELL_SIZE]} />
        <meshStandardMaterial
          color={isWin ? "#3a2a00" : "#0d1726"}
          emissive={isWin ? "#ff9d00" : "#0a1530"}
          emissiveIntensity={isWin ? 1.2 : 0.5}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      {value === "X" && (
        <PiecePop win={isWin}>
          <XPiece glow={isWin ? 1.8 : 1} />
        </PiecePop>
      )}
      {value === "O" && (
        <PiecePop win={isWin}>
          <OPiece glow={isWin ? 1.8 : 1} />
        </PiecePop>
      )}
    </group>
  );
}

function BoardFrame() {
  const totalSize = CELL_SIZE * 3 + GAP * 2 + 0.4;
  return (
    <group position={[0, 0, 0]}>
      {/* Base platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[totalSize, 0.08, totalSize]} />
        <meshStandardMaterial color="#050912" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Outer neon ring */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[totalSize * 0.7, totalSize * 0.72, 64]} />
        <meshBasicMaterial color="#00e7ff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CameraRig({ status }: { status: "playing" | "won" | "lost" | "draw" }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 4.2, 5));
  useEffect(() => {
    if (status === "won") target.current.set(0, 3, 4);
    else if (status === "lost") target.current.set(0, 5.5, 5.5);
    else if (status === "draw") target.current.set(0, 4.5, 5);
    else target.current.set(0, 4.2, 5);
  }, [status]);

  useFrame(() => {
    camera.position.lerp(target.current, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function ThinkingAura({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = active ? 0.4 + Math.sin(state.clock.elapsedTime * 5) * 0.25 : 0;
      ref.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });
  const size = CELL_SIZE * 3 + GAP * 2 + 0.6;
  return (
    <mesh ref={ref} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * 0.55, size * 0.6, 64]} />
      <meshBasicMaterial color="#ff3df0" transparent opacity={0} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function GameBoard3D({ board, winningLine, onCellClick, disabled, status, aiThinking }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 4.2, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={["#04060f"]} />
        <fog attach="fog" args={["#04060f", 8, 18]} />

        {/* Lighting */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <pointLight position={[-4, 3, -4]} color="#00e7ff" intensity={1.5} distance={12} />
        <pointLight position={[4, 3, 4]} color="#ff3df0" intensity={1.5} distance={12} />
        <Environment preset="night" />

        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
          <BoardFrame />
          {board.map((value, i) => (
            <Cell3D
              key={i}
              index={i}
              value={value}
              isWin={!!winningLine?.includes(i)}
              isHoverable={!disabled}
              onClick={() => onCellClick(i)}
            />
          ))}
          <ThinkingAura active={aiThinking} />
        </Float>

        <Sparkles count={60} scale={[8, 4, 8]} size={2} speed={0.3} color="#00e7ff" opacity={0.6} />
        {status === "won" && (
          <Sparkles count={200} scale={[6, 4, 6]} size={4} speed={1.5} color="#ffd000" opacity={1} />
        )}

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#02030a" metalness={0.6} roughness={0.4} />
        </mesh>

        <CameraRig status={status} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          rotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
}
