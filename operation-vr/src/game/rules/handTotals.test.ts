import { describe, expect, it } from 'vitest'
import { calculateHandTotal } from './handTotals'

describe('calculateHandTotal', () => {
  it('uses an ace as eleven when it can', () => {
    expect(
      calculateHandTotal([
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'hearts' },
      ]),
    ).toEqual({ total: 21, soft: true, bust: false })
  })

  it('downgrades aces to avoid busting', () => {
    expect(
      calculateHandTotal([
        { rank: 'A', suit: 'spades' },
        { rank: '7', suit: 'hearts' },
        { rank: '9', suit: 'clubs' },
      ]),
    ).toEqual({ total: 17, soft: false, bust: false })
  })

  it('marks hands over twenty-one as bust after ace adjustment', () => {
    expect(
      calculateHandTotal([
        { rank: 'K', suit: 'spades' },
        { rank: '8', suit: 'hearts' },
        { rank: '5', suit: 'clubs' },
      ]),
    ).toEqual({ total: 23, soft: false, bust: true })
  })
})
