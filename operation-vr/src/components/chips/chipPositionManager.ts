import { chipPiecesForAmount, type ChipPiece } from '../../game/rules/chipInventory'

export type ChipStackLayout = 'player' | 'pot'

export type ChipPlacement = {
  chip: ChipPiece
  position: [number, number, number]
  rotation: [number, number, number]
  columnIndex: number
  layerIndex: number
}

export type ChipPositionManager = {
  placementsForAmount: (amount: number, layout: ChipStackLayout) => ChipPlacement[]
}

type StackColumn = {
  x: number
  z: number
  yaw?: number
}

const chipHeight = 0.012
const maxColumnHeight = 10

const playerColumns: StackColumn[] = [
  { x: 0, z: 0 },
  { x: -0.105, z: 0.01 },
  { x: 0.105, z: -0.01 },
  { x: 0, z: -0.105 },
]

const potColumns: StackColumn[] = [
  { x: 0, z: 0 },
  { x: -0.105, z: 0.012, yaw: -0.08 },
  { x: 0.105, z: -0.006, yaw: 0.07 },
  { x: -0.052, z: -0.102, yaw: 0.04 },
  { x: 0.052, z: -0.102, yaw: -0.05 },
]

export function createChipPositionManager(): ChipPositionManager {
  return {
    placementsForAmount(amount, layout) {
      const chips = chipPiecesForAmount(amount)
      const columns = layout === 'pot' ? potColumns : playerColumns

      return chips.map((chip, index) => {
        const columnIndex = Math.min(Math.floor(index / maxColumnHeight), columns.length - 1)
        const layerIndex = index - columnIndex * maxColumnHeight
        const column = columns[columnIndex]

        return {
          chip,
          columnIndex,
          layerIndex,
          position: [column.x, layerIndex * chipHeight, column.z],
          rotation: [0, column.yaw ?? 0, 0],
        }
      })
    },
  }
}
