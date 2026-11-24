// =====================================================================
//  HIGH NOON — THE LEGEND OF MAD DOG BUCHANAN
//  ENGINE — drawing, sound, shooting, UI. Shared by every chapter.
// =====================================================================
const W = 960, H = 540, SW = 160, CW = W + SW * 2, P = 3, LW = 320, LH = 180, INK = '#1b1410';

// mult = outlaw timer multiplier, hatG = hat gravity, hits = shots you can take per heart, crashes = wagon bumps per heart
const DIFFICULTY = {
  yellow:     { key: 'yellow',     name: 'YELLOW BELLY', mult: 2.2,  lives: 5, draw: 1.4,  hatG: 190, hits: 2, crashes: 3 },
  deputy:     { key: 'deputy',     name: 'DEPUTY',       mult: 1.35, lives: 5, draw: 0.9,  hatG: 260, hits: 1, crashes: 2 },
  gunslinger: { key: 'gunslinger', name: 'GUNSLINGER',   mult: 0.8,  lives: 3, draw: 0.55, hatG: 260, hits: 1, crashes: 1 },
};

// ---------------- UI SPRITES ----------------
const HEART = ['.RR.RR.', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];
const HEART_PAL = { R: '#e0362c', W: '#ffd0c8' }, HEART_EMPTY = { R: '#3b2a24', W: '#3b2a24' };
const HAT_ICON = ['....KKKKKK....', '...KKKKKKKK...', '...KKKKKKKK...', '...RRRRRRRR...', 'K.KKKKKKKKKK.K', '.KKKKKKKKKKKK.'];
const HAT_PAL = { K: '#c8a46a', R: '#8a1f1a' };
const GLYPH = {
  A: ['010','101','111','101','101'], B: ['110','101','110','101','110'], E: ['111','100','110','100','111'],
  I: ['111','010','010','010','111'], J: ['001','001','001','101','010'], K: ['101','101','110','101','101'],
  L: ['100','100','100','100','111'], N: ['1001','1101','1011','1001','1001'], O: ['010','101','101','101','010'],
  R: ['110','101','110','101','101'], S: ['011','100','010','001','110'], T: ['111','010','010','010','010'],
};

// =====================================================================
//  ENGINE STATE
// =====================================================================
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width = LW; buf.height = LH;
const g = buf.getContext('2d');
const FONT = '"Press Start 2P", monospace';
if (document.fonts && document.fonts.load) document.fonts.load('16px "Press Start 2P"');

let timeScale = 1; // < 1 = slow motion (set by chapter levels, e.g. mid-air on a jump)
let state = 'title', paused = false, diff = DIFFICULTY.deputy, step = 0, levelIdx = 0, spots = {}, inDuel = false;
let time = 0, nextEvent = 0, events = [], actives = [], lives = 3, ammo = 6, score = 0, levelStartScore = 0;
let shots = 0, hits = 0, timer = 0, lastHurt = 'shot', epitaph = [], clock = 0;
let flash = 0, muzzle = 0, shake = 0, mouse = { x: W / 2, y: H / 2 }, effects = [], confetti = [];
let duelT = 0, drawAt = 0, boss = null, newBest = false;
let cutName = 'intro', cutLine = 0, cutT = 0, musicT = 0, musicI = 0;
let props = { set: '', list: [] }, hatsShot = 0, hatPulse = 0, targets = 0, flyT = 6, clearInfo = null;
let cylAng = 0; // revolver cylinder rotation (degrees), animates toward the next live round
let best = 0, wounded = false, woundT = 0;
// story = the list of steps for the current chapter; scene = a chapter-defined custom screen (state 'scene')
let story = null, scene = null;
const SCENES = {}; // chapters register custom screens here
// run = a chapter-defined moving level (e.g. the wagon ride). It plugs into the normal play / hurt / clear flow.
let run = null; const RUNS = {};
const bests = { yellow: 0, deputy: 0, gunslinger: 0 }; // best score per mode
try { for (const k in bests) bests[k] = +(localStorage.getItem('hns_best_' + k) || 0); if (!bests.deputy) bests.deputy = +(localStorage.getItem('hns_best') || 0); } catch (e) {}
const BTN = { yellow: { x: 30, y: 336, w: 280, h: 84 }, deputy: { x: 340, y: 336, w: 280, h: 84 }, gunslinger: { x: 650, y: 336, w: 280, h: 84 } };
const AMMO_BOX = { x: W + 11, y: H - 156, w: 138, h: 138 };
const PAUSE_BTN = { x: W + 53, y: 84, w: 54, h: 54 }, SKIP_BTN = { x: W - 174, y: 12, w: 162, h: 54 };
const CONT_BTN = { x: W / 2 - 140, y: 474, w: 280, h: 54 };
const TITLE_BTN = { x: W - 186, y: H - 66, w: 174, h: 54 }, QUIT_BTN = { x: W / 2 - 100, y: 336, w: 200, h: 54 };
let touchMode = false, lastTap = 0;
const newStats = () => ({ n: { outlaw: 0, hat: 0, bottle: 0, obj: 0 }, pts: { outlaw: 0, hat: 0, bottle: 0, obj: 0, duel: 0 } });
const cloneS = o => JSON.parse(JSON.stringify(o));
let S = newStats(), S0 = newStats(), tallyT = 0, tallyK = 0;
let pianoIdx = 0, pianoWrecked = false, goldHP = [2, 2, 2, 2];
const addScore = (n, cat) => { score += n; S.pts[cat] += n; };
const SUSANNA = [523, 587, 659, 784, 784, 880, 784, 659, 523, 587, 659, 659, 587, 587]; // opening phrase, C D E G G A G E C D E E D D
const NOTE_NAME = { 523: 'C', 587: 'D', 659: 'E', 784: 'G', 880: 'A' };
const PIANO_BOX = { x: 10, y: 96, w: 56, h: 42 }, GOLD_BOX = { x: 258, y: 96, w: 24, h: 14 };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const SPECKS = Array.from({ length: 170 }, () => ({ x: Math.floor(rnd() * LW), y: 90 + Math.floor(rnd() * 90), c: rnd() < 0.5 ? '#a8763c' : '#d6a865' }));
let tumble = { x: -20, t: 5 };
const pick = a => a[Math.floor(Math.random() * a.length)];
const SHOOTABLE = ['play', 'duelWait', 'duelDraw', 'duelWon'];

// =====================================================================
//  SOUND (Web Audio, no files)
// =====================================================================
let ac = null;
function audio() { try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} }
function noise(dur, vol, lp) {
  if (!ac) return;
  const b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const s = ac.createBufferSource(), gn = ac.createGain(), f = ac.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = lp || 4000; gn.gain.value = vol;
  s.buffer = b; s.connect(f).connect(gn).connect(ac.destination); s.start();
}
function tone(type, f1, f2, dur, vol) {
  if (!ac) return;
  const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime;
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(gn).connect(ac.destination); o.start(); o.stop(t + dur);
}
// =====================================================================
//  TITLE MUSIC (original galloping western tune, plays on title + opening intro)
// =====================================================================
const NF = n => { const m = n.match(/^([A-G])(#?)(\d)$/); return 440 * Math.pow(2, ({ C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] ? 1 : 0) + (m[3] - 4) * 12) / 12); };
// one slot = one eighth note, '-' = hold
const TITLE_TUNE = ('A4 - C5 E5 - E5 D5 C5 | A4 - - - E4 - A4 B4 | G4 - B4 D5 - D5 C5 B4 | E5 - - - B4 - G#4 - | ' +
              'A4 - C5 E5 - A5 G5 E5 | F5 - E5 D5 - C5 - A4 | B4 - C5 B4 - G#4 - E4 | A4 - - - - - - -').replace(/\|/g, '').trim().split(/\s+/);
const BASS = ['A2', 'A2', 'G2', 'E2', 'A2', 'F2', 'E2', 'A2']; // one root per bar
// A tune = { notes, bass, bar (eighths per bar), eighth (sec), vol, style: 'gallop' | 'waltz', birds }
const TUNES = {
  title: { notes: TITLE_TUNE, bass: BASS, bar: 8, eighth: 60 / 128 / 2, vol: 0.09, style: 'gallop' },
};
const MUS = { tune: null, gain: null, next: 0, i: 0 };
function mNote(type, f, t, dur, vol, lp) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl).connect(g); } else o.connect(g);
  g.connect(MUS.gain); o.start(t); o.stop(t + dur + 0.02);
}
function mClop(t, vol) { // soft hoofbeat
  const len = 0.05, b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
  const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
  fl.type = 'bandpass'; fl.frequency.value = 900; g.gain.value = vol; src.buffer = b;
  src.connect(fl).connect(g).connect(MUS.gain); src.start(t);
}
// which tune should be playing right now? (null = silence)
function musicWanted() {
  if (paused) return null;
  if (state === 'scene') return scene && scene.tune ? TUNES[scene.tune] : null;
  if (state === 'title') return TUNES.title;
  if (run && run.tune && ['intro', 'play', 'clear'].includes(state)) return TUNES[run.tune];
  if (state === 'cut' && CUTS[cutName] && CUTS[cutName].tune) return TUNES[CUTS[cutName].tune];
  return null;
}
function music() {
  if (!ac) return;
  const want = musicWanted(), now = ac.currentTime;
  if (want !== MUS.tune) {
    if (MUS.gain) { // fade the old tune out, then let it go
      const g = MUS.gain; g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7); setTimeout(() => g.disconnect(), 900);
    }
    MUS.tune = want; MUS.gain = null;
    if (want) {
      MUS.gain = ac.createGain(); MUS.gain.connect(ac.destination);
      MUS.gain.gain.setValueAtTime(0.0001, now); MUS.gain.gain.exponentialRampToValueAtTime(want.vol, now + 1.2);
      MUS.next = now + 0.1; MUS.i = 0;
    }
  }
  const T = MUS.tune; if (!T) return;
  while (MUS.next < now + 0.3) { // schedule a little ahead so it never stutters
    const N = T.notes, k = MUS.i % N.length, t = MUS.next, n = N[k], beat = k % T.bar, e = T.eighth;
    if (n !== '-') {
      let len = 1; while (N[(k + len) % N.length] === '-' && len < T.bar) len++;
      mNote('triangle', NF(n), t, len * e * 0.95, 0.5);
      if (T.style === 'gallop') mNote('square', NF(n), t, Math.min(0.25, len * e), 0.07, 1800);
      else mNote('sine', NF(n) * 2, t, len * e * 0.8, 0.06);                               // soft shimmer
    }
    const root = NF(T.bass[Math.floor(k / T.bar) % T.bass.length]), fifth = root * 1.5;
    if (T.style === 'gallop') {
      if (beat === 0 || beat === 4) mNote('triangle', beat === 0 ? root : fifth, t, e * 1.6, 0.55);   // bass
      if (beat === 2 || beat === 6) mNote('triangle', beat === 2 ? root * 2 : fifth, t, e * 0.6, 0.25);
      mClop(t, beat % 2 ? 0.25 : 0.4);                                                             // gallop
      if (beat % 2) mClop(t + e / 2, 0.18);
    } else { // waltz: oom-pah-pah, like a guitar on the porch
      if (beat === 0) mNote('triangle', root, t, e * 1.8, 0.45);
      if (beat === 2 || beat === 4) for (const f of [root * 2, root * 2.52, root * 3]) mNote('triangle', f, t, e * 0.9, 0.12, 1400);
      if (T.birds && beat === 0 && Math.random() < 0.22) { const bt = t + Math.random() * e * 4, bf = 2600 + Math.random() * 900; mNote('sine', bf, bt, 0.06, 0.1); mNote('sine', bf * 1.2, bt + 0.09, 0.05, 0.08); }
    }
    MUS.next += e; MUS.i++;
  }
}
const sfx = {
  gun:      () => { noise(0.35, 0.7, 2500); tone('sine', 120, 40, 0.2, 0.5); },
  ricochet: () => tone('sine', 2200 + Math.random() * 800, 500, 0.35, 0.12),
  hit:      () => tone('triangle', 180, 60, 0.15, 0.4),
  empty:    () => tone('square', 160, 140, 0.05, 0.08),
  reload:   () => { for (let i = 0; i < 6; i++) setTimeout(() => tone('square', 1000 - i * 40, 800 - i * 40, 0.03, 0.05), i * 45); },
  hurt:     () => { noise(0.5, 0.9, 1200); tone('sawtooth', 200, 50, 0.5, 0.2); },
  oops:     () => { tone('triangle', 700, 180, 0.5, 0.25); setTimeout(() => tone('triangle', 400, 120, 0.5, 0.2), 180); },
  bell:     () => { tone('sine', 880, 870, 1.2, 0.3); tone('sine', 1320, 1300, 0.8, 0.12); },
  clear:    () => [659, 784, 1046].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.15, 0.08), i * 110)),
  blip:     () => tone('square', 520, 520, 0.03, 0.03),
  cock:     () => { tone('square', 1200, 900, 0.03, 0.05); setTimeout(() => tone('square', 900, 700, 0.03, 0.05), 70); },
  win:      () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.25, 0.1), i * 150)),
  glass:    () => { noise(0.25, 0.35, 9000); tone('triangle', 2600, 1900, 0.15, 0.07); tone('triangle', 3300, 2700, 0.1, 0.05); },
  thud:     () => { noise(0.2, 0.5, 800); tone('triangle', 160, 80, 0.12, 0.2); },
  ping:     () => { tone('square', 1400, 1300, 0.07, 0.05); tone('sine', 2800, 2700, 0.25, 0.05); },
  coin:     () => [1320, 1760, 2093].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.08, 0.05), i * 60)),
  hat:      n => { const b = 660 * Math.pow(1.06, Math.min(n, 24)); [b, b * 1.5].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.07, 0.06), i * 60)); },
};
const TUNE = [392, 523, 523, 587, 659, 659, 587, 523, 440, 523, 587, 523, 392, 0, 494, 0];
function partyMusic(dt) {
  musicT += dt;
  while (musicT > 0.17) {
    musicT -= 0.17; const f = TUNE[musicI++ % TUNE.length];
    if (f) tone('square', f, f, 0.14, 0.04);
    if (musicI % 4 === 1) tone('triangle', 131, 131, 0.16, 0.08);
  }
}

// =====================================================================
//  STORY FLOW
// =====================================================================
function startGame(d, steps) {
  story = steps || STORY; scene = null; run = null; diff = DIFFICULTY[d]; best = bests[diff.key]; wounded = false; lives = diff.lives; score = 0; levelStartScore = 0; S = newStats(); S0 = newStats(); pianoIdx = 0; pianoWrecked = false; goldHP = [2, 2, 2, 2];
  shots = 0; hits = 0; newBest = false; paused = false; goStep(0);
}
function goStep(i) {
  step = i; run = null; const s = story[i]; if (s.scene) { startScene(s.scene); return; } effects = []; if (s.cut) setCutLines(s.cut);
  if (s.cut) { cutName = s.cut; cutLine = 0; cutT = 0; state = 'cut'; inDuel = s.cut === 'buchanan'; if (CUTS[cutName].start) CUTS[cutName].start(); }
  else if (s.level != null) startLevel(s.level);
  else if (s.run) startRun(s.run);
  else if (s.duel) startDuel();
  else { state = 'end'; inDuel = false; saveBest(); sfx.win(); }
}
const nextStep = () => goStep(step + 1);
function startScene(name) { scene = SCENES[name]; scene.t = 0; state = 'scene'; effects = []; if (scene.enter) scene.enter(); }
function startLevel(i) {
  levelIdx = i; const L = LEVELS[i]; spots = L.spots; levelStartScore = score; S0 = cloneS(S); lives = diff.lives; // refill each level
  events = L.events.map(([t, spot, ty, win, walk], n) => ({ t, spot, walk, type: ty === 'b' ? 'bystander' : 'outlaw', window: win,
    spec: L.spec ? L.spec(ty, n, walk) : walk ? { ...WALKERS[(n + i) % WALKERS.length], pose: ty === 'o' ? 'aim' : 'hands' } : ty === 'o' ? { ...OUTLAWS[(n + i) % OUTLAWS.length], pose: 'aim' } : { ...BYSTANDERS[(n + i) % BYSTANDERS.length], pose: 'hands' } })).sort((a, b) => a.t - b.t);
  resetLevel();
}
function resetLevel() { // dying sends you back to the START of the level (bonus targets reset too)
  if (LEVELS[levelIdx].reset) LEVELS[levelIdx].reset();
  inDuel = false; wounded = false; time = 0; nextEvent = 0; actives = []; ammo = 6; cylAng = 0; score = levelStartScore; S = cloneS(S0); effects = [];
  props = makeProps(LEVELS[levelIdx]); hatsShot = 0; targets = 0; flyT = 5 + Math.random() * 4;
  state = 'intro'; timer = 1.8;
}
function startDuel() { spots = DUEL_SPOTS; levelStartScore = score; S0 = cloneS(S); lives = diff.lives; resetDuel(); }
function resetDuel() {
  inDuel = true; wounded = false; actives = []; ammo = 6; cylAng = 0; score = levelStartScore; S = cloneS(S0); effects = [];
  props = { set: 'street', list: [] }; hatsShot = 0; targets = 0;
  boss = { spot: 'street', type: 'outlaw', spec: { ...CHARS.buchanan, pose: 'holster' }, age: 0, window: 99, rise: 1, dead: false, deadTime: 0, boss: true };
  state = 'intro'; timer = 1.8;
}
function startRun(name) { run = RUNS[name]; levelStartScore = score; S0 = cloneS(S); lives = diff.lives; resetRun(); }
function resetRun() {
  inDuel = false; wounded = false; time = 0; actives = []; ammo = 6; cylAng = 0; score = levelStartScore; S = cloneS(S0); effects = [];
  props = { set: '', list: [] }; hatsShot = 0; targets = 0; run.reset();
  state = 'intro'; timer = 1.8;
}
const retry = () => (run ? resetRun() : inDuel ? resetDuel() : resetLevel());
function toTitle() { scene = null; run = null; state = 'title'; inDuel = false; actives = []; paused = false; }
function advanceCut() {
  const ln = CUTS[cutName].lines[cutLine];
  if (Math.floor(cutT * 45) < ln[1].length) { cutT = 99; return; }
  cutLine++; cutT = 0; sfx.blip();
  if (cutLine >= CUTS[cutName].lines.length) nextStep();
}
function enterClear() {
  const hatBonus = hatsShot * 100;
  addScore(hatBonus, 'hat');
  clearInfo = { hatsShot, hatBonus, targets };
  state = 'clear'; timer = 3.4; sfx.clear(); if (hatsShot >= 10) setTimeout(sfx.coin, 400);
}
const hatsAloft = () => effects.some(e => e.hat);

// =====================================================================
//  BONUS TARGETS (props, flying hats, tumbleweeds, tossed bottles)
// =====================================================================
function mkProp(def, extra = {}) {
  return { ...PROP_KINDS[def.k], ...def, alive: true, air: false, falling: false, vx: 0, vy: 0, juggles: 0, broken: false, ...extra };
}
function makeProps(L) { return { set: L.set, list: (L.props || []).map(d => mkProp(d)) }; }
const freshProps = {};
function propsForSet(name, freshOnly) {
  if (!freshOnly && props.set === name) return props.list;
  const L = LEVELS.find(l => l.set === name); if (!L) return [];
  return freshProps[name] || (freshProps[name] = makeProps(L).list);
}
function burst(x, y, n, cols, spd) {
  for (let i = 0; i < n; i++) effects.push({ phys: true, shard: true, x, y, vx: (Math.random() - 0.5) * spd * 2, vy: -Math.random() * spd - 20, life: 0.5 + Math.random() * 0.4, c: pick(cols) });
}
function popText(x, y, t) { effects.push({ x, y: Math.max(y, 14), life: 0.9, text: t }); }
function breakProp(p) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  let pts = p.pts, label = '+' + pts;
  switch (p.fx) {
    case 'glass':   p.alive = false; burst(cx, cy, 10, [p.c || '#c8e0e4', '#e8f4f4', '#ffffff'], 60); if (p.k !== 'glass') burst(cx, cy, 5, ['#c98a3a', '#e2a84a'], 40); sfx.glass(); break;
    case 'pottery': p.alive = false; burst(cx, cy, 12, ['#9a6a3a', '#7a4a28', '#ecd8a4'], 60); sfx.thud(); break;
    case 'fire':    p.alive = false; burst(cx, cy, 14, ['#ffd23f', '#ff8a2a', '#ff3b30'], 70); burst(cx, cy, 4, ['#2a2a2a'], 40); sfx.glass(); break;
    case 'coins':   p.alive = false; burst(cx, cy, 16, ['#e2b33c', '#fff0a8', '#c9a040'], 80); sfx.coin(); label = '$' + pts; break;
    case 'ink':     p.alive = false; burst(cx, cy, 10, ['#1b2a4a', '#2a3a6a', '#f4efe0'], 50); sfx.glass(); break;
    case 'spin':    p.broken = true; burst(cx, cy, 8, ['#e8f4f4', '#ffffff', '#8a8278'], 50); sfx.ping(); break;
    case 'fall':    p.air = true; p.falling = true; p.vy = 0; sfx.ping(); label = 'LOOK OUT! +' + pts; break;
    case 'juggle':
      p.juggles++; pts = p.pts * Math.pow(2, p.juggles - 1);
      p.air = true; p.vx = (Math.random() - 0.5) * 60; p.vy = -150; sfx.ping();
      label = p.juggles > 1 ? 'JUGGLE x' + p.juggles + ' +' + pts : '+' + pts;
      if (p.juggles >= 5) { p.spent = true; p.vx = (p.x < 160 ? -1 : 1) * 160; p.vy = -220; label = 'SKY HIGH! +' + pts; } // max 5 juggles
      break;
  }
  targets++; hits++; { const isB = p.k === 'bottle' || p.k === 'glass'; S.n[isB ? 'bottle' : 'obj']++; addScore(pts, isB ? 'bottle' : 'obj'); } popText(cx, p.y - 4, label);
}
function hitProp(x, y, front) {
  const L = props.list;
  for (let i = L.length - 1; i >= 0; i--) {
    const p = L[i];
    if (!p.alive || p.falling || p.spent || (p.fx === 'spin' && p.broken)) continue;
    if ((p.air || p.layer === 'fg') !== front) continue;
    const pad = p.air ? 3 : 1;
    if (inBox(x, y, { x: p.x - pad, y: p.y - pad, w: p.w + pad * 2, h: p.h + pad * 2 })) { breakProp(p); return true; }
  }
  return false;
}
function updateProps(dt) {
  for (const p of props.list) {
    if (!p.alive || !p.air) continue;
    p.vy += 320 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.falling && p.y >= p.floor) {
      p.alive = false; burst(p.x + 15, p.floor + 8, 18, ['#b08a3a', '#f4efe0', '#ffd23f', '#e8f4f4'], 90);
      sfx.glass(); sfx.thud(); shake = Math.max(shake, 0.25); popText(p.x + 15, p.floor - 6, 'CRASH!');
    } else if (p.y > LH + 8 || p.x < -14 || p.x > LW + 14) p.alive = false;
  }
}
function tossBottle() { // some varmint tosses a bottle across the scene
  const left = Math.random() < 0.5;
  props.list.push(mkProp({ k: 'bottle', x: left ? -4 : LW + 1, y: 70 + Math.random() * 40, c: pick(BOTTLE_C), layer: 'bg' },
    { air: true, vx: (left ? 1 : -1) * (80 + Math.random() * 50), vy: -110 - Math.random() * 50, pts: 300 }));
}
// ---- HATS: every hit pops the hat back up. Keep it in the air as long as you can.
function hatBox(e) { const sc = e.sc; return { x: e.x + sc - 2, y: e.y - 3, w: 16 * sc + 4, h: 9 * sc + 4 }; }
function shootHat(e, x) {
  e.combo++; e.flashT = 0.12;
  const pts = e.base * Math.min(e.combo, 10); // value climbs each juggle, tops out at x10
  e.vy = -150;                                                  // pop back up
  const centre = e.x + 8 * e.sc;
  e.vx = (centre - x) * 6 + (centre < LW / 2 ? 20 : -20);     // hit the edge = it kicks the other way, drifts toward centre
  e.vx = Math.max(-70, Math.min(70, e.vx));
  hatsShot++; hits++; S.n.hat++; hatPulse = 0.6; addScore(pts, 'hat'); sfx.hat(e.combo);
  popText(centre, e.y - 4, (e.combo > 1 ? 'HAT x' + e.combo + '  +' : 'HAT TRICK! +') + pts);
  burst(centre, e.y + 3, 4, ['#f4efe0', '#c8a46a'], 30);
}
function tumblePos() { return { x: Math.round(tumble.x), y: 150 - Math.round(Math.abs(Math.sin(tumble.x / 7)) * 6) }; }
function hitTumble(x, y) {
  if (inDuel || tumble.t > 0 || !SETS[LEVELS[levelIdx].set].outdoor) return false;
  const t = tumblePos();
  if (!inBox(x, y, { x: t.x - 2, y: t.y - 2, w: 10, h: 10 })) return false;
  burst(t.x + 3, t.y + 3, 12, ['#8a6a3a', '#a8864a', '#5a4028'], 60); sfx.thud();
  addScore(150, 'obj'); S.n.obj++; targets++; hits++; popText(t.x + 3, t.y - 6, 'TUMBLEWEED +150');
  tumble.x = -20; tumble.t = 8 + rnd() * 10; return true;
}

// =====================================================================
//  GAMEPLAY
// =====================================================================
function reload() { if (ammo < 6) { ammo = 6; cylAng -= 360; sfx.reload(); } } // cylinder spins on reload
function wound(a) { // Yellow Belly: first bullet just grazes you
  wounded = true; woundT = 1; shake = 0.2; sfx.hurt(); // short shake so aim recovers fast
  popText(160, 60, 'JUST A FLESH WOUND!');
  if (a) a.gone = true; // the shooter ducks back out of sight
  if (inDuel) { state = 'duelWait'; duelT = 0; drawAt = 0.7 + Math.random() * 0.8; }
}
function hurt(kind, a) {
  if (diff.hits > 1 && !wounded && ['shot', 'duel', 'arrow', 'tnt'].includes(kind)) return wound(a);
  wounded = false; lives--; lastHurt = kind; flash = 1; shake = 0.4; actives = [];
  epitaph = kind === 'bystander' ? pick(WISDOM) : pick(EPITAPHS[kind]);
  kind === 'bystander' ? sfx.oops() : sfx.hurt();
  if (lives <= 0) { state = 'over'; saveBest(); } else { state = 'hurt'; timer = 4.5; }
}
function saveBest() { if (score > best) { best = score; newBest = true; bests[diff.key] = best; try { localStorage.setItem('hns_best_' + diff.key, best); } catch (e) {} } }
function inBox(x, y, s) { return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h; }
function figRect(a) {
  const s = spots[a.spot], sc = a.boss ? 2 : 1, fw = 20 * sc, fh = 32 * sc;
  let y = s.a === 'top' ? s.y + 2 : s.y + s.h - fh;
  y += Math.round((1 - a.rise) * fh);
  return { x: a.walk ? Math.round(a.px) : Math.round(s.x + s.w / 2 - fw / 2), y, w: fw, h: fh };
}
function shoot(sx, sy) {
  if (ammo <= 0) { sfx.empty(); return; }
  ammo--; shots++; muzzle = 0.07; shake = Math.max(shake, 0.08); sfx.gun();
  const x = sx / P, y = sy / P;
  if (inDuel && state === 'duelWait') return hurt('early');
  // 1) hats in the air
  for (let i = effects.length - 1; i >= 0; i--) { const e = effects[i]; if (e.hat && inBox(x, y, hatBox(e))) return shootHat(e, x); }
  if (run) { if (!run.shoot(x, y)) miss(x, y); return; }
  if (!inDuel && LEVELS[levelIdx] && LEVELS[levelIdx].shoot && LEVELS[levelIdx].shoot(x, y)) return; // level-specific targets (e.g. TNT in the air)
  if (inDuel) {
    if (state === 'duelDraw' && inBox(x, y, spots.street)) {
      hits++; boss.dead = true; boss.deadTime = 0; knockOff(boss); sfx.hit();
      const bonus = Math.round(500 * Math.max(0, 1 - duelT / diff.draw));
      addScore(500 + bonus, 'duel'); popText(160, 80, '+' + (500 + bonus));
      state = 'duelWon'; timer = 2.6; return;
    }
    return miss(x, y);
  }
  // 2) airborne + foreground props
  if (hitProp(x, y, true)) return;
  // 3) people
  for (let i = actives.length - 1; i >= 0; i--) {
    const a = actives[i];
    if (a.dead || a.rise < 0.6 || (!a.walk && !inBox(x, y, spots[a.spot])) || !inBox(x, y, figRect(a))) continue;
    a.dead = true; a.deadTime = 0; sfx.hit();
    if (a.type === 'outlaw' && !(a.walk && a.phase !== 'show')) { // shooting a walker before they reveal counts as an innocent
      hits++; S.n.outlaw++; { const L = LEVELS[levelIdx]; if (!(L.onKill && L.onKill(a))) knockOff(a); }
      const bonus = Math.round(100 * Math.max(0, 1 - a.age / a.window)), r = figRect(a);
      addScore(100 + bonus, 'outlaw');
      popText(r.x + r.w / 2, r.y, '+' + (100 + bonus));
    } else hurt('bystander');
    return;
  }
  if (levelIdx === 1 && !pianoWrecked && inBox(x, y, PIANO_BOX)) return playPiano(x, y);
  if (levelIdx === 3 && goldHP.some(h => h > 0) && inBox(x, y, GOLD_BOX)) return hitGold();
  // 4) background props, tumbleweed
  if (hitProp(x, y, false) || hitTumble(x, y)) return;
  miss(x, y);
}
function playPiano(x, y) {
  const f = SUSANNA[pianoIdx++];
  tone('triangle', f, f * 0.995, 0.6, 0.22); tone('sine', f * 2, f * 2, 0.35, 0.06); noise(0.05, 0.12, 3000);
  burst(x, y, 3, ['#f4efe0', '#3b2a20'], 25);
  popText(38, 88, NOTE_NAME[f] + '  ' + pianoIdx + '/' + SUSANNA.length);
  if (pianoIdx >= SUSANNA.length) {
    pianoWrecked = true; shake = Math.max(shake, 0.5);
    setTimeout(() => { sfx.glass(); sfx.thud(); tone('sawtooth', 300, 60, 0.6, 0.2); }, 200);
    burst(38, 112, 26, ['#2a1a14', '#f4efe0', '#6e4224', '#c9a040'], 90); popText(50, 76, 'PIANO WRECKED!');
  }
}
function hitGold() {
  const live = goldHP.map((h, i) => i).filter(i => goldHP[i] > 0), i = live[Math.floor(Math.random() * live.length)];
  goldHP[i]--; sfx.coin(); burst(270, 103, 10, ['#e2b33c', '#fff0a8', '#c9a040'], 50);
  popText(270, 84, goldHP.every(h => h <= 0) ? 'THE GOLD IS GONE!' : goldHP[i] ? 'GOLD CRACKED' : 'GOLD BAR LOST');
}
function knockOff(a) {
  const r = figRect(a), sc = a.boss ? 2 : 1;
  a.dir = Math.random() < 0.5 ? -1 : 1;
  effects.push({ phys: true, hat: true, combo: 0, base: a.boss ? 500 : 250, spec: { ...a.spec, hatOnly: true }, sc, x: r.x, y: r.y,
    vx: a.dir * (25 + Math.random() * 20) * sc, vy: -110 * sc, life: 999, flashT: 0 });
  effects.push({ phys: true, gun: true, sc, x: r.x + 16 * sc, y: r.y + 13 * sc, vx: -a.dir * 20, vy: -50, life: 0.9 });
}
function miss(x, y) {
  effects.push({ x, y, life: 0.4, hole: true });
  for (let i = 0; i < 6; i++) effects.push({ x, y, life: 0.5, dust: true, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 30 });
  if (Math.random() < 0.5) sfx.ricochet();
}

function update(dt) {
  clock += dt;
  if (paused) return;
  cylAng += ((-(6 - ammo) * 60) - cylAng) * Math.min(1, dt * 14);
  flash = Math.max(0, flash - dt * 2); muzzle = Math.max(0, muzzle - dt); shake = Math.max(0, shake - dt); hatPulse = Math.max(0, hatPulse - dt); woundT = Math.max(0, woundT - dt * 0.8);
  effects.forEach(e => {
    e.life -= dt;
    if (e.flashT) e.flashT -= dt;
    if (e.dust) { e.x += e.vx * dt; e.y += e.vy * dt; }
    if (e.phys) { e.vy += (e.hat ? diff.hatG : 320) * dt; e.x += e.vx * dt; e.y += e.vy * dt; }
    if (e.hat) { // hats bounce off the screen edges and only die when they hit the floor
      const hw = 18 * e.sc;
      if (e.x < -e.sc) { e.x = -e.sc; e.vx = Math.abs(e.vx); }
      if (e.x > LW - hw) { e.x = LW - hw; e.vx = -Math.abs(e.vx); }
      if (e.y < 0) { e.y = 0; e.vy = Math.max(0, e.vy); }
      if (e.y > LH + 2) e.life = 0;
    }
  });
  effects = effects.filter(e => e.life > 0);
  if (boss && boss.dead) boss.deadTime += dt;
  tumble.t -= dt;
  if (tumble.t <= 0) { tumble.x += dt * 45; if (tumble.x > LW + 10) { tumble.x = -20; tumble.t = 8 + rnd() * 10; } }
  const partyOn = state === 'end' || state === 'tally' || (state === 'cut' && CUTS[cutName].party);
  if (partyOn) {
    partyMusic(dt);
    if (confetti.length < 70) confetti.push({ x: Math.random() * LW, y: -4, vy: 20 + Math.random() * 30, vx: (Math.random() - 0.5) * 12, c: pick(['#ffd23f', '#ff3b30', '#7fb2ff', '#a8f0a0', '#f4efe0']) });
    confetti.forEach(c => { c.y += c.vy * dt; c.x += c.vx * dt; }); confetti = confetti.filter(c => c.y < LH);
  } else confetti = [];

  if (state === 'scene') { scene.t += dt; if (scene.update) scene.update(dt); return; }
  if (state === 'cut' || state === 'end' || state === 'tally' || state === 'title' || state === 'over') {
    if (state === 'cut') cutT += dt;
    if (state === 'tally') { tallyT += dt; const k = Math.floor(tallyT / 0.45); if (k !== tallyK) { tallyK = k; sfx.blip(); } }
    return;
  }
  if (run && (state === 'intro' || state === 'clear')) run.tick(dt); // the trail keeps rolling
  if (state === 'intro') {
    timer -= dt;
    if (timer <= 0) {
      if (inDuel) { state = 'duelWait'; duelT = 0; drawAt = 1.5 + Math.random() * 2.5; boss.dead = false; boss.deadTime = 0; }
      else state = 'play';
    }
    return;
  }
  if (state === 'clear') { timer -= dt; if (timer <= 0) nextStep(); return; }
  if (state === 'hurt') { timer -= dt; if (timer <= 0) retry(); return; }
  if (state === 'duelWait') { duelT += dt; if (duelT >= drawAt) { state = 'duelDraw'; duelT = 0; sfx.bell(); } return; }
  if (state === 'duelDraw') { duelT += dt; boss.age = duelT; boss.window = diff.draw; if (duelT >= diff.draw) hurt('duel'); return; }
  if (state === 'duelWon') { timer -= dt; if (timer <= 0 && !hatsAloft()) nextStep(); return; } // Buchanan's hat can be juggled too
  if (state !== 'play') return;
  if (run) { time += dt; run.update(dt); if (state === 'play' && run.done() && !hatsAloft()) enterClear(); return; }
  { const L = LEVELS[levelIdx]; if (!inDuel && L.update) { L.update(dt); if (state !== 'play') return; } }

  time += dt;
  updateProps(dt);
  flyT -= dt;
  if (flyT <= 0) { tossBottle(); flyT = 7 + Math.random() * 5; }
  while (nextEvent < events.length && events[nextEvent].t <= time) {
    const e = events[nextEvent++];
    const sp = spots[e.spot];
    actives.push({ ...e, window: e.window * diff.mult, age: 0, rise: e.walk ? 1 : 0, dead: false, deadTime: 0,
      ...(e.walk ? { px: e.walk === 'L' ? -24 : LW + 4, dirx: e.walk === 'L' ? 1 : -1, tx: sp.x + sp.w / 2 - 10, phase: 'in' } : {}) });
  }
  for (const a of actives) {
    a.rise = Math.min(1, a.rise + dt * 6);
    if (a.dead) { a.deadTime += dt; continue; }
    if (a.walk) { // walkers stroll up, stop, then show a gun (outlaw) or raise hands (bystander)
      if (a.phase === 'in' || a.phase === 'out') {
        a.px += a.dirx * 58 * dt;
        if (a.phase === 'in' && (a.dirx > 0 ? a.px >= a.tx : a.px <= a.tx)) { a.px = a.tx; a.phase = 'pause'; a.pt = 0.3; }
        else if (a.phase === 'out' && (a.px < -30 || a.px > LW + 10)) a.gone = true;
      } else if (a.phase === 'pause') { a.pt -= dt; if (a.pt <= 0) { a.phase = 'show'; a.age = 0; sfx.cock(); } }
      if (a.phase !== 'show') continue;
    }
    a.age += dt;
    if (a.age >= a.window) {
      if (a.type === 'outlaw') { const L = LEVELS[levelIdx]; if (!inDuel && L.onFire && L.onFire(a)) { a.gone = true; continue; }
        if (a.spec.pose === 'bow') tone('sine', 900, 250, 0.18, 0.12); hurt(a.spec.pose === 'bow' ? 'arrow' : 'shot', a); if (state !== 'play') return; continue; }
      if (a.walk) a.phase = 'out'; else a.gone = true; // bystander leaves safely
    }
  }
  actives = actives.filter(a => !a.gone && !(a.dead && a.deadTime > 0.9));
  // level ends once everyone's done AND nothing shootable is still in the air
  if (nextEvent >= events.length && actives.length === 0 && !(LEVELS[levelIdx].busy && LEVELS[levelIdx].busy()) && !hatsAloft() && !props.list.some(p => p.alive && p.air)) enterClear();
}

// =====================================================================
//  CHARACTER SPRITE BUILDER (18x30 grid + auto shading + ink outline)
// =====================================================================
const GW = 18, GH = 30;
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1);
}
function buildGrid(sp) {
  const G = Array.from({ length: GH }, () => Array(GW).fill(null));
  const F = (x, y, w, h, c) => { if (!c) return; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < GW && j >= 0 && j < GH) G[j][i] = c; };
  const pose = sp.pose || 'idle', arm = sp.coat || sp.shirt, skin = sp.skin;
  if (!sp.hatOnly) {
    if (sp.dress) { for (let r = 0; r < 10; r++) { const w = 8 + Math.floor(r / 3) * 2; F(8 - w / 2, 20 + r, w, 1, r === 9 ? shade(sp.dress, 0.7) : sp.dress); } }
    else { const st = sp.step || 0; F(4 - st, 21, 3, 7, sp.pants); F(9 + st, 21, 3, 7, sp.pants); F(3 - st, 28, 4, 2, sp.boots); F(9 + st, 28, 4, 2, sp.boots); F(4, 20, 8, 1, '#3b2416'); F(7, 20, 2, 1, '#e2b33c'); }
    F(4, 12, 8, 8, sp.shirt);
    if (sp.vest) { F(4, 12, 2, 8, sp.vest); F(10, 12, 2, 8, sp.vest); }
    if (sp.coat) { F(3, 12, 2, 16, sp.coat); F(11, 12, 2, 16, sp.coat); }
    if (sp.badge) F(sp.vest ? 4 : 5, 14, 2, 2, '#f0d060');
    F(7, 11, 2, 1, skin); F(5, 5, 6, 6, skin);
    if (sp.hairLong) { F(4, 4, 1, 8, sp.hair); F(11, 4, 1, 8, sp.hair); }
    F(6, 7, 1, 1, INK); F(9, 7, 1, 1, INK);
    F(7, 8, 2, 1, sp.nose || shade(skin, 0.82));
    const bc = sp.beardC || sp.hair;
    if (sp.face === 'bandana') { F(5, 9, 6, 2, sp.bandC); F(6, 11, 4, 1, sp.bandC); F(7, 12, 2, 1, sp.bandC); }
    else if (sp.face === 'beard') { F(5, 9, 6, 2, bc); F(6, 11, 4, 1, bc); F(7, 9, 2, 1, '#3b1a10'); }
    else if (sp.face === 'mustache') { F(6, 9, 4, 1, bc); F(5, 10, 1, 1, bc); F(10, 10, 1, 1, bc); }
    else if (sp.face === 'stubble') { for (const [i, j] of [[5, 9], [6, 10], [8, 10], [10, 9], [9, 10]]) F(i, j, 1, 1, shade(skin, 0.72)); F(7, 9, 2, 1, shade(skin, 0.6)); }
    else F(7, 9, 2, 1, shade(skin, 0.68));
    if (sp.monocle) { F(9, 7, 1, 1, '#e2b33c'); F(10, 8, 1, 3, '#e2b33c'); }
    if (sp.scar) F(9, 5, 1, 3, '#9a3a3a');
  }
  const hc = sp.hatC;
  if (sp.hat === 'cowboy') { F(6, 0, 4, 1, hc); F(5, 1, 6, 2, hc); F(5, 3, 6, 1, shade(hc, 0.6)); F(2, 4, 12, 1, hc); F(2, 3, 1, 1, hc); F(13, 3, 1, 1, hc); }
  else if (sp.hat === 'bowler') { F(6, 1, 4, 1, hc); F(5, 2, 6, 1, hc); F(5, 3, 6, 1, shade(hc, 0.6)); F(4, 4, 8, 1, hc); }
  else if (sp.hat === 'feather') { // headband with a feather
    if (!sp.hatOnly) F(5, 3, 6, 2, sp.hair);
    F(5, 4, 6, 1, hc); F(7, 4, 1, 1, '#e2b33c'); F(10, 0, 1, 4, sp.featherC || '#f4efe0'); F(10, 0, 1, 1, '#3b2210');
  }
  else if (sp.hat === 'bonnet') { F(4, 2, 8, 3, hc); F(4, 5, 1, 5, hc); F(11, 5, 1, 5, hc); F(5, 5, 6, 1, sp.hair); F(5, 11, 1, 1, '#c04a6a'); F(10, 11, 1, 1, '#c04a6a'); }
  else if (!sp.hatOnly) { F(5, 3, 6, 2, sp.hair); F(5, 5, 1, 2, sp.hair); F(10, 5, 1, 2, sp.hair); }
  if (sp.hatOnly) return G;
  const idleL = () => { F(2, 12, 2, 8, arm); F(2, 20, 2, 1, skin); }, idleR = () => { F(12, 12, 2, 8, arm); F(12, 20, 2, 1, skin); };
  switch (pose) {
    case 'aim': idleL(); F(12, 13, 3, 2, arm); F(15, 13, 1, 2, skin); F(15, 12, 3, 1, '#c8c8d0'); F(16, 13, 2, 1, '#8a8a94'); break;
    case 'bow': idleL(); F(12, 13, 4, 2, arm); F(15, 13, 1, 2, skin); F(16, 9, 1, 10, '#7a4a20'); F(17, 8, 1, 1, '#7a4a20'); F(17, 19, 1, 1, '#7a4a20');
      F(11, 13, 5, 1, '#d8c8a0'); F(17, 13, 1, 1, '#b8b8c0'); break;
    case 'holster': idleL(); idleR(); F(11, 21, 2, 3, '#4a2a14'); F(12, 20, 1, 1, '#b8b8c0'); break;
    case 'hands': F(2, 4, 2, 8, arm); F(12, 4, 2, 8, arm); F(2, 2, 2, 2, skin); F(12, 2, 2, 2, skin); break;
    case 'hit': F(2, 10, 2, 3, arm); F(1, 8, 2, 2, arm); F(0, 7, 2, 1, skin); F(12, 10, 2, 3, arm); F(13, 8, 2, 2, arm); F(15, 7, 2, 1, skin); break;
    case 'wave': idleL(); F(12, 6, 2, 6, arm); F(12, 4, 2, 2, skin); break;
    case 'drink': idleL(); F(12, 6, 2, 6, arm); F(12, 4, 2, 2, skin); F(12, 1, 2, 3, '#3a7a3a'); F(13, 0, 1, 1, '#8a6a3a'); F(12, 2, 1, 1, '#7fd08a'); break;
    case 'cower': F(2, 12, 2, 5, arm); F(12, 12, 2, 5, arm); F(4, 15, 8, 2, arm); F(5, 14, 2, 1, skin); F(9, 14, 2, 1, skin); break; // hands clutched at his chest, face showing
    default: idleL(); idleR();
  }
  return G;
}
function renderSprite(G, flash) {
  const c2 = document.createElement('canvas'); c2.width = GW + 2; c2.height = GH + 2;
  const c = c2.getContext('2d');
  const at = (x, y) => (x >= 0 && x < GW && y >= 0 && y < GH ? G[y][x] : null);
  for (let y = -1; y <= GH; y++) for (let x = -1; x <= GW; x++) {
    const col = at(x, y);
    if (!col) { if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) { c.fillStyle = INK; c.fillRect(x + 1, y + 1, 1, 1); } continue; }
    const f = !at(x + 1, y) ? 0.72 : !at(x - 1, y) ? 1.18 : !at(x, y - 1) ? 1.1 : 1;
    c.fillStyle = flash ? '#ffffff' : f === 1 ? col : shade(col, f);
    c.fillRect(x + 1, y + 1, 1, 1);
  }
  return c2;
}
const spriteCache = new Map();
function getSprite(spec, flash = false) {
  const key = JSON.stringify(spec) + flash;
  let s = spriteCache.get(key);
  if (!s) { s = renderSprite(buildGrid(spec), flash); spriteCache.set(key, s); }
  return s;
}
function blit(img, x, y, sc, shear = 0) {
  const cw = GW + 2, ch = GH + 2;
  if (!shear) { g.drawImage(img, x, y, cw * sc, ch * sc); return; }
  for (let r = 0; r < ch; r++) {
    const off = Math.round(shear * (ch - 1 - r) / (ch - 1)) * sc; // top leans, feet stay planted
    g.drawImage(img, 0, r, cw, 1, x + off, y + r * sc, cw * sc, sc);
  }
}

// =====================================================================
//  PIXEL ART HELPERS (320x180 world)
// =====================================================================
function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function dither(x, y, w, h, c) { g.fillStyle = c; for (let j = y; j < y + h; j++) for (let i = x + (j & 1); i < x + w; i += 2) g.fillRect(i, j, 1, 1); }
function disc(cx, cy, r, c) { for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); R(cx - w, cy + dy, w * 2 + 1, 1, c); } }
function ring(cx, cy, ro, ri, c) {
  for (let dy = -ro; dy <= ro; dy++) {
    const wo = Math.floor(Math.sqrt(ro * ro - dy * dy)), wi = Math.abs(dy) < ri ? Math.floor(Math.sqrt(ri * ri - dy * dy)) : -1;
    if (wi < 0) R(cx - wo, cy + dy, wo * 2 + 1, 1, c);
    else { R(cx - wo, cy + dy, wo - wi, 1, c); R(cx + wi + 1, cy + dy, wo - wi, 1, c); }
  }
}
function line(x0, y0, x1, y1, c) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) R(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1, c); }
function planksH(x, y, w, h, c1, c2, step = 5) {
  R(x, y, w, h, c1);
  for (let j = y + step - 1; j < y + h; j += step) R(x, j, w, 1, c2);
  for (let j = y, k = 0; j < y + h; j += step, k++) for (let i = x + ((k * 13) % 23); i < x + w; i += 23) R(i, j, 1, step - 1, c2);
}
function bricks(x, y, w, h, c1, c2) {
  R(x, y, w, h, c1);
  for (let j = y + 5, k = 0; j < y + h; j += 6, k++) { R(x, j, w, 1, c2); for (let i = x + (k % 2) * 6; i < x + w; i += 12) R(i, j - 5, 1, 5, c2); }
}
function tinyW(s) { let w = 0; for (const ch of s) w += (GLYPH[ch] ? GLYPH[ch][0].length : 2) + 1; return w - 1; }
function signText(s, cx, y, c, sc = 1) {
  g.fillStyle = c; let x = Math.round(cx - tinyW(s) * sc / 2);
  for (const ch of s) {
    const gl = GLYPH[ch]; if (!gl) { x += 3 * sc; continue; }
    gl.forEach((row, r) => [...row].forEach((b, i) => { if (b === '1') g.fillRect(x + i * sc, y + r * sc, sc, sc); }));
    x += (gl[0].length + 1) * sc;
  }
}
const SKY_DUSK = ['#c4503a', '#e0733f', '#f29a52', '#fbc672'];
const SKY_DAY = ['#5f9ad6', '#82b4e2', '#abcfee', '#eedcb0'];
const SKY_NOON = ['#4a86d0', '#68a2e2', '#94c4f0', '#f4e6bc'];
function sky(c) {
  for (let i = 0; i < 4; i++) {
    R(0, i * 25, LW, 25, c[i]);
    if (i) { g.fillStyle = c[i - 1]; for (let x = 0; x < LW; x += 2) { g.fillRect(x, i * 25, 1, 1); g.fillRect(x + 1, i * 25 + 2, 1, 1); } }
  }
}
function mesas(c1 = '#a4513b', c2 = '#c06a4a') {
  dither(60, 90, 200, 10, c1);
  R(0, 80, 70, 20, c1); R(8, 72, 38, 8, c1); R(8, 72, 38, 2, c2); R(4, 80, 4, 1, c2);
  R(250, 76, 70, 24, c1); R(266, 66, 34, 10, c1); R(266, 66, 34, 2, c2); R(256, 76, 10, 1, c2);
}
function ground(y) { R(0, y, LW, LH - y, '#c4914f'); R(0, y, LW, 2, '#a8763c'); for (const s of SPECKS) if (s.y > y + 2) R(s.x, s.y, 1, 1, s.c); }
function cactus(x, y) {
  const c = '#4f7a3a';
  R(x, y, 3, 14, c); R(x - 3, y + 5, 3, 2, c); R(x - 3, y + 2, 2, 4, c);
  R(x + 3, y + 7, 3, 2, c); R(x + 4, y + 4, 2, 4, c); R(x + 1, y + 1, 1, 12, '#6b9a4a');
}
function winFg(x, y, w, h, cur) {
  R(x - 2, y - 2, w + 4, 2, '#4a2a14'); R(x - 2, y, 2, h, '#4a2a14'); R(x + w, y, 2, h, '#4a2a14');
  R(x - 3, y + h, w + 6, 3, '#3b2210'); R(x - 3, y + h, w + 6, 1, '#7a4a28');
  if (cur) {
    R(x, y, w, 2, cur); R(x, y, 3, h, cur); R(x + w - 3, y, 3, h, cur);
    R(x + 1, y + 2, 1, h - 2, shade(cur, 1.25)); R(x + w - 2, y + 2, 1, h - 2, shade(cur, 0.7));
    R(x, y + 12, 3, 1, '#e2b33c'); R(x + w - 3, y + 12, 3, 1, '#e2b33c');
  }
}
function barrel(x, y, w = 22, h = 22) {
  R(x, y, w, h, '#8b5a2b'); R(x + w - 4, y, 4, h, '#6a4220'); R(x + 2, y, 2, h, '#a8743d');
  for (const f of [0.3, 0.55, 0.8]) R(x + Math.round(w * f), y, 1, h, '#6e4224');
  R(x, y + 3, w, 2, '#3d3d3d'); R(x, y + h - 6, w, 2, '#3d3d3d'); R(x + 1, y - 2, w - 2, 2, '#5a3418'); R(x + 1, y - 2, w - 2, 1, '#8a5a30');
}
function trough(x, y) {
  R(x, y, 40, 12, '#6b4423'); R(x + 2, y + 1, 36, 2, '#5b9fd0'); R(x + 4, y + 1, 6, 1, '#a8d4f0');
  R(x, y + 6, 40, 1, '#4e2f17'); R(x + 2, y + 12, 3, 6, '#4e2f17'); R(x + 35, y + 12, 3, 6, '#4e2f17');
}
function wheel(cx, cy, r) {
  ring(cx, cy, r, r - 2, '#4e2f17');
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; line(cx, cy, cx + Math.round(Math.cos(a) * (r - 2)), cy + Math.round(Math.sin(a) * (r - 2)), '#6e4224'); }
  disc(cx, cy, 2, '#3b2210');
}

// ---------------- PROP ART ----------------
function drawProp(p) {
  const x = Math.round(p.x), y = Math.round(p.y);
  switch (p.k) {
    case 'bottle':
      R(x + 1, y, 1, 1, '#c8a46a'); R(x + 1, y + 1, 1, 1, p.c); R(x, y + 2, 3, 6, p.c);
      R(x, y + 3, 1, 2, shade(p.c, 1.6)); R(x, y + 5, 3, 1, '#ecd8a4'); break;
    case 'glass':
      R(x, y, 3, 4, '#b8d8dc'); R(x, y + 2, 3, 2, '#c98a3a'); R(x, y, 1, 4, '#f4ffff'); break;
    case 'jug':
      R(x + 2, y, 2, 1, '#c8a46a'); R(x + 1, y + 1, 4, 1, '#7a4a28'); R(x, y + 2, 6, 6, '#9a6a3a');
      R(x + 6, y + 3, 1, 3, '#5a3418'); R(x + 1, y + 4, 4, 2, '#ecd8a4'); R(x + 2, y + 4, 1, 1, INK); R(x + 3, y + 5, 1, 1, INK); R(x + 4, y + 4, 1, 1, INK); break;
    case 'can':
      R(x, y, 4, 5, '#a8a8b0'); R(x, y, 4, 1, '#d8d8e0'); R(x, y + 2, 4, 2, '#c0302b'); R(x + 3, y, 1, 5, '#78787f'); break;
    case 'spittoon':
      R(x + 1, y, 6, 1, '#e2c060'); R(x + 2, y + 1, 4, 2, '#b08a3a'); R(x, y + 3, 8, 3, '#c9a040'); R(x + 1, y + 6, 6, 1, '#8a6a2a'); R(x + 1, y + 3, 1, 2, '#f0d880'); break;
    case 'lantern':
      dither(x - 3, y - 1, 11, 10, 'rgba(255,220,120,.3)');
      R(x + 2, y, 1, 1, '#2a2a2a'); R(x, y + 1, 5, 6, '#2a2a2a'); R(x + 1, y + 2, 3, 4, Math.floor(clock * 6) % 3 ? '#ffd23f' : '#ffb030'); break;
    case 'moneybag':
      R(x + 2, y, 4, 1, '#9a7a4a'); R(x + 3, y + 1, 2, 1, '#5a3418'); R(x + 1, y + 2, 6, 1, '#c8a46a'); R(x, y + 3, 8, 5, '#c8a46a');
      R(x + 7, y + 3, 1, 5, '#9a7a4a'); R(x + 3, y + 4, 2, 3, '#3a6a3a'); R(x + 2, y + 5, 4, 1, '#3a6a3a'); break;
    case 'inkwell':
      R(x, y + 1, 4, 3, '#1b2a4a'); R(x + 1, y, 2, 1, '#2a2a3a'); R(x + 3, y - 5, 1, 5, '#f4efe0'); R(x + 4, y - 6, 1, 2, '#f4efe0'); break;
    case 'clock': {
      const cx = x + 12, cy = y + 12;
      disc(cx, cy, 12, '#5a3418'); disc(cx, cy, 10, p.broken ? '#d8d0c0' : '#f4efe0');
      for (const [dx, dy] of [[0, -8], [8, 0], [0, 8], [-8, 0]]) R(cx + dx, cy + dy, 1, 1, INK);
      if (p.broken) {
        const a = clock * 14; line(cx, cy, cx + Math.round(Math.cos(a) * 7), cy + Math.round(Math.sin(a) * 7), INK);
        line(cx - 7, cy - 4, cx - 1, cy + 2, '#8a8278'); line(cx + 2, cy - 8, cx + 6, cy + 3, '#8a8278');
      } else { R(cx, cy - 7, 1, 8, INK); line(cx, cy, cx - 2, cy - 5, INK); }
      break;
    }
    case 'vane': {
      const sw = p.broken ? Math.round(Math.cos(clock * 14) * 4) : 4, dir = sw < 0 ? -1 : 1;
      R(x + 4, y + 5, 1, 7, '#2a2a2a'); R(x + 4 - Math.abs(sw), y + 6, Math.abs(sw) * 2 + 1, 1, '#2a2a2a');
      R(x + 2, y + 1, 5, 3, '#2a2a2a'); R(x + 4 + dir * 2, y, 1, 2, '#c0302b'); R(x + 4 - dir * 3, y, 1, 2, '#2a2a2a'); break;
    }
    case 'chandelier':
      if (!p.air) { R(x + 14, 0, 1, y + 8, '#3b2210'); dither(x - 6, y, 42, 14, 'rgba(255,220,120,.25)'); }
      R(x, y + 8, 30, 2, '#b08a3a');
      for (let i = 0; i < 5; i++) { R(x + 2 + i * 6, y + 5, 2, 3, '#f4efe0'); R(x + 2 + i * 6, y + 3, 2, 2, '#ffd23f'); }
      break;
  }
}
function drawProps(list, layer) {
  for (const p of list) {
    if (!p.alive) continue;
    if (layer === 'air' ? p.air : (!p.air && p.layer === layer)) drawProp(p);
  }
}

// =====================================================================
//  SETS (bg = behind actors, fg = cover drawn in front)
// =====================================================================
function townBg() {
  sky(SKY_DAY); disc(296, 20, 9, '#fff6d0'); mesas('#b86a4a', '#d08a60'); ground(118);
  // bank
  bricks(2, 34, 74, 92, '#a8a090', '#8a8278'); R(0, 30, 78, 5, '#7a7268'); R(0, 30, 78, 1, '#c8c0b0');
  R(14, 38, 50, 13, '#5a544a'); signText('BANK', 39, 40, '#e2b33c', 2);
  for (const wx of [10, 52]) { R(wx, 60, 16, 24, '#2a2a30'); for (let i = wx + 3; i < wx + 16; i += 4) R(i, 60, 1, 24, '#6a6a70'); R(wx - 1, 84, 18, 2, '#7a7268'); }
  R(30, 92, 18, 34, '#4a3426'); R(32, 94, 14, 30, '#5a4030'); R(42, 108, 2, 3, '#e2b33c'); R(28, 90, 22, 2, '#7a7268');
  // saloon
  planksH(82, 40, 96, 86, '#8a5530', '#6e4224'); planksH(98, 16, 64, 24, '#7a4a28', '#5e3820'); R(96, 14, 68, 3, '#5a3418');
  R(100, 18, 60, 16, '#3b2210'); R(102, 20, 56, 12, '#ecd8a4'); signText('SALOON', 130, 21, '#8a1f1a', 2);
  for (const wx of [92, 150]) { R(wx, 52, 18, 16, '#2a1810'); winFg(wx, 52, 18, 16, '#a8302b'); }
  R(80, 72, 100, 3, '#5a3418'); R(80, 68, 100, 1, '#7a4a28'); for (let x = 81; x < 180; x += 4) R(x, 69, 1, 3, '#6e4224');
  R(118, 94, 24, 32, '#2a1810'); dither(118, 110, 24, 16, '#7a4a28');
  R(119, 104, 10, 12, '#9a6236'); R(131, 104, 10, 12, '#9a6236'); R(119, 104, 10, 1, '#c98a4b'); R(131, 104, 10, 1, '#c98a4b');
  // jail
  bricks(184, 54, 62, 72, '#b58a5a', '#9a7048'); R(182, 50, 66, 4, '#6e4224');
  R(196, 58, 38, 13, '#ecd8a4'); R(196, 58, 38, 1, '#5a3418'); signText('JAIL', 215, 60, '#2a2a2a', 2);
  R(190, 78, 14, 14, '#1e120a'); for (let i = 192; i < 204; i += 3) R(i, 78, 1, 14, '#6a6a70');
  R(214, 88, 20, 38, '#3b2a20'); R(216, 90, 16, 34, '#4e3628'); R(230, 106, 2, 2, '#e2b33c');
  R(237, 80, 8, 10, '#ecd8a4'); R(239, 82, 4, 3, '#c98a5a'); R(238, 86, 6, 1, '#5a3418');
  // general store
  planksH(252, 48, 66, 78, '#5a6a7a', '#4a5868'); R(250, 44, 70, 4, '#3a4652');
  R(260, 52, 50, 13, '#ecd8a4'); signText('STORE', 285, 54, '#2a4a8a', 2);
  for (let x = 252; x < 318; x += 8) { R(x, 70, 4, 8, '#c0302b'); R(x + 4, 70, 4, 8, '#f4efe0'); }
  R(258, 84, 28, 24, '#8ab0c0'); R(258, 84, 28, 1, '#3a4652'); R(260, 86, 6, 1, '#d8eef4');
  ['#c0302b', '#e2b33c', '#3a7a3a', '#4a7ab8'].forEach((c, i) => R(261 + i * 6, 98, 4, 8, c));
  R(292, 84, 18, 42, '#3b2a20'); R(294, 86, 14, 38, '#4e3628');
  // boardwalk + street
  R(0, 126, 320, 6, '#6e4224'); R(0, 126, 320, 1, '#9a6236'); for (let x = 0; x < 320; x += 10) R(x, 127, 1, 5, '#5a3418');
  R(80, 96, 2, 30, '#3b2210'); R(78, 90, 5, 6, '#2a2a2a'); R(79, 91, 3, 4, '#ffd23f');
  R(0, 150, 320, 1, '#a8763c'); R(0, 166, 320, 1, '#a8763c');
}
function saloonExtBg() {
  sky(SKY_DUSK); disc(276, 30, 12, '#fff1c1'); mesas(); ground(100);
  cactus(10, 104); cactus(304, 112);
  planksH(56, 38, 208, 100, '#8a5530', '#6e4224'); R(52, 35, 216, 3, '#5a3418');
  planksH(108, 14, 104, 24, '#7a4a28', '#5e3820'); R(104, 12, 112, 3, '#5a3418');
  R(80, 52, 26, 24, '#2a1810'); R(214, 52, 26, 24, '#2a1810');
  R(52, 80, 216, 4, '#5a3418'); R(52, 84, 216, 1, '#3b2210');
  for (const x of [58, 104, 212, 258]) { R(x, 84, 3, 52, '#5a3418'); R(x, 84, 1, 52, '#9a6236'); }
  for (const wx of [72, 216]) {
    R(wx - 2, 96, 34, 26, '#4a2a14'); R(wx, 98, 30, 22, '#f0b050'); dither(wx, 108, 30, 12, '#c07830');
    R(wx + 14, 98, 2, 22, '#4a2a14'); R(wx, 108, 30, 2, '#4a2a14');
  }
  R(147, 92, 26, 44, '#2a1810'); dither(147, 116, 26, 20, '#7a4a28');
  R(48, 136, 224, 5, '#5a3418'); R(48, 136, 224, 1, '#9a6236');
  R(190, 122, 26, 2, '#4e2f17'); R(191, 122, 2, 16, '#4e2f17'); R(213, 122, 2, 16, '#4e2f17');
  R(114, 98, 14, 18, '#ecd8a4'); R(117, 101, 8, 6, '#c98a5a'); R(116, 100, 10, 2, '#1b1410'); R(116, 110, 10, 1, '#5a3418'); R(116, 113, 8, 1, '#5a3418');
}
function saloonExtFg() {
  winFg(80, 52, 26, 24, '#a8302b'); winFg(214, 52, 26, 24, '#a8302b');
  R(52, 74, 216, 2, '#7a4a28'); R(52, 74, 216, 1, '#a8703c'); for (let x = 54; x < 268; x += 5) R(x, 76, 2, 4, '#6e4224');
  for (const dx of [148, 161]) { R(dx, 118, 11, 14, '#9a6236'); R(dx, 118, 11, 1, '#c98a4b'); for (let y = 121; y < 132; y += 3) R(dx, y, 11, 1, '#7a4a28'); }
  R(116, 16, 88, 20, '#3b2210'); R(118, 18, 84, 16, '#ecd8a4'); signText('SALOON', 160, 21, '#8a1f1a', 2);
  barrel(28, 116); trough(260, 120);
}
function paintJungle() { // the painting on the saloon wall
  const F1 = '#1f5a3a', F2 = '#2a7a4a';
  R(16, 64, 36, 24, '#2f6a4a'); R(16, 64, 36, 7, '#6ab08a'); R(16, 71, 36, 6, '#3f8a5a'); disc(30, 69, 3, '#f4d070');
  R(30, 64, 1, 6, F2); R(47, 64, 1, 5, F2); R(31, 68, 1, 1, F2);
  R(24, 71, 2, 17, '#6a4a2a'); line(25, 71, 18, 68, F1); line(25, 71, 19, 75, F2); line(25, 71, 32, 68, F1); line(25, 71, 32, 75, F2); line(25, 71, 25, 66, F1);
  R(44, 74, 2, 14, '#5a3a1a'); line(45, 74, 39, 72, F1); line(45, 74, 40, 78, F2); line(45, 74, 51, 72, F1); line(45, 74, 50, 78, F2); line(45, 74, 45, 70, F1);
  R(32, 77, 9, 1, '#5a3a1a'); R(35, 74, 3, 3, '#d03a2a'); R(38, 75, 1, 1, '#f4d070'); R(34, 76, 1, 2, '#3a6ad0');
  R(16, 84, 36, 4, '#1f4a34'); R(28, 85, 12, 2, '#6fb0c8'); R(17, 82, 5, 2, F1); R(46, 83, 5, 2, F1);
}
const LADIES = [
  { x: 30, spec: { hat: 'bonnet', hatC: '#f0e0f0', skin: '#f0c090', hair: '#a0522d', shirt: '#9a4a8a', dress: '#9a4a8a', face: 'plain' } },
  { x: 80, spec: { hat: 'none', skin: '#e8b07a', hair: '#3b2416', hairLong: true, shirt: '#2f6a8a', dress: '#2f6a8a', face: 'plain' } },
  { x: 195, spec: { hat: 'bonnet', hatC: '#f4d0d8', skin: '#d89a6a', hair: '#5b3a20', shirt: '#c0302b', dress: '#c0302b', face: 'plain' } },
  { x: 245, spec: { hat: 'none', skin: '#f0c8a0', hair: '#e0b040', hairLong: true, shirt: '#e2b33c', dress: '#c8862a', face: 'plain' } },
];
function drawLadies() { LADIES.forEach((l, i) => blit(getSprite({ ...l.spec, pose: 'wave' }), l.x - 10, 14 - (Math.floor(clock * 4 + i) % 2), 1)); }
function saloonIntBg() {
  R(0, 0, 320, 46, '#4e161b'); for (let y = 4; y < 46; y += 8) for (let x = (y / 8 % 2) * 4; x < 320; x += 8) R(x, y, 1, 1, '#6a2028');
  R(0, 52, 320, 56, '#6b1f24'); for (let y = 56; y < 106; y += 8) for (let x = (y / 8 % 2) * 4; x < 320; x += 8) { R(x, y, 2, 1, '#83303a'); R(x + 0, y + 1, 1, 1, '#83303a'); }
  R(0, 108, 320, 2, '#3b2210'); R(0, 110, 320, 28, '#6e4224');
  for (let x = 0; x < 320; x += 32) { R(x + 3, 113, 26, 22, '#7a4a28'); R(x + 3, 113, 26, 1, '#9a6236'); }
  R(0, 138, 320, 42, '#7a4a28'); for (const y of [141, 145, 150, 156, 163, 171]) R(0, y, 320, 1, '#5a3418');
  for (let k = 0; k < 6; k++) for (let x = (k * 37) % 50; x < 320; x += 50) R(x, [138, 142, 146, 151, 157, 164][k], 1, 4, '#5a3418');
  R(40, 6, 26, 40, '#24100c'); R(254, 6, 26, 40, '#24100c');
  R(0, 46, 320, 6, '#5a3418'); R(0, 46, 320, 1, '#9a6236'); R(0, 52, 320, 2, '#2a120c');
  for (const x of [90, 228]) { R(x, 54, 4, 54, '#5a3418'); R(x, 54, 1, 54, '#9a6236'); }
  R(104, 58, 112, 46, '#3b2210'); R(128, 60, 64, 22, '#7fa0a8'); R(126, 58, 68, 2, '#b08a3a'); R(126, 82, 68, 2, '#b08a3a');
  for (let i = 0; i < 10; i++) R(140 + i, 62 + i, 2, 1, '#c8e0e4');
  R(104, 84, 112, 2, '#5a3418'); R(104, 96, 112, 2, '#5a3418');
  R(14, 62, 40, 28, '#b08a3a'); paintJungle();
  R(240, 64, 22, 28, '#ecd8a4'); R(246, 70, 10, 9, '#c98a5a'); R(244, 68, 14, 3, '#1b1410'); R(247, 76, 8, 2, '#1b1410');
  R(244, 82, 14, 1, '#5a3418'); R(244, 85, 14, 1, '#5a3418'); R(244, 88, 10, 1, '#5a3418');
}
function wreckedPiano() {
  R(12, 106, 52, 32, '#2a1a14'); R(10, 104, 26, 3, '#3b2a20'); R(40, 108, 24, 3, '#3b2a20'); R(36, 106, 6, 3, '#6e4224');
  R(16, 112, 44, 5, '#3b2a20'); for (let i = 0; i < 6; i++) R(18 + i * 7, 112 + (i % 3), 1, 5, '#8a8a96');
  R(16, 120, 44, 4, '#f4efe0'); for (let i = 0; i < 14; i++) { if (i % 3 === 1) R(17 + i * 3, 120, 2, 4, '#15100c'); else if (i % 7 !== 2 && i % 7 !== 6) R(17 + i * 3, 120, 2, 2, INK); }
  R(30, 107, 1, 17, '#15100c'); R(31, 114, 4, 1, '#15100c');
  R(14, 124, 4, 14, '#2a1a14'); R(58, 130, 4, 8, '#2a1a14'); R(46, 134, 12, 2, '#f4efe0'); R(34, 128, 8, 2, '#f4efe0');
}
function saloonIntFg(party) {
  for (const x of [40, 254]) { R(x - 2, 4, 30, 2, '#4a2a14'); R(x - 2, 6, 2, 40, '#4a2a14'); R(x + 26, 6, 2, 40, '#4a2a14'); }
  R(0, 34, 320, 2, '#7a4a28'); R(0, 34, 320, 1, '#a8703c'); for (let x = 2; x < 320; x += 5) R(x, 36, 2, 10, '#6e4224');
  R(94, 106, 132, 4, '#2a1810'); R(94, 106, 132, 1, '#7a4a28'); R(96, 110, 128, 26, '#7a4a28');
  for (let i = 0; i < 4; i++) { R(100 + i * 31, 113, 25, 19, '#8a5530'); R(100 + i * 31, 113, 25, 1, '#a8703c'); }
  R(96, 132, 128, 2, '#c9a040');
  if (pianoWrecked) wreckedPiano(); else {
  R(12, 104, 52, 34, '#2a1a14'); R(10, 102, 56, 3, '#3b2a20'); R(16, 108, 44, 8, '#3b2a20'); R(16, 118, 44, 4, '#f4efe0');
  for (let i = 0; i < 14; i++) if (i % 7 !== 2 && i % 7 !== 6) R(17 + i * 3, 118, 2, 2, INK);
  R(14, 122, 4, 16, '#2a1a14'); R(58, 122, 4, 16, '#2a1a14'); R(32, 98, 12, 4, '#f4efe0'); R(20, 96, 2, 6, '#c9a040'); R(20, 94, 2, 2, '#ffd23f');
  }
  if (!party) {
    R(258, 102, 32, 36, '#7a4a28'); R(256, 106, 36, 28, '#7a4a28'); R(258, 102, 32, 1, '#a8703c');
    R(262, 112, 24, 1, '#6a4020'); R(262, 122, 24, 1, '#6a4020'); R(292, 116, 8, 3, '#5a3418');
  }
}
function partyBg() {
  saloonIntBg();
  const COL = ['#c0302b', '#f4efe0', '#4a7ab8', '#e2b33c'];
  for (let x = 0, k = 0; x < 320; x += 10, k++) {
    const y = 54 + Math.round(4 * Math.sin(Math.PI * ((x % 160) / 160)));
    R(x, y, 10, 1, '#3b2210');
    for (let r = 0; r < 5; r++) R(x + 1 + Math.floor(r / 2), y + 1 + r, 8 - Math.floor(r / 2) * 2, 1, COL[k % 4]);
  }
}
function jailBg() {
  sky(SKY_DAY); disc(40, 24, 10, '#fff6d0'); mesas('#b86a4a', '#d08a60'); ground(100); cactus(244, 106);
  bricks(88, 42, 146, 96, '#b58a5a', '#9a7048'); R(84, 38, 154, 5, '#6e4224');
  for (let i = 0; i < 10; i++) R(92 + i * 14, 43, 4, 3, '#5a3418');
  R(130, 46, 60, 16, '#5a3418'); R(132, 48, 56, 12, '#ecd8a4'); signText('JAIL', 160, 49, '#2a2a2a', 2);
  R(104, 68, 24, 22, '#2a1810'); R(192, 68, 24, 22, '#2a1810');
  R(148, 84, 24, 52, '#1e120a'); for (let x = 150; x < 172; x += 3) R(x, 92, 1, 30, '#3a3a40');
  R(84, 136, 154, 4, '#6e4224'); R(84, 136, 154, 1, '#9a6236');
  for (const x of [260, 297]) R(x, 70, 3, 68, '#4e2f17');
  for (const x of [272, 286]) R(x, 70, 2, 66, '#3e2512');
  line(262, 80, 297, 110, '#4e2f17'); line(297, 80, 262, 110, '#4e2f17'); line(262, 110, 297, 136, '#4e2f17');
  R(66, 96, 22, 42, '#7a5a3a'); R(69, 104, 16, 32, '#1e120a');
  R(236, 124, 18, 2, '#4e2f17'); R(237, 124, 2, 14, '#4e2f17'); R(251, 124, 2, 14, '#4e2f17');
}
function jailFg() {
  for (const wx of [104, 192]) {
    R(wx - 8, 66, 7, 26, '#5a7a5a'); R(wx + 25, 66, 7, 26, '#5a7a5a');
    for (let y = 68; y < 90; y += 3) { R(wx - 8, y, 7, 1, '#3e5a3e'); R(wx + 25, y, 7, 1, '#3e5a3e'); }
    winFg(wx, 68, 24, 22, null);
  }
  R(146, 82, 28, 2, '#4a2a14'); R(146, 84, 2, 52, '#4a2a14'); R(172, 84, 2, 52, '#4a2a14'); R(174, 84, 6, 52, '#6e4224'); R(178, 108, 1, 3, '#e2b33c');
  R(256, 30, 48, 40, '#7a5a3a'); for (let x = 262; x < 304; x += 6) R(x, 30, 1, 40, '#6a4a2a');
  R(256, 38, 48, 2, '#3d3d3d'); R(256, 58, 48, 2, '#3d3d3d'); R(258, 30, 2, 40, '#9a7a5a'); R(254, 28, 52, 3, '#5a3418'); R(248, 52, 10, 2, '#3d3d3d');
  R(4, 108, 60, 14, '#8a5530'); R(4, 106, 60, 2, '#a8703c'); R(4, 113, 60, 1, '#6e4224'); R(64, 118, 14, 2, '#5a3418');
  wheel(18, 128, 10); wheel(50, 128, 10);
  R(64, 92, 26, 4, '#5a3418'); R(66, 96, 3, 42, '#7a5a3a'); R(85, 96, 3, 42, '#7a5a3a');
  R(56, 104, 10, 32, '#8a6a4a'); R(58, 108, 4, 5, '#1e120a'); R(59, 108, 3, 4, '#8a6a4a');
}
function drawGold() {
  for (let i = 0; i < 4; i++) {
    const x = 262 + (i % 2) * 6, y = 104 - Math.floor(i / 2) * 4, h = goldHP[i];
    if (h === 2) { R(x, y, 8, 3, '#e2b33c'); R(x, y, 8, 1, '#fff0a8'); }
    else if (h === 1) { R(x + 1, y + 1, 6, 2, '#b8902c'); R(x + 3, y, 1, 3, '#15151a'); R(x + 5, y + 1, 1, 2, '#15151a'); R(x - 1, y + 3, 1, 1, '#e2b33c'); }
    else { R(x + 2, y + 2, 1, 1, '#9a7420'); R(x + 5, y + 2, 1, 1, '#c9a040'); }
  }
}
function bankBg() {
  R(0, 0, 320, 100, '#2f4a3a'); for (let x = 0; x < 320; x += 8) R(x, 6, 2, 94, '#365444');
  R(0, 0, 320, 6, '#5a3418'); R(0, 6, 320, 1, '#9a6236');
  R(0, 100, 320, 38, '#5a3418'); for (let x = 0; x < 320; x += 40) { R(x + 4, 104, 32, 30, '#6e4224'); R(x + 4, 104, 32, 1, '#8a5530'); }
  for (let y = 138, k = 0; y < 180; y += 7, k++) for (let x = (k % 2) * 14 - 14; x < 320; x += 28) { R(x, y, 14, 7, '#d8d0c0'); R(x + 14, y, 14, 7, '#a89f90'); }
  R(136, 37, 48, 14, INK); signText('BANK', 160, 39, '#e2b33c', 2);
  for (const x of [33, 105, 177]) { R(x, 60, 30, 44, '#24382c'); for (let i = 0; i < 4; i++) R(x + 3 + i * 7, 66, 5, 5, '#8a7a3a'); }
  R(226, 40, 94, 98, '#3a4a44'); disc(272, 90, 28, '#6a6f78'); disc(272, 90, 21, '#15151a');
  drawGold();
}
function bankFg() {
  R(20, 52, 200, 8, '#5a3418'); R(20, 58, 200, 1, '#c9a040');
  for (const [x, w] of [[20, 13], [63, 42], [135, 42], [207, 13]]) { R(x, 60, w, 40, '#6e4224'); if (w > 20) R(x + 4, 64, w - 8, 30, '#7a4a28'); }
  for (const x of [33, 105, 177]) { R(x, 60, 30, 1, '#c9a040'); for (let i = 0; i < 7; i++) R(x + 2 + i * 4, 60, 1, 5, '#c9a040'); }
  R(18, 98, 204, 4, '#d8d0c0'); R(18, 98, 204, 1, '#f4efe0'); R(18, 102, 204, 36, '#5a3418');
  for (let x = 24; x < 214; x += 48) { R(x, 106, 40, 26, '#6e4224'); R(x, 106, 40, 1, '#8a5530'); }
  R(18, 134, 204, 2, '#c9a040');
  ring(272, 90, 28, 21, '#6a6f78'); ring(272, 90, 26, 23, '#8a8f98');
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; R(272 + Math.round(Math.cos(a) * 25), 90 + Math.round(Math.sin(a) * 25), 2, 2, '#c8ccd4'); }
  disc(312, 92, 20, '#8a8f98'); disc(312, 92, 14, '#7a7f88'); R(302, 90, 10, 3, '#c8ccd4');
  R(6, 120, 20, 18, '#a0522d'); R(4, 118, 24, 3, '#b8683a'); R(6, 124, 20, 1, '#8a4020');
  const leaf = (x0, y0, x1, y1) => { line(x0, y0, x1, y1, '#3a7a3a'); line(x0 + 1, y0, x1 + 1, y1 + 1, '#5a9a4a'); };
  leaf(16, 118, 2, 96); leaf(16, 118, 8, 86); leaf(16, 118, 16, 82); leaf(16, 118, 24, 88); leaf(16, 118, 30, 100); leaf(16, 118, 4, 108);
}
function streetBg() {
  sky(SKY_NOON); disc(160, 12, 9, '#fffbe0'); mesas('#b86a4a', '#d08a60'); ground(96);
  for (let y = 96; y < 180; y++) { const hw = 10 + Math.round((y - 96) * 1.7); R(160 - hw, y, hw * 2, 1, '#cfa062'); }
  line(150, 96, 96, 180, '#a8763c'); line(170, 96, 224, 180, '#a8763c');
  bricks(0, 30, 70, 76, '#a8a090', '#8a8278'); R(10, 36, 50, 13, '#5a544a'); signText('BANK', 35, 38, '#e2b33c', 2);
  R(16, 60, 14, 20, '#2a2a30'); R(44, 60, 14, 20, '#2a2a30');
  planksH(70, 44, 40, 62, '#7a5a3a', '#5a4028'); R(80, 70, 18, 36, '#3b2a20');
  planksH(250, 40, 70, 66, '#8a5530', '#6e4224'); planksH(262, 22, 50, 18, '#7a4a28', '#5e3820'); R(264, 24, 46, 12, '#ecd8a4'); signText('SALOON', 287, 25, '#8a1f1a', 1);
  R(270, 80, 20, 26, '#2a1810');
  bricks(214, 46, 36, 60, '#b58a5a', '#9a7048'); R(220, 70, 14, 36, '#3b2a20');
  R(0, 104, 110, 4, '#6e4224'); R(214, 104, 106, 4, '#6e4224');
  R(150, 34, 20, 62, '#9a8a7a'); R(148, 30, 24, 4, '#6a5a4a'); for (let i = 0; i < 8; i++) R(152 + i, 22 + i, 16 - i * 2, 1, '#6a5a4a');
  disc(160, 46, 6, '#f4efe0'); R(160, 41, 1, 5, INK);
}
const SETS = {
  town: { bg: townBg, fg: () => {}, outdoor: true },
  saloonExt: { bg: saloonExtBg, fg: saloonExtFg, outdoor: true },
  saloonInt: { bg: saloonIntBg, fg: () => saloonIntFg(false) },
  party: { bg: partyBg, fg: () => saloonIntFg(true) },
  jail: { bg: jailBg, fg: jailFg, outdoor: true },
  bank: { bg: bankBg, fg: bankFg },
  street: { bg: streetBg, fg: () => {}, outdoor: true },
};

// =====================================================================
//  WORLD RENDER
// =====================================================================
function drawTumble() {
  if (tumble.t > 0) return;
  const { x, y } = tumblePos(), f = Math.floor(tumble.x / 4) % 2, c = '#8a6a3a';
  R(x + 1, y, 4, 1, c); R(x, y + 1, 1, 4, c); R(x + 5, y + 1, 1, 4, c); R(x + 1, y + 5, 4, 1, c);
  if (f) R(x + 2, y + 2, 2, 2, c); else { R(x + 1, y + 2, 1, 1, c); R(x + 4, y + 3, 1, 1, c); }
}
function drawFigure(a) {
  const s = spots[a.spot], sc = a.boss ? 2 : 1, r = figRect(a);
  let spec = a.spec, x = r.x, y = r.y, fl = false, shear = 0;
  const aiming = a.type === 'outlaw' && (!a.boss || state === 'duelDraw');
  if (a.boss && !a.dead) spec = { ...a.spec, pose: state === 'duelDraw' ? 'aim' : 'holster' };
  let flip = false;
  if (a.walk && !a.dead && a.phase !== 'show') {
    const mv = a.phase !== 'pause', fr = mv && Math.floor(clock * 7) % 2;
    spec = { ...a.spec, pose: 'idle', step: fr ? 1 : 0 }; if (fr) y -= 1; flip = a.dirx < 0;
  }
  if (a.dead) {
    const t = a.deadTime, dir = a.dir || 1;
    if (a.type === 'outlaw') spec = { ...a.spec, pose: 'hit', hat: 'none' };
    if (t < 0.1) { fl = true; x += dir * sc; y -= sc; }
    else if (t < 0.3) { y -= sc; x += (Math.floor(t * 30) % 2 ? 1 : -1) * sc; }
    else { const k = Math.min(1, (t - 0.3) * 3.5); shear = dir * Math.round(k * 8); y += a.boss ? Math.round(k * 10) * sc : Math.round(Math.pow(t - 0.3, 2) * 260); }
  }
  if (a.boss) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(r.x + 6, r.y + r.h - 2, r.w - 12, 3); }
  g.save();
  if (!a.boss && !a.walk) { g.beginPath(); g.rect(s.x, s.y, s.w, s.h); g.clip(); }
  if (flip) { g.translate(x * 2 + (GW + 2) * sc, 0); g.scale(-1, 1); }
  blit(getSprite(spec, fl), x, y, sc, shear);
  if (aiming && !a.dead && a.age > a.window * 0.6 && Math.floor(a.age * 12) % 2) R(x + 19 * sc, y + 11 * sc, 2 * sc, 3 * sc, '#fff36b');
  g.restore();
  if (a.type === 'outlaw' && !a.boss && !a.dead && a.rise >= 1 && (!a.walk || a.phase === 'show')) {
    const p = Math.max(0, 1 - a.age / a.window), bx = a.walk ? r.x : s.x, bw = a.walk ? r.w : s.w, by = a.walk ? r.y - 5 : (s.y - 5 >= 2 ? s.y - 5 : s.y + s.h + 2);
    R(bx - 1, by - 1, bw + 2, 4, INK); R(bx, by, Math.round(bw * p), 2, p > 0.4 ? '#ffd23f' : '#ff3b30');
  }
}
function drawActors(c, dance) {
  const speaker = state === 'cut' ? c.lines[cutLine][0] : null, typing = state === 'cut' && Math.floor(cutT * 45) < c.lines[cutLine][1].length;
  c.actors.forEach((ac, i) => {
    let y = (c.party ? 168 : 124) - 64;
    if (ac.who === speaker && typing && Math.floor(clock * 8) % 2) y -= 1;
    if (dance) y -= (Math.floor(clock * 4 + i) % 2) * 2;
    blit(getSprite({ ...CHARS[ac.who], pose: ac.pose }), Math.round(ac.x - 20), y, 2);
  });
}
function drawStage(setName, list, after) { const set = SETS[setName]; set.bg(); drawProps(list, 'bg'); if (after) after(); set.fg(); drawProps(list, 'fg'); return set; }
function drawWorld() {
  g.imageSmoothingEnabled = false;
  let set;
  if (state === 'cut') {
    const c = CUTS[cutName];
    const list = c.set === 'party' ? propsForSet('saloonInt', true) : propsForSet(c.set, false);
    set = drawStage(c.set, list, c.party ? drawLadies : undefined); drawActors(c, !!c.party); if (c.after) c.after();
  } else if (state === 'title') { set = SETS.town; set.bg(); }
  else if (state === 'scene') { scene.world(); set = {}; }
  else if (state === 'end' || state === 'tally') { set = drawStage('party', propsForSet('saloonInt', true), drawLadies); drawActors(CUTS.party, true); }
  else if (run) { run.draw(); set = {}; }
  else {
    const name = inDuel ? 'street' : LEVELS[levelIdx].set;
    set = drawStage(name, props.list, () => { if (!inDuel) actives.filter(a => !a.walk).forEach(drawFigure); });
    if (!inDuel) actives.filter(a => a.walk).forEach(drawFigure);
    if (inDuel && boss) drawFigure(boss);
  }
  if (set.outdoor) drawTumble();
  if (state !== 'cut' && state !== 'end' && state !== 'title') drawProps(props.list, 'air');
  if (!run && !inDuel && state !== 'scene' && ['intro', 'play', 'clear', 'hurt', 'over'].includes(state) && LEVELS[levelIdx] && LEVELS[levelIdx].draw) LEVELS[levelIdx].draw();
  for (const c of confetti) R(Math.round(c.x), Math.round(c.y), 2, 1, c.c);
  for (const e of effects) {
    if (e.text) continue;
    if (e.shard) { R(Math.round(e.x), Math.round(e.y), 1, 1, e.c); continue; }
    if (e.hat) {
      const hx = Math.round(e.x), hy = Math.round(e.y);
      blit(getSprite(e.spec, e.flashT > 0), hx, hy, e.sc);
      for (let k = 0; k < Math.min(e.combo, 4); k++) R(hx + (5 + k * 3) * e.sc, hy + (1 + (k % 2)) * e.sc, e.sc, e.sc, '#f4efe0'); // bullet holes pile up
      continue;
    }
    if (e.gun) { R(Math.round(e.x), Math.round(e.y), 3 * e.sc, e.sc, '#b8b8c0'); continue; }
    if (e.dust) R(Math.round(e.x), Math.round(e.y), 1, 1, '#e8cc98');
    else R(Math.round(e.x) - 1, Math.round(e.y) - 1, 2, 2, INK);
  }
  if (muzzle > 0) {
    const mx = Math.round(mouse.x / P), my = Math.round(mouse.y / P);
    g.fillStyle = 'rgba(255,240,180,.18)'; g.fillRect(0, 0, LW, LH);
    R(mx - 6, my, 13, 1, '#fff36b'); R(mx, my - 6, 1, 13, '#fff36b');
    for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) R(mx + dx, my + dy, 1, 1, '#fff36b');
    R(mx - 2, my - 2, 5, 5, '#ffffff');
  }
}

// =====================================================================
//  UI (full-res, 3px grid)
// =====================================================================
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function spriteUI(rows, pal, x, y, sc) { for (let r = 0; r < rows.length; r++) for (let i = 0; i < rows[r].length; i++) { const ch = rows[r][i]; if (ch !== '.') rect(x + i * sc, y + r * sc, sc, sc, pal[ch]); } }
function uiDisc(cx, cy, r, col) { // chunky pixel circle on the 3px UI grid
  cx = Math.round(cx / P) * P; cy = Math.round(cy / P) * P;
  for (let dy = -r; dy <= r; dy += P) { const w = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)) / P) * P; if (w > 0) rect(cx - w, cy + dy, w * 2, P, col); }
}
function ptext(s, x, y, size, col, align = 'left') { ctx.font = size + 'px ' + FONT; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillStyle = col; ctx.fillText(s, x, y); }
function text(s, x, y, size, col, align = 'left') { ptext(s, x + (size >= 32 ? 6 : 3), y + (size >= 32 ? 6 : 3), size, INK, align); ptext(s, x, y, size, col, align); }
function panel(x, y, w, h, fill = '#5a3418') {
  rect(x, y, w, h, INK); rect(x + 3, y + 3, w - 6, h - 6, '#c98a4b'); rect(x + 6, y + 6, w - 12, h - 12, fill);
  for (let yy = y + 27; yy < y + h - 12; yy += 24) rect(x + 6, yy, w - 12, 3, 'rgba(0,0,0,.12)');
  for (const [nx, ny] of [[x + 12, y + 12], [x + w - 18, y + 12], [x + 12, y + h - 18], [x + w - 18, y + h - 18]]) rect(nx, ny, 6, 6, '#e2b33c');
}
function dim(a) { rect(0, 0, W, H, `rgba(20,10,5,${a})`); }
function wrap(s, n) { const out = []; let ln = ''; for (const w of s.split(' ')) { if ((ln + ' ' + w).trim().length > n) { out.push(ln); ln = w; } else ln = ln ? ln + ' ' + w : w; } if (ln) out.push(ln); return out; }
function button(b, label, sub) {
  const hover = inBox(mouse.x, mouse.y, b);
  panel(b.x, b.y, b.w, b.h, hover ? '#9a6236' : '#5a3418');
  text(label, b.x + b.w / 2, b.y + (sub ? 18 : 32), 20, hover ? '#ffd23f' : '#ffffff', 'center');
  if (sub) text(sub, b.x + b.w / 2, b.y + 54, 16, '#f3d18b', 'center');
}
function smallBtn(b, label) {
  const hover = !touchMode && inBox(mouse.x, mouse.y, b);
  panel(b.x, b.y, b.w, b.h, hover ? '#9a6236' : '#5a3418');
  text(label, b.x + b.w / 2, b.y + 19, 16, hover ? '#ffd23f' : '#ffffff', 'center');
}
// ---- Revolver cylinder ammo display: 6 chambers, brass = loaded, black = spent.
//      The cylinder rotates one chamber per shot and spins on reload. Click it to reload.
function drawCylinder() {
  const a = AMMO_BOX, cx = a.x + a.w / 2, cy = a.y + a.h / 2;
  uiDisc(cx + 6, cy + 6, 66, 'rgba(0,0,0,.35)');      // drop shadow
  uiDisc(cx, cy, 66, INK);
  uiDisc(cx, cy, 63, '#5e636c');
  uiDisc(cx, cy, 57, '#868b94');
  uiDisc(cx - 6, cy - 6, 45, '#9a9fa8');               // top-left sheen
  uiDisc(cx, cy, 42, '#868b94');
  const rad = cylAng * Math.PI / 180;
  for (let i = 0; i < 6; i++) {                        // flutes between chambers
    const an = rad + (i * 60 + 30 - 90) * Math.PI / 180;
    uiDisc(cx + Math.cos(an) * 54, cy + Math.sin(an) * 54, 9, '#4a4f58');
  }
  for (let i = 0; i < 6; i++) {
    const an = rad + (i * 60 - 90) * Math.PI / 180, px = cx + Math.cos(an) * 33, py = cy + Math.sin(an) * 33;
    const loaded = i >= 6 - ammo;
    uiDisc(px, py, 15, INK);
    if (loaded) {
      uiDisc(px, py, 12, '#c8743a'); uiDisc(px, py, 9, '#e2b33c'); uiDisc(px, py, 4, '#9a7420');
      rect(Math.round((px - 6) / P) * P, Math.round((py - 6) / P) * P, 3, 3, '#fff0a8');
    } else { uiDisc(px, py, 12, '#15151a'); uiDisc(px + 3, py + 3, 6, '#25252c'); }
  }
  uiDisc(cx, cy, 12, INK); uiDisc(cx, cy, 9, '#4a4f58'); uiDisc(cx, cy, 3, '#2a2a30');
  rect(cx - 6, a.y - 9, 12, 12, '#e2b33c'); rect(cx - 3, a.y + 3, 6, 6, '#e2b33c'); // firing-pin marker
}
function drawSides() {
  for (const x0 of [0, SW + W]) {
    rect(x0, 0, SW, H, '#2a1810');
    for (let y = 0; y < H; y += 36) { rect(x0, y, SW, 3, INK); rect(x0, y + 18, SW, 3, 'rgba(255,255,255,.04)'); }
  }
  rect(SW - 6, 0, 6, H, INK); rect(SW + W, 0, 6, H, INK); rect(SW - 9, 0, 3, H, '#c98a4b'); rect(SW + W + 6, 0, 3, H, '#c98a4b');
}
function drawHUD() { // drawn in game coords: x < 0 is the left panel, x > W is the right panel
  const LX = -SW + 6, RX = W + 6, PW = SW - 12, LC = LX + PW / 2, RC = RX + PW / 2;
  panel(LX, 12, PW, 84); text('SCORE', LC, 30, 16, '#f3d18b', 'center'); text(String(score).padStart(6, '0'), LC, 58, 20, '#ffffff', 'center');
  const hb = hatPulse > 0;
  panel(LX, 108, PW, 84, hb ? '#9a6236' : '#5a3418');
  spriteUI(HAT_ICON, HAT_PAL, LC - 21, 124 - (hb ? 3 : 0), 3);
  text(String(hatsShot), LC, 154, 24, hb ? '#ffd23f' : '#ffffff', 'center');
  const head = inDuel ? null : run ? run.label : ('label' in LEVELS[levelIdx] ? LEVELS[levelIdx].label : 'LEVEL ' + (levelIdx + 1));
  const all = inDuel ? ['SHOWDOWN', 'HIGH', 'NOON'] : [head, ...wrap(run ? run.name : LEVELS[levelIdx].name, 8)].filter(Boolean);
  panel(LX, 204, PW, 36 + all.length * 24);
  all.forEach((l, i) => text(l, LC, 224 + i * 24, 16, head && i === 0 ? '#f3d18b' : '#ffffff', 'center'));
  const d = diff.lives, hx0 = Math.round(RC - (d * 27 - 6) / 2);
  panel(RX, 12, PW, 54);
  for (let i = 0; i < d; i++) {
    const hurtHeart = wounded && i === lives - 1; // wounded = current heart shows half empty
    spriteUI(HEART, i < lives && !hurtHeart ? HEART_PAL : HEART_EMPTY, hx0 + i * 27, 30, 3);
    if (hurtHeart) spriteUI(HEART.map(row => row.slice(0, 3)), HEART_PAL, hx0 + i * 27, 30, 3);
  }
  if (canPause()) { const p = PAUSE_BTN; panel(p.x, p.y, p.w, p.h); rect(p.x + 17, p.y + 15, 7, 24, '#ffffff'); rect(p.x + 30, p.y + 15, 7, 24, '#ffffff'); }
  drawCylinder();
  const a = AMMO_BOX, mx = a.x + a.w / 2;
  if (ammo === 0) { if (Math.floor(clock * 3) % 2) text('RELOAD!', mx, a.y - 40, 16, '#ff3b30', 'center'); }
  else if (ammo <= 2) text('LOW AMMO', mx, a.y - 40, 16, '#ffd23f', 'center');
}
function drawCrosshair() {
  const x = Math.round(mouse.x / P) * P, y = Math.round(mouse.y / P) * P;
  const arms = [[x - 24, y - 3, 15, 6], [x + 9, y - 3, 15, 6], [x - 3, y - 24, 6, 15], [x - 3, y + 9, 6, 15]];
  for (const [ax, ay, aw, ah] of arms) rect(ax - 3, ay - 3, aw + 6, ah + 6, INK);
  for (const [ax, ay, aw, ah] of arms) rect(ax, ay, aw, ah, '#ffffff');
  rect(x - 3, y - 3, 6, 6, '#ff3b30');
}
function tombstone(lines) {
  const x = 288, y = 170, w = 384, h = 216;
  rect(x - 3, y - 3, w + 6, h + 6, INK); rect(x + 21, y - 27, w - 42, 27, INK); rect(x + 51, y - 42, w - 102, 18, INK);
  rect(x, y, w, h, '#9a9aa4'); rect(x + 24, y - 24, w - 48, 27, '#9a9aa4'); rect(x + 54, y - 39, w - 108, 18, '#9a9aa4');
  rect(x + w - 15, y, 15, h, '#7a7a84'); rect(x, y, 6, h, '#b4b4bc'); rect(x + 60, y + 150, 3, 12, '#6a6a74'); rect(x + 63, y + 162, 3, 9, '#6a6a74');
  ptext('R.I.P.', W / 2, y - 24, 24, '#4a4a54', 'center');
  lines.forEach((l, i) => ptext(l, W / 2, y + 24 + i * 32, 16, '#2a2a34', 'center'));
  rect(x - 36, y + h - 6, w + 72, 15, '#4f7a3a'); for (let i = x - 30; i < x + w + 30; i += 12) rect(i, y + h - 12, 3, 6, '#6b9a4a');
}
function scroll(lines) {
  const x = 288, y = 140, w = 384, h = 246;
  rect(x - 3, y - 3, w + 6, h + 6, INK); rect(x, y, w, h, '#ecd8a4');
  rect(x - 9, y - 6, w + 18, 15, '#c8a46a'); rect(x - 9, y + h - 9, w + 18, 15, '#c8a46a');
  rect(x + w - 12, y, 12, h, '#d8c08a');
  ptext('COWBOY WISDOM', W / 2, y + 30, 16, '#8a1f1a', 'center'); rect(x + 60, y + 58, w - 120, 3, '#c8a46a');
  lines.forEach((l, i) => ptext(l, W / 2, y + 84 + i * 34, 16, '#3b2210', 'center'));
}
function stats(y) {
  const acc = shots ? Math.round(hits / shots * 100) : 0;
  text('SCORE ' + score + '   ACC ' + acc + '%', W / 2, y, 16, '#ffffff', 'center');
  text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, y + 30, 16, '#ffd23f', 'center');
}
// ---------------- TALKING PORTRAITS (24x24 grid, drawn at 6x) ----------------
function portrait(who, X, Y, talking) {
  const c = CHARS[who], S = 6, px = (x, y, w, h, col) => rect(X + x * S, Y + y * S, w * S, h * S, col);
  const dk = col => shade(col, 0.72);
  const sk = c.skin, skD = dk(sk), hairC = c.hair, bc = c.beardC || hairC;
  px(0, 0, 24, 24, c.bg || (who === 'buchanan' ? '#4a1410' : '#2e4a5a'));
  for (let y = 0; y < 24; y += 4) px(0, y, 24, 1, 'rgba(255,255,255,.05)');
  px(2, 19, 20, 5, c.coat || c.shirt);
  if (c.vest) { px(3, 19, 5, 5, c.vest); px(16, 19, 5, 5, c.vest); }
  if (c.coat) { px(9, 19, 6, 5, c.shirt); }
  if (!c.dress) px(10, 16, 4, 4, skD);
  if (who === 'buchanan') { px(7, 17, 10, 2, '#8a1a14'); px(11, 19, 2, 2, '#8a1a14'); }
  if (who === 'banker' || who === 'pete') { px(10, 18, 4, 2, who === 'pete' ? '#c0302b' : '#1b1b1b'); px(11, 18, 2, 2, '#000'); }
  if (c.badge) { px(15, 20, 3, 3, '#e2b33c'); px(16, 19, 1, 1, '#e2b33c'); px(16, 21, 1, 1, '#fff0a8'); }
  px(5, 10, 1, 3, sk); px(18, 10, 1, 3, sk);
  px(6, 6, 12, 10, sk); px(7, 16, 10, 1, sk); px(17, 7, 1, 9, skD); px(8, 16, 8, 1, skD);
  if (c.hairLong) { px(4, 6, 2, 13, hairC); px(18, 6, 2, 13, hairC); }
  if (c.dress) { // ladies: soft jaw, slim neck, high collar with a brooch (no shadowy block under the chin)
    px(2, 19, 20, 5, c.shirt); px(8, 16, 8, 1, sk); px(10, 17, 4, 2, sk); px(10, 18, 4, 1, skD);
    px(8, 19, 8, 1, shade(c.shirt, 1.3)); px(9, 20, 6, 1, shade(c.shirt, 1.3)); px(11, 20, 2, 2, c.ribbon || '#e2b33c');
  }
  px(6, 6, 1, 5, hairC); px(17, 6, 1, 5, hairC);
  if (c.hat !== 'cowboy' && c.hat !== 'bowler') { px(6, 3, 12, 4, hairC); px(5, 5, 1, 4, hairC); px(18, 5, 1, 4, hairC); px(9, 3, 5, 1, shade(hairC, 1.25)); }
  const blink = (clock % 3.4) < 0.14;
  if (c.dress) { px(8, 9, 2, 1, hairC); px(14, 9, 2, 1, hairC); px(7, 13, 2, 1, '#e8908a'); px(15, 13, 2, 1, '#e8908a'); }
  else { px(8, 9, 3, 1, hairC); px(13, 9, 3, 1, hairC); }
  if (blink) { px(8, 11, 2, 1, INK); px(14, 11, 2, 1, INK); }
  else {
    px(8, 10, 2, 2, '#ffffff'); px(9, 10, 1, 2, INK); px(14, 10, 2, 2, '#ffffff'); px(15, 10, 1, 2, INK);
    if (who === 'dewey') { px(8, 10, 2, 1, skD); px(14, 10, 2, 1, skD); }
  }
  if (c.monocle) { px(13, 9, 4, 1, '#e2b33c'); px(13, 12, 4, 1, '#e2b33c'); px(13, 10, 1, 2, '#e2b33c'); px(16, 10, 1, 2, '#e2b33c'); px(16, 13, 1, 5, '#e2b33c'); }
  if (c.scar) { px(7, 11, 1, 4, '#9a3a2a'); px(6, 12, 1, 1, '#9a3a2a'); px(8, 13, 1, 1, '#9a3a2a'); }
  px(11, 11, 2, 3, c.nose || (who === 'dewey' ? '#d0453a' : skD));
  if (c.face === 'beard') { px(6, 13, 12, 4, bc); px(7, 17, 10, 1, bc); px(8, 18, 8, 1, bc); }
  if (c.face === 'stubble') for (const [x, y] of [[7, 14], [9, 16], [8, 15], [16, 14], [15, 15], [14, 16], [11, 17], [13, 16]]) px(x, y, 1, 1, dk(skD));
  const open = talking && Math.floor(clock * 9) % 2;
  if (open) { px(10, 14, 4, 2, '#3a0f0a'); px(11, 15, 2, 1, '#c0302b'); } else px(10, 15, 4, 1, c.dress ? '#b04a4a' : '#5a2a1a');
  if (c.face === 'mustache') { px(9, 13, 6, 1, bc); px(8, 14, 1, 1, bc); px(15, 14, 1, 1, bc); if (who === 'sheriff') { px(8, 13, 8, 2, bc); px(7, 14, 1, 2, bc); px(16, 14, 1, 2, bc); } }
  const hc = c.hatC || hairC;
  if (c.hat === 'cowboy') {
    px(1, 5, 22, 1, hc); px(2, 4, 20, 1, hc); px(7, 0, 10, 4, hc); px(11, 0, 2, 1, who === 'buchanan' ? '#4a1410' : '#2e4a5a');
    px(7, 3, 10, 1, who === 'sheriff' ? '#5a3418' : INK); px(8, 1, 1, 2, 'rgba(255,255,255,.25)');
    if (who === 'dewey') { px(16, 0, 1, 2, '#2e4a5a'); px(4, 4, 2, 1, dk(hc)); }
  } else if (c.hat === 'bonnet') {
    px(4, 1, 16, 5, hc); px(3, 4, 2, 9, hc); px(19, 4, 2, 9, hc); px(5, 2, 14, 1, shade(hc, 1.15)); px(4, 6, 16, 1, shade(hc, 0.7));
  } else if (c.hat === 'bowler') {
    px(4, 5, 16, 1, hc); px(7, 2, 10, 3, hc); px(8, 1, 8, 1, hc); px(7, 4, 10, 1, '#5a2a2a'); px(9, 2, 1, 2, 'rgba(255,255,255,.2)');
  }
  rect(X - 6, Y - 6, 24 * S + 12, 6, '#c98a4b'); rect(X - 6, Y + 24 * S, 24 * S + 12, 6, '#c98a4b');
  rect(X - 6, Y, 6, 24 * S, '#c98a4b'); rect(X + 24 * S, Y, 6, 24 * S, '#c98a4b');
}
function drawDialog() {
  const c = CUTS[cutName], [who, txt] = c.lines[cutLine], sp = SPEAK[who], n = Math.floor(cutT * 45), dy = c.party ? -212 : 0;
  panel(24, 352 + dy, 912, 176, '#2a1810');
  if (sp.name) { const nw = sp.name.length * 16 + 48; panel(48, 334 + dy, nw, 48, '#5a3418'); text(sp.name, 72, 350 + dy, 16, sp.color); }
  let left = n; const hasFace = !!CHARS[who], tx = hasFace ? 210 : 54, cols = hasFace ? 42 : 52;
  if (hasFace) portrait(who, 48, 370 + dy, n < txt.length);
  wrap(txt, cols).forEach((l, i) => { text(l.slice(0, Math.max(0, left)), tx, 402 + dy + i * 30, 16, sp.color); left -= l.length + 1; });
  if (n >= txt.length && Math.floor(clock * 3) % 2) { rect(894, 496 + dy, 18, 6, '#ffd23f'); rect(897, 502 + dy, 12, 6, '#ffd23f'); rect(900, 508 + dy, 6, 6, '#ffd23f'); }
  smallBtn(SKIP_BTN, 'SKIP >>');
}
function drawTally() {
  dim(0.78); panel(150, 14, 660, 512);
  text('FINAL TALLY', W / 2, 36, 32, '#ffd23f', 'center');
  const rows = [['OUTLAWS DROPPED ' + S.n.outlaw, S.pts.outlaw], ['HATS SHOT ' + S.n.hat, S.pts.hat], ['BOTTLES & GLASSES ' + S.n.bottle, S.pts.bottle],
    ['OTHER OBJECTS ' + S.n.obj, S.pts.obj], ['SHOWDOWN WITH MAD DOG', S.pts.duel]];
  const k = Math.floor(tallyT / 0.45);
  rows.forEach((r, i) => { if (k > i) { text(r[0], 200, 98 + i * 34, 16, '#ffffff'); text('+' + r[1], 760, 98 + i * 34, 16, '#f3d18b', 'right'); } });
  if (k > rows.length) { rect(200, 274, 560, 3, '#c98a4b'); text('TOTAL', 200, 292, 24, '#ffffff'); text(String(score), 760, 292, 24, '#ffd23f', 'right'); }
  if (k > rows.length + 1) {
    const acc = shots ? Math.round(hits / shots * 100) : 0;
    text('BULLETS FIRED ' + shots, 200, 354, 16, '#f3d18b'); text('ACCURACY ' + acc + '%', 200, 386, 16, '#f3d18b');
    text('PIANO NOTES PLAYED ' + pianoIdx, 200, 418, 16, '#f3d18b');
    text((newBest ? 'NEW BEST! ' : 'BEST ' + best + ' ') + diff.name, W / 2, 458, 16, '#ffd23f', 'center');
    if (SCENES.ch2Room) { smallBtn(CONT_BTN, 'CONTINUE >'); smallBtn(TITLE_BTN, 'TITLE'); }
    else if (Math.floor(clock * 2.5) % 2) text('TAP FOR TITLE', W / 2, 490, 16, '#ffffff', 'center');
  }
}
function draw() {
  drawWorld();
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0); rect(0, 0, CW, H, INK); drawSides();
  ctx.save(); ctx.translate(SW, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  rect(0, 0, W, H, INK);
  const sx = shake > 0 ? Math.round((Math.random() - 0.5) * shake * 12) * P : 0, sy = shake > 0 ? Math.round((Math.random() - 0.5) * shake * 12) * P : 0;
  ctx.drawImage(buf, sx, sy, W, H);
  if (woundT > 0) { // subtle red tint + darker edges after a graze
    rect(0, 0, W, H, `rgba(200,0,0,${woundT * 0.22})`);
    for (let k = 0; k < 4; k++) { const t = 12 * (k + 1), al = woundT * 0.1; rect(0, 0, W, t, `rgba(120,0,0,${al})`); rect(0, H - t, W, t, `rgba(120,0,0,${al})`); rect(0, 0, t, H, `rgba(120,0,0,${al})`); rect(W - t, 0, t, H, `rgba(120,0,0,${al})`); }
  }
  if (flash > 0) rect(0, 0, W, H, lastHurt === 'bystander' ? `rgba(60,90,200,${flash * 0.45})` : `rgba(200,0,0,${flash * 0.45})`);
  for (const e of effects) if (e.text) { ctx.globalAlpha = Math.min(1, e.life * 3); text(e.text, e.x * P, (e.y - (1 - e.life) * 14) * P, 16, '#ffd23f', 'center'); ctx.globalAlpha = 1; }
  const blink = Math.floor(clock * 2.5) % 2;
  const playing = ['intro', 'play', 'clear', 'duelWait', 'duelDraw', 'duelWon'].includes(state);
  if (run && playing && run.ui) run.ui();

  if (state === 'title') {
    dim(0.55);
    text('HIGH NOON', W / 2, 36, 48, '#ffd23f', 'center');
    text('THE LEGEND OF MAD DOG BUCHANAN', W / 2, 104, 16, '#f4efe0', 'center');
    panel(W / 2 - 330, 140, 660, 132);
    text('SHOOT OUTLAWS BEFORE THEY FIRE', W / 2, 160, 16, '#ffffff', 'center');
    text("DON'T SHOOT HANDS-UP FOLKS", W / 2, 188, 16, '#7fb2ff', 'center');
    text('BONUS: JUGGLE HATS, BUST BOTTLES!', W / 2, 216, 16, '#ffd23f', 'center');
    text('TAP THE CYLINDER TO RELOAD', W / 2, 244, 16, '#f3d18b', 'center');
    if (blink) text('CHOOSE YOUR BADGE', W / 2, 296, 16, '#ffffff', 'center');
    button(BTN.yellow, 'YELLOW BELLY'); button(BTN.deputy, 'DEPUTY'); button(BTN.gunslinger, 'GUNSLINGER');
    for (const k in BTN) if (bests[k]) text('BEST ' + bests[k], BTN[k].x + BTN[k].w / 2, 440, 16, '#ffd23f', 'center');
  }
  if (state === 'scene' && scene.ui) scene.ui();
  if (state === 'cut') drawDialog();
  if (state === 'intro') {
    dim(0.35); panel(W / 2 - 300, 170, 600, 160);
    if (inDuel) { text('SHOWDOWN', W / 2, 194, 32, '#ff3b30', 'center'); text('WAIT FOR THE BELL...', W / 2, 246, 16, '#ffffff', 'center'); text('THEN DRAW!', W / 2, 280, 16, '#ffd23f', 'center'); }
    else if (run) { const tl = wrap(run.title, 18), ts = tl.length > 1 ? 24 : 32; tl.forEach((l, i) => text(l, W / 2, 186 + i * 28 - (tl.length - 1) * 8, ts, '#ffd23f', 'center')); text(run.hint, W / 2, 246, 16, '#ffffff', 'center'); text('GET READY...', W / 2, 280, 16, '#f3d18b', 'center'); }
    else { const L = LEVELS[levelIdx], lab = 'label' in L; text(lab ? L.name : 'LEVEL ' + (levelIdx + 1), W / 2, 194, 32, '#ffd23f', 'center'); text(lab ? (L.hint || '') : L.name, W / 2, 246, 16, '#ffffff', 'center'); text('GET READY...', W / 2, 280, 16, '#f3d18b', 'center'); }
  }
  if (state === 'clear' && clearInfo) {
    const ci = clearInfo;
    dim(0.35); panel(W / 2 - 310, 140, 620, 220);
    text('LEVEL CLEAR!', W / 2, 164, 32, '#ffd23f', 'center');
    text('HATS SHOT ' + ci.hatsShot + '   +' + ci.hatBonus, W / 2, 224, 16, '#ffffff', 'center');
    text('TARGETS SHOT ' + ci.targets, W / 2, 256, 16, '#f3d18b', 'center');
    text('SCORE ' + score, W / 2, 302, 24, '#ffffff', 'center');
  }
  if (state === 'duelWait') text('STEADY...', W / 2, 110, 24, '#f4efe0', 'center');
  if (state === 'duelDraw') text('DRAW!', W / 2, 96, 64, Math.floor(clock * 10) % 2 ? '#ff3b30' : '#ffd23f', 'center');
  if (state === 'hurt' || state === 'over') {
    const h = (run && run.hurtText && run.hurtText[lastHurt]) || HURT[lastHurt], over = state === 'over';
    dim(over ? 0.72 : 0.62);
    text(over ? 'GAME OVER' : h.title, W / 2, 36, over ? 40 : 32, h.color, 'center');
    text(h.reason, W / 2, 96, 16, '#ffffff', 'center');
    lastHurt === 'bystander' ? scroll(epitaph) : tombstone(epitaph);
    if (over) { stats(414); if (blink) text('TAP TO RETRY LEVEL', W / 2, 482, 16, '#f3d18b', 'center'); smallBtn(TITLE_BTN, 'TITLE'); }
    else { text(inDuel ? 'BACK TO THE SHOWDOWN...' : 'BACK TO THE START OF THE LEVEL...', W / 2, 434, 16, '#f3d18b', 'center'); if (blink) text('TAP TO CONTINUE', W / 2, 470, 16, '#a88a6a', 'center'); }
  }
  if (state === 'end') {
    panel(W / 2 - 336, 142, 672, 146);
    text('THE END', W / 2, 158, 40, '#ffd23f', 'center');
    text('DUSTWATER GULCH IS SAFE.', W / 2, 214, 16, '#ffffff', 'center');
    if (blink) text('TAP FOR YOUR FINAL TALLY', W / 2, 250, 16, '#f3d18b', 'center');
  }
  if (state === 'tally') drawTally();
  if (paused) { dim(0.6); panel(W / 2 - 240, 170, 480, 240); text('PAUSED', W / 2, 194, 40, '#ffd23f', 'center'); text('TAP TO RESUME', W / 2, 254, 16, '#ffffff', 'center'); smallBtn(QUIT_BTN, 'QUIT'); }
  ctx.restore(); ctx.save(); ctx.translate(SW, 0);
  if (playing) drawHUD();
  if (paused || state === 'hurt' || state === 'over') { rect(-SW, 0, SW, H, 'rgba(20,10,5,.6)'); rect(W, 0, SW, H, 'rgba(20,10,5,.6)'); }
  if (!touchMode || performance.now() - lastTap < 400) drawCrosshair();
  ctx.restore();
}

// =====================================================================
//  INPUT
// =====================================================================
const canPause = () => ['intro', 'play', 'duelWait', 'duelDraw'].includes(state);
function toGame(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width - SW, y: (e.clientY - r.top) * H / r.height }; }
cv.addEventListener('pointermove', e => { mouse = toGame(e); touchMode = e.pointerType !== 'mouse'; });
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  audio(); mouse = toGame(e); touchMode = e.pointerType !== 'mouse'; lastTap = performance.now();
  if (paused) { if (inBox(mouse.x, mouse.y, QUIT_BTN)) toTitle(); else paused = false; return; }
  if (canPause() && inBox(mouse.x, mouse.y, PAUSE_BTN)) { paused = true; return; }
  if (state === 'scene') { if (scene.tap) scene.tap(mouse.x, mouse.y); return; }
  if (state === 'title') { for (const k in BTN) if (inBox(mouse.x, mouse.y, BTN[k])) { startGame(k); break; } return; }
  if (state === 'cut') { if (inBox(mouse.x, mouse.y, SKIP_BTN)) nextStep(); else advanceCut(); return; }
  if (state === 'end') { state = 'tally'; tallyT = 0; tallyK = 0; sfx.clear(); return; }
  if (state === 'tally') {
    if (tallyT < 0.45 * 7) { tallyT = 0.45 * 8; return; }
    if (!SCENES.ch2Room) { toTitle(); return; }
    if (inBox(mouse.x, mouse.y, CONT_BTN)) { sfx.blip(); startScene('ch2Room'); } else if (inBox(mouse.x, mouse.y, TITLE_BTN)) toTitle();
    return;
  }
  if (state === 'over') { if (inBox(mouse.x, mouse.y, TITLE_BTN)) { toTitle(); return; } lives = diff.lives; score = 0; levelStartScore = 0; S0 = newStats(); retry(); return; }
  if (state === 'hurt') { if (timer < 3.7) retry(); return; }
  if (!SHOOTABLE.includes(state)) return;
  if (run && run.tap && run.tap(mouse.x, mouse.y)) return; // steering arrows
  if (e.button === 2 || inBox(mouse.x, mouse.y, { x: AMMO_BOX.x - 14, y: AMMO_BOX.y - 30, w: AMMO_BOX.w + 26, h: AMMO_BOX.h + 42 })) { reload(); return; }
  if (mouse.x >= 0 && mouse.x <= W) shoot(mouse.x, mouse.y);
});
window.addEventListener('keydown', e => {
  audio(); const k = e.key.toLowerCase();
  if (k === 'p' && canPause()) { paused = !paused; return; }
  if (paused) return;
  if ((k === ' ' || k === 'enter') && state === 'cut') { e.preventDefault(); advanceCut(); }
  if ((k === ' ' || k === 'enter') && state === 'scene' && scene.key) { e.preventDefault(); scene.key(k); }
  if (k === 'escape') { if (state === 'cut') nextStep(); else if (state === 'over') toTitle(); }
  if (k === 'r' && SHOOTABLE.includes(state)) reload();
  if (run && state === 'play' && run.key && run.key(k)) e.preventDefault();
});
document.addEventListener('visibilitychange', () => { if (document.hidden && canPause()) paused = true; });

// =====================================================================
//  LOOP
// =====================================================================
// ---- iPhone: fit canvas to the landscape screen, unlock audio, block pinch/scroll
const stage = document.getElementById('stage');
function fit() {
  const aw = stage.clientWidth, ah = stage.clientHeight; if (!aw || !ah) return;
  let w = aw, h = aw * H / CW; if (h > ah) { h = ah; w = ah * CW / H; }
  cv.style.width = Math.floor(w) + 'px'; cv.style.height = Math.floor(h) + 'px';
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 250));
if (window.ResizeObserver) new ResizeObserver(fit).observe(stage); fit();
['touchend', 'click'].forEach(ev => document.addEventListener(ev, audio));
document.addEventListener('gesturestart', e => e.preventDefault());
let last = performance.now();
function loop(now) { music(); if (innerHeight > innerWidth && canPause()) paused = true; const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!run || state !== 'play') timeScale = 1; update(dt * timeScale); draw(); requestAnimationFrame(loop); }
