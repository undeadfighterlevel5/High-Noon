// =====================================================================
//  HIGH NOON — CHAPTER 4: THE SHAMAN'S GIFT
//  Loaded after chapters 1-3. Everything here starts with c4 / C4.
//
//  Flow:  ch4Title (night canyon + badges) -> ch4Arrive (narration over the canyon)
//         -> ch4Shaman (floating shaman by the campfire) -> ch4Can (close-up: Shmoodle
//         in the bean can, a dozen darts) -> ch4Rifle (at the fire, then the velvet case)
//         -> ch4Farewell (McGrudder is over the hill) -> ch4End
//  TEST: a "CHAPTER 4 >" button on the main title (under CHAPTER 3 >).
// =====================================================================

// ---------------- CAST ----------------
Object.assign(CHARS, {
  shaman: { hat: 'none', skin: '#9a5a34', hair: '#e8e8e0', hairLong: true, shirt: '#c8582a', vest: '#e2b33c', face: 'beard', beardC: '#f0f0e8', bg: '#2a1a4a' },
});
Object.assign(SPEAK, {
  shaman: { name: 'THE SHAMAN', color: '#c8a8ff' },
  snail:  { name: 'SHMOODLE THE SNAIL', color: '#a8f0a0' },
});

// ---------------- MUSIC: mystical drone, slow pentatonic flute, soft hand drum ----------------
const c4Notes = s => s.replace(/\|/g, '').trim().split(/\s+/);
const C4_MEL = c4Notes('D5 - - - F5 - G5 - | A5 - - - - - G5 F5 | D5 - - - - - - - | - - C5 - D5 - F5 - | G5 - - - A5 - C6 - | A5 - - - G5 - F5 - | D5 - - - - - - - | - - - - - - - -');
TUNES.c4mystic = {
  notes: C4_MEL, bass: ['D2'], bar: 8, eighth: 60 / 72 / 2, vol: 0.07, style: 'mystic',
  play(t, k, e) {
    const beat = k % 8, bar = Math.floor(k / 8);
    const v = (type, f, st, dur, vol, lp) => {
      const o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f;
      gn.gain.setValueAtTime(0.0001, st); gn.gain.linearRampToValueAtTime(vol, st + Math.min(0.25, dur * 0.4)); gn.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      let node = o; if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); node = fl; }
      node.connect(gn).connect(MUS.gain); o.start(st); o.stop(st + dur + 0.05);
      return o;
    };
    if (beat === 0) { v('sawtooth', 73.4, t, e * 8.4, 0.12, 420); v('sawtooth', 73.9, t, e * 8.4, 0.08, 420); v('triangle', 110, t, e * 8.4, 0.12, 900); if (bar % 2) v('sine', 146.8, t, e * 8.4, 0.1); }
    if (beat === 0 || beat === 5) { const o = ac.createOscillator(), gn = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.25);
      gn.gain.setValueAtTime(beat ? 0.25 : 0.45, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.35); o.connect(gn).connect(MUS.gain); o.start(t); o.stop(t + 0.4); }
    if (beat === 3 || beat === 7) { const b = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 900; gn.gain.value = 0.2; s.buffer = b; s.connect(f).connect(gn).connect(MUS.gain); s.start(t); }
    const n = C4_MEL[k % C4_MEL.length];
    if (n !== '-') {
      let len = 1; while (C4_MEL[(k + len) % C4_MEL.length] === '-' && len < 8) len++;
      const o = v('sine', NF(n), t, len * e * 1.05, 0.22);
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.2; lg.gain.value = NF(n) * 0.012; lfo.connect(lg).connect(o.frequency); lfo.start(t + 0.15); lfo.stop(t + len * e * 1.05);
      v('triangle', NF(n) * 2, t, len * e * 0.7, 0.03);
    }
    if (beat === 6 && Math.random() < 0.35) for (let i = 0; i < 3; i++) v('sine', NF(pick(['D6', 'F6', 'A6', 'C7'])), t + i * 0.09, 0.6, 0.03);
  },
};

// =====================================================================
//  PAINT KIT
// =====================================================================
const C4BAKE = {};
function c4Bake(key, w, h, fn) {
  if (C4BAKE[key]) return C4BAKE[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'), px = (a, b, cw, ch, col) => { x.fillStyle = col; x.fillRect(a, b, cw, ch); };
  fn(px, x, w, h); return (C4BAKE[key] = c);
}
const C4BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const c4Dith = (x, y) => (C4BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
const c4Hash = n => { n = Math.imul(n ^ 61, 2654435761) ^ (n >>> 13); return ((n >>> 0) % 10007) / 10007; };
function c4Grad(px, x0, y0, w, h, stops) {
  const n = stops.length - 1;
  for (let y = 0; y < h; y++) {
    const f = (y / Math.max(1, h - 1)) * n, i = Math.min(n - 1, f | 0), t = f - i;
    px(x0, y0 + y, w, 1, stops[i]);
    for (let x = 0; x < w; x++) if (t > c4Dith(x, y)) px(x0 + x, y0 + y, 1, 1, stops[i + 1]);
  }
}
function c4Mesas(key, w, h, list, C) {
  return c4Bake('mesa:' + key, w, h, px => {
    for (const [cx, topW, baseW, mh] of list) for (let j = 0; j < mh; j++) {
      const t = j / mh, hw = Math.round(topW / 2 + (baseW - topW) / 2 * Math.pow(t, 1.7)), y = h - mh + j;
      for (let dx = -hw; dx <= hw; dx++) {
        const x = ((cx + dx) % w + w) % w, side = dx < -hw * 0.4;
        let c = j < 2 ? C.cap : ((j >> 1) % 3 === 0 ? C.band : C.mid);
        if (side) c = (j >> 1) % 3 === 0 ? C.darkBand : C.dark;
        if (t > 0.72 && (t - 0.72) * 3.5 > c4Dith(x, y)) c = side ? C.dark : C.talus;
        if (dx === hw) c = C.cap;
        px(x, y, 1, 1, c);
      }
    }
  });
}
function c4Glow(x, y, r, rgb, a) {
  g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.globalCompositeOperation = 'source-over';
}
// =====================================================================
//  THE NIGHT SKY
// =====================================================================
const C4_SKY = ['#06081a', '#0c1030', '#141a44', '#1e2658', '#2a3266', '#3a3a6e'];
const c4Sky = () => c4Bake('nightSky', LW, 110, px => {
  c4Grad(px, 0, 0, LW, 110, C4_SKY);
  for (let x = 0; x < LW; x++) {
    const cy = 18 + x * 0.22 + Math.sin(x * 0.04) * 6;
    for (let y = Math.round(cy - 12); y < cy + 12; y++) {
      const k = 1 - Math.abs(y - cy) / 12;
      if (k * 0.55 > c4Dith(x, y) + c4Hash(x * 7 + y * 13) * 0.4) px(x, y, 1, 1, k > 0.6 ? '#4a4a86' : '#30346a');
      if (c4Hash(x * 31 + y * 17) > 0.985) px(x, y, 1, 1, '#c8c8f0');
    }
  }
  for (let i = 0; i < 260; i++) { const x = Math.round(c4Hash(i * 3) * LW), y = Math.round(c4Hash(i * 5 + 1) * 100); px(x, y, 1, 1, c4Hash(i * 9) > 0.8 ? '#ffffff' : c4Hash(i * 11) > 0.5 ? '#b8c0e8' : '#7880b8'); }
});
function c4Stars() {
  for (let i = 0; i < 22; i++) {
    const x = Math.round(c4Hash(i * 41 + 3) * LW), y = Math.round(c4Hash(i * 43 + 7) * 92), tw = (Math.sin(clock * (1.3 + (i % 5) * 0.4) + i * 2.1) + 1) / 2;
    R(x, y, 1, 1, '#ffffff');
    if (tw > 0.6) { g.globalAlpha = (tw - 0.6) * 2.5; R(x - 1, y, 3, 1, '#d8e0ff'); R(x, y - 1, 1, 3, '#d8e0ff'); if (tw > 0.9) { R(x - 2, y, 1, 1, '#8890c8'); R(x + 2, y, 1, 1, '#8890c8'); } g.globalAlpha = 1; }
  }
  if (Math.floor(clock * 0.25) % 5 === 0) { const p = (clock * 0.25) % 1, sx = Math.round(40 + p * 140), sy = Math.round(10 + p * 30); g.globalAlpha = 1 - p; line(sx - 8, sy - 2, sx, sy, '#ffffff'); g.globalAlpha = 1; }
}
function c4Moon(cx, cy) {
  c4Glow(cx, cy, 34, '140,160,255', 0.18);
  disc(cx, cy, 11, '#e8e4d0'); disc(cx + 2, cy - 2, 9, '#f4f0e0');
  for (const [dx, dy, r] of [[-3, 2, 2], [3, 4, 1], [1, -4, 2], [-5, -3, 1]]) disc(cx + dx, cy + dy, r, '#d0ccb8');
}

// =====================================================================
//  SCENE: THE NIGHT CANYON
// =====================================================================
function c4CanyonNight(fireX, moonY = 26) {
  g.drawImage(c4Sky(), 0, 0); c4Stars(); c4Moon(262, moonY);
  g.drawImage(c4Mesas('farN', 320, 34, [[30, 50, 70, 20], [110, 30, 46, 26], [200, 60, 90, 16], [290, 40, 60, 22]], { cap: '#5a5a8a', mid: '#3a3a64', band: '#424270', dark: '#262646', darkBand: '#20203e', talus: '#30305a' }), 0, 62);
  g.drawImage(c4Mesas('midN', 320, 44, [[20, 30, 60, 34], [150, 70, 110, 26], [262, 40, 70, 38]], { cap: '#8a6a8a', mid: '#4a3450', band: '#56405c', dark: '#2a1c30', darkBand: '#24182a', talus: '#3a2a42' }), 0, 70);
  g.drawImage(c4Bake('floorN', LW, 70, px => { c4Grad(px, 0, 0, LW, 70, ['#3a2e48', '#2e2438', '#241c2e', '#1a1422']);
    for (let i = 0; i < 160; i++) px(Math.round(c4Hash(i * 5) * LW), Math.round(c4Hash(i * 7) * 70), 2, 1, i % 3 ? '#2a2034' : '#4a3a58');
    for (let x = 0; x < LW; x++) { const y = Math.round(16 + Math.sin(x * 0.035) * 5 + (LW - x) * 0.03); px(x, y, 1, 2, '#3a4a7a'); if (x % 9 === 0) px(x, y, 2, 1, '#8a9ad0'); }
  }), 0, 110);
  for (const [x, h] of [[24, 34], [88, 22], [300, 40]]) { R(x, 150 - h, 4, h, '#120c18'); R(x - 5, 150 - h + 8, 5, 3, '#120c18'); R(x - 5, 150 - h + 2, 3, 9, '#120c18'); R(x + 4, 150 - h + 12, 5, 3, '#120c18'); R(x + 6, 150 - h + 6, 3, 9, '#120c18'); R(x + 3, 150 - h, 1, h, '#2a2240'); }
  R(0, 150, LW, 30, '#140e1a');
  if (fireX != null) { c4Glow(fireX, 140, 46, '255,140,60', 0.28); c4Fire(fireX, 146, 0.6); }
}
function c4Fire(x, by, s = 1) {
  x = Math.round(x); by = Math.round(by);
  R(x - Math.round(9 * s), by - 2, Math.round(18 * s), 3, '#3a2010'); line(x - Math.round(8 * s), by, x + Math.round(7 * s), by - Math.round(4 * s), '#5a3418'); line(x + Math.round(8 * s), by, x - Math.round(7 * s), by - Math.round(4 * s), '#4a2a14');
  for (let i = -2; i <= 2; i++) R(x + i * Math.round(4 * s), by + 1, Math.round(3 * s), 2, '#6a6a76');
  const f = clock * 9;
  for (let j = 0; j < Math.round(16 * s); j++) {
    const k = j / (16 * s), w = Math.round((7 - j * 0.4) * s + Math.sin(f + j) * 1.2), sway = Math.round(Math.sin(f * 0.7 + j * 0.4) * k * 2);
    if (w <= 0) continue;
    R(x - w + sway, by - 3 - j, w * 2, 1, k < 0.3 ? '#ff5a20' : k < 0.6 ? '#ff9a3a' : '#ffd23f');
    if (k < 0.5 && w > 2) R(x - Math.round(w / 2) + sway, by - 3 - j, w, 1, '#ffe890');
  }
  for (let i = 0; i < 5; i++) { const p = (clock * 0.5 + i * 0.2) % 1; R(Math.round(x + Math.sin(i * 3 + clock * 2) * 6 * s), Math.round(by - 6 - p * 40 * s), 1, 1, p < 0.6 ? '#ffd23f' : '#ff7a2a'); }
}
// cutscene framing: everything that matters sits above the dialog box
function c4Framed(fill, sc, dy, fn) { R(0, 0, LW, LH, fill); g.save(); g.translate(160, dy); g.scale(sc, sc); g.translate(-160, 0); fn(); g.restore(); }
SETS.c4Canyon = { bg: () => c4Framed('#06081a', 1, -34, () => c4CanyonNight(196, 54)), fg: () => {} };

// =====================================================================
//  THE SHAMAN — floating in a deep meditation pose: legs folded wide in
//  lotus, palms pressed together at his chest, head slightly bowed.
// =====================================================================
function c4Eyes() { // 'closed' | 'one' | 'open'
  return 'closed'; // his eyes stay closed the whole time
}
function c4Shaman(x, by, talking) {
  const bob = Math.round(Math.sin(clock * 1.6) * 3), y = by - 48 + bob; // y = top of the head
  const SK = '#a8643a', SKL = '#c47a4a', SKD = '#7a4428', OUT = '#2a140c';
  const RB = '#c8582a', RBD = '#8a3a1a', RBL = '#e07a3a', GOLD = '#e2b33c', GOLDD = '#a8801c';
  g.globalAlpha = 0.35; R(x - 14 + Math.round(bob / 2), by - 1, 28 - bob, 2, '#000000'); g.globalAlpha = 1; // shadow
  c4Glow(x, y + 24, 36 + Math.sin(clock * 2) * 3, '170,130,255', 0.16); // aura
  for (let i = 0; i < 6; i++) { const a = clock * 0.9 + i * 1.05, rr = 24 + Math.sin(clock * 1.3 + i) * 3; R(Math.round(x + Math.cos(a) * rr), Math.round(y + 24 + Math.sin(a) * rr * 0.45), 1, 1, i % 2 ? '#d8c8ff' : '#a888ff'); }
  // --- legs: a rounded lotus. Thighs fan out to the knees; each shin tapers across to rest its foot on the other knee.
  const ly = y + 30;
  const limb = (x0, y0, x1, y1, r0, r1, c, hi) => { // a tapered, rounded limb from (x0,y0) to (x1,y1), outlined
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (const pass of [0, 1]) for (let i = 0; i <= n; i++) { const t = i / n, rr = r0 + (r1 - r0) * t, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      disc(Math.round(cx), Math.round(cy), Math.round(rr) + (pass ? 0 : 1), pass ? c : OUT); }
    if (hi) for (let i = 0; i <= n; i++) { const t = i / n, rr = r0 + (r1 - r0) * t; R(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t - rr + 1), 1, 1, hi); }
  };
  limb(x - 8, ly + 5, x - 22, ly + 9, 5, 4, SK, SKL);           // left thigh
  limb(x + 8, ly + 5, x + 22, ly + 9, 5, 4, SK, SKL);           // right thigh
  limb(x - 22, ly + 11, x + 14, ly + 12, 3.5, 2.5, SKD, SK);    // back shin: left knee across to the right
  limb(x + 22, ly + 13, x - 14, ly + 14, 3.5, 2.5, SK, SKL);    // front shin: right knee across to the left (on top)
  for (const [fx, fy] of [[x + 15, ly + 10], [x - 17, ly + 12]]) { R(fx - 1, fy - 1, 8, 5, OUT); R(fx, fy, 6, 3, '#d8a070'); R(fx, fy, 6, 1, '#e8b888'); R(fx + 5, fy, 1, 3, SKD); } // soles turned up
  for (let j = 0; j < 7; j++) { const w = 12 - j; R(x - w - 1, ly + j, w * 2 + 2, 1, OUT); R(x - w, ly + j, w * 2, 1, j < 2 ? RBL : RB); } // robe over the lap, tucked between the knees
  for (let j = 0; j < 4; j++) R(x - 3 + j, ly + 3 + j, 6 - j * 2, 1, j < 2 ? GOLD : GOLDD); // sash tail
  // --- torso: bare chest, beaded necklaces, a sash over one shoulder
  for (let j = 0; j < 17; j++) { const w = 8 + Math.round(j * 0.3); R(x - w - 1, y + 13 + j, w * 2 + 2, 1, OUT); R(x - w, y + 13 + j, w * 2, 1, j < 3 ? SKL : SK); }
  R(x - 1, y + 18, 2, 10, SKD); R(x - 6, y + 17, 5, 1, SKD); R(x + 1, y + 17, 5, 1, SKD); // chest + ab definition
  for (let i = -6; i <= 6; i += 2) R(x + i, y + 15 + Math.round(Math.abs(i) / 3), 2, 2, ['#3ab4c8', '#e2b33c', '#c03040', '#f4efe0'][(i + 6) / 2 % 4]); // beads
  for (let j = 0; j < 16; j++) R(x - 8 + j, y + 13 + j, 3, 1, RB); // sash over the shoulder
  // --- arms: elbows out, forearms meeting at the chest, palms pressed together (prayer)
  R(x - 14, y + 15, 5, 9, OUT); R(x - 13, y + 16, 4, 7, SK); R(x - 13, y + 16, 1, 7, SKL);  // upper arms
  R(x + 9, y + 15, 5, 9, OUT); R(x + 9, y + 16, 4, 7, SK);
  for (let i = 0; i < 10; i++) { R(x - 13 + i, y + 25 - Math.round(i * 0.3), 2, 3, SK); R(x - 13 + i, y + 28 - Math.round(i * 0.3), 2, 1, OUT); R(x + 12 - i, y + 25 - Math.round(i * 0.3), 2, 3, SKD); R(x + 12 - i, y + 28 - Math.round(i * 0.3), 2, 1, OUT); } // forearms coming in level
  R(x - 3, y + 17, 6, 11, OUT); R(x - 2, y + 18, 2, 9, SKL); R(x, y + 18, 2, 9, SK); R(x - 1, y + 16, 2, 2, SKL); R(x - 1, y + 15, 2, 1, OUT); // palms pressed together, fingertips up
  R(x - 13, y + 22, 3, 2, GOLD); R(x + 10, y + 22, 3, 2, GOLD); // gold arm bands
  c4Glow(x, y + 17, 10, '200,170,255', 0.35); if (Math.floor(clock * 6) % 2) R(x, y + 14, 1, 1, '#ffffff'); // a spark at the fingertips
  // --- head: bowed a touch, long white hair, white beard, headband + feather
  R(x - 7, y + 1, 14, 13, OUT); R(x - 6, y + 2, 12, 12, SK); R(x - 6, y + 2, 2, 12, SKD);
  R(x - 8, y + 2, 2, 16, '#e8e8e0'); R(x + 6, y + 2, 2, 16, '#e8e8e0'); R(x - 6, y, 12, 3, '#e8e8e0');
  R(x - 5, y + 10, 10, 4, '#f0f0e8'); R(x - 3, y + 14, 6, 1, '#f0f0e8'); // beard, trimmed so his praying hands show
  if (talking && Math.floor(clock * 9) % 2) R(x - 2, y + 11, 4, 2, '#3a1a10'); else R(x - 2, y + 11, 4, 1, '#5a2a1a');
  const eyes = c4Eyes();
  if (eyes === 'closed' || eyes === 'one') R(x - 4, y + 6, 2, 1, '#f0f0e8'); else { R(x - 4, y + 5, 2, 2, '#ffffff'); R(x - 3, y + 5, 1, 2, INK); }
  if (eyes === 'closed') R(x + 2, y + 6, 2, 1, '#f0f0e8'); else { R(x + 2, y + 5, 2, 2, '#ffffff'); R(x + 3, y + 5, 1, 2, INK); }
  R(x - 4, y + 8, 2, 1, GOLD); R(x + 2, y + 8, 2, 1, GOLD); R(x - 1, y + 3, 2, 2, '#c03040'); // face paint + forehead mark
  R(x - 7, y + 2, 14, 2, '#c03040'); R(x - 7, y + 2, 14, 1, GOLD); R(x + 5, y - 8, 2, 10, '#f4efe0'); R(x + 5, y - 8, 1, 4, '#3b2210'); // headband + feather
}
function c4CanSmall(x, by) { // tiny bean can on the ground, with its little door
  R(x - 5, by - 12, 10, 12, '#a8a8b4'); R(x - 5, by - 12, 10, 1, '#d8d8e0'); R(x - 5, by - 9, 10, 5, '#c0302b'); R(x - 4, by - 8, 8, 1, '#e2b33c'); R(x + 3, by - 12, 2, 12, '#7a7a86');
  R(x - 2, by - 4, 4, 4, '#3a2a1a'); R(x + 1, by - 2, 1, 1, '#e2b33c');
}
function c4Camp() {
  g.drawImage(c4Sky(), 0, 0); c4Stars(); c4Moon(48, 22);
  g.drawImage(c4Mesas('campN', 320, 40, [[60, 40, 80, 26], [230, 80, 120, 34]], { cap: '#6a5a8a', mid: '#3a3058', band: '#44386a', dark: '#221a36', darkBand: '#1c1630', talus: '#2e2448' }), 0, 70);
  g.drawImage(c4Bake('campGround', LW, 72, px => { c4Grad(px, 0, 0, LW, 72, ['#3a2a3a', '#2e2230', '#22182a', '#180f1e']);
    for (let i = 0; i < 200; i++) px(Math.round(c4Hash(i * 5 + 3) * LW), Math.round(c4Hash(i * 7 + 5) * 72), 2, 1, i % 3 ? '#2a1e30' : '#4a3648'); }), 0, 108);
  // the bean can, sitting right on the ground
  g.globalAlpha = 0.35; R(153, 150, 14, 2, '#000000'); g.globalAlpha = 1;
  c4CanSmall(160, 151);
  c4Glow(120, 136, 80, '255,130,50', 0.22); c4Glow(120, 140, 30, '255,180,90', 0.25);
  c4Fire(120, 148, 1.1);
  g.globalAlpha = 0.25; for (let j = 0; j < 14; j++) R(120 - 30 - j * 3, 150 + j, 60 + j * 6, 1, '#ff9a4a'); g.globalAlpha = 1;
  c4Shaman(70, 150, state === 'cut' && CUTS[cutName].lines[cutLine][0] === 'shaman' && Math.floor(cutT * 45) < CUTS[cutName].lines[cutLine][1].length);
  ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, 178, 150, true);
}
SETS.c4Camp = { bg: () => c4Framed('#06081a', 1, -44, c4Camp), fg: () => {} };

// =====================================================================
//  CLOSE-UP: THE BEAN CAN, its little door, and Shmoodle the snail
// =====================================================================
function c4CanBg() {
  g.drawImage(c4Bake('canBg', LW, LH, px => { c4Grad(px, 0, 0, LW, LH, ['#1a0e1a', '#2a1620', '#3a2018', '#2a1610']);
    for (let i = 0; i < 40; i++) { const x = Math.round(c4Hash(i * 3) * LW), y = Math.round(c4Hash(i * 5) * LH), r = 2 + Math.round(c4Hash(i * 7) * 5);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r && c4Dith(x + dx, y + dy) > 0.6) px(x + dx, y + dy, 1, 1, i % 2 ? '#5a2a1a' : '#3a1a2a'); } }), 0, 0);
}
function c4CanClose(t, phase) {
  const cx0 = 160;
  // the desert floor, firelit
  for (let j = 0; j < 40; j++) R(-80, 154 + j, LW + 160, 1, j < 2 ? '#7a5038' : j % 6 === 0 ? '#4a2e22' : j < 14 ? '#5e3a28' : '#4e3022');
  for (let i = 0; i < 60; i++) R(Math.round(c4Hash(i * 13) * 440) - 60, 157 + Math.round(c4Hash(i * 17) * 30), 2, 1, i % 3 ? '#6a4430' : '#8a6040');
  for (const tx of [-20, 30, 250, 320]) for (let k = 0; k < 4; k++) line(tx + k * 2, 156, tx + k * 3 - 3, 148 - (k % 2) * 3, '#6a5a2a');
  g.globalAlpha = 0.4; R(cx0 - 50, 155, 108, 3, '#000000'); g.globalAlpha = 1;
  const cx = 160, top = 34, bot = 156, hw = 46;
  for (let y = top; y < bot; y++) {
    const ridge = (y - top) % 9 === 0, lab = y > top + 24 && y < bot - 22;
    for (let x = -hw; x < hw; x++) {
      const k = x / hw, lit = 0.5 + 0.5 * Math.cos((k + 0.35) * Math.PI * 0.9), dent = (x > 18 && x < 30 && y > 60 && y < 80) ? -0.25 : 0;
      let c;
      if (lab) c = lit + dent > 0.75 ? '#e04030' : lit + dent > 0.4 ? '#c0302b' : '#8a2020';
      else c = lit + dent > 0.8 ? '#e8e8f0' : lit + dent > 0.5 ? '#b8b8c4' : lit + dent > 0.25 ? '#8a8a98' : '#5a5a68';
      if (ridge && !lab) c = '#6a6a78';
      R(cx + x, y, 1, 1, c);
    }
  }
  for (let x = -hw - 2; x < hw + 2; x++) { R(cx + x, top - 2, 1, 3, x < -10 ? '#c8c8d4' : '#9a9aa8'); R(cx + x, bot - 1, 1, 2, '#4a4a58'); }
  for (let j = 0; j < 8; j++) R(cx - hw + 6 + j * 2, top - 6 - j, 18 - j * 2, 1, '#c8c8d4'); R(cx - hw + 4, top - 2, 2, 2, '#8a8a98');
  R(cx - 36, top + 30, 72, 18, '#f4efe0'); R(cx - 36, top + 30, 72, 2, '#e2b33c'); R(cx - 36, top + 46, 72, 2, '#e2b33c');
  signText('BEANS', cx, top + 34, '#8a1f1a', 2);
  disc(cx - 26, top + 62, 5, '#3a2a1a'); R(cx - 31, top + 60, 10, 2, '#2a1a10'); for (let i = 0; i < 3; i++) R(cx - 28 + i * 3, top + 52 - (Math.floor(clock * 4 + i) % 3), 1, 3, '#f4efe0');
  const open = phase >= 1 ? Math.min(1, (t - 0.2) * 1.6) : 0, dx0 = cx + 6, dy0 = bot - 36, dw = 22, dh = 34;
  R(dx0 - 2, dy0 - 2, dw + 4, dh + 2, '#4a3a2a');
  R(dx0, dy0, dw, dh, open > 0.05 ? '#120a08' : '#6a4a2a');
  if (open > 0.05) { c4Glow(dx0 + dw / 2, dy0 + dh / 2, 26, '255,200,120', 0.35 * open); R(dx0 + 2, dy0 + 4, dw - 4, dh - 6, '#3a2010'); R(dx0 + 4, dy0 + 6, 5, 4, '#ffd88a'); R(dx0 + 12, dy0 + 6, 5, 4, '#ffd88a'); }
  const doorW = Math.round(dw * (1 - open * 0.85));
  for (let j = 0; j < dh; j += 5) R(dx0, dy0 + j, doorW, 4, '#8a5a30');
  if (doorW > 4) { R(dx0 + doorW - 3, dy0 + dh / 2, 2, 2, '#e2b33c'); R(dx0 + 2, dy0 + 2, doorW - 4, 1, '#b07a44'); }
  R(dx0 - 6, bot - 2, dw + 12, 3, '#3a6a3a'); signText('HI', dx0 + dw / 2, bot - 1, '#f4efe0');
  R(dx0 + dw + 4, dy0 + 4, 3, 4, '#e2b33c'); c4Glow(dx0 + dw + 5, dy0 + 6, 10, '255,220,120', 0.4);
  if (phase >= 1) { const k = Math.max(0, Math.min(1, (t - 0.6) / 1.2)); c4Snail(Math.round(dx0 + 4 + k * 34), bot - 2); }
  if (phase >= 2) {
    const k = Math.min(1, (t - 0.2) * 1.2);
    for (let i = 0; i < 12; i++) {
      if (i / 12 >= k) continue;
      const a = -0.6 + i * 0.1, px = Math.round(46 + (i % 2) * 6 + Math.sin(a) * 4), py = Math.round(124 + i * 2.5), x2 = px + 14;
      R(px, py, 14, 1, '#c8c8d4'); R(px, py - 1, 3, 3, '#a8f0a0'); R(px + 1, py, 1, 1, '#ffffff');
      R(px + 8, py - 1, 4, 3, '#3a8a4a'); R(x2 - 2, py - 2, 3, 5, '#e8e0c8'); R(x2, py - 2, 1, 5, '#c03040');
    }
    if (Math.floor(clock * 3) % 2) R(50, 125, 1, 1, '#ffffff');
  }
}
function c4Snail(x, by) {
  const bob = Math.round(Math.sin(clock * 3) * 1);
  g.globalAlpha = 0.5; R(x - 16, by - 1, 16, 1, '#c8f0c8'); g.globalAlpha = 1;
  for (let i = 0; i < 18; i++) R(x - 2 + i, by - 4 + (i > 14 ? -(i - 14) : 0), 1, 4 - (i > 14 ? 1 : 0), i % 3 ? '#c8b070' : '#b8a060');
  R(x + 13, by - 12, 5, 9, '#c8b070'); R(x + 13, by - 12, 5, 1, '#d8c890');
  line(x + 14, by - 12, x + 12, by - 20 + bob, '#b8a060'); line(x + 17, by - 12, x + 19, by - 20 - bob, '#b8a060');
  disc(x + 12, by - 20 + bob, 2, '#ffffff'); disc(x + 19, by - 20 - bob, 2, '#ffffff'); R(x + 12, by - 20 + bob, 1, 1, INK); R(x + 19, by - 20 - bob, 1, 1, INK);
  R(x + 14, by - 7, 3, 1, '#5a3a20');
  for (let r = 8; r > 0; r -= 2) disc(x + 4, by - 10, r, r % 4 === 0 ? '#8a5a34' : '#b07a44'); // a spiral shell and a wise little mustache
  R(x + 4, by - 10, 1, 1, '#3a2010'); line(x + 4, by - 10, x + 8, by - 14, '#6a3a1a');
  R(x + 13, by - 9, 4, 1, '#f4efe0');
}
SETS.c4Can = { bg: () => { c4CanBg(); c4Glow(110, 70, 120, '255,140,60', 0.15); g.save(); g.translate(160, 2); g.scale(0.66, 0.66); g.translate(-160, 0); c4CanClose(clock - (C4.canAt || clock), C4.canPhase || 0); g.restore(); }, fg: () => {} };

// =====================================================================
//  REVEAL: THE RIFLE
// =====================================================================
function c4Rifle(t) {
  g.drawImage(c4Bake('caseBg', LW, LH, px => { c4Grad(px, 0, 0, LW, LH, ['#0a0614', '#140a24', '#1a0e2a', '#0e0818']);
    for (let i = 0; i < 80; i++) px(Math.round(c4Hash(i * 13) * LW), Math.round(c4Hash(i * 17) * LH), 1, 1, '#3a2a5a'); }), 0, 0);
  R(10, 52, 300, 108, '#2a1a10'); R(12, 54, 296, 104, '#4a1426'); for (let y = 58; y < 156; y += 4) R(14, y, 292, 1, '#3e1020');
  R(10, 52, 300, 3, '#8a6a3a'); R(10, 157, 300, 3, '#5a3a1a'); R(10, 52, 3, 108, '#6a4a2a'); R(307, 52, 3, 108, '#6a4a2a');
  for (const x of [30, 160, 290]) { R(x - 3, 50, 6, 6, '#c9a040'); R(x - 2, 51, 4, 1, '#ffe8a0'); }
  const sweep = ((t * 0.45) % 1.6) * 360 - 40, y0 = 106;
  const S = (x, y, w, h, c) => R(x, y0 + y, w, h, c);
  S(26, -6, 6, 18, '#0e0e12'); S(24, -6, 3, 18, '#2a2a34'); S(32, -8, 40, 4, '#1a1a22'); S(32, 6, 40, 4, '#1a1a22'); S(32, -4, 4, 10, '#1a1a22');
  S(44, -4, 14, 10, '#0c0c10'); S(46, -2, 10, 6, '#24242e'); S(58, -12, 22, 5, '#1a1a22'); S(58, -12, 22, 1, '#3a3a48');
  S(72, -8, 22, 18, '#16161e'); S(72, -8, 22, 2, '#3a3a48');
  S(86, 10, 9, 18, '#16161e'); S(84, 24, 12, 4, '#16161e'); for (let j = 12; j < 26; j += 2) for (let i = 87; i < 94; i += 2) R(i + (j % 4 ? 1 : 0), y0 + j, 1, 1, '#2e2e3a');
  S(94, 10, 4, 1, '#5a5a68'); S(96, 11, 2, 7, '#5a5a68'); S(92, 18, 6, 1, '#5a5a68'); S(91, 12, 2, 5, '#c8c8d4');
  S(94, -10, 70, 20, '#3a3e48'); S(94, -10, 70, 2, '#8a92a4'); S(94, 8, 70, 2, '#1e2028'); S(94, -6, 70, 1, '#5a6070');
  S(120, -6, 18, 6, '#14161c'); S(122, -5, 14, 4, '#c8a040'); S(122, -5, 14, 1, '#ffe8a0');
  S(142, -8, 3, 10, '#7a8090'); S(140, 2, 7, 4, '#7a8090'); disc(147, y0 + 5, 3, '#9aa2b4'); R(146, y0 + 4, 1, 1, '#ffffff');
  S(102, 10, 16, 6, '#2a2e36'); S(104, 16, 12, 16, '#1e2028'); S(104, 16, 12, 1, '#4a5060'); S(106, 22, 8, 1, '#4a5060'); S(104, 32, 12, 2, '#14161c');
  for (let i = 0; i < 5; i++) S(98 + i * 12, -2, 6, 1, '#2a2e36');
  S(100, -30, 92, 10, '#1a1c24'); S(100, -30, 92, 2, '#6a7284'); S(100, -22, 92, 2, '#0e1014'); S(100, -27, 92, 1, '#3a404e');
  S(92, -32, 12, 14, '#1a1c24'); S(92, -32, 12, 2, '#6a7284');
  S(186, -36, 20, 22, '#1a1c24'); S(186, -36, 20, 2, '#7a8296'); S(206, -34, 3, 18, '#2a2e3a');
  for (let j = 0; j < 14; j++) { const w = Math.round(7 * Math.sqrt(1 - Math.pow((j - 7) / 7.5, 2))); R(209, y0 - 32 + j, w, 1, j < 5 ? '#6ad0ff' : j < 10 ? '#3a90d8' : '#2a5aa8'); }
  R(210, y0 - 30, 2, 2, '#ffffff');
  S(136, -40, 10, 10, '#2a2e3a'); S(136, -40, 10, 2, '#9aa2b4'); for (let i = 0; i < 4; i++) S(137 + i * 2, -38, 1, 6, '#5a6070');
  S(146, -26, 8, 4, '#2a2e3a'); S(118, -40, 8, 10, '#2a2e3a'); S(118, -40, 8, 2, '#9aa2b4');
  S(124, -36, 2, 2, Math.floor(clock * 2) % 2 ? '#ff3b30' : '#6a1a14');
  S(110, -20, 10, 10, '#2a2e3a'); S(168, -20, 10, 10, '#2a2e3a'); S(110, -20, 10, 2, '#7a8296'); S(168, -20, 10, 2, '#7a8296');
  S(164, -6, 90, 8, '#2a2e36'); S(164, -6, 90, 1, '#8a92a4'); for (let x = 168; x < 250; x += 6) S(x, -3, 4, 1, '#14161c');
  S(164, 2, 50, 6, '#3a3e48'); S(164, 2, 50, 1, '#6a7284'); S(176, 8, 30, 2, '#14161c');
  for (let x = 166; x < 212; x += 4) S(x, 0, 2, 2, '#14161c');
  S(254, -8, 34, 12, '#1e2028'); S(254, -8, 34, 2, '#6a7284'); for (let x = 258; x < 286; x += 5) S(x, -6, 1, 8, '#3a3e48');
  S(288, -6, 8, 8, '#2a2e36'); S(290, -4, 2, 2, '#0a0a0e'); S(293, -4, 2, 2, '#0a0a0e');
  line(214, y0 + 8, 240, y0 + 16, '#2a2e36'); line(216, y0 + 9, 244, y0 + 14, '#5a6070'); R(240, y0 + 15, 4, 2, '#16161e');
  for (let i = 0; i < 6; i++) R(98 + i * 4, y0 + 2 + (i % 2), 2, 1, '#c9a040'); disc(110, y0, 2, '#3ab4c8'); R(110, y0 - 1, 1, 1, '#a8f0ff');
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) { const x = Math.round(sweep + i - 9), a = 0.14 * (1 - Math.abs(i - 9) / 9); g.fillStyle = `rgba(200,220,255,${a})`; g.fillRect(x, y0 - 44, 2, 80); }
  g.globalCompositeOperation = 'source-over';
  for (const [gx, gy, ph] of [[209, -31, 0], [136, -39, 1.7], [147, 4, 3.1], [96, -31, 4.4]]) { const tw = (Math.sin(clock * 3 + ph) + 1) / 2; if (tw > 0.75) { R(gx - 2, y0 + gy, 5, 1, '#ffffff'); R(gx, y0 + gy - 2, 1, 5, '#ffffff'); } }
  for (let i = 0; i < 12; i++) { const px = 60 + i * 18, py = 146; R(px, py, 12, 1, '#c8c8d4'); R(px, py - 1, 2, 3, '#a8f0a0'); R(px + 6, py - 1, 3, 3, '#3a8a4a'); R(px + 10, py - 2, 3, 5, '#e8e0c8'); R(px + 12, py - 2, 1, 5, '#c03040'); }
  R(130, 128, 60, 10, '#c9a040'); R(130, 128, 60, 1, '#ffe8a0'); signText('OLD SAL', 160, 131, '#3a2010');
}
const C4 = { canAt: 0, canPhase: 0, rifleAt: 0, caseOpen: false }, C4_CASE = 2; // ch4Rifle line where the velvet case opens
SETS.c4Rifle = { bg: () => (cutLine < C4_CASE ? SETS.c4Camp.bg() : c4Framed('#0a0614', 0.86, -16, () => c4Rifle(clock - (C4.rifleAt || clock)))), fg: () => {} };

// =====================================================================
//  CUTSCENES
// =====================================================================
CUTS.ch4Arrive = {
  set: 'c4Canyon', actors: [], tune: 'c4mystic',
  lines: [
    ['narr', 'YOU SPEND ALL DAY SHREDDIN\' THE DESERT: GRINDIN\' SICK RAILS AND FLIPPIN\' SWEET TORTOISE SHELLS.'],
    ['narr', 'BY NIGHTFALL THE TORTOISE IS SNORING, YOUR LEGS ARE JELLY, AND THE CANYON IS FULL OF STARS.'],
    ['narr', 'THEN YOU SEE IT: A LONE CAMPFIRE, FLICKERING IN THE DARK.'],
    ['narr', 'ITS RHYTHMIC WAVES PUT YOU IN A SORT OF TRANCE. THIS IS A HOLY PLACE.'],
    ['narr', 'BESIDE IT, AN OLD MAN IS SITTING CROSS-LEGGED... THREE FEET OFF THE GROUND.'],
  ],
};
CUTS.ch4Shaman = {
  set: 'c4Camp', actors: [], tune: 'c4mystic',
  lines: [
    ['shaman', 'SIT, TRAVELER. THE FIRE HAS BEEN EXPECTING YOU.'],
    ['shaman', 'THE WIND SPEAKS OF A MAN WHO WAS BETRAYED. HE SEEKS JUSTICE IN A CROOKED WORLD.'],
    ['shaman', 'IN THIS DESERT LIVES A RARE SNAIL. FROM ITS SHELL COMES A TRANQUILIZER SO POTENT IT COULD PUT A BUFFALO TO SLEEP FOR A WEEK.'],
    ['shaman', 'AS IT HAPPENS... ONE SUCH SNAIL LIVES IN THIS TIN CAN, RIGHT HERE.'],
  ],
};
CUTS.ch4Can = {
  set: 'c4Can', actors: [], tune: 'c4mystic',
  start() { C4.canAt = clock; C4.canPhase = 0; },
  after() { const p = cutLine >= 4 ? 2 : cutLine >= 1 ? 1 : 0; if (p !== C4.canPhase) { C4.canPhase = p; C4.canAt = clock; if (p === 1) tone('triangle', 520, 380, 0.25, 0.06); if (p === 2) [880, 1175, 1320].forEach((f, i) => setTimeout(() => tone('sine', f, f, 0.2, 0.05), i * 90)); } },
  lines: [
    ['shaman', 'SHMOODLE. WE HAVE A GUEST.'],
    ['narr', 'A TINY DOOR CREAKS OPEN. A SNAIL SLIDES OUT ONTO THE WELCOME MAT.'],
    ['snail', "OH! COMPANY. FORGIVE THE MESS, I WASN'T EXPECTIN' NOBODY."],
    ['snail', "THE OLD MAN SAYS YOU'RE THE ONE. I'VE BEEN SAVIN' THESE FOR A RAINY DAY. IT NEVER RAINS HERE."],
    ['snail', 'ONE DOZEN TRANQUILIZER DARTS. EXTRA STRENGTH. DON\'T LICK \'EM.'],
    ['snail', 'I FEEL LIKE THESE MAY COME IN HANDY TO YOU FOR SOME REASON.'],
  ],
};
CUTS.ch4Rifle = {
  set: 'c4Rifle', actors: [], tune: 'c4mystic',
  start() { C4.caseOpen = false; },
  after() { if (cutLine >= C4_CASE && !C4.caseOpen) { C4.caseOpen = true; C4.rifleAt = clock; noise(0.4, 0.15, 3000); [392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone('sine', f, f, 0.35, 0.05), 200 + i * 120)); } },
  lines: [
    ['shaman', 'OH. YOU PROBABLY NEED SOMETHING TO SHOOT THEM WITH.'],
    ['shaman', 'YOU CAN USE THIS. I USED IT IN MY HEYDAY... BUT IT IS JUST COLLECTING DUST NOW.'],
    ['narr', 'HE FLIPS OPEN A VELVET CASE. INSIDE IS A TRANQUILIZER RIFLE WITH A BRASS PLAQUE THAT READS "OLD SAL."'],
    ['shaman', "SAL WON'T LET YOU DOWN."],
  ],
};
CUTS.ch4Farewell = {
  set: 'c4Camp', actors: [], tune: 'c4mystic',
  lines: [
    ['shaman', 'YOUR PATH WILL GUIDE YOU TO WHERE YOU SEEK, TRAVELER...'],
    ['shaman', '... SOME DAY.'],
    ['shaman', 'ALSO... I AM NOT SURE THIS IS IMPORTANT...'],
    ['shaman', 'BUT THE BIG BOSS OF THE PB&J RAILROAD, MR. MCGRUDDER, IS JUST OVER THAT HILL. IN THE TRAIN DEPOT.'],
    ['shaman', 'GOOD LUCK, TRAVELER.'],
    ['snail', 'YA, GOOD LUCK.'],
  ],
};
// the dialog portrait keeps his eyes closed too, except when he looks your way
const c4BasePortrait = portrait;
portrait = function (who, X, Y, talking) {
  c4BasePortrait(who, X, Y, talking);
  if (who !== 'shaman') return;
  const e = c4Eyes(), S = 6, sk = CHARS.shaman.skin, lid = ex => { rect(X + ex * S, Y + 10 * S, 2 * S, 2 * S, sk); rect(X + ex * S, Y + 11 * S, 2 * S, S, INK); };
  if (e === 'closed') { lid(8); lid(14); } else if (e === 'one') lid(8);
};

// =====================================================================
//  CHAPTER 4 TITLE + END
// =====================================================================
SCENES.ch4Title = {
  tune: 'c4mystic',
  world() { c4CanyonNight(196); },
  ui() {
    rect(0, 0, W, 132, 'rgba(6,4,20,0.5)');
    text('CHAPTER 4', W / 2, 18, 48, '#ffd23f', 'center');
    text("THE SHAMAN'S GIFT", W / 2, 82, 16, '#c8a8ff', 'center');
    if (Math.floor(clock * 2.5) % 2) text('CHOOSE YOUR BADGE', W / 2, 108, 16, '#ffffff', 'center');
    button(BTN.yellow, 'YELLOW BELLY'); button(BTN.deputy, 'DEPUTY'); button(BTN.gunslinger, 'GUNSLINGER');
    for (const k in BTN) if (bests[k]) text('BEST ' + bests[k], BTN[k].x + BTN[k].w / 2, 440, 16, '#ffd23f', 'center');
    smallBtn(TITLE_BTN, 'TITLE');
    fadeBlack(1 - this.t / 1.2);
  },
  tap(x, y) {
    if (this.t < 0.6) return;
    if (inBox(x, y, TITLE_BTN)) { toTitle(); return; }
    for (const k in BTN) if (inBox(x, y, BTN[k])) { sfx.blip(); startGame(k, STORY4); return; }
  },
};
SCENES.ch4End = {
  tune: 'c4mystic',
  enter() { saveBest(); },
  world() { c4CanyonNight(196); },
  ui() {
    dim(0.6); panel(170, 120, 620, 300);
    text('TO BE CONTINUED...', W / 2, 144, 32, '#ffd23f', 'center');
    text('THE PB&J DEPOT IS NO MORE', W / 2, 206, 16, '#c8a8ff', 'center');
    text('SCORE ' + score + '   DARTS LEFT ' + (C4D.darts ?? 0), W / 2, 244, 16, '#a8f0a0', 'center');
    text('NEXT: THE RECKONING', W / 2, 296, 16, '#ffffff', 'center');
    if (Math.floor(clock * 2.5) % 2 && this.t > 1) text('TAP FOR TITLE', W / 2, 360, 16, '#f3d18b', 'center');
    fadeBlack(1 - this.t / 1.2);
  },
  tap() { if (this.t > 1) toTitle(); },
  key() { this.tap(); },
};
const STORY4 = [{ cut: 'ch4Arrive' }, { cut: 'ch4Shaman' }, { cut: 'ch4Can' }, { cut: 'ch4Rifle' }, { cut: 'ch4Farewell' }, { cut: 'ch4Depot' }, { run: 'depot' }, { cut: 'ch4Quiet' }, { cut: 'ch4Office' }, { cut: 'ch4Upstairs' }, { cut: 'ch4Walk' }, { scene: 'ch4Boom' }, { cut: 'ch4Uhoh' }, { run: 'escape' }, { cut: 'ch4After' }, { cut: 'ch4Ride' }, { scene: 'ch4Sunrise' }, { scene: 'ch4End' }];

// =====================================================================
//  HOOKS: "CHAPTER 4 >" test button on the main title (under CHAPTER 3 >)
// =====================================================================

// =====================================================================
//  THE TRAIN DEPOT — night sniping with Old Sal.
//  Wide view: tap a spot to scope in. Each spot has its own fixed close-up
//  (a scaffold level, an office floor, a train car). Bandits patrol through
//  your crosshair; hit FIRE to put them to sleep. 12 darts, every shot counts.
// =====================================================================
const C4_ZONES = [ // depot coordinates; each spot's floor line, walk range and (inside) its windows
  { id: 'tower', kind: 'scaf', name: 'WATER TOWER', x0: 30, x1: 50, floor: 48 },
  { id: 'scaf3', kind: 'scaf', name: 'SCAFFOLD - TOP', x0: 199, x1: 311, floor: 58 },
  { id: 'scaf2', kind: 'scaf', name: 'SCAFFOLD - MIDDLE', x0: 199, x1: 311, floor: 86 },
  { id: 'scaf1', kind: 'scaf', name: 'SCAFFOLD - LOW', x0: 199, x1: 311, floor: 114 },
  { id: 'off2', kind: 'office', name: 'OFFICE - UPSTAIRS', x0: 101, x1: 183, floor: 91, wins: [[106, 78, 14, 12], [132, 78, 14, 12], [158, 78, 14, 12]] },
  { id: 'off1', kind: 'office', name: 'OFFICE - GROUND', x0: 101, x1: 183, floor: 125, wins: [[106, 112, 14, 12], [132, 112, 14, 12], [158, 112, 14, 12]] },
  { id: 'trainL', kind: 'train', name: 'WESTBOUND TRAIN', x0: 6, x1: 94, floor: 149, wins: [...[0, 1, 2, 3, 4, 5].map(i => [8 + 12 * i, 141, 7, 7]), [86, 136, 8, 8]] },
  { id: 'trainR', kind: 'train', name: 'EASTBOUND TRAIN', x0: 226, x1: 314, floor: 149, wins: [...[0, 1, 2, 3, 4, 5].map(i => [305 - 12 * i, 141, 7, 7]), [226, 136, 8, 8]] },
];
for (const z of C4_ZONES) { z.ylo = z.wins ? Math.min(...z.wins.map(w => w[1])) - 1 : z.floor - 12; z.yhi = z.wins ? Math.max(...z.wins.map(w => w[1] + w[3])) : z.floor; }
const C4_SNIPE = { // per badge: how many patrols, how fast they walk (depot px/s), how long they stop to look around
  yellow:     { n: 9, v: [4, 6],  pause: [1.6, 3.0] },
  deputy:     { n: 10, v: [6, 9],  pause: [1.0, 2.2] },
  gunslinger: { n: 12, v: [9, 13], pause: [0.5, 1.4] },
};
const C4D = {};
const C4_DARTS = 12, C4_CX = 160, C4_CY = 90, C4_SR = 80; // scope centre + radius (buffer px)
const C4_FIRE_BTN = { x: W - 186, y: H / 2 - 70, w: 170, h: 140 }, C4_OUT_BTN = { x: 16, y: H - 86, w: 210, h: 70 };

// ---------------- the wide view ----------------
function c4Lantern(x, y, len, ph) { // hangs from (x,y), swings in the breeze
  const a = Math.sin(clock * 1.3 + ph) * 0.28, lx = Math.round(x + Math.sin(a) * len), ly = Math.round(y + Math.cos(a) * len);
  line(x, y, lx, ly, '#2a2028'); c4Glow(lx, ly + 2, 16, '255,190,90', 0.32);
  R(lx - 2, ly, 5, 1, '#3a2a1a'); R(lx - 2, ly + 1, 5, 4, '#ffd46a'); R(lx - 1, ly + 2, 3, 2, '#fff4c8'); R(lx - 2, ly + 5, 5, 1, '#3a2a1a');
}
function c4Clouds(y0, alpha) {
  g.globalAlpha = alpha;
  for (let i = 0; i < 6; i++) {
    const w = 40 + (i * 23) % 40, x = Math.round(((i * 97 + clock * (3 + i % 3)) % 420) - 60), y = y0 + (i * 13) % 34;
    for (let k = 0; k < 4; k++) { const cx = x + k * w / 4, r = 5 + ((i + k) % 3) * 2; disc(Math.round(cx), y, r, '#2a3058'); R(Math.round(cx) - r + 1, y - r, r * 2 - 2, 1, '#6a74a8'); }
    R(x, y, w, 4, '#2a3058');
  }
  g.globalAlpha = 1;
}
function c4Loco(x, by, face, body, trim, cars) { // a locomotive (face = +1 nose right, -1 nose left) + one passenger car
  const H2 = (lx, ly, w, h, c) => R(face > 0 ? x + lx : x - lx - w, by + ly, w, h, c);
  // passenger car
  H2(-80, -30, 74, 24, cars); H2(-80, -30, 74, 2, '#c9a040'); H2(-80, -32, 74, 3, '#2a2028');
  for (let i = 0; i < 6; i++) H2(-76 + i * 12, -25, 7, 7, '#ffd46a');
  H2(-78, -6, 70, 2, '#1a1418'); for (const wx of [-72, -24]) { H2(wx, -6, 10, 6, '#2a2a30'); H2(wx + 3, -4, 4, 2, '#6a6a76'); }
  // locomotive: cab, boiler, smokestack, cowcatcher, headlamp
  H2(0, -34, 22, 28, body); H2(2, -30, 8, 8, '#ffd46a'); H2(0, -36, 24, 3, '#1a1418');
  H2(22, -24, 44, 18, body); H2(22, -24, 44, 2, trim); for (let i = 0; i < 3; i++) H2(28 + i * 12, -24, 2, 18, trim);
  H2(52, -36, 7, 12, '#1a1418'); H2(50, -38, 11, 3, '#2a2028'); H2(36, -30, 6, 6, trim);
  H2(66, -20, 6, 10, '#2a2028'); for (let i = 0; i < 4; i++) H2(66 + i, -10 + i * 0, 1, 10 - i * 2, '#5a5a66'); // cowcatcher
  H2(62, -28, 5, 5, '#fff4c8'); c4Glow(face > 0 ? x + 66 : x - 66, by - 26, 26, '255,240,180', 0.3);
  for (const wx of [4, 26, 44]) { disc(face > 0 ? x + wx + 5 : x - wx - 5, by - 4, 5, '#2a2a30'); disc(face > 0 ? x + wx + 5 : x - wx - 5, by - 4, 2, '#8a8a96'); }
  // a lazy curl of steam
  for (let i = 0; i < 4; i++) { const p = (clock * 0.2 + i / 4) % 1, sx = face > 0 ? x + 55 : x - 55; g.globalAlpha = 0.35 * (1 - p); disc(Math.round(sx + Math.sin(p * 5 + i) * 4), Math.round(by - 40 - p * 30), 2 + Math.round(p * 5), '#a8acc8'); g.globalAlpha = 1; }
}
function c4DepotWorld(sky = true) {
  if (sky) { g.drawImage(c4Sky(), 0, 0); c4Stars(); }
  if (sky) c4Moon(268, 26);
  c4Clouds(14, 0.85);
  // distant hills + a water tower
  for (let x = -100; x < 420; x += 2) { const h = 12 + Math.round(6 * Math.sin(x * 0.03) + 3 * Math.sin(x * 0.11)); R(x, 98 - h, 2, h + 4, '#1a1830'); }
  R(30, 62, 3, 36, '#141226'); R(46, 62, 3, 36, '#141226'); R(28, 50, 24, 14, '#1c1a32'); R(26, 48, 28, 3, '#141226'); line(30, 98, 49, 64, '#141226');
  R(47, 40, 1, 8, '#3a3040'); R(45, 47, 5, 1, '#3a3040'); R(45, 36, 5, 1, '#3a2a1a'); R(45, 37, 5, 3, Math.floor(clock * 7) % 5 ? '#ffd46a' : '#ffc040'); R(46, 38, 3, 1, '#fff4c8'); R(45, 40, 5, 1, '#3a2a1a'); c4Glow(47, 38, 18, '255,190,90', 0.35); // lantern on a stand
  // ground, gravel, rails
  R(-100, 100, 520, 80, '#1c1620'); for (let i = 0; i < 120; i++) R(Math.round(c4Hash(i * 7) * 520) - 100, 100 + Math.round(c4Hash(i * 11) * 78), 2, 1, i % 3 ? '#2a2230' : '#3a3040');
  for (const ry of [164, 172]) { R(-100, ry, 520, 2, '#5a5a6a'); R(-100, ry, 520, 1, '#8a8aa0'); }
  for (let x = -100; x < 420; x += 8) R(x, 162, 4, 12, '#2a1e18');
  // --- the modular office: two stacked tin units, outside stairs
  for (const [uy, h] of [[70, 32], [104, 32]]) {
    R(98, uy, 88, h, '#3a3e52'); for (let x = 100; x < 186; x += 4) R(x, uy, 1, h, '#2e3244'); R(98, uy, 88, 2, '#5a5e76'); R(98, uy + h - 2, 88, 2, '#22243a');
    for (let i = 0; i < 3; i++) { const wx = 106 + i * 26, lit = true; R(wx - 1, uy + 7, 16, 14, '#22243a'); R(wx, uy + 8, 14, 12, lit ? '#e8c06a' : '#3a3a58'); R(wx + 6, uy + 8, 1, 12, '#22243a'); if (lit) c4Glow(wx + 7, uy + 14, 14, '255,200,110', 0.12); }
  }
  R(186, 84, 2, 52, '#2a2a3a'); for (let i = 0; i < 8; i++) R(186 + i * 1.2, 136 - i * 4, 6, 1, '#4a4a60'); R(96, 68, 92, 3, '#22243a'); R(128, 58, 4, 10, '#4a4a60'); R(124, 56, 12, 3, '#4a4a60'); // stairs + vent
  signText('PB&J', 142, 60, '#c9a040');
  // --- the scaffolding: three levels of planks, poles, cross-bracing, a ladder
  for (let x = 198; x <= 312; x += 19) { R(x, 40, 2, 124, '#5a5466'); R(x, 40, 1, 124, '#7a7488'); }
  for (const z of C4_ZONES.filter(z => z.kind === 'scaf')) { R(196, z.floor, 120, 3, '#6e4a2a'); R(196, z.floor, 120, 1, '#9a7040'); R(196, z.floor - 12, 120, 1, '#5a5466'); }
  for (let i = 0; i < 6; i++) for (const [ya, yb] of [[61, 86], [89, 114], [117, 160]]) line(198 + i * 19, ya, 217 + i * 19, yb, '#3e3a4a');
  for (let y = 58; y < 164; y += 5) R(296, y, 8, 1, '#7a7488'); R(296, 58, 1, 106, '#7a7488'); R(303, 58, 1, 106, '#7a7488');
  // --- two trains, noses facing each other
  c4Loco(84, 166, 1, '#4a1e1e', '#c9a040', '#3a2a1e'); c4Loco(236, 166, -1, '#1e3a2e', '#c9a040', '#2a2a3a'); // noses almost touching, cars on screen
  // swinging lanterns
  c4Lantern(220, 40, 8, 0); c4Lantern(268, 64, 7, 1.7); c4Lantern(240, 92, 7, 3.1); c4Lantern(110, 70, 5, 2.2); c4Lantern(176, 104, 5, 4.4); c4Lantern(160, 124, 6, 5.0);
}
// scope mask: black outside the circle, a soft vignette inside
const c4ScopeMask = () => c4Bake('scopeMask', LW, LH, (px, x) => {
  x.fillStyle = '#000'; x.fillRect(0, 0, LW, LH);
  x.globalCompositeOperation = 'destination-out'; const gr = x.createRadialGradient(C4_CX, C4_CY, C4_SR - 14, C4_CX, C4_CY, C4_SR);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); x.fillStyle = gr; x.beginPath(); x.arc(C4_CX, C4_CY, C4_SR, 0, Math.PI * 2); x.fill();
});
function c4Reticle(iris) {
  const r = Math.round(C4_SR * iris);
  g.drawImage(c4ScopeMask(), 0, 0);
  if (iris < 1) { g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, LW, LH); g.arc(C4_CX, C4_CY, Math.max(1, r), 0, Math.PI * 2, true); g.fill('evenodd'); }
  // ring + reticle
  for (let a = 0; a < Math.PI * 2; a += 0.02) R(Math.round(C4_CX + Math.cos(a) * C4_SR), Math.round(C4_CY + Math.sin(a) * C4_SR), 1, 1, '#2a3a2a');
  R(C4_CX - C4_SR + 4, C4_CY, C4_SR - 10, 1, '#0a0a0a'); R(C4_CX + 6, C4_CY, C4_SR - 10, 1, '#0a0a0a'); R(C4_CX, C4_CY - C4_SR + 4, 1, C4_SR - 10, '#0a0a0a'); R(C4_CX, C4_CY + 6, 1, C4_SR - 10, '#0a0a0a');
  R(C4_CX - C4_SR + 4, C4_CY, 22, 1, '#000'); R(C4_CX + C4_SR - 26, C4_CY, 22, 1, '#000'); R(C4_CX - 1, C4_CY + C4_SR - 26, 3, 22, '#000'); // thick posts
  for (let i = 1; i < 6; i++) { R(C4_CX - 1, C4_CY + i * 10, 3, 1, '#0a0a0a'); R(C4_CX + i * 10, C4_CY - 1, 1, 3, '#0a0a0a'); R(C4_CX - i * 10, C4_CY - 1, 1, 3, '#0a0a0a'); } // mil-dots
  R(C4_CX, C4_CY, 1, 1, Math.floor(clock * 3) % 2 ? '#ff3b30' : '#c02018'); // the red dot
  // tech lights on the rim
  for (const [a, c, sp] of [[-2.4, '#3aff6a', 2.2], [-2.2, '#ff3b30', 3.7], [2.5, '#ffd23f', 1.4]]) { if (Math.floor(clock * sp) % 2) { const lx = Math.round(C4_CX + Math.cos(a) * (C4_SR + 6)), ly = Math.round(C4_CY + Math.sin(a) * (C4_SR + 6)); R(lx, ly, 2, 2, c); c4Glow(lx + 1, ly + 1, 5, c === '#3aff6a' ? '60,255,110' : c === '#ff3b30' ? '255,60,48' : '255,210,60', 0.6); } }
}

// ---------------- the level ----------------
// One world, two views. Every bandit has ONE position in depot coordinates; the wide view
// draws him as a tiny silhouette, the scope magnifies the exact same spot. Drag to aim.
const C4Z = 4, C4BS = 0.25;                 // scope magnification, bandit sprite scale in depot px (8px tall)
function c4WinHit(z, x, y) { return !z.wins || z.wins.some(([wx, wy, ww, wh]) => x >= wx && x <= wx + ww && y >= wy && y <= wy + wh); }
function c4BanditBox(b) { return { x: b.x - 3, y: b.zone.floor - 9, w: 6, h: 9 }; }
function c4Zzz(x, y, u) { // three big, clear Zs drifting up and growing, u = size of one Z-pixel
  const Zp = ['11111', '00010', '00100', '01000', '11111'];
  for (let i = 0; i < 3; i++) {
    const p = (clock * 0.45 + i / 3) % 1, sc = u * (i === 2 ? 2 : 1), zx = Math.round((x + p * 6 * 4 * u + i * 4 * u) / u) * u, zy = Math.round((y - p * 9 * 4 * u - i * 5 * u) / u) * u;
    g.globalAlpha = Math.min(1, (1 - p) * 1.6);
    for (let r2 = 0; r2 < 5; r2++) for (let c = 0; c < 5; c++) if (Zp[r2][c] === '1') R(zx + c * sc + u, zy + r2 * sc + u, sc, sc, '#0a0810'); // drop shadow
    for (let r2 = 0; r2 < 5; r2++) for (let c = 0; c < 5; c++) if (Zp[r2][c] === '1') R(zx + c * sc, zy + r2 * sc, sc, sc, '#e8f0ff');
  }
  g.globalAlpha = 1;
}
function c4DrawBandits(detail) {
  for (const b of C4D.bandits) {
    const z = b.zone, fy = z.floor;
    g.save();
    if (z.wins) { g.beginPath(); for (const [wx, wy, ww, wh] of z.wins) g.rect(wx, wy, ww, wh); g.clip(); } // inside: only seen through the glass
    if (!detail) { // the wide view: a faint silhouette
      if (b.asleep) { g.restore(); if (b.sleepT > 0.3 && b.sleepT < 6) c4Zzz(b.x, fy - 6, 1); continue; }
      else {
        const x = Math.round(b.x), step = b.moving && Math.floor(clock * 4 + b.seed) % 2;
        g.globalAlpha = 0.8; R(x - 1, fy - 7, 3, 5, '#0a0810'); R(x - 2, fy - 8, 5, 1, '#0a0810'); R(x - 1, fy - 9, 3, 1, '#0a0810');
        R(x - 1 + (step ? 1 : 0), fy - 2, 1, 2, '#0a0810'); R(x + 1 - (step ? 1 : 0), fy - 2, 1, 2, '#0a0810');
        if (Math.floor(clock * 1.5 + b.seed) % 5 === 0) { g.globalAlpha = 1; R(x + (b.dir > 0 ? 2 : -2), fy - 6, 1, 1, '#ff9a3a'); } // cigarette glow
      }
      g.restore(); continue;
    }
    // the scope view: the full sprite, at the same spot
    const spec = { ...b.spec, pose: b.asleep ? 'hit' : 'idle', step: b.moving && Math.floor(clock * 6 + b.seed) % 2 ? 1 : 0 };
    const img = getSprite(spec), sx = b.x - 10 * C4BS, sy = fy - 31 * C4BS;
    if (b.asleep) {
      const k = Math.min(1, b.sleepT * 2.5); g.globalAlpha = Math.max(0, 1 - Math.max(0, b.sleepT - 0.6) / 0.6); g.translate(b.x, fy); g.rotate(k * Math.PI / 2 * b.dir); g.translate(-b.x, -fy); blit(img, sx, sy, C4BS);
    } else if (b.dir < 0) { g.translate(sx * 2 + (GW + 2) * C4BS, 0); g.scale(-1, 1); blit(img, sx, sy, C4BS); }
    else blit(img, sx, sy, C4BS);
    g.restore();
    if (!b.asleep) for (const d of b.darts) R(b.x + d.x - 1, d.y, 1.5, 0.25, '#a8f0a0');
    if (b.asleep && b.sleepT > 0.3) c4Zzz(b.x + 1, fy - 4, 0.5);
  }
}
function c4AimPt() { return { x: C4D.ax + C4D.swX, y: C4D.ay + C4D.swY }; }
function c4ClampAim() { const z = C4D.zone; C4D.tx = Math.max(z.x0, Math.min(z.x1, C4D.tx)); C4D.ty = Math.max(z.ylo, Math.min(z.yhi, C4D.ty)); }
function c4Shoot() {
  if (!C4D.zone || C4D.cd > 0 || state !== 'play') return;
  if (C4D.darts <= 0) { sfx.empty(); return; }
  C4D.darts--; C4D.cd = 0.55; shots++; C4D.kick = 1; C4D.btnT = 0.15;
  noise(0.08, 0.35, 1400); tone('sine', 220, 90, 0.18, 0.12); // pfft
  const a = c4AimPt();
  for (const b of C4D.bandits) if (!b.asleep && c4WinHit(b.zone, a.x, a.y) && inBox(a.x, a.y, c4BanditBox(b))) {
    b.asleep = true; b.sleepT = 0; b.darts.push({ x: a.x - b.x, y: a.y }); hits++; targets++; S.n.outlaw++;
    const left = C4D.bandits.filter(o => !o.asleep).length;
    addScore(300 + Math.round(C4D.darts * 25), 'outlaw'); popText(160, 52, left ? 'NIGHTY NIGHT! ' + left + ' TO GO' : 'ALL ASLEEP!');
    setTimeout(() => tone('triangle', 330, 165, 0.4, 0.05), 250); return;
  }
  C4D.misses.push({ x: a.x, y: a.y }); if (Math.random() < 0.5) sfx.ricochet();
  popText(160, 52, C4D.darts ? 'MISSED! ' + C4D.darts + ' DARTS LEFT' : 'OUT OF DARTS!');
}
function c4ZoneAt(x, y) { // tap in depot coords -> nearest spot
  let best = null, bd = 1e9;
  for (const z of C4_ZONES) { const dx = Math.max(z.x0 - 4 - x, 0, x - z.x1 - 4), dy = Math.max(z.ylo - 3 - y, 0, y - z.yhi - 3), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = z; } }
  return bd < 14 * 14 ? best : null;
}
const C4_RETRY_BTN = { x: W / 2 - 140, y: 300, w: 280, h: 64 };
RUNS.depot = {
  c4: true, label: null, name: 'THE TRAIN DEPOT', title: 'THE TRAIN DEPOT', hint: 'TAP A SPOT TO SCOPE IN. DRAG TO AIM. PUT EVERY PATROL TO SLEEP.', tune: 'c4mystic',
  hurtText: { darts: { title: 'OUT OF DARTS!', reason: 'MAKE EVERY SHOT COUNT.', color: '#ff9a3a' } },
  reset() {
    const cfg = C4_SNIPE[diff.key] || C4_SNIPE.deputy, zs = [...C4_ZONES].sort(() => Math.random() - 0.5);
    Object.assign(C4D, { failed: false, failT: 0, zone: null, iris: 0, darts: C4_DARTS, cd: 0, kick: 0, swX: 0, swY: 0, btnT: 0, misses: [], doneT: 0, ax: 0, ay: 0, tx: 0, ty: 0, drag: null,
      bandits: Array.from({ length: cfg.n }, (_, i) => { const z = zs[i % zs.length]; return { zone: z, spec: { ...OUTLAWS[i % OUTLAWS.length] }, x: z.x0 + 4 + Math.random() * (z.x1 - z.x0 - 8), dir: Math.random() < 0.5 ? -1 : 1,
        v: cfg.v[0] + Math.random() * (cfg.v[1] - cfg.v[0]), pause: 0, pauseR: cfg.pause, moving: true, asleep: false, sleepT: 0, darts: [], seed: Math.random() * 9 }; }) });
    { const tw = C4_ZONES.find(z => z.id === 'tower'); if (!C4D.bandits.some(b => b.zone === tw)) { const b = C4D.bandits[0]; b.zone = tw; b.x = 36; } } // always a lookout on the water tower
    ammo = 6;
  },
  tick(dt) {
    for (const b of C4D.bandits) {
      if (b.asleep) { b.sleepT += dt; continue; }
      if (b.pause > 0) { b.pause -= dt; b.moving = false; if (b.pause <= 0 && Math.random() < 0.5) b.dir *= -1; continue; }
      const z = b.zone; b.moving = true; b.x += b.dir * b.v * dt;
      if (b.x < z.x0 + 2 || b.x > z.x1 - 2) { b.dir *= -1; b.x = Math.max(z.x0 + 2, Math.min(z.x1 - 2, b.x)); }
      if (Math.random() < dt * 0.35) b.pause = b.pauseR[0] + Math.random() * (b.pauseR[1] - b.pauseR[0]); // stop and look around
    }
  },
  update(dt) {
    if (C4D.failed) { C4D.failT = (C4D.failT || 0) + dt; return; }
    ammo = 6; this.tick(dt);
    C4D.cd = Math.max(0, C4D.cd - dt); C4D.kick = Math.max(0, C4D.kick - dt * 3); C4D.btnT = Math.max(0, C4D.btnT - dt);
    C4D.iris = C4D.zone ? Math.min(1, C4D.iris + dt * 4) : 0;
    const k = Math.min(1, dt * 18); C4D.ax += (C4D.tx - C4D.ax) * k; C4D.ay += (C4D.ty - C4D.ay) * k; // quick, smooth follow
    C4D.swX = Math.sin(clock * 0.9) * 0.35; C4D.swY = Math.sin(clock * 1.3 + 1) * 0.3 - C4D.kick * 1.5; // breathing + recoil
    const awake = C4D.bandits.filter(b => !b.asleep).length;
    if (!awake) C4D.doneT += dt;
    else if (C4D.darts <= 0 && C4D.cd <= 0 && !C4D.failed) { C4D.failed = true; C4D.zone = null; C4D.drag = null; sfx.hurt(); }
  },
  done() { return C4D.doneT > 1.6; },
  shoot() { return true; },
  press(x, y) {
    if (state !== 'play') return;
    if (C4D.failed) { if (C4D.failT > 0.6 && inBox(x, y, C4_RETRY_BTN)) { sfx.blip(); resetRun(); } return; }
    if (!C4D.zone) {
      const wx = x / P, wy = y / P, z = c4ZoneAt(wx, wy);
      if (z) { C4D.zone = z; C4D.iris = 0; C4D.tx = wx; C4D.ty = wy; c4ClampAim(); C4D.ax = C4D.tx; C4D.ay = C4D.ty; C4D.drag = { id: RIDE.lastPointer, x, y }; noise(0.1, 0.12, 5000); tone('sine', 1200, 1600, 0.06, 0.03); } // keep holding to aim
      return;
    }
    if (inBox(x, y, C4_FIRE_BTN)) return c4Shoot();
    if (inBox(x, y, C4_OUT_BTN)) { C4D.zone = null; C4D.drag = null; tone('sine', 1600, 1200, 0.06, 0.03); return; }
    C4D.drag = { id: RIDE.lastPointer, x, y, t0: performance.now(), moved: 0, tap: true }; // anywhere else: grab the scope; a quick tap fires
  },
  key(k) {
    if (k === ' ' || k === 'f' || k === 'enter') { c4Shoot(); return true; }
    if (k === 'escape' || k === 'backspace' || k === 'z') { C4D.zone = null; return true; }
    if (C4D.zone && ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'].includes(k)) {
      C4D.tx += (k === 'arrowleft' || k === 'a') ? -4 : (k === 'arrowright' || k === 'd') ? 4 : 0; C4D.ty += (k === 'arrowup' || k === 'w') ? -2 : (k === 'arrowdown' || k === 's') ? 2 : 0; c4ClampAim(); return true;
    }
    return false;
  },
  draw() {
    if (!C4D.zone) { c4DepotWorld(); c4DrawBandits(false); return; }
    const a = c4AimPt();
    g.save(); R(0, 0, LW, LH, '#06081a');
    g.translate(C4_CX, C4_CY); g.scale(C4Z, C4Z); g.translate(-a.x, -a.y); // the same depot, magnified around your aim
    c4DepotWorld(); c4DrawBandits(true);
    for (const m of C4D.misses) { R(m.x - 0.75, m.y, 1.5, 0.25, '#a8f0a0'); R(m.x + 0.5, m.y - 0.25, 0.5, 0.75, '#e8e0c8'); }
    g.restore();
    g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(190,230,200,1)'; g.fillRect(0, 0, LW, LH); g.globalCompositeOperation = 'source-over';
    c4Reticle(C4D.iris);
  },
  ui() {
    if (!['intro', 'play'].includes(state)) return;
    const awake = C4D.bandits.filter(b => !b.asleep).length;
    if (C4D.failed) { // out of darts: restart screen
      dim(0.65); panel(W / 2 - 300, 130, 600, 270);
      text('OUT OF DARTS!', W / 2, 156, 32, '#ff9a3a', 'center');
      text("YOU DIDN'T GET ALL THE TARGETS.", W / 2, 218, 16, '#ffffff', 'center');
      text(awake + (awake === 1 ? ' PATROL IS' : ' PATROLS ARE') + ' STILL AWAKE.', W / 2, 250, 16, '#f3d18b', 'center');
      if (C4D.failT > 0.6) smallBtn(C4_RETRY_BTN, 'RESTART');
      return;
    }
    if (!C4D.zone) {
      if (state === 'play' && Math.floor(clock * 2) % 2) text('TAP A SPOT TO SCOPE IN', W / 2, H - 40, 16, '#c8e0ff', 'center');
      return;
    }
    const G = '#5aff8a';
    text(C4D.zone.name, 24, 18, 16, G); text('RNG ' + Math.round(120 + (180 - C4D.zone.floor) * 2.4) + ' YD', 24, 44, 16, G);
    text('WIND 2 MPH W', 24, 70, 16, G); text('AWAKE ' + awake, W - 24, 18, 16, awake ? '#ffd23f' : G, 'right');
    if (!C4D.drag && Math.floor(clock * 1.5) % 2) text('DRAG TO AIM', W / 2, H - 34, 16, '#5aff8a', 'center');
    ctx.globalAlpha = 0.92;
    const f = C4_FIRE_BTN, ready = C4D.cd <= 0 && C4D.darts > 0;
    panel(f.x, f.y, f.w, f.h, C4D.btnT > 0 ? '#6a1a14' : '#3a2010');
    text('FIRE', f.x + f.w / 2, f.y + 40, 24, ready ? '#ff6a4a' : '#7a4a3a', 'center'); text(C4D.darts + ' LEFT', f.x + f.w / 2, f.y + 86, 16, '#a8f0a0', 'center');
    smallBtn(C4_OUT_BTN, '< ZOOM OUT');
    ctx.globalAlpha = 1;
  },
};
// dragging the scope (mouse button held, or a finger down)
cv.addEventListener('pointermove', e => {
  const d = C4D.drag; if (!d || e.pointerId !== d.id || !C4D.zone) return;
  const m = toGame(e); d.moved = (d.moved || 0) + Math.abs(m.x - d.x) + Math.abs(m.y - d.y); C4D.tx += (m.x - d.x) / P * 0.7; C4D.ty += (m.y - d.y) / P * 0.7; d.x = m.x; d.y = m.y; c4ClampAim();
});
cv.addEventListener('pointerup', e => {
  const d = C4D.drag; if (!d || e.pointerId !== d.id) return;
  C4D.drag = null;
  if (d.tap && performance.now() - d.t0 < 250 && d.moved < 18) c4Shoot(); // short tap (not a press-and-hold or a drag) = FIRE
});
cv.addEventListener('pointercancel', () => { C4D.drag = null; });
const c4BaseCross = drawCrosshair; drawCrosshair = function () { if (run === RUNS.depot && C4D.zone && ['intro', 'play'].includes(state)) return; c4BaseCross(); }; // the scope IS the crosshair
Object.assign(HURT, { darts: RUNS.depot.hurtText.darts });
Object.assign(EPITAPHS, { darts: [['RUSTY!!'], ['HE RAN OUT', 'OF DARTS.'], ['SHMOODLE IS', 'DISAPPOINTED.'], ['SAL LET HIM', 'DOWN. NO, HE', 'LET SAL DOWN.']] });

// input + side panel (Sal's darts instead of the revolver)
window.addEventListener('pointerdown', e => {
  if (e.target !== cv || paused || !(run && run.c4) || !['intro', 'play', 'clear'].includes(state)) return;
  const m = toGame(e);
  if (canPause() && inBox(m.x, m.y, PAUSE_BTN)) return;
  e.stopPropagation(); e.preventDefault(); audio();
  mouse = m; touchMode = e.pointerType !== 'mouse'; lastTap = performance.now();
  run.press(m.x, m.y);
}, true);
const c4BaseDraw2 = draw;
draw = function () {
  c4BaseDraw2();
  if (run && run.c4 && ['intro', 'play', 'clear', 'hurt'].includes(state)) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(SW, 0);
    const a = AMMO_BOX; rect(a.x - 14, a.y - 48, a.w + 28, a.h + 60, INK); panel(a.x - 6, a.y - 6, a.w + 12, a.h + 12);
    text('DARTS', a.x + a.w / 2, a.y + 12, 16, '#a8f0a0', 'center');
    for (let i = 0; i < C4_DARTS; i++) { const dx = a.x + 14 + (i % 4) * 28, dy = a.y + 46 + Math.floor(i / 4) * 26, on = i < C4D.darts;
      rect(dx, dy, 22, 3, on ? '#c8c8d4' : '#3a2a20'); rect(dx, dy - 3, 5, 9, on ? '#a8f0a0' : '#3a2a20'); rect(dx + 18, dy - 5, 6, 13, on ? '#e8e0c8' : '#3a2a20'); }
    ctx.restore();
  }
};

// ---------------- cutscenes around the level ----------------
SETS.c4DepotView = { bg: () => { g.drawImage(c4Sky(), 0, 0); c4Stars(); c4Moon(276, 22); g.save(); g.translate(160, 4); g.scale(0.62, 0.62); g.translate(-160, 0); c4DepotWorld(false); g.restore(); }, fg: () => {} };
CUTS.ch4Depot = {
  set: 'c4DepotView', actors: [], tune: 'c4mystic',
  lines: [
    ['narr', 'YOU CREST THE HILL ON YOUR BELLY, SLOW AS A SNAIL. SHMOODLE WOULD BE PROUD.'],
    ['narr', 'BELOW YOU SPRAWLS THE PB&J RAILROAD DEPOT: A TANGLED WEB OF STEEL SCAFFOLDING, TIN OFFICES AND SLEEPING IRON HORSES.'],
    ['narr', 'TWO LOCOMOTIVES SIT NOSE TO NOSE IN THE YARD, STEAM CURLING FROM THEIR STACKS LIKE THEY\'RE WAITING FOR A DUEL.'],
    ['narr', 'LANTERNS CREAK IN THE NIGHT WIND. UP IN THE RAFTERS, SHADOWS PACE BACK AND FORTH. MCGRUDDER\'S MEN.'],
    ['narr', 'YOU SETTLE OLD SAL AGAINST A ROCK AND COUNT YOUR DARTS. TWELVE. MAKE THEM COUNT.'],
  ],
};

// =====================================================================
//  INSIDE THE PB&J OFFICE: a lamp-lit desk, the bottom drawer pulled open
// =====================================================================
const C4DESK = { openAt: 0 };
function c4DeskArt() {
  const open = Math.min(1, Math.max(0, (clock - C4DESK.openAt) / 0.8)), find = cutLine >= 2;
  // back wall: tin panels, a framed railroad map, a wall calendar, a window onto the night
  g.drawImage(c4Bake('officeWall', LW, 96, px => {
    c4Grad(px, 0, 0, LW, 96, ['#2a2236', '#342a40', '#3c3046', '#2e2638']);
    for (let x = 0; x < LW; x += 12) px(x, 0, 1, 96, '#241c2e');
    px(0, 92, LW, 4, '#4a3020'); px(0, 92, LW, 1, '#6e4a2a'); // chair rail
  }), 0, 0);
  // window (moonlight + stars), with a sleeping bandit's hat silhouette on the sill outside
  R(232, 14, 64, 48, '#1a1418'); R(235, 17, 58, 42, '#141a40'); for (let i = 0; i < 12; i++) R(236 + Math.round(c4Hash(i * 5) * 56), 18 + Math.round(c4Hash(i * 7) * 30), 1, 1, '#c8d0f0');
  disc(282, 26, 5, '#e8e4d0'); R(263, 17, 2, 42, '#1a1418'); R(235, 37, 58, 2, '#1a1418');
  g.globalAlpha = 0.18; for (let j = 0; j < 30; j++) R(226 - j * 2, 62 + j * 2, 52, 2, '#a8b8ff'); g.globalAlpha = 1; // moonbeam across the room
  // framed map of the PB&J line
  R(30, 12, 92, 54, '#5a3a1a'); R(33, 15, 86, 48, '#d8c8a0');
  line(38, 54, 60, 40, '#8a1f1a'); line(60, 40, 84, 44, '#8a1f1a'); line(84, 44, 112, 22, '#8a1f1a');
  for (const [mx, my] of [[38, 54], [60, 40], [84, 44], [112, 22]]) { R(mx - 1, my - 1, 3, 3, INK); }
  signText('PB&J', 76, 18, '#3a2010'); R(100, 46, 14, 10, '#c9a040'); // a big gold claim stamped on the canyon
  // calendar
  R(140, 20, 22, 28, '#f4efe0'); R(140, 20, 22, 6, '#c0302b'); for (let i = 0; i < 12; i++) R(143 + (i % 4) * 5, 29 + Math.floor(i / 4) * 6, 3, 3, i === 6 ? '#c0302b' : '#8a8478');
  // the desk: big carved walnut, top lit warm by the lamp
  const DK = '#5a3418', DM = '#7a4a24', DL = '#9a6236', DD = '#3b2210';
  R(20, 96, 280, 8, DL); R(20, 96, 280, 2, '#c08050'); R(16, 104, 288, 3, DD); // desk top + lip
  R(24, 107, 96, 73, DM); R(200, 107, 96, 73, DM); R(120, 107, 80, 30, DK); // pedestals + knee well
  for (const px of [24, 200]) for (let i = 0; i < 3; i++) { const dy = 111 + i * 22; R(px + 4, dy, 88, 18, DK); R(px + 6, dy + 2, 84, 14, DM); R(px + 6, dy + 2, 84, 1, DL); R(px + 44, dy + 8, 8, 3, '#c9a040'); }
  // the right pedestal's bottom drawer slides open toward you
  const ox = 200, oy = 155, pull = Math.round(open * 18);
  R(ox + 2, oy - pull, 92, 26 + pull, '#1a0e08'); // the dark gap
  R(ox - 4, oy - 2 + pull, 100, 26, DM); R(ox - 4, oy - 2 + pull, 100, 2, DL); R(ox + 44, oy + 8 + pull, 8, 3, '#c9a040'); // drawer front
  // inside the drawer, seen from above: papers, the revolver, the gold watch
  if (open > 0.3) {
    const iy = oy - pull + 2, ih = pull + 6;
    g.save(); g.beginPath(); g.rect(ox + 2, iy, 92, ih); g.clip();
    R(ox + 2, iy, 92, ih, '#3a2414');
    R(ox + 6, iy + 2, 30, 20, '#e8e0c8'); for (let k = 0; k < 4; k++) R(ox + 9, iy + 5 + k * 4, 22, 1, '#8a8478'); // a ledger
    R(ox + 12, iy + 4, 20, 14, '#d8ccb0'); signText('DEED', ox + 22, iy + 7, '#8a1f1a');
    // YOUR revolver: blued steel, walnut grip, a notch you'd know anywhere
    R(ox + 40, iy + 6, 28, 4, '#4a4e5a'); R(ox + 40, iy + 6, 28, 1, '#9aa2b4'); R(ox + 54, iy + 4, 10, 8, '#5a5e6a'); disc(ox + 59, iy + 8, 3, '#3a3e48');
    R(ox + 62, iy + 9, 9, 9, '#7a4a20'); R(ox + 63, iy + 10, 2, 7, '#9a6236'); R(ox + 66, iy + 13, 1, 1, '#f4efe0');
    // the gold watch, lid open, chain curled
    disc(ox + 82, iy + 12, 6, '#c9a040'); disc(ox + 82, iy + 12, 5, '#f4efe0'); R(ox + 82, iy + 8, 1, 4, INK); R(ox + 82, iy + 12, 3, 1, INK); R(ox + 81, iy + 5, 3, 2, '#e2b33c');
    for (let k = 0; k < 10; k++) R(ox + 74 - k * 2, iy + 18 + Math.round(Math.sin(k) * 2), 1, 1, '#e2b33c');
    g.restore();
    if (find && Math.floor(clock * 3) % 2) { R(ox + 64, iy - 1, 1, 3, '#ffffff'); R(ox + 63, iy, 3, 1, '#ffffff'); R(ox + 86, iy + 5, 1, 3, '#ffffff'); R(ox + 85, iy + 6, 3, 1, '#ffffff'); } // glints
  }
  // on the desk: a green banker's lamp, a cigar smouldering in a tray, a ledger, an inkwell, a whiskey glass
  R(48, 84, 4, 12, '#c9a040'); R(42, 94, 16, 2, '#c9a040'); R(34, 78, 32, 7, '#2a6a3a'); R(34, 78, 32, 2, '#4a9a5a'); R(36, 85, 28, 1, '#fff4c8');
  c4Glow(50, 92, 70, '255,210,120', 0.35);
  R(140, 92, 14, 4, '#3a3e48'); R(146, 90, 10, 2, '#8a5a30'); R(155, 90, 1, 1, '#ff7a2a');
  for (let i = 0; i < 4; i++) { const p = (clock * 0.3 + i / 4) % 1; g.globalAlpha = 0.4 * (1 - p); disc(Math.round(156 + Math.sin(p * 6 + i) * 3), Math.round(88 - p * 30), 1 + Math.round(p * 3), '#a8a8b8'); g.globalAlpha = 1; }
  R(176, 88, 30, 8, '#6a1a1a'); R(176, 88, 30, 1, '#8a2a2a'); R(205, 88, 2, 8, '#e8e0c8'); // closed ledger
  R(218, 90, 6, 6, '#2a2a3a'); R(220, 86, 1, 6, '#f4efe0'); // inkwell + quill
  R(250, 86, 8, 10, 'rgba(200,220,230,0.5)'); R(250, 91, 8, 5, '#c08030'); // whiskey
  // floorboards
  R(0, 180, LW, 0, DD);
  // a sliver of lamplight from the stairs up top-right, and the voices drifting down
  if (cutLine >= 3) for (let i = 0; i < 2; i++) { const p = (clock * 0.5 + i / 2) % 1; g.globalAlpha = 1 - p; signText(i ? '...' : '!?', Math.round(300 - p * 10), Math.round(10 + p * 8), '#ffd88a'); g.globalAlpha = 1; }
}
// the open drawer, close up (drawn large, above the dialog box)
function c4DrawerClose() {
  const k = Math.min(1, Math.max(0, (clock - C4DESK.openAt) / 0.8)), find = cutLine >= 2;
  R(0, 0, LW, LH, '#120a06');
  c4Glow(60, 0, 160, '255,200,110', 0.22); // lamplight spilling down from above
  // the drawer box in perspective: back wall, sides, floor (felt-lined), front lip at the bottom
  const L0 = 34, R0 = 286, T0 = 10, B0 = 108, pull = Math.round((1 - k) * 60);
  g.save(); g.translate(0, pull);
  R(L0 - 14, T0 - 6, R0 - L0 + 28, B0 - T0 + 22, '#5a3418');                          // drawer sides (outer)
  R(L0, T0, R0 - L0, B0 - T0, '#3a1a20'); for (let y = T0; y < B0; y += 3) R(L0, y, R0 - L0, 1, '#32161c'); // green-black felt
  R(L0 - 14, T0 - 6, R0 - L0 + 28, 6, '#7a4a24'); R(L0 - 14, T0 - 6, 14, B0 - T0 + 22, '#6e4224'); R(R0, T0 - 6, 14, B0 - T0 + 22, '#4a2a14');
  R(L0 - 14, B0, R0 - L0 + 28, 16, '#7a4a24'); R(L0 - 14, B0, R0 - L0 + 28, 2, '#9a6236'); R(152, B0 + 6, 16, 4, '#c9a040'); R(152, B0 + 6, 16, 1, '#ffe8a0'); // drawer front + brass pull
  // a stack of deeds and a ledger, top-left
  for (let i = 0; i < 4; i++) { R(L0 + 8 + i * 2, T0 + 8 - i, 74, 50, i === 3 ? '#f0e8d0' : '#d8ccb0'); }
  signText('DEED', L0 + 50, T0 + 12, '#8a1f1a', 2); for (let j = 0; j < 6; j++) R(L0 + 20, T0 + 28 + j * 4, 50, 1, '#8a8478');
  R(L0 + 56, T0 + 40, 14, 14, '#c0302b'); disc(L0 + 63, T0 + 47, 5, '#8a1f1a'); // wax seal
  c4Revolver(124, 20);
  // the gold pocket watch: lid flipped open, ticking second hand, chain trailing
  const wx = 82, wy = 82, sec = Math.floor(clock) % 12;
  disc(wx, wy, 15, '#a8801c'); disc(wx, wy, 14, '#e2b33c'); disc(wx, wy, 11, '#f4efe0'); R(wx - 1, wy - 17, 3, 3, '#e2b33c'); R(wx - 2, wy - 20, 5, 3, '#c9a040');
  for (let h = 0; h < 12; h++) R(Math.round(wx + Math.cos(h * 0.5236) * 9), Math.round(wy + Math.sin(h * 0.5236) * 9), 1, 1, INK);
  line(wx, wy, wx + 4, wy - 5, INK); line(wx, wy, wx - 6, wy + 1, INK); line(wx, wy, Math.round(wx + Math.cos(sec * 0.5236 - 1.57) * 8), Math.round(wy + Math.sin(sec * 0.5236 - 1.57) * 8), '#c0302b');
  disc(wx + 30, wy - 2, 13, '#a8801c'); disc(wx + 30, wy - 2, 12, '#e2b33c'); ring(wx + 30, wy - 2, 8, 7, '#c9a040'); signText('PB&J', wx + 30, wy - 5, '#8a5a1a'); // open lid, engraved initials
  for (let i = 0; i < 24; i++) R(Math.round(wx - 16 - i * 3), Math.round(wy + 4 + Math.sin(i * 0.7) * 4), 2, 1, i % 2 ? '#e2b33c' : '#c9a040'); // chain
  g.restore();
  if (find && k >= 1) for (const [sx, sy, ph] of [[200, 34, 0], [96, 66, 1.3], [232, 22, 2.6]]) { const tw = (Math.sin(clock * 4 + ph) + 1) / 2; if (tw > 0.6) { R(sx - 2, sy, 5, 1, '#ffffff'); R(sx, sy - 2, 1, 5, '#ffffff'); } } // glints
  if (cutLine >= 3) { g.globalAlpha = 0.25 + Math.sin(clock * 3) * 0.1; R(0, 0, LW, 4, '#ffd88a'); g.globalAlpha = 1; } // a line of light from upstairs
}

// =====================================================================
//  YOUR REVOLVER: a single-action six-shooter, side profile, muzzle left.
//  Scanline-filled polygons with an ink outline, so it stays crisp pixel art.
// =====================================================================
Object.assign(GLYPH, { M: ['10001', '11011', '10101', '10001', '10001'] });
function c4Poly(pts, col) { // fill a polygon row by row (pixel-crisp)
  const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const xs = [], yy = y + 0.5;
    for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + (yy - ay) / (by - ay) * (bx - ax)); }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if (b > a) R(a, y, b - a, 1, col); }
  }
}
function c4PolyInk(pts, col) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c4Poly(pts.map(([x, y]) => [x + dx, y + dy]), INK); c4Poly(pts, col); }
function c4Revolver(ox, oy) {
  const P2 = (pts) => pts.map(([x, y]) => [ox + x, oy + y]);
  const BL = '#2c3140', BM = '#3e4558', BH = '#6a7590', BS = '#a8b4cc', CASE = '#5a4e6a', BRASS = '#c9a040', BRL = '#f0d070';
  // --- grip first (sits behind the frame): plow-handle walnut, brass backstrap + butt
  c4PolyInk(P2([[104, 30], [114, 28], [122, 40], [130, 62], [134, 76], [126, 80], [112, 78], [106, 62], [102, 44]]), BRASS);   // backstrap/butt (brass)
  c4Poly(P2([[105, 33], [112, 31], [119, 42], [126, 62], [129, 74], [124, 76], [113, 74], [108, 60], [104, 44]]), '#6a3a18'); // walnut panel
  for (let k = 0; k < 7; k++) { const t = k / 7; c4Poly(P2([[106 + t * 6, 38 + t * 34], [116 + t * 8, 36 + t * 34], [117 + t * 8, 38 + t * 34], [107 + t * 6, 40 + t * 34]]), k % 2 ? '#8a5228' : '#5a3010'); } // grain
  c4Poly(P2([[107, 36], [110, 35], [116, 50], [113, 52]]), '#a8703c'); // highlight along the front edge
  disc(ox + 116, oy + 52, 2, BRASS); R(ox + 115, oy + 52, 3, 1, '#7a5a1a');                     // grip screw
  R(ox + 120, oy + 63, 5, 1, '#f4efe0'); R(ox + 121, oy + 66, 5, 1, '#f4efe0');                 // two notches. you remember them both.
  R(ox + 112, oy + 74, 16, 3, BRASS); R(ox + 112, oy + 74, 16, 1, BRL);                         // butt cap
  // --- barrel: long round barrel with a highlight streak, front sight, muzzle crown
  c4PolyInk(P2([[0, 16], [70, 16], [70, 26], [0, 26]]), BM);
  R(ox, oy + 17, 70, 2, BH); R(ox + 4, oy + 18, 60, 1, BS); R(ox, oy + 24, 70, 2, BL);         // round barrel shading
  R(ox - 1, oy + 16, 2, 10, BL); R(ox - 1, oy + 20, 2, 2, '#0c0e14');                           // muzzle crown + bore
  c4PolyInk(P2([[3, 16], [5, 11], [8, 11], [8, 16]]), BM);                                     // front sight blade
  // ejector rod housing under the barrel, with the rod head
  c4PolyInk(P2([[20, 26], [66, 26], [66, 32], [24, 32]]), BL); R(ox + 24, oy + 27, 42, 1, BH);
  disc(ox + 22, oy + 29, 2, BS); R(ox + 21, oy + 28, 1, 1, '#ffffff');
  // --- frame: color-case-hardened steel (mottled), top strap with rear-sight groove
  c4PolyInk(P2([[66, 14], [104, 14], [108, 22], [106, 40], [100, 44], [86, 44], [80, 36], [66, 36]]), CASE);
  for (let k = 0; k < 18; k++) R(ox + 68 + Math.round(c4Hash(k * 5) * 34), oy + 16 + Math.round(c4Hash(k * 7) * 24), 3, 2, ['#7a6a8a', '#4a6a8a', '#8a6a4a', '#3e3650'][k % 4]); // case colors
  R(ox + 66, oy + 14, 38, 2, BH); R(ox + 98, oy + 13, 5, 2, BL);                                 // top strap + rear sight notch
  // --- cylinder: fluted, with a bright edge and cartridge rims peeking at the back
  c4PolyInk(P2([[70, 13], [94, 13], [96, 16], [96, 35], [94, 38], [70, 38], [68, 35], [68, 16]]), BM);
  for (const fx of [73, 80, 87]) { R(ox + fx, oy + 16, 3, 19, BL); R(ox + fx + 3, oy + 16, 1, 19, BH); } // flutes
  R(ox + 69, oy + 14, 26, 1, BS); R(ox + 69, oy + 37, 26, 1, '#14161c');
  for (const ry of [17, 26]) { R(ox + 95, oy + ry, 2, 6, BRASS); R(ox + 95, oy + ry, 2, 1, BRL); }  // brass cartridge rims
  // --- hammer: cocked back, checkered spur
  c4PolyInk(P2([[100, 14], [104, 6], [110, 2], [114, 4], [110, 8], [106, 16]]), BM);
  R(ox + 108, oy + 3, 4, 1, BS); for (let k = 0; k < 3; k++) R(ox + 109 + k, oy + 4 + k % 2, 1, 1, BL);
  // --- trigger guard (brass) + trigger
  c4PolyInk(P2([[82, 44], [100, 44], [102, 52], [96, 58], [86, 58], [82, 52]]), BRASS);
  c4Poly(P2([[85, 46], [98, 46], [99, 51], [95, 55], [87, 55], [85, 51]]), '#120a06');        // the opening
  c4Poly(P2([[91, 44], [94, 44], [92, 52], [90, 52]]), BL);                                    // trigger
  R(ox + 83, oy + 45, 4, 1, BRL);
  // --- screws + a glint on the cylinder
  for (const [sx, sy] of [[78, 40], [96, 41], [102, 30]]) { R(ox + sx, oy + sy, 2, 2, BS); R(ox + sx, oy + sy, 1, 1, '#ffffff'); }
  if (Math.floor(clock * 2) % 3 === 0) { R(ox + 74, oy + 12, 1, 5, '#ffffff'); R(ox + 72, oy + 14, 5, 1, '#ffffff'); }
}
SETS.c4Desk = { bg: () => (cutLine === 0 ? c4Framed('#1a1418', 0.62, 4, c4DeskArt) : c4DrawerClose()), fg: () => {} };
CUTS.ch4Office = {
  set: 'c4Desk', actors: [], tune: 'c4mystic',
  start() { C4DESK.openAt = clock + 99; },
  after() { if (cutLine >= 1 && C4DESK.openAt > clock + 50) { C4DESK.openAt = clock; noise(0.5, 0.15, 900); tone('triangle', 180, 140, 0.4, 0.05); } },
  lines: [
    ['narr', 'YOU SLIP PAST THE SNORING GUARDS AND EASE OPEN THE OFFICE DOOR. IT SMELLS LIKE CIGARS AND MONEY.'],
    ['narr', 'A BANKER\'S LAMP IS STILL BURNING ON A BIG WALNUT DESK. YOU TRY THE BOTTOM DRAWER. IT SLIDES OPEN WITH A CREAK.'],
    ['narr', 'UNDER A STACK OF DEEDS LIES YOUR OLD REVOLVER, AND BESIDE IT, A GOLD POCKET WATCH, STILL TICKING.'],
    ['narr', 'THEN YOU HEAR IT: VOICES UPSTAIRS. A MAN AND A WOMAN, TALKING LOW.'],
    ['narr', 'AND A THIRD VOICE. LOUD. VERY SLURRED.'],
    ['voice', "*HIC* YEP, I MADE IT HERE. THE BARREL OF WHISKEY YOU SENT IS ALL GONE."],
    ['narr', 'YOU HOLSTER YOUR IRON, POCKET THE WATCH, AND SNEAK UP THE STAIRS TO PEEK THROUGH A CRACK IN THE DOOR...'],
  ],
};


// =====================================================================
//  UPSTAIRS: McGrudder's ridiculously lavish office, seen through a crack in the door
// =====================================================================
Object.assign(CHARS, {
  mcgrudder: { hat: 'bowler', hatC: '#1b1b1b', skin: '#f0b890', hair: '#b8b8b8', shirt: '#f4efe0', vest: '#7a1a1a', coat: '#26263a', pants: '#26263a', boots: '#151515', face: 'mustache', beardC: '#c8c8c8', bg: '#3a1020' },
});
Object.assign(SPEAK, { mcgrudder: { name: 'MR. MCGRUDDER', color: '#ffb070' }, voice: { name: '???', color: '#ffd23f' } });
function c4MegaBomb(cx, by, reveal) {
  if (reveal < 1) {
    const k = Math.max(0, reveal);
    for (let j = 0; j < 44; j++) { const w = Math.round(26 * Math.sqrt(Math.max(0, 1 - Math.pow((j - 44) / 46, 2)))); R(cx - w + Math.round(k * 40), by - 44 + j, w * 2, 1, j % 7 < 2 ? '#c8c0b0' : '#e8e0d0'); }
    if (k <= 0) return;
  }
  const r = 22, cy = by - r - 4;
  R(cx - 18, by - 6, 36, 6, '#3a2a1a'); R(cx - 16, by - 6, 32, 1, '#5a4a2a');
  disc(cx, cy, r + 1, INK); disc(cx, cy, r, '#2a2a34'); disc(cx - 7, cy - 7, 9, '#3a3a48'); disc(cx - 9, cy - 9, 4, '#5a5a6a'); R(cx - 10, cy - 11, 2, 2, '#9a9aaa');
  for (const dy of [-10, 10]) { const hw = Math.round(Math.sqrt(r * r - dy * dy)); R(cx - hw, cy + dy, hw * 2, 2, '#c9a040'); for (let x = -hw + 3; x < hw; x += 6) R(cx + x, cy + dy, 1, 2, '#ffe8a0'); }
  signText('MEGA', cx, cy - 2, '#c0302b', 1);
  R(cx - 4, cy - r - 4, 8, 5, '#6a6a76'); R(cx - 3, cy - r - 4, 6, 1, '#9a9aaa');
  R(cx + 1, cy - r - 14, 1, 10, '#c9a040'); R(cx - 1, cy - r - 15, 5, 2, Math.floor(clock * 3) % 2 ? '#ff3b30' : '#6a1a14');
  if (Math.floor(clock * 3) % 2) c4Glow(cx + 1, cy - r - 14, 8, '255,60,48', 0.5);
}
function c4LavishArt() {
  g.drawImage(c4Bake('lavishWall', LW, 124, px => {
    c4Grad(px, 0, 0, LW, 124, ['#4a0e18', '#5a1420', '#621826', '#4a0e18']);
    for (let y = 8; y < 108; y += 12) for (let x = ((y / 12) % 2) * 8; x < LW; x += 16) { px(x + 3, y, 2, 1, '#8a6a2a'); px(x + 2, y + 1, 4, 1, '#8a6a2a'); px(x + 3, y + 2, 2, 2, '#8a6a2a'); px(x + 1, y + 2, 1, 1, '#8a6a2a'); px(x + 6, y + 2, 1, 1, '#8a6a2a'); }
    px(0, 104, LW, 3, '#c9a040'); px(0, 104, LW, 1, '#ffe8a0'); px(0, 107, LW, 17, '#3a1a10'); for (let x = 0; x < LW; x += 20) px(x, 109, 18, 13, '#4a2414');
    px(0, 0, LW, 6, '#2a0a10'); px(0, 6, LW, 2, '#c9a040');
  }), 0, 0);
  for (let y = 124; y < LH; y++) R(0, y, LW, 1, (y >> 2) % 2 ? '#6a3a1a' : '#7a4624');
  for (let y = 124; y < LH; y += 4) for (let x = ((y >> 2) % 2) * 10; x < LW; x += 20) R(x, y, 1, 4, '#4a2410');
  for (let j = 0; j < 14; j++) { const w = 60 - Math.abs(j - 7) * 5; R(150 - w, 130 + j, w * 2, 1, j % 3 ? '#3a2a1e' : '#2a1e14'); }
  R(86, 134, 10, 6, '#3a2a1e'); R(204, 134, 10, 6, '#3a2a1e'); disc(150, 128, 7, '#3a2a1e'); R(146, 126, 2, 2, '#f4efe0'); R(152, 126, 2, 2, '#f4efe0'); R(148, 131, 4, 2, '#c03040');
  for (const wx of [18, 262]) {
    R(wx, 14, 40, 76, '#141a40'); for (let i = 0; i < 8; i++) R(wx + 2 + Math.round(c4Hash(i * 3 + wx) * 36), 16 + Math.round(c4Hash(i * 5 + wx) * 40), 1, 1, '#c8d0f0');
    R(wx + 19, 14, 2, 76, '#c9a040'); R(wx, 50, 40, 2, '#c9a040');
    for (const side of [0, 1]) for (let j = 0; j < 80; j++) { const bulge = Math.round(Math.sin(j / 80 * Math.PI) * 6) - (j > 44 && j < 52 ? 3 : 0), cx = side ? wx + 36 - bulge : wx - 4 + bulge;
      R(cx, 10 + j, 10, 1, j % 6 < 2 ? '#8a1020' : '#a81a2a'); R(cx + (side ? 0 : 8), 10 + j, 2, 1, '#600a14'); }
    R(wx - 8, 6, 56, 6, '#c9a040'); R(wx - 8, 6, 56, 1, '#ffe8a0'); R(wx - 4, 56, 6, 4, '#e2b33c'); R(wx + 38, 56, 6, 4, '#e2b33c');
  }
  R(118, 14, 84, 66, '#c9a040'); R(120, 16, 80, 62, '#a8801c'); R(124, 20, 72, 54, '#2a1a1a');
  for (let j = 0; j < 54; j++) R(124, 20 + j, 72, 1, j < 20 ? '#3a2420' : '#2e1c18');
  blit(getSprite({ ...CHARS.mcgrudder, pose: 'idle' }), 140, 22, 1.6);
  R(146, 74, 28, 3, '#c9a040'); R(146, 74, 28, 1, '#ffe8a0');
  R(159, 8, 2, 14, '#c9a040'); R(140, 22, 40, 3, '#c9a040'); R(140, 22, 40, 1, '#ffe8a0');
  for (let i = 0; i < 6; i++) { const cx = 142 + i * 7; R(cx, 25, 1, 6, '#d8e8f0'); R(cx, 18 - (Math.floor(clock * 6 + i) % 2), 2, 4, '#ffd23f'); R(cx, 21, 2, 1, '#f4efe0'); }
  c4Glow(160, 22, 90, '255,210,130', 0.28);
  R(212, 74, 30, 36, '#3a3a44'); R(212, 74, 30, 2, '#6a6a76'); disc(227, 92, 6, '#c9a040'); disc(227, 92, 4, '#3a3a44'); R(226, 87, 2, 3, '#c9a040'); signText('PB&J', 227, 78, '#c9a040');
  R(250, 114, 26, 14, '#8b5a2b'); R(252, 114, 2, 14, '#3d3d3d'); R(272, 114, 2, 14, '#3d3d3d'); disc(276, 121, 6, '#5a3418'); disc(276, 121, 4, '#1a0e08');
  for (let i = 0; i < 3; i++) R(284 + i * 2, 126, 1, 1, '#c08030');
  R(298, 96, 12, 14, '#c8703c'); for (let k = 0; k < 6; k++) line(304, 96, 304 + Math.round(Math.cos(k * 1.05) * 14), 96 - 8 - Math.round(Math.abs(Math.sin(k * 1.05)) * 10), '#3a7a3a');
  const rl = CUTS.ch4Upstairs.lines.findIndex(l => l[1].startsWith('HE PULLS A SHEET')), rev = state === 'cut' && cutName === 'ch4Upstairs' && cutLine >= rl ? Math.min(1, (clock - (C4.sheetAt || clock)) / 0.6) : 0;
  c4MegaBomb(80, 126, rev);
}
function c4DoorCrack() {
  const L = 52, Rt = 268;
  for (const [x0, w, flip] of [[0, L, 0], [Rt, LW - Rt, 1]]) {
    R(x0, 0, w, LH, '#1a0e08');
    for (let y = 0; y < LH; y += 2) R(x0 + (flip ? 0 : w - 6), y, 6, 1, '#2a1810');
    R(flip ? x0 : x0 + w - 3, 0, 3, LH, '#3a2214'); R(flip ? x0 + 3 : x0 + w - 4, 0, 1, LH, '#c9a040');
  }
  R(L - 14, 72, 6, 10, '#c9a040'); R(L - 13, 76, 4, 2, '#7a5a1a');
  for (let x = L; x < Rt; x++) { const k = Math.min(x - L, Rt - x) / 40; if (k < 1) R(x, 0, 1, LH, `rgba(10,6,4,${0.32 * (1 - k)})`); }
}
SETS.c4Lavish = { bg: c4LavishArt, fg: () => {} };
CUTS.ch4Upstairs = {
  set: 'c4Lavish', tune: 'c4mystic',
  actors: [{ who: 'jenny', x: 108, pose: 'idle' }, { who: 'mcgrudder', x: 170, pose: 'idle' }, { who: 'dewey', x: 232, pose: 'drink' }],
  start() { C4.sheetAt = null; },
  after() {
    const rl = this.lines.findIndex(l => l[1].startsWith('HE PULLS A SHEET'));
    if (cutLine >= rl && C4.sheetAt == null) { C4.sheetAt = clock; noise(0.4, 0.2, 2500); tone('sawtooth', 110, 55, 0.6, 0.08); }
    c4DoorCrack();
  },
  lines: [
    ['narr', 'THROUGH THE CRACK: THE FANCIEST ROOM YOU HAVE EVER SEEN. VELVET, GOLD, AND A PAINTING OF ONE VERY PROUD MAN.'],
    ['narr', "IT'S MCGRUDDER. AND JENNY. AND... DEPUTY DEWEY?!"],
    ['mcgrudder', 'SIT DOWN BEFORE YOU FALL DOWN, DEPUTY.'],
    ['jenny', 'GOOD NEWS, BOYS. THE NEW SHERIFF IS GONE. BLOWN TO KINGDOM COME IN A CAVE OUT IN CRYSTAL CANYON.'],
    ['jenny', 'AND GOOD RIDDANCE. HE GUNNED DOWN MAD DOG BUCHANAN. MY BROTHER.'],
    ['mcgrudder', 'AN HONEST SHERIFF IN DUSTWATER WAS BAD FOR BUSINESS. SO WE SENT JENNY TO WALK HIM OUT OF TOWN.'],
    ['mcgrudder', 'WHICH MEANS DUSTWATER GULCH NEEDS A NEW SHERIFF. AND I AM LOOKING RIGHT AT HIM.'],
    ['dewey', 'ME? SHERIFF? *HIC* MCGRUDDER, YOU FLATTER ME.'],
    ['mcgrudder', "IT'S AN EASY JOB. JUST RAISE THE TAXES, KEEP 'EM HIGH, AND SEND EVERY LAST CENT TO THE PB&J RAILROAD."],
    ['jenny', "DO THAT, AND THERE'LL BE A FRESH BARREL OF WHISKEY ON YOUR PORCH EVERY MONTH."],
    ['dewey', 'SHERIFF DEWEY... *HIC* HAS A NICE RING TO IT. YOU GOT YOURSELF A DEAL!'],
    ['mcgrudder', 'SPLENDID! AND TO CELEBRATE... FEAST YOUR EYES ON MY NEWEST INVENTION.'],
    ['narr', 'HE PULLS A SHEET OFF SOMETHING ENORMOUS IN THE CORNER. A BOMB. A BOMB THE SIZE OF A STAGECOACH.'],
    ['mcgrudder', 'THE MCGRUDDER MEGA-BOMB! IT LEAVES ALL OTHER BOMBS IN THE DUST!'],
    ['dewey', "*HIC* AIN'T YOU WORRIED IT MIGHT GO OFF?"],
    ['mcgrudder', 'HA! NOT AT ALL. THE REMOTE DETONATOR IS HIDDEN SAFE AND SOUND IN MY DESK DRAWER DOWNSTAIRS.'],
    ['mcgrudder', 'BUILT RIGHT INTO A GOLD POCKET WATCH. NOBODY WOULD EVER THINK TO LOOK THERE.'],
    ['narr', 'YOU LOOK DOWN AT THE GOLD WATCH IN YOUR HAND. STILL TICKING.'],
  ],
};
CUTS.ch4Walk = {
  set: 'c4DepotView', actors: [], tune: 'c4mystic',
  lines: [
    ['narr', 'YOU TIPTOE BACK DOWN THE STAIRS, STEP OVER THE SNORING GUARDS, AND CASUALLY STROLL OUT THE FRONT DOOR.'],
    ['narr', 'YOU WALK BACK UP THE HILL, QUIET AS A MOUSE.'],
    ['narr', 'AT THE TOP YOU TURN AROUND, TAKE ONE LAST LOOK AT THE DEPOT... AND FLIP THE WATCH OVER.'],
    ['narr', 'ON THE BACK, UNDER THE PB&J CREST, IS A SHINY RED BUTTON.'],
  ],
};
const C4_BOOMS = [
  { name: 'OFFICE', x0: 94, y0: 52, x1: 190, y1: 138, cx: 142, cy: 92, size: 2.4 },
  { name: 'SCAFFOLD', x0: 192, y0: 36, x1: 318, y1: 166, cx: 255, cy: 96, size: 2.6 },
  { name: 'WATER TOWER', x0: 22, y0: 32, x1: 58, y1: 102, cx: 40, cy: 66, size: 1.8 },
  { name: 'WESTBOUND', x0: 0, y0: 124, x1: 160, y1: 176, cx: 80, cy: 150, size: 2.2 },
  { name: 'EASTBOUND', x0: 160, y0: 124, x1: 320, y1: 176, cx: 240, cy: 150, size: 2.2 },
];
const C4B = {};
const C4_WX = 58, C4_WY = 132, C4_WR = 40;
const C4_ON_BTN = { x: W - 300, y: H - 84, w: 280, h: 64 };
function c4Kaboom(x, y, size) {
  C4B.booms.push({ x, y, size, t: 0 });
  for (let i = 0; i < 14 + size * 8; i++) { const a = Math.random() * Math.PI * 2, sp = (40 + Math.random() * 120) * size;
    C4B.debris.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80 * size, rot: 0, vr: (Math.random() - 0.5) * 20, s: 1 + Math.floor(Math.random() * 3), c: pick(['#5a3418', '#3a3e48', '#7a4a24', '#c9a040', '#2a2a30', '#8a1f1a']), t: 0 }); }
  C4B.shake = Math.min(1.4, C4B.shake + 0.4 + size * 0.25); C4B.flash = Math.min(1, C4B.flash + 0.5 + size * 0.15);
  noise(1.2 + size * 0.4, 0.9, 300 + Math.random() * 200); tone('sine', 70, 18, 1.2 + size * 0.3, 0.55); tone('square', 50, 20, 0.6, 0.15);
}
function c4PressButton() {
  C4B.btnT = 0.15; C4B.presses++; tone('square', 1200, 1200, 0.04, 0.05);
  const next = C4_BOOMS.find(b => !b.gone);
  if (next) {
    next.gone = true; c4Kaboom(next.cx, next.cy, next.size);
    for (let i = 1; i <= 3; i++) setTimeout(() => { if (state === 'scene' && scene === SCENES.ch4Boom) c4Kaboom(next.x0 + Math.random() * (next.x1 - next.x0), next.y0 + Math.random() * (next.y1 - next.y0), next.size * 0.6); }, 180 * i + Math.random() * 120);
    addScore(1000, 'obj'); popText(C4_WX + 40, 30, next.name + ' +1000');
    if (!C4_BOOMS.some(b => !b.gone)) { C4B.doneAt = scene.t; setTimeout(() => { if (state === 'scene' && scene === SCENES.ch4Boom) c4Kaboom(170, 100, 4); }, 900); }
  } else {
    for (let i = 0; i < 3; i++) setTimeout(() => { if (state === 'scene' && scene === SCENES.ch4Boom) c4Kaboom(20 + Math.random() * 290, 40 + Math.random() * 120, 1 + Math.random() * 2); }, i * 140);
    addScore(100, 'obj');
  }
}
function c4Rubble(b) {
  const y1 = Math.min(b.y1, 100);
  if (y1 > b.y0) g.drawImage(c4Sky(), b.x0, b.y0, b.x1 - b.x0, y1 - b.y0, b.x0, b.y0, b.x1 - b.x0, y1 - b.y0);
  if (b.y1 > 100) R(b.x0, Math.max(100, b.y0), b.x1 - b.x0, b.y1 - Math.max(100, b.y0), '#1c1620');
  const base = Math.min(b.y1, 172), w = b.x1 - b.x0;
  for (let i = 0; i < w; i += 2) { const h = 3 + Math.round(c4Hash(i * 7 + b.x0) * 8 * Math.sin(Math.PI * i / w)); R(b.x0 + i, base - h, 2, h, (i >> 1) % 3 ? '#2a1e18' : '#3a2a20'); }
  for (let i = 0; i < 8; i++) { const x = b.x0 + Math.round(c4Hash(i * 13 + b.x0) * w), y = base - 4 - Math.round(c4Hash(i * 17 + b.y0) * 10); line(x, y, x + 6 - (i % 3) * 4, y - 6, '#4a3a2a'); }
  for (let i = 0; i < 3; i++) c4Fire(b.x0 + w * (0.2 + i * 0.3), base - 2, 0.6 + (i % 2) * 0.3);
  for (let i = 0; i < 5; i++) { const p = (clock * 0.25 + i / 5) % 1; g.globalAlpha = 0.5 * (1 - p); disc(Math.round(b.cx + Math.sin(p * 4 + i) * 8), Math.round(base - 10 - p * 70), 3 + Math.round(p * 9), '#3a3440'); g.globalAlpha = 1; }
  c4Glow(b.cx, base - 6, 40, '255,120,40', 0.25);
}
function c4DrawBooms() {
  for (const d of C4B.debris) { g.save(); g.translate(Math.round(d.x), Math.round(d.y)); g.rotate(d.rot); R(-d.s, -d.s, d.s * 2, d.s * 2, d.c); g.restore(); }
  for (const b of C4B.booms) {
    const t = b.t, s = b.size;
    for (let i = 0; i < 8; i++) { const a = i * 0.8 + s, d = (6 + t * 40) * s; g.globalAlpha = Math.max(0, 0.6 * (1 - t / 2.4)); disc(Math.round(b.x + Math.cos(a) * d), Math.round(b.y + Math.sin(a) * d * 0.6 - t * 30 * s), Math.round((4 + t * 10) * s), '#4a4248'); g.globalAlpha = 1; }
    if (t < 0.55) { const rr = Math.round((6 + t * 70) * s), a = 1 - t / 0.55; g.globalAlpha = a; disc(Math.round(b.x), Math.round(b.y), rr, '#c02a10'); disc(Math.round(b.x), Math.round(b.y), Math.round(rr * 0.75), '#ff7a2a'); disc(Math.round(b.x), Math.round(b.y), Math.round(rr * 0.45), '#ffd23f'); disc(Math.round(b.x), Math.round(b.y), Math.round(rr * 0.2), '#fff8e0'); g.globalAlpha = 1;
      c4Glow(b.x, b.y, rr * 2.2, '255,160,60', 0.5 * a); }
    if (t < 0.25) for (let k = 0; k < 10; k++) { const a = k * 0.628, l = (20 + t * 200) * s * 0.5; g.globalAlpha = 1 - t / 0.25; line(b.x, b.y, b.x + Math.cos(a) * l, b.y + Math.sin(a) * l, '#fff4c8'); g.globalAlpha = 1; }
  }
}
function c4WatchBack(pressed) {
  const x = C4_WX, y = C4_WY, r = C4_WR;
  for (let i = 0; i < 30; i++) R(Math.round(x - r - i * 3), Math.round(y - r + 8 + Math.sin(i * 0.8 + clock) * 2), 2, 1, i % 2 ? '#e2b33c' : '#c9a040');
  disc(x, y, r + 2, INK); disc(x, y, r + 1, '#7a5a10'); disc(x, y, r, '#c9a040'); disc(x - 3, y - 3, r - 6, '#e2b33c'); disc(x - 8, y - 10, 10, '#f4d070');
  for (const rr of [r - 4, r - 14]) ring(x, y, rr, rr - 1, '#a8801c');
  for (let a = 0; a < 24; a++) R(Math.round(x + Math.cos(a * 0.262) * (r - 9)), Math.round(y + Math.sin(a * 0.262) * (r - 9)), 1, 1, '#a8801c');
  signText('PB&J', x, y - 26, '#7a5a10', 2);
  R(x - 3, y - r - 8, 6, 8, '#c9a040'); R(x - 5, y - r - 11, 10, 4, '#e2b33c');
  const by = y + 6 + (pressed ? 2 : 0);
  disc(x, y + 8, 12, '#6a5010'); disc(x, by, 10, INK); disc(x, by, 9, pressed ? '#8a1010' : '#d01818'); if (!pressed) { disc(x - 3, by - 3, 3, '#ff6a5a'); R(x - 4, by - 5, 2, 1, '#ffffff'); }
  if (C4B.presses === 0 && Math.floor(clock * 2.5) % 2) { const ax = x + 22, ay = y - 2; R(ax, ay, 10, 2, '#ffffff'); R(ax, ay - 2, 2, 6, '#ffffff'); R(ax - 2, ay - 1, 2, 4, '#ffffff'); }
}
function c4BoomWorld(withWatch) {
  const sx = C4B.shake > 0 ? Math.round((Math.random() - 0.5) * 8 * C4B.shake) : 0, sy = C4B.shake > 0 ? Math.round((Math.random() - 0.5) * 8 * C4B.shake) : 0;
  g.drawImage(c4Sky(), 0, 0); c4Stars(); c4Moon(282, 20); R(0, 110, LW, 70, '#1c1620');
  g.save(); g.translate(64 + sx, 2 + sy); g.scale(0.8, 0.8);
  c4DepotWorld(false);
  for (const b of C4_BOOMS) if (b.gone) c4Rubble(b);
  c4DrawBooms();
  g.restore();
  if (C4B.flash > 0) { g.globalAlpha = Math.min(1, C4B.flash); R(0, 0, LW, LH, '#fff4d8'); g.globalAlpha = 1; }
  if (withWatch) c4WatchBack(C4B.btnT > 0);
}
function c4BoomStep(dt) {
  for (const b of C4B.booms) b.t += dt; C4B.booms = C4B.booms.filter(b => b.t < 2.4);
  for (const d of C4B.debris) { d.t += dt; d.vy += 300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt; } C4B.debris = C4B.debris.filter(d => d.y < 240 && d.t < 4);
  C4B.shake = Math.max(0, C4B.shake - dt * 1.8); C4B.flash = Math.max(0, C4B.flash - dt * 3); C4B.btnT = Math.max(0, (C4B.btnT || 0) - dt);
}
SCENES.ch4Boom = {
  tune: 'c4mystic',
  enter() { Object.assign(C4B, { booms: [], debris: [], shake: 0, flash: 0, btnT: 0, presses: 0, doneAt: null }); for (const b of C4_BOOMS) b.gone = false; },
  update(dt) { c4BoomStep(dt); },
  world() { c4BoomWorld(true); },
  ui() {
    if (C4B.presses === 0) text('PRESS THE BUTTON', W / 2, 20, 24, '#ff6a5a', 'center');
    if (C4B.doneAt != null) { text('THE PB&J DEPOT IS NO MORE.', W / 2, 20, 16, '#ffd23f', 'center'); if (Math.floor(clock * 2) % 2) text('(KEEP PRESSING. NOBODY IS STOPPING YOU.)', W / 2, 48, 16, '#f3d18b', 'center'); }
    if (C4B.doneAt != null && this.t - C4B.doneAt > 1.5) smallBtn(C4_ON_BTN, 'WALK AWAY >');
  },
  tap(x, y) {
    if (C4B.doneAt != null && this.t - C4B.doneAt > 1.5 && inBox(x, y, C4_ON_BTN)) { sfx.blip(); nextStep(); return; }
    if (Math.hypot(x / P - C4_WX, y / P - (C4_WY + 6)) < 18) c4PressButton();
  },
  key(k) { if (k === ' ' || k === 'enter') { if (C4B.doneAt != null && this.t - C4B.doneAt > 1.5) nextStep(); else c4PressButton(); } },
};
function c4BurningBg(live) {
  if (!C4B.booms) Object.assign(C4B, { booms: [], debris: [], shake: 0, flash: 0, btnT: 0, presses: 0 });
  for (const b of C4_BOOMS) b.gone = true;
  if (live && Math.random() < 0.03) c4Kaboom(20 + Math.random() * 300, 40 + Math.random() * 120, 1.2 + Math.random() * 1.6);
  c4BoomStep(1 / 60);
  if (!live) { C4B.flash = 0; C4B.shake = 0; } else { C4B.flash = Math.min(C4B.flash, 0.22); C4B.shake = Math.min(C4B.shake, 0.5); }
  R(0, 0, LW, LH, '#1c1620'); g.save(); g.translate(0, -34); c4BoomWorld(false); g.restore();
}
SETS.c4Burning = { bg: () => c4BurningBg(false), fg: () => {} };
SETS.c4StillBurning = { bg: () => c4BurningBg(true), fg: () => {} };
CUTS.ch4Uhoh = {
  set: 'c4StillBurning', actors: [], tune: 'c4mystic',
  start() { Object.assign(C4B, { booms: [], debris: [], shake: 0, flash: 0 }); },
  lines: [
    ['narr', 'YOU ADMIRE YOUR HANDIWORK. THEN SOMETHING ODD HAPPENS. IT KEEPS EXPLODING.'],
    ['narr', 'AND EXPLODING. AND THE EXPLOSIONS ARE GETTING BIGGER. AND CLOSER.'],
    ['narr', 'A WALL OF FIRE IS ROLLING UP THE HILL. STRAIGHT AT YOU.'],
    ['narr', 'RUN!'],
  ],
};
CUTS.ch4After = {
  set: 'c4Burning', actors: [], tune: 'c4mystic',
  start() { Object.assign(C4B, { booms: [], debris: [], shake: 0, flash: 0 }); },
  lines: [
    ['narr', 'THE LAST OF THE BLAST ROLLS PAST AND FIZZLES OUT IN THE SAND. YOUR EYEBROWS ARE GONE. MOSTLY.'],
    ['narr', 'BEHIND YOU, WHAT USED TO BE THE PB&J DEPOT LIGHTS UP THE NIGHT SKY LIKE THE FOURTH OF JULY.'],
    ['narr', 'THE TORTOISE GIVES YOU A LOOK, THEN WANDERS OFF INTO THE DARK. YOU START WALKING.'],
  ],
};

// =====================================================================
//  THE ENDING: dawn on the open road, old friends, a ride home
// =====================================================================
const C4_DAWN = ['#2a2a5a', '#4a3a7a', '#8a4a7a', '#d0607a', '#f09060', '#ffc070', '#ffe0a0'];
function c4DawnLand(sunY) {
  g.drawImage(c4Bake('dawnSky', LW, 112, px => c4Grad(px, 0, 0, LW, 112, C4_DAWN)), 0, 0);
  for (let i = 0; i < 18; i++) { const x = Math.round(c4Hash(i * 3) * LW), y = Math.round(c4Hash(i * 5) * 24); R(x, y, 1, 1, '#c8c8f0'); } // the last stars
  sunHalo(200, sunY, 14, '#fff4c8', '#ffd890');
  for (const [x, y, w] of [[20, 30, 70], [120, 44, 90], [240, 22, 60]]) { R(x, y, w, 3, '#f0907a'); R(x + 8, y - 1, w - 20, 1, '#ffd0a0'); R(x + 4, y + 3, w - 8, 1, '#a04a6a'); }
  g.drawImage(c4Mesas('dawnFar', 320, 34, [[40, 50, 80, 20], [150, 30, 50, 26], [280, 60, 90, 18]], { cap: '#e8907a', mid: '#9a5a7a', band: '#a8687e', dark: '#6a3a5a', darkBand: '#5e3452', talus: '#8a5070' }), 0, 78);
  g.drawImage(c4Bake('dawnGround', LW, 72, px => { c4Grad(px, 0, 0, LW, 72, ['#c88a5a', '#b07848', '#9a6a40', '#7a5232']);
    for (let i = 0; i < 160; i++) px(Math.round(c4Hash(i * 5) * LW), Math.round(c4Hash(i * 7) * 72), 2, 1, i % 3 ? '#a8784a' : '#d8a878'); }), 0, 108);
  for (const [x, h] of [[18, 34], [300, 40]]) { R(x, 150 - h, 4, h, '#3a4a2a'); R(x - 5, 150 - h + 8, 5, 3, '#3a4a2a'); R(x - 5, 150 - h + 2, 3, 9, '#3a4a2a'); R(x + 4, 150 - h + 12, 5, 3, '#3a4a2a'); R(x + 6, 150 - h + 6, 3, 9, '#3a4a2a'); R(x, 150 - h, 1, h, '#ffb070'); }
}
function c4OpenWagon(x, base, moving, ang) { // an open buckboard: Tate at the reins, Pennyworth beside him, Pete at a piano in the back
  x = Math.round(x);
  const wy = base - 22, fr = Math.floor(clock * 7) % 4;
  // the piano in the back, Pete hammering away
  R(x + 4, wy - 26, 24, 26, '#3a1e10'); R(x + 4, wy - 26, 24, 2, '#5a3418'); R(x + 6, wy - 12, 20, 3, '#f4efe0'); for (let k = 0; k < 6; k++) R(x + 7 + k * 3, wy - 12, 1, 2, INK);
  const bob = moving ? 0 : Math.floor(clock * 6) % 2;
  ch2Fig({ ...CHARS.pete, pose: 'idle' }, x + 22, wy - bob, true);
  for (let i = 0; i < 2; i++) { const p = (clock * 0.7 + i / 2) % 1; g.globalAlpha = 1 - p; signText(i ? '&' : 'J', x + 14 + i * 8 + Math.round(p * 6), wy - 32 - Math.round(p * 16), '#fff4c8'); g.globalAlpha = 1; } // music notes, sort of
  // bench up front: Pennyworth + Tate with the reins
  ch2Fig({ ...CHARS.banker, pose: 'idle' }, x + 38, wy + 9);
  ch2Fig({ ...CHARS.sheriff, pose: 'idle' }, x + 50, wy + 9);
  R(x + 46, wy - 6, 6, 10, '#5a3418');
  // the bed + wheels
  R(x, wy, 66, 10, '#7a4a24'); R(x, wy, 66, 1, '#9a6236'); R(x, wy + 10, 66, 2, '#4a2a14'); R(x - 2, wy - 6, 3, 16, '#6e4224');
  spokeWheel(x + 12, base - 8, 8, ang); spokeWheel(x + 54, base - 8, 8, ang * 1.1);
  line(x + 58, wy - 2, x + 84, wy - 10, '#2a1a10'); R(x + 66, wy + 6, 12, 2, '#5a3418');
  horse(x + 70, base - 25, 1, (fr + 2) % 4, HORSE_COATS.palomino, false, null, moving);
}
const C4R = { at: 0 };
function c4RideArt() {
  c4DawnLand(96);
  for (let y = 132; y < 150; y++) R(0, y, LW, 1, y % 3 ? '#d8a070' : '#c89060'); // the road
  const k = Math.min(1, (clock - C4R.at) / 3.2), wx = -120 + 210 * (1 - Math.pow(1 - k, 2));
  if (k < 1 && Math.floor(clock * 10) % 2) R(Math.round(wx) - 6, 144, 5, 2, 'rgba(240,200,150,0.6)');
  c4OpenWagon(wx, 148, k < 1, -wx / 8);
  ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, 230, 148);
}
SETS.c4Ride = { bg: () => c4Framed('#7a5232', 1, -58, c4RideArt), fg: () => {} }; // lifted so the wagon sits above the dialog box
CUTS.ch4Ride = {
  set: 'c4Ride', actors: [], tune: 'morning',
  start() { C4R.at = clock; },
  lines: [
    ['narr', 'BY THE TIME THE SKY STARTS TO GLOW, YOUR BOOTS ARE FULL OF SAND. THEN YOU HEAR IT: HOOVES. WHEELS. AND... A PIANO?'],
    ['narr', 'A WAGON RATTLES UP BESIDE YOU. SHERIFF TATE AT THE REINS, MR. PENNYWORTH NEXT TO HIM, AND PIANO PETE IN THE BACK, PLAYING HIS HEART OUT.'],
    ['sheriff', 'WELL, LOOK WHAT THE DESERT DRAGGED IN!'],
    ['sheriff', "CALIFORNIA WAS TOO EXPENSIVE. FIGURED I'D COME HOME."],
    ['banker', 'WE SAW THE FIREWORKS FROM TEN MILES OFF. WE ASSUMED IT WAS YOU.'],
    ['pete', "HOP ON, PARTNER! WE'RE HEADED BACK TO DUSTWATER GULCH."],
    ['narr', 'YOU CLIMB INTO THE BACK. PETE STARTS IN ON A FRESH TUNE. (NOT OH SUSANNA.)'],
  ],
};
// the final shot: sunrise, the wagon rolling away down the road toward home
SCENES.ch4Sunrise = {
  tune: 'morning',
  world() {
    const t = this.t, sunY = 100 - Math.min(40, t * 5);
    c4DawnLand(sunY);
    for (let y = 110; y < LH; y++) { const w = Math.round(4 + (y - 110) * 1.6); R(200 - w / 2 - (y - 110) * 0.6, y, w, 1, y % 3 ? '#d8a070' : '#c89060'); } // road to the sun
    const k = Math.min(1, t / 9), sc = 1 - 0.85 * k, rx = 140 - (180 - 200) * k + 0, ry = 176 - 64 * k;
    g.save(); g.translate(Math.round(120 + 78 * k), Math.round(ry)); g.scale(sc, sc); c4OpenWagon(-40, 0, true, clock * 4); ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, -30, -22); g.restore(); // you, riding in the back
    c4Glow(200, sunY, 120, '255,220,150', 0.25);
    fadeBlack(1 - t / 1.2);
  },
  ui() { if (this.t > 4) { ctx.globalAlpha = Math.min(1, (this.t - 4) / 1.5); text('DUSTWATER GULCH, HERE WE COME.', W / 2, 36, 16, '#fff4c8', 'center'); ctx.globalAlpha = 1; } if (this.t > 9 && Math.floor(clock * 2) % 2) text('TAP TO CONTINUE', W / 2, H - 34, 16, '#f3d18b', 'center'); },
  update() { if (this.t > 16) nextStep(); },
  tap() { if (this.t > 2) nextStep(); },
  key() { this.tap(); },
};


// =====================================================================
//  THE GETAWAY: the tortoise skate run again, at night, with a wall of
//  fire rolling up behind you. Your spot on screen is your lead:
//  jumps, punches, stumbles and smashing rock walls push you LEFT toward
//  the blast; riding the tortoise and grinding rails pull you RIGHT.
//  Touch the fire and it's over.
// =====================================================================
const C4E = {};
const C4_ESC = { // per badge: cost of mistakes, how hard smashed rock walls set you back (px), how fast the wall creeps on its own
  yellow:     { cost: 0.6, rock: 16, creep: 1.2 },
  deputy:     { cost: 1.0, rock: 22, creep: 2.2 },
  gunslinger: { cost: 1.3, rock: 26, creep: 3.2 },
};
const C4_EDGE = 26, C4_LEAD0 = 64, C4_LEADMAX = 150;
const c4EscCfg = () => C4_ESC[diff.key] || C4_ESC.deputy;
const c4Escaping = () => run === RUNS.escape && state === 'play';
function c4Lose(px) { if (!c4Escaping()) return; C4E.lead = Math.max(-10, C4E.lead - px * c4EscCfg().cost); C4E.hurtT = 0.35; }
function c4LoseRaw(px) { if (!c4Escaping()) return; C4E.lead = Math.max(-10, C4E.lead - px); C4E.hurtT = 0.45; }
function c4Gain(px) { if (!c4Escaping()) return; C4E.lead = Math.min(C4_LEADMAX, C4E.lead + px); }
const c4JumpBase = c3Jump;   c3Jump = function () { const j = C3.stats.jumps, f = C3D.flip && C3D.flip.trick; c4JumpBase(); if (C3.stats.jumps !== j || (C3D.flip && C3D.flip.trick) !== f) c4Lose(C3D.ride > 0 ? 3 : 5); };
const c4PunchBase = c3Punch; c3Punch = function () { const p0 = C3D.punch; c4PunchBase(); if (C3D.punch > p0) c4Lose(4); };
const c4FlipBase = c3Flip;   c3Flip = function () { const f = C3D.flip && C3D.flip.trick; c4FlipBase(); if (C3D.ride > 0 && C3D.flip && C3D.flip.trick !== f) c4Lose(2); };
const c4StumbleBase = c3Stumble; c3Stumble = function (o) { c4Lose(14); c4StumbleBase(o); };
const c4SmashBase = c3SmashWalls; c3SmashWalls = function (b) { const n = C3.stats.smashed; c4SmashBase(b); if (C3.stats.smashed > n) { c4LoseRaw(c4EscCfg().rock * (C3.stats.smashed - n)); if (c4Escaping()) popText(C3PX + 10, 40, 'SLOWED!'); } };

function c4WallX() { const z = c3Zoom(); return C3AX + z * (C4_EDGE - C3AX); }
function c4FireWall() {
  const e = c4WallX(), t = clock;
  for (let y = 0; y < LH; y += 2) {
    const w = Math.round(e + Math.sin(y * 0.13 + t * 7) * 4 + Math.sin(y * 0.047 - t * 3.3) * 6 + Math.sin(y * 0.31 + t * 11) * 2);
    R(0, y, w + 3, 2, '#5a1008'); R(0, y, w, 2, '#c02a10'); R(0, y, w - 6, 2, '#ff6a20'); R(0, y, w - 13, 2, '#ffb030'); R(0, y, w - 21, 2, '#ffe890'); R(0, y, w - 28, 2, '#fff8e8');
  }
  for (const p of C4E.puffs) { const k = p.t / p.life, r = Math.round(p.r * (0.5 + k)), x = Math.round(e + p.dx + k * 6), y = Math.round(p.y - k * 10);
    g.globalAlpha = Math.min(1, (1 - k) * 1.6); disc(x, y, r, '#c02a10'); disc(x - 1, y, Math.round(r * 0.72), '#ff7a2a'); disc(x - 2, y - 1, Math.round(r * 0.4), '#ffd23f'); g.globalAlpha = 1; }
  for (let i = 0; i < 8; i++) { const p = (t * 0.4 + i / 8) % 1; g.globalAlpha = 0.6 * (1 - p); disc(Math.round(e - 10 + p * 30 + Math.sin(i * 2 + t) * 6), Math.round(40 - p * 60 + i * 4), 6 + Math.round(p * 12), '#2a1c20'); g.globalAlpha = 1; }
  for (const m of C4E.embers) R(Math.round(m.x), Math.round(m.y), 1, 1, m.t < 0.4 ? '#fff4c8' : '#ff9a3a');
  c4Glow(e, 90, 120, '255,120,40', 0.35); c4Glow(e, 150, 70, '255,180,80', 0.25);
}
// intense chase music: fast, minor, pounding
TUNES.c4escape = {
  notes: c4Notes('E5 E5 G5 E5 B5 A5 G5 F#5 | E5 E5 G5 E5 C6 B5 A5 B5 | E5 E5 G5 E5 B5 A5 G5 A5 | F#5 G5 F#5 E5 D#5 E5 F#5 D#5 | C6 C6 B5 A5 B5 B5 A5 G5 | A5 A5 G5 F#5 G5 F#5 E5 D#5 | E5 G5 B5 E6 D6 B5 G5 B5 | E6 - - - B5 - E5 -'),
  bass: ['E2', 'E2', 'E2', 'B1', 'C2', 'A1', 'E2', 'E2'], bar: 8, eighth: 60 / 220 / 2, vol: 0.06, style: 'gallop',
};
const C4_ESC_RUN = {
  name: 'THE GETAWAY', title: 'THE GETAWAY', trail: 'ESCAPE THE BLAST', tune: 'c4escape',
  hint: 'OUTRUN THE BLAST! RAILS SPEED YOU UP. JUMPS, PUNCHES AND ROCK WALLS SLOW YOU DOWN.',
  runT: 40, rideT: 30, turtleT: 0,
  hurtText: { ...RUNS.desert.hurtText, blast: { title: 'KA-BLOOEY!', reason: 'THE FIRE CAUGHT UP. KEEP MOVING!', color: '#ff9a3a' } },
  forms() { return [{ t: 6.5, seq: c3Clump() }, { t: 8, seq: c3RandForm(6) }, { t: 12, seq: c3Clump() }, { t: 16, seq: c3RandForm(7) }, { t: 21, seq: c3Clump() }, { t: 25, seq: c3RandForm(6) }, { t: 30, seq: c3Clump() }, { t: 33, seq: c3RandForm(5) }]; },
  skate() { return [{ t: 9, k: 'rail' }, { t: 14, k: 'rail' }, { t: 19, k: 'big' }, { t: 23, k: 'rail' }, { t: 28, k: 'rail' }]; },
  reset() {
    RUNS.desert.reset.call(this);
    Object.assign(C4E, { rides0: C3.stats.rides, second: false, lead: C4_LEAD0, puffs: [], embers: [], rumbleT: 0, hurtT: 0 });
    C3PX = C4_EDGE + C4_LEAD0;
  },
  update(dt) {
    while (C3D.forms.length && time >= C3D.forms[0].t && c3CourseEnd(C3D.v) > C3VW + 220) C3D.forms.shift();
    while (C3D.skate.length && time >= C3D.skate[0].t && c3CourseEnd(C3D.v) > C3VW + 220) C3D.skate[0].t += 0.5;
    RUNS.desert.update.call(this, dt);
    C4E.rumbleT -= dt; if (C4E.rumbleT <= 0) { C4E.rumbleT = 0.3 + Math.random() * 0.3; noise(0.5, 0.18, 220 + Math.random() * 160); }
    for (let i = 0; i < 3; i++) C4E.puffs.push({ y: Math.random() * LH, dx: -Math.random() * 10, r: 5 + Math.random() * 9, t: 0, life: 0.5 + Math.random() * 0.5 });
    for (const p of C4E.puffs) p.t += dt; C4E.puffs = C4E.puffs.filter(p => p.t < p.life);
    if (Math.random() < dt * 25) C4E.embers.push({ x: c4WallX(), y: 30 + Math.random() * 140, vx: 60 + Math.random() * 120, vy: -20 - Math.random() * 50, t: 0 });
    for (const m of C4E.embers) { m.t += dt; m.vy += 60 * dt; m.x += m.vx * dt; m.y += m.vy * dt; } C4E.embers = C4E.embers.filter(m => m.t < 1);
    C4E.hurtT = Math.max(0, C4E.hurtT - dt);
    if (state !== 'play') return;
    C4E.lead -= c4EscCfg().creep * dt;
    if (C3D.ride > 0) c4Gain(9 * dt);
    if (C3D.grind) c4Gain(30 * dt);
    if (C3D.ramps && C3D.ramps.some(r => r.used && !r.paid && (r.paid = true))) c4Gain(12);
    if (!C4E.second && time > 15 && C3.stats.rides === C4E.rides0) { C4E.second = true; C3D.turtles.push({ x: null, t: time }); }
    const want = C4_EDGE + C4E.lead, step = Math.sign(want - C3PX) * Math.min(Math.abs(want - C3PX), 40 * dt);
    if (step) { const old = C3PX; C3PX += step; if (c3Under(C3D.y + c3Off()).wall) C3PX = old; }
    if (C3PX <= C4_EDGE + 3) { shake = 1; noise(1.4, 0.9, 400); tone('sine', 70, 20, 1.2, 0.5); C3D.bumps = 0; hurt('blast', null); }
  },
  draw() {
    c3DesertArt();
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#6a70b4'; g.fillRect(0, 0, LW, LH); g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 40; i++) { const x = Math.round(c4Hash(i * 3) * LW), y = Math.round(c4Hash(i * 5 + 1) * 46); if ((Math.floor(clock * 2 + i) % 7)) R(x, y, 1, 1, i % 6 ? '#b8c0e8' : '#ffffff'); }
    c4Moon(280, 20);
    c4FireWall();
    const gap = C3PX - C4_EDGE;
    if (gap < 34 || C4E.hurtT > 0) { const a = Math.max(C4E.hurtT * 1.2, (34 - gap) / 34) * (0.55 + 0.45 * Math.sin(clock * 14)); g.globalAlpha = Math.min(0.7, a); R(0, 0, LW, 5, '#ff2a10'); R(0, LH - 5, LW, 5, '#ff2a10'); R(LW - 5, 0, 5, LH, '#ff2a10'); g.globalAlpha = 1; }
  },
  ui() {
    RUNS.desert.ui.call(this);
    if (!['intro', 'play'].includes(state)) return;
    const gap = Math.max(0, Math.round(C3PX - C4_EDGE)), w = 220, x = W - w - 24, y = 122, k = Math.min(1, gap / (C4_LEADMAX));
    text('LEAD', x - 10, y - 2, 16, '#f3d18b', 'right');
    rect(x - 3, y - 3, w + 6, 18, INK); rect(x, y, w, 12, '#3a1a10'); rect(x, y, Math.round(w * k), 12, k < 0.25 ? '#ff3b30' : k < 0.5 ? '#ffb030' : '#8aba5a');
  },
};
RUNS.escape = Object.create(RUNS.desert, { tune: { value: 'c4escape', writable: true } });
Object.assign(RUNS.escape, C4_ESC_RUN);
Object.assign(HURT, { blast: RUNS.escape.hurtText.blast });
Object.assign(EPITAPHS, { blast: [['RUSTY!!'], ['WELL DONE.', 'EXTRA CRISPY.'], ['HE DID LOOK AT', 'THE EXPLOSION.'], ['THE TORTOISE', 'MADE IT.'], ['SHOULD HAVE', 'BOUGHT A', 'FASTER TURTLE.']] });

CUTS.ch4Quiet = {
  set: 'c4DepotView', actors: [], tune: 'c4mystic',
  lines: [
    ['narr', 'ONE BY ONE, THE PATROLS SLUMP OVER. THE DEPOT FILLS WITH THE SOUND OF SNORING.'],
    ['narr', 'IN THE MAIN OFFICE, A SINGLE LAMP IS STILL BURNING. SOMEBODY IS STILL AWAKE IN THERE.'],
  ],
};

// =====================================================================
//  THE LAST SHOT: the wagon from behind, rolling up the road into the sunrise
// =====================================================================
const c4WagonRear = () => c4Bake('wagonRear', 52, 50, px => {
  const O = '#1b1410';
  // the horse up front, peeking over the load (ears + mane + rump)
  px(22, 0, 2, 4, '#c89a4a'); px(28, 0, 2, 4, '#c89a4a'); px(21, 3, 10, 6, '#d8aa5a'); px(24, 3, 4, 7, '#f4e0a0');
  // heads on the front bench: Tate's white hat, Pennyworth's bowler
  px(12, 3, 11, 2, '#e8e0d0'); px(14, 0, 7, 4, '#e8e0d0'); px(15, 5, 5, 4, '#c8c8c8');
  px(31, 4, 9, 2, '#1b1b1b'); px(32, 1, 7, 4, '#1b1b1b'); px(33, 6, 5, 3, '#5a4a3a');
  // the back of the upright piano, Pete's back beside it (bowler, red shirt)
  px(6, 9, 22, 18, O); px(7, 10, 20, 16, '#4a2a14'); for (let x = 9; x < 27; x += 4) px(x, 10, 1, 16, '#3a1e0c'); px(7, 10, 20, 1, '#6e4224');
  px(30, 9, 10, 2, '#6b5a4a'); px(31, 6, 8, 4, '#6b5a4a'); px(31, 11, 8, 4, '#9a9a9a'); px(30, 15, 10, 12, '#8a3a3a'); px(30, 15, 2, 12, '#6a2a2a'); px(33, 15, 4, 12, '#4a3a2a');
  // the wagon box from behind: tailgate planks, iron straps
  px(4, 26, 44, 13, O); px(5, 27, 42, 11, '#7a4a24'); for (let y = 30; y < 38; y += 3) px(5, y, 42, 1, '#5a3418'); px(5, 27, 42, 1, '#9a6236');
  px(10, 27, 2, 11, '#3a3a40'); px(40, 27, 2, 11, '#3a3a40');
  // you, sitting on the tailgate facing back, boots dangling, hat tipped
  px(19, 14, 14, 3, '#6b4a2a'); px(21, 11, 10, 4, '#6b4a2a'); px(22, 17, 8, 6, '#e0a070'); px(23, 19, 2, 1, O); px(27, 19, 2, 1, O); px(23, 21, 6, 2, '#c08050');
  px(20, 23, 12, 7, '#8a2a2a'); px(20, 23, 4, 7, '#3a2a20'); px(17, 25, 3, 5, '#8a2a2a'); px(32, 25, 3, 5, '#8a2a2a');
  px(21, 37, 3, 7, '#3a3550'); px(28, 37, 3, 7, '#3a3550'); px(20, 43, 5, 3, '#2a1a10'); px(27, 43, 5, 3, '#2a1a10');
  // wheels seen edge-on, the axle
  px(0, 24, 5, 24, O); px(1, 25, 3, 22, '#5a3418'); px(1, 25, 3, 2, '#8a8a96'); px(1, 45, 3, 2, '#8a8a96');
  px(47, 24, 5, 24, O); px(48, 25, 3, 22, '#5a3418'); px(48, 25, 3, 2, '#8a8a96'); px(48, 45, 3, 2, '#8a8a96');
  px(4, 40, 44, 2, '#2a1a10');
});
SCENES.ch4Sunrise.world = function () {
  const t = this.t, sunY = 100 - Math.min(40, t * 5);
  c4DawnLand(sunY);
  const roadX = y => 200 - (y - 110) * 0.6;
  for (let y = 110; y < LH; y++) { const w = Math.round(4 + (y - 110) * 1.6); R(Math.round(roadX(y) - w / 2), y, w, 1, y % 3 ? '#d8a070' : '#c89060'); } // road to the sun
  const k = Math.min(1, t / 11), ease = 1 - Math.pow(1 - k, 1.6), by = 186 - 74 * ease, sc = 1.7 - 1.55 * ease, cx = roadX(by);
  const img = c4WagonRear(), bob = Math.floor(clock * 8) % 2 ? 0 : 1, w = img.width * sc, h = img.height * sc;
  for (let i = 0; i < 4; i++) { const p = (clock * 0.8 + i / 4) % 1; g.globalAlpha = 0.45 * (1 - p) * (1 - ease * 0.7); disc(Math.round(cx + (i % 2 ? 1 : -1) * w * 0.4), Math.round(by + 2 + p * 6 * sc), Math.max(1, Math.round((2 + p * 6) * sc)), '#e8c890'); g.globalAlpha = 1; } // dust behind the wheels
  g.imageSmoothingEnabled = false; g.drawImage(img, Math.round(cx - w / 2), Math.round(by - h - bob * sc), Math.round(w), Math.round(h));
  c4Glow(200, sunY, 120, '255,220,150', 0.25);
  fadeBlack(1 - t / 1.2);
};

// =====================================================================
//  WHOLE-GAME STATS: each chapter's numbers are snapshotted when its
//  tally comes up, and the end of the game adds them all together.
// =====================================================================
const GS = { ch: {}, cur: null };
const gsChapterOf = steps => (steps === STORY2 ? 2 : steps === STORY3 ? 3 : steps === STORY4 ? 4 : 1);
const gsBaseStart = startGame;
startGame = function (d, steps) {
  gsBaseStart(d, steps);
  const n = gsChapterOf(steps);
  if (n === 1) GS.ch = {}; // a fresh game from chapter 1 starts a fresh record
  GS.cur = { n, diff: diff.name, deaths: 0, wounds: 0, kinds: {}, t0: clock, darts: 0, dartHits: 0 };
  if (n >= 3) { C3.stats = c3NewStats(); C3.runSnap = null; C3.bestTrick = null; } // chapter 4's getaway reuses the skate stats: start them clean
};
const gsBaseHurt = hurt;
hurt = function (kind, a) {
  const L = lives; gsBaseHurt(kind, a);
  if (lives < L) {
    if (GS.cur) { GS.cur.deaths++; GS.cur.kinds[kind] = (GS.cur.kinds[kind] || 0) + 1; }
    if (run === RUNS.trail && EPITAPHS[kind] && Math.random() < 1 / (EPITAPHS[kind].length + 1)) epitaph = ['RUSTY!!']; // RUSTY!! only haunts the wagon race
  } else if (GS.cur) GS.cur.wounds++;
};
for (const k in EPITAPHS) EPITAPHS[k] = EPITAPHS[k].filter(e => e[0] !== 'RUSTY!!');
const gsBaseShoot = c4Shoot;
c4Shoot = function () { const d0 = C4D.darts, o0 = S.n.outlaw; gsBaseShoot(); if (GS.cur && C4D.darts < d0) { GS.cur.darts++; if (S.n.outlaw > o0) GS.cur.dartHits++; } };
function gsEnd(extra) {
  const c = GS.cur; if (!c || c.done) return; c.done = true;
  Object.assign(c, { score, shots, hits, S: cloneS(S), time: clock - c.t0 }, extra || {});
  GS.ch[c.n] = c;
}
const gsBaseTally = drawTally;
drawTally = function () { gsEnd(); gsBaseTally(); };
{ const e2 = SCENES.ch2End.enter; SCENES.ch2End.enter = function () { gsEnd(); e2.call(this); }; }
{ const e3 = SCENES.ch3End.enter; SCENES.ch3End.enter = function () { gsEnd({ c3: { ...C3.stats }, best: C3.bestTrick }); e3.call(this); }; }
// chapters roll straight into the next one
SCENES.ch2End.tap = function () { if (this.t < 0.45 * 7) this.t = 0.45 * 8; else startScene('ch3Title'); };
SCENES.ch3End.tap = function () { if (this.t < 0.45 * 11) this.t = 0.45 * 12; else startScene('ch4Title'); };

// ---------------- CHAPTER 4 TALLY ----------------
SCENES.ch4End = {
  tune: 'morning',
  enter() { saveBest(); sfx.clear(); this.k = 0; gsEnd({ c3: { ...C3.stats }, best: C3.bestTrick, presses: C4B.presses || 0 }); },
  update() { const k = Math.floor(this.t / 0.45); if (k !== this.k) { this.k = k; if (k <= 10) sfx.blip(); } },
  world() { c4DawnLand(64); },
  ui() {
    const c = GS.ch[4] || {}, st = c.c3 || {};
    dim(0.7); panel(150, 14, 660, 512);
    text('CHAPTER 4 TALLY', W / 2, 36, 32, '#ffd23f', 'center');
    const rows = [['PATROLS PUT TO SLEEP', (c.S && c.S.n.outlaw) || 0], ['DARTS FIRED', c.darts || 0], ['DARTS THAT HIT A WALL', (c.darts || 0) - (c.dartHits || 0)],
      ['BUILDINGS DEMOLISHED', 5], ['RED BUTTON PRESSES', c.presses || 0], ['GETAWAY TRICKS LANDED', st.tricks || 0], ['SECONDS GRINDING', (st.grind || 0).toFixed(1)], ['ROCKS SMASHED', st.smashed || 0]];
    const k = Math.floor(this.t / 0.45);
    rows.forEach((r, i) => { if (k > i) { text(r[0], 200, 92 + i * 30, 16, '#ffffff'); text(String(r[1]), 760, 92 + i * 30, 16, '#f3d18b', 'right'); } });
    if (k > rows.length) { rect(200, 340, 560, 3, '#c98a4b'); text('TOTAL', 200, 356, 24, '#ffffff'); text(String(score), 760, 356, 24, '#ffd23f', 'right'); }
    if (k > rows.length + 1) {
      text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, 414, 16, '#ffd23f', 'center');
      if (Math.floor(clock * 2.5) % 2) text('TAP FOR YOUR FINAL STATS', W / 2, 470, 16, '#f3d18b', 'center');
    }
  },
  tap() { if (this.t < 0.45 * 10) this.t = 0.45 * 11; else startScene('finalStats'); },
  key() { this.tap(); },
};

// ---------------- THE FINAL STATS (scrollable) ----------------
const GS_KIND = { shot: 'LEAD POISONING', duel: 'MAD DOG', early: 'DRAWING EARLY', bystander: 'SHOOTING THE TOWNSFOLK', arrow: 'ARROWS', crash: 'BOULDERS', block: 'BLOCKADES', tnt: 'DYNAMITE',
  fuse: 'THE FUSE', trip: 'SAGEBRUSH', snake: 'RATTLESNAKES', buzzard: 'BUZZARDS', rock: 'ROCK WALLS', darts: 'RUNNING OUT OF DARTS', blast: 'THE EXPLOSION' };
function gsRows() {
  const C = [1, 2, 3, 4].map(n => GS.ch[n]).filter(Boolean), sum = f => C.reduce((a, c) => a + (f(c) || 0), 0);
  const n = k => sum(c => c.S && c.S.n[k]), c3 = k => sum(c => c.c3 && c.c3[k]);
  const g1 = [GS.ch[1], GS.ch[2]].filter(Boolean), shots = g1.reduce((a, c) => a + c.shots, 0), hitsG = g1.reduce((a, c) => a + c.hits, 0);
  const kinds = {}; for (const c of C) for (const k in c.kinds) kinds[k] = (kinds[k] || 0) + c.kinds[k];
  const fav = Object.keys(kinds).sort((a, b) => kinds[b] - kinds[a])[0];
  const secs = Math.round(sum(c => c.time)), bestT = C.map(c => c.best).filter(Boolean).sort((a, b) => b.pts - a.pts)[0];
  const rows = [['HEAD', 'THE NUMBERS']];
  rows.push(['TOTAL SCORE', String(sum(c => c.score)), '#ffd23f']);
  for (const c of C) rows.push(['  CHAPTER ' + c.n + ' (' + c.diff + ')', String(c.score)]);
  rows.push(['TIME IN THE SADDLE', Math.floor(secs / 60) + 'M ' + (secs % 60) + 'S']);
  rows.push(['HEAD', 'GUNSLINGING']);
  rows.push(['OUTLAWS BROUGHT TO JUSTICE', String(n('outlaw'))], ['HATS SHOT CLEAN OFF', String(n('hat'))], ['BOTTLES BUSTED', String(n('bottle'))],
    ['BIRDS, TNT & ODDS AND ENDS', String(n('obj'))], ['BULLETS FIRED', String(shots)], ['ACCURACY', (shots ? Math.round(hitsG / shots * 100) : 0) + '%']);
  rows.push(['HEAD', 'MORTALITY']);
  rows.push(['TIMES YOU DIED', String(sum(c => c.deaths))], ['FLESH WOUNDS SHRUGGED OFF', String(sum(c => c.wounds))], ['FAVORITE WAY TO DIE', fav ? GS_KIND[fav] || fav.toUpperCase() : 'YOU NEVER DIED?!']);
  rows.push(['HEAD', 'THE DESERT']);
  rows.push(['SUCCESSFUL SPITS', String(c3('sparkHits') + c3('bats'))], ['BATS SPAT ON', String(c3('bats'))], ['RATTLESNAKES PUNCHED', String(c3('snakes'))], ['BUZZARDS WHAPPED', String(c3('buzzards'))],
    ['DRAGONFLIES CAUGHT', String(c3('flies'))], ['TORTOISES RIDDEN', String(c3('rides'))], ['SICK TRICKS LANDED', String(c3('tricks'))], ['SECONDS SPENT GRINDING', c3('grind').toFixed(1)],
    ['ROCKS SMASHED WITH A TORTOISE', String(c3('smashed'))], ['BEST TRICK', bestT ? bestT.name : 'NONE'], ['TIMES YOU JUMPED', String(c3('jumps'))]);
  rows.push(['HEAD', 'THE DEPOT']);
  const d4 = GS.ch[4] || {};
  rows.push(['PATROLS PUT TO SLEEP', String((d4.S && d4.S.n.outlaw) || 0)], ['DARTS FIRED', String(d4.darts || 0)], ['DARTS THAT HIT A WALL', String((d4.darts || 0) - (d4.dartHits || 0))],
    ['TIMES YOU PRESSED THE RED BUTTON', String(d4.presses || 0)], ['BUILDINGS THAT ARE NO LONGER BUILDINGS', GS.ch[4] ? '5' : '0']);
  rows.push(['HEAD', 'MISCELLANEOUS']);
  rows.push(['WHISKEY BARRELS EMPTIED BY DEWEY', '1'], ['TIMES YOU LOOKED AT THE EXPLOSION', '0'], ['EYEBROWS REMAINING', 'MOSTLY'], ["SHMOODLE'S OPINION OF YOU", 'FAVORABLE'],
    ['TIMES PETE PLAYED OH SUSANNA', 'TOO MANY'], ['TORTOISES HARMED', '0']);
  return rows;
}
const GS_TITLE_BTN = { x: W / 2 - 110, y: H - 70, w: 220, h: 54 }, GS_UP = { x: W - 128, y: 150, w: 64, h: 64 }, GS_DN = { x: W - 128, y: 330, w: 64, h: 64 };
const GS_TOP = 120, GS_BOT = 455, GS_ROW = 38;
SCENES.finalStats = {
  tune: 'morning',
  enter() { this.rows = gsRows(); this.scroll = 0; this.hold = 3; this.drag = null; },
  maxScroll() { return Math.max(0, this.rows.length * GS_ROW - (GS_BOT - GS_TOP) + 20); },
  update(dt) { this.hold -= dt; if (this.hold <= 0 && !this.drag) this.scroll = Math.min(this.maxScroll(), this.scroll + 26 * dt); }, // slow credits-style scroll
  world() { c4DawnLand(30); },
  ui() {
    dim(0.72); panel(110, 14, 740, 512);
    text('THE END', W / 2, 30, 32, '#ffd23f', 'center');
    text('YOUR FINAL STATS', W / 2, 78, 16, '#f3d18b', 'center');
    ctx.save(); ctx.beginPath(); ctx.rect(130, GS_TOP - 6, 700, GS_BOT - GS_TOP + 12); ctx.clip();
    this.rows.forEach((r, i) => {
      const y = GS_TOP + i * GS_ROW - Math.round(this.scroll); if (y < GS_TOP - 40 || y > GS_BOT + 10) return;
      if (r[0] === 'HEAD') { rect(150, y + 10, 560, 2, '#c98a4b'); text(r[1], W / 2 - 40, y + 2, 16, '#c8a8ff', 'center'); return; }
      const vw = Math.min(300, r[1].length * 16); fitText(r[0], 150, y, 16, '#ffffff', 'left', 560 - vw); fitText(r[1], 730, y, 16, r[2] || '#f3d18b', 'right', 300);
    });
    ctx.restore();
    const m = this.maxScroll(), k = m ? this.scroll / m : 1;
    smallBtn(GS_UP, '^'); smallBtn(GS_DN, 'v'); rect(W - 100, 222, 8, 100, '#3a2a20'); rect(W - 100, 222 + Math.round(k * 84), 8, 16, '#ffd23f');
    smallBtn(GS_TITLE_BTN, 'TITLE');
  },
  nudge(d) { this.scroll = Math.max(0, Math.min(this.maxScroll(), this.scroll + d)); this.hold = 4; },
  tap(x, y) {
    if (inBox(x, y, GS_TITLE_BTN)) { sfx.blip(); toTitle(); return; }
    if (inBox(x, y, GS_UP)) return this.nudge(-GS_ROW * 3);
    if (inBox(x, y, GS_DN)) return this.nudge(GS_ROW * 3);
    this.drag = { y, s: this.scroll }; this.hold = 4;
  },
  key(k) { if (k === 'arrowup' || k === 'w') this.nudge(-GS_ROW); else if (k === 'arrowdown' || k === 's') this.nudge(GS_ROW); else if (k === 'enter' || k === 'escape') toTitle(); },
};
cv.addEventListener('pointermove', e => { const sc = SCENES.finalStats; if (state !== 'scene' || scene !== sc || !sc.drag) return; const m = toGame(e); sc.scroll = Math.max(0, Math.min(sc.maxScroll(), sc.drag.s - (m.y - sc.drag.y))); sc.hold = 4; });
cv.addEventListener('pointerup', () => { SCENES.finalStats.drag = null; });
cv.addEventListener('wheel', e => { if (state === 'scene' && scene === SCENES.finalStats) { e.preventDefault(); SCENES.finalStats.nudge(e.deltaY * 0.5); } }, { passive: false });


// =====================================================================
//  ONE BADGE FOR THE WHOLE GAME + CHAPTER SHORTCUTS
//  The badge you pick on the main title sticks for every chapter.
//  Chapter title cards are just a title: tap anywhere to start.
//  Finishing a chapter unlocks a shortcut to it on the main title.
// =====================================================================
const HN = { badge: 'deputy', unlocked: {} };
try { HN.badge = localStorage.getItem('hns_badge') || 'deputy'; HN.unlocked = JSON.parse(localStorage.getItem('hns_unlocked') || '{}'); } catch (e) {}
function hnSave() { try { localStorage.setItem('hns_badge', HN.badge); localStorage.setItem('hns_unlocked', JSON.stringify(HN.unlocked)); } catch (e) {} }
const hnBaseStart = startGame;
startGame = function (d, steps) { if (!steps || steps === STORY) { HN.badge = d; hnSave(); } hnBaseStart(d, steps); };
function hnUnlock(n) { if (!HN.unlocked[n]) { HN.unlocked[n] = true; hnSave(); } }
const hnBaseGsEnd = gsEnd;
gsEnd = function (extra) { if (GS.cur) hnUnlock(GS.cur.n); hnBaseGsEnd(extra); };
// chapter title cards: title only, tap anywhere to start with the badge you already chose
function hnChapterCard(sc, steps, onStart) {
  const baseUi = sc.ui;
  sc.ui = function () {
    const saved = { btn: button, small: smallBtn, txt: text };
    button = () => {}; smallBtn = () => {};
    text = (s, ...a) => { if (s === 'CHOOSE YOUR BADGE' || /^BEST /.test(s)) return; saved.txt(s, ...a); };
    try { baseUi.call(this); } finally { button = saved.btn; smallBtn = saved.small; text = saved.txt; }
    if (this.t > 1 && Math.floor(clock * 2.5) % 2) text('TAP TO START', W / 2, H - 70, 24, '#ffffff', 'center');
    text('BADGE: ' + DIFFICULTY[HN.badge].name, W / 2, H - 30, 16, '#ffd23f', 'center');
  };
  sc.tap = function () { if (this.t < 0.8) return; sfx.blip(); if (onStart) onStart(); startGame(HN.badge, steps); };
  sc.key = function () { sc.tap.call(this); };
}
hnChapterCard(SCENES.ch2Title, STORY2);
hnChapterCard(SCENES.ch3Title, STORY3, () => { C3.stats = c3NewStats(); C3.runSnap = null; C3.bestRun = 0; });
hnChapterCard(SCENES.ch4Title, STORY4);
// shortcuts on the main title (only chapters you've finished)
const HN_SC = [
  { n: 1, b: { x: 8, y: 8, w: 170, h: 40 }, go: () => startGame(HN.badge) },
  { n: 2, b: { x: 8, y: 52, w: 170, h: 40 }, go: () => startScene('ch2Title') },
  { n: 3, b: { x: W - 178, y: 8, w: 170, h: 40 }, go: () => startScene('ch3Title') },
  { n: 4, b: { x: W - 178, y: 52, w: 170, h: 40 }, go: () => startScene('ch4Title') },
];
window.addEventListener('pointerdown', e => {
  if (e.target !== cv || paused || state !== 'title') return;
  const m = toGame(e);
  for (const s of HN_SC) if (HN.unlocked[s.n] && inBox(m.x, m.y, s.b)) { e.stopPropagation(); e.preventDefault(); audio(); mouse = m; sfx.blip(); s.go(); return; }
}, true);
const hnBaseDraw = draw;
draw = function () {
  hnBaseDraw();
  if (state === 'title' && !paused) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(SW, 0);
    for (const s of HN_SC) if (HN.unlocked[s.n]) smallBtn(s.b, 'CHAPTER ' + s.n + ' >');
    if (Object.keys(HN.unlocked).length) text('SHORTCUTS USE: ' + DIFFICULTY[HN.badge].name, W / 2, H - 22, 16, '#f3d18b', 'center');
    ctx.restore();
  }
};
