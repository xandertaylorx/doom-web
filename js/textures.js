'use strict';
// ---------- Procedural textures ----------
const TS = 64;
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const R = (gx, c, x, y, w, h) => { gx.fillStyle = c; gx.fillRect(x, y, w, h); };
const C = (gx, c, x, y, r) => { gx.fillStyle = c; gx.beginPath(); gx.arc(x, y, r, 0, 7); gx.fill(); };
const E = (gx, c, x, y, rx, ry) => { gx.fillStyle = c; gx.beginPath(); gx.ellipse(x, y, rx, ry, 0, 0, 7); gx.fill(); };
const T = (gx, c, x1, y1, x2, y2, x3, y3) => { gx.fillStyle = c; gx.beginPath(); gx.moveTo(x1, y1); gx.lineTo(x2, y2); gx.lineTo(x3, y3); gx.fill(); };

function makeTex(draw, noise = 18) {
  const c = mkCanvas(TS, TS), gx = c.getContext('2d'); draw(gx);
  const d = gx.getImageData(0, 0, TS, TS).data, out = new Uint32Array(TS * TS);
  for (let i = 0; i < TS * TS; i++) {
    const n = (srnd() - 0.5) * noise;
    out[i] = pack(clamp(d[i * 4] + n, 0, 255), clamp(d[i * 4 + 1] + n, 0, 255), clamp(d[i * 4 + 2] + n, 0, 255));
  }
  return out;
}
function makeSprite(draw) {
  const c = mkCanvas(TS, TS), gx = c.getContext('2d'); draw(gx);
  const d = gx.getImageData(0, 0, TS, TS).data, out = new Uint32Array(TS * TS);
  for (let i = 0; i < TS * TS; i++) out[i] = d[i * 4 + 3] > 128 ? pack(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) : 0;
  return out;
}

const TEX = {};
TEX['1'] = makeTex(gx => { // brick
  R(gx, '#7a3b2a', 0, 0, 64, 64);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
    const off = (r % 2) * 16, s = 0.85 + srnd() * 0.3;
    R(gx, `rgb(${122 * s | 0},${59 * s | 0},${42 * s | 0})`, (off + k * 32) % 64, r * 16, 32, 16);
  }
  gx.fillStyle = '#2e1f1a';
  for (let r = 0; r < 4; r++) { gx.fillRect(0, r * 16, 64, 2); for (let k = 0; k < 3; k++) gx.fillRect(((r % 2) * 16 + k * 32) % 64, r * 16, 2, 16); }
});
TEX['2'] = makeTex(gx => { // tech panel
  R(gx, '#4a5568', 0, 0, 64, 64);
  R(gx, '#2d3748', 0, 30, 64, 4); R(gx, '#2d3748', 0, 0, 64, 2); R(gx, '#2d3748', 0, 62, 64, 2);
  gx.strokeStyle = '#1a202c'; gx.lineWidth = 2; gx.strokeRect(4, 4, 24, 22); gx.strokeRect(36, 4, 24, 22); gx.strokeRect(4, 38, 56, 20);
  R(gx, '#3182ce', 8, 8, 6, 3); R(gx, '#e53e3e', 18, 8, 6, 3); R(gx, '#38a169', 40, 8, 6, 3); R(gx, '#ecc94b', 50, 8, 6, 3);
  R(gx, '#1a202c', 10, 44, 44, 8); R(gx, '#4fd1c5', 12, 46, 20, 4);
});
TEX['3'] = makeTex(gx => { // metal
  R(gx, '#707070', 0, 0, 64, 64);
  R(gx, '#3c3c3c', 0, 0, 3, 64); R(gx, '#3c3c3c', 61, 0, 3, 64); R(gx, '#3c3c3c', 30, 0, 4, 64);
  for (let y = 6; y < 64; y += 16) { C(gx, '#999', 8, y, 2); C(gx, '#999', 56, y, 2); C(gx, '#999', 20, y, 2); C(gx, '#999', 44, y, 2); }
  R(gx, '#555', 0, 28, 64, 2); R(gx, '#ccc', 0, 30, 64, 1);
});
TEX['4'] = makeTex(gx => { // green marble
  R(gx, '#2c5a2c', 0, 0, 64, 64);
  gx.strokeStyle = '#6fbf6f'; gx.lineWidth = 1;
  for (let i = 0; i < 10; i++) { gx.beginPath(); let x = srnd() * 64, y = 0; gx.moveTo(x, y); while (y < 64) { x += (srnd() - 0.5) * 10; y += 6; gx.lineTo(x, y); } gx.stroke(); }
  R(gx, '#173317', 0, 0, 64, 2); R(gx, '#173317', 0, 62, 64, 2);
}, 26);
TEX['D'] = makeTex(gx => { // door
  R(gx, '#8a8a7a', 0, 0, 64, 64);
  for (let y = 8; y < 64; y += 8) R(gx, '#5e5e52', 0, y, 64, 2);
  for (let x = 0; x < 64; x += 8) { R(gx, '#d6b000', x, 0, 4, 6); R(gx, '#111', x + 4, 0, 4, 6); }
  R(gx, '#333', 0, 0, 3, 64); R(gx, '#333', 61, 0, 3, 64); R(gx, '#222', 28, 30, 8, 14);
});
TEX['X'] = makeTex(gx => { // exit switch
  R(gx, '#2a2a2a', 0, 0, 64, 64); gx.strokeStyle = '#2fd05a'; gx.lineWidth = 3; gx.strokeRect(3, 3, 58, 58);
  gx.fillStyle = '#2fd05a'; gx.font = 'bold 20px monospace'; gx.textAlign = 'center'; gx.fillText('EXIT', 32, 30);
  T(gx, '#2fd05a', 22, 38, 42, 38, 32, 54);
}, 8);
const FLOORS = [
  makeTex(gx => { R(gx, '#5a5650', 0, 0, 64, 64); R(gx, '#4a4640', 0, 0, 32, 32); R(gx, '#4a4640', 32, 32, 32, 32); gx.strokeStyle = '#2a2824'; gx.lineWidth = 2; gx.strokeRect(0, 0, 64, 64); }, 24),
  makeTex(gx => { R(gx, '#5a3a2a', 0, 0, 64, 64); R(gx, '#4a2e22', 0, 0, 32, 32); R(gx, '#4a2e22', 32, 32, 32, 32); gx.strokeStyle = '#241410'; gx.lineWidth = 2; gx.strokeRect(0, 0, 64, 64); }, 24)
];
const CEILS = [
  makeTex(gx => { R(gx, '#2a2e36', 0, 0, 64, 64); gx.strokeStyle = '#14161a'; gx.lineWidth = 2; gx.strokeRect(1, 1, 62, 62); R(gx, '#4a4f5a', 24, 24, 16, 16); R(gx, '#fff3b0', 28, 28, 8, 8); }, 14),
  makeTex(gx => { R(gx, '#2e2024', 0, 0, 64, 64); gx.strokeStyle = '#140c0e'; gx.lineWidth = 2; gx.strokeRect(1, 1, 62, 62); R(gx, '#5a3a40', 24, 24, 16, 16); R(gx, '#ff7a50', 28, 28, 8, 8); }, 14)
];
