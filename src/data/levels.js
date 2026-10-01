// ---------------------------------------------------------------------------
// LEVEL DATA — edit words, clues, rewards, timers and language challenges here.
// The game logic reads everything from this file, so you can change content
// without touching the code.
//
// Word fields:
//   word     – letters used in the grid (no spaces, UPPER CASE)
//   display  – how the word is shown to players (may contain a space)
//   thai     – Thai meaning (shown when "Thai help" is ON)
//   clue     – English clue
//   example  – example sentence
//   sprite   – picture name from data/sprites.js
//
// Directions: E = → , S = ↓ , SE = ↘ , NE = ↗ ,
//             W = ← , N = ↑ , NW = ↖ , SW = ↙ (the last four are backwards)
//
// clueStyle:
//   'picture'  – Level 1: picture + simple clue, "Reveal Word" button
//   'usage'    – Levels 2–3: picture + usage clue, word hidden until Hint/found
//   'english'  – Levels 4–5: English clue first, picture & Thai as helpers
// ---------------------------------------------------------------------------

export const LEVELS = [
  {
    id: 'bedroom',
    level: 1,
    name: 'Bedroom',
    thai: 'ห้องนอน',
    gridSize: 8,
    directions: ['E', 'S'],
    clueStyle: 'picture',
    reward: 200,
    timeLimit: 180,
    newSkill: null,
    words: [
      { word: 'BED', display: 'BED', thai: 'เตียง', sprite: 'bed', clue: 'You sleep on this.', example: 'This is a bed. I sleep on it every night.' },
      { word: 'DESK', display: 'DESK', thai: 'โต๊ะเขียนหนังสือ', sprite: 'desk', clue: 'You sit at this to study or write.', example: 'I do my homework at my desk.' },
      { word: 'LAMP', display: 'LAMP', thai: 'โคมไฟ', sprite: 'lamp', clue: 'This gives you light at night.', example: 'Please turn on the lamp.' },
      { word: 'WALL', display: 'WALL', thai: 'ผนัง', sprite: 'wall', clue: 'A room has four of these.', example: 'There is a picture on the wall.' },
      { word: 'DOOR', display: 'DOOR', thai: 'ประตู', sprite: 'door', clue: 'You open this to go into a room.', example: 'Please close the door.' },
    ],
    challenges: [
      {
        type: 'choose',
        prompt: 'Which item do you sleep on?',
        options: [{ text: 'DESK', sprite: 'desk' }, { text: 'BED', sprite: 'bed' }, { text: 'DOOR', sprite: 'door' }],
        answer: 'BED',
        correct: 'Correct! You sleep on a bed.',
        wrong: 'Try again. Think about night time. Where do you rest?',
        hint: 'Hint: It is soft and it has a pillow.',
        explain: 'A bed is for sleeping. The answer is BED.',
      },
      {
        type: 'order',
        prompt: 'Put the words in order to make a sentence.',
        words: ['The', 'lamp', 'is', 'on', 'the', 'desk'],
        correct: 'Correct! The lamp is on the desk.',
        wrong: 'Try again. A sentence starts with a capital letter: "The ..."',
        hint: 'Hint: The ___ is on the ___.',
        explain: 'The correct sentence is: "The lamp is on the desk."',
      },
      {
        type: 'position',
        prompt: 'Look at the picture. The lamp is ___ the desk.',
        scene: 'lampOnDesk',
        options: ['on', 'under', 'next to'],
        answer: 'on',
        correct: 'Correct! The lamp is on the desk.',
        wrong: 'Try again. Look at the picture. The lamp is on top of the desk.',
        hint: 'Hint: "on" means on top of something.',
        explain: 'The lamp touches the top of the desk, so the answer is "on".',
      },
    ],
    placement: {
      instructions: ['Put the lamp on the desk.'],
      teach: ['on'],
      rules: [
        { type: 'placed', item: 'bed' },
        { type: 'placed', item: 'desk' },
        { type: 'placed', item: 'lamp' },
        { type: 'on', item: 'lamp', target: 'desk', text: 'The lamp is on the desk.', hint: 'Drag the lamp and drop it on top of the desk.' },
      ],
    },
  },
  {
    id: 'living',
    level: 2,
    name: 'Living Room',
    thai: 'ห้องนั่งเล่น',
    gridSize: 10,
    directions: ['E', 'S', 'SE', 'NE'],
    clueStyle: 'usage',
    reward: 250,
    timeLimit: 240,
    newSkill: 'diagonal',
    words: [
      { word: 'SOFA', display: 'SOFA', thai: 'โซฟา', sprite: 'sofa', clue: 'A long, soft seat for two or more people. You can watch TV on it.', example: 'We sit on the sofa and watch TV.' },
      { word: 'CHAIR', display: 'CHAIR', thai: 'เก้าอี้', sprite: 'chair', clue: 'A seat for one person.', example: 'Please sit on this chair.' },
      { word: 'TABLE', display: 'TABLE', thai: 'โต๊ะ', sprite: 'table', clue: 'We sit around this to eat or play games.', example: 'The cups are on the table.' },
      { word: 'RUG', display: 'RUG', thai: 'พรม', sprite: 'rug', clue: 'A soft cover for part of the floor.', example: 'The cat is sleeping on the rug.' },
      { word: 'SHELF', display: 'SHELF', thai: 'ชั้นวางของ', sprite: 'shelf', clue: 'You put your books on this.', example: 'My books are on the shelf.' },
      { word: 'CLOCK', display: 'CLOCK', thai: 'นาฬิกา', sprite: 'clock', clue: 'This tells you the time.', example: 'The clock says it is seven o\'clock.' },
      { word: 'WINDOW', display: 'WINDOW', thai: 'หน้าต่าง', sprite: 'window', clue: 'You look outside through this glass.', example: 'Please open the window.' },
    ],
    challenges: [
      {
        type: 'choose',
        prompt: 'Which item tells you the time?',
        options: [{ text: 'WINDOW', sprite: 'window' }, { text: 'SHELF', sprite: 'shelf' }, { text: 'CLOCK', sprite: 'clock' }],
        answer: 'CLOCK',
        correct: 'Correct! A clock tells you the time.',
        wrong: 'Try again. Which item has numbers and hands?',
        hint: 'Hint: "What time is it?" Look at the ___.',
        explain: 'We look at a clock to know the time. The answer is CLOCK.',
      },
      {
        type: 'position',
        prompt: 'Look at the picture. The rug is ___ the table.',
        scene: 'rugUnderTable',
        options: ['on', 'under', 'between'],
        answer: 'under',
        correct: 'Correct! The rug is under the table.',
        wrong: 'Try again. Look at the picture. The rug is below the table.',
        hint: 'Hint: The rug is on the floor. The table stands on top of it.',
        explain: 'The rug is below the table, so the answer is "under".',
      },
      {
        type: 'order',
        prompt: 'Put the words in order to make a sentence.',
        words: ['We', 'watch', 'TV', 'on', 'the', 'sofa'],
        correct: 'Correct! We watch TV on the sofa.',
        wrong: 'Try again. Start with "We" and put the action word next.',
        hint: 'Hint: We ___ TV on the ___.',
        explain: 'The correct sentence is: "We watch TV on the sofa."',
      },
    ],
    placement: {
      instructions: ['Put the rug under the table.'],
      teach: ['under'],
      rules: [
        { type: 'placed', item: 'sofa' },
        { type: 'placed', item: 'table' },
        { type: 'placed', item: 'rug' },
        { type: 'under', item: 'rug', target: 'table', text: 'The rug is under the table.', hint: 'Put the rug on the floor first. Then drop the table on the rug.' },
      ],
    },
  },
  {
    id: 'kitchen',
    level: 3,
    name: 'Kitchen',
    thai: 'ห้องครัว',
    gridSize: 12,
    directions: ['E', 'S', 'SE', 'NE', 'W', 'N'],
    clueStyle: 'usage',
    reward: 300,
    timeLimit: 300,
    newSkill: 'backwards',
    words: [
      { word: 'FRIDGE', display: 'FRIDGE', thai: 'ตู้เย็น', sprite: 'fridge', clue: 'This keeps your food cold.', example: 'The milk is in the fridge.' },
      { word: 'STOVE', display: 'STOVE', thai: 'เตา', sprite: 'stove', clue: 'You cook hot food on this.', example: 'Dad cooks soup on the stove.' },
      { word: 'SINK', display: 'SINK', thai: 'อ่างล้างจาน', sprite: 'sink', clue: 'You wash the dishes in this.', example: 'Put the dirty plates in the sink.' },
      { word: 'PLATE', display: 'PLATE', thai: 'จาน', sprite: 'plate', clue: 'You put your food on this when you eat.', example: 'There is rice on my plate.' },
      { word: 'SPOON', display: 'SPOON', thai: 'ช้อน', sprite: 'spoon', clue: 'You eat soup with this.', example: 'I eat soup with a spoon.' },
      { word: 'FORK', display: 'FORK', thai: 'ส้อม', sprite: 'fork', clue: 'You pick up food with this. It has sharp points.', example: 'I eat salad with a fork.' },
      { word: 'CUP', display: 'CUP', thai: 'แก้ว / ถ้วย', sprite: 'cup', clue: 'You drink tea from this.', example: 'I drink tea from a cup.' },
      { word: 'CABINET', display: 'CABINET', thai: 'ตู้เก็บของ', sprite: 'cabinet', clue: 'A box with doors. You keep plates and cups in it.', example: 'The plates are in the cabinet.' },
      { word: 'KETTLE', display: 'KETTLE', thai: 'กาต้มน้ำ', sprite: 'kettle', clue: 'You boil water in this.', example: 'The water in the kettle is hot.' },
    ],
    challenges: [
      {
        type: 'choose',
        prompt: 'Which item keeps your food cold?',
        options: [{ text: 'STOVE', sprite: 'stove' }, { text: 'FRIDGE', sprite: 'fridge' }, { text: 'CABINET', sprite: 'cabinet' }],
        answer: 'FRIDGE',
        correct: 'Correct! A fridge keeps food cold.',
        wrong: 'Try again. A stove makes food hot. What makes food cold?',
        hint: 'Hint: We keep milk and ice cream in it.',
        explain: 'A fridge keeps food cold. The answer is FRIDGE.',
      },
      {
        type: 'order',
        prompt: 'Put the words in order to make a sentence.',
        words: ['We', 'cook', 'food', 'on', 'the', 'stove'],
        correct: 'Correct! We cook food on the stove.',
        wrong: 'Try again. Start with "We". What do we do with food on a stove?',
        hint: 'Hint: We ___ food on the ___.',
        explain: 'The correct sentence is: "We cook food on the stove."',
      },
      {
        type: 'position',
        prompt: 'Look at the picture. The cup is ___ the kettle.',
        scene: 'cupNextToKettle',
        options: ['on', 'under', 'next to'],
        answer: 'next to',
        correct: 'Correct! The cup is next to the kettle.',
        wrong: 'Try again. Look at the picture. The cup is beside the kettle, not on top.',
        hint: 'Hint: The two things stand side by side.',
        explain: 'The cup is beside the kettle, so the answer is "next to".',
      },
    ],
    placement: {
      instructions: ['Put the kettle on the cabinet.'],
      teach: ['on'],
      rules: [
        { type: 'placed', item: 'fridge' },
        { type: 'placed', item: 'cabinet' },
        { type: 'placed', item: 'kettle' },
        { type: 'on', item: 'kettle', target: 'cabinet', text: 'The kettle is on the cabinet.', hint: 'Drag the kettle and drop it on top of the cabinet.' },
      ],
    },
  },
  {
    id: 'bathroom',
    level: 4,
    name: 'Bathroom',
    thai: 'ห้องน้ำ',
    gridSize: 12,
    directions: ['E', 'S', 'SE', 'NE', 'W', 'N', 'NW', 'SW'],
    clueStyle: 'english',
    reward: 350,
    timeLimit: 360,
    newSkill: null,
    words: [
      { word: 'SHOWER', display: 'SHOWER', thai: 'ฝักบัว', sprite: 'shower', clue: 'Water comes down on you from above. You wash your body here.', example: 'I take a shower every morning.' },
      { word: 'TOILET', display: 'TOILET', thai: 'ชักโครก', sprite: 'toilet', clue: 'You sit on this and flush it after you use it.', example: 'Please flush the toilet.' },
      { word: 'MIRROR', display: 'MIRROR', thai: 'กระจกเงา', sprite: 'mirror', clue: 'You see your face in this.', example: 'I look in the mirror and comb my hair.' },
      { word: 'TOWEL', display: 'TOWEL', thai: 'ผ้าเช็ดตัว', sprite: 'towel', clue: 'You use this to dry your body.', example: 'My towel is wet after my shower.' },
      { word: 'SOAP', display: 'SOAP', thai: 'สบู่', sprite: 'soap', clue: 'You wash your hands with this and water.', example: 'Wash your hands with soap.' },
      { word: 'TAP', display: 'TAP', thai: 'ก๊อกน้ำ', sprite: 'tap', clue: 'Turn this on and water comes out.', example: 'Turn off the tap to save water.' },
      { word: 'BATHTUB', display: 'BATHTUB', thai: 'อ่างอาบน้ำ', sprite: 'bathtub', clue: 'You can lie down in warm water in this.', example: 'The baby takes a bath in the bathtub.' },
      { word: 'TOOTHBRUSH', display: 'TOOTHBRUSH', thai: 'แปรงสีฟัน', sprite: 'toothbrush', clue: 'You use this to clean your teeth.', example: 'I brush my teeth with my toothbrush.' },
      { word: 'TOOTHPASTE', display: 'TOOTHPASTE', thai: 'ยาสีฟัน', sprite: 'toothpaste', clue: 'You put this on your toothbrush.', example: 'Put a little toothpaste on your toothbrush.' },
      { word: 'SHAMPOO', display: 'SHAMPOO', thai: 'แชมพู', sprite: 'shampoo', clue: 'You wash your hair with this.', example: 'This shampoo smells like apples.' },
    ],
    challenges: [
      {
        type: 'choose',
        prompt: 'You are wet after a shower. Which item do you need?',
        options: [{ text: 'SOAP', sprite: 'soap' }, { text: 'MIRROR', sprite: 'mirror' }, { text: 'TOWEL', sprite: 'towel' }],
        answer: 'TOWEL',
        correct: 'Correct! You use a towel to dry your body.',
        wrong: 'Try again. You want to be dry, not clean.',
        hint: 'Hint: It is soft and you hang it on a rail.',
        explain: 'A towel makes your body dry. The answer is TOWEL.',
      },
      {
        type: 'position',
        prompt: 'Look at the picture. The soap is ___ the toothpaste and the shampoo.',
        scene: 'soapBetween',
        options: ['on', 'under', 'between'],
        answer: 'between',
        correct: 'Correct! The soap is between the toothpaste and the shampoo.',
        wrong: 'Try again. Look at the picture. The soap is in the middle of two things.',
        hint: 'Hint: When something is in the middle of two things, we say "between".',
        explain: 'The soap is in the middle, so the answer is "between".',
      },
      {
        type: 'order',
        prompt: 'Put the words in order to make a sentence.',
        words: ['I', 'look', 'in', 'the', 'mirror', 'every', 'morning'],
        correct: 'Correct! I look in the mirror every morning.',
        wrong: 'Try again. Start with "I", then the action word.',
        hint: 'Hint: I ___ in the ___ every morning.',
        explain: 'The correct sentence is: "I look in the mirror every morning."',
      },
    ],
    placement: {
      instructions: ['Put the mirror next to the shower.', 'Put the towel on the towel rail.'],
      teach: ['next to', 'on'],
      rules: [
        { type: 'placed', item: 'shower' },
        { type: 'placed', item: 'mirror' },
        { type: 'placed', item: 'towel' },
        { type: 'nextTo', item: 'mirror', target: 'shower', text: 'The mirror is next to the shower.', hint: 'Move the mirror to a square that touches the side of the shower.' },
        { type: 'on', item: 'towel', target: 'shower', text: 'The towel is on the towel rail.', hint: 'The towel rail is part of the shower. Drop the towel on the shower.' },
      ],
    },
  },
  {
    id: 'garden',
    level: 5,
    name: 'Garden',
    thai: 'สวน',
    gridSize: 14,
    directions: ['E', 'S', 'SE', 'NE', 'W', 'N', 'NW', 'SW'],
    clueStyle: 'english',
    reward: 400,
    timeLimit: 420,
    newSkill: null,
    words: [
      { word: 'TREE', display: 'TREE', thai: 'ต้นไม้', sprite: 'tree', clue: 'It is tall. It has a trunk and many leaves.', example: 'Birds live in the tree.' },
      { word: 'FLOWER', display: 'FLOWER', thai: 'ดอกไม้', sprite: 'flower', clue: 'It is pretty and colorful. Bees visit it.', example: 'This red flower smells nice.' },
      { word: 'GRASS', display: 'GRASS', thai: 'หญ้า', sprite: 'grass', clue: 'It is short and green. It covers the ground.', example: 'The children play on the grass.' },
      { word: 'BENCH', display: 'BENCH', thai: 'ม้านั่งยาว', sprite: 'bench', clue: 'A long seat in a garden or a park.', example: 'Let\'s sit on the bench.' },
      { word: 'FENCE', display: 'FENCE', thai: 'รั้ว', sprite: 'fence', clue: 'It goes around the garden and keeps animals out.', example: 'The dog cannot jump over the fence.' },
      { word: 'GATE', display: 'GATE', thai: 'ประตูรั้ว', sprite: 'gate', clue: 'A door in a fence.', example: 'Please close the gate.' },
      { word: 'POND', display: 'POND', thai: 'บ่อน้ำ', sprite: 'pond', clue: 'A small area of water. Fish and frogs live in it.', example: 'There are fish in the pond.' },
      { word: 'PATH', display: 'PATH', thai: 'ทางเดิน', sprite: 'path', clue: 'You walk on this to go across the garden.', example: 'Walk on the path, not on the flowers.' },
      { word: 'SHOVEL', display: 'SHOVEL', thai: 'พลั่ว', sprite: 'shovel', clue: 'You dig holes with this.', example: 'I dig a hole with a shovel.' },
      { word: 'WATERINGCAN', display: 'WATERING CAN', thai: 'บัวรดน้ำ', sprite: 'wateringcan', clue: 'You use this to water plants.', example: 'I fill the watering can with water.' },
      { word: 'BUTTERFLY', display: 'BUTTERFLY', thai: 'ผีเสื้อ', sprite: 'butterfly', clue: 'An insect with big, colorful wings.', example: 'A butterfly is on the flower.' },
      { word: 'FOUNTAIN', display: 'FOUNTAIN', thai: 'น้ำพุ', sprite: 'fountain', clue: 'Water shoots up into the air from this and falls down.', example: 'Birds drink water from the fountain.' },
    ],
    challenges: [
      {
        type: 'choose',
        prompt: 'The flowers are dry. Which item do you need?',
        options: [{ text: 'SHOVEL', sprite: 'shovel' }, { text: 'WATERING CAN', sprite: 'wateringcan' }, { text: 'BENCH', sprite: 'bench' }],
        answer: 'WATERING CAN',
        correct: 'Correct! You use a watering can to water plants.',
        wrong: 'Try again. Dry flowers need water.',
        hint: 'Hint: This item holds water.',
        explain: 'A watering can gives water to plants. The answer is WATERING CAN.',
      },
      {
        type: 'order',
        prompt: 'Put the words in order to make a sentence.',
        words: ['The', 'butterfly', 'is', 'on', 'the', 'flower'],
        correct: 'Correct! The butterfly is on the flower.',
        wrong: 'Try again. Start with "The" and say what is on the flower.',
        hint: 'Hint: The ___ is on the ___.',
        explain: 'The correct sentence is: "The butterfly is on the flower."',
      },
      {
        type: 'position',
        prompt: 'Look at the picture. The bench is ___ the tree and the flower pot.',
        scene: 'benchBetween',
        options: ['on', 'under', 'between'],
        answer: 'between',
        correct: 'Correct! The bench is between the tree and the flower pot.',
        wrong: 'Try again. Look at the picture. The bench is in the middle.',
        hint: 'Hint: The tree is on one side and the flower pot is on the other side.',
        explain: 'The bench is in the middle of two things, so the answer is "between".',
      },
    ],
    placement: {
      instructions: ['Put the bench between the tree and the flower pot.'],
      teach: ['between'],
      rules: [
        { type: 'placed', item: 'bench' },
        { type: 'placed', item: 'tree' },
        { type: 'placed', item: 'flowerpot' },
        { type: 'between', item: 'bench', a: 'tree', b: 'flowerpot', text: 'The bench is between the tree and the flower pot.', hint: 'Put the tree, the bench and the flower pot in one line, side by side. The bench goes in the middle.' },
      ],
    },
  },
]

// Rewards & bonuses (Coins)
export const ECONOMY = {
  replayReward: 50,
  languageBonusPerQuestion: 5,
  timeBonus: 20,
}

// Pictures used in Language Challenge and "Position words" lessons.
// Each scene is a list of sprites placed on a 12 x 8 box.
export const SCENES = {
  lampOnDesk: [{ s: 'desk', x: 3, y: 2, w: 6, h: 6 }, { s: 'lamp', x: 4.5, y: 0.6, w: 3, h: 3 }],
  rugUnderTable: [{ s: 'rug', x: 1, y: 4, w: 10, h: 4, flat: true }, { s: 'table', x: 3, y: 1, w: 6, h: 6 }],
  cupNextToKettle: [{ s: 'kettle', x: 2, y: 2, w: 4, h: 4 }, { s: 'cup', x: 6.5, y: 3, w: 3, h: 3 }, { s: 'cabinet', x: 1, y: 5.5, w: 10, h: 2.5, stretch: true }],
  soapBetween: [{ s: 'toothpaste', x: 0.5, y: 2.5, w: 4, h: 4 }, { s: 'soap', x: 4.3, y: 2.5, w: 3.4, h: 4 }, { s: 'shampoo', x: 8, y: 1.5, w: 3.5, h: 5 }],
  benchBetween: [{ s: 'tree', x: 0, y: 0, w: 4, h: 7 }, { s: 'bench', x: 4.2, y: 3, w: 3.6, h: 4 }, { s: 'flowerpot', x: 8.2, y: 2.5, w: 3.6, h: 4.5 }],
  mirrorNextToShower: [{ s: 'shower', x: 1, y: 0.5, w: 5, h: 7 }, { s: 'mirror', x: 7, y: 1.5, w: 4, h: 4 }],
}

// Short lessons that teach position words before the first placement check.
export const POSITION_WORDS = {
  on: { thai: 'บน', scene: 'lampOnDesk', text: 'ON = on top of something. The lamp is on the desk.' },
  under: { thai: 'ใต้', scene: 'rugUnderTable', text: 'UNDER = below something. The rug is under the table.' },
  'next to': { thai: 'ข้าง ๆ', scene: 'mirrorNextToShower', text: 'NEXT TO = beside something, side by side. The mirror is next to the shower.' },
  between: { thai: 'ระหว่าง', scene: 'benchBetween', text: 'BETWEEN = in the middle of two things. The bench is between the tree and the flower pot.' },
}

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]))
