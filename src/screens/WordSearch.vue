<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVEL_BY_ID } from '../data/levels.js'
import { generateGrid, BACKWARD_DIRS } from '../logic/gridGenerator.js'
import { checkSelection } from '../logic/selection.js'
import WordGrid from '../components/WordGrid.vue'
import ClueCard from '../components/ClueCard.vue'
import PixelSprite from '../components/PixelSprite.vue'
import Modal from '../components/Modal.vue'
import CoinCounter from '../components/CoinCounter.vue'

const store = useGameStore()
const roomId = store.params.room || 'bedroom'
const level = LEVEL_BY_ID[roomId]
if (!store.isUnlocked(roomId)) store.go('map')

const COLORS = ['#5fb340', '#4a9fe0', '#f28c28', '#d9463e', '#9a5ac2', '#26a69a', '#e3a92b', '#f29cc4']
const ARROWS = { E: '→', S: '↓', SE: '↘', NE: '↗', W: '←', N: '↑', NW: '↖', SW: '↙' }
const words = level.words.map((w) => w.word)

const phase = ref('intro') // intro | playing | paused | timeup | done
const mode = ref('practice')
const grid = ref([])
const placements = ref([])
const found = ref([]) // [{ word, cells, color }]
const hints = ref({})
const active = ref(null)
const flash = ref(null)
const lastFound = ref(null)
const message = ref({ kind: 'info', text: 'Read a clue, then drag across the letters to find the word.' })
const timeLeft = ref(level.timeLimit)
const showTutorial = ref(!store.data.tutorials['ws-' + roomId])
let timer = null
let flashTimer = null

const foundWords = computed(() => found.value.map((f) => f.word))
const firstTime = !store.roomState(roomId).wordSearch
const timeText = computed(() => `${Math.floor(timeLeft.value / 60)}:${String(timeLeft.value % 60).padStart(2, '0')}`)
const hasBackward = level.directions.some((d) => BACKWARD_DIRS.includes(d))

// ----- size of the grid squares (fits the screen, never too small to drag) -----
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
function onResize() {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}
const cell = computed(() => {
  const wide = vw.value > 980
  const maxW = wide ? Math.min(vw.value * 0.56, 680) : vw.value - 40
  const maxH = wide ? vh.value - 230 : 9999
  return Math.max(30, Math.min(58, Math.floor(Math.min(maxW, maxH) / level.gridSize)))
})

function newGrid() {
  const g = generateGrid(words, level.gridSize, level.directions)
  grid.value = g.grid
  placements.value = g.placements
  found.value = []
  hints.value = {}
  lastFound.value = null
  flash.value = null
  // Level 1 tutorial: the first word is shown with its picture
  if (level.level === 1 && firstTime) hints.value = { [words[0]]: 1 }
}

function start(selectedMode) {
  mode.value = selectedMode
  store.startRound(roomId, selectedMode)
  newGrid()
  timeLeft.value = level.timeLimit
  if (!store.data.tutorials['ws-' + roomId]) store.markTutorial('ws-' + roomId)
  showTutorial.value = false
  phase.value = 'playing'
  message.value = { kind: 'info', text: `Find ${words.length} words. Drag from the first letter to the last letter.` }
  startTimer()
  store.sound('click')
}

function startTimer() {
  clearInterval(timer)
  if (mode.value !== 'challenge') return
  timer = setInterval(() => {
    if (phase.value !== 'playing') return
    timeLeft.value--
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      clearInterval(timer)
      phase.value = 'timeup'
      store.sound('wrong')
    }
  }, 1000)
}

function onSelect(cells) {
  if (phase.value !== 'playing') return
  const res = checkSelection(cells, grid.value, words, foundWords.value, level.directions)
  if (res.result === 'short') return
  if (res.result === 'found') {
    const w = level.words.find((x) => x.word === res.word)
    found.value.push({ word: res.word, cells, color: COLORS[found.value.length % COLORS.length] })
    lastFound.value = w
    active.value = null
    flash.value = null
    message.value = { kind: 'good', text: `Great! You found ${w.display}.` }
    store.sound('found')
    store.celebrate('stars')
    setTimeout(() => store.say(w.display), 350)
    if (found.value.length === words.length) finish()
  } else if (res.result === 'already') {
    message.value = { kind: 'warn', text: 'You already found this word.' }
    store.sound('wrong')
  } else if (res.result === 'direction') {
    message.value = { kind: 'bad', text: `Try again. In this level, words go ${level.directions.map((d) => ARROWS[d]).join(' ')} only.` }
    store.sound('wrong')
  } else {
    message.value = { kind: 'bad', text: 'Try again. Select the letters in a straight line.' }
    store.sound('wrong')
  }
}

function finish() {
  clearInterval(timer)
  const inTime = mode.value === 'challenge' && timeLeft.value > 0
  store.completeWordSearch(roomId, inTime)
  setTimeout(() => {
    phase.value = 'done'
    store.sound('success')
    store.celebrate('unlock')
  }, 700)
}

function hint(wordStr) {
  const target = wordStr || active.value || words.find((w) => !foundWords.value.includes(w))
  if (!target || foundWords.value.includes(target)) return
  active.value = target
  const w = level.words.find((x) => x.word === target)
  const step = hints.value[target] || 0
  if (step === 0) {
    hints.value = { ...hints.value, [target]: 1 }
    message.value = { kind: 'info', text: `The word is ${w.display}. Now find it in the grid!` }
  } else {
    hints.value = { ...hints.value, [target]: 2 }
    const p = placements.value.find((pl) => pl.word === target)
    flash.value = { ...p.start }
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => (flash.value = null), 2600)
    message.value = { kind: 'info', text: `Look at the flashing letter "${target[0]}". ${w.display} starts there.` }
  }
  store.sound('click')
}

function pause() {
  if (phase.value === 'playing') phase.value = 'paused'
}
function resume() {
  if (phase.value === 'paused') phase.value = 'playing'
}
function continuePractice() {
  store.switchToPractice()
  mode.value = 'practice'
  phase.value = 'playing'
  message.value = { kind: 'info', text: 'Practice Mode: no timer. Take your time! (No time bonus this round.)' }
}
function retry() {
  start('challenge')
}
function back() {
  if (phase.value === 'intro' || phase.value === 'done' || found.value.length === 0) return store.go('map', { room: roomId })
  const was = phase.value
  if (was === 'playing') phase.value = 'paused'
  store.ask('Leave this level?', 'The words you found in this round will not be saved.', 'Leave', () => store.go('map', { room: roomId }))
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  clearInterval(timer)
  clearTimeout(flashTimer)
})
</script>

<template>
  <main class="screen ws">
    <header class="ws-head panel">
      <button class="btn btn-small" @click="back">◀ Back</button>
      <div class="title">
        <span class="lvl">LEVEL {{ level.level }}</span>
        <strong>{{ level.name }}</strong>
        <span v-if="store.settings.thai" class="thai-l">{{ level.thai }}</span>
      </div>
      <div class="count" aria-live="polite">🔍 Found <strong>{{ found.length }}</strong> / {{ words.length }}</div>
      <div v-if="mode === 'challenge' && phase !== 'intro'" class="timer" :class="{ low: timeLeft <= 30 }" aria-live="off">⏱ {{ timeText }}</div>
      <div v-else-if="phase !== 'intro'" class="mode-tag">Practice Mode</div>
      <span class="spacer" />
      <CoinCounter :coins="store.data.coins" />
      <button class="btn btn-small btn-gold" :disabled="phase !== 'playing'" @click="hint()">💡 Hint</button>
      <button class="btn btn-small btn-blue" :disabled="phase !== 'playing'" @click="pause">⏸ Pause</button>
    </header>

    <p class="goal"><span class="goal-label">GOAL</span> Find {{ words.length }} words. <span class="dirs">Directions: {{ level.directions.map((d) => ARROWS[d]).join(' ') }}</span></p>

    <div class="layout">
      <section class="grid-area">
        <div class="grid-holder">
          <WordGrid
            v-if="grid.length && phase !== 'paused'"
            :grid="grid"
            :cell="cell"
            :found="found"
            :flash="flash"
            :disabled="phase !== 'playing'"
            @select="onSelect"
            @dragstart="store.sound('select')"
          />
          <div v-else class="grid-cover panel-light" :style="{ width: cell * level.gridSize + 'px', height: cell * level.gridSize + 'px' }">
            <template v-if="phase === 'paused'">
              <h2 class="title-font">PAUSED</h2>
              <p>The grid is hidden while the game is paused.</p>
              <button class="btn btn-green btn-big" @click="resume">▶ Resume</button>
            </template>
            <PixelSprite v-else name="grass" :size="80" />
          </div>
        </div>
        <div class="feedback" :class="message.kind" role="status">
          <span class="icon">{{ message.kind === 'good' ? '✔' : message.kind === 'bad' ? '✖' : message.kind === 'warn' ? '!' : 'ℹ' }}</span>
          <span>{{ message.text }}</span>
        </div>
        <div v-if="lastFound" :key="lastFound.word" class="info-bar paper">
          <PixelSprite :name="lastFound.sprite" :size="64" :label="lastFound.display" />
          <div class="info-text">
            <div class="big-word">{{ lastFound.display }} <span v-if="store.settings.thai" class="thai">{{ lastFound.thai }}</span></div>
            <div>{{ lastFound.example }}</div>
          </div>
          <button class="btn btn-small btn-blue" :aria-label="'Listen to ' + lastFound.display" @click="store.say(lastFound.display)">🔊 Listen</button>
        </div>
      </section>

      <aside class="clues">
        <h2 class="clue-title">Clues</h2>
        <div class="clue-list">
          <ClueCard
            v-for="(w, i) in level.words"
            :key="w.word"
            :word="w"
            :clue-style="level.clueStyle"
            :found="foundWords.includes(w.word)"
            :revealed="(hints[w.word] || 0) >= 1"
            :active="active === w.word"
            :thai="store.settings.thai"
            :color="(found.find((f) => f.word === w.word) || {}).color || COLORS[i % COLORS.length]"
            @select="active = w.word"
            @hint="hint(w.word)"
          />
        </div>
      </aside>
    </div>

    <!-- Start / tutorial -->
    <Modal v-if="phase === 'intro'" :title="`Level ${level.level}: ${level.name}`" wide>
      <div v-if="level.level === 1" class="tut">
        <h3>How to find a word</h3>
        <div class="tut-row">
          <div class="paper tut-card"><PixelSprite name="bed" :size="56" /><div><strong>BED</strong><br /><small>You sleep on this.</small></div></div>
          <div class="arrow">➜</div>
          <div class="demo-row"><span>X</span><span class="hl">B</span><span class="hl">E</span><span class="hl">D</span><span>O</span><div class="sweep" /></div>
        </div>
        <ol>
          <li>Read the clue and look at the picture.</li>
          <li>Find the hidden word in the grid.</li>
          <li>Drag from the <b>first letter</b> to the <b>last letter</b>.</li>
        </ol>
        <p>In this level, words go across <b>→</b> or down <b>↓</b>.</p>
      </div>
      <div v-else-if="level.newSkill === 'diagonal'" class="tut">
        <h3>New! Diagonal words ↘ ↗</h3>
        <div class="demo-grid">
          <span class="hl">R</span><span>A</span><span>T</span>
          <span>O</span><span class="hl">U</span><span>P</span>
          <span>S</span><span>E</span><span class="hl">G</span>
        </div>
        <p>Words can go across, down, or <b>diagonally</b>. <i>RUG</i> goes ↘. Always read from left to right.</p>
      </div>
      <div v-else-if="level.newSkill === 'backwards'" class="tut">
        <h3>New! Backwards words ← ↑</h3>
        <div class="tut-row">
          <div class="demo-row back"><span>P</span><span class="hl">K</span><span class="hl">N</span><span class="hl">I</span><span class="hl">S</span><div class="sweep rev" /></div>
        </div>
        <p>Some words are written <b>backwards</b>. Here, <b>SINK</b> looks like <b>K N I S</b>.</p>
        <p>Find the first letter <b>S</b>, then drag to the last letter <b>K</b> (drag to the left ←). Words can also go up ↑.</p>
      </div>
      <div v-else class="tut">
        <h3>Clues in English</h3>
        <p>Read the English clue carefully. Press <b>🖼 Help</b> to see the picture{{ store.settings.thai ? ' and the Thai meaning' : '' }}.</p>
        <p>Words can go in all 8 directions: {{ level.directions.map((d) => ARROWS[d]).join(' ') }}</p>
      </div>
      <p v-if="store.settings.thai && level.level <= 3" class="thai tut-th">
        {{ level.level === 1 ? 'อ่านคำใบ้ หาคำในตาราง แล้วลากจากตัวอักษรแรกไปตัวสุดท้าย' : level.newSkill === 'diagonal' ? 'คำศัพท์อาจอยู่ในแนวทแยง' : 'คำศัพท์บางคำเขียนกลับหลัง ให้เริ่มลากจากตัวอักษรแรกของคำ' }}
      </p>

      <h3>Choose a mode</h3>
      <div class="modes">
        <button class="mode-card" :class="{ on: mode === 'practice' }" @click="mode = 'practice'">
          <strong>🌱 Practice Mode</strong>
          <span>No timer. Use hints any time.</span>
        </button>
        <button class="mode-card" :class="{ on: mode === 'challenge' }" @click="mode = 'challenge'">
          <strong>⏱ Challenge Mode</strong>
          <span>{{ Math.floor(level.timeLimit / 60) }}:{{ String(level.timeLimit % 60).padStart(2, '0') }} minutes. Finish in time: +20 bonus coins!</span>
        </button>
      </div>
      <template #actions>
        <button class="btn" @click="store.go('map', { room: roomId })">◀ Back</button>
        <button class="btn btn-green btn-big" @click="start(mode)">▶ Start</button>
      </template>
    </Modal>

    <!-- Time is up -->
    <Modal v-if="phase === 'timeup'" title="Time's up!">
      <p>You found {{ found.length }} of {{ words.length }} words. Don't worry — your house and coins are safe.</p>
      <p v-if="store.settings.thai" class="thai">หมดเวลาแล้ว! บ้านและเหรียญของคุณยังอยู่ครบ</p>
      <template #actions>
        <button class="btn btn-green" @click="continuePractice">🌱 Continue in Practice Mode</button>
        <button class="btn btn-gold" @click="retry">↻ Retry</button>
      </template>
    </Modal>

    <!-- All found -->
    <Modal v-if="phase === 'done'" title="All words found!">
      <div class="done-words">
        <div v-for="w in level.words" :key="w.word" class="dw"><PixelSprite :name="w.sprite" :size="36" /><span>{{ w.display }}</span></div>
      </div>
      <p v-if="mode === 'challenge' && store.data.round && store.data.round.timeBonus" class="feedback good"><span class="icon">⏱</span> You finished in time! +20 time bonus.</p>
      <p>Next: answer 3 language challenges.</p>
      <template #actions>
        <button class="btn btn-green btn-big" @click="store.go('challenge', { room: roomId })">Language Challenge ▶</button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>
.ws-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 12px; }
.title { display: flex; align-items: center; gap: 8px; font-size: 20px; }
.lvl { font-family: var(--font-title); font-size: 10px; background: var(--ink); padding: 4px 6px; }
.thai-l { font-family: var(--font-thai); color: #ffe7c2; font-size: 16px; }
.count { font-weight: 800; background: rgba(0,0,0,.25); padding: 6px 10px; }
.timer { font-family: var(--font-title); font-size: 16px; background: #1d3b1d; color: #b8ff8a; padding: 8px 10px; border: 2px solid var(--ink); }
.timer.low { background: #5c1414; color: #ffb3a8; animation: pulse 1s infinite; }
.mode-tag { font-weight: 800; background: #2b6e2c; padding: 6px 10px; border: 2px solid var(--ink); }
.goal { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-weight: 800; background: rgba(255,255,255,.85); border: 3px solid var(--ink); padding: 8px 12px; margin: 12px 0; }
.goal-label { font-family: var(--font-title); font-size: 10px; background: var(--gold); padding: 4px 6px; border: 2px solid var(--ink); }
.dirs { margin-left: auto; font-size: 15px; color: #444; }
.layout { display: flex; gap: 18px; align-items: flex-start; }
.grid-area { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.grid-holder { display: flex; justify-content: center; }
.grid-cover { display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; text-align: center; }
.feedback { width: 100%; }
.info-bar { display: flex; gap: 12px; align-items: center; width: 100%; animation: pop .3s; }
.info-text { flex: 1; }
.big-word { font-size: 24px; font-weight: 900; }
.big-word .thai { font-size: 18px; margin-left: 6px; }
.clues { flex: 1; min-width: 280px; }
.clue-title { font-family: var(--font-title); font-size: 13px; color: #fff; text-shadow: 2px 2px 0 var(--ink); }
.clue-list { display: grid; gap: 8px; max-height: calc(100vh - 240px); overflow: auto; padding: 4px 6px 4px 2px; }
.tut h3, .modal h3 { font-size: 18px; margin: 12px 0 8px; color: #ffe7a3; }
.tut ol { margin: 8px 0; padding-left: 22px; }
.tut-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center; }
.tut-card { display: flex; gap: 10px; align-items: center; color: var(--ink); }
.arrow { font-size: 28px; }
.demo-row { position: relative; display: flex; background: var(--paper); border: 3px solid var(--ink); }
.demo-row span, .demo-grid span { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; color: var(--ink); position: relative; z-index: 2; }
.demo-row .sweep { position: absolute; left: 40px; top: 4px; height: 32px; width: 0; background: rgba(246, 213, 72, .8); border-radius: 16px; animation: sweep 2s ease-in-out infinite; }
.demo-row.back .sweep.rev { left: auto; right: 0; animation-name: sweepRev; }
@keyframes sweep { 0%, 15% { width: 0; } 70%, 100% { width: 120px; } }
@keyframes sweepRev { 0%, 15% { width: 0; } 70%, 100% { width: 160px; } }
.demo-grid { display: grid; grid-template-columns: repeat(3, 40px); background: var(--paper); border: 3px solid var(--ink); width: max-content; margin: 0 auto; }
.demo-grid .hl { background: #f6d548; border-radius: 50%; animation: pulse 1.4s infinite; }
.tut-th { margin-top: 6px; }
.modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mode-card { font: inherit; text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 12px; cursor: pointer; background: #3b2a1a; color: #fff7e6; border: 3px solid var(--ink); border-radius: 4px; }
.mode-card:hover { filter: brightness(1.2); }
.mode-card.on { background: #2b6e2c; box-shadow: 0 0 0 3px var(--gold); }
.done-words { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 10px; }
.dw { display: flex; align-items: center; gap: 6px; background: #fffdf5; color: var(--ink); border: 2px solid var(--ink); padding: 4px 8px; font-weight: 900; }
@media (max-width: 980px) {
  .layout { flex-direction: column; align-items: stretch; }
  .clue-list { max-height: none; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
}
@media (max-width: 560px) { .modes { grid-template-columns: 1fr; } }
</style>
