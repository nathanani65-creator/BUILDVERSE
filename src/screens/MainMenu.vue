<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game.js'
import GameLogo from '../components/GameLogo.vue'
import PixelSprite from '../components/PixelSprite.vue'
import NpcDialog from '../components/NpcDialog.vue'

const store = useGameStore()
const intro = ref(false)

const INTRO = [
  { en: 'Welcome to BUILDVERSE!', th: 'ยินดีต้อนรับสู่ BUILDVERSE!' },
  { en: 'This is your new home.', th: 'นี่คือบ้านใหม่ของคุณ' },
  { en: 'Complete word quests, earn coins, and decorate each room!', th: 'ทำภารกิจคำศัพท์ รับเหรียญ แล้วตกแต่งทุกห้องกันเถอะ!' },
]

function click(fn) {
  store.sound('click')
  fn()
}
function startNew() {
  store.newGame()
  intro.value = true
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

    <div v-if="store.loadError" class="feedback warn load-error" role="alert">
      <span class="icon">!</span>
      <span>{{ store.loadError }}</span>
    </div>

    <section v-if="!intro" class="menu-body">
      <div class="side left" aria-hidden="true">
        <PixelSprite name="npc" :size="150" class="npc" />
      </div>
      <nav class="buttons panel">
        <button v-if="store.hasSave" class="btn btn-big btn-green" @click="click(() => store.go('map'))">▶ Continue</button>
        <button class="btn btn-big" :class="store.hasSave ? 'btn-wood' : 'btn-green'" @click="click(newGame)">✚ New Game</button>
        <button class="btn btn-big btn-blue" @click="click(() => store.go('howto'))">? How to Play</button>
        <button class="btn btn-big" @click="click(() => store.go('settings'))">⚙ Settings</button>
        <button class="btn btn-big" @click="click(() => store.go('credits'))">★ Credits</button>
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
.subtitle { display: inline-block; margin: 14px 0 20px; background: #2a5f9e; color: #fff; font-weight: 900; font-size: 20px; padding: 6px 18px; border: 3px solid var(--ink); box-shadow: inset 3px 3px 0 #4a9fe0, 0 4px 0 rgba(0,0,0,.3); letter-spacing: 1px; }
.load-error { max-width: 640px; margin: 0 auto 16px; text-align: left; }
.menu-body { display: flex; align-items: center; justify-content: center; gap: 30px; }
.buttons { display: flex; flex-direction: column; gap: 12px; padding: 22px; }
.side { width: 170px; display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; }
.npc { animation: bob 1.8s ease-in-out infinite; }
.intro { max-width: 760px; margin: 0 auto; text-align: left; }
.icons { display: flex; justify-content: center; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
.ic { background: rgba(31, 26, 23, .82); border: 3px solid var(--ink); padding: 8px 10px; width: 108px; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #fff; font-family: var(--font-title); font-size: 9px; box-shadow: inset 2px 2px 0 #4a3a2a; }
@media (max-width: 760px) { .side { display: none; } }
</style>
