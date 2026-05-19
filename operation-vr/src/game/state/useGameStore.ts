import { create } from 'zustand'
import { createDemoHand, demoHand, type DemoSeat } from '../mockData/demoHand'
import { applyPlayerAction } from '../rules/handEngine'
import { resolveShowdown } from '../rules/showdown'
import type { GameState, PlayerActionInput } from '../types/game'

export type ActionMenu = 'main' | 'raise-size' | 'raise-intent' | 'bet-intent'

type GameStore = {
  game: GameState
  handNumber: number
  dealAnimationKey: number
  lastActionLabel: string
  actionMenu: ActionMenu
  selectedRaiseTo: number
  stagedBetAction: PlayerActionInput | null
  settings: {
    autoplayOpponents: boolean
    showDebugTrace: boolean
  }
  applyAction: (action: PlayerActionInput) => void
  applyBotAction: (action: PlayerActionInput) => void
  setAutoplayOpponents: (enabled: boolean) => void
  setShowDebugTrace: (enabled: boolean) => void
  setActionMenu: (menu: ActionMenu) => void
  setSelectedRaiseTo: (amount: number) => void
  setStagedBetAction: (action: PlayerActionInput | null) => void
  startNextHand: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  game: demoHand,
  handNumber: 0,
  dealAnimationKey: 1,
  lastActionLabel: 'Awaiting player decision',
  actionMenu: 'main',
  selectedRaiseTo: 0,
  stagedBetAction: null,
  settings: {
    autoplayOpponents: true,
    showDebugTrace: false,
  },
  applyAction: (action) =>
    set((state) => {
      if (!state.game.activePlayerId) {
        return state
      }

      const result = applyPlayerAction(state.game, state.game.activePlayerId, action)
      return {
        game: result.game,
        actionMenu: 'main',
        selectedRaiseTo: 0,
        stagedBetAction: null,
        lastActionLabel:
          result.game.phase === 'showdown' ? `${result.label} selected. Hand is ready for showdown.` : `${result.label} selected.`,
      }
    }),
  applyBotAction: (action) =>
    set((state) => {
      const activePlayer = state.game.players.find((player) => player.id === state.game.activePlayerId)
      if (!activePlayer || activePlayer.id === 'p1') {
        return state
      }

      const result = applyPlayerAction(state.game, activePlayer.id, action)
      return {
        game: result.game,
        actionMenu: 'main',
        selectedRaiseTo: 0,
        stagedBetAction: null,
        lastActionLabel:
          result.game.phase === 'showdown'
            ? `${activePlayer.name} ${result.label.toLowerCase()}. Hand is ready for showdown.`
            : `${activePlayer.name} ${result.label.toLowerCase()}.`,
      }
    }),
  setAutoplayOpponents: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, autoplayOpponents: enabled },
    })),
  setShowDebugTrace: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, showDebugTrace: enabled },
    })),
  setActionMenu: (menu) => set({ actionMenu: menu }),
  setSelectedRaiseTo: (amount) => set({ selectedRaiseTo: amount }),
  setStagedBetAction: (action) => set({ stagedBetAction: action }),
  startNextHand: () =>
    set((state) => ({
      game: createDemoHand(nextSeatsFrom(state.game), state.handNumber + 1),
      handNumber: state.handNumber + 1,
      dealAnimationKey: state.dealAnimationKey + 1,
      actionMenu: 'main',
      selectedRaiseTo: 0,
      stagedBetAction: null,
      lastActionLabel: `Hand ${state.handNumber + 2} started. Blinds posted.`,
    })),
}))

function nextSeatsFrom(game: GameState): DemoSeat[] {
  const payouts = game.phase === 'showdown' ? resolveShowdown(game).payouts : {}

  return game.players.map((player) => ({
    id: player.id,
    seat: player.seat,
    name: player.name,
    chips: player.chips + (payouts[player.id] ?? 0),
  }))
}
