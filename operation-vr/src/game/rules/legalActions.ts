import type { GameState, LegalAction, Player } from '../types/game'
import { formatChips } from './formatChips'

export function getLegalActions(game: GameState, playerId: string): LegalAction[] {
  const player = game.players.find((candidate) => candidate.id === playerId)

  if (!player || player.state === 'folded' || player.state === 'bust') {
    return []
  }

  if (player.chips <= 0 || player.state === 'all-in') {
    return []
  }

  const toCall = amountToCall(game, player)
  const actions: LegalAction[] = []

  if (toCall > 0) {
    const amount = Math.min(toCall, player.chips)
    actions.push({
      type: 'call',
      label: amount < toCall ? `All-in ${formatChips(amount)}` : `Call ${formatChips(amount)}`,
      amount,
      allIn: amount < toCall || amount === player.chips,
    })
    actions.push({ type: 'fold', label: 'Fold' })
    if (player.chips > toCall + game.minRaise) {
      actions.push({ type: 'raise', label: 'Raise', minTo: game.currentBet + game.minRaise })
    }
    return actions
  } else {
    actions.push({ type: 'check', label: 'Check' })
  }

  if (player.state !== 'standing') {
    actions.push({ type: 'stand', label: 'Stand' })
  }

  if (player.chips > toCall + game.minRaise) {
    actions.push({ type: 'raise', label: 'Raise', minTo: game.currentBet + game.minRaise })
  }

  return actions
}

function amountToCall(game: GameState, player: Player): number {
  return Math.max(0, game.currentBet - player.contribution)
}
