<script setup>
import { onMounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS } from '../data/levels.js'
import RoomView from '../components/RoomView.vue'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
onMounted(() => {
  store.celebrate('unlock')
  store.sound('unlock')
})
function playAgain() {
  // Replays the quests from the first room. The house, furniture and coins stay.
  store.toast('Replay any level to earn more coins. Your house is safe!', 'info')
  store.go('wordsearch', { room: 'bedroom' })
}
</script>

<template>
  <main class="screen end">
    <section class="panel box">
      <h1 class="screen-title center">CONGRATULATIONS!</h1>
      <p class="big center">Congratulations! You completed your BUILDVERSE home!</p>
      <p v-if="store.settings.thai" class="thai-c center">ยินดีด้วย! คุณสร้างบ้าน BUILDVERSE ของคุณสำเร็จแล้ว!</p>

      <div class="stats">
        <div class="stat paper"><span class="n">{{ store.data.learned.length }}</span><span>words learned</span></div>
        <div class="stat paper"><span class="n">{{ store.completedCount }}/5</span><span>rooms built</span></div>
        <div class="stat paper"><span class="n"><PixelSprite name="coin" :size="28" /> {{ store.data.coins }}</span><span>coins</span></div>
      </div>

      <div class="house">
        <div v-for="l in LEVELS" :key="l.id" class="r">
          <strong>{{ l.name }}</strong>
          <RoomView :room-id="l.id" :placements="store.data.placements" :cell="26" />
        </div>
      </div>

      <div class="row actions">
        <button class="btn btn-blue btn-big" @click="store.go('house')">🛋 Continue Decorating</button>
        <button class="btn btn-gold btn-big" @click="store.go('review')">📖 Review Words</button>
        <button class="btn btn-green btn-big" @click="playAgain">↻ Play Again</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.box { display: flex; flex-direction: column; gap: 14px; }
.big { font-size: 22px; font-weight: 900; margin: 0; }
.thai-c { font-family: var(--font-thai); color: #ffe7c2; margin: 0; }
.stats { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.stat { color: var(--ink); display: flex; flex-direction: column; align-items: center; min-width: 150px; }
.stat .n { font-family: var(--font-title); font-size: 22px; display: flex; gap: 6px; align-items: center; }
.house { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.r { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.actions { justify-content: center; }
</style>
