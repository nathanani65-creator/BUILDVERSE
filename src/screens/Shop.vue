<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS, LEVEL_BY_ID } from '../data/levels.js'
import { itemsForRoom } from '../data/furniture.js'
import TopBar from '../components/TopBar.vue'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
const tab = ref(store.params.room || store.activeRoomId || 'bedroom')
const items = computed(() => itemsForRoom(tab.value).sort((a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0)))
const roomUnlocked = computed(() => store.isUnlocked(tab.value))

function stateOf(item) {
  const s = store.buyState(item.id)
  if (s.ok) return { key: 'buy', label: `Buy · ${item.price}` }
  if (s.state === 'owned') return { key: 'owned', label: '✔ Owned' }
  if (s.state === 'locked') return { key: 'locked', label: '🔒 Locked', reason: s.reason }
  return { key: 'coins', label: `Buy · ${item.price}`, reason: s.reason }
}
function pickTab(id) {
  store.sound('click')
  tab.value = id
}
</script>

<template>
  <main class="screen">
    <TopBar />
    <h1 class="screen-title">Shop</h1>

    <div class="tabs" role="tablist">
      <button v-for="l in LEVELS" :key="l.id" role="tab" class="btn btn-small" :class="tab === l.id ? 'btn-gold pressed' : ''" :aria-selected="tab === l.id" @click="pickTab(l.id)">
        {{ store.isUnlocked(l.id) ? '' : '🔒 ' }}{{ l.name }}
      </button>
    </div>

    <p v-if="!roomUnlocked" class="feedback warn"><span class="icon">🔒</span><span>The {{ LEVEL_BY_ID[tab].name }} is locked. Complete the {{ LEVELS[LEVEL_BY_ID[tab].level - 2].name }} quest first.</span></p>
    <p v-else-if="!store.isCompleted(tab)" class="feedback info"><span class="icon">ℹ</span><span>Buy the <b>Required</b> items for this room's quest. Extra decorations unlock after you finish the room.</span></p>
    <p v-else class="feedback good"><span class="icon">✔</span><span>Room complete! Extra decorations are open. Replay levels to earn more coins.</span></p>

    <div class="items">
      <article v-for="item in items" :key="item.id" class="item panel-light" :class="'st-' + stateOf(item).key">
        <div class="flags">
          <span v-if="item.required" class="badge badge-req">★ Required</span>
          <span v-else class="badge badge-gold">Decoration</span>
        </div>
        <div class="pic"><PixelSprite :name="item.sprite" :variant="item.variant || ''" :size="84" :label="item.name" /></div>
        <h3>{{ item.name }}</h3>
        <p v-if="store.settings.thai" class="thai">{{ item.thai }}</p>
        <p class="desc">{{ item.desc }}</p>
        <div class="price"><PixelSprite name="coin" :size="22" /> {{ item.price }}</div>
        <button
          class="btn"
          :class="{ 'btn-green': stateOf(item).key === 'buy' }"
          :disabled="stateOf(item).key !== 'buy'"
          :title="stateOf(item).reason || ''"
          @click="store.buy(item.id)"
        >
          {{ stateOf(item).label }}
        </button>
        <small v-if="stateOf(item).reason" class="reason">{{ stateOf(item).reason }}</small>
      </article>
    </div>

    <div class="row foot">
      <button class="btn btn-blue" @click="store.go('house', { room: tab })">🛋 Go to My House</button>
    </div>
  </main>
</template>

<style scoped>
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.feedback { margin: 0 0 14px; }
.items { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; }
.item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; position: relative; }
.item h3 { margin: 0; font-size: 20px; }
.item p { margin: 0; }
.flags { align-self: flex-start; }
.pic { background: #fff; border: 3px solid var(--ink); padding: 6px; border-radius: 3px; }
.desc { font-size: 15px; min-height: 40px; }
.price { display: flex; align-items: center; gap: 6px; font-weight: 900; font-size: 20px; }
.reason { font-size: 13px; color: #6b4a00; font-weight: 700; }
.st-owned { background: #cfe8cf; }
.st-locked { filter: grayscale(.6); }
.foot { justify-content: center; margin-top: 18px; }
</style>
