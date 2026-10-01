<script setup>
// Draws one room: wall, floor squares and the furniture placed in it.
// Used big (My House) and small (house map / ending screen).
import { computed, ref } from 'vue'
import { ITEM_BY_ID, ROOM_COLS, ROOM_ROWS } from '../data/furniture.js'
import { footprint } from '../logic/placement.js'
import PixelSprite from './PixelSprite.vue'

const props = defineProps({
  roomId: { type: String, required: true },
  placements: { type: Object, required: true },
  cell: { type: Number, default: 64 },
  selectedId: { type: String, default: '' },
  preview: { type: Object, default: null }, // { cells: [{x,y}], ok }
  showGrid: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
})

const el = ref(null)
defineExpose({ el })

const wallH = computed(() => Math.round(props.cell * 0.9))

const items = computed(() => {
  const list = []
  for (const [id, p] of Object.entries(props.placements)) {
    if (p.room !== props.roomId || p.parent) continue
    const item = ITEM_BY_ID[id]
    if (!item) continue
    const [fw, fh] = footprint(id, p.rot)
    const [w, h] = item.size
    list.push({ id, item, p, fw, fh, w, h, z: item.layer === 'floor' ? 1 : 10 + p.y * 2 })
  }
  return list
})

const childrenByParent = computed(() => {
  const map = {}
  for (const [id, p] of Object.entries(props.placements)) {
    if (p.room === props.roomId && p.parent) (map[p.parent] ||= []).push(id)
  }
  return map
})
</script>

<template>
  <div class="room-wrap" :class="['theme-' + roomId, { locked }]" :style="{ '--cell': cell + 'px' }">
    <div class="wall" :style="{ height: wallH + 'px' }">
      <span v-if="roomId !== 'garden'" class="trim" />
    </div>
    <div ref="el" class="room" :class="{ grid: showGrid }" :style="{ width: cell * ROOM_COLS + 'px', height: cell * ROOM_ROWS + 'px' }">
      <!-- preview of where a dragged item will go -->
      <template v-if="preview">
        <div
          v-for="(c, i) in preview.cells"
          :key="'pv' + i"
          class="preview"
          :class="preview.ok ? 'ok' : 'no'"
          :style="{ left: c.x * cell + 'px', top: c.y * cell + 'px', width: cell + 'px', height: cell + 'px' }"
        />
      </template>
      <div
        v-for="it in items"
        :key="it.id"
        class="item"
        :class="{ selected: it.id === selectedId, flat: it.item.layer === 'floor' }"
        :data-item="it.id"
        :title="it.item.name"
        :style="{ left: it.p.x * cell + 'px', top: it.p.y * cell + 'px', width: it.fw * cell + 'px', height: it.fh * cell + 'px', zIndex: it.z }"
      >
        <div class="rot" :style="{ width: it.w * cell + 'px', height: it.h * cell + 'px', transform: `translate(-50%, -50%) rotate(${it.p.rot}deg)` }">
          <PixelSprite :name="it.item.sprite" :variant="it.item.variant || ''" size="100%" :stretch="it.item.size[0] !== it.item.size[1]" :label="it.item.name" />
        </div>
        <div
          v-for="cid in childrenByParent[it.id] || []"
          :key="cid"
          class="child"
          :data-item="cid"
          :title="ITEM_BY_ID[cid].name + ' (on the ' + it.item.name.toLowerCase() + ')'"
          :class="{ selected: cid === selectedId, rail: it.id === 'shower' }"
          :style="{ width: cell * 0.62 + 'px', height: cell * 0.62 + 'px' }"
        >
          <PixelSprite :name="ITEM_BY_ID[cid].sprite" :variant="ITEM_BY_ID[cid].variant || ''" size="100%" :label="ITEM_BY_ID[cid].name" />
        </div>
        <span v-if="it.id === selectedId" class="tag">{{ it.item.name }}</span>
      </div>
      <div v-if="locked" class="lock-cover"><PixelSprite name="lock" :size="cell * 1.2" label="Locked" /></div>
    </div>
  </div>
</template>

<style scoped>
.room-wrap { display: inline-block; border: 4px solid var(--ink); border-radius: 4px; box-shadow: 0 6px 0 rgba(0,0,0,.3); background: #000; }
.wall { position: relative; background: var(--wall, #b9d7f0); background-image: var(--wall-pattern, none); background-size: calc(var(--cell) / 2) calc(var(--cell) / 2); border-bottom: 4px solid rgba(0,0,0,.35); }
.trim { position: absolute; left: 0; right: 0; bottom: 0; height: 22%; background: rgba(0,0,0,.15); }
.room {
  position: relative; touch-action: none; user-select: none;
  background-color: var(--floor, #d4a46a);
  background-image: var(--floor-pattern);
  background-size: var(--cell) var(--cell);
}
.room.grid::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(90deg, rgba(0,0,0,.18) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,.18) 1px, transparent 1px);
  background-size: var(--cell) var(--cell);
}
.item { position: absolute; cursor: grab; }
.item:hover { filter: brightness(1.08); }
.item.selected { outline: 3px dashed var(--gold); outline-offset: -2px; z-index: 90 !important; }
.rot { position: absolute; left: 50%; top: 50%; padding: 6%; transition: transform .15s; }
.flat .rot { padding: 2%; }
.child { position: absolute; left: 50%; top: -18%; transform: translateX(-50%); z-index: 2; filter: drop-shadow(2px 3px 0 rgba(0,0,0,.35)); cursor: grab; }
.child.rail { left: 72%; top: 30%; }
.child.selected { outline: 3px dashed var(--gold); }
.tag { position: absolute; left: 50%; bottom: -26px; transform: translateX(-50%); background: var(--ink); color: #fff; font-weight: 800; font-size: 13px; padding: 2px 8px; border-radius: 3px; white-space: nowrap; z-index: 5; }
.preview { position: absolute; pointer-events: none; z-index: 80; border: 3px dashed; }
.preview.ok { background: rgba(95, 179, 64, .45); border-color: #1d6b1d; }
.preview.no { background: rgba(214, 69, 69, .45); border-color: #8b1d1d; }
.lock-cover { position: absolute; inset: 0; background: rgba(30,30,30,.55); display: flex; align-items: center; justify-content: center; z-index: 100; }

/* ----- room themes (each room has its own colours) ----- */
.theme-bedroom { --wall: #b9d7f0; --floor: #d4a46a;
  --floor-pattern: repeating-linear-gradient(0deg, rgba(0,0,0,.13) 0 2px, transparent 2px 50%); }
.theme-living { --wall: #f3dfb0; --floor: #b07a4a;
  --wall-pattern: linear-gradient(90deg, rgba(0,0,0,.06) 50%, transparent 50%);
  --floor-pattern: linear-gradient(0deg, rgba(0,0,0,.18) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 50%, transparent 50%); }
.theme-kitchen { --wall: #bfe8cf; --floor: #f2f2f2;
  --floor-pattern: conic-gradient(#d0d0d0 25%, transparent 0 50%, #d0d0d0 0 75%, transparent 0); }
.theme-bathroom { --wall: #e8f6ff; --floor: #9fd6f2;
  --wall-pattern: linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,.08) 1px, transparent 1px);
  --floor-pattern: linear-gradient(90deg, rgba(255,255,255,.6) 2px, transparent 2px), linear-gradient(0deg, rgba(255,255,255,.6) 2px, transparent 2px); }
.theme-garden { --wall: #7fc8ff; --floor: #5fb340;
  --wall-pattern: linear-gradient(180deg, transparent 70%, #4f9a2a 70%);
  --floor-pattern: linear-gradient(45deg, rgba(0,0,0,.07) 25%, transparent 25% 75%, rgba(0,0,0,.07) 75%), linear-gradient(0deg, rgba(255,255,255,.07) 50%, transparent 50%); }
.locked { filter: grayscale(.7); }
</style>
