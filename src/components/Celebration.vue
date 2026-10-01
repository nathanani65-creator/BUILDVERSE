<script setup>
// Pixel particle burst. Triggered by store.celebrate(kind).
import { ref, watch } from 'vue'
import { useGameStore } from '../stores/game.js'
import PixelSprite from './PixelSprite.vue'

const store = useGameStore()
const particles = ref([])
const COLORS = {
  stars: ['#f6d548', '#ffffff', '#9be05a', '#aeeaff'],
  coins: ['#f6d548'],
  unlock: ['#f6d548', '#d9463e', '#4a9fe0', '#5fb340', '#f29cc4', '#ffffff'],
}
let pid = 0
watch(
  () => store.fx.key,
  () => {
    const kind = store.fx.kind || 'stars'
    const count = kind === 'unlock' ? 60 : kind === 'coins' ? 14 : 26
    const colors = COLORS[kind] || COLORS.stars
    const batch = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 120 + Math.random() * (kind === 'unlock' ? 380 : 220)
      batch.push({
        id: ++pid,
        coin: kind === 'coins',
        color: colors[i % colors.length],
        size: 8 + Math.floor(Math.random() * 3) * 4,
        dx: Math.cos(angle) * dist + 'px',
        dy: Math.sin(angle) * dist - 80 + 'px',
        delay: Math.random() * 0.15 + 's',
      })
    }
    particles.value.push(...batch)
    const ids = new Set(batch.map((p) => p.id))
    setTimeout(() => (particles.value = particles.value.filter((p) => !ids.has(p.id))), 1500)
  },
)
</script>

<template>
  <div class="fx" aria-hidden="true">
    <div
      v-for="p in particles"
      :key="p.id"
      class="p"
      :style="{ '--dx': p.dx, '--dy': p.dy, animationDelay: p.delay, width: p.coin ? '26px' : p.size + 'px', height: p.coin ? '26px' : p.size + 'px', background: p.coin ? 'transparent' : p.color }"
    >
      <PixelSprite v-if="p.coin" name="coin" :size="26" />
    </div>
  </div>
</template>

<style scoped>
.fx { position: fixed; left: 50%; top: 45%; width: 0; height: 0; z-index: 300; pointer-events: none; }
.p { position: absolute; left: 0; top: 0; box-shadow: 2px 2px 0 rgba(0,0,0,.3); animation: burst 1.3s cubic-bezier(.2,.7,.3,1) forwards; opacity: 0; }
@keyframes burst {
  0% { transform: translate(0, 0) scale(.6); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(var(--dx), calc(var(--dy) + 120px)) scale(1) rotate(180deg); opacity: 0; }
}
</style>
