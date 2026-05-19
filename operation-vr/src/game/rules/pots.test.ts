import { describe, expect, it } from 'vitest'
import type { Player } from '../types/game'
import { buildPots } from './pots'

const basePlayer: Player = {
  id: 'base',
  seat: 1,
  name: 'Base',
  chips: 0,
  contribution: 0,
  state: 'active',
  holeCards: [],
  acceptedCommunityCount: 0,
}

describe('buildPots', () => {
  it('builds main and side pots from contribution layers', () => {
    const result = buildPots([
      { ...basePlayer, id: 'a', contribution: 400 },
      { ...basePlayer, id: 'b', contribution: 900 },
      { ...basePlayer, id: 'c', contribution: 900 },
    ])

    expect(result.pots).toEqual([
      { id: 'pot-1', amount: 1200, eligiblePlayerIds: ['a', 'b', 'c'], contributionCap: 400 },
      { id: 'pot-2', amount: 1000, eligiblePlayerIds: ['b', 'c'], contributionCap: 900 },
    ])
    expect(result.refunds).toEqual({})
  })

  it('refunds uncalled excess above the highest contestable layer', () => {
    const result = buildPots([
      { ...basePlayer, id: 'a', contribution: 400 },
      { ...basePlayer, id: 'b', contribution: 900 },
    ])

    expect(result.pots).toEqual([
      { id: 'pot-1', amount: 800, eligiblePlayerIds: ['a', 'b'], contributionCap: 400 },
    ])
    expect(result.refunds).toEqual({ b: 500 })
  })

  it('keeps folded chips in contestable pots but removes folded players from eligibility', () => {
    const result = buildPots([
      { ...basePlayer, id: 'a', contribution: 400, state: 'folded' },
      { ...basePlayer, id: 'b', contribution: 400 },
    ])

    expect(result.pots).toEqual([
      { id: 'pot-1', amount: 800, eligiblePlayerIds: ['b'], contributionCap: 400 },
    ])
    expect(result.refunds).toEqual({})
  })
})
