// ---------------------------------------------------------------------------
// COINS & SHOP RULES — pure functions used by the game store and the tests.
// ---------------------------------------------------------------------------
import { DIFFICULTY, ECONOMY } from '../data/levels.js'
import { ITEM_BY_ID } from '../data/furniture.js'

/**
 * Coins for one finished round (Word Search + Decorating Quest).
 *   difficulty – 'easy' | 'normal' | 'hard'  → 50 / 70 / 100
 *   timeBonus  – Challenge Mode finished in time → +20
 *   firstClear – first time this room is cleared → +100 (once per room)
 */
export function roundReward(difficulty, { timeBonus = false, firstClear = false } = {}) {
  const base = DIFFICULTY[difficulty].reward
  const time = timeBonus ? ECONOMY.timeBonus : 0
  const unlock = firstClear ? ECONOMY.unlockBonus : 0
  return { base, time, unlock, total: base + time + unlock }
}

/**
 * Can the player buy this item right now?
 * Returns { ok: true } or { ok: false, state, reason } — state: 'owned' | 'locked' | 'coins'
 */
export function canBuy(itemId, { coins, owned, isRoomUnlocked }) {
  const item = ITEM_BY_ID[itemId]
  if (!item) return { ok: false, state: 'locked', reason: 'Unknown item.' }
  if (owned.includes(itemId)) return { ok: false, state: 'owned', reason: 'You already have this.' }
  if (!isRoomUnlocked(item.room)) return { ok: false, state: 'locked', reason: 'Unlock this room to buy it.' }
  if (!Number.isFinite(coins) || coins < item.price) {
    return { ok: false, state: 'coins', reason: `You need ${item.price - coins} more coins.` }
  }
  return { ok: true }
}
