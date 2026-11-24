// =====================================================================
//  HIGH NOON — CHAPTER 2: THE CRYSTAL CANYON RUN
//  Loaded after engine.js and chapter1.js. For now it's only reachable
//  from the TEST button on the main title screen.
//
//  Flow:  ch2Room (night, fade to black) -> ch2Title (breakfast + badges)
//         -> ch2Saloon (Eliza walks in) -> THE TRAIL (wagon ride)
//         -> ch2Cabin (sunset, keep watch) -> ch2Night (fade to black)
//         -> ch2Dawn (surrounded!) -> THE CABIN (siege from the roof)
//         -> ch2Lake (riding on along the lake) -> ch2End
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

// tiny sign letters this chapter needs (newspaper headline)
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
TUNES.trail = { // driving minor-key gallop for the wagon ride (kept low so the gunfire sits on top)
  notes: tuneNotes('D4 - F4 A4 - A4 G4 F4 | E4 - - - A3 - D4 E4 | F4 - A4 C5 - C5 A4 G4 | A4 - - - E4 - C#4 - | D4 - F4 A4 - D5 C5 A4 | A#4 - A4 G4 - F4 - D4 | E4 - F4 E4 - C#4 - A3 | D4 - - - - - - -'),
  bass: ['D2', 'D2', 'F2', 'A2', 'D2', 'A#2', 'A2', 'D2'], bar: 8, eighth: 60 / 150 / 2, vol: 0.055, style: 'gallop',
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
const ROOM_TEXT = 'AFTER A LONG DAY AND A HEARTY STEAK AND POTATO DINNER, THE NEW SHERIFF TAKES A LONG REST.';
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
    ['eliza', 'WE LEAVE IN AN HOUR.'],
  ],
};
SETS.saloonWide = { bg: () => saloonWideArt(CH2.enterAt != null && state === 'cut' && cutLine < GUS_LINE), fg: () => {} };

// =====================================================================
//  HORSES
// =====================================================================
const HORSE_COATS = {
  bay:      { coat: '#8a4a24', dark: '#5a2e14', mane: '#2a1a10', light: '#a8603a' },
  black:    { coat: '#2e2a2a', dark: '#1a1616', mane: '#0e0c0c', light: '#4a4444' },
  chestnut: { coat: '#b0602a', dark: '#7a3e18', mane: '#6a3010', light: '#c87a40' },
  gray:     { coat: '#a8a8a8', dark: '#7a7a7a', mane: '#e8e8e8', light: '#c8c8c8' },
  pinto:    { coat: '#f0ece0', dark: '#c8c0b0', mane: '#3a2a1a', light: '#ffffff', spots: '#8a4a24' },
  palomino: { coat: '#d8a850', dark: '#a87a30', mane: '#f4efe0', light: '#ecc070' },
};
// side view (cutscenes: the wagon team), 32x24 grid, facing right unless flipped
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

// =====================================================================
//  LEVEL: THE TRAIL — riding shotgun on Eliza's wagon
//  Pseudo-3D road: world x (lanes at -1, 0, 1) and distance z (1 = right
//  under the horses' noses). Riders gallop up alongside; rocks and logs
//  come down the trail and you steer around them with the arrows.
// =====================================================================
const HZ = 66, FOC = 104, GND = LH - HZ;                 // horizon line, focal length, ground height
const RIDE = { lane: 0, cam: 0, dist: 0, v: 5, riders: [], pending: [], obs: [], deco: [], posts: [], tumbles: [], birds: [], ei: 0, decoT: 0, poleAcc: 0, press: { l: 0, r: 0 } };
const projY = z => HZ + GND / z;
const projX = (wx, z) => 160 + (wx - RIDE.cam) * FOC / z;
const TRAIL_EASE = 1.35; // riders on the trail give you this much extra time vs. chapter 1 (on top of the difficulty)
const RIDE_SPEED = { yellow: 4.2, deputy: 5, gunslinger: 6 }; // how fast the rocks come at you

const NATIVE_RIDERS = [
  { hat: 'feather', hatC: '#c0302b', featherC: '#f4efe0', skin: '#b8784a', hair: '#1b1410', hairLong: true, shirt: '#c8a070', vest: '#8a5a30', pants: '#8a6a40', boots: '#6a4a2a', face: 'plain' },
  { hat: 'feather', hatC: '#2a6a8a', featherC: '#3b2210', skin: '#a86a40', hair: '#1b1410', hairLong: true, shirt: '#b89060', pants: '#6a4a2a', boots: '#5a3a1a', face: 'plain' },
  { hat: 'feather', hatC: '#e2b33c', featherC: '#c0302b', skin: '#c08050', hair: '#2a1a10', hairLong: true, shirt: '#d8b888', vest: '#3a6a5a', pants: '#7a5a3a', boots: '#6a4a2a', face: 'plain' },
];
const TRAVELERS = [ // innocent settlers on the trail
  { hat: 'cowboy', hatC: '#c8a46a', skin: '#f0c090', hair: '#a0703a', shirt: '#4a7ab8', vest: '#d8d0c0', pants: '#4a4a5a', boots: '#3a2a1a', face: 'plain' },
  { hat: 'cowboy', hatC: '#8a8a7a', skin: '#e8b07a', hair: '#d8d8d8', shirt: '#a85a3a', pants: '#5a4a3a', boots: '#3a2a1a', face: 'beard', beardC: '#e8e8e8' },
  { hat: 'bowler', hatC: '#3a2a20', skin: '#f0c8a0', hair: '#5a3a1a', shirt: '#e8e0cc', vest: '#6a2a2a', pants: '#3a3a3a', boots: '#1b1410', face: 'mustache', beardC: '#5a3a1a' },
];

// Events (seconds into the ride):
//   ['R', t, side L/R, near 1 / far 0, 'o'utlaw or 'b'ystander, who, seconds before they fire, wait-to-reveal 1/0]
//   Bandits and natives are always hostile. Settlers are the only innocent riders.
//   ['rock', t, lane]   ['log', t, laneA, laneB]   ['bird', t, dir]   ['bottles', t, side]   ['tumble', t, dir]
const TRAIL = [
  ['R', 2.0, 'L', 0, 'o', 'bandit', 1.9, 0],
  ['rock', 4.0, 0],
  ['bird', 5.5, -1],
  ['R', 6.5, 'R', 1, 'b', 'settler', 1.8, 1],
  ['R', 8.5, 'L', 1, 'o', 'native', 1.7, 1],
  ['rock', 10.0, 1], ['bottles', 10.5, 'R'],
  ['R', 12.0, 'R', 0, 'o', 'bandit', 1.6, 0],
  ['R', 13.0, 'L', 0, 'b', 'settler', 1.8, 1],
  ['log', 14.5, -1, 0],
  ['R', 16.0, 'R', 1, 'o', 'bandit', 1.6, 1],
  ['tumble', 17.0, 1],
  ['rock', 18.5, -1],
  ['R', 19.0, 'L', 1, 'o', 'native', 1.5, 0],
  ['bird', 21.0, 1], ['bird', 21.6, 1],
  ['R', 22.5, 'R', 0, 'o', 'native', 1.5, 1],
  ['log', 23.5, 0, 1],
  ['R', 25.0, 'L', 1, 'b', 'settler', 1.7, 1],
  ['R', 26.0, 'R', 1, 'o', 'bandit', 1.4, 1],
  ['rock', 27.5, 0], ['rock', 28.6, -1],
  ['bottles', 29.0, 'L'],
  ['R', 30.5, 'L', 0, 'o', 'bandit', 1.4, 0], ['R', 31.0, 'R', 0, 'o', 'native', 1.4, 0],
  ['tumble', 33.0, -1],
  ['R', 34.0, 'L', 1, 'o', 'bandit', 1.3, 1],
  ['log', 35.0, -1, 0],
  ['R', 36.5, 'R', 1, 'b', 'settler', 1.6, 1],
  ['bird', 37.5, -1],
  ['R', 38.5, 'R', 0, 'o', 'bandit', 1.3, 1], ['R', 39.0, 'L', 1, 'o', 'native', 1.25, 0],
  ['rock', 40.5, 1], ['rock', 41.3, 0],
  ['bottles', 42.0, 'R'],
  ['R', 43.5, 'L', 0, 'o', 'native', 1.2, 1], ['R', 44.0, 'R', 1, 'o', 'bandit', 1.2, 1],
  ['log', 45.5, 0, 1],
  ['R', 46.5, 'L', 1, 'b', 'settler', 1.5, 1],
  ['R', 47.5, 'R', 1, 'o', 'bandit', 1.15, 0],
  ['bird', 48.5, 1],
  ['rock', 49.5, -1], ['rock', 50.2, 1],
  ['R', 51.5, 'L', 0, 'o', 'bandit', 1.1, 0], ['R', 52.0, 'R', 0, 'o', 'native', 1.1, 0], ['R', 52.6, 'L', 1, 'o', 'native', 1.1, 1],
  ['tumble', 54.5, 1], ['bottles', 55.0, 'L'],
  ['R', 56.0, 'R', 1, 'o', 'bandit', 1.05, 1],
  ['rock', 58.0, 0], ['log', 58.8, -1, 0],
  ['bird', 60.0, -1], ['bird', 60.5, -1],
  ['R', 61.5, 'L', 1, 'b', 'settler', 1.4, 1], ['R', 62.5, 'R', 1, 'o', 'bandit', 1.0, 1],
  ['R', 64.0, 'L', 0, 'o', 'bandit', 1.0, 0], ['R', 64.5, 'R', 0, 'o', 'native', 1.0, 1],
  ['R', 66.5, 'L', 1, 'o', 'bandit', 0.95, 0], ['R', 67.0, 'R', 1, 'o', 'native', 0.95, 0],
].filter(e => e[1] <= 47.5).sort((a, b) => a[1] - b[1]); // ~48-second ride

// ---------------- spawning ----------------
function spawnDeco(z) {
  const side = Math.random() < 0.5 ? -1 : 1, k = Math.random();
  RIDE.deco.push({ kind: k < 0.4 ? 'cactus' : k < 0.75 ? 'bush' : 'stone', wx: side * (2.3 + Math.random() * 3.2), z, s: 0.8 + Math.random() * 0.5 });
}
function mkRider(e) {
  const [, , sideS, near, ty, who, win, wait] = e, side = sideS === 'L' ? -1 : 1;
  const spec = who === 'bandit' ? pick(OUTLAWS) : who === 'native' ? pick(NATIVE_RIDERS) : pick(TRAVELERS);
  const coat = HORSE_COATS[who === 'native' ? pick(['pinto', 'palomino', 'bay']) : who === 'bandit' ? pick(['black', 'bay', 'gray']) : pick(['chestnut', 'palomino', 'gray'])];
  const tx = near ? (side < 0 ? 2 : LW - 66) : (side < 0 ? 66 : LW - 98);
  return { near: !!near, side, who, type: ty === 'o' ? 'outlaw' : 'bystander', spec, coat,
    blanket: who === 'native' ? pick(['#c0302b', '#2a6a8a', '#e2b33c']) : who === 'bandit' ? '#3a2a2a' : '#7a2a2a',
    window: win * diff.mult * TRAIL_EASE, wait: !!wait, phase: 'in', age: 0, pt: 0, dead: false, deadTime: 0, seed: Math.random() * 4,
    x: side < 0 ? (near ? -80 : -40) : LW + (near ? 16 : 8), tx };
}
const slotBusy = r => RIDE.riders.some(o => o.near === r.near && o.side === r.side);
const revealed = r => !r.wait || r.phase === 'show' || r.phase === 'out';

// ---------------- rider geometry + drawing (side view) ----------------
function blitFlip(img, x, y, sc, flip, shear = 0) {
  if (!flip) { blit(img, x, y, sc, shear); return; }
  g.save(); g.translate(x * 2 + (GW + 2) * sc, 0); g.scale(-1, 1); blit(img, x, y, sc, shear); g.restore();
}
function riderGeom(r) {
  const sc = r.near ? 2 : 1, base = r.near ? 154 : 100, fr = Math.floor(clock * 9 + r.seed) % 4, bob = fr === 1 || fr === 2 ? sc : 0;
  const hx = Math.round(r.x - RIDE.cam * (r.near ? 34 : 14)), hy = base - 23 * sc - bob, flip = r.side > 0;
  const sx = hx + (flip ? 18 : 14) * sc - 10 * sc, sy = hy + 7 * sc - 21 * sc;
  return { sc, fr, hx, hy, flip, sx, sy };
}
const riderBox = (r, G) => ({ x: G.sx + 3 * G.sc, y: G.sy, w: 14 * G.sc, h: 24 * G.sc });
function riderPose(r) {
  if (!revealed(r)) return 'idle';
  if (r.type === 'bystander') return 'wave';
  return r.who === 'native' ? 'bow' : 'aim';
}
function drawRider(r) {
  const G = riderGeom(r), sc = G.sc;
  if (r.dead) { // the horse gallops straight off the side of the screen, the rider tumbles off the back
    const t = r.deadTime, dir = r.side;
    horse(G.hx + Math.round(dir * t * 90 * sc), G.hy, sc, G.fr, r.coat, G.flip, r.blanket);
    const fx = G.sx - Math.round(dir * t * 20 * sc), fy = G.sy + Math.round(-30 * sc * t + 220 * sc * t * t);
    if (fy < LH + 10) blitFlip(getSprite({ ...r.spec, pose: 'hit', hat: 'none' }, t < 0.1), fx, fy, sc, G.flip, Math.round(-dir * Math.min(1, t * 3) * 8));
    if (t > 0.4 && t < 1) for (let i = 0; i < 3; i++) R(G.sx + (i * 6 - 2) * sc, G.hy + 22 * sc - Math.round((t - 0.4) * 16), 4 * sc, 2 * sc, 'rgba(200,170,120,0.6)'); // dust
    return;
  }
  blitFlip(getSprite({ ...r.spec, pose: riderPose(r) }), G.sx, G.sy, sc, G.flip);
  horse(G.hx, G.hy, sc, G.fr, r.coat, G.flip, r.blanket);
  if (r.type === 'outlaw' && r.phase === 'show') {
    const p = Math.max(0, 1 - r.age / r.window), bx = G.sx + 2 * sc, bw = 16 * sc, by = G.sy - 5;
    R(bx - 1, by - 1, bw + 2, 4, INK); R(bx, by, Math.round(bw * p), 2, p > 0.4 ? '#ffd23f' : '#ff3b30');
    if (r.age > r.window * 0.6 && Math.floor(r.age * 12) % 2) { // about to fire!
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

// ---------------- obstacles + scenery drawing ----------------
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
  if (h > 5) R(x2 - Math.round(h * 0.35), by - Math.round(h * 0.6), Math.max(1, Math.round(h * 0.2)), Math.max(1, Math.round(h * 0.2)), '#8a5a30');
  if (h > 8) { R(x1 + Math.round((x2 - x1) * 0.3), by - h - Math.round(h * 0.5), 2, Math.round(h * 0.5), '#5a3418'); }
}
function cactusAt(x, by, s) {
  const w = Math.max(1, Math.round(0.16 * s)), h = Math.max(3, Math.round(0.9 * s)), aw = Math.max(1, Math.round(0.2 * s));
  x = Math.round(x); by = Math.round(by);
  R(x - (w >> 1), by - h, w, h, '#3a7a3a'); R(x - (w >> 1), by - h, Math.max(1, w >> 2), h, '#5a9a4a');
  if (h > 8) {
    R(x - (w >> 1) - aw, by - Math.round(h * 0.55), aw, Math.max(1, Math.round(w * 0.7)), '#3a7a3a'); R(x - (w >> 1) - aw, by - Math.round(h * 0.8), Math.max(1, Math.round(w * 0.7)), Math.round(h * 0.25), '#3a7a3a');
    R(x + (w >> 1) + (w & 1), by - Math.round(h * 0.42), aw, Math.max(1, Math.round(w * 0.7)), '#3a7a3a'); R(x + (w >> 1) + (w & 1) + aw - Math.max(1, Math.round(w * 0.7)), by - Math.round(h * 0.62), Math.max(1, Math.round(w * 0.7)), Math.round(h * 0.2), '#3a7a3a');
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
function tumbleGeom(t) { const s = FOC / t.z, r = Math.max(2, Math.round(0.13 * s)); return { x: Math.round(projX(t.wx, t.z)), y: Math.round(projY(t.z) - r - Math.abs(Math.sin(t.wx * 3)) * r), r }; }
function drawTumbleweed(t) { const T = tumbleGeom(t); ring(T.x, T.y, T.r, Math.max(0, T.r - 1), '#8a6a3a'); const a = t.wx * 4; line(T.x - Math.cos(a) * T.r, T.y - Math.sin(a) * T.r, T.x + Math.cos(a) * T.r, T.y + Math.sin(a) * T.r, '#a8864a'); line(T.x - Math.sin(a) * T.r, T.y + Math.cos(a) * T.r, T.x + Math.sin(a) * T.r, T.y - Math.cos(a) * T.r, '#a8864a'); }
function drawBird(b) {
  const x = Math.round(b.x), y = Math.round(b.y), up = !b.dead && Math.floor(clock * 8 + b.seed) % 2, d = b.vx > 0 ? 1 : -1;
  R(x - 3, y, 7, 2, '#2a2228'); R(x + d * 3, y - 1, 2, 2, '#2a2228'); R(x + d * 5, y, 1, 1, '#e2b33c');
  if (b.dead) { R(x - 2, y + 2, 5, 1, '#2a2228'); return; }
  if (up) { R(x - 4, y - 3, 3, 3, '#2a2228'); R(x + 1, y - 3, 3, 3, '#2a2228'); } else { R(x - 5, y + 2, 4, 2, '#2a2228'); R(x + 2, y + 2, 4, 2, '#2a2228'); }
}
// the wagon team, seen from the driver's bench
function horseRear(cx, by, Hc, swish) {
  const top = by - 62;
  const hwAt = y => {
    const d = y - top;
    if (d < 9) return 5;
    if (d < 22) return 5 + Math.round((d - 9) * 0.25);
    if (d < 36) return 8 + Math.round((d - 22) * 0.3);
    const k = (y - (by - 12)) / 17;
    return Math.max(12, Math.round(21 * Math.sqrt(Math.max(0, 1 - k * k))));
  };
  for (let y = top; y < by; y++) { const hw = hwAt(y); R(cx - hw - 1, y, hw * 2 + 2, 1, INK); }
  R(cx - 3, top - 1, 6, 1, INK);
  for (let y = top; y < by; y++) {
    const hw = hwAt(y), d = y - top;
    R(cx - hw, y, hw * 2, 1, Hc.coat);
    R(cx + Math.round(hw * 0.5), y, hw - Math.round(hw * 0.5), 1, Hc.dark);
    if (d > 36) R(cx - hw + 2, y, Math.max(1, Math.round(hw * 0.35)), 1, Hc.light);
  }
  R(cx - 4, top - 4, 2, 4, Hc.coat); R(cx + 2, top - 4, 2, 4, Hc.coat); R(cx - 4, top - 5, 2, 1, INK); R(cx + 2, top - 5, 2, 1, INK);
  R(cx - 1, top, 2, 22, Hc.mane); R(cx - 2, top + 2, 1, 3, Hc.mane);
  R(cx - 6, top + 20, 12, 3, '#2a1a10'); R(cx - 5, top + 20, 10, 1, '#c9a040');
  R(cx - 9, top + 30, 18, 4, '#2a1a10'); R(cx - 2, top + 31, 4, 2, '#c9a040');
  R(cx - hwAt(by - 16), by - 16, hwAt(by - 16) * 2, 2, '#2a1a10');
  R(cx - 1, by - 26, 2, 4, Hc.dark);
  const tx = cx + swish; R(tx - 3, by - 24, 6, 6, Hc.mane); R(tx - 2, by - 18, 5, 18, Hc.mane); R(tx - 1, by - 18, 1, 18, shade(Hc.mane, 1.4));
}
function drawTeam() {
  const b = Math.floor(clock * 9) % 2, sw = Math.round(Math.sin(clock * 3) * 2);
  horseRear(132, 178 + b, HORSE_COATS.bay, sw); horseRear(188, 178 + (1 - b), HORSE_COATS.chestnut, -sw);
  line(52, 180, 126, 137 + b, '#2a1a10'); line(56, 180, 182, 137 + (1 - b), '#2a1a10');
  R(0, 172, 320, 8, '#6e4224'); R(0, 172, 320, 1, '#9a6236'); R(0, 176, 320, 1, '#5a3418');
  for (const x of [20, 300]) { R(x, 168, 4, 4, '#4a2a14'); }
  R(40, 174, 18, 6, '#3a4466'); R(46, 172, 10, 3, '#f0c8a0');
}

// ---------------- the ride itself ----------------
const STEER = { l: { x: W - 210, y: H - 108, w: 96, h: 96 }, r: { x: W - 108, y: H - 108, w: 96, h: 96 } };
function steer(d) {
  RIDE.press[d < 0 ? 'l' : 'r'] = 0.15;
  const n = Math.max(-1, Math.min(1, RIDE.lane + d));
  if (n === RIDE.lane) { sfx.empty(); return; }
  RIDE.lane = n; noise(0.05, 0.25, 5000); tone('triangle', 300, 220, 0.12, 0.08);
}
function crash(o) {
  shake = Math.max(shake, 0.6); sfx.thud(); noise(0.4, 0.6, 700);
  burst(160, 150, 16, ['#9a846e', '#7a6652', '#c8a070', '#5a3418'], 90);
  hurt('crash', null);
}
function riderFires(r) {
  r.phase = 'out';
  if (r.who === 'native') tone('sine', 900, 250, 0.18, 0.12); else sfx.gun();
  hurt(r.who === 'native' ? 'arrow' : 'shot', null);
}
RUNS.trail = {
  label: 'CH. 2', name: 'THE TRAIL', title: 'THE TRAIL', hint: 'ARROWS STEER THE WAGON', tune: 'trail',
  hurtText: {
    shot: { title: 'BUSHWHACKED!', reason: 'A BANDIT GOT YOU FIRST.', color: '#ff3b30' },
    arrow: { title: 'STRUCK BY AN ARROW!', reason: 'HE WAS QUICKER ON THE DRAW.', color: '#ff3b30' },
    crash: { title: 'WAGON WRECK!', reason: 'KEEP AN EYE ON THE TRAIL.', color: '#ffb347' },
    bystander: { title: 'INNOCENT DOWN!', reason: 'WAIT FOR A RIDER TO SHOW HIS HAND.', color: '#7fb2ff' },
  },
  reset() {
    Object.assign(RIDE, { lane: 0, cam: 0, dist: 0, v: RIDE_SPEED[diff.key] || 5, riders: [], pending: [], obs: [], deco: [], posts: [], tumbles: [], birds: [], ei: 0, decoT: 0, poleAcc: 0, press: { l: 0, r: 0 } });
    for (let z = 1.3; z < 16; z += 0.45) spawnDeco(z);
    for (let z = 1.5; z < 16; z += 2.2) RIDE.posts.push({ pole: true, wx: 2.9, z });
  },
  tick(dt) {
    RIDE.cam += (RIDE.lane - RIDE.cam) * Math.min(1, dt * 9);
    const dz = RIDE.v * dt; RIDE.dist += dz;
    for (const list of [RIDE.deco, RIDE.obs, RIDE.posts, RIDE.tumbles]) for (const o of list) o.z -= dz;
    for (const t of RIDE.tumbles) t.wx += t.vx * dt;
    RIDE.decoT -= dt; if (RIDE.decoT <= 0) { spawnDeco(16); RIDE.decoT = 0.15 + Math.random() * 0.2; }
    RIDE.poleAcc += dz; if (RIDE.poleAcc >= 2.2) { RIDE.poleAcc -= 2.2; RIDE.posts.push({ pole: true, wx: 2.9, z: 16 }); }
    RIDE.deco = RIDE.deco.filter(o => o.z > 0.7); RIDE.posts = RIDE.posts.filter(o => o.z > 0.7);
    RIDE.obs = RIDE.obs.filter(o => o.z > 0.8); RIDE.tumbles = RIDE.tumbles.filter(t => t.z > 0.8 && Math.abs(t.wx) < 4.5);
    for (const b of RIDE.birds) { b.x += b.vx * dt; if (b.dead) { b.vy += 300 * dt; b.y += b.vy * dt; } }
    RIDE.birds = RIDE.birds.filter(b => b.x > -20 && b.x < LW + 20 && b.y < LH + 10);
    RIDE.press.l = Math.max(0, RIDE.press.l - dt); RIDE.press.r = Math.max(0, RIDE.press.r - dt);
  },
  update(dt) {
    this.tick(dt);
    while (RIDE.ei < TRAIL.length && TRAIL[RIDE.ei][1] <= time) {
      const e = TRAIL[RIDE.ei++], k = e[0];
      if (k === 'R') RIDE.pending.push(e);
      else if (k === 'rock') RIDE.obs.push({ kind: 'rock', lanes: [e[2]], z: 15 });
      else if (k === 'log') RIDE.obs.push({ kind: 'log', lanes: [e[2], e[3]], z: 15 });
      else if (k === 'bird') RIDE.birds.push({ x: e[2] > 0 ? -10 : LW + 10, y: 14 + Math.random() * 36, vx: e[2] * (50 + Math.random() * 20), vy: 0, dead: false, seed: Math.random() * 4 });
      else if (k === 'bottles') RIDE.posts.push({ wx: (e[2] === 'L' ? -1 : 1) * 1.95, z: 15, bottles: [0, 1, 2].map(() => ({ alive: true, c: pick(['#3a7a3a', '#7a4a1a', '#8a2a2a']) })) });
      else if (k === 'tumble') RIDE.tumbles.push({ wx: -3.5 * e[2], vx: 1.7 * e[2], z: 7 + Math.random() * 2 });
    }
    RIDE.pending = RIDE.pending.filter(e => {
      const r = mkRider(e); if (slotBusy(r)) return true;
      RIDE.riders.push(r); if (r.type === 'outlaw' && !r.wait) sfx.cock(); return false;
    });
    for (const r of RIDE.riders) {
      if (r.dead) { r.deadTime += dt; continue; }
      const spd = r.near ? 120 : 60;
      if (r.phase === 'in') {
        r.x += Math.sign(r.tx - r.x) * spd * dt;
        if (Math.abs(r.tx - r.x) < spd * dt) { r.x = r.tx; if (r.wait) { r.phase = 'pause'; r.pt = 0.35; } else { r.phase = 'show'; r.age = 0; } }
      } else if (r.phase === 'pause') { r.pt -= dt; if (r.pt <= 0) { r.phase = 'show'; r.age = 0; sfx.cock(); } }
      else if (r.phase === 'show') {
        r.age += dt;
        if (r.age >= r.window) {
          if (r.type === 'outlaw') { riderFires(r); if (state !== 'play') return; }
          else r.phase = 'out';
        }
      } else if (r.phase === 'out') { r.x += r.side * 90 * dt; if (r.x < -90 || r.x > LW + 20) r.gone = true; }
    }
    RIDE.riders = RIDE.riders.filter(r => !r.gone && !(r.dead && r.deadTime > 1.6));
    for (const o of RIDE.obs) if (!o.checked && o.z <= 1.35) {
      o.checked = true;
      if (o.lanes.includes(RIDE.lane)) { o.z = 0; crash(o); if (state !== 'play') return; }
    }
  },
  done() {
    return RIDE.ei >= TRAIL.length && !RIDE.pending.length && !RIDE.riders.length && RIDE.obs.every(o => o.checked) && !RIDE.birds.some(b => b.dead);
  },
  shoot(x, y) {
    for (const b of RIDE.birds) if (!b.dead && inBox(x, y, { x: b.x - 6, y: b.y - 4, w: 13, h: 8 })) {
      b.dead = true; b.vy = -30; burst(b.x, b.y, 8, ['#2a2228', '#4a4048', '#f4efe0'], 40); sfx.hit();
      addScore(200, 'obj'); S.n.obj++; targets++; hits++; popText(b.x, b.y - 6, 'BIRD +200'); return true;
    }
    const order = [...RIDE.riders].sort((a, b) => b.near - a.near);
    for (const r of order) {
      if (r.dead) continue;
      const G = riderGeom(r);
      if (!inBox(x, y, riderBox(r, G))) continue;
      r.dead = true; r.deadTime = 0; sfx.hit(); knockRider(r);
      if (r.type === 'outlaw' && revealed(r)) {
        hits++; S.n.outlaw++;
        const bonus = r.phase === 'show' ? Math.round(100 * Math.max(0, 1 - r.age / r.window)) : 100;
        addScore(100 + bonus, 'outlaw'); popText(G.sx + 10 * G.sc, G.sy, '+' + (100 + bonus));
      } else hurt('bystander');
      return true;
    }
    for (const t of RIDE.tumbles) { const T = tumbleGeom(t); if (inBox(x, y, { x: T.x - T.r - 2, y: T.y - T.r - 2, w: T.r * 2 + 4, h: T.r * 2 + 4 })) {
      burst(T.x, T.y, 12, ['#8a6a3a', '#a8864a', '#5a4028'], 60); sfx.thud(); t.z = 0;
      addScore(150, 'obj'); S.n.obj++; targets++; hits++; popText(T.x, T.y - 8, 'TUMBLEWEED +150'); return true;
    } }
    for (const p of RIDE.posts) if (p.bottles && p.z < 9) for (let i = 0; i < 3; i++) {
      const b = p.bottles[i], B = bottleBox(p, i); if (!b.alive || !inBox(x, y, { x: B.x - 2, y: B.y - 2, w: B.w + 4, h: B.h + 4 })) continue;
      b.alive = false; burst(B.x + B.w / 2, B.y + B.h / 2, 10, ['#b08a3a', '#e8f4f4', b.c], 60); sfx.glass();
      addScore(300, 'bottle'); S.n.bottle++; targets++; hits++; popText(B.x, B.y - 6, '+300'); return true;
    }
    return false;
  },
  draw() {
    ['#5f9ad6', '#82b4e2', '#abcfee', '#d8e4e8', '#eedcb0'].forEach((c, i) => R(0, i * 14, LW, 14, c));
    disc(262, 18, 9, '#fff6c8'); disc(262, 18, 7, '#fffbe8');
    for (let i = 0; i < 3; i++) { const cx = ((i * 130 + 40 - clock * 3) % 400 + 400) % 400 - 40; R(cx, 14 + i * 9, 30, 4, '#f4f8fc'); R(cx + 6, 11 + i * 9, 16, 3, '#f4f8fc'); }
    const p1 = Math.round(-RIDE.cam * 5), p2 = Math.round(-RIDE.cam * 10);
    for (let x = -20; x < LW + 20; x += 2) { const h = 10 + Math.round(6 * Math.sin(x * 0.045) + 4 * Math.sin(x * 0.13)); R(x + p1, HZ - h, 2, h, '#9a7a9a'); }
    R(18 + p2, HZ - 22, 50, 22, '#a4513b'); R(26 + p2, HZ - 26, 32, 4, '#a4513b'); R(26 + p2, HZ - 26, 32, 1, '#c06a4a');
    R(236 + p2, HZ - 18, 64, 18, '#b05a40'); R(248 + p2, HZ - 24, 30, 6, '#b05a40'); R(248 + p2, HZ - 24, 30, 1, '#c87a5a');
    for (let y = HZ; y < LH; y++) {
      const z = GND / Math.max(0.5, y - HZ + 0.5), band = Math.floor((z + RIDE.dist) * 0.8) % 2;
      R(0, y, LW, 1, y < HZ + 4 ? '#c8a070' : band ? '#c4914f' : '#bc8a4a');
      const l = Math.round(projX(-1.6, z)), r = Math.round(projX(1.6, z));
      R(l, y, r - l, 1, band ? '#a87a48' : '#a27444'); R(l - 1, y, 1, 1, '#8a6238'); R(r, y, 1, 1, '#8a6238');
      if (y > HZ + 6 && Math.floor((z + RIDE.dist) * 2) % 3) for (const wx of [-1.3, -0.7, -0.3, 0.3, 0.7, 1.3]) R(Math.round(projX(wx, z)), y, 1, 1, '#946a3e');
    }
    const poles = RIDE.posts.filter(p => p.pole).sort((a, b) => b.z - a.z);
    for (let i = 0; i + 1 < poles.length; i++) { const a = poleTop(poles[i]), b = poleTop(poles[i + 1]); line(a.x, a.y + 1, b.x, b.y + 1, '#3a2a20'); }
    const items = [
      ...RIDE.deco.map(o => [o.z, () => { const s = FOC / o.z * o.s, x = projX(o.wx, o.z), by = projY(o.z); o.kind === 'cactus' ? cactusAt(x, by, s) : o.kind === 'bush' ? bushAt(x, by, s) : boulder(x, by, 0.3 * s, 0.2 * s); }]),
      ...RIDE.posts.map(p => [p.z, () => (p.pole ? drawPole(p) : drawPost(p))]),
      ...RIDE.obs.filter(o => o.z > 0.8).map(o => [o.z, () => (o.kind === 'log' ? logObs(o) : boulder(projX(o.lanes[0], o.z), projY(o.z), 0.62 * FOC / o.z, 0.42 * FOC / o.z))]),
      ...RIDE.tumbles.map(t => [t.z, () => drawTumbleweed(t)]),
      ...RIDE.riders.map(r => [r.near ? 1.6 : 3.4, () => drawRider(r)]),
    ].filter(([z]) => z < 16.5).sort((a, b) => b[0] - a[0]);
    items.forEach(([, f]) => f());
    drawTeam();
    RIDE.birds.forEach(drawBird);
  },
  ui() {
    if (!['intro', 'play'].includes(state)) return;
    ctx.globalAlpha = 0.9;
    for (const k of ['l', 'r']) {
      const b = STEER[k], on = RIDE.press[k] > 0 || (inBox(mouse.x, mouse.y, b) && !touchMode);
      panel(b.x, b.y, b.w, b.h, on ? '#9a6236' : '#5a3418');
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, d = k === 'l' ? -1 : 1;
      for (let i = 0; i < 7; i++) { const hh = (7 - i) * 6; rect(cx - d * 15 + d * i * 6 - 3, cy - hh / 2, 6, hh, on ? '#ffd23f' : '#ffffff'); }
    }
    for (let i = -1; i <= 1; i++) rect(W - 126 + i * 24 - 6, H - 126, 12, 9, i === RIDE.lane ? '#ffd23f' : 'rgba(255,255,255,.35)');
    ctx.globalAlpha = 1;
  },
  tap(x, y) { if (inBox(x, y, STEER.l)) { steer(-1); return true; } if (inBox(x, y, STEER.r)) { steer(1); return true; } return false; },
  key(k) {
    if (k === 'arrowleft' || k === 'a') { steer(-1); return true; }
    if (k === 'arrowright' || k === 'd') { steer(1); return true; }
    return false;
  },
};
Object.assign(EPITAPHS, {
  arrow: [['HE SAW THE ARROW.', 'THE ARROW SAW', 'HIM FIRST.'], ['HERE LIES A MAN', 'WHO THOUGHT HE WAS', 'OUT OF RANGE.']],
  crash: [['HE SAID', '"WHAT ROCK?"'], ['HE TOOK THE', 'SCENIC ROUTE.', 'THROUGH A BOULDER.'], ['ELIZA WAS DRIVING.', 'HE WAS SUPPOSED', 'TO BE WATCHING.']],
});
Object.assign(HURT, { arrow: { title: 'STRUCK BY AN ARROW!', reason: 'HE LET FLY BEFORE YOU FIRED.', color: '#ff3b30' } });

// =====================================================================
//  SUNSET AT AUNT MAE'S CABIN (the wagon pulls up)
// =====================================================================
function spokeWheel(cx, cy, r, ang) {
  for (let k = 0; k < 8; k++) { const a = ang + k * Math.PI / 4; line(cx, cy, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), '#5a3418'); }
  for (let a = 0; a < Math.PI * 2; a += 0.08) { R(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1, '#3b2210'); R(Math.round(cx + Math.cos(a) * (r - 1)), Math.round(cy + Math.sin(a) * (r - 1)), 1, 1, '#7a4a24'); }
  disc(cx, cy, 2, '#3b2210');
}
const WAGON_STOP = 34;
function wagonSide(x, base, moving, ang = -x / 9) {
  x = Math.round(x);
  const wy = base - 24, fr = Math.floor(clock * 7) % 4;
  for (let j = 0; j < 26; j++) { const t = j / 26, inset = Math.round(6 * Math.pow(1 - t, 2)); R(x + 4 + inset, wy - 26 + j, 52 - inset * 2, 1, j < 4 ? '#f8f2e0' : '#ece4cc'); }
  for (const hx of [14, 28, 42]) R(x + hx, wy - 24, 1, 24, '#c8bca0');
  R(x + 50, wy - 20, 6, 20, '#3a2a20');
  ch2Fig({ ...CHARS.newSheriff, pose: 'idle' }, x + 44, wy + 9); ch2Fig({ ...CHARS.eliza, pose: 'idle' }, x + 54, wy + 9);
  R(x, wy, 66, 13, '#7a4a24'); R(x, wy, 66, 1, '#9a6236'); R(x, wy + 6, 66, 1, '#5a3418'); R(x, wy + 13, 66, 2, '#4a2a14');
  R(x + 2, wy + 2, 10, 3, '#c9a040'); signText('PB&J', x + 33, wy + 3, '#f4efe0');
  spokeWheel(x + 12, base - 9, 9, ang); spokeWheel(x + 54, base - 7, 7, ang * 1.3);
  R(x + 66, wy + 8, 12, 2, '#5a3418');
  horse(x + 70, base - 25, 1, (fr + 2) % 4, HORSE_COATS.chestnut, false, null, moving);
  horse(x + 76, base - 23, 1, fr, HORSE_COATS.bay, false, null, moving);
  if (moving && Math.floor(clock * 10) % 2) { R(x - 4, base - 3, 4, 2, 'rgba(200,170,120,.6)'); R(x + 34, base - 2, 5, 2, 'rgba(200,170,120,.5)'); }
}
const CABIN_X = 196, CABIN_B = 150;
function cabinArt(night = 0) {
  ['#3a2f5a', '#6a3a62', '#b04e52', '#e0733f', '#f29a52', '#fbc672'].forEach((c, i) => R(0, i * 15, LW, 15, c));
  disc(150, 86, 13, '#ffd88a'); disc(150, 86, 10, '#ffeab0');
  for (let x = 0; x < LW; x += 2) { const h = 14 + Math.round(8 * Math.sin(x * 0.03 + 1) + 5 * Math.sin(x * 0.09)); R(x, 88 - h, 2, h, '#5a3a5a'); }
  for (let x = 0; x < LW; x += 2) { const h = 6 + Math.round(4 * Math.sin(x * 0.05 + 3)); R(x, 88 - h, 2, h, '#3a2a40'); }
  for (let x = 4; x < LW; x += 9) { const h = 4 + (x * 7) % 5; for (let j = 0; j < h; j++) R(x - (j >> 1), 88 - j, 1 + (j >> 1) * 2, 1, '#241a2a'); }
  R(0, 88, LW, 30, '#6a5a8a'); for (let y = 90; y < 118; y += 3) R(0, y, LW, 1, '#7a6a9a');
  for (let y = 89; y < 118; y += 2) { const w = 4 + Math.round((y - 88) * 0.6), jx = Math.round(Math.sin(clock * 2 + y) * 2); R(150 - w / 2 + jx, y, w, 1, (y >> 1) % 2 ? '#ffd88a' : '#f29a52'); }
  R(0, 116, LW, 64, '#6a6a34'); R(0, 116, LW, 2, '#4a4a24');
  for (let i = 0; i < 60; i++) { const gx = (i * 53) % LW, gy = 122 + (i * 29) % 56; R(gx, gy, 1, 2, '#7e7e40'); }
  for (let y = 150; y < 180; y++) R(0, y, LW, 1, y % 4 ? '#8a6a40' : '#7a5a34');
  R(18, 108, 44, 4, '#6e4224'); for (let x = 20; x < 62; x += 6) R(x, 108, 1, 4, '#4a2a14'); R(22, 112, 2, 6, '#3b2210'); R(56, 112, 2, 6, '#3b2210');
  const cx = CABIN_X, cb = CABIN_B;
  for (let y = cb - 40; y < cb; y += 5) { R(cx, y, 100, 5, '#7a4a24'); R(cx, y, 100, 1, '#9a6236'); R(cx - 2, y + 1, 3, 3, '#c8a070'); R(cx + 99, y + 1, 3, 3, '#c8a070'); }
  for (let j = 0; j < 22; j++) R(cx - 8 + j * 2, cb - 41 - j, 116 - j * 4, 1, j % 3 ? '#4a2a1a' : '#3a2014');
  R(cx + 74, cb - 64, 10, 26, '#7a7470'); for (let y = cb - 62; y < cb - 40; y += 4) R(cx + 74, y, 10, 1, '#5a5450');
  for (let i = 0; i < 5; i++) { const p = (clock * 0.25 + i / 5) % 1; disc(cx + 79 + Math.round(Math.sin(p * 6 + i) * 3 + p * 10), cb - 68 - Math.round(p * 40), 2 + Math.round(p * 3), `rgba(220,210,220,${0.5 * (1 - p)})`); }
  R(cx + 44, cb - 30, 14, 30, '#4a2a14'); R(cx + 46, cb - 28, 10, 28, '#5a3418'); R(cx + 54, cb - 15, 2, 2, '#c9a040');
  R(cx - 6, cb - 2, 112, 3, '#5a3418'); for (const px2 of [cx - 4, cx + 36, cx + 70, cx + 102]) R(px2, cb - 34, 2, 32, '#4a2a14'); R(cx - 6, cb - 36, 112, 2, '#4a2a14');
  R(cx + 66, cb - 10, 10, 8, '#7a4a24'); for (let i = 0; i < 3; i++) disc(cx + 70 + i * 4, cb - 12 - (i % 2) * 3, 2, '#9a6236');
  for (let j = 0; j < 70; j++) R(306 - (j >> 2), 150 - 72 + j, 2 + (j >> 1), 1, j % 6 < 4 ? '#2a3a2a' : '#223022');
  R(304, 150, 4, 6, '#3b2210');
  if (night > 0) {
    R(0, 0, LW, LH, `rgba(8,10,34,${0.78 * night})`);
    ctx.globalAlpha = night;
    for (const [sx, sy] of [[20, 8], [44, 20], [70, 6], [102, 26], [128, 12], [176, 8], [210, 22], [236, 6], [262, 18], [290, 10], [306, 30], [88, 40]]) R(sx, sy, 1, 1, Math.floor(clock * 2 + sx) % 6 ? '#f4efe0' : '#8a90b0');
    disc(60, 34, 6, '#f4efd0'); disc(63, 32, 5, `rgba(20,22,50,1)`);
    ctx.globalAlpha = 1;
  }
  R(cx + 16, cb - 30, 16, 14, '#3b2210'); R(cx + 18, cb - 28, 12, 10, Math.floor(clock * 3) % 7 ? '#ffd46a' : '#ffc040'); R(cx + 23, cb - 28, 1, 10, '#3b2210'); R(cx + 18, cb - 24, 12, 1, '#3b2210');
  for (const [r, a] of [[18, 0.07 + 0.05 * night], [11, 0.09 + 0.06 * night]]) disc(cx + 24, cb - 23, r, `rgba(255,200,100,${a})`);
  for (let i = 0; i < 8; i++) if (Math.floor(clock * 2 + i * 1.7) % 3 === 0) R(20 + (i * 41) % 280, 120 + (i * 17) % 30 + Math.round(Math.sin(clock + i) * 2), 1, 1, '#fff08a');
}
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

const NIGHT_TEXT = 'ELIZA BRINGS UP A HOT CUP OF COFFEE. THE SHERIFF SETTLES IN ON THE ROOF TO KEEP WATCH.';
function roofWatcher() {
  const x = CABIN_X + 46, y = CABIN_B - 62;
  ch2Fig({ ...CHARS.newSheriff, pose: 'drink' }, x, y + 30);
  steam(x + 15, y + 6, 0.5);
}
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
    cabinArt(Math.min(1, this.t / 2)); wagonSide(WAGON_STOP, 150, false); roofWatcher();
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
function siegeBg() {
  ['#8ab8e0', '#a8cce8', '#c8dcec', '#f0dcc0', '#f8c890'].forEach((c, i) => R(0, i * 7, LW, 7, c));
  disc(42, 30, 8, '#fff4c8');
  for (let x = 0; x < LW; x += 2) { const h = 6 + Math.round(4 * Math.sin(x * 0.04 + 2)); R(x, 34 - h, 2, h, '#7a8aa8'); }
  R(0, 34, LW, 8, '#7aa0c8'); for (let y = 35; y < 42; y += 2) R(0, y, LW, 1, '#90b4d8');
  for (let x = -4; x < LW; x += 9) pine(x + ((x * 13) % 5), 52, 18 + (x * 7) % 9, '#2e5038', '#24432e');
  R(0, 50, LW, 100, '#8a9a4a');
  for (let y = 50; y < 150; y += 3) for (let x = (y * 7) % 11; x < LW; x += 11) R(x, y, 1, 1, '#7a8a3a');
  for (let y = 64; y < 150; y++) { const w = 18 + Math.round((y - 64) * 0.9), cx = 160; R(cx - w / 2, y, w, 1, (y >> 1) % 3 ? '#b08a58' : '#a88050'); }
  R(112, 52, 60, 2, '#7a5a34'); R(112, 58, 60, 2, '#7a5a34'); for (const fx of [112, 132, 152, 170]) R(fx, 50, 2, 12, '#5a3a20');
  R(178, 100, 12, 6, '#7a4a24'); R(178, 100, 12, 2, '#c8a070'); R(186, 92, 1, 9, '#7a5a34'); R(184, 92, 4, 3, '#a8a8b0');
  pine(10, 120, 70); pine(312, 124, 74); pine(28, 100, 44, '#335a3c', '#284a30');
}
function siegeFg() {
  bushBlob(47, 88, 32, 16);
  boulder(109, 86, 36, 18);
  R(150, 64, 40, 14, '#7a4a24'); R(150, 64, 40, 1, '#9a6236'); R(150, 70, 40, 1, '#5a3418'); spokeWheel(156, 80, 6, 0.3); spokeWheel(184, 80, 6, 1.1);
  for (let j = 0; j < 14; j++) R(152 + (j < 3 ? 3 - j : 0), 50 + j, 36 - (j < 3 ? (3 - j) * 2 : 0), 1, '#ece4cc');
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { const lx = 208 + r * 3 + i * 6, ly = 84 - r * 5; disc(lx + 3, ly, 3, '#8a5530'); disc(lx + 3, ly, 1, '#c8a070'); }
  bushBlob(275, 88, 32, 16);
  bushBlob(75, 128, 38, 18);
  R(228, 112, 26, 16, '#6e4224'); R(228, 112, 26, 2, '#9a6236'); R(228, 118, 26, 1, '#3b2210'); R(228, 124, 26, 1, '#3b2210'); R(230, 113, 22, 1, '#6a8ab0');
  R(134, 116, 32, 14, '#8a8478'); for (let i = 0; i < 4; i++) R(134 + i * 8 + ((i % 2) * 2), 118 + (i % 2) * 5, 6, 3, '#a8a298'); R(134, 116, 32, 2, '#b8b2a8');
  R(136, 92, 2, 24, '#5a3a20'); R(162, 92, 2, 24, '#5a3a20'); R(132, 90, 36, 3, '#6e4224'); R(149, 96, 1, 12, '#c8b890'); R(146, 106, 7, 5, '#7a5a34');
  for (let y = 148; y < LH; y++) { const sh = (y - 148) >> 2; R(0, y, LW, 1, (y % 4 === 0) ? '#2a160c' : '#4a2a1a'); for (let x = (sh % 2) * 9; x < LW; x += 18) R(x, y, 1, 1, '#2a160c'); }
  R(0, 147, LW, 2, '#6e4224');
  R(272, 118, 22, 62, '#7a7470'); for (let y = 120; y < LH; y += 5) R(272, y, 22, 1, '#5a5450'); R(270, 116, 26, 4, '#8a8480');
  for (let i = 0; i < 4; i++) { const p = (clock * 0.3 + i / 4) % 1; disc(283 + Math.round(Math.sin(p * 6 + i) * 3), 112 - Math.round(p * 40), 2 + Math.round(p * 3), `rgba(230,225,225,${0.45 * (1 - p)})`); }
  speckled(30, 158, 9, 10, '#3a5a8a'); R(30, 158, 9, 1, '#e8e8f0'); R(39, 160, 2, 1, '#3a5a8a'); R(40, 160, 1, 5, '#3a5a8a'); R(39, 164, 2, 1, '#3a5a8a');
}
SETS.cabinSiege = { bg: siegeBg, fg: siegeFg, outdoor: true };
LEVELS.push({
  label: 'CH. 2', name: 'THE CABIN', set: 'cabinSiege',
  spots: {
    bushL: { x: 34, y: 52, w: 26, h: 36, a: 'bottom' }, rock: { x: 96, y: 50, w: 26, h: 36, a: 'bottom' },
    wagon: { x: 157, y: 26, w: 26, h: 36, a: 'bottom' }, wood: { x: 210, y: 46, w: 28, h: 36, a: 'bottom' },
    bushR: { x: 262, y: 52, w: 26, h: 36, a: 'bottom' }, bushF: { x: 62, y: 92, w: 26, h: 36, a: 'bottom' },
    well: { x: 137, y: 92, w: 26, h: 36, a: 'bottom' }, barrel: { x: 228, y: 90, w: 26, h: 36, a: 'bottom' },
  },
  // [time, spot, 'o' bandit (gun) / 'n' native (bow), seconds before they fire]
  events: [[1.0, 'bushL', 'o', 1.9], [2.4, 'rock', 'n', 1.8], [3.6, 'bushR', 'o', 1.8], [4.6, 'wagon', 'n', 1.7], [5.4, 'well', 'o', 1.7],
           [6.6, 'bushF', 'n', 1.6], [7.4, 'wood', 'o', 1.6], [8.4, 'barrel', 'n', 1.5], [8.8, 'bushL', 'o', 1.5], [10.0, 'rock', 'o', 1.5],
           [10.6, 'bushR', 'n', 1.4], [11.8, 'wagon', 'o', 1.4], [12.2, 'well', 'n', 1.4], [13.4, 'bushF', 'o', 1.3], [13.8, 'wood', 'n', 1.3],
           [15.0, 'barrel', 'o', 1.3], [15.4, 'bushL', 'n', 1.25], [16.4, 'rock', 'o', 1.25], [16.8, 'bushR', 'o', 1.25], [17.8, 'wagon', 'n', 1.2],
           [18.6, 'well', 'o', 1.2], [19.0, 'bushF', 'n', 1.2], [20.2, 'wood', 'o', 1.15], [20.6, 'barrel', 'n', 1.15], [21.8, 'bushL', 'o', 1.1],
           [22.2, 'bushR', 'n', 1.1], [23.4, 'rock', 'o', 1.05], [23.8, 'wagon', 'o', 1.05], [24.2, 'well', 'n', 1.05]],
  spec: (ty, n) => (ty === 'n' ? { ...NATIVE_RIDERS[n % NATIVE_RIDERS.length], pose: 'bow' } : { ...OUTLAWS[n % OUTLAWS.length], pose: 'aim' }),
  props: [{ k: 'bottle', x: 120, y: 44, c: '#3a7a3a', layer: 'bg' }, { k: 'bottle', x: 140, y: 44, c: '#7a4a1a', layer: 'bg' }, { k: 'bottle', x: 160, y: 44, c: '#8a2a2a', layer: 'bg' },
          { k: 'can', x: 182, y: 95, layer: 'bg' }, { k: 'jug', x: 222, y: 60, layer: 'fg' }, { k: 'lantern', x: 150, y: 92, layer: 'fg' }],
});
const CABIN_LEVEL = LEVELS.length - 1;
CUTS.ch2Dawn = {
  set: 'cabinSiege', actors: [],
  lines: [
    ['narr', 'THE NEXT MORNING, THE SHERIFF WAKES UP ON THE ROOF. THE COFFEE IS COLD.'],
    ['narr', 'BANDITS AND NATIVES HAVE SURROUNDED THE CABIN.'],
    ['eliza', "SHERIFF! THEY'RE HIDIN' ALL OVER THE YARD! DON'T LET 'EM REACH THE DOOR!"],
  ],
};

// =====================================================================
//  RIDING ON ALONG THE LAKE (end of chapter 2)
// =====================================================================
function lakeRideArt() {
  const s = clock * 40;
  ['#7ab0e0', '#9ac4e8', '#bcd8ee', '#dceaf0'].forEach((c, i) => R(0, i * 10, LW, 10, c));
  disc(250, 16, 8, '#fff6c8');
  for (let i = 0; i < 3; i++) { const cx = ((i * 140 - clock * 4) % 420 + 420) % 420 - 50; R(cx, 10 + i * 7, 34, 4, '#f4f8fc'); R(cx + 8, 7 + i * 7, 18, 3, '#f4f8fc'); }
  for (let x = 0; x < LW; x += 2) { const wx = x + s * 0.1, h = 12 + Math.round(7 * Math.sin(wx * 0.03) + 4 * Math.sin(wx * 0.11)); R(x, 44 - h, 2, h, '#8a90b0'); }
  for (let x = 0; x < LW; x += 2) { const wx = x + s * 0.25; for (let j = 0; j < 6 + Math.round(3 * Math.sin(wx * 0.2)); j++) R(x, 46 - j, 2, 1, '#3e6a4a'); }
  R(0, 46, LW, 26, '#5a8ac0'); for (let y = 48; y < 72; y += 3) for (let x = ((y * 13 - s * 0.5) % 24 + 24) % 24 - 24; x < LW; x += 24) R(Math.round(x), y, 8, 1, '#7aa8d8');
  disc(250, 60, 3, '#fff6c8');
  R(0, 72, LW, 4, '#7a9a4a');
  for (let i = 0; i < 40; i++) { const rx = ((i * 37 - s * 0.8) % 340 + 340) % 340 - 10; R(Math.round(rx), 66 + (i % 3), 1, 8, '#4a6a2a'); R(Math.round(rx), 65 + (i % 3), 1, 2, '#7a5a34'); }
  R(0, 76, LW, 30, '#b08a58'); for (let i = 0; i < 30; i++) { const dx = ((i * 53 - s) % 340 + 340) % 340 - 10; R(Math.round(dx), 80 + (i * 7) % 24, 3, 1, '#9a7448'); }
  R(0, 106, LW, 74, '#6e8a3a'); for (let i = 0; i < 40; i++) { const fx = ((i * 29 - s * 1.3) % 340 + 340) % 340 - 10; R(Math.round(fx), 108 + (i * 11) % 8, 1, 1, ['#e8c040', '#f4efe0', '#c04a6a'][i % 3]); }
  wagonSide(118, 102, true, clock * 4.5);
}
SETS.lakeRide = { bg: lakeRideArt, fg: () => {} };
CUTS.ch2Lake = {
  set: 'lakeRide', actors: [], tune: 'morning',
  lines: [
    ['narr', 'WITH THE YARD QUIET AGAIN, THEY HITCH UP THE TEAM AND RIDE ON ALONG THE LAKE.'],
    ['eliza', "CRYSTAL CANYON'S JUST PAST THOSE HILLS. HANG ON, JEB. WE'RE COMIN'."],
  ],
};

// =====================================================================
//  END OF CHAPTER 2
// =====================================================================
SCENES.ch2End = {
  tune: 'morning',
  enter() { saveBest(); sfx.win(); },
  world() { lakeRideArt(); },
  ui() {
    dim(0.6); panel(W / 2 - 330, 70, 660, 400);
    text('END OF CHAPTER 2', W / 2, 98, 32, '#ffd23f', 'center');
    const acc = shots ? Math.round(hits / shots * 100) : 0;
    [['OUTLAWS DROPPED', S.n.outlaw], ['HATS SHOT', S.n.hat], ['BOTTLES', S.n.bottle], ['BIRDS & OTHER TARGETS', S.n.obj], ['ACCURACY', acc + '%']]
      .forEach(([k, v], i) => { text(k, W / 2 - 280, 170 + i * 36, 16, '#ffffff'); text(String(v), W / 2 + 280, 170 + i * 36, 16, '#f3d18b', 'right'); });
    text('SCORE ' + score, W / 2, 364, 24, '#ffffff', 'center');
    text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, 404, 16, '#ffd23f', 'center');
    if (Math.floor(clock * 2.5) % 2) text('TAP FOR TITLE', W / 2, 440, 16, '#f3d18b', 'center');
  },
  tap() { if (this.t > 0.8) toTitle(); },
  key() { this.tap(); },
};

// ---------------- STORY ORDER (chapter 2) ----------------
const STORY2 = [{ cut: 'ch2Saloon' }, { run: 'trail' }, { cut: 'ch2Cabin' }, { scene: 'ch2Night' }, { cut: 'ch2Dawn' }, { level: CABIN_LEVEL }, { cut: 'ch2Lake' }, { scene: 'ch2End' }];
