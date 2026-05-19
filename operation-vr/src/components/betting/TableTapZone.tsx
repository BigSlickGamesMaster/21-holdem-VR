import { useState } from 'react'
import { CanvasLabel } from '../vr/CanvasLabel'

type TableTapZoneProps = {
  position: [number, number, number]
  label: string
  doubleTap?: boolean
  onTap: () => void
}

export function TableTapZone({ position, label, doubleTap = false, onTap }: TableTapZoneProps) {
  const [hovered, setHovered] = useState(false)
  const [armed, setArmed] = useState(false)
  const [lastTapAt, setLastTapAt] = useState(0)

  function handleTap() {
    if (!doubleTap) {
      onTap()
      return
    }

    const now = performance.now()
    if (now - lastTapAt <= 520) {
      setArmed(false)
      setLastTapAt(0)
      onTap()
      return
    }

    setArmed(true)
    setLastTapAt(now)
    window.setTimeout(() => setArmed(false), 540)
  }

  return (
    <group position={position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(event) => {
          event.stopPropagation()
          handleTap()
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[0.64, 0.24]} />
        <meshStandardMaterial
          color={hovered ? '#77ffa5' : '#5bf08d'}
          emissive="#22b958"
          emissiveIntensity={armed ? 0.75 : hovered ? 0.58 : 0.34}
          opacity={armed ? 0.58 : hovered ? 0.46 : 0.3}
          transparent
        />
      </mesh>
      <CanvasLabel
        text={armed ? 'Tap Again' : label}
        position={[0, 0.01, 0]}
        width={0.58}
        height={0.08}
        fontSize={40}
        background={hovered ? '#77ffa5' : '#5bf08d'}
        color="#0d2214"
      />
    </group>
  )
}
