// ---------------------------------------------------------------------------
// SOUND — everything is made with the Web Audio API (no sound files needed):
//   • Background music: a cheerful, relaxed chiptune loop (original, made in code)
//   • Sound effects: short tones for found words, buying, success…
//   • Word pronunciation with the Web Speech API
// Music and sound effects have separate on/off switches and volumes.
// If the browser does not support audio, the game keeps working silently.
// ---------------------------------------------------------------------------
let ctx = null
let sfxBus = null
let musicBus = null
let unlocked = false // browsers only allow sound after the player clicks or taps

const state = { sfx: true, sfxVolume: 0.7, music: true, musicVolume: 0.5 }

function clamp01(v) {
  return Math.min(1, Math.max(0, Number(v) || 0))
}

function getCtx() {
  if (ctx) return ctx
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
    sfxBus = ctx.createGain()
    musicBus = ctx.createGain()
    sfxBus.connect(ctx.destination)
    musicBus.connect(ctx.destination)
    applyVolumes()
  } catch {
    ctx = null
  }
  return ctx
}

function applyVolumes() {
  if (!ctx) return
  const t = ctx.currentTime
  sfxBus.gain.setTargetAtTime(state.sfx ? state.sfxVolume : 0, t, 0.05)
  musicBus.gain.setTargetAtTime(state.music ? state.musicVolume * 0.5 : 0, t, 0.3)
}

/** Settings from the store: { sound, volume, music, musicVolume } */
export function setAudioSettings({ sound, volume, music, musicVolume }) {
  state.sfx = !!sound
  state.sfxVolume = clamp01(volume)
  state.music = music !== false
  state.musicVolume = musicVolume === undefined ? 0.5 : clamp01(musicVolume)
  applyVolumes()
  updateMusic()
}

/** Call on the player's first click / tap / key press. */
export function unlockAudio() {
  const c = getCtx()
  if (!c) return
  unlocked = true
  if (c.state === 'suspended') c.resume().catch(() => {})
  updateMusic()
}

// ------------------------------ sound effects ------------------------------
// `t` is an absolute AudioContext time in seconds
function tone(freq, t, dur, type = 'square', gainMul = 1, bus = sfxBus) {
  const c = ctx
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const v = 0.12 * gainMul
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(bus)
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

// effect = list of [frequency, delay, length, wave, loudness]
const SOUNDS = {
  click: [[660, 0, 0.06, 'square', 0.5]],
  select: [[520, 0, 0.04, 'triangle', 0.6]],
  found: [523, 659, 784].map((f, i) => [f, i * 0.08, 0.16]),
  wrong: [220, 180].map((f, i) => [f, i * 0.12, 0.16, 'sawtooth', 0.6]),
  buy: [988, 1319].map((f, i) => [f, i * 0.07, 0.14, 'square', 0.8]),
  place: [[330, 0, 0.08, 'triangle']],
  success: [523, 659, 784, 1047].map((f, i) => [f, i * 0.1, 0.22]),
  unlock: [392, 523, 659, 784, 1047].map((f, i) => [f, i * 0.09, 0.25, 'triangle', 1.2]),
}

export function playSound(name) {
  if (!state.sfx || state.sfxVolume <= 0) return
  try {
    const c = getCtx()
    if (!c) return
    if (c.state === 'suspended') c.resume().catch(() => {})
    const now = c.currentTime
    for (const [f, delay, dur, type, loud] of SOUNDS[name] || []) tone(f, now + delay, dur, type, loud)
  } catch {
    /* sound is optional */
  }
}

// ------------------------------ background music ---------------------------
// "Block Party" — an original happy loop in C major (I – vi – IV – V).
// 8 bars × 8 eighth notes. '.' = rest, '-' = hold the previous note.
const BPM = 100
const MELODY = [
  'E5 . G5 . A5 G5 E5 .',
  'C5 . E5 . D5 C5 A4 .',
  'A4 . C5 . F5 E5 C5 .',
  'D5 . B4 . G4 - - .',
  'E5 G5 C6 . B5 . G5 .',
  'A5 . G5 E5 . C5 . .',
  'F5 . E5 . D5 . C5 .',
  'D5 . E5 . C5 - - .',
].flatMap((bar) => bar.split(' '))
const CHORDS = [
  ['C3', 'E4', 'G4', 'C5'],
  ['A2', 'C4', 'E4', 'A4'],
  ['F2', 'A3', 'C4', 'F4'],
  ['G2', 'B3', 'D4', 'G4'],
  ['C3', 'E4', 'G4', 'C5'],
  ['A2', 'C4', 'E4', 'A4'],
  ['F2', 'A3', 'C4', 'F4'],
  ['G2', 'B3', 'D4', 'G4'],
]
const ARP = [1, 2, 3, 2, 1, 2, 3, 2] // chord tone for each eighth note
const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

function freq(note) {
  const m = /^([A-G])(#?)(\d)$/.exec(note)
  if (!m) return 0
  const midi = 12 * (Number(m[3]) + 1) + NOTE_INDEX[m[1]] + (m[2] ? 1 : 0)
  return 440 * Math.pow(2, (midi - 69) / 12)
}

let musicTimer = null
let step = 0
let nextTime = 0
let noiseBuffer = null

function hat(t) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
    const d = noiseBuffer.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 7000
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.05, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
  src.connect(hp).connect(g).connect(musicBus)
  src.start(t)
  src.stop(t + 0.05)
}

function melodyLength(i) {
  let n = 1
  while (MELODY[(i + n) % MELODY.length] === '-') n++
  return n
}

function scheduleStep(i, t) {
  const eighth = 60 / BPM / 2
  const bar = Math.floor(i / 8)
  const beat = i % 8
  const chord = CHORDS[bar]
  // bass on every beat (root, then fifth-ish)
  if (beat % 2 === 0) tone(freq(chord[0]) * (beat === 4 ? 1.5 : 1), t, eighth * 1.8, 'triangle', 1.6, musicBus)
  // soft arpeggio
  tone(freq(chord[ARP[beat]]), t, eighth * 0.9, 'sine', 0.45, musicBus)
  // melody
  const n = MELODY[i]
  if (n !== '.' && n !== '-') tone(freq(n), t, eighth * melodyLength(i) * 0.95, 'square', 0.32, musicBus)
  // light hi-hat on the off-beats
  if (beat % 2 === 1) hat(t)
}

function startMusic() {
  const c = getCtx()
  if (!c || musicTimer) return
  step = 0
  nextTime = c.currentTime + 0.1
  const eighth = 60 / BPM / 2
  musicTimer = setInterval(() => {
    if (c.state !== 'running') return
    while (nextTime < c.currentTime + 0.2) {
      scheduleStep(step, nextTime)
      nextTime += eighth
      step = (step + 1) % MELODY.length
    }
  }, 40)
}

function stopMusic() {
  clearInterval(musicTimer)
  musicTimer = null
}

function updateMusic() {
  if (state.music && state.musicVolume > 0 && unlocked) startMusic()
  else stopMusic()
}

// Pause the music when the browser tab is hidden.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend().catch(() => {})
    else if (unlocked) ctx.resume().catch(() => {})
  })
}

// ------------------------------ pronunciation ------------------------------
export function speechSupported() {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined'
}

/** Say an English word or sentence (uses the sound-effects switch). */
export function speak(text) {
  if (!speechSupported() || !state.sfx) return false
  try {
    const synth = globalThis.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    u.volume = Math.max(0.2, state.sfxVolume)
    const voice = synth.getVoices().find((v) => v.lang && v.lang.startsWith('en'))
    if (voice) u.voice = voice
    synth.speak(u)
    return true
  } catch {
    return false
  }
}
