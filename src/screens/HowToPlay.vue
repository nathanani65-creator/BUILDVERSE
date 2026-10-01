<script setup>
import { useGameStore } from '../stores/game.js'
import PixelSprite from '../components/PixelSprite.vue'
import SceneView from '../components/SceneView.vue'

const store = useGameStore()
const STEPS = [
  { en: 'Read the clue.', th: 'อ่านคำใบ้' },
  { en: 'Find the hidden word.', th: 'หาคำที่ซ่อนอยู่' },
  { en: 'Drag from the first letter to the last letter.', th: 'ลากจากตัวอักษรแรกไปตัวสุดท้าย' },
  { en: 'Complete language challenges.', th: 'ทำภารกิจภาษาให้สำเร็จ' },
  { en: 'Earn coins and buy furniture.', th: 'รับเหรียญแล้วซื้อเฟอร์นิเจอร์' },
  { en: 'Follow the instructions to decorate your room.', th: 'ทำตามคำสั่งเพื่อตกแต่งห้อง' },
  { en: 'Unlock all five rooms!', th: 'ปลดล็อกห้องทั้งห้าห้อง!' },
]
const mini = ['XBEDQ', 'LAMPO', 'WALLS', 'DOORE', 'TDESK']
const rooms = ['bed', 'sofa', 'fridge', 'shower', 'tree']
</script>

<template>
  <main class="screen">
    <div class="row">
      <button class="btn" @click="store.go('menu')">◀ Back to Menu</button>
      <h1 class="screen-title">How to Play</h1>
    </div>

    <div class="steps">
      <article v-for="(s, i) in STEPS" :key="i" class="step panel-light">
        <div class="num">{{ i + 1 }}</div>
        <div class="art">
          <!-- 1 clue card -->
          <div v-if="i === 0" class="clue-demo paper"><PixelSprite name="bed" :size="56" /><div><b>_ _ _</b><br />You sleep on this.</div></div>
          <!-- 2 grid with hidden word -->
          <div v-else-if="i === 1" class="mini-grid">
            <template v-for="(row, y) in mini" :key="y">
              <span v-for="(ch, x) in row" :key="x" :class="{ glow: y === 0 && x >= 1 && x <= 3 }">{{ ch }}</span>
            </template>
          </div>
          <!-- 3 drag -->
          <div v-else-if="i === 2" class="drag-demo">
            <div class="letters"><span>L</span><span>A</span><span>M</span><span>P</span></div>
            <div class="sweep" />
            <div class="hand">👆</div>
          </div>
          <!-- 4 challenge -->
          <div v-else-if="i === 3" class="chips">
            <span class="chip">The</span><span class="chip">lamp</span><span class="chip">is</span><span class="chip on">on</span><span class="chip">the</span><span class="chip">desk.</span>
            <span class="tick">✔</span>
          </div>
          <!-- 5 coins + shop -->
          <div v-else-if="i === 4" class="shop-demo">
            <PixelSprite name="coin" :size="44" class="spin" />
            <span class="arrow">➜</span>
            <PixelSprite name="sofa" :size="56" />
          </div>
          <!-- 6 decorate -->
          <div v-else-if="i === 5" class="decor-demo">
            <SceneView scene="lampOnDesk" :width="180" />
          </div>
          <!-- 7 rooms -->
          <div v-else class="rooms-demo">
            <span v-for="(r, k) in rooms" :key="r" class="rm" :style="{ animationDelay: k * 0.4 + 's' }"><PixelSprite :name="r" :size="34" /></span>
          </div>
        </div>
        <p class="en">{{ s.en }}</p>
        <p v-if="store.settings.thai" class="thai">{{ s.th }}</p>
      </article>
    </div>

    <section class="panel tips">
      <h2>Tips</h2>
      <ul>
        <li><b>Practice Mode</b> has no timer. <b>Challenge Mode</b> has a timer and gives a +20 coin bonus.</li>
        <li><b>Hint</b> is free: first it shows the word, then the first letter flashes.</li>
        <li>Answer a language challenge right on the first try to get +5 coins.</li>
        <li>In <b>My House</b>, drag furniture from the inventory, or tap an item and then tap a square.</li>
        <li>Turn Thai help on or off in <b>Settings</b>.</li>
      </ul>
      <div class="row">
        <button class="btn btn-green btn-big" @click="store.go(store.hasSave ? 'map' : 'menu')">{{ store.hasSave ? "▶ Let's play!" : '◀ Back to Menu' }}</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
.step { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; }
.num { position: absolute; left: -8px; top: -10px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-family: var(--font-title); font-size: 14px; background: var(--gold); border: 3px solid var(--ink); }
.art { height: 140px; display: flex; align-items: center; justify-content: center; }
.en { font-size: 19px; font-weight: 900; margin: 0; }
.thai { margin: 0; }
.clue-demo { display: flex; gap: 8px; align-items: center; text-align: left; }
.mini-grid { display: grid; grid-template-columns: repeat(5, 26px); background: var(--paper); border: 3px solid var(--ink); }
.mini-grid span { height: 26px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
.mini-grid .glow { animation: glow 1.6s infinite; }
@keyframes glow { 0%, 40% { background: transparent; } 60%, 100% { background: #f6d548; } }
.drag-demo { position: relative; width: 180px; height: 60px; }
.letters { position: absolute; inset: 0; display: flex; background: var(--paper); border: 3px solid var(--ink); z-index: 2; }
.letters span { flex: 1; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; }
.sweep { position: absolute; left: 6px; top: 10px; height: 40px; width: 0; z-index: 3; background: rgba(246, 213, 72, .6); border-radius: 20px; animation: grow 2.2s ease-in-out infinite; }
.hand { position: absolute; top: 34px; left: 10px; font-size: 30px; z-index: 4; animation: hand 2.2s ease-in-out infinite; }
@keyframes grow { 0%, 10% { width: 30px; } 70%, 100% { width: 168px; } }
@keyframes hand { 0%, 10% { left: 10px; } 70%, 100% { left: 140px; } }
.chips { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; max-width: 230px; align-items: center; }
.chip { background: #ffe9a8; border: 2px solid var(--ink); padding: 3px 7px; font-weight: 800; }
.chip.on { animation: pulse 1.2s infinite; background: #c9ecff; }
.tick { color: var(--good); font-size: 26px; font-weight: 900; }
.shop-demo { display: flex; align-items: center; gap: 10px; }
.spin { animation: bob 1s infinite; }
.arrow { font-size: 28px; }
.rooms-demo { display: flex; gap: 6px; }
.rm { padding: 4px; background: #555; border: 2px solid var(--ink); animation: unlock 2.4s infinite; }
@keyframes unlock { 0%, 30% { background: #555; filter: grayscale(1); } 50%, 100% { background: #5fb340; filter: none; } }
.tips { margin-top: 18px; }
.tips li { margin: 6px 0; }
</style>
