import { describe, expect, it } from 'vitest'
import { chipValueForPieces } from '../../game/rules/chipInventory'
import { createChipPositionManager } from './chipPositionManager'

describe('chipPositionManager', () => {
  it('keeps stack columns to a maximum height of 10 chips', () => {
    const manager = createChipPositionManager()
    const placements = manager.placementsForAmount(25, 'player')
    const heights = new Map<number, number>()

    placements.forEach((placement) => {
      heights.set(placement.columnIndex, Math.max(heights.get(placement.columnIndex) ?? 0, placement.layerIndex + 1))
    })

    expect(Math.max(...heights.values())).toBeLessThanOrEqual(10)
  })

  it('places one chip per tracked chip piece without changing chip value', () => {
    const manager = createChipPositionManager()
    const placements = manager.placementsForAmount(9.5, 'pot')

    expect(placements).toHaveLength(6)
    expect(chipValueForPieces(placements.map((placement) => placement.chip))).toBe(9.5)
  })
})
