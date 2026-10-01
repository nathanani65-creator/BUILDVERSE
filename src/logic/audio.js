// ---------------------------------------------------------------------------
// SOUND — short sound effects made with the Web Audio API (no sound files
// needed) and word pronunciation with the Web Speech API.
// If the browser does not support them, the game keeps working silently.
// ---------------------------------------------------------------------------
let ctx = null
const state = { enabled: true, volume: 0.7 }

export function setAudioSettings({ sound, volume }) {
  state.enabled = !!sound
  state.volume = Math.min(1, Math.max(0, Number(volume) || 0))
}

function getCtx() {
  if (ctx) return ctx
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    ctx = null
  }
  return ctx
}

function tone(freq, start, dur, type = 'square', gainMul = 1) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = c.currentTime + start
  const v = 0.12 * state.volume * gainMul
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

const SOUNDS = {
  click: () => tone(660, 0, 0.06, 'square', 0.5),
  select: () => tone(520, 0, 0.04, 'triangle', 0.6),
  found: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.16)),
  wrong: () => [220, 180].forEach((f, i) => tone(f, i * 0.12, 0.16, 'sawtooth', 0.6)),
  buy: () => [988, 1319].forEach((f, i) => tone(f, i * 0.07, 0.14, 'square', 0.8)),
  place: () => tone(330, 0, 0.08, 'triangle'),
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22)),
  unlock: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 1.2)),
}

export function playSound(name) {
  if (!state.enabled || state.volume <= 0) return
  try {
    const c = getCtx()
    if (c && c.state === 'suspended') c.resume()
    SOUNDS[name]?.()
  } catch {
    /* sound is optional */
  }
}

export function speechSupported() {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined'
}

/** Say an English word or sentence. Returns false if speech is not available. */
export function speak(text) {
  if (!speechSupported() || !state.enabled) return false
  try {
    const synth = globalThis.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    u.volume = Math.max(0.2, state.volume)
    const voice = synth.getVoices().find((v) => v.lang && v.lang.startsWith('en'))
    if (voice) u.voice = voice
    synth.speak(u)
    return true
  } catch {
    return false
  }
}
