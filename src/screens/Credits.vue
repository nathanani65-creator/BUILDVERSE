<script setup>
// Team members are typed in by the group and saved in this browser
// (they are kept even when game progress is reset).
import { ref, watch } from 'vue'
import { useGameStore } from '../stores/game.js'

const store = useGameStore()
const KEY = 'buildverse.credits'
function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(v) && v.length) return v
  } catch {
    /* ignore */
  }
  return [1, 2, 3, 4].map(() => ({ name: '', id: '', role: '' }))
}
const members = ref(load())
watch(
  members,
  (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      /* ignore */
    }
  },
  { deep: true },
)
const TOOLS = [
  ['Vue 3', 'User interface framework'],
  ['Vite', 'Development server and build tool'],
  ['Pinia', 'Game state management'],
  ['JavaScript + CSS', 'Game logic, layout and animations'],
  ['localStorage', 'Saving the game in the browser'],
  ['Web Audio API', 'Background music and sound effects (made in code, no sound files)'],
  ['Web Speech API', 'Word pronunciation with the voice of the browser'],
  ['Google Fonts', 'Nunito, Press Start 2P, Sarabun (SIL Open Font License)'],
]
</script>

<template>
  <main class="screen narrow">
    <div class="row">
      <button class="btn" @click="store.go('menu')">◀ Back to Menu</button>
      <h1 class="screen-title">Credits</h1>
    </div>

    <section class="panel-light">
      <h2>Team</h2>
      <p class="muted">Type your group members here. (This list is saved in this browser.)</p>
      <div class="table-wrap">
        <table class="simple">
          <thead><tr><th>#</th><th>Name</th><th>Student ID</th><th>Role</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in members" :key="i">
              <td>{{ i + 1 }}</td>
              <td><input v-model="m.name" type="text" placeholder="Member name" :aria-label="`Member ${i + 1} name`" /></td>
              <td><input v-model="m.id" type="text" placeholder="Student ID" :aria-label="`Member ${i + 1} student ID`" /></td>
              <td><input v-model="m.role" type="text" placeholder="Role (e.g. programmer)" :aria-label="`Member ${i + 1} role`" /></td>
              <td><button class="btn btn-small btn-red btn-icon" :disabled="members.length <= 1" :aria-label="`Remove row ${i + 1}`" @click="members.splice(i, 1)">✕</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-small btn-green add" @click="members.push({ name: '', id: '', role: '' })">✚ Add member</button>
    </section>

    <section class="panel-light">
      <h2>Tools &amp; technology</h2>
      <table class="simple">
        <tbody><tr v-for="t in TOOLS" :key="t[0]"><th>{{ t[0] }}</th><td>{{ t[1] }}</td></tr></tbody>
      </table>
    </section>

    <section class="panel-light">
      <h2>Art &amp; sound</h2>
      <ul>
        <li>All pixel art (furniture, words, helper character, coins) is drawn in code in <code>src/data/sprites.js</code>. No outside image files are used.</li>
        <li>The background music (“Block Party”) and the sound effects are made in code with the Web Audio API (<code>src/logic/audio.js</code>). No outside music or sound files are used.</li>
        <li>Word pronunciation uses the voice that comes with your browser or device.</li>
      </ul>
      <h2>AI tools</h2>
      <p>See <code>README.md</code> → “AI tools used”. The group lists only the AI tools it really used and explains which parts AI helped with.</p>
    </section>
  </main>
</template>

<style scoped>
.narrow { max-width: 900px; }
section { margin-bottom: 16px; }
h2 { font-size: 20px; }
.table-wrap { overflow-x: auto; }
td input { min-width: 100px; }
.add { margin-top: 10px; }
code { background: #fff; padding: 1px 4px; border: 1px solid #999; }
</style>
