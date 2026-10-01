<script setup>
import { useGameStore } from '../stores/game.js'
const store = useGameStore()

function toggle(key) {
  store.setSetting(key, !store.settings[key])
  store.sound('click')
}
function setVolume(key, e) {
  store.setSetting(key, Number(e.target.value) / 100)
}
function reset() {
  store.ask('Reset progress?', 'All coins, furniture, rooms and learned words will be deleted. This cannot be undone.', 'Yes, reset', () => {
    store.resetProgress()
    store.toast('Progress was reset.', 'info')
    store.go('menu')
  })
}
</script>

<template>
  <main class="screen narrow">
    <div class="row">
      <button class="btn" @click="store.go('menu')">◀ Back to Menu</button>
      <h1 class="screen-title">Settings</h1>
    </div>
    <section class="panel-light list">
      <div class="set">
        <div>
          <strong>🎵 Music</strong>
          <p class="muted">Happy background music.</p>
        </div>
        <button class="btn" :class="store.settings.music ? 'btn-green' : 'btn-red'" role="switch" :aria-checked="store.settings.music" @click="toggle('music')">
          {{ store.settings.music ? '🎵 ON' : 'OFF' }}
        </button>
      </div>
      <div class="set">
        <strong>Music volume: {{ Math.round(store.settings.musicVolume * 100) }}%</strong>
        <input type="range" min="0" max="100" step="5" :value="Math.round(store.settings.musicVolume * 100)" :disabled="!store.settings.music" aria-label="Music volume" @input="setVolume('musicVolume', $event)" />
      </div>
      <div class="set">
        <div>
          <strong>🔊 Sound effects &amp; voice</strong>
          <p class="muted">Effects (found word, buy, success…) and word pronunciation.</p>
        </div>
        <button class="btn" :class="store.settings.sound ? 'btn-green' : 'btn-red'" role="switch" :aria-checked="store.settings.sound" @click="toggle('sound')">
          {{ store.settings.sound ? '🔊 ON' : '🔇 OFF' }}
        </button>
      </div>
      <div class="set">
        <strong>Effects volume: {{ Math.round(store.settings.volume * 100) }}%</strong>
        <input type="range" min="0" max="100" step="5" :value="Math.round(store.settings.volume * 100)" :disabled="!store.settings.sound" aria-label="Sound effects volume" @input="setVolume('volume', $event)" @change="store.sound('click')" />
      </div>
      <div class="set">
        <div>
          <strong>Thai help (ภาษาไทย)</strong>
          <p class="muted">Show Thai meanings and help text.</p>
        </div>
        <button class="btn" :class="store.settings.thai ? 'btn-green' : 'btn-red'" role="switch" :aria-checked="store.settings.thai" @click="toggle('thai')">
          {{ store.settings.thai ? 'ON' : 'OFF' }}
        </button>
      </div>
      <div class="set">
        <div>
          <strong>Test pronunciation</strong>
          <p class="muted">Uses your browser's voice (Web Speech API).</p>
        </div>
        <button class="btn btn-blue" @click="store.say('Welcome to BUILDVERSE!')">🔊 Test</button>
      </div>
      <div class="set danger">
        <div>
          <strong>Reset Progress</strong>
          <p class="muted">Delete your saved game and start again.</p>
        </div>
        <button class="btn btn-red" :disabled="!store.hasSave" @click="reset">Reset</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.narrow { max-width: 760px; }
.list { display: flex; flex-direction: column; gap: 4px; }
.set { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 6px; border-bottom: 2px dashed #8b8b8b; flex-wrap: wrap; }
.set:last-child { border: none; }
.set p { margin: 2px 0 0; font-size: 15px; }
.danger strong { color: #8b1d1d; }
</style>
