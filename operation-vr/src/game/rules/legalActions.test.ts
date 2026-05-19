import { describe, expect, it } from 'vitest'
import type { GameState, Player } from '../types/game'
import { getLegalActions } from './legalActions'

const player: Player = {
  id: 'p1',
  seat: 1,
  name: 'Player',
  chips: 300,
  contribution: 100,
  state: 'active',
  holeCards: [],
  acceptedCommunityCount: 0,
}

const game: GameState = {
  phase: 'player-action',
  activePlayerId: 'p1',
  currentBet: 500,
  minRaise: 100,
  communityCards: [],
  players: [player],
}

describe('getLegalActions', () => {
  it('shows a short call as all-in instead of an impossible full call', () => {
    const actions = getLegalActions(game, 'p1')

    expect(actions).toContainEqual({ type: 'call', label: 'All-in 300', amount: 300, allIn: true })
  })

  it('keeps standing players responsible for later calls', () => {
    const actions = getLegalActions(
      {
        ...game,
        players: [{ ...player, state: 'standing', chips: 600 }],
      },
      'p1',
    )

    expect(actions).toContainEqual({ type: 'call', label: 'Call 400', amount: 400, allIn: false })
    expect(actions.some((action) => action.type === 'stand')).toBe(false)
  })

  it('does not offer actions to folded players', () => {
    const actions = getLegalActions(
      {
        ...game,
        players: [{ ...player, state: 'folded' }],
      },
      'p1',
    )

    expect(actions).toEqual([])
  })
})
