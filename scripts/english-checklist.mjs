// Builds docs/ENGLISH_CHECKLIST.md — every piece of English in the game, as a
// list the group can proofread item by item.  Run:  npm run checklist
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LEVELS, QUESTS, QUEST_THINGS, POSITION_WORDS, DIFFICULTY } from '../src/data/levels.js'
import { LANGUAGE_FOCUS, SKILLS, LEVEL_GOALS, LEARNING_DESIGN } from '../src/data/learning.js'
import { FURNITURE } from '../src/data/furniture.js'
import { AI_USE, NO_AI_DURING_PLAY, TOOLS } from '../src/data/credits.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|')
const L = []
const p = (...lines) => L.push(...lines)
let n = 0
const no = () => ++n

p('# BUILDVERSE — English Proofreading Checklist',
  '',
  '> **วิธีใช้:** อ่านทีละแถว ถ้าถูกแล้วให้ใส่ ✔ ในช่อง **OK** ถ้าผิดหรือไม่เป็นธรรมชาติ ให้เขียนข้อความที่ถูกในช่อง **Fix / Notes**',
  '> แล้วแก้ในไฟล์ที่บอกไว้ในแต่ละส่วน (หรือส่งรายการที่ต้องแก้ให้คนเขียนโค้ด) เสร็จแล้วกรอกตาราง "Who checked the English content" ใน `docs/TEAM.md`',
  '>',
  '> **ตรวจอะไรบ้าง:** สะกดถูก · ไวยากรณ์ถูก · ความหมายไทยตรงกับคำ · คำใบ้ชี้ไปที่คำนั้นคำเดียว · ประโยคง่ายพอสำหรับ A1–A2 · ใช้ a / an / the ถูก',
  '>',
  '> `___` = ส่วนที่เกมเติมเอง เช่น ชื่อคำหรือตัวเลข',
  '',
  '_This file is made from the game files by `npm run checklist`. Run it again after editing to get an updated list._',
  '')

// ---- Part A: words ---------------------------------------------------------
p('## Part A — Word banks (75 words)', '', 'File: `src/data/levels.js` → `LEVELS`', '')
for (const lv of LEVELS) {
  p(`### ${lv.name} (${lv.thai})`, '',
    '| # | Word | Thai | Clue | Example sentence | OK | Fix / Notes |',
    '|---|---|---|---|---|---|---|')
  for (const w of lv.words) p(`| ${no()} | **${cell(w.display)}** | ${cell(w.thai)} | ${cell(w.clue)} | ${cell(w.example)} | ☐ | |`)
  p('')
}

// ---- Part B: placement instructions ---------------------------------------
p('## Part B — Placement instructions and position words', '', 'File: `src/data/levels.js` → `QUESTS`, `POSITION_WORDS`, `QUEST_THINGS`', '')
p('| # | Room | Instruction | OK | Fix / Notes |', '|---|---|---|---|---|')
for (const lv of LEVELS) for (const q of QUESTS[lv.id]) p(`| ${no()} | ${lv.name} | ${cell(q.text)} | ☐ | |`)
p('', '**Position-word lessons**', '', '| # | Word | Thai | Lesson text | OK | Fix / Notes |', '|---|---|---|---|---|---|')
for (const [k, v] of Object.entries(POSITION_WORDS)) p(`| ${no()} | ${k} | ${v.thai} | ${cell(v.text)} | ☐ | |`)
p('', '**Names shown under things in the quest scenes**', '', '| # | Names | OK | Fix / Notes |', '|---|---|---|---|')
p(`| ${no()} | ${Object.values(QUEST_THINGS).map((t) => t.name).join(', ')} | ☐ | |`, '')

// ---- Part C: learning goals ------------------------------------------------
p('## Part C — Learning goals and difficulty', '', 'Files: `src/data/learning.js`, `src/data/levels.js` → `DIFFICULTY`', '')
p('| # | Where | Text | OK | Fix / Notes |', '|---|---|---|---|---|')
p(`| ${no()} | Headline | ${cell(LANGUAGE_FOCUS.headline)} | ☐ | |`)
p(`| ${no()} | Learners | ${cell(LANGUAGE_FOCUS.learners)} · ${cell(LANGUAGE_FOCUS.level)} | ☐ | |`)
p(`| ${no()} | Topic | ${cell(LANGUAGE_FOCUS.topic)} | ☐ | |`)
for (const s of SKILLS) p(`| ${no()} | Skill: ${s.name} | ${cell(s.desc)} — e.g. ${cell(s.example)} | ☐ | |`)
for (const lv of LEVELS) {
  const g = LEVEL_GOALS[lv.id]
  p(`| ${no()} | ${lv.name} pattern | ${cell(g.pattern)} | ☐ | |`)
  for (const c of g.canDo) p(`| ${no()} | ${lv.name} can-do | ${cell(c)} | ☐ | |`)
}
for (const d of LEARNING_DESIGN) p(`| ${no()} | How it helps: ${cell(d.part)} | ${cell(d.how)} | ☐ | |`)
for (const d of Object.values(DIFFICULTY)) p(`| ${no()} | Level: ${d.label} | ${cell(d.desc)} | ☐ | |`)
p('')

// ---- Part D: shop furniture -------------------------------------------------
p('## Part D — Shop furniture (My House)', '', 'File: `src/data/furniture.js`', '')
p('| # | Name | Thai | Description | OK | Fix / Notes |', '|---|---|---|---|---|---|')
for (const f of FURNITURE) p(`| ${no()} | ${cell(f.name)} | ${cell(f.thai)} | ${cell(f.desc)} | ☐ | |`)
p('')

// ---- Part E: screens, buttons and feedback ---------------------------------
const files = [
  ...fs.readdirSync(path.join(root, 'src/screens')).map((f) => 'src/screens/' + f),
  ...fs.readdirSync(path.join(root, 'src/components')).map((f) => 'src/components/' + f),
  'src/logic/quest.js', 'src/logic/economy.js', 'src/logic/placement.js', 'src/stores/game.js',
]
const NOISE = [/^\w+ in [\w.]+$/, /^\(.*\) in /, /\?.*:/, /\$event|Math\.|\* size|onInv|a-msg/, /^[\w.]+$/, /\.splice\(|^store\.|^[\w.]+ \+ [\w.]+$/]
function uiStrings(src) {
  src = src.replace(/<style[\s\S]*?<\/style>/g, '')
  const found = new Set()
  const add = (s) => {
    s = s.replace(/\s+/g, ' ').trim()
    if (!/[A-Za-z]{2,}/.test(s)) return
    if (!/[A-Za-z][a-z]+[\s,.!?'’][\s\S]*[A-Za-z]/.test(s) && !/^[A-Z][a-z]+[!.?]?$/.test(s)) return
    if (/^[a-z-]+( [a-z-]+)*$/.test(s) && !/\b(the|a|is|you|to|of|and|it)\b/.test(s)) return
    if (/[{}=;&|[\]]|=>|\.value|import |^@|^#|https?:|^`|^'/.test(s)) return
    if (NOISE.some((r) => r.test(s)) && !/[.!]$/.test(s.replace(/\?.*:.*/, ''))) return
    if (/^\w+ in [\w.]+$/.test(s)) return
    found.add(s)
  }
  const tpl = (src.match(/<template>[\s\S]*<\/template>/) || [''])[0]
    .replace(/\{\{[\s\S]*?\}\}/g, '___')
    .replace(/<\/?(b|strong|em|i|code|span|kbd|u|small)(\s[^>]*)?>/g, '')
  for (const m of tpl.matchAll(/>([^<>]+)</g)) add(m[1])
  for (const m of src.matchAll(/\b(?:title|placeholder|aria-label|label|text|alt)="([^"]+)"/g)) add(m[1])
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`([^`]*)`/g)) {
    const s = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, '___')
    if (s.split(' ').length >= 2 || /[!?.]$/.test(s)) add(s)
  }
  return [...found]
}
p('## Part E — Screens, buttons and feedback messages', '', 'Each table shows the file to edit. Short labels and buttons are included too.', '')
const seen = new Set()
for (const f of files) {
  const list = uiStrings(fs.readFileSync(path.join(root, f), 'utf8')).filter((s) => !seen.has(s))
  list.forEach((s) => seen.add(s))
  if (!list.length) continue
  p(`### \`${f}\``, '', '| # | Text | OK | Fix / Notes |', '|---|---|---|---|')
  for (const s of list) p(`| ${no()} | ${cell(s)} | ☐ | |`)
  p('')
}

// ---- Part F: credits --------------------------------------------------------
p('## Part F — Credits screen', '', 'File: `src/data/credits.js`', '', '| # | Text | OK | Fix / Notes |', '|---|---|---|---|')
for (const a of AI_USE) for (const u of a.used) p(`| ${no()} | ${cell(a.tool)}: ${cell(u)} | ☐ | |`)
p(`| ${no()} | ${cell(NO_AI_DURING_PLAY)} | ☐ | |`)
for (const [t, d] of TOOLS) p(`| ${no()} | ${cell(t)} — ${cell(d)} | ☐ | |`)
p('', '---', '', `**Total: ${n} items.** Also check the English documents: \`README.md\`, \`docs/GAME_DOCUMENT.md\`.`, '')

fs.writeFileSync(path.join(root, 'docs/ENGLISH_CHECKLIST.md'), L.join('\n'))
console.log(`docs/ENGLISH_CHECKLIST.md written — ${n} items`)
