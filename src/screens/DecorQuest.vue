<script setup>
// DECORATING QUEST (round step 2: Place Items)
// A temporary practice scene: the things are borrowed for free and nothing
// here changes My House. One instruction at a time:
//   read → drag the item to a dashed space (it snaps) → Check Placement.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVEL_BY_ID, DIFFICULTY, QUEST_THINGS, POSITION_WORDS, REL_WORD } from '../data/levels.js'
import { questById } from '../logic/round.js'
import { buildScene, checkStep, correctSlots, questHint, COLS } from '../logic/quest.js'
import PixelSprite from '../components/PixelSprite.vue'
import SceneView from '../components/SceneView.vue'
import Modal from '../components/Modal.vue'
import RoundSteps from '../components/RoundSteps.vue'
import SoundToggles from '../components/SoundToggles.vue'

const store = useGameStore()
const round = store.data.round
const valid = !!round && !round.claimed && round.wsDone
if (!round || round.claimed) store.go('map')
else if (!round.wsDone) store.go('wordsearch')
else if (round.questDone) store.go('reward')

const level = LEVEL_BY_ID[round?.roomId || 'bedroom']
const diff = DIFFICULTY[round?.difficulty] || DIFFICULTY.easy
const quests = valid ? round.quests.map((id) => questById(round.roomId, id)) : []
// Mirror some scenes so the answer is not always on the same side
const flips = quests.map(() => Math.random() < 0.5)

const stepIndex = ref(0)
const placed = ref(null) // slot id where the item is, or null (= in the tray)
const selected = ref(false) // tap-to-place: item picked up
const tries = ref(0)
const solved = ref(false)
const feedback = ref(null)
const drag = ref(null) // { x, y }
const hoverSlot = ref(null)
const lesson = ref(null) // position word to explain
const showIntro = ref(!store.data.tutorials['quest-intro'])
const stageEl = ref(null)

const quest = computed(() => quests[stepIndex.value])
const scene = computed(() => (quest.value ? buildScene(quest.value, flips[stepIndex.value]) : null))
const item = computed(() => (quest.value ? QUEST_THINGS[quest.value.item] : null))
const relWord = computed(() => (quest.value ? REL_WORD[quest.value.rel] : ''))
const isLast = computed(() => stepIndex.value === quests.length - 1)
const glowSlots = computed(() => (tries.value >= 2 && !solved.value ? correctSlots(quest.value, scene.value) : []))

// ----- sizes -----
const vw = ref(window.innerWidth)
function onResize() {
  vw.value = document.documentElement.clientWidth || window.innerWidth
}
const colW = computed(() => Math.max(52, Math.min(110, Math.floor((Math.min(vw.value, 760) - 48) / COLS))))
const stageW = computed(() => colW.value * COLS)
const stageH = computed(() => Math.round(colW.value * 2.5))
const floorY = computed(() => stageH.value - Math.max(24, Math.round(colW.value * 0.45))) // room for the names
const PROP = 0.9 // prop size in columns

function propBox(p) {
  const s = colW.value * PROP
  const raised = QUEST_THINGS[p.id].raised
  const bottom = raised ? floorY.value - colW.value * 1.05 : floorY.value
  return { x: p.col * colW.value + (colW.value - s) / 2, y: bottom - s, w: s, h: s }
}
/** y of the top surface of a thing (so items sit on it, not above it). */
function surfaceY(prop, pb) {
  return pb.y + pb.h * (QUEST_THINGS[prop.id].top ?? 0.25)
}
function slotBox(slot) {
  const c = colW.value
  if (slot.type === 'floor') {
    const s = c * 0.86
    return { x: slot.col * c + (c - s) / 2, y: floorY.value - s, w: s, h: s }
  }
  const prop = scene.value.props.find((p) => p.col === slot.col)
  const pb = propBox(prop)
  if (slot.type === 'on') {
    const s = c * 0.58
    return { x: pb.x + (pb.w - s) / 2, y: surfaceY(prop, pb) - s * 0.95, w: s, h: s }
  }
  // under: low box at the floor, below the thing
  const w = c * 0.8
  const h = c * 0.46
  return { x: slot.col * c + (c - w) / 2, y: floorY.value - h, w, h }
}
/** Where the item is drawn when it sits in a slot. */
function itemBox(slot) {
  const c = colW.value
  const kind = item.value.kind
  if (slot.type === 'floor') {
    const s = kind === 'big' ? c * PROP : kind === 'flat' ? c * 0.9 : c * 0.6
    const h = kind === 'flat' ? s * 0.45 : s
    return { x: slot.col * c + (c - s) / 2, y: floorY.value - h, w: s, h, z: 3 }
  }
  const prop = scene.value.props.find((p) => p.col === slot.col)
  const pb = propBox(prop)
  if (slot.type === 'on') {
    const s = c * 0.52
    return { x: pb.x + (pb.w - s) / 2, y: surfaceY(prop, pb) - s * 0.9, w: s, h: s, z: 6 }
  }
  // a rug under something: wide and low, spilling onto the floor so it stays visible
  if (kind === 'flat') return { x: slot.col * c - c * 0.22, y: floorY.value - c * 0.2, w: c * 1.44, h: c * 0.36, z: 1 }
  const s = c * 0.42
  return { x: slot.col * c + (c - s) / 2, y: floorY.value - s, w: s, h: s, z: 1 }
}
const px = (b) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' })
const placedSlot = computed(() => scene.value?.slots.find((s) => s.id === placed.value) || null)

// ----- drag & drop (mouse, pen and touch) + tap-to-place -----
function stagePoint(e) {
  const r = stageEl.value.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}
function nearestSlot(pt) {
  let best = null
  let bestD = Infinity
  for (const s of scene.value.slots) {
    const b = slotBox(s)
    const d = Math.hypot(pt.x - (b.x + b.w / 2), pt.y - (b.y + b.h / 2))
    if (d < bestD) {
      bestD = d
      best = s
    }
  }
  return bestD <= colW.value * 0.85 ? best : null // snap radius
}
let downAt = null
function onItemDown(e) {
  if (solved.value) return
  downAt = { x: e.clientX, y: e.clientY }
  drag.value = { x: e.clientX, y: e.clientY, moved: false }
  e.preventDefault()
}
function onMove(e) {
  if (!drag.value) return
  drag.value = { x: e.clientX, y: e.clientY, moved: drag.value.moved || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8 }
  if (drag.value.moved && stageEl.value) hoverSlot.value = nearestSlot(stagePoint(e))?.id || null
}
function onUp(e) {
  if (!drag.value) return
  const moved = drag.value.moved
  drag.value = null
  hoverSlot.value = null
  if (!moved) {
    // a tap: pick the item up, then tap a dashed space
    selected.value = !selected.value
    if (selected.value) feedback.value = { kind: 'info', text: 'Now tap a dashed space.' }
    return
  }
  const slot = stageEl.value ? nearestSlot(stagePoint(e)) : null
  drop(slot)
}
function onStageTap(e) {
  if (!selected.value || solved.value) return
  if (e.target.closest('.placed')) return // this tap picked the item up
  const slot = nearestSlot(stagePoint(e))
  if (slot) drop(slot)
}
function drop(slot) {
  selected.value = false
  if (!slot) {
    placed.value = null
    feedback.value = { kind: 'warn', text: 'Drop it in a dashed space.' }
    return
  }
  placed.value = slot.id
  feedback.value = null
  store.sound('place')
}

// ----- checking -----
const statement = computed(() => {
  // "Put the lamp on the desk." → "The lamp is on the desk."
  const q = quest.value
  const name = QUEST_THINGS[q.item].name
  return `The ${name} is ${q.text.slice(`Put the ${name} `.length)}`
})
const why = computed(() => POSITION_WORDS[relWord.value].text.split('. ')[0] + '.')

function check() {
  if (!placed.value || solved.value) return
  if (checkStep(quest.value, scene.value, placed.value)) {
    solved.value = true
    feedback.value = { kind: 'good', text: `Correct! ${statement.value}` }
    store.sound('success')
    store.celebrate('stars')
    store.say(statement.value)
  } else {
    tries.value++
    feedback.value = {
      kind: 'bad',
      text: `Not yet. Read again: “${quest.value.text}”`,
      why: why.value,
      hint: questHint(quest.value) + (tries.value >= 2 ? ' The right space is glowing.' : ''),
    }
    store.sound('wrong')
  }
}

function next() {
  if (!solved.value) return
  if (!isLast.value) {
    stepIndex.value++
    placed.value = null
    selected.value = false
    tries.value = 0
    solved.value = false
    feedback.value = null
    openLessonIfNew()
    store.sound('click')
    return
  }
  store.completeQuest()
  store.go('reward')
}

function openLessonIfNew() {
  const key = 'pos-' + relWord.value
  if (!showIntro.value && quest.value && !store.data.tutorials[key]) lesson.value = relWord.value
}
function closeLesson() {
  store.markTutorial('pos-' + lesson.value)
  lesson.value = null
}
function closeIntro() {
  store.markTutorial('quest-intro')
  showIntro.value = false
  openLessonIfNew()
}
function back() {
  store.ask('Leave this round?', 'Your found words are saved. You can come back and place the items later.', 'Leave', () => store.go('map'))
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  onResize()
  openLessonIfNew()
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
})
</script>

<template>
  <main v-if="valid && quest" class="screen dq">
    <header class="dq-head panel">
      <button class="btn btn-small" @click="back">◀ Back</button>
      <div class="title">
        <span class="lvl" :class="'d-' + diff.key">{{ diff.label.toUpperCase() }}</span>
        <strong>{{ level.name }}</strong>
      </div>
      <div class="count">Instruction <strong>{{ stepIndex + 1 }}</strong>/{{ quests.length }}</div>
      <span class="spacer" />
      <SoundToggles inline />
    </header>
    <RoundSteps :step="2" class="steps-bar" />

    <!-- GOAL: the instruction -->
    <section class="goal-card paper" :key="'g' + stepIndex">
      <div class="goal-k">GOAL · READ AND DO</div>
      <div class="goal-text">{{ quest.text }}</div>
      <div class="goal-btns">
        <button class="btn btn-small btn-blue" @click="store.say(quest.text)">🔊 Listen</button>
        <button class="btn btn-small btn-wood" @click="lesson = relWord">📘 What does “{{ relWord }}” mean?</button>
      </div>
    </section>

    <!-- The scene -->
    <section class="stage-wrap">
      <div
        ref="stageEl"
        class="stage"
        :class="'theme-' + level.id"
        :style="{ width: stageW + 'px', height: stageH + 'px' }"
        @click="onStageTap"
      >
        <div class="floor" :style="{ top: floorY + 'px' }" />
        <!-- things already in the scene -->
        <div v-for="p in scene.props" :key="p.id + p.col" class="prop" :style="{ ...px(propBox(p)), zIndex: 4 }">
          <PixelSprite :name="QUEST_THINGS[p.id].sprite" size="100%" :label="QUEST_THINGS[p.id].name" />
        </div>
        <!-- the item, once placed -->
        <div
          v-if="placedSlot"
          class="placed"
          :class="{ ok: solved }"
          :style="{ ...px(itemBox(placedSlot)), zIndex: itemBox(placedSlot).z }"
          @pointerdown="onItemDown"
        >
          <PixelSprite :name="item.sprite" size="100%" :stretch="item.kind === 'flat'" :label="item.name" />
        </div>
        <!-- dashed drop spaces -->
        <template v-if="!solved">
          <div
            v-for="s in scene.slots"
            :key="s.id"
            class="slot"
            :class="{ hover: hoverSlot === s.id, glow: glowSlots.includes(s.id), ready: selected, filled: placed === s.id }"
            :style="px(slotBox(s))"
          />
        </template>
        <!-- English names -->
        <div v-for="p in scene.props" :key="'n' + p.id" class="name" :style="{ left: p.col * colW + 'px', width: colW + 'px', top: floorY + 4 + 'px' }">
          {{ QUEST_THINGS[p.id].name }}
        </div>
      </div>
    </section>

    <!-- Item tray + check -->
    <section class="bottom">
      <div class="tray panel">
        <span class="tray-k">Drag this:</span>
        <button
          v-if="!placed"
          class="tray-item"
          :class="{ sel: selected }"
          :aria-label="'Drag the ' + item.name"
          @pointerdown="onItemDown"
        >
          <PixelSprite :name="item.sprite" :size="54" :label="item.name" />
          <span>{{ item.name }}</span>
        </button>
        <span v-else class="tray-placed">✔ {{ item.name }} placed — drag it again to move it.</span>
      </div>
      <button v-if="!solved" class="btn btn-green btn-big check" :disabled="!placed" @click="check">✔ Check Placement</button>
      <button v-else class="btn btn-green btn-big check" @click="next">{{ isLast ? 'Get Rewards ▶' : 'Next Instruction ▶' }}</button>
    </section>

    <div v-if="feedback" :key="feedback.text + tries" class="feedback" :class="feedback.kind" role="status">
      <span class="icon">{{ feedback.kind === 'good' ? '✔' : feedback.kind === 'bad' ? '✖' : feedback.kind === 'warn' ? '!' : 'ℹ' }}</span>
      <div>
        <div>{{ feedback.text }}</div>
        <div v-if="feedback.why" class="extra">Why: {{ feedback.why }}</div>
        <div v-if="feedback.hint" class="extra">Hint: {{ feedback.hint }} <span class="free">(free)</span></div>
      </div>
    </div>

    <!-- ghost while dragging -->
    <div v-if="drag && drag.moved" class="ghost" :style="{ left: drag.x + 'px', top: drag.y + 'px', width: colW * 0.8 + 'px', height: colW * 0.8 + 'px' }">
      <PixelSprite :name="item.sprite" size="100%" />
    </div>

    <!-- First time: how to place items -->
    <Modal v-if="showIntro" title="How to place items" wide>
      <div class="demo">
        <div class="demo-stage">
          <div class="d-prop"><PixelSprite name="desk" size="100%" /></div>
          <div class="d-slot" />
          <div class="d-item"><PixelSprite name="lamp" size="100%" /></div>
          <div class="d-hand">👆</div>
        </div>
        <ol>
          <li>Read the instruction, e.g. <b>“Put the lamp on the desk.”</b></li>
          <li>Drag the item to a <b>dashed space</b>. It snaps into place. (Or tap the item, then tap a space.)</li>
          <li>Press <b>✔ Check Placement</b>. Wrong? Read again and try — no coins are lost.</li>
        </ol>
        <p class="muted">This is a practice scene. It does not change My House.</p>
      </div>
      <template #actions>
        <button class="btn btn-green btn-big" @click="closeIntro">Got it! ▶</button>
      </template>
    </Modal>

    <!-- Position word lesson -->
    <Modal v-if="lesson" :title="`Position word: ${lesson.toUpperCase()}`">
      <div class="lesson paper">
        <SceneView :scene="POSITION_WORDS[lesson].scene" :width="260" />
        <p class="lw">{{ POSITION_WORDS[lesson].text }}</p>
        <p v-if="store.settings.thai" class="thai">{{ lesson }} = {{ POSITION_WORDS[lesson].thai }}</p>
        <button class="btn btn-small btn-blue" @click="store.say(POSITION_WORDS[lesson].text.split('= ')[1])">🔊 Listen</button>
      </div>
      <template #actions>
        <button class="btn btn-green" @click="closeLesson">Got it!</button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>
.dq { max-width: 860px; }
.dq-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; margin-bottom: 10px; }
.title { display: flex; align-items: center; gap: 8px; font-size: 19px; }
.lvl { font-family: var(--font-title); font-size: 10px; background: var(--ink); padding: 4px 6px; }
.lvl.d-easy { background: #2b6e2c; }
.lvl.d-normal { background: #20568c; }
.lvl.d-hard { background: #8b2a24; }
.count { font-weight: 800; background: rgba(0,0,0,.25); padding: 6px 10px; }
.steps-bar { margin: -2px 0 10px; }
.goal-card { color: var(--ink); border-width: 4px; box-shadow: 0 0 0 3px var(--gold), 0 4px 0 rgba(0,0,0,.25); margin-bottom: 12px; animation: pop .25s; }
.goal-k { font-family: var(--font-title); font-size: 10px; color: #b5651d; }
.goal-text { font-size: clamp(20px, 3.4vw, 28px); font-weight: 900; margin: 6px 0 8px; }
.goal-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.stage-wrap { display: flex; justify-content: center; }
.stage {
  position: relative; touch-action: none; user-select: none; overflow: hidden;
  background: var(--wall, #b9d7f0); border: 4px solid var(--ink); border-radius: 4px; box-shadow: 0 6px 0 rgba(0,0,0,.3);
}
.floor { position: absolute; left: 0; right: 0; bottom: 0; background: var(--floorc, #d4a46a); border-top: 4px solid rgba(0,0,0,.25);
  background-image: repeating-linear-gradient(90deg, rgba(0,0,0,.1) 0 2px, transparent 2px 40px); }
.theme-bedroom { --wall: #b9d7f0; --floorc: #d4a46a; }
.theme-living { --wall: #f3dfb0; --floorc: #b07a4a; }
.theme-kitchen { --wall: #bfe8cf; --floorc: #e4e4e4; }
.theme-bathroom { --wall: #e8f6ff; --floorc: #9fd6f2; }
.theme-garden { --wall: #8fd0ff; --floorc: #5fb340; }
.prop, .placed { position: absolute; }
.placed { cursor: grab; filter: drop-shadow(2px 3px 0 rgba(0,0,0,.35)); }
.placed.ok { animation: pop .4s; }
.slot { position: absolute; z-index: 8; border: 3px dashed rgba(31, 26, 23, .55); border-radius: 6px; background: rgba(255,255,255,.18); pointer-events: none; transition: background .1s, transform .1s; }
.slot.ready { border-color: #b5651d; animation: pulse 1.2s infinite; }
.slot.hover { background: rgba(246, 213, 72, .55); border-color: var(--ink); transform: scale(1.06); }
.slot.filled { border-style: solid; border-color: rgba(31,26,23,.35); background: transparent; }
.slot.glow { border-color: #1d6b1d; background: rgba(95, 179, 64, .45); animation: pulse .9s infinite; }
.name { position: absolute; z-index: 9; text-align: center; font-weight: 900; font-size: 13px; color: #fff; text-shadow: 1px 1px 0 var(--ink), -1px -1px 0 var(--ink), 1px -1px 0 var(--ink), -1px 1px 0 var(--ink); pointer-events: none; line-height: 1.1; }
.bottom { display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap; margin-top: 12px; }
.tray { flex: 1; min-width: 240px; display: flex; align-items: center; gap: 12px; padding: 8px 12px; }
.tray-k { font-weight: 900; }
.tray-item { font: inherit; font-weight: 900; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 10px; cursor: grab; touch-action: none; background: #c6c6c6; border: 3px solid var(--ink); box-shadow: inset 3px 3px 0 #fff, inset -3px -3px 0 #8b8b8b; animation: bob 1.6s ease-in-out infinite; }
.tray-item.sel { box-shadow: 0 0 0 4px var(--gold), inset 3px 3px 0 #fff; animation: none; }
.tray-placed { font-weight: 800; }
.check { min-width: 240px; }
.feedback { margin-top: 12px; }
.extra { font-weight: 700; margin-top: 4px; }
.free { color: #2b6e2c; font-weight: 900; }
.ghost { position: fixed; pointer-events: none; transform: translate(-50%, -50%); z-index: 400; opacity: .9; filter: drop-shadow(4px 6px 0 rgba(0,0,0,.35)); }
.demo { display: flex; flex-direction: column; gap: 10px; }
.demo-stage { position: relative; width: 240px; height: 150px; margin: 0 auto; background: #b9d7f0; border: 3px solid var(--ink); border-bottom: 18px solid #d4a46a; }
.d-prop { position: absolute; left: 30px; bottom: 0; width: 80px; height: 80px; }
.d-slot { position: absolute; left: 46px; bottom: 66px; width: 48px; height: 48px; border: 3px dashed #b5651d; border-radius: 6px; }
.d-item { position: absolute; width: 44px; height: 44px; animation: demoDrag 2.6s ease-in-out infinite; }
.d-hand { position: absolute; font-size: 28px; animation: demoHand 2.6s ease-in-out infinite; }
@keyframes demoDrag { 0%, 15% { left: 180px; bottom: 6px; } 65%, 100% { left: 48px; bottom: 70px; } }
@keyframes demoHand { 0%, 15% { left: 196px; bottom: -14px; opacity: 1; } 65% { left: 64px; bottom: 50px; opacity: 1; } 80%, 100% { left: 64px; bottom: 50px; opacity: 0; } }
.lesson { color: var(--ink); text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center; }
.lw { font-weight: 800; font-size: 17px; margin: 0; }
@media (max-width: 560px) {
  .dq-head { gap: 6px; padding: 6px 8px; }
  .title { font-size: 16px; }
  .count { font-size: 14px; padding: 4px 6px; }
  .tray, .check { min-width: 0; width: 100%; }
  .name { font-size: 11px; }
}
</style>
