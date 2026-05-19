import { createScriptedDeck } from '../rules/deck'
import type { Card } from '../types/cards'
import type { GameState, Player } from '../types/game'

export type DemoSeat = Pick<Player, 'id' | 'seat' | 'name' | 'chips'>

const buyIn = 10
const bigBlind = buyIn / 10
const smallBlind = bigBlind / 2
const startingSeats: DemoSeat[] = [
  { id: 'p1', seat: 1, name: 'You', chips: buyIn },
  { id: 'p2', seat: 2, name: 'Mina', chips: buyIn },
  { id: 'p3', seat: 3, name: 'Jules', chips: buyIn },
]

const scriptedHands: Card[][] = [
  [
    { rank: 'A', suit: 'spades' },
    { rank: '10', suit: 'hearts' },
    { rank: '9', suit: 'clubs' },
    { rank: '7', suit: 'hearts' },
    { rank: '4', suit: 'clubs' },
    { rank: 'K', suit: 'spades' },
  ],
  [
    { rank: '8', suit: 'diamonds' },
    { rank: 'A', suit: 'clubs' },
    { rank: '6', suit: 'spades' },
    { rank: '5', suit: 'hearts' },
    { rank: '9', suit: 'diamonds' },
    { rank: '3', suit: 'clubs' },
  ],
]

export const demoHand: GameState = createDemoHand()

export function createDemoHand(seats: DemoSeat[] = startingSeats, handNumber = 0): GameState {
  const scriptedDeck = createScriptedDeck(scriptedHands[handNumber % scriptedHands.length])
  const deck = [...scriptedDeck]
  const activeSeats = seats.filter((seat) => seat.chips > 0)
  const roles = tableRolesFor(activeSeats, handNumber)
  const players = activeSeats
    .map<Player>((seat) => {
      const privateCard = deck.shift()
      if (!privateCard) {
        throw new Error('Demo deck ran out of private cards')
      }

      const blind = blindForSeat(seat.id, roles)
      const contribution = Math.min(blind, seat.chips)

      return {
        ...seat,
        chips: seat.chips - contribution,
        contribution,
        state: seat.chips <= blind && blind > 0 ? 'all-in' : 'active',
        holeCards: [privateCard],
        acceptedCommunityCount: 0,
      }
    })
  const activePlayer = firstActionPlayer(players, roles)

  return {
    phase: 'player-action',
    activePlayerId: activePlayer?.id ?? '',
    dealerPlayerId: roles.dealerPlayerId,
    smallBlindPlayerId: roles.smallBlindPlayerId,
    bigBlindPlayerId: roles.bigBlindPlayerId,
    currentBet: bigBlind,
    minRaise: bigBlind,
    communityCards: [],
    deck,
    maxCommunityCards: 3,
    actedThisRound: [],
    pots: [],
    players,
  }
}

type TableRoles = {
  dealerPlayerId?: string
  smallBlindPlayerId?: string
  bigBlindPlayerId?: string
}

function tableRolesFor(seats: DemoSeat[], handNumber: number): TableRoles {
  if (seats.length < 2) {
    return {}
  }

  const dealerIndex = handNumber % seats.length
  const smallBlindIndex = seats.length === 2 ? dealerIndex : (dealerIndex + 1) % seats.length
  const bigBlindIndex = seats.length === 2 ? (dealerIndex + 1) % seats.length : (dealerIndex + 2) % seats.length

  return {
    dealerPlayerId: seats[dealerIndex].id,
    smallBlindPlayerId: seats[smallBlindIndex].id,
    bigBlindPlayerId: seats[bigBlindIndex].id,
  }
}

function blindForSeat(playerId: string, roles: TableRoles) {
  if (playerId === roles.smallBlindPlayerId) {
    return smallBlind
  }

  if (playerId === roles.bigBlindPlayerId) {
    return bigBlind
  }

  return 0
}

function firstActionPlayer(players: Player[], roles: TableRoles) {
  if (!roles.bigBlindPlayerId) {
    return players.find((player) => player.state === 'active')
  }

  const bigBlindIndex = players.findIndex((player) => player.id === roles.bigBlindPlayerId)
  if (bigBlindIndex < 0) {
    return players.find((player) => player.state === 'active')
  }

  for (let offset = 1; offset <= players.length; offset += 1) {
    const candidate = players[(bigBlindIndex + offset) % players.length]
    if (candidate.state === 'active') {
      return candidate
    }
  }

  return undefined
}
