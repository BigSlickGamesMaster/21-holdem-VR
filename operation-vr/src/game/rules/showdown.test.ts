import { describe, expect, it } from 'vitest'
import type { GameState, Player } from '../types/game'
import { resolveShowdown } from './showdown'

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

function makeGame(players: Player[]): GameState {
  return {
    phase: 'showdown',
    activePlayerId: '',
    currentBet: 0,
    minRaise: 100,
    communityCards: [],
    players,
  }
}

describe('resolveShowdown', () => {
  it('awards main and side pots by each pot eligibility group', () => {
    const result = resolveShowdown(
      makeGame([
        {
          ...basePlayer,
          id: 'a',
          contribution: 400,
          holeCards: [
            { rank: 'A', suit: 'spades' },
            { rank: 'K', suit: 'hearts' },
          ],
        },
        {
          ...basePlayer,
          id: 'b',
          contribution: 900,
          holeCards: [
            { rank: '10', suit: 'clubs' },
            { rank: '9', suit: 'diamonds' },
          ],
        },
        {
          ...basePlayer,
          id: 'c',
          contribution: 900,
          holeCards: [
            { rank: '8', suit: 'clubs' },
            { rank: '8', suit: 'diamonds' },
          ],
        },
      ]),
    )

    expect(result.awards).toEqual([
      { potId: 'pot-1', amount: 1200, winnerIds: ['a'], share: 1200, reason: 'Best valid total 21' },
      { potId: 'pot-2', amount: 1000, winnerIds: ['b'], share: 1000, reason: 'Best valid total 19' },
    ])
    expect(result.payouts).toEqual({ a: 1200, b: 1000 })
  })

  it('excludes bust players from winning by hand strength', () => {
    const result = resolveShowdown(
      makeGame([
        {
          ...basePlayer,
          id: 'a',
          contribution: 400,
          holeCards: [
            { rank: 'K', suit: 'spades' },
            { rank: '9', suit: 'hearts' },
            { rank: '5', suit: 'clubs' },
          ],
        },
        {
          ...basePlayer,
          id: 'b',
          contribution: 400,
          holeCards: [
            { rank: '10', suit: 'clubs' },
            { rank: '8', suit: 'diamonds' },
          ],
        },
      ]),
    )

    expect(result.awards[0]).toMatchObject({ winnerIds: ['b'], reason: 'Best valid total 18' })
    expect(result.payouts).toEqual({ b: 800 })
  })

  it('splits tied pots evenly and assigns odd remainder to the first winner deterministically', () => {
    const result = resolveShowdown(
      makeGame([
        {
          ...basePlayer,
          id: 'a',
          contribution: 401,
          holeCards: [
            { rank: '10', suit: 'spades' },
            { rank: '9', suit: 'hearts' },
          ],
        },
        {
          ...basePlayer,
          id: 'b',
          contribution: 401,
          holeCards: [
            { rank: 'K', suit: 'clubs' },
            { rank: '9', suit: 'diamonds' },
          ],
        },
      ]),
    )

    expect(result.awards[0]).toMatchObject({ amount: 802, winnerIds: ['a', 'b'], share: 401 })
    expect(result.payouts).toEqual({ a: 401, b: 401 })
  })

  it('returns uncalled excess separately from contestable pot payouts', () => {
    const result = resolveShowdown(
      makeGame([
        {
          ...basePlayer,
          id: 'a',
          contribution: 400,
          holeCards: [
            { rank: '10', suit: 'spades' },
            { rank: '8', suit: 'hearts' },
          ],
        },
        {
          ...basePlayer,
          id: 'b',
          contribution: 900,
          holeCards: [
            { rank: '9', suit: 'clubs' },
            { rank: '7', suit: 'diamonds' },
          ],
        },
      ]),
    )

    expect(result.refunds).toEqual({ b: 500 })
    expect(result.payouts).toEqual({ a: 800, b: 500 })
  })
})
