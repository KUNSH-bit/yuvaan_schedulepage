
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type TrackEvent = {
  time: string;
  title: string;
  venue: string;
  category: string;
  description: string;
};

type Props = {
  day: string;
  events: TrackEvent[];
  selected: number;
  onEventChange: (index: number) => void;
};

// CHANGE THIS IF YOUR DOWNLOAD IS A GLB FILE.
const MODEL_URL = "/models/mcqueen/scene.gltf";

// If the car faces backwards, try 0 instead of Math.PI.
// If it faces sideways, try Math.PI / 2 or -Math.PI / 2.
const MODEL_ROTATION_Y = Math.PI;

const layouts: Record<string, [number, number][]> = {
  "DAY 01": [
    [-10, -3], [-9, -9], [-3, -11], [5, -10],
    [11, -6], [10, 1], [7, 8], [1, 10],
    [-6, 9], [-11, 5],
  ],
  "DAY 02": [
    [-11, -5], [-7, -10], [0, -8], [5, -11],
    [11, -7], [9, 0], [12, 6], [5, 10],
    [-2, 8], [-8, 11], [-11, 4],
  ],
  "DAY 03": [
    [-10, -7], [-4, -11], [3, -9], [10, -10],
    [12, -3], [7, 2], [11, 8], [4, 11],
    [-3, 9], [-11, 10], [-8, 2], [-12, -3],
  ],
};

function makeCurve(day: string) {
  const points = (layouts[day] ?? layouts["DAY 01"]).map(
    ([x, z]) => new THREE.Vector3(x, 0, z)
  );

  return new THREE.CatmullRomCurve3(
    points,
    true,
    "catmullrom",
    0.35
  );
}

function McQueenModel() {
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    // Normalize the model so its longest horizontal dimension is about 2.7 units.
    const horizontalLength = Math.max(size.x, size.z, 0.01);
    const scale = 2.7 / horizontalLength;

    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale,
      -bounds.min.y * scale,
      -center.z * scale
    );

    return clone;
  }, [scene]);

  return (
    <group rotation={[0, MODEL_ROTATION_Y, 0]}>
      <primitive object={model} />
    </group>
  );
}

function Road({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const roadGeometry = useMemo(() => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const segments = 500;
    const halfWidth = 2.3;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const side = new THREE.Vector3(
        -tangent.z,
        0,
        tangent.x
      ).normalize();

      const left = point.clone().addScaledVector(side, halfWidth);
      const right = point.clone().addScaledVector(side, -halfWidth);

      vertices.push(left.x, 0.05, left.z);
      vertices.push(right.x, 0.05, right.z);

      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2);
        indices.push(a + 1, a + 3, a + 2);
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

  const dashes = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const t = i / 100;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      return {
        position: [point.x, 0.085, point.z] as [number, number, number],
        rotation: Math.atan2(tangent.x, tangent.z),
      };
    });
  }, [curve]);

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.18, 0]}
        receiveShadow
      >
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#151b1b" roughness={1} />
      </mesh>

      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          color="#30343a"
          roughness={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <tubeGeometry args={[curve, 500, 0.12, 8, true]} />
        <meshStandardMaterial
          color="#e52a2a"
          emissive="#a10e0e"
          emissiveIntensity={0.6}
        />
      </mesh>

      {dashes.map((dash, index) => (
        <mesh
          key={index}
          position={dash.position}
          rotation={[0, dash.rotation, 0]}
        >
          <boxGeometry args={[0.08, 0.025, 0.55]} />
          <meshStandardMaterial
            color="#f4f1e8"
            emissive="#ffffff"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </>
  );
}

function TrackDetails({ curve, events, selected }: {
  curve: THREE.CatmullRomCurve3;
  events: TrackEvent[];
  selected: number;
}) {
  return (
    <>
      {events.map((event, index) => {
        const t = index / events.length;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const angle = Math.atan2(tangent.x, tangent.z);
        const active = index === selected;

        return (
          <group
            key={event.title}
            position={[point.x, 0, point.z]}
            rotation={[0, angle, 0]}
          >
            {/* Checkpoint pillars */}
            {[-2.15, 2.15].map((x) => (
              <mesh
                key={x}
                position={[x, 1.2, 0]}
                castShadow
              >
                <boxGeometry args={[0.22, 2.4, 0.22]} />
                <meshStandardMaterial
                  color={active ? "#ffe04a" : "#e52a2a"}
                  emissive={active ? "#ffe04a" : "#9c1010"}
                  emissiveIntensity={active ? 1.7 : 0.7}
                />
              </mesh>
            ))}

            {/* Overhead checkpoint sign */}
            <mesh position={[0, 2.45, 0]}>
              <boxGeometry args={[4.5, 0.65, 0.25]} />
              <meshStandardMaterial
                color="#171b1d"
                emissive={active ? "#6b4710" : "#350909"}
                emissiveIntensity={active ? 0.8 : 0.25}
              />
            </mesh>

            <Text
              position={[0, 2.45, 0.15]}
              fontSize={0.25}
              color={active ? "#ffe04a" : "#ffffff"}
              anchorX="center"
              anchorY="middle"
              maxWidth={4.1}
            >
              {`0${index + 1}  ${event.title.toUpperCase()}`}
            </Text>

            <pointLight
              position={[0, 3, 0]}
              color={active ? "#ffe04a" : "#ff2929"}
              intensity={active ? 12 : 4}
              distance={7}
            />
          </group>
        );
      })}

      {/* Trackside barriers */}
      {Array.from({ length: 80 }, (_, index) => {
        const t = index / 80;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const side = new THREE.Vector3(
          -tangent.z,
          0,
          tangent.x
        ).normalize();

        return [-1, 1].map((direction) => {
          const barrierPosition = point
            .clone()
            .addScaledVector(side, direction * 3.0);

          return (
            <mesh
              key={`${index}-${direction}`}
              position={[barrierPosition.x, 0.3, barrierPosition.z]}
              rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}
            >
              <boxGeometry args={[0.32, 0.55, 0.5]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? "#e52a2a" : "#f1eee5"}
                roughness={0.65}
              />
            </mesh>
          );
        });
      })}
    </>
  );
}

function StadiumLights() {
  const positions: [number, number, number][] = [
    [-15, 0, -12],
    [15, 0, -12],
    [-15, 0, 12],
    [15, 0, 12],
    [0, 0, -16],
    [0, 0, 16],
  ];

  return (
    <>
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 8, 8]} />
            <meshStandardMaterial color="#555b5e" metalness={0.7} />
          </mesh>

          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[1.4, 0.35, 0.45]} />
            <meshStandardMaterial
              color="#fff1b8"
              emissive="#fff1b8"
              emissiveIntensity={2.5}
            />
          </mesh>

          <pointLight
            position={[0, 7.5, 0]}
            color="#fff0c0"
            intensity={25}
            distance={24}
          />
        </group>
      ))}
    </>
  );
}

function RacingWorld({
  day,
  events,
  selected,
  onEventChange,
  cameraMode,
}: {
  day: string;
  events: TrackEvent[];
  selected: number;
  onEventChange: (index: number) => void;
  cameraMode: "chase" | "overview";
}) {
  const curve = useMemo(() => makeCurve(day), [day]);
  const carRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const previousEvent = useRef(-1);
  const { camera } = useThree();
  const lastNotified = useRef(-1);

useEffect(() => {
  if (selected !== lastNotified.current && events.length > 0) {
    progress.current = (selected / events.length + 0.002) % 1;
    previousEvent.current = selected;
    lastNotified.current = selected;
  }
}, [selected, events.length]);

  useFrame((_, delta) => {
    if (!carRef.current || events.length === 0) return;

    // One lap takes roughly 30 seconds.
    progress.current = (progress.current + delta * 0.033) % 1;

    const t = progress.current;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    carRef.current.position.set(point.x, 0.12, point.z);

    // The model is expected to face its local -Z direction.
    carRef.current.rotation.y = Math.atan2(
      -tangent.x,
      -tangent.z
    );

    // Automatically change the HUD event as the car passes checkpoints.
    const eventIndex = Math.floor(t * events.length);

    if (eventIndex !== previousEvent.current) {
      previousEvent.current = eventIndex;
      lastNotified.current = eventIndex;
      onEventChange(eventIndex);
    }

    if (cameraMode === "chase") {
      const behind = point.clone().addScaledVector(tangent, -6.5);
      const desiredCamera = new THREE.Vector3(
        behind.x,
        3.2,
        behind.z
      );

      camera.position.lerp(
        desiredCamera,
        1 - Math.exp(-3.5 * delta)
      );

      const lookTarget = point.clone().addScaledVector(tangent, 4);
      lookTarget.y = 0.9;
      camera.lookAt(lookTarget);
    } else {
      camera.position.lerp(
        new THREE.Vector3(0, 29, 24),
        1 - Math.exp(-2.5 * delta)
      );
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <Road curve={curve} />

      <TrackDetails
        curve={curve}
        events={events}
        selected={selected}
      />

      <StadiumLights />

      <group ref={carRef}>
        <Suspense fallback={null}>
          <McQueenModel />
        </Suspense>
      </group>
    </>
  );
}

export default function RaceTrackScene({
  day,
  events,
  selected,
  onEventChange,
}: Props) {
  const [cameraMode, setCameraMode] = useState<"chase" | "overview">(
    "chase"
  );

  const currentEvent = events[selected] ?? events[0];

  return (
    <div className="race-experience">
      <div className="race-hud">
        <div className="hud-event">
          <span className="hud-label">
            <i className="hud-live-dot" /> NOW ON TRACK
          </span>

          <h3>{currentEvent.title}</h3>

          <div className="hud-event-meta">
            <span>{currentEvent.time}</span>
            <span>{currentEvent.venue}</span>
          </div>
        </div>

        <div className="hud-right">
          <span className="hud-day">{day}</span>
          <strong>95</strong>
          <span className="hud-lap">YUVAAN GRAND PRIX</span>
        </div>
      </div>

      <div className="race-viewport">
        <Canvas
          camera={{
            position: [0, 4, 10],
            fov: 65,
            near: 0.1,
            far: 150,
          }}
          dpr={[1, 1.35]}
          shadows
        >
          <color attach="background" args={["#101416"]} />
          <fog attach="fog" args={["#101416", 35, 85]} />

          <ambientLight intensity={1.2} />

          <directionalLight
            position={[8, 18, 8]}
            intensity={2}
            castShadow
          />

          <pointLight
            position={[-12, 5, -8]}
            color="#e52a2a"
            intensity={28}
            distance={35}
          />

          <pointLight
            position={[12, 5, 8]}
            color="#ffe04a"
            intensity={22}
            distance={35}
          />

          <Suspense fallback={null}>
            <RacingWorld
            day={day}
            events={events}
            selected={selected}
            onEventChange={onEventChange}
            cameraMode={cameraMode}
            />
          </Suspense>
        </Canvas>

        <div className="race-controls">
          <button
            className={cameraMode === "chase" ? "camera-button active" : "camera-button"}
            onClick={() => setCameraMode("chase")}
          >
            <span>◉</span> CHASE CAM
          </button>

          <button
            className={cameraMode === "overview" ? "camera-button active" : "camera-button"}
            onClick={() => setCameraMode("overview")}
          >
            <span>▦</span> OVERVIEW
          </button>
        </div>

        <div className="race-corner-label">
          <span>LIVE SIMULATION</span>
          <span>LIGHTNING SPEED // 95</span>
        </div>
      </div>

      <div className="race-event-strip">
        {events.map((event, index) => (
          <button
            key={event.title}
            className={selected === index ? "race-event active" : "race-event"}
            onClick={() => onEventChange(index)}
          >
            <span>0{index + 1}</span>
            <strong>{event.title}</strong>
            <small>{event.time}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
