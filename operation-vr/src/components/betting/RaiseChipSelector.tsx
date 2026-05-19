import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { chipPiecesForAmount, chipValueForPieces } from '../../game/rules/chipInventory'
import { formatChips } from '../../game/rules/formatChips'
import type { RaiseOptions } from '../../game/rules/raiseOptions'
import { Chip } from '../chips/ChipStack'
import { CanvasLabel } from '../vr/CanvasLabel'

export type BetChipSelection =
  | { type: 'call'; amount: number; label: string }
  | { type: 'raise'; amount: number; label: string }

type RaiseTier = 'call' | 'min' | 'halfPot' | 'pot'

type RaiseChipSelectorProps = {
  options: RaiseOptions
  callAmount?: number
  callAllIn?: boolean
  position: [number, number, number]
  onPreview: (selection: BetChipSelection) => void
  onSelect: (selection: BetChipSelection) => void
}

const chipSpacing = 0.014

export function RaiseChipSelector({ options, callAmount, callAllIn = false, position, onPreview, onSelect }: RaiseChipSelectorProps) {
  const [tier, setTier] = useState<RaiseTier>(callAmount ? 'call' : 'min')
  const startTimeRef = useRef<number | null>(null)
  const chipRefs = useRef<Array<Group | null>>([])
  const stackAmount = Math.max(options.pot, options.halfPot, options.min, callAmount ?? 0)
  const stackChips = chipPiecesForAmount(stackAmount)
  const hitHeight = Math.max(0.12, stackChips.length * chipSpacing + 0.06)
  const selection = selectionForTier(options, tier, callAmount)
  const selectionAllIn = selection.type === 'call' ? callAllIn : selection.amount >= options.max
  const litChips = litChipsForAmount(stackChips, selection.amount)

  useEffect(() => {
    onPreview(selectionForTier(options, callAmount ? 'call' : 'min', callAmount))
  }, [callAmount, onPreview, options])

  function previewFromPointer(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()

    const nextTier = tierFromWorldY(event.point.y, position[1], hitHeight, Boolean(callAmount))
    setTier(nextTier)
    onPreview(selectionForTier(options, nextTier, callAmount))
  }

  function selectCurrent(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    onSelect(selection)
  }

  useFrame((state) => {
    startTimeRef.current ??= state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTimeRef.current

    chipRefs.current.forEach((chip, index) => {
      if (!chip) {
        return
      }

      const delay = index * 0.045
      const progress = Math.max(0, Math.min(1, (elapsed - delay) / 0.52))
      const eased = 1 - Math.pow(1 - progress, 3)
      const sourceX = -0.2
      const sourceY = -0.035
      const sourceZ = 0.34
      const baseX = Math.sin(index * 0.82) * 0.008
      const baseZ = Math.cos(index * 0.72) * 0.008
      const finalX = baseX
      const finalZ = baseZ
      const targetY = index * chipSpacing

      chip.position.x = sourceX * (1 - eased) + finalX * eased + Math.sin((progress + index * 0.07) * Math.PI) * 0.038 * (1 - eased)
      chip.position.y = sourceY * (1 - eased) + targetY * eased + Math.sin(progress * Math.PI) * 0.08
      chip.position.z = sourceZ * (1 - eased) + finalZ * eased + Math.cos((progress + index * 0.11) * Math.PI) * 0.026 * (1 - eased)
      chip.rotation.y = progress < 1 ? progress * Math.PI * 2 : Math.PI * 2
      chip.scale.setScalar(1)
    })
  })

  return (
    <group position={position}>
      <CanvasLabel
        text={selection.label}
        position={[0, 0.012, 0.19]}
        width={0.48}
        height={0.105}
        fontSize={88}
        background="rgba(0, 0, 0, 0)"
        color={selectionAllIn ? '#ffec8a' : '#f7f9ff'}
      />
      <mesh
        position={[0, hitHeight / 2 - 0.012, 0]}
        onClick={selectCurrent}
        onPointerEnter={previewFromPointer}
        onPointerMove={previewFromPointer}
      >
        <cylinderGeometry args={[0.09, 0.09, hitHeight, 32]} />
        <meshBasicMaterial color="#ffffff" opacity={0.02} transparent />
      </mesh>
      {stackChips.map((chip, index) => {
        const highlighted = index >= stackChips.length - litChips
        return (
          <group key={index} ref={(node) => { chipRefs.current[index] = node }}>
            <Chip
              position={[0, 0, 0]}
              color={highlighted ? chipColor(tier) : chip.color}
              value={chip.value}
              radius={0.07}
              height={0.011}
              emissive={highlighted ? chipGlow(tier) : '#000000'}
              emissiveIntensity={highlighted ? 0.72 : 0}
            />
          </group>
        )
      })}
      {selectionAllIn ? (
        <CanvasLabel
          text="ALL-IN"
          position={[0, hitHeight + 0.045, 0]}
          width={0.24}
          height={0.07}
          fontSize={96}
          background="rgba(0, 0, 0, 0)"
          color="#ffec8a"
        />
      ) : null}
    </group>
  )
}

function tierFromWorldY(worldY: number, baseY: number, hitHeight: number, hasCall: boolean): RaiseTier {
  const localY = Math.max(0, Math.min(hitHeight, worldY - baseY))
  const heightRatio = localY / hitHeight

  if (hasCall && heightRatio > 0.75) {
    return 'call'
  }

  if (heightRatio > 0.66) {
    return 'min'
  }

  if (heightRatio > 0.33) {
    return 'halfPot'
  }

  return 'pot'
}

function selectionForTier(options: RaiseOptions, tier: RaiseTier, callAmount: number | undefined): BetChipSelection {
  if (tier === 'call' && callAmount !== undefined) {
    return { type: 'call', amount: callAmount, label: `Call ${formatChips(callAmount)} chips` }
  }

  if (tier === 'pot') {
    return { type: 'raise', amount: options.pot, label: `Pot ${formatChips(options.pot)} chips` }
  }

  if (tier === 'halfPot') {
    return { type: 'raise', amount: options.halfPot, label: `1/2 ${formatChips(options.halfPot)} chips` }
  }

  return { type: 'raise', amount: options.min, label: `Min ${formatChips(options.min)} chips` }
}

function litChipsForAmount(stackChips: ReturnType<typeof chipPiecesForAmount>, amount: number) {
  for (let chipCount = 1; chipCount <= stackChips.length; chipCount += 1) {
    if (chipValueForPieces(stackChips.slice(stackChips.length - chipCount)) >= amount) {
      return chipCount
    }
  }

  return stackChips.length
}

function chipColor(tier: RaiseTier) {
  if (tier === 'call') {
    return '#f2d16b'
  }

  if (tier === 'pot') {
    return '#5bf08d'
  }

  if (tier === 'halfPot') {
    return '#2d6ef1'
  }

  return '#f2d16b'
}

function chipGlow(tier: RaiseTier) {
  if (tier === 'call') {
    return '#b47a18'
  }

  if (tier === 'pot') {
    return '#22b958'
  }

  if (tier === 'halfPot') {
    return '#1648c5'
  }

  return '#b47a18'
}
