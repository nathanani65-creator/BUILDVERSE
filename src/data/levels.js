// ---------------------------------------------------------------------------
// GAME CONTENT — rooms, word banks, difficulty, rewards and decorating quests.
// The game logic reads everything from this file, so you can add words or
// instructions without touching the code. Run `npm run verify` after editing.
//
// Word fields:
//   word     – letters used in the grid (UPPER CASE, no spaces)
//   display  – how the word is shown (may contain a space)
//   thai     – Thai meaning
//   clue     – English clue (must clearly mean ONLY this word in its room)
//   example  – example sentence
//   sprite   – picture name from data/sprites.js
// ---------------------------------------------------------------------------

const w = (word, thai, sprite, clue, example, display = word) => ({ word, display, thai, sprite, clue, example })

export const LEVELS = [
  {
    id: 'bedroom',
    level: 1,
    name: 'Bedroom',
    thai: 'ห้องนอน',
    words: [
      w('BED', 'เตียง', 'bed', 'You sleep on this.', 'This is a bed. I sleep on it every night.'),
      w('DESK', 'โต๊ะเขียนหนังสือ', 'desk', 'You sit at this to study or write.', 'I do my homework at my desk.'),
      w('LAMP', 'โคมไฟ', 'lamp', 'This gives you light at night.', 'Please turn on the lamp.'),
      w('WALL', 'ผนัง', 'wall', 'A room has four of these.', 'There is a clock on the wall.'),
      w('DOOR', 'ประตู', 'door', 'You open this to go into a room.', 'Please close the door.'),
      w('PILLOW', 'หมอน', 'pillow', 'You put your head on this when you sleep.', 'My pillow is soft.'),
      w('BLANKET', 'ผ้าห่ม', 'blanket', 'It keeps you warm in bed.', 'It is cold. I need a blanket.'),
      w('WARDROBE', 'ตู้เสื้อผ้า', 'wardrobe', 'A tall cupboard. You hang your clothes in it.', 'My shirts are in the wardrobe.'),
      w('CURTAIN', 'ผ้าม่าน', 'curtain', 'You close this over a window to keep the light out.', 'Please close the curtain.'),
      w('BOOK', 'หนังสือ', 'book', 'You read this. It has many pages.', 'I read a book before bed.'),
      w('BAG', 'กระเป๋า', 'bag', 'You carry your things to school in this.', 'My bag is heavy.'),
      w('SHOES', 'รองเท้า', 'shoes', 'You wear these on your feet.', 'Please take off your shoes.'),
      w('POSTER', 'โปสเตอร์', 'poster', 'A big printed picture. You stick it on your wall.', 'There is a poster of a mountain in my room.'),
      w('DRAWER', 'ลิ้นชัก', 'drawer', 'A box in a piece of furniture. You pull it out to open it.', 'My socks are in the drawer.'),
      w('GUITAR', 'กีตาร์', 'guitar', 'A music instrument with six strings.', 'I play the guitar in my room.'),
    ],
  },
  {
    id: 'living',
    level: 2,
    name: 'Living Room',
    thai: 'ห้องนั่งเล่น',
    words: [
      w('SOFA', 'โซฟา', 'sofa', 'A long, soft seat for two or more people.', 'We sit on the sofa and watch TV.'),
      w('CHAIR', 'เก้าอี้', 'chair', 'A simple wooden seat for one person.', 'Please sit on this chair.'),
      w('TABLE', 'โต๊ะ', 'table', 'We sit around this to eat or play games.', 'The cups are on the table.'),
      w('RUG', 'พรม', 'rug', 'A soft cover for part of the floor.', 'The cat is sleeping on the rug.'),
      w('SHELF', 'ชั้นวางของ', 'shelf', 'You put your books on this.', 'My books are on the shelf.'),
      w('CLOCK', 'นาฬิกา', 'clock', 'This tells you the time.', "The clock says it is seven o'clock."),
      w('WINDOW', 'หน้าต่าง', 'window', 'You look outside through this glass.', 'Please open the window.'),
      w('CUSHION', 'หมอนอิง', 'cushion', 'A small soft thing on a sofa. You lean on it.', 'There are two cushions on the sofa.'),
      w('PLANT', 'ต้นไม้ในกระถาง', 'plant', 'A green living thing in a pot. You give it water.', 'The plant needs water every day.'),
      w('PICTURE', 'รูปภาพ', 'picture', 'You hang this on the wall to look at.', 'There is a picture of my family.'),
      w('VASE', 'แจกัน', 'vase', 'You put flowers and water in this.', 'The vase is full of flowers.'),
      w('PIANO', 'เปียโน', 'piano', 'A big music instrument with black and white keys.', 'My sister plays the piano.'),
      w('RADIO', 'วิทยุ', 'radio', 'You listen to music and news on this.', 'Please turn on the radio.'),
      w('FAN', 'พัดลม', 'fan', 'It moves the air and keeps you cool.', 'It is hot. Turn on the fan.'),
      w('ARMCHAIR', 'เก้าอี้นวม', 'armchair', 'A big, soft seat for one person, with places to rest your arms.', 'Grandpa reads in his armchair.'),
    ],
  },
  {
    id: 'kitchen',
    level: 3,
    name: 'Kitchen',
    thai: 'ห้องครัว',
    words: [
      w('FRIDGE', 'ตู้เย็น', 'fridge', 'This keeps your food cold.', 'The milk is in the fridge.'),
      w('STOVE', 'เตา', 'stove', 'You cook hot food on top of this.', 'Dad cooks soup on the stove.'),
      w('SINK', 'อ่างล้างจาน', 'sink', 'You wash the dishes in this.', 'Put the dirty plates in the sink.'),
      w('PLATE', 'จาน', 'plate', 'A flat dish. You put your food on it.', 'There is rice on my plate.'),
      w('SPOON', 'ช้อน', 'spoon', 'You eat soup with this.', 'I eat soup with a spoon.'),
      w('FORK', 'ส้อม', 'fork', 'It has three or four points. You pick up food with it.', 'I eat salad with a fork.'),
      w('CUP', 'ถ้วย', 'cup', 'You drink hot tea from this.', 'I drink tea from a cup.'),
      w('CABINET', 'ตู้เก็บของ', 'cabinet', 'A box with doors. You keep plates and cups in it.', 'The plates are in the cabinet.'),
      w('KETTLE', 'กาต้มน้ำ', 'kettle', 'You boil water in this.', 'The water in the kettle is hot.'),
      w('BOWL', 'ชาม', 'bowl', 'A deep, round dish. You eat cereal from it.', 'I eat noodles from a bowl.'),
      w('KNIFE', 'มีด', 'knife', 'You cut bread with this. Be careful, it is sharp!', 'Cut the cake with a knife.'),
      w('PAN', 'กระทะ', 'pan', 'You fry eggs in this.', 'Mom fries eggs in a pan.'),
      w('OVEN', 'เตาอบ', 'oven', 'You bake bread and cakes inside this.', 'The cake is in the oven.'),
      w('TOASTER', 'เครื่องปิ้งขนมปัง', 'toaster', 'This makes bread hot and brown.', 'Put the bread in the toaster.'),
      w('GLASS', 'แก้วน้ำ', 'glass', 'You drink cold water from this. You can see through it.', 'Can I have a glass of water?'),
    ],
  },
  {
    id: 'bathroom',
    level: 4,
    name: 'Bathroom',
    thai: 'ห้องน้ำ',
    words: [
      w('SHOWER', 'ฝักบัว', 'shower', 'Water comes down on you from above. You wash your body here.', 'I take a shower every morning.'),
      w('TOILET', 'ชักโครก', 'toilet', 'You sit on this and flush it after you use it.', 'Please flush the toilet.'),
      w('MIRROR', 'กระจกเงา', 'mirror', 'You see your face in this.', 'I look in the mirror and smile.'),
      w('TOWEL', 'ผ้าเช็ดตัว', 'towel', 'You use this to dry your body.', 'My towel is wet after my shower.'),
      w('SOAP', 'สบู่', 'soap', 'You wash your hands with this and water.', 'Wash your hands with soap.'),
      w('TAP', 'ก๊อกน้ำ', 'tap', 'Turn this on and water comes out.', 'Turn off the tap to save water.'),
      w('BATHTUB', 'อ่างอาบน้ำ', 'bathtub', 'You can lie down in warm water in this.', 'The baby takes a bath in the bathtub.'),
      w('TOOTHBRUSH', 'แปรงสีฟัน', 'toothbrush', 'You use this to clean your teeth.', 'I brush my teeth with my toothbrush.'),
      w('TOOTHPASTE', 'ยาสีฟัน', 'toothpaste', 'You put this on your toothbrush.', 'Put a little toothpaste on your toothbrush.'),
      w('SHAMPOO', 'แชมพู', 'shampoo', 'You wash your hair with this.', 'This shampoo smells like apples.'),
      w('COMB', 'หวี', 'comb', 'You make your hair neat with this.', 'I comb my hair every morning.'),
      w('SPONGE', 'ฟองน้ำ', 'sponge', 'It is soft and full of small holes. You wash with it.', 'I wash my back with a sponge.'),
      w('BUCKET', 'ถังน้ำ', 'bucket', 'You carry water in this.', 'Fill the bucket with water.'),
      w('HAIRDRYER', 'ไดร์เป่าผม', 'hairdryer', 'This blows hot air on your wet hair.', 'I use a hair dryer after my shower.', 'HAIR DRYER'),
      w('TISSUE', 'กระดาษทิชชู', 'tissue', 'Soft, thin paper. You use it to clean your nose.', 'Here is a tissue for you.'),
    ],
  },
  {
    id: 'garden',
    level: 5,
    name: 'Garden',
    thai: 'สวน',
    words: [
      w('TREE', 'ต้นไม้', 'tree', 'It is tall. It has a trunk and many leaves.', 'Birds live in the tree.'),
      w('FLOWER', 'ดอกไม้', 'flower', 'It is pretty and colorful. Bees visit it.', 'This red flower smells nice.'),
      w('GRASS', 'หญ้า', 'grass', 'It is short and green. It covers the ground.', 'The children play on the grass.'),
      w('BENCH', 'ม้านั่งยาว', 'bench', 'A long seat in a garden or a park.', "Let's sit on the bench."),
      w('FENCE', 'รั้ว', 'fence', 'It goes around the garden and keeps animals out.', 'The dog cannot jump over the fence.'),
      w('GATE', 'ประตูรั้ว', 'gate', 'A door in a fence.', 'Please close the gate.'),
      w('POND', 'บ่อน้ำ', 'pond', 'A small area of water. Fish and frogs live in it.', 'There are fish in the pond.'),
      w('PATH', 'ทางเดิน', 'path', 'You walk on this to go across the garden.', 'Walk on the path, not on the flowers.'),
      w('SHOVEL', 'พลั่ว', 'shovel', 'You dig holes with this.', 'I dig a hole with a shovel.'),
      w('WATERINGCAN', 'บัวรดน้ำ', 'wateringcan', 'You fill this with water and pour it on plants.', 'I fill the watering can with water.', 'WATERING CAN'),
      w('BUTTERFLY', 'ผีเสื้อ', 'butterfly', 'An insect with big, colorful wings.', 'A butterfly is on the flower.'),
      w('FOUNTAIN', 'น้ำพุ', 'fountain', 'Water shoots up into the air from this and falls down.', 'Birds drink water from the fountain.'),
      w('BIRD', 'นก', 'bird', 'It has feathers and wings. It sings in the trees.', 'A bird is singing in the tree.'),
      w('SWING', 'ชิงช้า', 'swing', 'Children sit on this and go back and forth.', 'The children play on the swing.'),
      w('HOSE', 'สายยาง', 'hose', 'A long, thin tube. Water comes out of the end.', 'Dad waters the grass with the hose.'),
    ],
  },
]

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]))

// Directions: E = → , S = ↓ , SE = ↘ , NE = ↗ , W = ← , N = ↑ , NW = ↖ , SW = ↙ (last four = backwards)
// picture: 'shown'  – the clue picture is always visible
//          'button' – the player can press "Show picture"
export const DIFFICULTY = {
  easy: { key: 'easy', label: 'Easy', words: 5, size: 8, directions: ['E', 'S'], picture: 'shown', quests: 1, reward: 50, timeLimit: 180, desc: '5 words · 8×8 · → ↓ · pictures shown · 1 instruction' },
  normal: { key: 'normal', label: 'Normal', words: 7, size: 10, directions: ['E', 'S', 'SE', 'NE'], picture: 'button', quests: 2, reward: 70, timeLimit: 240, desc: '7 words · 10×10 · + diagonal · picture button · 2 instructions' },
  hard: { key: 'hard', label: 'Hard', words: 9, size: 12, directions: ['E', 'S', 'SE', 'NE', 'W', 'N', 'NW', 'SW'], picture: 'button', quests: 3, reward: 100, timeLimit: 300, desc: '9 words · 12×12 · + backwards · English clues · 3 instructions' },
}
export const DIFFICULTY_ORDER = ['easy', 'normal', 'hard']

// Coins
export const ECONOMY = {
  timeBonus: 20, // Challenge Mode finished in time
  unlockBonus: 100, // first time a room is cleared (once per room)
  hintCost: 0, // coins per Word Search hint step (0 = free)
}

// ---------------------------------------------------------------------------
// DECORATING QUEST
// Things that can appear in a quest scene (borrowed for free, never saved to
// My House).  kind: 'big' = stands on the floor only
//                   'small' = can go on the floor, ON a surface or UNDER something
//                   'flat' = lies on the floor (rug), can go UNDER something
// surface: has an "on top" space · under: has an "under" space
// top: where the top surface is in the picture (0 = top edge, 1 = bottom), default 0.25
// ---------------------------------------------------------------------------
export const QUEST_THINGS = {
  desk: { name: 'desk', sprite: 'desk', kind: 'big', surface: true, under: true },
  bed: { name: 'bed', sprite: 'bed', kind: 'big', surface: true, under: true },
  wardrobe: { name: 'wardrobe', sprite: 'wardrobe', kind: 'big' },
  lamp: { name: 'lamp', sprite: 'lamp', kind: 'small' },
  pillow: { name: 'pillow', sprite: 'pillow', kind: 'small' },
  book: { name: 'book', sprite: 'book', kind: 'small' },
  bag: { name: 'bag', sprite: 'bag', kind: 'small' },
  table: { name: 'table', sprite: 'table', kind: 'big', surface: true, under: true },
  sofa: { name: 'sofa', sprite: 'sofa', kind: 'big', under: true },
  window: { name: 'window', sprite: 'window', kind: 'big', under: true, raised: true },
  rug: { name: 'rug', sprite: 'rug', kind: 'flat' },
  plant: { name: 'plant', sprite: 'plant', kind: 'small' },
  radio: { name: 'radio', sprite: 'radio', kind: 'small' },
  fridge: { name: 'fridge', sprite: 'fridge', kind: 'big' },
  cabinet: { name: 'cabinet', sprite: 'cabinet', kind: 'big' },
  stove: { name: 'stove', sprite: 'stove', kind: 'big' },
  sink: { name: 'sink', sprite: 'sink', kind: 'big', surface: true, top: 0.42 },
  oven: { name: 'oven', sprite: 'oven', kind: 'big' },
  mirror: { name: 'mirror', sprite: 'mirror', kind: 'big' },
  shower: { name: 'shower', sprite: 'shower', kind: 'big' },
  towel: { name: 'towel', sprite: 'towel', kind: 'small' },
  towelrail: { name: 'towel rail', sprite: 'towelrail', kind: 'big', surface: true, top: 0.36 },
  soap: { name: 'soap', sprite: 'soap', kind: 'small' },
  bathtub: { name: 'bathtub', sprite: 'bathtub', kind: 'big' },
  bucket: { name: 'bucket', sprite: 'bucket', kind: 'small' },
  tree: { name: 'tree', sprite: 'tree', kind: 'big' },
  flowerpot: { name: 'flower pot', sprite: 'flowerpot', kind: 'big' },
  bench: { name: 'bench', sprite: 'bench', kind: 'big', surface: true, under: true, top: 0.2 },
  fountain: { name: 'fountain', sprite: 'fountain', kind: 'big' },
  fence: { name: 'fence', sprite: 'fence', kind: 'big' },
  gate: { name: 'gate', sprite: 'gate', kind: 'big' },
  wateringcan: { name: 'watering can', sprite: 'wateringcan', kind: 'small' },
}

// Checked instructions for each room. One instruction = one short scene.
//   rel     'on' | 'under' | 'nextTo' | 'between'
//   item    the thing the player drags (from QUEST_THINGS)
//   target  the thing it goes on / under / next to  (between: [a, b])
//   extra   other things in the scene (to make the player read carefully)
//   words   words from the room's word bank that this instruction uses —
//           they are always put into the Word Search of the same round.
export const QUESTS = {
  bedroom: [
    { id: 'b1', text: 'Put the lamp on the desk.', rel: 'on', item: 'lamp', target: 'desk', extra: ['bed'], words: ['LAMP', 'DESK'] },
    { id: 'b2', text: 'Put the pillow on the bed.', rel: 'on', item: 'pillow', target: 'bed', extra: ['desk'], words: ['PILLOW', 'BED'] },
    { id: 'b3', text: 'Put the book on the desk.', rel: 'on', item: 'book', target: 'desk', extra: ['bed'], words: ['BOOK', 'DESK'] },
    { id: 'b4', text: 'Put the bag on the bed.', rel: 'on', item: 'bag', target: 'bed', extra: ['wardrobe'], words: ['BAG', 'BED'] },
  ],
  living: [
    { id: 'l1', text: 'Put the rug under the table.', rel: 'under', item: 'rug', target: 'table', extra: ['sofa'], words: ['RUG', 'TABLE'] },
    { id: 'l2', text: 'Put the plant under the window.', rel: 'under', item: 'plant', target: 'window', extra: ['table'], words: ['PLANT', 'WINDOW'] },
    { id: 'l3', text: 'Put the radio under the table.', rel: 'under', item: 'radio', target: 'table', extra: ['sofa'], words: ['RADIO', 'TABLE'] },
    { id: 'l4', text: 'Put the rug under the sofa.', rel: 'under', item: 'rug', target: 'sofa', extra: ['table'], words: ['RUG', 'SOFA'] },
  ],
  kitchen: [
    { id: 'k1', text: 'Put the fridge next to the cabinet.', rel: 'nextTo', item: 'fridge', target: 'cabinet', extra: ['stove'], words: ['FRIDGE', 'CABINET'] },
    { id: 'k2', text: 'Put the stove next to the sink.', rel: 'nextTo', item: 'stove', target: 'sink', extra: ['fridge'], words: ['STOVE', 'SINK'] },
    { id: 'k3', text: 'Put the oven next to the fridge.', rel: 'nextTo', item: 'oven', target: 'fridge', extra: ['sink'], words: ['OVEN', 'FRIDGE'] },
    { id: 'k4', text: 'Put the cabinet next to the stove.', rel: 'nextTo', item: 'cabinet', target: 'stove', extra: ['oven'], words: ['CABINET', 'STOVE'] },
  ],
  bathroom: [
    { id: 'ba1', text: 'Put the mirror next to the shower.', rel: 'nextTo', item: 'mirror', target: 'shower', extra: ['bathtub'], words: ['MIRROR', 'SHOWER'] },
    { id: 'ba2', text: 'Put the towel on the towel rail.', rel: 'on', item: 'towel', target: 'towelrail', extra: ['shower'], words: ['TOWEL'] },
    { id: 'ba3', text: 'Put the soap on the sink.', rel: 'on', item: 'soap', target: 'sink', extra: ['bathtub'], words: ['SOAP'] },
    { id: 'ba4', text: 'Put the bucket next to the bathtub.', rel: 'nextTo', item: 'bucket', target: 'bathtub', extra: ['shower'], words: ['BUCKET', 'BATHTUB'] },
  ],
  garden: [
    { id: 'g1', text: 'Put the bench between the tree and the flower pot.', rel: 'between', item: 'bench', target: ['tree', 'flowerpot'], extra: ['fence'], words: ['BENCH', 'TREE'] },
    { id: 'g2', text: 'Put the fountain between the bench and the tree.', rel: 'between', item: 'fountain', target: ['bench', 'tree'], extra: ['gate'], words: ['FOUNTAIN', 'BENCH', 'TREE'] },
    { id: 'g3', text: 'Put the flower pot between the fence and the gate.', rel: 'between', item: 'flowerpot', target: ['fence', 'gate'], extra: ['tree'], words: ['FENCE', 'GATE'] },
    { id: 'g4', text: 'Put the watering can between the flower pot and the bench.', rel: 'between', item: 'wateringcan', target: ['flowerpot', 'bench'], extra: ['fence'], words: ['WATERINGCAN', 'BENCH'] },
  ],
}

// Meaning of each relation (used for feedback "why") and the lesson picture.
export const POSITION_WORDS = {
  on: { thai: 'บน', scene: 'lampOnDesk', text: 'ON = on top of something. The lamp is on the desk.' },
  under: { thai: 'ใต้', scene: 'rugUnderTable', text: 'UNDER = below something. The rug is under the table.' },
  'next to': { thai: 'ข้าง ๆ', scene: 'mirrorNextToShower', text: 'NEXT TO = beside something, side by side. The mirror is next to the shower.' },
  between: { thai: 'ระหว่าง', scene: 'benchBetween', text: 'BETWEEN = in the middle of two things. The bench is between the tree and the flower pot.' },
}
export const REL_WORD = { on: 'on', under: 'under', nextTo: 'next to', between: 'between' }

// Small pictures used in lessons (sprites on a 12 × 8 box).
export const SCENES = {
  lampOnDesk: [{ s: 'desk', x: 3, y: 2, w: 6, h: 6 }, { s: 'lamp', x: 4.5, y: 0.6, w: 3, h: 3 }],
  rugUnderTable: [{ s: 'rug', x: 1, y: 4, w: 10, h: 4, flat: true }, { s: 'table', x: 3, y: 1, w: 6, h: 6 }],
  mirrorNextToShower: [{ s: 'shower', x: 1, y: 0.5, w: 5, h: 7 }, { s: 'mirror', x: 7, y: 1.5, w: 4, h: 4 }],
  benchBetween: [{ s: 'tree', x: 0, y: 0, w: 4, h: 7 }, { s: 'bench', x: 4.2, y: 3, w: 3.6, h: 4 }, { s: 'flowerpot', x: 8.2, y: 2.5, w: 3.6, h: 4.5 }],
}
