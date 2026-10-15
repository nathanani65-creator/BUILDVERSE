<script setup>
import { useGameStore } from '../stores/game.js'
import { LEVELS, POSITION_WORDS } from '../data/levels.js'
import { LANGUAGE_FOCUS, SKILLS, LEVEL_GOALS, LEARNING_DESIGN } from '../data/learning.js'
import SceneView from '../components/SceneView.vue'

const store = useGameStore()
const positions = ['on', 'under', 'next to', 'between']
</script>

<template>
  <main class="screen goals">
    <div class="row">
      <button class="btn" @click="store.go(store.params.from || 'menu')">◀ Back</button>
      <h1 class="screen-title">Learning Goals</h1>
    </div>

    <!-- 1. What + who -->
    <section class="panel hero">
      <p class="kicker">THIS GAME TEACHES</p>
      <h2 class="headline">{{ LANGUAGE_FOCUS.headline }}</h2>
      <p v-if="store.settings.thai" class="thai big-th">{{ LANGUAGE_FOCUS.headlineThai }}</p>
      <div class="facts">
        <div class="fact paper"><span class="k">For</span><span>{{ LANGUAGE_FOCUS.learners }}</span><span v-if="store.settings.thai" class="thai">{{ LANGUAGE_FOCUS.learnersThai }}</span></div>
        <div class="fact paper"><span class="k">Level</span><span>{{ LANGUAGE_FOCUS.level }}</span></div>
        <div class="fact paper"><span class="k">Topic</span><span>{{ LANGUAGE_FOCUS.topic }}</span></div>
      </div>
    </section>

    <!-- 2. The four skills -->
    <h2 class="sec-title">4 English skills you practise</h2>
    <div class="skills">
      <article v-for="(s, i) in SKILLS" :key="s.id" class="skill panel-light" :class="{ main: i < 2 }">
        <div class="s-head">
          <span class="s-icon">{{ s.icon }}</span>
          <div>
            <strong>{{ s.name }}</strong>
            <div v-if="store.settings.thai" class="thai">{{ s.thai }}</div>
          </div>
          <span v-if="i < 2" class="badge badge-req">MAIN FOCUS</span>
        </div>
        <p>{{ s.desc }}</p>
        <p class="ex">e.g. <i>{{ s.example }}</i></p>
        <p class="where">🎮 {{ s.where }}</p>
      </article>
    </div>

    <!-- 3. Position words -->
    <h2 class="sec-title">The 4 position words</h2>
    <div class="positions">
      <div v-for="p in positions" :key="p" class="pos paper">
        <div class="pw">{{ p.toUpperCase() }} <span v-if="store.settings.thai" class="thai">({{ POSITION_WORDS[p].thai }})</span></div>
        <SceneView :scene="POSITION_WORDS[p].scene" :width="200" />
        <p>{{ POSITION_WORDS[p].text }}</p>
      </div>
    </div>

    <!-- 4. Level by level -->
    <h2 class="sec-title">What you learn in each level</h2>
    <div class="table-wrap panel-light">
      <table class="simple">
        <thead>
          <tr><th>Level</th><th>Words</th><th>Position word</th><th>Sentence pattern</th><th>After this level…</th></tr>
        </thead>
        <tbody>
          <tr v-for="l in LEVELS" :key="l.id">
            <td><b>{{ l.level }}. {{ l.name }}</b></td>
            <td>{{ l.words.map((w) => w.display.toLowerCase()).join(', ') }}</td>
            <td><b>{{ LEVEL_GOALS[l.id].position }}</b></td>
            <td><i>{{ LEVEL_GOALS[l.id].pattern }}</i></td>
            <td><ul><li v-for="c in LEVEL_GOALS[l.id].canDo" :key="c">{{ c }}</li></ul></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5. How the game supports learning -->
    <h2 class="sec-title">How the game helps you learn</h2>
    <div class="design panel-light">
      <div v-for="d in LEARNING_DESIGN" :key="d.part" class="d-row">
        <strong>{{ d.part }}</strong>
        <span>{{ d.how }}</span>
      </div>
    </div>

    <div class="row end">
      <button class="btn btn-blue btn-big" @click="store.go('howto')">? How to Play</button>
      <button class="btn btn-green btn-big" @click="store.go(store.hasSave ? 'map' : 'menu')">{{ store.hasSave ? "▶ Let's play!" : '◀ Back to Menu' }}</button>
    </div>
  </main>
</template>

<style scoped>
.hero { text-align: center; }
.kicker { font-family: var(--font-title); font-size: 11px; color: var(--gold); margin: 0 0 8px; letter-spacing: 2px; }
.headline { font-size: clamp(20px, 3vw, 28px); font-weight: 900; line-height: 1.35; margin: 0 0 6px; }
.big-th { font-size: 18px; margin: 0 0 12px; }
.facts { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.fact { display: flex; flex-direction: column; color: var(--ink); min-width: 200px; max-width: 320px; text-align: left; }
.k { font-family: var(--font-title); font-size: 10px; color: #b5651d; margin-bottom: 4px; }
.sec-title { font-family: var(--font-title); font-size: 14px; color: #fff; text-shadow: 2px 2px 0 var(--ink); margin: 22px 0 10px; }
.skills { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
.skill p { margin: 6px 0; }
.skill.main { box-shadow: 0 0 0 4px var(--gold), inset 4px 4px 0 var(--stone-light), inset -4px -4px 0 #8b8b8b; }
.s-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 18px; }
.s-icon { font-size: 30px; }
.ex { color: #5b4630; }
.where { font-size: 14px; font-weight: 800; color: #2a5f9e; }
.positions { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.pos { color: var(--ink); text-align: center; }
.pw { font-family: var(--font-title); font-size: 14px; margin-bottom: 8px; }
.pos p { font-size: 15px; margin: 8px 0 0; }
.table-wrap { overflow-x: auto; }
.table-wrap td ul { margin: 0; padding-left: 18px; }
.design { display: grid; gap: 8px; }
.d-row { display: grid; grid-template-columns: 190px 1fr; gap: 10px; padding: 6px 0; border-bottom: 2px dashed #8b8b8b; }
.d-row:last-child { border: none; }
.end { justify-content: center; margin-top: 20px; }
@media (max-width: 600px) { .d-row { grid-template-columns: 1fr; } }
</style>
