<script setup>
import { useGameStore } from '../stores/game.js'
import { DIFFICULTY, ECONOMY } from '../data/levels.js'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
const STEPS = [
  { en: 'Choose a room and a level: Easy, Normal or Hard.', th: 'เลือกห้องและระดับความยาก' },
  { en: 'Read the clue and look at the picture.', th: 'อ่านคำใบ้และดูภาพ' },
  { en: 'Drag from the first letter to the last letter.', th: 'ลากจากตัวอักษรแรกไปตัวสุดท้าย' },
  { en: 'Read the instruction.', th: 'อ่านคำสั่งภาษาอังกฤษ' },
  { en: 'Drag the item to a dashed space. Press Check Placement.', th: 'ลากของไปวางในช่องเส้นประ แล้วกดตรวจ' },
  { en: 'Get coins!', th: 'รับเหรียญ' },
  { en: 'Buy furniture and decorate My House.', th: 'ซื้อเฟอร์นิเจอร์ แต่งบ้านของคุณ' },
  { en: 'Clear a room to open the next one. Play again any time!', th: 'ผ่านห้องเพื่อเปิดห้องถัดไป เล่นซ้ำได้เสมอ' },
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

    <button class="learn paper" @click="store.go('goals', { from: 'howto' })">
      🎯 <b>What you learn:</b> words for things in the home + position words <b>on, under, next to, between</b>. <u>See Learning Goals ▶</u>
    </button>

    <div class="round paper">
      <b>One round =</b>
      <span class="r-step">1. Find Words</span> → <span class="r-step">2. Place Items</span> → <span class="r-step">3. Rewards</span>
    </div>

    <div class="steps">
      <article v-for="(s, i) in STEPS" :key="i" class="step panel-light">
        <div class="num">{{ i + 1 }}</div>
        <div class="art">
          <div v-if="i === 0" class="levels">
            <span class="lv e">Easy</span><span class="lv n">Normal</span><span class="lv h">Hard</span>
          </div>
          <div v-else-if="i === 1" class="clue-demo paper"><PixelSprite name="bed" :size="56" /><div><small>You sleep on this.</small><br /><b>_ _ _</b> <small>(3 letters)</small></div></div>
          <div v-else-if="i === 2" class="drag-demo">
            <div class="letters"><span>L</span><span>A</span><span>M</span><span>P</span></div>
            <div class="sweep" />
            <div class="hand">👆</div>
          </div>
          <div v-else-if="i === 3" class="instr paper">“Put the lamp <b>on</b> the desk.”</div>
          <div v-else-if="i === 4" class="place-demo">
            <div class="d-prop"><PixelSprite name="desk" size="100%" /></div>
            <div class="d-slot" />
            <div class="d-item"><PixelSprite name="lamp" size="100%" /></div>
          </div>
          <div v-else-if="i === 5" class="coins">
            <PixelSprite name="coin" :size="44" class="spin" />
            <span>{{ DIFFICULTY.easy.reward }} · {{ DIFFICULTY.normal.reward }} · {{ DIFFICULTY.hard.reward }}</span>
          </div>
          <div v-else-if="i === 6" class="shop-demo">
            <PixelSprite name="coin" :size="36" />
            <span class="arrow">➜</span>
            <PixelSprite name="sofa" :size="56" />
          </div>
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
        <li><b>Easy</b>: 5 words, pictures shown, words go → ↓, 1 instruction. <b>Normal</b>: 7 words, diagonal words, 2 instructions. <b>Hard</b>: 9 words, backwards words, 3 instructions.</li>
        <li>The first time in a room is always <b>Easy</b>. After you clear it, you can choose Normal or Hard.</li>
        <li><b>Practice</b> has no timer. <b>Challenge</b> has a timer: find all words in time for <b>+{{ ECONOMY.timeBonus }}</b> coins.</li>
        <li>Clear a room for the first time: <b>+{{ ECONOMY.unlockBonus }}</b> bonus coins and the next room opens.</li>
        <li><b>Hints are free</b>: Thai meaning → first letter flashes → the word is shown.</li>
        <li>Wrong placement? Read the instruction again and try — you never lose coins.</li>
        <li>The Decorating Quest is practice only. It never changes the house you decorate in <b>My House</b>.</li>
      </ul>
      <div class="row">
        <button class="btn btn-green btn-big" @click="store.go(store.hasSave ? 'map' : 'menu')">{{ store.hasSave ? "▶ Let's play!" : '◀ Back to Menu' }}</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.learn { display: block; width: 100%; text-align: left; font: inherit; font-size: 18px; color: var(--ink); cursor: pointer; margin-bottom: 12px; }
.round { color: var(--ink); font-size: 18px; margin-bottom: 16px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.r-step { font-weight: 900; background: var(--gold); border: 2px solid var(--ink); padding: 2px 8px; }
.steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.step { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; }
.num { position: absolute; left: -8px; top: -10px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-family: var(--font-title); font-size: 14px; background: var(--gold); border: 3px solid var(--ink); }
.art { height: 130px; display: flex; align-items: center; justify-content: center; }
.en { font-size: 18px; font-weight: 900; margin: 0; }
.thai { margin: 0; }
.levels { display: flex; gap: 6px; }
.lv { font-weight: 900; color: #fff; padding: 6px 10px; border: 2px solid var(--ink); }
.lv.e { background: #2b6e2c; }
.lv.n { background: #20568c; }
.lv.h { background: #8b2a24; }
.clue-demo { display: flex; gap: 8px; align-items: center; text-align: left; }
.drag-demo { position: relative; width: 180px; height: 60px; }
.letters { position: absolute; inset: 0; display: flex; background: var(--paper); border: 3px solid var(--ink); z-index: 2; }
.letters span { flex: 1; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; }
.sweep { position: absolute; left: 6px; top: 10px; height: 40px; width: 0; z-index: 3; background: rgba(246, 213, 72, .6); border-radius: 20px; animation: grow 2.2s ease-in-out infinite; }
.hand { position: absolute; top: 34px; left: 10px; font-size: 30px; z-index: 4; animation: hand 2.2s ease-in-out infinite; }
@keyframes grow { 0%, 10% { width: 30px; } 70%, 100% { width: 168px; } }
@keyframes hand { 0%, 10% { left: 10px; } 70%, 100% { left: 140px; } }
.instr { font-size: 18px; font-weight: 800; color: var(--ink); }
.place-demo { position: relative; width: 200px; height: 120px; background: #b9d7f0; border: 3px solid var(--ink); border-bottom: 14px solid #d4a46a; }
.d-prop { position: absolute; left: 20px; bottom: 0; width: 70px; height: 70px; }
.d-slot { position: absolute; left: 33px; bottom: 56px; width: 44px; height: 44px; border: 3px dashed #b5651d; border-radius: 6px; }
.d-item { position: absolute; width: 40px; height: 40px; animation: demoDrag 2.6s ease-in-out infinite; }
@keyframes demoDrag { 0%, 15% { left: 145px; bottom: 4px; } 65%, 100% { left: 35px; bottom: 58px; } }
.coins { display: flex; flex-direction: column; align-items: center; gap: 6px; font-weight: 900; font-size: 18px; }
.spin { animation: bob 1s infinite; }
.shop-demo { display: flex; align-items: center; gap: 10px; }
.arrow { font-size: 28px; }
.rooms-demo { display: flex; gap: 6px; }
.rm { padding: 4px; background: #555; border: 2px solid var(--ink); animation: unlock 2.4s infinite; }
@keyframes unlock { 0%, 30% { background: #555; filter: grayscale(1); } 50%, 100% { background: #5fb340; filter: none; } }
.tips { margin-top: 18px; }
.tips li { margin: 6px 0; }
</style>
