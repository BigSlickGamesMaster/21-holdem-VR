import type { GameState, Player, PotAward, ShowdownResult } from '../types/game'
import { calculateHandTotal, playerScoringCards } from './handTotals'
import { buildPots } from './pots'

export function resolveShowdown(game: GameState): ShowdownResult {
  const currentRound = buildPots(game.players)
  const pots = [...(game.pots ?? []), ...currentRound.pots]
  const refunds = currentRound.refunds
  const totals = buildPlayerTotals(game)
  const awards: PotAward[] = []
  const payouts: Record<string, number> = { ...refunds }

  for (const pot of pots) {
    const contenders = pot.eligiblePlayerIds
      .map((playerId) => game.players.find((player) => player.id === playerId))
      .filter((player): player is Player => Boolean(player))
      .filter((player) => player.state !== 'folded' && !totals[player.id].bust)

    if (contenders.length === 0) {
      awards.push({
        potId: pot.id,
        amount: pot.amount,
        winnerIds: [],
        share: 0,
        reason: 'No non-busting eligible players',
      })
      continue
    }

    const bestTotal = Math.max(...contenders.map((player) => totals[player.id].total))
    const winners = contenders.filter((player) => totals[player.id].total === bestTotal)
    const share = Math.floor(pot.amount / winners.length)
    const remainder = pot.amount - share * winners.length

    winners.forEach((winner, index) => {
      payouts[winner.id] = (payouts[winner.id] ?? 0) + share + (index === 0 ? remainder : 0)
    })

    awards.push({
      potId: pot.id,
      amount: pot.amount,
      winnerIds: winners.map((winner) => winner.id),
      share,
      reason: `Best valid total ${bestTotal}`,
    })
  }

  return { awards, refunds, totals, payouts }
}

function buildPlayerTotals(game: GameState): ShowdownResult['totals'] {
  const totals: ShowdownResult['totals'] = {}

  for (const player of game.players) {
    const total = calculateHandTotal(
      playerScoringCards(player.holeCards, game.communityCards, player.acceptedCommunityCount),
    )

    totals[player.id] = {
      total: total.total,
      bust: total.bust || player.state === 'bust',
    }
  }

  return totals
}
