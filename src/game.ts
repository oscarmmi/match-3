export const BOARD_SIZE = 8
export const GEM_TYPES = ['rose', 'aqua', 'gold', 'violet', 'mint', 'blue'] as const
export type GemType = (typeof GEM_TYPES)[number]
export type Gem = GemType | null
export type Board = Gem[][]
export interface Position { row: number; col: number }
export interface Resolution { board: Board; cleared: number; cascades: number; points: number }

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function randomGem(random: () => number): GemType {
  return GEM_TYPES[Math.floor(random() * GEM_TYPES.length)]
}

export function createBoard(random: () => number = Math.random): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => Array<Gem>(BOARD_SIZE).fill(null))
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let gem = randomGem(random)
      while (
        (col >= 2 && board[row][col - 1] === gem && board[row][col - 2] === gem) ||
        (row >= 2 && board[row - 1][col] === gem && board[row - 2][col] === gem)
      ) gem = randomGem(random)
      board[row][col] = gem
    }
  }
  return board
}

export function findMatches(board: Board): Position[] {
  const matched = new Map<string, Position>()
  const addRun = (positions: Position[]) => {
    if (positions.length >= 3) for (const position of positions) matched.set(`${position.row}-${position.col}`, position)
  }

  for (let row = 0; row < board.length; row += 1) {
    let start = 0
    while (start < board[row].length) {
      const gem = board[row][start]
      let end = start + 1
      while (gem !== null && end < board[row].length && board[row][end] === gem) end += 1
      if (gem !== null) addRun(Array.from({ length: end - start }, (_, offset) => ({ row, col: start + offset })))
      start = end
    }
  }

  for (let col = 0; col < board[0].length; col += 1) {
    let start = 0
    while (start < board.length) {
      const gem = board[start][col]
      let end = start + 1
      while (gem !== null && end < board.length && board[end][col] === gem) end += 1
      if (gem !== null) addRun(Array.from({ length: end - start }, (_, offset) => ({ row: start + offset, col })))
      start = end
    }
  }
  return [...matched.values()]
}

export function swapGems(board: Board, first: Position, second: Position): Board {
  const next = cloneBoard(board)
  const temp = next[first.row][first.col]
  next[first.row][first.col] = next[second.row][second.col]
  next[second.row][second.col] = temp
  return next
}

export function isLegalSwap(board: Board, first: Position, second: Position): boolean {
  if (Math.abs(first.row - second.row) + Math.abs(first.col - second.col) !== 1) return false
  return findMatches(swapGems(board, first, second)).length > 0
}

export function clearAndDrop(board: Board, matches = findMatches(board), random: () => number = Math.random): Board {
  const next = cloneBoard(board)
  for (const { row, col } of matches) next[row][col] = null

  for (let col = 0; col < next[0].length; col += 1) {
    const remaining = next.map((row) => row[col]).filter((gem): gem is GemType => gem !== null)
    const refill = Array.from({ length: next.length - remaining.length }, () => randomGem(random))
    const column = [...refill, ...remaining]
    for (let row = 0; row < next.length; row += 1) next[row][col] = column[row]
  }
  return next
}

export function resolveBoard(board: Board, random: () => number = Math.random): Resolution {
  let next = cloneBoard(board)
  let cleared = 0
  let cascades = 0
  let points = 0
  let matches = findMatches(next)
  while (matches.length > 0 && cascades < 20) {
    cascades += 1
    cleared += matches.length
    points += matches.length * 10 * cascades
    next = clearAndDrop(next, matches, random)
    matches = findMatches(next)
  }
  return { board: next, cleared, cascades, points }
}
