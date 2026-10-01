<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVEL_BY_ID, ECONOMY } from '../data/levels.js'
import PixelSprite from '../components/PixelSprite.vue'
import SceneView from '../components/SceneView.vue'
import CoinCounter from '../components/CoinCounter.vue'

const store = useGameStore()
const roomId = store.params.room || 'bedroom'
const level = LEVEL_BY_ID[roomId]
const round = store.ensureChallengeRound(roomId)
if (!round) {
  store.toast('Find all the words first!', 'warn')
  store.go('map', { room: roomId })
}

const idx = ref(0)
const wrongCount = ref(0)
const choice = ref(null) // choose / position
const built = ref([]) // order: tile ids
const solved = ref(false)
const feedback = ref(null) // { kind, text, extra }
const shake = ref(false)

const q = computed(() => level.challenges[idx.value])
const showAnswer = computed(() => wrongCount.value >= 3)

function shuffled(words) {
  const tiles = words.map((w, i) => ({ id: i, w }))
  for (let tries = 0; tries < 20; tries++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }
    if (tiles.map((t) => t.w).join(' ') !== words.join(' ')) break
  }
  return tiles
}
const tiles = ref(q.value?.type === 'order' ? shuffled(q.value.words) : [])

const bank = computed(() => tiles.value.filter((t) => !built.value.includes(t.id)))
const sentence = computed(() => built.value.map((id) => tiles.value.find((t) => t.id === id).w))
const correctAnswerText = computed(() => {
  if (q.value.type === 'order') return q.value.words.join(' ') + '.'
  return q.value.answer
})
const canCheck = computed(() => !solved.value && (q.value.type === 'order' ? built.value.length === q.value.words.length : choice.value !== null))

function pick(text) {
  if (solved.value) return
  choice.value = text
  store.sound('select')
}
function addTile(id) {
  if (solved.value) return
  built.value.push(id)
  store.sound('select')
}
function removeTile(id) {
  if (solved.value) return
  built.value = built.value.filter((x) => x !== id)
}

function check() {
  const ok = q.value.type === 'order' ? sentence.value.join(' ') === q.value.words.join(' ') : choice.value === q.value.answer
  if (ok) {
    solved.value = true
    const firstTry = wrongCount.value === 0
    store.recordAnswer(idx.value, firstTry)
    feedback.value = { kind: 'good', text: q.value.correct, extra: firstTry ? `+${ECONOMY.languageBonusPerQuestion} bonus coins (correct on the first try)` : '' }
    store.sound('success')
    store.celebrate('stars')
    store.say(q.value.correct.replace(/^Correct!\s*/, ''))
    return
  }
  wrongCount.value++
  store.recordAnswer(idx.value, false) // saved now, so a page refresh cannot win the bonus back
  store.sound('wrong')
  shake.value = true
  setTimeout(() => (shake.value = false), 350)
  if (wrongCount.value >= 3) {
    feedback.value = { kind: 'warn', text: q.value.explain, extra: 'Now choose the correct answer to continue.' }
  } else if (wrongCount.value === 2) {
    feedback.value = { kind: 'bad', text: q.value.wrong, extra: q.value.hint }
  } else {
    feedback.value = { kind: 'bad', text: q.value.wrong, extra: '' }
  }
}

function tryAgain() {
  choice.value = null
  built.value = []
  feedback.value = showAnswer.value ? feedback.value : null
}

function next() {
  if (idx.value < level.challenges.length - 1) {
    idx.value++
    wrongCount.value = 0
    choice.value = null
    built.value = []
    solved.value = false
    feedback.value = null
    tiles.value = q.value.type === 'order' ? shuffled(q.value.words) : []
  } else {
    const reward = store.finishRound(roomId)
    if (reward) {
      store.celebrate('coins')
      store.sound('buy')
    }
    store.go('complete', { room: roomId })
  }
}
</script>

<template>
  <main v-if="round" class="screen lc">
    <header class="head panel">
      <button class="btn btn-small" @click="store.go('map', { room: roomId })">◀ Map</button>
      <strong class="t">Language Challenge — {{ level.name }}</strong>
      <span class="spacer" />
      <div class="dots" :aria-label="`Question ${idx + 1} of ${level.challenges.length}`">
        <span v-for="(c, i) in level.challenges" :key="i" :class="{ on: i === idx, done: i < idx || (i === idx && solved) }">{{ i < idx || (i === idx && solved) ? '✔' : i + 1 }}</span>
      </div>
      <CoinCounter :coins="store.data.coins" />
    </header>

    <section class="card panel-light" :class="{ shake }">
      <div class="qtype">
        {{ q.type === 'choose' ? 'Read and choose' : q.type === 'order' ? 'Make a sentence' : 'Look and choose the position word' }}
        <span class="muted">· Challenge {{ idx + 1 }} of {{ level.challenges.length }}</span>
      </div>
      <h2 class="prompt">{{ q.prompt }}</h2>
      <p v-if="store.settings.thai" class="thai">
        {{ q.type === 'choose' ? 'อ่านคำถามแล้วเลือกสิ่งของที่ถูกต้อง' : q.type === 'order' ? 'แตะคำเพื่อเรียงเป็นประโยค' : 'ดูภาพแล้วเลือกคำบอกตำแหน่ง' }}
      </p>

      <!-- Read and choose an item -->
      <div v-if="q.type === 'choose'" class="options">
        <button
          v-for="o in q.options"
          :key="o.text"
          class="opt"
          :class="{ chosen: choice === o.text, answer: showAnswer && o.text === q.answer, right: solved && o.text === q.answer }"
          :disabled="solved"
          @click="pick(o.text)"
        >
          <PixelSprite :name="o.sprite" :size="72" :label="o.text" />
          <span>{{ o.text }}</span>
        </button>
      </div>

      <!-- Put the words in order -->
      <div v-else-if="q.type === 'order'" class="order">
        <div class="built" aria-label="Your sentence">
          <button v-for="id in built" :key="id" class="tile on" :disabled="solved" @click="removeTile(id)">{{ tiles.find((t) => t.id === id).w }}</button>
          <span v-if="!built.length" class="placeholder">Tap the words below to build the sentence.</span>
          <span v-else class="dot">.</span>
        </div>
        <div class="bank">
          <button v-for="t in bank" :key="t.id" class="tile" @click="addTile(t.id)">{{ t.w }}</button>
        </div>
        <p v-if="showAnswer && !solved" class="answer-line">Correct sentence: <strong>{{ correctAnswerText }}</strong></p>
      </div>

      <!-- Position words with a picture -->
      <div v-else class="position">
        <SceneView :scene="q.scene" :width="300" />
        <div class="options words">
          <button
            v-for="o in q.options"
            :key="o"
            class="opt word"
            :class="{ chosen: choice === o, answer: showAnswer && o === q.answer, right: solved && o === q.answer }"
            :disabled="solved"
            @click="pick(o)"
          >
            {{ o }}
          </button>
        </div>
      </div>

      <div v-if="feedback" class="feedback" :class="feedback.kind" role="status">
        <span class="icon">{{ feedback.kind === 'good' ? '✔' : feedback.kind === 'warn' ? '!' : '✖' }}</span>
        <div>
          <div>{{ feedback.text }}</div>
          <div v-if="feedback.extra" class="extra">{{ feedback.extra }}</div>
        </div>
      </div>

      <div class="row actions">
        <button v-if="!solved && feedback && feedback.kind !== 'good'" class="btn" @click="tryAgain">↺ Try Again</button>
        <button v-if="!solved" class="btn btn-green" :disabled="!canCheck" @click="check">✔ Check Answer</button>
        <button v-else class="btn btn-green btn-big" @click="next">{{ idx < level.challenges.length - 1 ? 'Next ▶' : 'Finish ▶' }}</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.lc { max-width: 900px; }
.head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 12px; margin-bottom: 16px; }
.t { font-size: 19px; }
.dots { display: flex; gap: 6px; }
.dots span { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-weight: 900; background: #3b2a1a; border: 2px solid var(--ink); }
.dots span.on { background: var(--gold); color: var(--ink); }
.dots span.done { background: var(--good); color: #fff; }
.card { display: flex; flex-direction: column; gap: 14px; }
.qtype { font-family: var(--font-title); font-size: 11px; color: #6b4a00; }
.prompt { font-size: 26px; font-weight: 900; margin: 0; }
.options { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
.opt {
  font: inherit; font-weight: 900; font-size: 18px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 16px; min-width: 150px; background: #fffdf5; border: 3px solid var(--ink); border-radius: 4px; cursor: pointer;
  box-shadow: 0 4px 0 rgba(0,0,0,.3); transition: transform .08s;
}
.opt:hover:not(:disabled) { transform: translateY(-2px); background: #fff; }
.opt:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.3); }
.opt:disabled { cursor: default; }
.opt.chosen { background: #ffe9a8; box-shadow: 0 0 0 3px #e3a92b, 0 4px 0 rgba(0,0,0,.3); }
.opt.answer { outline: 4px dashed var(--good); outline-offset: 3px; }
.opt.right { background: #d9f7d9; }
.opt.right::after { content: '✔ Correct'; font-size: 13px; color: var(--good); }
.word { min-width: 120px; font-size: 22px; padding: 16px; }
.position { display: flex; flex-direction: column; gap: 14px; align-items: center; }
.order { display: flex; flex-direction: column; gap: 14px; }
.built { min-height: 64px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px; background: #fff; border: 3px dashed #777; border-radius: 4px; }
.placeholder { color: #777; }
.dot { font-size: 26px; font-weight: 900; }
.bank { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; min-height: 54px; }
.tile { font: inherit; font-size: 20px; font-weight: 800; padding: 8px 14px; background: #ffe9a8; border: 3px solid var(--ink); border-radius: 3px; cursor: pointer; box-shadow: 0 3px 0 rgba(0,0,0,.3); }
.tile:hover:not(:disabled) { transform: translateY(-2px); }
.tile:active:not(:disabled) { transform: translateY(2px); }
.tile.on { background: #c9ecff; }
.answer-line { background: #fff1c2; border: 2px solid var(--ink); padding: 8px; }
.extra { font-weight: 700; margin-top: 4px; }
.actions { justify-content: flex-end; }
</style>
