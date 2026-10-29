<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  BOARD_SIZE,
  createBoard,
  findMatches,
  resolveBoard,
  swapGems,
  type Board,
  type Position,
} from './game'

const bestKey = 'gleam-grid-best'
const board = ref<Board>(createBoard())
const selected = ref<Position | null>(null)
const cursor = ref<Position>({ row: 3, col: 3 })
const score = ref(0)
const best = ref(Number(localStorage.getItem(bestKey) ?? 0))
const moves = ref(0)
const isBusy = ref(false)
const clearing = ref<string[]>([])
const message = ref('Make a match to start the streak')
const comboLabel = ref('')
let messageTimer: ReturnType<typeof setTimeout> | undefined

const scoreDigits = computed(() => String(score.value).padStart(5, '0'))

function positionKey(position: Position) {
  return `${position.row}-${position.col}`
}

function setMessage(text: string) {
  message.value = text
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    if (!isBusy.value) message.value = 'Make a match to start the streak'
  }, 2400)
}

function restart() {
  board.value = createBoard()
  selected.value = null
  cursor.value = { row: 3, col: 3 }
  score.value = 0
  moves.value = 0
  comboLabel.value = ''
  clearing.value = []
  isBusy.value = false
  setMessage('A fresh grid. Find your first match.')
}

function isNeighbor(a: Position, b: Position) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

async function choose(position: Position) {
  if (isBusy.value) return
  cursor.value = position
  if (!selected.value) {
    selected.value = position
    return
  }

  const first = selected.value
  if (positionKey(first) === positionKey(position)) {
    selected.value = null
    return
  }
  if (!isNeighbor(first, position)) {
    selected.value = position
    return
  }

  const swapped = swapGems(board.value, first, position)
  const matches = findMatches(swapped)
  selected.value = null
  if (matches.length ===  0) {
    setMessage('No match there — try another swap')
    return
  }

  isBusy.value = true
  moves.value += 1
  board.value = swapped
  clearing.value = matches.map(positionKey)
  await new Promise((resolve) => setTimeout(resolve, 190))
  const result = resolveBoard(board.value)
  board.value = result.board
  clearing.value = []
  score.value += result.points
  if (score.value > best.value) {
    best.value = score.value
    localStorage.setItem(bestKey, String(best.value))
  }
  if (result.cascades > 1) {
    comboLabel.value = `${result.cascades}× cascade`
    setMessage(`Cascade x${result.cascades}! Beautifully done.`)
    setTimeout(() => (comboLabel.value = ''), 1100)
  } else {
    setMessage('Lovely match. Keep the gems falling.')
  }
  await new Promise((resolve) => setTimeout(resolve, 240))
  isBusy.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key.toLowerCase() === 'r') {
    restart()
    return
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault()
    const delta = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    }[event.key]!
    cursor.value = {
      row: Math.max(0, Math.min(BOARD_SIZE - 1, cursor.value.row + delta[0])),
      col: Math.max(0, Math.min(BOARD_SIZE - 1, cursor.value.col + delta[1])),
    }
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    void choose(cursor.value)
  }
  if (event.key === 'Escape') selected.value = null
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (messageTimer) clearTimeout(messageTimer)
})
</script>

<template>
  <main class="page-shell">
    <div class="ambient ambient--one" aria-hidden="true"></div>
    <div class="ambient ambient--two" aria-hidden="true"></div>
    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="Gleam Grid home">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span>gleam<span class="wordmark-light">grid</span></span>
      </a>
      <div class="topbar-right">
        <span class="edition"><span class="live-dot"></span> DAILY PLAY</span>
        <button class="icon-button" type="button" aria-label="Restart game" title="Restart (R)" @click="restart">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4.9 9a7.5 7.5 0 0 1 12.7-2L20 12M4 17v-5h5m10.1 3a7.5 7.5 0 0 1-12.7 2L4 12" /></svg>
        </button>
      </div>
    </header>

    <section id="top" class="game-layout" aria-label="Gleam Grid match-three game">
      <div class="intro-column">
        <div class="eyebrow"><span class="eyebrow-line"></span> A LITTLE LIGHT, A LOT OF SPARK</div>
        <h1>Find your<br /><em>flow state.</em></h1>
        <p class="intro-copy">A moment of calm in a colorful world. Line up three or more to clear the board and let the good things fall.</p>

        <div class="score-card" aria-live="polite">
          <div class="score-card-top">
            <span class="stat-label">YOUR SCORE</span>
            <span class="score-flare" aria-hidden="true">✦</span>
          </div>
          <div class="score-value">{{ scoreDigits }}</div>
          <div class="score-card-footer">
            <span><span class="tiny-spark" aria-hidden="true">✧</span> BEST <b>{{ String(best).padStart(5, '0') }}</b></span>
            <span class="moves-count">{{ String(moves).padStart(2, '0') }} <small>MOVES</small></span>
          </div>
        </div>

        <div class="howto">
          <span class="howto-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 12 3 3 5-6M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /></svg></span>
          <div><strong>Find the match</strong><span>Swap neighboring gems to line up three.</span></div>
        </div>
        <div class="key-hint"><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd><span>MOVE</span><kbd>ENTER</kbd><span>SELECT</span><kbd>R</kbd><span>RESET</span></div>
      </div>

      <div class="board-column">
        <div class="board-heading">
          <div class="board-heading-title"><span class="mini-sparkle">✦</span><span>THE GLEAM GRID</span></div>
          <div class="status-pill"><span class="status-dot"></span> {{ isBusy ? 'GLOWING' : 'READY TO PLAY' }}</div>
        </div>
        <div class="board-frame" :class="{ 'board-frame--busy': isBusy }">
          <div class="board-glow" aria-hidden="true"></div>
          <div class="game-board" role="grid" aria-label="8 by 8 gem board">
            <template v-for="(row, rowIndex) in board" :key="rowIndex">
              <button
                v-for="(gem, colIndex) in row"
                :key="`${rowIndex}-${colIndex}-${gem}`"
                class="cell"
                :class="[
                  `gem--${gem}`,
                  { 'cell--selected': selected && selected.row === rowIndex && selected.col === colIndex,
                    'cell--cursor': cursor.row === rowIndex && cursor.col === colIndex,
                    'cell--clearing': clearing.includes(`${rowIndex}-${colIndex}`) },
                ]"
                type="button"
                role="gridcell"
                :aria-label="`${gem} gem, row ${rowIndex + 1}, column ${colIndex + 1}`"
                :aria-selected="selected?.row === rowIndex && selected?.col === colIndex"
                :disabled="isBusy"
                @click="choose({ row: rowIndex, col: colIndex })"
              >
                <span class="gem-shape" aria-hidden="true"><span class="gem-facet"></span><span class="gem-core"></span><span class="gem-glint"></span></span>
              </button>
            </template>
          </div>
          <div v-if="comboLabel" class="combo-burst" aria-live="polite">{{ comboLabel }}<span>✦</span></div>
        </div>
        <div class="board-caption">
          <span class="caption-message"><span class="caption-spark">✧</span>{{ message }}</span>
          <span class="gem-legend"><i class="legend-dot legend-dot--rose"></i><i class="legend-dot legend-dot--aqua"></i><i class="legend-dot legend-dot--gold"></i><i class="legend-dot legend-dot--violet"></i><i class="legend-dot legend-dot--mint"></i><i class="legend-dot legend-dot--blue"></i><span>6 GEM TYPES</span></span>
        </div>
      </div>
    </section>
    <footer class="footer"><span>TAKE A BREATH. MAKE A MATCH.</span><span>DESIGNED FOR A LITTLE DELIGHT <b>✦</b></span></footer>
  </main>
</template>
