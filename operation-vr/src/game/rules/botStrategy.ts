import type { GameState, LegalAction, PlayerActionInput } from '../types/game'
import { calculateHandTotal, playerScoringCards } from './handTotals'
import { getLegalActions } from './legalActions'

export function chooseBotAction(game: GameState, playerId: string): PlayerActionInput | null {
  const player = game.players.find((candidate) => candidate.id === playerId)
  if (!player) {
    return null
  }

  const legalActions = getLegalActions(game, playerId)
  if (legalActions.length === 0) {
    return null
  }

  const call = legalActions.find((action) => action.type === 'call')
  if (call?.type === 'call') {
    return call.amount <= Math.max(250, game.currentBet * 0.75) ? { type: 'call' } : { type: 'fold' }
  }

  const total = calculateHandTotal(
    playerScoringCards(player.holeCards, game.communityCards, player.acceptedCommunityCount),
  )

  if (!total.bust && total.total >= 18 && hasAction(legalActions, 'stand')) {
    return { type: 'stand' }
  }

  if (hasAction(legalActions, 'check')) {
    return { type: 'check' }
  }

  if (hasAction(legalActions, 'fold')) {
    return { type: 'fold' }
  }

  return null
}

function hasAction(actions: LegalAction[], type: LegalAction['type']) {
  return actions.some((action) => action.type === type)
}
