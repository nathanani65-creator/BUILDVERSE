// ---------------------------------------------------------------------------
// LEARNING GOALS — what BUILDVERSE teaches, for whom, and where in the game.
// Shown on the "Learning Goals" screen, in each level intro and on the
// Quest Complete screen. Edit here; no game logic needs to change.
// ---------------------------------------------------------------------------

export const LANGUAGE_FOCUS = {
  // One sentence that says exactly what the game teaches.
  headline: 'Learn the names of things in the home and the position words ON, UNDER, NEXT TO and BETWEEN.',
  headlineThai: 'เรียนคำศัพท์สิ่งของในบ้าน และคำบอกตำแหน่ง on, under, next to, between',
  learners: 'Lower-secondary students (Grade 7–9 / ม.ต้น) and adult beginners',
  learnersThai: 'นักเรียน ม.ต้น และผู้เริ่มต้นเรียนภาษาอังกฤษ',
  level: 'CEFR A1–A2 (beginner)',
  topic: 'My Home — rooms, furniture and everyday objects',
}

// The 4 skills, in order of importance. `where` = the part of the game that practises it.
export const SKILLS = [
  {
    id: 'vocab',
    icon: '📦',
    name: 'Home Vocabulary',
    thai: 'คำศัพท์สิ่งของในบ้าน',
    desc: '75 words for things in 5 rooms (15 per room): bedroom, living room, kitchen, bathroom and garden. Each round picks new words.',
    example: 'bed, sofa, fridge, towel, fountain',
    where: 'Find Words (Word Search) · Review Words',
  },
  {
    id: 'position',
    icon: '📍',
    name: 'Prepositions of Place',
    thai: 'คำบอกตำแหน่ง',
    desc: 'Say and understand where things are: on, under, next to, between.',
    example: 'The lamp is on the desk.',
    where: 'Place Items (Decorating Quest)',
  },
  {
    id: 'reading',
    icon: '📖',
    name: 'Reading & Following Instructions',
    thai: 'อ่านเข้าใจและทำตามคำสั่ง',
    desc: 'Read short English clues and instructions, then act on them.',
    example: '"You boil water in this." → KETTLE  ·  "Put the rug under the table."',
    where: 'Word Search clues · Decorating Quest instructions',
  },
]

// What each level teaches. `canDo` = what the player can do after the level.
export const LEVEL_GOALS = {
  bedroom: {
    position: 'on',
    pattern: 'Put the ___ on the ___.',
    canDo: ['I can name things in a bedroom.', 'I can use "on" to say where something is.', 'I can follow the instruction "Put the lamp on the desk."'],
  },
  living: {
    position: 'under',
    pattern: 'Put the ___ under the ___.',
    canDo: ['I can name things in a living room.', 'I can use "under" to say where something is.', 'I can read clues about how we use things.'],
  },
  kitchen: {
    position: 'next to',
    pattern: 'Put the ___ next to the ___.',
    canDo: ['I can name things in a kitchen.', 'I can use "next to" to say where something is.', 'I can find words in longer word lists.'],
  },
  bathroom: {
    position: 'on · next to',
    pattern: 'Put the ___ on / next to the ___.',
    canDo: ['I can name things in a bathroom.', 'I can choose between "on" and "next to".', 'I can understand English clues without pictures.'],
  },
  garden: {
    position: 'between',
    pattern: 'Put the ___ between the ___ and the ___.',
    canDo: ['I can name things in a garden.', 'I can use "between" with two things.', 'I can use all four position words: on, under, next to, between.'],
  },
}

// How each part of the game helps learning (shown on the Learning Goals screen).
export const LEARNING_DESIGN = [
  { part: '1. Find Words', how: 'Picture + English clue → the player connects each word with its meaning, then finds and drags it in the grid (reading and spelling). Each found word shows its Thai meaning, an example sentence and its sound.' },
  { part: '2. Place Items', how: 'The player reads an English instruction (e.g. "Put the mirror next to the shower.") and drags the item to the right place — meaningful practice of position words, not a quiz.' },
  { part: 'Connected', how: 'The instructions use words from the same Word Search, so the player meets each word twice in one round.' },
  { part: 'Feedback', how: 'Every answer says correct or not, and WHY (the meaning of the position word) with a hint. Hints never cost coins.' },
  { part: 'Replay', how: 'Every round picks new words and new instructions. Easy → Normal → Hard adds more words, bigger grids, diagonal and backwards words, and more instructions.' },
  { part: '3. Rewards', how: 'Coins (50 / 70 / 100 by difficulty) buy decorations for My House, so players want to keep practising.' },
]
