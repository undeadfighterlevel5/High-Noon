// =====================================================================
//  HIGH NOON — CHAPTER 2: THE CRYSTAL CANYON RUN
//  Loaded after engine.js and chapter1.js. Reached from the CONTINUE
//  button on chapter 1's final tally.
//
//  Flow:  ch2Room (night, fade to black) -> ch2Title (breakfast + badges)
//         -> ch2Saloon (Eliza walks in) -> THE TRAIL (wagon race)
//         -> ch2Cabin (sunset, keep watch) -> ch2Night (fade to black)
//         -> ch2Dawn (surrounded!) -> THE CABIN (siege from the roof)
//         -> ch2Lake (Eliza takes the reins) -> ch2Rest (fade out) -> ch2End (final tally)
// =====================================================================

// ---------------- CAST ----------------
Object.assign(CHARS, {
  eliza: { hat: 'bonnet', hatC: '#3a4466', ribbon: '#c8a040', skin: '#f0c8a0', hair: '#8a3a1a', shirt: '#2f4a6a', dress: '#2f4a6a', face: 'plain', bg: '#4a3a5a' },
  gus:   { hat: 'none', skin: '#e0a070', hair: '#2a1a10', shirt: '#f4efe0', vest: '#7a2a2a', pants: '#3a3a3a', boots: '#2a1a10', face: 'mustache', beardC: '#2a1a10' },
  newSheriff: { hat: 'cowboy', hatC: '#6b4a2a', skin: '#e0a070', hair: '#1b1410', shirt: '#8a2a2a', vest: '#3a2a20', pants: '#3a3550', boots: '#2a1a10', face: 'stubble', badge: true },
});
Object.assign(SPEAK, {
  eliza: { name: 'ELIZA HOLLOWAY', color: '#f0b8d8' },
  gus:   { name: 'GUS THE BARKEEP', color: '#f3d18b' },
});
const CH2_PATRONS = [ // card players + bar regulars
  { hat: 'cowboy', hatC: '#5a4a3a', skin: '#c98a5a', hair: '#2a1a10', shirt: '#6a7a8a', vest: '#3a3a3a', pants: '#3a3a4a', boots: '#2a1a10', face: 'stubble' },
  { hat: 'bowler', hatC: '#2a2a2a', skin: '#f0c090', hair: '#6a4a2a', shirt: '#d8d0c0', vest: '#4a2a5a', pants: '#2a2a2a', boots: '#1b1410', face: 'mustache', beardC: '#6a4a2a' },
  { hat: 'cowboy', hatC: '#8a7a5a', skin: '#e8b07a', hair: '#a0703a', shirt: '#9a4a3a', pants: '#4a3a2a', boots: '#3a2a1a', face: 'plain' },
  { hat: 'cowboy', hatC: '#2a2230', skin: '#d89a6a', hair: '#1b1410', shirt: '#4a6a4a', coat: '#3a2a20', pants: '#2a2a2a', boots: '#151515', face: 'beard', beardC: '#3a2a1a' },
  { hat: 'none', skin: '#f0c8a0', hair: '#c8c8c8', shirt: '#8a8a6a', vest: '#5a4a3a', pants: '#4a4a3a', boots: '#3a2a1a', face: 'beard', beardC: '#d8d8d8' },
  { hat: 'cowboy', hatC: '#c8a46a', skin: '#c98a5a', hair: '#3a2a1a', shirt: '#c8b070', pants: '#4a4a5a', boots: '#3a2a1a', face: 'plain' },
];

// tiny sign letters this chapter needs (newspaper headline, signs)
Object.assign(GLYPH, {
  P: ['110', '101', '110', '100', '100'], D: ['110', '101', '101', '101', '110'], G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'], '&': ['010', '101', '010', '101', '011'], C: ['011', '100', '100', '100', '011'],
});

// ---------------- MUSIC ----------------
const tuneNotes = s => s.replace(/\|/g, '').trim().split(/\s+/);
TUNES.morning = { // a slow, sunny porch waltz for the breakfast screen
  notes: tuneNotes('D4 - G4 - B4 - | D5 - - - B4 C5 | D5 - C5 - A4 - | G4 - - - - - | E4 - G4 - C5 - | B4 - - - A4 G4 | A4 - B4 - F#4 - | G4 - - - - -'),
  bass: ['G2', 'G2', 'C3', 'G2', 'C3', 'G2', 'D3', 'G2'], bar: 6, eighth: 60 / 84 / 2, vol: 0.08, style: 'waltz', birds: true,
};
TUNES.trail = { // driving minor-key gallop for the wagon race (kept low so the gunfire sits on top)
  notes: tuneNotes('D4 - F4 A4 - A4 G4 F4 | E4 - - - A3 - D4 E4 | F4 - A4 C5 - C5 A4 G4 | A4 - - - E4 - C#4 - | D4 - F4 A4 - D5 C5 A4 | A#4 - A4 G4 - F4 - D4 | E4 - F4 E4 - C#4 - A3 | D4 - - - - - - -'),
  bass: ['D2', 'D2', 'F2', 'A2', 'D2', 'A#2', 'A2', 'D2'], bar: 8, eighth: 60 / 176 / 2, vol: 0.055, style: 'gallop',
};

// ---------------- SHARED HELPERS ----------------
const CH2 = { enterAt: null, wagonAt: null };
function ch2Fig(spec, x, footY, flip) { // scale-1 character, feet at footY
  const img = getSprite(spec), y = footY - 31;
  if (!flip) { blit(img, x, y, 1); return; }
  g.save(); g.translate(x * 2 + GW + 2, 0); g.scale(-1, 1); blit(img, x, y, 1); g.restore();
}
function steam(x, y, k) { // a lazy wisp of steam rising from (x, y)
  for (let j = 0; j < 14; j++) {
    const sx = x + Math.round(Math.sin(j * 0.55 - clock * 2.6 + k) * 2), a = 0.32 * (1 - j / 14);
    R(sx, y - j * 2 - (Math.floor(clock * 6 + k) % 2), 1, 2, `rgba(255,255,255,${a})`);
  }
}
function fadeBlack(a) { if (a > 0) rect(0, 0, W, H, `rgba(0,0,0,${Math.min(1, a)})`); }
function narrBox(txt, n) { // narrator box in the dialog style
  panel(24, 352, 912, 176, '#2a1810');
  let left = n; wrap(txt, 52).forEach((l, i) => { text(l.slice(0, Math.max(0, left)), 54, 402 + i * 30, 16, '#f4efe0'); left -= l.length + 1; });
  if (n >= txt.length && Math.floor(clock * 3) % 2) { rect(894, 496, 18, 6, '#ffd23f'); rect(897, 502, 12, 6, '#ffd23f'); rect(900, 508, 6, 6, '#ffd23f'); }
}

// =====================================================================
//  SCENE 1: UPSTAIRS ROOM AT THE SALOON (night -> lamp out -> black)
// =====================================================================
const ROOM_TEXT = 'AFTER A LONG DAY AND A HEARTY STEAK AND POTATO DINNER, YOU TAKE A LONG REST.';
const QUILT = ['#b04a3a', '#d8b060', '#4a6a8a', '#e8e0cc', '#6a8a4a'];
function sleeper() {
  R(160, 79, 24, 10, '#f4efe0'); R(160, 79, 24, 1, '#ffffff'); R(160, 88, 24, 1, '#c8c0b0');
  R(160, 82, 5, 6, '#1b1410'); R(162, 88, 3, 1, '#1b1410');
  R(162, 81, 22, 2, '#6b4a2a'); R(161, 80, 2, 1, '#6b4a2a'); R(183, 80, 2, 1, '#6b4a2a'); R(166, 75, 14, 6, '#6b4a2a'); R(166, 79, 14, 1, '#3b2210'); R(168, 76, 2, 2, '#8a6a4a');
  const b = (Math.sin(clock * 1.6) + 1) / 2;
  for (let x = 178; x < 270; x++) {
    const k = (x - 178) / 91, top = 86 - Math.round((x < 228 ? 8 + b : 5) * Math.sin(Math.PI * Math.min(1, k * 1.1)));
    for (let y0 = 72; y0 < 100; y0 += 4) {
      const y1 = Math.max(y0, top + 1); if (y1 >= y0 + 4) continue;
      R(x, y1, 1, y0 + 4 - y1, x < 184 ? '#f4efe0' : QUILT[(((x - 184) / 6 | 0) + (y0 / 4) * 2) % QUILT.length]);
    }
    R(x, top, 1, 1, '#3b2210');
  }
  R(184, 78, 1, 22, '#c8c0b0');
}
function roomArt(lampOn) {
  R(0, 0, 320, 112, '#3e5654');
  for (let x = 0; x < 320; x += 12) R(x, 0, 4, 108, '#46605e');
  for (let y = 14; y < 104; y += 14) for (let x = 8 + ((y / 14) % 2) * 6; x < 320; x += 12) { R(x, y - 1, 1, 1, '#6a8a74'); R(x - 1, y, 3, 1, '#6a8a74'); R(x, y + 1, 1, 1, '#6a8a74'); }
  R(0, 0, 320, 7, '#3b2210'); R(0, 7, 320, 1, '#5a3418');
  R(24, 24, 60, 58, '#4a2a14'); R(27, 27, 54, 52, '#141c38');
  for (const [sx, sy] of [[31, 31], [40, 44], [47, 33], [33, 50], [58, 30], [75, 47], [70, 56], [36, 39]]) R(sx, sy, 1, 1, Math.floor(clock * 2 + sx) % 5 ? '#f4efe0' : '#8a90b0');
  disc(68, 38, 6, '#f4efd0'); disc(71, 36, 5, '#141c38');
  R(27, 66, 18, 13, '#0c1020'); R(45, 60, 14, 19, '#0c1020'); R(48, 56, 8, 4, '#0c1020'); R(59, 70, 22, 9, '#0c1020'); R(50, 66, 2, 2, '#e0a040');
  R(53, 27, 2, 52, '#4a2a14'); R(27, 52, 54, 2, '#4a2a14'); R(22, 82, 64, 3, '#6e4224');
  R(14, 18, 80, 2, '#c9a040');
  for (const cx of [18, 80]) { R(cx, 20, 10, 66, '#7a2a2a'); R(cx + 3, 20, 1, 66, '#5a1a1a'); R(cx + 7, 20, 1, 66, '#5a1a1a'); }
  R(100, 30, 22, 28, '#ecd8a4'); R(104, 35, 14, 3, '#1b1410'); R(106, 38, 10, 8, '#c98a5a'); R(107, 45, 8, 3, '#1b1410'); R(104, 52, 14, 1, '#5a3418'); R(104, 54, 10, 1, '#5a3418');
  line(101, 31, 121, 57, '#c0302b'); line(102, 31, 122, 57, '#c0302b'); line(121, 31, 101, 57, '#c0302b'); line(122, 31, 102, 57, '#c0302b');
  R(0, 106, 320, 6, '#3b2210'); R(0, 112, 320, 68, '#6e4224');
  for (const y of [116, 121, 127, 134, 142, 151, 161, 172]) R(0, y, 320, 1, '#5a3418');
  R(146, 116, 120, 16, '#7a2a2a'); R(149, 118, 114, 12, '#a8503a'); for (let x = 152; x < 260; x += 8) R(x, 123, 4, 2, '#e2b33c');
  R(150, 58, 8, 54, '#5a3418'); R(150, 58, 8, 2, '#9a6236'); disc(154, 55, 3, '#9a6236');
  R(158, 96, 112, 6, '#4a2a14'); R(160, 102, 4, 10, '#3b2210'); R(264, 102, 4, 10, '#3b2210');
  R(158, 88, 112, 8, '#e8e0cc');
  sleeper();
  R(270, 76, 8, 36, '#5a3418'); R(270, 76, 8, 2, '#9a6236'); disc(274, 73, 3, '#9a6236');
  R(144, 60, 2, 20, '#4a2a14'); R(144, 60, 8, 2, '#4a2a14'); R(141, 76, 8, 13, '#3b2210'); R(142, 72, 4, 5, '#b8b8c0');
  R(284, 96, 6, 14, '#4a2a14'); R(284, 108, 11, 4, '#4a2a14'); R(286, 98, 1, 10, '#6a4020');
  R(298, 106, 16, 6, '#4a2a14'); R(310, 101, 5, 5, '#4a2a14'); R(300, 107, 10, 1, '#6a4020');
  R(116, 88, 30, 3, '#8a5530'); R(118, 91, 26, 21, '#6e4224'); R(122, 96, 18, 6, '#5a3418'); R(130, 98, 2, 2, '#c9a040');
  R(133, 86, 12, 2, '#f4efe0'); R(135, 84, 7, 2, '#f0e8d8'); R(137, 83, 2, 1, '#f0e8d8'); R(144, 84, 1, 3, '#b8b8c0');
  R(120, 84, 10, 4, '#c9a040'); R(121, 78, 8, 6, '#8ab0a0'); R(122, 67, 6, 11, '#b8ccc8'); R(122, 67, 1, 11, '#e0ecea');
  if (lampOn) { const fh = 4 + (Math.floor(clock * 9) % 3 === 0 ? 1 : 0); R(124, 76 - fh, 2, fh, '#ffd23f'); R(124, 75, 2, 1, '#ff9a3a'); }
  if (lampOn) {
    R(0, 0, 320, 180, 'rgba(10,8,30,0.28)');
    for (const [r, a] of [[70, 0.05], [48, 0.06], [30, 0.07], [16, 0.08]]) disc(125, 72, r, `rgba(255,190,110,${a})`);
  } else {
    R(0, 0, 320, 180, 'rgba(4,6,22,0.68)');
    for (let k = 0; k < 40; k++) R(28 + k, 112 + Math.floor(k / 2), 40, 1, 'rgba(150,170,230,0.10)');
  }
}
SCENES.ch2Room = {
  tune: null,
  enter() { this.phase = 'in'; this.textT = 0; this.doneT = 0; this.outT = 0; this.cricket = 1; },
  shown() { return Math.floor(this.textT * 30); },
  update(dt) {
    if (this.phase === 'in') {
      if (this.t > 1) this.textT += dt;
      if (this.shown() >= ROOM_TEXT.length) { this.doneT += dt; if (this.doneT > 4) this.goOut(); }
    } else {
      const before = this.outT; this.outT += dt;
      if (before < 0.6 && this.outT >= 0.6) noise(0.18, 0.12, 900);
      if (this.outT > 3.3) startScene('ch2Title');
    }
    this.cricket -= dt;
    if (this.cricket <= 0 && this.outT < 2.2) { for (let i = 0; i < 3; i++) setTimeout(() => tone('sine', 4300, 4250, 0.035, 0.025), i * 70); this.cricket = 0.9 + Math.random() * 1.6; }
  },
  goOut() { if (this.phase === 'in') { this.phase = 'out'; this.outT = 0; } },
  tap() {
    if (this.t < 0.4) return; // ignore the tap that pressed CONTINUE
    if (this.phase === 'in') { if (this.shown() < ROOM_TEXT.length) this.textT = 99; else this.goOut(); }
    else this.outT = Math.max(this.outT, 2.6);
  },
  key() { this.tap(); },
  world() { roomArt(!(this.phase === 'out' && this.outT >= 0.6)); },
  ui() {
    for (let i = 0; i < 3; i++) {
      const p = (clock * 0.45 + i / 3) % 1;
      ctx.globalAlpha = (1 - p) * (this.phase === 'out' ? Math.max(0, 1 - this.outT) : 1);
      text('Z', 540 + p * 50 + Math.sin(p * 6) * 8, 200 - p * 90, 16 + Math.round(p * 2) * 8, '#f4efe0', 'center');
      ctx.globalAlpha = 1;
    }
    narrBox(ROOM_TEXT, this.shown());
    fadeBlack(this.phase === 'in' ? 1 - this.t / 1.2 : (this.outT - 1.0) / 1.6);
  },
};

// =====================================================================
//  SCENE 2: CHAPTER 2 TITLE — breakfast table + choose your badge
// =====================================================================
function gingham(x, y, w, h, s) {
  for (let j = 0; j < h; j += s) for (let i = 0; i < w; i += s) {
    const a = (i / s) % 2 === 0, b = (j / s) % 2 === 0;
    R(x + i, y + j, Math.min(s, w - i), Math.min(s, h - j), a && b ? '#b02a26' : a || b ? '#e08a84' : '#f4efe0');
  }
}
function speckled(x, y, w, h, c) { R(x, y, w, h, c); for (let j = 1; j < h; j += 3) for (let i = 1 + (j % 2); i < w; i += 4) R(x + i, y + j, 1, 1, '#dfe6f0'); }
function breakfastArt() {
  for (let y = 0; y < 96; y += 10) { R(0, y, 320, 10, '#8a5a30'); R(0, y, 320, 1, '#a8703c'); R(0, y + 8, 320, 2, '#5a3418'); }
  for (const [x, y] of [[30, 12], [120, 42], [200, 22], [280, 82], [60, 72], [170, 82]]) R(x, y + 3, 6, 2, '#6e4224');
  R(220, 12, 84, 64, '#4a2a14');
  ['#9ec8e8', '#cfe3ee', '#fbe0b0', '#f6c27a'].forEach((c, i) => R(223, 15 + i * 14, 78, 14, c));
  disc(266, 64, 9, '#fff2b0'); R(223, 62, 78, 11, '#c07a5a'); R(232, 58, 22, 4, '#c07a5a'); R(274, 56, 16, 6, '#a86a4a'); R(223, 70, 78, 3, '#8a5a3a');
  R(261, 15, 2, 58, '#4a2a14'); R(223, 43, 78, 2, '#4a2a14'); R(218, 76, 88, 3, '#6e4224');
  for (const cx of [212, 298]) { gingham(cx, 8, 12, 70, 3); }
  R(208, 6, 104, 2, '#3b2210');
  R(40, 16, 2, 9, '#8a8a96'); R(52, 16, 2, 9, '#8a8a96'); R(42, 25, 10, 2, '#8a8a96'); R(41, 24, 1, 1, '#8a8a96'); R(52, 24, 1, 1, '#8a8a96'); R(46, 12, 2, 3, '#3b2210');
  R(14, 46, 84, 3, '#5a3418'); R(18, 49, 2, 6, '#3b2210'); R(90, 49, 2, 6, '#3b2210');
  R(20, 32, 16, 14, '#e8dcc0'); R(22, 30, 12, 3, '#e8dcc0'); R(24, 38, 8, 3, '#8a5a30');
  R(42, 36, 10, 10, '#a8a8b0'); R(42, 38, 10, 4, '#c0302b'); R(56, 38, 9, 8, '#a8a8b0'); R(56, 40, 9, 3, '#3a6a3a');
  R(70, 34, 10, 12, '#d8eef0'); R(70, 34, 10, 2, '#8a5a30'); R(72, 38, 6, 7, '#e2b33c');
  for (let k = 0; k < 64; k++) R(214 - k * 1.3, 76 + k * 0.9, 46, 1, 'rgba(255,240,190,0.07)');
  for (let i = 0; i < 7; i++) { const p = (clock * 0.05 + i * 0.143) % 1; R(Math.round(200 - p * 70 + Math.sin(clock + i) * 3), Math.round(80 + p * 40), 1, 1, 'rgba(255,250,220,0.8)'); }
  R(0, 92, 320, 88, '#3b2210');
  gingham(6, 96, 308, 24, 4); gingham(6, 120, 308, 32, 6); R(6, 120, 308, 1, 'rgba(0,0,0,0.25)');
  for (let x = 6; x < 314; x += 12) R(x + 4, 152, 4, 2, '#b02a26');
  speckled(42, 72, 22, 34, '#3a5a8a'); speckled(46, 66, 14, 6, '#3a5a8a'); R(51, 62, 4, 4, '#2a2a2a'); R(45, 76, 2, 26, '#6a8ab8');
  line(64, 84, 72, 74, '#3a5a8a'); line(64, 85, 73, 75, '#3a5a8a'); line(64, 86, 73, 76, '#3a5a8a');
  R(36, 76, 6, 2, '#2a2a2a'); R(36, 76, 2, 22, '#2a2a2a'); R(36, 96, 6, 2, '#2a2a2a'); R(40, 104, 26, 3, 'rgba(0,0,0,0.2)');
  steam(73, 72, 0);
  R(86, 104, 14, 1, '#c8c8d0'); R(100, 103, 4, 1, '#c8c8d0'); R(100, 105, 4, 1, '#c8c8d0'); R(100, 104, 4, 1, '#c8c8d0');
  R(106, 102, 88, 6, '#f4efe0'); R(110, 100, 80, 2, '#f4efe0'); R(110, 108, 80, 2, '#d8d0c0'); R(104, 110, 92, 2, 'rgba(0,0,0,0.18)');
  for (let i = 0; i < 6; i++) { const ox = [0, 1, -1, 1, 0, -1][i], y = 97 - i * 5; R(120 + ox, y, 44, 5, '#d8a050'); R(120 + ox, y, 44, 1, '#f0c070'); R(120 + ox, y + 4, 44, 1, '#a8702c'); }
  R(119, 70, 46, 2, '#8a3a10'); R(122, 72, 2, 11, '#8a3a10'); R(160, 72, 2, 16, '#8a3a10'); R(141, 72, 2, 7, '#8a3a10'); R(160, 100, 8, 2, '#a04a14');
  R(136, 65, 11, 5, '#fff2a0'); R(137, 65, 4, 1, '#ffffff'); R(141, 70, 3, 1, '#fff2a0');
  R(168, 101, 20, 4, '#f4efe0'); R(170, 99, 14, 2, '#f4efe0'); disc(177, 101, 3, '#f0a020'); R(176, 99, 1, 1, '#ffe080');
  for (let i = 0; i < 26; i++) { const y = 104 + (i % 8 < 4 ? 0 : 1); R(124 + i, y, 1, 2, '#a83a2a'); R(124 + i, y + 2, 1, 1, '#f0c8a0'); }
  R(203, 90, 9, 14, '#b07a3a'); gingham(202, 87, 11, 3, 1); R(204, 94, 7, 4, '#ecd8a4');
  R(214, 90, 9, 14, '#6a2a7a'); gingham(213, 87, 11, 3, 1); R(215, 94, 7, 4, '#ecd8a4'); R(215, 91, 1, 10, '#9a5aa8');
  speckled(230, 84, 18, 22, '#3a5a8a'); R(230, 84, 18, 2, '#e8e8f0'); R(231, 85, 16, 1, '#3a1a0a');
  R(248, 88, 5, 2, '#3a5a8a'); R(251, 88, 2, 11, '#3a5a8a'); R(248, 97, 5, 2, '#3a5a8a'); R(228, 106, 22, 2, 'rgba(0,0,0,0.2)');
  steam(236, 82, 1.7); steam(242, 82, 3.1);
  R(254, 91, 58, 24, '#e8e0cc'); R(254, 91, 58, 1, '#ffffff'); R(254, 114, 58, 1, '#c8c0a8');
  signText('PB&J RAILROAD', 283, 94, '#1b1410'); signText('HIRING', 283, 101, '#8a1f1a');
  for (const y of [108, 111]) { R(258, y, 22, 1, '#8a8478'); R(286, y, 22, 1, '#8a8478'); }
}
SCENES.ch2Title = {
  tune: 'morning',
  world: breakfastArt,
  ui() {
    rect(0, 0, W, 124, 'rgba(20,10,5,0.45)');
    text('CHAPTER 2', W / 2, 22, 48, '#ffd23f', 'center');
    if (Math.floor(clock * 2.5) % 2) text('CHOOSE YOUR BADGE', W / 2, 88, 16, '#ffffff', 'center');
    button(BTN.yellow, 'YELLOW BELLY'); button(BTN.deputy, 'DEPUTY'); button(BTN.gunslinger, 'GUNSLINGER');
    for (const k in BTN) if (bests[k]) text('BEST ' + bests[k], BTN[k].x + BTN[k].w / 2, 440, 16, '#ffd23f', 'center');
    smallBtn(TITLE_BTN, 'TITLE');
    fadeBlack(1 - this.t / 1.2);
  },
  tap(x, y) {
    if (this.t < 0.6) return;
    if (inBox(x, y, TITLE_BTN)) { toTitle(); return; }
    for (const k in BTN) if (inBox(x, y, BTN[k])) { sfx.blip(); startGame(k, STORY2); return; }
  },
};

// =====================================================================
//  SCENE 3: THE SALOON, NEXT MORNING (zoomed-out cross-section)
// =====================================================================
function wallpaper(y0, h) {
  R(0, y0, 320, h, '#6b1f24');
  for (let y = y0 + 4; y < y0 + h; y += 8) for (let x = (y / 8 % 2) * 4; x < 320; x += 8) { R(x, y, 2, 1, '#83303a'); R(x, y + 1, 1, 1, '#83303a'); }
}
function cardTable(cx, seed) {
  R(cx - 20, 100, 40, 3, '#2f5a3a'); R(cx - 20, 100, 40, 1, '#4a7a52'); R(cx - 18, 103, 36, 15, '#24452c'); R(cx - 18, 117, 36, 1, '#18301e');
  for (let i = 0; i < 4; i++) { R(cx - 14 + i * 8, 99, 3, 2, '#f4efe0'); R(cx - 13 + i * 8, 99, 1, 1, i % 2 ? '#c0302b' : INK); }
  ['#c0302b', '#f4efe0', '#4a7ab8'].forEach((c, i) => R(cx + 8 + i * 3, 98 - (seed + i) % 3, 2, 2 + (seed + i) % 3, c));
}
function saloonWideArt(quiet) {
  const bob = i => (quiet ? 0 : Math.floor(clock * 4 + i) % 2);
  wallpaper(0, 46); R(0, 0, 320, 5, '#3b2210');
  [[1, 34], [2, 132], [3, 230]].forEach(([n, x]) => {
    R(x, 10, 24, 34, '#3b2210'); R(x + 2, 12, 20, 32, '#5a3418'); R(x + 4, 14, 16, 12, '#4a2a14'); R(x + 4, 29, 16, 12, '#4a2a14'); R(x + 18, 28, 2, 2, '#c9a040');
    R(x + 9, 5, 6, 4, '#c9a040'); R(x + 11, 6, 2, 2, '#3b2210');
  });
  R(34, 12, 4, 32, '#141010');
  R(0, 34, 320, 2, '#7a4a28'); R(0, 34, 320, 1, '#a8703c'); for (let x = 2; x < 320; x += 5) R(x, 36, 2, 8, '#6e4224');
  R(0, 44, 320, 4, '#5a3418'); R(0, 44, 320, 1, '#9a6236'); R(0, 48, 320, 2, '#2a120c');
  wallpaper(50, 42); R(0, 92, 320, 20, '#6e4224'); for (let x = 2; x < 320; x += 24) { R(x, 95, 20, 14, '#7a4a28'); R(x, 95, 20, 1, '#9a6236'); }
  for (const x of [96, 214]) { R(x, 48, 4, 64, '#5a3418'); R(x, 48, 1, 64, '#9a6236'); }
  R(8, 58, 28, 54, '#f4d79a'); R(8, 58, 28, 10, '#bcdcf0'); R(8, 96, 28, 16, '#c4914f');
  R(6, 56, 32, 2, '#3b2210'); R(6, 56, 2, 56, '#3b2210'); R(36, 56, 2, 56, '#3b2210');
  const since = CH2.enterAt == null ? 99 : clock - CH2.enterAt, swing = since < 2 ? Math.sin(since * 13) * (1 - since / 2) : 0;
  const dw = Math.max(3, Math.round(12 * (1 - Math.abs(swing) * 0.75)));
  R(8, 76, dw, 18, '#9a6236'); R(8, 76, dw, 1, '#c98a4b'); R(36 - dw, 76, dw, 18, '#9a6236'); R(36 - dw, 76, dw, 1, '#c98a4b');
  R(0, 112, 320, 68, '#7a4a28'); for (const y of [115, 119, 124, 130, 137, 145, 154, 164, 175]) R(0, y, 320, 1, '#5a3418');
  R(160, 50, 1, 6, '#3b2210'); R(150, 57, 22, 2, '#c9a040'); R(155, 59, 12, 1, '#a88030');
  for (const cx of [151, 157, 164, 170]) { R(cx, 53, 2, 4, '#f4efe0'); R(cx, 51 - (Math.floor(clock * 8 + cx) % 2), 2, 2, '#ffd23f'); }
  R(40, 80, 30, 32, '#2a1a14'); R(38, 78, 34, 3, '#3b2a20'); R(64, 90, 8, 4, '#f4efe0'); R(42, 84, 20, 10, '#3b2a20'); R(44, 72, 8, 6, '#f4efe0');
  ch2Fig({ ...CHARS.pete, pose: 'idle' }, 66, 112 - bob(0), true);
  if (!quiet && Math.floor(clock * 3) % 2) R(52, 62 - Math.floor(clock * 6) % 4, 2, 3, '#f4efe0');
  ch2Fig({ ...CH2_PATRONS[0], pose: 'idle' }, 98, 116 - bob(1)); ch2Fig({ ...CH2_PATRONS[1], pose: bob(2) ? 'drink' : 'idle' }, 118, 116); cardTable(118, 0);
  ch2Fig({ ...CH2_PATRONS[2], pose: 'idle' }, 164, 116 - bob(3)); ch2Fig({ ...CH2_PATRONS[3], pose: 'idle' }, 180, 116); ch2Fig({ ...CH2_PATRONS[4], pose: 'idle' }, 196, 116 - bob(4), true); cardTable(188, 1);
  R(176, 114, 16, 4, '#8a5a30'); R(190, 112, 6, 5, '#8a5a30'); R(194, 114, 3, 2, '#6a4020'); R(190, 112, 2, 3, '#5a3418'); R(172, 116, 5, 1, '#8a5a30'); R(192, 113, 1, 1, INK);
  R(226, 56, 94, 3, '#5a3418'); R(226, 70, 94, 3, '#5a3418');
  ['#3a7a3a', '#7a4a1a', '#8a2a2a', '#c8d8d0', '#4a6a8a'].forEach((c, i) => { R(230 + i * 18, 48, 4, 8, c); R(231 + i * 18, 46, 2, 2, c); R(238 + i * 18, 62, 4, 8, c); });
  R(250, 74, 52, 16, '#7fa0a8'); R(252, 76, 6, 1, '#c8e0e4');
  ch2Fig({ ...CHARS.gus, pose: quiet ? 'idle' : (bob(5) ? 'wave' : 'idle') }, 276, 108);
  R(222, 90, 98, 3, '#a8703c'); R(224, 93, 96, 19, '#7a4a28'); for (let x = 228; x < 320; x += 24) { R(x, 96, 18, 12, '#8a5530'); R(x, 96, 18, 1, '#a8703c'); }
  R(224, 108, 96, 2, '#c9a040');
  ch2Fig({ ...CH2_PATRONS[5], pose: bob(6) ? 'drink' : 'idle' }, 232, 112); ch2Fig({ ...CH2_PATRONS[1], hatC: '#5a2a2a', shirt: '#7a8a6a', pose: 'idle' }, 252, 112, true);
  R(216, 106, 6, 6, '#c9a040'); R(217, 105, 4, 1, '#e2b33c');
}
function drawEliza() {
  if (CH2.enterAt == null) return;
  const t = clock - CH2.enterAt, x = Math.min(140, 12 + t * 36), walking = x < 140;
  const fr = walking && Math.floor(clock * 7) % 2;
  ch2Fig({ ...CHARS.eliza, pose: 'idle', step: fr ? 1 : 0 }, Math.round(x), 113 - (fr ? 1 : 0));
}
const GUS_LINE = 6;
CUTS.ch2Saloon = {
  set: 'saloonWide', actors: [],
  start() { CH2.enterAt = null; },
  after() { if (CH2.enterAt == null && cutLine >= 1) CH2.enterAt = clock; drawEliza(); },
  lines: [
    ['narr', 'THE NEXT MORNING. THE SALOON IS ALREADY BUSY.'],
    ['narr', 'THEN THE DOORS SWING OPEN, AND THE WHOLE ROOM GOES QUIET.'],
    ['eliza', "YOU THE NEW SHERIFF? I'M ELIZA HOLLOWAY. I NEED YOUR HELP."],
    ['eliza', "MY HUSBAND JEB TOOK A JOB HAULIN' SUPPLIES FOR THE PB&J RAILROAD. NOW HE'S MISSIN'."],
    ['eliza', "HIS LAST LETTER CAME FROM CRYSTAL CANYON. THE RAILROAD SAYS THEY DON'T KNOW WHERE HE IS."],
    ['eliza', "GETTIN' THERE MEANS CROSSIN' NATIVE TERRITORY. I NEED A HIRED GUN. I CAN'T PAY MUCH, BUT I MAKE A MEAN PEACH COBBLER."],
    ['gus', "SHE AIN'T LYIN' ABOUT THE COBBLER, SHERIFF."],
    ['eliza', "AND I BREW THE STRONGEST COFFEE THIS SIDE OF THE MISSISSIPPI."],
    ['eliza', "I'M GIVIN' MY HORSES A BUCKET EACH. WE'LL BE THERE BY SUNDOWN."],
    ['eliza', 'WE LEAVE IN AN HOUR.'],
  ],
};
SETS.saloonWide = { bg: () => saloonWideArt(CH2.enterAt != null && state === 'cut' && cutLine < GUS_LINE), fg: () => {} };

// =====================================================================
//  HORSES (side view, 32x24 grid, facing right unless flipped)
// =====================================================================
const HORSE_COATS = {
  bay:      { coat: '#8a4a24', dark: '#5a2e14', mane: '#2a1a10', light: '#a8603a' },
  black:    { coat: '#2e2a2a', dark: '#1a1616', mane: '#0e0c0c', light: '#4a4444' },
  chestnut: { coat: '#b0602a', dark: '#7a3e18', mane: '#6a3010', light: '#c87a40' },
  gray:     { coat: '#a8a8a8', dark: '#7a7a7a', mane: '#e8e8e8', light: '#c8c8c8' },
  pinto:    { coat: '#f0ece0', dark: '#c8c0b0', mane: '#3a2a1a', light: '#ffffff', spots: '#8a4a24' },
  palomino: { coat: '#d8a850', dark: '#a87a30', mane: '#f4efe0', light: '#ecc070' },
};
function horse(x, y, sc, fr, Hc, flip, blanket, moving = true) {
  let ox = 0, oy = 0, ink = false;
  const hp = (lx, ly, w, h, c) => R((flip ? x + (32 - lx - w) * sc : x + lx * sc) + ox, y + ly * sc + oy, w * sc, h * sc, ink ? INK : c);
  const OFF = [-2, -1, 1, 2];
  const shape = () => {
    hp(2, 6, 3, 2, Hc.mane); hp(0, 8, 3, 6, Hc.mane); hp(1, 14, 2, 2, Hc.mane);
    [[6, 0], [9, 2], [20, 1], [23, 3]].forEach(([lx, ph], i) => {
      const o = moving ? OFF[(fr + ph) % 4] : 0, c = i % 2 ? Hc.coat : Hc.dark;
      hp(lx, 15, 2, 4, c); hp(lx + o, 19, 2, 3, c); hp(lx + o, 22, 2, 1, '#2a1a10');
    });
    hp(5, 7, 19, 9, Hc.coat); hp(4, 8, 1, 7, Hc.coat); hp(24, 8, 1, 6, Hc.coat);
    hp(21, 2, 5, 8, Hc.coat); hp(23, 0, 5, 3, Hc.coat); hp(26, 1, 4, 4, Hc.coat); hp(28, 4, 4, 3, Hc.coat);
    hp(24, -1, 1, 2, Hc.coat);
    hp(20, 1, 2, 7, Hc.mane); hp(22, 0, 2, 2, Hc.mane);
  };
  ink = true; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { ox = dx; oy = dy; shape(); }
  ink = false; ox = oy = 0; shape();
  if (Hc.spots) { hp(8, 8, 5, 4, Hc.spots); hp(15, 11, 4, 3, Hc.spots); hp(22, 3, 3, 3, Hc.spots); }
  hp(6, 7, 17, 1, Hc.light); hp(6, 15, 17, 1, Hc.dark); hp(30, 5, 2, 2, Hc.dark); hp(27, 2, 1, 1, INK);
  if (blanket) { hp(10, 6, 9, 5, blanket); hp(10, 10, 9, 1, shade(blanket, 0.7)); hp(12, 5, 5, 2, '#5a3418'); }
}
function blitFlip(img, x, y, sc, flip, shear = 0) {
  if (!flip) { blit(img, x, y, sc, shear); return; }
  g.save(); g.translate(x * 2 + (GW + 2) * sc, 0); g.scale(-1, 1); blit(img, x, y, sc, shear); g.restore();
}

// =====================================================================
//  LEVEL: THE TRAIL — a breakneck wagon race to Aunt Mae's cabin.
//  Pseudo-3D dirt road with curves, bridges, rocks, logs, broken planks,
//  and a handful of riders who try their luck. Hold an arrow to steer;
//  every bend flings the wagon toward the outside of the turn.
//  World x: road runs from -1.5 to 1.5. z = distance ahead (1 = under the horses' noses).
// =====================================================================
const HZ = 66, FOC = 104, GND = LH - HZ, FAR = 24, SPAWN = 22;
const RACE_V = { yellow: 7.5, deputy: 9, gunslinger: 13 }; // ridiculous speed
const MPH_PER_V = 6.8;                                      // speedometer: 13 = 88 MPH
const TRAIL_EASE = 1.35;                                    // riders give you this much extra time vs. chapter 1
const RIDE = {};
// free steering: hold an arrow and the team pulls that way; curves fling the wagon toward the outside
const STEER_ACC = 11, STEER_DRAG = 4, FLING = 0.6, ROAD_EDGE = 1.5, WAGON_HALF = 0.35;
const NATIVE_RIDERS = [
  { hat: 'feather', hatC: '#c0302b', featherC: '#f4efe0', skin: '#b8784a', hair: '#1b1410', hairLong: true, shirt: '#c8a070', vest: '#8a5a30', pants: '#8a6a40', boots: '#6a4a2a', face: 'plain' },
  { hat: 'feather', hatC: '#2a6a8a', featherC: '#3b2210', skin: '#a86a40', hair: '#1b1410', hairLong: true, shirt: '#b89060', pants: '#6a4a2a', boots: '#5a3a1a', face: 'plain' },
  { hat: 'feather', hatC: '#e2b33c', featherC: '#c0302b', skin: '#c08050', hair: '#2a1a10', hairLong: true, shirt: '#d8b888', vest: '#3a6a5a', pants: '#7a5a3a', boots: '#6a4a2a', face: 'plain' },
];

// The course (seconds into the race):
//   ['rock', t, lane]  ['log', t, laneA, laneB]  ['hole', t, lane] (broken planks, bridges only)
//   ['curve', t, seconds, bend (+ right / - left)]  ['bridge', t, seconds]
//   ['R', t, side L/R, near 1 / far 0, 'bandit' | 'native', seconds before they fire]
//   ['bird', t, dir]  ['bottles', t, side]  ['tumble', t, dir]  ['boost', t]  ['sign', t]
const RACE = [
  ['rock', 2.0, 0],
  ['curve', 3.0, 3.5, 0.035], ['rock', 3.8, 1],
  ['bird', 4.5, 1],
  ['log', 5.6, -1, 0],
  ['R', 6.5, 'L', 1, 'bandit', 1.7],
  ['rock', 7.6, -1], ['rock', 8.4, 1],
  ['curve', 9.0, 3, -0.045], ['log', 9.8, 0, 1],
  ['bottles', 10.5, 'L'],
  ['bridge', 12.0, 3.2], ['hole', 12.6, 0], ['hole', 13.6, -1], ['hole', 14.4, 1],
  ['R', 12.2, 'L', 1, 'native', 1.6, 'river'], // waits for the first river, rides it on a dolphin
  ['R', 18.5, 'R', 0, 'native', 1.6],
  ['rock', 17.0, 0],
  ['curve', 18.0, 4, 0.045], ['rock', 18.8, 1], ['log', 19.8, -1, 0], ['rock', 21.0, -1],
  ['tumble', 21.5, -1],
  ['jump', 21.8, 1],
  ['log', 24.3, -1, 0],
  ['curve', 24.5, 3, -0.05], ['rock', 25.2, -1], ['rock', 26.0, 0],
  ['bird', 26.5, -1], ['bird', 27.0, -1],
  ['bridge', 28.5, 3.5], ['hole', 29.0, 1], ['hole', 29.8, 0], ['hole', 30.6, -1], ['hole', 31.3, 1],
  ['R', 28.7, 'R', 1, 'native', 1.5, 'river'], // ...and the second one
  ['curve', 33.5, 4, 0.04], ['log', 34.5, -1, 0], ['rock', 35.5, 1], ['rock', 36.3, 0],
  ['bottles', 36.5, 'R'],
  ['R', 37.5, 'L', 1, 'bandit', 1.4],
  ['curve', 38.5, 3, -0.04], ['log', 39.2, 0, 1], ['rock', 40.2, -1],
  ['tumble', 40.5, 1],
  ['boost', 42.0], ['sign', 42.5],
  ['jump', 43.2, -1],
].sort((a, b) => a[1] - b[1]);
const RACE_END = 48;

// ---------------- road geometry (curves bend the road toward the horizon) ----------------
const SH_STEP = 0.2, SH = new Float32Array(Math.ceil(FAR / SH_STEP) + 2);
function curvAt(z) {
  let k = 0;
  for (const c of RIDE.curves) if (z >= c.z && z <= c.z + c.len) k += c.k * Math.min(1, (z - c.z) / 2, (c.z + c.len - z) / 2);
  return k;
}
function buildShift() { let x = 0, slope = 0; for (let i = 0; i < SH.length; i++) { SH[i] = x; slope += curvAt(i * SH_STEP) * SH_STEP; x += slope * SH_STEP; } }
const shiftAt = z => { const f = Math.max(0, Math.min(SH.length - 1.001, z / SH_STEP)), i = f | 0; return SH[i] + (SH[i + 1] - SH[i]) * (f - i); };
const projY = z => (RIDE.hzE == null ? HZ : RIDE.hzE) + GND * (RIDE.camH || 1) / z;
const projX = (wx, z) => 160 + (wx + shiftAt(z) - RIDE.cam) * FOC / z;
const onBridge = z => RIDE.bridges.some(b => z >= b.z && z <= b.z + b.len);

// ---------------- spawning ----------------
function spawnDeco(z) {
  const side = Math.random() < 0.5 ? -1 : 1, k = Math.random();
  RIDE.deco.push({ kind: k < 0.4 ? 'cactus' : k < 0.75 ? 'bush' : 'stone', wx: side * (2.3 + Math.random() * 3.2), z, s: 0.8 + Math.random() * 0.5 });
}
function mkRider(e) {
  const [, , sideS, near, who, win] = e, side = sideS === 'L' ? -1 : 1;
  const spec = who === 'bandit' ? pick(OUTLAWS) : pick(NATIVE_RIDERS);
  const coat = HORSE_COATS[who === 'native' ? pick(['pinto', 'palomino', 'bay']) : pick(['black', 'bay', 'gray'])];
  const tx = near ? (side < 0 ? 2 : LW - 66) : (side < 0 ? 66 : LW - 98);
  const r = { near: !!near, side, who, type: 'outlaw', spec, coat, blanket: who === 'native' ? pick(['#c0302b', '#2a6a8a', '#e2b33c']) : '#3a2a2a',
    window: win * diff.mult * TRAIL_EASE, phase: 'in', age: 0, dead: false, deadTime: 0, seed: Math.random() * 4,
    x: side < 0 ? (near ? -80 : -40) : LW + (near ? 16 : 8), tx };
  r.dolphin = onRiver(r); // what they're riding is decided when they show up
  return r;
}
const slotBusy = r => RIDE.riders.some(o => o.near === r.near && o.side === r.side);
const revealed = r => true; // everyone on this trail is hostile

// ---------------- dolphin (for riders crossing the river) ----------------
// same 32x24 footprint as the horse so the rider sits in the same saddle spot
function dolphin(x, y, sc, fr, flip, blanket) {
  let ox = 0, oy = 0, ink = false;
  const dp = (lx, ly, w, h, c) => R((flip ? x + (32 - lx - w) * sc : x + lx * sc) + ox, y + ly * sc + oy, w * sc, h * sc, ink ? INK : c);
  const C = '#5f8fb4', D = '#3e6a8e', B = '#d8e6ee', arc = [0, 1, 2, 1][fr % 4];
  const shape = () => {
    dp(0, 6 - arc, 4, 3, C); dp(1, 9 - arc, 3, 3, C); dp(3, 8 - arc, 3, 2, C);                // tail flukes
    dp(5, 9, 4, 4, C); dp(8, 8, 18, 8, C); dp(10, 7, 14, 1, C); dp(10, 16, 14, 1, C);         // body
    dp(26, 9, 3, 6, C); dp(29, 11, 3, 3, C);                                                  // head + snout
    dp(15, 3, 3, 5, C); dp(14, 6, 2, 2, C);                                                   // dorsal fin
    dp(19, 15, 4, 3, C);                                                                      // flipper
  };
  ink = true; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { ox = dx; oy = dy; shape(); }
  ink = false; ox = oy = 0; shape();
  dp(9, 13, 18, 3, B); dp(27, 13, 4, 2, B);                                                   // pale belly
  dp(9, 8, 16, 1, D); dp(26, 9, 3, 1, D);                                                     // shading along the back
  dp(27, 10, 1, 1, INK); dp(28, 13, 3, 1, D);                                                 // eye + smile
  if (blanket) { dp(12, 7, 9, 3, blanket); dp(12, 9, 9, 1, shade(blanket, 0.7)); }
  const wy = y + 17 * sc, f = Math.floor(clock * 10) % 2;                                     // bow wave + splashes
  R(x + 2 * sc, wy, 28 * sc, 2 * sc, 'rgba(230,245,255,0.85)');
  for (let i = 0; i < 4; i++) R((flip ? x + (32 - 30 - i * 2) * sc : x + (30 + i * 2) * sc), wy - (i % 2 + f) * sc, sc, sc, '#e8f4ff');
  for (let i = 0; i < 3; i++) R((flip ? x + (32 - 2 + i * 2) * sc : x + (2 - i * 2) * sc), wy - (1 + ((i + f) % 2)) * sc, sc, sc, '#e8f4ff');
}
const riderZ = r => (r.near ? 1.6 : 3.4);
const onRiver = r => onBridge(riderZ(r)); // over the bridge, the roadside is river
// a dolphin heads off before the riverbank arrives; a horse peels away before it hits the water
const wrongGround = r => (r.dolphin ? !onBridge(riderZ(r) + 4) : onBridge(riderZ(r) + 2.5)); // dolphins see the bank coming further out
function mount(r, x, y, sc, fr, flip) { if (r.dolphin) dolphin(x, y, sc, fr, flip, r.blanket); else horse(x, y, sc, fr, r.coat, flip, r.blanket); }

// ---------------- riders (side view) ----------------
function riderGeom(r) {
  const sc = r.near ? 2 : 1, base = r.near ? 154 : 100, fr = Math.floor(clock * 12 + r.seed) % 4, bob = fr === 1 || fr === 2 ? sc : 0;
  const hx = Math.round(r.x - RIDE.cam * (r.near ? 34 : 14)), hy = base - 23 * sc - bob, flip = r.side > 0;
  const sx = hx + (flip ? 18 : 14) * sc - 10 * sc, sy = hy + 7 * sc - 21 * sc;
  return { sc, fr, hx, hy, flip, sx, sy };
}
const riderBox = (r, G) => ({ x: G.sx + 3 * G.sc, y: G.sy, w: 14 * G.sc, h: 24 * G.sc });
function drawRider(r) {
  const G = riderGeom(r), sc = G.sc;
  if (r.dead) { // the mount runs straight off the side of the screen, the rider tumbles off the back
    const t = r.deadTime, dir = r.side;
    mount(r, G.hx + Math.round(dir * t * 90 * sc), G.hy, sc, G.fr, G.flip);
    const fx = G.sx - Math.round(dir * t * 20 * sc), fy = G.sy + Math.round(-30 * sc * t + 220 * sc * t * t);
    if (fy < LH + 10) blitFlip(getSprite({ ...r.spec, pose: 'hit', hat: 'none' }, t < 0.1), fx, fy, sc, G.flip, Math.round(-dir * Math.min(1, t * 3) * 8));
    return;
  }
  blitFlip(getSprite({ ...r.spec, pose: r.leaving ? 'idle' : r.who === 'native' ? 'bow' : 'aim' }), G.sx, G.sy, sc, G.flip);
  mount(r, G.hx, G.hy, sc, G.fr, G.flip);
  if (r.phase === 'show') {
    const p = Math.max(0, 1 - r.age / r.window), bx = G.sx + 2 * sc, bw = 16 * sc, by = G.sy - 5;
    R(bx - 1, by - 1, bw + 2, 4, INK); R(bx, by, Math.round(bw * p), 2, p > 0.4 ? '#ffd23f' : '#ff3b30');
    if (r.age > r.window * 0.6 && Math.floor(r.age * 12) % 2) {
      const gx = r.who === 'native' ? 17 : 19, gy = r.who === 'native' ? 12 : 11;
      R(G.flip ? G.sx + (20 - gx - 2) * sc : G.sx + gx * sc, G.sy + gy * sc, 2 * sc, 3 * sc, '#fff36b');
    }
  }
}
function knockRider(r) {
  const G = riderGeom(r), sc = G.sc, d = r.side < 0 ? 1 : -1;
  if (r.spec.hat && r.spec.hat !== 'none') effects.push({ phys: true, hat: true, combo: 0, base: 250, spec: { ...r.spec, hatOnly: true }, sc, x: G.sx, y: G.sy,
    vx: d * (20 + Math.random() * 25) * sc, vy: -110 * sc, life: 999, flashT: 0 });
  if (r.who === 'bandit') effects.push({ phys: true, gun: true, sc, x: G.sx + 16 * sc, y: G.sy + 13 * sc, vx: d * 30, vy: -50, life: 0.9 });
}

// ---------------- obstacles + scenery ----------------
function boulder(cx, by, w, h) {
  cx = Math.round(cx); by = Math.round(by); w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
  R(cx - Math.round(w * 0.6), by - 1, Math.round(w * 1.2), Math.max(1, Math.round(h * 0.15)), 'rgba(60,30,10,0.35)');
  for (let j = 0; j < h; j++) {
    const t = (h - j) / h, hw = Math.max(1, Math.round((w / 2) * Math.sqrt(1 - t * t * 0.92))), y = by - h + j;
    R(cx - hw, y, hw * 2, 1, j < h * 0.3 ? '#b8a48c' : j < h * 0.75 ? '#9a846e' : '#7a6652');
    R(cx + Math.round(hw * 0.4), y, Math.max(1, Math.round(hw * 0.6)), 1, j < h * 0.3 ? '#9a846e' : '#6a5644');
  }
  if (h > 8) { line(cx - w / 6, by - h * 0.7, cx, by - h * 0.45, '#6a5644'); line(cx, by - h * 0.45, cx - w / 10, by - h * 0.2, '#6a5644'); }
}
function logObs(o) {
  const z = o.z, s = FOC / z, a = Math.min(...o.lanes) - 0.55, b = Math.max(...o.lanes) + 0.55;
  const x1 = Math.round(projX(a, z)), x2 = Math.round(projX(b, z)), h = Math.max(2, Math.round(0.24 * s)), by = Math.round(projY(z));
  R(x1 - 2, by - 1, x2 - x1 + 4, Math.max(1, Math.round(h * 0.25)), 'rgba(60,30,10,0.35)');
  R(x1, by - h, x2 - x1, h, '#7a4a24'); R(x1, by - h, x2 - x1, Math.max(1, Math.round(h * 0.25)), '#9a6236'); R(x1, by - Math.max(1, Math.round(h * 0.2)), x2 - x1, Math.max(1, Math.round(h * 0.2)), '#5a3418');
  for (let x = x1 + 6; x < x2 - 4; x += Math.max(4, Math.round(s * 0.18))) R(x, by - h + 1, 1, Math.max(1, h - 2), '#5a3418');
  R(x2 - Math.max(2, Math.round(h * 0.5)), by - h, Math.max(2, Math.round(h * 0.5)), h, '#c8a070');
}
function holeObs(o) { // broken planks: you can see the river through the gap
  const ya = Math.round(projY(o.z + 0.9)), yb = Math.round(projY(o.z));
  for (let y = ya; y <= yb; y++) {
    const z = GND / Math.max(0.5, y - HZ + 0.5), xa = Math.round(projX(o.lanes[0] - 0.5, z)), xb = Math.round(projX(o.lanes[0] + 0.5, z));
    R(xa, y, xb - xa, 1, (y + Math.floor(clock * 8)) % 3 ? '#1e3a58' : '#2e5a80');
  }
  const xa = Math.round(projX(o.lanes[0] - 0.5, o.z)), xb = Math.round(projX(o.lanes[0] + 0.5, o.z));
  for (let x = xa; x < xb; x += 3) R(x, yb - ((x >> 1) % 2), 2, 2, '#5a3418');
}
function cactusAt(x, by, s) {
  const w = Math.max(1, Math.round(0.16 * s)), h = Math.max(3, Math.round(0.9 * s)), aw = Math.max(1, Math.round(0.2 * s));
  x = Math.round(x); by = Math.round(by);
  R(x - (w >> 1), by - h, w, h, '#3a7a3a'); R(x - (w >> 1), by - h, Math.max(1, w >> 2), h, '#5a9a4a');
  if (h > 8) {
    R(x - (w >> 1) - aw, by - Math.round(h * 0.55), aw, Math.max(1, Math.round(w * 0.7)), '#3a7a3a'); R(x - (w >> 1) - aw, by - Math.round(h * 0.8), Math.max(1, Math.round(w * 0.7)), Math.round(h * 0.25), '#3a7a3a');
    R(x + (w >> 1) + (w & 1), by - Math.round(h * 0.42), aw, Math.max(1, Math.round(w * 0.7)), '#3a7a3a');
  }
}
function bushAt(x, by, s) { const w = Math.max(2, Math.round(0.35 * s)), h = Math.max(1, Math.round(0.16 * s)); dither(Math.round(x - w / 2), Math.round(by - h), w, h, '#7a8a3a'); R(Math.round(x - w / 3), Math.round(by - h / 2), Math.round(w * 0.66), Math.max(1, Math.round(h / 2)), '#6a7a30'); }
function poleTop(p) { const s = FOC / p.z; return { x: Math.round(projX(p.wx, p.z)), y: Math.round(projY(p.z) - 1.15 * s), s }; }
function drawPole(p) { const t = poleTop(p), w = Math.max(1, Math.round(0.05 * t.s)); R(t.x - (w >> 1), t.y, w, Math.round(1.15 * t.s), '#5a3a20'); R(t.x - Math.round(0.14 * t.s), t.y + Math.round(0.08 * t.s), Math.round(0.28 * t.s), Math.max(1, w >> 1 || 1), '#5a3a20'); }
function postGeom(p) { const s = FOC / p.z, x = projX(p.wx, p.z), by = projY(p.z); return { s, x, by, top: by - 0.45 * s }; }
function bottleBox(p, i) { const P2 = postGeom(p), bw = Math.max(1, 0.05 * P2.s), bh = Math.max(2, 0.15 * P2.s); return { x: P2.x + (i - 1) * 0.09 * P2.s - bw / 2, y: P2.top - bh, w: bw, h: bh }; }
function drawPost(p) {
  const P2 = postGeom(p), w = Math.max(1, Math.round(0.07 * P2.s));
  R(Math.round(P2.x - w / 2), Math.round(P2.top), w, Math.round(P2.by - P2.top), '#6e4224');
  R(Math.round(P2.x - 0.16 * P2.s), Math.round(P2.top), Math.max(2, Math.round(0.32 * P2.s)), Math.max(1, Math.round(0.03 * P2.s)), '#8a5530');
  p.bottles.forEach((b, i) => { if (!b.alive) return; const B = bottleBox(p, i); R(Math.round(B.x), Math.round(B.y), Math.max(1, Math.round(B.w)), Math.round(B.h), b.c); R(Math.round(B.x), Math.round(B.y), 1, Math.max(1, Math.round(B.h / 3)), '#e8f4f4'); });
}
function drawSign(p) { // "CABIN ->" sign at the end of the race
  const s = FOC / p.z, x = Math.round(projX(p.wx, p.z)), by = Math.round(projY(p.z)), w = Math.max(4, Math.round(0.9 * s)), h = Math.max(2, Math.round(0.35 * s));
  R(x - 1, by - Math.round(0.9 * s), Math.max(1, Math.round(0.06 * s)), Math.round(0.9 * s), '#5a3418');
  R(x - (w >> 1), by - Math.round(0.95 * s), w, h, '#c8a070'); R(x - (w >> 1), by - Math.round(0.95 * s), w, 1, '#e8c890');
  if (s > 30) { signText('CABIN', x - 3, by - Math.round(0.95 * s) + 2, '#3b2210'); R(x + (w >> 1) - 6, by - Math.round(0.95 * s) + h / 2 - 1, 4, 1, '#8a1f1a'); }
}
function tumbleGeom(t) { const s = FOC / t.z, r = Math.max(2, Math.round(0.13 * s)); return { x: Math.round(projX(t.wx, t.z)), y: Math.round(projY(t.z) - r - Math.abs(Math.sin(t.wx * 3)) * r), r }; }
function drawTumbleweed(t) { const T = tumbleGeom(t); ring(T.x, T.y, T.r, Math.max(0, T.r - 1), '#8a6a3a'); const a = t.wx * 4; line(T.x - Math.cos(a) * T.r, T.y - Math.sin(a) * T.r, T.x + Math.cos(a) * T.r, T.y + Math.sin(a) * T.r, '#a8864a'); }
function drawBird(b) {
  const x = Math.round(b.x), y = Math.round(b.y), up = !b.dead && Math.floor(clock * 8 + b.seed) % 2, d = b.vx > 0 ? 1 : -1;
  R(x - 3, y, 7, 2, '#2a2228'); R(x + d * 3, y - 1, 2, 2, '#2a2228'); R(x + d * 5, y, 1, 1, '#e2b33c');
  if (b.dead) { R(x - 2, y + 2, 5, 1, '#2a2228'); return; }
  if (up) { R(x - 4, y - 3, 3, 3, '#2a2228'); R(x + 1, y - 3, 3, 3, '#2a2228'); } else { R(x - 5, y + 2, 4, 2, '#2a2228'); R(x + 2, y + 2, 4, 2, '#2a2228'); }
}
// the wagon team from the driver's bench — they lean into the curves
function horseRear(cx, by, Hc, swish, lean) {
  const top = by - 62, o = y => cx + Math.round(lean * (by - y) * 0.14);
  const hwAt = y => {
    const d = y - top;
    if (d < 9) return 5;
    if (d < 22) return 5 + Math.round((d - 9) * 0.25);
    if (d < 36) return 8 + Math.round((d - 22) * 0.3);
    const k = (y - (by - 12)) / 17;
    return Math.max(12, Math.round(21 * Math.sqrt(Math.max(0, 1 - k * k))));
  };
  for (let y = top; y < by; y++) { const hw = hwAt(y); R(o(y) - hw - 1, y, hw * 2 + 2, 1, INK); }
  for (let y = top; y < by; y++) {
    const hw = hwAt(y), d = y - top, X = o(y);
    R(X - hw, y, hw * 2, 1, Hc.coat); R(X + Math.round(hw * 0.5), y, hw - Math.round(hw * 0.5), 1, Hc.dark);
    if (d > 36) R(X - hw + 2, y, Math.max(1, Math.round(hw * 0.35)), 1, Hc.light);
    if (d < 22) R(X - 1, y, 2, 1, Hc.mane);
  }
  const T = o(top);
  R(T - 4, top - 4, 2, 4, Hc.coat); R(T + 2, top - 4, 2, 4, Hc.coat); R(T - 4, top - 5, 2, 1, INK); R(T + 2, top - 5, 2, 1, INK);
  const C = o(top + 20); R(C - 6, top + 20, 12, 3, '#2a1a10'); R(C - 5, top + 20, 10, 1, '#c9a040');
  const Pd = o(top + 30); R(Pd - 9, top + 30, 18, 4, '#2a1a10'); R(Pd - 2, top + 31, 4, 2, '#c9a040');
  const Bk = o(by - 16); R(Bk - hwAt(by - 16), by - 16, hwAt(by - 16) * 2, 2, '#2a1a10');
  const tx = o(by - 12) + swish; R(tx - 3, by - 24, 6, 6, Hc.mane); R(tx - 2, by - 18, 5, 18, Hc.mane); R(tx - 1, by - 18, 1, 18, shade(Hc.mane, 1.4));
}
function drawTeam() {
  const b = Math.floor(clock * 15) % 2, sw = Math.round(Math.sin(clock * 6) * 2), L = RIDE.lean, slide = Math.round(-L * 8 + Math.max(-1, Math.min(1, RIDE.vx / 2)) * 6);
  horseRear(132 + slide, 178 + b, HORSE_COATS.bay, sw, L); horseRear(188 + slide, 178 + (1 - b), HORSE_COATS.chestnut, -sw, L);
  const tip = Math.round(L * 62 * 0.14);
  line(52, 180, 126 + slide + tip * 0.7, 137 + b, '#2a1a10'); line(56, 180, 182 + slide + tip * 0.7, 137 + (1 - b), '#2a1a10');
  R(0, 172, 320, 8, '#6e4224'); R(0, 172, 320, 1, '#9a6236'); R(0, 176, 320, 1, '#5a3418');
  for (const x of [20, 300]) R(x, 168, 4, 4, '#4a2a14');
  R(40, 174, 18, 6, '#3a4466'); R(46, 172, 10, 3, '#f0c8a0');
}

// ---------------- driving ----------------
const STEER = { l: { x: W - 210, y: H - 108, w: 96, h: 96 }, r: { x: W - 108, y: H - 108, w: 96, h: 96 } };
function holdSteer(k, on, id) { // k = 'l' | 'r'
  if (on && !RIDE.hold[k]) { noise(0.05, 0.25, 5000); tone('triangle', 300, 220, 0.12, 0.08); } // crack of the reins
  RIDE.hold[k] = on; if (on) RIDE.holdId[k] = id;
}
// let go of an on-screen arrow (only the finger that pressed it) or an arrow key
addEventListener('pointerdown', e => { RIDE.lastPointer = e.pointerId; }, true); // runs before the game's own handler
cv.addEventListener('pointerup', e => { for (const k of ['l', 'r']) if (RIDE.holdId && RIDE.holdId[k] === e.pointerId) RIDE.hold[k] = false; });
cv.addEventListener('pointercancel', () => { if (RIDE.hold) RIDE.hold.l = RIDE.hold.r = false; });
addEventListener('keyup', e => {
  if (!RIDE.hold) return; const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') RIDE.hold.l = false;
  if (k === 'arrowright' || k === 'd') RIDE.hold.r = false;
});
addEventListener('blur', () => { if (RIDE.hold) RIDE.hold.l = RIDE.hold.r = false; });
const hitsWagon = o => { // world-x overlap between an obstacle and the wagon
  const L = Math.min(...o.lanes), Rr = Math.max(...o.lanes), half = o.kind === 'rock' ? 0.31 : 0.5, pad = o.kind === 'log' ? 0.55 : half;
  return RIDE.px + WAGON_HALF > L - pad && RIDE.px - WAGON_HALF < Rr + pad;
};
// obstacles: the wagon can take a few bumps (YELLOW BELLY 3, DEPUTY 2, GUNSLINGER 1) before it costs you a heart
function crash() {
  shake = Math.max(shake, 0.7); sfx.thud(); noise(0.4, 0.6, 700);
  burst(160, 150, 18, ['#9a846e', '#7a6652', '#c8a070', '#5a3418'], 110);
  RIDE.bumps++;
  const left = (diff.crashes || 1) - RIDE.bumps;
  if (left > 0) { woundT = 0.8; popText(160, 84, left === 1 ? 'WAGON DAMAGED! ONE MORE HIT...' : 'WAGON DAMAGED! ' + left + ' HITS LEFT'); return; }
  RIDE.bumps = 0; hurt('crash', null);
}
function riderFires(r) {
  r.phase = 'out';
  if (r.who === 'native') tone('sine', 900, 250, 0.18, 0.12); else sfx.gun();
  hurt(r.who === 'native' ? 'arrow' : 'shot', null);
}
RUNS.trail = {
  label: null, name: 'COFFEE HORSE RIDE', title: 'SUPA COFFEE HORSE RIDE', hint: 'HOLD THE ARROWS TO STEER! HIT THE RAMPS!', tune: 'trail',
  hurtText: {
    shot: { title: 'BUSHWHACKED!', reason: 'A BANDIT GOT YOU FIRST.', color: '#ff3b30' },
    arrow: { title: 'STRUCK BY AN ARROW!', reason: 'HE WAS QUICKER ON THE DRAW.', color: '#ff3b30' },
    crash: { title: 'WAGON WRECK!', reason: 'KEEP AN EYE ON THE TRAIL.', color: '#ffb347' },
    block: { title: 'BLOCKADE!', reason: 'AIM FOR THE RAMP, PARTNER.', color: '#ffb347' },
  },
  reset() {
    Object.assign(RIDE, { obsN: 0, px: 0, vx: 0, hold: { l: false, r: false }, holdId: { l: null, r: null }, edgeT: 0, bumps: 0, lane: 0, cam: 0, dist: 0, v: RACE_V[diff.key] || 11, riders: [], pending: [], obs: [], deco: [], posts: [], tumbles: [], birds: [],
      curves: [], bridges: [], signs: [], dust: [], blocks: [], flyers: [], booms: [], tracers: [], air: 0, airT: 0, camH: 1, hzE: HZ, roll: 0, ei: 0, decoT: 0, poleAcc: 0, lean: 0, sky: 0, driftT: 0, drifting: false, boost: false, hit88: false });
    for (let z = 1.3; z < SPAWN; z += 0.45) spawnDeco(z);
    for (let z = 1.5; z < SPAWN; z += 2.2) RIDE.posts.push({ pole: true, wx: 2.9, z });
  },
  tick(dt) { // the world rolls by (also during the intro / clear screens)
    if (RIDE.boost) { const vt = 88 / MPH_PER_V + 0.05; RIDE.v = Math.min(Math.max(RIDE.v, vt), RIDE.v + dt * 3); }
    const dz = RIDE.v * dt; RIDE.dist += dz;
    for (const list of [RIDE.deco, RIDE.obs, RIDE.posts, RIDE.tumbles, RIDE.curves, RIDE.bridges, RIDE.signs, RIDE.blocks]) for (const o of list) o.z -= dz;
    RIDE.blocks = RIDE.blocks.filter(b => b.z > 0.6);
    for (const f of RIDE.flyers) { f.vy += 260 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
    RIDE.flyers = RIDE.flyers.filter(f => f.y < LH + 60); for (const f of RIDE.booms) f.t += dt; RIDE.booms = RIDE.booms.filter(f => f.t < 1.6);
    // airborne: camera climbs, horizon lifts, the world tilts, time slows
    if (RIDE.air > 0 && state === 'play') { RIDE.airT += dt; if (RIDE.airT >= JUMP_T) land(); }
    { const k = jumpK(), h = Math.sin(Math.PI * k); RIDE.camH = 1 + 2.6 * h; RIDE.hzE = HZ - Math.round(16 * h); RIDE.roll = 0.07 * Math.sin(Math.PI * k) * (RIDE.px >= 0 ? -1 : 1); }
    timeScale = state === 'play' && RIDE.air > 0 ? SLOWMO : 1;
    for (const tr of RIDE.tracers) { const p2 = tr.aim && tr.aim(); if (p2) { tr.x = p2.x; tr.y = p2.y; } tr.t += dt; if (tr.t >= tr.dur && !tr.done) { tr.done = true; if (!this.hitAt(tr.x, tr.y)) miss(tr.x, tr.y); } }
    RIDE.tracers = RIDE.tracers.filter(tr => !tr.done);
    for (const t of RIDE.tumbles) t.wx += t.vx * dt;
    RIDE.decoT -= dt; if (RIDE.decoT <= 0) { spawnDeco(SPAWN); RIDE.decoT = (0.15 + Math.random() * 0.2) * 5 / RIDE.v; }
    RIDE.poleAcc += dz; if (RIDE.poleAcc >= 2.2) { RIDE.poleAcc -= 2.2; RIDE.posts.push({ pole: true, wx: 2.9, z: SPAWN }); }
    RIDE.deco = RIDE.deco.filter(o => o.z > 0.7); RIDE.posts = RIDE.posts.filter(o => o.z > 0.7); RIDE.signs = RIDE.signs.filter(o => o.z > 0.7);
    RIDE.obs = RIDE.obs.filter(o => o.z > 0.6); RIDE.tumbles = RIDE.tumbles.filter(t => t.z > 0.8 && Math.abs(t.wx) < 4.5);
    RIDE.curves = RIDE.curves.filter(c => c.z + c.len > -1); RIDE.bridges = RIDE.bridges.filter(b => b.z + b.len > 0);
    for (const b of RIDE.birds) { b.x += b.vx * dt; if (b.dead) { b.vy += 300 * dt; b.y += b.vy * dt; } }
    RIDE.birds = RIDE.birds.filter(b => b.x > -20 && b.x < LW + 20 && b.y < LH + 10);
    // steering + the curve flinging the wagon toward the outside of the bend
    const kNear = curvAt(1.5), steerIn = (RIDE.hold.r ? 1 : 0) - (RIDE.hold.l ? 1 : 0);
    if (state === 'play' && !(RIDE.air > 0)) RIDE.vx += (steerIn * STEER_ACC - kNear * RIDE.v * RIDE.v * FLING) * dt;
    RIDE.vx *= Math.max(0, 1 - STEER_DRAG * dt); RIDE.px += RIDE.vx * dt;
    if (Math.abs(RIDE.px) > ROAD_EDGE) { // bouncing along the edge of the road
      RIDE.px = Math.sign(RIDE.px) * ROAD_EDGE; RIDE.vx *= -0.3;
      RIDE.edgeT -= dt; if (RIDE.edgeT <= 0) { RIDE.edgeT = 0.18; shake = Math.max(shake, 0.12); noise(0.1, 0.25, 600); }
    }
    RIDE.lane = Math.max(-1, Math.min(1, Math.round(RIDE.px)));
    RIDE.cam = RIDE.px;
    RIDE.lean += (Math.max(-1, Math.min(1, kNear / 0.04)) - RIDE.lean) * Math.min(1, dt * 5);
    RIDE.sky -= kNear * RIDE.v * dt * 160;
    if (Math.abs(RIDE.lean) > 0.35) {
      if (!RIDE.drifting) { RIDE.drifting = true; noise(0.5, 0.12, 1800); }
      if (Math.random() < 0.8) RIDE.dust.push({ x: RIDE.lean > 0 ? 30 + Math.random() * 40 : 250 + Math.random() * 40, y: 170, vx: (RIDE.lean > 0 ? -1 : 1) * (60 + Math.random() * 80), vy: -20 - Math.random() * 40, t: 0 });
    } else RIDE.drifting = false;
    for (const d of RIDE.dust) { d.t += dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    RIDE.dust = RIDE.dust.filter(d => d.t < 0.7);
  },
  update(dt) {
    this.tick(dt);
    while (RIDE.ei < RACE.length && RACE[RIDE.ei][1] <= time) {
      const e = RACE[RIDE.ei++], k = e[0];
      if (k === 'R') RIDE.pending.push(e);
      else if ((k === 'rock' || k === 'log' || k === 'hole') && diff.key === 'yellow' && (RIDE.obsN = (RIDE.obsN || 0) + 1) % 4 === 0) {} // Yellow Belly: every 4th obstacle never shows up
      else if (k === 'rock') RIDE.obs.push({ kind: 'rock', lanes: [e[2]], z: SPAWN });
      else if (k === 'log') RIDE.obs.push({ kind: 'log', lanes: [e[2], e[3]], z: SPAWN });
      else if (k === 'hole') RIDE.obs.push({ kind: 'hole', lanes: [e[2]], z: SPAWN });
      else if (k === 'curve') RIDE.curves.push({ z: SPAWN, len: RIDE.v * e[2], k: e[3] });
      else if (k === 'bridge') RIDE.bridges.push({ z: SPAWN, len: RIDE.v * e[2] });
      else if (k === 'bird') RIDE.birds.push({ x: e[2] > 0 ? -10 : LW + 10, y: 14 + Math.random() * 36, vx: e[2] * (50 + Math.random() * 20), vy: 0, dead: false, seed: Math.random() * 4 });
      else if (k === 'bottles') RIDE.posts.push({ wx: (e[2] === 'L' ? -1 : 1) * 2.1, z: SPAWN, bottles: [0, 1, 2].map(() => ({ alive: true, c: pick(['#3a7a3a', '#7a4a1a', '#8a2a2a']) })) });
      else if (k === 'tumble') RIDE.tumbles.push({ wx: -3.5 * e[2], vx: 2.2 * e[2], z: 9 + Math.random() * 3 });
      else if (k === 'boost') RIDE.boost = true;
      else if (k === 'sign') RIDE.signs.push({ wx: 2.3, z: SPAWN });
      else if (k === 'jump') spawnJump(e[2]);
    }
    if (RIDE.boost && !RIDE.hit88 && RIDE.v * MPH_PER_V >= 88) { // great Scott!
      RIDE.hit88 = true; popText(160, 70, '88 MPH!'); [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.1, 0.06), i * 70));
    }
    const kNear = curvAt(1.5); // drift bonus: hug the inside of a bend while it's flinging you out
    if (!(RIDE.air > 0) && Math.abs(kNear) > 0.015 && Math.sign(kNear) * RIDE.px > 0.6) {
      RIDE.driftT += dt; if (RIDE.driftT >= 0.5) { RIDE.driftT -= 0.5; addScore(50, 'obj'); popText(160, 120, 'DRIFT +50'); }
    } else RIDE.driftT = 0;
    RIDE.pending = RIDE.pending.filter(e => { const r = mkRider(e); if (slotBusy(r)) return true; if (e[6] === 'river' && !(r.dolphin && onBridge(riderZ(r) + 1.2))) return true; RIDE.riders.push(r); sfx.cock(); return false; });
    for (const r of RIDE.riders) {
      if (r.dead) { r.deadTime += dt; continue; }
      if (!r.leaving && r.phase !== 'out' && wrongGround(r)) { // the riverbank (or the river) is coming: peel away
        r.leaving = true; r.phase = 'out'; if (r.dolphin) noise(0.3, 0.15, 2500);
      }
      const spd = r.near ? 140 : 70;
      if (r.phase === 'in') { r.x += Math.sign(r.tx - r.x) * spd * dt; if (Math.abs(r.tx - r.x) < spd * dt) { r.x = r.tx; r.phase = 'show'; r.age = 0; } }
      else if (r.phase === 'show') { r.age += dt; if (r.age >= r.window) { riderFires(r); if (state !== 'play') return; } }
      else if (r.phase === 'out') { r.x += r.side * (r.leaving ? (r.dolphin ? 320 : 170) : 90) * dt; if (r.x < -90 || r.x > LW + 20) r.gone = true; }
    }
    RIDE.riders = RIDE.riders.filter(r => !r.gone && !(r.dead && r.deadTime > 1.6));
    for (const o of RIDE.obs) if (!o.checked && o.z <= 1.35) {
      o.checked = true;
      if (o.kind === 'ramp') { if (Math.abs(RIDE.px - o.lanes[0]) < 0.55) startJump(); continue; }
      if (RIDE.air > 0) continue; // sailing right over it
      if (hitsWagon(o)) { o.z = 0; crash(); if (state !== 'play') return; }
    }
    for (const b of RIDE.blocks) if (!b.checked && b.z <= 1.35) {
      b.checked = true;
      if (RIDE.air > 0) { if (b.members.some(m => m.alive)) popText(160, 96, 'RIGHT OVER THEIR HEADS!'); continue; }
      shake = 1; sfx.thud(); noise(0.8, 0.7, 500); burst(160, 140, 30, ['#8a5530', '#c8a070', '#5a3418'], 160);
      for (const m of b.members) if (m.alive) launchMember(b, m, 0.8);
      RIDE.bumps = 0; hurt('block', null); if (state !== 'play') return;
    }
  },
  done() {
    return time >= RACE_END && RIDE.ei >= RACE.length && !RIDE.pending.length && !RIDE.riders.length && RIDE.obs.every(o => o.checked) && RIDE.blocks.every(b => b.checked) && !(RIDE.air > 0) && !RIDE.tracers.length && !RIDE.birds.some(b => b.dead);
  },
  shoot(x, y) {
    if (RIDE.air > 0) { RIDE.tracers.push({ x, y, t: 0, dur: 0.14, aim: aimAt(x, y) }); return true; } // the bullet takes its sweet time (and follows its target)
    return this.hitAt(x, y);
  },
  hitAt(x, y) {
    for (const b of RIDE.blocks) {
      if (b.barrel && inBox(x, y, barrelRect(b))) { hits++; blowBarrel(b); return true; }
      for (const m of b.members) if (m.alive && inBox(x, y, memberRect(b, m))) { hits++; S.n.outlaw++; launchMember(b, m, 1); sfx.hit(); addScore(150, 'outlaw'); popText(x, y - 8, '+150'); return true; }
    }
    for (const b of RIDE.birds) if (!b.dead && inBox(x, y, { x: b.x - 6, y: b.y - 4, w: 13, h: 8 })) {
      b.dead = true; b.vy = -30; burst(b.x, b.y, 8, ['#2a2228', '#4a4048', '#f4efe0'], 40); sfx.hit();
      addScore(200, 'obj'); S.n.obj++; targets++; hits++; popText(b.x, b.y - 6, 'BIRD +200'); return true;
    }
    for (const r of [...RIDE.riders].sort((a, b) => b.near - a.near)) {
      if (r.dead) continue;
      const G = riderGeom(r); if (!inBox(x, y, riderBox(r, G))) continue;
      r.dead = true; r.deadTime = 0; sfx.hit(); knockRider(r); hits++; S.n.outlaw++;
      const bonus = r.phase === 'show' ? Math.round(100 * Math.max(0, 1 - r.age / r.window)) : 100;
      addScore(100 + bonus, 'outlaw'); popText(G.sx + 10 * G.sc, G.sy, '+' + (100 + bonus));
      return true;
    }
    for (const t of RIDE.tumbles) { const T = tumbleGeom(t); if (inBox(x, y, { x: T.x - T.r - 2, y: T.y - T.r - 2, w: T.r * 2 + 4, h: T.r * 2 + 4 })) {
      burst(T.x, T.y, 12, ['#8a6a3a', '#a8864a', '#5a4028'], 60); sfx.thud(); t.z = 0;
      addScore(150, 'obj'); S.n.obj++; targets++; hits++; popText(T.x, T.y - 8, 'TUMBLEWEED +150'); return true;
    } }
    for (const p of RIDE.posts) if (p.bottles && p.z < 10) for (let i = 0; i < 3; i++) {
      const b = p.bottles[i], B = bottleBox(p, i); if (!b.alive || !inBox(x, y, { x: B.x - 2, y: B.y - 2, w: B.w + 4, h: B.h + 4 })) continue;
      b.alive = false; burst(B.x + B.w / 2, B.y + B.h / 2, 10, ['#b08a3a', '#e8f4f4', b.c], 60); sfx.glass();
      addScore(300, 'bottle'); S.n.bottle++; targets++; hits++; popText(B.x, B.y - 6, '+300'); return true;
    }
    return false;
  },
  draw() {
    buildShift();
    R(0, 0, LW, LH >> 1, TRAIL_SKY[0]); R(0, LH >> 1, LW, LH >> 1, GROUND_NEAR[0]);
    raceScenery();
    for (const b of RIDE.bridges) for (const side of [-1.75, 1.75]) {
      let prev = null;
      for (let wz = Math.ceil(b.z + RIDE.dist); wz <= b.z + b.len + RIDE.dist; wz++) {
        const z = wz - RIDE.dist; if (z < 0.9 || z > FAR) continue;
        const s = FOC / z, x = Math.round(projX(side, z)), by = Math.round(projY(z)), top = by - Math.round(0.4 * s);
        R(x - Math.max(1, Math.round(0.03 * s)), top, Math.max(1, Math.round(0.06 * s)), by - top, '#5a3418');
        if (prev) { line(prev.x, prev.top, x, top, '#7a4a24'); line(prev.x, prev.top + (prev.by - prev.top) / 2, x, top + (by - top) / 2, '#5a3418'); }
        prev = { x, top, by };
      }
    }
    const poles = RIDE.posts.filter(p => p.pole && !onBridge(p.z)).sort((a, b) => b.z - a.z);
    for (let i = 0; i + 1 < poles.length; i++) { const a = poleTop(poles[i]), b = poleTop(poles[i + 1]); line(a.x, a.y + 1, b.x, b.y + 1, '#3a2a20'); }
    const items = [
      ...RIDE.deco.filter(o => !onBridge(o.z)).map(o => [o.z, () => { const s = FOC / o.z * o.s, x = projX(o.wx, o.z), by = projY(o.z); o.kind === 'cactus' ? cactusAt(x, by, s) : o.kind === 'bush' ? bushAt(x, by, s) : boulder(x, by, 0.3 * s, 0.2 * s); }]),
      ...RIDE.posts.filter(p => !onBridge(p.z)).map(p => [p.z, () => (p.pole ? drawPole(p) : drawPost(p))]),
      ...RIDE.signs.map(p => [p.z, () => drawSign(p)]),
      ...RIDE.blocks.map(b2 => [b2.z, () => drawBlock(b2)]),
      ...RIDE.obs.filter(o => o.z > 0.8).map(o => [o.z + (o.kind === 'hole' || o.kind === 'ramp' ? 0.9 : 0), () => (o.kind === 'ramp' ? rampObs(o) : o.kind === 'log' ? logObs(o) : o.kind === 'hole' ? holeObs(o) : boulder(projX(o.lanes[0], o.z), projY(o.z), 0.62 * FOC / o.z, 0.42 * FOC / o.z))]),
      ...RIDE.tumbles.map(t => [t.z, () => drawTumbleweed(t)]),
      ...RIDE.riders.map(r => [riderZ(r), () => drawRider(r)]),
    ].filter(([z]) => z < FAR).sort((a, b) => b[0] - a[0]);
    items.forEach(([, f]) => f());
    const vx = Math.round(projX(0, FAR)), sp = Math.min(1, RIDE.v / 13);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.2, p = (clock * 2.4 * sp + i * 0.137) % 1, r0 = 70 + p * 220, len = 10 + p * 30;
      const x0 = vx + Math.cos(a) * r0, y0 = HZ + Math.sin(a) * r0 * 0.6;
      if (Math.abs(x0 - 160) < 90 && y0 > HZ) continue;
      ctx.globalAlpha = 0.35 * p * sp; line(x0, y0, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len * 0.6, '#ffffff'); ctx.globalAlpha = 1;
    }
    for (const d of RIDE.dust) { ctx.globalAlpha = 0.6 * (1 - d.t / 0.7); disc(Math.round(d.x), Math.round(d.y), 2 + Math.round(d.t * 8), '#d8b888'); ctx.globalAlpha = 1; }
    for (const f of RIDE.flyers) { g.save(); g.translate(Math.round(f.x + 10 * f.sc), Math.round(f.y + 16 * f.sc)); g.rotate(f.rot); blit(getSprite({ ...f.spec, pose: 'hit' }), Math.round(-10 * f.sc), Math.round(-16 * f.sc), f.sc); g.restore(); }
    for (const f of RIDE.booms) { const t = f.t;
      if (t < 0.5) { const r = Math.round((6 + t * 60) * f.size), a = 1 - t / 0.5; g.globalAlpha = a; disc(Math.round(f.x), Math.round(f.y), r, '#e05020'); disc(Math.round(f.x), Math.round(f.y), Math.round(r * 0.7), '#ff9a3a'); disc(Math.round(f.x), Math.round(f.y), Math.round(r * 0.4), '#fff4c8'); g.globalAlpha = 1; }
      for (let i = 0; i < 7; i++) { const ang = i * 0.9 + f.size, d = (6 + t * 40) * f.size; g.globalAlpha = Math.max(0, 0.55 * (1 - t / 1.6)); disc(Math.round(f.x + Math.cos(ang) * d), Math.round(f.y + Math.sin(ang) * d * 0.6 - t * 40), Math.round((3 + t * 9) * f.size), '#6a6460'); g.globalAlpha = 1; } }
    if (RIDE.roll) { // tilt the finished picture (nearest-neighbour, so pixels stay crisp)
      const tmp = bake('rollTmp', LW, LH, () => {}), tg = tmp.getContext('2d'); tg.clearRect(0, 0, LW, LH); tg.drawImage(buf, 0, 0);
      R(0, 0, LW, LH >> 1, TRAIL_SKY[0]); R(0, LH >> 1, LW, LH >> 1, GROUND_NEAR[0]);
      g.save(); g.imageSmoothingEnabled = false; g.translate(160, 100); g.rotate(RIDE.roll); g.translate(-160, -100); g.drawImage(tmp, -2, -2, LW + 4, LH + 4); g.restore();
    }
    drawTeam();
    for (const tr of RIDE.tracers) { // slow-motion bullet: a glowing slug with a smoke trail
      const k = Math.min(1, tr.t / tr.dur), x = 160 + (tr.x - 160) * k, y = 176 + (tr.y - 176) * k;
      g.globalAlpha = 0.45; line(160 + (tr.x - 160) * Math.max(0, k - 0.35), 176 + (tr.y - 176) * Math.max(0, k - 0.35), x, y, '#d8d0c0'); g.globalAlpha = 1;
      disc(Math.round(x), Math.round(y), 2, '#ffd23f'); R(Math.round(x), Math.round(y), 1, 1, '#ffffff');
    }
    const bar = Math.round(16 * Math.sin(Math.PI * jumpK())); if (bar > 0) { R(0, 0, LW, bar, '#000000'); R(0, LH - bar, LW, bar, '#000000'); }
    RIDE.birds.forEach(drawBird);
  },
  ui() {
    if (!['intro', 'play'].includes(state)) return;
    const bx = W / 2 - 180, bw = 360, k = Math.min(1, time / RACE_END);
    rect(bx - 3, 14, bw + 6, 12, INK); rect(bx, 17, bw, 6, '#7a5a34'); rect(bx, 17, Math.round(bw * k), 6, '#ffd23f');
    rect(bx + bw + 6, 8, 3, 22, '#3b2210'); rect(bx + bw + 9, 8, 14, 9, '#c0302b');
    rect(bx + Math.round(bw * k) - 6, 10, 12, 8, '#ece4cc'); rect(bx + Math.round(bw * k) - 6, 18, 12, 3, '#7a4a24');
    const mph = RIDE.hit88 ? 88 : Math.round(RIDE.v * MPH_PER_V + Math.sin(clock * 7) * 1.5);
    text(mph + ' MPH', W / 2, 36, 16, mph >= 88 ? '#ff9a3a' : '#ffd23f', 'center');
    // wagon health: how many more bumps before it costs a heart
    const n = diff.crashes || 1, left = n - RIDE.bumps, wx0 = W / 2 - (n * 26) / 2;
    text('WAGON', wx0 - 12, 62, 16, '#f3d18b', 'right');
    for (let i = 0; i < n; i++) { const on = i < left; rect(wx0 + i * 26, 58, 20, 20, INK); rect(wx0 + i * 26 + 3, 61, 14, 14, on ? '#c98a4b' : '#3b2210'); if (on) rect(wx0 + i * 26 + 3, 61, 14, 3, '#e8b070'); }
    ctx.globalAlpha = 0.9;
    for (const kk of ['l', 'r']) {
      const b = STEER[kk], on = RIDE.hold[kk] || (inBox(mouse.x, mouse.y, b) && !touchMode);
      panel(b.x, b.y, b.w, b.h, on ? '#9a6236' : '#5a3418');
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, d = kk === 'l' ? -1 : 1;
      for (let i = 0; i < 7; i++) { const hh = (7 - i) * 6; rect(cx - d * 15 + d * i * 6 - 3, cy - hh / 2, 6, hh, on ? '#ffd23f' : '#ffffff'); }
    }
    rect(W - 186, H - 124, 132, 5, 'rgba(255,255,255,.35)'); rect(W - 120 + Math.round(RIDE.px / ROAD_EDGE * 60) - 6, H - 130, 12, 12, '#ffd23f');
    ctx.globalAlpha = 1;
  },
  tap(x, y) { for (const k of ['l', 'r']) if (inBox(x, y, STEER[k])) { holdSteer(k, true, RIDE.lastPointer); return true; } return false; },
  key(k) {
    if (k === 'arrowleft' || k === 'a') { holdSteer('l', true, 'key'); return true; }
    if (k === 'arrowright' || k === 'd') { holdSteer('r', true, 'key'); return true; }
    return false;
  },
};
for (const k in EPITAPHS) EPITAPHS[k].push(['RUSTY!!']);
Object.assign(EPITAPHS, {
  block: [['RUSTY!!'], ['HE MISSED', 'THE RAMP.'], ['THEY SAW HIM', 'COMING. FOR', 'A MILE.']],
  arrow: [['RUSTY!!'], ['HE SAW THE ARROW.', 'THE ARROW SAW', 'HIM FIRST.'], ['HERE LIES A MAN', 'WHO THOUGHT HE WAS', 'OUT OF RANGE.']],
  crash: [['RUSTY!!'], ['HE SAID', '"WHAT ROCK?"'], ['HE TOOK THE', 'SCENIC ROUTE.', 'THROUGH A BOULDER.'], ['ELIZA WAS DRIVING.', 'HE WAS SUPPOSED', 'TO BE WATCHING.'], ['SPEED LIMIT', 'WAS A SUGGESTION.']],
  tnt: [['RUSTY!!'], ['HE SHOULD HAVE', 'SHOT THE STICK.'], ['HE WENT OUT', 'WITH A BANG.'], ['AUNT MAE WANTS', 'HER ROOF BACK.']],
});
Object.assign(HURT, {
  arrow: { title: 'STRUCK BY AN ARROW!', reason: 'HE LET FLY BEFORE YOU FIRED.', color: '#ff3b30' },
  tnt: { title: 'KA-BLAM!', reason: 'THE TNT HIT THE CABIN.', color: '#ff9a3a' },
});

// =====================================================================
//  SUNSET AT AUNT MAE'S CABIN (the wagon pulls up)
// =====================================================================
function spokeWheel(cx, cy, r, ang) {
  for (let k = 0; k < 8; k++) { const a = ang + k * Math.PI / 4; line(cx, cy, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), '#5a3418'); }
  for (let a = 0; a < Math.PI * 2; a += 0.08) { R(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1, '#3b2210'); R(Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy + Math.sin(a) * (r - 1)), 1, 1, '#7a4a24'); }
  disc(cx, cy, 2, '#3b2210');
}
const WAGON_STOP = 34;
// you = true draws you on the bench next to Eliza; false = you're resting in the back
function wagonSide(x, base, moving, ang = -x / 9, you = true) {
  x = Math.round(x);
  const wy = base - 24, fr = Math.floor(clock * 7) % 4;
  for (let j = 0; j < 26; j++) { const t = j / 26, inset = Math.round(6 * Math.pow(1 - t, 2)); R(x + 4 + inset, wy - 26 + j, 52 - inset * 2, 1, j < 4 ? '#f8f2e0' : '#ece4cc'); }
  for (const hx of [14, 28, 42]) R(x + hx, wy - 24, 1, 24, '#c8bca0');
  R(x + 50, wy - 20, 6, 20, '#3a2a20');
  if (you) ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, x + 44, wy + 9);
  else { R(x + 51, wy - 6, 4, 2, '#6b4a2a'); R(x + 52, wy - 8, 2, 2, '#6b4a2a'); } // your hat, peeking out of the back
  ch2Fig({ ...CHARS.eliza, pose: 'idle' }, x + 54, wy + 9);
  R(x, wy, 66, 13, '#7a4a24'); R(x, wy, 66, 1, '#9a6236'); R(x, wy + 6, 66, 1, '#5a3418'); R(x, wy + 13, 66, 2, '#4a2a14');
  R(x + 2, wy + 2, 10, 3, '#c9a040'); signText('PB&J', x + 33, wy + 3, '#f4efe0');
  spokeWheel(x + 12, base - 9, 9, ang); spokeWheel(x + 54, base - 7, 7, ang * 1.3);
  R(x + 66, wy + 8, 12, 2, '#5a3418');
  horse(x + 70, base - 25, 1, (fr + 2) % 4, HORSE_COATS.chestnut, false, null, moving);
  horse(x + 76, base - 23, 1, fr, HORSE_COATS.bay, false, null, moving);
  if (moving && Math.floor(clock * 10) % 2) { R(x - 4, base - 3, 4, 2, 'rgba(200,170,120,.6)'); R(x + 34, base - 2, 5, 2, 'rgba(200,170,120,.5)'); }
}
const CABIN_X = 196, CABIN_B = 150;
const CABIN_LIFT = 36;
SETS.cabinLake = { bg: () => { R(0, 0, LW, LH, '#8a6a40'); g.save(); g.translate(0, -CABIN_LIFT); cabinArt(); g.restore(); }, fg: () => {} };
CUTS.ch2Cabin = {
  set: 'cabinLake', actors: [], tune: 'morning',
  start() { CH2.wagonAt = clock; },
  after() {
    const t = clock - (CH2.wagonAt == null ? clock - 99 : CH2.wagonAt), k = Math.min(1, t / 4);
    g.save(); g.translate(0, -CABIN_LIFT); wagonSide(WAGON_STOP - 230 * Math.pow(1 - k, 2), 150, k < 1); g.restore();
  },
  lines: [
    ['narr', 'BY SUNDOWN, THE WAGON PULLS UP TO AN OLD CABIN BY THE LAKE.'],
    ['eliza', "THIS CABIN BELONGS TO MY AUNT MAE. WE'LL STAY HERE TONIGHT."],
    ['eliza', "WILL YOU KEEP WATCH THROUGH THE NIGHT, SHERIFF? I'LL MAKE SOME COFFEE AND BRING YOU A CUP."],
  ],
};

// ---- night falls over the cabin, then fade to black
const NIGHT_TEXT = 'ELIZA BRINGS UP A CUP OF THE STRONGEST COFFEE THIS SIDE OF THE MISSISSIPPI. YOU CLIMB UP ON THE ROOF AND SETTLE IN TO KEEP WATCH.';
SCENES.ch2Night = {
  tune: null,
  enter() { this.textT = 0; this.doneT = 0; this.cricket = 0.5; this.out = false; this.outT = 0; },
  shown() { return Math.floor(this.textT * 30); },
  update(dt) {
    if (this.t > 1.2) this.textT += dt;
    if (this.shown() >= NIGHT_TEXT.length) { this.doneT += dt; if (this.doneT > 3) this.out = true; }
    if (this.out) { this.outT += dt; if (this.outT > 2.2) nextStep(); }
    this.cricket -= dt;
    if (this.cricket <= 0) { for (let i = 0; i < 3; i++) setTimeout(() => tone('sine', 4300, 4250, 0.035, 0.025), i * 70); this.cricket = 0.8 + Math.random() * 1.4; }
  },
  tap() { if (this.shown() < NIGHT_TEXT.length) this.textT = 99; else if (!this.out) this.out = true; else this.outT = Math.max(this.outT, 1.8); },
  key() { this.tap(); },
  world() {
    g.save(); g.translate(0, -CABIN_LIFT); R(0, 0, LW, LH + CABIN_LIFT, '#8a6a40');
    cabinArt(Math.min(1, this.t / 2)); wagonSide(WAGON_STOP, 150, false);
    if (this.t > 0) R(0, 0, LW, LH + CABIN_LIFT, `rgba(8,10,34,${0.35 * Math.min(1, this.t / 2)})`);
    g.restore();
  },
  ui() { narrBox(NIGHT_TEXT, this.shown()); fadeBlack(this.out ? this.outT / 1.8 : 0); },
};

// =====================================================================
//  THE NEXT MORNING: SURROUNDED — the view from the cabin roof
// =====================================================================
function pine(x, by, h, c1 = '#2a4a32', c2 = '#223c2a') {
  R(x - 2, by - Math.round(h * 0.2), 4, Math.round(h * 0.2), '#4a2a14');
  for (let j = 0; j < h * 0.85; j++) { const w = Math.round(2 + j * 0.42) * (j % 7 < 5 ? 1 : 0.8); R(Math.round(x - w / 2), by - Math.round(h) + j, Math.max(1, Math.round(w)), 1, j % 7 < 5 ? c1 : c2); }
}
function bushBlob(cx, by, w, h) {
  for (let j = 0; j < h; j++) { const t = (j - h) / h, hw = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - t * t * 0.8))); R(cx - hw, by - h + j, hw * 2, 1, j < 2 ? '#7a9a4a' : '#4e7a34'); }
  for (let i = 0; i < w; i += 3) { R(cx - w / 2 + i, by - h + 1 + ((i * 7) % 4), 2, 1, '#9aba5a'); R(cx - w / 2 + i + 1, by - h + 5 + ((i * 5) % 5), 1, 1, '#3a6026'); }
  R(cx - w / 2 + 2, by - 1, w - 4, 1, '#2e4a20');
}
SETS.cabinSiege = { bg: siegeBg, fg: siegeFg, outdoor: true };

// ---------------- TNT! ----------------
// Some bandits pop up with a lit stick. Shoot them first and they go up with it.
// Let them throw, and the stick tumbles toward the cabin, growing as it gets closer:
// shoot it out of the air, or it lands on the roof (counts as getting shot).
const SIEGE = { tnt: [], fx: [], parts: [] };
const TNT_FLIGHT = 1.25; // seconds in the air, times the difficulty multiplier
function boom(x, y, size) {
  SIEGE.fx.push({ x, y, t: 0, size });
  shake = Math.max(shake, 0.2 + size * 0.12); noise(0.6, 0.55, 700); tone('sine', 110, 30, 0.5, 0.35);
  burst(x, y, 10 + Math.round(size * 4), ['#ffd23f', '#ff9a3a', '#e05020', '#5a5450'], 70 + size * 30);
}
function tntHand(a) { const r = figRect(a); return { x: r.x + 14, y: r.y + 4 }; }
function tntPos(k) {
  const p = Math.min(1, k.t / k.dur);
  return { x: k.x0 + (k.x1 - k.x0) * p, y: k.y0 + (k.y1 - k.y0) * p - Math.sin(Math.PI * p) * 46, s: 1 + p * p * 4 };
}
function blowUpBandit(a) { // cartoon kaboom: hat, boots, arms and the vest go flying
  const r = figRect(a), cx = r.x + 10, cy = r.y + 14, sp = a.spec, sleeve = sp.coat || sp.shirt;
  boom(cx, cy, 1.4);
  const kinds = [['hat', sp.hatC || '#5a4a3a'], ['arm', sleeve], ['arm', sleeve], ['boot', sp.boots || '#2a1a10'], ['boot', sp.boots || '#2a1a10'], ['vest', sp.vest || sp.shirt], ['leg', sp.pants || '#3a3550']];
  for (const [kind, c] of kinds) SIEGE.parts.push({ kind, c, skin: sp.skin, x: cx, y: cy, vx: (Math.random() - 0.5) * 220, vy: -110 - Math.random() * 120, rot: 0, vr: (Math.random() - 0.5) * 18 });
  addScore(100, 'outlaw'); popText(cx, r.y - 10, 'KA-BOOM! +100');
}
function drawPart(p) {
  g.save(); g.translate(Math.round(p.x), Math.round(p.y)); g.rotate(p.rot);
  if (p.kind === 'hat') { R(-6, 1, 12, 2, INK); R(-5, 1, 10, 1, p.c); R(-3, -3, 6, 4, p.c); R(-3, -3, 6, 1, shade(p.c, 1.3)); }
  else if (p.kind === 'arm') { R(-1, -4, 3, 7, INK); R(0, -4, 2, 6, p.c); R(0, 2, 2, 2, p.skin); }
  else if (p.kind === 'boot') { R(-2, -3, 3, 6, p.c); R(-2, 2, 5, 2, p.c); R(-2, 3, 5, 1, INK); }
  else if (p.kind === 'leg') { R(-1, -4, 3, 8, p.c); R(-1, 3, 3, 1, INK); }
  else { R(-3, -3, 7, 7, INK); R(-2, -2, 5, 5, p.c); }
  g.restore();
}
function drawTnt(x, y, s, rot) {
  const w = Math.max(2, Math.round(2 * s)), h = Math.max(5, Math.round(7 * s)), L = h / 2 + 2 * s;
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(rot);
  R(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, INK); R(-w / 2, -h / 2, w, h, '#c0302b'); R(-w / 2, -h / 2, Math.max(1, w / 3), h, '#e0503a');
  R(-w / 2, -h * 0.12, w, Math.max(1, Math.round(s * 0.9)), '#f4efe0');
  R(-Math.max(1, s * 0.25), -h / 2 - 2 * s, Math.max(1, s * 0.5), 2 * s, '#3b2210');
  g.restore();
  const fx = x + Math.sin(rot) * L, fy = y - Math.cos(rot) * L, fl = Math.floor(clock * 20) % 2;
  disc(Math.round(fx), Math.round(fy), Math.max(1, Math.round(s * (fl ? 1.3 : 0.9))), '#ffd23f'); R(Math.round(fx), Math.round(fy), 1, 1, '#ffffff');
}
LEVELS.push({
  label: null, name: 'THE CABIN', hint: 'SHOOT THE TNT OUT OF THE AIR!', set: 'cabinSiege',
  spots: {
    bushL: { x: 34, y: 52, w: 26, h: 36, a: 'bottom' }, rock: { x: 96, y: 50, w: 26, h: 36, a: 'bottom' },
    wagon: { x: 157, y: 26, w: 26, h: 36, a: 'bottom' }, wood: { x: 210, y: 46, w: 28, h: 36, a: 'bottom' },
    bushR: { x: 262, y: 52, w: 26, h: 36, a: 'bottom' }, bushF: { x: 62, y: 92, w: 26, h: 36, a: 'bottom' },
    well: { x: 137, y: 92, w: 26, h: 36, a: 'bottom' }, barrel: { x: 228, y: 90, w: 26, h: 36, a: 'bottom' },
  },
  // [time, spot, 'o' bandit with a gun / 'n' native with a bow / 't' bandit with TNT, seconds before they shoot or throw]
  events: [[1.0, 'bushL', 'o', 1.9], [2.4, 'rock', 't', 1.3], [3.6, 'bushR', 'o', 1.8], [4.6, 'wagon', 'n', 1.7], [5.4, 'well', 't', 1.3],
           [6.6, 'bushF', 'n', 1.6], [7.4, 'wood', 'o', 1.6], [8.4, 'barrel', 't', 1.2], [8.8, 'bushL', 'o', 1.5], [10.0, 'rock', 'o', 1.5],
           [10.6, 'bushR', 't', 1.2], [11.8, 'wagon', 'o', 1.4], [12.2, 'well', 'n', 1.4], [13.4, 'bushF', 't', 1.1], [13.8, 'wood', 'n', 1.3],
           [15.0, 'barrel', 'o', 1.3], [15.4, 'bushL', 't', 1.1], [16.4, 'rock', 'o', 1.25], [16.8, 'bushR', 'o', 1.25], [17.8, 'wagon', 't', 1.0],
           [18.6, 'well', 'o', 1.2], [19.0, 'bushF', 'n', 1.2], [20.2, 'wood', 't', 1.0], [20.6, 'barrel', 'n', 1.15], [21.8, 'bushL', 'o', 1.1],
           [22.2, 'bushR', 't', 1.0], [23.4, 'rock', 'o', 1.05], [23.8, 'wagon', 'o', 1.05], [24.2, 'well', 't', 1.0]],
  spec: (ty, n) => (ty === 'n' ? { ...NATIVE_RIDERS[n % NATIVE_RIDERS.length], pose: 'bow' }
    : ty === 't' ? { ...OUTLAWS[n % OUTLAWS.length], pose: 'wave', tnt: true } : { ...OUTLAWS[n % OUTLAWS.length], pose: 'aim' }),
  props: [{ k: 'bottle', x: 120, y: 44, c: '#3a7a3a', layer: 'bg' }, { k: 'bottle', x: 140, y: 44, c: '#7a4a1a', layer: 'bg' }, { k: 'bottle', x: 160, y: 44, c: '#8a2a2a', layer: 'bg' },
          { k: 'can', x: 182, y: 95, layer: 'bg' }, { k: 'jug', x: 222, y: 60, layer: 'fg' }, { k: 'lantern', x: 150, y: 92, layer: 'fg' }],
  reset() { SIEGE.tnt = []; SIEGE.fx = []; SIEGE.parts = []; },
  busy() { return SIEGE.tnt.length > 0; },
  onFire(a) {
    if (!a.spec.tnt) return false;
    const h = tntHand(a);
    SIEGE.tnt.push({ x0: h.x, y0: h.y, x1: 40 + Math.random() * 240, y1: LH - 14, t: 0, dur: TNT_FLIGHT * diff.mult, rot: 0 });
    noise(0.25, 0.15, 3000); return true;
  },
  onKill(a) { if (!a.spec.tnt) return false; blowUpBandit(a); a.gone = true; return true; },
  update(dt) {
    for (const p of SIEGE.parts) { p.vy += 380 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    SIEGE.parts = SIEGE.parts.filter(p => p.y < LH + 20);
    for (const f of SIEGE.fx) f.t += dt;
    SIEGE.fx = SIEGE.fx.filter(f => f.t < 1.3);
    for (const k of SIEGE.tnt) {
      k.t += dt; k.rot += dt * 7;
      if (k.t >= k.dur) {
        SIEGE.tnt = SIEGE.tnt.filter(o => o !== k);
        boom(k.x1, k.y1, 3); shake = Math.max(shake, 0.7);
        hurt('tnt', null); return;
      }
    }
  },
  shoot(x, y) {
    for (const k of SIEGE.tnt) {
      const P2 = tntPos(k), rad = 4 + 4 * P2.s;
      if (!inBox(x, y, { x: P2.x - rad, y: P2.y - rad, w: rad * 2, h: rad * 2 })) continue;
      SIEGE.tnt = SIEGE.tnt.filter(o => o !== k);
      boom(P2.x, P2.y, 0.8 + P2.s * 0.25); hits++; targets++; S.n.obj++;
      const pts = 200 + Math.round(50 * P2.s); addScore(pts, 'obj'); popText(P2.x, P2.y - 10, 'TNT +' + pts);
      return true;
    }
    return false;
  },
  draw() {
    for (const a of actives) if (!a.dead && a.spec.tnt && a.rise > 0.7) {
      const h = tntHand(a); R(h.x - 1, h.y - 7, 3, 7, INK); R(h.x, h.y - 6, 1, 5, '#c0302b'); R(h.x, h.y - 8, 1, 2, '#3b2210');
      if (Math.floor(clock * 20) % 2) R(h.x - 1, h.y - 10, 2, 2, '#ffd23f');
    }
    for (const f of SIEGE.fx) {
      const t = f.t;
      if (t < 0.4) { const r = Math.round((5 + t * 55) * f.size), a = 1 - t / 0.4;
        ctx.globalAlpha = a; disc(Math.round(f.x), Math.round(f.y), r, '#e05020'); disc(Math.round(f.x), Math.round(f.y), Math.round(r * 0.7), '#ff9a3a'); disc(Math.round(f.x), Math.round(f.y), Math.round(r * 0.4), '#fff4c8'); ctx.globalAlpha = 1; }
      for (let i = 0; i < 5; i++) { const ang = i * 1.26 + f.size, d = (4 + t * 30) * f.size;
        ctx.globalAlpha = Math.max(0, 0.55 * (1 - t / 1.3)); disc(Math.round(f.x + Math.cos(ang) * d), Math.round(f.y + Math.sin(ang) * d * 0.6 - t * 30), Math.round((3 + t * 8) * f.size), '#6a6460'); ctx.globalAlpha = 1; }
    }
    SIEGE.parts.forEach(drawPart);
    for (const k of SIEGE.tnt) { const P2 = tntPos(k); drawTnt(P2.x, P2.y, P2.s, k.rot); }
  },
});
const CABIN_LEVEL = LEVELS.length - 1;
CUTS.ch2Dawn = {
  set: 'cabinSiege', actors: [],
  lines: [
    ['narr', 'YOU WAKE UP ON THE ROOF, SORE AND GRUMPY, NEXT TO A CUP OF COLD COFFEE. SHINGLES MAKE A LOUSY MATTRESS.'],
    ['narr', 'BANDITS AND NATIVES HAVE SURROUNDED THE CABIN. AND SOME OF THEM BROUGHT DYNAMITE.'],
    ['eliza', "SHERIFF! SHOOT THOSE STICKS BEFORE THEY HIT AUNT MAE'S ROOF!"],
  ],
};

// =====================================================================
//  RIDING ON ALONG THE LAKE: Eliza takes the reins, you rest in the back
// =====================================================================
SETS.lakeRide = { bg: () => lakeRideArt(true), fg: () => {} };
CUTS.ch2Lake = {
  set: 'lakeRide', actors: [], tune: 'morning',
  lines: [
    ['narr', "YOU LEAVE AUNT MAE'S YARD, NOW FULL OF POTHOLES AND BODIES. (SERIOUSLY. SO MANY.)"],
    ['narr', 'YOU HITCH UP THE TEAM AND RIDE ON ALONG THE LAKE.'],
    ['eliza', "YOU LOOK LIKE SOMETHIN' THE CAT DRAGGED IN, SHERIFF. GIVE ME THE REINS. I'LL DRIVE."],
    ['eliza', "CLIMB IN THE BACK AND GET SOME SLEEP. CRYSTAL CANYON AIN'T GOIN' ANYWHERE."],
  ],
};
// ---- you crawl into the back of the wagon; the scene and the words fade out together
const REST_TEXT = 'YOU STRETCH OUT ON THE FLOUR SACKS IN THE BACK OF THE WAGON. THE WHEELS RUMBLE, THE LAKE GOES BY, AND YOUR EYES GET HEAVY...';
SCENES.ch2Rest = {
  tune: 'morning',
  enter() { this.textT = 0; this.doneT = 0; this.out = false; this.outT = 0; },
  shown() { return Math.floor(this.textT * 26); },
  update(dt) {
    if (this.t > 0.6) this.textT += dt;
    if (this.shown() >= REST_TEXT.length) { this.doneT += dt; if (this.doneT > 2.5) this.out = true; }
    if (this.out) { this.outT += dt; if (this.outT > 3.4) nextStep(); }
  },
  tap() { if (this.shown() < REST_TEXT.length) this.textT = 99; else if (!this.out) this.out = true; else this.outT = Math.max(this.outT, 3.0); },
  key() { this.tap(); },
  world() { lakeRideArt(false); },
  ui() {
    const a = this.out ? Math.max(0, 1 - this.outT / 2.2) : 1; // the words drift away first...
    ctx.globalAlpha = a; narrBox(REST_TEXT, this.shown()); ctx.globalAlpha = 1;
    if (!this.out && this.shown() >= REST_TEXT.length) for (let i = 0; i < 3; i++) {
      const p = (clock * 0.45 + i / 3) % 1; ctx.globalAlpha = 1 - p;
      text('Z', 400 + p * 40, 210 - p * 70, 16, '#f4efe0', 'center'); ctx.globalAlpha = 1;
    }
    fadeBlack(this.out ? (this.outT - 0.6) / 2.4 : 0);                // ...then the whole picture goes dark
  },
};

// =====================================================================
//  END OF CHAPTER 2 — final tally for the chapter (counts up line by line)
// =====================================================================
SCENES.ch2End = {
  tune: 'morning',
  enter() { saveBest(); sfx.clear(); this.k = 0; },
  update() { const k = Math.floor(this.t / 0.45); if (k !== this.k) { this.k = k; if (k <= 7) sfx.blip(); } },
  world() { lakeRideArt(false); },
  ui() {
    dim(0.78); panel(150, 14, 660, 512);
    text('CHAPTER 2 TALLY', W / 2, 36, 32, '#ffd23f', 'center');
    const rows = [['OUTLAWS DROPPED ' + S.n.outlaw, S.pts.outlaw], ['HATS SHOT ' + S.n.hat, S.pts.hat], ['BOTTLES ' + S.n.bottle, S.pts.bottle],
      ['BIRDS, TNT & OTHER TARGETS ' + S.n.obj, S.pts.obj]];
    const k = Math.floor(this.t / 0.45);
    rows.forEach((r, i) => { if (k > i) { text(r[0], 200, 98 + i * 34, 16, '#ffffff'); text('+' + r[1], 760, 98 + i * 34, 16, '#f3d18b', 'right'); } });
    if (k > rows.length) { rect(200, 246, 560, 3, '#c98a4b'); text('TOTAL', 200, 264, 24, '#ffffff'); text(String(score), 760, 264, 24, '#ffd23f', 'right'); }
    if (k > rows.length + 1) {
      const acc = shots ? Math.round(hits / shots * 100) : 0;
      text('BULLETS FIRED ' + shots, 200, 330, 16, '#f3d18b'); text('ACCURACY ' + acc + '%', 200, 362, 16, '#f3d18b');
      text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, 420, 16, '#ffd23f', 'center');
      text('NEXT: CHAPTER 3', W / 2, 456, 16, '#ffffff', 'center');
      if (Math.floor(clock * 2.5) % 2) text('TAP TO CONTINUE', W / 2, 490, 16, '#f3d18b', 'center');
    }
  },
  tap() { if (this.t < 0.45 * 7) this.t = 0.45 * 8; else toTitle(); },
  key() { this.tap(); },
};

// ---------------- STORY ORDER (chapter 2) ----------------
const STORY2 = [{ cut: 'ch2Saloon' }, { run: 'trail' }, { cut: 'ch2Cabin' }, { scene: 'ch2Night' }, { cut: 'ch2Dawn' }, { level: CABIN_LEVEL }, { cut: 'ch2Lake' }, { scene: 'ch2Rest' }, { scene: 'ch2End' }];

// =====================================================================
//  SCENERY KIT — same 320x180 pixels, same palette family, more painting.
//  Big static pieces (skies, mountain ranges, forests, clouds) are painted
//  once into small off-screen canvases and then slid around for parallax,
//  so the extra detail costs almost nothing per frame.
// =====================================================================
const BAKED = {};
function bake(key, w, h, fn) {
  if (BAKED[key]) return BAKED[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'), px = (a, b, cw, ch, col) => { x.fillStyle = col; x.fillRect(a, b, cw, ch); };
  fn(px, x, w, h); return (BAKED[key] = c);
}
const hexRGB = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const MIXC = new Map();
function mix(a, b, t) { t = Math.round(Math.max(0, Math.min(1, t)) * 32) / 32; const key = a + b + t; let v = MIXC.get(key); if (v) return v; v = mix0(a, b, t); MIXC.set(key, v); return v; }
function mix0(a, b, t) { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dith = (x, y) => (BAYER4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
const hash = n => { n = Math.imul(n ^ 61, 2654435761) ^ (n >>> 13); return ((n >>> 0) % 10007) / 10007; };
// dithered vertical gradient: every pixel is one of the stop colours, so it stays crisp pixel art
function gradPx(px, x0, y0, w, h, stops) {
  const n = stops.length - 1;
  for (let y = 0; y < h; y++) {
    const f = (y / Math.max(1, h - 1)) * n, i = Math.min(n - 1, f | 0), t = f - i;
    px(x0, y0 + y, w, 1, stops[i]);
    for (let x = 0; x < w; x++) if (t > dith(x, y)) px(x0 + x, y0 + y, 1, 1, stops[i + 1]);
  }
}
const skyCanvas = (key, h, stops) => bake('sky:' + key, LW, h, px => gradPx(px, 0, 0, LW, h, stops));
// slide a baked strip across the screen, wrapping around
function strip(c, off, y) { const w = c.width, x0 = -((((Math.round(off)) % w) + w) % w); g.drawImage(c, x0, y); if (x0 + w < LW) g.drawImage(c, x0 + w, y); }
function stripRow(c, off, sy, dy) { const w = c.width, x0 = -((((Math.round(off)) % w) + w) % w); g.drawImage(c, 0, sy, w, 1, x0, dy, w, 1); if (x0 + w < LW) g.drawImage(c, 0, sy, w, 1, x0 + w, dy, w, 1); }
// mirror a strip into water below it, with a little ripple and darkening
function reflect(c, off, waterTop, rows, squash, tint, alpha) {
  g.globalAlpha = alpha;
  for (let d = 0; d < rows; d++) {
    const sy = c.height - 1 - Math.floor(d / squash); if (sy < 0) break;
    stripRow(c, off + Math.round(Math.sin(clock * 2.2 + d * 0.9) * (1 + d * 0.06)), sy, waterTop + d);
  }
  g.globalAlpha = 1; if (tint) { g.globalAlpha = alpha * 0.55; R(0, waterTop, LW, rows, tint); }
  g.globalAlpha = 1;
}
// a mountain range: periodic ridge, faces toward the sun are lit, rim light on the crest, haze at the foot
function ridgeStrip(key, w, h, f, cols, sunRight = true) {
  return bake('ridge:' + key, w, h, px => {
    for (let x = 0; x < w; x++) {
      const top = Math.round(h - f(x)), s = f((x + 1) % w) - f((x - 1 + w) % w), lit = sunRight ? s < 0 : s > 0;
      for (let y = Math.max(0, top); y < h; y++) {
        const k = (y - top) / Math.max(1, h - top);
        let c = lit ? cols.lit : cols.dark;
        if (cols.foot && k > 0.55 && (k - 0.55) * 2.2 > dith(x, y)) c = cols.foot;
        px(x, y, 1, 1, c);
      }
      if (top >= 0 && top < h) px(x, top, 1, 1, lit ? cols.rim : cols.lit);
      if (cols.snow && top < h * 0.35 && top >= 0) for (let y = top; y < top + 2 + (x % 3 === 0 ? 1 : 0); y++) px(x, y, 1, 1, lit ? cols.snow : cols.snowD);
    }
  });
}
const wave = (w, terms) => x => terms.reduce((a, [amp, k, ph]) => a + amp * Math.sin((x / w) * Math.PI * 2 * k + ph), 0);
// desert mesas with layered rock strata, a lit cap and a shadowed side
function mesaStrip(key, w, h, mesas, C) {
  return bake('mesa:' + key, w, h, px => {
    for (const [cx, topW, baseW, mh] of mesas) for (let j = 0; j < mh; j++) {
      const t = j / mh, hw = Math.round(topW / 2 + (baseW - topW) / 2 * Math.pow(t, 1.6)), y = h - mh + j;
      for (let dx = -hw; dx <= hw; dx++) {
        const x = ((cx + dx) % w + w) % w, side = dx > hw * 0.45;
        let c = j < 2 ? C.cap : ((j >> 1) % 3 === 0 ? C.band : C.mid);
        if (side) c = (j >> 1) % 3 === 0 ? C.darkBand : C.dark;
        if (t > 0.7 && (t - 0.7) * 3.3 > dith(x, y)) c = side ? C.dark : C.talus;
        if (dx === -hw) c = C.cap;
        px(x, y, 1, 1, c);
      }
    }
  });
}
// a puffy cloud: lit top, soft shaded flat bottom, dithered edges
function cloudCanvas(key, puffs, L, M, D) {
  let w = 0, h = 0; for (const [x, y, r] of puffs) { w = Math.max(w, x + r + 2); h = Math.max(h, y + r + 2); }
  return bake('cloud:' + key, w, h, px => {
    const bottom = Math.max(...puffs.map(([, y]) => y)) + 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (y > bottom) continue;
      let best = null; for (const p of puffs) { const d = Math.hypot(x - p[0], y - p[1]) / p[2]; if (d <= 1 && (!best || d < best.d)) best = { d, p }; }
      if (!best) continue;
      if (best.d > 0.86 && dith(x, y) > 0.5) continue;
      const rel = (y - best.p[1]) / best.p[2];
      px(x, y, 1, 1, y >= bottom - 1 ? D : rel < -0.25 && (x - best.p[0]) < best.p[2] * 0.4 ? L : rel > 0.35 ? D : M);
    }
  });
}
// tiered pine with a lit edge
function pineT(x, by, h, C) {
  x = Math.round(x); by = Math.round(by);
  R(x - 1, by - Math.round(h * 0.18), 2, Math.round(h * 0.18), C.trunk || '#4a2a14');
  const tiers = Math.max(3, Math.round(h / 7));
  for (let t = 0; t < tiers; t++) {
    const ty = by - h + Math.round((t * (h * 0.82)) / tiers), th = Math.round((h * 0.82) / tiers) + 3, tw = Math.round(2 + ((t + 1) / tiers) * h * 0.26);
    for (let j = 0; j < th; j++) { const w = Math.max(1, Math.round((tw * (j + 1)) / th)); R(x - w, ty + j, w * 2 + 1, 1, C.dark); R(x - w, ty + j, Math.max(1, w), 1, C.mid); }
    R(x - tw, ty + th - 1, 3, 1, C.lit); R(x - Math.round(tw * 0.5), ty + th - 2, 2, 1, C.lit);
  }
  R(x, by - h - 1, 1, 2, C.mid);
}
const forestStrip = (key, w, h, C, density = 7, minH = 0.5) => bake('forest:' + key, w, h, px => {
  const draw = (x, by, hh) => {
    const tiers = Math.max(3, Math.round(hh / 6));
    for (let t = 0; t < tiers; t++) {
      const ty = by - hh + Math.round((t * (hh * 0.85)) / tiers), th = Math.round((hh * 0.85) / tiers) + 2, tw = Math.round(2 + (t + 1) * hh * 0.08);
      for (let j = 0; j < th; j++) { const ww = Math.max(1, Math.round((tw * (j + 1)) / th));
        for (const off of [0, -w, w]) { px(x + off - ww, ty + j, ww * 2 + 1, 1, C.dark); px(x + off - ww, ty + j, ww, 1, C.mid); } }
    }
  };
  px(0, h - 3, w, 3, C.dark);
  for (let x = 0; x < w; x += density) draw(x + Math.round(hash(x) * 4), h, Math.round(h * (minH + hash(x + 7) * (1 - minH))));
});
function sunHalo(cx, cy, r, core, glow) {
  for (let y = -r * 2; y <= r * 2; y++) for (let x = -r * 2; x <= r * 2; x++) {
    const d = Math.hypot(x, y); if (d <= r || d > r * 2) continue;
    if ((1 - (d - r) / r) * 0.55 > dith(cx + x, cy + y)) R(cx + x, cy + y, 1, 1, glow);
  }
  disc(cx, cy, r, core);
}
// tiny flying birds (far away silhouettes)
function farBirds(x0, y0, n, c, spd = 9) {
  for (let i = 0; i < n; i++) {
    const x = Math.round(((x0 + i * 13 + clock * spd) % 380) - 30), y = Math.round(y0 + Math.sin(i * 2.1) * 4 + Math.sin(clock * 1.3 + i) * 1.5), up = Math.floor(clock * 6 + i) % 2;
    R(x - 2, y + (up ? -1 : 0), 2, 1, c); R(x, y, 1, 1, c); R(x + 1, y + (up ? -1 : 0), 2, 1, c);
  }
}

// =====================================================================
//  THE TRAIL — painted desert. The horizon (RIDE.hzE) and the camera
//  height (RIDE.camH) move when the wagon goes airborne off a ramp.
// =====================================================================
const TRAIL_SKY = ['#3f7cc4', '#5a94d2', '#82b2e2', '#aecfee', '#d8e6ee', '#f2e4c0'];
const trailFar = () => ridgeStrip('trailFar', 640, 34, x => 14 + wave(640, [[6, 3, 0.4], [4, 7, 1.3], [2, 13, 2.2]])(x), { lit: '#b6a0c2', dark: '#9c86ae', rim: '#d2c2d8', foot: '#c4b4cc' });
const trailMesa = () => mesaStrip('trailMesa', 520, 38, [[40, 46, 70, 26], [150, 20, 36, 18], [250, 64, 96, 32], [380, 30, 50, 22], [470, 14, 26, 14]],
  { cap: '#e08c5e', mid: '#b4583e', band: '#c46848', dark: '#8a3e30', darkBand: '#7a3428', talus: '#a86a4a' });
const trailHills = () => ridgeStrip('trailHills', 560, 12, x => 5 + wave(560, [[3, 5, 0], [1.5, 11, 1]])(x), { lit: '#b8955c', dark: '#a0804c', rim: '#cfae74', foot: '#c49c66' });
const TRAIL_CLOUDS = () => [cloudCanvas('t1', [[8, 8, 6], [16, 6, 8], [26, 8, 6], [34, 10, 4]], '#ffffff', '#eef4fa', '#c8d8e8'),
  cloudCanvas('t2', [[6, 6, 5], [13, 5, 6], [20, 7, 4]], '#ffffff', '#eef4fa', '#c8d8e8'),
  cloudCanvas('t3', [[6, 7, 5], [14, 5, 7], [24, 6, 6], [32, 8, 4], [40, 9, 3]], '#ffffff', '#eef4fa', '#c8d8e8')];
const GROUND_NEAR = ['#c4914f', '#bc8a4a'], GROUND_FAR = '#e6cc98', ROAD_NEAR = ['#a87a48', '#a27444'], ROAD_FAR = '#d8b47e';
function raceScenery() {
  const hz = RIDE.hzE == null ? HZ : RIDE.hzE, dy = hz - HZ, camH = RIDE.camH || 1;
  R(0, 0, LW, LH, TRAIL_SKY[0]);
  g.drawImage(skyCanvas('trail', HZ, TRAIL_SKY), 0, dy);
  sunHalo(262, 18 + dy, 8, '#fffbe8', '#fff2c0');
  const cl = TRAIL_CLOUDS();
  [[30, 10, 0], [150, 20, 1], [250, 6, 2], [360, 16, 0]].forEach(([x, y, k], i) => g.drawImage(cl[k], Math.round((((x - clock * (3 + i) + RIDE.sky * 0.25) % 420) + 420) % 420 - 50), y + dy));
  farBirds(40, 30 + dy, 3, '#4a4a5a', 6);
  const p1 = -RIDE.cam * 5 + RIDE.sky * 0.5, p2 = -RIDE.cam * 10 + RIDE.sky, p3 = -RIDE.cam * 16 + RIDE.sky * 1.6;
  strip(trailFar(), -p1, hz - 34);
  strip(trailMesa(), -p2, hz - 38);
  strip(trailHills(), -p3, hz - 12);
  let brPrev = onBridge(GND * camH / 0.5);
  for (let y = Math.max(0, hz); y < LH; y++) {
    const z = GND * camH / Math.max(0.5, y - hz + 0.5), wz = z + RIDE.dist, band = Math.floor(wz * 0.8) % 2, br = onBridge(z), fog = Math.max(0, 1 - (y - hz) / 26);
    const l = Math.round(projX(-1.6, z)), r = Math.round(projX(1.6, z)), s = FOC / z, row = Math.floor(wz * 5);
    if (br) {
      R(0, y, LW, 1, mix(Math.floor(wz * 1.5) % 2 ? '#3e6ea6' : '#4a7ab4', '#a8c8e8', fog * 0.9));
      const sx = 262 - RIDE.cam * 5, spread = 2 + (y - hz) * 0.5;                // sun glitter on the water
      for (let i = 0; i < 3; i++) { const gx = Math.round(sx + (hash(row * 3 + i + Math.floor(clock * 6)) - 0.5) * spread * 2); R(gx, y, 2 + (i & 1), 1, '#fff4d0'); }
      for (let i = 0; i < 4; i++) { const gx = ((i * 83 + y * 17 + Math.floor(clock * 40)) % 340) - 10; if ((y + i) % 5 === 0) R(gx, y, 6, 1, '#a8d0f0'); }
      R(l - 3, y, r - l + 6, 1, '#3b2210');
      R(l, y, r - l, 1, Math.floor(wz * 3) % 2 ? '#8a6038' : '#7a5230');
      R(l, y, Math.max(1, Math.round(s * 0.05)), 1, '#5a3a20'); R(r - Math.max(1, Math.round(s * 0.05)), y, Math.max(1, Math.round(s * 0.05)), 1, '#5a3a20');
    } else {
      R(0, y, LW, 1, mix(GROUND_NEAR[band], GROUND_FAR, fog));
      R(l, y, r - l, 1, mix(ROAD_NEAR[band], ROAD_FAR, fog));
      const rw = Math.max(1, Math.round(s * 0.09));                               // wheel ruts + the hump between them
      for (const wx of [-0.55, 0.55]) R(Math.round(projX(wx, z)) - (rw >> 1), y, rw, 1, mix('#8e6238', ROAD_FAR, fog));
      if (s > 12) R(Math.round(projX(0, z)) - Math.round(s * 0.12), y, Math.round(s * 0.24), 1, mix('#b48650', ROAD_FAR, fog));
      R(l - 1, y, 1, 1, '#8a6238'); R(r, y, 1, 1, '#8a6238');
      if (y > hz + 5) { // pebbles, sage tufts and dry grass that rush toward you
        for (let i = 0; i < 3; i++) { const h = hash(row * 7 + i); if (h < 0.55) continue; const wx = (hash(row * 13 + i) - 0.5) * 9, x = Math.round(projX(wx, z));
          if (Math.abs(wx) < 1.6) R(x, y, Math.max(1, Math.round(s * 0.04)), 1, h > 0.8 ? '#d8aa6a' : '#8e6238');
          else { const tw = Math.max(1, Math.round(s * 0.12)); R(x - tw, y, tw * 2, 1, h > 0.75 ? '#8a9a4a' : '#9a8a4a'); if (s > 20) R(x - (tw >> 1), y - 1, tw, 1, '#a8b85a'); } }
        if (brPrev !== br) R(0, y - 1, LW, 2, '#6a7a3a');
      }
    }
    if (brPrev !== br && br) { R(0, y, LW, 1, '#5a6a30'); R(0, y + 1, LW, 1, '#7a8a44'); }
    brPrev = br;
  }
  if (hz >= 0) g.drawImage(bake('haze', LW, 1, px => { for (let x = 0; x < LW; x++) if (dith(x, 1) > 0.5) px(x, 0, 1, 1, '#f0dcb0'); }), 0, hz);
}

// =====================================================================
//  SUNSET / NIGHT AT AUNT MAE'S CABIN
// =====================================================================
const SUNSET_SKY = ['#2a2352', '#46306a', '#7a3e66', '#b4505e', '#e2704c', '#f6a058', '#fcd088'];
const cabinFar = () => ridgeStrip('cabinFar', 320, 34, x => 16 + wave(320, [[7, 2, 0.8], [4, 5, 2.1], [2, 11, 0.3]])(x), { lit: '#8a5878', dark: '#6e4468', rim: '#e08a72', foot: '#7e4e70' }, false);
const cabinNear = () => ridgeStrip('cabinNear', 320, 18, x => 7 + wave(320, [[4, 3, 2.6], [2, 8, 1]])(x), { lit: '#4a3254', dark: '#3a2646', rim: '#a85a5e' }, false);
const cabinTrees = () => forestStrip('cabinTrees', 320, 14, { dark: '#231a2c', mid: '#2c2034' }, 6, 0.35);
const SUNSET_CLOUDS = () => [cloudCanvas('s1', [[6, 3, 3], [14, 2, 4], [24, 3, 3], [34, 3, 3], [42, 4, 2]], '#ffc890', '#e88878', '#9a4a6a'),
  cloudCanvas('s2', [[5, 3, 3], [12, 2, 3], [19, 3, 2]], '#ffc890', '#e88878', '#9a4a6a'),
  cloudCanvas('s3', [[6, 3, 3], [15, 2, 4], [25, 3, 3], [33, 4, 2]], '#f8b07a', '#d87078', '#8a4064')];
function cabinPine(x, by, h, night) { pineT(x, by, h, night ? { dark: '#14141e', mid: '#1c1e2a', lit: '#2a2e3a' } : { dark: '#1e2c22', mid: '#2a3a2c', lit: '#c8704a', trunk: '#3b2210' }); }
function cabinArt(night = 0) {
  const HZL = 88; // where the lake meets the far shore
  g.drawImage(skyCanvas('sunset', HZL, SUNSET_SKY), 0, 0);
  const cl = SUNSET_CLOUDS(); g.globalAlpha = 1 - night; [[20, 40, 0], [118, 50, 1], [196, 38, 2], [262, 56, 1]].forEach(([x, y, k], i) => g.drawImage(cl[k], Math.round(((x + clock * (1 + i * 0.4)) % 380) - 40), y)); g.globalAlpha = 1;
  strip(cabinFar(), 0, HZL - 34);
  if (night < 0.6) { sunHalo(150, 72, 11, '#ffe8a8', '#ffd080'); R(140, 70, 20, 2, '#fff2c4'); }
  strip(cabinNear(), 40, HZL - 18); strip(cabinTrees(), 10, HZL - 14);
  farBirds(60, 30, 4, '#3a2040', 7);
  // the lake: mirrored sky, mountains and trees, a glittering sun path
  g.save(); g.translate(0, 2 * HZL); g.scale(1, -1); g.globalAlpha = 0.85; g.drawImage(skyCanvas('sunset', HZL, SUNSET_SKY), 0, HZL - 30, LW, 30, 0, HZL - 30, LW, 30); g.restore(); g.globalAlpha = 1;
  R(0, HZL, LW, 30, 'rgba(60,40,100,0.35)');
  reflect(cabinFar(), 0, HZL, 12, 1, null, 0.55); reflect(cabinTrees(), 10, HZL, 10, 1, '#2a1e3a', 0.8);
  for (let y = HZL + 1; y < 118; y += 3) R(0, y, LW, 1, 'rgba(255,255,255,0.05)');
  for (let y = HZL + 1; y < 118; y++) { const w = 3 + Math.round((y - HZL) * 0.7), jx = Math.round(Math.sin(clock * 2 + y * 1.3) * 2);
    if ((y + Math.floor(clock * 4)) % 2) R(150 - (w >> 1) + jx, y, w, 1, (y >> 1) % 2 ? '#ffe0a0' : '#f8a060'); }
  // shore, reeds, dock, meadow
  R(0, 116, LW, 3, '#4a4426');
  g.drawImage(bake('cabinMeadow', LW, 62, px => gradPx(px, 0, 0, LW, 62, ['#5e5c30', '#6a6834', '#767238', '#6e6a36'])), 0, 118);
  for (let i = 0; i < 70; i++) { const gx = Math.round(hash(i) * LW), gy = 120 + Math.round(hash(i + 99) * 56); R(gx, gy, 1, 2, '#848040'); if (i % 5 === 0) R(gx + 1, gy, 1, 1, ['#e8b050', '#d0607a', '#f4efe0'][i % 3]); }
  for (let i = 0; i < 16; i++) { const rx = 64 + i * 7 + (i % 3), rh = 6 + (i * 5) % 6, sw = Math.round(Math.sin(clock * 1.6 + i) * 1);
    R(rx + sw, 117 - rh, 1, rh, '#3e4a24'); if (i % 2) R(rx + sw, 116 - rh, 1, 3, '#6a3a1a'); }
  R(18, 108, 44, 4, '#6e4224'); R(18, 108, 44, 1, '#c8805a'); for (let x = 20; x < 62; x += 6) R(x, 108, 1, 4, '#4a2a14'); R(22, 112, 2, 6, '#3b2210'); R(56, 112, 2, 6, '#3b2210');
  R(20, 112, 40, 2, 'rgba(30,20,40,0.35)');
  for (let y = 150; y < 180; y++) R(0, y, LW, 1, y % 4 ? '#8a6a40' : '#7a5a34');
  for (let i = 0; i < 14; i++) R(Math.round(hash(i * 5) * LW), 152 + Math.round(hash(i * 9) * 26), 2, 1, '#a88456');
  // the cabin
  const cx = CABIN_X, cb = CABIN_B;
  R(cx - 2, cb - 3, 104, 4, '#6a6660'); for (let i = 0; i < 13; i++) R(cx - 2 + i * 8 + (i % 2) * 2, cb - 3, 5, 2, '#8a847c');
  for (let y = cb - 40; y < cb - 3; y += 5) { R(cx, y, 100, 5, '#7a4a24'); R(cx, y, 100, 1, '#9a6236'); R(cx, y + 4, 100, 1, '#5a3418'); R(cx - 2, y + 1, 3, 3, '#c8a070'); R(cx + 99, y + 1, 3, 3, '#c8a070'); R(cx - 1, y + 2, 1, 1, '#8a6a40'); }
  R(cx, cb - 40, 2, 37, '#d0784a');
  for (let j = 0; j < 22; j++) { R(cx - 8 + j * 2, cb - 41 - j, 116 - j * 4, 1, j % 3 ? '#4a2a1a' : '#3a2014'); if (j % 3 === 1) for (let x = cx - 6 + j * 2 + (j % 2) * 3; x < cx + 106 - j * 2; x += 6) R(x, cb - 41 - j, 1, 1, '#2a160c'); }
  for (let j = 0; j < 22; j++) R(cx - 8 + j * 2, cb - 41 - j, 2, 1, '#c8704a');
  R(cx + 74, cb - 64, 10, 26, '#7a7470'); for (let y = cb - 62; y < cb - 40; y += 4) { R(cx + 74, y, 10, 1, '#5a5450'); R(cx + 75 + (y % 8 ? 0 : 4), y + 1, 4, 2, '#8e8882'); } R(cx + 73, cb - 65, 12, 2, '#8a8480');
  for (let i = 0; i < 6; i++) { const p = (clock * 0.25 + i / 6) % 1; disc(cx + 79 + Math.round(Math.sin(p * 6 + i) * 3 + p * 12), cb - 68 - Math.round(p * 44), 2 + Math.round(p * 3), `rgba(${night ? '170,170,190' : '230,200,210'},${0.5 * (1 - p)})`); }
  R(cx + 44, cb - 30, 14, 27, '#4a2a14'); R(cx + 46, cb - 28, 10, 25, '#5a3418'); R(cx + 46, cb - 20, 10, 1, '#4a2a14'); R(cx + 54, cb - 15, 2, 2, '#c9a040');
  R(cx - 6, cb - 2, 112, 3, '#5a3418'); for (const px2 of [cx - 4, cx + 36, cx + 70, cx + 102]) R(px2, cb - 34, 2, 32, '#4a2a14'); R(cx - 6, cb - 36, 112, 2, '#4a2a14');
  R(cx + 26, cb - 14, 1, 12, '#3b2210'); R(cx + 26, cb - 9, 8, 1, '#3b2210'); R(cx + 33, cb - 9, 1, 7, '#3b2210'); line(cx + 24, cb - 2, cx + 35, cb - 1, '#3b2210');
  R(cx + 38, cb - 33, 1, 3, '#2a1a10'); R(cx + 37, cb - 30, 3, 4, '#c9a040'); R(cx + 38, cb - 29, 1, 2, '#ffd46a');
  R(cx + 15, cb - 15, 18, 3, '#5a3418'); for (let i = 0; i < 6; i++) R(cx + 16 + i * 3, cb - 17, 2, 2, ['#d0607a', '#e8b050', '#f4efe0'][i % 3]);
  R(cx + 66, cb - 10, 10, 8, '#7a4a24'); for (let i = 0; i < 3; i++) { disc(cx + 70 + i * 4, cb - 12 - (i % 2) * 3, 2, '#9a6236'); R(cx + 70 + i * 4, cb - 12 - (i % 2) * 3, 1, 1, '#c8a070'); }
  cabinPine(306, 152, 74, night > 0.5); cabinPine(318, 156, 58, night > 0.5); cabinPine(178, 152, 30, night > 0.5);
  if (night > 0) {
    R(0, 0, LW, LH, `rgba(8,10,34,${0.78 * night})`);
    g.globalAlpha = night;
    for (let i = 0; i < 70; i++) { const sx = Math.round(hash(i * 3) * LW), sy = 36 + Math.round(hash(i * 5 + 1) * 40); if ((Math.floor(clock * 2 + i) % 7)) R(sx, sy, 1, 1, i % 9 ? '#d8d8e8' : '#ffffff'); }
    sunHalo(96, 50, 6, '#f4efd0', '#8a8aa8'); disc(99, 48, 5, '#141634');
    for (let y = 89; y < 116; y += 2) { const w = 2 + Math.round((y - 88) * 0.3), jx = Math.round(Math.sin(clock * 2 + y) * 2); R(94 - (w >> 1) + jx, y, w, 1, '#b8b8a0'); }
    g.globalAlpha = 1;
    g.globalAlpha = 0.25 * night; for (let j = 0; j < 30; j++) R(cx + 14 - j * 0.4, cb + j * 0.6, 24 + j * 0.8, 1, '#ffc060'); g.globalAlpha = 1;
  }
  R(cx + 16, cb - 30, 16, 14, '#3b2210'); R(cx + 18, cb - 28, 12, 10, Math.floor(clock * 3) % 7 ? '#ffd46a' : '#ffc040'); R(cx + 23, cb - 28, 1, 10, '#3b2210'); R(cx + 18, cb - 24, 12, 1, '#3b2210');
  for (const [r, a] of [[20, 0.06 + 0.05 * night], [13, 0.08 + 0.06 * night], [8, 0.1 + 0.06 * night]]) disc(cx + 24, cb - 23, r, `rgba(255,200,100,${a})`);
  for (let i = 0; i < 12; i++) if (Math.floor(clock * 2 + i * 1.7) % 3 === 0) { const fx = 20 + (i * 41) % 280, fy = 120 + (i * 17) % 30 + Math.round(Math.sin(clock + i) * 2); R(fx, fy, 1, 1, '#fff08a'); if (night > 0.3) R(fx - 1, fy, 3, 1, 'rgba(255,240,140,0.3)'); }
}

// =====================================================================
//  THE YARD AT DAWN (from the cabin roof)
// =====================================================================
const DAWN_SKY = ['#6aa4dc', '#8cbce6', '#b6d2ec', '#e2dcd4', '#f6d0a6', '#f8bc84'];
const yardHills = () => ridgeStrip('yardHills', 320, 14, x => 6 + wave(320, [[3, 3, 1], [1.5, 7, 2]])(x), { lit: '#9aaac4', dark: '#8494b0', rim: '#f0d0b0', foot: '#a8b4c8' }, false);
const yardBackTrees = () => forestStrip('yardBack', 320, 16, { dark: '#4a6a5e', mid: '#5a7a6a' }, 5, 0.45);
const yardTrees = () => forestStrip('yardFront', 320, 22, { dark: '#24432e', mid: '#335a3c' }, 8, 0.55);
function siegeBg() {
  g.drawImage(skyCanvas('dawn', 36, DAWN_SKY), 0, 0);
  for (let k = 0; k < 5; k++) { g.globalAlpha = 0.08; const a = -0.35 + k * 0.18; for (let d = 12; d < 120; d++) R(Math.round(42 + Math.cos(a) * d), Math.round(30 + Math.sin(a) * d * 0.5), 2, 1, '#fff4d0'); }
  g.globalAlpha = 1;
  sunHalo(42, 30, 7, '#fff8dc', '#fff0c0');
  const cl = TRAIL_CLOUDS(); g.globalAlpha = 0.9; g.drawImage(cl[1], Math.round(((140 + clock * 2) % 380) - 40), 6); g.drawImage(cl[0], Math.round(((250 + clock * 1.5) % 380) - 40), 14); g.globalAlpha = 1;
  farBirds(180, 16, 3, '#5a5a6a', 5);
  strip(yardHills(), 0, 34 - 14);
  R(0, 34, LW, 8, '#7aa0c8');
  reflect(yardHills(), 0, 34, 6, 1, null, 0.45);
  for (let y = 35; y < 42; y += 2) R(0, y, LW, 1, 'rgba(255,255,255,0.12)');
  for (let i = 0; i < 6; i++) R(Math.round(((i * 61 + clock * 6) % 340) - 10), 36 + (i % 3) * 2, 5, 1, '#c8e0f4');
  strip(yardBackTrees(), 30, 50 - 16);
  g.globalAlpha = 0.55; strip(bake('yardMist', LW, 10, px => { for (let y = 0; y < 10; y++) for (let x = 0; x < LW; x++) if (dith(x, y + 40) < 0.35 - Math.abs(y - 5) * 0.06) px(x, y, 1, 1, '#eef0ee'); }), -clock * 3, 40); g.globalAlpha = 1;
  strip(yardTrees(), 0, 52 - 22);
  g.drawImage(bake('yardMeadow', LW, 98, px => {
    gradPx(px, 0, 0, LW, 98, ['#a2ae5a', '#94a44e', '#869a46', '#7a8e40']);
    for (let i = 0; i < 260; i++) { const x = Math.round(hash(i) * LW), y = Math.round(hash(i + 500) * 96), c = ['#6e8436', '#aab866', '#7a8e3c'][i % 3]; px(x, y, 1, y > 40 ? 2 : 1, c); }
    for (let i = 0; i < 40; i++) { const x = Math.round(hash(i + 900) * LW), y = 10 + Math.round(hash(i + 950) * 84); px(x, y, 1, 1, ['#f4efe0', '#e8c040', '#c86a8a', '#9ab4e8'][i % 4]); }
  }), 0, 50);
  for (let y = 64; y < 150; y++) { const w = 18 + Math.round((y - 64) * 0.9), cx = 160; R(cx - w / 2, y, w, 1, (y >> 1) % 3 ? '#b08a58' : '#a88050'); R(cx - w / 2, y, 1, 1, '#8a9a4a'); R(cx + w / 2 - 1, y, 1, 1, '#8a9a4a'); }
  for (let i = 0; i < 18; i++) { const y = 68 + Math.round(hash(i * 7) * 78), w = 18 + (y - 64) * 0.9; R(Math.round(160 - w / 2 + hash(i * 3) * w), y, 2 + (y > 120 ? 1 : 0), 1, '#c8a878'); }
  for (let i = 0; i < 8; i++) if (Math.floor(clock * 1.5 + i * 1.3) % 4 === 0) R(Math.round(hash(i + 70) * LW), 60 + Math.round(hash(i + 80) * 80), 1, 1, '#ffffff');
  R(112, 52, 60, 2, '#7a5a34'); R(112, 52, 60, 1, '#9a7a4a'); R(112, 58, 60, 2, '#7a5a34'); R(112, 58, 60, 1, '#9a7a4a'); for (const fx of [112, 132, 152, 170]) { R(fx, 50, 2, 12, '#5a3a20'); R(fx, 50, 1, 12, '#7a5a34'); }
  R(180, 106, 14, 2, 'rgba(40,50,20,0.3)');
  R(178, 100, 12, 6, '#7a4a24'); R(178, 100, 12, 2, '#c8a070'); R(180, 101, 8, 1, '#a88050'); R(186, 92, 1, 9, '#7a5a34'); R(184, 92, 4, 3, '#a8a8b0'); R(184, 92, 4, 1, '#d8d8e0');
  pineT(10, 120, 70, { dark: '#1e3a26', mid: '#2e5038', lit: '#6a8a4a' }); pineT(312, 124, 74, { dark: '#1e3a26', mid: '#2e5038', lit: '#6a8a4a' }); pineT(28, 100, 44, { dark: '#24432e', mid: '#335a3c', lit: '#7a9a56' });
}
function shadowBlob(cx, by, w) { g.globalAlpha = 0.28; for (let j = 0; j < 3; j++) R(Math.round(cx - w / 2 + 4 + j * 2), by - 1 + j, w - j * 3, 1, '#2a3a14'); g.globalAlpha = 1; }
function bushLush(cx, by, w, h) {
  shadowBlob(cx + 6, by, w);
  for (let j = 0; j < h; j++) { const t = (j - h) / h, hw = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - t * t * 0.8))); R(cx - hw, by - h + j, hw * 2, 1, j < 3 ? '#86a854' : j < h - 4 ? '#5e8a3c' : '#4a7030');
    if (j > 2 && j < h - 2) R(cx + Math.round(hw * 0.35), by - h + j, Math.round(hw * 0.65), 1, '#4a7030'); }
  for (let i = 0; i < w; i += 3) { R(cx - w / 2 + i, by - h + 1 + ((i * 7) % 4), 2, 1, '#a6c66a'); R(cx - w / 2 + i + 1, by - h + 6 + ((i * 5) % 6), 1, 1, '#3a5a26'); }
  for (let i = 0; i < 4; i++) R(cx - w / 3 + i * (w / 5), by - h + 5 + (i % 2) * 4, 1, 1, '#c03040');
  R(cx - w / 2 + 2, by - 1, w - 4, 1, '#2e4a20');
}
function siegeFg() {
  bushLush(47, 88, 32, 16);
  shadowBlob(115, 86, 38); boulder(109, 86, 36, 18); R(98, 72, 10, 2, '#6a8a3a'); R(100, 71, 5, 1, '#8aaa4a');
  shadowBlob(176, 86, 46);
  R(150, 64, 40, 14, '#7a4a24'); R(150, 64, 40, 1, '#9a6236'); R(150, 70, 40, 1, '#5a3418'); for (let x = 154; x < 190; x += 8) R(x, 65, 1, 13, '#6a3e1e');
  spokeWheel(156, 80, 6, 0.3); spokeWheel(184, 80, 6, 1.1);
  for (let j = 0; j < 14; j++) { const x0 = 152 + (j < 3 ? 3 - j : 0), w = 36 - (j < 3 ? (3 - j) * 2 : 0); R(x0, 50 + j, w, 1, j < 2 ? '#fbf6e8' : '#ece4cc'); R(x0 + w - 5, 50 + j, 5, 1, '#d4cab0'); }
  for (const hx of [161, 170, 179]) R(hx, 51, 1, 13, '#d4cab0');
  shadowBlob(230, 86, 40);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { const lx = 208 + r * 3 + i * 6, ly = 84 - r * 5; disc(lx + 3, ly, 3, '#8a5530'); disc(lx + 3, ly, 2, '#c8a070'); R(lx + 3, ly, 1, 1, '#9a7448'); }
  bushLush(275, 88, 32, 16);
  bushLush(75, 128, 38, 18);
  shadowBlob(244, 128, 30);
  R(228, 112, 26, 16, '#6e4224'); for (let x = 230; x < 254; x += 4) R(x, 112, 1, 16, '#5a3418'); R(228, 112, 26, 2, '#9a6236'); R(228, 118, 26, 1, '#3b2210'); R(228, 124, 26, 1, '#3b2210'); R(230, 113, 22, 1, '#6a8ab0'); R(232, 113, 6, 1, '#c8e0f4'); R(229, 112, 2, 16, '#8a5530');
  shadowBlob(154, 130, 36);
  R(134, 116, 32, 14, '#8a8478'); for (let i = 0; i < 4; i++) for (let row = 0; row < 3; row++) R(134 + i * 8 + ((row % 2) * 4), 118 + row * 4, 6, 3, row % 2 ? '#9a948a' : '#a8a298'); R(134, 116, 32, 2, '#b8b2a8'); R(140, 125, 3, 1, '#6a8a3a');
  R(136, 92, 2, 24, '#5a3a20'); R(162, 92, 2, 24, '#5a3a20'); for (let j = 0; j < 6; j++) R(132 + j, 90 - j, 36 - j * 2, 1, j % 2 ? '#6e4224' : '#7a4a28'); R(149, 96, 1, 12, '#c8b890'); R(146, 106, 7, 5, '#7a5a34'); R(146, 106, 7, 1, '#9a7a4a');
  for (let y = 148; y < LH; y++) {
    const row = (y - 148) >> 2, k = (y - 148) % 4;
    R(0, y, LW, 1, k === 0 ? '#2a160c' : k === 1 ? '#5a3422' : '#4a2a1a');
    for (let x = (row % 2) * 9; x < LW; x += 18) { R(x, y, 1, 1, '#2a160c'); if (k === 1) R(x + 2, y, 5, 1, '#6a4028'); }
    if (k === 2) for (let i = 0; i < 4; i++) { const mx = Math.round(hash(row * 11 + i) * LW); R(mx, y, 3, 1, '#4a5a2a'); }
  }
  R(0, 147, LW, 2, '#6e4224'); R(0, 147, LW, 1, '#9a6236');
  R(272, 118, 22, 62, '#7a7470'); for (let y = 120; y < LH; y += 5) { R(272, y, 22, 1, '#5a5450'); for (let x = 272 + ((y / 5) % 2) * 5; x < 292; x += 10) R(x, y + 1, 1, 4, '#5a5450'); }
  R(272, 118, 3, 62, '#9a948e'); R(270, 116, 26, 4, '#8a8480'); R(270, 116, 26, 1, '#aaa49e');
  for (let i = 0; i < 4; i++) { const p = (clock * 0.3 + i / 4) % 1; disc(283 + Math.round(Math.sin(p * 6 + i) * 3), 112 - Math.round(p * 40), 2 + Math.round(p * 3), `rgba(230,225,225,${0.45 * (1 - p)})`); }
  speckled(30, 158, 9, 10, '#3a5a8a'); R(30, 158, 9, 1, '#e8e8f0'); R(39, 160, 2, 1, '#3a5a8a'); R(40, 160, 1, 5, '#3a5a8a'); R(39, 164, 2, 1, '#3a5a8a');
}

// =====================================================================
//  RIDING ON ALONG THE LAKE
// =====================================================================
const LAKE_SKY = ['#4a8ad0', '#6aa2dc', '#90bce8', '#b8d4ee', '#dceaf2'];
const lakeMtn = () => ridgeStrip('lakeMtn', 640, 32, x => 14 + wave(640, [[8, 3, 0.2], [5, 7, 1.7], [2, 17, 0.9]])(x), { lit: '#a4acc8', dark: '#8a92b4', rim: '#e4e8f4', foot: '#b0b8d0', snow: '#f4f6fa', snowD: '#d4dae8' });
const lakeForest = () => forestStrip('lakeForest', 480, 16, { dark: '#2e5238', mid: '#3e6a46' }, 5, 0.4);
function lakeRideArt(you = true) {
  const s = clock * 40;
  g.drawImage(skyCanvas('lake', 46, LAKE_SKY), 0, 0);
  sunHalo(250, 16, 7, '#fffbe8', '#fff2c0');
  const cl = TRAIL_CLOUDS(); [[10, 6, 0], [140, 14, 2], [260, 4, 1]].forEach(([x, y, k], i) => g.drawImage(cl[k], Math.round((((x - clock * (4 + i)) % 420) + 420) % 420 - 50), y));
  farBirds(100, 22, 4, '#4a4a5a', 10);
  strip(lakeMtn(), s * 0.08, 44 - 32);
  strip(lakeForest(), s * 0.22, 46 - 16);
  g.drawImage(bake('lakeWater', LW, 26, px => gradPx(px, 0, 0, LW, 26, ['#6a9ad0', '#5a8ac0', '#4a7ab2', '#426ea6'])), 0, 46);
  reflect(lakeForest(), s * 0.22, 46, 10, 1, '#2e5238', 0.7);
  reflect(lakeMtn(), s * 0.08, 56, 8, 2, null, 0.25);
  for (let y = 48; y < 72; y += 3) for (let x = ((y * 13 - s * 0.5) % 24 + 24) % 24 - 24; x < LW; x += 24) R(Math.round(x), y, 8, 1, '#8ab4e0');
  for (let y = 47; y < 72; y++) if ((y + Math.floor(clock * 5)) % 2) { const w = 2 + Math.round((y - 46) * 0.4); R(250 - (w >> 1) + Math.round(Math.sin(clock * 3 + y) * 2), y, w, 1, '#fff6d0'); }
  for (let i = 0; i < 3; i++) { const dx = Math.round((((60 - s * 0.35 + i * 9) % 400) + 400) % 400 - 40), dy = 62 + (i ? 1 : 0), bob = Math.floor(clock * 3 + i) % 2;
    R(dx, dy - bob, i ? 4 : 6, 2, '#6a5a3a'); R(dx + (i ? 3 : 5), dy - 2 - bob, 2, 2, i ? '#8a7a4a' : '#2e6a3a'); R(dx + (i ? 5 : 7), dy - 1 - bob, 1, 1, '#e2a030'); R(dx - 1, dy + 2, (i ? 6 : 8), 1, '#a8d0f0'); }
  R(0, 72, LW, 4, '#6a8a44'); R(0, 72, LW, 1, '#4a6a34');
  for (let i = 0; i < 44; i++) { const rx = Math.round(((i * 37 - s * 0.8) % 340 + 340) % 340 - 10), sw = Math.round(Math.sin(clock * 2 + i) * 1), h = 6 + (i * 7) % 5;
    R(rx + sw, 74 - h, 1, h, i % 3 ? '#4a6a2a' : '#5a7a34'); if (i % 3 === 0) R(rx + sw, 73 - h, 1, 3, '#6a3a1a'); }
  R(0, 76, LW, 30, '#b08a58');
  strip(bake('lakeRoad', LW, 30, px => { for (let y = 0; y < 30; y++) for (let x = 0; x < LW; x++) if (dith(x, y) < 0.08) px(x, y, 1, 1, '#c4a06a'); }), s, 76);
  R(0, 92, LW, 2, '#9a7448'); R(0, 100, LW, 2, '#9a7448');
  for (let i = 0; i < 30; i++) { const dx = ((i * 53 - s) % 340 + 340) % 340 - 10; R(Math.round(dx), 80 + (i * 7) % 24, 3, 1, i % 4 ? '#9a7448' : '#d0b080'); }
  R(0, 104, LW, 2, '#8a8a40');
  g.drawImage(bake('lakeMeadow', LW, 74, px => gradPx(px, 0, 0, LW, 74, ['#7a9a44', '#6e8e3c', '#648436', '#5a7a30'])), 0, 106);
  for (let i = 0; i < 50; i++) { const fx = ((i * 29 - s * 1.3) % 340 + 340) % 340 - 10, fy = 108 + (i * 11) % 60; R(Math.round(fx), fy, 1, 1, ['#e8c040', '#f4efe0', '#c04a6a', '#9ab4e8'][i % 4]); if (fy > 140) R(Math.round(fx), fy + 1, 1, 2, '#4a6a2a'); }
  for (let i = 0; i < 6; i++) { const fx = Math.round(((i * 70 - s * 1.2) % 420 + 420) % 420 - 40); R(fx - 67, 118, 70, 2, '#7a5a34'); R(fx - 67, 118, 70, 1, '#9a7a4a'); R(fx - 67, 126, 70, 2, '#7a5a34'); R(fx, 114, 3, 18, '#6e4a2a'); R(fx, 114, 1, 18, '#8a6a40'); }
  wagonSide(118, 102, true, clock * 4.5, you);
  for (let i = 0; i < 26; i++) { const gx = Math.round(((i * 23 - s * 2.2) % 360 + 360) % 360 - 20), h = 10 + (i * 5) % 9;
    for (let j = 0; j < h; j++) R(gx + Math.round(j * 0.2), LH - j, 1, 1, j > h - 3 ? '#a8b860' : '#4a6a2a'); }
}

// =====================================================================
//  JUMPS! A full-road blockade of bandits and natives sits behind a ramp
//  that only covers part of the road. Hit the ramp and the wagon sails
//  over them in slow motion; miss it and you plow into the blockade.
//  There's a TNT barrel in the middle: shoot it mid-air for a big KA-BLAMMO.
// =====================================================================
const JUMP_T = 1.15, SLOWMO = 0.33, BLOCK_GAP = 3.2;
const jumpK = () => (RIDE.air > 0 ? Math.min(1, RIDE.airT / JUMP_T) : 0);
function spawnJump(lane) {
  RIDE.obs.push({ kind: 'ramp', lanes: [lane], z: SPAWN });
  const members = [];
  for (let i = 0; i < 9; i++) {
    const wx = -2.4 + i * 0.6, native = i % 2 === 1;
    members.push({ wx, native, spec: native ? { ...NATIVE_RIDERS[i % 3], pose: 'bow' } : { ...OUTLAWS[i % OUTLAWS.length], pose: 'aim' }, alive: true, bob: Math.random() * 4 });
  }
  RIDE.blocks.push({ z: SPAWN + 0.95 + RIDE.v * JUMP_T * 0.55, lane, // right under you at the top of the jump
    members, barrel: true, checked: false });
}
function startJump() {
  RIDE.air = JUMP_T; RIDE.airT = 0;
  popText(160, 60, 'AIRBORNE!'); tone('sawtooth', 120, 60, 0.4, 0.12); noise(0.6, 0.3, 1500);
}
function land() {
  RIDE.air = 0; RIDE.airT = 0; RIDE.camH = 1; RIDE.hzE = HZ; RIDE.roll = 0;
  shake = Math.max(shake, 0.7); sfx.thud(); noise(0.5, 0.6, 500);
  burst(130, 168, 14, ['#c8a070', '#a87a48', '#e6cc98'], 120); burst(190, 168, 14, ['#c8a070', '#a87a48', '#e6cc98'], 120);
  popText(160, 70, pick(['YEEHAW!', 'STUCK THE LANDING!', 'GIDDY UP!']));
}
// project a blockade item; returns screen rect for a figure-sized thing
function blockPos(b, wx, wH) { const s = FOC / b.z; return { x: projX(wx, b.z), y: projY(b.z), s, h: wH * s }; }
function memberRect(b, m) { const P2 = blockPos(b, m.wx, 0.8), sc = P2.h / 32; return { x: P2.x - 10 * sc, y: P2.y - 32 * sc - P2.s * 0.18, w: 20 * sc, h: 32 * sc, sc }; }
function barrelRect(b) { const P2 = blockPos(b, b.lane, 0.42), w = 0.32 * P2.s; return { x: P2.x - w / 2, y: P2.y - P2.h - 0.12 * P2.s, w, h: P2.h }; }
function launchMember(b, m, power) {
  m.alive = false; const r = memberRect(b, m);
  RIDE.flyers.push({ spec: m.spec, x: r.x, y: r.y, sc: Math.max(0.5, r.sc), vx: (m.wx - b.lane) * (60 + Math.random() * 60) * power + (Math.random() - 0.5) * 40, vy: -(140 + Math.random() * 120) * power, rot: 0, vr: (Math.random() - 0.5) * 14 });
}
function blowBarrel(b) {
  b.barrel = false; const r = barrelRect(b), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  RIDE.booms.push({ x: cx, y: cy, t: 0, size: 3.2 });
  shake = Math.max(shake, 0.9); noise(1.6, 0.8, 400); tone('sine', 80, 20, 1.6, 0.5); tone('square', 60, 25, 1.2, 0.15);
  burst(cx, cy, 40, ['#ffd23f', '#ff9a3a', '#e05020', '#5a5450', '#8a5530'], 220);
  for (const m of b.members) if (m.alive) { launchMember(b, m, 1.4); S.n.outlaw++; }
  addScore(1000, 'obj'); S.n.obj++; targets++; popText(cx, cy - 20, 'KA-BLAMMO! +1000');
}
function rampObs(o) { // a rickety wooden ramp with yellow chevrons and a little flag
  const L = 0.95, HT = 0.5, steps = 24, lane = o.lanes[0];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, zz = o.z + t * L, s = FOC / zz, y = Math.round(projY(zz) - t * HT * s);
    const xl = Math.round(projX(lane - 0.45, zz)), xr = Math.round(projX(lane + 0.45, zz));
    R(xl, y, xr - xl, 2, i % 3 === 0 ? '#6e4224' : i % 2 ? '#9a6236' : '#8a5530');
    if (i % 6 === 3) { const cx = (xl + xr) >> 1, w = Math.max(1, (xr - xl) >> 3); R(cx - w * 2, y, w, 1, '#ffd23f'); R(cx - w, y - 1, w, 1, '#ffd23f'); R(cx + w, y, w, 1, '#ffd23f'); }
  }
  for (const side of [-0.45, 0.45]) { const x0 = projX(lane + side, o.z), x1 = projX(lane + side, o.z + L), y1 = projY(o.z + L) - HT * FOC / (o.z + L);
    line(x1, y1, x1, projY(o.z + L), '#4a2a14'); line(x0, projY(o.z), x1, y1, '#4a2a14'); }
  const fz = o.z + L, fs = FOC / fz, fx = Math.round(projX(lane + 0.45, fz)), fy = Math.round(projY(fz) - HT * fs);
  R(fx, fy - Math.round(0.4 * fs), 1, Math.round(0.4 * fs), '#3b2210'); R(fx + 1, fy - Math.round(0.4 * fs), Math.max(2, Math.round(0.2 * fs)), Math.max(1, Math.round(0.12 * fs)), Math.floor(clock * 6) % 2 ? '#c0302b' : '#e0503a');
}
function drawBlock(b) {
  const s = FOC / b.z;
  // the gang, standing shoulder to shoulder across the whole road
  for (const m of b.members) if (m.alive) {
    const r = memberRect(b, m), bob = Math.floor(clock * 3 + m.bob) % 2 ? 0 : Math.max(1, Math.round(r.sc));
    blit(getSprite(m.spec), Math.round(r.x), Math.round(r.y) - bob, r.sc);
  }
  // barricade: crates and logs from one side of the road to the other
  for (let wx = -2.5; wx <= 2.51; wx += 0.5) {
    const P2 = blockPos(b, wx, 0.32), w = 0.42 * P2.s, x = Math.round(P2.x - w / 2), y = Math.round(P2.y - P2.h);
    R(x, y, Math.round(w), Math.round(P2.h), '#8a5530'); R(x, y, Math.round(w), Math.max(1, Math.round(P2.h * 0.15)), '#b07a44');
    R(x, y + Math.round(P2.h / 2), Math.round(w), 1, '#5a3418'); line(x, y, x + w, y + P2.h, '#6e4224');
  }
  if (b.barrel) { // the big red TNT barrel, fuse fizzing
    const r = barrelRect(b), x = Math.round(r.x), y = Math.round(r.y), w = Math.round(r.w), h = Math.round(r.h);
    R(x - 1, y - 1, w + 2, h + 2, INK); R(x, y, w, h, '#c0302b'); R(x, y, Math.max(1, w >> 2), h, '#e0503a');
    R(x, y + Math.round(h * 0.2), w, Math.max(1, Math.round(h * 0.08)), '#3b2210'); R(x, y + Math.round(h * 0.75), w, Math.max(1, Math.round(h * 0.08)), '#3b2210');
    if (w > 14) signText('TNT', x + (w >> 1), y + Math.round(h * 0.38), '#f4efe0');
    if (Math.floor(clock * 20) % 2) disc(x + (w >> 1), y - Math.max(2, Math.round(s * 0.06)), Math.max(1, Math.round(s * 0.03)), '#ffd23f');
  }
}
function slowGun() { tone('sine', 140, 30, 1.1, 0.45); noise(1.3, 0.45, 700); tone('sawtooth', 70, 40, 0.9, 0.08); }
const fastGun = sfx.gun; sfx.gun = () => (run === RUNS.trail && RIDE.air > 0 ? slowGun() : fastGun());

// what's under the crosshair right now? returns a function that keeps giving that thing's current centre
function aimAt(x, y) {
  const mid = rr => ({ x: rr.x + rr.w / 2, y: rr.y + rr.h / 2 });
  for (const b of RIDE.blocks) {
    if (b.barrel && inBox(x, y, barrelRect(b))) return () => (b.barrel && b.z > 0.7 ? mid(barrelRect(b)) : null);
    for (const m of b.members) if (m.alive && inBox(x, y, memberRect(b, m))) return () => (m.alive && b.z > 0.7 ? mid(memberRect(b, m)) : null);
  }
  for (const bd of RIDE.birds) if (!bd.dead && inBox(x, y, { x: bd.x - 6, y: bd.y - 4, w: 13, h: 8 })) return () => (bd.dead ? null : { x: bd.x, y: bd.y });
  for (const rd of RIDE.riders) if (!rd.dead && inBox(x, y, riderBox(rd, riderGeom(rd)))) return () => { if (rd.dead) return null; const B = riderBox(rd, riderGeom(rd)); return { x: B.x + B.w / 2, y: B.y + 8 }; };
  return null;
}
