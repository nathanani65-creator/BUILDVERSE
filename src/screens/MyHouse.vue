<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS, LEVEL_BY_ID, POSITION_WORDS } from '../data/levels.js'
import { ITEM_BY_ID, ROOM_COLS, ROOM_ROWS, itemsForRoom } from '../data/furniture.js'
import { resolveDrop, cellsOf, occupiedCells, childrenOf } from '../logic/placement.js'
import TopBar from '../components/TopBar.vue'
import RoomView from '../components/RoomView.vue'
import PixelSprite from '../components/PixelSprite.vue'
import SceneView from '../components/SceneView.vue'
import Modal from '../components/Modal.vue'

const store = useGameStore()
const startRoom = store.params.room || store.activeRoomId || 'bedroom'
const tab = ref(store.isUnlocked(startRoom) ? startRoom : 'bedroom')
const level = computed(() => LEVEL_BY_ID[tab.value])

const roomRef = ref(null)
const selected = ref(null)
const moveMode = ref(false)
const drag = ref(null)
const hoverCell = ref(null)
const checkResult = ref(null)
const lesson = ref(null) // { words: [...], thenCheck: bool }
const success = ref(null)

// ----- sizes -----
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
function onResize() {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}
const cell = computed(() => {
  const avail = vw.value > 1100 ? Math.min(vw.value, 1180) - 420 : vw.value - 50
  const byHeight = (vh.value - 250) / (ROOM_ROWS + 0.9)
  return Math.max(44, Math.min(78, Math.floor(Math.min(avail / ROOM_COLS, byHeight))))
})

// ----- lists -----
const placements = computed(() => store.data.placements)
const inventory = computed(() => itemsForRoom(tab.value).filter((it) => store.data.owned.includes(it.id) && !placements.value[it.id]))
const ownedHere = computed(() => itemsForRoom(tab.value).filter((it) => store.data.owned.includes(it.id)))
const selItem = computed(() => (selected.value ? ITEM_BY_ID[selected.value] : null))
const selPlaced = computed(() => (selected.value ? placements.value[selected.value] : null))
const pending = computed(() => !!selected.value && (!selPlaced.value || moveMode.value))

// ----- pointer helpers -----
function cellAt(x, y) {
  const el = roomRef.value?.el
  if (!el) return null
  const r = el.getBoundingClientRect()
  const cx = Math.floor((x - r.left) / cell.value)
  const cy = Math.floor((y - r.top) / cell.value)
  if (cx < 0 || cy < 0 || cx >= ROOM_COLS || cy >= ROOM_ROWS) return null
  return { x: cx, y: cy }
}

const preview = computed(() => {
  const id = drag.value?.moved ? drag.value.itemId : pending.value ? selected.value : null
  if (!id || !hoverCell.value) return null
  const others = { ...placements.value }
  delete others[id]
  const cur = placements.value[id]
  const rot = cur && !cur.parent ? cur.rot : 0
  const res = resolveDrop(id, tab.value, hoverCell.value, rot, others)
  let cells
  if (res.ok && res.placement.parent) cells = occupiedCells(res.placement.parent, others)
  else cells = cellsOf(id, { ...hoverCell.value, rot }).filter((c) => c.x < ROOM_COLS && c.y < ROOM_ROWS)
  return { cells, ok: res.ok }
})

function beginDrag(e, itemId, from) {
  if (e.button !== undefined && e.button !== 0) return
  drag.value = { itemId, from, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false }
  hoverCell.value = cellAt(e.clientX, e.clientY)
  e.preventDefault()
}
function onInvDown(e, id) {
  beginDrag(e, id, 'inv')
}
function onRoomDown(e) {
  const t = e.target.closest('[data-item]')
  beginDrag(e, t ? t.dataset.item : null, t ? 'room' : 'cell')
}
function onMove(e) {
  if (!drag.value) {
    if (pending.value) hoverCell.value = cellAt(e.clientX, e.clientY)
    return
  }
  const d = drag.value
  d.x = e.clientX
  d.y = e.clientY
  if (!d.moved && d.itemId && Math.hypot(d.x - d.startX, d.y - d.startY) > 8) {
    d.moved = true
    selected.value = d.itemId
    moveMode.value = false
  }
  hoverCell.value = cellAt(e.clientX, e.clientY)
}
function onUp(e) {
  const d = drag.value
  if (!d) return
  drag.value = null
  const c = cellAt(e.clientX, e.clientY)
  if (d.moved) {
    if (c) doPlace(d.itemId, c)
    else if (d.from === 'room') store.toast('Drop it inside the room.', 'info')
    hoverCell.value = null
    return
  }
  // a tap (no drag)
  if (pending.value && c && d.from !== 'inv') return doPlace(selected.value, c)
  if (d.from === 'inv') {
    selected.value = selected.value === d.itemId ? null : d.itemId
    moveMode.value = false
    if (selected.value) store.toast(`Now tap a square in the room to place the ${ITEM_BY_ID[d.itemId].name.toLowerCase()}.`, 'info')
  } else if (d.from === 'room') {
    selected.value = d.itemId
    moveMode.value = false
    store.sound('click')
  } else {
    selected.value = null
    moveMode.value = false
  }
}

function doPlace(id, c) {
  if (!store.isUnlocked(tab.value)) {
    store.toast('This room is locked.', 'warn')
    return
  }
  const res = store.place(id, tab.value, c)
  if (!res.ok) {
    store.toast(res.reason, 'warn')
    store.sound('wrong')
  } else {
    selected.value = id
    moveMode.value = false
    checkResult.value = null
  }
  hoverCell.value = null
}

function rotateSel() {
  const r = store.rotate(selected.value)
  if (!r.ok) store.toast(r.reason, 'warn')
  checkResult.value = null
}
function storeSel() {
  const kids = childrenOf(selected.value, placements.value)
  const names = [selected.value, ...kids].map((id) => 'the ' + ITEM_BY_ID[id].name.toLowerCase())
  store.storeItem(selected.value)
  store.toast(`${names.join(' and ')} went back to your inventory.`.replace(/^t/, 'T'), 'info')
  selected.value = null
  moveMode.value = false
  checkResult.value = null
}
function switchRoom(id) {
  if (!store.isUnlocked(id)) {
    store.toast(`The ${LEVEL_BY_ID[id].name} is locked. Complete the ${LEVELS[LEVEL_BY_ID[id].level - 2].name} first.`, 'warn')
    return
  }
  store.sound('click')
  tab.value = id
  selected.value = null
  moveMode.value = false
  checkResult.value = null
}

// ----- quest checking -----
function ruleText(rule) {
  if (rule.type === 'placed') return `Place the ${ITEM_BY_ID[rule.item].name.toLowerCase()} in the room.`
  return rule.text
}
function ruleHint(rule) {
  if (rule.type === 'placed') {
    return store.data.owned.includes(rule.item)
      ? `Drag the ${ITEM_BY_ID[rule.item].name.toLowerCase()} from your inventory into the room.`
      : `Buy the ${ITEM_BY_ID[rule.item].name.toLowerCase()} in the Shop first.`
  }
  return rule.hint
}
function ruleStatus(i) {
  if (!checkResult.value) return null
  return checkResult.value.results[i].ok
}
const firstFail = computed(() => checkResult.value?.results.find((r) => !r.ok)?.rule || null)

function askCheck() {
  if (!store.data.tutorials['pos-' + tab.value]) {
    lesson.value = { words: level.value.placement.teach, thenCheck: true }
    return
  }
  runCheck()
}
function closeLesson() {
  const then = lesson.value?.thenCheck
  store.markTutorial('pos-' + tab.value)
  lesson.value = null
  if (then) runCheck()
}
function runCheck() {
  const res = store.checkPlacement(tab.value)
  checkResult.value = res
  if (!res.lessonsDone) {
    store.sound('wrong')
    return
  }
  if (res.passed) {
    store.sound(res.newlyCompleted ? 'unlock' : 'success')
    store.celebrate('unlock')
    if (res.newlyCompleted) success.value = { unlocked: res.unlocked }
    else store.toast('Great job! Everything is in the right place.', 'good')
  } else {
    store.sound('wrong')
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
})
</script>

<template>
  <main class="screen house">
    <TopBar :goal="store.isCompleted(tab) ? 'Free decorating! Move, rotate or add things.' : store.goalFor(tab)" />

    <div class="room-tabs" role="tablist">
      <button
        v-for="l in LEVELS"
        :key="l.id"
        role="tab"
        class="btn btn-small"
        :class="[tab === l.id ? 'btn-blue pressed' : '', { lockedtab: !store.isUnlocked(l.id) }]"
        :aria-selected="tab === l.id"
        @click="switchRoom(l.id)"
      >
        {{ store.isUnlocked(l.id) ? (store.isCompleted(l.id) ? '✔ ' : '') : '🔒 ' }}{{ l.name }}
      </button>
    </div>

    <div class="layout">
      <section class="room-area">
        <RoomView
          ref="roomRef"
          :room-id="tab"
          :placements="placements"
          :cell="cell"
          :selected-id="selected || ''"
          :preview="preview"
          :show-grid="!!drag || pending"
          @pointerdown="onRoomDown"
        />

        <!-- toolbar for the selected item -->
        <div class="toolbar panel" :class="{ empty: !selItem }">
          <template v-if="selItem && selPlaced">
            <PixelSprite :name="selItem.sprite" :variant="selItem.variant || ''" :size="40" />
            <div class="selname">
              <strong>{{ selItem.name }}</strong>
              <span v-if="store.settings.thai" class="thai-s">{{ selItem.thai }}</span>
              <small v-if="selPlaced.parent">on the {{ ITEM_BY_ID[selPlaced.parent].name.toLowerCase() }}</small>
            </div>
            <button class="btn btn-small btn-blue btn-icon" :aria-label="'Listen to ' + selItem.name" @click="store.say(selItem.name)">🔊</button>
            <span class="spacer" />
            <button class="btn btn-small" :class="{ 'btn-gold pressed': moveMode }" @click="moveMode = !moveMode">✥ Move</button>
            <button class="btn btn-small" :disabled="!selItem.rotatable || !!selPlaced.parent" @click="rotateSel">⟳ Rotate</button>
            <button class="btn btn-small btn-red" @click="storeSel">⬇ Store</button>
            <button class="btn btn-small btn-icon" aria-label="Deselect" @click="selected = null">✕</button>
          </template>
          <template v-else-if="selItem">
            <PixelSprite :name="selItem.sprite" :variant="selItem.variant || ''" :size="40" />
            <span>Tap a square in the room to place the <strong>{{ selItem.name.toLowerCase() }}</strong>, or drag it.</span>
            <span class="spacer" />
            <button class="btn btn-small" @click="selected = null">Cancel</button>
          </template>
          <span v-else class="muted">Drag items into the room. Click an item to see its name, move, rotate or store it.</span>
          <p v-if="moveMode" class="move-tip">Tap the square where you want to move it.</p>
        </div>

      </section>

      <aside class="side">
      <!-- inventory -->
      <div class="inventory panel">
        <h2 class="inv-title">Inventory · {{ level.name }}</h2>
        <div v-if="inventory.length" class="inv-list">
          <button
            v-for="it in inventory"
            :key="it.id"
            class="inv-item"
            :class="{ sel: selected === it.id }"
            :title="it.name"
            @pointerdown="onInvDown($event, it.id)"
          >
            <PixelSprite :name="it.sprite" :variant="it.variant || ''" :size="48" :label="it.name" />
            <span>{{ it.name }}</span>
          </button>
        </div>
        <div v-else class="inv-empty">
          <span v-if="ownedHere.length">Everything you own is in the room. 👍</span>
          <span v-else>You have no furniture for this room yet.</span>
          <button class="btn btn-small btn-gold" @click="store.go('shop', { room: tab })">🛒 Shop</button>
        </div>
      </div>
      <!-- quest panel -->
      <div class="quest panel-light">
        <div v-if="store.isCompleted(tab)" class="feedback good"><span class="icon">✔</span><span>Quest complete! Free decorating mode is ON.</span></div>
        <h2 class="q-title">Room Quest</h2>
        <div v-for="ins in level.placement.instructions" :key="ins" class="instruction">
          <span>“{{ ins }}”</span>
          <button class="btn btn-small btn-blue btn-icon" :aria-label="'Listen: ' + ins" @click="store.say(ins)">🔊</button>
        </div>
        <button class="btn btn-small btn-wood" @click="lesson = { words: level.placement.teach, thenCheck: false }">📘 Learn: {{ level.placement.teach.join(', ') }}</button>

        <ul class="checklist">
          <li v-for="(r, i) in level.placement.rules" :key="i" :class="{ ok: ruleStatus(i) === true, no: ruleStatus(i) === false }">
            <span class="box">{{ ruleStatus(i) === true ? '✔' : ruleStatus(i) === false ? '✖' : '☐' }}</span>
            <span>{{ ruleText(r) }}</span>
            <span class="sr-only">{{ ruleStatus(i) === true ? 'done' : ruleStatus(i) === false ? 'not yet' : '' }}</span>
          </li>
        </ul>

        <div v-if="checkResult && !checkResult.lessonsDone" class="feedback warn">
          <span class="icon">!</span><span>First, finish the Word Search and the Language Challenge for this room.</span>
        </div>
        <div v-else-if="checkResult && !checkResult.passed" class="feedback bad">
          <span class="icon">✖</span>
          <div>
            <div>Not yet! “{{ ruleText(firstFail) }}” is not done.</div>
            <div class="hint">Hint: {{ ruleHint(firstFail) }}</div>
          </div>
        </div>
        <div v-else-if="checkResult && checkResult.passed" class="feedback good"><span class="icon">✔</span><span>Great job! Your room is ready!</span></div>

        <button class="btn btn-green btn-big check" @click="askCheck">✔ Check Placement</button>
        <button v-if="!store.roomState(tab).challenge" class="btn btn-small" @click="store.go('map', { room: tab })">Go to the {{ level.name }} quests</button>
      </div>
      </aside>
    </div>

    <!-- dragging ghost -->
    <div v-if="drag && drag.moved" class="ghost" :style="{ left: drag.x + 'px', top: drag.y + 'px', width: cell + 'px', height: cell + 'px' }">
      <PixelSprite :name="ITEM_BY_ID[drag.itemId].sprite" :variant="ITEM_BY_ID[drag.itemId].variant || ''" size="100%" />
    </div>

    <!-- position words lesson -->
    <Modal v-if="lesson" title="Position words" wide>
      <p v-if="lesson.thenCheck">Before we check your room, let's learn the position word{{ lesson.words.length > 1 ? 's' : '' }}!</p>
      <div class="lessons">
        <div v-for="w in lesson.words" :key="w" class="lesson paper">
          <div class="lw">{{ w.toUpperCase() }} <span v-if="store.settings.thai" class="thai">({{ POSITION_WORDS[w].thai }})</span></div>
          <SceneView :scene="POSITION_WORDS[w].scene" :width="260" />
          <p>{{ POSITION_WORDS[w].text }}</p>
          <button class="btn btn-small btn-blue" @click="store.say(POSITION_WORDS[w].text.split('= ')[1])">🔊 Listen</button>
        </div>
      </div>
      <template #actions>
        <button class="btn btn-green" @click="closeLesson">{{ lesson.thenCheck ? 'Got it! Check my room ▶' : 'Got it!' }}</button>
      </template>
    </Modal>

    <!-- room complete -->
    <Modal v-if="success" title="Great job! Your room is ready!">
      <div class="center">
        <PixelSprite name="npc" :size="90" />
        <p class="big">The {{ level.name }} is complete!</p>
        <p v-if="success.unlocked" class="feedback good"><span class="icon">🔓</span><span>New room unlocked: <b>{{ LEVEL_BY_ID[success.unlocked].name }}</b>!</span></p>
        <p>You can come back and decorate this room any time.</p>
      </div>
      <template #actions>
        <button class="btn" @click="success = null">Keep decorating</button>
        <button v-if="success.unlocked" class="btn btn-green" @click="store.go('map', { room: success.unlocked })">Go to the {{ LEVEL_BY_ID[success.unlocked].name }} ▶</button>
        <button v-else class="btn btn-green" @click="store.go('ending')">See my home ▶</button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>
.room-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.lockedtab { opacity: .7; }
.layout { display: flex; gap: 18px; align-items: flex-start; }
.room-area { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%; padding: 8px 10px; min-height: 64px; }
.selname { display: flex; flex-direction: column; line-height: 1.2; }
.thai-s { font-family: var(--font-thai); color: #ffe7c2; font-size: 14px; }
.move-tip { width: 100%; margin: 4px 0 0; color: var(--gold); font-weight: 800; }
.inventory { width: 100%; }
.inv-title { font-family: var(--font-title); font-size: 12px; }
.inv-list { display: flex; gap: 8px; flex-wrap: wrap; }
.inv-item {
  font: inherit; font-weight: 800; display: flex; flex-direction: column; align-items: center; gap: 4px; width: 92px; padding: 6px;
  background: #c6c6c6; border: 3px solid var(--ink); box-shadow: inset 3px 3px 0 #fff, inset -3px -3px 0 #8b8b8b; cursor: grab; touch-action: none;
}
.inv-item:hover { filter: brightness(1.08); }
.inv-item.sel { box-shadow: 0 0 0 3px var(--gold), inset 3px 3px 0 #fff; }
.inv-empty { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.side { flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 12px; }
.quest { display: flex; flex-direction: column; gap: 10px; }
.q-title { font-family: var(--font-title); font-size: 13px; margin: 0; }
.instruction { display: flex; align-items: center; gap: 8px; justify-content: space-between; font-size: 21px; font-weight: 900; background: #fffdf5; border: 3px solid var(--ink); padding: 8px 10px; }
.checklist { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.checklist li { display: flex; gap: 8px; align-items: center; font-weight: 700; background: #eee; border: 2px solid var(--ink); padding: 6px 8px; }
.checklist li.ok { background: #d9f7d9; }
.checklist li.no { background: #ffe0dc; }
.box { width: 26px; height: 26px; flex: none; display: inline-flex; align-items: center; justify-content: center; background: #fff; border: 2px solid var(--ink); font-weight: 900; }
.hint { font-weight: 700; margin-top: 4px; }
.check { min-width: 0; width: 100%; }
.ghost { position: fixed; pointer-events: none; transform: translate(-50%, -50%) scale(1.1); z-index: 400; opacity: .85; filter: drop-shadow(4px 6px 0 rgba(0,0,0,.35)); }
.lessons { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.lesson { color: var(--ink); display: flex; flex-direction: column; gap: 8px; align-items: center; max-width: 300px; text-align: center; }
.lw { font-family: var(--font-title); font-size: 16px; }
.big { font-size: 20px; font-weight: 900; }
@media (max-width: 1100px) {
  .layout { flex-direction: column; align-items: stretch; }
  .room-area { align-items: center; }
}
</style>
