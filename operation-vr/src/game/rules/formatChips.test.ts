import { describe, expect, it } from 'vitest'
import { formatChips } from './formatChips'

describe('formatChips', () => {
  it('formats whole and fractional chip amounts cleanly', () => {
    expect(formatChips(1)).toBe('1')
    expect(formatChips(0.5)).toBe('0.5')
    expect(formatChips(1.25)).toBe('1.25')
  })
})
