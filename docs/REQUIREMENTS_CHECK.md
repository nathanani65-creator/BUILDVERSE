# BUILDVERSE — Assignment Requirements Check

How BUILDVERSE meets each game requirement, and where the teacher can see it in the game.

| # | Requirement | How BUILDVERSE meets it | Where to see it |
|---|---|---|---|
| 1 | **Clear language goal** — skill/topic and learner group | **Topic:** My Home. **Main skills:** home vocabulary (75 words, 15 per room) and prepositions of place (*on, under, next to, between*), practised by reading and following English instructions. **Learners:** lower-secondary students (Grade 7–9) and adult beginners, CEFR A1–A2. | Main Menu banner · **🎯 Learning Goals** screen · room cards (position word) · Choose Room "My English" bar · README |
| 2 | **Correct, natural English** — instructions, clues, feedback checked | All text is in one file (`src/data/levels.js`). Automatic checks confirm every clue in a room is different and does not contain its own answer, every instruction starts "Put the … on/under/next to/between …", and every instruction has all its things in the scene. **The group must still proofread** (see TEAM.md → "Who checked the English content"). | `src/data/levels.js` · `npm run verify` |
| 3 | **Core loop that can be repeated, with feedback/rewards** | One round = **1. Find Words → 2. Place Items → 3. Rewards**. Every round picks new words and new instructions. Easy / Normal / Hard (50 / 70 / 100 coins), +20 for Challenge Mode in time, +100 the first time a room is cleared. After all 5 rooms: Play Again, Random Room, Hard mode, decorate My House. | Any room → Play · Rewards screen → Play Again |
| 4 | **Feedback that says right/wrong and why** | Text + colour + icon (not colour only). Word Search: explains why a selection is wrong; each found word shows its Thai meaning, an example sentence and sound. Decorating Quest: wrong answers show **Why** (the meaning of the position word) + a **Hint**; after 2 tries the right space glows. Hints never cost coins. | Word Search message bar · Decorating Quest → Check Placement |
| 5 | **Says which AI/tools were used and what the group did** | In-game list of tools and AI use, with a column for what the group checked/changed. No AI is used while playing. **Group must fill in their part.** | Credits → "How we used AI" (`src/data/credits.js`) · README → AI tools used |
| 6 | **Playable without a group member explaining** — How to Play in English | English How to Play (8 animated steps). First-time demos for dragging in the word grid (Easy, diagonal, backwards) and for placing items. A position-word lesson opens the first time each word is used. The current GOAL and the round steps are always shown, with one main button at each step. | Main Menu → How to Play · first round |

## To do for the group before submitting
- [ ] Fill in names, student IDs and roles: `docs/TEAM.md` and in-game Credits
- [ ] Fill in what the group did and checked: `src/data/credits.js` (`groupDid`, `GROUP_WORK`)
- [ ] Proofread all English in `src/data/levels.js` and record it in `docs/TEAM.md`
- [ ] Playtest with real players and fill in `docs/PLAYTEST_LOG.md`
- [ ] If your target learners are different, change them in `src/data/learning.js`
