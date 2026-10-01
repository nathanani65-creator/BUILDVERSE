<script setup>
// Two small buttons that are always on screen: music on/off and sound effects on/off.
import { useGameStore } from '../stores/game.js'
const store = useGameStore()
function toggle(key) {
  store.setSetting(key, !store.settings[key])
  if (key === 'sound' && store.settings.sound) store.sound('click')
}
</script>

<template>
  <div class="sound-toggles" role="group" aria-label="Sound">
    <button
      class="btn btn-icon st"
      :class="store.settings.music ? 'btn-green' : 'off'"
      :aria-pressed="store.settings.music"
      :title="store.settings.music ? 'Music: ON (click to turn off)' : 'Music: OFF (click to turn on)'"
      @click="toggle('music')"
    >
      🎵<span v-if="!store.settings.music" class="slash" aria-hidden="true" />
      <span class="sr-only">Music {{ store.settings.music ? 'on' : 'off' }}</span>
    </button>
    <button
      class="btn btn-icon st"
      :class="store.settings.sound ? 'btn-blue' : 'off'"
      :aria-pressed="store.settings.sound"
      :title="store.settings.sound ? 'Sound effects: ON (click to turn off)' : 'Sound effects: OFF (click to turn on)'"
      @click="toggle('sound')"
    >
      {{ store.settings.sound ? '🔊' : '🔇' }}
      <span class="sr-only">Sound effects {{ store.settings.sound ? 'on' : 'off' }}</span>
    </button>
  </div>
</template>

<style scoped>
.sound-toggles { position: fixed; right: 12px; bottom: 12px; z-index: 150; display: flex; gap: 8px; }
.st { position: relative; width: 50px; height: 50px; font-size: 22px; padding: 0; }
.off { filter: grayscale(.4); }
.slash { position: absolute; left: 8px; right: 8px; top: 50%; height: 4px; background: #d24b43; border: 1px solid var(--ink); transform: rotate(-45deg); }
</style>
