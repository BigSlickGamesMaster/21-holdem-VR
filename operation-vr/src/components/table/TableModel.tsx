import { Path, Shape } from 'three'

function roundedTableShape(width: number, depth: number, radius: number) {
  const x = width / 2
  const z = depth / 2
  const shape = new Shape()

  shape.moveTo(-x + radius, -z)
  shape.lineTo(x - radius, -z)
  shape.quadraticCurveTo(x, -z, x, -z + radius)
  shape.lineTo(x, z - radius)
  shape.quadraticCurveTo(x, z, x - radius, z)
  shape.lineTo(-x + radius, z)
  shape.quadraticCurveTo(-x, z, -x, z - radius)
  shape.lineTo(-x, -z + radius)
  shape.quadraticCurveTo(-x, -z, -x + radius, -z)

  return shape
}

function racetrackTableShape(width: number, depth: number) {
  const x = width / 2
  const z = depth / 2
  const radius = z
  const straight = x - radius
  const shape = new Shape()

  shape.moveTo(-straight, -z)
  shape.lineTo(straight, -z)
  shape.absarc(straight, 0, radius, -Math.PI / 2, Math.PI / 2, false)
  shape.lineTo(-straight, z)
  shape.absarc(-straight, 0, radius, Math.PI / 2, Math.PI * 1.5, false)

  return shape
}

function racetrackHolePath(width: number, depth: number) {
  const x = width / 2
  const z = depth / 2
  const radius = z
  const straight = x - radius
  const path = new Path()

  path.moveTo(-straight, -z)
  path.lineTo(straight, -z)
  path.absarc(straight, 0, radius, -Math.PI / 2, Math.PI / 2, false)
  path.lineTo(-straight, z)
  path.absarc(-straight, 0, radius, Math.PI / 2, Math.PI * 1.5, false)

  return path
}

function racetrackRingShape(outerWidth: number, outerDepth: number, innerWidth: number, innerDepth: number) {
  const shape = racetrackTableShape(outerWidth, outerDepth)
  shape.holes.push(racetrackHolePath(innerWidth, innerDepth))
  return shape
}

function RoundedLayer({
  width,
  depth,
  height,
  y,
  radius,
  color,
  roughness,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
}: {
  width: number
  depth: number
  height: number
  y: number
  radius: number
  color: string
  roughness: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <mesh receiveShadow castShadow position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry
        args={[
          roundedTableShape(width, depth, radius),
          {
            depth: height,
            bevelEnabled: true,
            bevelSegments: 8,
            bevelSize: Math.min(height * 0.38, 0.035),
            bevelThickness: Math.min(height * 0.28, 0.025),
          },
        ]}
      />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  )
}

function RacetrackLayer({
  width,
  depth,
  height,
  y,
  color,
  roughness,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
}: {
  width: number
  depth: number
  height: number
  y: number
  color: string
  roughness: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <mesh receiveShadow castShadow position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry
        args={[
          racetrackTableShape(width, depth),
          {
            depth: height,
            bevelEnabled: true,
            bevelSegments: 10,
            bevelSize: Math.min(height * 0.38, 0.035),
            bevelThickness: Math.min(height * 0.28, 0.025),
          },
        ]}
      />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  )
}

function RacetrackRingLayer({
  outerWidth,
  outerDepth,
  innerWidth,
  innerDepth,
  height,
  y,
  color,
  roughness,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
}: {
  outerWidth: number
  outerDepth: number
  innerWidth: number
  innerDepth: number
  height: number
  y: number
  color: string
  roughness: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <mesh receiveShadow castShadow position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry
        args={[
          racetrackRingShape(outerWidth, outerDepth, innerWidth, innerDepth),
          {
            depth: height,
            bevelEnabled: true,
            bevelSegments: 10,
            bevelSize: Math.min(height * 0.42, 0.028),
            bevelThickness: Math.min(height * 0.34, 0.02),
          },
        ]}
      />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  )
}

export function TableModel() {
  return (
    <group>
      <RoundedLayer
        width={2.52}
        depth={1.1}
        height={0.34}
        y={0.18}
        radius={0.2}
        color="#5f260d"
        roughness={0.42}
        metalness={0.08}
        emissive="#2b1106"
        emissiveIntensity={0.06}
      />
      <RoundedLayer
        width={2.62}
        depth={1.18}
        height={0.055}
        y={0.49}
        radius={0.22}
        color="#d39034"
        roughness={0.24}
        metalness={0.42}
        emissive="#6d2b0c"
        emissiveIntensity={0.12}
      />
      <RacetrackLayer
        width={3.5}
        depth={1.92}
        height={0.3}
        y={0.42}
        color="#6e2b0d"
        roughness={0.36}
        metalness={0.08}
        emissive="#2c1005"
        emissiveIntensity={0.05}
      />
      <RacetrackRingLayer
        outerWidth={3.58}
        outerDepth={2.08}
        innerWidth={3.44}
        innerDepth={1.94}
        height={0.045}
        y={0.69}
        color="#f0c16d"
        roughness={0.18}
        metalness={0.62}
        emissive="#c37120"
        emissiveIntensity={0.2}
      />
      <RacetrackRingLayer
        outerWidth={3.5}
        outerDepth={2}
        innerWidth={3.28}
        innerDepth={1.78}
        height={0.16}
        y={0.72}
        color="#c77a24"
        roughness={0.2}
        metalness={0.48}
        emissive="#73300e"
        emissiveIntensity={0.14}
      />
      <RacetrackRingLayer
        outerWidth={3.28}
        outerDepth={1.78}
        innerWidth={3.2}
        innerDepth={1.7}
        height={0.028}
        y={0.81}
        color="#4c63ff"
        roughness={0.18}
        metalness={0.1}
        emissive="#233bff"
        emissiveIntensity={0.85}
      />
      <RacetrackLayer
        width={3.24}
        depth={1.74}
        height={0.04}
        y={0.785}
        color="#496fa7"
        roughness={0.88}
        emissive="#263f66"
        emissiveIntensity={0.08}
      />
      <RailStuds />
    </group>
  )
}

function RailStuds() {
  const positions: Array<[number, number, number]> = [
    [-1.36, 0.84, 0.82],
    [-0.72, 0.84, 0.92],
    [0, 0.84, 0.96],
    [0.72, 0.84, 0.92],
    [1.36, 0.84, 0.82],
    [-1.36, 0.84, -0.82],
    [-0.72, 0.84, -0.92],
    [0, 0.84, -0.96],
    [0.72, 0.84, -0.92],
    [1.36, 0.84, -0.82],
  ]

  return (
    <group>
      {positions.map((position, index) => (
        <mesh key={`rail-stud-${index}`} position={position} castShadow receiveShadow>
          <sphereGeometry args={[0.035, 18, 12]} />
          <meshStandardMaterial color="#f2c978" roughness={0.18} metalness={0.72} emissive="#8a4c15" emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  )
}
