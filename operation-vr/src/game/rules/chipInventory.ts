import type { GameState } from '../types/game'

export type ChipPiece = {
  value: 10 | 5 | 1 | 0.5
  color: string
}

const chipDenominations: ChipPiece[] = [
  { value: 10, color: '#e7772e' },
  { value: 5, color: '#c74343' },
  { value: 1, color: '#a9afb8' },
  { value: 0.5, color: '#f1e6c7' },
]

export function chipPiecesForAmount(amount: number): ChipPiece[] {
  const chips: ChipPiece[] = []
  let remaining = roundToHalf(amount)

  for (const denomination of chipDenominations) {
    while (remaining >= denomination.value) {
      chips.push(denomination)
      remaining = roundToHalf(remaining - denomination.value)
    }

    if (remaining <= 0) {
      break
    }
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
