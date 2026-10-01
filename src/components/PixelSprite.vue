<script setup>
// Draws a pixel sprite from data/sprites.js as crisp SVG.
// If an image is listed in IMAGE_OVERRIDES, that image is shown instead.
import { computed } from 'vue'
import { SPRITES, PALETTE, VARIANTS, IMAGE_OVERRIDES } from '../data/sprites.js'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 48 },
  variant: { type: String, default: '' },
  label: { type: String, default: '' },
  stretch: { type: Boolean, default: false },
})

const image = computed(() => IMAGE_OVERRIDES[props.name])
const rows = computed(() => SPRITES[props.name] || SPRITES.lock)
const width = computed(() => rows.value[0].length)
const height = computed(() => rows.value.length)
const cssSize = computed(() => (typeof props.size === 'number' ? props.size + 'px' : props.size))

// merge runs of the same colour into one rectangle (fewer SVG nodes)
const rects = computed(() => {
  const pal = { ...PALETTE, ...(VARIANTS[props.variant] || {}) }
  const out = []
  rows.value.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let len = 1
      while (x + len < row.length && row[x + len] === ch) len++
      if (ch !== '.' && pal[ch]) out.push({ x, y, w: len, fill: pal[ch] })
      x += len
    }
  })
  return out
})
</script>

<template>
  <img v-if="image" :src="image" :alt="label || name" :style="{ width: cssSize, height: cssSize, objectFit: stretch ? 'fill' : 'contain', imageRendering: 'pixelated' }" draggable="false" />
  <svg
    v-else
    class="pixel-sprite"
    :viewBox="`0 0 ${width} ${height}`"
    :style="{ width: cssSize, height: cssSize }"
    :preserveAspectRatio="stretch ? 'none' : 'xMidYMid meet'"
    shape-rendering="crispEdges"
    role="img"
    :aria-label="label || name"
  >
    <rect v-for="(r, i) in rects" :key="i" :x="r.x" :y="r.y" :width="r.w" height="1" :fill="r.fill" />
  </svg>
</template>

<style scoped>
.pixel-sprite { display: block; overflow: visible; }
</style>
