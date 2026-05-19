import { describe, expect, it } from 'vitest'
import type { GameState, Player } from '../types/game'
import { applyPlayerAction } from './handEngine'

const basePlayer: Player = {
  id: 'p1',
  seat: 1,
  name: 'Player',
  chips: 500,
  contribution: 100,
  state: 'active',
  holeCards: [],
  acceptedCommunityCount: 0,
}

function gameWith(players: Player[], activePlayerId = players[0].id): GameState {
  return {
    phase: 'player-action',
    activePlayerId,
    currentBet: 400,
    minRaise: 100,
    communityCards: [],
    players,
  }
}

describe('applyPlayerAction', () => {
  it('applies a normal call and advances to the next decision player', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 500, contribution: 100 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 100 },
      ]),
      'p1',
      { type: 'call' },
    )

    expect(result.label).toBe('Call 300')
    expect(result.game.players[0]).toMatchObject({ chips: 200, contribution: 400, state: 'active' })
    expect(result.game.activePlayerId).toBe('p2')
  })

  it('applies a short call as all-in without asking for unavailable chips', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 250, contribution: 100 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 100 },
      ]),
      'p1',
      { type: 'call' },
    )

    expect(result.label).toBe('All-in 250')
    expect(result.game.players[0]).toMatchObject({ chips: 0, contribution: 350, state: 'all-in' })
  })

  it('lets a standing player call a later bet without changing card intake state', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', state: 'standing', chips: 500, contribution: 100 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 400 },
      ]),
      'p1',
      { type: 'call' },
    )

    expect(result.game.players[0]).toMatchObject({ chips: 200, contribution: 400, state: 'standing' })
  })

  it('can attach stand intent to a call', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 500, contribution: 100 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 400 },
      ]),
      'p1',
      { type: 'call', intent: 'stand' },
    )

    expect(result.game.players[0]).toMatchObject({ chips: 200, contribution: 400, state: 'standing' })
  })

  it('applies a minimum raise and updates the current bet', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 800, contribution: 400 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 400 },
      ]),
      'p1',
      { type: 'raise' },
    )

    expect(result.label).toBe('Raise')
    expect(result.game.currentBet).toBe(500)
    expect(result.game.players[0]).toMatchObject({ chips: 700, contribution: 500 })
    expect(result.game.activePlayerId).toBe('p2')
  })

  it('can attach stand intent to a raise', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 800, contribution: 400 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 400 },
      ]),
      'p1',
      { type: 'raise', amount: 500, intent: 'stand' },
    )

    expect(result.game.currentBet).toBe(500)
    expect(result.game.players[0]).toMatchObject({ chips: 700, contribution: 500, state: 'standing' })
  })

  it('marks a folded player as unable to receive later decisions', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 500, contribution: 100 },
        { ...basePlayer, id: 'p2', chips: 500, contribution: 400 },
      ]),
      'p1',
      { type: 'fold' },
    )

    expect(result.game.players[0].state).toBe('folded')
    expect(result.game.phase).toBe('showdown')
  })

  it('moves to showdown when every remaining player is all-in or settled', () => {
    const result = applyPlayerAction(
      gameWith([
        { ...basePlayer, id: 'p1', chips: 300, contribution: 100 },
        { ...basePlayer, id: 'p2', chips: 0, contribution: 400, state: 'all-in' },
      ]),
      'p1',
      { type: 'call' },
    )

    expect(result.game.players[0]).toMatchObject({ chips: 0, contribution: 0, state: 'all-in' })
    expect(result.game.pots).toEqual([{ id: 'pot-1', amount: 800, eligiblePlayerIds: ['p1', 'p2'], contributionCap: 400 }])
    expect(result.game.phase).toBe('showdown')
    expect(result.game.activePlayerId).toBe('')
  })

  it('commits main and side pots when a short all-in cannot fully cover the bet', () => {
    const result = applyPlayerAction(
      {
        ...gameWith(
          [
            { ...basePlayer, id: 'p1', chips: 250, contribution: 100 },
            { ...basePlayer, id: 'p2', chips: 0, contribution: 400, state: 'all-in' },
            { ...basePlayer, id: 'p3', chips: 500, contribution: 400 },
          ],
          'p1',
        ),
        deck: [],
        maxCommunityCards: 0,
        actedThisRound: ['p2', 'p3'],
      },
      'p1',
      { type: 'call' },
    )

    expect(result.game.players.map((player) => ({ id: player.id, contribution: player.contribution }))).toEqual([
      { id: 'p1', contribution: 0 },
      { id: 'p2', contribution: 0 },
      { id: 'p3', contribution: 0 },
    ])
    expect(result.game.pots).toEqual([
      { id: 'pot-1', amount: 1050, eligiblePlayerIds: ['p1', 'p2', 'p3'], contributionCap: 350 },
      { id: 'pot-2', amount: 100, eligiblePlayerIds: ['p2', 'p3'], contributionCap: 400 },
    ])
    expect(result.game.phase).toBe('showdown')
  })

  it('deals the next community card when all decision players have acted', () => {
    const result = applyPlayerAction(
      {
        ...gameWith([
          { ...basePlayer, id: 'p1', chips: 500, contribution: 400 },
          { ...basePlayer, id: 'p2', chips: 0, contribution: 400, state: 'all-in' },
        ]),
        deck: [{ rank: '7', suit: 'hearts' }],
        maxCommunityCards: 1,
        actedThisRound: [],
      },
      'p1',
      { type: 'check' },
    )

    expect(result.game.phase).toBe('player-action')
    expect(result.game.communityCards).toEqual([{ rank: '7', suit: 'hearts' }])
    expect(result.game.players[0].acceptedCommunityCount).toBe(1)
    expect(result.game.players[1].acceptedCommunityCount).toBe(1)
  })

  it('does not give future community cards to standing players', () => {
    const result = applyPlayerAction(
      {
        ...gameWith([
          { ...basePlayer, id: 'p1', chips: 500, contribution: 400 },
          { ...basePlayer, id: 'p2', chips: 0, contribution: 400, state: 'all-in' },
        ]),
        deck: [{ rank: '7', suit: 'hearts' }],
        maxCommunityCards: 1,
        actedThisRound: [],
      },
      'p1',
      { type: 'stand' },
    )

    expect(result.game.communityCards).toEqual([{ rank: '7', suit: 'hearts' }])
    expect(result.game.players[0]).toMatchObject({ state: 'standing', acceptedCommunityCount: 0 })
    expect(result.game.players[1]).toMatchObject({ state: 'all-in', acceptedCommunityCount: 1 })
  })
})
