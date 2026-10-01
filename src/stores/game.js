// ---------------------------------------------------------------------------
// GAME STORE (Pinia) — all game state lives here.
// Every change that matters (coins, purchases, placements, unlocks, rewards)
// calls `persist()` straight away so a page refresh never loses progress and
// never gives a reward twice.
// ---------------------------------------------------------------------------
import { defineStore } from 'pinia'
import { LEVELS, LEVEL_BY_ID } from '../data/levels.js'
import { ITEM_BY_ID, requiredItems } from '../data/furniture.js'
import { loadGame, saveGame, saveSettings, clearGame, newSaveData, defaultSettings } from '../logic/save.js'
import { roundReward, canBuy } from '../logic/economy.js'
import { resolveDrop, canPlaceOnFloor, childrenOf, checkRoom } from '../logic/placement.js'
import { playSound, setAudioSettings, speak } from '../logic/audio.js'

let toastId = 0

function article(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

export function listWithAnd(items) {
  if (items.length <= 1) return items.join('')
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export const useGameStore = defineStore('game', {
  state: () => ({
    screen: 'menu',
    params: {},
    data: newSaveData(),
    hasSave: false,
    settings: defaultSettings(),
    loadError: '',
    toasts: [],
    fx: { key: 0, kind: '' },
    confirmBox: null, // { title, text, yes, onYes }
  }),

  getters: {
    levels: () => LEVELS,
    roomState: (state) => (id) => state.data.rooms[id] || { wordSearch: false, challenge: false, firstClear: false, completed: false },
    isUnlocked() {
      return (id) => {
        const i = LEVELS.findIndex((l) => l.id === id)
        if (i <= 0) return i === 0
        return this.roomState(LEVELS[i - 1].id).completed
      }
    },
    isCompleted() {
      return (id) => this.roomState(id).completed
    },
    /** The room the player should work on next (null when all rooms are done). */
    activeRoomId() {
      const l = LEVELS.find((lv) => this.isUnlocked(lv.id) && !this.isCompleted(lv.id))
      return l ? l.id : null
    },
    completedCount() {
      return LEVELS.filter((l) => this.isCompleted(l.id)).length
    },
    missingRequired() {
      return (roomId) => requiredItems(roomId).filter((it) => !this.data.owned.includes(it.id))
    },
    /** Step number 0–4 for a room: WS, LC, buy, place */
    roomProgress() {
      return (roomId) => {
        const r = this.roomState(roomId)
        let steps = 0
        if (r.wordSearch) steps++
        if (r.challenge) steps++
        if (r.challenge && this.missingRequired(roomId).length === 0) steps++
        if (r.completed) steps = 4
        return steps
      }
    },
    /** Next thing the player has to do in a room. */
    nextStep() {
      return (roomId) => {
        const r = this.roomState(roomId)
        if (!this.isUnlocked(roomId)) return 'locked'
        if (r.completed) return 'done'
        if (!r.wordSearch) return 'wordsearch'
        if (!r.challenge) return 'challenge'
        if (this.missingRequired(roomId).length) return 'shop'
        return 'decorate'
      }
    },
    goalFor() {
      return (roomId) => {
        const level = LEVEL_BY_ID[roomId]
        switch (this.nextStep(roomId)) {
          case 'locked':
            return `Finish the ${LEVELS[level.level - 2].name} to unlock this room.`
          case 'wordsearch':
            return `Find ${level.words.length} words in the ${level.name}.`
          case 'challenge':
            return 'Complete 3 language challenges.'
          case 'shop': {
            const names = this.missingRequired(roomId).map((it) => `${article(it.name)} ${it.name.toLowerCase()}`)
            return `Buy ${listWithAnd(names)}.`
          }
          case 'decorate':
            return level.placement.instructions.join(' ')
          default:
            return 'Room complete! Decorate it any way you like.'
        }
      }
    },
    currentGoal() {
      const id = this.activeRoomId
      if (!id) return 'Your home is complete! Decorate freely or replay levels for coins.'
      return this.goalFor(id)
    },
    learnedWords() {
      return LEVELS.filter((l) => this.roomState(l.id).challenge).flatMap((l) => l.words.map((w) => ({ ...w, room: l.name })))
    },
  },

  actions: {
    // ---------------- setup & navigation ----------------
    init() {
      const result = loadGame()
      this.settings = result.settings
      setAudioSettings(this.settings)
      if (result.status === 'ok') {
        this.data = result.data
        this.hasSave = true
      } else if (result.status === 'error') {
        this.loadError = result.message
      }
    },
    go(screen, params = {}) {
      this.screen = screen
      this.params = params
      globalThis.scrollTo?.(0, 0)
    },
    persist() {
      saveGame(this.data)
      this.hasSave = true
    },
    newGame() {
      this.data = newSaveData()
      this.loadError = ''
      this.persist()
    },
    resetProgress() {
      clearGame()
      this.data = newSaveData()
      this.hasSave = false
      this.loadError = ''
    },
    ensureRoom(id) {
      if (!this.data.rooms[id]) this.data.rooms[id] = { wordSearch: false, challenge: false, firstClear: false, completed: false }
      return this.data.rooms[id]
    },

    // ---------------- feedback helpers ----------------
    toast(text, kind = 'info') {
      const id = ++toastId
      this.toasts.push({ id, text, kind })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id)
      }, 2800)
    },
    celebrate(kind = 'stars') {
      this.fx = { key: this.fx.key + 1, kind }
    },
    sound(name) {
      playSound(name)
    },
    say(text) {
      if (!speak(text)) this.toast(this.settings.sound ? 'Speech is not available on this device.' : 'Turn on sound effects (🔊) to hear words.', 'info')
    },
    ask(title, text, yes, onYes) {
      this.confirmBox = { title, text, yes, onYes }
    },

    // ---------------- settings ----------------
    setSetting(key, value) {
      this.settings[key] = value
      setAudioSettings(this.settings)
      saveSettings(this.settings)
    },
    markTutorial(key) {
      this.data.tutorials[key] = true
      this.persist()
    },

    // ---------------- rounds & rewards ----------------
    startRound(roomId, mode) {
      if (!this.isUnlocked(roomId)) return null
      this.data.round = {
        id: `${roomId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        roomId,
        mode,
        fellBack: false,
        wsDone: false,
        timeBonus: false,
        answers: [],
        claimed: false,
        reward: null,
      }
      this.persist()
      return this.data.round
    },
    switchToPractice() {
      const r = this.data.round
      if (r) {
        r.mode = 'practice'
        r.fellBack = true
        this.persist()
      }
    },
    completeWordSearch(roomId, finishedInTime) {
      const r = this.data.round
      if (!r || r.roomId !== roomId || r.wsDone) return
      r.wsDone = true
      r.timeBonus = r.mode === 'challenge' && !r.fellBack && finishedInTime
      this.ensureRoom(roomId).wordSearch = true
      this.persist()
    },
    /** Make sure a Language Challenge can start (e.g. after a page refresh). */
    ensureChallengeRound(roomId) {
      const r = this.data.round
      if (r && r.roomId === roomId && r.wsDone && !r.claimed) return r
      if (!this.roomState(roomId).wordSearch) return null
      if (this.roomState(roomId).challenge) return null
      // Word Search was finished before, but the round was lost: continue without time bonus.
      this.data.round = { id: `${roomId}-${Date.now()}-r`, roomId, mode: 'practice', fellBack: true, wsDone: true, timeBonus: false, answers: [], claimed: false, reward: null }
      this.persist()
      return this.data.round
    },
    recordAnswer(index, firstTry) {
      const r = this.data.round
      if (!r || r.answers[index] !== undefined) return
      r.answers[index] = firstTry
      this.persist()
    },
    /** Give the round reward ONCE. Safe to call many times. */
    finishRound(roomId) {
      const r = this.data.round
      if (!r || r.roomId !== roomId || !r.wsDone) return null
      if (r.claimed || this.data.claimedRounds.includes(r.id)) return r.reward
      const level = LEVEL_BY_ID[roomId]
      const room = this.ensureRoom(roomId)
      const reward = roundReward(level, {
        firstClear: !room.firstClear,
        firstTryCorrect: r.answers.filter((a) => a === true).length,
        timeBonus: r.timeBonus,
      })
      // coins and the "claimed" flag are saved together in one write
      this.data.coins += reward.total
      room.firstClear = true
      room.wordSearch = true
      room.challenge = true
      for (const w of level.words) if (!this.data.learned.includes(w.word)) this.data.learned.push(w.word)
      r.claimed = true
      r.reward = { ...reward, roomId }
      this.data.claimedRounds = [...this.data.claimedRounds, r.id].slice(-40)
      this.data.stats.roundsPlayed++
      this.persist()
      return r.reward
    },

    // ---------------- shop ----------------
    buyState(itemId) {
      return canBuy(itemId, {
        coins: this.data.coins,
        owned: this.data.owned,
        isRoomUnlocked: (id) => this.isUnlocked(id),
        isRoomCompleted: (id) => this.isCompleted(id),
      })
    },
    buy(itemId) {
      const check = this.buyState(itemId)
      if (!check.ok) {
        this.toast(check.reason, 'warn')
        this.sound('wrong')
        return false
      }
      const item = ITEM_BY_ID[itemId]
      this.data.coins -= item.price
      this.data.owned.push(itemId)
      this.persist()
      this.sound('buy')
      this.celebrate('coins')
      this.toast(`You bought ${article(item.name)} ${item.name.toLowerCase()}!`, 'good')
      return true
    },

    // ---------------- placement ----------------
    place(itemId, room, cell) {
      const item = ITEM_BY_ID[itemId]
      if (!item || !this.data.owned.includes(itemId)) return { ok: false, reason: 'You do not own this item.' }
      if (!this.isUnlocked(room)) return { ok: false, reason: 'This room is locked.' }
      const current = this.data.placements[itemId]
      const rot = current && !current.parent ? current.rot : 0
      // placements without this item (so it does not block itself)
      const others = { ...this.data.placements }
      delete others[itemId]
      const res = resolveDrop(itemId, room, cell, rot, others)
      if (!res.ok) return res
      this.data.placements[itemId] = res.placement
      this.persist()
      this.sound('place')
      return res
    },
    rotate(itemId) {
      const item = ITEM_BY_ID[itemId]
      const p = this.data.placements[itemId]
      if (!p || !item.rotatable || p.parent) return { ok: false, reason: 'This item cannot be rotated.' }
      const rot = (p.rot + 90) % 360
      const others = { ...this.data.placements }
      delete others[itemId]
      const check = canPlaceOnFloor(itemId, p.room, p.x, p.y, rot, others)
      if (!check.ok) return { ok: false, reason: 'There is no space to rotate it here.' }
      p.rot = rot
      this.persist()
      this.sound('place')
      return { ok: true }
    },
    /** Put an item back into the inventory. Items on top of it come back too. */
    storeItem(itemId) {
      const back = [itemId, ...childrenOf(itemId, this.data.placements)]
      for (const id of back) delete this.data.placements[id]
      this.persist()
      this.sound('click')
      return back
    },
    checkPlacement(roomId) {
      const level = LEVEL_BY_ID[roomId]
      const result = checkRoom(level, this.data.placements)
      // The room quest also needs the Word Search and Language Challenge.
      result.lessonsDone = this.roomState(roomId).challenge
      if (!result.lessonsDone) result.passed = false
      let newlyCompleted = false
      let unlocked = null
      if (result.passed && !this.isCompleted(roomId)) {
        this.ensureRoom(roomId).completed = true
        newlyCompleted = true
        const next = LEVELS[level.level]
        if (next) unlocked = next.id
        else this.data.gameCompleted = true
        this.persist()
      }
      return { ...result, newlyCompleted, unlocked }
    },
  },
})
