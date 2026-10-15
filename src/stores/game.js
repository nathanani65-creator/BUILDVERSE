// ---------------------------------------------------------------------------
// GAME STORE (Pinia) — all game state lives here.
//
// One ROUND = 1. Find Words (Word Search) → 2. Place Items (Decorating Quest)
//             → 3. Rewards.
// Every important change (coins, rewards, purchases, My House, unlocks) calls
// persist() straight away, so a refresh never loses progress and never pays a
// reward twice.
// ---------------------------------------------------------------------------
import { defineStore } from 'pinia'
import { LEVELS, LEVEL_BY_ID, DIFFICULTY } from '../data/levels.js'
import { ITEM_BY_ID } from '../data/furniture.js'
import { loadGame, saveGame, saveSettings, clearGame, newSaveData, defaultSettings } from '../logic/save.js'
import { roundReward, canBuy } from '../logic/economy.js'
import { buildRound, wordSetKey } from '../logic/round.js'
import { resolveDrop, canPlaceOnFloor, childrenOf } from '../logic/placement.js'
import { playSound, setAudioSettings, speak } from '../logic/audio.js'

let toastId = 0

function article(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
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
    roomState: (state) => (id) => state.data.rooms[id] || { cleared: false, bonusClaimed: false, plays: 0 },
    isCleared() {
      return (id) => this.roomState(id).cleared
    },
    /** A room is open when it is the first room or the room before it is cleared. */
    isUnlocked() {
      return (id) => {
        const i = LEVELS.findIndex((l) => l.id === id)
        if (i <= 0) return i === 0
        return this.isCleared(LEVELS[i - 1].id)
      }
    },
    clearedCount() {
      return LEVELS.filter((l) => this.isCleared(l.id)).length
    },
    allCleared() {
      return this.clearedCount === LEVELS.length
    },
    /** Difficulty can be chosen after the room has been cleared once. */
    canChooseDifficulty() {
      return (id) => this.isCleared(id)
    },
    /** The first room that is open but not cleared yet. */
    nextRoomId() {
      return LEVELS.find((l) => this.isUnlocked(l.id) && !this.isCleared(l.id))?.id || null
    },
    /** A round that was started but not finished (e.g. after a refresh). */
    openRound() {
      const r = this.data.round
      return r && !r.claimed ? r : null
    },
    currentGoal() {
      const r = this.openRound
      if (r && r.wsDone && !r.questDone) return `Place the items in the ${LEVEL_BY_ID[r.roomId].name}.`
      if (r && r.questDone) return 'Collect your coins!'
      const next = this.nextRoomId
      if (next) {
        const i = LEVEL_BY_ID[next].level
        return LEVELS[i] ? `Play the ${LEVEL_BY_ID[next].name} to unlock the ${LEVELS[i].name}.` : `Play the ${LEVEL_BY_ID[next].name} to finish your home!`
      }
      return 'All rooms are open! Play any room for coins, or decorate your house.'
    },
    /** Words the player has met, with their room. */
    learnedWords() {
      const out = []
      for (const l of LEVELS) for (const w of l.words) if (this.data.learned.includes(w.word)) out.push({ ...w, room: l.name, roomId: l.id })
      return out
    },
    totalWords: () => LEVELS.reduce((n, l) => n + l.words.length, 0),
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
        this.persist() // writes the upgraded save format straight away
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
      if (!this.data.rooms[id]) this.data.rooms[id] = { cleared: false, bonusClaimed: false, plays: 0 }
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

    // ---------------- rounds ----------------
    /**
     * Start a new round. The first time in a room is always Easy.
     * mode: 'practice' (no timer) | 'challenge' (timer)
     */
    startRound(roomId, difficulty = 'easy', mode = 'practice') {
      if (!this.isUnlocked(roomId)) return null
      const diff = this.canChooseDifficulty(roomId) && DIFFICULTY[difficulty] ? difficulty : 'easy'
      const built = buildRound(roomId, diff, { previousKey: this.data.lastWords[roomId] || '' })
      this.data.lastWords[roomId] = wordSetKey(built.words)
      const room = this.ensureRoom(roomId)
      room.lastDiff = diff // remembered for the next time
      room.lastMode = mode === 'challenge' ? 'challenge' : 'practice'
      this.data.round = {
        id: `${roomId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        roomId,
        difficulty: diff,
        mode: mode === 'challenge' ? 'challenge' : 'practice',
        words: built.words,
        quests: built.quests,
        fellBack: false,
        wsDone: false,
        timeBonus: false,
        questDone: false,
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
    /** Retry the timer after time ran out (the time bonus is possible again). */
    retryChallenge() {
      const r = this.data.round
      if (r && !r.wsDone) {
        r.mode = 'challenge'
        r.fellBack = false
        this.persist()
      }
    },
    completeWordSearch(finishedInTime) {
      const r = this.data.round
      if (!r || r.wsDone || r.claimed) return
      r.wsDone = true
      r.timeBonus = r.mode === 'challenge' && !r.fellBack && !!finishedInTime
      this.persist()
    },
    completeQuest() {
      const r = this.data.round
      if (!r || !r.wsDone || r.questDone || r.claimed) return
      r.questDone = true
      this.persist()
    },
    /**
     * Pay the round reward ONCE (safe to call many times or after a refresh).
     * Coins, "claimed", the unlock bonus and the cleared room are saved together.
     */
    claimReward() {
      const r = this.data.round
      if (!r || !r.wsDone || !r.questDone) return null
      if (r.claimed || this.data.claimedRounds.includes(r.id)) return r.reward
      const room = this.ensureRoom(r.roomId)
      const wasAllCleared = this.allCleared
      const firstClear = !room.bonusClaimed
      const reward = roundReward(r.difficulty, { timeBonus: r.timeBonus, firstClear })
      this.data.coins += reward.total
      room.cleared = true
      room.bonusClaimed = true
      room.plays = (room.plays || 0) + 1
      for (const word of r.words) if (!this.data.learned.includes(word)) this.data.learned.push(word)
      const i = LEVEL_BY_ID[r.roomId].level
      r.claimed = true
      r.reward = {
        ...reward,
        roomId: r.roomId,
        difficulty: r.difficulty,
        unlockedRoom: firstClear && LEVELS[i] ? LEVELS[i].id : null,
        allClearedNow: !wasAllCleared && this.allCleared,
      }
      this.data.claimedRounds = [...this.data.claimedRounds, r.id].slice(-40)
      this.data.stats.roundsPlayed++
      this.persist()
      return r.reward
    },

    /** Spend coins (e.g. for a Hint). Never lets coins go below 0. */
    spendCoins(amount) {
      if (!amount) return true
      if (!Number.isFinite(amount) || amount < 0 || this.data.coins < amount) return false
      this.data.coins -= amount
      this.persist()
      return true
    },

    // ---------------- shop ----------------
    buyState(itemId) {
      return canBuy(itemId, { coins: this.data.coins, owned: this.data.owned, isRoomUnlocked: (id) => this.isUnlocked(id) })
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
      this.toast(`You bought ${article(item.name)} ${item.name.toLowerCase()}! Find it in My House.`, 'good')
      return true
    },

    // ---------------- My House (free decorating) ----------------
    place(itemId, room, cell) {
      const item = ITEM_BY_ID[itemId]
      if (!item || !this.data.owned.includes(itemId)) return { ok: false, reason: 'You do not own this item.' }
      if (!this.isUnlocked(room)) return { ok: false, reason: 'This room is locked.' }
      const current = this.data.placements[itemId]
      const rot = current && !current.parent ? current.rot : 0
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
  },
})
