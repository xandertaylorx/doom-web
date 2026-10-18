'use strict';
// ---------- Audio (all synthesised) ----------
let AC = null, master = null, musicGain = null, musicOn = true, noiseBuffer = null;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = 0.7; master.connect(AC.destination);
    musicGain = AC.createGain(); musicGain.gain.value = 0.5; musicGain.connect(master);
    noiseBuffer = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = noiseBuffer.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startMusic();
  } catch (e) { AC = null; }
}
function tone(type, f0, f1, dur, vol, delay = 0, dest = null, vib = 0) {
  if (!AC) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(), gn = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (vib) { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 30; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur); }
  o.connect(gn); gn.connect(dest || master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol, fA, fB, type = 'lowpass', delay = 0, dest = null) {
  if (!AC) return;
  const t = AC.currentTime + delay, s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain();
  s.buffer = noiseBuffer; fl.type = type; fl.frequency.setValueAtTime(fA, t); fl.frequency.exponentialRampToValueAtTime(Math.max(20, fB), t + dur);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(gn); gn.connect(dest || master); s.start(t); s.stop(t + dur + 0.02);
}
function sfx(k, v = 1) {
  if (!AC) return;
  switch (k) {
    case 'pistol': noise(0.14, 0.8 * v, 4000, 400); tone('square', 300, 60, 0.1, 0.35 * v); break;
    case 'shotgun': noise(0.45, 1.0 * v, 2500, 150); tone('sawtooth', 120, 30, 0.32, 0.8 * v); tone('square', 90, 40, 0.1, 0.4 * v, 0.55); break;
    case 'punch': noise(0.1, 0.6 * v, 900, 200); tone('sine', 120, 50, 0.12, 0.7 * v); break;
    case 'door': tone('sawtooth', 90, 55, 0.5, 0.22 * v); noise(0.4, 0.12 * v, 500, 120); break;
    case 'pickup': tone('square', 660, 660, 0.06, 0.15 * v); tone('square', 990, 990, 0.08, 0.15 * v, 0.07); break;
    case 'weapon': tone('square', 440, 880, 0.12, 0.2 * v); tone('square', 880, 1320, 0.15, 0.2 * v, 0.1); break;
    case 'fireball': noise(0.35, 0.5 * v, 2000, 300, 'bandpass'); tone('sawtooth', 200, 90, 0.3, 0.28 * v); break;
    case 'splat': noise(0.25, 0.4 * v, 1200, 150); break;
    case 'pain': tone('sawtooth', 260, 120, 0.25, 0.35 * v, 0, null, 40); noise(0.15, 0.15 * v, 2000, 300); break;
    case 'die': tone('sawtooth', 300, 50, 0.7, 0.4 * v, 0, null, 60); noise(0.5, 0.2 * v, 1500, 100); break;
    case 'see': tone('sawtooth', 90, 150, 0.25, 0.3 * v); tone('sawtooth', 150, 70, 0.4, 0.3 * v, 0.2); break;
    case 'boom': noise(1.0, 1.0 * v, 1500, 50); tone('sine', 90, 25, 0.9, 1.0 * v); break;
    case 'hurt': tone('sawtooth', 180, 80, 0.25, 0.45 * v, 0, null, 25); break;
    case 'pdie': tone('sawtooth', 200, 30, 0.9, 0.5 * v, 0, null, 30); break;
  }
}
// Simple chugging riff in E minor (original composition)
let musicNext = 0, musicStep = 0;
function startMusic() {
  const shaper = AC.createWaveShaper(), curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 4); }
  shaper.curve = curve; shaper.connect(musicGain);
  musicNext = AC.currentTime + 0.1;
  const riff = [0, 0, 12, 0, 0, 10, 0, 0, 8, 0, 0, 6, 0, 0, 7, 8];
  const roots = [40, 40, 43, 38];
  setInterval(() => {
    if (!AC || !musicOn || state !== 'play' || paused) { if (AC) musicNext = Math.max(musicNext, AC.currentTime); return; }
    while (musicNext < AC.currentTime + 0.25) {
      const st = musicStep % 16, bar = (musicStep >> 4) % 4, root = roots[bar] + riff[st];
      const f = 440 * Math.pow(2, (root - 69) / 12), d = musicNext - AC.currentTime;
      const o = AC.createOscillator(), gn = AC.createGain(), fl = AC.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 900;
      gn.gain.setValueAtTime(0.18, musicNext); gn.gain.exponentialRampToValueAtTime(0.001, musicNext + 0.09);
      o.connect(fl); fl.connect(gn); gn.connect(shaper); o.start(musicNext); o.stop(musicNext + 0.1);
      if (st % 8 === 0 || st === 6 || st === 14) tone('sine', 120, 40, 0.15, 0.5, d, musicGain);
      if (st % 4 === 2) noise(0.05, 0.12, 9000, 7000, 'highpass', d, musicGain);
      musicNext += 0.1; musicStep++;
    }
  }, 60);
}
const distVol = (x, y) => clamp(1 - Math.hypot(x - P.x, y - P.y) / 22, 0.08, 1);
