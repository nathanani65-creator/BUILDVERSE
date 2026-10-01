<script setup>
// Screen switcher. The current screen name lives in the game store.
import { computed } from 'vue'
import { useGameStore } from './stores/game.js'
import Celebration from './components/Celebration.vue'
import Modal from './components/Modal.vue'
import MainMenu from './screens/MainMenu.vue'
import HouseMap from './screens/HouseMap.vue'
import WordSearch from './screens/WordSearch.vue'
import LanguageChallenge from './screens/LanguageChallenge.vue'
import QuestComplete from './screens/QuestComplete.vue'
import Shop from './screens/Shop.vue'
import MyHouse from './screens/MyHouse.vue'
import HowToPlay from './screens/HowToPlay.vue'
import Settings from './screens/Settings.vue'
import Credits from './screens/Credits.vue'
import Ending from './screens/Ending.vue'
import ReviewWords from './screens/ReviewWords.vue'

const store = useGameStore()
store.init()

const SCREENS = {
  menu: MainMenu,
  map: HouseMap,
  wordsearch: WordSearch,
  challenge: LanguageChallenge,
  complete: QuestComplete,
  shop: Shop,
  house: MyHouse,
  howto: HowToPlay,
  settings: Settings,
  credits: Credits,
  ending: Ending,
  review: ReviewWords,
}
const current = computed(() => SCREENS[store.screen] || MainMenu)
const screenKey = computed(() => store.screen + JSON.stringify(store.params))

const clouds = [
  { top: '8%', w: 120, h: 34, dur: 95, delay: -10 },
  { top: '18%', w: 180, h: 44, dur: 130, delay: -70 },
  { top: '5%', w: 90, h: 28, dur: 80, delay: -40 },
  { top: '28%', w: 140, h: 36, dur: 150, delay: -120 },
]

function confirmYes() {
  const fn = store.confirmBox?.onYes
  store.confirmBox = null
  fn?.()
}
</script>

<template>
  <div class="world-bg" aria-hidden="true">
    <div
      v-for="(c, i) in clouds"
      :key="i"
      class="cloud"
      :style="{ top: c.top, width: c.w + 'px', height: c.h + 'px', animationDuration: c.dur + 's', animationDelay: c.delay + 's' }"
    />
    <div class="ground" />
  </div>

  <component :is="current" :key="screenKey" />

  <div class="toasts" aria-live="polite">
    <div v-for="t in store.toasts" :key="t.id" class="toast feedback" :class="t.kind === 'good' ? 'good' : t.kind === 'warn' ? 'warn' : t.kind === 'bad' ? 'bad' : 'info'">
      <span class="icon">{{ t.kind === 'good' ? '✔' : t.kind === 'warn' || t.kind === 'bad' ? '!' : 'ℹ' }}</span>
      <span>{{ t.text }}</span>
    </div>
  </div>

  <Modal v-if="store.confirmBox" :title="store.confirmBox.title" light>
    <p style="font-size: 18px">{{ store.confirmBox.text }}</p>
    <template #actions>
      <button class="btn" @click="store.confirmBox = null">Cancel</button>
      <button class="btn btn-red" @click="confirmYes">{{ store.confirmBox.yes || 'Yes' }}</button>
    </template>
  </Modal>

  <Celebration />
</template>
