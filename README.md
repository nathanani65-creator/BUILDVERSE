# BUILDVERSE — Find Words, Build Your World

> 🎯 **Language focus:** BUILDVERSE teaches **vocabulary for things in the home** and the **prepositions of place _on, under, next to, between_**, for **lower-secondary students (Grade 7–9 / ม.ต้น) and adult beginners at CEFR A1–A2**.

| ▶ **Play the game** | 📄 **Game Document (1 page)** | 👥 **Team & Contribution** |
|---|---|---|
| _(paste your Netlify link here)_ | [docs/GAME_DOCUMENT.md](docs/GAME_DOCUMENT.md) | [docs/TEAM.md](docs/TEAM.md) |

**BUILDVERSE** is a web game for learning English. In each round the player **finds hidden words**, then **reads an English instruction** such as *"Put the rug under the table."* and drags the item to the right place. Rounds give coins to decorate the player's own house. Five rooms open one by one, and every room can be replayed with new words.

## Target learners
Lower-secondary students (Grade 7–9) and adult beginners, **CEFR A1–A2**. Screens, buttons, instructions and feedback are in English. **Thai help** can be turned on or off.

## Language goals — what the game teaches
| Skill | What the player learns | Where in the game |
|---|---|---|
| 📦 **Home vocabulary** (main focus) | 75 words, 15 per room: bed, sofa, fridge, towel, fountain… | 1. Find Words, Review Words |
| 📍 **Prepositions of place** (main focus) | *on, under, next to, between* — understand where things go | 2. Place Items |
| 📖 **Reading & following instructions** | Understand clues ("You boil water in this.") and do instructions ("Put the mirror next to the shower.") | Clues and instructions |

Position word per room: Bedroom **on** · Living Room **under** · Kitchen **next to** · Bathroom **on & next to** · Garden **between**. The in-game **🎯 Learning Goals** screen explains everything (`src/data/learning.js`).

## How to play / Core loop
**Choose a room → 1. Find Words → 2. Place Items → 3. Rewards → play again, choose another room, or decorate My House**

| Level | Words | Grid | Directions | Pictures | Instructions | Coins |
|---|---|---|---|---|---|---|
| Easy | 5 | 8×8 | → ↓ | shown | 1 | 50 |
| Normal | 7 | 10×10 | + diagonal ↘ ↗ | "Show picture" button | 2 | 70 |
| Hard | 9 | 12×12 | + backwards ← ↑ ↖ ↙ | "Show picture" button, English clues first | 3 | 100 |

- **Rooms:** Bedroom → Living Room → Kitchen → Bathroom → Garden. Only the Bedroom is open at the start. Clearing a room once (both activities) opens the next room and pays a **+100** bonus (once per room). Open rooms can be replayed any time and never lock again.
- **First time in a room = Easy.** After clearing it you can choose Easy, Normal or Hard.
- **Timer is a separate choice:** Practice (no timer) or Challenge (timer for the words; finish in time for **+20**). When time runs out: continue in Practice or retry.
- **New every round:** random words from the room's 15-word bank (never the same list twice in a row), new grid positions and letters, and random instructions.
- **Find Words:** one word at a time — picture, English clue and letter count (e.g. `_ _ _ (3 letters)`). Tap another word to change it; any word you find counts. **Hints are free**: Thai meaning → first letter flashes → the word.
- **Place Items:** a practice scene with all things provided free. Drag the item to a dashed space (it snaps), or tap the item and then a space. Press **Check Placement**. Wrong: *Why* + a free hint; after 2 tries the right space glows. The instructions use words from the same Word Search.
- **My House** is separate: decorate it freely with furniture bought in the **Shop**. Quests never change it. Nothing in the Shop is needed to play.
- **After all 5 rooms:** a congratulations message, then **Play Again**, **Choose Room**, **Decorate My House**, and **🎲 Random Room**.

## Install, run and build
You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install        # install once
npm run dev        # play at http://localhost:5173
npm run build      # make the website in the dist/ folder
npm run preview    # test the built website
npm run verify     # run the automatic game checks (1,205 checks)
npm run checklist  # rebuild docs/ENGLISH_CHECKLIST.md (all English text, for proofreading)
```

## Where to change content
| What | File |
|---|---|
| Learning goals, target learners, can-do statements | `src/data/learning.js` |
| Word banks (words, clues, Thai, example sentences) | `LEVELS` in `src/data/levels.js` |
| Easy / Normal / Hard (words, grid, directions, coins, timer, number of instructions) | `DIFFICULTY` in `src/data/levels.js` |
| Decorating instructions and the things in the scenes | `QUESTS` and `QUEST_THINGS` in `src/data/levels.js` |
| Shop furniture for My House: prices, sizes, what can go on what | `src/data/furniture.js` |
| Pixel art (and how to swap in real PNG images) | `src/data/sprites.js` → `IMAGE_OVERRIDES` |
| Time bonus, first-clear bonus, hint cost | `ECONOMY` in `src/data/levels.js` |
| Background music (melody, chords, speed) and sound effects | `src/logic/audio.js` |

Code structure: `src/screens/` (game screens), `src/components/` (word grid, clue card, room view…), `src/logic/` (round builder, grid generator, word checking, quest scenes, coins, My House placement, saving, sound), `src/stores/game.js` (Pinia game state).

## Tools used
Vue 3, Vite, Pinia, JavaScript, CSS, localStorage, Web Audio API (background music and sound effects made in code), Web Speech API (pronunciation), Google Fonts (Nunito, Press Start 2P, Sarabun). All pixel art, music and sound effects are made in code — no outside image, music or sound files. Music and sound effects can be turned on/off separately (🎵 / 🔊 buttons in the bottom-left corner, or Settings).

## AI tools used
> Group: keep only what is true, and describe what **you** checked or changed.

| AI tool | What it helped with | What the group checked / did itself |
|---|---|---|
| Claude Code (Anthropic) | Game code, word banks (clues, example sentences), decorating instructions, pixel art and music in code, and these documents | _(fill in)_ |
| _(add any other AI tool you really used)_ | | |

No AI is called while the game is running.

## Team
See [`docs/TEAM.md`](docs/TEAM.md). How the game meets the assignment requirements: [`docs/REQUIREMENTS_CHECK.md`](docs/REQUIREMENTS_CHECK.md). Demo script: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md). Playtesting form: [`docs/PLAYTEST_LOG.md`](docs/PLAYTEST_LOG.md).
