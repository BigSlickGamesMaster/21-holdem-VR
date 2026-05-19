import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'

type PressureStandButtonProps = {
  position: [number, number, number]
  scale?: number
  onStand: () => void
}

const pressDuration = 0.65

export function PressureStandButton({ position, scale = 1, onStand }: PressureStandButtonProps) {
  const buttonRef = useRef<Group>(null)
  const pressStartRef = useRef<number | null>(null)
  const firedRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [pressing, setPressing] = useState(false)

  useFrame((state) => {
    const group = buttonRef.current
    if (!group) {
      return
    }

    if (!pressing) {
      group.position.y += (0 - group.position.y) * 0.24
      return
    }

    pressStartRef.current ??= state.clock.elapsedTime

    const nextProgress = Math.min((state.clock.elapsedTime - pressStartRef.current) / pressDuration, 1)
    setProgress(nextProgress)
    group.position.y = -0.035 * nextProgress

    if (nextProgress >= 1 && !firedRef.current) {
      firedRef.current = true
      pulseControllers(0.65, 80)
      onStand()
    } else if (nextProgress > 0.48 && !firedRef.current) {
      pulseControllers(0.22, 25)
    }
  })

  function startPress() {
    if (pressing) {
      return
    }

    setPressing(true)
    firedRef.current = false
    pressStartRef.current = null
    pulseControllers(0.18, 30)
  }

  function releasePress() {
    if (!firedRef.current) {
      setProgress(0)
    }

    setPressing(false)
    pressStartRef.current = null
  }

  return (
    <group position={position} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.18, 40]} />
        <meshStandardMaterial color="#2d6ef1" emissive="#1648c5" emissiveIntensity={0.35} transparent opacity={0.6} />
      </mesh>
      <group ref={buttonRef}>
        <mesh
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => {
            event.stopPropagation()
            startPress()
          }}
          onPointerUp={(event) => {
            event.stopPropagation()
            releasePress()
          }}
          onPointerLeave={releasePress}
        >
          <cylinderGeometry args={[0.14, 0.14, 0.045, 40]} />
          <meshStandardMaterial
            color={pressing ? '#3b7df8' : '#1f57d2'}
            emissive="#1648c5"
            emissiveIntensity={0.24 + progress * 0.5}
            roughness={0.34}
          />
        </mesh>
      </group>
    </group>
  )
}

function pulseControllers(intensity: number, duration: number) {
  const gamepads = navigator.getGamepads?.() ?? []

  gamepads.forEach((gamepad) => {
    gamepad?.hapticActuators?.forEach((actuator) => {
      void actuator.pulse(intensity, duration).catch(() => undefined)
    })
  })
}
