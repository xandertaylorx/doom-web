'use strict';
// ---------- Game state ----------
const DEF = {
  zombie: { hp: 20, speed: 1.5, r: 0.28, cool: 1.0, pain: 1.0, spr: 'zom', kind: 'hitscan', hold: 3.0 },
  imp: { hp: 60, speed: 1.9, r: 0.30, cool: 1.3, pain: 0.8, spr: 'imp', kind: 'fire', hold: 1.6 },
  pinky: { hp: 150, speed: 3.4, r: 0.40, cool: 0.7, pain: 0.5, spr: 'pin', kind: 'melee', hold: 0 },
  barrel: { hp: 20, speed: 0, r: 0.30, spr: 'barrel' }
};
const WEAPONS = [
  { name: 'FIST', cool: 0.45, ammo: null, use: 0, pellets: 1, spread: 0.01, dmg: [2, 20], range: 1.3 },
  { name: 'PISTOL', cool: 0.4, ammo: 'bullets', use: 1, pellets: 1, spread: 0.02, dmg: [5, 15], range: 40 },
  { name: 'SHOTGUN', cool: 0.95, ammo: 'shells', use: 1, pellets: 7, spread: 0.13, dmg: [5, 15], range: 40 }
];
const MAXAMMO = { bullets: 200, shells: 50 };

let map = [], MW = 0, MH = 0, level = 0, doors = new Map();
let monsters = [], items = [], projs = [], fx = [];
let state = 'title', paused = false, showMap = false;
let stats = { kills: 0, totalKills: 0, items: 0, totalItems: 0, time: 0 };
let msg = '', msgT = 0, hintT = 0;
const P = { x: 1.5, y: 1.5, a: 0, health: 100, armor: 0, weapon: 1, has: [true, true, false], ammo: { bullets: 50, shells: 0 },
  cool: 0, firing: 0, fireDur: 0.4, flash: 0, hurt: 0, pick: 0, bob: 0, moving: 0, dead: false, faceT: 0, faceLook: 0, r: 0.25, deadT: 0 };
const isWall = c => c === '1' || c === '2' || c === '3' || c === '4' || c === 'X';

function resetPlayerFull() {
  P.health = 100; P.armor = 0; P.weapon = 1; P.has = [true, true, false]; P.ammo = { bullets: 50, shells: 0 };
}
function loadLevel(n) {
  level = n; const L = LEVELS[n];
  map = L.rows.map(r => r.split('')); MH = map.length; MW = Math.max(...map.map(r => r.length));
  for (const r of map) while (r.length < MW) r.push('1');
  monsters = []; items = []; projs = []; fx = []; doors = new Map();
  stats = { kills: 0, totalKills: 0, items: 0, totalItems: 0, time: 0 };
  const mons = { z: 'zombie', i: 'imp', p: 'pinky', b: 'barrel' }, its = { h: 'h', r: 'r', a: 'a', s: 's' };
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const c = map[y][x];
    if (c === 'P') { P.x = x + 0.5; P.y = y + 0.5; map[y][x] = '.'; }
    else if (mons[c]) { addMonster(mons[c], x + 0.5, y + 0.5); map[y][x] = '.'; }
    else if (its[c]) { addItem(its[c], x + 0.5, y + 0.5); map[y][x] = '.'; }
    else if (c === 'D') doors.set(y * MW + x, { x, y, open: 0, dir: 0, timer: 0 });
  }
  for (const [t, x, y] of L.extras || []) addItem(t, x + 0.5, y + 0.5);
  L.post(map);
  P.a = 0; P.cool = 0; P.firing = 0; P.flash = 0; P.hurt = 0; P.pick = 0; P.dead = false; P.deadT = 0;
  if (n === 1) P.a = Math.PI / 2;
  showMsg(L.name);
}
function addMonster(type, x, y) {
  const d = DEF[type];
  monsters.push({ type, x, y, hp: d.hp, r: d.r, alive: true, state: 'idle', t: 0, cool: 1, walkT: 0, sightT: Math.random() * 0.3, side: Math.random() < 0.5 ? 1 : -1, deadT: 0, hidden: false, kind: null });
  if (type !== 'barrel') stats.totalKills++;
}
function addItem(t, x, y) { items.push({ t, x, y, taken: false }); if (t !== 'c') stats.totalItems++; }
function showMsg(s) { msg = s; msgT = 3; }

// ---------- World queries ----------
function doorAt(x, y) { return doors.get(y * MW + x); }
function solidAt(x, y) {
  const tx = Math.floor(x), ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
  const c = map[ty][tx];
  if (isWall(c)) return true;
  if (c === 'D') return doorAt(tx, ty).open < 0.85;
  return false;
}
function blocked(x, y, r, self) {
  if (solidAt(x - r, y - r) || solidAt(x + r, y - r) || solidAt(x - r, y + r) || solidAt(x + r, y + r)) return true;
  for (const m of monsters) if (m !== self && m.alive && Math.hypot(m.x - x, m.y - y) < r + m.r) return true;
  if (self !== P && !P.dead && Math.hypot(P.x - x, P.y - y) < r + P.r) return true;
  return false;
}
function tryMove(e, dx, dy, r) {
  if (!blocked(e.x + dx, e.y, r, e)) e.x += dx;
  if (!blocked(e.x, e.y + dy, r, e)) e.y += dy;
}
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 0.2);
  for (let i = 1; i < n; i++) { const t = i / n; if (solidAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false; }
  return true;
}
