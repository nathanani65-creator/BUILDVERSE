<script setup>
import { ref, watch } from 'vue'
import PixelSprite from './PixelSprite.vue'
const props = defineProps({ coins: { type: Number, required: true } })
const bump = ref(false)
const delta = ref(0)
watch(
  () => props.coins,
  (n, o) => {
    delta.value = n - o
    bump.value = false
    requestAnimationFrame(() => (bump.value = true))
    setTimeout(() => (bump.value = false), 900)
  },
)
</script>

<template>
  <div class="coins" :class="{ bump }" aria-live="polite">
    <PixelSprite name="coin" :size="28" label="Coins" />
    <strong>{{ coins }}</strong>
    <span class="label">Coins</span>
    <span v-if="bump && delta" class="delta" :class="delta > 0 ? 'up' : 'down'">{{ delta > 0 ? '+' : '' }}{{ delta }}</span>
  </div>
</template>

<style scoped>
.coins {
  position: relative; display: inline-flex; align-items: center; gap: 6px;
  background: #3b2a1a; color: var(--gold); border: 3px solid var(--ink);
  padding: 4px 12px 4px 6px; border-radius: 3px; font-size: 20px;
  box-shadow: inset 2px 2px 0 #5c4127;
}
.coins .label { font-size: 13px; color: #f3dfb0; }
.bump { animation: pulse .4s; }
.delta { position: absolute; right: -6px; top: -18px; font-weight: 900; font-size: 18px; animation: floatUp .9s forwards; text-shadow: 2px 2px 0 var(--ink); }
.delta.up { color: #b8ff8a; }
.delta.down { color: #ffb3a8; }
@keyframes floatUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-24px); } }
</style>
