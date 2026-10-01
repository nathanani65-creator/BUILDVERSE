<script setup>
import { useGameStore } from '../stores/game.js'
import CoinCounter from './CoinCounter.vue'
import GameLogo from './GameLogo.vue'
const store = useGameStore()
defineProps({ goal: { type: String, default: '' } })
function nav(screen) {
  store.sound('click')
  store.go(screen)
}
</script>

<template>
  <header class="topbar panel">
    <GameLogo small class="logo" />
    <div class="goal" aria-live="polite">
      <span class="goal-label">GOAL</span>
      <span>{{ goal || store.currentGoal }}</span>
    </div>
    <CoinCounter :coins="store.data.coins" />
    <nav class="row nav">
      <button class="btn btn-small btn-green" :class="{ pressed: store.screen === 'map' }" @click="nav('map')">🏠 Map</button>
      <button class="btn btn-small btn-gold" :class="{ pressed: store.screen === 'shop' }" @click="nav('shop')">🛒 Shop</button>
      <button class="btn btn-small btn-blue" :class="{ pressed: store.screen === 'house' }" @click="nav('house')">🛋 My House</button>
      <button class="btn btn-small" @click="nav('menu')">☰ Menu</button>
    </nav>
  </header>
</template>

<style scoped>
.topbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 10px 14px; margin-bottom: 16px; }
.goal { flex: 1; min-width: 220px; display: flex; gap: 10px; align-items: center; font-weight: 800; font-size: 17px; background: rgba(0,0,0,.25); padding: 8px 12px; border-radius: 3px; }
.goal-label { font-family: var(--font-title); font-size: 10px; background: var(--gold); color: var(--ink); padding: 4px 6px; border: 2px solid var(--ink); flex: none; }
.nav { gap: 8px; }
</style>
