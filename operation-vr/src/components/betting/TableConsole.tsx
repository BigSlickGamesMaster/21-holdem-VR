import { useState } from 'react'

type ConsoleAction = {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  onPress: () => void
}

type TableConsoleProps = {
  position: [number, number, number]
  width?: number
  depth?: number
  prompt?: string
  doubleTap?: boolean
  onPrompt?: () => void
  actions?: ConsoleAction[]
}

export function TableConsole({ position, width = 1.6, depth = 0.22, prompt, doubleTap = false, onPrompt, actions = [] }: TableConsoleProps) {
  const [armed, setArmed] = useState(false)
  const [lastTapAt, setLastTapAt] = useState(0)

  function handlePrompt() {
    if (!onPrompt) {
      return
    }

    if (!doubleTap) {
      onPrompt()
      return
    }

    const now = performance.now()
    if (now - lastTapAt <= 520) {
      setArmed(false)
      setLastTapAt(0)
      onPrompt()
      return
    }

    setArmed(true)
    setLastTapAt(now)
    window.setTimeout(() => setArmed(false), 540)
  }

  return (
    <group position={position}>
      {prompt ? (
        <ConsolePlate
          label={armed ? 'Tap Again' : prompt}
          position={[0, 0.012, 0]}
          width={width}
          depth={depth}
          variant="primary"
          onPress={handlePrompt}
        />
      ) : null}
      {actions.map((action, index) => (
        <ConsolePlate
          key={action.label}
          label={action.label}
          position={actionPosition(index, actions.length, width)}
          width={actionWidth(actions.length, width)}
          depth={depth}
          variant={action.variant ?? 'secondary'}
          onPress={action.onPress}
        />
      ))}
    </group>
  )
}

function ConsolePlate({
  position,
  width,
  depth,
  variant,
  onPress,
}: {
  label: string
  position: [number, number, number]
  width: number
  depth: number
  variant: NonNullable<ConsoleAction['variant']>
  onPress: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = colorForVariant(variant, hovered)

  return (
    <group position={position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(event) => {
          event.stopPropagation()
          onPress()
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color.emissive}
          emissiveIntensity={hovered ? 0.16 : 0.04}
          opacity={0.01}
          transparent
        />
      </mesh>
    </group>
  )
}

function actionPosition(index: number, count: number, width: number): [number, number, number] {
  if (count === 1) {
    return [0, 0.012, 0]
  }

  const spacing = width / count
  return [-width / 2 + spacing / 2 + index * spacing, 0.012, 0]
}

function actionWidth(count: number, width: number) {
  return count === 1 ? width : width / count - 0.08
}

function colorForVariant(variant: NonNullable<ConsoleAction['variant']>, hovered: boolean) {
  if (variant === 'primary') {
    return {
      background: hovered ? '#a7ffd0' : '#8fffc1',
      emissive: '#22b958',
      text: hovered ? '#a7ffd0' : '#8fffc1',
    }
  }

  if (variant === 'danger') {
    return {
      background: hovered ? '#ff4b4b' : '#d81f27',
      emissive: '#9b1018',
      text: hovered ? '#ffdddd' : '#ff4b4b',
    }
  }

  return {
    background: hovered ? '#2b3648' : '#1c2432',
    emissive: '#0a1020',
    text: hovered ? '#ffffff' : '#d8e2f0',
  }
}
