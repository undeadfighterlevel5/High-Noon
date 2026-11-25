// =====================================================================
//  HIGH NOON — CHAPTER 3: CRYSTAL CANYON
//  Loaded after engine.js, chapter1.js and chapter2.js. Self-contained:
//  every top-level name here starts with c3 / C3 so nothing collides.
//
//  Flow:  ch3Title (torch-lit cavern + badges) -> ch3Wake (Eliza is Jenny!)
//         -> THE FUSE (spit on the spark) -> ch3Canyon (her wagon leaves)
//         -> THE LONG RUN (jump + punch across the desert) -> ch3End
//  TEST: a "CHAPTER 3 >" button on the main title jumps straight here.
// =====================================================================

// ---------------- CAST ----------------
Object.assign(CHARS, {
  jenny: { hat: 'none', skin: '#f0c8a0', hair: '#16121c', hairLong: true, shirt: '#2f4a6a', dress: '#2f4a6a', ribbon: '#c0302b', face: 'plain', bg: '#4a1a2a' },
});
Object.assign(SPEAK, { jenny: { name: 'JENNY', color: '#ff8a8a' } });
const c3NewStats = () => ({ sparkHits: 0, bats: 0, snakes: 0, buzzards: 0, smashed: 0, rides: 0, flies: 0, jumps: 0, tricks: 0, grind: 0 });
const C3 = { exitAt: null, lineAt: 0, lastLine: -1, wagonAt: 0, stats: c3NewStats() };

// ---------------- MUSIC ----------------
const c3Notes = s => s.replace(/\|/g, '').trim().split(/\s+/);
TUNES.c3cave = { // slow, drippy minor waltz
  notes: c3Notes('E4 - - - G4 - | F#4 - - - D4 - | E4 - B3 - - - | - - - - - - | C4 - E4 - G4 - | F#4 - - - D#4 - | E4 - - - - - | - - - - - -'),
  bass: ['E2', 'D2', 'E2', 'B1', 'C2', 'B1', 'E2', 'E2'], bar: 6, eighth: 60 / 66 / 2, vol: 0.06, style: 'waltz',
};
TUNES.c3fuse = { // ticking, tense
  notes: c3Notes('E4 - E4 - F4 - E4 - | E4 - E4 - G4 - F4 - | E4 - E4 - F4 - E4 - | B4 - A4 - G4 - F4 -'),
  bass: ['E2', 'E2', 'E2', 'B1'], bar: 8, eighth: 60 / 150 / 2, vol: 0.045, style: 'gallop',
};
TUNES.c3run = { // breathless sprint
  notes: c3Notes('A4 - C5 - E5 - C5 - | D5 - B4 - G4 - B4 - | A4 - C5 - E5 - A5 - | G#5 - E5 - B4 - G#4 - | A4 - C5 - E5 - C5 - | F5 - D5 - A4 - D5 - | E5 - C5 - A4 - C5 - | B4 - G#4 - E4 - - -'),
  bass: ['A2', 'G2', 'A2', 'E2', 'A2', 'D2', 'A2', 'E2'], bar: 8, eighth: 60 / 168 / 2, vol: 0.05, style: 'gallop',
};

TUNES.c3ride = { // the tortoise ride: a bright, breakneck major-key hoedown
  notes: c3Notes('C5 E5 G5 E5 C5 E5 G5 C6 | B5 G5 D5 G5 B5 G5 D5 B4 | C5 E5 G5 E5 A5 G5 E5 C5 | D5 E5 F5 G5 A5 B5 C6 - | A5 C6 A5 F5 C5 F5 A5 F5 | G5 B5 G5 D5 B4 D5 G5 D5 | E5 G5 C6 G5 F5 A5 D6 A5 | G5 - C6 - G5 E5 C5 -'),
  bass: ['C3', 'G2', 'C3', 'G2', 'F2', 'G2', 'C3', 'G2'], bar: 8, eighth: 60 / 210 / 2, vol: 0.06, style: 'gallop',
};

// =====================================================================
//  PAINT KIT (chapter-3 copies, so chapter 2 can change freely)
// =====================================================================
let G3 = g; // chapter-3 drawing target (swapped for a bigger canvas when the skate camera zooms out)
const C3BAKE = {};
function c3Bake(key, w, h, fn) {
  if (C3BAKE[key]) return C3BAKE[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'), px = (a, b, cw, ch, col) => { x.fillStyle = col; x.fillRect(a, b, cw, ch); };
  fn(px, x, w, h); return (C3BAKE[key] = c);
}
const C3BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const c3Dith = (x, y) => (C3BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
const c3Hash = n => { n = Math.imul(n ^ 61, 2654435761) ^ (n >>> 13); return ((n >>> 0) % 10007) / 10007; };
function c3Grad(px, x0, y0, w, h, stops) {
  const n = stops.length - 1;
  for (let y = 0; y < h; y++) {
    const f = (y / Math.max(1, h - 1)) * n, i = Math.min(n - 1, f | 0), t = f - i;
    px(x0, y0 + y, w, 1, stops[i]);
    for (let x = 0; x < w; x++) if (t > c3Dith(x, y)) px(x0 + x, y0 + y, 1, 1, stops[i + 1]);
  }
}
function c3Strip(c, off, y) { const w = c.width, x0 = -((((Math.round(off)) % w) + w) % w); for (let x = x0 - w; x < LW + 160; x += w) G3.drawImage(c, x, y); }
const c3Wave = (w, terms) => x => terms.reduce((a, [amp, k, ph]) => a + amp * Math.sin((x / w) * Math.PI * 2 * k + ph), 0);
function c3Ridge(key, w, h, f, C, sunRight = true) {
  return c3Bake('ridge:' + key, w, h, px => {
    for (let x = 0; x < w; x++) {
      const top = Math.round(h - f(x)), s = f((x + 1) % w) - f((x - 1 + w) % w), lit = sunRight ? s < 0 : s > 0;
      for (let y = Math.max(0, top); y < h; y++) {
        let c = lit ? C.lit : C.dark; const k = (y - top) / Math.max(1, h - top);
        if (C.band && ((y >> 2) % 3 === 0)) c = lit ? C.band : C.darkBand || C.dark;
        if (C.foot && k > 0.6 && (k - 0.6) * 2.5 > c3Dith(x, y)) c = C.foot;
        px(x, y, 1, 1, c);
      }
      if (top >= 0 && top < h) px(x, top, 1, 1, lit ? C.rim : C.lit);
    }
  });
}
// flat-topped mesas / buttes with rock strata
function c3Mesas(key, w, h, list, C) {
  return c3Bake('mesa:' + key, w, h, px => {
    for (const [cx, topW, baseW, mh] of list) for (let j = 0; j < mh; j++) {
      const t = j / mh, hw = Math.round(topW / 2 + (baseW - topW) / 2 * Math.pow(t, 1.7)), y = h - mh + j;
      for (let dx = -hw; dx <= hw; dx++) {
        const x = ((cx + dx) % w + w) % w, side = dx > hw * 0.4;
        let c = j < 2 ? C.cap : ((j >> 1) % 3 === 0 ? C.band : C.mid);
        if (side) c = (j >> 1) % 3 === 0 ? C.darkBand : C.dark;
        if (t > 0.72 && (t - 0.72) * 3.5 > c3Dith(x, y)) c = side ? C.dark : C.talus;
        if (dx === -hw) c = C.cap;
        px(x, y, 1, 1, c);
      }
    }
  });
}
// darkness with holes punched out for each light; then a warm additive glow
const C3DARK = document.createElement('canvas'); C3DARK.width = LW; C3DARK.height = LH;
const c3DarkG = C3DARK.getContext('2d');
function c3Darkness(alpha, lights, warm = '255,150,60') {
  const d = c3DarkG;
  d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, LW, LH);
  d.fillStyle = `rgba(6,4,12,${alpha})`; d.fillRect(0, 0, LW, LH);
  d.globalCompositeOperation = 'destination-out';
  for (const L of lights) { // soft falloff: bright core, long gentle fade, no hard edge
    const k = L.k ?? 1, gr = d.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(0.35, `rgba(0,0,0,${0.85 * k})`); gr.addColorStop(0.7, `rgba(0,0,0,${0.4 * k})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = gr; d.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
  }
  d.globalCompositeOperation = 'source-over';
  G3.drawImage(C3DARK, 0, 0);
  G3.globalCompositeOperation = 'lighter';
  for (const L of lights) if (L.warm !== false) { const gr = G3.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r * 0.8), c = L.tint || warm, k = L.k ?? 1;
    gr.addColorStop(0, `rgba(${c},${0.16 * k})`); gr.addColorStop(1, `rgba(${c},0)`); G3.fillStyle = gr; G3.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); }
  G3.globalCompositeOperation = 'source-over';
}
// rock wall texture: blotchy strata, cracks, wet highlights
function c3RockTex(key, w, h, C) {
  return c3Bake('rock:' + key, w, h, px => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = c3Hash((x >> 3) * 131 + (y >> 2) * 977) * 0.6 + c3Hash((x >> 1) * 37 + (y >> 1) * 91) * 0.4;
      px(x, y, 1, 1, n > 0.72 ? C.lit : n > 0.4 ? C.mid : C.dark);
    }
    for (let i = 0; i < w * h / 380; i++) { // cracks
      let x = Math.round(c3Hash(i * 7) * w), y = Math.round(c3Hash(i * 13) * h);
      for (let k = 0; k < 10; k++) { px(x, y, 1, 1, C.crack); x += c3Hash(i * 3 + k) > 0.5 ? 1 : 0; y += 1; }
    }
    for (let i = 0; i < w * h / 160; i++) px(Math.round(c3Hash(i * 29 + 5) * w), Math.round(c3Hash(i * 31 + 9) * h), 1, 1, C.wet);
  });
}
function c3Torch(x, y) { // wall torch with a lively flame
  R(x - 1, y, 3, 10, '#4a2a14'); R(x - 2, y + 9, 5, 2, '#2a1a10'); R(x - 2, y - 1, 5, 3, '#6e4224');
  const f = Math.floor(clock * 14) % 3, h = 7 + f;
  R(x - 2, y - h + 1, 5, h - 1, '#e05020'); R(x - 1, y - h - 1, 3, h, '#ff9a3a'); R(x, y - h - 3 + (f & 1), 1, h, '#ffd23f'); R(x, y - 3, 1, 2, '#fff4c8');
  if (Math.floor(clock * 7) % 2) R(x + (f - 1), y - h - 5, 1, 1, '#ffd23f');
}
function c3Crystal(x, by, h, c, lit) { // a cluster of glowing crystals
  for (const [dx, hh, w] of [[0, h, 3], [-3, h * 0.6, 2], [3, h * 0.75, 2], [-5, h * 0.35, 2]]) {
    const H2 = Math.round(hh);
    for (let j = 0; j < H2; j++) { const ww = Math.max(1, Math.round(w * Math.min(1, (j + 1) / 3))); R(x + dx, by - H2 + j, ww, 1, j < 2 ? lit : c); }
    R(x + dx, by - H2, 1, Math.max(1, H2 - 2), lit);
  }
}
function c3Stalactite(x, top, len, w, C) { for (let j = 0; j < len; j++) { const ww = Math.max(1, Math.round(w * (1 - j / len))); R(x - (ww >> 1), top + j, ww, 1, j % 5 ? C.mid : C.dark); R(x - (ww >> 1), top + j, 1, 1, C.lit); } }
function c3Stalagmite(x, by, len, w, C) { for (let j = 0; j < len; j++) { const ww = Math.max(1, Math.round(w * (j + 1) / len)); R(x - (ww >> 1), by - len + j, ww, 1, j % 6 ? C.mid : C.dark); R(x - (ww >> 1), by - len + j, Math.max(1, ww >> 2), 1, C.lit); } }
const C3ROCK = { dark: '#2a1e22', mid: '#3e2c30', lit: '#5a4244', crack: '#160e12', wet: '#8a7a8a' };
const C3STONE = { dark: '#3a2a2a', mid: '#5a4240', lit: '#7a5e58' };

// =====================================================================
//  CHAPTER 3 TITLE — a torch-lit mining cavern full of crystals
// =====================================================================
function c3TitleArt() {
  G3.drawImage(c3RockTex('titleWall', LW, LH, C3ROCK), 0, 0);
  G3.drawImage(c3Bake('titleStatic', LW, LH, (px, x) => {
    // strata bands sweeping across the back wall
    for (let i = 0; i < 6; i++) for (let X = 0; X < LW; X++) { const y = Math.round(20 + i * 18 + Math.sin(X * 0.03 + i) * 5); px(X, y, 1, 2, i % 2 ? '#4a3436' : '#24181c'); }
    // the mine tunnel: timber frame + black depths
    for (let y = 48; y < 128; y++) { const w = Math.round(28 + (y - 48) * 0.35); px(160 - w, y, w * 2, 1, y < 60 ? '#0a0608' : '#0e0a0c'); }
    for (let y = 60; y < 128; y += 9) px(140, y, 40, 1, '#1a1214');
    px(124, 44, 72, 6, '#6e4224'); px(124, 44, 72, 2, '#9a6236'); px(124, 50, 6, 80, '#5a3418'); px(190, 50, 6, 80, '#5a3418'); px(126, 50, 2, 80, '#7a4a28'); px(192, 50, 2, 80, '#7a4a28');
    // floor: uneven stone + rails running into the tunnel
    c3Grad(px, 0, 128, LW, 52, ['#3a2a2a', '#4a3634', '#3e2e2c', '#2a1e1e']);
    for (let i = 0; i < 160; i++) px(Math.round(c3Hash(i * 3) * LW), 128 + Math.round(c3Hash(i * 5) * 52), 2, 1, i % 3 ? '#5a4442' : '#22181a');
    for (let k = 0; k < 2; k++) for (let y = 128; y < 180; y++) { const t = (y - 128) / 52, xx = Math.round(160 + (k ? 1 : -1) * (12 + t * 62)); px(xx, y, 2, 1, '#8a8a96'); }
    for (let y = 130; y < 180; y += 6) { const t = (y - 128) / 52; px(Math.round(160 - 16 - t * 66), y, Math.round(32 + t * 132), 2, '#4a2a14'); }
    // a puddle on the floor
    for (let j = 0; j < 6; j++) px(220 - j * 3, 160 + j, 40 + j * 6, 1, j % 2 ? '#2a2a3a' : '#34344a');
  }), 0, 0);
  // stalactites dripping from the ceiling
  for (const [x, len, w] of [[14, 30, 9], [40, 18, 6], [72, 26, 8], [104, 14, 5], [216, 22, 7], [244, 34, 10], [282, 16, 6], [306, 28, 9]]) c3Stalactite(x, 0, len, w, C3STONE);
  for (const [x, len] of [[40, 18], [244, 34], [104, 14]]) { const p = (clock * 0.6 + x * 0.01) % 1; R(x, Math.round(len + p * (128 - len)), 1, 2, '#9ab4d8'); if (p > 0.95) R(x - 2, 126, 5, 1, '#9ab4d8'); }
  // stalagmites + crystal clusters glowing in the dark
  c3Stalagmite(24, 150, 34, 12, C3STONE); c3Stalagmite(296, 160, 44, 14, C3STONE); c3Stalagmite(92, 136, 14, 6, C3STONE);
  const tw = i => (Math.sin(clock * 2 + i) > 0.7 ? 1 : 0);
  c3Crystal(56, 132, 16, '#3a8ab4', '#a8e4ff'); c3Crystal(268, 140, 20, '#7a4ab4', '#d8b4ff'); c3Crystal(232, 64, 10, '#3a8ab4', '#a8e4ff'); c3Crystal(16, 96, 12, '#7a4ab4', '#d8b4ff');
  for (const [x, y, i] of [[56, 116, 0], [268, 120, 1], [232, 54, 2], [16, 84, 3]]) if (tw(i)) { R(x, y, 1, 1, '#ffffff'); R(x - 1, y + 1, 3, 1, '#ffffff'); }
  // mine cart full of crystals on the rails
  R(132, 140, 40, 18, '#4a4a52'); R(132, 140, 40, 2, '#6a6a76'); for (let x = 136; x < 172; x += 8) R(x, 142, 1, 16, '#3a3a42');
  for (let i = 0; i < 7; i++) c3Crystal(136 + i * 5, 141, 5 + (i % 3) * 2, i % 2 ? '#3a8ab4' : '#7a4ab4', i % 2 ? '#a8e4ff' : '#d8b4ff');
  disc(140, 160, 4, '#2a2a30'); disc(164, 160, 4, '#2a2a30'); disc(140, 160, 1, '#8a8a96'); disc(164, 160, 1, '#8a8a96');
  // a crate of TNT, rope, a pickaxe against the timber
  R(84, 150, 26, 18, '#8a5530'); R(84, 150, 26, 2, '#b07a44'); R(84, 158, 26, 1, '#5a3418'); signText('TNT', 97, 154, '#c0302b');
  for (let i = 0; i < 5; i++) R(90 + i * 3, 145, 2, 5, '#c0302b');
  for (let k = 0; k < 3; k++) for (let a = 0; a < 6.28; a += 0.3) R(Math.round(200 + Math.cos(a) * (9 - k * 2)), Math.round(166 + Math.sin(a) * (3 - k * 0.6)), 1, 1, '#b8956a');
  line(198, 132, 186, 112, '#6e4224'); line(182, 112, 192, 110, '#9a9aa6'); line(184, 108, 182, 114, '#9a9aa6');
  // bats hanging upside down (one flutters now and then)
  for (const [x, y, i] of [[60, 8, 0], [66, 10, 1], [200, 6, 2]]) { const fl = Math.floor(clock * 0.7 + i * 1.7) % 6 === 0 && Math.floor(clock * 10) % 2;
    R(x, y, 3, 4, '#24182a'); if (fl) { R(x - 3, y + 1, 3, 1, '#24182a'); R(x + 3, y + 1, 3, 1, '#24182a'); } R(x, y + 3, 1, 1, '#ff4040'); }
  // torch on the right timber, dust motes floating in its light
  c3Torch(196, 66);
  const lights = [{ x: 196, y: 60, r: 170 + Math.sin(clock * 9) * 3 + (Math.floor(clock * 13) % 2) * 2 },
    { x: 56, y: 124, r: 26, k: 0.55, tint: '120,200,255' }, { x: 268, y: 130, r: 30, k: 0.55, tint: '200,150,255' }, { x: 152, y: 146, r: 30, k: 0.45, tint: '160,200,255' }];
  c3Darkness(0.78, lights);
  for (let i = 0; i < 10; i++) { const p = (clock * 0.04 + i * 0.1) % 1, x = 170 + Math.sin(i * 2.3 + clock * 0.5) * 50, y = 30 + p * 90; R(Math.round(x), Math.round(y), 1, 1, 'rgba(255,220,160,0.7)'); }
  c3Torch(196, 66);
}
SCENES.ch3Title = {
  tune: 'c3cave',
  world: c3TitleArt,
  ui() {
    rect(0, 0, W, 132, 'rgba(10,6,8,0.5)');
    text('CHAPTER 3', W / 2, 18, 48, '#ffd23f', 'center');
    text('CRYSTAL CANYON', W / 2, 82, 16, '#a8e4ff', 'center');
    if (Math.floor(clock * 2.5) % 2) text('CHOOSE YOUR BADGE', W / 2, 108, 16, '#ffffff', 'center');
    button(BTN.yellow, 'YELLOW BELLY'); button(BTN.deputy, 'DEPUTY'); button(BTN.gunslinger, 'GUNSLINGER');
    for (const k in BTN) if (bests[k]) text('BEST ' + bests[k], BTN[k].x + BTN[k].w / 2, 440, 16, '#ffd23f', 'center');
    smallBtn(TITLE_BTN, 'TITLE');
    fadeBlack(1 - this.t / 1.2);
  },
  tap(x, y) {
    if (this.t < 0.6) return;
    if (inBox(x, y, TITLE_BTN)) { toTitle(); return; }
    for (const k in BTN) if (inBox(x, y, BTN[k])) { sfx.blip(); C3.stats = c3NewStats(); C3.runSnap = null; C3.bestRun = 0; startGame(k, STORY3); return; }
  },
};

// =====================================================================
//  CUTSCENE: THE CAVERN (side view) — Eliza is really Jenny
// =====================================================================
const C3_REVEAL = 5, C3_GUN = 7, C3_LIT = 8, C3_EXIT = 9;
function c3CaveSide() {
  G3.drawImage(c3RockTex('sideWall', LW, LH, { dark: '#24191c', mid: '#34262a', lit: '#4a3638', crack: '#120a0e', wet: '#6a5a6a' }), 0, 0);
  G3.drawImage(c3Bake('sideStatic', LW, LH, px => {
    c3Grad(px, 0, 112, LW, 68, ['#3e2e2c', '#33262a', '#281e20']);
    for (let i = 0; i < 90; i++) px(Math.round(c3Hash(i * 7) * LW), 112 + Math.round(c3Hash(i * 11) * 66), 2, 1, i % 2 ? '#4e3a38' : '#1e1416');
    px(0, 111, LW, 1, '#5a4442');
  }), 0, 0);
  for (const [x, len, w] of [[30, 20, 7], [90, 12, 5], [150, 24, 8], [250, 16, 6], [300, 22, 8]]) c3Stalactite(x, 0, len, w, C3STONE);
  c3Stalagmite(300, 112, 30, 12, C3STONE); c3Crystal(272, 112, 12, '#3a8ab4', '#a8e4ff');
  c3Torch(132, 52);
}
function c3Bundle(x, by, s = 1) { // a bundle of dynamite, roped together
  for (let i = 0; i < 5; i++) { R(x + i * 3 * s, by - 12 * s, 3 * s - 1, 12 * s, i % 2 ? '#c0302b' : '#d84030'); R(x + i * 3 * s, by - 12 * s, 1, 12 * s, '#e8604a'); }
  R(x - 1, by - 8 * s, 15 * s + 1, Math.max(1, s), '#b8956a'); R(x - 1, by - 4 * s, 15 * s + 1, Math.max(1, s), '#b8956a');
}
function c3TiedYou(x, footY) { // you, roped to a stalagmite
  c3Stalagmite(x + 10, footY + 1, 52, 22, C3STONE);
  ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, x, footY);
  for (const y of [footY - 22, footY - 17, footY - 8]) { R(x + 1, y, 18, 2, '#b8956a'); R(x + 1, y + 1, 18, 1, '#8a6a40'); }
  R(x + 8, footY - 23, 3, 3, '#8a6a40');
}
function c3JennyFig(x, footY, revealed, gun) {
  if (!revealed) { ch2Fig({ ...CHARS.eliza, pose: 'idle' }, x, footY); return; }
  ch2Fig({ ...CHARS.eliza, hat: 'none', hair: '#16121c', pose: 'idle' }, x, footY);
  const hx = x, hy = footY - 31; // long jet-black hair down her shoulders
  R(hx + 5, hy + 2, 10, 3, '#16121c'); R(hx + 4, hy + 4, 2, 10, '#16121c'); R(hx + 14, hy + 4, 2, 10, '#16121c'); R(hx + 7, hy + 2, 3, 1, '#3a3446');
  if (gun) { R(hx + 15, hy + 16, 5, 2, '#4a4a52'); R(hx + 15, hy + 18, 2, 2, '#6a4020'); }
}
function c3FuseSide(spark) { // fuse from the bundle, out along the floor; the spark eats its way back
  const x0 = 64, y0 = 104, x1 = 296, pts = [];
  for (let x = x0; x <= x1; x += 2) pts.push([x, y0 + 4 + Math.round(Math.sin(x * 0.07) * 2)]);
  const cut = spark == null ? pts.length : Math.round(pts.length * (1 - spark));
  pts.forEach(([x, y], i) => R(x, y, 2, 1, i < cut ? '#c8a070' : '#1e1616'));
  if (spark != null) { const [sx, sy] = pts[Math.max(0, cut - 1)], f = Math.floor(clock * 18) % 3;
    disc(sx, sy, 2 + (f === 0 ? 1 : 0), '#ff9a3a'); R(sx, sy - 1, 1, 1, '#fff4c8');
    for (let i = 0; i < 4; i++) R(sx + Math.round(Math.sin(clock * 20 + i * 2) * 4), sy - 2 - ((clock * 30 + i * 3) % 6), 1, 1, '#ffd23f');
    return { x: sx, y: sy }; }
  return null;
}
SETS.c3Cave = { bg: c3CaveSide, fg: () => {} };
CUTS.ch3Wake = {
  set: 'c3Cave', actors: [], tune: 'c3cave',
  start() { C3.exitAt = null; C3.lastLine = -1; },
  after() {
    if (cutLine !== C3.lastLine) { C3.lastLine = cutLine; C3.lineAt = clock; if (cutLine === C3_EXIT) C3.exitAt = clock; }
    c3TiedYou(40, 112);
    c3Bundle(62, 112);
    const lit = cutLine >= C3_LIT, sp = c3FuseSide(lit ? Math.min(0.15, (clock - C3.lineAt) * 0.01) : null);
    const revealed = cutLine >= C3_REVEAL;
    if (revealed) { // the bonnet and the wig, tossed on the floor
      R(224, 108, 12, 4, '#3a4466'); R(226, 106, 8, 2, '#3a4466'); R(222, 110, 3, 2, '#c8a040');
      R(236, 107, 9, 5, '#8a3a1a'); R(238, 105, 6, 2, '#8a3a1a'); R(240, 109, 3, 1, '#a84a24');
    }
    const jx = C3.exitAt != null ? 200 + (clock - C3.exitAt) * 46 : 200, step = C3.exitAt != null && Math.floor(clock * 7) % 2;
    if (jx < LW + 10) c3JennyFig(Math.round(jx), 112 - (step ? 1 : 0), revealed, cutLine >= C3_GUN);
    const fl = Math.sin(clock * 9) * 3 + (Math.floor(clock * 13) % 2) * 2;
    const lights = [{ x: 132, y: 46, r: 150 + fl }, { x: 50, y: 92, r: 50, k: 0.6 }, { x: Math.min(330, jx + 10), y: 92, r: 50, k: 0.6 }, { x: 272, y: 104, r: 30, k: 0.6, tint: '120,200,255' }];
    if (sp) lights.push({ x: sp.x, y: sp.y, r: 30 + Math.sin(clock * 30) * 3, k: 0.9 });
    c3Darkness(0.7, lights);
    c3Torch(132, 52);
    if (sp) { disc(sp.x, sp.y, 2, '#ffd23f'); R(sp.x, sp.y - 1, 1, 1, '#ffffff'); }
  },
  lines: [
    ['narr', 'YOU WAKE UP WITH A SPLITTING HEADACHE, TIED TO A STALAGMITE IN A DAMP CAVERN. A TORCH FLICKERS ON THE WALL.'],
    ['eliza', "MORNIN', SHERIFF. SLEEP WELL?"],
    ['eliza', "TIME I CAME CLEAN. I WORK FOR MR. MCGRUDDER."],
    ['eliza', "THE BANDITS ON THE TRAIL? THE GANG AT AUNT MAE'S CABIN? THAT WAS ME, TRYIN' TO GET YOU KILLED."],
    ['eliza', "TWICE! AND YOU JUST WOULDN'T DIE. SO NOW I'M GONNA BLOW YOU TO KINGDOM COME."],
    ['narr', "SHE PULLS OFF HER BONNET... AND HER HAIR. IT'S A WIG. UNDERNEATH, HER HAIR IS JET BLACK."],
    ['jenny', "THE NAME'S JENNY. THERE NEVER WAS AN ELIZA. OR A JEB, FOR THAT MATTER."],
    ['jenny', "AND I'LL BE TAKIN' THIS."],
    ['narr', 'SHE TAKES YOUR REVOLVER, STRIKES A MATCH ON YOUR BOOT, AND LIGHTS THE FUSE.'],
    ['jenny', 'SO LONG, SHERIFF. SAY HI TO MAD DOG FOR ME.'],
  ],
};

// =====================================================================
//  LEVEL: THE FUSE — first-person, tied up in the dark. Spit on the spark!
// =====================================================================
const C3HZ = 58, C3FX = (wx, z) => 160 + wx * 110 / z, C3FY = z => C3HZ + 112 / z;
const C3_FUSE = { // per badge: how fast the spark crawls, how big a target it is, spit recharge (s)
  yellow:     { speed: 1 / 12,  size: 1.5, cool: 1.0 },
  deputy:     { speed: 1 / 9,   size: 1.2, cool: 1.4 },
  gunslinger: { speed: 1 / 8,   size: 1.1, cool: 1.6 },
};
const C3_HITS = 5, C3_PAUSE = 0.7; // each hit stalls the spark for a moment, then it keeps burning
// the fuse snakes across the cave floor toward the bundle at your feet
const C3PATH = (() => {
  const key = [[1.0, 13], [-0.7, 11.2], [0.9, 9.4], [-1.1, 7.6], [0.7, 6.1], [-0.6, 4.7], [0.55, 3.5], [-0.35, 2.5], [0.15, 1.75], [0, 1.22]];
  const out = []; for (let i = 0; i < key.length - 1; i++) for (let k = 0; k < 24; k++) { const t = k / 24; out.push([key[i][0] + (key[i + 1][0] - key[i][0]) * t, key[i][1] + (key[i + 1][1] - key[i][1]) * t]); }
  out.push(key[key.length - 1]);
  const scr = out.map(([wx, z]) => [C3FX(wx, z), C3FY(z), z]), cum = [0];
  for (let i = 1; i < scr.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { scr, cum, len: cum[cum.length - 1] };
})();
function c3PathAt(s) { // s in 0..1 along the fuse -> screen point + depth
  const target = Math.max(0, Math.min(1, s)) * C3PATH.len, c = C3PATH.cum; let i = 1; while (i < c.length - 1 && c[i] < target) i++;
  const t = (target - c[i - 1]) / Math.max(1e-6, c[i] - c[i - 1]), a = C3PATH.scr[i - 1], b = C3PATH.scr[i];
  return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t, i };
}
const C3F = {};
const C3_BATS = [3.5, 9, 14.5, 20, 26];
function c3FuseArt() {
  G3.drawImage(c3RockTex('povWall', LW, LH, C3ROCK), 0, 0);
  G3.drawImage(c3Bake('povStatic', LW, LH, px => {
    for (let y = 0; y < LH; y++) { // floor and ceiling planes of the passage
      if (y > C3HZ + 1) { const z = 112 / (y - C3HZ), l = Math.round(C3FX(-2.5, z)), r = Math.round(C3FX(2.5, z)), fog = Math.min(1, z / 13);
        px(l, y, r - l, 1, fog > 0.6 ? '#1e1618' : fog > 0.3 ? '#2e2224' : '#3e2e2e');
        for (let x = l; x < r; x += 3) if (c3Hash(x * 17 + y * 131) > 0.86) px(x, y, 2, 1, fog > 0.5 ? '#2a2022' : '#54403c'); }
      if (y < C3HZ - 2) { const z = 66 / (C3HZ - y), l = Math.round(C3FX(-2.3, z)), r = Math.round(C3FX(2.3, z));
        px(l, y, r - l, 1, z > 7 ? '#1a1214' : '#2c2024'); }
    }
    for (let y = C3HZ - 14; y < C3HZ + 6; y++) { const w = Math.round(10 - Math.abs(y - (C3HZ - 4)) * 0.5); px(160 - w, y, w * 2, 1, '#050304'); } // the passage disappears into black
    for (let i = 0; i < 9; i++) { const z = 2 + i * 1.3, wx = (i % 2 ? -1 : 1) * (1.6 + c3Hash(i) * 0.6), x = Math.round(C3FX(wx, z)), top = Math.round(C3HZ - 66 / z), len = Math.round(40 / z), w = Math.max(2, Math.round(16 / z));
      for (let j = 0; j < len; j++) { const ww = Math.max(1, Math.round(w * (1 - j / len))); px(x - (ww >> 1), top + j, ww, 1, j % 4 ? '#4a3836' : '#2a1e20'); } }
    for (let i = 0; i < 7; i++) { const z = 2.2 + i * 1.5, wx = (i % 2 ? 1 : -1) * (2.0 + c3Hash(i + 50) * 0.3), x = Math.round(C3FX(wx, z)), by = Math.round(C3FY(z)), len = Math.round(50 / z), w = Math.max(2, Math.round(18 / z));
      for (let j = 0; j < len; j++) { const ww = Math.max(1, Math.round(w * (j + 1) / len)); px(x - (ww >> 1), by - len + j, ww, 1, j % 5 ? '#4e3c38' : '#2a1e20'); } }
    for (const [wx, z, s] of [[-1.3, 3.0, 9], [1.5, 2.2, 7], [0.4, 5, 6]]) { const x = C3FX(wx, z), y = C3FY(z); for (let j = 0; j < 4; j++) px(Math.round(x - s + j), Math.round(y + j * 0.5), Math.round(s * 2 - j * 2), 1, j % 2 ? '#2a2a3a' : '#34344a'); } // puddles
  }), 0, 0);
  for (const [x, y, c, lit] of [[34, 70, '#3a8ab4', '#a8e4ff'], [292, 84, '#7a4ab4', '#d8b4ff'], [118, 58, '#3a8ab4', '#a8e4ff'], [214, 54, '#7a4ab4', '#d8b4ff']]) c3Crystal(x, y, 10, c, lit);
  c3Torch(268, 48);
}
function c3Boots() { // your boots and the ropes, at the bottom of your view
  for (const bx of [96, 206]) { R(bx, 160, 18, 20, '#2a1a10'); R(bx, 160, 18, 2, '#4a2a18'); R(bx + 2, 166, 14, 1, '#4a2a18'); R(bx + (bx < 160 ? 14 : 0), 172, 4, 8, '#1a100a'); }
  for (const y of [166, 172]) { R(90, y, 140, 2, '#b8956a'); R(90, y + 1, 140, 1, '#8a6a40'); }
  c3Bundle(146, 180, 2);
  R(154, 152, 6, 2, '#c8a070');
}
function c3FuseCord(s) { // unburnt cord ahead of the spark, black ash behind
  const sc = C3PATH.scr, at = c3PathAt(s);
  for (let i = 0; i < sc.length - 1; i++) {
    const [x, y, z] = sc[i], burnt = i < at.i, th = Math.max(1, Math.round(3.2 / z));
    if (burnt) { R(Math.round(x), Math.round(y), th, th, '#141012'); if (c3Hash(i * 7 + Math.floor(clock * 4)) > 0.93 && at.i - i < 30) R(Math.round(x), Math.round(y), 1, 1, '#e05020'); }
    else { R(Math.round(x), Math.round(y), th, th, '#c8a070'); if (th > 1) R(Math.round(x), Math.round(y), th, 1, '#e0c090'); }
  }
  R(158, 150, 3, 4, '#c8a070');
  return at;
}
function c3Flame(x, y, z, k = 1) {
  const s = Math.max(1, 7 / z) * k, f = Math.floor(clock * 20) % 3;
  disc(Math.round(x), Math.round(y - s), Math.round(s * 1.6 + f * 0.3), '#e05020');
  disc(Math.round(x), Math.round(y - s * 1.2), Math.round(s * 1.1), '#ff9a3a');
  disc(Math.round(x), Math.round(y - s * 1.1), Math.max(1, Math.round(s * 0.6)), '#ffe890');
  R(Math.round(x), Math.round(y - s * 1.1), 1, 1, '#ffffff');
}
function c3Bat(b) {
  const x = Math.round(b.x), y = Math.round(b.y), up = !b.dead && Math.floor(clock * 12 + b.seed) % 2;
  R(x - 2, y - 1, 5, 3, '#2a1e34'); R(x - 2, y - 3, 1, 2, '#2a1e34'); R(x + 2, y - 3, 1, 2, '#2a1e34');
  if (b.dead) { R(x - 4, y + 1, 9, 1, '#2a1e34'); return; }
  if (up) { R(x - 7, y - 4, 5, 2, '#3a2a48'); R(x + 3, y - 4, 5, 2, '#3a2a48'); R(x - 5, y - 2, 3, 1, '#3a2a48'); R(x + 3, y - 2, 3, 1, '#3a2a48'); }
  else { R(x - 7, y + 1, 5, 2, '#3a2a48'); R(x + 3, y + 1, 5, 2, '#3a2a48'); }
  R(x - 1, y, 1, 1, '#ff4040'); R(x + 1, y, 1, 1, '#ff4040');
}
function c3Spit(x, y) { // fire a glob of spit from your mouth toward (x, y)
  if (C3F.cd > 0 || C3F.out || C3F.boomT > 0) { if (C3F.cd > 0) { C3F.dry = 0.35; tone('square', 140, 120, 0.06, 0.04); } return; }
  const cfg = C3_FUSE[diff.key] || C3_FUSE.deputy;
  C3F.cd = cfg.cool; C3F.cdMax = cfg.cool; shots++;
  C3F.spits.push({ x0: 160, y0: 184, x, y, t: 0, dur: 0.2 });
  noise(0.07, 0.25, 3200); tone('sine', 520, 180, 0.09, 0.07); // ptoo!
}
function c3SpitLands(sp) {
  const cfg = C3_FUSE[diff.key] || C3_FUSE.deputy, at = c3PathAt(C3F.s), r = (5 + 12 / at.z) * cfg.size;
  if (!C3F.out && Math.hypot(sp.x - at.x, sp.y - (at.y - 3 / at.z)) < r) {
    C3F.hits++; hits++; targets++; C3.stats.sparkHits++; C3F.sputter = C3_PAUSE;
    for (let i = 0; i < 8; i++) C3F.steam.push({ x: at.x + (Math.random() - 0.5) * 6, y: at.y - 2, vx: (Math.random() - 0.5) * 20, vy: -20 - Math.random() * 25, t: 0 });
    noise(0.5, 0.2, 8000); addScore(100, 'obj');
    if (C3F.hits >= C3_HITS) { C3F.out = true; C3F.outT = 0; addScore(500, 'obj'); popText(at.x, at.y - 18, 'FUSE OUT! +500'); noise(1.2, 0.25, 9000); }
    else popText(at.x, at.y - 14, 'TSSS! ' + C3F.hits + '/' + C3_HITS);
    return;
  }
  for (const b of C3F.bats) if (!b.dead && Math.hypot(sp.x - b.x, sp.y - b.y) < 8) {
    b.dead = true; b.vy = -20; hits++; targets++; C3.stats.bats++; S.n.obj++; addScore(200, 'obj'); popText(b.x, b.y - 8, 'BAT +200'); tone('square', 1400, 600, 0.12, 0.05); return;
  }
  C3F.splats.push({ x: sp.x, y: sp.y, t: 0 }); tone('sine', 220, 90, 0.08, 0.05);
}
RUNS.fuse = {
  c3: true, label: null, name: 'THE FUSE', title: 'THE FUSE', hint: 'SPIT ON THE SPARK ' + C3_HITS + ' TIMES!', tune: 'c3fuse',
  hurtText: { fuse: { title: 'KABOOM!', reason: 'THE FUSE REACHED THE DYNAMITE.', color: '#ff9a3a' } },
  reset() { Object.assign(C3F, { s: 0, hits: 0, out: false, outT: 0, spits: [], cd: 0, cdMax: 1, steam: [], splats: [], bats: [], bi: 0, boomT: 0, sputter: 0, dry: 0 }); ammo = 6; },
  tick(dt) {
    for (const p of C3F.steam) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    C3F.steam = C3F.steam.filter(p => p.t < 1);
    for (const p of C3F.splats) p.t += dt; C3F.splats = C3F.splats.filter(p => p.t < 1.5);
  },
  update(dt) {
    this.tick(dt); ammo = 6;
    const cfg = C3_FUSE[diff.key] || C3_FUSE.deputy;
    C3F.cd = Math.max(0, C3F.cd - dt); C3F.sputter = Math.max(0, C3F.sputter - dt); C3F.dry = Math.max(0, C3F.dry - dt);
    if (C3F.out) { C3F.outT += dt; return; }
    if (C3F.boomT > 0) { C3F.boomT += dt; if (C3F.boomT > 0.7) { C3F.boomT = 0; hurt('fuse', null); } return; }
    if (C3F.sputter <= 0) C3F.s += cfg.speed * dt;
    if (C3F.s >= 1) { C3F.s = 1; C3F.boomT = 0.01; shake = 1; flash = 1; noise(1.6, 0.9, 400); tone('sine', 70, 20, 1.4, 0.5); return; }
    if (C3F.bi < C3_BATS.length && time >= C3_BATS[C3F.bi]) { C3F.bi++; const d = Math.random() < 0.5 ? 1 : -1; C3F.bats.push({ x: d > 0 ? -10 : LW + 10, y: 22 + Math.random() * 26, vx: d * (55 + Math.random() * 25), vy: 0, dead: false, seed: Math.random() * 4 }); }
    for (const b of C3F.bats) { b.x += b.vx * dt; if (b.dead) { b.vy += 300 * dt; b.y += b.vy * dt; } else b.y += Math.sin(clock * 6 + b.seed) * 0.6; }
    C3F.bats = C3F.bats.filter(b => b.x > -20 && b.x < LW + 20 && b.y < LH + 10);
    for (const sp of C3F.spits) { sp.t += dt; if (sp.t >= sp.dur && !sp.done) { sp.done = true; c3SpitLands(sp); } }
    C3F.spits = C3F.spits.filter(sp => !sp.done);
    if (Math.random() < dt * 2) tone('sine', 3000 + Math.random() * 1500, 2800, 0.03, 0.015); // fizz
  },
  done() { return C3F.out && C3F.outT > 1.6; },
  shoot() { return true; },
  press(x, y) { if (state === 'play') c3Spit(x / P, y / P); },
  draw() {
    c3FuseArt();
    const at = c3FuseCord(C3F.out ? C3F.s : C3F.s);
    c3Boots();
    for (const p of C3F.splats) { const a = 1 - p.t / 1.5; R(Math.round(p.x) - 2, Math.round(p.y), 5, 1, `rgba(200,230,255,${a})`); R(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 1, `rgba(200,230,255,${a})`); }
    const near = C3F.s, lights = [{ x: 268, y: 44, r: 130 + Math.sin(clock * 9) * 3, k: 0.8 }, { x: 160, y: 176, r: 70, k: 0.45, warm: false }, { x: 160, y: 90, r: 120, k: 0.25, warm: false }];
    if (!C3F.out) lights.push({ x: at.x, y: at.y - 2, r: (40 + 40 * near) + Math.sin(clock * 30) * 3, k: C3F.sputter > 0 ? 0.5 : 1 });
    for (const [x, y, t] of [[34, 64, '120,200,255'], [292, 78, '200,150,255'], [118, 52, '120,200,255'], [214, 48, '200,150,255']]) lights.push({ x, y, r: 16, k: 0.5, tint: t });
    c3Darkness(0.86, lights);
    c3Torch(268, 48);
    if (!C3F.out) {
      const k = C3F.sputter > 0 ? 0.5 : 1; c3Flame(at.x, at.y, at.z, k);
      for (let i = 0; i < 6; i++) { const a = clock * 25 + i * 1.7, d = ((clock * 40 + i * 9) % 14) / at.z * 2; R(Math.round(at.x + Math.cos(a) * d), Math.round(at.y - 4 / at.z - Math.abs(Math.sin(a)) * d), 1, 1, i % 2 ? '#ffd23f' : '#ff9a3a'); }
    } else { for (let i = 0; i < 4; i++) { const p = (clock * 0.5 + i / 4) % 1; disc(Math.round(at.x + Math.sin(p * 6 + i) * 3), Math.round(at.y - p * 20), 1 + Math.round(p * 3), `rgba(180,180,190,${0.5 * (1 - p)})`); } }
    for (const p of C3F.steam) { const a = 0.7 * (1 - p.t); disc(Math.round(p.x), Math.round(p.y), 1 + Math.round(p.t * 4), `rgba(220,225,235,${a})`); }
    C3F.bats.forEach(c3Bat);
    for (const sp of C3F.spits) { const k = Math.min(1, sp.t / sp.dur), x = sp.x0 + (sp.x - sp.x0) * k, y = sp.y0 + (sp.y - sp.y0) * k - Math.sin(Math.PI * k) * 10, r = Math.max(1, Math.round(4 - k * 3));
      disc(Math.round(x), Math.round(y), r, '#cfe8f4'); R(Math.round(x) - 1, Math.round(y) - r, 1, 1, '#ffffff'); }
    if (C3F.boomT > 0) { const t = C3F.boomT; G3.globalAlpha = Math.min(1, 1 - t); R(0, 0, LW, LH, '#fff4c8'); G3.globalAlpha = 1; disc(160, 160, Math.round(30 + t * 200), '#ff9a3a'); disc(160, 160, Math.round(20 + t * 150), '#ffe890'); }
    if (near > 0.75 && !C3F.out) { const a = (near - 0.75) * 1.2 * (0.6 + 0.4 * Math.sin(clock * 12)); G3.globalAlpha = a; R(0, 0, LW, 4, '#c0302b'); R(0, LH - 4, LW, 4, '#c0302b'); R(0, 0, 4, LH, '#c0302b'); R(LW - 4, 0, 4, LH, '#c0302b'); G3.globalAlpha = 1; }
  },
  ui() {
    if (!['intro', 'play'].includes(state)) return;
    const bx = W / 2 - 160; text('FUSE', bx - 20, 18, 16, '#ffd23f', 'right');
    for (let i = 0; i < C3_HITS; i++) { const on = i < C3F.hits; rect(bx + i * 66, 14, 56, 22, INK); rect(bx + i * 66 + 3, 17, 50, 16, on ? '#7fb2ff' : '#ff9a3a'); if (on) text('X', bx + i * 66 + 28, 19, 16, '#ffffff', 'center'); }
  },
};

// =====================================================================
//  CUTSCENE: THE CANYON — out of the cave, her wagon rolls off into the sunset
// =====================================================================
function c3CanyonArt() {
  G3.drawImage(c3Bake('canyonSky', LW, 90, px => c3Grad(px, 0, 0, LW, 90, ['#2a2252', '#4a2e66', '#8a3e66', '#d0605a', '#f29a5a', '#fcd088'])), 0, 0);
  for (const [x, y, w] of [[30, 20, 60], [120, 34, 80], [220, 14, 50], [250, 44, 60]]) { R(x, y, w, 2, '#f0907a'); R(x + 6, y - 1, w - 16, 1, '#ffc090'); R(x + 4, y + 2, w - 8, 1, '#a04a60'); }
  disc(238, 70, 13, '#ffe0a0'); disc(238, 70, 9, '#fff2c4');
  c3Strip(c3Mesas('cnFar', 320, 30, [[30, 50, 70, 18], [110, 30, 46, 22], [200, 60, 90, 14], [290, 40, 60, 20]], { cap: '#c88a8a', mid: '#9a6278', band: '#a86e80', dark: '#7a4a66', darkBand: '#6e425c', talus: '#8a5a70' }), 0, 54);
  c3Strip(c3Mesas('cnMid', 320, 40, [[20, 30, 60, 30], [150, 70, 110, 24], [260, 40, 70, 34]], { cap: '#e08a5e', mid: '#a8503c', band: '#bc6448', dark: '#7a3428', darkBand: '#6a2c22', talus: '#9a5a40' }), 0, 62);
  // canyon floor with a river winding toward the sun, and the road beside it
  G3.drawImage(c3Bake('cnFloor', LW, 20, px => { c3Grad(px, 0, 0, LW, 20, ['#a8603c', '#b8704a', '#9a5434']);
    for (let x = 0; x < LW; x++) { const y = Math.round(10 + Math.sin(x * 0.04) * 4 + (LW - x) * 0.02); px(x, y, 1, 2, x > 200 ? '#ffd8a0' : '#6a7ab4'); px(x, y - 4, 1, 1, '#c88a5a'); } }), 0, 96);
  // near canyon walls framing the view
  G3.drawImage(c3Bake('cnNear', LW, 70, px => {
    for (let x = 0; x < LW; x++) { const lt = 70 - Math.round(x < 120 ? 60 - x * 0.25 : x > 220 ? 10 + (x - 220) * 0.45 : 0); if (x >= 120 && x <= 220) continue;
      for (let y = Math.max(0, lt); y < 70; y++) px(x, y, 1, 1, ((y >> 2) % 3 === 0) ? '#6a2c22' : (x < 120 ? '#8a3a2a' : '#7a3428')); px(x, Math.max(0, lt), 1, 1, '#e08a5e'); }
  }), 0, 110);
  // vultures circling
  for (let i = 0; i < 3; i++) { const a = clock * 0.6 + i * 2.1, x = Math.round(170 + Math.cos(a) * 30), y = Math.round(36 + Math.sin(a) * 8), up = Math.floor(clock * 4 + i) % 2;
    R(x - 3, y + (up ? -1 : 0), 3, 1, '#2a1a24'); R(x, y, 1, 1, '#2a1a24'); R(x + 1, y + (up ? -1 : 0), 3, 1, '#2a1a24'); }
  // the cave mouth on the left
  for (let y = 40; y < 180; y++) { const w = Math.round(Math.max(0, 46 - Math.abs(y - 112) * 0.5)); R(0, y, w + 14, 1, '#4a2a22'); R(0, y, w, 1, '#120a0c'); }
}
function c3TinyWagon(x, y) { // seen from far away: a dot of canvas, two specks of horse, a puff of dust
  x = Math.round(x); y = Math.round(y);
  R(x - 6 - (Math.floor(clock * 8) % 2), y + 1, 3, 1, 'rgba(230,190,140,0.7)'); R(x - 9, y, 3, 1, 'rgba(230,190,140,0.4)');
  R(x, y - 2, 5, 2, '#f4ead0'); R(x, y, 5, 1, '#4a2a14'); R(x + 6, y - 1, 2, 2, '#3a2010'); R(x + 9, y - 1, 2, 2, '#3a2010');
}
SETS.c3Canyon = { bg: c3CanyonArt, fg: () => {} };
CUTS.ch3Canyon = {
  set: 'c3Canyon', actors: [], tune: 'c3cave',
  start() { C3.wagonAt = clock; },
  after() {
    const t = clock - C3.wagonAt, k = Math.min(1, t / 22);
    c3TinyWagon(150 + k * 80, 104 - k * 4);
    ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, 36, 112);
    R(30, 110, 10, 2, '#b8956a'); R(52, 111, 8, 1, '#b8956a'); // cut ropes
  },
  lines: [
    ['narr', 'ONE LAST SPIT. THE FUSE HISSES OUT. YOU SAW THROUGH THE ROPES ON A SHARP PIECE OF STALAGMITE.'],
    ['narr', 'YOU STAGGER OUT OF THE CAVE INTO A CANYON THE SIZE OF TEXAS.'],
    ['narr', 'FAR BELOW, A WAGON RATTLES OFF INTO THE SUNSET. JENNY.'],
    ['narr', "NO GUN. NO HORSE. JUST YOUR BOOTS, YOUR FISTS, AND HER WAGON TRACKS. TIME TO RUN."],
  ],
};

// =====================================================================
//  LEVEL: THE LONG RUN — side-scrolling desert sprint. Jump + punch.
// =====================================================================
const C3GY = 128, C3PX = 62, C3_RUN_T = 45, C3VW = 400; // C3VW = where things appear (just off the zoomed-out right edge)
const C3_RUN = { // per badge
  yellow:     { v0: 96,  v1: 140, gap: 1.2,  crashes: 3, bal: 1.7 }, // bal = how hard the wire tips you over
  deputy:     { v0: 114, v1: 170, gap: 0.98, crashes: 2, bal: 2.4 },
  gunslinger: { v0: 132, v1: 196, gap: 0.8,  crashes: 1, bal: 3.1 },
};
const C3D = {};
const C3_OBS = {
  bush:   { w: 13, h: 8 }, rock: { w: 13, h: 9 }, cactus: { w: 7, h: 18 }, cactus2: { w: 16, h: 15 },
  snake:  { w: 15, h: 6 }, tumble: { w: 10, h: 10 }, tallsnake: { w: 15, h: 6 }, buzzard: { w: 14, h: 8 },
};
const C3_JUMP_BTN = { x: 12, y: H - 116, w: 170, h: 104 }, C3_PUNCH_BTN = { x: W - 182, y: H - 116, w: 170, h: 104 };
function c3RunCfg() { return C3_RUN[diff.key] || C3_RUN.deputy; }
function c3Jump() {
  if (C3D.grind) c3EndGrind(); // ollie off the wire (keeps the combo going)
  else if (C3D.ride > 0 && C3D.air) { C3D.btn.j = 0.15; c3AirJump(); return; } // JUMP in the air = special trick
  if (C3D.air || C3D.trip > 0) return;
  C3D.air = true; C3D.vy = -218; C3D.btn.j = 0.15; C3.stats.jumps++; C3D.jumpAt = clock;
  tone('square', 260, 520, 0.12, 0.05); C3D.dust.push(...[0, 1, 2].map(i => ({ x: C3PX + 4 + i * 3, y: C3D.y + c3Off(), vx: -30 - i * 20, vy: -10, t: 0 })));
}
function c3Punch() {
  if (C3D.pcd > 0 || C3D.trip > 0) return;
  C3D.punch = 0.2; C3D.pcd = 0.34; C3D.btn.p = 0.15; noise(0.06, 0.2, 1800);
}
function c3Spawn(t) {
  const r = Math.random(), late = t > 12, pool = [['bush', 0.22], ['rock', 0.2], ['cactus', 0.22], ['snake', 0.22], ['cactus2', late ? 0.08 : 0], ['tumble', t > 8 ? 0.08 : 0], ['tallsnake', t > 5 ? 0.13 : 0], ['buzzard', t > 3 ? 0.13 : 0]];
  const tot = pool.reduce((a, p) => a + p[1], 0); let acc = 0, kind = 'bush';
  for (const [k, w] of pool) { acc += w / tot; if (r <= acc) { kind = k; break; } }
  const o = { kind, x: C3VW, ...C3_OBS[kind], rear: 0, y: 0, vy: 0, hit: false, passed: false, gone: false, seed: Math.random() * 6 };
  if (kind === 'tumble') { o.y = -10; o.vy = 0; }
  if (kind === 'tallsnake') { o.kind = 'snake'; o.tall = true; }          // rears up taller than you can jump
  if (kind === 'buzzard') { o.by = C3GY - 58; }                            // dives at your head wherever you are
  C3D.obs.push(o);
  if (Math.random() < 0.18) c3AddFly(C3VW + 40 + Math.random() * 40, C3GY - 34); // a dragonfly hovering just within jumping reach
}
function c3ObBox(o) { if (o.kind === 'buzzard') return { x: o.x, y: o.by - 4, w: 14, h: 9 }; const h = o.kind === 'snake' ? Math.round(6 + o.rear * (o.tall ? 34 : 12)) : o.h; return { x: o.x, y: (o.base ?? C3GY) - h + (o.kind === 'tumble' ? o.y : 0), w: o.w, h }; }
function c3PlayerBox() { return { x: C3PX + 3, y: C3D.y - 22, w: 8, h: 21 }; }
const c3Overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function c3Stumble(o) {
  o.hit = true; C3D.inv = 1.3; C3D.trip = 0.35; C3D.bumps++; shake = Math.max(shake, 0.5); sfx.thud();
  if (o.kind === 'snake' || o.kind === 'tumble' || o.kind === 'buzzard') { o.fly = true; o.vy = -90; o.vx = 60; }
  const left = c3RunCfg().crashes - C3D.bumps;
  if (left > 0) { woundT = 0.7; c3Pop(C3PX + 8, C3D.y - 34, o.kind === 'buzzard' ? 'PECKED! ' + left + ' LEFT' : o.kind === 'snake' ? 'SNAKEBIT! ' + left + ' LEFT' : 'OOF! ' + left + ' LEFT'); return; }
  C3D.bumps = 0; hurt(o.kind === 'buzzard' ? 'buzzard' : o.kind === 'snake' ? 'snake' : 'trip', null);
}
// ---- the runner: you, side view, with a 4-frame run cycle, a jump pose and a punch
function c3Runner(x, footY, fr, air, punch, trip, balance) {
  const top = footY - 26; let ink = false, ox = 0, oy = 0;
  const hp = (lx, ly, w, h, c) => R(x + lx + ox, top + ly + oy, w, h, ink ? INK : c);
  const SK = '#e0a070', SKD = '#c08050', HAT = '#6b4a2a', SH = '#8a2a2a', VE = '#3a2a20', PA = '#3a3550', BO = '#2a1a10';
  const legs = air ? [[6, 18, 3, 3, PA], [8, 20, 3, 3, PA], [9, 22, 4, 2, BO], [3, 18, 3, 4, '#2e2a44'], [2, 21, 3, 2, '#2e2a44'], [0, 22, 4, 2, BO]]
    : [[[7, 18, 2, 3], [8, 21, 2, 2], [8, 23, 4, 2], [4, 18, 2, 3], [2, 21, 2, 2], [0, 23, 4, 2]],
       [[5, 18, 3, 5], [5, 23, 4, 2], [5, 18, 2, 4], [4, 22, 2, 1], [3, 23, 4, 2], [5, 18, 1, 1]],
       [[4, 18, 2, 3], [2, 21, 2, 2], [0, 23, 4, 2], [7, 18, 2, 3], [8, 21, 2, 2], [8, 23, 4, 2]],
       [[6, 18, 2, 4], [7, 22, 2, 1], [7, 23, 4, 2], [4, 18, 2, 3], [3, 21, 2, 2], [2, 23, 3, 2]]][fr].map((l, i) => [...l, i === 2 || i === 5 ? BO : i < 3 ? PA : '#2e2a44']);
  const shape = () => {
    for (const [lx, ly, w, h, c] of legs) hp(lx, ly, w, h, c);
    if (balance) { hp(-3, 11, 7, 2, '#6a2020'); hp(-5, 10, 2, 2, SK); }           // arms out for balance
    else if (!punch) hp(3, 11 + (fr % 2), 2, 5, '#6a2020');                        // back arm swinging
    hp(4, 10, 6, 8, SH); hp(4, 10, 3, 8, VE); hp(4, 17, 6, 1, '#2a1a10'); hp(8, 17, 1, 1, '#c9a040'); // torso, vest, belt
    hp(6, 9, 3, 1, SK);                                                            // neck
    hp(5, 3, 6, 6, SK); hp(11, 5, 1, 2, SK); hp(4, 3, 2, 4, '#1b1410');           // head, nose, hair
    hp(7, 7, 4, 2, SKD); hp(9, 5, 1, 1, INK);                                     // stubble, eye
    hp(1, 2, 13, 2, HAT); hp(4, -1, 7, 3, HAT); hp(4, 1, 7, 1, '#3b2210');       // hat
    if (balance) { hp(9, 11, 7, 2, SH); hp(16, 10, 2, 2, SK); }
    else if (punch) { hp(9, 11, 7, 3, SH); hp(16, 10, 3, 4, SK); }                     // fist out!
    else hp(8, 11 + ((fr + 1) % 2), 2, 5, SH), hp(8, 15 + ((fr + 1) % 2), 2, 2, SK);
  };
  if (trip > 0) { G3.save(); G3.translate(x + 7, footY); G3.rotate(0.5 * Math.min(1, trip * 4)); G3.translate(-x - 7, -footY); }
  ink = true; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { ox = dx; oy = dy; shape(); }
  ink = false; ox = oy = 0; shape();
  if (trip > 0) G3.restore();
}
function c3DrawOb(o) {
  const x = Math.round(o.x), b = o.base ?? C3GY;
  if (o.fly) { G3.save(); G3.translate(x + o.w / 2, b - 4 + (o.fy || 0)); G3.rotate(o.rot || 0); G3.translate(-(x + o.w / 2), -(b - 4)); }
  if (o.kind === 'bush') { for (let j = 0; j < 8; j++) { const hw = Math.round(6 * Math.sqrt(1 - Math.pow((j - 8) / 8, 2) * 0.6)); R(x + 6 - hw, b - 8 + j, hw * 2, 1, j < 2 ? '#4e7a34' : j % 2 ? '#2e5224' : '#3a6228'); } R(x + 2, b - 7, 1, 1, '#6a9a44'); R(x + 9, b - 5, 1, 1, '#6a9a44'); }
  else if (o.kind === 'rock') { for (let j = 0; j < 9; j++) { const hw = Math.round(6.5 * Math.sqrt(1 - Math.pow((9 - j) / 9, 2) * 0.85)); R(x + 6 - hw, b - 9 + j, hw * 2, 1, j < 3 ? '#b8a48c' : '#8a7462'); R(x + 6 + Math.round(hw * 0.3), b - 9 + j, Math.max(1, Math.round(hw * 0.7)), 1, '#6a5644'); } }
  else if (o.kind === 'cactus' || o.kind === 'cactus2') {
    const one = (cx, h) => { R(cx, b - h, 4, h, '#3a7a3a'); R(cx, b - h, 1, h, '#5a9a4a'); R(cx + 3, b - h, 1, h, '#2a5a2a'); R(cx - 3, b - h + 5, 3, 2, '#3a7a3a'); R(cx - 3, b - h + 2, 2, 4, '#3a7a3a'); R(cx + 4, b - h + 8, 3, 2, '#3a7a3a'); R(cx + 5, b - h + 4, 2, 5, '#3a7a3a'); R(cx + 1, b - h - 1, 2, 1, '#e8607a'); };
    if (o.kind === 'cactus') one(x + 1, 18); else { one(x + 1, 15); one(x + 10, 11); }
  }
  else if (o.kind === 'snake') {
    const rr = o.rear, rattle = Math.floor(clock * 30) % 2;
    for (let i = 0; i < 12; i++) { const yy = b - 2 - Math.round(Math.sin(i * 0.9 + clock * 6) * 1); R(x + 2 + i, yy, 2, 2, i % 3 ? '#b8955a' : '#6a4a2a'); }
    R(x + 14, b - 3 - rattle, 2, 2, '#e8d8a0');
    const h = Math.round(4 + rr * (o.tall ? 32 : 12));
    for (let j = 0; j < h; j++) R(x + 1 + Math.round(Math.sin(j * 0.5 + clock * 4) * rr * 1.5), b - 2 - j, 3, 1, j % 3 ? '#b8955a' : '#6a4a2a');
    const hx = x - 1, hy = b - 3 - h; R(hx, hy, 5, 3, '#9a7a4a'); R(hx + 1, hy, 1, 1, '#ffd23f'); if (rr > 0.5 && Math.floor(clock * 8) % 2) R(hx - 3, hy + 2, 3, 1, '#c0302b');
  }
  else if (o.kind === 'buzzard') { // ugly old buzzard: bald red head, black wings flapping
    const y = Math.round(o.by), up = Math.floor(clock * 10 + o.seed) % 2;
    R(x + 2, y - 2, 9, 5, '#2a2228'); R(x + 3, y - 2, 7, 1, '#4a4048'); R(x - 1, y - 1, 3, 2, '#e8d8c0'); R(x - 3, y - 1, 3, 2, '#c04a3a'); R(x - 4, y, 1, 1, '#e8c040'); R(x - 2, y - 1, 1, 1, INK);
    R(x + 10, y - 1, 4, 3, '#2a2228');
    if (up) { R(x + 3, y - 8, 4, 6, '#2a2228'); R(x + 6, y - 6, 5, 4, '#3a3038'); } else { R(x + 3, y + 3, 4, 5, '#2a2228'); R(x + 6, y + 3, 5, 3, '#3a3038'); }
  }
  else if (o.kind === 'tumble') { const cx = x + 5, cy = b - 5 + o.y; ring(cx, cy, 5, 4, '#8a6a3a'); const a = clock * 8; line(cx - Math.cos(a) * 5, cy - Math.sin(a) * 5, cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, '#a8864a'); line(cx - Math.sin(a) * 5, cy + Math.cos(a) * 5, cx + Math.sin(a) * 5, cy - Math.cos(a) * 5, '#a8864a'); }
  if (o.fly) G3.restore();
}
const C3ZC = document.createElement('canvas'); C3ZC.width = 440; C3ZC.height = 250;
const C3ZG = C3ZC.getContext('2d');
const C3_ZMIN = 0.76, C3AX = C3PX + 7; // zoom pivots on the ground under you
function c3Zoom() { return C3D.zoom || 1; }
function c3ToScreen(x, y) { const z = c3Zoom(); return { x: C3AX + z * (x - C3AX), y: C3GY + z * (y + (C3D.camY || 0) - C3GY) }; }
function c3DesertArt() { // draw the run 1:1 on a bigger canvas, then shrink it onto the screen (stays pixel-crisp)
  const z = c3Zoom(), dx = Math.round(C3AX / z - C3AX), dy = Math.round(C3GY / z - C3GY);
  C3ZG.setTransform(1, 0, 0, 1, 0, 0); C3ZG.imageSmoothingEnabled = false; C3ZG.clearRect(0, 0, C3ZC.width, C3ZC.height); C3ZG.translate(dx, dy);
  const R0 = R; G3 = C3ZG; R = (x, y, w, h, c) => { C3ZG.fillStyle = c; C3ZG.fillRect(x, y, w, h); };
  try { c3DesertRaw(); } finally { R = R0; G3 = g; }
  g.imageSmoothingEnabled = false; g.drawImage(C3ZC, 0, 0, LW / z, LH / z, 0, 0, LW, LH);
}
function c3DesertRaw() {
  const d = C3D.dist || 0, cam = Math.round(C3D.camY || 0);
  R(-80, -160, LW + 260, 160, '#2e2a5c'); G3.drawImage(c3Bake('runSky', LW, 100, px => c3Grad(px, 0, 0, LW, 100, ['#2e2a5c', '#5a3868', '#a2506a', '#e0784e', '#f6aa66', '#fcd898'])), -80, 0, LW + 260, 100);
  for (const [x, y, w] of [[20, 16, 70], [140, 28, 90], [250, 10, 50], [380, 20, 60]]) { const xx = Math.round(((x - d * 0.02) % 520 + 520) % 520 - 80); R(xx, y, w, 2, '#f0907a'); R(xx + 8, y - 1, w - 20, 1, '#ffc090'); }
  disc(250, 84 + Math.round(cam * 0.2), 14, '#ffd890'); disc(250, 84 + Math.round(cam * 0.2), 10, '#fff0c0');
  G3.save(); G3.translate(0, Math.round(cam * 0.3));
  c3Strip(c3Ridge('runFar', 640, 30, x => 12 + c3Wave(640, [[6, 3, 0.4], [3, 8, 1.2]])(x), { lit: '#8a5a78', dark: '#6e4466', rim: '#e8907a', foot: '#7a4e6c' }, false), d * 0.06, 72);
  c3Strip(c3Mesas('runMid', 560, 40, [[40, 40, 70, 28], [170, 20, 36, 20], [300, 70, 100, 34], [440, 30, 54, 24]], { cap: '#e08a5e', mid: '#a8503c', band: '#bc6448', dark: '#7a3428', darkBand: '#6a2c22', talus: '#9a5a40' }), d * 0.18, 66);
  for (let i = 0; i < 5; i++) { const p = (clock * 0.3 + i / 5) % 1; disc(Math.round(300 - p * 22), Math.round(103 - p * 5), 1 + Math.round(p * 3), `rgba(240,200,150,${0.5 * (1 - p)})`); }
  R(299, 102, 3, 2, '#3a2010');
  G3.restore(); G3.save(); G3.translate(0, Math.round(cam * 0.6));
  R(-80, 104, LW + 260, 200, '#c48c54');
  c3Strip(c3Ridge('runDunes', 480, 16, x => 7 + c3Wave(480, [[4, 4, 1.1], [2, 9, 0.3]])(x), { lit: '#e0a868', dark: '#c48c54', rim: '#f8d098' }, false), d * 0.45, 92);
  G3.restore(); G3.save(); G3.translate(0, cam); // everything you can touch follows the camera
  c3Strip(c3Bake('runGround', 320, 72, px => { c3Grad(px, 0, 0, 320, 72, ['#d8a464', '#cc945a', '#c08850', '#b07a44']);
    for (let i = 0; i < 220; i++) px(Math.round(c3Hash(i * 5) * 320), Math.round(c3Hash(i * 7) * 72), 2, 1, i % 3 ? '#b8844c' : '#e8bc80');
    for (const y of [22, 30]) for (let x = 0; x < 320; x++) px(x, y + (c3Hash(x >> 2) > 0.8 ? 1 : 0), 1, 2, '#a8723e');
    px(0, 0, 320, 1, '#f0c890'); }), d, 108);
  R(-80, 180, LW + 260, 140, '#b07a44');
  C3D.wires.forEach(c3DrawWirePoles);
  C3D.plats.forEach(c3DrawRock);
  C3D.ramps.forEach(c3DrawRamp);
  C3D.wires.forEach(c3DrawWire);
  c3DrawTurtles();
  { const base = C3D.y + c3Off(), fl = C3D.grind ? C3D.grind.wire.y : c3Under(base).floor; G3.globalAlpha = 0.3; R(C3PX + 1, fl, 14 - Math.round(Math.max(0, fl - base) * 0.15), 2, '#5a3418'); G3.globalAlpha = 1; }
  C3D.flies.forEach(c3DrawFly);
  C3D.obs.forEach(c3DrawOb);
  const fr = Math.floor(C3D.runT * 12) % 4, blink = C3D.inv > 0 && C3D.ride <= 0 && Math.floor(clock * 16) % 2;
  const gr = C3D.grind, f = C3D.flip && C3D.flip.t < C3D.flip.trick.dur ? C3D.flip : null, fx = f ? f.trick.fx(f.t / f.trick.dur) : null;
  G3.save();
  if (gr) { // wobble on the wire: the further off-centre, the harder you rock
    const a = gr.bal * 0.45 + (Math.abs(gr.bal) > 0.5 ? Math.sin(clock * 24) * 0.12 * Math.abs(gr.bal) : 0), px = C3PX + 7, py = Math.round(C3D.y) + C3_SHELL;
    G3.translate(px, py); G3.rotate(a); G3.translate(-px, -py);
  }
  if (f && f.trick.whole) { const px = C3PX + 7, py = Math.round(C3D.y) - 4; G3.translate(px, py); G3.rotate(fx.rot); G3.translate(-px, -py); }
  if (C3D.ride > 0) {
    const tx = C3PX + C3_TX, ty = Math.round(C3D.y) + C3_SHELL;
    if (f && !f.trick.whole) { const cx = tx + 9, cy = ty - 7; G3.save(); G3.translate(cx, cy); G3.rotate(fx.rot || 0); G3.scale(fx.sx ?? 1, fx.sy ?? 1); G3.translate(-cx, -cy); c3DrawTortoise(tx, ty, true); G3.restore(); }
    else c3DrawTortoise(tx, ty, true);
  }
  if (!blink) c3Runner(C3PX, Math.round(C3D.y), C3D.ride > 0 && !C3D.air ? 1 : fr, C3D.air || !!f, C3D.punch > 0, C3D.trip, !!gr);
  G3.restore();
  for (const p of C3D.sparks) R(Math.round(p.x), Math.round(p.y), 1, 1, p.t < 0.15 ? '#fff4c8' : '#ffb347');
  if (C3D.punch > 0.1) { R(C3PX + 21, Math.round(C3D.y) - 17, 3, 1, '#ffffff'); R(C3PX + 22, Math.round(C3D.y) - 14, 3, 1, '#ffffff'); }
  for (const p of C3D.dust) { G3.globalAlpha = Math.max(0, 0.6 * (1 - p.t / 0.5)); disc(Math.round(p.x), Math.round(p.y), 1 + Math.round(p.t * 6), '#e8c890'); G3.globalAlpha = 1; }
  for (const rb of C3D.rubble) { G3.save(); G3.translate(Math.round(rb.x), Math.round(rb.y)); G3.rotate(rb.rot); R(-rb.s / 2, -rb.s / 2, rb.s, rb.s, rb.c); R(-rb.s / 2, -rb.s / 2, rb.s, 1, '#f2b878'); G3.restore(); }
  for (let i = 0; i < 22; i++) { const x = Math.round(((i * 41 - d * 1.4) % 500 + 500) % 500 - 60), h = 3 + (i * 7) % 4; for (let j = 0; j < h; j++) R(x + (j >> 1), 172 - j, 1, 1, j > h - 2 ? '#c8b070' : '#8a7a40'); }
  G3.restore();
}
RUNS.desert = {
  c3: true, label: null, name: 'THE LONG RUN', title: 'THE LONG RUN', hint: 'RIDE THE TORTOISE: FLIP, GRIND, BALANCE!',
  hurtText: { trip: { title: 'FACEPLANT!', reason: 'JUMP THE BRUSH, PARTNER.', color: '#ffb347' }, snake: { title: 'SNAKEBIT!', reason: 'PUNCH THE RATTLERS.', color: '#ff3b30' }, buzzard: { title: 'PECKED!', reason: 'PUNCH THE BUZZARDS.', color: '#ff3b30' }, rock: { title: 'SMACK!', reason: 'JUMP UP ONTO THE ROCKS.', color: '#ff3b30' } },
  get tune() { return C3D.ride > 0 ? 'c3ride' : 'c3run'; }, // the music swaps to the hoedown while you're riding the tortoise
  reset() { // a fresh attempt: stats + best trick start over from the start of this run
    if (C3.runSnap) C3.stats = { ...C3.runSnap }; else C3.runSnap = { ...C3.stats };
    C3.bestTrick = null;
    Object.assign(C3D, { y: C3GY, vy: 0, air: false, punch: 0, pcd: 0, inv: 0, trip: 0, bumps: 0, obs: [], plats: [], flies: [], forms: c3Forms(), turtles: [{ x: null, t: 8.5 }], ride: 0, rubble: [], broken: new Set(), rideOff: null, dust: [], dist: 0, v: c3RunCfg().v0, spawnT: 1.2, runT: 0, btn: { j: 0, p: 0, l: 0, r: 0 },
    ramps: [], wires: [], sparks: [], skate: c3Skate(), zoom: 1, grind: null, flip: null, combo: null, grade: null, big: false, lastTrick: '', camY: 0 }); ammo = 6; },
  tick(dt) { C3D.dist += C3D.v * dt * 0.5; C3D.runT += dt * 0.6; },
  update(dt) {
    ammo = 6; const cfg = c3RunCfg(), k = Math.min(1, time / C3_RUN_T);
    C3D.v = (cfg.v0 + (cfg.v1 - cfg.v0) * k) * (C3D.ride > 0 ? C3_TURBO : 1); C3D.dist += C3D.v * dt; C3D.runT += dt * (C3D.v / 100);
    for (const kk in C3D.btn) C3D.btn[kk] = Math.max(0, C3D.btn[kk] - dt);
    C3D.punch = Math.max(0, C3D.punch - dt); C3D.pcd = Math.max(0, C3D.pcd - dt); C3D.inv = Math.max(0, C3D.inv - dt); C3D.trip = Math.max(0, C3D.trip - dt);
    for (const pl of C3D.plats) pl.x -= C3D.v * dt;
    C3D.plats = C3D.plats.filter(pl => pl.x + pl.w > -20 && !pl.gone);
    for (const it of [...C3D.ramps, ...C3D.wires]) it.x -= C3D.v * dt;
    C3D.ramps = C3D.ramps.filter(r => r.x + r.w > -20); C3D.wires = C3D.wires.filter(w => w.x + w.w > -20 || C3D.grind?.wire === w);
    for (const p of C3D.sparks) { p.t += dt; p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; } C3D.sparks = C3D.sparks.filter(p => p.t < 0.4);
    if (C3D.flip) C3D.flip.t += dt;
    while (C3D.forms.length && time >= C3D.forms[0].t) { const fm = C3D.forms.shift(); c3BuildForm(fm.seq, fm.wire); }
    while (C3D.skate.length && time >= C3D.skate[0].t) c3SpawnRampRail(C3D.skate.shift().k);
    c3Tortoise(dt);
    // movement: you (or the tortoise under you) land on ledges, fall off them, or hit them head-on
    const off = c3Off(), prevB = C3D.y + off;
    let held = false; // grinding / riding a ramp / catching a wire: those set your height themselves
    if (C3D.grind) held = c3GrindStep(dt);
    else if (C3D.ride > 0 && !C3D.air && prevB >= C3GY - 30) held = c3RampStep(); // (30: tall enough for the big kickers)
    if (!held) {
      if (C3D.air) { C3D.vy += 640 * dt; C3D.y += C3D.vy * dt; }
      if (C3D.air && c3CatchWire(prevB, C3D.y + off)) held = true;
    }
    if (!held) { const curB = C3D.y + off, hiB = Math.min(prevB, curB), u = c3Under(hiB);
      if (u.wall) { if (C3D.ride > 0) c3SmashWalls(hiB); else { c3Smack(); return; } }
      const u2 = c3Under(hiB);
      if (C3D.air && C3D.vy >= 0 && curB >= u2.floor) { C3D.y = u2.floor - off; C3D.air = false; C3D.vy = 0; C3D.big = false; C3D.dust.push({ x: C3PX + 6, y: u2.floor, vx: -40, vy: -8, t: 0 }); if (C3D.ride > 0) c3Landed(); }
      else if (!C3D.air && u2.floor > curB + 1) { C3D.air = true; C3D.vy = 0; } }
    { const h = C3GY - (C3D.y + c3Off()), zt = 1 - (1 - C3_ZMIN) * Math.max(0, Math.min(1, h / 110)); C3D.zoom = (C3D.zoom || 1) + (zt - (C3D.zoom || 1)) * Math.min(1, dt * 3); // zoom out the higher you are
      const z = C3D.zoom, top = C3D.y - 26, want = Math.max(0, Math.min(90, (36 - C3GY) / z + C3GY - top)); C3D.camY += (want - C3D.camY) * Math.min(1, dt * 6); } // ...and rise with you
    if (!C3D.air && Math.random() < dt * 8) C3D.dust.push({ x: C3PX + 2, y: C3D.y + off - 1, vx: -C3D.v * 0.4, vy: -6, t: 0 });
    for (const p of C3D.dust) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    C3D.dust = C3D.dust.filter(p => p.t < 0.5);
    C3D.spawnT -= dt;
    const rocksNear = C3D.plats.some(pl => pl.x + pl.w > C3VW - 180) || C3D.ramps.some(r => r.x + r.w > C3VW - 240) || C3D.wires.some(w => w.x + w.w > C3VW - 180) || (C3D.skate.length && C3D.skate[0].t - time < 1.4 && C3D.ride > 0) || (C3D.forms.length && C3D.forms[0].t - time < 1.6) || (C3D.turtles.some(tt => !tt.mounted && (tt.x == null ? tt.t - time < 1.4 : tt.x > C3PX - 30)));
    if (rocksNear) C3D.spawnT = Math.max(C3D.spawnT, 0.2);
    if (C3D.spawnT <= 0 && time < C3_RUN_T - 2) { c3Spawn(time); C3D.spawnT = Math.max(0.95, cfg.gap * (0.85 + Math.random() * 0.7) * (cfg.v0 / C3D.v) * 1.1); }
    const pb = c3PlayerBox(), fist = { x: C3PX + 10, y: C3D.y - 22, w: 22, h: 18 };
    for (const f of C3D.flies) { f.x -= C3D.v * dt; if (!f.got && c3Overlap(pb, { x: f.x - 4, y: f.y + Math.sin(clock * 5 + f.seed) * 2 - 3, w: 9, h: 6 })) {
      f.got = true; C3.stats.flies++; S.n.obj++; targets++; addScore(250, 'obj'); c3Pop(f.x, f.y - 8, 'DRAGONFLY +250'); [1320, 1760].forEach((fq, i) => setTimeout(() => tone('square', fq, fq * 1.2, 0.07, 0.05), i * 60)); } }
    C3D.flies = C3D.flies.filter(f => f.x > -10 && !f.got);
    for (const o of C3D.obs) {
      o.x -= C3D.v * dt;
      if (o.fly) { o.fvy = (o.fvy ?? o.vy) + 500 * dt; o.fy = (o.fy || 0) + o.fvy * dt; o.x += (o.vx || 0) * dt; o.rot = (o.rot || 0) + dt * 12; if (o.fy > 80) o.gone = true; continue; }
      if (o.kind === 'snake') { const dx = o.x - C3PX; if (dx < 80 && o.rear < 1) { if (o.rear === 0) noise(0.5, 0.12, 6000); o.rear = Math.min(1, o.rear + dt * 3); } }
      if (o.kind === 'buzzard') { o.x -= 35 * dt; const dx = o.x - C3PX, ty = dx < 130 ? C3D.y - 16 : C3GY - 58; o.by += (ty - o.by) * Math.min(1, dt * 5); if (dx < 130 && !o.cawed) { o.cawed = true; tone('sawtooth', 700, 380, 0.25, 0.06); } }
      if (o.kind === 'tumble') { o.vy += 400 * dt; o.y += o.vy * dt; if (o.y > 0) { o.y = 0; o.vy = -150 - Math.random() * 40; } o.x -= 25 * dt; }
      const ob = c3ObBox(o);
      if (C3D.punch > 0 && (o.kind === 'snake' || o.kind === 'tumble' || o.kind === 'buzzard') && c3Overlap(fist, ob)) {
        o.fly = true; o.vy = -150; o.vx = 120; sfx.hit(); targets++; hits++;
        if (o.kind === 'buzzard') { C3.stats.buzzards++; S.n.obj++; addScore(200, 'obj'); c3Pop(o.x, o.by - 10, 'WHAP! +200'); c3Burst(o.x + 6, o.by, 10, ['#2a2228', '#4a4048', '#c04a3a'], 60); }
        else if (o.kind === 'snake') { C3.stats.snakes++; S.n.obj++; addScore(150, 'obj'); c3Pop(o.x, (o.base ?? C3GY) - 26, 'POW! +150'); }
        else { addScore(50, 'obj'); c3Pop(o.x, C3GY - 22, 'BAM! +50'); c3Burst(o.x + 5, C3GY - 5, 10, ['#8a6a3a', '#a8864a'], 60); o.gone = true; }
        continue;
      }
      if (C3D.ride > 0 && !o.hit && c3Overlap(c3RideBox(), ob)) { c3Bowl(o); continue; }
      if (!o.hit && C3D.inv <= 0 && c3Overlap(pb, ob)) { c3Stumble(o); if (state !== 'play') return; continue; }
      if (!o.passed && !o.hit && o.x + o.w < C3PX) { o.passed = true; addScore(25, 'obj'); }
    }
    C3D.obs = C3D.obs.filter(o => !o.gone && o.x > -30);
  },
  done() { return time >= C3_RUN_T && C3D.ride <= 0 && !C3D.forms.length && !C3D.plats.some(pl => pl.x + pl.w > C3PX) && !C3D.obs.some(o => o.x > C3PX - 10 && !o.fly); },
  shoot() { return true; },
  press(x, y) {
    if (state !== 'play') return;
    if (C3D.grind) { // on the wire: left / right lean, middle hops off
      if (inBox(x, y, C3_MID_BTN)) return c3Jump();
      if (inBox(x, y, C3_JUMP_BTN) || x < W / 3) return c3Lean(-1);
      if (inBox(x, y, C3_PUNCH_BTN) || x > W * 2 / 3) return c3Lean(1);
      return c3Jump();
    }
    if (inBox(x, y, C3_JUMP_BTN)) return c3Jump();
    if (inBox(x, y, C3_PUNCH_BTN)) return c3Flip(); // FLIP while riding, PUNCH on foot
    if (x < W / 2) c3Jump(); else c3Flip();
  },
  key(k) {
    if (C3D.grind && (k === 'arrowleft' || k === 'a')) { c3Lean(-1); return true; }
    if (C3D.grind && (k === 'arrowright' || k === 'd')) { c3Lean(1); return true; }
    if (k === ' ' || k === 'arrowup' || k === 'w') { c3Jump(); return true; }
    if (k === 'f' || k === 'x' || k === 'arrowright' || k === 'd' || k === 'j') { c3Flip(); return true; }
    return false;
  },
  draw() { c3DesertArt(); },
  ui() {
    if (!['intro', 'play'].includes(state)) return;
    const bx = W / 2 - 180, bw = 360, k = Math.min(1, time / C3_RUN_T);
    rect(bx - 3, 14, bw + 6, 12, INK); rect(bx, 17, bw, 6, '#7a5a34'); rect(bx, 17, Math.round(bw * k), 6, '#ffd23f');
    rect(bx + Math.round(bw * k) - 5, 9, 10, 10, '#c0302b'); text("JENNY'S TRAIL", W / 2, 34, 16, '#ffd23f', 'center');
    const n = c3RunCfg().crashes, left = n - C3D.bumps, wx0 = W / 2 - (n * 26) / 2;
    text('LEGS', wx0 - 10, 58, 16, '#f3d18b', 'right');
    for (let i = 0; i < n; i++) { rect(wx0 + i * 26, 56, 20, 18, INK); rect(wx0 + i * 26 + 3, 59, 14, 12, i < left ? '#e8c890' : '#3a2a20'); }
    if (state === 'play' && C3D.ride > 0) { const w = 300, x = W / 2 - w / 2, kr = C3D.ride / C3_RIDE_T; rect(x - 3, 86, w + 6, 12, INK); rect(x, 89, Math.round(w * kr), 6, kr > 0.25 ? '#8aba5a' : '#ff9a3a'); }
    if (C3D.grind) { // balance meter: keep the ball on the middle line
      const gw = 300, gx = W / 2 - gw / 2, gy = H - 150, b = Math.max(-1, Math.min(1, C3D.grind.bal)), warn = Math.abs(b) > 0.5;
      rect(gx - 4, gy - 4, gw + 8, 22, INK); rect(gx, gy, gw, 14, '#5a3418');
      rect(gx, gy, Math.round(gw * 0.25), 14, '#8a2a2a'); rect(gx + Math.round(gw * 0.75), gy, Math.round(gw * 0.25), 14, '#8a2a2a');
      rect(gx + gw / 2 - 1, gy - 6, 3, 26, '#ffd23f');
      const bx = gx + gw / 2 + b * (gw / 2 - 8); rect(bx - 7, gy - 1, 14, 16, INK); rect(bx - 5, gy + 1, 10, 12, warn && Math.floor(clock * 10) % 2 ? '#ff3b30' : '#ffffff');
      text('BALANCE', W / 2, gy - 30, 16, warn ? '#ff8a8a' : '#ffd23f', 'center');
    }
    ctx.globalAlpha = 0.88;
    const btns = C3D.grind ? [[C3_JUMP_BTN, '<< LEAN', C3D.btn.l > 0], [C3_MID_BTN, 'JUMP', C3D.btn.j > 0], [C3_PUNCH_BTN, 'LEAN >>', C3D.btn.r > 0]]
      : [[C3_JUMP_BTN, 'JUMP', C3D.btn.j > 0], [C3_PUNCH_BTN, C3D.ride > 0 ? 'FLIP' : 'PUNCH', C3D.btn.p > 0]];
    for (const [b, label, on] of btns) {
      panel(b.x, b.y, b.w, b.h, on ? '#9a6236' : '#5a3418'); text(label, b.x + b.w / 2, b.y + b.h / 2 - 8, 16, on ? '#ffd23f' : '#ffffff', 'center');
    }
    ctx.globalAlpha = 1;
  },
};

// =====================================================================
//  ROCK STEPS + CLUMPS + DRAGONFLIES
// =====================================================================
const C3LV = 22;
const C3_FORM_FIRST = [1, 0, 1, 2, 1, 2, 3, 4, 3, 4, 3, 2, 3, 4, 5, 4, 5, 3, 1]; // tops out at level 5
function c3RandForm(n) { const out = []; let L = 0; for (let i = 0; i < n; i++) { const up = Math.random() < 0.55; L = up ? Math.min(5, L + 1) : Math.floor(Math.random() * L) + (L > 1 ? 1 : 0); if (L === 0) L = 1; out.push(L); } return out; }
function c3Clump() { return pick([[1, 2, 2, 1], [1, 2, 3, 2], [1, 1, 2, 1], [1, 2, 1, 2], [1, 2, 1]]).map(l => -l); } // negative = clump ledge
function c3Forms() { return [{ t: 6, seq: c3Clump() }, { t: 19, seq: C3_FORM_FIRST, wire: true }, { t: 37, seq: c3RandForm(6) }, { t: 41.5, seq: c3Clump() }]; }
let c3FormId = 0;
function c3AddFly(x, y) { C3D.flies.push({ x, y, seed: Math.random() * 6, got: false, c: pick(['#3ac8c8', '#5ad86a', '#c860e0']) }); }
function c3BuildForm(seq, wire) {
  const v = C3D.v, form = ++c3FormId; // ledge widths keep pace with how fast you're going, so they're always climbable
  let x = Math.max(c3CourseEnd(v), ...C3D.plats.map(pl => pl.x + pl.w + Math.round(v * 1.1))); // a full stride of open ground between piles
  let wx0 = null, wx1 = null;
  seq.forEach((raw, i) => {
    const clump = raw < 0, lvl = Math.abs(raw), w = Math.round(v * (clump ? 0.84 + Math.random() * 0.06 : 0.78 + Math.random() * 0.25));
    const next = Math.abs(seq[i + 1] ?? 0), prev = i > 0 ? Math.abs(seq[i - 1]) : 0;
    if (wire && lvl === 4 && wx0 == null) wx0 = x;      // the power line starts over the first top ledge...
    if (wire && wx0 != null && i <= 12) wx1 = x + w;      // ...and runs out a few ledges later
    if (lvl > 0) {
      const pl = { x, w, lvl, form, clump, seed: Math.random() * 1000 | 0 }; C3D.plats.push(pl);
      const top = C3GY - lvl * C3LV;
      if (!clump && prev > lvl && next <= lvl && w > v * 0.8 && Math.random() < 0.75) {
        const kind = pick(['bush', 'rock', 'cactus', 'snake', 'snake']);
        C3D.obs.push({ kind, x: x + Math.round(w * 0.6), ...C3_OBS[kind], base: top, rear: 0, y: 0, vy: 0, hit: false, passed: false, gone: false, seed: Math.random() * 6, ride: pl });
      } else if (clump ? lvl === Math.max(...seq.map(Math.abs)) : Math.random() < 0.3) c3AddFly(x + Math.round(w * 0.5), top - 34);
    }
    x += w;
  });
  if (wire && wx0 != null && C3D.ride > 0) C3D.wires.push({ kind: 'power', x: wx0 + 10, w: wx1 - wx0 - 10, y: C3GY - 4 * C3LV - 24 }); // only reachable from the top ledge
}
function c3Under(baseY) {
  const x0 = C3D.ride > 0 ? C3PX + C3_TX : C3PX + 4, x1 = C3D.ride > 0 ? C3PX + C3_TX + C3_TW : C3PX + 10;
  let floor = C3GY, wall = false;
  for (const pl of C3D.plats) if (!pl.gone && pl.x < x1 && pl.x + pl.w > x0) {
    const top = C3GY - pl.lvl * C3LV;
    if (top < baseY - 3) wall = true; else floor = Math.min(floor, top);
  }
  return { floor, wall };
}
function c3Smack() {
  shake = 1; sfx.thud(); noise(0.4, 0.6, 600); c3Burst(C3PX + 12, C3D.y - 12, 14, ['#c8703c', '#e8a060', '#8a3a24'], 90);
  C3D.bumps = 0; hurt('rock', null);
}
function c3DrawRock(pl) {
  const x0 = Math.round(pl.x), w = pl.w, top = C3GY - pl.lvl * C3LV, H = C3GY - top + 2;
  if (x0 > LW || x0 + w < 0) return;
  for (let j = 0; j < H; j++) {
    const y = top + j, band = Math.floor((j + pl.seed % 5) / 4) % 4, lvlLine = j > 0 && j % C3LV === 0;
    const col = j < 2 ? '#f2b878' : lvlLine ? '#7a3424' : ['#c8703c', '#b8603a', '#d07c44', '#a85434'][band];
    R(x0, y, w, 1, col);
    if (j >= 2 && !lvlLine) for (let k = 0; k < w / 14; k++) { const hx = x0 + Math.round(c3Hash(pl.seed + j * 31 + k * 7) * (w - 3)); if (c3Hash(pl.seed * 3 + j * 13 + k) > 0.72) R(hx, y, 2 + (k % 3), 1, band % 2 ? '#e08a50' : '#94482e'); }
  }
  for (let k = 0; k < Math.max(1, w / 40); k++) { let cx = x0 + 6 + Math.round(c3Hash(pl.seed + k * 91) * (w - 12)); for (let j = 3; j < Math.min(H, 18 + k * 5); j++) { R(cx, top + j, 1, 1, '#6a2c1e'); if (c3Hash(pl.seed + j * 5 + k) > 0.7) cx += c3Hash(pl.seed + j) > 0.5 ? 1 : -1; } }
  R(x0, top, 3, H, '#8a3e2a'); R(x0, top, 1, H, '#5a2418');
  R(x0, top, w, 1, '#ffd8a0'); R(x0 + 3, top + 1, w - 3, 1, '#e8a060');
  for (let k = 0; k < w / 18; k++) { const gx = x0 + 6 + Math.round(c3Hash(pl.seed + k * 17) * (w - 12)); R(gx, top - 2, 1, 2, '#6a7a34'); R(gx + 1, top - 1, 1, 1, '#8a9a44'); }
  if (w > 40) R(x0 + Math.round(w * 0.7), top - 1, 3, 1, '#b89070');
  R(x0 - 1, top - 1, 1, H + 1, INK); R(x0, top - 1, w, 1, INK);
}
function c3DrawFly(f) {
  const x = Math.round(f.x), y = Math.round(f.y + Math.sin(clock * 5 + f.seed) * 2), up = Math.floor(clock * 24 + f.seed) % 2;
  R(x - 5, y, 7, 1, f.c); R(x + 2, y - 1, 2, 2, f.c); R(x + 3, y - 1, 1, 1, INK);
  G3.globalAlpha = 0.75;
  if (up) { R(x - 2, y - 4, 2, 3, '#e8f8ff'); R(x + 1, y - 4, 2, 3, '#e8f8ff'); } else { R(x - 4, y - 2, 4, 1, '#e8f8ff'); R(x + 1, y - 2, 4, 1, '#e8f8ff'); }
  G3.globalAlpha = 1;
  if (Math.floor(clock * 3 + f.seed) % 3 === 0) R(x + 1, y - 5, 1, 1, '#ffffff');
}

// =====================================================================
//  THE CRAZY TORTOISE
// =====================================================================
const C3_RIDE_T = 24, C3_TURBO = 1.9, C3_SHELL = 11, C3_TX = -3, C3_TW = 18;
const c3Off = () => (C3D.ride > 0 ? C3_SHELL : 0);
const c3RideBox = () => ({ x: C3PX + C3_TX, y: C3D.y - 22, w: C3_TW + 8, h: 22 + C3_SHELL });
function c3DrawTortoise(x, footY, riding) {
  x = Math.round(x); const b = footY, f = Math.floor(clock * (riding ? 30 : 8)) % 4, bob = riding ? (f % 2) : (Math.floor(clock * 4) % 2);
  if (riding) { for (const lx of [2, 6, 11, 15]) { R(x + lx - 2, b - 4, 5, 4, 'rgba(90,120,50,0.55)'); R(x + lx - 1 + (f - 1), b - 3, 3, 3, '#5a7a30'); } }
  else for (const [lx, ph] of [[2, 0], [6, 2], [11, 1], [15, 3]]) R(x + lx + ((f + ph) % 4 < 2 ? 0 : 1), b - 4, 3, 4, '#5a7a30');
  const sy = b - 13 - bob;
  for (let j = 0; j < 10; j++) { const hw = Math.round(9 * Math.sqrt(1 - Math.pow((10 - j) / 10.5, 2))); R(x + 9 - hw, sy + j, hw * 2, 1, j < 2 ? '#8aba5a' : j % 3 === 0 ? '#3a6a2a' : '#5a8a3a'); }
  for (const [hx, hy] of [[4, 4], [8, 2], [12, 4], [6, 6], [10, 6]]) { R(x + hx, sy + hy, 2, 2, '#a8d070'); R(x + hx, sy + hy + 2, 2, 1, '#2e5224'); }
  R(x + 1, sy + 10, C3_TW, 2, '#d8b040'); R(x + 1, sy + 11, C3_TW, 1, '#9a7a20');
  R(x - 2, sy + 9, 3, 2, '#6a8a3a');
  const hx = x + C3_TW, hy = sy + 3 - (riding ? 1 : 0);
  R(hx, hy + 3, 4, 3, '#7a9a44'); R(hx + 3, hy, 7, 6, '#7a9a44'); R(hx + 9, hy + 3, 2, 2, '#7a9a44'); R(hx + 3, hy + 5, 7, 1, '#5a7a30');
  R(hx + 4, hy - 2, 3, 3, '#ffffff'); R(hx + 7, hy - 3, 3, 3, '#ffffff'); R(hx + 4 + (f % 2), hy - 1, 1, 1, INK); R(hx + 9, hy - 3 + (f > 1 ? 1 : 0), 1, 1, INK);
  if (riding && f % 2) { R(hx + 10, hy + 4, 4, 1, '#e8607a'); R(hx + 13, hy + 5, 2, 1, '#e8607a'); }
  R(hx + 3, hy - 1, 7, 1, '#c0302b'); R(hx + 1, hy - 2, 3, 1, '#c0302b'); R(hx - 1, hy - 1 + (f % 2), 3, 1, '#c0302b');
  if (riding) for (let i = 0; i < 4; i++) { const ly = sy + 2 + i * 3, len = 8 + ((f + i) % 3) * 4; R(x - 6 - len, ly, len, 1, 'rgba(255,255,255,0.5)'); }
  R(x + 2, sy - 1, C3_TW - 2, 1, INK);
}
function c3DrawTurtles() {
  for (const tt of C3D.turtles) if (tt.x != null && !tt.mounted) {
    c3DrawTortoise(tt.x, C3GY, false);
    if (Math.floor(clock * 3) % 2) { const ax = Math.round(tt.x) + 7; R(ax, C3GY - 34, 5, 7, '#ffd23f'); R(ax - 2, C3GY - 28, 9, 2, '#ffd23f'); R(ax, C3GY - 26, 5, 2, '#ffd23f'); R(ax + 1, C3GY - 24, 3, 1, '#ffd23f'); }
  }
  if (C3D.rideOff) { const rx = Math.round(C3D.rideOff.x); G3.save(); G3.translate(rx + 9, C3GY - 6); G3.rotate(Math.PI * Math.min(1, C3D.rideOff.t * 2)); G3.translate(-(rx + 9), -(C3GY - 6)); c3DrawTortoise(rx, C3GY, false); G3.restore(); }
}
function c3Mount() {
  C3D.ride = C3_RIDE_T; C3D.air = false; C3D.vy = 0; C3D.y = C3GY - C3_SHELL; C3D.inv = 0; C3D.bumps = 0;
  C3.stats.rides++; addScore(300, 'obj'); c3Pop(C3PX + 10, C3D.y - 34, '+300');
  shake = Math.max(shake, 0.3); [392, 523, 659, 784, 1047].forEach((fq, i) => setTimeout(() => tone('square', fq, fq, 0.08, 0.06), i * 55));
}
function c3Bowl(o) {
  o.hit = true; o.fly = true; o.vy = -170 - Math.random() * 60; o.vx = 120 + Math.random() * 60; targets++; S.n.obj++;
  addScore(100, 'obj'); c3Pop(o.x, (o.base ?? C3GY) - 24, 'BONK! +100'); sfx.hit(); c3Burst(o.x + 4, (o.base ?? C3GY) - 6, 8, ['#e8c890', '#8a7a40'], 70);
}
function c3SmashWalls(baseY) { // only ledges you hit HEAD-ON break
  const x0 = C3PX + C3_TX, x1 = x0 + C3_TW;
  for (const pl of C3D.plats) if (!pl.gone && pl.x < x1 && pl.x + pl.w > x0 && C3GY - pl.lvl * C3LV < baseY - 3) {
    pl.gone = true; C3.stats.smashed++; targets++; S.n.obj++; C3D.broken.add(pl.form);
    const top = C3GY - pl.lvl * C3LV, pts = 150 * pl.lvl; addScore(pts, 'obj'); c3Pop(C3PX + 30, top - 8, 'SMASH! +' + pts);
    shake = Math.max(shake, 0.45); noise(0.45, 0.55, 900); tone('sine', 120, 40, 0.3, 0.25);
    for (let j = 0; j < 6 + pl.lvl * 4; j++) C3D.rubble.push({ x: pl.x + Math.random() * Math.min(pl.w, 40), y: top + Math.random() * (C3GY - top), vx: 60 + Math.random() * 160, vy: -80 - Math.random() * 160, s: 2 + Math.floor(Math.random() * 4), c: pick(['#c8703c', '#b8603a', '#d07c44', '#f2b878', '#8a3e2a']), rot: 0 });
    for (const o of C3D.obs) if (o.ride === pl && !o.hit) c3Bowl(o);
    for (const f of C3D.flies) if (f.x > pl.x - 4 && f.x < pl.x + pl.w + 4 && !f.got) { f.got = true; C3.stats.flies++; addScore(250, 'obj'); c3Pop(f.x, f.y - 8, 'DRAGONFLY +250'); }
  }
}
function c3Tortoise(dt) {
  for (const rb of C3D.rubble) { rb.vy += 500 * dt; rb.x += (rb.vx - C3D.v) * dt; rb.y += rb.vy * dt; rb.rot += dt * 9; }
  C3D.rubble = C3D.rubble.filter(rb => rb.y < LH + 10 && rb.x > -20);
  for (const tt of C3D.turtles) {
    if (tt.x == null) { if (time >= tt.t) { tt.x = C3VW; tone('sawtooth', 300, 900, 0.3, 0.05); } continue; }
    if (tt.mounted) continue;
    tt.x -= 58 * dt; // trots back toward you at the same pace on every badge
    const top = C3GY - 13, feet = C3D.y;
    if (C3D.air && C3D.vy > 0 && feet >= top - 10 && feet <= top + 10 && tt.x < C3PX + 12 && tt.x + C3_TW + 4 > C3PX) { tt.mounted = true; c3Mount(); }
  }
  C3D.turtles = C3D.turtles.filter(tt => tt.x == null || tt.mounted || tt.x > -40);
  if (C3D.ride > 0) {
    C3D.ride -= dt; C3D.inv = 0.2;
    if (Math.random() < dt * 30) C3D.dust.push({ x: C3PX - 6, y: C3D.y + C3_SHELL - 1, vx: -C3D.v * 0.5, vy: -10 - Math.random() * 20, t: 0 });
    if (C3D.ride <= 0) { // he's tuckered out... but never quits with a ledge right in your face
      const base = C3D.y + C3_SHELL, front = C3PX + C3_TX + C3_TW;
      if (C3D.grind || C3D.air || C3D.plats.some(pl => !pl.gone && pl.x + pl.w > C3PX && pl.x < front + 200 && C3GY - pl.lvl * C3LV < base - 3)) { C3D.ride = 0.02; return; }
      C3D.ride = 0; C3D.y += C3_SHELL; C3D.air = true; C3D.vy = -200; C3D.flip = null; C3D.combo = null; C3D.ramps = C3D.ramps.filter(r => r.x < C3PX); C3D.wires = C3D.wires.filter(w => w.x < C3PX); // skate gear you didn't reach rolls away with him
      for (const pl of C3D.plats) if (!pl.gone && C3D.broken.has(pl.form) && pl.x > C3PX + 16) { // what's left of a pile he smashed crumbles away
        pl.gone = true; const top = C3GY - pl.lvl * C3LV;
        for (let j = 0; j < 4 + pl.lvl * 2; j++) C3D.rubble.push({ x: pl.x + Math.random() * Math.min(pl.w, 40), y: top + Math.random() * (C3GY - top), vx: 20 + Math.random() * 60, vy: -40 - Math.random() * 80, s: 2 + Math.floor(Math.random() * 3), c: pick(['#c8703c', '#b8603a', '#d07c44']), rot: 0 });
        for (const o of C3D.obs) if (o.ride === pl) o.gone = true;
      }
      C3D.rideOff = { x: C3PX + C3_TX, t: 0 };
    }
  }
  if (C3D.rideOff) { C3D.rideOff.t += dt; C3D.rideOff.x -= C3D.v * dt * 0.3; if (C3D.rideOff.t > 2) C3D.rideOff = null; }
}

// =====================================================================
//  SKATE THE TORTOISE: flip tricks, power-line + rail grinds, ramps.
//  While you ride, the PUNCH button becomes FLIP. Land a trick clean for
//  points; land mid-flip and you BAIL (no points, no harm). Grinds need a
//  steady hand: tap LEAN left/right to keep the ball on the middle line.
// =====================================================================
const C3_MID_BTN = { x: W / 2 - 85, y: H - 116, w: 170, h: 104 };
const C3_TRICKS = [
  { name: 'KICKFLIP',    dur: 0.42, pts: 150, fx: p => ({ sy: Math.cos(p * Math.PI * 2) }) },
  { name: 'HEELFLIP',    dur: 0.42, pts: 150, fx: p => ({ sy: Math.cos(p * Math.PI * 2), rot: Math.sin(p * Math.PI * 2) * 0.3 }) },
  { name: 'POP SHUV-IT', dur: 0.38, pts: 120, fx: p => ({ sx: Math.cos(p * Math.PI * 2) }) },
  { name: '360 FLIP',    dur: 0.5,  pts: 300, fx: p => ({ sx: Math.cos(p * Math.PI * 2), sy: Math.cos(p * Math.PI * 4) }) },
  { name: 'IMPOSSIBLE',  dur: 0.48, pts: 250, fx: p => ({ rot: p * Math.PI * 2 }) },
  { name: 'BACKFLIP',    dur: 0.62, pts: 500, whole: true, fx: p => ({ rot: -p * Math.PI * 2 }) },
];
const c3Pop = (x, y, t) => { const p = c3ToScreen(x, y); popText(p.x, p.y, t); };
const c3Burst = (x, y, n, c, s) => { const p = c3ToScreen(x, y); burst(p.x, p.y, n, c, s); };
const c3Riding = () => C3D.ride > 0;
function c3ComboAdd(name, pts) { C3D.combo = C3D.combo || { names: [], pts: 0 }; C3D.combo.names.push(name); C3D.combo.pts += pts; }
// special tricks (cowboy x skater x tortoise)
const C3_SPECIAL = {
  leafy:  { name: 'LEAFY FASTPLANT', dur: 0.42, pts: 350, special: true, whole: true, fx: p => ({ rot: -Math.sin(p * Math.PI) * 0.7 }) },
  rodeo:  { name: 'RODEO FLIP', dur: 0.55, pts: 450, special: true, fx: p => ({ sy: Math.cos(p * Math.PI * 2), rot: Math.sin(p * Math.PI * 2) * 0.6 }) },
  double: { name: 'DOUBLE SHELL FLIP', dur: 0.78, pts: 600, special: true, flipN: 2, fx: p => ({ sy: Math.cos(p * Math.PI * 4) }) },
  triple: { name: 'TRIPLE SHELL FLIP', dur: 1.05, pts: 1100, special: true, flipN: 3, fx: p => ({ sy: Math.cos(p * Math.PI * 6) }) },
};
const C3_CHAIN = [ // JUMP again in the air: once, twice, three times
  { name: 'BRONCO BONELESS', dur: 0.45, pts: 300, special: true, chain: 1, whole: true, fx: p => ({ rot: Math.sin(p * Math.PI) * 0.9 }) },
  { name: 'SHELL SHOCK 540', dur: 0.78, pts: 700, special: true, chain: 2, fx: p => ({ sx: Math.cos(p * Math.PI * 3), rot: p * Math.PI * 3 }) },
  { name: 'YEEHAW MCTORTOISE', dur: 1.05, pts: 1300, special: true, chain: 3, whole: true, fx: p => ({ rot: -p * Math.PI * 2 }) },
];
function c3StartTrick(trick, keepT) {
  const t = keepT && C3D.flip ? C3D.flip.t : 0;
  C3D.flip = { trick, t }; C3D.lastTrick = trick.name;
  noise(0.12, 0.18, 4200); tone('square', trick.special ? 660 : 520, trick.special ? 1040 : 780, 0.08, 0.04);
  if (trick.special) c3Pop(C3PX + 10, C3D.y - 40, trick.name + '!');
}
function c3PickBasic() { const big = C3D.big, pool = C3_TRICKS.filter(t => (big || !t.whole) && t.name !== C3D.lastTrick); return pick(pool); }
function c3Flip() {
  if (!c3Riding()) return c3Punch();
  C3D.btn.p = 0.15;
  if (C3D.grind) return;
  const f = C3D.flip, spinning = f && f.t < f.trick.dur;
  if (spinning) { // tap FLIP again fast = double, three times = triple (need the air for it, or you bail)
    if (!f.trick.chain && (f.trick.flipN || 1) < 3 && f.t < 0.32) c3StartTrick((f.trick.flipN || 1) === 1 ? C3_SPECIAL.double : C3_SPECIAL.triple, true);
    C3D.flipAt = clock; return;
  }
  if (!C3D.air) { c3Jump(); if (!C3D.air) return; C3D.flipAt = clock; return c3StartTrick(c3PickBasic()); } // FLIP on the ground = ollie + trick
  const sinceJump = clock - (C3D.jumpAt ?? -9); C3D.flipAt = clock;
  if (sinceJump < 0.1) return c3StartTrick(C3_SPECIAL.leafy);   // JUMP + FLIP together
  if (sinceJump < 0.3) return c3StartTrick(C3_SPECIAL.rodeo);   // FLIP right after the JUMP
  c3StartTrick(c3PickBasic());
}
function c3AirJump() {
  const f = C3D.flip;
  if (f && f.t < f.trick.dur) {
    if (!f.trick.chain && clock - (C3D.flipAt ?? -9) < 0.1 && !f.trick.flipN) return c3StartTrick(C3_SPECIAL.leafy, true); // FLIP + JUMP together
    if (f.trick.chain && f.trick.chain < 3 && f.t < 0.4) return c3StartTrick(C3_CHAIN[f.trick.chain], true);           // jump, jump, jump...
    return;
  }
  c3StartTrick(C3_CHAIN[0]);
}
function c3Bail(msg) {
  C3D.combo = null; C3D.flip = null; C3D.trip = 0.35; shake = Math.max(shake, 0.4); sfx.thud();
  c3Pop(C3PX + 8, C3D.y - 34, msg || 'BAIL!');
}
function c3Landed() { // touched down (ground, ledge or shell-on-rock) while riding
  const f = C3D.flip;
  if (f && f.t < f.trick.dur) { // still spinning when you hit the ground
    if (f.t / f.trick.dur > 0.85) { c3ComboAdd(f.trick.name, f.trick.pts); C3D.grade = 'SKETCHY'; }
    else { c3Bail(); return; }
  } else if (f) C3D.grade = (f.t - f.trick.dur) < 0.12 ? 'PERFECT' : 'CLEAN'; // landed just as the board came round = PERFECT
  C3D.flip = null;
  const c = C3D.combo; C3D.combo = null; if (!c || !c.names.length) return;
  const grade = C3D.grade || 'CLEAN', mult = (grade === 'PERFECT' ? 1.5 : grade === 'SKETCHY' ? 0.5 : 1) * c.names.length;
  const total = Math.round(c.pts * mult / 10) * 10;
  C3.stats.tricks += c.names.length; S.n.obj++; addScore(total, 'obj');
  if (!C3.bestTrick || total > C3.bestTrick.pts) C3.bestTrick = { name: c.names.join(' + '), pts: total, grade };
  c3Pop(C3PX + 10, C3D.y - 46, c.names.slice(-2).join(' + ') + (c.names.length > 1 ? ' x' + c.names.length : ''));
  c3Pop(C3PX + 10, C3D.y - 36, grade + '! +' + total);
  if (grade === 'PERFECT') [784, 988, 1175].forEach((fq, i) => setTimeout(() => tone('square', fq, fq, 0.07, 0.05), i * 50));
  C3D.grade = null;
}
// ---- course pieces
function c3CourseEnd(v) { return Math.max(C3VW, ...C3D.plats.map(pl => pl.x + pl.w + Math.round(v * 1.0)), ...C3D.ramps.map(r => r.x + r.w + 40), ...C3D.wires.map(w => w.x + w.w + 40)); }
function c3Skate() { return [{ t: 15.5, k: 'rail' }, { t: 17.5, k: 'big' }, { t: 33, k: 'big' }, { t: 35, k: 'rail' }]; }
function c3SpawnRampRail(kind) {
  if (!c3Riding()) return; // ramps and rails only show up while you're on the shell
  const v = C3D.v, x = c3CourseEnd(v);
  if (kind === 'big') { // a big kicker: huge air, dragonflies strung across the top of the arc
    C3D.ramps.push({ x, w: 40, h: 24, big: true, used: false });
    for (let i = 0; i < 4; i++) c3AddFly(x + 40 + Math.round(v * (0.25 + i * 0.22)), C3GY - 96 - Math.round(Math.sin((i + 0.5) / 4 * Math.PI) * 24));
    return;
  }
  C3D.ramps.push({ x, w: 30, h: 14, used: false });
  C3D.wires.push({ kind: 'rail', x: x + 30 + Math.round(v * 0.3), w: Math.round(v * 1.6), y: C3GY - 64 });
}
// ---- balance on a wire or rail
function c3StartGrind(wire) {
  const cfg = c3RunCfg();
  C3D.grind = { wire, bal: (Math.random() - 0.5) * 0.3, bv: (Math.random() - 0.5) * 0.8, t: 0, k: cfg.bal, sparkT: 0 };
  C3D.air = false; C3D.vy = 0; C3D.y = wire.y - c3Off();
  if (C3D.flip && C3D.flip.t < C3D.flip.trick.dur) { C3D.flip = null; } // trick cut short by the wire: no points for it, but no bail
  else if (C3D.flip) { c3ComboAdd(C3D.flip.trick.name, C3D.flip.trick.pts); C3D.flip = null; }
  noise(0.2, 0.3, 6000); tone('sawtooth', 900, 1200, 0.15, 0.04);
  c3Pop(C3PX + 10, C3D.y - 36, wire.kind === 'rail' ? 'RAIL!' : 'POWER LINE!');
}
function c3EndGrind() {
  const gr = C3D.grind; if (!gr) return;
  const pts = Math.round(gr.t * 250 / 10) * 10; C3.stats.grind += gr.t;
  if (pts > 0) c3ComboAdd(gr.wire.kind === 'rail' ? 'RAIL GRIND' : 'WIRE GRIND', pts);
  C3D.grind = null;
}
function c3Lean(d) { if (!C3D.grind) return; C3D.grind.bv += d * 0.95; C3D.btn[d < 0 ? 'l' : 'r'] = 0.15; tone('triangle', d < 0 ? 330 : 440, d < 0 ? 300 : 400, 0.05, 0.03); }
function c3GrindStep(dt) { // returns true: we handled your height this frame
  const gr = C3D.grind, w = gr.wire;
  gr.bv += (gr.bal * gr.k + (Math.random() - 0.5) * 1.4) * dt; gr.bal += gr.bv * dt; gr.t += dt;
  C3D.y = w.y - c3Off(); C3D.air = false; C3D.vy = 0;
  gr.sparkT -= dt; if (gr.sparkT <= 0) { gr.sparkT = 0.05; for (let i = 0; i < 2; i++) C3D.sparks.push({ x: C3PX + C3_TX + 4 + Math.random() * 10, y: w.y, vx: -60 - Math.random() * 80, vy: -40 - Math.random() * 60, t: 0 }); if (Math.random() < 0.3) noise(0.05, 0.06, 7000); }
  if (Math.abs(gr.bal) >= 1) { // fell off
    C3D.grind = null; C3D.air = true; C3D.vy = -30; c3Bail('WIPEOUT!'); return true;
  }
  const cx = C3PX + C3_TX + C3_TW / 2;
  if (cx > w.x + w.w) { c3EndGrind(); C3D.air = true; C3D.vy = -140; c3Pop(C3PX + 10, C3D.y - 30, 'END OF THE LINE!'); return true; }
  return true;
}
function c3CatchWire(prevB, curB) {
  if (!c3Riding() || C3D.vy < 0) return false;
  const cx = C3PX + C3_TX + C3_TW / 2;
  for (const w of C3D.wires) if (cx > w.x + 2 && cx < w.x + w.w - 6 && prevB <= w.y + 1 && curB >= w.y) { c3StartGrind(w); return true; }
  return false;
}
function c3RampStep() { // riding up a ramp, then launch
  const cx = C3PX + C3_TX + C3_TW / 2;
  for (const r of C3D.ramps) if (!r.used && cx >= r.x && cx <= r.x + r.w + 12) { // (+12: at full tilt you can cover the lip in one frame)
    const k = Math.min(1, (cx - r.x) / r.w); C3D.y = C3GY - r.h * k - c3Off();
    if (k > 0.9) { r.used = true; C3D.air = true; C3D.vy = r.big ? -430 : -335; C3D.big = true; C3D.jumpAt = -9; noise(0.3, 0.25, 2500); tone('sawtooth', 200, 600, 0.3, 0.05); c3Pop(C3PX + 10, C3D.y - 34, r.big ? 'HUGE AIR!' : 'BIG AIR!'); }
    return true;
  }
  return false;
}
// ---- drawing
function c3DrawRamp(r) {
  const x0 = Math.round(r.x);
  for (let i = 0; i < r.w; i++) { const h = Math.round(r.h * i / r.w); R(x0 + i, C3GY - h, 1, h, i % 6 === 0 ? '#5a3418' : '#9a6236'); R(x0 + i, C3GY - h, 1, 1, '#d8a060'); }
  R(x0 + r.w - 2, C3GY - r.h, 2, r.h, '#4a2a14'); line(x0 + 6, C3GY - 1, x0 + r.w - 2, C3GY - r.h + 2, '#6e4224');
  if (r.big) { R(x0 + r.w - 4, C3GY - r.h - 6, 2, 6, '#3b2210'); R(x0 + r.w - 2, C3GY - r.h - 6, 6, 3, Math.floor(clock * 6) % 2 ? '#c0302b' : '#e0503a'); } // a flag on the big one
  if (!r.used && Math.floor(clock * 4) % 2) { R(x0 + 8, C3GY - r.h - 12, 2, 6, '#ffd23f'); R(x0 + 6, C3GY - r.h - 8, 6, 2, '#ffd23f'); R(x0 + 7, C3GY - r.h - 13, 4, 2, '#ffd23f'); } // up arrow
}
function c3DrawWirePoles(w) { // poles / posts go behind the rocks
  if (w.kind === 'rail') { for (let x = Math.round(w.x) + 4; x < w.x + w.w - 2; x += 34) { R(x, w.y + 2, 2, C3GY - w.y - 2, '#6a6a76'); R(x, w.y + 2, 1, C3GY - w.y - 2, '#9a9aa6'); } return; }
  const ps = [w.x - 4]; for (let x = w.x + 150; x < w.x + w.w - 30; x += 150) ps.push(x); ps.push(w.x + w.w + 2);
  for (const px of ps) { const x = Math.round(px); R(x, w.y - 10, 3, C3GY - w.y + 10, '#5a3a20'); R(x, w.y - 10, 1, C3GY - w.y + 10, '#7a5a34'); R(x - 6, w.y - 8, 15, 2, '#4a2a14'); R(x - 6, w.y - 10, 2, 2, '#c8c8d0'); R(x + 7, w.y - 10, 2, 2, '#c8c8d0'); R(x, w.y - 2, 3, 2, '#c8c8d0'); }
}
function c3DrawWire(w) {
  const x0 = Math.round(w.x), x1 = Math.round(w.x + w.w);
  if (w.kind === 'rail') { R(x0, w.y, x1 - x0, 2, '#b8b8c4'); R(x0, w.y, x1 - x0, 1, '#ffffff'); R(x0, w.y + 2, x1 - x0, 1, '#4a4a56'); return; }
  for (let x = x0; x < x1; x++) { const sag = Math.round(2 * Math.sin(Math.PI * (((x - x0) % 150) / 150))); R(x, w.y - 8 + sag, 1, 1, '#1e1a1e'); } // the top wire sags between poles
  R(x0, w.y, x1 - x0, 1, '#1e1a1e'); R(x0, w.y - 1, x1 - x0, 1, 'rgba(255,220,160,0.35)'); // the one you grind is pulled taut
}

// =====================================================================
//  END OF CHAPTER 3 (so far)
// =====================================================================
SCENES.ch3End = {
  tune: 'c3cave',
  enter() { saveBest(); sfx.clear(); },
  world() { C3D.dist = (C3D.dist || 0) + 0.3; c3DesertArt(); },
  ui() {
    dim(0.72); panel(150, 30, 660, 480);
    text('TO BE CONTINUED...', W / 2, 52, 32, '#ffd23f', 'center');
    const k = Math.floor(this.t / 0.45), st = C3.stats;
    const rows = [['SPARK HITS', st.sparkHits], ['BATS SPAT ON', st.bats], ['SNAKES PUNCHED', st.snakes], ['BUZZARDS WHAPPED', st.buzzards], ['DRAGONFLIES', st.flies], ['ROCKS SMASHED', st.smashed], ['TORTOISE RIDES', st.rides], ['TRICKS LANDED', st.tricks], ['GRIND TIME', st.grind.toFixed(1) + 'S']];
    rows.forEach((r, i) => { if (k > i) { text(r[0], 200, 92 + i * 24, 16, '#ffffff'); text(String(r[1]), 760, 92 + i * 24, 16, '#f3d18b', 'right'); } });
    if (k > rows.length) { rect(200, 324, 560, 3, '#c98a4b'); text('SCORE', 200, 338, 24, '#ffffff'); text(String(score), 760, 338, 24, '#ffd23f', 'right'); }
    if (k > rows.length + 1) {
      text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, 396, 16, '#ffd23f', 'center');
      text('JENNY IS OUT THERE SOMEWHERE...', W / 2, 432, 16, '#ff8a8a', 'center');
      if (Math.floor(clock * 2.5) % 2) text('TAP FOR TITLE', W / 2, 472, 16, '#f3d18b', 'center');
    }
  },
  tap() { if (this.t < 0.45 * 11) this.t = 0.45 * 12; else toTitle(); },
  key() { this.tap(); },
};

// ---------------- DEATH SCREENS ----------------
Object.assign(EPITAPHS, {
  fuse: [['RUSTY!!'], ['HE RAN OUT', 'OF SPIT.'], ['BLOWN TO', 'KINGDOM COME.'], ['JENNY SENDS', 'HER REGARDS.']],
  trip: [['RUSTY!!'], ['TRIPPED OVER', 'A SAGEBRUSH.'], ['HE FORGOT', 'TO JUMP.']],
  snake: [['RUSTY!!'], ['THE SNAKE', 'PUNCHED FIRST.'], ['HE TRIED TO JUMP', 'A RATTLESNAKE.']],
  buzzard: [['RUSTY!!'], ['THE BUZZARDS', "DIDN'T WAIT."], ['LUNCH.']],
  rock: [['RUSTY!!'], ['HE RAN INTO', 'A MESA.'], ['THE ROCK', 'DID NOT MOVE.'], ['FACE, MEET', 'SANDSTONE.']],
});
Object.assign(HURT, {
  fuse: RUNS.fuse.hurtText.fuse, trip: RUNS.desert.hurtText.trip, snake: RUNS.desert.hurtText.snake, buzzard: RUNS.desert.hurtText.buzzard, rock: RUNS.desert.hurtText.rock,
});

// ---------------- STORY ORDER (chapter 3) ----------------
const STORY3 = [{ cut: 'ch3Wake' }, { run: 'fuse' }, { cut: 'ch3Canyon' }, { run: 'desert' }, { scene: 'ch3RunEnd' }, { scene: 'ch3End' }];

// =====================================================================
//  HOOKS
// =====================================================================
const C3_TEST_BTN = { x: W - 246, y: 12, w: 234, h: 54 }; // TEST ONLY
window.addEventListener('pointerdown', e => {
  if (e.target !== cv || paused) return;
  const m = toGame(e);
  if (state === 'title' && inBox(m.x, m.y, C3_TEST_BTN)) { e.stopPropagation(); e.preventDefault(); audio(); mouse = m; startScene('ch3Title'); return; }
  if (run && run.c3 && ['intro', 'play', 'clear'].includes(state)) {
    if (canPause() && inBox(m.x, m.y, PAUSE_BTN)) return;
    e.stopPropagation(); e.preventDefault(); audio();
    mouse = m; touchMode = e.pointerType !== 'mouse'; lastTap = performance.now();
    run.press(m.x, m.y);
  }
}, true);
const c3BaseDraw = draw;
draw = function () {
  c3BaseDraw();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(SW, 0);
  if (state === 'title' && !paused) smallBtn(C3_TEST_BTN, 'CHAPTER 3 >');
  if (run && run.c3 && ['intro', 'play', 'clear', 'duelWait'].includes(state)) {
    const a = AMMO_BOX; rect(a.x - 14, a.y - 48, a.w + 28, a.h + 60, INK);
    panel(a.x - 6, a.y - 6, a.w + 12, a.h + 12);
    if (run === RUNS.fuse) {
      text('SPIT', a.x + a.w / 2, a.y + 16, 16, '#cfe8f4', 'center');
      const k = 1 - (C3F.cd || 0) / (C3F.cdMax || 1), ready = k >= 1;
      rect(a.x + 14, a.y + 56, a.w - 28, 22, INK); rect(a.x + 17, a.y + 59, Math.round((a.w - 34) * k), 16, ready ? '#7fb2ff' : '#4a6a8a');
      text(ready ? 'READY' : C3F.dry > 0 ? 'DRY!' : '...', a.x + a.w / 2, a.y + 96, 16, ready ? '#ffffff' : '#ff9a3a', 'center');
    } else {
      if (C3D.ride > 0) { const n = (C3D.combo ? C3D.combo.names.length : 0) + (C3D.flip ? 1 : 0) + (C3D.grind ? 1 : 0);
        text('SKATE!', a.x + a.w / 2, a.y + 16, 16, '#8aba5a', 'center'); text('COMBO', a.x + a.w / 2, a.y + 60, 16, '#ffffff', 'center'); text('X' + n, a.x + a.w / 2, a.y + 88, 16, n > 1 ? '#ffd23f' : '#f3d18b', 'center'); }
      else { text('NO GUN', a.x + a.w / 2, a.y + 16, 16, '#ff8a8a', 'center');
      text('JUST', a.x + a.w / 2, a.y + 60, 16, '#ffffff', 'center'); text('FISTS', a.x + a.w / 2, a.y + 88, 16, '#ffd23f', 'center'); }
    }
  }
  ctx.restore();
};


// =====================================================================
//  RUN COMPLETE: run total, best trick, and DO ANOTHER RUN / CONTINUE
// =====================================================================
const C3_AGAIN_BTN = { x: 186, y: 452, w: 280, h: 58 }, C3_ON_BTN = { x: 494, y: 452, w: 280, h: 58 };
SCENES.ch3RunEnd = {
  tune: 'c3ride',
  enter() { this.total = score - levelStartScore; this.k = 0; C3.bestRun = Math.max(C3.bestRun || 0, this.total); this.best = C3.bestTrick; this.st = { ...C3.stats }; C3.runSnap0 = C3.runSnap; C3.runSnap = null; sfx.clear(); },
  update() { const k = Math.floor(this.t / 0.35); if (k !== this.k) { this.k = k; if (k <= 8) sfx.blip(); } },
  world() { C3D.dist = (C3D.dist || 0) + 0.6; C3D.zoom = 1; C3D.camY = 0; c3DesertArt(); },
  ui() {
    dim(0.66); panel(150, 18, 660, 504);
    text('RUN COMPLETE!', W / 2, 38, 32, '#ffd23f', 'center');
    const k = Math.floor(this.t / 0.35), st = this.st, b = this.best, s0 = C3.runSnap0 || {};
    if (k > 0) { text('RUN TOTAL', 196, 98, 24, '#ffffff'); text('+' + this.total, 764, 98, 24, '#ffd23f', 'right'); }
    if (k > 1) {
      text('BEST TRICK', 196, 146, 16, '#f3d18b');
      if (b) { fitText(b.name, W / 2, 174, 16, '#ffffff', 'center', 580); text(b.grade + '  +' + b.pts, W / 2, 202, 16, b.grade === 'PERFECT' ? '#a8f0a0' : '#ffd23f', 'center'); }
      else text('NO TRICKS LANDED', W / 2, 174, 16, '#a88a6a', 'center');
    }
    const rows = [['TRICKS LANDED', (st.tricks || 0) - (s0.tricks || 0)], ['GRIND TIME', ((st.grind || 0) - (s0.grind || 0)).toFixed(1) + 'S'], ['ROCKS SMASHED', (st.smashed || 0) - (s0.smashed || 0)],
      ['DRAGONFLIES', (st.flies || 0) - (s0.flies || 0)], ['BEST RUN', C3.bestRun]];
    rows.forEach((r2, i) => { if (k > i + 2) { text(r2[0], 196, 244 + i * 34, 16, '#ffffff'); text(String(r2[1]), 764, 244 + i * 34, 16, '#f3d18b', 'right'); } });
    if (k > rows.length + 2) { smallBtn(C3_AGAIN_BTN, 'ANOTHER RUN'); smallBtn(C3_ON_BTN, 'CONTINUE >'); }
  },
  tap(x, y) {
    if (this.t < 0.35 * 8) { this.t = 0.35 * 9; return; }
    if (inBox(x, y, C3_AGAIN_BTN)) { // back to the start of the run: score + stats as they were before it
      sfx.blip(); score = levelStartScore; S = cloneS(S0); C3.stats = { ...(C3.runSnap0 || C3.stats) };
      goStep(STORY3.findIndex(s2 => s2.run === 'desert')); return;
    }
    if (inBox(x, y, C3_ON_BTN)) { sfx.blip(); nextStep(); }
  },
  key(k2) { if (this.t >= 0.35 * 8) nextStep(); else this.t = 0.35 * 9; },
};

// =====================================================================
//  SKATE MUSIC: a grungy 90s ska-punk number (skank upstrokes, walking
//  bass, a fuzzed-out lead and a drummer who's had too much coffee)
// =====================================================================
const C3_SKA_MEL = c3Notes('B4 - G#4 B4 - E5 - D#5 | C#5 - - B4 A4 - - - | B4 - D#5 F#5 - E5 - D#5 | C#5 - B4 - A4 - G#4 - | B4 - G#4 B4 - E5 - G#5 | F#5 - E5 - C#5 - - - | A4 - C#5 E5 - D#5 - C#5 | B4 - - - F#4 - G#4 A4');
const C3_SKA_CH = [['E3', 0], ['A3', 0], ['B3', 0], ['A3', 0], ['E3', 0], ['C#3', 1], ['A3', 0], ['B3', 0]]; // [root, minor?]
let c3Fuzz = null;
function c3SkaVoice(type, f, t, dur, vol, lp, fuzz) {
  const o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f;
  gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + 0.008); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (fuzz) { if (!c3Fuzz) { c3Fuzz = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c3Fuzz[i] = Math.tanh(x * 6); } }
    const ws = ac.createWaveShaper(); ws.curve = c3Fuzz; node.connect(ws); node = ws; }
  if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; node.connect(fl); node = fl; }
  node.connect(gn).connect(MUS.gain); o.start(t); o.stop(t + dur + 0.02);
}
function c3SkaHit(t, dur, vol, freq, q) { // noise drum hit
  const len = Math.max(0.02, dur), b = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), gn = ac.createGain();
  fl.type = 'bandpass'; fl.frequency.value = freq; fl.Q.value = q || 0.8; gn.gain.value = vol; src.buffer = b;
  src.connect(fl).connect(gn).connect(MUS.gain); src.start(t);
}
function c3Kick(t) { const o = ac.createOscillator(), gn = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  gn.gain.setValueAtTime(0.9, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.16); o.connect(gn).connect(MUS.gain); o.start(t); o.stop(t + 0.18); }
TUNES.c3ride = {
  notes: C3_SKA_MEL, bass: ['E2'], bar: 8, eighth: 60 / 184 / 2, vol: 0.075, style: 'ska',
  play(t, k, e) {
    const beat = k % 8, [root, minor] = C3_SKA_CH[Math.floor(k / 8) % 8], f0 = NF(root);
    // drums: four-on-the-floor kick, snare on 2 + 4, hats on every eighth, a fill at the end of each 4 bars
    if (beat === 0 || beat === 4 || beat === 3) c3Kick(t);
    if (beat === 2 || beat === 6) { c3SkaHit(t, 0.14, 0.7, 1800, 0.7); c3SkaVoice('triangle', 190, t, 0.06, 0.25); }
    c3SkaHit(t, beat % 2 ? 0.05 : 0.03, beat % 2 ? 0.35 : 0.22, 8000, 1.2);
    if (Math.floor(k / 8) % 4 === 3 && beat >= 6) c3SkaHit(t + e / 2, 0.08, 0.5, 1400, 0.9);
    // skank: choppy chord stabs on the off-beats
    if (beat % 2) for (const st of [0, minor ? 3 : 4, 7, 12]) c3SkaVoice('square', f0 * 2 * Math.pow(2, st / 12), t, 0.07, 0.07, 3200);
    // walking bass: root, octave, fifth, back down
    const walk = [0, 12, 7, 12, 0, 12, 7, 10][beat]; c3SkaVoice('sawtooth', f0 / 2 * Math.pow(2, walk / 12), t, e * 0.9, 0.32, 600);
    // the grungy lead (fuzzed sawtooth, doubled a hair sharp for width)
    const n = C3_SKA_MEL[k % C3_SKA_MEL.length];
    if (n !== '-') { let len = 1; while (C3_SKA_MEL[(k + len) % C3_SKA_MEL.length] === '-' && len < 4) len++;
      c3SkaVoice('sawtooth', NF(n), t, len * e * 0.95, 0.16, 2400, true); c3SkaVoice('sawtooth', NF(n) * 1.006, t, len * e * 0.95, 0.1, 2000, true); }
  },
};
