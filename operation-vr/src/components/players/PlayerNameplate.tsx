import type { Player } from '../../game/types/game'
import { formatChips } from '../../game/rules/formatChips'
import { CanvasLabel } from '../vr/CanvasLabel'

type PlayerNameplateProps = {
  player: Player
  position: [number, number, number]
  active: boolean
  role?: string
  detail: string
  alert?: boolean
}

export function PlayerNameplate({ player, position, active, role, detail, alert = false }: PlayerNameplateProps) {
  const baseColor = active ? '#203b72' : '#151d2b'
  const rimColor = active ? '#3b7df8' : '#526176'
  const detailColor = alert ? '#6b2525' : player.state === 'standing' ? '#5b4c2a' : player.state === 'all-in' ? '#5a3448' : '#1f2b3b'

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, -0.002]}>
        <boxGeometry args={[0.68, 0.22, 0.012]} />
        <meshStandardMaterial color={rimColor} emissive={active ? '#123a9d' : '#000000'} emissiveIntensity={active ? 0.18 : 0} roughness={0.45} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.65, 0.195, 0.014]} />
        <meshStandardMaterial color={baseColor} opacity={0.86} roughness={0.38} transparent />
      </mesh>
      <CanvasLabel
        text={player.name}
        position={[-0.09, 0.048, 0.016]}
        rotation={[0, 0, 0]}
        width={0.38}
        height={0.07}
        fontSize={44}
        background={baseColor}
      />
      <CanvasLabel
        text={formatChips(player.chips)}
        position={[0.215, 0.048, 0.018]}
        rotation={[0, 0, 0]}
        width={0.17}
        height={0.062}
        fontSize={42}
        background="#54e985"
        color="#0d2214"
      />
      <CanvasLabel
        text={detail}
        position={[-0.075, -0.052, 0.018]}
        rotation={[0, 0, 0]}
        width={0.4}
        height={0.062}
        fontSize={34}
        background={detailColor}
      />
      {role ? (
        <CanvasLabel
          text={role}
          position={[0.245, -0.052, 0.02]}
          rotation={[0, 0, 0]}
          width={0.11}
          height={0.06}
          fontSize={38}
          background={role === 'BB' ? '#2e4bff' : role === 'SB' ? '#d89132' : '#4b5563'}
          color={role === 'SB' ? '#16110a' : '#f7f9ff'}
        />
      ) : null}
    </group>
  )
}
