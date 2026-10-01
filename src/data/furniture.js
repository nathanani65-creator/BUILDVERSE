// ---------------------------------------------------------------------------
// FURNITURE & SHOP DATA — edit prices, names and rules here.
//
//   id         unique id (used in save data — do not rename after release)
//   room       room id from levels.js (item can only be placed in this room)
//   price      cost in Coins
//   required   true = needed for the room's placement quest
//   sprite     picture name from data/sprites.js
//   variant    optional colour variant from VARIANTS in sprites.js
//   size       [width, height] in room squares
//   rotatable  true = the Rotate button works for this item
//   layer      'object' = normal furniture
//              'floor'  = lies flat on the floor (rug); other items may stand
//                         on it only if listed in `allowsOver`
//              'small'  = small item; can stand on the floor or ON an item
//                         whose `accepts` list contains it
//   accepts    list of small items that can be put on top of this item
// ---------------------------------------------------------------------------

export const ROOM_COLS = 8
export const ROOM_ROWS = 6

export const FURNITURE = [
  // ----- Bedroom -----
  { id: 'bed', name: 'Bed', thai: 'เตียง', room: 'bedroom', price: 80, required: true, sprite: 'bed', size: [2, 1], rotatable: true, layer: 'object', desc: 'A comfy bed for sleeping.' },
  { id: 'desk', name: 'Desk', thai: 'โต๊ะเขียนหนังสือ', room: 'bedroom', price: 60, required: true, sprite: 'desk', size: [1, 1], rotatable: true, layer: 'object', accepts: ['lamp'], desc: 'A desk for study. Things can go on it.' },
  { id: 'lamp', name: 'Lamp', thai: 'โคมไฟ', room: 'bedroom', price: 40, required: true, sprite: 'lamp', size: [1, 1], layer: 'small', desc: 'A small lamp. It gives light.' },
  { id: 'bookshelf', name: 'Shelf', thai: 'ชั้นวางหนังสือ', room: 'bedroom', price: 70, sprite: 'shelf', size: [1, 1], layer: 'object', desc: 'A shelf for your books.' },
  { id: 'picture', name: 'Picture', thai: 'รูปภาพ', room: 'bedroom', price: 50, sprite: 'picture', size: [1, 1], layer: 'object', desc: 'A nice picture of the hills.' },
  { id: 'green_bed', name: 'Green Bed', thai: 'เตียงสีเขียว', room: 'bedroom', price: 90, sprite: 'bed', variant: 'green', size: [2, 1], rotatable: true, layer: 'object', desc: 'A second bed in green.' },

  // ----- Living room -----
  { id: 'sofa', name: 'Sofa', thai: 'โซฟา', room: 'living', price: 100, required: true, sprite: 'sofa', size: [2, 1], rotatable: true, layer: 'object', desc: 'A long, soft seat.' },
  { id: 'table', name: 'Table', thai: 'โต๊ะ', room: 'living', price: 70, required: true, sprite: 'table', size: [1, 1], layer: 'object', desc: 'A small table. It can stand on a rug.' },
  { id: 'rug', name: 'Rug', thai: 'พรม', room: 'living', price: 50, required: true, sprite: 'rug', size: [2, 2], layer: 'floor', allowsOver: ['table'], desc: 'A soft rug. A table can stand on it.' },
  { id: 'chair', name: 'Chair', thai: 'เก้าอี้', room: 'living', price: 50, sprite: 'chair', size: [1, 1], rotatable: true, layer: 'object', desc: 'A wooden chair.' },
  { id: 'clock', name: 'Clock', thai: 'นาฬิกา', room: 'living', price: 50, sprite: 'clock', size: [1, 1], layer: 'object', desc: 'It tells the time.' },
  { id: 'window', name: 'Window', thai: 'หน้าต่าง', room: 'living', price: 60, sprite: 'window', size: [1, 1], layer: 'object', desc: 'Let the sunshine in!' },
  { id: 'red_sofa', name: 'Red Sofa', thai: 'โซฟาสีแดง', room: 'living', price: 110, sprite: 'sofa', variant: 'red', size: [2, 1], rotatable: true, layer: 'object', desc: 'A red sofa for guests.' },

  // ----- Kitchen -----
  { id: 'fridge', name: 'Fridge', thai: 'ตู้เย็น', room: 'kitchen', price: 120, required: true, sprite: 'fridge', size: [1, 1], layer: 'object', desc: 'It keeps food cold.' },
  { id: 'cabinet', name: 'Cabinet', thai: 'ตู้เก็บของ', room: 'kitchen', price: 80, required: true, sprite: 'cabinet', size: [1, 1], layer: 'object', accepts: ['kettle', 'cup'], desc: 'Keep plates in it. Things can go on it.' },
  { id: 'kettle', name: 'Kettle', thai: 'กาต้มน้ำ', room: 'kitchen', price: 60, required: true, sprite: 'kettle', size: [1, 1], layer: 'small', desc: 'Boil water for tea.' },
  { id: 'stove', name: 'Stove', thai: 'เตา', room: 'kitchen', price: 90, sprite: 'stove', size: [1, 1], layer: 'object', desc: 'Cook hot food on it.' },
  { id: 'sink', name: 'Sink', thai: 'อ่างล้างจาน', room: 'kitchen', price: 80, sprite: 'sink', size: [1, 1], layer: 'object', desc: 'Wash the dishes here.' },
  { id: 'kitchen_table', name: 'Kitchen Table', thai: 'โต๊ะกินข้าว', room: 'kitchen', price: 70, sprite: 'table', size: [1, 1], layer: 'object', accepts: ['cup', 'kettle'], desc: 'A table for meals.' },
  { id: 'cup', name: 'Cup', thai: 'แก้ว', room: 'kitchen', price: 20, sprite: 'cup', size: [1, 1], layer: 'small', desc: 'A red cup for tea.' },

  // ----- Bathroom -----
  { id: 'shower', name: 'Shower', thai: 'ฝักบัว', room: 'bathroom', price: 140, required: true, sprite: 'shower', size: [1, 1], layer: 'object', accepts: ['towel'], desc: 'A shower with a towel rail.' },
  { id: 'mirror', name: 'Mirror', thai: 'กระจกเงา', room: 'bathroom', price: 90, required: true, sprite: 'mirror', size: [1, 1], layer: 'object', desc: 'See your face in it.' },
  { id: 'towel', name: 'Towel', thai: 'ผ้าเช็ดตัว', room: 'bathroom', price: 70, required: true, sprite: 'towel', size: [1, 1], layer: 'small', desc: 'A soft towel. Hang it on the rail.' },
  { id: 'bathtub', name: 'Bathtub', thai: 'อ่างอาบน้ำ', room: 'bathroom', price: 120, sprite: 'bathtub', size: [2, 1], rotatable: true, layer: 'object', desc: 'Relax in warm water.' },
  { id: 'toilet', name: 'Toilet', thai: 'ชักโครก', room: 'bathroom', price: 90, sprite: 'toilet', size: [1, 1], rotatable: true, layer: 'object', desc: 'Every bathroom needs one.' },
  { id: 'blue_towel', name: 'Blue Towel', thai: 'ผ้าเช็ดตัวสีฟ้า', room: 'bathroom', price: 40, sprite: 'towel', variant: 'pinkTowel', size: [1, 1], layer: 'small', desc: 'A second towel in blue.' },

  // ----- Garden -----
  { id: 'bench', name: 'Bench', thai: 'ม้านั่งยาว', room: 'garden', price: 150, required: true, sprite: 'bench', size: [1, 1], rotatable: true, layer: 'object', desc: 'A long garden seat.' },
  { id: 'tree', name: 'Tree', thai: 'ต้นไม้', room: 'garden', price: 100, required: true, sprite: 'tree', size: [1, 1], layer: 'object', desc: 'A big green tree.' },
  { id: 'flowerpot', name: 'Flower Pot', thai: 'กระถางดอกไม้', room: 'garden', price: 80, required: true, sprite: 'flowerpot', size: [1, 1], layer: 'object', desc: 'Pretty flowers in a pot.' },
  { id: 'fountain', name: 'Fountain', thai: 'น้ำพุ', room: 'garden', price: 160, sprite: 'fountain', size: [1, 1], layer: 'object', desc: 'Water goes up and falls down.' },
  { id: 'pond', name: 'Pond', thai: 'บ่อน้ำ', room: 'garden', price: 120, sprite: 'pond', size: [2, 2], layer: 'object', desc: 'A home for fish and frogs.' },
  { id: 'fence', name: 'Fence', thai: 'รั้ว', room: 'garden', price: 60, sprite: 'fence', size: [1, 1], rotatable: true, layer: 'object', desc: 'A wooden fence.' },
  { id: 'gate', name: 'Gate', thai: 'ประตูรั้ว', room: 'garden', price: 70, sprite: 'gate', size: [1, 1], layer: 'object', desc: 'A door in the fence.' },
]

export const ITEM_BY_ID = Object.fromEntries(FURNITURE.map((f) => [f.id, f]))

export function itemsForRoom(roomId) {
  return FURNITURE.filter((f) => f.room === roomId)
}

export function requiredItems(roomId) {
  return FURNITURE.filter((f) => f.room === roomId && f.required)
}
