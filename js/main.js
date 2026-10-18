'use strict';
// ---------- Update ----------
function updatePlayer(dt) {
  P.a += ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 2.6 * dt + mouseDX * 0.0028; mouseDX = 0;
  const fw = ((keys.KeyW || keys.ArrowUp) ? 1 : 0) - ((keys.KeyS || keys.ArrowDown) ? 1 : 0), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  let vx = Math.cos(P.a) * fw - Math.sin(P.a) * st, vy = Math.sin(P.a) * fw + Math.cos(P.a) * st;
  const len = Math.hypot(vx, vy);
  if (len > 0) {
    const sp = (keys.ShiftLeft || keys.ShiftRight ? 5.4 : 3.5) * dt;
    tryMove(P, vx / len * sp, vy / len * sp, P.r);
    P.bob += dt * (keys.ShiftLeft || keys.ShiftRight ? 13 : 9); P.moving = Math.min(1, P.moving + dt * 8);
  } else P.moving = Math.max(0, P.moving - dt * 8);
  if (keys.ControlLeft || keys.ControlRight || keys.KeyF || mouseHeld) fire();
  P.cool = Math.max(0, P.cool - dt); P.firing = Math.max(0, P.firing - dt); P.flash = Math.max(0, P.flash - dt);
  P.hurt = Math.max(0, P.hurt - dt * 1.4); P.pick = Math.max(0, P.pick - dt * 1.5);
  P.faceT -= dt; if (P.faceT <= 0) { P.faceT = rand(0.8, 2); P.faceLook = [-2, 0, 0, 2][irand(0, 3)]; }
}
function update(dt) {
  if (state === 'play' && !paused) {
    stats.time += dt;
    if (msgT > 0) msgT -= dt;
    hintT += dt;
    if (hintT > 25 && msgT <= 0) { hintT = 0; showMsg(stats.kills >= stats.totalKills ? 'ALL CLEAR - FIND THE EXIT (TAB = MAP)' : 'GO THROUGH THE DOORS (SPACE) - TAB = MAP'); }
    updatePlayer(dt); updateDoors(dt); pickups();
    for (const m of monsters) updateMonster(m, dt);
    updateProjs(dt);
    for (let i = fx.length - 1; i >= 0; i--) { fx[i].life -= dt; if (fx[i].life <= 0) fx.splice(i, 1); }
  } else if (state === 'dead') {
    P.deadT = Math.min(1, P.deadT + dt); P.hurt = Math.max(0, P.hurt - dt);
    for (let i = fx.length - 1; i >= 0; i--) { fx[i].life -= dt; if (fx[i].life <= 0) fx.splice(i, 1); }
    for (const m of monsters) if (m.deadT > 0) m.deadT -= dt;
  }
}

// ---------- Main loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt);
  if (state === 'title') drawTitle();
  else if (state === 'levelend') drawEnd('level');
  else if (state === 'end') drawEnd('end');
  else {
    render3D(); drawWeapon(); drawOverlays();
    if (showMap) drawAutomap();
    drawHUD();
    if (state === 'dead') { centerText('YOU DIED', 80, 22, '#ff3020'); centerText('PRESS ENTER OR CLICK TO RETRY', 100, 8, '#fff'); }
    else if (paused) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 0, SW, VH); centerText('PAUSED', 80, 20, '#ffd23a'); centerText('CLICK OR PRESS P TO RESUME', 100, 8, '#fff'); }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
