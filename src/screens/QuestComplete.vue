<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVEL_BY_ID } from '../data/levels.js'
import PixelSprite from '../components/PixelSprite.vue'
import CoinCounter from '../components/CoinCounter.vue'

const store = useGameStore()
const roomId = store.params.room || 'bedroom'
const level = LEVEL_BY_ID[roomId]
const reward = computed(() => {
  const r = store.data.round
  return r && r.roomId === roomId && r.claimed ? r.reward : null
})
const needItems = computed(() => !store.isCompleted(roomId) && store.missingRequired(roomId).length > 0)
</script>

<template>
  <main class="screen qc">
    <section class="panel box">
      <h1 class="screen-title center">QUEST COMPLETE!</h1>
      <p class="center sub">{{ level.name }} — Level {{ level.level }}</p>

      <div v-if="reward" class="rewards paper">
        <div class="line"><span>{{ reward.firstClear ? 'First-clear reward' : 'Replay reward' }}</span><strong>+{{ reward.base }}</strong></div>
        <div class="line"><span>Language bonus (first-try answers)</span><strong>+{{ reward.language }}</strong></div>
        <div class="line"><span>Time bonus (Challenge Mode)</span><strong>+{{ reward.time }}</strong></div>
        <div class="line total"><span><PixelSprite name="coin" :size="26" /> Total</span><strong>+{{ reward.total }} Coins</strong></div>
      </div>
      <div class="row center-row"><CoinCounter :coins="store.data.coins" /></div>

      <h2 class="words-title">Words you learned</h2>
      <div class="words">
        <div v-for="w in level.words" :key="w.word" class="w paper">
          <PixelSprite :name="w.sprite" :size="44" :label="w.display" />
          <div>
            <strong>{{ w.display }}</strong>
            <div v-if="store.settings.thai" class="thai">{{ w.thai }}</div>
          </div>
          <button class="btn btn-small btn-blue btn-icon" :aria-label="'Listen to ' + w.display" @click="store.say(w.display)">🔊</button>
        </div>
      </div>

      <p v-if="needItems" class="feedback info"><span class="icon">ℹ</span><span>Next: {{ store.goalFor(roomId) }}</span></p>

      <div class="row actions">
        <button class="btn btn-gold btn-big" @click="store.go('shop', { room: roomId })">🛒 Shop</button>
        <button class="btn btn-blue btn-big" @click="store.go('house', { room: roomId })">🛋 My House</button>
        <button class="btn btn-wood btn-big" @click="store.go('wordsearch', { room: roomId })">↻ Replay</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.qc { max-width: 860px; }
.box { display: flex; flex-direction: column; gap: 14px; }
.sub { font-size: 20px; font-weight: 900; margin: 0; }
.rewards { color: var(--ink); display: grid; gap: 6px; }
.line { display: flex; justify-content: space-between; align-items: center; font-size: 18px; border-bottom: 2px dashed #d8c7a0; padding: 4px 0; }
.line.total { border: none; font-size: 22px; }
.line.total span { display: flex; gap: 8px; align-items: center; }
.center-row { justify-content: center; }
.words-title { font-family: var(--font-title); font-size: 13px; }
.words { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.w { display: flex; gap: 10px; align-items: center; color: var(--ink); padding: 8px; }
.w > div { flex: 1; }
.actions { justify-content: center; }
</style>
