// ---------------------------------------------------------------------------
// WORD SELECTION — turns a drag (start square → current square) into a straight
// line of squares and checks whether it spells a target word.
// ---------------------------------------------------------------------------
import { DIRS } from './gridGenerator.js'

const DIR_BY_STEP = Object.fromEntries(Object.entries(DIRS).map(([name, [dx, dy]]) => [`${dx},${dy}`, name]))

/** Snap any pointer position to the nearest of the 8 straight directions. */
export function snapLine(start, current, size) {
  const dx = current.x - start.x
  const dy = current.y - start.y
  if (dx === 0 && dy === 0) return [{ ...start }]
  const angle = Math.atan2(dy, dx)
  const octant = Math.round(angle / (Math.PI / 4))
  const sx = Math.round(Math.cos(octant * (Math.PI / 4)))
  const sy = Math.round(Math.sin(octant * (Math.PI / 4)))
  let len = Math.max(Math.abs(dx), Math.abs(dy))
  // keep the line inside the grid
  while (len > 0) {
    const ex = start.x + sx * len
    const ey = start.y + sy * len
    if (ex >= 0 && ey >= 0 && ex < size && ey < size) break
    len--
  }
  const cells = []
  for (let i = 0; i <= len; i++) cells.push({ x: start.x + sx * i, y: start.y + sy * i })
  return cells
}

export function directionOf(cells) {
  if (cells.length < 2) return null
  const dx = Math.sign(cells[1].x - cells[0].x)
  const dy = Math.sign(cells[1].y - cells[0].y)
  return DIR_BY_STEP[`${dx},${dy}`] || null
}

const OPPOSITE = { E: 'W', W: 'E', N: 'S', S: 'N', NE: 'SW', SW: 'NE', NW: 'SE', SE: 'NW' }

/**
 * Check a selection.
 * Returns { result: 'found' | 'already' | 'direction' | 'wrong' | 'short', word, cells }
 * A word is accepted when the letters spell it AND the reading direction is
 * allowed in this level. Dragging from the last letter to the first letter is
 * also accepted (friendly for beginners).
 */
export function checkSelection(cells, grid, levelWords, foundWords, allowedDirs) {
  if (cells.length < 2) return { result: 'short' }
  const letters = cells.map((c) => grid[c.y][c.x]).join('')
  const reversed = [...letters].reverse().join('')
  const dir = directionOf(cells)
  const candidates = [
    { text: letters, readDir: dir },
    { text: reversed, readDir: OPPOSITE[dir] },
  ]
  for (const cand of candidates) {
    if (!levelWords.includes(cand.text)) continue
    if (!allowedDirs.includes(cand.readDir)) return { result: 'direction', word: cand.text }
    if (foundWords.includes(cand.text)) return { result: 'already', word: cand.text }
    return { result: 'found', word: cand.text, cells }
  }
  return { result: 'wrong' }
}
