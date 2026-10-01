<script setup>
// One clue card. What it shows depends on the level's clueStyle:
//   picture – picture + clue; "Reveal Word" button
//   usage   – picture + usage clue; word hidden until Hint or found
//   english – English clue first; "Help" shows the picture and Thai meaning
import { ref, computed } from 'vue'
import PixelSprite from './PixelSprite.vue'

const props = defineProps({
  word: { type: Object, required: true },
  clueStyle: { type: String, default: 'picture' },
  found: { type: Boolean, default: false },
  revealed: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  thai: { type: Boolean, default: true },
  color: { type: String, default: '#5fb340' },
})
const emit = defineEmits(['hint', 'select'])
const helped = ref(false)

const showPicture = computed(() => props.clueStyle !== 'english' || helped.value || props.found)
const showThai = computed(() => props.thai && (props.found || (props.clueStyle === 'english' && helped.value)))
const blanks = computed(() =>
  props.word.display
    .split('')
    .map((ch) => (ch === ' ' ? '  ' : '_'))
    .join(' '),
)
</script>

<template>
  <div class="clue" :class="{ found, active }" :style="{ '--c': color }" @click="emit('select')">
    <div class="pic" :class="{ hidden: !showPicture }">
      <PixelSprite v-if="showPicture" :name="word.sprite" :size="54" :label="found || revealed ? word.display : 'clue picture'" />
      <span v-else aria-hidden="true">?</span>
    </div>
    <div class="body">
      <div class="answer">
        <span v-if="found" class="done">✔ <s>{{ word.display }}</s></span>
        <span v-else-if="revealed" class="shown">{{ word.display }}</span>
        <span v-else class="blank" :aria-label="word.display.replace(' ', '').length + ' letters'">{{ blanks }}</span>
        <span class="count">({{ word.word.length }})</span>
      </div>
      <div class="text">{{ word.clue }}</div>
      <div v-if="showThai" class="thai">{{ word.thai }}</div>
      <div v-if="!found" class="row btns">
        <button class="btn btn-small btn-gold" @click.stop="emit('hint')">
          {{ clueStyle === 'picture' && !revealed ? '👁 Reveal Word' : '💡 Hint' }}
        </button>
        <button v-if="clueStyle === 'english' && !helped" class="btn btn-small btn-blue" @click.stop="helped = true">🖼 Help</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clue {
  display: flex; gap: 10px; align-items: flex-start; padding: 8px; background: #fffdf5; color: var(--ink);
  border: 3px solid var(--ink); border-radius: 4px; cursor: pointer; transition: transform .1s;
  box-shadow: 0 3px 0 rgba(0,0,0,.25);
}
.clue:hover { transform: translateY(-1px); }
.clue.active { box-shadow: 0 0 0 3px var(--gold), 0 3px 0 rgba(0,0,0,.25); }
.clue.found { background: color-mix(in srgb, var(--c) 22%, #fff); }
.pic { width: 62px; height: 62px; flex: none; display: flex; align-items: center; justify-content: center; background: #e9f4ff; border: 2px solid var(--ink); border-radius: 3px; }
.pic.hidden { background: repeating-linear-gradient(45deg, #ddd 0 6px, #ccc 6px 12px); font-family: var(--font-title); font-size: 22px; color: #777; }
.body { flex: 1; min-width: 0; }
.answer { font-weight: 900; font-size: 18px; letter-spacing: 1px; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.blank { letter-spacing: 0; color: #777; }
.shown { color: #b5651d; }
.done { color: #1d6b1d; }
.count { font-size: 12px; color: #777; font-weight: 700; }
.text { font-size: 15px; line-height: 1.35; margin-top: 2px; }
.thai { font-size: 14px; margin-top: 2px; }
.btns { gap: 6px; margin-top: 6px; }
</style>
