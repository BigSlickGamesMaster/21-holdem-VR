import { describe, expect, it } from 'vitest'
import { createDemoHand } from '../mockData/demoHand'
import type { GameState, Player } from '../types/game'
import { trackedChipValue } from './chipInventory'
import { seatsForNextHand } from './chipSettlement'

const basePlayer: Player = {
  id: 'base',
  seat: 1,
  name: 'Base',
  chips: 9,
  contribution: 0,
  state: 'active',
  holeCards: [],
  acceptedCommunityCount: 1,
}

describe('chip settlement', () => {
  it('pays only the showdown winner into the next hand seats', () => {
    const showdownGame: GameState = {
      phase: 'showdown',
      activePlayerId: '',
      currentBet: 0,
      minRaise: 1,
      communityCards: [{ rank: '8', suit: 'clubs' }],
      pots: [{ id: 'pot-1', amount: 3, eligiblePlayerIds: ['p1', 'p2', 'p3'], contributionCap: 1 }],
      players: [
        { ...basePlayer, id: 'p1', seat: 1, name: 'You', holeCards: [{ rank: '6', suit: 'spades' }] },
        { ...basePlayer, id: 'p2', seat: 2, name: 'Mina', holeCards: [{ rank: '10', suit: 'hearts' }] },
        { ...basePlayer, id: 'p3', seat: 3, name: 'Jules', holeCards: [{ rank: '9', suit: 'diamonds' }] },
      ],
    }

    expect(seatsForNextHand(showdownGame)).toEqual([
      { id: 'p1', seat: 1, name: 'You', chips: 9 },
      { id: 'p2', seat: 2, name: 'Mina', chips: 12 },
      { id: 'p3', seat: 3, name: 'Jules', chips: 9 },
    ])
  })

  it('conserves the table chip total after payouts and new blinds', () => {
    const showdownSeats = [
      { id: 'p1', seat: 1, name: 'You', chips: 9 },
      { id: 'p2', seat: 2, name: 'Mina', chips: 12 },
      { id: 'p3', seat: 3, name: 'Jules', chips: 9 },
    ]
    const nextHand = createDemoHand(showdownSeats, 1)

    expect(trackedChipValue(nextHand)).toBe(30)
  })

  it('does not apply payouts when the hand has already advanced past showdown', () => {
    const activeGame = createDemoHand([
      { id: 'p1', seat: 1, name: 'You', chips: 9 },
      { id: 'p2', seat: 2, name: 'Mina', chips: 12 },
      { id: 'p3', seat: 3, name: 'Jules', chips: 9 },
    ])

    expect(seatsForNextHand(activeGame).map((seat) => seat.chips)).toEqual(activeGame.players.map((player) => player.chips))
  })
})
