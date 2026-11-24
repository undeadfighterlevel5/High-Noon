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
const C3 = { exitAt: null, lineAt: 0, lastLine: -1, wagonAt: 0, stats: { sparkHits: 0, bats: 0, snakes: 0, canteens: 0, jumps: 0 } };

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

// =====================================================================
//  PAINT KIT (chapter-3 copies, so chapter 2 can change freely)
// =====================================================================
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
function c3Strip(c, off, y) { const w = c.width, x0 = -((((Math.round(off)) % w) + w) % w); g.drawImage(c, x0, y); if (x0 + w < LW) g.drawImage(c, x0 + w, y); }
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
  g.drawImage(C3DARK, 0, 0);
  g.globalCompositeOperation = 'lighter';
  for (const L of lights) if (L.warm !== false) { const gr = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r * 0.8), c = L.tint || warm, k = L.k ?? 1;
    gr.addColorStop(0, `rgba(${c},${0.16 * k})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); }
  g.globalCompositeOperation = 'source-over';
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
  g.drawImage(c3RockTex('titleWall', LW, LH, C3ROCK), 0, 0);
  g.drawImage(c3Bake('titleStatic', LW, LH, (px, x) => {
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
    for (const k in BTN) if (inBox(x, y, BTN[k])) { sfx.blip(); C3.stats = { sparkHits: 0, bats: 0, snakes: 0, canteens: 0, jumps: 0 }; startGame(k, STORY3); return; }
  },
};

// =====================================================================
//  CUTSCENE: THE CAVERN (side view) — Eliza is really Jenny
// =====================================================================
const C3_REVEAL = 5, C3_GUN = 7, C3_LIT = 8, C3_EXIT = 9;
function c3CaveSide() {
  g.drawImage(c3RockTex('sideWall', LW, LH, { dark: '#24191c', mid: '#34262a', lit: '#4a3638', crack: '#120a0e', wet: '#6a5a6a' }), 0, 0);
  g.drawImage(c3Bake('sideStatic', LW, LH, px => {
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
  yellow:     { speed: 1 / 24, size: 1.5, cool: 0.7 },
  deputy:     { speed: 1 / 18, size: 1.2, cool: 1.0 },
  gunslinger: { speed: 1 / 13, size: 1.0, cool: 1.25 },
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
  g.drawImage(c3RockTex('povWall', LW, LH, C3ROCK), 0, 0);
  g.drawImage(c3Bake('povStatic', LW, LH, px => {
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
    if (C3F.boomT > 0) { const t = C3F.boomT; g.globalAlpha = Math.min(1, 1 - t); R(0, 0, LW, LH, '#fff4c8'); g.globalAlpha = 1; disc(160, 160, Math.round(30 + t * 200), '#ff9a3a'); disc(160, 160, Math.round(20 + t * 150), '#ffe890'); }
    if (near > 0.75 && !C3F.out) { const a = (near - 0.75) * 1.2 * (0.6 + 0.4 * Math.sin(clock * 12)); g.globalAlpha = a; R(0, 0, LW, 4, '#c0302b'); R(0, LH - 4, LW, 4, '#c0302b'); R(0, 0, 4, LH, '#c0302b'); R(LW - 4, 0, 4, LH, '#c0302b'); g.globalAlpha = 1; }
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
  g.drawImage(c3Bake('canyonSky', LW, 90, px => c3Grad(px, 0, 0, LW, 90, ['#2a2252', '#4a2e66', '#8a3e66', '#d0605a', '#f29a5a', '#fcd088'])), 0, 0);
  for (const [x, y, w] of [[30, 20, 60], [120, 34, 80], [220, 14, 50], [250, 44, 60]]) { R(x, y, w, 2, '#f0907a'); R(x + 6, y - 1, w - 16, 1, '#ffc090'); R(x + 4, y + 2, w - 8, 1, '#a04a60'); }
  disc(238, 70, 13, '#ffe0a0'); disc(238, 70, 9, '#fff2c4');
  c3Strip(c3Mesas('cnFar', 320, 30, [[30, 50, 70, 18], [110, 30, 46, 22], [200, 60, 90, 14], [290, 40, 60, 20]], { cap: '#c88a8a', mid: '#9a6278', band: '#a86e80', dark: '#7a4a66', darkBand: '#6e425c', talus: '#8a5a70' }), 0, 54);
  c3Strip(c3Mesas('cnMid', 320, 40, [[20, 30, 60, 30], [150, 70, 110, 24], [260, 40, 70, 34]], { cap: '#e08a5e', mid: '#a8503c', band: '#bc6448', dark: '#7a3428', darkBand: '#6a2c22', talus: '#9a5a40' }), 0, 62);
  // canyon floor with a river winding toward the sun, and the road beside it
  g.drawImage(c3Bake('cnFloor', LW, 20, px => { c3Grad(px, 0, 0, LW, 20, ['#a8603c', '#b8704a', '#9a5434']);
    for (let x = 0; x < LW; x++) { const y = Math.round(10 + Math.sin(x * 0.04) * 4 + (LW - x) * 0.02); px(x, y, 1, 2, x > 200 ? '#ffd8a0' : '#6a7ab4'); px(x, y - 4, 1, 1, '#c88a5a'); } }), 0, 96);
  // near canyon walls framing the view
  g.drawImage(c3Bake('cnNear', LW, 70, px => {
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
const C3GY = 128, C3PX = 62, C3_RUN_T = 45;
const C3_RUN = { // per badge
  yellow:     { v0: 96,  v1: 140, gap: 1.2,  crashes: 3 },
  deputy:     { v0: 114, v1: 170, gap: 0.98, crashes: 2 },
  gunslinger: { v0: 132, v1: 196, gap: 0.8,  crashes: 1 },
};
const C3D = {};
const C3_OBS = {
  bush:   { w: 13, h: 8 }, rock: { w: 13, h: 9 }, cactus: { w: 7, h: 18 }, cactus2: { w: 16, h: 15 },
  snake:  { w: 15, h: 6 }, tumble: { w: 10, h: 10 }, tallsnake: { w: 15, h: 6 }, buzzard: { w: 14, h: 8 },
};
const C3_JUMP_BTN = { x: 12, y: H - 116, w: 170, h: 104 }, C3_PUNCH_BTN = { x: W - 182, y: H - 116, w: 170, h: 104 };
function c3RunCfg() { return C3_RUN[diff.key] || C3_RUN.deputy; }
function c3Jump() {
  if (C3D.air || C3D.trip > 0) return;
  C3D.air = true; C3D.vy = -218; C3D.btn.j = 0.15; C3.stats.jumps++;
  tone('square', 260, 520, 0.12, 0.05); C3D.dust.push(...[0, 1, 2].map(i => ({ x: C3PX + 4 + i * 3, y: C3GY, vx: -30 - i * 20, vy: -10, t: 0 })));
}
function c3Punch() {
  if (C3D.pcd > 0 || C3D.trip > 0) return;
  C3D.punch = 0.2; C3D.pcd = 0.34; C3D.btn.p = 0.15; noise(0.06, 0.2, 1800);
}
function c3Spawn(t) {
  const r = Math.random(), late = t > 12, pool = [['bush', 0.22], ['rock', 0.2], ['cactus', 0.22], ['snake', 0.22], ['cactus2', late ? 0.08 : 0], ['tumble', t > 8 ? 0.08 : 0], ['tallsnake', t > 5 ? 0.13 : 0], ['buzzard', t > 3 ? 0.13 : 0]];
  const tot = pool.reduce((a, p) => a + p[1], 0); let acc = 0, kind = 'bush';
  for (const [k, w] of pool) { acc += w / tot; if (r <= acc) { kind = k; break; } }
  const o = { kind, x: LW + 10, ...C3_OBS[kind], rear: 0, y: 0, vy: 0, hit: false, passed: false, gone: false, seed: Math.random() * 6 };
  if (kind === 'tumble') { o.y = -10; o.vy = 0; }
  if (kind === 'tallsnake') { o.kind = 'snake'; o.tall = true; }          // rears up taller than you can jump
  if (kind === 'buzzard') { o.by = C3GY - 58; }                            // dives at your head wherever you are
  C3D.obs.push(o);
}
function c3ObBox(o) { if (o.kind === 'buzzard') return { x: o.x, y: o.by - 4, w: 14, h: 9 }; const h = o.kind === 'snake' ? Math.round(6 + o.rear * (o.tall ? 34 : 12)) : o.h; return { x: o.x, y: (o.base ?? C3GY) - h + (o.kind === 'tumble' ? o.y : 0), w: o.w, h }; }
function c3PlayerBox() { return { x: C3PX + 3, y: C3D.y - 22, w: 8, h: 21 }; }
const c3Overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function c3Stumble(o) {
  o.hit = true; C3D.inv = 1.3; C3D.trip = 0.35; C3D.bumps++; shake = Math.max(shake, 0.5); sfx.thud();
  if (o.kind === 'snake' || o.kind === 'tumble' || o.kind === 'buzzard') { o.fly = true; o.vy = -90; o.vx = 60; }
  const left = c3RunCfg().crashes - C3D.bumps;
  if (left > 0) { woundT = 0.7; popText(C3PX + 8, C3D.y - 34, o.kind === 'buzzard' ? 'PECKED! ' + left + ' LEFT' : o.kind === 'snake' ? 'SNAKEBIT! ' + left + ' LEFT' : 'OOF! ' + left + ' LEFT'); return; }
  C3D.bumps = 0; hurt(o.kind === 'buzzard' ? 'buzzard' : o.kind === 'snake' ? 'snake' : 'trip', null);
}
// ---- the runner: you, side view, with a 4-frame run cycle, a jump pose and a punch
function c3Runner(x, footY, fr, air, punch, trip) {
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
    if (!punch) hp(3, 11 + (fr % 2), 2, 5, '#6a2020');                        // back arm swinging
    hp(4, 10, 6, 8, SH); hp(4, 10, 3, 8, VE); hp(4, 17, 6, 1, '#2a1a10'); hp(8, 17, 1, 1, '#c9a040'); // torso, vest, belt
    hp(6, 9, 3, 1, SK);                                                            // neck
    hp(5, 3, 6, 6, SK); hp(11, 5, 1, 2, SK); hp(4, 3, 2, 4, '#1b1410');           // head, nose, hair
    hp(7, 7, 4, 2, SKD); hp(9, 5, 1, 1, INK);                                     // stubble, eye
    hp(1, 2, 13, 2, HAT); hp(4, -1, 7, 3, HAT); hp(4, 1, 7, 1, '#3b2210');       // hat
    if (punch) { hp(9, 11, 7, 3, SH); hp(16, 10, 3, 4, SK); }                     // fist out!
    else hp(8, 11 + ((fr + 1) % 2), 2, 5, SH), hp(8, 15 + ((fr + 1) % 2), 2, 2, SK);
  };
  if (trip > 0) { g.save(); g.translate(x + 7, footY); g.rotate(0.5 * Math.min(1, trip * 4)); g.translate(-x - 7, -footY); }
  ink = true; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { ox = dx; oy = dy; shape(); }
  ink = false; ox = oy = 0; shape();
  if (trip > 0) g.restore();
}
function c3DrawOb(o) {
  const x = Math.round(o.x), b = o.base ?? C3GY;
  if (o.fly) { g.save(); g.translate(x + o.w / 2, b - 4 + o.fy); g.rotate(o.rot || 0); g.translate(-(x + o.w / 2), -(b - 4)); }
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
  if (o.fly) g.restore();
}
function c3DesertArt() {
  const d = C3D.dist || 0;
  g.drawImage(c3Bake('runSky', LW, 100, px => c3Grad(px, 0, 0, LW, 100, ['#2e2a5c', '#5a3868', '#a2506a', '#e0784e', '#f6aa66', '#fcd898'])), 0, 0);
  for (const [x, y, w] of [[20, 16, 70], [140, 28, 90], [250, 10, 50]]) { const xx = Math.round(((x - d * 0.02) % 400 + 400) % 400 - 40); R(xx, y, w, 2, '#f0907a'); R(xx + 8, y - 1, w - 20, 1, '#ffc090'); }
  disc(250, 84, 14, '#ffd890'); disc(250, 84, 10, '#fff0c0');
  c3Strip(c3Ridge('runFar', 640, 30, x => 12 + c3Wave(640, [[6, 3, 0.4], [3, 8, 1.2]])(x), { lit: '#8a5a78', dark: '#6e4466', rim: '#e8907a', foot: '#7a4e6c' }, false), d * 0.06, 72);
  c3Strip(c3Mesas('runMid', 560, 40, [[40, 40, 70, 28], [170, 20, 36, 20], [300, 70, 100, 34], [440, 30, 54, 24]], { cap: '#e08a5e', mid: '#a8503c', band: '#bc6448', dark: '#7a3428', darkBand: '#6a2c22', talus: '#9a5a40' }), d * 0.18, 66);
  // far dust trail on the horizon: Jenny's wagon, way out ahead
  for (let i = 0; i < 5; i++) { const p = (clock * 0.3 + i / 5) % 1; disc(Math.round(300 - p * 22), Math.round(103 - p * 5), 1 + Math.round(p * 3), `rgba(240,200,150,${0.5 * (1 - p)})`); }
  R(299, 102, 3, 2, '#3a2010');
  c3Strip(c3Ridge('runDunes', 480, 16, x => 7 + c3Wave(480, [[4, 4, 1.1], [2, 9, 0.3]])(x), { lit: '#e0a868', dark: '#c48c54', rim: '#f8d098' }, false), d * 0.45, 92);
  // the ground, with Jenny's wagon ruts to follow
  c3Strip(c3Bake('runGround', 320, 72, px => { c3Grad(px, 0, 0, 320, 72, ['#d8a464', '#cc945a', '#c08850', '#b07a44']);
    for (let i = 0; i < 220; i++) px(Math.round(c3Hash(i * 5) * 320), Math.round(c3Hash(i * 7) * 72), 2, 1, i % 3 ? '#b8844c' : '#e8bc80');
    for (const y of [22, 30]) for (let x = 0; x < 320; x++) px(x, y + (c3Hash(x >> 2) > 0.8 ? 1 : 0), 1, 2, '#a8723e');
    px(0, 0, 320, 1, '#f0c890'); }), d, 108);
  // shadows + dust + collectibles + obstacles + you
  C3D.plats.forEach(c3DrawRock);
  { const fl = c3Under(C3D.y).floor; g.globalAlpha = 0.3; R(C3PX + 1, fl, 14 - Math.round(Math.max(0, fl - C3D.y) * 0.15), 2, '#5a3418'); g.globalAlpha = 1; }
  for (const it of C3D.items) if (!it.got) { const x = Math.round(it.x), y = Math.round(it.y + Math.sin(clock * 4 + it.x) * 1.5);
    R(x - 3, y - 4, 7, 8, INK); R(x - 2, y - 3, 5, 6, '#4a7ab4'); R(x - 2, y - 3, 1, 6, '#7aa8d8'); R(x - 1, y - 6, 3, 2, '#8a8a96'); R(x - 4, y - 2, 1, 4, '#6a4020'); R(x + 4, y - 2, 1, 4, '#6a4020'); }
  C3D.obs.forEach(c3DrawOb);
  const fr = Math.floor(C3D.runT * 12) % 4, blink = C3D.inv > 0 && Math.floor(clock * 16) % 2;
  if (!blink) c3Runner(C3PX, Math.round(C3D.y), fr, C3D.air, C3D.punch > 0, C3D.trip);
  if (C3D.punch > 0.1) { R(C3PX + 21, Math.round(C3D.y) - 17, 3, 1, '#ffffff'); R(C3PX + 22, Math.round(C3D.y) - 14, 3, 1, '#ffffff'); }
  for (const p of C3D.dust) { g.globalAlpha = Math.max(0, 0.6 * (1 - p.t / 0.5)); disc(Math.round(p.x), Math.round(p.y), 1 + Math.round(p.t * 6), '#e8c890'); g.globalAlpha = 1; }
  // foreground tufts whizzing by
  for (let i = 0; i < 16; i++) { const x = Math.round(((i * 41 - d * 1.4) % 360 + 360) % 360 - 20), h = 3 + (i * 7) % 4; for (let j = 0; j < h; j++) R(x + (j >> 1), 172 - j, 1, 1, j > h - 2 ? '#c8b070' : '#8a7a40'); }
}
RUNS.desert = {
  c3: true, label: null, name: 'THE LONG RUN', title: 'THE LONG RUN', hint: 'JUMP UP THE ROCKS! PUNCH SNAKES + BUZZARDS!', tune: 'c3run',
  hurtText: { trip: { title: 'FACEPLANT!', reason: 'JUMP THE BRUSH, PARTNER.', color: '#ffb347' }, snake: { title: 'SNAKEBIT!', reason: 'PUNCH THE RATTLERS.', color: '#ff3b30' }, buzzard: { title: 'PECKED!', reason: 'PUNCH THE BUZZARDS.', color: '#ff3b30' }, rock: { title: 'SMACK!', reason: 'JUMP UP ONTO THE ROCKS.', color: '#ff3b30' } },
  reset() { Object.assign(C3D, { y: C3GY, vy: 0, air: false, punch: 0, pcd: 0, inv: 0, trip: 0, bumps: 0, obs: [], items: [], plats: [], forms: c3Forms(), dust: [], pows: [], dist: 0, v: c3RunCfg().v0, spawnT: 1.2, runT: 0, btn: { j: 0, p: 0 } }); ammo = 6; },
  tick(dt) { C3D.dist += C3D.v * dt * 0.5; C3D.runT += dt * 0.6; },
  update(dt) {
    ammo = 6; const cfg = c3RunCfg(), k = Math.min(1, time / C3_RUN_T);
    C3D.v = cfg.v0 + (cfg.v1 - cfg.v0) * k; C3D.dist += C3D.v * dt; C3D.runT += dt * (C3D.v / 100);
    C3D.btn.j = Math.max(0, C3D.btn.j - dt); C3D.btn.p = Math.max(0, C3D.btn.p - dt);
    C3D.punch = Math.max(0, C3D.punch - dt); C3D.pcd = Math.max(0, C3D.pcd - dt); C3D.inv = Math.max(0, C3D.inv - dt); C3D.trip = Math.max(0, C3D.trip - dt);
    for (const pl of C3D.plats) pl.x -= C3D.v * dt;
    C3D.plats = C3D.plats.filter(pl => pl.x + pl.w > -20);
    while (C3D.forms.length && time >= C3D.forms[0].t) c3BuildForm(C3D.forms.shift().seq);
    const prevY = C3D.y;
    if (C3D.air) { C3D.vy += 640 * dt; C3D.y += C3D.vy * dt; }
    { const u = c3Under(Math.min(prevY, C3D.y));
      if (u.wall) { c3Smack(); return; }
      if (C3D.air && C3D.vy >= 0 && C3D.y >= u.floor) { C3D.y = u.floor; C3D.air = false; C3D.vy = 0; C3D.dust.push({ x: C3PX + 6, y: C3D.y, vx: -40, vy: -8, t: 0 }); }
      else if (!C3D.air && u.floor > C3D.y + 1) { C3D.air = true; C3D.vy = 0; } } // ran off the edge of a rock
    if (!C3D.air && Math.random() < dt * 8) C3D.dust.push({ x: C3PX + 2, y: C3D.y - 1, vx: -C3D.v * 0.4, vy: -6, t: 0 });
    for (const p of C3D.dust) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    C3D.dust = C3D.dust.filter(p => p.t < 0.5);
    C3D.spawnT -= dt;
    const rocksNear = C3D.plats.some(pl => pl.x + pl.w > LW - 100) || (C3D.forms.length && C3D.forms[0].t - time < 1.6);
    if (rocksNear) C3D.spawnT = Math.max(C3D.spawnT, 0.2);
    if (C3D.spawnT <= 0 && time < C3_RUN_T - 2) { c3Spawn(time); C3D.spawnT = Math.max(0.95, cfg.gap * (0.85 + Math.random() * 0.7) * (cfg.v0 / C3D.v) * 1.1); } // never closer than one jump can clear
    const pb = c3PlayerBox(), fist = { x: C3PX + 10, y: C3D.y - 22, w: 22, h: 18 };
    for (const it of C3D.items) { it.x -= C3D.v * dt; if (!it.got && c3Overlap(pb, { x: it.x - 3, y: it.y - 5, w: 7, h: 9 })) { it.got = true; C3.stats.canteens++; addScore(100, 'bottle'); S.n.bottle++; popText(it.x, it.y - 8, 'WATER! +100'); tone('square', 880, 1320, 0.1, 0.05); } }
    C3D.items = C3D.items.filter(it => it.x > -10 && !it.got);
    for (const o of C3D.obs) {
      o.x -= C3D.v * dt;
      if (o.fly) { o.fvy = (o.fvy ?? o.vy) + 500 * dt; o.fy = (o.fy || 0) + o.fvy * dt; o.x += (o.vx || 0) * dt; o.rot = (o.rot || 0) + dt * 12; if (o.fy > 80) o.gone = true; continue; }
      if (o.kind === 'snake') { const dx = o.x - C3PX; if (dx < 80 && o.rear < 1) { if (o.rear === 0) noise(0.5, 0.12, 6000); o.rear = Math.min(1, o.rear + dt * 3); } }
      if (o.kind === 'buzzard') { o.x -= 35 * dt; const dx = o.x - C3PX, ty = dx < 130 ? C3D.y - 16 : C3GY - 58; o.by += (ty - o.by) * Math.min(1, dt * 5); if (dx < 130 && !o.cawed) { o.cawed = true; tone('sawtooth', 700, 380, 0.25, 0.06); } }
      if (o.kind === 'tumble') { o.vy += 400 * dt; o.y += o.vy * dt; if (o.y > 0) { o.y = 0; o.vy = -150 - Math.random() * 40; } o.x -= 25 * dt; }
      const ob = c3ObBox(o);
      if (C3D.punch > 0 && (o.kind === 'snake' || o.kind === 'tumble' || o.kind === 'buzzard') && c3Overlap(fist, ob)) {
        o.fly = true; o.vy = -150; o.vx = 120; sfx.hit(); targets++; hits++;
        if (o.kind === 'buzzard') { C3.stats.buzzards = (C3.stats.buzzards || 0) + 1; S.n.obj++; addScore(200, 'obj'); popText(o.x, o.by - 10, 'WHAP! +200'); burst(o.x + 6, o.by, 10, ['#2a2228', '#4a4048', '#c04a3a'], 60); }
        else if (o.kind === 'snake') { C3.stats.snakes++; S.n.obj++; addScore(150, 'obj'); popText(o.x, C3GY - 26, 'POW! +150'); }
        else { addScore(50, 'obj'); popText(o.x, C3GY - 22, 'BAM! +50'); burst(o.x + 5, C3GY - 5, 10, ['#8a6a3a', '#a8864a'], 60); o.gone = true; }
        continue;
      }
      if (!o.hit && C3D.inv <= 0 && c3Overlap(pb, ob)) { c3Stumble(o); if (state !== 'play') return; continue; }
      if (!o.passed && !o.hit && o.x + o.w < C3PX) { o.passed = true; addScore(25, 'obj'); }
    }
    C3D.obs = C3D.obs.filter(o => !o.gone && o.x > -30);
  },
  done() { return time >= C3_RUN_T && !C3D.forms.length && !C3D.plats.some(pl => pl.x + pl.w > C3PX) && !C3D.obs.some(o => o.x > C3PX - 10 && !o.fly); },
  shoot() { return true; },
  press(x, y) {
    if (state !== 'play') return;
    if (inBox(x, y, C3_JUMP_BTN)) return c3Jump();
    if (inBox(x, y, C3_PUNCH_BTN)) return c3Punch();
    if (x < W / 2) c3Jump(); else c3Punch(); // tap anywhere: left half jumps, right half punches
  },
  key(k) {
    if (k === ' ' || k === 'arrowup' || k === 'w') { c3Jump(); return true; }
    if (k === 'f' || k === 'x' || k === 'arrowright' || k === 'd' || k === 'j') { c3Punch(); return true; }
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
    ctx.globalAlpha = 0.88;
    for (const [b, label, on] of [[C3_JUMP_BTN, 'JUMP', C3D.btn.j > 0], [C3_PUNCH_BTN, 'PUNCH', C3D.btn.p > 0]]) {
      panel(b.x, b.y, b.w, b.h, on ? '#9a6236' : '#5a3418'); text(label, b.x + b.w / 2, b.y + b.h / 2 - 8, 16, on ? '#ffd23f' : '#ffffff', 'center');
    }
    ctx.globalAlpha = 1;
  },
};

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
    const rows = [['SPARK HITS', st.sparkHits], ['BATS SPAT ON', st.bats], ['SNAKES PUNCHED', st.snakes], ['BUZZARDS WHAPPED', st.buzzards || 0], ['JUMPS', st.jumps]];
    rows.forEach((r, i) => { if (k > i) { text(r[0], 200, 108 + i * 30, 16, '#ffffff'); text(String(r[1]), 760, 108 + i * 30, 16, '#f3d18b', 'right'); } });
    if (k > rows.length) { rect(200, 318, 560, 3, '#c98a4b'); text('SCORE', 200, 334, 24, '#ffffff'); text(String(score), 760, 334, 24, '#ffd23f', 'right'); }
    if (k > rows.length + 1) {
      text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, 396, 16, '#ffd23f', 'center');
      text('JENNY IS OUT THERE SOMEWHERE...', W / 2, 432, 16, '#ff8a8a', 'center');
      if (Math.floor(clock * 2.5) % 2) text('TAP FOR TITLE', W / 2, 472, 16, '#f3d18b', 'center');
    }
  },
  tap() { if (this.t < 0.45 * 7) this.t = 0.45 * 8; else toTitle(); },
  key() { this.tap(); },
};

// ---------------- DEATH SCREENS ----------------
Object.assign(EPITAPHS, {
  fuse: [['RUSTY!!'], ['HE RAN OUT', 'OF SPIT.'], ['BLOWN TO', 'KINGDOM COME.'], ['JENNY SENDS', 'HER REGARDS.']],
  trip: [['RUSTY!!'], ['TRIPPED OVER', 'A SAGEBRUSH.'], ['HE FORGOT', 'TO JUMP.']],
  snake: [['RUSTY!!'], ['THE SNAKE', 'PUNCHED FIRST.'], ['HE TRIED TO JUMP', 'A RATTLESNAKE.']],
  rock: [['RUSTY!!'], ['HE RAN INTO', 'A MESA.'], ['THE ROCK', 'DID NOT MOVE.'], ['FACE, MEET', 'SANDSTONE.']],
  buzzard: [['RUSTY!!'], ['THE BUZZARDS', "DIDN'T WAIT."], ['LUNCH.']],
});
Object.assign(HURT, {
  fuse: RUNS.fuse.hurtText.fuse, trip: RUNS.desert.hurtText.trip, snake: RUNS.desert.hurtText.snake, buzzard: RUNS.desert.hurtText.buzzard, rock: RUNS.desert.hurtText.rock,
});

// ---------------- STORY ORDER (chapter 3) ----------------
const STORY3 = [{ cut: 'ch3Wake' }, { run: 'fuse' }, { cut: 'ch3Canyon' }, { run: 'desert' }, { scene: 'ch3End' }];

// =====================================================================
//  HOOKS: input for the chapter-3 levels, the side-panel HUD, and the
//  "CHAPTER 3 >" test button on the main title screen.
// =====================================================================
const C3_TEST_BTN = { x: W - 246, y: 12, w: 234, h: 54 }; // TEST ONLY
window.addEventListener('pointerdown', e => {
  if (e.target !== cv || paused) return;
  const m = toGame(e);
  if (state === 'title' && inBox(m.x, m.y, C3_TEST_BTN)) { e.stopPropagation(); e.preventDefault(); audio(); mouse = m; startScene('ch3Title'); return; }
  if (run && run.c3 && ['intro', 'play', 'clear'].includes(state)) {
    if (canPause() && inBox(m.x, m.y, PAUSE_BTN)) return;      // let the pause button through
    e.stopPropagation(); e.preventDefault(); audio();
    mouse = m; touchMode = e.pointerType !== 'mouse'; lastTap = performance.now();
    run.press(m.x, m.y);                                         // no gun in chapter 3: spit / jump / punch instead
  }
}, true);
const c3BaseDraw = draw;
draw = function () {
  c3BaseDraw();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(SW, 0);
  if (state === 'title' && !paused) smallBtn(C3_TEST_BTN, 'CHAPTER 3 >');
  if (run && run.c3 && ['intro', 'play', 'clear', 'duelWait'].includes(state)) { // cover the revolver: Jenny has it
    const a = AMMO_BOX; rect(a.x - 14, a.y - 48, a.w + 28, a.h + 60, INK);
    panel(a.x - 6, a.y - 6, a.w + 12, a.h + 12);
    if (run === RUNS.fuse) {
      text('SPIT', a.x + a.w / 2, a.y + 16, 16, '#cfe8f4', 'center');
      const k = 1 - (C3F.cd || 0) / (C3F.cdMax || 1), ready = k >= 1;
      rect(a.x + 14, a.y + 56, a.w - 28, 22, INK); rect(a.x + 17, a.y + 59, Math.round((a.w - 34) * k), 16, ready ? '#7fb2ff' : '#4a6a8a');
      text(ready ? 'READY' : C3F.dry > 0 ? 'DRY!' : '...', a.x + a.w / 2, a.y + 96, 16, ready ? '#ffffff' : '#ff9a3a', 'center');
    } else {
      text('NO GUN', a.x + a.w / 2, a.y + 16, 16, '#ff8a8a', 'center');
      text('JUST', a.x + a.w / 2, a.y + 60, 16, '#ffffff', 'center'); text('FISTS', a.x + a.w / 2, a.y + 88, 16, '#ffd23f', 'center');
    }
  }
  ctx.restore();
};


// =====================================================================
//  ROCK STEPS: stair-stepped sandstone ledges. Each level is taller than
//  your jump can clear twice, so you climb one level at a time. Run into
//  the side of a ledge and it's lights out. Dropping down any height is fine.
// =====================================================================
const C3LV = 22; // one ledge level, in pixels (a jump peaks at ~37px: one level, never two)
const C3_FORM_FIRST = [1, 0, 1, 2, 1, 2, 3, 4, 3, 4, 3, 2, 3, 4, 1];
function c3RandForm(n) { const out = []; let L = 0; for (let i = 0; i < n; i++) { const up = Math.random() < 0.55; L = up ? Math.min(4, L + 1) : Math.floor(Math.random() * L) + (L > 1 ? 1 : 0); if (L === 0) L = 1; out.push(L); } return out; }
function c3Forms() { return [{ t: 4, seq: C3_FORM_FIRST }, { t: 22, seq: c3RandForm(8) }, { t: 34, seq: c3RandForm(7) }]; }
function c3BuildForm(seq) {
  let x = Math.max(LW + 10, ...C3D.plats.map(pl => pl.x + pl.w + 40));
  const v = C3D.v;
  seq.forEach((lvl, i) => {
    const w = Math.round(v * (0.78 + Math.random() * 0.25)), next = seq[i + 1] ?? 0;
    if (lvl > 0) {
      const pl = { x, w, lvl, seed: Math.random() * 1000 | 0 }; C3D.plats.push(pl);
      const prev = i > 0 ? seq[i - 1] : 0;
      if (prev > lvl && next <= lvl && w > v * 0.8 && Math.random() < 0.75) { // only on ledges you drop down onto, so there's room to land first // something nasty on top of this ledge
        const kind = pick(['bush', 'rock', 'cactus', 'snake', 'snake']);
        C3D.obs.push({ kind, x: x + Math.round(w * 0.6), ...C3_OBS[kind], base: C3GY - lvl * C3LV, rear: 0, y: 0, vy: 0, hit: false, passed: false, gone: false, seed: Math.random() * 6, ride: pl });
      }
    }
    x += w;
  });
}
// what's under your feet, and is there a ledge face in your way?
function c3Under(feetY) {
  let floor = C3GY, wall = false;
  for (const pl of C3D.plats) if (pl.x < C3PX + 10 && pl.x + pl.w > C3PX + 4) {
    const top = C3GY - pl.lvl * C3LV;
    if (top < feetY - 3) wall = true; else floor = Math.min(floor, top);
  }
  return { floor, wall };
}
function c3Smack() {
  shake = 1; sfx.thud(); noise(0.4, 0.6, 600); burst(C3PX + 12, C3D.y - 12, 14, ['#c8703c', '#e8a060', '#8a3a24'], 90);
  C3D.bumps = 0; hurt('rock', null);
}
function c3DrawRock(pl) {
  const x0 = Math.round(pl.x), w = pl.w, top = C3GY - pl.lvl * C3LV, H = C3GY - top + 2;
  if (x0 > LW || x0 + w < 0) return;
  // body: sandstone strata, warm lit top, cool shade toward the bottom
  for (let j = 0; j < H; j++) {
    const y = top + j, band = Math.floor((j + pl.seed % 5) / 4) % 4, lvlLine = j > 0 && j % C3LV === 0;
    const col = j < 2 ? '#f2b878' : lvlLine ? '#7a3424' : ['#c8703c', '#b8603a', '#d07c44', '#a85434'][band];
    R(x0, y, w, 1, col);
    if (j >= 2 && !lvlLine) { // a few blotches + pebbles so it isn't flat
      for (let k = 0; k < w / 14; k++) { const hx = x0 + Math.round(c3Hash(pl.seed + j * 31 + k * 7) * (w - 3)); if (c3Hash(pl.seed * 3 + j * 13 + k) > 0.72) R(hx, y, 2 + (k % 3), 1, band % 2 ? '#e08a50' : '#94482e'); }
    }
  }
  // cracks running down the face
  for (let k = 0; k < Math.max(1, w / 40); k++) { let cx = x0 + 6 + Math.round(c3Hash(pl.seed + k * 91) * (w - 12)); for (let j = 3; j < Math.min(H, 18 + k * 5); j++) { R(cx, top + j, 1, 1, '#6a2c1e'); if (c3Hash(pl.seed + j * 5 + k) > 0.7) cx += c3Hash(pl.seed + j) > 0.5 ? 1 : -1; } }
  // the front (left) face is in shadow, the top lip catches the sunset
  R(x0, top, 3, H, '#8a3e2a'); R(x0, top, 1, H, '#5a2418');
  R(x0, top, w, 1, '#ffd8a0'); R(x0 + 3, top + 1, w - 3, 1, '#e8a060');
  // scrubby grass + a pebble or two on the top
  for (let k = 0; k < w / 18; k++) { const gx = x0 + 6 + Math.round(c3Hash(pl.seed + k * 17) * (w - 12)); R(gx, top - 2, 1, 2, '#6a7a34'); R(gx + 1, top - 1, 1, 1, '#8a9a44'); }
  if (w > 40) { R(x0 + Math.round(w * 0.7), top - 1, 3, 1, '#b89070'); }
  // an inky outline so it reads against the dunes
  R(x0 - 1, top - 1, 1, H + 1, INK); R(x0, top - 1, w, 1, INK);
}
