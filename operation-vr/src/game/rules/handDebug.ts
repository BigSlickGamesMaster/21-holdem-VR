import type { GameState } from '../types/game'
import { calculateHandTotal, playerScoringCards } from './handTotals'
import { getLegalActions } from './legalActions'
import { buildPots } from './pots'
import { resolveShowdown } from './showdown'

export type PlayerDebugRow = {
  id: string
  name: string
  state: string
  chips: number
  contribution: number
  acceptedCommunityCount: number
  total: number
  bust: boolean
  legalActions: string[]
}

export type HandDebugSummary = {
  phase: string
  activePlayerId: string
  dealerPlayerId?: string
  smallBlindPlayerId?: string
  bigBlindPlayerId?: string
  currentBet: number
  actedThisRound: string[]
  communityCards: string[]
  deckCount: number
  players: PlayerDebugRow[]
  pots: Array<{ id: string; amount: number; eligiblePlayerIds: string[]; contributionCap: number }>
  refunds: Record<string, number>
  payouts: Record<string, number>
}

export function buildHandDebugSummary(game: GameState): HandDebugSummary {
  const currentRound = buildPots(game.players)
  const pots = [...(game.pots ?? []), ...currentRound.pots]
  const refunds = currentRound.refunds
  const showdown = game.phase === 'showdown' ? resolveShowdown(game) : null

  return {
    phase: game.phase,
    activePlayerId: game.activePlayerId,
    dealerPlayerId: game.dealerPlayerId,
    smallBlindPlayerId: game.smallBlindPlayerId,
    bigBlindPlayerId: game.bigBlindPlayerId,
    currentBet: game.currentBet,
    actedThisRound: game.actedThisRound ?? [],
    communityCards: game.communityCards.map(formatCard),
    deckCount: game.deck?.length ?? 0,
    players: game.players.map((player) => {
      const total = calculateHandTotal(
        playerScoringCards(player.holeCards, game.communityCards, player.acceptedCommunityCount),
      )

      return {
        id: player.id,
        name: player.name,
        state: player.state,
        chips: player.chips,
        contribution: player.contribution,
        acceptedCommunityCount: player.acceptedCommunityCount,
        total: total.total,
        bust: total.bust,
        legalActions: getLegalActions(game, player.id).map((action) => action.label),
      }
    }),
    pots,
    refunds,
    payouts: showdown?.payouts ?? {},
  }
}

function formatCard(card: { rank: string; suit: string }) {
  return `${card.rank}-${card.suit}`
}
