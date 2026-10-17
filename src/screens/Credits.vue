<script setup>
import { useGameStore } from '../stores/game.js'
import { TEAM, AI_USE, GROUP_WORK, NO_AI_DURING_PLAY, TOOLS } from '../data/credits.js'

const store = useGameStore()
</script>

<template>
  <main class="screen narrow">
    <div class="row">
      <button class="btn" @click="store.go('menu')">◀ Back to Menu</button>
      <h1 class="screen-title">Credits</h1>
    </div>

    <section class="panel-light">
      <h2>Team</h2>
      <div class="table-wrap">
        <table class="simple">
          <thead><tr><th>#</th><th>Name</th><th>Student ID</th><th>Role</th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in TEAM" :key="m.id">
              <td>{{ i + 1 }}</td>
              <td>{{ m.name }}</td>
              <td>{{ m.id }}</td>
              <td>{{ m.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel-light">
      <h2>Tools &amp; technology</h2>
      <table class="simple">
        <tbody><tr v-for="t in TOOLS" :key="t[0]"><th>{{ t[0] }}</th><td>{{ t[1] }}</td></tr></tbody>
      </table>
    </section>

    <section class="panel-light">
      <h2>🤖 How we used AI</h2>
      <p class="feedback info"><span class="icon">ℹ</span><span>{{ NO_AI_DURING_PLAY }}</span></p>
      <div v-for="a in AI_USE" :key="a.tool" class="ai">
        <h3>{{ a.tool }}</h3>
        <div class="ai-cols">
          <div>
            <strong>AI helped with:</strong>
            <ul><li v-for="u in a.used" :key="u">{{ u }}</li></ul>
          </div>
          <div>
            <strong>Our group checked / changed:</strong>
            <ul v-if="a.groupDid.length"><li v-for="g in a.groupDid" :key="g">{{ g }}</li></ul>
            <p v-else class="todo">(Group: fill in <code>src/data/credits.js</code>)</p>
          </div>
        </div>
      </div>
      <h3>Made by our group (no AI)</h3>
      <ul v-if="GROUP_WORK.length"><li v-for="g in GROUP_WORK" :key="g">{{ g }}</li></ul>
      <p v-else class="todo">(Group: fill in <code>src/data/credits.js</code>)</p>
    </section>

    <section class="panel-light">
      <h2>Art &amp; sound</h2>
      <ul>
        <li>All pixel art (furniture, words, helper character, coins) is drawn in code in <code>src/data/sprites.js</code>. No outside image files are used.</li>
        <li>The background music (“Block Party”) and the sound effects are made in code with the Web Audio API (<code>src/logic/audio.js</code>). No outside music or sound files are used.</li>
        <li>Word pronunciation uses the voice that comes with your browser or device.</li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.narrow { max-width: 900px; }
section { margin-bottom: 16px; }
h2 { font-size: 20px; }
.table-wrap { overflow-x: auto; }
td input { min-width: 100px; }
.ai { border-top: 2px dashed #8b8b8b; padding-top: 8px; margin-top: 8px; }
.ai h3 { margin: 4px 0; }
.ai-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.todo { color: #8b1d1d; font-weight: 800; }
@media (max-width: 640px) { .ai-cols { grid-template-columns: 1fr; } }
code { background: #fff; padding: 1px 4px; border: 1px solid #999; }
</style>
