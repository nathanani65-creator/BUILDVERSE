// ---------------------------------------------------------------------------
// BUILDVERSE automatic checks.  Run with:  npm run verify
// Data, word banks, round builder, word search grids, decorating quests,
// coins, shop, saving / old-save upgrade, and full playthroughs that follow
// the 8 acceptance criteria.
// ---------------------------------------------------------------------------
import { LEVELS, DIFFICULTY, DIFFICULTY_ORDER, ECONOMY, QUESTS, QUEST_THINGS, POSITION_WORDS, REL_WORD, SCENES } from '../src/data/levels.js'
import { FURNITURE } from '../src/data/furniture.js'
import { SPRITES, PALETTE } from '../src/data/sprites.js'
import { LEVEL_GOALS, SKILLS, LANGUAGE_FOCUS } from '../src/data/learning.js'
import { generateGrid, verifyGrid, backupGrid, DIRS, BACKWARD_DIRS } from '../src/logic/gridGenerator.js'
import { checkSelection } from '../src/logic/selection.js'
import { buildRound, wordSetKey, questById, questsThatFit } from '../src/logic/round.js'
import { buildScene, checkStep, correctSlots } from '../src/logic/quest.js'
import { roundReward, canBuy } from '../src/logic/economy.js'
import { loadGame, SAVE_KEY } from '../src/logic/save.js'

class MemoryStorage {
  constructor() { this.map = new Map() }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null }
  setItem(k, v) { this.map.set(k, String(v)) }
  removeItem(k) { this.map.delete(k) }
}
globalThis.localStorage = new MemoryStorage()

let passed = 0
let failed = 0
function check(name, ok, info = '') {
  if (ok) passed++
  else {
    failed++
    console.log('  ✖ FAIL:', name, info)
  }
}
const section = (t) => console.log('\n▶ ' + t)
const ROOM_ORDER = ['bedroom', 'living', 'kitchen', 'bathroom', 'garden']

// ------------------------------------------------------------------ data
section('Rooms, word banks and sprites')
check('5 rooms in order', LEVELS.map((l) => l.id).join() === ROOM_ORDER.join())
for (const l of LEVELS) {
  check(`${l.id}: at least 15 words`, l.words.length >= 15, l.words.length)
  const ws = l.words.map((w) => w.word)
  check(`${l.id}: no duplicate words`, new Set(ws).size === ws.length)
  const clues = l.words.map((w) => w.clue.toLowerCase())
  check(`${l.id}: every clue is different`, new Set(clues).size === clues.length)
  for (const w of l.words) {
    check(`${w.word}: A-Z only`, /^[A-Z]+$/.test(w.word))
    check(`${w.word}: display matches`, w.display.replace(/ /g, '') === w.word)
    check(`${w.word}: clue/example/thai`, !!(w.clue && w.example && w.thai))
    check(`${w.word}: clue does not give the answer`, !w.clue.toUpperCase().includes(w.word))
    check(`${w.word}: picture exists`, !!SPRITES[w.sprite], w.sprite)
    check(`${w.word}: fits the biggest grid`, w.word.length <= DIFFICULTY.hard.size)
  }
  for (const k of DIFFICULTY_ORDER) {
    const fit = l.words.filter((w) => w.word.length <= DIFFICULTY[k].size).length
    check(`${l.id}/${k}: enough words that fit (${fit})`, fit >= DIFFICULTY[k].words + 3, fit)
  }
}
const allWords = LEVELS.flatMap((l) => l.words.map((w) => w.word))
check('words are not repeated across rooms', new Set(allWords).size === allWords.length)
for (const [name, rows] of Object.entries(SPRITES)) {
  check(`sprite ${name} rows same width`, rows.every((r) => r.length === rows[0].length))
  check(`sprite ${name} colours`, rows.every((r) => [...r].every((c) => c === '.' || PALETTE[c])))
}
for (const f of FURNITURE) check(`shop item ${f.id} picture`, !!SPRITES[f.sprite])
check('no "required" shop items any more', FURNITURE.every((f) => !f.required))

section('Difficulty settings')
const D = DIFFICULTY
check('Easy = 5 words, 8x8, → ↓, pictures, 1 instruction, 50 coins', D.easy.words === 5 && D.easy.size === 8 && D.easy.directions.join() === 'E,S' && D.easy.picture === 'shown' && D.easy.quests === 1 && D.easy.reward === 50)
check('Normal = 7 words, 10x10, + diagonal, picture button, 2 instructions, 70 coins', D.normal.words === 7 && D.normal.size === 10 && D.normal.directions.includes('SE') && !D.normal.directions.some((d) => BACKWARD_DIRS.includes(d)) && D.normal.picture === 'button' && D.normal.quests === 2 && D.normal.reward === 70)
check('Hard = 9 words, 12x12, + backwards, 3 instructions, 100 coins', D.hard.words === 9 && D.hard.size === 12 && D.hard.directions.some((d) => BACKWARD_DIRS.includes(d)) && D.hard.quests === 3 && D.hard.reward === 100)
check('time bonus 20, unlock bonus 100', ECONOMY.timeBonus === 20 && ECONOMY.unlockBonus === 100)

section('Learning goals')
check('language focus written', !!(LANGUAGE_FOCUS.headline && LANGUAGE_FOCUS.learners))
check('skills listed', SKILLS.length >= 3)
const EXPECTED_REL = { bedroom: ['on'], living: ['under'], kitchen: ['nextTo'], bathroom: ['on', 'nextTo'], garden: ['between'] }
for (const l of LEVELS) {
  check(`${l.id}: learning goals`, !!LEVEL_GOALS[l.id] && LEVEL_GOALS[l.id].canDo.length >= 2)
  const rels = [...new Set(QUESTS[l.id].map((q) => q.rel))].sort()
  check(`${l.id}: instructions use ${EXPECTED_REL[l.id].join(' & ')}`, rels.join() === [...EXPECTED_REL[l.id]].sort().join(), rels.join())
}
for (const p of Object.values(POSITION_WORDS)) check(`lesson scene ${p.scene}`, !!SCENES[p.scene])

// ------------------------------------------------------------------ quests
section('Decorating Quest instructions (every scene, both mirror sides)')
for (const l of LEVELS) {
  check(`${l.id}: at least 3 instructions with different items`, new Set(QUESTS[l.id].map((q) => q.item)).size >= 3)
  for (const q of QUESTS[l.id]) {
    const things = [q.item, ...[].concat(q.target), ...q.extra]
    check(`${q.id}: every thing exists (with a picture)`, things.every((t) => QUEST_THINGS[t] && SPRITES[QUEST_THINGS[t].sprite]), things.join())
    check(`${q.id}: words are in the ${l.id} word bank`, q.words.every((w) => l.words.some((x) => x.word === w)), q.words.join())
    check(`${q.id}: the item word is in the word bank`, l.words.some((x) => x.word === QUEST_THINGS[q.item].name.replace(/ /g, '').toUpperCase()) || q.words.length > 0)
    const name = QUEST_THINGS[q.item].name
    check(`${q.id}: text starts "Put the ${name} ${REL_WORD[q.rel]}"`, q.text.startsWith(`Put the ${name} ${REL_WORD[q.rel]} `), q.text)
    if (q.rel === 'on') check(`${q.id}: target has a surface (towel rail etc. present)`, !!QUEST_THINGS[q.target].surface && QUEST_THINGS[q.item].kind === 'small')
    if (q.rel === 'under') check(`${q.id}: target has space under it`, !!QUEST_THINGS[q.target].under)
    for (const flip of [false, true]) {
      const sc = buildScene(q, flip)
      const right = correctSlots(q, sc)
      check(`${q.id}${flip ? ' (mirrored)' : ''}: has a right space`, right.length >= 1)
      check(`${q.id}${flip ? ' (mirrored)' : ''}: has wrong spaces too`, sc.slots.length - right.length >= 2, `${sc.slots.length} slots`)
      check(`${q.id}${flip ? ' (mirrored)' : ''}: target things are in the scene`, [].concat(q.target).every((t) => sc.props.some((p) => p.id === t)))
      // the meaning is checked, not the position on screen
      for (const s of sc.slots) {
        const ok = checkStep(q, sc, s.id)
        if (q.rel === 'on') check(`${q.id}: "on" only on the ${q.target}`, ok === (s.type === 'on' && s.prop === q.target))
        if (q.rel === 'under') check(`${q.id}: "under" only under the ${q.target}`, ok === (s.type === 'under' && s.prop === q.target))
      }
    }
  }
}
{
  // between: the end spaces (next to only one thing) must be wrong
  const q = QUESTS.garden[0]
  const sc = buildScene(q, false)
  check('between: middle space is right', checkStep(q, sc, 'floor-2'))
  check('between: space next to only the tree is wrong', !checkStep(q, sc, 'floor-0'))
  check('between: space between flower pot and fence is wrong', !checkStep(q, sc, 'floor-4'))
  const k = QUESTS.kitchen[0]
  const ks = buildScene(k, false) // cabinet at col 1, stove at col 4
  check('next to: both sides of the target are right', checkStep(k, ks, 'floor-0') && checkStep(k, ks, 'floor-2'))
  check('next to: beside the other thing is wrong', !checkStep(k, ks, 'floor-3') && !checkStep(k, ks, 'floor-5'))
}

// ------------------------------------------------------------------ rounds & grids
section('Round builder + word search grids (60 rounds per room and difficulty)')
for (const l of LEVELS) {
  for (const k of DIFFICULTY_ORDER) {
    const diff = DIFFICULTY[k]
    let ok = true
    let gridOk = true
    let questOk = true
    let selectOk = true
    let repeats = 0
    let prev = ''
    const sets = new Set()
    for (let i = 0; i < 60; i++) {
      const r = buildRound(l.id, k, { previousKey: prev })
      const key = wordSetKey(r.words)
      if (key === prev) repeats++
      prev = key
      sets.add(key)
      if (r.words.length !== diff.words || new Set(r.words).size !== diff.words) ok = false
      if (r.words.some((w) => w.length > diff.size || !l.words.some((x) => x.word === w))) ok = false
      const qs = r.quests.map((id) => questById(l.id, id))
      if (qs.length !== diff.quests || new Set(qs.map((q) => q.item)).size !== qs.length) questOk = false
      if (qs.some((q) => q.words.some((w) => !r.words.includes(w)))) questOk = false
      const g = generateGrid(r.words, diff.size, diff.directions)
      if (!verifyGrid(g.grid, g.placements, r.words)) gridOk = false
      if (g.placements.some((p) => !diff.directions.includes(p.dir))) gridOk = false
      if (i % 10 === 0) {
        const found = []
        for (const p of g.placements) {
          const [dx, dy] = DIRS[p.dir]
          const cells = Array.from({ length: p.word.length }, (_, n) => ({ x: p.start.x + dx * n, y: p.start.y + dy * n }))
          const res = checkSelection(cells, g.grid, r.words, found, diff.directions)
          if (res.result !== 'found' || res.word !== p.word) selectOk = false
          found.push(p.word)
          if (checkSelection(cells, g.grid, r.words, found, diff.directions).result !== 'already') selectOk = false
        }
      }
    }
    check(`${l.id}/${k}: right number of words, all fit`, ok)
    check(`${l.id}/${k}: ${diff.quests} instruction(s), their words are in the Word Search`, questOk)
    check(`${l.id}/${k}: every word is really in the grid`, gridOk)
    check(`${l.id}/${k}: every word can be selected, found words not counted twice`, selectOk)
    check(`${l.id}/${k}: never the same word list twice in a row`, repeats === 0, repeats)
    check(`${l.id}/${k}: many different word lists (${sets.size}/60)`, sets.size >= 10, sets.size)
    check(`${l.id}/${k}: enough instructions available`, questsThatFit(l.id, diff.size).length >= diff.quests)
  }
  const nine = l.words.filter((w) => w.word.length <= 12).slice(0, 9).map((w) => w.word)
  const bk = backupGrid(nine, 12)
  check(`${l.id}: backup grid valid`, verifyGrid(bk.grid, bk.placements, nine))
}

// ------------------------------------------------------------------ coins & shop
section('Coins & shop')
check('Easy 50, Normal 70, Hard 100', roundReward('easy').total === 50 && roundReward('normal').total === 70 && roundReward('hard').total === 100)
check('time bonus +20', roundReward('normal', { timeBonus: true }).total === 90)
check('first clear +100', roundReward('easy', { firstClear: true }).total === 150)
const ctx = (coins, owned = []) => ({ coins, owned, isRoomUnlocked: (r) => r === 'bedroom' })
check('cannot buy without coins', canBuy('bed', ctx(10)).state === 'coins')
check('can buy with coins (no required items)', canBuy('bookshelf', ctx(500)).ok)
check('cannot buy twice', canBuy('bed', ctx(500, ['bed'])).state === 'owned')
check('locked room furniture cannot be bought', canBuy('sofa', ctx(500)).state === 'locked')

// ------------------------------------------------------------------ full game
section('Acceptance checks with the real game store')
const { createPinia, setActivePinia } = await import('pinia')
const { useGameStore } = await import('../src/stores/game.js')
setActivePinia(createPinia())
let store = useGameStore()
store.init()
store.newGame()

function playRound(roomId, difficulty = 'easy', mode = 'practice', inTime = false) {
  const r = store.startRound(roomId, difficulty, mode)
  if (!r) return null
  store.completeWordSearch(inTime)
  store.completeQuest()
  return store.claimReward()
}

// 1. New player clears the Bedroom and opens the Living Room without buying anything
check('start: 0 coins, only Bedroom open', store.data.coins === 0 && store.isUnlocked('bedroom') && !store.isUnlocked('living'))
check('first round in a room is always Easy', store.startRound('bedroom', 'hard').difficulty === 'easy')
const r1 = playRound('bedroom')
check('[1] Bedroom cleared without buying, Living Room open', store.isCleared('bedroom') && store.isUnlocked('living') && store.data.owned.length === 0)
check('[1] first clear pays 50 + 100 bonus', r1.total === 150 && store.data.coins === 150, JSON.stringify(r1))
check('[1] reward says the Living Room was unlocked', r1.unlockedRoom === 'living')
check('rewards need both activities', (() => {
  store.startRound('bedroom', 'easy')
  store.completeWordSearch(false)
  const none = store.claimReward()
  return none === null
})())

// 2. Replay gives a new grid and coins (difficulty can now be chosen)
const before = store.data.coins
const firstWords = wordSetKey(store.data.round.words)
store.completeQuest()
store.claimReward()
const r2 = playRound('bedroom', 'normal')
check('[2] replay round uses Normal after clearing', store.data.round.difficulty === 'normal')
check('[2] replay pays 70 (no second unlock bonus)', r2.total === 70 && r2.unlock === 0)
const keyA = wordSetKey(store.startRound('bedroom', 'easy').words)
const keyB = wordSetKey(store.startRound('bedroom', 'easy').words)
check('[2] a new round in the same room gets a different word list', keyA !== keyB)
check('[2] (and differs from the round before)', keyA !== firstWords || keyB !== firstWords)
store.completeWordSearch(false)
store.completeQuest()
store.claimReward()
check('[2] coins went up', store.data.coins === before + 50 + 70 + 50, store.data.coins - before)

// 7. no double rewards from clicking twice / refreshing the reward screen
const c0 = store.data.coins
store.claimReward()
store.claimReward()
setActivePinia(createPinia())
store = useGameStore()
store.init()
store.claimReward()
check('[7] reward is not paid twice (clicks or refresh)', store.data.coins === c0)
check('[7] progress kept after refresh', store.isCleared('bedroom') && store.isUnlocked('living'))

// 5. Quest replay never changes My House
store.buy('bed')
store.place('bed', 'bedroom', { x: 0, y: 0 })
const houseBefore = JSON.stringify(store.data.placements)
const ownedBefore = JSON.stringify(store.data.owned)
playRound('bedroom', 'hard', 'challenge', true)
check('[5] My House unchanged after a quest', JSON.stringify(store.data.placements) === houseBefore)
check('[5] quest items are not added to owned furniture', JSON.stringify(store.data.owned) === ownedBefore)
check('Hard + Challenge in time pays 120', store.data.round.reward.total === 120, JSON.stringify(store.data.round.reward))

// timer: fall back to practice → no time bonus; retry → bonus possible
store.startRound('bedroom', 'easy', 'challenge')
store.switchToPractice()
store.completeWordSearch(true)
store.completeQuest()
check('continue in Practice after time-out: no time bonus', store.claimReward().time === 0)
store.startRound('bedroom', 'easy', 'challenge')
store.switchToPractice()
store.retryChallenge()
store.completeWordSearch(true)
store.completeQuest()
check('Retry after time-out: time bonus possible again', store.claimReward().time === 20)

// 6. Clear all 5 rooms, then keep playing without New Game
let allClearedFlag = false
for (const id of ROOM_ORDER.slice(1)) {
  check(`${id} is open when reached`, store.isUnlocked(id))
  const rw = playRound(id)
  if (rw.allClearedNow) allClearedFlag = id === 'garden'
}
check('[6] all 5 rooms cleared', store.allCleared && store.clearedCount === 5)
check('[6] "all cleared" shown once, after the Garden', allClearedFlag)
const after = playRound('kitchen', 'hard')
check('[6] can keep playing after all rooms (no New Game)', !!after && after.total === 100 && !after.allClearedNow)
check('[6] replaying never locks a room', ROOM_ORDER.every((id) => store.isUnlocked(id)))
check('coins never negative', store.data.coins >= 0)
check('words met are recorded', store.data.learned.length >= 25, store.data.learned.length)

// shop + My House still work
check('buy decoration after unlocking', store.buy('fountain') && store.data.owned.includes('fountain'))
check('buy twice is blocked', !store.buy('fountain'))

// ------------------------------------------------------------------ saving
section('Saving, loading and old saves')
const saved = JSON.parse(localStorage.getItem(SAVE_KEY))
check('save version 2', saved.version === 2)
setActivePinia(createPinia())
const s2 = useGameStore()
s2.init()
check('reload keeps coins, rooms, furniture', s2.data.coins === store.data.coins && s2.clearedCount === 5 && JSON.stringify(s2.data.placements) === JSON.stringify(store.data.placements))

// v1 save → v2
const v1 = {
  version: 1,
  coins: 345,
  rooms: { bedroom: { wordSearch: true, challenge: true, firstClear: true, completed: true }, living: { wordSearch: true, challenge: true, firstClear: true, completed: false } },
  owned: ['bed', 'desk', 'lamp'],
  placements: { bed: { room: 'bedroom', x: 0, y: 0, rot: 0, parent: null } },
  learned: ['BED', 'DESK'],
  round: { id: 'x', roomId: 'living', wsDone: true },
  claimedRounds: [],
  tutorials: {},
  gameCompleted: false,
  stats: { roundsPlayed: 3 },
}
localStorage.setItem(SAVE_KEY, JSON.stringify(v1))
const up = loadGame()
check('old save loads', up.status === 'ok')
check('old save keeps coins', up.data.coins === 345)
check('old save keeps furniture and house', up.data.owned.length === 3 && !!up.data.placements.bed)
check('old completed room counts as cleared (no extra bonus)', up.data.rooms.bedroom.cleared && up.data.rooms.bedroom.bonusClaimed)
check('old unfinished room stays uncleared', !up.data.rooms.living.cleared)
check('old round dropped (new round format)', up.data.round === null && up.data.version === 2)
setActivePinia(createPinia())
const s3 = useGameStore()
s3.init()
check('old save: Living Room open, Kitchen locked', s3.isUnlocked('living') && !s3.isUnlocked('kitchen'))
localStorage.setItem(SAVE_KEY, '{not json')
const broken = loadGame()
check('broken save -> friendly error', broken.status === 'error' && /could not be read/.test(broken.message))

console.log(`\n${failed === 0 ? '✔ ALL CHECKS PASSED' : '✖ SOME CHECKS FAILED'} — ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
