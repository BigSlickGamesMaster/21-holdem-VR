import type { Card, Rank, Suit } from '../types/cards'

const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function createDeck(): Card[] {
  return suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })))
}

export function createScriptedDeck(cards: Card[]): Card[] {
  const used = new Set(cards.map(cardKey))
  return [...cards, ...createDeck().filter((card) => !used.has(cardKey(card)))]
}

function cardKey(card: Card) {
  return `${card.rank}-${card.suit}`
}
