import { describe, expect, it } from 'vitest'
import { trackedChipValue } from '../rules/chipInventory'
import type { GameState, Player } from '../types/game'
import { useGameStore } from './useGameStore'

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

function losingHumanShowdown(): GameState {
  return {
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
}

describe('useGameStore chip settlement', () => {
  it('settles showdown once and ignores repeated next-hand presses after the hand advances', () => {
    useGameStore.setState({
      game: losingHumanShowdown(),
      handNumber: 0,
      dealAnimationKey: 1,
      actionMenu: 'main',
      selectedRaiseTo: 0,
      stagedBetAction: null,
    })

    useGameStore.getState().startNextHand()
    const afterFirstPress = useGameStore.getState()
    const chipStacks = afterFirstPress.game.players.map((player) => player.chips)

    useGameStore.getState().startNextHand()
    const afterSecondPress = useGameStore.getState()

    expect(afterFirstPress.handNumber).toBe(1)
    expect(afterSecondPress.handNumber).toBe(1)
    expect(afterSecondPress.game.players.map((player) => player.chips)).toEqual(chipStacks)
    expect(trackedChipValue(afterSecondPress.game)).toBe(30)
  })
})
