import { describe, expect, it } from 'vitest'
import type { GameState, Player } from '../types/game'
import { chooseBotAction } from './botStrategy'

const player: Player = {
  id: 'bot',
  seat: 2,
  name: 'Bot',
  chips: 900,
  contribution: 100,
  state: 'active',
  holeCards: [{ rank: '9', suit: 'clubs' }],
  acceptedCommunityCount: 0,
}

function gameWith(bot: Player, communityCards: GameState['communityCards'] = []): GameState {
  return {
    phase: 'player-action',
    activePlayerId: bot.id,
    currentBet: 100,
    minRaise: 100,
    communityCards,
    maxCommunityCards: 3,
    actedThisRound: [],
    players: [bot],
  }
}

describe('chooseBotAction', () => {
  it('checks when the bot is still chasing a total without facing a bet', () => {
    expect(chooseBotAction(gameWith(player), 'bot')).toEqual({ type: 'check' })
  })

  it('stands on strong totals', () => {
    expect(
      chooseBotAction(
        gameWith({ ...player, acceptedCommunityCount: 1 }, [{ rank: 'K', suit: 'hearts' }]),
        'bot',
      ),
    ).toEqual({ type: 'stand' })
  })

  it('calls reasonable bets', () => {
    expect(chooseBotAction(gameWith({ ...player, contribution: 100, chips: 900, state: 'active' }), 'bot')).toEqual({
      type: 'check',
    })

    expect(
      chooseBotAction(
        {
          ...gameWith(player),
          currentBet: 300,
        },
        'bot',
      ),
    ).toEqual({ type: 'call' })
  })

  it('folds when the call is too expensive', () => {
    expect(
      chooseBotAction(
        {
          ...gameWith(player),
          currentBet: 800,
        },
        'bot',
      ),
    ).toEqual({ type: 'fold' })
  })
})
