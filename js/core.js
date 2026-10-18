'use strict';
/* ==========================================================================
   DOOM - Web Edition
   A software raycaster at 320x200 in the spirit of the 1993 original.
   All textures, sprites and sounds are generated procedurally at startup.
   ========================================================================== */

// ---------- Screen ----------
const SW = 320, SH = 200, VH = 168, HALF = VH / 2;
const PROJ = 215, PL = 0.66;
const cv = document.getElementById('c');
const g = cv.getContext('2d');
g.imageSmoothingEnabled = false;
const view = g.createImageData(SW, VH);
const buf = new Uint32Array(view.data.buffer);
const zbuf = new Float32Array(SW);

function fit() {
  const w = Math.min(innerWidth, innerHeight * 4 / 3);
  cv.style.width = w + 'px';
  cv.style.height = (w * 3 / 4) + 'px';
}
addEventListener('resize', fit); fit();

// ---------- Utils ----------
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
let seed = 12345;
function srnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function pack(r, gg, b) { return (0xff000000 | ((b | 0) << 16) | ((gg | 0) << 8) | (r | 0)) >>> 0; }
function shade(c, f) {
  const r = ((c & 255) * f) >> 8, gg = (((c >> 8) & 255) * f) >> 8, b = (((c >> 16) & 255) * f) >> 8;
  return (0xff000000 | (b << 16) | (gg << 8) | r) >>> 0;
}
