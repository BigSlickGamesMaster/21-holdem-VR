import { useState } from 'react'
import { CanvasLabel } from '../vr/CanvasLabel'

type ActionButton3DProps = {
  label: string
  position: [number, number, number]
  onPress: () => void
}

type ButtonStyle = {
  color: string
  hoverColor: string
  labelBackground: string
  labelColor: string
  emissive: string
  emissiveIntensity: number
  opacity: number
}

function getButtonStyle(label: string): ButtonStyle {
  const action = label.toLowerCase()

  if (action.includes('raise') || action.startsWith('min') || action.startsWith('half') || action.startsWith('pot')) {
    return {
      color: '#5bf08d',
      hoverColor: '#77ffa5',
      labelBackground: '#5bf08d',
      labelColor: '#0d2214',
      emissive: '#22b958',
      emissiveIntensity: 0.28,
      opacity: 0.96,
    }
  }

  if (action.includes('stand')) {
    return {
      color: '#1f57d2',
      hoverColor: '#2c68f0',
      labelBackground: '#1f57d2',
      labelColor: '#f7f9ff',
      emissive: '#123a9d',
      emissiveIntensity: 0.22,
      opacity: 0.96,
    }
  }

  return {
    color: '#1c2432',
    hoverColor: '#2b3648',
    labelBackground: '#1c2432',
    labelColor: '#f8fbff',
    emissive: '#0a1020',
    emissiveIntensity: 0.12,
    opacity: 0.76,
  }
}

export function ActionButton3D({ label, position, onPress }: ActionButton3DProps) {
  const [hovered, setHovered] = useState(false)
  const style = getButtonStyle(label)

  return (
    <group position={position}>
      <mesh
        onClick={onPress}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.38, 0.058, 0.13]} />
        <meshStandardMaterial
          color={hovered ? style.hoverColor : style.color}
          emissive={style.emissive}
          emissiveIntensity={style.emissiveIntensity}
          opacity={style.opacity}
          roughness={0.38}
          transparent
        />
      </mesh>
      <CanvasLabel
        text={label}
        position={[0, 0.034, 0]}
        width={0.36}
        height={0.1}
        fontSize={44}
        background={style.labelBackground}
        color={style.labelColor}
      />
    </group>
  )
}
