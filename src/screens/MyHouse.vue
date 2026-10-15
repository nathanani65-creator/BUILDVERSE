<script setup>
// MY HOUSE — the player's own home. Free decorating with furniture bought in
// the Shop. Decorating Quests never change anything here.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS, LEVEL_BY_ID } from '../data/levels.js'
import { ITEM_BY_ID, ROOM_COLS, ROOM_ROWS, itemsForRoom } from '../data/furniture.js'
import { resolveDrop, cellsOf, occupiedCells, childrenOf } from '../logic/placement.js'
import TopBar from '../components/TopBar.vue'
import RoomView from '../components/RoomView.vue'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
const startRoom = store.params.room || 'bedroom'
const tab = ref(store.isUnlocked(startRoom) ? startRoom : 'bedroom')
const level = computed(() => LEVEL_BY_ID[tab.value])

const roomRef = ref(null)
const selected = ref(null)
const moveMode = ref(false)
const drag = ref(null)
const hoverCell = ref(null)

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
  }
  hoverCell.value = null
}

function rotateSel() {
  const r = store.rotate(selected.value)
  if (!r.ok) store.toast(r.reason, 'warn')
}
function storeSel() {
  const kids = childrenOf(selected.value, placements.value)
  const names = [selected.value, ...kids].map((id) => 'the ' + ITEM_BY_ID[id].name.toLowerCase())
  store.storeItem(selected.value)
  store.toast(`${names.join(' and ')} went back to your inventory.`.replace(/^t/, 'T'), 'info')
  selected.value = null
  moveMode.value = false
}
function switchRoom(id) {
  if (!store.isUnlocked(id)) {
    store.toast(`The ${LEVEL_BY_ID[id].name} is locked. Clear the ${LEVELS[LEVEL_BY_ID[id].level - 2].name} once to open it.`, 'warn')
    return
  }
  store.sound('click')
  tab.value = id
  selected.value = null
  moveMode.value = false
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
    <TopBar goal="Decorate your house! Drag furniture from your inventory." />

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
        {{ store.isUnlocked(l.id) ? '' : '🔒 ' }}{{ l.name }}
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
      <!-- help -->
      <div class="help panel-light">
        <h2 class="q-title">My House</h2>
        <p>This is <b>your</b> home. Decorate it any way you like!</p>
        <ul>
          <li>Drag furniture from the inventory into the room, or tap it and then tap a square.</li>
          <li>Click a piece of furniture to <b>move</b>, <b>rotate</b> or <b>store</b> it.</li>
          <li>Small things (lamp, kettle, cup, towel) can go <b>on</b> a desk, cabinet or shower.</li>
          <li>Get more furniture in the 🛒 Shop. Earn coins by playing rounds.</li>
        </ul>
        <p class="muted small">Playing a Decorating Quest never changes your house.</p>
        <div class="row">
          <button class="btn btn-gold" @click="store.go('shop', { room: tab })">🛒 Shop</button>
          <button class="btn btn-green" @click="store.go('map')">▶ Play a round</button>
        </div>
      </div>
      </aside>
    </div>

    <!-- dragging ghost -->
    <div v-if="drag && drag.moved" class="ghost" :style="{ left: drag.x + 'px', top: drag.y + 'px', width: cell + 'px', height: cell + 'px' }">
      <PixelSprite :name="ITEM_BY_ID[drag.itemId].sprite" :variant="ITEM_BY_ID[drag.itemId].variant || ''" size="100%" />
    </div>

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
.help { display: flex; flex-direction: column; gap: 6px; }
.help ul { margin: 0; padding-left: 20px; }
.help li { margin: 4px 0; }
.small { font-size: 14px; margin: 0; }
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
.lw { font-family: var(--font-title); font-size: 16px; }
.big { font-size: 20px; font-weight: 900; }
@media (max-width: 1100px) {
  .layout { flex-direction: column; align-items: stretch; }
  .room-area { align-items: center; }
}
</style>
