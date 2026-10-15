// ---------------------------------------------------------------------------
// ROUND BUILDER — picks the words and the decorating instructions for one
// round. Pure functions (no Vue), so they can be tested by scripts/verify.mjs.
//
// 1. Pick N decorating instructions (Easy 1, Normal 2, Hard 3) that move
//    different items and whose words fit the grid.
// 2. Put the words of those instructions into the word list, so the two
//    activities are connected.
// 3. Fill the rest of the list with random words from the room's word bank.
// 4. Try again if the list is exactly the same as last round.
// ---------------------------------------------------------------------------
import { LEVEL_BY_ID, QUESTS, DIFFICULTY } from '../data/levels.js'

export function shuffle(list, rng = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Words of a room that fit a grid of this size. */
export function wordsThatFit(roomId, size) {
  return LEVEL_BY_ID[roomId].words.filter((w) => w.word.length <= size).map((w) => w.word)
}

/** Instructions that can be used with this difficulty (all their words fit). */
export function questsThatFit(roomId, size) {
  return QUESTS[roomId].filter((q) => q.words.every((word) => word.length <= size))
}

export function wordSetKey(words) {
  return [...words].sort().join(',')
}

function pickQuests(roomId, diff, rng) {
  const chosen = []
  for (const q of shuffle(questsThatFit(roomId, diff.size), rng)) {
    if (chosen.length >= diff.quests) break
    if (chosen.some((c) => c.item === q.item)) continue // one scene per item
    chosen.push(q)
  }
  return chosen
}

/**
 * Build a round.
 * @returns {{ words: string[], quests: string[] }}  (quest ids)
 */
export function buildRound(roomId, difficultyKey, { previousKey = '', rng = Math.random } = {}) {
  const diff = DIFFICULTY[difficultyKey]
  const pool = wordsThatFit(roomId, diff.size)
  let best = null
  for (let attempt = 0; attempt < 40; attempt++) {
    const quests = pickQuests(roomId, diff, rng)
    const needed = [...new Set(quests.flatMap((q) => q.words))]
    const rest = shuffle(pool.filter((word) => !needed.includes(word)), rng)
    const words = shuffle([...needed, ...rest].slice(0, diff.words), rng)
    best = { words, quests: quests.map((q) => q.id) }
    if (wordSetKey(words) !== previousKey) break
  }
  return best
}

export function questById(roomId, id) {
  return QUESTS[roomId].find((q) => q.id === id)
}
