<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS, LEVEL_BY_ID } from '../data/levels.js'
import TopBar from '../components/TopBar.vue'
import RoomView from '../components/RoomView.vue'
import Modal from '../components/Modal.vue'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
const openRoom = ref(store.params.room || null)
const level = computed(() => (openRoom.value ? LEVEL_BY_ID[openRoom.value] : null))

const STEP_NAMES = ['Word Search', 'Language Challenge', 'Buy furniture', 'Decorate']

function status(id) {
  if (!store.isUnlocked(id)) return 'Locked'
  if (store.isCompleted(id)) return 'Completed'
  return 'Available'
}
function stepDone(id, i) {
  const r = store.roomState(id)
  return [r.wordSearch, r.challenge, r.challenge && store.missingRequired(id).length === 0, r.completed][i]
}
function open(id) {
  store.sound('click')
  openRoom.value = id
}
function goWordSearch() {
  store.go('wordsearch', { room: openRoom.value })
}
function goChallenge() {
  store.go('challenge', { room: openRoom.value })
}
function goShop() {
  store.go('shop', { room: openRoom.value })
}
function goHouse() {
  store.go('house', { room: openRoom.value })
}
const prevName = computed(() => (level.value && level.value.level > 1 ? LEVELS[level.value.level - 2].name : ''))
</script>

<template>
  <main class="screen">
    <TopBar />
    <h1 class="screen-title">House Map</h1>

    <div class="house">
      <div class="roof" aria-hidden="true"><span v-for="n in 4" :key="n" :style="{ width: 40 + n * 15 + '%' }" /></div>
      <div class="rooms">
        <button
          v-for="l in LEVELS"
          :key="l.id"
          class="room-card"
          :class="['st-' + status(l.id).toLowerCase(), { current: store.activeRoomId === l.id }]"
          :aria-label="`${l.name}: ${status(l.id)}`"
          @click="open(l.id)"
        >
          <div class="head">
            <span class="lvl">LV {{ l.level }}</span>
            <strong>{{ l.name }}</strong>
            <span class="badge" :class="status(l.id) === 'Locked' ? 'badge-lock' : status(l.id) === 'Completed' ? 'badge-ok' : 'badge-new'">
              {{ status(l.id) === 'Locked' ? '🔒' : status(l.id) === 'Completed' ? '✔' : '★' }} {{ status(l.id) }}
            </span>
          </div>
          <RoomView :room-id="l.id" :placements="store.data.placements" :cell="22" :locked="!store.isUnlocked(l.id)" />
          <div class="prog">
            <div class="bar"><span :style="{ width: (store.roomProgress(l.id) / 4) * 100 + '%' }" /></div>
            <small>{{ store.roomProgress(l.id) }}/4 steps</small>
          </div>
          <div v-if="store.settings.thai" class="thai small">{{ l.thai }}</div>
          <div v-if="store.activeRoomId === l.id" class="here">▼ Next quest</div>
        </button>
      </div>
    </div>

    <!-- Room hub -->
    <Modal v-if="level && store.isUnlocked(level.id)" :title="`Level ${level.level}: ${level.name}`">
      <p class="goal-line"><strong>Goal:</strong> {{ store.goalFor(level.id) }}</p>
      <ol class="steps">
        <li v-for="(s, i) in STEP_NAMES" :key="s" :class="{ done: stepDone(level.id, i) }">
          <span class="mark">{{ stepDone(level.id, i) ? '✔' : i + 1 }}</span> {{ s }}
          <span v-if="stepDone(level.id, i)" class="sr-only">done</span>
        </li>
      </ol>
      <div class="hub-buttons">
        <button v-if="!store.roomState(level.id).wordSearch" class="btn btn-green" @click="goWordSearch">🔍 Start Word Search</button>
        <button v-else-if="!store.roomState(level.id).challenge" class="btn btn-green" @click="goChallenge">✏ Language Challenge</button>
        <button v-if="store.roomState(level.id).wordSearch && !store.roomState(level.id).challenge" class="btn" @click="goWordSearch">↻ Restart Word Search</button>
        <button v-if="store.roomState(level.id).challenge" class="btn btn-wood" @click="goWordSearch">↻ Replay Level (+50 coins)</button>
        <button class="btn btn-gold" @click="goShop">🛒 Shop</button>
        <button class="btn btn-blue" @click="goHouse">🛋 {{ store.isCompleted(level.id) ? 'Decorate' : 'Go to room' }}</button>
      </div>
      <template #actions>
        <button class="btn" @click="openRoom = null">Close</button>
      </template>
    </Modal>

    <!-- Locked room -->
    <Modal v-else-if="level" :title="`${level.name} is locked`" light>
      <div class="row locked-info">
        <PixelSprite name="lock" :size="64" />
        <div>
          <p><strong>How to unlock:</strong> Complete the {{ prevName }} quest.</p>
          <ol>
            <li>Find all the words in the {{ prevName }}.</li>
            <li>Finish the 3 language challenges.</li>
            <li>Buy the {{ prevName }} furniture.</li>
            <li>Follow the decorating instructions.</li>
          </ol>
          <p v-if="store.settings.thai" class="thai">ทำภารกิจของ {{ prevName }} ให้สำเร็จเพื่อปลดล็อกห้องนี้</p>
        </div>
      </div>
      <template #actions>
        <button class="btn btn-green" @click="openRoom = null">OK</button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>
.house { max-width: 980px; margin: 0 auto; }
.roof { display: flex; flex-direction: column; align-items: center; }
.roof span { height: 18px; background: #8e2b25; border: 3px solid var(--ink); border-bottom: none; box-shadow: inset 3px 3px 0 #c9483f; background-image: linear-gradient(90deg, rgba(0,0,0,.18) 2px, transparent 2px); background-size: 28px 100%; }
.rooms {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 14px;
  background: #8a8a8a; border: 4px solid var(--ink);
  background-image: linear-gradient(90deg, rgba(0,0,0,.15) 2px, transparent 2px), linear-gradient(0deg, rgba(0,0,0,.15) 2px, transparent 2px);
  background-size: 32px 32px;
}
.room-card {
  position: relative; display: flex; flex-direction: column; gap: 8px; align-items: center;
  padding: 10px; font: inherit; color: #fff7e6; cursor: pointer;
  background: var(--wood); border: 4px solid var(--wood-dark); border-radius: 4px;
  box-shadow: inset 3px 3px 0 var(--wood-light), 0 5px 0 rgba(0,0,0,.3);
  transition: transform .1s;
}
.room-card:hover { transform: translateY(-3px); filter: brightness(1.08); }
.room-card:active { transform: translateY(2px); }
.room-card.st-locked { background: #555; border-color: #333; box-shadow: inset 3px 3px 0 #777, 0 5px 0 rgba(0,0,0,.3); }
.room-card.current { outline: 4px solid var(--gold); outline-offset: 2px; }
.head { display: flex; gap: 8px; align-items: center; width: 100%; flex-wrap: wrap; justify-content: center; }
.lvl { font-family: var(--font-title); font-size: 10px; background: var(--ink); padding: 3px 5px; }
.prog { width: 100%; display: flex; align-items: center; gap: 8px; }
.prog .bar { flex: 1; }
.small { font-size: 14px; color: #ffe7c2; }
.here { position: absolute; top: -14px; right: 10px; background: var(--gold); color: var(--ink); font-weight: 900; font-size: 13px; padding: 2px 8px; border: 2px solid var(--ink); animation: bob 1.2s infinite; }
.goal-line { background: rgba(0,0,0,.25); padding: 8px 10px; border-radius: 3px; }
.steps { list-style: none; padding: 0; display: grid; gap: 6px; }
.steps li { display: flex; align-items: center; gap: 10px; font-weight: 800; }
.steps .mark { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: #3b2a1a; border: 2px solid var(--ink); }
.steps li.done .mark { background: var(--good); }
.hub-buttons { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.locked-info { align-items: flex-start; flex-wrap: nowrap; }
@media (max-width: 900px) { .rooms { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .rooms { grid-template-columns: 1fr; } }
</style>
