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

      <BackBar />
      <WallArt />
      <SideTables />
      <VelvetRopes />

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

function BackBar() {
  return (
    <group position={[0, 0, -3.02]}>
      <mesh castShadow receiveShadow position={[0, 0.64, 0.04]}>
        <boxGeometry args={[2.45, 0.72, 0.18]} />
        <meshStandardMaterial color="#3a2418" roughness={0.54} metalness={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.09, 0.02]}>
        <boxGeometry args={[2.7, 0.08, 0.22]} />
        <meshStandardMaterial color="#b8793f" roughness={0.34} metalness={0.18} />
      </mesh>
      {[0.78, 1.06, 1.34].map((y) => (
        <mesh key={`bar-shelf-${y}`} receiveShadow position={[0, y, 0.105]}>
          <boxGeometry args={[2.25, 0.035, 0.08]} />
          <meshStandardMaterial color="#c58a3e" roughness={0.38} metalness={0.2} />
        </mesh>
      ))}
      {Array.from({ length: 14 }).map((_, index) => {
        const shelf = Math.floor(index / 5)
        const x = -0.86 + (index % 5) * 0.43 + (shelf === 2 ? 0.2 : 0)
        const y = 0.84 + shelf * 0.28
        const colors = ['#7ad7ff', '#9ee07a', '#ffca6a', '#e35d5d', '#d8e2f0']

        return (
          <group key={`bar-bottle-${index}`} position={[x, y, 0.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.045, 0.16, 18]} />
              <meshStandardMaterial color={colors[index % colors.length]} roughness={0.2} metalness={0.08} transparent opacity={0.82} />
            </mesh>
            <mesh position={[0, 0.105, 0]}>
              <cylinderGeometry args={[0.018, 0.021, 0.07, 16]} />
              <meshStandardMaterial color="#e9edf4" roughness={0.28} metalness={0.05} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function WallArt() {
  return (
    <group>
      {[
        { x: -2.1, text: 'BLACKJACK', color: '#102a24' },
        { x: 2.1, text: 'NO LIMIT', color: '#2a1717' },
      ].map((frame) => (
        <group key={frame.text} position={[frame.x, 1.28, -3.075]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.78, 0.5, 0.035]} />
            <meshStandardMaterial color="#c58a3e" roughness={0.36} metalness={0.22} />
          </mesh>
          <CanvasLabel
            text={frame.text}
            position={[0, 0, 0.021]}
            rotation={[0, 0, 0]}
            width={0.67}
            height={0.39}
            fontSize={74}
            background={frame.color}
            color="#f4f1e8"
          />
        </group>
      ))}
    </group>
  )
}

function SideTables() {
  return (
    <group>
      {[-2.55, 2.55].map((x) => (
        <group key={`side-table-${x}`} position={[x, 0, 0.82]}>
          <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.24, 0.28, 0.08, 32]} />
            <meshStandardMaterial color="#5c3320" roughness={0.48} metalness={0.12} />
          </mesh>
          <mesh castShadow position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.42, 18]} />
            <meshStandardMaterial color="#c58a3e" roughness={0.32} metalness={0.3} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.09, 0.485, -0.02]}>
            <cylinderGeometry args={[0.055, 0.055, 0.07, 24]} />
            <meshStandardMaterial color="#15171c" roughness={0.52} />
          </mesh>
          <mesh position={[-0.08, 0.49, 0.05]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.1, 0.008, 0.14]} />
            <meshStandardMaterial color="#f7f9ff" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function VelvetRopes() {
  return (
    <group>
      {[-1.75, -0.58, 0.58, 1.75].map((x) => (
        <group key={`rope-post-${x}`} position={[x, 0, 1.82]}>
          <mesh castShadow position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 0.72, 18]} />
            <meshStandardMaterial color="#d6a34e" roughness={0.3} metalness={0.45} />
          </mesh>
          <mesh castShadow position={[0, 0.74, 0]}>
            <sphereGeometry args={[0.06, 20, 14]} />
            <meshStandardMaterial color="#d6a34e" roughness={0.26} metalness={0.5} />
          </mesh>
        </group>
      ))}
      {[-1.165, 0, 1.165].map((x) => (
        <mesh key={`velvet-rope-${x}`} position={[x, 0.67, 1.82]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 1.16, 18]} />
          <meshStandardMaterial color="#8a1626" roughness={0.58} />
        </mesh>
      ))}
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
