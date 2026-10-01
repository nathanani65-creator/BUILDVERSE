# BUILDVERSE — Find Words, Build Your World

**BUILDVERSE** is a web game for learning English. The player moves into an empty block-style house, finds hidden words, completes language challenges, earns coins, buys furniture and decorates five rooms by following English instructions.

## Target players
Beginner learners of English (CEFR **A1–A2**), e.g. Thai students who are starting English. The screens, buttons and feedback are in English, and **Thai help** can be turned on or off.

## Language goals
- Connect English words with pictures and meanings (43 home words in 5 rooms)
- Read and spell words for things in the home
- Understand sentences about how things are used ("You boil water in this.")
- Put words in order to make simple sentences
- Follow English instructions ("Put the lamp on the desk.")
- Understand the position words **on, under, next to, between**

## How to play / Core loop
**Choose a room → read the clues → find the words → do 3 language challenges → get coins → buy furniture → place it by following the instruction → unlock the next room**

| Level | Room | Words | Grid | Directions | First-clear reward |
|---|---|---|---|---|---|
| 1 | Bedroom | 5 | 8×8 | → ↓ | 200 |
| 2 | Living Room | 7 | 10×10 | + diagonals ↘ ↗ | 250 |
| 3 | Kitchen | 9 | 12×12 | + backwards ← ↑ | 300 |
| 4 | Bathroom | 10 | 12×12 | all 8 directions | 350 |
| 5 | Garden | 12 | 14×14 | all 8 directions | 400 |

- **Practice Mode** (default): no timer, free hints. **Challenge Mode**: timer (180–420 s) and +20 coins if you finish in time. When time runs out you can continue in Practice Mode or retry.
- **Hint**: 1st press shows the word, 2nd press flashes its first letter. Hints are free.
- **Language Challenge**: 3 questions per level (read & choose, sentence order, position word). +5 coins for each first-try answer. After 2 wrong answers you get an extra hint. After 3 wrong answers you see the explanation, then choose the right answer to continue.
- **Replay** a cleared level for 50 coins + bonuses, then buy extra decorations.

## Install, run and build
You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install        # install once
npm run dev        # play at http://localhost:5173
npm run build      # make the website in the dist/ folder
npm run preview    # test the built website
npm run verify     # run the automatic game checks (674 checks)
```

## Where to change content
| What | File |
|---|---|
| Words, clues, Thai meanings, example sentences, grid size, directions, rewards, timers, language challenges, placement rules | `src/data/levels.js` |
| Furniture, prices, required items, sizes, what can go on what | `src/data/furniture.js` |
| Pixel art (and how to swap in real PNG images) | `src/data/sprites.js` → `IMAGE_OVERRIDES` |
| Replay reward, language bonus, time bonus | `ECONOMY` in `src/data/levels.js` |
| Background music (melody, chords, speed) and sound effects | `src/logic/audio.js` |

Code structure: `src/screens/` (game screens), `src/components/` (word grid, clue card, room view…), `src/logic/` (grid generator, word checking, coins, placement rules, saving, sound), `src/stores/game.js` (Pinia game state).

## Tools used
Vue 3, Vite, Pinia, JavaScript, CSS, localStorage, Web Audio API (background music and sound effects made in code), Web Speech API (pronunciation), Google Fonts (Nunito, Press Start 2P, Sarabun). All pixel art, music and sound effects are made in code — no outside image, music or sound files. Music and sound effects can be turned on/off separately (🎵 / 🔊 buttons in the bottom-right corner, or Settings).

## AI tools used
> Group: keep only what is true, and describe what **you** checked or changed.

| AI tool | What it helped with | What the group checked / did itself |
|---|---|---|
| Claude Code (Anthropic) | First version of the game code, level text (clues, example sentences, challenges) and these documents | _(fill in)_ |
| _(add any other AI tool you really used)_ | | |

No AI is called while the game is running.

## Team
See [`docs/TEAM.md`](docs/TEAM.md). Demo script: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md). Playtesting form: [`docs/PLAYTEST_LOG.md`](docs/PLAYTEST_LOG.md).
