import { describe, expect, it } from 'vitest'
import { clearAndDrop, findMatches, isLegalSwap, resolveBoard, swapGems, type Board } from './game'

const boardFrom = (rows: string[]): Board => rows.map((row) => row.split('').map((gem) => gem === '.' ? null : gem as Board[number][number]))

describe('Gleam Grid game logic', () => {
  it('accepts an adjacent swap that makes a line of three', () => {
    const board = boardFrom(['rgr', 'rgr', 'g.g'])
    expect(isLegalSwap(board, { row: 1, col: 1 }, { row: 2, col: 1 })).toBe(true)
    expect(findMatches(swapGems(board, { row: 1, col: 1 }, { row: 2, col: 1 }))).toHaveLength(3)
  })

  it('rejects an adjacent swap that does not make a match', () => {
    const board = boardFrom(['rgb', 'bgr', 'grb'])
    expect(isLegalSwap(board, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false)
  })

  it('drops gems above cleared cells toward the bottom', () => {
    const board = boardFrom(['rbg', 'gbg', 'rrr'])
    const next = clearAndDrop(board, findMatches(board), () => 0.99)
    expect(next[2][0]).toBe('g')
    expect(next[2][1]).toBe('b')
    expect(next[2][2]).toBe('g')
  })

  it('awards ten points for each gem cleared', () => {
    const board = boardFrom(['rgb', 'rgb', 'rrr'])
    const result = resolveBoard(board, () => 0.2)
    expect(result.cleared).toBeGreaterThanOrEqual(3)
    expect(result.points).toBeGreaterThanOrEqual(30)
  })
})
