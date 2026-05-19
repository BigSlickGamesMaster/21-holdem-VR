import { describe, expect, it } from 'vitest'
import { createDemoHand } from './demoHand'

describe('createDemoHand', () => {
  it('posts small and big blinds based on one tenth of buy-in and deals one private card', () => {
    const game = createDemoHand([
      { id: 'p1', seat: 1, name: 'You', chips: 10 },
      { id: 'p2', seat: 2, name: 'Mina', chips: 10 },
      { id: 'p3', seat: 3, name: 'Jules', chips: 10 },
    ])

    expect(game.currentBet).toBe(1)
    expect(game.dealerPlayerId).toBe('p1')
    expect(game.smallBlindPlayerId).toBe('p2')
    expect(game.bigBlindPlayerId).toBe('p3')
    expect(game.activePlayerId).toBe('p1')
    expect(game.players).toHaveLength(3)
    expect(game.players[0]).toMatchObject({ chips: 10, contribution: 0, state: 'active' })
    expect(game.players[1]).toMatchObject({ chips: 9.5, contribution: 0.5, state: 'active' })
    expect(game.players[2]).toMatchObject({ chips: 9, contribution: 1, state: 'active' })
    expect(game.players.every((player) => player.holeCards.length === 1)).toBe(true)
    expect(game.communityCards).toEqual([])
    expect(game.deck).toHaveLength(49)
  })

  it('rotates dealer and blinds on later hands', () => {
    const game = createDemoHand(
      [
        { id: 'p1', seat: 1, name: 'You', chips: 10 },
        { id: 'p2', seat: 2, name: 'Mina', chips: 10 },
        { id: 'p3', seat: 3, name: 'Jules', chips: 10 },
      ],
      1,
    )

    expect(game.dealerPlayerId).toBe('p2')
    expect(game.smallBlindPlayerId).toBe('p3')
    expect(game.bigBlindPlayerId).toBe('p1')
    expect(game.activePlayerId).toBe('p2')
    expect(game.players.map((player) => player.contribution)).toEqual([1, 0, 0.5])
  })

  it('uses the dealer as small blind in heads-up hands', () => {
    const game = createDemoHand([
      { id: 'p1', seat: 1, name: 'You', chips: 10 },
      { id: 'p2', seat: 2, name: 'Mina', chips: 10 },
    ])

    expect(game.dealerPlayerId).toBe('p1')
    expect(game.smallBlindPlayerId).toBe('p1')
    expect(game.bigBlindPlayerId).toBe('p2')
    expect(game.activePlayerId).toBe('p1')
    expect(game.players.map((player) => player.contribution)).toEqual([0.5, 1])
  })

  it('marks a short blind as all-in instead of asking for unavailable chips', () => {
    const game = createDemoHand([
      { id: 'p1', seat: 1, name: 'You', chips: 10 },
      { id: 'p2', seat: 2, name: 'Short', chips: 0.75 },
    ])

    expect(game.players[1]).toMatchObject({ chips: 0, contribution: 0.75, state: 'all-in' })
    expect(game.activePlayerId).toBe('p1')
  })
})
