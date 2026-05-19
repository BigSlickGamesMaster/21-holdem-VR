import { createChipPositionManager, type ChipStackLayout } from './chipPositionManager'
import { CanvasTexture, LinearFilter } from 'three'
import { useMemo } from 'react'

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
        <Chip
          key={index}
          position={placement.position}
          rotation={placement.rotation}
          color={placement.chip.color}
          value={placement.chip.value}
        />
      ))}
    </group>
  )
}

export function Chip({
  position,
  rotation = [0, 0, 0],
  color,
  value,
  radius = 0.045,
  height = 0.01,
  emissive = '#000000',
  emissiveIntensity = 0,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  color: string
  value: number
  radius?: number
  height?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  const denomination = useMemo(() => createDenominationTexture(value), [value])

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 36]} />
        <meshStandardMaterial color={color} roughness={0.55} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, height / 2 + 0.0008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[radius * 1.28, radius * 1.28]} />
        <meshBasicMaterial map={denomination} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

function createDenominationTexture(value: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(255, 255, 255, 0.86)'
  context.beginPath()
  context.arc(128, 128, 82, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = 'rgba(20, 20, 22, 0.72)'
  context.lineWidth = 10
  context.stroke()

  context.fillStyle = '#15171c'
  context.font = `800 ${value < 1 ? 82 : 96}px Arial, Helvetica, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(value < 1 ? '1/2' : String(value), 128, 132)

  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}
