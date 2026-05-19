import type { GameState } from '../types/game'

export type ChipPiece = {
  value: 1 | 0.5
  color: string
}

export function chipPiecesForAmount(amount: number): ChipPiece[] {
  const wholeChips = Math.floor(roundToHalf(amount))
  const hasHalfChip = roundToHalf(amount - wholeChips) >= 0.5
  const chips: ChipPiece[] = []

  for (let index = 0; index < wholeChips; index += 1) {
    chips.push({ value: 1, color: '#d6c27a' })
  }

  if (hasHalfChip) {
    chips.push({ value: 0.5, color: '#b74343' })
  }

  return chips
}

export function chipValueForPieces(chips: ChipPiece[]) {
  return chips.reduce((sum, chip) => sum + chip.value, 0)
}

export function trackedChipValue(game: GameState) {
  const playerStacks = game.players.reduce((sum, player) => sum + player.chips, 0)
  const liveContributions = game.players.reduce((sum, player) => sum + player.contribution, 0)
  const committedPots = (game.pots ?? []).reduce((sum, pot) => sum + pot.amount, 0)
  return roundToHalf(playerStacks + liveContributions + committedPots)
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2
}
