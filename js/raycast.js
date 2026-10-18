'use strict';
// ---------- Raycasting ----------
const hitA = { dist: 0, side: 0, texX: 0, ch: '1', door: null, key: -1 };
const hitB = { dist: 0, side: 0, texX: 0, ch: '1', door: null, key: -1 };
function cast(ox, oy, rdx, rdy, skipKey, out) {
  let mx = Math.floor(ox), my = Math.floor(oy);
  const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
  let stepX, stepY, sideX, sideY, side = 0;
  if (rdx < 0) { stepX = -1; sideX = (ox - mx) * ddx; } else { stepX = 1; sideX = (mx + 1 - ox) * ddx; }
  if (rdy < 0) { stepY = -1; sideY = (oy - my) * ddy; } else { stepY = 1; sideY = (my + 1 - oy) * ddy; }
  for (let i = 0; i < 80; i++) {
    if (sideX < sideY) { sideX += ddx; mx += stepX; side = 0; } else { sideY += ddy; my += stepY; side = 1; }
    if (mx < 0 || my < 0 || mx >= MW || my >= MH) { out.dist = 1e3; out.ch = '1'; out.door = null; out.side = side; out.texX = 0; out.key = -1; return out; }
    const c = map[my][mx]; let door = null;
    if (c === 'D') { door = doorAt(mx, my); if (door.open >= 1 || my * MW + mx === skipKey) continue; }
    else if (!isWall(c)) continue;
    const dist = side === 0 ? sideX - ddx : sideY - ddy;
    let wx = side === 0 ? oy + dist * rdy : ox + dist * rdx; wx -= Math.floor(wx);
    let tx = Math.floor(wx * TS);
    if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) tx = TS - 1 - tx;
    out.dist = dist; out.side = side; out.texX = tx; out.ch = c; out.door = door; out.key = my * MW + mx;
    return out;
  }
  out.dist = 1e3; out.ch = '1'; out.door = null; out.side = 0; out.texX = 0; out.key = -1; return out;
}

// ---------- Rendering ----------
let dirX, dirY, plX, plY;
const lf = d => (clamp(1.05 - d * 0.075, 0.2, 1) + P.flash * 0.35 > 1 ? 1 : clamp(1.05 - d * 0.075, 0.2, 1) + P.flash * 0.35) * 256 | 0;

function drawWallCol(x, h, o) {
  const lineH = PROJ / h.dist, top = HALF - lineH / 2;
  const doorH = lineH * (1 - o);
  const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(VH - 1, Math.floor(top + doorH));
  if (y1 < y0) return;
  const tex = TEX[h.ch], step = TS / lineH;
  let f = lf(h.dist); if (h.side === 1) f = (f * 205) >> 8;
  let tp = (y0 - top) * step + o * TS;
  for (let y = y0; y <= y1; y++) {
    buf[y * SW + x] = shade(tex[Math.min(63, tp | 0) * TS + h.texX], f);
    tp += step;
  }
}
function render3D() {
  const ca = Math.cos(P.a), sa = Math.sin(P.a);
  dirX = ca; dirY = sa; plX = -sa * PL; plY = ca * PL;
  const r0x = dirX - plX, r0y = dirY - plY, r1x = dirX + plX, r1y = dirY + plY;
  const fl = FLOORS[LEVELS[level].floor], ce = CEILS[LEVELS[level].ceil];
  for (let y = HALF; y < VH; y++) {
    const p = y - HALF + 0.5, rd = (PROJ * 0.5) / p, f = lf(rd);
    let fx0 = P.x + rd * r0x, fy0 = P.y + rd * r0y;
    const sx = rd * (r1x - r0x) / SW, sy = rd * (r1y - r0y) / SW;
    const ro = y * SW, co = (VH - 1 - y) * SW;
    for (let x = 0; x < SW; x++) {
      const i = (((fy0 * TS) & 63) << 6) | ((fx0 * TS) & 63);
      buf[ro + x] = shade(fl[i], f);
      buf[co + x] = shade(ce[i], f);
      fx0 += sx; fy0 += sy;
    }
  }
  for (let x = 0; x < SW; x++) {
    const cx = 2 * x / SW - 1, rdx = dirX + plX * cx, rdy = dirY + plY * cx;
    const h = cast(P.x, P.y, rdx, rdy, -1, hitA);
    if (h.door && h.door.open > 0) {
      const far = cast(P.x, P.y, rdx, rdy, h.key, hitB);
      zbuf[x] = h.door.open < 0.5 ? h.dist : far.dist;
      drawWallCol(x, far, 0);
      drawWallCol(x, h, h.door.open);
    } else { zbuf[x] = h.dist; drawWallCol(x, h, 0); }
  }
  drawSprites();
  g.putImageData(view, 0, 0);
}
function monsterTex(m) {
  const S = SP[DEF[m.type].spr];
  if (m.type === 'barrel') return m.alive ? S[0] : null;
  if (!m.alive) return m.deadT > 0 ? S[3] : S[4];
  if (m.state === 'pain') return S[3];
  if (m.state === 'attack') return S[2];
  if (m.state === 'idle') return S[0];
  return S[(m.walkT * 4 | 0) % 2];
}
function drawSprites() {
  const list = [];
  for (const m of monsters) { const t = monsterTex(m); if (t) list.push({ x: m.x, y: m.y, tex: t }); }
  for (const it of items) if (!it.taken) list.push({ x: it.x, y: it.y, tex: it.t === 'h' ? SP.medkit : it.t === 'r' ? SP.armor : it.t === 'a' ? SP.ammo : it.t === 'c' ? SP.clip : SP.shotgun });
  for (const p of projs) list.push({ x: p.x, y: p.y, tex: SP.fireball });
  for (const e of fx) {
    let tex = e.kind === 'puff' ? SP.puff : e.kind === 'blood' ? SP.blood : e.kind === 'burst' ? SP.burst : SP.boom[Math.min(2, (1 - e.life / e.max) * 3 | 0)];
    list.push({ x: e.x, y: e.y, tex });
  }
  for (const s of list) s.d = (s.x - P.x) * (s.x - P.x) + (s.y - P.y) * (s.y - P.y);
  list.sort((a, b) => b.d - a.d);
  const invDet = 1 / (plX * dirY - dirX * plY);
  for (const s of list) {
    const sx = s.x - P.x, sy = s.y - P.y;
    const tX = invDet * (dirY * sx - dirX * sy), tY = invDet * (-plY * sx + plX * sy);
    if (tY < 0.15) continue;
    const scrX = (SW / 2) * (1 + tX / tY), h = PROJ / tY, w = SW / (2 * PL * tY), top = HALF - h / 2;
    const x0 = Math.max(0, Math.floor(scrX - w / 2)), x1 = Math.min(SW - 1, Math.floor(scrX + w / 2));
    const y0 = Math.max(0, Math.floor(top)), y1 = Math.min(VH - 1, Math.floor(top + h));
    const f = lf(tY);
    for (let x = x0; x <= x1; x++) {
      if (tY >= zbuf[x]) continue;
      const tx = Math.min(63, ((x - (scrX - w / 2)) * TS / w) | 0);
      for (let y = y0; y <= y1; y++) {
        const c = s.tex[Math.min(63, ((y - top) * TS / h) | 0) * TS + tx];
        if (c) buf[y * SW + x] = shade(c, f);
      }
    }
  }
}
