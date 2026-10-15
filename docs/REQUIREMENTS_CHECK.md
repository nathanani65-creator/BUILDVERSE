# BUILDVERSE — Assignment Requirements Check

How BUILDVERSE meets each game requirement, and where the teacher can see it in the game.

| # | Requirement | How BUILDVERSE meets it | Where to see it |
|---|---|---|---|
| 1 | **Clear language goal** — skill/topic and learner group | **Topic:** My Home. **Main skills:** home vocabulary (43 words) and prepositions of place (*on, under, next to, between*). Also reading/following instructions and simple sentence order. **Learners:** lower-secondary students (Grade 7–9) and adult beginners, CEFR A1–A2. | Main Menu banner · **🎯 Learning Goals** screen · level intro ("In this level you will learn") · Quest Complete ("Now you can…") · House Map "My English" bar · README |
| 2 | **Correct, natural English** — instructions, questions, feedback checked | All text is in one file (`src/data/levels.js`). Automatic checks confirm every clue has one clear answer in its level, no clue contains its own answer, and every answer is in its options. **The group must still proofread** (see TEAM.md → "Who checked the English content"). | `src/data/levels.js` · `npm run verify` |
| 3 | **Core loop that can be repeated, with feedback/rewards** | Read clue → find word → language challenge → coins → buy furniture → follow instruction → unlock room. 5 levels; any level can be replayed for +50 coins and more practice. Rewards: coins, language bonus, time bonus, new rooms, decorations. | Play any level · House Map → Replay |
| 4 | **Feedback that says right/wrong and why** | Text + colour + icon (not colour only). Word Search: explains why a selection is wrong and repeats the clue when a word is found. Language Challenge: says why (e.g. "A fridge keeps food cold."); extra hint after 2 tries; full explanation after 3. Decorating: checklist shows which part is wrong + **Why** (meaning of the position word) + **Hint**. | Word Search message bar · Language Challenge · My House → Check Placement |
| 5 | **Says which AI/tools were used and what the group did** | In-game list of tools and AI use, with a column for what the group checked/changed. No AI is used while playing. **Group must fill in their part.** | Credits → "How we used AI" (`src/data/credits.js`) · README → AI tools used |
| 6 | **Playable without a group member explaining** — How to Play in English | English How to Play with 7 animated steps; tutorial before Level 1; new-skill tutorials before diagonal and backwards words; position-word lesson before the first placement check; the current goal is always shown at the top. | Main Menu → How to Play · first time in each level |

## To do for the group before submitting
- [ ] Fill in names, student IDs and roles: `docs/TEAM.md` and in-game Credits
- [ ] Fill in what the group did and checked: `src/data/credits.js` (`groupDid`, `GROUP_WORK`)
- [ ] Proofread all English in `src/data/levels.js` and record it in `docs/TEAM.md`
- [ ] Playtest with real players and fill in `docs/PLAYTEST_LOG.md`
- [ ] If your target learners are different, change them in `src/data/learning.js`
