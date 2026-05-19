import { create } from 'zustand'
import { createDemoHand, demoHand } from '../mockData/demoHand'
import { seatsForNextHand } from '../rules/chipSettlement'
import { applyPlayerAction, applyTimeoutFold } from '../rules/handEngine'
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
  applyTimeoutAction: (playerId: string, turnKey: string) => void
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
  applyTimeoutAction: (playerId, turnKey) =>
    set((state) => {
      const activePlayer = state.game.players.find((player) => player.id === state.game.activePlayerId)
      const currentTurnKey = turnKeyForGame(state.game, state.dealAnimationKey)
      if (!activePlayer || activePlayer.id !== playerId || currentTurnKey !== turnKey) {
        return state
      }

      const result = applyTimeoutFold(state.game, playerId)
      return {
        game: result.game,
        actionMenu: 'main',
        selectedRaiseTo: 0,
        stagedBetAction: null,
        lastActionLabel:
          result.game.phase === 'showdown'
            ? `${activePlayer.name} timed out and ${result.label.toLowerCase()}. Hand is ready for showdown.`
            : `${activePlayer.name} timed out and ${result.label.toLowerCase()}.`,
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
    set((state) => {
      if (state.game.phase !== 'showdown') {
        return state
      }

      return {
        game: createDemoHand(seatsForNextHand(state.game), state.handNumber + 1),
        handNumber: state.handNumber + 1,
        dealAnimationKey: state.dealAnimationKey + 1,
        actionMenu: 'main',
        selectedRaiseTo: 0,
        stagedBetAction: null,
        lastActionLabel: `Hand ${state.handNumber + 2} started. Blinds posted.`,
      }
    }),
}))

export function turnKeyForGame(game: GameState, dealAnimationKey: number) {
  return `${dealAnimationKey}-${game.activePlayerId}-${game.phase}-${game.communityCards.length}-${game.currentBet}`
}
