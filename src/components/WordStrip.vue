<script setup>
// Compact word list shown ABOVE the grid (handy on phones: no scrolling).
// Words start gray; when found they turn coloured and pop.
// Tap a word to show its clue in the line below the chips.
import PixelSprite from './PixelSprite.vue'

const props = defineProps({
  words: { type: Array, required: true }, // level.words
  clueStyle: { type: String, default: 'picture' },
  found: { type: Object, required: true }, // { WORD: colour }
  revealed: { type: Object, required: true }, // { WORD: hintStep }
  active: { type: String, default: '' },
  width: { type: Number, default: 0 },
  thai: { type: Boolean, default: true },
})
const emit = defineEmits(['select', 'hint'])

// Level 1 shows the words (picture clues). Later levels show blanks until the
// word is found or revealed with Hint, so players still read the clues.
function label(w) {
  if (props.found[w.word] || props.clueStyle === 'picture' || (props.revealed[w.word] || 0) >= 1) return w.display
  return w.display.replace(/[A-Z]/g, '_').split('').join(' ')
}
function showPic(w) {
  return props.clueStyle !== 'english' || !!props.found[w.word]
}
function activeWord() {
  return props.words.find((w) => w.word === props.active)
}
</script>

<template>
  <div class="strip" :style="width ? { maxWidth: width + 'px' } : {}">
    <div class="chips" role="list" aria-label="Words to find">
      <button
        v-for="w in words"
        :key="w.word"
        role="listitem"
        class="chip"
        :class="{ found: !!found[w.word], active: active === w.word }"
        :style="found[w.word] ? { '--c': found[w.word] } : {}"
        :aria-label="found[w.word] ? `${w.display}, found` : `Word ${words.indexOf(w) + 1}, not found yet`"
        @click="emit('select', w.word)"
      >
        <PixelSprite v-if="showPic(w)" :name="w.sprite" :size="22" class="pic" />
        <span class="t">{{ label(w) }}</span>
        <span v-if="found[w.word]" class="tick" aria-hidden="true">✔</span>
      </button>
    </div>
    <div v-if="activeWord() && !found[active]" class="clue-line" aria-live="polite">
      <span class="q">💬</span>
      <span class="txt">{{ activeWord().clue }}<span v-if="thai && clueStyle !== 'english'" class="th"> · {{ activeWord().thai }}</span></span>
      <button class="btn btn-small btn-gold" @click="emit('hint', active)">💡 Hint</button>
    </div>
  </div>
</template>

<style scoped>
.strip { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.chip {
  font: inherit; font-weight: 900; font-size: 15px; letter-spacing: .5px;
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; min-height: 34px;
  background: #d9d9d9; color: #7a7a7a; border: 2px solid #8b8b8b; border-radius: 3px;
  cursor: pointer; transition: background .2s, color .2s;
}
.chip .pic { filter: grayscale(1) opacity(.6); }
.chip:hover { filter: brightness(1.05); }
.chip.active { border-color: var(--ink); box-shadow: 0 0 0 3px var(--gold); color: #444; }
.chip.found {
  background: var(--c); color: #fff; border-color: var(--ink);
  text-shadow: 1px 1px 0 rgba(0,0,0,.45);
  animation: chipPop .55s cubic-bezier(.3,1.6,.5,1);
}
.chip.found .pic { filter: none; }
.tick { font-size: 13px; }
@keyframes chipPop {
  0% { transform: scale(1); }
  35% { transform: scale(1.35) translateY(-6px); }
  65% { transform: scale(.92); }
  100% { transform: scale(1); }
}
.clue-line {
  display: flex; align-items: center; gap: 8px; background: #fffdf5; border: 3px solid var(--ink);
  border-radius: 4px; padding: 4px 6px 4px 10px; font-weight: 800; font-size: 15px; line-height: 1.3;
}
.clue-line .txt { flex: 1; }
.clue-line .th { font-family: var(--font-thai); font-weight: 600; color: #5b4630; }
.clue-line .btn { flex: none; }
@media (prefers-reduced-motion: reduce) { .chip.found { animation: none; } }
</style>
