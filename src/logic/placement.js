// ---------------------------------------------------------------------------
// FURNITURE PLACEMENT — pure functions (no Vue), easy to test.
//
// A placement looks like:
//   { room: 'bedroom', x: 2, y: 1, rot: 0, parent: null }
// `parent` is the id of the item this item stands ON (e.g. lamp on desk).
// Child items do not use squares of their own; they move with their parent.
// ---------------------------------------------------------------------------
import { ITEM_BY_ID, ROOM_COLS, ROOM_ROWS } from '../data/furniture.js'

export function footprint(itemId, rot = 0) {
  const [w, h] = ITEM_BY_ID[itemId].size
  return rot % 180 === 0 ? [w, h] : [h, w]
}

export function cellsOf(itemId, p) {
  const [w, h] = footprint(itemId, p.rot)
  const cells = []
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) cells.push({ x: p.x + dx, y: p.y + dy })
  return cells
}

/** Squares used by an item. A child item uses its parent's squares. */
export function occupiedCells(itemId, placements) {
  const p = placements[itemId]
  if (!p) return []
  if (p.parent) return occupiedCells(p.parent, placements)
  return cellsOf(itemId, p)
}

export function childrenOf(itemId, placements) {
  return Object.keys(placements).filter((id) => placements[id].parent === itemId)
}

const same = (a, b) => a.x === b.x && a.y === b.y

/** Items standing on the floor (not on another item) in a room. */
export function floorItemsIn(room, placements) {
  return Object.keys(placements).filter((id) => placements[id].room === room && !placements[id].parent)
}

/** Which (non-child) item is at a square? Prefers objects over flat floor items. */
export function itemAt(room, cell, placements, ignore = []) {
  let floorHit = null
  for (const id of floorItemsIn(room, placements)) {
    if (ignore.includes(id)) continue
    if (cellsOf(id, placements[id]).some((c) => same(c, cell))) {
      if (ITEM_BY_ID[id].layer === 'floor') floorHit = floorHit || id
      else return id
    }
  }
  return floorHit
}

function overlapAllowed(a, b) {
  const A = ITEM_BY_ID[a]
  const B = ITEM_BY_ID[b]
  if (A.layer === 'floor' && (A.allowsOver || []).includes(b)) return true
  if (B.layer === 'floor' && (B.allowsOver || []).includes(a)) return true
  return false
}

/**
 * Can `itemId` stand on the floor at (x, y) with rotation `rot`?
 * Returns { ok: true } or { ok: false, reason }.
 */
export function canPlaceOnFloor(itemId, room, x, y, rot, placements) {
  const item = ITEM_BY_ID[itemId]
  if (!item) return { ok: false, reason: 'Unknown item.' }
  if (item.room !== room) return { ok: false, reason: `The ${item.name.toLowerCase()} belongs in another room.` }
  const cells = cellsOf(itemId, { x, y, rot })
  if (cells.some((c) => c.x < 0 || c.y < 0 || c.x >= ROOM_COLS || c.y >= ROOM_ROWS)) {
    return { ok: false, reason: 'It does not fit there. Keep it inside the room.' }
  }
  for (const other of floorItemsIn(room, placements)) {
    if (other === itemId) continue
    const hit = cellsOf(other, placements[other]).some((oc) => cells.some((c) => same(c, oc)))
    if (hit && !overlapAllowed(itemId, other)) {
      return { ok: false, reason: `That space is taken by the ${ITEM_BY_ID[other].name.toLowerCase()}.` }
    }
  }
  return { ok: true }
}

/** Can a small item be put ON the target item? */
export function canPlaceOnTop(itemId, targetId, placements) {
  const item = ITEM_BY_ID[itemId]
  const target = ITEM_BY_ID[targetId]
  if (!target || !(target.accepts || []).includes(itemId)) {
    return { ok: false, reason: `You cannot put the ${item.name.toLowerCase()} on the ${target ? target.name.toLowerCase() : 'item'}.` }
  }
  const others = childrenOf(targetId, placements).filter((id) => id !== itemId)
  if (others.length) return { ok: false, reason: `There is already a ${ITEM_BY_ID[others[0]].name.toLowerCase()} on the ${target.name.toLowerCase()}.` }
  return { ok: true }
}

/**
 * Decide what happens when an item is dropped on a square.
 * Returns { ok, placement } or { ok: false, reason }.
 */
export function resolveDrop(itemId, room, cell, rot, placements) {
  const item = ITEM_BY_ID[itemId]
  // 1. Small items dropped onto an item that accepts them -> put on top
  if (item.layer === 'small') {
    const target = itemAt(room, cell, placements, [itemId])
    if (target && ITEM_BY_ID[target].layer !== 'floor') {
      const check = canPlaceOnTop(itemId, target, placements)
      if (!check.ok) return check
      return { ok: true, placement: { room, x: 0, y: 0, rot: 0, parent: target } }
    }
  }
  // 2. Otherwise stand on the floor; the dropped square is the top-left square
  const check = canPlaceOnFloor(itemId, room, cell.x, cell.y, rot, placements)
  if (!check.ok) return check
  return { ok: true, placement: { room, x: cell.x, y: cell.y, rot, parent: null } }
}
