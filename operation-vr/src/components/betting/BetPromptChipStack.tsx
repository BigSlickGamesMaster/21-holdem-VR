import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import { CanvasLabel } from '../vr/CanvasLabel'

type BetPromptChipStackProps = {
  position: [number, number, number]
  onSelect: () => void
}

const chipCount = 8
const chipSpacing = 0.014

export function BetPromptChipStack({ position, onSelect }: BetPromptChipStackProps) {
  const [hovered, setHovered] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const chipRefs = useRef<Array<Group | null>>([])

  useFrame((state) => {
    startTimeRef.current ??= state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTimeRef.current

    chipRefs.current.forEach((chip, index) => {
      if (!chip) {
        return
      }

      const delay = index * 0.05
      const progress = Math.max(0, Math.min(1, (elapsed - delay) / 0.54))
      const eased = 1 - Math.pow(1 - progress, 3)
      const sourceX = -0.26
      const sourceY = -0.04
      const sourceZ = 0.3
      const targetY = index * chipSpacing + Math.sin(state.clock.elapsedTime * 2.4 + index) * 0.002
      const hoverLift = hovered ? 0.012 : 0

      chip.position.x = sourceX * (1 - eased) + Math.sin((progress + index * 0.08) * Math.PI) * 0.045
      chip.position.y = sourceY * (1 - eased) + (targetY + hoverLift) * eased + Math.sin(progress * Math.PI) * 0.075
      chip.position.z = sourceZ * (1 - eased) + Math.cos((progress + index * 0.12) * Math.PI) * 0.03
      chip.rotation.y = progress * Math.PI * 2 + state.clock.elapsedTime * (hovered ? 0.8 : 0.28)
    })
  })

  return (
    <group position={position}>
      <mesh
        position={[0, 0.06, 0]}
        onClick={(event) => {
          event.stopPropagation()
          onSelect()
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.105, 0.105, 0.18, 32]} />
        <meshBasicMaterial color="#ffffff" opacity={0.02} transparent />
      </mesh>
      {Array.from({ length: chipCount }).map((_, index) => (
        <group key={index} ref={(node) => { chipRefs.current[index] = node }}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.066, 0.066, 0.011, 36]} />
            <meshStandardMaterial
              color={hovered || index >= chipCount - 2 ? '#5bf08d' : index % 2 === 0 ? '#d6c27a' : '#b74343'}
              emissive={hovered || index >= chipCount - 2 ? '#22b958' : '#000000'}
              emissiveIntensity={hovered ? 0.72 : index >= chipCount - 2 ? 0.38 : 0}
              roughness={0.42}
            />
          </mesh>
        </group>
      ))}
      <CanvasLabel
        text="Raise"
        position={[0, 0.16, 0.02]}
        rotation={[-0.9, 0, 0]}
        width={0.26}
        height={0.075}
        fontSize={42}
        background={hovered ? '#77ffa5' : '#5bf08d'}
        color="#0d2214"
      />
    </group>
  )
}
