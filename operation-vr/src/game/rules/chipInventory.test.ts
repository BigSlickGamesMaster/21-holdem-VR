import { describe, expect, it } from 'vitest'
import { createDemoHand } from '../mockData/demoHand'
import { applyPlayerAction } from './handEngine'
import { chipPiecesForAmount, chipValueForPieces, trackedChipValue } from './chipInventory'

describe('chipInventory', () => {
  it('represents demo chip values with exact one and half chip pieces', () => {
    expect(chipPiecesForAmount(10)).toHaveLength(10)
    expect(chipValueForPieces(chipPiecesForAmount(10))).toBe(10)

    const nineAndHalf = chipPiecesForAmount(9.5)
    expect(nineAndHalf).toHaveLength(10)
    expect(nineAndHalf.filter((chip) => chip.value === 1)).toHaveLength(9)
    expect(nineAndHalf.filter((chip) => chip.value === 0.5)).toHaveLength(1)
    expect(chipValueForPieces(nineAndHalf)).toBe(9.5)
  })

  it('tracks the full table value through blinds, calls, and committed pots', () => {
    const game = createDemoHand()
    expect(trackedChipValue(game)).toBe(30)

    const afterCall = applyPlayerAction(game, 'p1', { type: 'call' }).game
    expect(trackedChipValue(afterCall)).toBe(30)

    const afterSmallBlindCall = applyPlayerAction(afterCall, 'p2', { type: 'call' }).game
    expect(trackedChipValue(afterSmallBlindCall)).toBe(30)

    const afterBigBlindCheck = applyPlayerAction(afterSmallBlindCall, 'p3', { type: 'check' }).game
    expect(trackedChipValue(afterBigBlindCheck)).toBe(30)
    expect(afterBigBlindCheck.pots?.reduce((sum, pot) => sum + pot.amount, 0)).toBe(3)
    expect(afterBigBlindCheck.players.every((player) => player.contribution === 0)).toBe(true)
  })
})
