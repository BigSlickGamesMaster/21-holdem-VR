import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR, XROrigin, createXRStore } from '@react-three/xr'
import { useEffect, useMemo, useState } from 'react'
import { ActionButton3D } from './components/betting/ActionButton3D'
import { CasinoRoom } from './components/table/CasinoRoom'
import { TableModel } from './components/table/TableModel'
import { CanvasLabel } from './components/vr/CanvasLabel'
import { buildPots } from './game/rules/pots'
import { resolveShowdown } from './game/rules/showdown'
import { chooseBotAction } from './game/rules/botStrategy'
import { buildHandDebugSummary } from './game/rules/handDebug'
import { formatChips } from './game/rules/formatChips'
import { useGameStore } from './game/state/useGameStore'
import { TableScene } from './scenes/TableScene'
import './App.css'

const xrStore = createXRStore({
  controller: true,
  hand: false,
  gaze: false,
  transientPointer: true,
})

function App() {
  const [xrStatus, setXrStatus] = useState('Checking WebXR support...')
  const [view, setView] = useState<'lobby' | 'table'>('lobby')

  useEffect(() => {
    let active = true

    async function checkWebXr() {
      if (!window.isSecureContext) {
        setXrStatus('VR blocked: open this page over HTTPS on the headset.')
        return
      }

      if (!navigator.xr) {
        setXrStatus('VR blocked: this browser is not exposing WebXR.')
        return
      }

      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      if (active) {
        setXrStatus(supported ? 'VR ready: press Enter VR in the headset.' : 'VR blocked: immersive-vr is unavailable.')
      }
    }

    void checkWebXr().catch((error: unknown) => {
      if (active) {
        setXrStatus(error instanceof Error ? error.message : 'VR support check failed.')
      }
    })

    return () => {
      active = false
    }
  }, [])

  async function enterVr() {
    try {
      await xrStore.enterVR()
    } catch (error) {
      setXrStatus(error instanceof Error ? `VR failed: ${error.message}` : 'VR failed.')
    }
  }

  return (
    <main className="app-shell">
      <div className="top-bar">
        <div>
          <strong>21 Hold'em VR</strong>
          <span>{xrStatus}</span>
        </div>
        <div className="top-actions">
          {view === 'lobby' ? (
            <button className="vr-entry" type="button" onClick={() => void enterVr()}>
              Enter VR
            </button>
          ) : null}
        </div>
      </div>

      <Canvas camera={{ position: [0, 2.25, 3.2], fov: 52 }} shadows>
        <XR store={xrStore}>
          <XROrigin position={[0, 0, 1.65]} />
          {view === 'lobby' ? <VrLobbyScene onStart={() => setView('table')} /> : <TableScene />}
        </XR>
      </Canvas>
      {view === 'lobby' ? <Lobby onStart={() => setView('table')} /> : <TableHud />}
      {view === 'table' ? <DebugPanel /> : null}
    </main>
  )
}

function VrLobbyScene({ onStart }: { onStart: () => void }) {
  return (
    <>
      <color attach="background" args={['#101216']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 7, 4]} intensity={1.4} castShadow />
      <OrbitControls target={[0, 0.95, 0]} enablePan={false} maxPolarAngle={Math.PI * 0.5} />
      <CasinoRoom />
      <group position={[0, -0.06, -0.36]} scale={0.82}>
        <TableModel />
      </group>
      <CanvasLabel
        text="21 HOLD'EM VR"
        position={[0, 1.56, 0.62]}
        rotation={[0, 0, 0]}
        width={1.55}
        height={0.22}
        fontSize={106}
        background="rgba(0, 0, 0, 0)"
        color="#f7f9ff"
      />
      <CanvasLabel
        text="BB 1 / SB 0.5"
        position={[0, 1.28, 0.62]}
        rotation={[0, 0, 0]}
        width={0.92}
        height={0.12}
        fontSize={72}
        background="rgba(0, 0, 0, 0)"
        color="#ffdc8b"
      />
      <ActionButton3D label="Start Table" position={[0, 0.98, 0.72]} onPress={onStart} />
    </>
  )
}

function DebugPanel() {
  const game = useGameStore((state) => state.game)
  const showDebugTrace = useGameStore((state) => state.settings.showDebugTrace)
  const summary = useMemo(() => buildHandDebugSummary(game), [game])

  if (!showDebugTrace) {
    return null
  }

  return (
    <details className="debug-panel">
      <summary>Hand Trace</summary>
      <pre>{JSON.stringify(summary, null, 2)}</pre>
    </details>
  )
}

export default App

function Lobby({ onStart }: { onStart: () => void }) {
  const [panel, setPanel] = useState<'main' | 'how-to' | 'settings'>('main')
  const settings = useGameStore((state) => state.settings)
  const setAutoplayOpponents = useGameStore((state) => state.setAutoplayOpponents)
  const setShowDebugTrace = useGameStore((state) => state.setShowDebugTrace)

  return (
    <section className="lobby-screen">
      <div className="lobby-panel">
        <div>
          <h1>21 Hold'em VR</h1>
          <p>Player-versus-player 21 scoring with poker pressure, side pots, and community-card decisions.</p>
        </div>
        {panel === 'main' ? (
          <div className="lobby-actions">
            <button type="button" onClick={onStart}>
              Start Demo Table
            </button>
            <button type="button">Join Private Table</button>
            <button type="button" onClick={() => setPanel('how-to')}>
              How To Play
            </button>
            <button type="button" onClick={() => setPanel('settings')}>
              Settings
            </button>
          </div>
        ) : null}
        {panel === 'how-to' ? <HowToPanel onBack={() => setPanel('main')} /> : null}
        {panel === 'settings' ? (
          <SettingsPanel
            autoplayOpponents={settings.autoplayOpponents}
            showDebugTrace={settings.showDebugTrace}
            onAutoplayChange={setAutoplayOpponents}
            onDebugChange={setShowDebugTrace}
            onBack={() => setPanel('main')}
          />
        ) : null}
      </div>
      <div className="lobby-summary">
        <span>Quest Browser ready</span>
        <span>3 seats</span>
        <span>BB 1 / SB 0.5</span>
        <span>1 private card</span>
      </div>
    </section>
  )
}

function HowToPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="lobby-info-panel">
      <p>Match the opening blind to stay in the hand. Build the best total of 21 or less.</p>
      <p>Check means no bet and take the next community card. Stand keeps your current total but does not protect you from later betting.</p>
      <p>Fold gives up all claim to the current hand. All-in caps your chips but keeps you eligible for pots you contributed to.</p>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  )
}

function SettingsPanel({
  autoplayOpponents,
  showDebugTrace,
  onAutoplayChange,
  onDebugChange,
  onBack,
}: {
  autoplayOpponents: boolean
  showDebugTrace: boolean
  onAutoplayChange: (enabled: boolean) => void
  onDebugChange: (enabled: boolean) => void
  onBack: () => void
}) {
  return (
    <div className="lobby-info-panel">
      <label className="setting-row">
        <span>Autoplay opponents</span>
        <input type="checkbox" checked={autoplayOpponents} onChange={(event) => onAutoplayChange(event.target.checked)} />
      </label>
      <label className="setting-row">
        <span>Show hand trace</span>
        <input type="checkbox" checked={showDebugTrace} onChange={(event) => onDebugChange(event.target.checked)} />
      </label>
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  )
}

function TableHud() {
  const game = useGameStore((state) => state.game)
  const lastActionLabel = useGameStore((state) => state.lastActionLabel)
  const applyBotAction = useGameStore((state) => state.applyBotAction)
  const autoplayOpponents = useGameStore((state) => state.settings.autoplayOpponents)
  const { pots, refunds } = useMemo(() => buildPots(game.players), [game.players])
  const showdown = useMemo(() => (game.phase === 'showdown' ? resolveShowdown(game) : null), [game])
  const isHumanTurn = game.activePlayerId === 'p1'

  useEffect(() => {
    if (!autoplayOpponents || !game.activePlayerId || isHumanTurn || game.phase === 'showdown') {
      return
    }

    const botAction = chooseBotAction(game, game.activePlayerId)
    if (!botAction) {
      return
    }

    const timeout = window.setTimeout(() => applyBotAction(botAction), 900)
    return () => window.clearTimeout(timeout)
  }, [applyBotAction, autoplayOpponents, game, isHumanTurn])

  return (
    <section className="table-hud" aria-label="Current hand state">
      <div>
        <strong>{lastActionLabel}</strong>
        {showdown ? (
          <>
            <span>{`Awards: ${showdown.awards.map((award) => formatAward(award.winnerIds, award.amount, game)).join(' / ')}`}</span>
            <span>{`Payouts: ${formatPayouts(showdown.payouts, game)}`}</span>
          </>
        ) : (
          <>
            <span>{`Pots: ${pots.map((pot) => formatChips(pot.amount)).join(' / ') || '0'}`}</span>
            <span>{`Refunds: ${formatRefunds(refunds)}`}</span>
          </>
        )}
      </div>
      <div className="hud-actions">
        {!isHumanTurn && game.phase !== 'showdown' ? <span className="bot-thinking">Opponent thinking...</span> : null}
      </div>
    </section>
  )
}

function formatAward(winnerIds: string[], amount: number, game: ReturnType<typeof useGameStore.getState>['game']) {
  if (winnerIds.length === 0) {
    return `${formatChips(amount)} unresolved`
  }

  return `${formatChips(amount)} to ${winnerIds.map((id) => playerName(game, id)).join(' + ')}`
}

function formatPayouts(payouts: Record<string, number>, game: ReturnType<typeof useGameStore.getState>['game']) {
  const entries = Object.entries(payouts)
  if (entries.length === 0) {
    return 'none'
  }

  return entries.map(([id, amount]) => `${playerName(game, id)} ${formatChips(amount)}`).join(', ')
}

function formatRefunds(refunds: Record<string, number>) {
  return (
    Object.entries(refunds)
      .map(([id, amount]) => `${id} ${formatChips(amount)}`)
      .join(', ') || 'none'
  )
}

function playerName(game: ReturnType<typeof useGameStore.getState>['game'], playerId: string) {
  return game.players.find((player) => player.id === playerId)?.name ?? playerId
}
