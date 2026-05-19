import type { Player, Pot } from '../types/game'

export type PotBuildResult = {
  pots: Pot[]
  refunds: Record<string, number>
}

export function buildPots(players: Player[]): PotBuildResult {
  const contributors = players
    .filter((player) => player.contribution > 0)
    .sort((a, b) => a.contribution - b.contribution)

  const levels = [...new Set(contributors.map((player) => player.contribution))]
  const pots: Pot[] = []
  const refunds: Record<string, number> = {}
  let previousLevel = 0

  for (const level of levels) {
    const eligibleContributors = contributors.filter((player) => player.contribution >= level)
    const contestingPlayers = eligibleContributors.filter((player) => player.state !== 'folded')
    const layerAmount = (level - previousLevel) * eligibleContributors.length

    if (eligibleContributors.length >= 2 && contestingPlayers.length >= 1) {
      pots.push({
        id: `pot-${pots.length + 1}`,
        amount: layerAmount,
        eligiblePlayerIds: contestingPlayers.map((player) => player.id),
        contributionCap: level,
      })
    } else if (eligibleContributors.length === 1) {
      const playerId = eligibleContributors[0].id
      refunds[playerId] = (refunds[playerId] ?? 0) + (level - previousLevel)
    }

    previousLevel = level
  }

  return { pots, refunds }
}
