'use strict';
// ---------- HUD ----------
function drawWeapon() {
  const mv = P.moving, bx = Math.sin(P.bob) * 6 * mv, by = Math.abs(Math.cos(P.bob)) * 4 * mv;
  const t = P.fireDur > 0 ? P.firing / P.fireDur : 0;
  const w = P.weapon, kick = P.firing > 0 ? (t > 0.7 ? (1 - t) / 0.3 : t / 0.7) * (w === 2 ? 22 : w === 1 ? 12 : 0) : 0;
  const x = 160 + bx, y = VH + by + kick + (P.dead ? P.deadT * 60 : 0);
  const skin = '#c8905e', skinD = '#a8704a';
  g.save(); g.beginPath(); g.rect(0, 0, SW, VH); g.clip();
  if (w === 0) {
    const ext = P.firing > 0 ? Math.sin((1 - t) * Math.PI) * 50 : 0;
    R(g, skinD, x - 40, y - 26, 28, 30); R(g, skin, x - 38, y - 28, 24, 26);
    R(g, skinD, x + 12, y - 26 - ext, 28, 40 + ext); R(g, skin, x + 14, y - 28 - ext, 24, 30 + ext);
    for (let i = 0; i < 4; i++) R(g, skinD, x + 15 + i * 6, y - 28 - ext, 1, 8);
  } else if (w === 1) {
    R(g, '#2a2a2a', x - 7, y - 54, 14, 40); R(g, '#555', x - 5, y - 56, 10, 10); R(g, '#888', x - 2, y - 52, 3, 36);
    R(g, '#6a4a2a', x - 9, y - 26, 18, 16); R(g, skinD, x - 15, y - 24, 30, 26); R(g, skin, x - 13, y - 26, 26, 22);
    if (P.flash > 0.04) { T(g, '#ffe070', x - 12, y - 56, x + 12, y - 56, x, y - 80); T(g, '#fff', x - 5, y - 56, x + 5, y - 56, x, y - 72); }
  } else {
    R(g, '#3a3a3a', x - 11, y - 66, 22, 54); R(g, '#666', x - 9, y - 66, 8, 54); R(g, '#222', x + 1, y - 66, 8, 54);
    R(g, '#7a4a1e', x - 14, y - 36, 28, 22); R(g, '#5a3410', x - 14, y - 36, 28, 3);
    R(g, skinD, x - 20, y - 26, 40, 28); R(g, skin, x - 18, y - 28, 36, 24);
    if (P.flash > 0.04) { T(g, '#ffd060', x - 18, y - 68, x + 18, y - 68, x, y - 100); T(g, '#fff', x - 8, y - 68, x + 8, y - 68, x, y - 90); }
  }
  g.restore();
}
function drawFace(x, y) {
  const hp = P.health;
  R(g, '#2a2220', x, y, 32, 30);
  if (P.dead) { R(g, '#a07050', x + 3, y + 2, 26, 27); R(g, '#600', x + 3, y + 2, 26, 8); g.strokeStyle = '#000'; g.lineWidth = 1.5; for (const ex of [9, 19]) { g.beginPath(); g.moveTo(x + ex, y + 11); g.lineTo(x + ex + 5, y + 16); g.moveTo(x + ex + 5, y + 11); g.lineTo(x + ex, y + 16); g.stroke(); } R(g, '#300', x + 11, y + 22, 10, 4); return; }
  const skin = hp > 50 ? '#d6a173' : hp > 25 ? '#c4906a' : '#b5807a';
  R(g, skin, x + 3, y + 2, 26, 27); R(g, '#4a2f1a', x + 2, y, 28, 8); R(g, '#4a2f1a', x + 2, y + 6, 4, 8); R(g, '#4a2f1a', x + 26, y + 6, 4, 8);
  const lk = P.faceLook, hurt = P.hurt > 0.5;
  R(g, '#fff', x + 7, y + 11, 7, 4); R(g, '#fff', x + 18, y + 11, 7, 4);
  R(g, '#111', x + 9 + lk, y + 11, 3, 4); R(g, '#111', x + 20 + lk, y + 11, 3, 4);
  R(g, '#2a1a10', x + 6, y + 8 + (hurt ? 1 : 0), 9, 2); R(g, '#2a1a10', x + 17, y + 8 + (hurt ? 1 : 0), 9, 2);
  if (hurt) { R(g, '#400', x + 10, y + 21, 12, 5); R(g, '#fff', x + 11, y + 21, 10, 2); }
  else if (hp > 50) { R(g, '#5a2a1a', x + 11, y + 22, 10, 2); } else { R(g, '#5a2a1a', x + 10, y + 23, 12, 2); }
  g.fillStyle = 'rgba(190,0,0,0.85)';
  if (hp <= 75) { g.fillRect(x + 4, y + 12, 3, 8); g.fillRect(x + 22, y + 16, 2, 6); }
  if (hp <= 50) { g.fillRect(x + 12, y + 3, 3, 7); g.fillRect(x + 8, y + 24, 6, 2); }
  if (hp <= 25) { g.fillRect(x + 3, y + 3, 6, 10); g.fillRect(x + 20, y + 4, 8, 5); g.fillRect(x + 14, y + 16, 3, 10); }
}
function drawHUD() {
  const y0 = VH;
  R(g, '#5b514a', 0, y0, SW, SH - VH); R(g, '#8a7e74', 0, y0, SW, 1); R(g, '#2c2622', 0, y0 + 1, SW, 1);
  for (const x of [68, 134, 184, 250]) { R(g, '#2c2622', x, y0 + 2, 2, 30); R(g, '#8a7e74', x + 2, y0 + 2, 1, 30); }
  const lbl = (s, x, y) => { g.fillStyle = '#d8c8a0'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText(s, x, y); };
  const big = (s, x) => { g.fillStyle = '#d82a18'; g.font = 'bold 22px monospace'; g.textAlign = 'center'; g.fillText(s, x, y0 + 27); };
  const w = WEAPONS[P.weapon];
  big(w.ammo ? String(P.ammo[w.ammo]) : '--', 34); lbl('AMMO', 34, y0 + 8);
  big(Math.max(0, P.health | 0) + '%', 101); lbl('HEALTH', 101, y0 + 8);
  drawFace(146, y0 + 1);
  big((P.armor | 0) + '%', 217); lbl('ARMOR', 217, y0 + 8);
  g.font = 'bold 8px monospace'; g.textAlign = 'left';
  g.fillStyle = '#e8d890'; g.fillText('BULL ' + P.ammo.bullets + '/' + MAXAMMO.bullets, 254, y0 + 12);
  g.fillText('SHEL ' + P.ammo.shells + '/' + MAXAMMO.shells, 254, y0 + 22);
  g.fillStyle = P.has[0] ? '#fff' : '#555'; g.fillText('1', 254, y0 + 31);
  g.fillStyle = P.has[1] ? '#ffd23a' : '#555'; g.fillText('2', 266, y0 + 31);
  g.fillStyle = P.has[2] ? '#ffd23a' : '#555'; g.fillText('3', 278, y0 + 31);
  g.fillStyle = '#e8d890'; g.fillText(w.name, 290, y0 + 31);
}
function drawOverlays() {
  if (P.hurt > 0) { g.fillStyle = `rgba(210,0,0,${clamp(P.hurt, 0, 1) * 0.45})`; g.fillRect(0, 0, SW, VH); }
  if (P.pick > 0) { g.fillStyle = `rgba(230,210,60,${clamp(P.pick, 0, 1) * 0.3})`; g.fillRect(0, 0, SW, VH); }
  if (P.dead) { g.fillStyle = 'rgba(120,0,0,0.55)'; g.fillRect(0, 0, SW, VH); }
  if (msgT > 0) { g.font = 'bold 9px monospace'; g.textAlign = 'left'; g.fillStyle = '#000'; g.fillText(msg, 5, 13); g.fillStyle = '#ffe9a0'; g.fillText(msg, 4, 12); }
}
function drawAutomap() {
  g.fillStyle = 'rgba(0,0,0,0.78)'; g.fillRect(0, 0, SW, VH);
  const s = 7, ox = SW / 2 - P.x * s, oy = VH / 2 - P.y * s;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const c = map[y][x]; if (c === '.') continue;
    g.fillStyle = c === 'D' ? '#d6b000' : c === 'X' ? '#2fd05a' : '#a05030';
    g.fillRect(ox + x * s, oy + y * s, s - 1, s - 1);
  }
  for (const m of monsters) if (m.alive && m.type !== 'barrel') R(g, '#f33', ox + m.x * s - 1, oy + m.y * s - 1, 3, 3);
  g.strokeStyle = '#3f3'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(SW / 2, VH / 2); g.lineTo(SW / 2 + Math.cos(P.a) * 8, VH / 2 + Math.sin(P.a) * 8); g.stroke();
  C(g, '#3f3', SW / 2, VH / 2, 2);
}
function centerText(s, y, size, col, shadow = true) {
  g.font = `bold ${size}px monospace`; g.textAlign = 'center';
  if (shadow) { g.fillStyle = '#000'; g.fillText(s, SW / 2 + 1, y + 1); }
  g.fillStyle = col; g.fillText(s, SW / 2, y);
}
function drawTitle() {
  g.fillStyle = '#000'; g.fillRect(0, 0, SW, SH);
  const gr = g.createLinearGradient(0, 30, 0, 100); gr.addColorStop(0, '#ffb030'); gr.addColorStop(0.5, '#e02010'); gr.addColorStop(1, '#600000');
  g.font = 'bold 74px monospace'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = '#200'; g.strokeText('DOOM', SW / 2, 92); g.fillStyle = gr; g.fillText('DOOM', SW / 2, 92);
  centerText('WEB EDITION', 112, 12, '#d8c8a0');
  centerText('CLICK OR PRESS ENTER TO START', 140, 9, (Date.now() / 400 | 0) % 2 ? '#fff' : '#ffd23a');
  g.font = '8px monospace'; g.fillStyle = '#aaa'; g.textAlign = 'center';
  g.fillText('WASD MOVE   MOUSE/ARROWS TURN   SHIFT RUN', SW / 2, 158);
  g.fillText('CLICK/CTRL/F FIRE   SPACE/E USE   1-3 WEAPONS', SW / 2, 169);
  g.fillText('TAB MAP   M MUSIC   P PAUSE', SW / 2, 180);
}
function drawEnd(kind) {
  g.fillStyle = '#000'; g.fillRect(0, 0, SW, SH);
  if (kind === 'level') {
    centerText(LEVELS[level].name.split(':')[0] + ' FINISHED', 30, 14, '#ffd23a');
    const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '100%', tm = Math.floor(stats.time);
    g.font = 'bold 12px monospace'; g.textAlign = 'left'; g.fillStyle = '#d82a18';
    g.fillText('KILLS   ' + pc(stats.kills, stats.totalKills), 80, 70);
    g.fillText('ITEMS   ' + pc(stats.items, stats.totalItems), 80, 92);
    g.fillText('TIME    ' + Math.floor(tm / 60) + ':' + String(tm % 60).padStart(2, '0'), 80, 114);
    centerText('PRESS ENTER', 160, 10, (Date.now() / 400 | 0) % 2 ? '#fff' : '#ffd23a');
  } else {
    centerText('YOU HAVE CLEANSED', 70, 14, '#ffd23a'); centerText('THE BASE', 90, 14, '#ffd23a');
    centerText('THE END', 130, 20, '#d82a18'); centerText('PRESS ENTER', 170, 10, (Date.now() / 400 | 0) % 2 ? '#fff' : '#ffd23a');
  }
}
