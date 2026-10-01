// ---------------------------------------------------------------------------
// COINS & SHOP RULES — pure functions used by the game store and the tests.
// ---------------------------------------------------------------------------
import { ECONOMY } from '../data/levels.js'
import { ITEM_BY_ID } from '../data/furniture.js'

/**
 * Coins for one finished round (Word Search + Language Challenge).
 *   firstClear      – true when this level has never been cleared before
 *   firstTryCorrect – challenges answered correctly on the first try (0–3)
 *   timeBonus       – true when Challenge Mode was finished in time
 */
export function roundReward(level, { firstClear, firstTryCorrect, timeBonus }) {
  const base = firstClear ? level.reward : ECONOMY.replayReward
  const language = Math.min(3, Math.max(0, firstTryCorrect)) * ECONOMY.languageBonusPerQuestion
  const time = timeBonus ? ECONOMY.timeBonus : 0
  return { base, language, time, total: base + language + time, firstClear }
}

/**
 * Can the player buy this item right now?
 * Returns { ok: true } or { ok: false, state, reason } where state is
 * 'owned' | 'locked' | 'coins'.
 */
export function canBuy(itemId, { coins, owned, isRoomUnlocked, isRoomCompleted }) {
  const item = ITEM_BY_ID[itemId]
  if (!item) return { ok: false, state: 'locked', reason: 'Unknown item.' }
  if (owned.includes(itemId)) return { ok: false, state: 'owned', reason: 'You already have this.' }
  if (!isRoomUnlocked(item.room)) return { ok: false, state: 'locked', reason: 'Unlock this room first.' }
  if (!item.required && !isRoomCompleted(item.room)) {
    return { ok: false, state: 'locked', reason: "Finish this room's quest to unlock extra decorations." }
  }
  if (!Number.isFinite(coins) || coins < item.price) {
    return { ok: false, state: 'coins', reason: `You need ${item.price - coins} more coins.` }
  }
  return { ok: true }
}
