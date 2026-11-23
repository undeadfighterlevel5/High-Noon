// =====================================================================
//  HIGH NOON — CHAPTER 2: THE CRYSTAL CANYON RUN  (work in progress)
//  Loaded after engine.js and chapter1.js. For now it's only reachable
//  from the TEST button on the main title screen.
//
//  Flow:  ch2Room (night, fade to black) -> ch2Title (breakfast + badges)
//         -> ch2Saloon cutscene (Eliza walks in) -> ch2End (to be continued)
// =====================================================================

// ---------------- CAST ----------------
Object.assign(CHARS, {
  eliza: { hat: 'bonnet', hatC: '#3a4466', ribbon: '#c8a040', skin: '#f0c8a0', hair: '#8a3a1a', shirt: '#2f4a6a', dress: '#2f4a6a', face: 'plain', bg: '#4a3a5a' },
  gus:   { hat: 'none', skin: '#e0a070', hair: '#2a1a10', shirt: '#f4efe0', vest: '#7a2a2a', pants: '#3a3a3a', boots: '#2a1a10', face: 'mustache', beardC: '#2a1a10' },
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

// ---------------- MUSIC: a slow, sunny porch waltz for the breakfast screen ----------------
TUNES.morning = {
  notes: ('D4 - G4 - B4 - | D5 - - - B4 C5 | D5 - C5 - A4 - | G4 - - - - - | ' +
          'E4 - G4 - C5 - | B4 - - - A4 G4 | A4 - B4 - F#4 - | G4 - - - - -').replace(/\|/g, '').trim().split(/\s+/),
  bass: ['G2', 'G2', 'C3', 'G2', 'C3', 'G2', 'D3', 'G2'], bar: 6, eighth: 60 / 84 / 2, vol: 0.08, style: 'waltz', birds: true,
};

// ---------------- SHARED HELPERS ----------------
const CH2 = { enterAt: null };
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
function roomArt(lampOn) {
  // wallpaper + ceiling beam
  R(0, 0, 320, 112, '#3e5654');
  for (let x = 0; x < 320; x += 12) R(x, 0, 4, 108, '#46605e');
  for (let y = 14; y < 104; y += 14) for (let x = 8 + ((y / 14) % 2) * 6; x < 320; x += 12) { R(x, y - 1, 1, 1, '#6a8a74'); R(x - 1, y, 3, 1, '#6a8a74'); R(x, y + 1, 1, 1, '#6a8a74'); }
  R(0, 0, 320, 7, '#3b2210'); R(0, 7, 320, 1, '#5a3418');
  // window: night sky, moon, sleeping town
  R(24, 24, 60, 58, '#4a2a14'); R(27, 27, 54, 52, '#141c38');
  for (const [sx, sy] of [[31, 31], [40, 44], [47, 33], [33, 50], [58, 30], [75, 47], [70, 56], [36, 39]]) R(sx, sy, 1, 1, Math.floor(clock * 2 + sx) % 5 ? '#f4efe0' : '#8a90b0');
  disc(68, 38, 6, '#f4efd0'); disc(71, 36, 5, '#141c38');
  R(27, 66, 18, 13, '#0c1020'); R(45, 60, 14, 19, '#0c1020'); R(48, 56, 8, 4, '#0c1020'); R(59, 70, 22, 9, '#0c1020'); R(50, 66, 2, 2, '#e0a040');
  R(53, 27, 2, 52, '#4a2a14'); R(27, 52, 54, 2, '#4a2a14'); R(22, 82, 64, 3, '#6e4224');
  R(14, 18, 80, 2, '#c9a040');
  for (const cx of [18, 80]) { R(cx, 20, 10, 66, '#7a2a2a'); R(cx + 3, 20, 1, 66, '#5a1a1a'); R(cx + 7, 20, 1, 66, '#5a1a1a'); }
  // WANTED poster with a big red X (somebody already took care of him)
  R(100, 30, 22, 28, '#ecd8a4'); R(104, 35, 14, 3, '#1b1410'); R(106, 38, 10, 8, '#c98a5a'); R(107, 45, 8, 3, '#1b1410'); R(104, 52, 14, 1, '#5a3418'); R(104, 54, 10, 1, '#5a3418');
  line(101, 31, 121, 57, '#c0302b'); line(102, 31, 122, 57, '#c0302b'); line(121, 31, 101, 57, '#c0302b'); line(122, 31, 102, 57, '#c0302b');
  // baseboard + floor + rug
  R(0, 106, 320, 6, '#3b2210'); R(0, 112, 320, 68, '#6e4224');
  for (const y of [116, 121, 127, 134, 142, 151, 161, 172]) R(0, y, 320, 1, '#5a3418');
  R(146, 116, 120, 16, '#7a2a2a'); R(149, 118, 114, 12, '#a8503a'); for (let x = 152; x < 260; x += 8) R(x, 123, 4, 2, '#e2b33c');
  // bed
  R(150, 58, 8, 54, '#5a3418'); R(150, 58, 8, 2, '#9a6236'); disc(154, 55, 3, '#9a6236');
  R(158, 96, 112, 6, '#4a2a14'); R(160, 102, 4, 10, '#3b2210'); R(264, 102, 4, 10, '#3b2210');
  R(158, 88, 112, 8, '#e8e0cc'); R(160, 80, 22, 9, '#f4efe0'); R(160, 80, 22, 1, '#ffffff');
  const QC = ['#b04a3a', '#d8b060', '#4a6a8a', '#e8e0cc', '#6a8a4a'], breathe = Math.round(Math.sin(clock * 1.6));
  for (let x = 176; x < 270; x += 6) for (let y = 84; y < 100; y += 4) {
    const top = x > 188 && x < 236 ? 80 - breathe : 84; if (y < top) continue;
    R(x, y, 6, 4, QC[((x / 6) + (y / 4) * 2) % QC.length | 0]);
  }
  R(188, 80 - breathe, 48, 1, '#3b2210'); R(176, 84, 12, 1, '#3b2210'); R(236, 84, 34, 1, '#3b2210');
  R(270, 76, 8, 36, '#5a3418'); R(270, 76, 8, 2, '#9a6236'); disc(274, 73, 3, '#9a6236');
  // the sheriff: hat over the face, mustache peeking out
  R(166, 80, 10, 3, '#e0a070'); R(167, 82, 8, 1, '#5a3a20');
  R(159, 78, 26, 2, '#6b4a2a'); R(164, 72, 16, 6, '#6b4a2a'); R(164, 76, 16, 1, '#3b2210'); R(166, 73, 2, 2, '#8a6a4a');
  // gun belt hanging off the headboard
  R(144, 60, 2, 20, '#4a2a14'); R(144, 60, 8, 2, '#4a2a14'); R(141, 76, 8, 13, '#3b2210'); R(142, 72, 4, 5, '#b8b8c0');
  // boots: one standing, one tipped over
  R(284, 96, 6, 14, '#4a2a14'); R(284, 108, 11, 4, '#4a2a14'); R(286, 98, 1, 10, '#6a4020');
  R(298, 106, 16, 6, '#4a2a14'); R(310, 101, 5, 5, '#4a2a14'); R(300, 107, 10, 1, '#6a4020');
  // nightstand: lamp + a plate with nothing left but a T-bone
  R(116, 88, 30, 3, '#8a5530'); R(118, 91, 26, 21, '#6e4224'); R(122, 96, 18, 6, '#5a3418'); R(130, 98, 2, 2, '#c9a040');
  R(133, 86, 12, 2, '#f4efe0'); R(135, 84, 7, 2, '#f0e8d8'); R(137, 83, 2, 1, '#f0e8d8'); R(144, 84, 1, 3, '#b8b8c0');
  R(120, 84, 10, 4, '#c9a040'); R(121, 78, 8, 6, '#8ab0a0'); R(122, 67, 6, 11, '#b8ccc8'); R(122, 67, 1, 11, '#e0ecea');
  if (lampOn) { const fh = 4 + (Math.floor(clock * 9) % 3 === 0 ? 1 : 0); R(124, 76 - fh, 2, fh, '#ffd23f'); R(124, 75, 2, 1, '#ff9a3a'); }
  // lighting
  if (lampOn) {
    R(0, 0, 320, 180, 'rgba(10,8,30,0.28)');
    for (const [r, a] of [[70, 0.05], [48, 0.06], [30, 0.07], [16, 0.08]]) disc(125, 72, r, `rgba(255,190,110,${a})`);
  } else {
    R(0, 0, 320, 180, 'rgba(4,6,22,0.68)');
    for (let k = 0; k < 40; k++) R(28 + k, 112 + Math.floor(k / 2), 40, 1, 'rgba(150,170,230,0.10)'); // moonbeam on the floor
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
      if (before < 0.6 && this.outT >= 0.6) noise(0.18, 0.12, 900); // *puff* goes the lamp
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
    for (let i = 0; i < 3; i++) { // Zzz drifting up from under the hat
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
  // log cabin wall
  for (let y = 0; y < 96; y += 10) { R(0, y, 320, 10, '#8a5a30'); R(0, y, 320, 1, '#a8703c'); R(0, y + 8, 320, 2, '#5a3418'); }
  for (const [x, y] of [[30, 12], [120, 42], [200, 22], [280, 82], [60, 72], [170, 82]]) R(x, y + 3, 6, 2, '#6e4224'); // knots
  // window with sunrise over the mesas
  R(220, 12, 84, 64, '#4a2a14');
  ['#9ec8e8', '#cfe3ee', '#fbe0b0', '#f6c27a'].forEach((c, i) => R(223, 15 + i * 14, 78, 14, c));
  disc(266, 64, 9, '#fff2b0'); R(223, 62, 78, 11, '#c07a5a'); R(232, 58, 22, 4, '#c07a5a'); R(274, 56, 16, 6, '#a86a4a'); R(223, 70, 78, 3, '#8a5a3a');
  R(261, 15, 2, 58, '#4a2a14'); R(223, 43, 78, 2, '#4a2a14'); R(218, 76, 88, 3, '#6e4224');
  for (const cx of [212, 298]) { gingham(cx, 8, 12, 70, 3); }
  R(208, 6, 104, 2, '#3b2210');
  // horseshoe for luck (open end up, so the luck doesn't run out)
  R(40, 16, 2, 9, '#8a8a96'); R(52, 16, 2, 9, '#8a8a96'); R(42, 25, 10, 2, '#8a8a96'); R(41, 24, 1, 1, '#8a8a96'); R(52, 24, 1, 1, '#8a8a96'); R(46, 12, 2, 3, '#3b2210');
  // shelf: flour sack, tins, jar
  R(14, 46, 84, 3, '#5a3418'); R(18, 49, 2, 6, '#3b2210'); R(90, 49, 2, 6, '#3b2210');
  R(20, 32, 16, 14, '#e8dcc0'); R(22, 30, 12, 3, '#e8dcc0'); R(24, 38, 8, 3, '#8a5a30');
  R(42, 36, 10, 10, '#a8a8b0'); R(42, 38, 10, 4, '#c0302b'); R(56, 38, 9, 8, '#a8a8b0'); R(56, 40, 9, 3, '#3a6a3a');
  R(70, 34, 10, 12, '#d8eef0'); R(70, 34, 10, 2, '#8a5a30'); R(72, 38, 6, 7, '#e2b33c');
  // sunbeam + dust motes
  for (let k = 0; k < 64; k++) R(214 - k * 1.3, 76 + k * 0.9, 46, 1, 'rgba(255,240,190,0.07)');
  for (let i = 0; i < 7; i++) { const p = (clock * 0.05 + i * 0.143) % 1; R(Math.round(200 - p * 70 + Math.sin(clock + i) * 3), Math.round(80 + p * 40), 1, 1, 'rgba(255,250,220,0.8)'); }
  // table: gingham top (3/4 view) + hanging skirt
  R(0, 92, 320, 88, '#3b2210');
  gingham(6, 96, 308, 24, 4); gingham(6, 120, 308, 32, 6); R(6, 120, 308, 1, 'rgba(0,0,0,0.25)');
  for (let x = 6; x < 314; x += 12) R(x + 4, 152, 4, 2, '#b02a26');
  // coffee pot (blue enamelware) + steam
  speckled(42, 72, 22, 34, '#3a5a8a'); speckled(46, 66, 14, 6, '#3a5a8a'); R(51, 62, 4, 4, '#2a2a2a'); R(45, 76, 2, 26, '#6a8ab8');
  line(64, 84, 72, 74, '#3a5a8a'); line(64, 85, 73, 75, '#3a5a8a'); line(64, 86, 73, 76, '#3a5a8a');
  R(36, 76, 6, 2, '#2a2a2a'); R(36, 76, 2, 22, '#2a2a2a'); R(36, 96, 6, 2, '#2a2a2a'); R(40, 104, 26, 3, 'rgba(0,0,0,0.2)');
  steam(73, 72, 0);
  // fork
  R(86, 104, 14, 1, '#c8c8d0'); R(100, 103, 4, 1, '#c8c8d0'); R(100, 105, 4, 1, '#c8c8d0'); R(100, 104, 4, 1, '#c8c8d0');
  // plate + pancake stack + butter + syrup
  R(106, 102, 88, 6, '#f4efe0'); R(110, 100, 80, 2, '#f4efe0'); R(110, 108, 80, 2, '#d8d0c0'); R(104, 110, 92, 2, 'rgba(0,0,0,0.18)');
  for (let i = 0; i < 6; i++) { const ox = [0, 1, -1, 1, 0, -1][i], y = 97 - i * 5; R(120 + ox, y, 44, 5, '#d8a050'); R(120 + ox, y, 44, 1, '#f0c070'); R(120 + ox, y + 4, 44, 1, '#a8702c'); }
  R(119, 70, 46, 2, '#8a3a10'); R(122, 72, 2, 11, '#8a3a10'); R(160, 72, 2, 16, '#8a3a10'); R(141, 72, 2, 7, '#8a3a10'); R(160, 100, 8, 2, '#a04a14');
  R(136, 65, 11, 5, '#fff2a0'); R(137, 65, 4, 1, '#ffffff'); R(141, 70, 3, 1, '#fff2a0');
  // egg + bacon
  R(168, 101, 20, 4, '#f4efe0'); R(170, 99, 14, 2, '#f4efe0'); disc(177, 101, 3, '#f0a020'); R(176, 99, 1, 1, '#ffe080');
  for (let i = 0; i < 26; i++) { const y = 104 + (i % 8 < 4 ? 0 : 1); R(124 + i, y, 1, 2, '#a83a2a'); R(124 + i, y + 2, 1, 1, '#f0c8a0'); }
  // a jar of peanut butter and a jar of grape jelly. Foreshadowing!
  R(203, 90, 9, 14, '#b07a3a'); gingham(202, 87, 11, 3, 1); R(204, 94, 7, 4, '#ecd8a4');
  R(214, 90, 9, 14, '#6a2a7a'); gingham(213, 87, 11, 3, 1); R(215, 94, 7, 4, '#ecd8a4'); R(215, 91, 1, 10, '#9a5aa8');
  // tin mug of coffee + steam
  speckled(230, 84, 18, 22, '#3a5a8a'); R(230, 84, 18, 2, '#e8e8f0'); R(231, 85, 16, 1, '#3a1a0a');
  R(248, 88, 5, 2, '#3a5a8a'); R(251, 88, 2, 11, '#3a5a8a'); R(248, 97, 5, 2, '#3a5a8a'); R(228, 106, 22, 2, 'rgba(0,0,0,0.2)');
  steam(236, 82, 1.7); steam(242, 82, 3.1);
  // the morning paper
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
    if (this.t < 0.6) return; // don't let the tap that skipped the night pick a badge by accident
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
  R(cx - 20, 100, 40, 3, '#2f5a3a'); R(cx - 20, 100, 40, 1, '#4a7a52'); R(cx - 18, 103, 36, 15, '#24452c'); R(cx - 18, 117, 36, 1, '#18301e'); // green felt, draped to the floor
  for (let i = 0; i < 4; i++) { R(cx - 14 + i * 8, 99, 3, 2, '#f4efe0'); R(cx - 13 + i * 8, 99, 1, 1, i % 2 ? '#c0302b' : INK); }
  ['#c0302b', '#f4efe0', '#4a7ab8'].forEach((c, i) => R(cx + 8 + i * 3, 98 - (seed + i) % 3, 2, 2 + (seed + i) % 3, c)); // poker chips
}
function saloonWideArt(quiet) {
  const bob = i => (quiet ? 0 : Math.floor(clock * 4 + i) % 2);
  // upstairs: rooms off the balcony
  wallpaper(0, 46); R(0, 0, 320, 5, '#3b2210');
  [[1, 34], [2, 132], [3, 230]].forEach(([n, x]) => {
    R(x, 10, 24, 34, '#3b2210'); R(x + 2, 12, 20, 32, '#5a3418'); R(x + 4, 14, 16, 12, '#4a2a14'); R(x + 4, 29, 16, 12, '#4a2a14'); R(x + 18, 28, 2, 2, '#c9a040');
    R(x + 9, 5, 6, 4, '#c9a040'); R(x + 11, 6, 2, 2, '#3b2210');
  });
  R(34, 12, 4, 32, '#141010'); // room 1 left open... someone just woke up
  R(0, 34, 320, 2, '#7a4a28'); R(0, 34, 320, 1, '#a8703c'); for (let x = 2; x < 320; x += 5) R(x, 36, 2, 8, '#6e4224');
  R(0, 44, 320, 4, '#5a3418'); R(0, 44, 320, 1, '#9a6236'); R(0, 48, 320, 2, '#2a120c');
  // downstairs wall + wainscot
  wallpaper(50, 42); R(0, 92, 320, 20, '#6e4224'); for (let x = 2; x < 320; x += 24) { R(x, 95, 20, 14, '#7a4a28'); R(x, 95, 20, 1, '#9a6236'); }
  for (const x of [96, 214]) { R(x, 48, 4, 64, '#5a3418'); R(x, 48, 1, 64, '#9a6236'); }
  // the doorway out to the street (bright morning outside)
  R(8, 58, 28, 54, '#f4d79a'); R(8, 58, 28, 10, '#bcdcf0'); R(8, 96, 28, 16, '#c4914f');
  R(6, 56, 32, 2, '#3b2210'); R(6, 56, 2, 56, '#3b2210'); R(36, 56, 2, 56, '#3b2210');
  const since = CH2.enterAt == null ? 99 : clock - CH2.enterAt, swing = since < 2 ? Math.sin(since * 13) * (1 - since / 2) : 0;
  const dw = Math.max(3, Math.round(12 * (1 - Math.abs(swing) * 0.75)));
  R(8, 76, dw, 18, '#9a6236'); R(8, 76, dw, 1, '#c98a4b'); R(36 - dw, 76, dw, 18, '#9a6236'); R(36 - dw, 76, dw, 1, '#c98a4b');
  // floor
  R(0, 112, 320, 68, '#7a4a28'); for (const y of [115, 119, 124, 130, 137, 145, 154, 164, 175]) R(0, y, 320, 1, '#5a3418');
  // chandelier
  R(160, 50, 1, 6, '#3b2210'); R(150, 57, 22, 2, '#c9a040'); R(155, 59, 12, 1, '#a88030');
  for (const cx of [151, 157, 164, 170]) { R(cx, 53, 2, 4, '#f4efe0'); R(cx, 51 - (Math.floor(clock * 8 + cx) % 2), 2, 2, '#ffd23f'); }
  // piano + Piano Pete (he stops playing when the doors swing open)
  R(40, 80, 30, 32, '#2a1a14'); R(38, 78, 34, 3, '#3b2a20'); R(64, 90, 8, 4, '#f4efe0'); R(42, 84, 20, 10, '#3b2a20'); R(44, 72, 8, 6, '#f4efe0');
  ch2Fig({ ...CHARS.pete, pose: 'idle' }, 66, 112 - bob(0), true);
  if (!quiet && Math.floor(clock * 3) % 2) R(52, 62 - Math.floor(clock * 6) % 4, 2, 3, '#f4efe0'); // little music note
  // card tables (players sit behind the felt)
  ch2Fig({ ...CH2_PATRONS[0], pose: 'idle' }, 98, 116 - bob(1)); ch2Fig({ ...CH2_PATRONS[1], pose: bob(2) ? 'drink' : 'idle' }, 118, 116); cardTable(118, 0);
  ch2Fig({ ...CH2_PATRONS[2], pose: 'idle' }, 164, 116 - bob(3)); ch2Fig({ ...CH2_PATRONS[3], pose: 'idle' }, 180, 116); ch2Fig({ ...CH2_PATRONS[4], pose: 'idle' }, 196, 116 - bob(4), true); cardTable(188, 1);
  // a hound asleep under table two
  R(176, 114, 16, 4, '#8a5a30'); R(190, 112, 6, 5, '#8a5a30'); R(194, 114, 3, 2, '#6a4020'); R(190, 112, 2, 3, '#5a3418'); R(172, 116, 5, 1, '#8a5a30'); R(192, 113, 1, 1, INK);
  // the bar: back shelves, mirror, Gus, counter, regulars
  R(226, 56, 94, 3, '#5a3418'); R(226, 70, 94, 3, '#5a3418');
  ['#3a7a3a', '#7a4a1a', '#8a2a2a', '#c8d8d0', '#4a6a8a'].forEach((c, i) => { R(230 + i * 18, 48, 4, 8, c); R(231 + i * 18, 46, 2, 2, c); R(238 + i * 18, 62, 4, 8, c); });
  R(250, 74, 52, 16, '#7fa0a8'); R(252, 76, 6, 1, '#c8e0e4');
  ch2Fig({ ...CHARS.gus, pose: quiet ? 'idle' : (bob(5) ? 'wave' : 'idle') }, 276, 108);
  R(222, 90, 98, 3, '#a8703c'); R(224, 93, 96, 19, '#7a4a28'); for (let x = 228; x < 320; x += 24) { R(x, 96, 18, 12, '#8a5530'); R(x, 96, 18, 1, '#a8703c'); }
  R(224, 108, 96, 2, '#c9a040');
  ch2Fig({ ...CH2_PATRONS[5], pose: bob(6) ? 'drink' : 'idle' }, 232, 112); ch2Fig({ ...CH2_PATRONS[1], hatC: '#5a2a2a', shirt: '#7a8a6a', pose: 'idle' }, 252, 112, true);
  R(216, 106, 6, 6, '#c9a040'); R(217, 105, 4, 1, '#e2b33c'); // spittoon
}
function drawEliza() {
  if (CH2.enterAt == null) return;
  const t = clock - CH2.enterAt, x = Math.min(140, 12 + t * 36), walking = x < 140;
  const fr = walking && Math.floor(clock * 7) % 2;
  ch2Fig({ ...CHARS.eliza, pose: 'idle', step: fr ? 1 : 0 }, Math.round(x), 113 - (fr ? 1 : 0));
}
CUTS.ch2Saloon = {
  set: 'saloonWide', actors: [],
  start() { CH2.enterAt = null; },
  after() { if (CH2.enterAt == null && cutLine >= 1) CH2.enterAt = clock; drawEliza(); },
  lines: [
    ['narr', "THE NEXT MORNING. THE SALOON IS ALREADY BUSY. THE COFFEE'S STRONG AND THE CARDS ARE CROOKED."],
    ['narr', 'THEN THE DOORS SWING OPEN, AND THE WHOLE ROOM GOES QUIET.'],
    ['eliza', "YOU THE NEW SHERIFF? WORD IS YOU'RE QUICK WITH THAT IRON."],
    ['eliza', "NAME'S ELIZA HOLLOWAY. MY HUSBAND JEB TOOK A JOB HAULIN' SUPPLIES FOR THE PB&J RAILROAD COMPANY."],
    ['eliza', "THAT WAS SIX WEEKS AGO. NOT A LETTER. NOT A TELEGRAM. NOTHIN'."],
    ['eliza', "THE COMPANY SAYS HE NEVER SHOWED UP FOR WORK. I SAY THEY'RE LYIN'."],
    ['eliza', 'HIS LAST LETTER CAME FROM CRYSTAL CANYON. TO GET THERE, I HAVE TO CROSS INDIAN TERRITORY.'],
    ['eliza', 'NO STAGE DRIVER WILL TAKE ME. SO I NEED A HIRED GUN.'],
    ['eliza', "I CAN'T PAY MUCH. BUT I MAKE A MEAN PEACH COBBLER."],
    ['gus', "SHE AIN'T LYIN' ABOUT THE COBBLER, SHERIFF."],
    ['eliza', 'WE LEAVE WITHIN THE HOUR. ARE YOU IN?'],
  ],
};
SETS.saloonWide = { bg: () => saloonWideArt(CH2.enterAt != null && state === 'cut' && cutLine < 9), fg: () => {} };

// =====================================================================
//  SCENE 4: TO BE CONTINUED (placeholder until the next part is built)
// =====================================================================
SCENES.ch2End = {
  world() { saloonWideArt(false); ch2Fig({ ...CHARS.eliza, pose: 'idle' }, 140, 113); },
  ui() {
    dim(0.55); panel(W / 2 - 330, 150, 660, 200);
    text('TO BE CONTINUED...', W / 2, 180, 32, '#ffd23f', 'center');
    text('NEXT: THE ROAD TO CRYSTAL CANYON', W / 2, 244, 16, '#ffffff', 'center');
    if (Math.floor(clock * 2.5) % 2) text('TAP FOR TITLE', W / 2, 296, 16, '#f3d18b', 'center');
  },
  tap() { if (this.t > 0.5) toTitle(); },
  key() { this.tap(); },
};

// ---------------- STORY ORDER (chapter 2) ----------------
const STORY2 = [{ cut: 'ch2Saloon' }, { scene: 'ch2End' }];
