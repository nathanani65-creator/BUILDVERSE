// ---------------------------------------------------------------------------
// BUILDVERSE automatic checks.  Run with:  npm run verify
// Checks level data, grid generation, word selection, coins, shop rules,
// furniture placement rules, saving, and a full 5-room playthrough.
// ---------------------------------------------------------------------------
import { LEVELS, ECONOMY, SCENES, POSITION_WORDS } from '../src/data/levels.js'
import { FURNITURE, ITEM_BY_ID, requiredItems } from '../src/data/furniture.js'
import { SPRITES, PALETTE } from '../src/data/sprites.js'
import { generateGrid, verifyGrid, backupGrid, DIRS, BACKWARD_DIRS } from '../src/logic/gridGenerator.js'
import { checkSelection } from '../src/logic/selection.js'
import { roundReward, canBuy } from '../src/logic/economy.js'
import { resolveDrop, checkRule, checkRoom } from '../src/logic/placement.js'
import { loadGame, SAVE_KEY } from '../src/logic/save.js'

// ---- tiny fake localStorage so the store can run in Node ----
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
function section(t) { console.log('\n▶ ' + t) }

// ---------------------------------------------------------------- data
section('Level data')
const EXPECTED_REQUIRED = { bedroom: 180, living: 220, kitchen: 260, bathroom: 300, garden: 330 }
const EXPECTED_REWARD = { bedroom: 200, living: 250, kitchen: 300, bathroom: 350, garden: 400 }
const EXPECTED_TIME = { bedroom: 180, living: 240, kitchen: 300, bathroom: 360, garden: 420 }
for (const l of LEVELS) {
  check(`${l.id}: reward is ${EXPECTED_REWARD[l.id]}`, l.reward === EXPECTED_REWARD[l.id])
  check(`${l.id}: time limit`, l.timeLimit === EXPECTED_TIME[l.id])
  check(`${l.id}: 3 challenges`, l.challenges.length === 3)
  check(`${l.id}: has all 3 challenge types`, new Set(l.challenges.map((c) => c.type)).size === 3)
  const words = l.words.map((w) => w.word)
  check(`${l.id}: no duplicate words`, new Set(words).size === words.length)
  for (const w of l.words) {
    check(`${w.word}: display matches grid word`, w.display.replace(/ /g, '') === w.word)
    check(`${w.word}: upper case A-Z`, /^[A-Z]+$/.test(w.word))
    check(`${w.word}: fits grid`, w.word.length <= l.gridSize)
    check(`${w.word}: has clue/example/thai`, !!(w.clue && w.example && w.thai))
    check(`${w.word}: sprite exists`, !!SPRITES[w.sprite], w.sprite)
    check(`${w.word}: clue does not contain the answer`, !w.clue.toUpperCase().includes(w.word))
  }
  for (const c of l.challenges) {
    if (c.type === 'choose') {
      check(`${l.id}: choose answer in options`, c.options.filter((o) => o.text === c.answer).length === 1)
      c.options.forEach((o) => check(`option sprite ${o.sprite}`, !!SPRITES[o.sprite]))
    }
    if (c.type === 'position') {
      check(`${l.id}: position answer in options`, c.options.includes(c.answer))
      check(`${l.id}: scene exists`, !!SCENES[c.scene])
    }
    if (c.type === 'order') check(`${l.id}: order sentence starts with capital`, /^[A-Z]/.test(c.words[0]))
    check(`${l.id}: feedback texts`, !!(c.correct && c.wrong && c.hint && c.explain))
  }
  const req = requiredItems(l.id)
  const cost = req.reduce((s, i) => s + i.price, 0)
  check(`${l.id}: required items cost ${EXPECTED_REQUIRED[l.id]}`, cost === EXPECTED_REQUIRED[l.id], cost)
  check(`${l.id}: first-clear reward pays for required items`, l.reward >= cost)
  for (const t of l.placement.teach) check(`position word "${t}" lesson`, !!POSITION_WORDS[t] && !!SCENES[POSITION_WORDS[t].scene])
}
check('directions L1 = across/down', LEVELS[0].directions.join() === 'E,S')
check('L2 adds diagonals, no backwards', LEVELS[1].directions.some((d) => d.length === 2) && !LEVELS[1].directions.some((d) => BACKWARD_DIRS.includes(d)))
check('L3-5 include backwards', LEVELS.slice(2).every((l) => l.directions.some((d) => BACKWARD_DIRS.includes(d))))
for (const f of FURNITURE) {
  check(`furniture ${f.id} sprite`, !!SPRITES[f.sprite])
  check(`furniture ${f.id} room`, LEVELS.some((l) => l.id === f.room))
}
for (const [name, rows] of Object.entries(SPRITES)) {
  check(`sprite ${name} rows same width`, rows.every((r) => r.length === rows[0].length))
  check(`sprite ${name} colours`, rows.every((r) => [...r].every((c) => c === '.' || PALETTE[c])))
}

// ---------------------------------------------------------------- grids
section('Word search grids (300 grids per level)')
for (const l of LEVELS) {
  const words = l.words.map((w) => w.word)
  let backups = 0
  let ok = true
  let selOk = true
  let backwardOk = true
  for (let i = 0; i < 300; i++) {
    const g = generateGrid(words, l.gridSize, l.directions)
    if (g.backup) backups++
    if (!verifyGrid(g.grid, g.placements, words)) ok = false
    if (g.grid.length !== l.gridSize || g.grid.some((r) => r.length !== l.gridSize || r.some((c) => !/^[A-Z]$/.test(c)))) ok = false
    if (g.placements.some((p) => !l.directions.includes(p.dir))) ok = false
    if (!g.backup && l.directions.some((d) => BACKWARD_DIRS.includes(d)) && g.placements.filter((p) => BACKWARD_DIRS.includes(p.dir)).length < 2) backwardOk = false
    // every word can be selected, forwards and by dragging the other way
    const found = []
    for (const p of g.placements) {
      const [dx, dy] = DIRS[p.dir]
      const cells = Array.from({ length: p.word.length }, (_, k) => ({ x: p.start.x + dx * k, y: p.start.y + dy * k }))
      const r = checkSelection(cells, g.grid, words, found, l.directions)
      if (r.result !== 'found' || r.word !== p.word) selOk = false
      const r2 = checkSelection([...cells].reverse(), g.grid, words, found, l.directions)
      if (r2.result !== 'found' || r2.word !== p.word) selOk = false
      found.push(p.word)
      const again = checkSelection(cells, g.grid, words, found, l.directions)
      if (again.result !== 'already') selOk = false
    }
  }
  check(`${l.id}: all grids valid`, ok)
  check(`${l.id}: every word selectable; found words not counted twice`, selOk)
  check(`${l.id}: backward words really appear`, backwardOk)
  console.log(`  ${l.id}: ${l.gridSize}x${l.gridSize}, backup grid used ${backups}/300 times`)
  const b = backupGrid(words, l.gridSize)
  check(`${l.id}: backup grid valid`, verifyGrid(b.grid, b.placements, words))
}
{
  const g = [['B', 'E', 'D'], ['X', 'X', 'X'], ['X', 'X', 'X']]
  check('wrong letters -> wrong', checkSelection([{ x: 0, y: 1 }, { x: 1, y: 1 }], g, ['BED'], [], ['E', 'S']).result === 'wrong')
  check('single letter ignored', checkSelection([{ x: 0, y: 0 }], g, ['BED'], [], ['E', 'S']).result === 'short')
  const d = [['B', 'X', 'X'], ['X', 'E', 'X'], ['X', 'X', 'D']]
  check('diagonal not allowed in level 1', checkSelection([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], d, ['BED'], [], ['E', 'S']).result === 'direction')
}

// ---------------------------------------------------------------- coins
section('Coins & shop')
const L1 = LEVELS[0]
check('first clear, perfect, in time = 200+15+20', roundReward(L1, { firstClear: true, firstTryCorrect: 3, timeBonus: true }).total === 235)
check('replay base = 50', roundReward(L1, { firstClear: false, firstTryCorrect: 0, timeBonus: false }).total === ECONOMY.replayReward)
check('language bonus max 15', roundReward(L1, { firstClear: false, firstTryCorrect: 9, timeBonus: false }).language === 15)
const ctx = (coins, owned = []) => ({ coins, owned, isRoomUnlocked: (r) => r === 'bedroom', isRoomCompleted: () => false })
check('cannot buy without coins', canBuy('bed', ctx(10)).state === 'coins')
check('can buy with coins', canBuy('bed', ctx(80)).ok)
check('cannot buy twice', canBuy('bed', ctx(500, ['bed'])).state === 'owned')
check('decorations locked before room complete', canBuy('bookshelf', ctx(500)).state === 'locked')
check('next room furniture locked', canBuy('sofa', ctx(500)).state === 'locked')

// ---------------------------------------------------------------- placement
section('Placement rules')
{
  let P = {}
  const put = (id, room, x, y, rot = 0) => {
    const others = { ...P }
    delete others[id]
    const r = resolveDrop(id, room, { x, y }, rot, others)
    if (r.ok) P = { ...P, [id]: r.placement }
    return r
  }
  check('bed placed', put('bed', 'bedroom', 0, 0).ok)
  check('outside room rejected', !put('desk', 'bedroom', 8, 0).ok)
  check('overlap rejected (desk on bed)', !put('desk', 'bedroom', 1, 0).ok)
  check('wrong room rejected', !put('sofa', 'bedroom', 4, 4).ok)
  check('2x1 bed at last column rejected', !resolveDrop('bed', 'bedroom', { x: 7, y: 3 }, 0, {}).ok)
  put('desk', 'bedroom', 3, 0)
  put('lamp', 'bedroom', 5, 5)
  check('lamp on the floor -> ON rule fails', !checkRule({ type: 'on', item: 'lamp', target: 'desk' }, 'bedroom', P))
  check('lamp dropped on desk', put('lamp', 'bedroom', 3, 0).ok && P.lamp.parent === 'desk')
  check('bedroom passes', checkRoom(LEVELS[0], P).passed)

  // living: rug under table
  P = {}
  put('sofa', 'living', 0, 0)
  put('rug', 'living', 2, 2)
  put('table', 'living', 6, 4)
  check('table not on rug -> UNDER fails', !checkRule({ type: 'under', item: 'rug', target: 'table' }, 'living', P))
  check('table can stand on rug', put('table', 'living', 3, 3).ok)
  check('living passes', checkRoom(LEVELS[1], P).passed)
  check('sofa cannot stand on rug', !put('sofa', 'living', 2, 2).ok)

  // kitchen
  P = {}
  put('fridge', 'kitchen', 0, 0)
  put('cabinet', 'kitchen', 2, 0)
  put('kettle', 'kitchen', 2, 0)
  check('kettle on cabinet', P.kettle.parent === 'cabinet' && checkRoom(LEVELS[2], P).passed)

  // bathroom
  P = {}
  put('shower', 'bathroom', 0, 0)
  put('mirror', 'bathroom', 1, 1)
  put('towel', 'bathroom', 0, 0)
  check('diagonal is NOT next to', !checkRule({ type: 'nextTo', item: 'mirror', target: 'shower' }, 'bathroom', P))
  put('mirror', 'bathroom', 1, 0)
  check('bathroom passes (next to + towel on rail)', checkRoom(LEVELS[3], P).passed)
  check('towel cannot go on mirror', !put('towel', 'bathroom', 1, 0).ok)

  // garden
  P = {}
  put('tree', 'garden', 1, 1)
  put('bench', 'garden', 3, 1)
  put('flowerpot', 'garden', 2, 1)
  check('bench at the end is NOT between', !checkRoom(LEVELS[4], P).passed)
  put('bench', 'garden', 5, 5)
  put('flowerpot', 'garden', 3, 1)
  put('bench', 'garden', 2, 1)
  check('garden passes (row)', checkRoom(LEVELS[4], P).passed)
  P = {}
  put('tree', 'garden', 4, 1)
  put('bench', 'garden', 4, 2)
  put('flowerpot', 'garden', 4, 3)
  check('garden passes (column)', checkRoom(LEVELS[4], P).passed)
  put('flowerpot', 'garden', 4, 4)
  check('gap in the line fails', !checkRoom(LEVELS[4], P).passed)
}

// ---------------------------------------------------------------- full game
section('Full playthrough with the real game store')
const { createPinia, setActivePinia } = await import('pinia')
const { useGameStore } = await import('../src/stores/game.js')
setActivePinia(createPinia())
const store = useGameStore()
store.init()
store.newGame()
check('start: 0 coins, only bedroom open', store.data.coins === 0 && store.isUnlocked('bedroom') && !store.isUnlocked('living'))
check('goal text at start', store.currentGoal === 'Find 5 words in the Bedroom.', store.currentGoal)

const SOLUTIONS = {
  bedroom: [['bed', 0, 0], ['desk', 3, 0], ['lamp', 3, 0]],
  living: [['sofa', 0, 0], ['rug', 2, 2], ['table', 2, 2]],
  kitchen: [['fridge', 0, 0], ['cabinet', 2, 0], ['kettle', 2, 0]],
  bathroom: [['shower', 0, 0], ['mirror', 1, 0], ['towel', 0, 0]],
  garden: [['tree', 1, 1], ['bench', 2, 1], ['flowerpot', 3, 1]],
}
let minCoins = Infinity
for (const l of LEVELS) {
  check(`${l.id} unlocked when reached`, store.isUnlocked(l.id))
  check(`${l.id}: cannot finish placement before lessons`, !store.checkPlacement(l.id).passed)
  store.startRound(l.id, 'practice')
  store.completeWordSearch(l.id, false)
  check(`${l.id}: goal after word search`, store.goalFor(l.id) === 'Complete 3 language challenges.')
  store.recordAnswer(0, true)
  store.recordAnswer(1, false)
  store.recordAnswer(1, true) // second record ignored
  store.recordAnswer(2, true)
  const before = store.data.coins
  const reward = store.finishRound(l.id)
  check(`${l.id}: first clear reward + 10 language bonus`, reward.total === l.reward + 10 && store.data.coins === before + l.reward + 10, JSON.stringify(reward))
  store.finishRound(l.id)
  store.finishRound(l.id)
  check(`${l.id}: reward not given twice`, store.data.coins === before + l.reward + 10)
  check(`${l.id}: goal = buy items`, store.goalFor(l.id).startsWith('Buy '), store.goalFor(l.id))
  // spend ONLY the base reward on required items
  for (const it of requiredItems(l.id)) {
    check(`${l.id}: buy ${it.id}`, store.buy(it.id))
    minCoins = Math.min(minCoins, store.data.coins)
    check(`${it.id}: second buy blocked`, !store.buy(it.id))
  }
  check(`${l.id}: goal = placement instruction`, store.goalFor(l.id) === l.placement.instructions.join(' '), store.goalFor(l.id))
  for (const [id, x, y] of SOLUTIONS[l.id]) check(`${l.id}: place ${id}`, store.place(id, l.id, { x, y }).ok)
  const res = store.checkPlacement(l.id)
  check(`${l.id}: placement check passes`, res.passed && res.newlyCompleted, JSON.stringify(res.results.map((r) => r.ok)))
  // moving furniture after completion does not lock anything again
  store.storeItem(SOLUTIONS[l.id][1][0])
  check(`${l.id}: still completed after moving things`, store.isCompleted(l.id))
  for (const [id, x, y] of SOLUTIONS[l.id].slice(1)) store.place(id, l.id, { x, y })
}
check('coins never negative', minCoins >= 0, minCoins)
check('all 5 rooms completed', store.completedCount === 5)
check('game completed flag', store.data.gameCompleted === true)
check('43 words learned', store.data.learned.length === 43, store.data.learned.length)

// storing a desk also returns the lamp
store.storeItem('desk')
check('store desk -> lamp back to inventory', !store.data.placements.desk && !store.data.placements.lamp)
store.place('desk', 'bedroom', { x: 3, y: 0 })
store.place('lamp', 'bedroom', { x: 3, y: 0 })

// replay gives 50 + bonuses
const c0 = store.data.coins
store.startRound('bedroom', 'challenge')
store.completeWordSearch('bedroom', true)
;[0, 1, 2].forEach((i) => store.recordAnswer(i, true))
const rep = store.finishRound('bedroom')
check('replay = 50 + 15 + 20', rep.total === 85 && store.data.coins === c0 + 85)
check('optional decoration can be bought now', store.buy('bookshelf'))

// time-out -> practice gives no time bonus
store.startRound('living', 'challenge')
store.switchToPractice()
store.completeWordSearch('living', true)
const rep2 = store.finishRound('living')
check('continue-in-practice: no time bonus', rep2.time === 0)

// rotation
check('bed rotates when there is space', store.rotate('bed').ok && store.data.placements.bed.rot === 90)

// ---------------------------------------------------------------- saving
section('Saving & loading')
const saved = JSON.parse(localStorage.getItem(SAVE_KEY))
check('save has version', saved.version === 1)
setActivePinia(createPinia())
const store2 = useGameStore()
store2.init()
check('reload keeps coins', store2.data.coins === store.data.coins)
check('reload keeps furniture', JSON.stringify(store2.data.placements) === JSON.stringify(store.data.placements))
check('reload keeps rooms', store2.completedCount === 5)
check('claimed round stays claimed after reload', store2.finishRound('living').total === rep2.total && store2.data.coins === store.data.coins)
localStorage.setItem(SAVE_KEY, '{not json')
const broken = loadGame()
check('broken save -> friendly error', broken.status === 'error' && /could not be read/.test(broken.message))
check('broken save backed up', localStorage.getItem(SAVE_KEY + '.broken') === '{not json')
localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, coins: -5, rooms: {}, owned: [], placements: {} }))
check('negative coins save rejected', loadGame().status === 'error')

console.log(`\n${failed === 0 ? '✔ ALL CHECKS PASSED' : '✖ SOME CHECKS FAILED'} — ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
