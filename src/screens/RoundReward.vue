<script setup>
// REWARDS (round step 3). claimReward() pays only once per round, so a
// refresh or a second click never gives coins twice.
import { computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVEL_BY_ID, DIFFICULTY, ECONOMY } from '../data/levels.js'
import PixelSprite from '../components/PixelSprite.vue'
import CoinCounter from '../components/CoinCounter.vue'
import RoundSteps from '../components/RoundSteps.vue'

const store = useGameStore()
const round = store.data.round
if (!round || !round.wsDone || !round.questDone) store.go(round && round.wsDone ? 'quest' : 'map')

const reward = computed(() => (store.data.round && store.data.round.claimed ? store.data.round.reward : null))
const level = LEVEL_BY_ID[round?.roomId || 'bedroom']
const diff = DIFFICULTY[round?.difficulty] || DIFFICULTY.easy
const words = (round?.words || []).map((x) => level.words.find((w) => w.word === x))
const unlocked = computed(() => (reward.value?.unlockedRoom ? LEVEL_BY_ID[reward.value.unlockedRoom] : null))

let paidNow = false
if (round && round.wsDone && round.questDone && !round.claimed) {
  store.claimReward()
  paidNow = true
}
onMounted(() => {
  if (!paidNow) return
  store.sound(reward.value?.allClearedNow || unlocked.value ? 'unlock' : 'buy')
  store.celebrate(reward.value?.allClearedNow ? 'unlock' : 'coins')
})

function playAgain() {
  const r = store.startRound(round.roomId, round.difficulty, round.mode)
  if (r) store.go('wordsearch')
}
</script>

<template>
  <main v-if="reward" class="screen rr">
    <RoundSteps :step="3" class="steps-bar" />
    <section class="panel box">
      <!-- All five rooms cleared (first time) -->
      <div v-if="reward.allClearedNow" class="allclear paper">
        <PixelSprite name="npc" :size="90" label="Mia the Builder" />
        <div>
          <h2>Congratulations! You completed your BUILDVERSE home!</h2>
          <p>All 5 rooms are open. Play any room again for more coins, try <b>Hard</b> mode, or use <b>🎲 Random Room</b>.</p>
          <p v-if="store.settings.thai" class="thai">ยินดีด้วย! คุณสร้างบ้านครบทั้ง 5 ห้องแล้ว เล่นต่อได้เรื่อย ๆ</p>
        </div>
      </div>

      <h1 class="screen-title center">ROUND COMPLETE!</h1>
      <p class="center sub">{{ level.name }} · {{ diff.label }}</p>

      <div class="rewards paper">
        <div class="line"><span>{{ diff.label }} round</span><strong>+{{ reward.base }}</strong></div>
        <div class="line" :class="{ zero: !reward.time }"><span>Challenge Mode time bonus</span><strong>+{{ reward.time }}</strong></div>
        <div class="line" :class="{ zero: !reward.unlock }"><span>First clear of this room (once)</span><strong>+{{ reward.unlock }}</strong></div>
        <div class="line total"><span><PixelSprite name="coin" :size="26" /> Total</span><strong>+{{ reward.total }} Coins</strong></div>
      </div>
      <div class="row center-row"><CoinCounter :coins="store.data.coins" /></div>

      <p v-if="unlocked" class="feedback good unlock"><span class="icon">🔓</span><span>New room unlocked: <b>{{ unlocked.name }}</b>!</span></p>
      <p v-if="!reward.unlock && !reward.time" class="muted center small">Tip: Normal gives {{ DIFFICULTY.normal.reward }} coins, Hard gives {{ DIFFICULTY.hard.reward }}. Challenge Mode adds +{{ ECONOMY.timeBonus }}.</p>

      <h2 class="words-title">Words in this round</h2>
      <div class="words">
        <div v-for="w in words" :key="w.word" class="w paper">
          <PixelSprite :name="w.sprite" :size="36" :label="w.display" />
          <div>
            <strong>{{ w.display }}</strong>
            <div class="thai">{{ w.thai }}</div>
          </div>
          <button class="btn btn-small btn-blue btn-icon" :aria-label="'Listen to ' + w.display" @click="store.say(w.display)">🔊</button>
        </div>
      </div>

      <div class="row actions">
        <button class="btn btn-big" :class="unlocked ? 'btn-wood' : 'btn-green'" @click="playAgain">↻ Play Again <small>({{ diff.label }})</small></button>
        <button class="btn btn-big" :class="unlocked ? 'btn-green' : 'btn-wood'" @click="store.go('map')">🏠 Choose Room</button>
        <button class="btn btn-big btn-blue" @click="store.go('house')">🛋 Decorate My House</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.rr { max-width: 880px; }
.steps-bar { margin-bottom: 10px; }
.box { display: flex; flex-direction: column; gap: 12px; }
.allclear { display: flex; gap: 14px; align-items: center; color: var(--ink); border-width: 4px; box-shadow: 0 0 0 4px var(--gold); animation: pop .4s; }
.allclear h2 { font-size: 20px; margin: 0 0 6px; }
.allclear p { margin: 4px 0; }
.sub { font-size: 20px; font-weight: 900; margin: 0; }
.rewards { color: var(--ink); display: grid; gap: 6px; }
.line { display: flex; justify-content: space-between; align-items: center; font-size: 18px; border-bottom: 2px dashed #d8c7a0; padding: 4px 0; }
.line.zero { opacity: .55; }
.line.total { border: none; font-size: 22px; }
.line.total span { display: flex; gap: 8px; align-items: center; }
.center-row { justify-content: center; }
.unlock { font-size: 18px; }
.small { font-size: 14px; margin: 0; }
.words-title { font-family: var(--font-title); font-size: 13px; margin: 4px 0 0; }
.words { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
.w { display: flex; gap: 10px; align-items: center; color: var(--ink); padding: 6px 8px; }
.w > div { flex: 1; }
.actions { justify-content: center; }
.actions small { font-size: 13px; }
@media (max-width: 560px) { .actions .btn { width: 100%; min-width: 0; } .allclear { flex-direction: column; text-align: center; } }
</style>
