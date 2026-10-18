'use strict';
// ---------- Input ----------
const keys = {}; let mouseDX = 0, mouseHeld = false;
function selectWeapon(n) { if (P.has[n] && !P.dead) { P.weapon = n; sfx('weapon', 0.4); } }
function lockPointer() { try { const p = cv.requestPointerLock && cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
function startGame() { initAudio(); resetPlayerFull(); loadLevel(0); state = 'play'; paused = false; lockPointer(); }
function onKeyPress(code) {
  if (code === 'Enter') {
    if (state === 'title') startGame();
    else if (state === 'dead') { resetPlayerFull(); loadLevel(level); state = 'play'; lockPointer(); }
    else if (state === 'levelend') { if (level + 1 < LEVELS.length) { loadLevel(level + 1); state = 'play'; lockPointer(); } else state = 'end'; }
    else if (state === 'end') { state = 'title'; }
    return;
  }
  if (state !== 'play') return;
  if (code === 'Space' || code === 'KeyE') { if (paused) return; useKey(); }
  else if (code === 'Digit1') selectWeapon(0); else if (code === 'Digit2') selectWeapon(1); else if (code === 'Digit3') selectWeapon(2);
  else if (code === 'Tab') showMap = !showMap;
  else if (code === 'KeyM') musicOn = !musicOn;
  else if (code === 'KeyP' || code === 'Escape') { paused = !paused; if (!paused) lockPointer(); }
}
addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (!keys[e.code]) onKeyPress(e.code);
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseHeld = false; if (state === 'play') paused = true; });
document.addEventListener('mousemove', e => { if (document.pointerLockElement === cv) mouseDX += e.movementX; });
cv.addEventListener('mousedown', e => {
  initAudio();
  if (state === 'title') { startGame(); return; }
  if (state === 'dead' || state === 'levelend' || state === 'end') { onKeyPress('Enter'); return; }
  if (paused) { paused = false; lockPointer(); return; }
  if (document.pointerLockElement !== cv) lockPointer();
  mouseHeld = true;
});
addEventListener('mouseup', () => { mouseHeld = false; });
document.addEventListener('pointerlockchange', () => { if (document.pointerLockElement !== cv && state === 'play') paused = true; });
cv.addEventListener('contextmenu', e => e.preventDefault());
