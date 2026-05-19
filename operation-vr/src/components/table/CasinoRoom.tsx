import { CanvasLabel } from '../vr/CanvasLabel'

export function CasinoRoom() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#211b27" roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[0, 1.45, -3.15]}>
        <boxGeometry args={[7.2, 2.9, 0.12]} />
        <meshStandardMaterial color="#251a2e" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[-3.6, 1.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6.3, 2.9, 0.12]} />
        <meshStandardMaterial color="#201827" roughness={0.82} />
      </mesh>
      <mesh receiveShadow position={[3.6, 1.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6.3, 2.9, 0.12]} />
        <meshStandardMaterial color="#201827" roughness={0.82} />
      </mesh>

      <mesh position={[0, 2.92, 0]}>
        <boxGeometry args={[7.2, 0.08, 6.3]} />
        <meshStandardMaterial color="#15131b" roughness={0.86} />
      </mesh>

      <CanvasLabel
        text="21 HOLD'EM"
        position={[0, 1.92, -3.08]}
        rotation={[0, 0, 0]}
        width={1.65}
        height={0.34}
        fontSize={112}
        background="#071527"
        color="#f7f9ff"
      />

      {[-2.35, 2.35].map((x) => (
        <group key={`wall-sconce-${x}`} position={[x, 1.72, -3.06]}>
          <mesh>
            <sphereGeometry args={[0.12, 24, 16]} />
            <meshStandardMaterial color="#ffd28a" emissive="#ffae45" emissiveIntensity={1.8} roughness={0.28} />
          </mesh>
          <pointLight color="#ffc47a" intensity={1.6} distance={2.9} />
        </group>
      ))}

      {[-3.05, -1.05, 1.05, 3.05].map((x) => (
        <group key={`ceiling-light-${x}`} position={[x, 2.78, -0.65]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.24, 0.08, 32]} />
            <meshStandardMaterial color="#f0d29a" emissive="#d8892e" emissiveIntensity={1.2} roughness={0.35} />
          </mesh>
          <pointLight color="#ffc06a" intensity={0.95} distance={2.2} />
        </group>
      ))}

      {[-3.05, 3.05].map((x) => (
        <group key={`column-${x}`} position={[x, 0.78, -1.45]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.16, 1.56, 28]} />
            <meshStandardMaterial color="#6d4326" roughness={0.5} metalness={0.12} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 28]} />
            <meshStandardMaterial color="#c58a3e" roughness={0.34} metalness={0.28} />
          </mesh>
        </group>
      ))}

      <CarpetPattern />
    </group>
  )
}

function CarpetPattern() {
  return (
    <group position={[0, 0.002, 0]}>
      {Array.from({ length: 9 }).map((_, index) => {
        const offset = -4 + index
        return (
          <mesh key={`carpet-line-x-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0, 0]}>
            <planeGeometry args={[0.018, 8]} />
            <meshBasicMaterial color="#4b3558" transparent opacity={0.22} depthWrite={false} />
          </mesh>
        )
      })}
      {Array.from({ length: 9 }).map((_, index) => {
        const offset = -4 + index
        return (
          <mesh key={`carpet-line-z-${index}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0, offset]}>
            <planeGeometry args={[0.018, 8]} />
            <meshBasicMaterial color="#4b3558" transparent opacity={0.16} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}
