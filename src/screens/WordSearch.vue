<script setup>
// WORD SEARCH — one target word at a time.
//   Top: list of all words (gray blanks → "SOFA ✓")
//   Prompt card: picture + English clue + letter count + Hint (Thai → first letter → word)
//   After a find: word card (picture, word, Thai, example, sound) + "Next Word"
//   Bottom: "Show All Clues" (collapsed at the start)
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVEL_BY_ID, LEVELS, ECONOMY } from '../data/levels.js'
import { LEVEL_GOALS } from '../data/learning.js'
import { generateGrid } from '../logic/gridGenerator.js'
import { checkSelection } from '../logic/selection.js'
import WordGrid from '../components/WordGrid.vue'
import ClueCard from '../components/ClueCard.vue'
import WordStrip from '../components/WordStrip.vue'
import SoundToggles from '../components/SoundToggles.vue'
import PixelSprite from '../components/PixelSprite.vue'
import Modal from '../components/Modal.vue'
import CoinCounter from '../components/CoinCounter.vue'

const store = useGameStore()
const roomId = store.params.room || 'bedroom'
const level = LEVEL_BY_ID[roomId]
if (!store.isUnlocked(roomId)) store.go('map')

const COLORS = ['#5fb340', '#4a9fe0', '#f28c28', '#d9463e', '#9a5ac2', '#26a69a', '#e3a92b', '#f29cc4']
const ARROWS = { E: '→', S: '↓', SE: '↘', NE: '↗', W: '←', N: '↑', NW: '↖', SW: '↙' }
const HINT_COST = ECONOMY.hintCost
const words = level.words.map((w) => w.word)
const byWord = Object.fromEntries(level.words.map((w) => [w.word, w]))
const goals = LEVEL_GOALS[roomId]
const nextLevel = LEVELS[level.level] || null

const phase = ref('intro') // intro | playing | paused | timeup | done
const mode = ref('practice')
const grid = ref([])
const placements = ref([])
const found = ref([]) // [{ word, cells, color }] — each word at most once
const hints = ref({}) // { WORD: 1 | 2 | 3 }
const target = ref(null) // the word the prompt card asks for
const wordCard = ref(null) // word shown in the "found" card (until Next Word)
const flash = ref(null)
const message = ref(null) // { kind, text } — short feedback under the grid
const showClues = ref(false)
const timeLeft = ref(level.timeLimit)
const promptEl = ref(null)
let timer = null
let flashTimer = null

const foundWords = computed(() => found.value.map((f) => f.word))
const foundColors = computed(() => Object.fromEntries(found.value.map((f) => [f.word, f.color])))
const allFound = computed(() => found.value.length === words.length)
const timeText = computed(() => `${Math.floor(timeLeft.value / 60)}:${String(timeLeft.value % 60).padStart(2, '0')}`)
const targetWord = computed(() => (target.value ? byWord[target.value] : null))
const hintStep = computed(() => (target.value ? hints.value[target.value] || 0 : 0))
const blanks = (w) => w.display.replace(/[A-Z]/g, '_').split('').join(' ')
const costText = HINT_COST > 0 ? `${HINT_COST} coins` : 'FREE · 0 coins'
const HINT_LABELS = ['Thai meaning', 'Flash the first letter', 'Show the word']
const nextHintLabel = computed(() => (hintStep.value < 3 ? `Hint ${hintStep.value + 1}: ${HINT_LABELS[hintStep.value]}` : 'Flash the first letter again'))

function nextUnfound(after = null) {
  const unfound = words.filter((w) => !foundWords.value.includes(w))
  if (!unfound.length) return null
  if (after) {
    const i = words.indexOf(after)
    return words.slice(i + 1).find((w) => unfound.includes(w)) || unfound[0]
  }
  return unfound[0]
}

// ----- size of the grid squares (fits the screen, never too small to drag) -----
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
function onResize() {
  vw.value = document.documentElement.clientWidth || window.innerWidth
  vh.value = window.innerHeight
}
const wide = computed(() => vw.value > 980)
const cell = computed(() => {
  const maxW = wide.value ? Math.min(vw.value, 1180) - 420 : vw.value - 36
  const maxH = wide.value ? vh.value - 120 : 9999
  return Math.max(30, Math.min(58, Math.floor(Math.min(maxW, maxH) / level.gridSize)))
})

// ----- game flow -----
function start(selectedMode) {
  mode.value = selectedMode
  store.startRound(roomId, selectedMode)
  const g = generateGrid(words, level.gridSize, level.directions)
  grid.value = g.grid
  placements.value = g.placements
  found.value = []
  hints.value = {}
  flash.value = null
  wordCard.value = null
  target.value = words[0]
  message.value = null
  timeLeft.value = level.timeLimit
  if (!store.data.tutorials['ws-' + roomId]) store.markTutorial('ws-' + roomId)
  phase.value = 'playing'
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
    // Any word of the level counts, even if it is not the current target.
    const w = byWord[res.word]
    found.value.push({ word: res.word, cells, color: COLORS[found.value.length % COLORS.length] })
    wordCard.value = res.word
    flash.value = null
    message.value = res.word === target.value
      ? { kind: 'good', text: `Great! You found ${w.display}.` }
      : { kind: 'good', text: `Great! You found ${w.display} too. It counts!` }
    store.sound('found')
    store.celebrate('stars')
    setTimeout(() => store.say(w.display), 350)
    if (allFound.value) finishWordSearch()
  } else if (res.result === 'already') {
    message.value = { kind: 'warn', text: `You already found ${byWord[res.word].display}. Look for a different word.` }
    store.sound('wrong')
  } else if (res.result === 'direction') {
    message.value = { kind: 'bad', text: `Try again. In this level, words go ${level.directions.map((d) => ARROWS[d]).join(' ')} only.` }
    store.sound('wrong')
  } else {
    message.value = { kind: 'bad', text: 'Try again. Select the letters in a straight line. Those letters do not spell a word in this level.' }
    store.sound('wrong')
  }
}

// Saves progress as soon as the last word is found (stops the timer).
function finishWordSearch() {
  clearInterval(timer)
  const inTime = mode.value === 'challenge' && timeLeft.value > 0
  store.completeWordSearch(roomId, inTime)
}

/** "Next Word": close the word card and go to a word that is not found yet. */
function nextWord() {
  const was = wordCard.value
  wordCard.value = null
  message.value = null
  if (allFound.value) return showResults()
  if (!target.value || foundWords.value.includes(target.value)) target.value = nextUnfound(was)
  store.sound('click')
}

function showResults() {
  phase.value = 'done'
  store.sound('success')
  store.celebrate('unlock')
}

function chooseTarget(word) {
  if (foundWords.value.includes(word)) return
  target.value = word
  wordCard.value = null
  store.sound('select')
  nextTick(() => promptEl.value?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }))
}

function viewFound(word) {
  wordCard.value = word
}

/** Hint ladder for the current word: 1 Thai meaning → 2 flash first letter → 3 show the word. */
function useHint() {
  const t = target.value
  if (!t || foundWords.value.includes(t) || phase.value !== 'playing') return
  if (!store.spendCoins(HINT_COST)) {
    message.value = { kind: 'warn', text: `You need ${HINT_COST} coins for a hint.` }
    return
  }
  const step = Math.min(3, (hints.value[t] || 0) + 1)
  hints.value = { ...hints.value, [t]: step }
  if (step >= 2) {
    const p = placements.value.find((pl) => pl.word === t)
    flash.value = { ...p.start }
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => (flash.value = null), 2600)
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
function back() {
  if (phase.value === 'intro' || phase.value === 'done' || found.value.length === 0) return store.go('map', { room: roomId })
  if (phase.value === 'playing') phase.value = 'paused'
  store.ask('Leave this level?', 'The words you found in this round will not be saved.', 'Leave', () => store.go('map', { room: roomId }))
}

// ResizeObserver also catches size changes that do not fire 'resize'
// (rotating a phone, browser zoom, device emulation).
let ro = null
onMounted(() => {
  window.addEventListener('resize', onResize)
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(onResize)
    ro.observe(document.documentElement)
  }
  onResize()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  ro?.disconnect()
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
      </div>
      <div class="count" aria-live="polite">🔍 <strong>{{ found.length }}</strong> / {{ words.length }} words</div>
      <div v-if="mode === 'challenge' && phase !== 'intro'" class="timer" :class="{ low: timeLeft <= 30 }">⏱ {{ timeText }}</div>
      <div v-else-if="phase !== 'intro'" class="mode-tag">Practice</div>
      <span class="spacer" />
      <CoinCounter class="coins-w" :coins="store.data.coins" />
      <SoundToggles inline />
      <button class="btn btn-small btn-blue" :disabled="phase !== 'playing'" @click="pause">⏸ Pause</button>
    </header>

    <div class="board" :class="{ wide }">
      <!-- 1. All words, compact -->
      <WordStrip
        class="a-strip"
        :words="level.words"
        :found="foundColors"
        :hints="hints"
        :target="target || ''"
        @select="chooseTarget"
        @view="viewFound"
      />

      <!-- 2. Prompt card OR found-word card -->
      <section ref="promptEl" class="a-prompt">
        <div v-if="wordCard" :key="'card-' + wordCard" class="word-card paper" :style="{ '--c': foundColors[wordCard] }">
          <div class="wc-top">
            <div class="wc-pic"><PixelSprite :name="byWord[wordCard].sprite" :size="72" :label="byWord[wordCard].display" /></div>
            <div class="wc-main">
              <div class="wc-word">{{ byWord[wordCard].display }} <span class="wc-th">— {{ byWord[wordCard].thai }}</span></div>
              <div class="wc-ex">“{{ byWord[wordCard].example }}”</div>
            </div>
          </div>
          <div class="wc-actions">
            <button class="btn btn-small btn-blue" :aria-label="'Listen to ' + byWord[wordCard].display" @click="store.say(byWord[wordCard].display)">🔊 Word</button>
            <button class="btn btn-small btn-wood" aria-label="Listen to the example sentence" @click="store.say(byWord[wordCard].example)">🔊 Sentence</button>
            <span class="spacer" />
            <button class="btn btn-green" @click="nextWord">{{ allFound ? '🎉 See Results' : 'Next Word ▶' }}</button>
          </div>
        </div>

        <div v-else-if="targetWord" :key="'q-' + target" class="prompt paper">
          <div class="p-pic"><PixelSprite :name="targetWord.sprite" :size="64" label="clue picture" /></div>
          <div class="p-main">
            <div class="p-k">FIND THIS WORD · {{ words.indexOf(target) + 1 }} of {{ words.length }}</div>
            <div class="p-clue">“{{ targetWord.clue }}”</div>
            <div class="p-blanks">
              <span v-if="hintStep >= 3" class="p-word">{{ targetWord.display }}</span>
              <span v-else class="b">{{ blanks(targetWord) }}</span>
              <span class="p-n">({{ targetWord.word.length }} letters)</span>
            </div>
            <div v-if="hintStep >= 1" class="p-thai">💡 Thai: <b>{{ targetWord.thai }}</b><span v-if="hintStep === 2"> · Look at the flashing letter!</span></div>
          </div>
          <div class="p-hint">
            <button class="btn btn-small btn-gold" :disabled="phase !== 'playing'" @click="useHint">💡 {{ nextHintLabel }}</button>
            <span class="cost">{{ costText }}</span>
          </div>
        </div>
        <p class="dirs">Directions in this level: <b>{{ level.directions.map((d) => ARROWS[d]).join(' ') }}</b> · Drag from the first letter to the last letter.</p>
      </section>

      <!-- 3. The grid -->
      <section class="a-grid">
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
      </section>

      <!-- 4. Short feedback -->
      <div v-if="message" :key="message.text" class="a-msg feedback" :class="message.kind" role="status">
        <span class="icon">{{ message.kind === 'good' ? '✔' : message.kind === 'bad' ? '✖' : message.kind === 'warn' ? '!' : 'ℹ' }}</span>
        <span>{{ message.text }}</span>
      </div>

      <!-- 5. All clues (collapsed at the start) -->
      <section class="a-clues">
        <button class="btn btn-wood clues-toggle" :aria-expanded="showClues" @click="showClues = !showClues">
          📋 {{ showClues ? 'Hide All Clues' : `Show All Clues (${words.length})` }}
        </button>
        <div v-if="showClues" class="clue-list">
          <ClueCard
            v-for="w in level.words"
            :key="w.word"
            :word="w"
            :found="foundWords.includes(w.word)"
            :hint-step="hints[w.word] || 0"
            :target="target === w.word"
            :color="foundColors[w.word] || '#5fb340'"
            @select="chooseTarget(w.word)"
          />
        </div>
      </section>
    </div>

    <!-- Start / tutorial -->
    <Modal v-if="phase === 'intro'" :title="`Level ${level.level}: ${level.name}`" wide>
      <div class="learn paper">
        <div class="learn-k">🎯 IN THIS LEVEL YOU WILL LEARN</div>
        <ul>
          <li><b>{{ words.length }} words</b> for things in the {{ level.name.toLowerCase() }}</li>
          <li>Position word: <b>{{ goals.position }}</b> — <i>{{ goals.pattern }}</i></li>
        </ul>
        <div class="learn-k small">AFTER THIS LEVEL</div>
        <ul class="cando"><li v-for="c in goals.canDo" :key="c">✔ {{ c }}</li></ul>
      </div>
      <div v-if="level.level === 1" class="tut">
        <h3>How to find a word</h3>
        <div class="tut-row">
          <div class="paper tut-card"><PixelSprite name="bed" :size="56" /><div><small>You sleep on this.</small><br /><strong>_ _ _</strong> <small>(3 letters)</small></div></div>
          <div class="arrow">➜</div>
          <div class="demo-row"><span>X</span><span class="hl">B</span><span class="hl">E</span><span class="hl">D</span><span>O</span><div class="sweep" /></div>
        </div>
        <ol>
          <li>Read the clue and look at the picture.</li>
          <li>Find the hidden word in the grid.</li>
          <li>Drag from the <b>first letter</b> to the <b>last letter</b>.</li>
          <li>Stuck? Press <b>💡 Hint</b> ({{ costText }}).</li>
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
        <h3>Harder English clues</h3>
        <p>Read the English clue carefully. Use <b>💡 Hint</b> to see the Thai meaning.</p>
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
        <button class="btn btn-gold" @click="start('challenge')">↻ Retry</button>
      </template>
    </Modal>

    <!-- All found: results + review -->
    <Modal v-if="phase === 'done'" title="Great job! All words found!" wide>
      <p class="res-line">You found all <b>{{ words.length }}</b> words in the {{ level.name }}.</p>
      <p v-if="mode === 'challenge' && store.data.round && store.data.round.timeBonus" class="feedback good"><span class="icon">⏱</span> You finished in time! +20 time bonus.</p>
      <div class="review">
        <div v-for="w in level.words" :key="w.word" class="rv paper">
          <PixelSprite :name="w.sprite" :size="44" :label="w.display" />
          <div class="rv-t">
            <div class="rv-w">{{ w.display }} <span class="thai">— {{ w.thai }}</span></div>
            <div class="rv-ex">“{{ w.example }}”</div>
          </div>
          <button class="btn btn-small btn-blue btn-icon" :aria-label="'Listen to ' + w.display" @click="store.say(w.display + '. ' + w.example)">🔊</button>
        </div>
      </div>
      <p>Next: answer 3 language challenges to finish the {{ level.name }}{{ nextLevel ? ` and open the ${nextLevel.name}` : '' }}.</p>
      <template #actions>
        <button class="btn btn-gold" @click="start(mode)">↻ Play Again</button>
        <button class="btn btn-green btn-big" @click="store.go('challenge', { room: roomId })">Next: Language Challenge ▶</button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>
.ws { max-width: 1180px; }
.ws-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; margin-bottom: 12px; }
.title { display: flex; align-items: center; gap: 8px; font-size: 19px; }
.lvl { font-family: var(--font-title); font-size: 10px; background: var(--ink); padding: 4px 6px; }
.count { font-weight: 800; background: rgba(0,0,0,.25); padding: 6px 10px; }
.timer { font-family: var(--font-title); font-size: 15px; background: #1d3b1d; color: #b8ff8a; padding: 8px 10px; border: 2px solid var(--ink); }
.timer.low { background: #5c1414; color: #ffb3a8; animation: pulse 1s infinite; }
.mode-tag { font-weight: 800; background: #2b6e2c; padding: 6px 10px; border: 2px solid var(--ink); }

/* ----- layout: phone = one column; desktop = grid left, prompt right ----- */
.board { display: grid; gap: 10px; grid-template-columns: 100%; grid-template-areas: 'strip' 'prompt' 'grid' 'msg' 'clues'; }
.board.wide {
  grid-template-columns: auto minmax(320px, 1fr); column-gap: 18px;
  grid-template-areas: 'grid strip' 'grid prompt' 'grid msg' 'grid clues';
  grid-template-rows: auto auto auto 1fr; align-items: start;
}
.a-strip { grid-area: strip; }
.a-prompt { grid-area: prompt; display: flex; flex-direction: column; gap: 6px; }
.a-grid { grid-area: grid; display: flex; justify-content: center; }
.a-msg { grid-area: msg; }
.a-clues { grid-area: clues; display: flex; flex-direction: column; gap: 8px; }
.board.wide .a-strip { justify-content: flex-start; }

/* prompt card */
.prompt { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; align-items: center; color: var(--ink); border-width: 4px; box-shadow: 0 0 0 3px var(--gold), 0 4px 0 rgba(0,0,0,.25); animation: pop .25s; }
.p-pic { width: 76px; height: 76px; display: flex; align-items: center; justify-content: center; background: #e9f4ff; border: 3px solid var(--ink); border-radius: 3px; grid-row: span 2; }
.p-k { font-family: var(--font-title); font-size: 9px; color: #b5651d; margin-bottom: 4px; }
.p-clue { font-size: 19px; font-weight: 800; line-height: 1.3; }
.p-blanks { margin-top: 4px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.p-blanks .b { font-size: 22px; font-weight: 900; letter-spacing: 1px; }
.p-word { font-size: 22px; font-weight: 900; color: #b5651d; letter-spacing: 2px; }
.p-n { font-size: 14px; font-weight: 800; color: #6b5a40; }
.p-thai { margin-top: 4px; font-family: var(--font-thai); font-size: 16px; background: #fff1c2; border: 2px dashed #c9a227; padding: 2px 8px; display: inline-block; }
.p-hint { grid-column: 2; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cost { font-size: 13px; font-weight: 900; color: #2b6e2c; background: #d9f7d9; border: 2px solid #2b6e2c; padding: 1px 6px; }
.dirs { margin: 0; font-size: 13px; color: #1f3550; background: rgba(255,255,255,.75); padding: 3px 8px; border-radius: 3px; }

/* found-word card */
.word-card { color: var(--ink); border-width: 4px; border-color: var(--ink); box-shadow: 0 0 0 4px var(--c, var(--good)), 0 4px 0 rgba(0,0,0,.25); animation: pop .3s; }
.wc-top { display: flex; gap: 12px; align-items: center; }
.wc-pic { width: 84px; height: 84px; flex: none; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--c, #5fb340) 25%, #fff); border: 3px solid var(--ink); }
.wc-word { font-size: 26px; font-weight: 900; letter-spacing: 1px; }
.wc-th { font-family: var(--font-thai); font-size: 20px; font-weight: 600; color: #5b4630; letter-spacing: 0; }
.wc-ex { font-size: 17px; font-style: italic; margin-top: 4px; }
.wc-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 10px; }

.grid-cover { display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; text-align: center; }
.clues-toggle { align-self: flex-start; }
.clue-list { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.board.wide .clue-list { grid-template-columns: 1fr; max-height: 46vh; overflow: auto; padding: 4px; }

/* intro + results */
.learn { color: var(--ink); margin-bottom: 8px; }
.learn ul { margin: 4px 0 8px; padding-left: 20px; }
.learn .cando { list-style: none; padding-left: 4px; }
.learn-k { font-family: var(--font-title); font-size: 10px; color: #b5651d; }
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
.res-line { font-size: 18px; margin-top: 0; }
.review { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); max-height: 46vh; overflow: auto; padding: 2px; }
.rv { display: flex; gap: 10px; align-items: center; color: var(--ink); padding: 8px; }
.rv-t { flex: 1; }
.rv-w { font-weight: 900; font-size: 18px; }
.rv-w .thai { font-weight: 600; }
.rv-ex { font-size: 14px; font-style: italic; }

@media (max-width: 560px) {
  .modes { grid-template-columns: 1fr; }
  /* compact on phones so the clue and the grid fit on one screen */
  .ws-head { gap: 6px; padding: 6px 8px; margin-bottom: 8px; }
  .ws-head .title { font-size: 16px; }
  .coins-w, .lvl { display: none; }
  .count { padding: 4px 6px; font-size: 14px; }
  .timer { font-size: 12px; padding: 6px; }
  .mode-tag { font-size: 13px; padding: 4px 6px; }
  .board { gap: 8px; }
  .prompt { padding: 8px; gap: 4px 8px; }
  .p-pic { width: 58px; height: 58px; }
  .p-pic :deep(svg) { width: 46px !important; height: 46px !important; }
  .p-clue { font-size: 16px; }
  .p-blanks .b, .p-word { font-size: 18px; }
  .p-hint { grid-column: 1 / -1; }
  .dirs { font-size: 12px; }
  .wc-pic { width: 64px; height: 64px; }
  .wc-word { font-size: 21px; }
  .wc-th { font-size: 17px; }
  .wc-ex { font-size: 15px; }
}
</style>
