<script setup>
// The helper character "Mia the Builder" speaks one line at a time.
import { ref, computed } from 'vue'
import PixelSprite from './PixelSprite.vue'

const props = defineProps({
  lines: { type: Array, required: true }, // [{ en, th }]
  thai: { type: Boolean, default: true },
  finishLabel: { type: String, default: "Let's go!" },
})
const emit = defineEmits(['done'])
const i = ref(0)
const line = computed(() => props.lines[i.value])
const last = computed(() => i.value >= props.lines.length - 1)
function next() {
  if (last.value) emit('done')
  else i.value++
}
</script>

<template>
  <div class="npc-wrap">
    <div class="npc"><PixelSprite name="npc" :size="110" label="Mia the Builder" /></div>
    <div class="bubble paper">
      <div class="who">Mia the Builder</div>
      <p class="en">{{ line.en }}</p>
      <p v-if="thai && line.th" class="thai">{{ line.th }}</p>
      <div class="row">
        <span class="muted small">{{ i + 1 }} / {{ lines.length }}</span>
        <span class="spacer" />
        <button class="btn btn-green" @click="next">{{ last ? finishLabel : 'Next ▶' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.npc-wrap { display: flex; align-items: flex-end; gap: 12px; }
.npc { animation: bob 1.6s ease-in-out infinite; flex: none; }
.bubble { position: relative; flex: 1; }
.bubble::before { content: ''; position: absolute; left: -14px; bottom: 30px; border: 10px solid transparent; border-right-color: var(--ink); }
.who { font-family: var(--font-title); font-size: 11px; color: #b5651d; margin-bottom: 6px; }
.en { font-size: 22px; font-weight: 800; margin: 4px 0; }
.thai { margin: 0 0 10px; }
.small { font-size: 13px; }
</style>
