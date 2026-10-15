<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game.js'
import GameLogo from '../components/GameLogo.vue'
import PixelSprite from '../components/PixelSprite.vue'
import NpcDialog from '../components/NpcDialog.vue'
import { LANGUAGE_FOCUS } from '../data/learning.js'

const store = useGameStore()
const intro = ref(false)

const INTRO = [
  { en: 'Welcome to BUILDVERSE!', th: 'ยินดีต้อนรับสู่ BUILDVERSE!' },
  { en: 'This is your new home.', th: 'นี่คือบ้านใหม่ของคุณ' },
  { en: 'Find words, then follow English instructions to place things in each room.', th: 'หาคำศัพท์ แล้วทำตามคำสั่งภาษาอังกฤษเพื่อจัดของในแต่ละห้อง' },
  { en: 'Earn coins and decorate your own house!', th: 'รับเหรียญ แล้วตกแต่งบ้านของคุณเองได้เลย!' },
]

function click(fn) {
  store.sound('click')
  fn()
}
function startNew() {
  store.newGame()
  intro.value = true
}
/** Play: continue the saved game, or start a new one the first time. */
function play() {
  if (store.hasSave) store.go('map')
  else startNew()
}
/** My House / Shop work before the first round too. */
function openScreen(name) {
  if (!store.hasSave) store.newGame()
  store.go(name)
}
function newGame() {
  if (store.hasSave) {
    store.ask('Start a new game?', 'This will delete your saved house, coins and progress. Are you sure?', 'Yes, start again', startNew)
  } else startNew()
}
function finishIntro() {
  intro.value = false
  store.go('map')
}
const decor = ['tree', 'flowerpot', 'bench', 'fountain']
</script>

<template>
  <main class="screen menu">
    <GameLogo class="logo" />
    <p class="subtitle">Find Words, Build Your World</p>
    <button class="focus paper" @click="click(() => store.go('goals'))">
      <span class="focus-k">🎯 LEARN</span>
      <span class="focus-t">Home vocabulary · Position words: <b>on, under, next to, between</b></span>
      <span class="focus-m">{{ LANGUAGE_FOCUS.level }} · {{ LANGUAGE_FOCUS.learners }}</span>
    </button>

    <div v-if="store.loadError" class="feedback warn load-error" role="alert">
      <span class="icon">!</span>
      <span>{{ store.loadError }}</span>
    </div>

    <section v-if="!intro" class="menu-body">
      <div class="side left" aria-hidden="true">
        <PixelSprite name="npc" :size="150" class="npc" />
      </div>
      <nav class="buttons panel">
        <button class="btn btn-big btn-green play" @click="click(play)">
          ▶ Play
          <small v-if="store.hasSave">Continue · {{ store.clearedCount }}/5 rooms</small>
        </button>
        <button class="btn btn-big btn-blue" @click="click(() => openScreen('house'))">🛋 My House</button>
        <button class="btn btn-big btn-gold" @click="click(() => openScreen('shop'))">🛒 Shop</button>
        <button class="btn btn-big btn-wood" @click="click(() => store.go('howto'))">? How to Play</button>
        <div class="small-links">
          <button class="link" @click="click(() => store.go('settings'))">⚙ Settings</button>
          <button class="link" @click="click(() => store.go('goals'))">🎯 Learning Goals</button>
          <button class="link" @click="click(() => store.go('credits'))">★ Credits</button>
          <button v-if="store.hasSave" class="link danger" @click="click(newGame)">✚ New Game</button>
        </div>
      </nav>
      <div class="side right" aria-hidden="true">
        <PixelSprite v-for="d in decor" :key="d" :name="d" :size="64" />
      </div>
    </section>

    <section v-else class="intro">
      <NpcDialog :lines="INTRO" :thai="store.settings.thai" finish-label="Let's build! ▶" @done="finishIntro" />
    </section>

    <div class="icons" aria-hidden="true">
      <div v-for="(s, i) in [['grass', 'BUILD'], ['sofa', 'DECORATE'], ['flowerpot', 'CUSTOMIZE'], ['coin', 'COLLECT'], ['tree', 'EXPLORE']]" :key="i" class="ic">
        <PixelSprite :name="s[0]" :size="44" />
        <span>{{ s[1] }}</span>
      </div>
    </div>
  </main>
</template>

<style scoped>
.menu { text-align: center; padding-top: 28px; }
.subtitle { display: inline-block; margin: 14px 0 12px; background: #2a5f9e; color: #fff; font-weight: 900; font-size: 20px; padding: 6px 18px; border: 3px solid var(--ink); box-shadow: inset 3px 3px 0 #4a9fe0, 0 4px 0 rgba(0,0,0,.3); letter-spacing: 1px; }
.focus { display: flex; flex-direction: column; gap: 2px; align-items: center; margin: 0 auto 18px; max-width: 640px; cursor: pointer; font: inherit; color: var(--ink); transition: transform .1s; }
.focus:hover { transform: translateY(-2px); }
.focus-k { font-family: var(--font-title); font-size: 10px; color: #b5651d; }
.focus-t { font-size: 19px; font-weight: 800; }
.focus-m { font-size: 14px; color: #5b4630; }
.load-error { max-width: 640px; margin: 0 auto 16px; text-align: left; }
.menu-body { display: flex; align-items: center; justify-content: center; gap: 30px; }
.buttons { display: flex; flex-direction: column; gap: 12px; padding: 22px; }
.play { flex-direction: column; gap: 2px; font-size: 24px; }
.play small { font-size: 13px; font-weight: 800; }
.small-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 12px; margin-top: 4px; }
.link { font: inherit; font-weight: 800; font-size: 14px; color: #ffe7c2; background: none; border: none; cursor: pointer; padding: 4px; text-decoration: underline; text-underline-offset: 3px; }
.link:hover { color: #fff; }
.link.danger { color: #ffb3a8; }
.side { width: 170px; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; }
.npc { animation: bob 1.8s ease-in-out infinite; }
.intro { max-width: 760px; margin: 0 auto; text-align: left; }
.icons { display: flex; justify-content: center; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
.ic { background: rgba(31, 26, 23, .82); border: 3px solid var(--ink); padding: 8px 10px; width: 108px; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #fff; font-family: var(--font-title); font-size: 9px; box-shadow: inset 2px 2px 0 #4a3a2a; }
@media (max-width: 760px) { .side { display: none; } }
</style>
