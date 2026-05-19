import { describe, expect, it } from 'vitest'
import { createDemoHand } from '../mockData/demoHand'
import { applyPlayerAction } from './handEngine'
import { buildHandDebugSummary } from './handDebug'

describe('buildHandDebugSummary', () => {
  it('summarizes the initial booted demo hand', () => {
    const summary = buildHandDebugSummary(createDemoHand())

    expect(summary).toMatchObject({
      phase: 'player-action',
      activePlayerId: 'p1',
      dealerPlayerId: 'p1',
      smallBlindPlayerId: 'p2',
      bigBlindPlayerId: 'p3',
      currentBet: 1,
      actedThisRound: [],
      communityCards: [],
      deckCount: 49,
      refunds: {},
      payouts: {},
    })
    expect(summary.players.map((player) => player.contribution)).toEqual([0, 0.5, 1])
    expect(summary.players.map((player) => player.acceptedCommunityCount)).toEqual([0, 0, 0])
    expect(summary.players[0].legalActions).toEqual(['Call 1', 'Fold', 'Raise'])
    expect(summary.pots).toEqual([
      { id: 'pot-1', amount: 1, eligiblePlayerIds: ['p2', 'p3'], contributionCap: 0.5 },
    ])
  })

  it('captures community-card intake after a settled round', () => {
    const afterYou = applyPlayerAction(createDemoHand(), 'p1', { type: 'call' }).game
    const afterMina = applyPlayerAction(afterYou, 'p2', { type: 'call' }).game
    const afterJules = applyPlayerAction(afterMina, 'p3', { type: 'check' }).game
    const summary = buildHandDebugSummary(afterJules)

    expect(summary.communityCards).toEqual(['7-hearts'])
    expect(summary.actedThisRound).toEqual([])
    expect(summary.players.map((player) => player.acceptedCommunityCount)).toEqual([1, 1, 1])
  })
})
