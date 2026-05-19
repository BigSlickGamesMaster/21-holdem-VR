import type { GameState } from '../types/game'
import { buildPots } from './pots'

export type RaiseOptions = {
  min: number
  halfPot: number
  pot: number
  max: number
}

export function getRaiseOptions(game: GameState, playerId: string): RaiseOptions | null {
  const player = game.players.find((candidate) => candidate.id === playerId)
  if (!player) {
    return null
  }

  const max = player.contribution + player.chips
  const min = game.currentBet + game.minRaise
  if (max < min) {
    return null
  }

  const committedPotTotal = (game.pots ?? []).reduce((sum, pot) => sum + pot.amount, 0)
  const currentRoundPotTotal = buildPots(game.players).pots.reduce((sum, pot) => sum + pot.amount, 0)
  const potTotal = committedPotTotal + currentRoundPotTotal

  return {
    min,
    halfPot: clampRaise(game.currentBet + potTotal / 2, min, max),
    pot: clampRaise(game.currentBet + potTotal, min, max),
    max,
  }
}

function clampRaise(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
