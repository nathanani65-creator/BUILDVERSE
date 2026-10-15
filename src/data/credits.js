// ---------------------------------------------------------------------------
// TOOLS & AI DISCLOSURE — shown in the game (Credits → Tools & AI).
// GROUP: keep only what is TRUE. Fill in `groupDid` with what your group
// checked, changed or made yourselves. Add any other AI tools you really used.
// ---------------------------------------------------------------------------

export const AI_USE = [
  {
    tool: 'Claude Code (Anthropic)',
    used: [
      'Wrote the first version of the game code (Vue 3)',
      'Drafted the word clues, example sentences and language challenges',
      'Made the pixel art and background music in code',
      'Drafted the README, demo script and playtest form',
    ],
    groupDid: [
      // e.g. 'Checked every clue and sentence for correct English',
      // e.g. 'Chose the topic, the 5 rooms and the word list',
    ],
  },
  // { tool: 'Other AI tool name', used: ['...'], groupDid: ['...'] },
]

// What the group made or decided themselves (no AI). Fill in.
export const GROUP_WORK = [
  // e.g. 'Game idea and learning goals',
  // e.g. 'Playtesting with 5 students and fixing the problems found',
]

export const NO_AI_DURING_PLAY = 'The game does not use AI while you play. All words, clues and sentences are saved in the game files.'

export const TOOLS = [
  ['Vue 3', 'User interface framework'],
  ['Vite', 'Development server and build tool'],
  ['Pinia', 'Game state management'],
  ['JavaScript + CSS', 'Game logic, layout and animations'],
  ['localStorage', 'Saving the game in the browser'],
  ['Web Audio API', 'Background music and sound effects (made in code, no sound files)'],
  ['Web Speech API', 'Word pronunciation with the voice of the browser'],
  ['Google Fonts', 'Nunito, Press Start 2P, Sarabun (SIL Open Font License)'],
  ['GitHub / Netlify', 'Code hosting and the public game link'],
]
