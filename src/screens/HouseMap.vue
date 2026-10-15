<script setup>
// CHOOSE ROOM — pick a room, a difficulty and the timer, then play.
// Rooms open one by one (Bedroom → Garden). Open rooms can be replayed any time.
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS, LEVEL_BY_ID, DIFFICULTY, DIFFICULTY_ORDER } from '../data/levels.js'
import { LEVEL_GOALS } from '../data/learning.js'
import TopBar from '../components/TopBar.vue'
import RoomView from '../components/RoomView.vue'
import Modal from '../components/Modal.vue'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
const POSITIONS = ['on', 'under', 'next to', 'between']

const picked = ref(null) // room id for the start / locked window
const difficulty = ref('easy')
const mode = ref('practice')
const level = computed(() => (picked.value ? LEVEL_BY_ID[picked.value] : null))
const open = computed(() => store.openRound)

function status(id) {
  if (!store.isUnlocked(id)) return 'locked'
  return store.isCleared(id) ? 'cleared' : 'new'
}
function choose(id) {
  store.sound('click')
  picked.value = id
  const r = store.roomState(id)
  difficulty.value = store.canChooseDifficulty(id) ? r.lastDiff || 'easy' : 'easy'
  mode.value = r.lastMode || 'practice'
}
function randomRoom() {
  const ids = LEVELS.filter((l) => store.isUnlocked(l.id)).map((l) => l.id)
  choose(ids[Math.floor(Math.random() * ids.length)])
  store.toast(`Random room: ${LEVEL_BY_ID[picked.value].name}!`, 'info')
}
function start() {
  const r = store.startRound(picked.value, difficulty.value, mode.value)
  if (r) store.go('wordsearch')
}
function continueRound() {
  const r = open.value
  store.go(r.questDone ? 'reward' : r.wsDone ? 'quest' : 'wordsearch')
}

// Position words practised so far (from cleared rooms)
const learnedPositions = computed(() => {
  const set = new Set()
  for (const l of LEVELS) if (store.isCleared(l.id)) LEVEL_GOALS[l.id].position.split(' · ').forEach((p) => set.add(p))
  return set
})
const prevName = computed(() => (level.value && level.value.level > 1 ? LEVELS[level.value.level - 2].name : ''))
const previewWords = computed(() => (level.value ? level.value.words.slice(0, 6) : []))
</script>

<template>
  <main class="screen">
    <TopBar />
    <div class="title-row">
      <h1 class="screen-title">Choose a Room</h1>
      <button v-if="store.allCleared" class="btn btn-gold" @click="randomRoom">🎲 Random Room</button>
    </div>

    <!-- Unfinished round -->
    <section v-if="open" class="resume paper">
      <span>⏸ Round in progress: <b>{{ LEVEL_BY_ID[open.roomId].name }}</b> · {{ DIFFICULTY[open.difficulty].label }} — next: <b>{{ open.questDone ? 'Rewards' : open.wsDone ? '2. Place Items' : '1. Find Words' }}</b></span>
      <button class="btn btn-green" @click="continueRound">Continue ▶</button>
    </section>

    <!-- English progress -->
    <section class="skills-bar panel-light" aria-label="My English progress">
      <strong class="sb-title">🎯 My English</strong>
      <div class="sb-item">
        <span>📦 Words met</span>
        <div class="bar"><span :style="{ width: (store.data.learned.length / store.totalWords) * 100 + '%' }" /></div>
        <b>{{ store.data.learned.length }}/{{ store.totalWords }}</b>
      </div>
      <div class="sb-item">
        <span>📍 Position words</span>
        <span v-for="p in POSITIONS" :key="p" class="chip" :class="{ ok: learnedPositions.has(p) }">{{ learnedPositions.has(p) ? '✔' : '○' }} {{ p }}</span>
      </div>
      <button class="btn btn-small btn-blue" :disabled="!store.data.learned.length" @click="store.go('review')">Review Words</button>
    </section>

    <div class="house">
      <div class="roof" aria-hidden="true"><span v-for="n in 4" :key="n" :style="{ width: 40 + n * 15 + '%' }" /></div>
      <div class="rooms">
        <button
          v-for="l in LEVELS"
          :key="l.id"
          class="room-card"
          :class="['st-' + status(l.id), { next: store.nextRoomId === l.id }]"
          :aria-label="`${l.name}: ${status(l.id)}`"
          @click="choose(l.id)"
        >
          <div class="head">
            <span class="lvl">{{ l.level }}</span>
            <strong>{{ l.name }}</strong>
            <span class="badge" :class="status(l.id) === 'locked' ? 'badge-lock' : status(l.id) === 'cleared' ? 'badge-ok' : 'badge-new'">
              {{ status(l.id) === 'locked' ? '🔒 Locked' : status(l.id) === 'cleared' ? '✔ Cleared' : '★ New' }}
            </span>
          </div>
          <RoomView :room-id="l.id" :placements="store.data.placements" :cell="22" :locked="!store.isUnlocked(l.id)" />
          <div class="meta">
            <span class="pw">📍 {{ LEVEL_GOALS[l.id].position }}</span>
            <span v-if="store.roomState(l.id).plays" class="plays">played {{ store.roomState(l.id).plays }}×</span>
          </div>
          <span v-if="store.isUnlocked(l.id)" class="play-tag">▶ Play</span>
          <div v-if="store.nextRoomId === l.id" class="here">▼ Next</div>
        </button>
      </div>
    </div>

    <!-- Start a round -->
    <Modal v-if="level && store.isUnlocked(level.id)" :title="`Play: ${level.name}`" wide>
      <p class="mini">Position word: <b>{{ LEVEL_GOALS[level.id].position }}</b> · 15 words in this room — each round picks new ones.</p>

      <h3>1. Difficulty</h3>
      <div class="choices three">
        <button
          v-for="k in DIFFICULTY_ORDER"
          :key="k"
          class="choice"
          :class="{ on: difficulty === k, ['d-' + k]: true }"
          :disabled="k !== 'easy' && !store.canChooseDifficulty(level.id)"
          @click="difficulty = k"
        >
          <strong>{{ DIFFICULTY[k].label }} <span class="coin">+{{ DIFFICULTY[k].reward }} 🪙</span></strong>
          <span>{{ DIFFICULTY[k].desc }}</span>
        </button>
      </div>
      <p v-if="!store.canChooseDifficulty(level.id)" class="note">🔒 First time in this room: Easy. Clear it once to open Normal and Hard.</p>

      <h3>2. Timer</h3>
      <div class="choices two">
        <button class="choice" :class="{ on: mode === 'practice' }" @click="mode = 'practice'">
          <strong>🌱 Practice</strong>
          <span>No timer.</span>
        </button>
        <button class="choice" :class="{ on: mode === 'challenge' }" @click="mode = 'challenge'">
          <strong>⏱ Challenge</strong>
          <span>{{ DIFFICULTY[difficulty].timeLimit / 60 }} minutes for the words. In time: +20 🪙</span>
        </button>
      </div>
      <p v-if="open && open.roomId" class="note">Starting a new round ends your unfinished round.</p>
      <template #actions>
        <button class="btn" @click="picked = null">Cancel</button>
        <button class="btn btn-green btn-big" @click="start">▶ Start</button>
      </template>
    </Modal>

    <!-- Locked room -->
    <Modal v-else-if="level" :title="`${level.name} is locked`" light>
      <div class="row locked-info">
        <PixelSprite name="lock" :size="64" />
        <div>
          <p><strong>How to unlock:</strong> clear the <b>{{ prevName }}</b> once (Find Words + Place Items).</p>
          <p v-if="store.settings.thai" class="thai">เล่นห้อง {{ prevName }} ให้ผ่านหนึ่งครั้งเพื่อปลดล็อกห้องนี้</p>
          <p class="mini">Some words in this room:</p>
          <div class="preview">
            <span v-for="w in previewWords" :key="w.word" class="pv"><PixelSprite :name="w.sprite" :size="30" /></span>
            <span class="pv more">+{{ level.words.length - previewWords.length }}</span>
          </div>
        </div>
      </div>
      <template #actions>
        <button class="btn btn-green" @click="picked = null">OK</button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>
.title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.resume { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: space-between; color: var(--ink); max-width: 980px; margin: 0 auto 12px; border-width: 4px; box-shadow: 0 0 0 3px var(--gold); }
.skills-bar { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; max-width: 980px; margin: 0 auto 16px; padding: 10px 14px; }
.sb-title { font-size: 18px; }
.sb-item { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 700; }
.sb-item .bar { width: 140px; }
.chip { font-size: 14px; font-weight: 800; padding: 2px 8px; border: 2px solid var(--ink); background: #eee; color: #666; }
.chip.ok { background: #d9f7d9; color: #14532d; }
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
.room-card.next { outline: 4px solid var(--gold); outline-offset: 2px; }
.head { display: flex; gap: 8px; align-items: center; width: 100%; flex-wrap: wrap; justify-content: center; }
.lvl { font-family: var(--font-title); font-size: 10px; background: var(--ink); padding: 3px 6px; }
.meta { display: flex; gap: 8px; align-items: center; font-weight: 800; font-size: 14px; }
.pw { background: rgba(0,0,0,.3); padding: 2px 8px; }
.plays { color: #ffe7c2; }
.play-tag { font-weight: 900; background: #4caf50; border: 2px solid var(--ink); padding: 2px 12px; }
.st-locked .play-tag { display: none; }
.here { position: absolute; top: -14px; right: 10px; background: var(--gold); color: var(--ink); font-weight: 900; font-size: 13px; padding: 2px 8px; border: 2px solid var(--ink); animation: bob 1.2s infinite; }
.mini { margin: 0 0 6px; }
.modal h3 { font-size: 17px; margin: 12px 0 6px; color: #ffe7a3; }
.choices { display: grid; gap: 8px; }
.choices.three { grid-template-columns: repeat(3, 1fr); }
.choices.two { grid-template-columns: 1fr 1fr; }
.choice { font: inherit; text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 10px; cursor: pointer; background: #3b2a1a; color: #fff7e6; border: 3px solid var(--ink); border-radius: 4px; }
.choice span { font-size: 13px; }
.choice:hover:not(:disabled) { filter: brightness(1.2); }
.choice.on { background: #2b6e2c; box-shadow: 0 0 0 3px var(--gold); }
.choice:disabled { opacity: .45; cursor: not-allowed; }
.coin { font-size: 13px; color: var(--gold); }
.note { font-weight: 800; color: #ffe7a3; margin: 6px 0 0; }
.locked-info { align-items: flex-start; flex-wrap: nowrap; }
.preview { display: flex; gap: 6px; flex-wrap: wrap; }
.pv { background: #fff; border: 2px solid var(--ink); padding: 2px; display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; filter: grayscale(.6); }
.pv.more { font-weight: 900; filter: none; }
@media (max-width: 900px) { .rooms { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .choices.three, .choices.two { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .rooms { grid-template-columns: 1fr; } }
</style>
