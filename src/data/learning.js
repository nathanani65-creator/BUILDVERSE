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
    desc: '43 words for things in 5 rooms: bedroom, living room, kitchen, bathroom and garden.',
    example: 'bed, sofa, fridge, towel, fountain',
    where: 'Word Search · Clue cards · Review Words',
  },
  {
    id: 'position',
    icon: '📍',
    name: 'Prepositions of Place',
    thai: 'คำบอกตำแหน่ง',
    desc: 'Say and understand where things are: on, under, next to, between.',
    example: 'The lamp is on the desk.',
    where: 'Language Challenge (picture questions) · Decorating quests',
  },
  {
    id: 'reading',
    icon: '📖',
    name: 'Reading & Following Instructions',
    thai: 'อ่านเข้าใจและทำตามคำสั่ง',
    desc: 'Read short English clues and instructions, then act on them.',
    example: '"You boil water in this." → KETTLE  ·  "Put the rug under the table."',
    where: 'Clue cards · "Read and choose" questions · Decorating quests',
  },
  {
    id: 'sentence',
    icon: '🧩',
    name: 'Building Simple Sentences',
    thai: 'เรียงคำเป็นประโยค',
    desc: 'Put words in the right order to make simple present sentences.',
    example: 'The / lamp / is / on / the / desk.',
    where: 'Language Challenge ("Make a sentence")',
  },
]

// What each level teaches. `canDo` = what the player can do after the level.
export const LEVEL_GOALS = {
  bedroom: {
    position: 'on',
    pattern: 'The ___ is on the ___.',
    canDo: ['I can name 5 things in a bedroom.', 'I can use "on" to say where something is.', 'I can follow the instruction "Put the lamp on the desk."'],
  },
  living: {
    position: 'under',
    pattern: 'The ___ is under the ___.',
    canDo: ['I can name 7 things in a living room.', 'I can use "under" to say where something is.', 'I can read clues about how we use things.'],
  },
  kitchen: {
    position: 'next to',
    pattern: 'The ___ is next to the ___.',
    canDo: ['I can name 9 things in a kitchen.', 'I can use "next to" to say where something is.', 'I can find words written backwards.'],
  },
  bathroom: {
    position: 'between',
    pattern: 'The ___ is between the ___ and the ___.',
    canDo: ['I can name 10 things in a bathroom.', 'I can use "between" and "next to".', 'I can understand English clues without pictures.'],
  },
  garden: {
    position: 'between',
    pattern: 'The ___ is between the ___ and the ___.',
    canDo: ['I can name 12 things in a garden.', 'I can follow a two-part position instruction.', 'I can use all four position words: on, under, next to, between.'],
  },
}

// How each part of the game helps learning (shown on the Learning Goals screen).
export const LEARNING_DESIGN = [
  { part: 'Clue cards', how: 'Picture + English clue → the player connects the word with its meaning (not just its spelling).' },
  { part: 'Word Search', how: 'Finding and dragging the letters practises reading and spelling. Each found word shows its meaning, an example sentence and its sound.' },
  { part: 'Language Challenge', how: 'Uses the new words in context: read a sentence and choose, put words in order, choose a position word from a picture.' },
  { part: 'Decorating quest', how: 'The player must understand an English instruction (e.g. "Put the mirror next to the shower.") and do it — meaningful practice, not a quiz.' },
  { part: 'Feedback', how: 'Every answer says correct or not, and WHY, with a hint. After 3 tries the game explains the answer.' },
  { part: 'Coins & rooms', how: 'Rewards and new rooms keep the player practising. Replaying gives more coins and more practice.' },
]
