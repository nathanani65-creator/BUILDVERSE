<script setup>
// REVIEW WORDS — every word the player has met in finished rounds, by room.
import { computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { LEVELS } from '../data/levels.js'
import PixelSprite from '../components/PixelSprite.vue'

const store = useGameStore()
const groups = computed(() =>
  LEVELS.map((l) => ({ level: l, words: l.words.filter((w) => store.data.learned.includes(w.word)) })).filter((g) => g.words.length),
)
</script>

<template>
  <main class="screen">
    <div class="row">
      <button class="btn" @click="store.go('map')">◀ Back</button>
      <h1 class="screen-title">Review Words</h1>
      <span class="count paper">{{ store.data.learned.length }} / {{ store.totalWords }} words</span>
    </div>
    <p v-if="!groups.length" class="feedback info"><span class="icon">ℹ</span><span>Finish a round to see its words here.</span></p>
    <section v-for="g in groups" :key="g.level.id" class="panel group">
      <h2>{{ g.level.name }} <span v-if="store.settings.thai" class="thai-h">{{ g.level.thai }}</span> <small>{{ g.words.length }}/{{ g.level.words.length }}</small></h2>
      <div class="cards">
        <article v-for="w in g.words" :key="w.word" class="card paper">
          <PixelSprite :name="w.sprite" :size="64" :label="w.display" />
          <div class="txt">
            <div class="w">{{ w.display }} <span class="thai">{{ w.thai }}</span></div>
            <div class="clue">{{ w.clue }}</div>
            <div class="ex">“{{ w.example }}”</div>
          </div>
          <div class="btns">
            <button class="btn btn-small btn-blue btn-icon" :aria-label="'Listen to ' + w.display" @click="store.say(w.display)">🔊</button>
            <button class="btn btn-small btn-wood btn-icon" aria-label="Listen to the example sentence" @click="store.say(w.example)">💬</button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.count { color: var(--ink); font-weight: 900; padding: 6px 10px; }
.group { margin-bottom: 16px; }
.group h2 small { font-size: 14px; color: #ffe7c2; }
.thai-h { font-family: var(--font-thai); color: #ffe7c2; font-size: 18px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; }
.card { display: flex; gap: 10px; align-items: center; color: var(--ink); }
.txt { flex: 1; }
.w { font-size: 20px; font-weight: 900; }
.clue { font-size: 15px; }
.ex { font-size: 15px; font-style: italic; color: #5b4630; }
.btns { display: flex; flex-direction: column; gap: 6px; }
</style>
