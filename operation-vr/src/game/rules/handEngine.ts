import type { GameState, Player, PlayerActionInput, PlayerHandState } from '../types/game'
import { calculateHandTotal, playerScoringCards } from './handTotals'
import { getLegalActions } from './legalActions'
import { buildPots } from './pots'

export type ActionResult = {
  game: GameState
  label: string
}

export function applyPlayerAction(game: GameState, playerId: string, action: PlayerActionInput): ActionResult {
  const legalAction = getLegalActions(game, playerId).find((candidate) => candidate.type === action.type)

  if (!legalAction) {
    throw new Error(`Illegal action: ${action.type}`)
  }

  let nextGame = updatePlayer(game, playerId, (player) => {
    switch (action.type) {
      case 'check':
        return player
      case 'stand':
        return { ...player, state: 'standing' }
      case 'fold':
        return { ...player, state: 'folded' }
      case 'call': {
        if (legalAction.type !== 'call') {
          return player
        }

        const chips = player.chips - legalAction.amount
        return {
          ...player,
          chips,
          contribution: player.contribution + legalAction.amount,
          state: chips === 0 ? 'all-in' : action.intent === 'stand' ? 'standing' : player.state,
        }
      }
      case 'raise': {
        if (legalAction.type !== 'raise') {
          return player
        }

        const raiseTo = action.amount ?? legalAction.minTo
        if (raiseTo < legalAction.minTo || raiseTo > player.contribution + player.chips) {
          throw new Error(`Illegal raise amount: ${raiseTo}`)
        }

        const chipAmount = raiseTo - player.contribution
        const chips = player.chips - chipAmount
        return {
          ...player,
          chips,
          contribution: raiseTo,
          state: chips === 0 ? 'all-in' : action.intent === 'stand' ? 'standing' : player.state,
        }
      }
    }
  })

  if (legalAction.type === 'raise') {
    const raiseTo = action.type === 'raise' ? (action.amount ?? legalAction.minTo) : legalAction.minTo
    nextGame = {
      ...nextGame,
      currentBet: raiseTo,
      actedThisRound: [playerId],
    }
  } else {
    nextGame = markPlayerActed(nextGame, playerId)
  }

  nextGame = markBusts(nextGame)
  nextGame = advanceTurn(nextGame)

  return {
    game: nextGame,
    label: legalAction.label,
  }
}

function markPlayerActed(game: GameState, playerId: string): GameState {
  return {
    ...game,
    actedThisRound: [...new Set([...(game.actedThisRound ?? []), playerId])],
  }
}

function updatePlayer(game: GameState, playerId: string, updater: (player: Player) => Player): GameState {
  return {
    ...game,
    players: game.players.map((player) => (player.id === playerId ? updater(player) : player)),
  }
}

function markBusts(game: GameState): GameState {
  return {
    ...game,
    players: game.players.map((player) => {
      if (player.state === 'folded' || player.state === 'standing') {
        return player
      }

      const total = calculateHandTotal(
        playerScoringCards(player.holeCards, game.communityCards, player.acceptedCommunityCount),
      )

      return total.bust ? { ...player, state: 'bust' as PlayerHandState } : player
    }),
  }
}

function advanceTurn(game: GameState): GameState {
  if (remainingContenders(game).length <= 1) {
    const settledGame = settleCurrentRoundPots(game)
    return {
      ...settledGame,
      phase: 'showdown',
      activePlayerId: '',
    }
  }

  const nextPlayer = findNextDecisionPlayer(game)

  if (!nextPlayer) {
    return progressCompletedRound(game)
  }

  return {
    ...game,
    activePlayerId: nextPlayer.id,
  }
}

function progressCompletedRound(game: GameState): GameState {
  const settledGame = settleCurrentRoundPots(game)
  const maxCommunityCards = game.maxCommunityCards ?? 0
  const deck = settledGame.deck ?? []

  if (deck.length > 0 && settledGame.communityCards.length < maxCommunityCards) {
    const [nextCard, ...remainingDeck] = deck
    const nextGame = markBusts({
      ...settledGame,
      phase: 'community-card' as const,
      communityCards: [...settledGame.communityCards, nextCard],
      deck: remainingDeck,
      actedThisRound: [],
      players: settledGame.players.map((player) =>
        acceptsCommunityCards(player)
          ? { ...player, acceptedCommunityCount: player.acceptedCommunityCount + 1 }
          : player,
      ),
    })

    const nextPlayer = findNextDecisionPlayer(nextGame)
    return {
      ...nextGame,
      phase: nextPlayer ? 'player-action' : 'showdown',
      activePlayerId: nextPlayer?.id ?? '',
    }
  }

  return {
    ...settledGame,
    phase: 'showdown',
    activePlayerId: '',
  }
}

function settleCurrentRoundPots(game: GameState): GameState {
  const { pots, refunds } = buildPots(game.players)

  if (pots.length === 0 && Object.keys(refunds).length === 0) {
    return {
      ...game,
      currentBet: 0,
      actedThisRound: [],
      players: game.players.map((player) => ({ ...player, contribution: 0 })),
    }
  }

  const existingPotCount = game.pots?.length ?? 0
  const committedPots = pots.map((pot, index) => ({
    ...pot,
    id: `pot-${existingPotCount + index + 1}`,
  }))

  return {
    ...game,
    currentBet: 0,
    actedThisRound: [],
    pots: [...(game.pots ?? []), ...committedPots],
    players: game.players.map((player) => ({
      ...player,
      chips: player.chips + (refunds[player.id] ?? 0),
      contribution: 0,
    })),
  }
}

function remainingContenders(game: GameState): Player[] {
  return game.players.filter((player) => player.state !== 'folded' && player.state !== 'bust')
}

function findNextDecisionPlayer(game: GameState): Player | undefined {
  const currentIndex = Math.max(
    0,
    game.players.findIndex((player) => player.id === game.activePlayerId),
  )

  for (let offset = 1; offset <= game.players.length; offset += 1) {
    const candidate = game.players[(currentIndex + offset) % game.players.length]
    if (needsDecision(game, candidate)) {
      return candidate
    }
  }

  return undefined
}

function needsDecision(game: GameState, player: Player): boolean {
  if (player.state === 'folded' || player.state === 'bust' || player.state === 'all-in') {
    return false
  }

  if (player.chips <= 0) {
    return false
  }

  const toCall = Math.max(0, game.currentBet - player.contribution)
  if (player.state === 'standing') {
    return toCall > 0
  }

  return toCall > 0 || !((game.actedThisRound ?? []).includes(player.id))
}

function acceptsCommunityCards(player: Player): boolean {
  return player.state !== 'folded' && player.state !== 'bust' && player.state !== 'standing'
}
