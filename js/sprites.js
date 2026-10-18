'use strict';
// ---------- Procedural sprites ----------
const SP = {};
function drawImp(gx, f) {
  if (f === 4) { R(gx, '#6b3b1f', 8, 54, 48, 8); R(gx, '#8a4a28', 14, 50, 20, 6); R(gx, '#4a2a14', 40, 52, 14, 6); R(gx, '#a00', 10, 59, 40, 3); return; }
  const body = f === 3 ? '#b8683e' : '#7a4426', dark = '#4d2a15', lx = f === 0 ? -3 : f === 1 ? 3 : 0;
  R(gx, dark, 24 + lx, 42, 9, 20); R(gx, dark, 34 - lx, 42, 9, 20);
  R(gx, '#2a1508', 22 + lx, 59, 12, 4); R(gx, '#2a1508', 33 - lx, 59, 12, 4);
  R(gx, body, 22, 22, 24, 24); R(gx, '#9a5a34', 26, 26, 16, 6);
  T(gx, '#d8cfc0', 20, 22, 26, 22, 20, 14); T(gx, '#d8cfc0', 42, 22, 48, 22, 48, 14);
  if (f === 2) { R(gx, body, 46, 12, 6, 16); C(gx, '#ff6a00', 52, 9, 6); C(gx, '#ffd040', 52, 9, 3); R(gx, body, 14, 24, 8, 18); }
  else { R(gx, body, 14, 24, 8, 20); R(gx, body, 46, 24, 8, 20); R(gx, '#ddd', 13, 44, 3, 5); R(gx, '#ddd', 18, 44, 3, 5); R(gx, '#ddd', 47, 44, 3, 5); R(gx, '#ddd', 52, 44, 3, 5); }
  R(gx, body, 26, 8, 16, 16); T(gx, '#d8cfc0', 26, 8, 29, 8, 26, 2); T(gx, '#d8cfc0', 39, 8, 42, 8, 42, 2);
  R(gx, '#ffe040', 29, 13, 4, 3); R(gx, '#ffe040', 36, 13, 4, 3); R(gx, '#200', 30, 19, 8, 3);
}
function drawZom(gx, f) {
  if (f === 4) { R(gx, '#3d5a30', 8, 56, 40, 6); R(gx, '#c9a27a', 46, 56, 8, 5); R(gx, '#222', 20, 52, 14, 4); R(gx, '#a00', 12, 60, 36, 2); return; }
  const lx = f === 0 ? -3 : f === 1 ? 3 : 0, skin = f === 3 ? '#e8b890' : '#c9a27a';
  R(gx, '#2f4a28', 24 + lx, 44, 8, 18); R(gx, '#2f4a28', 34 - lx, 44, 8, 18);
  R(gx, '#111', 23 + lx, 59, 10, 4); R(gx, '#111', 34 - lx, 59, 10, 4);
  R(gx, '#4a6a3a', 22, 22, 24, 26); R(gx, '#6b4a2a', 22, 40, 24, 4);
  R(gx, skin, 27, 6, 14, 15); R(gx, '#3a3a3a', 26, 3, 16, 6);
  R(gx, '#111', 30, 12, 3, 3); R(gx, '#111', 36, 12, 3, 3); R(gx, '#7a3a2a', 31, 17, 6, 2);
  if (f === 2) { R(gx, '#4a6a3a', 44, 22, 10, 6); R(gx, '#333', 50, 20, 12, 5); C(gx, '#ffd34d', 62, 22, 2); R(gx, '#4a6a3a', 16, 24, 7, 16); }
  else { R(gx, '#4a6a3a', 16, 24, 7, 16); R(gx, skin, 16, 40, 7, 5); R(gx, '#4a6a3a', 45, 24, 7, 14); R(gx, '#333', 44, 36, 14, 5); }
}
function drawPin(gx, f) {
  if (f === 4) { R(gx, '#a04565', 6, 52, 52, 10); E(gx, '#c05a7a', 30, 52, 20, 6); R(gx, '#c00', 10, 60, 44, 3); return; }
  const lx = f === 0 ? -3 : f === 1 ? 3 : 0, col = f === 3 ? '#e07090' : '#b8607a';
  R(gx, '#8a3a55', 18 + lx, 48, 12, 14); R(gx, '#8a3a55', 34 - lx, 48, 12, 14);
  E(gx, col, 32, 40, 22, 17); E(gx, '#d07890', 32, 42, 14, 10);
  const hy = f === 2 ? 26 : 22;
  E(gx, col, 32, hy, 15, 13);
  R(gx, '#ffe040', 23, hy - 6, 5, 3); R(gx, '#ffe040', 36, hy - 6, 5, 3);
  R(gx, '#3a0010', 22, hy + 2, 20, f === 2 ? 11 : 6);
  for (let i = 0; i < 5; i++) T(gx, '#fff', 23 + i * 4, hy + 2, 27 + i * 4, hy + 2, 25 + i * 4, hy + 7);
  T(gx, '#ddd', 18, hy - 8, 22, hy - 8, 17, hy - 16); T(gx, '#ddd', 42, hy - 8, 46, hy - 8, 47, hy - 16);
}
function drawBarrel(gx) {
  R(gx, '#2f6a2f', 20, 28, 24, 34); E(gx, '#3f8a3f', 32, 28, 12, 4); E(gx, '#1f4a1f', 32, 62, 12, 3);
  R(gx, '#1f4a1f', 20, 36, 24, 2); R(gx, '#1f4a1f', 20, 54, 24, 2); R(gx, '#e0c020', 28, 41, 8, 9); R(gx, '#111', 31, 43, 2, 5);
}
function drawItems() {
  SP.medkit = makeSprite(gx => { R(gx, '#eee', 18, 48, 28, 14); R(gx, '#c00', 30, 50, 4, 10); R(gx, '#c00', 26, 53, 12, 4); });
  SP.armor = makeSprite(gx => { R(gx, '#2a8a3a', 20, 42, 24, 20); R(gx, '#3fbf55', 22, 44, 8, 8); R(gx, '#1a5a26', 28, 42, 8, 6); R(gx, '#1a5a26', 20, 56, 24, 3); });
  SP.ammo = makeSprite(gx => { R(gx, '#6b5a2a', 18, 50, 28, 12); for (let i = 0; i < 5; i++) { R(gx, '#d4a017', 20 + i * 5, 44, 3, 8); R(gx, '#a07010', 20 + i * 5, 44, 3, 2); } });
  SP.clip = makeSprite(gx => { R(gx, '#444', 26, 54, 12, 8); R(gx, '#d4a017', 28, 50, 3, 5); R(gx, '#d4a017', 33, 50, 3, 5); });
  SP.shotgun = makeSprite(gx => { R(gx, '#555', 8, 54, 44, 3); R(gx, '#333', 8, 57, 44, 3); R(gx, '#7a4a1e', 36, 52, 20, 9); R(gx, '#222', 30, 52, 4, 8); });
  SP.fireball = makeSprite(gx => { C(gx, '#ff6a00', 32, 32, 9); C(gx, '#ffd040', 32, 32, 5); C(gx, '#fff', 32, 32, 2); });
  SP.puff = makeSprite(gx => { C(gx, '#b0b0b0', 32, 32, 4); C(gx, '#888', 28, 29, 2); C(gx, '#888', 36, 35, 2); });
  SP.blood = makeSprite(gx => { C(gx, '#b00000', 32, 32, 4); C(gx, '#800', 27, 36, 2); C(gx, '#800', 37, 28, 2); });
  SP.boom = [
    makeSprite(gx => { C(gx, '#ff8a00', 32, 40, 14); C(gx, '#ffd23a', 32, 40, 8); }),
    makeSprite(gx => { C(gx, '#ff6a00', 32, 36, 24); C(gx, '#ffb020', 32, 36, 16); C(gx, '#fff2a0', 32, 36, 7); }),
    makeSprite(gx => { C(gx, '#3a2a20', 32, 30, 28); C(gx, '#ff5a00', 32, 34, 18); C(gx, '#ffb020', 32, 34, 9); })
  ];
  SP.burst = makeSprite(gx => { C(gx, '#ff8a00', 32, 32, 11); C(gx, '#ffe070', 32, 32, 6); });
}
SP.imp = [0, 1, 2, 3, 4].map(f => makeSprite(gx => drawImp(gx, f)));
SP.zom = [0, 1, 2, 3, 4].map(f => makeSprite(gx => drawZom(gx, f)));
SP.pin = [0, 1, 2, 3, 4].map(f => makeSprite(gx => drawPin(gx, f)));
SP.barrel = [makeSprite(drawBarrel)];
drawItems();
