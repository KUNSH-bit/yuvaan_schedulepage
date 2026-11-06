
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

type TrackEvent = {
  time: string;
  title: string;
  venue: string;
  category: string;
};

type RaceTrackSceneProps = {
  day: string;
  events: TrackEvent[];
  selected: number;
  onEventChange: (index: number) => void;
};

const circuitLayouts: Record<string, THREE.Vector3[]> = {
  "DAY 01": [
    new THREE.Vector3(-10, 0, -3),
    new THREE.Vector3(-9, 0, -8),
    new THREE.Vector3(-4, 0, -10),
    new THREE.Vector3(3, 0, -9),
    new THREE.Vector3(9, 0, -7),
    new THREE.Vector3(11, 0, -2),
    new THREE.Vector3(9, 0, 4),
    new THREE.Vector3(5, 0, 8),
    new THREE.Vector3(-2, 0, 9),
    new THREE.Vector3(-8, 0, 7),
    new THREE.Vector3(-11, 0, 3),
  ],

  "DAY 02": [
    new THREE.Vector3(-10, 0, -5),
    new THREE.Vector3(-5, 0, -9),
    new THREE.Vector3(0, 0, -7),
    new THREE.Vector3(5, 0, -10),
    new THREE.Vector3(10, 0, -6),
    new THREE.Vector3(8, 0, -1),
    new THREE.Vector3(3, 0, 1),
    new THREE.Vector3(8, 0, 5),
    new THREE.Vector3(5, 0, 9),
    new THREE.Vector3(-2, 0, 8),
    new THREE.Vector3(-7, 0, 5),
    new THREE.Vector3(-11, 0, 1),
  ],

  "DAY 03": [
    new THREE.Vector3(-10, 0, -4),
    new THREE.Vector3(-8, 0, -9),
    new THREE.Vector3(-3, 0, -10),
    new THREE.Vector3(2, 0, -7),
    new THREE.Vector3(8, 0, -9),
    new THREE.Vector3(11, 0, -4),
    new THREE.Vector3(7, 0, 0),
    new THREE.Vector3(10, 0, 5),
    new THREE.Vector3(5, 0, 9),
    new THREE.Vector3(-1, 0, 8),
    new THREE.Vector3(-5, 0, 5),
    new THREE.Vector3(-10, 0, 7),
    new THREE.Vector3(-12, 0, 2),
  ],
};

function createRoadGeometry(
  curve: THREE.CatmullRomCurve3,
  width: number
) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const segments = 500;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const side = new THREE.Vector3(
      -tangent.z,
      0,
      tangent.x
    ).normalize();

    const left = point.clone().addScaledVector(side, width / 2);
    const right = point.clone().addScaledVector(side, -width / 2);

    vertices.push(left.x, 0.05, left.z);
    vertices.push(right.x, 0.05, right.z);

    if (i < segments) {
      const a = i * 2;

      indices.push(
        a,
        a + 1,
        a + 2,
        a + 1,
        a + 3,
        a + 2
      );
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
}

function McQueen() {
  const carRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    wheelRefs.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x -= 0.18;
      }
    });

    if (carRef.current) {
      carRef.current.position.y =
        0.48 + Math.sin(state.clock.elapsedTime * 12) * 0.015;
    }
  });

  return (
    <group ref={carRef} scale={0.9}>
      {/* Main red body */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[1.35, 0.42, 2.25]} />
        <meshStandardMaterial
          color="#d90016"
          metalness={0.35}
          roughness={0.25}
        />
      </mesh>

      {/* Front hood */}
      <mesh castShadow position={[0, 0.29, -0.72]}>
        <boxGeometry args={[1.27, 0.2, 0.72]} />
        <meshStandardMaterial
          color="#ff1726"
          metalness={0.25}
          roughness={0.25}
        />
      </mesh>

      {/* Rear deck */}
      <mesh position={[0, 0.32, 0.78]}>
        <boxGeometry args={[1.2, 0.18, 0.48]} />
        <meshStandardMaterial color="#b90012" />
      </mesh>

      {/* Roof and cabin */}
      <mesh castShadow position={[0, 0.58, 0.08]}>
        <boxGeometry args={[0.9, 0.48, 0.92]} />
        <meshStandardMaterial
          color="#b8eaff"
          metalness={0.55}
          roughness={0.16}
        />
      </mesh>

      {/* Red roof */}
      <mesh position={[0, 0.84, 0.08]}>
        <boxGeometry args={[0.94, 0.1, 0.9]} />
        <meshStandardMaterial color="#e50920" />
      </mesh>

      {/* Windshield frame */}
      <mesh position={[0, 0.58, -0.4]}>
        <boxGeometry args={[0.92, 0.46, 0.08]} />
        <meshStandardMaterial color="#171c24" />
      </mesh>

      {/* Eyes - white eyeballs */}
      {[-0.23, 0.23].map((x) => (
        <mesh
          key={x}
          position={[x, 0.65, -0.46]}
          scale={[1, 0.82, 0.28]}
        >
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="white" roughness={0.2} />
        </mesh>
      ))}

      {/* Pupils */}
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} position={[x, 0.63, -0.525]}>
          <sphereGeometry args={[0.085, 20, 20]} />
          <meshStandardMaterial color="#071a36" />
        </mesh>
      ))}

      {/* Smile / front bumper */}
      <mesh position={[0, -0.02, -1.145]}>
        <boxGeometry args={[0.92, 0.12, 0.08]} />
        <meshStandardMaterial color="#171717" />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.04, -1.19]}>
        <boxGeometry args={[0.48, 0.09, 0.025]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Headlights */}
      {[-0.5, 0.5].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.22, -1.17]}>
            <boxGeometry args={[0.2, 0.12, 0.06]} />
            <meshStandardMaterial
              color="#fff6c4"
              emissive="#fff0a0"
              emissiveIntensity={3}
            />
          </mesh>

          <pointLight
            position={[x, 0.2, -1.5]}
            color="#fff1b0"
            intensity={1.4}
            distance={4}
          />
        </group>
      ))}

      {/* Number 95 on roof */}
      <Text
        position={[0, 0.9, 0.08]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.29}
        color="#ffe65b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#a00000"
      >
        95
      </Text>

      {/* Racing decals on both sides */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.685, 0.2, 0.1]}
          rotation={[0, side === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.34}
            color="#ffe44d"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#8c0010"
          >
            95
          </Text>
        </group>
      ))}

      {/* Rear spoiler */}
      <mesh position={[0, 0.55, 1.02]}>
        <boxGeometry args={[1.5, 0.12, 0.25]} />
        <meshStandardMaterial color="#181818" metalness={0.4} />
      </mesh>

      {/* Wheels */}
      {[-1, 1].map((side) =>
        [-0.72, 0.72].map((z) => (
          <group
            key={`${side}-${z}`}
            ref={(element) => {
                const index =
                    (side === 1 ? 2 : 0) + (z > 0 ? 1 : 0);

                wheelRefs.current[index] = element!;
            }}
            position={[side * 0.67, -0.1, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.28, 0.28, 0.2, 24]} />
              <meshStandardMaterial color="#090909" roughness={0.95} />
            </mesh>

            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.215, 20]} />
              <meshStandardMaterial
                color="#b8b8b8"
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

function RacingCar({
  curve,
  onEventChange,
  eventCount,
}: {
  curve: THREE.CatmullRomCurve3;
  onEventChange: (index: number) => void;
  eventCount: number;
}) {
  const carRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const previousEvent = useRef(0);

  useFrame((_, delta) => {
    if (!carRef.current || eventCount === 0) return;

    // Continuous movement around the circuit.
    progress.current =
      (progress.current + delta * 0.018) % 1;

    const t = progress.current;

    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    carRef.current.position.set(
      point.x,
      0.48,
      point.z
    );

    carRef.current.rotation.y = Math.atan2(
      -tangent.x,
      -tangent.z
    );

    // Update the schedule only when a new checkpoint is crossed.
    const eventIndex = Math.floor(t * eventCount);

    if (eventIndex !== previousEvent.current) {
      previousEvent.current = eventIndex;
      onEventChange(eventIndex);
    }
  });

  return (
    <group ref={carRef}>
      <McQueen />
    </group>
  );
}

function Grandstands() {
  return (
    <group>
      {[[-12, -7], [12, -7], [-12, 7], [12, 7]].map(
        ([x, z], index) => (
          <group key={index} position={[x, 0, z]}>
            {[0, 1, 2].map((row) => (
              <mesh
                key={row}
                position={[0, 0.45 + row * 0.32, row * 0.45]}
              >
                <boxGeometry args={[3.5, 0.3, 0.48]} />
                <meshStandardMaterial
                  color={row === 2 ? "#d51d28" : "#343b43"}
                />
              </mesh>
            ))}
          </group>
        )
      )}
    </group>
  );
}

function StadiumLights() {
  return (
    <group>
      {[
        [-13, -11],
        [13, -11],
        [-13, 11],
        [13, 11],
      ].map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 6, 8]} />
            <meshStandardMaterial color="#555b61" />
          </mesh>

          <mesh position={[0, 6.1, 0]}>
            <boxGeometry args={[1.1, 0.25, 0.35]} />
            <meshStandardMaterial
              color="#fff6c8"
              emissive="#fff2b0"
              emissiveIntensity={3}
            />
          </mesh>

          <pointLight
            position={[0, 5.8, 0]}
            color="#fff0c4"
            intensity={index % 2 === 0 ? 30 : 22}
            distance={18}
          />
        </group>
      ))}
    </group>
  );
}

function Track({
  curve,
  events,
  selected,
  onEventChange,
}: {
  curve: THREE.CatmullRomCurve3;
  events: TrackEvent[];
  selected: number;
  onEventChange: (index: number) => void;
}) {
  const roadGeometry = useMemo(
    () => createRoadGeometry(curve, 4.2),
    [curve]
  );

  const centerMarks = useMemo(() => {
    return Array.from({ length: 90 }, (_, index) => {
      const t = index / 90;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      return {
        position: [point.x, 0.075, point.z] as [number, number, number],
        rotation: Math.atan2(tangent.x, tangent.z),
      };
    });
  }, [curve]);

  return (
    <>
      {/* Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#18211f" roughness={1} />
      </mesh>

      {/* Infield decoration */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.15, 0]}
      >
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#263d32" />
      </mesh>

      {/* Main asphalt */}
      <mesh
        geometry={roadGeometry}
        receiveShadow
      >
        <meshStandardMaterial
          color="#292e35"
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer and inner safety barriers */}
      {[2.35, -2.35].map((offset) => {
        const points = curve.getPoints(500).map((point, index) => {
          const tangent = curve.getTangentAt(index / 500);
          const side = new THREE.Vector3(
            -tangent.z,
            0,
            tangent.x
          ).normalize();

          return point.clone().addScaledVector(side, offset);
        });

        const barrierCurve = new THREE.CatmullRomCurve3(
          points,
          true
        );

        return (
          <mesh key={offset}>
            <tubeGeometry
              args={[barrierCurve, 500, 0.13, 8, true]}
            />
            <meshStandardMaterial
              color="#eeeeee"
              emissive="#333333"
            />
          </mesh>
        );
      })}

      {/* Red and white curbs */}
      {Array.from({ length: 120 }).map((_, index) => {
        const t = index / 120;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);

        return (
          <group
            key={index}
            position={[point.x, 0.09, point.z]}
            rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}
          >
            <mesh position={[0, 0, 2.17]}>
              <boxGeometry args={[0.2, 0.1, 0.35]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? "#e5232c" : "#f4f4f4"}
              />
            </mesh>

            <mesh position={[0, 0, -2.17]}>
              <boxGeometry args={[0.2, 0.1, 0.35]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? "#f4f4f4" : "#e5232c"}
              />
            </mesh>
          </group>
        );
      })}

      {/* Dashed center line */}
      {centerMarks.map((mark, index) => (
        <mesh
          key={index}
          position={mark.position}
          rotation={[0, mark.rotation, 0]}
        >
          <boxGeometry args={[0.07, 0.015, 0.35]} />
          <meshBasicMaterial color="#e6e4d7" />
        </mesh>
      ))}

      {/* Starting grid */}
      <mesh
        position={curve.getPointAt(0).toArray() as [number, number, number]}
      >
        <boxGeometry args={[3.8, 0.035, 0.3]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Event checkpoints and sponsor-style boards */}
      {events.map((event, index) => {
        const t = index / events.length;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const angle = Math.atan2(tangent.x, tangent.z);
        const isSelected = selected === index;

        return (
          <group
            key={`${event.title}-${index}`}
            position={[point.x, 0, point.z]}
            rotation={[0, angle, 0]}
          >
            {/* Checkpoint marker */}
            <mesh position={[0, 0.65, 2.9]}>
              <cylinderGeometry args={[0.09, 0.09, 1.3, 12]} />
              <meshStandardMaterial
                color={isSelected ? "#ffe34d" : "#e5232c"}
                emissive={isSelected ? "#ffe34d" : "#8b111a"}
                emissiveIntensity={isSelected ? 2 : 0.5}
              />
            </mesh>

            {/* Billboard */}
            <mesh position={[0, 2.1, 3.05]}>
              <boxGeometry args={[2.6, 1.25, 0.12]} />
              <meshStandardMaterial
                color={isSelected ? "#d9232c" : "#171d22"}
                emissive={isSelected ? "#8b111a" : "#090b0d"}
                emissiveIntensity={0.6}
              />
            </mesh>

            <Text
              position={[0, 2.35, 3.13]}
              fontSize={0.2}
              color="#ffe34d"
              anchorX="center"
              anchorY="middle"
              maxWidth={2.3}
              textAlign="center"
            >
              {event.title.toUpperCase()}
            </Text>

            <Text
              position={[0, 1.95, 3.13]}
              fontSize={0.13}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {event.time}
            </Text>

            <Text
              position={[0, 1.7, 3.13]}
              fontSize={0.1}
              color="#bfc8ce"
              anchorX="center"
              anchorY="middle"
              maxWidth={2.2}
              textAlign="center"
            >
              {event.venue}
            </Text>

            <pointLight
              position={[0, 2, 3.3]}
              color={isSelected ? "#ffe34d" : "#e5232c"}
              intensity={isSelected ? 5 : 1.5}
              distance={5}
            />
          </group>
        );
      })}

      <Grandstands />
      <StadiumLights />

      <RacingCar
        curve={curve}
        eventCount={events.length}
        onEventChange={onEventChange}
      />
    </>
  );
}

export default function RaceTrackScene({
  day,
  events,
  selected,
  onEventChange,
}: RaceTrackSceneProps) {
  const curve = useMemo(() => {
    const points = circuitLayouts[day] ?? circuitLayouts["DAY 01"];

    return new THREE.CatmullRomCurve3(
      points,
      true,
      "catmullrom",
      0.5
    );
  }, [day]);

  return (
    <div className="race-scene">
      <Canvas
        camera={{
          position: [0, 22, 25],
          fov: 43,
        }}
        dpr={[1, 1.5]}
        shadows
      >
        <color attach="background" args={["#101416"]} />
        <fog attach="fog" args={["#101416", 30, 65]} />

        <ambientLight intensity={1.1} />

        <directionalLight
          position={[8, 18, 8]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <pointLight
          position={[-10, 5, -5]}
          color="#e5232c"
          intensity={28}
          distance={25}
        />

        <pointLight
          position={[10, 5, 8]}
          color="#ffe34d"
          intensity={20}
          distance={25}
        />

        <Track
          curve={curve}
          events={events}
          selected={selected}
          onEventChange={onEventChange}
        />
      </Canvas>
    </div>
  );
}
