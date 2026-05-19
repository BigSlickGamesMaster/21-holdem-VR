import type { Card } from '../types/cards'

export type HandTotal = {
  total: number
  soft: boolean
  bust: boolean
}

export function cardBaseValue(card: Card): number {
  if (card.rank === 'A') {
    return 11
  }

  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
    return 10
  }

  return Number(card.rank)
}

export function calculateHandTotal(cards: Card[]): HandTotal {
  let total = 0
  let aces = 0

  for (const card of cards) {
    total += cardBaseValue(card)
    if (card.rank === 'A') {
      aces += 1
    }
  }

  let adjustedAces = 0
  while (total > 21 && adjustedAces < aces) {
    total -= 10
    adjustedAces += 1
  }

  return {
    total,
    soft: aces > adjustedAces && total <= 21,
    bust: total > 21,
  }
}

export function playerScoringCards(holeCards: Card[], communityCards: Card[], acceptedCount: number) {
  return [...holeCards, ...communityCards.slice(0, acceptedCount)]
}
