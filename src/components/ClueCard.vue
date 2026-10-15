<script setup>
// One card in the "All Clues" list (Word Search).
// Shows picture, English clue, letter count and status.
// The answer and Thai meaning stay hidden until the word is found or a Hint is used.
import { computed } from 'vue'
import PixelSprite from './PixelSprite.vue'

const props = defineProps({
  word: { type: Object, required: true },
  found: { type: Boolean, default: false },
  hintStep: { type: Number, default: 0 }, // 1 = Thai, 2 = first letter, 3 = word
  target: { type: Boolean, default: false },
  color: { type: String, default: '#5fb340' },
  showPicture: { type: Boolean, default: true },
})
const emit = defineEmits(['select'])

const letters = computed(() => props.word.word.length)
const blanks = computed(() => props.word.display.replace(/[A-Z]/g, '_').split('').join(' '))
const showWord = computed(() => props.found || props.hintStep >= 3)
const showThai = computed(() => props.found || props.hintStep >= 1)
</script>

<template>
  <button
    class="clue"
    :class="{ found, target: target && !found }"
    :style="{ '--c': color }"
    :disabled="found"
    :aria-label="found ? `${word.display}, found` : `Choose this word: ${word.clue}`"
    @click="emit('select')"
  >
    <div class="pic"><PixelSprite v-if="showPicture || found" :name="word.sprite" :size="46" :label="showWord ? word.display : 'clue picture'" /><span v-else class="noimg" aria-hidden="true">?</span></div>
    <div class="body">
      <div class="status">
        <span v-if="found" class="st ok">✓ Found</span>
        <span v-else-if="target" class="st now">▶ Current word</span>
        <span v-else class="st">Not found</span>
        <span class="n">{{ letters }} letters</span>
      </div>
      <div class="answer">
        <span v-if="showWord">{{ word.display }}</span>
        <span v-else class="blank">{{ blanks }}</span>
        <span v-if="showThai" class="thai">— {{ word.thai }}</span>
      </div>
      <div class="text">{{ word.clue }}</div>
    </div>
  </button>
</template>

<style scoped>
.clue {
  font: inherit; text-align: left; width: 100%;
  display: flex; gap: 10px; align-items: flex-start; padding: 8px; background: #fffdf5; color: var(--ink);
  border: 3px solid var(--ink); border-radius: 4px; cursor: pointer; box-shadow: 0 3px 0 rgba(0,0,0,.25);
  transition: transform .1s;
}
.clue:hover:not(:disabled) { transform: translateY(-2px); }
.clue:disabled { cursor: default; }
.clue.target { box-shadow: 0 0 0 3px var(--gold), 0 3px 0 rgba(0,0,0,.25); background: #fff7d6; }
.clue.found { background: color-mix(in srgb, var(--c) 22%, #fff); }
.pic { width: 54px; height: 54px; flex: none; display: flex; align-items: center; justify-content: center; background: #e9f4ff; border: 2px solid var(--ink); border-radius: 3px; }
.noimg { font-family: var(--font-title); font-size: 18px; color: #8b8b8b; }
.body { flex: 1; min-width: 0; }
.status { display: flex; gap: 8px; align-items: center; font-size: 12px; font-weight: 900; }
.st { padding: 1px 6px; border: 2px solid var(--ink); background: #ddd; color: #555; }
.st.ok { background: #d9f7d9; color: #14532d; }
.st.now { background: var(--gold); color: var(--ink); }
.n { color: #777; }
.answer { font-weight: 900; font-size: 17px; letter-spacing: 1px; margin-top: 2px; }
.blank { color: #777; letter-spacing: 0; }
.answer .thai { font-weight: 600; letter-spacing: 0; margin-left: 4px; }
.text { font-size: 15px; line-height: 1.35; margin-top: 2px; }
</style>
