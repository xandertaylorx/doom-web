'use strict';
// ---------- Combat ----------
function hurtPlayer(d) {
  if (P.dead) return;
  if (P.armor > 0) { const s = Math.min(P.armor, Math.ceil(d / 3)); P.armor -= s; d -= s; }
  P.health -= d; P.hurt = clamp(P.hurt + d / 30, 0.2, 1); P.faceLook = Math.random() < 0.5 ? -2 : 2;
  sfx('hurt', 0.8);
  if (P.health <= 0) { P.health = 0; P.dead = true; P.deadT = 0; state = 'dead'; sfx('pdie'); document.exitPointerLock && document.exitPointerLock(); }
}
function wake(m) { if (m.state === 'idle') { m.state = 'chase'; m.cool = 0.6; sfx('see', distVol(m.x, m.y) * 0.7); } }
function damageMonster(m, d) {
  if (!m.alive) return;
  m.hp -= d;
  if (m.type !== 'barrel') wake(m);
  if (m.hp <= 0) { killMonster(m); return; }
  if (m.type !== 'barrel' && Math.random() < DEF[m.type].pain) { m.state = 'pain'; m.t = 0.28; sfx('pain', distVol(m.x, m.y)); }
}
function killMonster(m) {
  m.alive = false; m.hp = 0;
  if (m.type === 'barrel') { explode(m.x, m.y); return; }
  m.deadT = 0.25; stats.kills++; sfx('die', distVol(m.x, m.y));
  if (m.type === 'zombie') items.push({ t: 'c', x: m.x, y: m.y, taken: false });
}
function explode(x, y) {
  sfx('boom', distVol(x, y)); fx.push({ x, y, kind: 'boom', life: 0.5, max: 0.5 });
  const R_ = 2.6;
  const dp = Math.hypot(P.x - x, P.y - y);
  if (dp < R_ && !P.dead) hurtPlayer(Math.round(70 * (1 - dp / R_)) + 5);
  for (const m of monsters) {
    if (!m.alive) continue;
    const d = Math.hypot(m.x - x, m.y - y);
    if (d < R_) { if (m.type === 'barrel') { m.hp = 0; m.alive = false; setTimeout(() => explode(m.x, m.y), 120); } else damageMonster(m, Math.round(90 * (1 - d / R_)) + 5); }
  }
}
function hitscan(ang, dmg, range, fromPlayer, ox, oy, accurate) {
  const cx = Math.cos(ang), cy = Math.sin(ang);
  const w = cast(ox, oy, cx, cy, -1, hitB), wd = Math.min(w.dist, range);
  if (fromPlayer) {
    let best = null, bd = wd;
    for (const m of monsters) {
      if (!m.alive) continue;
      const dx = m.x - ox, dy = m.y - oy, along = dx * cx + dy * cy, perp = Math.abs(-dx * cy + dy * cx);
      if (along > 0.15 && along < bd && perp < m.r + 0.05) { best = m; bd = along; }
    }
    if (best) {
      fx.push({ x: ox + cx * (bd - 0.1), y: oy + cy * (bd - 0.1), kind: best.type === 'barrel' ? 'puff' : 'blood', life: 0.35, max: 0.35 });
      damageMonster(best, dmg);
    } else if (w.dist <= range) {
      fx.push({ x: ox + cx * (wd - 0.08), y: oy + cy * (wd - 0.08), kind: 'puff', life: 0.35, max: 0.35 });
    }
  }
}
function fire() {
  if (P.cool > 0 || P.dead) return;
  const w = WEAPONS[P.weapon];
  if (w.ammo && P.ammo[w.ammo] < w.use) { P.weapon = P.ammo.bullets > 0 && P.has[1] ? 1 : 0; return; }
  if (w.ammo) P.ammo[w.ammo] -= w.use;
  P.cool = w.cool; P.fireDur = w.cool; P.firing = w.cool; P.flash = w.ammo ? 0.12 : 0;
  sfx(P.weapon === 0 ? 'punch' : P.weapon === 1 ? 'pistol' : 'shotgun');
  if (w.ammo) for (const m of monsters) if (m.state === 'idle' && m.type !== 'barrel' && Math.hypot(m.x - P.x, m.y - P.y) < 18) wake(m);
  for (let i = 0; i < w.pellets; i++) {
    hitscan(P.a + (Math.random() - 0.5) * 2 * w.spread, irand(w.dmg[0], w.dmg[1]), w.range, true, P.x, P.y);
  }
}
function monsterAttack(m) {
  const d = DEF[m.type], dist = Math.hypot(P.x - m.x, P.y - m.y);
  if (m.kind === 'melee') { if (dist < 1.3) { hurtPlayer(m.type === 'pinky' ? irand(1, 10) * 4 : irand(1, 8) * 3); sfx('splat', 0.8); } return; }
  if (d.kind === 'hitscan') {
    sfx('pistol', distVol(m.x, m.y) * 0.7);
    if (los(m.x, m.y, P.x, P.y) && Math.random() < clamp(1.1 - dist / 14, 0.25, 0.95)) hurtPlayer(irand(1, 5) * 3);
  } else if (d.kind === 'fire') {
    const a = Math.atan2(P.y - m.y, P.x - m.x);
    projs.push({ x: m.x, y: m.y, vx: Math.cos(a) * 5.5, vy: Math.sin(a) * 5.5, dmg: irand(1, 8) * 3 });
    sfx('fireball', distVol(m.x, m.y));
  }
}
function updateMonster(m, dt) {
  if (m.deadT > 0) m.deadT -= dt;
  if (!m.alive || m.type === 'barrel') return;
  const d = DEF[m.type], dx = P.x - m.x, dy = P.y - m.y, dist = Math.hypot(dx, dy);
  if (m.state === 'idle') {
    m.sightT -= dt;
    if (m.sightT <= 0) { m.sightT = 0.25; if (!P.dead && dist < 20 && los(m.x, m.y, P.x, P.y)) wake(m); }
    return;
  }
  if (m.state === 'pain') { m.t -= dt; if (m.t <= 0) m.state = 'chase'; return; }
  if (m.state === 'attack') { m.t -= dt; if (m.t <= 0) { monsterAttack(m); m.state = 'chase'; m.cool = d.cool * rand(0.8, 1.4); } return; }
  if (P.dead) return;
  m.walkT += dt; m.cool -= dt;
  const sees = los(m.x, m.y, P.x, P.y);
  if (m.cool <= 0 && sees) {
    if (dist < 1.25 && (d.kind === 'melee' || m.type === 'imp')) { m.state = 'attack'; m.kind = 'melee'; m.t = 0.4; return; }
    if (d.kind !== 'melee' && dist < 18 && Math.random() < 0.6) { m.state = 'attack'; m.kind = 'range'; m.t = 0.45; return; }
    m.cool = 0.3;
  }
  if (dist > (sees ? d.hold : 0.6)) {
    const a = Math.atan2(dy, dx), sp = d.speed * dt;
    for (const off of [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9]) {
      const aa = a + off * m.side, mx = Math.cos(aa) * sp, my = Math.sin(aa) * sp;
      if (off === 0) {
        const dr = doorAt(Math.floor(m.x + Math.cos(aa) * (m.r + 0.4)), Math.floor(m.y + Math.sin(aa) * (m.r + 0.4)));
        if (dr && dr.open < 0.9 && dr.dir !== 1) openDoor(dr);
      }
      if (!blocked(m.x + mx, m.y + my, m.r, m)) { m.x += mx; m.y += my; return; }
    }
    m.side = -m.side;
  }
}
function updateProjs(dt) {
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i]; p.x += p.vx * dt; p.y += p.vy * dt;
    let dead = false;
    if (solidAt(p.x, p.y)) dead = true;
    else if (!P.dead && Math.hypot(p.x - P.x, p.y - P.y) < 0.4) { hurtPlayer(p.dmg); dead = true; }
    if (dead) { fx.push({ x: p.x - p.vx * dt, y: p.y - p.vy * dt, kind: 'burst', life: 0.25, max: 0.25 }); sfx('splat', distVol(p.x, p.y) * 0.6); projs.splice(i, 1); }
  }
}

// ---------- Doors / use ----------
function openDoor(d) { if (d.open >= 1) { d.timer = 4; return; } if (d.dir !== 1) { d.dir = 1; sfx('door', distVol(d.x + 0.5, d.y + 0.5)); } }
function updateDoors(dt) {
  for (const d of doors.values()) {
    if (d.dir === 1) { d.open += dt * 1.8; if (d.open >= 1) { d.open = 1; d.dir = 0; d.timer = 4; } }
    else if (d.dir === -1) {
      d.open -= dt * 1.8;
      if (d.open <= 0) { d.open = 0; d.dir = 0; }
    } else if (d.open >= 1) {
      d.timer -= dt;
      if (d.timer <= 0) {
        let occ = (Math.floor(P.x) === d.x && Math.floor(P.y) === d.y);
        for (const m of monsters) if (m.alive && Math.floor(m.x) === d.x && Math.floor(m.y) === d.y) occ = true;
        if (occ) d.timer = 1; else { d.dir = -1; sfx('door', distVol(d.x + 0.5, d.y + 0.5) * 0.7); }
      }
    }
  }
}
function useKey() {
  for (let d = 0.3; d <= 1.6; d += 0.1) {
    const tx = Math.floor(P.x + Math.cos(P.a) * d), ty = Math.floor(P.y + Math.sin(P.a) * d);
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return;
    const c = map[ty][tx];
    if (c === 'D') {
      openDoor(doorAt(tx, ty));
      for (const m of monsters) if (m.state === 'idle' && m.type !== 'barrel' && Math.hypot(m.x - P.x, m.y - P.y) < 12) m.sightT = 0, m.state = 'chase', m.cool = 0.8;
      return;
    }
    if (c === 'X') { state = 'levelend'; sfx('pickup'); document.exitPointerLock && document.exitPointerLock(); return; }
    if (isWall(c)) return;
  }
}

// ---------- Items ----------
function pickups() {
  for (const it of items) {
    if (it.taken || Math.hypot(it.x - P.x, it.y - P.y) > 0.6) continue;
    let ok = false;
    if (it.t === 'h') { if (P.health < 100) { P.health = Math.min(100, P.health + 25); ok = true; showMsg('PICKED UP A MEDIKIT'); } }
    else if (it.t === 'r') { if (P.armor < 100) { P.armor = 100; ok = true; showMsg('PICKED UP THE ARMOR'); } }
    else if (it.t === 'a') { if (P.ammo.bullets < 200 || P.ammo.shells < 50) { P.ammo.bullets = Math.min(200, P.ammo.bullets + 20); if (P.has[2]) P.ammo.shells = Math.min(50, P.ammo.shells + 4); ok = true; showMsg('PICKED UP AN AMMO BOX'); } }
    else if (it.t === 'c') { if (P.ammo.bullets < 200) { P.ammo.bullets = Math.min(200, P.ammo.bullets + 10); ok = true; showMsg('PICKED UP A CLIP'); } }
    else if (it.t === 's') { P.has[2] = true; P.ammo.shells = Math.min(50, P.ammo.shells + 8); P.weapon = 2; ok = true; showMsg('YOU GOT THE SHOTGUN!'); sfx('weapon'); }
    if (ok) { it.taken = true; if (it.t !== 'c') stats.items++; P.pick = 0.4; if (it.t !== 's') sfx('pickup'); }
  }
}
