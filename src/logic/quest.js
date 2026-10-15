// ---------------------------------------------------------------------------
// DECORATING QUEST SCENE — pure functions (no Vue).
//
// A scene is a row of 6 columns on the floor. Some columns hold things
// (the target and one extra thing). Dashed drop spaces ("slots") are:
//   floor  – an empty column
//   on     – on top of a thing with a surface (only for small items)
//   under  – under a thing that has space below (small or flat items)
// The player drops the item into one slot; checkStep() looks at the slot.
// ---------------------------------------------------------------------------
import { QUEST_THINGS } from '../data/levels.js'

export const COLS = 6

/**
 * Lay out one instruction.
 * @param quest  an entry of QUESTS[room]
 * @param flip   true = mirror the layout (so the answer is not always in the same place)
 */
export function buildScene(quest, flip = false) {
  const props = []
  if (quest.rel === 'between') {
    const [a, b] = quest.target
    const extra = quest.extra[0]
    // A _ B _ X   (or mirrored X _ A _ B) — the middle space is the answer
    if (!flip) props.push({ id: a, col: 1 }, { id: b, col: 3 }, { id: extra, col: 5 })
    else props.push({ id: extra, col: 0 }, { id: a, col: 2 }, { id: b, col: 4 })
  } else {
    const t = flip ? 4 : 1
    props.push({ id: quest.target, col: t })
    if (quest.extra[0]) props.push({ id: quest.extra[0], col: flip ? 1 : 4 })
  }
  const item = QUEST_THINGS[quest.item]
  const slots = []
  for (let col = 0; col < COLS; col++) {
    const p = props.find((x) => x.col === col)
    if (!p) {
      slots.push({ id: `floor-${col}`, type: 'floor', col })
      continue
    }
    const thing = QUEST_THINGS[p.id]
    if (thing.surface && item.kind === 'small') slots.push({ id: `on-${col}`, type: 'on', col, prop: p.id })
    if (thing.under && (item.kind === 'small' || item.kind === 'flat')) slots.push({ id: `under-${col}`, type: 'under', col, prop: p.id })
  }
  return { props, slots, item: quest.item }
}

function propAt(scene, col) {
  return scene.props.find((p) => p.col === col)?.id || null
}

/** Is the item in this slot correct for the instruction? */
export function checkStep(quest, scene, slotId) {
  const slot = scene.slots.find((s) => s.id === slotId)
  if (!slot) return false
  switch (quest.rel) {
    case 'on':
      return slot.type === 'on' && slot.prop === quest.target
    case 'under':
      return slot.type === 'under' && slot.prop === quest.target
    case 'nextTo': {
      if (slot.type !== 'floor') return false
      const t = scene.props.find((p) => p.id === quest.target).col
      return Math.abs(slot.col - t) === 1
    }
    case 'between': {
      if (slot.type !== 'floor') return false
      const sides = [propAt(scene, slot.col - 1), propAt(scene, slot.col + 1)].sort()
      return sides.join() === [...quest.target].sort().join()
    }
    default:
      return false
  }
}

/** The ids of all correct slots (used for the 2nd hint and for tests). */
export function correctSlots(quest, scene) {
  return scene.slots.filter((s) => checkStep(quest, scene, s.id)).map((s) => s.id)
}

/** Short hint that explains where to look (no coins are taken). */
export function questHint(quest) {
  const name = (id) => QUEST_THINGS[id].name
  const item = name(quest.item)
  switch (quest.rel) {
    case 'on':
      return `Find the ${name(quest.target)}. Put the ${item} in the dashed space on top of it.`
    case 'under':
      return `Find the ${name(quest.target)}. Put the ${item} in the dashed space below it.`
    case 'nextTo':
      return `Find the ${name(quest.target)}. Put the ${item} in an empty space right beside it.`
    case 'between':
      return `Find the ${name(quest.target[0])} and the ${name(quest.target[1])}. Put the ${item} in the space in the middle of them.`
    default:
      return ''
  }
}
