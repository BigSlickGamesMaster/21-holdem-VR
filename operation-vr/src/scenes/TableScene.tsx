import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, LinearFilter, Shape } from 'three'
import { ActionButton3D } from '../components/betting/ActionButton3D'
import { RaiseChipSelector, type BetChipSelection } from '../components/betting/RaiseChipSelector'
import { TableConsole } from '../components/betting/TableConsole'
import { DealtCard } from '../components/cards/DealtCard'
import { ChipStack } from '../components/chips/ChipStack'
import { CasinoRoom } from '../components/table/CasinoRoom'
import { TableModel } from '../components/table/TableModel'
import { CanvasLabel } from '../components/vr/CanvasLabel'
import { getLegalActions } from '../game/rules/legalActions'
import { calculateHandTotal, playerScoringCards } from '../game/rules/handTotals'
import { buildPots } from '../game/rules/pots'
import { getRaiseOptions } from '../game/rules/raiseOptions'
import { resolveShowdown } from '../game/rules/showdown'
import { turnKeyForGame, useGameStore } from '../game/state/useGameStore'

const seatPositions: Record<number, [number, number, number]> = {
  1: [0, 0.835, 1.02],
  2: [-1.18, 0.835, 0.62],
  3: [1.18, 0.835, 0.62],
  4: [-1.32, 0.835, -0.08],
  5: [1.32, 0.835, -0.08],
  6: [-0.88, 0.835, -0.72],
  7: [0.88, 0.835, -0.72],
  8: [-0.3, 0.835, -0.88],
  9: [0.3, 0.835, -0.88],
}

const feltY = 0.835
const objectY = feltY + 0.014
const controlY = feltY + 0.018
const consoleX = 0.25
const consoleZ = 0.66
const consoleSize = 0.26
const actionTimerSeconds = 20
const potPosition: [number, number, number] = [0, objectY, 0.01]
const playerChipLeftOffset = 0.24
const tableSurfaceWidth = 3.24
const tableSurfaceDepth = 1.74
const cardLength = 0.22
const foldLineZ = tableSurfaceDepth / 2 - cardLength * 2
const opponentTrackAngles: Record<number, number> = {
  2: 140,
  4: 180,
  6: 220,
  7: 320,
  5: 0,
  3: 40,
}
const opponentBackSlots: Record<number, number> = {
  8: -0.38,
  9: 0.38,
}

export function TableScene() {
  const game = useGameStore((state) => state.game)
  const dealAnimationKey = useGameStore((state) => state.dealAnimationKey)
  const applyAction = useGameStore((state) => state.applyAction)
  const actionMenu = useGameStore((state) => state.actionMenu)
  const selectedRaiseTo = useGameStore((state) => state.selectedRaiseTo)
  const stagedBetAction = useGameStore((state) => state.stagedBetAction)
  const setActionMenu = useGameStore((state) => state.setActionMenu)
  const setSelectedRaiseTo = useGameStore((state) => state.setSelectedRaiseTo)
  const setStagedBetAction = useGameStore((state) => state.setStagedBetAction)
  const startNextHand = useGameStore((state) => state.startNextHand)
  const applyTimeoutAction = useGameStore((state) => state.applyTimeoutAction)
  const isHumanTurn = game.activePlayerId === 'p1'
  const legalActions = useMemo(() => (isHumanTurn ? getLegalActions(game, game.activePlayerId) : []), [game, isHumanTurn])
  const raiseOptions = useMemo(() => getRaiseOptions(game, game.activePlayerId), [game])
  const actionButtons = useMemo(
    () =>
      buildVrActionButtons({
        menu: actionMenu,
        legalActions,
        raiseOptions,
        selectedRaiseTo,
        stagedBetAction,
        applyAction,
        setActionMenu,
        setStagedBetAction,
      }),
    [actionMenu, applyAction, legalActions, raiseOptions, selectedRaiseTo, stagedBetAction, setActionMenu, setStagedBetAction],
  )
  const { pots: currentRoundPots } = useMemo(() => buildPots(game.players), [game.players])
  const showdown = useMemo(() => (game.phase === 'showdown' ? resolveShowdown(game) : null), [game])
  const potTotal =
    (game.pots ?? []).reduce((sum, pot) => sum + pot.amount, 0) +
    currentRoundPots.reduce((sum, pot) => sum + pot.amount, 0)
  const callAction = legalActions.find((action) => action.type === 'call')
  const canTapCheck = isHumanTurn && actionMenu === 'main' && legalActions.some((action) => action.type === 'check')
  const canFold = isHumanTurn && actionMenu === 'main' && legalActions.some((action) => action.type === 'fold')
  const canStand = isHumanTurn && actionMenu === 'main' && legalActions.some((action) => action.type === 'stand')
  const canSelectBet = isHumanTurn && actionMenu === 'main' && Boolean(raiseOptions)
  const confirmActive = isHumanTurn && actionMenu === 'bet-intent' && stagedBetAction !== null
  const canStandStagedBet = isHumanTurn && actionMenu === 'bet-intent' && stagedBetAction !== null
  const [foldThrow, setFoldThrow] = useState<{ key: number; dealKey: number; card: (typeof game.players)[number]['holeCards'][number] } | null>(
    null,
  )
  const activeFoldThrow = foldThrow?.dealKey === dealAnimationKey ? foldThrow : null
  const [showdownTimer, setShowdownTimer] = useState<{ dealKey: number; startedAt: number } | null>(null)
  const [countdownNow, setCountdownNow] = useState(() => window.performance.now())
  const activeShowdownTimer = showdownTimer?.dealKey === dealAnimationKey ? showdownTimer : null
  const actionTurnKey = turnKeyForGame(game, dealAnimationKey)
  const controlTimerKey = `${actionTurnKey}-${actionMenu}-${stagedBetAction?.type ?? 'none'}`
  const nextHandCountdown =
    game.phase === 'showdown' && activeShowdownTimer
      ? Math.max(0, 6 - Math.floor((countdownNow - activeShowdownTimer.startedAt) / 1000))
      : 6
  const nextHandLabel = showdown ? `Next ${nextHandCountdown}` : null

  useEffect(() => {
    if (game.phase !== 'showdown') {
      return
    }

    const startedAt = window.performance.now()
    const setup = window.setTimeout(() => {
      setShowdownTimer({ dealKey: dealAnimationKey, startedAt })
      setCountdownNow(startedAt)
    }, 0)
    const interval = window.setInterval(() => {
      setCountdownNow(window.performance.now())
    }, 250)
    const timeout = window.setTimeout(() => startNextHand(), 6000)

    return () => {
      window.clearTimeout(setup)
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [dealAnimationKey, game.phase, startNextHand])

  useEffect(() => {
    if (game.activePlayerId !== 'p1' || game.phase === 'showdown') {
      return
    }

    if (!canTapCheck && !confirmActive) {
      return
    }

    const playerId = game.activePlayerId
    const timeout = window.setTimeout(() => {
      applyTimeoutAction(playerId, actionTurnKey)
    }, actionTimerSeconds * 1000)

    return () => window.clearTimeout(timeout)
  }, [actionTurnKey, applyTimeoutAction, canTapCheck, confirmActive, game.activePlayerId, game.phase])

  function throwCardToFold() {
    const human = game.players.find((player) => player.id === 'p1')
    const card = human?.holeCards[0]
    if (!card) {
      applyAction({ type: 'fold' })
      return
    }

    const key = Date.now()
    setFoldThrow({ key, dealKey: dealAnimationKey, card })
    window.setTimeout(() => {
      applyAction({ type: 'fold' })
      setFoldThrow(null)
    }, 520)
  }

  function standFromCardHover() {
    if (canStandStagedBet && stagedBetAction) {
      applyStagedBet(stagedBetAction, 'stand', applyAction)
      return
    }

    if (canStand) {
      applyAction({ type: 'stand' })
    }
  }

  return (
    <>
      <color attach="background" args={['#101216']} />
      <CameraRig />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 7, 4]} intensity={1.8} castShadow />
      <OrbitControls target={[0, 0.76, 0]} enablePan={false} maxPolarAngle={Math.PI * 0.48} />

      <CasinoRoom />
      <TableModel />
      <TableSurfaceMarks
        players={game.players}
        checkActive={canTapCheck}
        confirmActive={confirmActive}
        nextHandLabel={nextHandLabel}
        timerActive={(canTapCheck || confirmActive) && game.phase !== 'showdown'}
        turnTimerKey={controlTimerKey}
      />
      <PlayerHandTotal game={game} />

      {game.players.flatMap((player, playerIndex) => {
        const position = seatPositions[player.seat]
        return player.holeCards.map((card, cardIndex) => (
          <DealtCard
            key={`${dealAnimationKey}-${player.id}-hole-${cardIndex}`}
            card={card}
            dealKey={`${dealAnimationKey}-${player.id}-hole-${cardIndex}`}
            target={holeCardTarget(player.seat, position, cardIndex)}
            delay={(cardIndex * game.players.length + playerIndex) * 0.12}
            faceUp={(player.id === 'p1' && !activeFoldThrow) || game.phase === 'showdown'}
            visible
            opacity={player.id === 'p1' && player.state === 'folded' ? 0.5 : 1}
            rotationY={cardYawForSeat(player.seat)}
            canPickUpToFold={player.id === 'p1' && cardIndex === 0 && canFold && !activeFoldThrow}
            foldLineZ={foldLineZ}
            onFoldRelease={throwCardToFold}
            canHoverToStand={player.id === 'p1' && cardIndex === 0 && (canStand || canStandStagedBet) && !activeFoldThrow}
            onStandHover={standFromCardHover}
            warningGlow={false}
          />
        ))
      })}

      {activeFoldThrow ? (
        <DealtCard
          key={`fold-throw-${activeFoldThrow.key}`}
          card={activeFoldThrow.card}
          dealKey={`fold-throw-${activeFoldThrow.key}`}
          from={holeCardTarget(1, seatPositions[1], 0)}
          target={[potPosition[0] - 0.12, objectY + 0.012, potPosition[2] + 0.02]}
          faceUp
          rotationY={0.35}
          mode="throw"
        />
      ) : null}

      {game.communityCards.map((card, index) => (
        <DealtCard
          key={`${dealAnimationKey}-community-${index}`}
          card={card}
          dealKey={`${dealAnimationKey}-community-${index}`}
          target={communityCardPosition(index)}
          delay={(game.players.length * 2 + index) * 0.12}
        />
      ))}

      {game.players.map((player) => {
        const position = seatPositions[player.seat]
        return (
          <group key={player.id}>
            <ChipStack amount={player.chips} position={chipStackPosition(player.seat, position)} />
            {player.state === 'all-in' ? <AllInMarker seat={player.seat} seatPosition={position} /> : null}
          </group>
        )
      })}

      {game.phase !== 'showdown' ? <ChipStack amount={potTotal} position={potPosition} layout="pot" /> : null}

      {showdown ? (
        <>
          <ShowdownSeatResults game={game} showdown={showdown} />
          <TableConsole
            position={[consoleX, controlY, consoleZ]}
            width={consoleSize}
            depth={consoleSize}
            prompt={nextHandLabel ?? 'Next Hand'}
            onPrompt={startNextHand}
          />
        </>
      ) : null}

      {actionButtons.map((action, index) => (
        <ActionButton3D
          key={action.label}
          label={action.label}
          position={actionButtonPosition(actionMenu, index)}
          onPress={action.onPress}
        />
      ))}

      {canTapCheck ? (
        <TableConsole
          position={[consoleX, controlY, consoleZ]}
          width={consoleSize}
          depth={consoleSize}
          prompt="Double Tap To Check"
          doubleTap
          onPrompt={() => applyAction({ type: 'check' })}
        />
      ) : null}

      {actionMenu === 'bet-intent' && stagedBetAction ? (
        <TableConsole
          position={[consoleX, controlY, consoleZ]}
          width={consoleSize}
          depth={consoleSize}
          prompt="Confirm"
          doubleTap
          onPrompt={() => applyStagedBet(stagedBetAction, 'confirm', applyAction)}
        />
      ) : null}

      {canSelectBet && raiseOptions ? (
        <RaiseChipSelector
          options={raiseOptions}
          callAmount={callAction?.type === 'call' ? callAction.amount : undefined}
          callAllIn={callAction?.type === 'call' ? callAction.allIn : false}
          position={[0.5, objectY, 0.62]}
          onPreview={(selection) => previewBetSelection(selection, setSelectedRaiseTo)}
          onSelect={(selection) => stageBetSelection(selection, setSelectedRaiseTo, setStagedBetAction, setActionMenu)}
        />
      ) : null}
    </>
  )
}

function ShowdownSeatResults({
  game,
  showdown,
}: {
  game: ReturnType<typeof useGameStore.getState>['game']
  showdown: NonNullable<ReturnType<typeof resolveShowdown>>
}) {
  return (
    <group>
      {game.players.map((player) => {
        const position = seatPositions[player.seat]
        const total = showdown.totals[player.id]

        return (
          <CanvasLabel
            key={`showdown-total-${player.id}`}
            text={total?.bust ? `${total.total} BUST` : String(total?.total ?? '')}
            position={showdownTotalPosition(player.seat, position)}
            rotation={[-Math.PI / 2, 0, cardYawForSeat(player.seat)]}
            width={0.46}
            height={0.16}
            fontSize={140}
            background="rgba(0, 0, 0, 0)"
            color={total?.bust ? '#ff7474' : '#f7f9ff'}
          />
        )
      })}
    </group>
  )
}

function showdownTotalPosition(seat: number, seatPosition: [number, number, number]): [number, number, number] {
  const cardBase = playerCardBase(seat, seatPosition, objectY)
  const { inward } = seatFrameForSeat(seat, seatPosition)

  return [cardBase[0] + inward[0] * 0.18, objectY + 0.006, cardBase[2] + inward[1] * 0.18]
}

function AllInMarker({ seat, seatPosition }: { seat: number; seatPosition: [number, number, number] }) {
  const cardBase = playerCardBase(seat, seatPosition, objectY)
  const { inward } = seatFrameForSeat(seat, seatPosition)
  const position: [number, number, number] = [
    cardBase[0] + inward[0] * 0.2,
    objectY + 0.004,
    cardBase[2] + inward[1] * 0.2,
  ]

  return (
    <CanvasLabel
      text="ALL-IN"
      position={position}
      rotation={[-Math.PI / 2, 0, cardYawForSeat(seat)]}
      width={0.22}
      height={0.07}
      fontSize={86}
      background="rgba(0, 0, 0, 0)"
      color="#ffec8a"
    />
  )
}

type VrActionButton = {
  label: string
  onPress: () => void
}

function buildVrActionButtons({
  menu,
  legalActions,
  raiseOptions,
  selectedRaiseTo,
  stagedBetAction,
  applyAction,
  setActionMenu,
  setStagedBetAction,
}: {
  menu: ReturnType<typeof useGameStore.getState>['actionMenu']
  legalActions: ReturnType<typeof getLegalActions>
  raiseOptions: ReturnType<typeof getRaiseOptions>
  selectedRaiseTo: number
  stagedBetAction: ReturnType<typeof useGameStore.getState>['stagedBetAction']
  applyAction: ReturnType<typeof useGameStore.getState>['applyAction']
  setActionMenu: ReturnType<typeof useGameStore.getState>['setActionMenu']
  setStagedBetAction: ReturnType<typeof useGameStore.getState>['setStagedBetAction']
}): VrActionButton[] {
  if (menu === 'raise-size' && raiseOptions) {
    return [{ label: 'Cancel', onPress: () => setActionMenu('main') }]
  }

  if (menu === 'bet-intent' && stagedBetAction) {
    void applyAction
    void setActionMenu
    void setStagedBetAction
    return []
  }

  if (menu === 'raise-intent') {
    return [
      {
        label: 'Confirm',
        onPress: () => applyAction({ type: 'raise', amount: selectedRaiseTo, intent: 'confirm' }),
      },
      {
        label: 'Stand',
        onPress: () => applyAction({ type: 'raise', amount: selectedRaiseTo, intent: 'stand' }),
      },
      { label: 'Cancel', onPress: () => setActionMenu('raise-size') },
    ]
  }

  if (menu === 'main') {
    return []
  }

  return legalActions
    .filter((action) => action.type !== 'check' && action.type !== 'stand')
    .map((action) =>
      action.type === 'raise'
        ? { label: 'Raise', onPress: () => setActionMenu('raise-size') }
        : { label: action.label, onPress: () => applyAction({ type: action.type }) },
    )
}

function actionButtonPosition(menu: ReturnType<typeof useGameStore.getState>['actionMenu'], index: number): [number, number, number] {
  if (menu === 'raise-size') {
    return [0.46, controlY, 0.72]
  }

  if (menu === 'bet-intent') {
    return [0.2 + index * 0.34, controlY, 0.68]
  }

  return [-0.68 + index * 0.36, controlY, 0.72]
}

function TableSurfaceMarks({
  players,
  checkActive,
  confirmActive,
  nextHandLabel,
  timerActive,
  turnTimerKey,
}: {
  players: ReturnType<typeof useGameStore.getState>['game']['players']
  checkActive: boolean
  confirmActive: boolean
  nextHandLabel: string | null
  timerActive: boolean
  turnTimerKey: string
}) {
  const markY = objectY - 0.008
  const nextHandActive = nextHandLabel !== null
  const consoleText = nextHandLabel ?? (confirmActive ? 'Confirm' : null)
  const consoleTextColor = nextHandActive ? '#f4f1e8' : confirmActive ? '#d9ffe5' : '#bfffd5'

  return (
    <group>
      <InsetBoundaryLine y={markY + 0.002} inset={cardLength * 2} />
      {players.map((player) => {
        const position = seatPositions[player.seat]
        return (
          <SurfaceSlot
            key={`player-card-slot-${player.id}`}
            position={holeCardTarget(player.seat, position, 0, markY)}
            rotationY={cardYawForSeat(player.seat)}
            width={0.2}
            depth={0.27}
            color="#8fb4ff"
            opacity={player.seat === 1 ? 0.22 : 0.17}
          />
        )
      })}
      {Array.from({ length: 5 }).map((_, index) => (
        <SurfaceSlot
          key={`community-slot-${index}`}
          position={communityCardPosition(index, markY)}
          width={0.17}
          depth={0.24}
          color="#b7caff"
          opacity={0.22}
        />
      ))}
      {nextHandActive ? (
        <TimedSquareFill
          key={`next-hand-${turnTimerKey}`}
          position={[consoleX, markY, consoleZ]}
          color="#f4f1e8"
          seconds={6}
          outlineOpacity={0.56}
        />
      ) : null}
      {confirmActive ? (
        <TimedSquareFill
          key={`confirm-${turnTimerKey}`}
          position={[consoleX, markY, consoleZ]}
          color="#5bf08d"
          seconds={actionTimerSeconds}
          outlineOpacity={0.58}
        />
      ) : null}
      {timerActive && !nextHandActive && !confirmActive ? (
        <TimedSquareFill
          key={`check-${turnTimerKey}`}
          position={[consoleX, markY, consoleZ]}
          color={checkActive ? '#8fffc1' : '#f7f9ff'}
          seconds={actionTimerSeconds}
          outlineOpacity={0.5}
        />
      ) : null}
      {consoleText ? (
        <group>
          <CanvasLabel
            text={consoleText}
            position={[consoleX, markY + 0.004, consoleZ]}
            width={consoleSize * 0.82}
            height={consoleSize * 0.36}
            fontSize={nextHandActive ? 86 : 134}
            background="rgba(0, 0, 0, 0)"
            color={consoleTextColor}
          />
        </group>
      ) : null}
    </group>
  )
}

function PlayerHandTotal({ game }: { game: ReturnType<typeof useGameStore.getState>['game'] }) {
  if (game.phase === 'showdown') {
    return null
  }

  const player = game.players.find((candidate) => candidate.id === 'p1')
  if (!player) {
    return null
  }

  const total = calculateHandTotal(playerScoringCards(player.holeCards, game.communityCards, player.acceptedCommunityCount))

  return (
    <CanvasLabel
      text={total.soft ? `${total.total}S` : String(total.total)}
      position={[-0.02, objectY - 0.002, 0.48]}
      width={0.67}
      height={0.22}
      fontSize={147}
      background="rgba(0, 0, 0, 0)"
      color={total.bust ? '#ff7474' : '#f7f9ff'}
    />
  )
}

function InsetBoundaryLine({ y, inset }: { y: number; inset: number }) {
  const shape = useMemo(() => createRoundedRectOutlineShape(tableSurfaceWidth - inset * 2, tableSurfaceDepth - inset * 2, 0.13, 0.01), [inset])

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color="#6fb7ff" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  )
}

function createRoundedRectOutlineShape(width: number, depth: number, radius: number, stroke: number) {
  const outer = roundedRectPath(width, depth, radius)
  outer.holes.push(roundedRectPath(width - stroke * 2, depth - stroke * 2, Math.max(0.01, radius - stroke)))
  return outer
}

function roundedRectPath(width: number, depth: number, radius: number) {
  const x = width / 2
  const z = depth / 2
  const r = Math.min(radius, x, z)
  const shape = new Shape()

  shape.moveTo(-x + r, -z)
  shape.lineTo(x - r, -z)
  shape.quadraticCurveTo(x, -z, x, -z + r)
  shape.lineTo(x, z - r)
  shape.quadraticCurveTo(x, z, x - r, z)
  shape.lineTo(-x + r, z)
  shape.quadraticCurveTo(-x, z, -x, z - r)
  shape.lineTo(-x, -z + r)
  shape.quadraticCurveTo(-x, -z, -x + r, -z)

  return shape
}

function SurfaceSlot({
  position,
  width,
  depth,
  color,
  opacity,
  rotationY = 0,
}: {
  position: [number, number, number]
  width: number
  depth: number
  color: string
  opacity: number
  rotationY?: number
}) {
  const shape = useMemo(() => createRoundedRectOutlineShape(width, depth, Math.min(width, depth) * 0.16, 0.009), [depth, width])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
    </group>
  )
}

function previewBetSelection(
  selection: BetChipSelection,
  setSelectedRaiseTo: ReturnType<typeof useGameStore.getState>['setSelectedRaiseTo'],
) {
  if (selection.type === 'raise') {
    setSelectedRaiseTo(selection.amount)
  }
}

function stageBetSelection(
  selection: BetChipSelection,
  setSelectedRaiseTo: ReturnType<typeof useGameStore.getState>['setSelectedRaiseTo'],
  setStagedBetAction: ReturnType<typeof useGameStore.getState>['setStagedBetAction'],
  setActionMenu: ReturnType<typeof useGameStore.getState>['setActionMenu'],
) {
  if (selection.type === 'call') {
    setStagedBetAction({ type: 'call' })
  } else {
    setSelectedRaiseTo(selection.amount)
    setStagedBetAction({ type: 'raise', amount: selection.amount })
  }

  setActionMenu('bet-intent')
}

function applyStagedBet(
  action: NonNullable<ReturnType<typeof useGameStore.getState>['stagedBetAction']>,
  intent: 'confirm' | 'stand',
  applyAction: ReturnType<typeof useGameStore.getState>['applyAction'],
) {
  if (action.type === 'call') {
    applyAction({ type: 'call', intent })
    return
  }

  if (action.type === 'raise') {
    applyAction({ ...action, intent })
  }
}

function holeCardTarget(seat: number, position: [number, number, number], cardIndex: number, y = objectY): [number, number, number] {
  const cardBase = playerCardBase(seat, position, y)
  const { left } = seatFrameForSeat(seat, position)
  const spread = cardIndex * 0.14
  return [cardBase[0] + left[0] * spread, y, cardBase[2] + left[1] * spread]
}

function communityCardPosition(index: number, y = objectY): [number, number, number] {
  return [-0.4 + index * 0.2, y, -0.26]
}

function cardYawForSeat(seat: number) {
  if (seat !== 1) {
    return opponentTrackSlot(seat).yaw + Math.PI
  }

  return 0
}

function TimedSquareFill({
  position,
  color,
  size = 0.26,
  seconds = 15,
  outlineOpacity = 0.5,
}: {
  position: [number, number, number]
  color: string
  size?: number
  seconds?: number
  outlineOpacity?: number
}) {
  const startRef = useRef<number | null>(null)
  const duration = seconds
  const [progress, setProgress] = useState(0)

  useFrame((state) => {
    startRef.current ??= state.clock.elapsedTime
    const elapsed = (state.clock.elapsedTime - startRef.current) % duration
    const nextProgress = elapsed / duration

    setProgress((current) => (Math.abs(current - nextProgress) < 0.01 ? current : nextProgress))
  })

  const fillWidth = size
  const fillDepth = size
  const sweepTexture = useMemo(() => createSquareSweepTexture(progress, color), [color, progress])

  return (
    <>
      <SurfaceSlot position={position} width={size} depth={size} color={color} opacity={outlineOpacity} />
      <mesh position={[position[0], position[1] + 0.003, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[fillWidth, fillDepth]} />
        <meshBasicMaterial map={sweepTexture} transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </>
  )
}

function createSquareSweepTexture(progress: number, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  const remaining = Math.max(0, Math.min(1, 1 - progress))
  const radius = Math.hypot(canvas.width, canvas.height)
  const center = canvas.width / 2

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.save()
  roundRect(context, 0, 0, canvas.width, canvas.height, 72)
  context.clip()

  context.fillStyle = color
  if (remaining >= 0.995) {
    context.fillRect(0, 0, canvas.width, canvas.height)
  } else if (remaining > 0) {
    context.beginPath()
    context.moveTo(center, center)
    context.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remaining, false)
    context.closePath()
    context.fill()
  }

  context.restore()

  const texture = new CanvasTexture(canvas)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function chipStackPosition(seat: number, position: [number, number, number]): [number, number, number] {
  const cardBase = playerCardBase(seat, position, objectY)
  const { left } = seatFrameForSeat(seat, position)

  return [cardBase[0] + left[0] * playerChipLeftOffset, objectY, cardBase[2] + left[1] * playerChipLeftOffset]
}

function playerCardBase(seat: number, _position: [number, number, number], y: number): [number, number, number] {
  if (seat === 1) {
    return [-0.02, y, 0.66]
  }

  const trackPoint = opponentTrackPoint(seat)
  return [trackPoint[0], y, trackPoint[1]]
}

function opponentTrackPoint(seat: number): [number, number] {
  const slot = opponentTrackSlot(seat)
  return [slot.x, slot.z]
}

function opponentTrackSlot(seat: number) {
  const width = tableSurfaceWidth - cardLength * 3
  const depth = tableSurfaceDepth - cardLength * 3
  const radius = depth / 2
  const straight = width / 2 - radius

  if (seat in opponentBackSlots) {
    return {
      x: opponentBackSlots[seat],
      z: -radius,
      yaw: 0,
    }
  }

  const angle = ((opponentTrackAngles[seat] ?? 180) * Math.PI) / 180
  const centerX = Math.cos(angle) < 0 ? -straight : straight
  const tangentX = -Math.sin(angle)
  const tangentZ = Math.cos(angle)

  return {
    x: centerX + Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    yaw: Math.atan2(-tangentZ, tangentX),
  }
}

function seatFrameForSeat(seat: number, position: [number, number, number]) {
  if (seat === 1) {
    return seatFrameFor(position)
  }

  const trackPoint = opponentTrackPoint(seat)
  return seatFrameFor([trackPoint[0], objectY, trackPoint[1]])
}

function seatFrameFor(position: [number, number, number]) {
  const length = Math.hypot(position[0], position[2]) || 1
  const inward: [number, number] = [-position[0] / length, -position[2] / length]
  const left: [number, number] = [inward[1], -inward[0]]
  return { inward, left }
}

function CameraRig() {
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    camera.lookAt(0, 0.76, 0)
  }, [camera])

  return null
}
