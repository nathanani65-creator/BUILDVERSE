// ---------------------------------------------------------------------------
// SAVE SYSTEM (localStorage)
// The save has a version number. Old saves are upgraded by `migrate`, keeping
// coins, bought furniture, the decorated house and unlocked rooms.
// ---------------------------------------------------------------------------
export const SAVE_KEY = 'buildverse.save'
export const SAVE_VERSION = 2

export function defaultSettings() {
  // sound = sound effects + word voice, music = background music
  return { sound: true, volume: 0.7, music: true, musicVolume: 0.5, thai: true }
}

export function newSaveData() {
  return {
    version: SAVE_VERSION,
    coins: 0,
    // per room: { cleared, bonusClaimed, plays }
    rooms: {},
    owned: [], // furniture bought in the Shop (My House only)
    placements: {}, // My House layout
    learned: [], // words met in finished rounds
    round: null, // the round being played
    claimedRounds: [],
    lastWords: {}, // last word list per room (to avoid repeating it)
    tutorials: {},
    stats: { roundsPlayed: 0 },
  }
}

function isObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

/** Make sure a loaded save has all fields with the right types. */
function validate(data) {
  if (!isObject(data)) throw new Error('not an object')
  if (typeof data.coins !== 'number' || !Number.isFinite(data.coins) || data.coins < 0) throw new Error('bad coins')
  if (!isObject(data.rooms) || !Array.isArray(data.owned) || !isObject(data.placements)) throw new Error('bad fields')
  const base = newSaveData()
  return { ...base, ...data, stats: { ...base.stats, ...(data.stats || {}) }, lastWords: { ...(data.lastWords || {}) } }
}

/** Upgrade old saves step by step. */
export function migrate(data) {
  if (!isObject(data) || typeof data.version !== 'number' || data.version > SAVE_VERSION) throw new Error('unknown version')
  if (data.version === 1) {
    // v1 had Word Search + Language Challenge + required furniture.
    // A v1 room that was "completed" counts as cleared (its first-clear reward was already paid).
    const rooms = {}
    for (const [id, r] of Object.entries(data.rooms || {})) {
      rooms[id] = { cleared: !!r.completed, bonusClaimed: !!r.completed, plays: r.completed ? 1 : 0 }
    }
    data = { ...data, rooms, round: null, lastWords: {}, version: 2 }
    delete data.gameCompleted
  }
  return data
}

/**
 * Load the game.
 * Returns { status: 'empty' | 'ok' | 'error', data?, message?, settings }
 */
export function loadGame(storage = globalThis.localStorage) {
  let settings = defaultSettings()
  try {
    const rawSettings = storage.getItem(SAVE_KEY + '.settings')
    if (rawSettings) settings = { ...settings, ...JSON.parse(rawSettings) }
  } catch {
    /* use default settings */
  }
  let raw
  try {
    raw = storage.getItem(SAVE_KEY)
  } catch {
    return { status: 'error', message: 'Your browser does not allow saving. You can play, but progress will not be saved.', settings }
  }
  if (!raw) return { status: 'empty', settings }
  try {
    const data = validate(migrate(JSON.parse(raw)))
    return { status: 'ok', data, settings }
  } catch {
    try {
      storage.setItem(SAVE_KEY + '.broken', raw)
    } catch {
      /* ignore */
    }
    return {
      status: 'error',
      message: 'Sorry! Your saved game could not be read. A backup copy was kept. Please start a new game.',
      settings,
    }
  }
}

export function saveGame(data, storage = globalThis.localStorage) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  try {
    storage.setItem(SAVE_KEY + '.settings', JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

export function clearGame(storage = globalThis.localStorage) {
  try {
    storage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}
