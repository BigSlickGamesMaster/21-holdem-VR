import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Group, Vector3 } from 'three'
import type { Card } from '../../game/types/cards'
import { CanvasLabel } from '../vr/CanvasLabel'
import { CardView } from './CardView'

type DealtCardProps = {
  card: Card
  target: [number, number, number]
  dealKey: string
  delay?: number
  faceUp?: boolean
  rotationY?: number
  mode?: 'deal' | 'throw'
  from?: [number, number, number]
  visible?: boolean
  canPickUpToFold?: boolean
  foldLineZ?: number
  onFoldRelease?: () => void
  canHoverToStand?: boolean
  onStandHover?: () => void
  warningGlow?: boolean
}

const deckPosition = new Vector3(0.52, 1.02, 0.12)
const standHoverDuration = 1.2

export function DealtCard({
  card,
  target,
  dealKey,
  delay = 0,
  faceUp = true,
  rotationY = 0,
  mode = 'deal',
  from,
  visible = true,
  canPickUpToFold = false,
  foldLineZ = 0,
  onFoldRelease,
  canHoverToStand = false,
  onStandHover,
  warningGlow = false,
}: DealtCardProps) {
  const groupRef = useRef<Group>(null)
  const startTimeRef = useRef<number | null>(null)
  const grabbedRef = useRef(false)
  const standHoverStartRef = useRef<number | null>(null)
  const standFiredRef = useRef(false)
  const [standProgress, setStandProgress] = useState(0)
  const targetPosition = useRef(new Vector3(...target))
  const startPosition = useRef(from ? new Vector3(...from) : deckPosition.clone())
  const [targetX, targetY, targetZ] = target
  const fromX = from?.[0]
  const fromY = from?.[1]
  const fromZ = from?.[2]

  useEffect(() => {
    startTimeRef.current = null
    standHoverStartRef.current = null
    standFiredRef.current = false
    targetPosition.current.set(targetX, targetY, targetZ)
    startPosition.current.set(fromX ?? deckPosition.x, fromY ?? deckPosition.y, fromZ ?? deckPosition.z)
    groupRef.current?.position.copy(startPosition.current)
  }, [dealKey, fromX, fromY, fromZ, targetX, targetY, targetZ])

  useFrame((state) => {
    const group = groupRef.current
    if (!group) {
      return
    }

    if (standHoverStartRef.current !== null && !grabbedRef.current) {
      const hoverProgress = Math.min((performance.now() / 1000 - standHoverStartRef.current) / standHoverDuration, 1)
      setStandProgress(hoverProgress)

      if (hoverProgress >= 1 && !standFiredRef.current) {
        standFiredRef.current = true
        pulseControllers(0.55, 70)
        onStandHover?.()
      }
    }

    if (grabbedRef.current) {
      standHoverStartRef.current = null
      standFiredRef.current = false
      setStandProgress(0)
      group.position.y += (targetY + 0.075 - group.position.y) * 0.35
      group.rotation.x = -0.18
      group.rotation.z = 0
      return
    }

    startTimeRef.current ??= state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTimeRef.current - delay

    if (elapsed <= 0) {
      group.position.copy(startPosition.current)
      return
    }

    const progress = Math.min(elapsed / (mode === 'throw' ? 0.48 : 0.42), 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    group.position.lerpVectors(startPosition.current, targetPosition.current, eased)
    group.position.y += Math.sin(progress * Math.PI) * (mode === 'throw' ? 0.24 : 0.18)
    group.rotation.x = mode === 'throw' ? Math.sin(progress * Math.PI) * 0.45 : 0
    group.rotation.z = mode === 'throw' ? progress * Math.PI * 1.4 : 0
  })

  return (
    <group
      ref={groupRef}
      visible={visible}
      rotation={[0, rotationY, 0]}
      onPointerDown={(event) => {
        if (!canPickUpToFold) {
          return
        }

        event.stopPropagation()
        const pointerTarget = event.target as Element | null
        pointerTarget?.setPointerCapture?.(event.pointerId)
        standHoverStartRef.current = null
        standFiredRef.current = false
        setStandProgress(0)
        grabbedRef.current = true
      }}
      onPointerEnter={(event) => {
        if (!canHoverToStand || grabbedRef.current) {
          return
        }

        event.stopPropagation()
        standHoverStartRef.current = performance.now() / 1000
        standFiredRef.current = false
        setStandProgress(0)
        pulseControllers(0.16, 25)
      }}
      onPointerMove={(event) => {
        const group = groupRef.current
        if (!group || !grabbedRef.current) {
          return
        }

        event.stopPropagation()
        group.position.set(event.point.x, targetY + 0.075, event.point.z)
      }}
      onPointerUp={(event) => {
        const group = groupRef.current
        if (!group || !grabbedRef.current) {
          return
        }

        event.stopPropagation()
        const pointerTarget = event.target as Element | null
        pointerTarget?.releasePointerCapture?.(event.pointerId)
        grabbedRef.current = false

        if (group.position.z <= foldLineZ) {
          onFoldRelease?.()
        }
      }}
      onPointerCancel={(event) => {
        event.stopPropagation()
        grabbedRef.current = false
        standHoverStartRef.current = null
        standFiredRef.current = false
        setStandProgress(0)
      }}
      onPointerLeave={() => {
        if (grabbedRef.current) {
          return
        }

        standHoverStartRef.current = null
        standFiredRef.current = false
        setStandProgress(0)
      }}
    >
      {warningGlow ? (
        <mesh position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 0.28]} />
          <meshBasicMaterial color="#ff3b35" transparent opacity={0.24} depthWrite={false} />
        </mesh>
      ) : null}
      {canHoverToStand ? (
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.19 + standProgress * 0.03, 0.25 + standProgress * 0.03]} />
          <meshBasicMaterial color="#4f8cff" transparent opacity={0.1 + standProgress * 0.34} depthWrite={false} />
        </mesh>
      ) : null}
      {canHoverToStand && standProgress > 0 ? (
        <group position={[0, 0.007, -0.16]} scale={0.35 + standProgress * 0.95}>
          <CanvasLabel
            text="STAND"
            position={[0, 0, 0]}
            width={0.22}
            height={0.065}
            fontSize={96}
            background="rgba(0, 0, 0, 0)"
            color="#8db8ff"
          />
        </group>
      ) : null}
      <CardView card={card} position={[0, 0, 0]} faceUp={faceUp} />
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
