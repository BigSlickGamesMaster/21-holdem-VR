import { createChipPositionManager, type ChipStackLayout } from './chipPositionManager'

type ChipStackProps = {
  amount: number
  position: [number, number, number]
  layout?: ChipStackLayout
}

const chipPositionManager = createChipPositionManager()

export function ChipStack({ amount, position, layout = 'player' }: ChipStackProps) {
  const placements = chipPositionManager.placementsForAmount(amount, layout)

  return (
    <group position={position}>
      {placements.map((placement, index) => (
        <Chip key={index} position={placement.position} rotation={placement.rotation} color={placement.chip.color} />
      ))}
    </group>
  )
}

export function Chip({
  position,
  rotation = [0, 0, 0],
  color,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  color: string
}) {
  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation}>
      <cylinderGeometry args={[0.045, 0.045, 0.01, 28]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  )
}
