// ---------------------------------------------------------------------------
// WORD SEARCH GRID GENERATOR
// 1. Place every target word first (longest words first).
// 2. Words may cross only where the letters are the same.
// 3. Save the start and end square of every word.
// 4. Fill the empty squares with random letters.
// 5. Check that every word is really in the grid.
// If random placement fails many times, a simple backup grid is used
// (one word per row, reading left to right), which always works because
// every level has fewer words than rows and no word is longer than the grid.
// ---------------------------------------------------------------------------

export const DIRS = {
  E: [1, 0], S: [0, 1], SE: [1, 1], NE: [1, -1],
  W: [-1, 0], N: [0, -1], NW: [-1, -1], SW: [-1, 1],
}
export const BACKWARD_DIRS = ['W', 'N', 'NW', 'SW']

const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUWY' // common letters; no Q/X/Z/V/K to reduce look-alike noise

function randInt(n, rng) {
  return Math.floor(rng() * n)
}

function canPut(grid, word, x, y, [dx, dy]) {
  const size = grid.length
  for (let i = 0; i < word.length; i++) {
    const cx = x + dx * i
    const cy = y + dy * i
    if (cx < 0 || cy < 0 || cx >= size || cy >= size) return false
    const cur = grid[cy][cx]
    if (cur !== '' && cur !== word[i]) return false
  }
  return true
}

function put(grid, word, x, y, [dx, dy]) {
  for (let i = 0; i < word.length; i++) grid[y + dy * i][x + dx * i] = word[i]
}

function emptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(''))
}

function fill(grid, rng) {
  for (const row of grid) for (let x = 0; x < row.length; x++) if (row[x] === '') row[x] = ALPHABET[randInt(ALPHABET.length, rng)]
}

function tryRandom(words, size, directions, rng) {
  const grid = emptyGrid(size)
  const placements = []
  const sorted = [...words].sort((a, b) => b.length - a.length)
  const backward = directions.filter((d) => BACKWARD_DIRS.includes(d))
  const forward = directions.filter((d) => !BACKWARD_DIRS.includes(d))
  // When backward words are allowed, make sure at least two words really are backwards.
  let backwardNeeded = backward.length ? 2 : 0

  for (const word of sorted) {
    let placed = false
    for (let tries = 0; tries < 300 && !placed; tries++) {
      const pool = backwardNeeded > 0 && tries < 150 ? backward : (tries % 3 === 0 && forward.length ? forward : directions)
      const dirName = pool[randInt(pool.length, rng)]
      const dir = DIRS[dirName]
      const x = randInt(size, rng)
      const y = randInt(size, rng)
      if (canPut(grid, word, x, y, dir)) {
        put(grid, word, x, y, dir)
        placements.push({
          word,
          dir: dirName,
          start: { x, y },
          end: { x: x + dir[0] * (word.length - 1), y: y + dir[1] * (word.length - 1) },
        })
        if (BACKWARD_DIRS.includes(dirName)) backwardNeeded--
        placed = true
      }
    }
    if (!placed) return null
  }
  return { grid, placements }
}

export function backupGrid(words, size, rng = Math.random) {
  const grid = emptyGrid(size)
  const placements = words.map((word, i) => {
    const x = randInt(size - word.length + 1, rng)
    put(grid, word, x, i, DIRS.E)
    return { word, dir: 'E', start: { x, y: i }, end: { x: x + word.length - 1, y: i } }
  })
  fill(grid, rng)
  return { grid, placements, backup: true }
}

export function verifyGrid(grid, placements, words) {
  if (placements.length !== words.length) return false
  return words.every((word) => {
    const p = placements.find((pl) => pl.word === word)
    if (!p) return false
    const [dx, dy] = DIRS[p.dir]
    for (let i = 0; i < word.length; i++) {
      const row = grid[p.start.y + dy * i]
      if (!row || row[p.start.x + dx * i] !== word[i]) return false
    }
    return true
  })
}

export function generateGrid(words, size, directions, rng = Math.random) {
  if (words.some((w) => w.length > size) || words.length > size) {
    throw new Error('Grid is too small for these words')
  }
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = tryRandom(words, size, directions, rng)
    if (result) {
      fill(result.grid, rng)
      if (verifyGrid(result.grid, result.placements, words)) return { ...result, backup: false }
    }
  }
  const backup = backupGrid(words, size, rng)
  if (!verifyGrid(backup.grid, backup.placements, words)) throw new Error('Backup grid failed')
  return backup
}
