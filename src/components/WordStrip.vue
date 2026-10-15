<script setup>
// Compact list of every word in the level, shown at the top.
//   not found → gray picture + blanks (_ _ _)
//   found     → coloured "SOFA ✓" with a pop
//   target    → thick gold frame
// Tap a word that is not found yet to make it the current target.
import PixelSprite from './PixelSprite.vue'

const props = defineProps({
  words: { type: Array, required: true }, // level.words
  found: { type: Object, required: true }, // { WORD: colour }
  hints: { type: Object, required: true }, // { WORD: hint step }
  target: { type: String, default: '' },
  pictures: { type: Object, default: () => ({}) }, // { WORD: true } = picture may be shown
})
const emit = defineEmits(['select', 'view'])

const blanks = (w) => w.display.replace(/[A-Z]/g, '_').split('').join(' ')
function label(w) {
  if (props.found[w.word]) return `${w.display} ✓`
  if ((props.hints[w.word] || 0) >= 3) return w.display // word shown by Hint 3
  return blanks(w)
}
function click(w) {
  if (props.found[w.word]) emit('view', w.word)
  else emit('select', w.word)
}
</script>

<template>
  <div class="strip" role="list" aria-label="Words in this level">
    <button
      v-for="(w, i) in words"
      :key="w.word"
      role="listitem"
      class="chip"
      :class="{ found: !!found[w.word], target: target === w.word && !found[w.word] }"
      :style="found[w.word] ? { '--c': found[w.word] } : {}"
      :aria-current="target === w.word ? 'true' : undefined"
      :aria-label="found[w.word] ? `${w.display}, found` : `Word ${i + 1}, ${w.word.length} letters, not found yet${target === w.word ? ', current word' : ''}`"
      @click="click(w)"
    >
      <PixelSprite v-if="pictures[w.word] !== false" :name="w.sprite" :size="22" class="pic" />
      <span v-else class="pic q" aria-hidden="true">?</span>
      <span class="t">{{ label(w) }}</span>
    </button>
  </div>
</template>

<style scoped>
.strip { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.chip {
  font: inherit; font-weight: 900; font-size: 15px; letter-spacing: .5px;
  display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; min-height: 36px;
  background: #d9d9d9; color: #6f6f6f; border: 2px solid #8b8b8b; border-radius: 3px;
  cursor: pointer; transition: background .2s, color .2s, transform .1s;
}
.chip .pic { filter: grayscale(1) opacity(.65); }
.chip .q { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-family: var(--font-title); font-size: 10px; background: #bdbdbd; color: #fff; }
.chip:hover { transform: translateY(-1px); }
.chip.target { background: #fff7d6; color: #3a2a12; border: 3px solid var(--ink); box-shadow: 0 0 0 3px var(--gold); }
.chip.target .pic { filter: none; }
.chip.found {
  background: var(--c); color: #fff; border-color: var(--ink);
  text-shadow: 1px 1px 0 rgba(0,0,0,.45);
  animation: chipPop .55s cubic-bezier(.3,1.6,.5,1);
}
.chip.found .pic { filter: none; }
@keyframes chipPop {
  0% { transform: scale(1); }
  35% { transform: scale(1.3) translateY(-5px); }
  65% { transform: scale(.94); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) { .chip.found { animation: none; } }
</style>
