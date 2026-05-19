import { describe, expect, it } from 'vitest'
import type { GameState, Player } from '../types/game'
import { getRaiseOptions } from './raiseOptions'

const player: Player = {
  id: 'p1',
  seat: 1,
  name: 'Player',
  chips: 3,
  contribution: 1,
  state: 'active',
  holeCards: [],
  acceptedCommunityCount: 0,
}

const game: GameState = {
  phase: 'player-action',
  activePlayerId: 'p1',
  currentBet: 1,
  minRaise: 1,
  communityCards: [],
  players: [player, { ...player, id: 'p2', seat: 2, chips: 8, contribution: 1 }],
}

describe('getRaiseOptions', () => {
  it('caps pot-sized raises at the player all-in amount', () => {
    const options = getRaiseOptions(
      {
        ...game,
        pots: [{ id: 'pot-1', amount: 10, eligiblePlayerIds: ['p1', 'p2'], contributionCap: 1 }],
      },
      'p1',
    )

    expect(options).toEqual({
      min: 2,
      halfPot: 4,
      pot: 4,
      max: 4,
    })
  })

  it('does not offer a raise when the player cannot reach the minimum raise', () => {
    const options = getRaiseOptions(
      {
        ...game,
        currentBet: 4,
        players: [{ ...player, chips: 2, contribution: 1 }],
      },
      'p1',
    )

    expect(options).toBeNull()
  })
})
