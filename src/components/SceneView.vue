<script setup>
// Draws a small picture made from sprites (used for position words).
import { computed } from 'vue'
import { SCENES } from '../data/levels.js'
import PixelSprite from './PixelSprite.vue'
const props = defineProps({ scene: { type: String, required: true }, width: { type: Number, default: 300 } })
const unit = computed(() => props.width / 12)
const items = computed(() => SCENES[props.scene] || [])
</script>

<template>
  <div class="scene" :style="{ width: width + 'px', height: unit * 8 + 'px' }">
    <div class="floor" :style="{ height: unit * 1.2 + 'px' }" />
    <div
      v-for="(it, i) in items"
      :key="i"
      class="obj"
      :style="{ left: it.x * unit + 'px', top: it.y * unit + 'px', width: it.w * unit + 'px', height: it.h * unit + 'px', zIndex: i + 1 }"
    >
      <PixelSprite :name="it.s" size="100%" :stretch="!!(it.flat || it.stretch)" />
    </div>
  </div>
</template>

<style scoped>
.scene { position: relative; background: linear-gradient(180deg, #fdf3dc 0 80%, #e2c99a 80%); border: 3px solid var(--ink); border-radius: 4px; overflow: hidden; margin: 0 auto; }
.floor { position: absolute; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(90deg, #c99a5b 0 22px, #b98a4c 22px 24px); opacity: .6; }
.obj { position: absolute; }
</style>
