<script setup>
// The letter grid. Drag from the first letter to the last letter
// (mouse, pen or touch — uses Pointer Events).
import { ref, computed } from 'vue'
import { snapLine } from '../logic/selection.js'

const props = defineProps({
  grid: { type: Array, required: true },
  cell: { type: Number, default: 48 },
  found: { type: Array, default: () => [] }, // [{ word, cells, color }]
  flash: { type: Object, default: null }, // { x, y }
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['select', 'dragstart'])

const size = computed(() => props.grid.length)
const box = ref(null)
const start = ref(null)
const current = ref([])
let pointerId = null

function cellFromEvent(e) {
  const r = box.value.getBoundingClientRect()
  const x = Math.floor((e.clientX - r.left - box.value.clientLeft) / props.cell)
  const y = Math.floor((e.clientY - r.top - box.value.clientTop) / props.cell)
  return { x: Math.max(0, Math.min(size.value - 1, x)), y: Math.max(0, Math.min(size.value - 1, y)) }
}

function down(e) {
  if (props.disabled || pointerId !== null) return
  pointerId = e.pointerId
  try {
    box.value.setPointerCapture(e.pointerId) // keep receiving moves even outside the grid
  } catch {
    /* capture is optional */
  }
  start.value = cellFromEvent(e)
  current.value = [start.value]
  emit('dragstart')
  e.preventDefault()
}
function move(e) {
  if (e.pointerId !== pointerId || !start.value) return
  current.value = snapLine(start.value, cellFromEvent(e), size.value)
}
function up(e) {
  if (e.pointerId !== pointerId) return
  const cells = current.value
  pointerId = null
  start.value = null
  current.value = []
  if (cells.length) emit('select', cells)
}
function cancel() {
  pointerId = null
  start.value = null
  current.value = []
}

const selectedSet = computed(() => new Set(current.value.map((c) => c.x + ',' + c.y)))
const foundColor = computed(() => {
  const m = {}
  for (const f of props.found) for (const c of f.cells) m[c.x + ',' + c.y] = f.color
  return m
})

function lineFor(cells) {
  const a = cells[0]
  const b = cells[cells.length - 1]
  const half = props.cell / 2
  return { x1: a.x * props.cell + half, y1: a.y * props.cell + half, x2: b.x * props.cell + half, y2: b.y * props.cell + half }
}
const live = computed(() => (current.value.length ? lineFor(current.value) : null))
</script>

<template>
  <div
    ref="box"
    class="wgrid"
    :class="{ disabled }"
    :style="{ width: cell * size + 'px', height: cell * size + 'px', gridTemplateColumns: `repeat(${size}, ${cell}px)`, fontSize: Math.round(cell * 0.5) + 'px' }"
    role="grid"
    aria-label="Word search letters"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="cancel"
    @lostpointercapture="up"
  >
    <svg class="lines" :width="cell * size" :height="cell * size" aria-hidden="true">
      <line v-for="f in found" :key="f.word + f.cells[0].x + f.cells[0].y" v-bind="lineFor(f.cells)" :stroke="f.color" :stroke-width="cell * 0.78" stroke-linecap="round" opacity="0.55" />
      <line v-if="live" v-bind="live" stroke="#f6d548" :stroke-width="cell * 0.8" stroke-linecap="round" opacity="0.75" />
    </svg>
    <template v-for="(row, y) in grid" :key="y">
      <div
        v-for="(ch, x) in row"
        :key="x + '-' + y"
        class="c"
        role="gridcell"
        :class="{ sel: selectedSet.has(x + ',' + y), found: foundColor[x + ',' + y], flash: flash && flash.x === x && flash.y === y }"
      >
        {{ ch }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.wgrid {
  position: relative; display: grid; touch-action: none; user-select: none; -webkit-user-select: none;
  background: var(--paper); border: 4px solid var(--ink); border-radius: 4px; box-sizing: content-box;
  box-shadow: inset 0 0 0 3px #e8d6b0, 0 6px 0 rgba(0,0,0,.3);
  cursor: crosshair;
}
.wgrid.disabled { pointer-events: none; }
.lines { position: absolute; left: 0; top: 0; pointer-events: none; z-index: 1; }
.c {
  position: relative; z-index: 2; display: flex; align-items: center; justify-content: center;
  font-family: 'Nunito', sans-serif; font-weight: 900; color: #2a2118;
  border-right: 1px solid rgba(0,0,0,.06); border-bottom: 1px solid rgba(0,0,0,.06);
}
.c.sel { color: #000; transform: scale(1.15); }
.c.found { color: #111; }
.c.flash { animation: flash .5s ease-in-out infinite alternate; border-radius: 50%; }
@keyframes flash { from { background: rgba(246, 213, 72, .2); box-shadow: 0 0 0 0 #f6d548; } to { background: #f6d548; box-shadow: 0 0 0 4px #e3a92b; } }
</style>
