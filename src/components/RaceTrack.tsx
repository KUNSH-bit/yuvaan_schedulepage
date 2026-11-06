"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type RaceTrackSceneProps = {
  selected: number;
  eventCount: number;
};

const trackPoints = [
  new THREE.Vector3(-9, 0, -3),
  new THREE.Vector3(-7, 0, -8),
  new THREE.Vector3(-1, 0, -9),
  new THREE.Vector3(7, 0, -8),
  new THREE.Vector3(10, 0, -3),
  new THREE.Vector3(8, 0, 4),
  new THREE.Vector3(3, 0, 8),
  new THREE.Vector3(-5, 0, 8),
  new THREE.Vector3(-10, 0, 4),
  new THREE.Vector3(-9, 0, -3),
];

function RacingCar({ selected, eventCount }: RaceTrackSceneProps) {
  const carRef = useRef<THREE.Group>(null);
  const progress = useRef(0);

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(trackPoints, true, "catmullrom", 0.5),
    []
  );

  useFrame(() => {
    if (!carRef.current) return;

    const target = (selected + 1) / Math.max(eventCount + 1, 2);
    progress.current += (target - progress.current) * 0.035;

    const point = curve.getPointAt(progress.current % 1);
    const tangent = curve.getTangentAt(progress.current % 1);

    carRef.current.position.set(point.x, 0.55, point.z);
    carRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });

  return (
    <group ref={carRef}>
      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.15, 0.38, 2.1]} />
        <meshStandardMaterial color="#e52323" metalness={0.45} roughness={0.3} />
      </mesh>

      {/* Front hood */}
      <mesh position={[0, 0.12, -0.67]} castShadow>
        <boxGeometry args={[1.05, 0.2, 0.65]} />
        <meshStandardMaterial color="#ff3030" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0, 0.38, 0.1]} castShadow>
        <boxGeometry args={[0.72, 0.42, 0.8]} />
        <meshStandardMaterial color="#171b24" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.48, -0.27]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.67, 0.3, 0.08]} />
        <meshStandardMaterial color="#9ed9ed" metalness={0.8} roughness={0.15} />
      </mesh>

      {/* Rear spoiler */}
      <mesh position={[0, 0.45, 0.92]}>
        <boxGeometry args={[1.3, 0.12, 0.25]} />
        <meshStandardMaterial color="#171717" metalness={0.4} />
      </mesh>

      {/* Wheels */}
      {[-1, 1].map((side) =>
        [-0.65, 0.65].map((z) => (
          <mesh
            key={`${side}-${z}`}
            position={[side * 0.59, -0.12, z]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.25, 0.25, 0.16, 20]} />
            <meshStandardMaterial color="#101010" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Headlights */}
      {[-0.37, 0.37].map((x) => (
        <mesh key={x} position={[x, 0.04, -1.07]}>
          <boxGeometry args={[0.18, 0.1, 0.04]} />
          <meshStandardMaterial
            color="#fff5bd"
            emissive="#fff0a0"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function Track({ selected, eventCount }: RaceTrackSceneProps) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(trackPoints, true, "catmullrom", 0.5),
    []
  );

  const roadGeometry = useMemo(() => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const segments = 300;
    const halfWidth = 1.8;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = point.clone().addScaledVector(side, halfWidth);
      const right = point.clone().addScaledVector(side, -halfWidth);

      vertices.push(left.x, 0.04, left.z);
      vertices.push(right.x, 0.04, right.z);

      if (i < segments) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [curve]);

  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#171c1b" />
      </mesh>

      {/* Road */}
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial color="#292d33" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer track boundary */}
      <mesh>
        <tubeGeometry args={[curve, 300, 0.09, 8, true]} />
        <meshStandardMaterial color="#e52a2a" emissive="#6b1010" />
      </mesh>

      {/* Event checkpoints */}
      {Array.from({ length: eventCount }).map((_, index) => {
        const t = (index + 1) / (eventCount + 1);
        const point = curve.getPointAt(t);
        const isSelected = index === selected;

        return (
          <group key={index} position={[point.x, 0, point.z]}>
            <mesh position={[0, 0.65, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 1.3, 12]} />
              <meshStandardMaterial
                color={isSelected ? "#ffe04a" : "#e52a2a"}
                emissive={isSelected ? "#ffe04a" : "#7b1111"}
                emissiveIntensity={isSelected ? 1.4 : 0.4}
              />
            </mesh>

            <mesh position={[0, 1.35, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? "#ffe04a" : "#e52a2a"}
                emissive={isSelected ? "#ffe04a" : "#7b1111"}
              />
            </mesh>
          </group>
        );
      })}

      <RacingCar selected={selected} eventCount={eventCount} />
    </>
  );
}

export default function RaceTrackScene({
  selected,
  eventCount,
}: RaceTrackSceneProps) {
  return (
    <div className="race-scene">
      <Canvas
        camera={{ position: [0, 19, 22], fov: 43 }}
        dpr={[1, 1.5]}
        shadows
      >
        <color attach="background" args={["#101416"]} />
        <fog attach="fog" args={["#101416", 25, 55]} />

        <ambientLight intensity={1.2} />
        <directionalLight
          position={[8, 15, 8]}
          intensity={2}
          castShadow
        />
        <pointLight position={[-10, 5, -5]} color="#e52a2a" intensity={35} />
        <pointLight position={[10, 5, 8]} color="#ffe04a" intensity={20} />

        <Track selected={selected} eventCount={eventCount} />
      </Canvas>
    </div>
  );
}