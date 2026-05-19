import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import { CanvasLabel } from '../vr/CanvasLabel'

type PressureFoldButtonProps = {
  position: [number, number, number]
  scale?: number
  onFold: () => void
}

const pressDuration = 0.75

export function PressureFoldButton({ position, scale = 1, onFold }: PressureFoldButtonProps) {
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
      group.position.y += (0 - group.position.y) * 0.22
      return
    }

    pressStartRef.current ??= state.clock.elapsedTime
    const nextProgress = Math.min((state.clock.elapsedTime - pressStartRef.current) / pressDuration, 1)
    setProgress(nextProgress)
    group.position.y = -0.045 * nextProgress

    if (nextProgress >= 1 && !firedRef.current) {
      firedRef.current = true
      pulseControllers(0.8, 95)
      onFold()
    } else if (nextProgress > 0.55 && !firedRef.current) {
      pulseControllers(0.28, 28)
    }
  })

  function startPress() {
    if (pressing) {
      return
    }

    setPressing(true)
    firedRef.current = false
    pressStartRef.current = null
    pulseControllers(0.2, 35)
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
        <ringGeometry args={[0.16, 0.2, 48]} />
        <meshStandardMaterial color="#5a0f12" emissive="#7a1116" emissiveIntensity={0.45} roughness={0.32} />
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
          <sphereGeometry args={[0.135, 40, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial
            color={pressing ? '#ff3b3b' : '#d81f27'}
            emissive="#9b1018"
            emissiveIntensity={0.25 + progress * 0.55}
            roughness={0.22}
            metalness={0.12}
          />
        </mesh>
        <CanvasLabel
          text={progress > 0 ? `${Math.round(progress * 100)}%` : 'FOLD'}
          position={[0, 0.06, 0]}
          width={0.28}
          height={0.07}
          fontSize={48}
          background={pressing ? '#ff3b3b' : '#d81f27'}
        />
      </group>
      <CanvasLabel
        text="Hold Fold"
        position={[0, 0.016, 0.21]}
        width={0.34}
        height={0.075}
        fontSize={38}
        background="#7a1116"
      />
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
