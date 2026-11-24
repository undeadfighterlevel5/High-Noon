// =====================================================================
//  HIGH NOON — CHAPTER 1: THE LEGEND OF MAD DOG BUCHANAN
//  Characters, levels, dialogue, story order, epitaphs.
//  Loaded after engine.js (uses W, H, etc. from it).
// =====================================================================
// ---------------- CHARACTERS (sprites are built from these specs) ----------------
const OUTLAWS = [
  { hat: 'cowboy', hatC: '#2a2230', skin: '#e0a070', hair: '#3b2416', shirt: '#6b3a7a', vest: '#2b2b2b', pants: '#3a3550', boots: '#2a1a10', face: 'bandana', bandC: '#c0302b' },
  { hat: 'cowboy', hatC: '#6b4a2a', skin: '#c98a5a', hair: '#1b1410', shirt: '#8a2a24', pants: '#4a3a2a', boots: '#2a1a10', face: 'beard', beardC: '#3b2416' },
  { hat: 'bowler', hatC: '#2a2a2a', skin: '#e8b07a', hair: '#7a4a20', shirt: '#3a5a3a', vest: '#6b4a2a', pants: '#2e2e3a', boots: '#2a1a10', face: 'mustache', beardC: '#7a4a20' },
  { hat: 'cowboy', hatC: '#1b1b1b', skin: '#a86a40', hair: '#1b1410', shirt: '#2f4a6b', vest: '#1b1b1b', pants: '#2a2a2a', boots: '#1b1b1b', face: 'bandana', bandC: '#e8e0c8' },
  { hat: 'cowboy', hatC: '#8a6a3a', skin: '#f0c090', hair: '#c0602a', shirt: '#b8862a', coat: '#5a4636', pants: '#3a4a6a', boots: '#4a2a14', face: 'stubble' },
];
const BYSTANDERS = [
  { hat: 'bonnet', hatC: '#f0e0f0', skin: '#f0c090', hair: '#a0522d', shirt: '#9a4a8a', dress: '#9a4a8a', face: 'plain' },
  { hat: 'cowboy', hatC: '#9a8a6a', skin: '#e0a070', hair: '#e8e8e8', shirt: '#b05a2a', pants: '#4a6aa0', boots: '#4a2a14', face: 'beard', beardC: '#e8e8e8' },
  { hat: 'none', skin: '#e8b07a', hair: '#3b2416', shirt: '#f4efe0', vest: '#3a2a1a', pants: '#3a3a3a', boots: '#1b1410', face: 'mustache', beardC: '#3b2416' },
  { hat: 'bowler', hatC: '#5b4636', skin: '#d89a6a', hair: '#5b3a20', shirt: '#e8e0d0', vest: '#4a6a8a', pants: '#5b4636', boots: '#1b1410', face: 'plain' },
  { hat: 'none', skin: '#f0c8a0', hair: '#e0b040', hairLong: true, shirt: '#c0302b', dress: '#c0302b', face: 'plain' },
];
// Walkers share one plain wardrobe, friend or foe: nothing to give them away until they reveal.
const WALKERS = [
  { hat: 'cowboy', hatC: '#7a6a4a', skin: '#e0a070', hair: '#5a3a20', shirt: '#9a8a6a', pants: '#4a4a5a', boots: '#3a2a1a', face: 'plain' },
  { hat: 'bowler', hatC: '#4a4a4a', skin: '#e8b07a', hair: '#6a4a2a', shirt: '#d8d0c0', vest: '#5a4a3a', pants: '#3a3a3a', boots: '#2a1a10', face: 'plain' },
  { hat: 'cowboy', hatC: '#5a4a3a', skin: '#c98a5a', hair: '#2a1a10', shirt: '#6a7a8a', pants: '#4a3a2a', boots: '#2a1a10', face: 'plain' },
  { hat: 'none', skin: '#f0c090', hair: '#8a5a2a', shirt: '#b0a080', vest: '#4a5a4a', pants: '#3a3a4a', boots: '#2a1a10', face: 'plain' },
  { hat: 'cowboy', hatC: '#8a7a5a', skin: '#d89a6a', hair: '#3a2a1a', shirt: '#7a6a5a', pants: '#3a4a5a', boots: '#3a2a1a', face: 'plain' },
];
const CHARS = {
  dewey:    { hat: 'cowboy', hatC: '#c8a46a', skin: '#f0c090', hair: '#a0703a', shirt: '#c8b070', pants: '#6a5a3a', boots: '#4a2a14', face: 'stubble', badge: true },
  pete:     { hat: 'bowler', hatC: '#6b5a4a', skin: '#e0a070', hair: '#9a9a9a', shirt: '#8a3a3a', vest: '#4a3a2a', pants: '#4a4a3a', boots: '#3b2a20', face: 'beard', beardC: '#b0b0b0', nose: '#d04a3a' },
  sheriff:  { hat: 'cowboy', hatC: '#e8e0d0', skin: '#d89a6a', hair: '#c8c8c8', shirt: '#4a6a8a', vest: '#6b4a2a', pants: '#3a3a4a', boots: '#4a2a14', face: 'mustache', beardC: '#d8d8d8', badge: true },
  banker:   { hat: 'bowler', hatC: '#1b1b1b', skin: '#f0c090', hair: '#5a4a3a', shirt: '#f4efe0', vest: '#3a6a4a', pants: '#2a2a2a', boots: '#1b1410', face: 'mustache', beardC: '#5a4a3a' },
  buchanan: { hat: 'cowboy', hatC: '#151515', skin: '#c98a5a', hair: '#1b1410', shirt: '#6b1a1a', coat: '#2a2420', pants: '#2a2a2a', boots: '#151515', face: 'beard', beardC: '#1b1410', scar: true },
};

// ---------------- BONUS TARGETS ----------------
// fx: glass/pottery/fire/coins/ink = shatter, juggle = pops up and can be re-shot for double points,
//     spin = hit once and it spins, fall = drops and crashes
const PROP_KINDS = {
  bottle:     { w: 3,  h: 8,  pts: 50,  fx: 'glass' },
  glass:      { w: 3,  h: 4,  pts: 75,  fx: 'glass' },
  jug:        { w: 7,  h: 8,  pts: 100, fx: 'pottery' },
  can:        { w: 4,  h: 5,  pts: 50,  fx: 'juggle' },
  spittoon:   { w: 8,  h: 7,  pts: 75,  fx: 'juggle' },
  lantern:    { w: 5,  h: 7,  pts: 150, fx: 'fire' },
  moneybag:   { w: 8,  h: 8,  pts: 200, fx: 'coins' },
  inkwell:    { w: 4,  h: 4,  pts: 100, fx: 'ink' },
  clock:      { w: 25, h: 25, pts: 250, fx: 'spin' },
  vane:       { w: 9,  h: 12, pts: 200, fx: 'spin' },
  chandelier: { w: 30, h: 10, pts: 300, fx: 'fall' },
};
const BOTTLE_C = ['#3a7a3a', '#7a4a1a', '#8a2a2a', '#c8d8d0', '#4a6a8a'];
function shelfBottles() {
  const out = [];
  [106, 113, 120, 197, 204, 211].forEach((x, i) => out.push({ k: 'bottle', x, y: 76, c: BOTTLE_C[i % 5], layer: 'bg' }));
  for (let x = 106, i = 2; x <= 212; x += 7, i++) out.push({ k: 'bottle', x, y: 88, c: BOTTLE_C[i % 5], layer: 'bg' });
  return out;
}

// ---------------- LEVELS ----------------
// Spots are in the 320x180 pixel world. a = anchor: 'top' (window) or 'bottom' (behind cover).
// Events: [seconds, spot, 'o'utlaw or 'b'ystander, seconds before an outlaw fires]
// Props: bonus targets. layer 'bg' = behind outlaws, 'fg' = in front.
const LEVELS = [
  { name: 'THE SALOON', set: 'saloonExt',
    spots: { winL: { x: 80, y: 52, w: 26, h: 24, a: 'top' }, winR: { x: 214, y: 52, w: 26, h: 24, a: 'top' },
             door: { x: 147, y: 92, w: 26, h: 44, a: 'bottom' }, roof: { x: 148, y: 0, w: 24, h: 30, a: 'bottom' },
             barrel: { x: 26, y: 90, w: 26, h: 36, a: 'bottom' }, trough: { x: 266, y: 90, w: 28, h: 36, a: 'bottom' },
             st1: { x: 76, y: 122, w: 28, h: 36, a: 'bottom' }, st2: { x: 206, y: 122, w: 28, h: 36, a: 'bottom' } },
    events: [[1.0,'winL','o',1.9],[2.6,'barrel','o',1.8],[2.0,'st2','b',1.8,'R'],[5.2,'trough','o',1.6],[4.4,'st1','o',1.6,'L'],[6.4,'winR','o',1.6],[7.8,'roof','o',1.5],
             [9.0,'winL','b',1.6],[7.4,'st2','o',1.3,'R'],[11.0,'barrel','o',1.3],[11.2,'trough','o',1.3],[12.8,'roof','o',1.2]],
    props: [ { k: 'jug', x: 34, y: 106, layer: 'fg' }, { k: 'can', x: 293, y: 115, layer: 'fg' },
             { k: 'bottle', x: 195, y: 114, c: '#3a7a3a', layer: 'bg' }, { k: 'bottle', x: 201, y: 114, c: '#7a4a1a', layer: 'bg' },
             { k: 'bottle', x: 207, y: 114, c: '#8a2a2a', layer: 'bg' }, { k: 'lantern', x: 178, y: 95, layer: 'bg' },
             { k: 'vane', x: 196, y: 2, layer: 'bg' } ] },
  { name: 'INSIDE THE SALOON', set: 'saloonInt',
    spots: { balL: { x: 40, y: 6, w: 26, h: 40, a: 'bottom' }, balR: { x: 254, y: 6, w: 26, h: 40, a: 'bottom' },
             bar: { x: 146, y: 76, w: 28, h: 44, a: 'bottom' }, piano: { x: 24, y: 76, w: 28, h: 44, a: 'bottom' },
             table: { x: 260, y: 74, w: 28, h: 44, a: 'bottom' },
             st1: { x: 86, y: 128, w: 28, h: 36, a: 'bottom' }, st2: { x: 206, y: 128, w: 28, h: 36, a: 'bottom' } },
    events: [[1.0,'bar','o',1.7],[2.4,'balL','o',1.6],[3.0,'st1','b',1.7,'L'],[3.6,'piano','b',1.8],[4.4,'balR','o',1.5],[5.0,'st2','o',1.4,'R'],[5.8,'table','o',1.4],[7.0,'bar','b',1.6],
             [7.6,'piano','o',1.3],[8.0,'st1','o',1.2,'L'],[9.0,'balL','o',1.2],[9.2,'balR','o',1.2],[10.8,'table','o',1.1],[11.6,'bar','o',1.0]],
    props: [ ...shelfBottles(),
             { k: 'glass', x: 108, y: 102, layer: 'fg' }, { k: 'glass', x: 124, y: 102, layer: 'fg' },
             { k: 'glass', x: 190, y: 102, layer: 'fg' }, { k: 'glass', x: 208, y: 102, layer: 'fg' },
             { k: 'chandelier', x: 146, y: 0, layer: 'bg', floor: 128 }, { k: 'spittoon', x: 229, y: 129, layer: 'fg' } ] },
  { name: 'THE JAIL', set: 'jail',
    spots: { winL: { x: 104, y: 68, w: 24, h: 22, a: 'top' }, winR: { x: 192, y: 68, w: 24, h: 22, a: 'top' },
             door: { x: 148, y: 86, w: 24, h: 50, a: 'bottom' }, tower: { x: 268, y: 6, w: 24, h: 32, a: 'bottom' },
             wagon: { x: 20, y: 74, w: 28, h: 44, a: 'bottom' }, outhouse: { x: 69, y: 104, w: 16, h: 32, a: 'bottom' },
             st1: { x: 100, y: 122, w: 28, h: 36, a: 'bottom' }, st2: { x: 196, y: 122, w: 28, h: 36, a: 'bottom' } },
    events: [[1.0,'door','o',1.6],[2.4,'outhouse','b',1.8],[2.8,'st1','o',1.5,'L'],[3.4,'tower','o',1.5],[4.6,'wagon','o',1.4],[5.8,'winL','o',1.3],[6.0,'winR','o',1.3],
             [7.4,'outhouse','o',1.2],[6.0,'st1','b',1.5,'L'],[6.6,'st2','o',1.2,'R'],[9.0,'tower','o',1.1],[9.6,'st1','o',1.1,'L'],[10.4,'wagon','o',1.1],[10.6,'winL','o',1.0],[12.0,'door','o',0.95]],
    props: [ { k: 'can', x: 8, y: 101, layer: 'fg' }, { k: 'can', x: 14, y: 101, layer: 'fg' }, { k: 'can', x: 52, y: 101, layer: 'fg' },
             { k: 'jug', x: 73, y: 84, layer: 'fg' }, { k: 'lantern', x: 182, y: 92, layer: 'fg' },
             { k: 'bottle', x: 92, y: 128, c: '#3a7a3a', layer: 'bg' }, { k: 'bottle', x: 98, y: 128, c: '#7a4a1a', layer: 'bg' },
             { k: 'bottle', x: 242, y: 116, c: '#8a2a2a', layer: 'bg' } ] },
  { name: 'THE BANK', set: 'bank',
    spots: { tel1: { x: 33, y: 60, w: 30, h: 44, a: 'bottom' }, tel2: { x: 105, y: 60, w: 30, h: 44, a: 'bottom' },
             tel3: { x: 177, y: 60, w: 30, h: 44, a: 'bottom' }, vault: { x: 258, y: 72, w: 28, h: 36, a: 'bottom' },
             plant: { x: 2, y: 78, w: 28, h: 44, a: 'bottom' },
             st1: { x: 70, y: 128, w: 28, h: 36, a: 'bottom' }, st2: { x: 180, y: 128, w: 28, h: 36, a: 'bottom' } },
    events: [[1.0,'tel2','o',1.4],[2.2,'tel1','b',1.6],[2.6,'tel3','o',1.3],[3.0,'st1','b',1.6,'L'],[4.0,'vault','o',1.2],[5.2,'plant','o',1.2],[4.6,'st2','o',1.1,'R'],[6.4,'tel2','b',1.5],
             [6.8,'tel1','o',1.1],[8.0,'vault','o',1.0],[8.2,'tel3','o',1.0],[8.4,'st1','o',1.0,'L'],[9.6,'plant','o',0.95],[10.8,'tel2','o',0.9],[11.0,'vault','o',0.9]],
    props: [ { k: 'clock', x: 148, y: 10, layer: 'bg' }, { k: 'lantern', x: 88, y: 38, layer: 'bg' }, { k: 'lantern', x: 224, y: 38, layer: 'bg' },
             { k: 'moneybag', x: 76, y: 90, layer: 'fg' }, { k: 'moneybag', x: 150, y: 90, layer: 'fg' }, { k: 'moneybag', x: 212, y: 90, layer: 'fg' },
             { k: 'inkwell', x: 94, y: 94, layer: 'fg' } ] },
];
const DUEL_SPOTS = { street: { x: 140, y: 92, w: 40, h: 72, a: 'bottom' } };

// ---------------- STORY ----------------
const SPEAK = {
  narr:     { name: '',                 color: '#f4efe0' },
  dewey:    { name: 'DEPUTY DEWEY',     color: '#ffd23f' },
  pete:     { name: 'PIANO PETE',       color: '#ff9a6b' },
  sheriff:  { name: 'SHERIFF TATE',     color: '#9fd8ff' },
  banker:   { name: 'MR. PENNYWORTH',   color: '#a8f0a0' },
  buchanan: { name: 'MAD DOG BUCHANAN', color: '#ff6b5b' },
};
const CUTS = {
  intro: { set: 'town', tune: 'title', actors: [{ who: 'dewey', x: 150, pose: 'cower' }], after: () => barrel(166, 104, 24, 20), lines: [
    ['narr', 'DUSTWATER GULCH, 1881. MAD DOG BUCHANAN AND HIS GANG HAVE TAKEN OVER THE TOWN.'],
    ['dewey', "PSST! OVER HERE! I'M DEPUTY DEWEY. I'M GUARDIN' THIS BARREL. *HIC*"],
    ['dewey', "THEY LOCKED UP THE SHERIFF AND THEY'RE ROBBIN' THE BANK BY SUNDOWN."],
    ['dewey', 'TAP TO SHOOT. TAP THE CYLINDER TO RELOAD.'],
    ['dewey', "WAIT FOR FOLKS WALKIN' UP TO SHOW THEIR HANDS OR THEIR GUNS. START AT THE SALOON!"],
  ]},
  doors: { set: 'saloonExt', actors: [], lines: [
    ['narr', 'THE LAST OF THEM SCRAMBLE INSIDE. YOU KICK OPEN THE BATWING DOORS...'],
  ]},
  pete: { set: 'saloonInt', actors: [{ who: 'pete', x: 196, pose: 'drink' }], lines: [
    ['pete', "WELL I'LL BE... WOW. YOU ARE SOMETHIN', STRANGER."],
    ['pete', "NAME'S PIANO PETE. I SAW THE WHOLE THING FROM UNDER MY PIANO."],
    ['pete', "THEY MADE ME PLAY 'OH SUSANNA' FOR THREE HOURS STRAIGHT. YOU'RE MY HERO."],
    ['pete', "BUCHANAN'S BOYS GOT THE SHERIFF LOCKED UP OVER AT THE JAIL."],
    ['pete', "YOU GO SPRING HIM. I'LL PLAY YOU SOME TRAVELIN' MUSIC."],
  ]},
  sheriff: { set: 'jail', actors: [{ who: 'sheriff', x: 160, pose: 'idle' }], lines: [
    ['sheriff', "MUCH OBLIGED, STRANGER. NAME'S AMOS TATE. SHERIFF... FOR NOW."],
    ['sheriff', "TWENTY YEARS WEARIN' THIS BADGE. I'M GETTIN' TOO OLD FOR THIS."],
    ['sheriff', "I'M HANGIN' IT UP AND HEADIN' TO CALIFORNIA. HEARD THE ORANGES ARE NICE."],
    ['sheriff', "BUT BUCHANAN'S GANG IS HITTIN' THE BANK RIGHT NOW."],
    ['sheriff', "CLEAR 'EM OUT FOR ME? CONSIDER IT MY RETIREMENT PRESENT."],
  ]},
  banker: { set: 'bank', actors: [{ who: 'banker', x: 120, pose: 'idle' }], lines: [
    ['banker', 'OH, THANK HEAVENS! MORTIMER PENNYWORTH, MANAGER. EVERY CENT ACCOUNTED FOR!'],
    ['banker', "WELL... MINUS SEVEN DOLLARS. I'LL FIND IT."],
    ['banker', 'BUT I HAVE A MESSAGE FROM MAD DOG HIMSELF. HE SAID...'],
    ['banker', "'TELL THAT STRANGER I'LL BE WAITIN' IN THE STREET. HIGH NOON.'"],
    ['banker', "IT'S 11:58. NO PRESSURE."],
  ]},
  buchanan: { set: 'street', actors: [{ who: 'buchanan', x: 160, pose: 'holster' }], lines: [
    ['buchanan', "SO YOU'RE THE ONE BEEN SHOOTIN' UP MY GANG."],
    ['buchanan', "THIS TOWN AIN'T BIG ENOUGH FOR THE BOTH OF US."],
    ['buchanan', "...MOSTLY 'CAUSE IT'S REAL SMALL. WHEN THAT BELL RINGS, DRAW."],
  ]},
  party: { set: 'party', party: true, actors: [
      { who: 'dewey', x: 52, pose: 'hands' }, { who: 'pete', x: 124, pose: 'drink' },
      { who: 'banker', x: 196, pose: 'wave' }, { who: 'sheriff', x: 268, pose: 'wave' } ], lines: [
    ['dewey', "YOU DID IT! I MEAN, WE DID IT. I GUARDED THAT BARREL REAL GOOD. *HIC*"],
    ['pete', "THIS ONE'S FOR YOU, STRANGER! ANYTHING BUT 'OH SUSANNA.'"],
    ['banker', 'THE BANK IS PLEASED TO OFFER A REWARD OF... SEVEN DOLLARS. FOUND IT!'],
    ['sheriff', 'TOWN NEEDS A NEW SHERIFF. THE BADGE IS YOURS IF YOU WANT IT, PARTNER.'],
    ['sheriff', "NOW GO GET YOURSELF SOME GRUB AND A ROOM UPSTAIRS. GET SOME SHUT-EYE. YOU EARNED IT."],
  ]},
};
const STORY = [
  { cut: 'intro' }, { level: 0 }, { cut: 'doors' }, { level: 1 }, { cut: 'pete' }, { level: 2 },
  { cut: 'sheriff' }, { level: 3 }, { cut: 'banker' }, { cut: 'buchanan' }, { duel: true }, { cut: 'party' }, { end: true },
];

const PETE_OK = CUTS.pete.lines, BANKER_OK = CUTS.banker.lines, PARTY_PETE_OK = CUTS.party.lines[1];
const PETE_BAD = [
  ['pete', "NAME'S PIANO PETE. WELL... I WAS A PIANO PLAYER."],
  ['pete', 'YOU SHOT MY PIANO! IT PLAYED ITS LAST NOTE AND DIED!'],
  ['pete', "THREE HOURS OF OH SUSANNA, AND NOW THIS. I DON'T KNOW WHETHER TO THANK YOU OR SUE YOU."],
  ['pete', "THE SHERIFF'S LOCKED UP AT THE JAIL. GO SPRING HIM."],
];
const BANKER_BAD = [['banker', 'OH, THANK HEAVENS! MORTIMER PENNYWORTH, MANAGER.'], ['banker', 'BUT MY GOLD! YOU SHOT THE WHOLE VAULT TO DUST!'],
  ['banker', "FORTY YEARS OF SAVINGS. NOW IT'S JUST GLITTER."], ...BANKER_OK.slice(2)];
const PARTY_PETE_BAD = ['pete', "THIS ONE'S FOR YOU, STRANGER! ON WHAT'S LEFT OF MY PIANO. *SOB*"];
function setCutLines(n) {
  if (n === 'pete') CUTS.pete.lines = pianoWrecked ? PETE_BAD : PETE_OK;
  if (n === 'banker') CUTS.banker.lines = goldHP.every(h => h <= 0) ? BANKER_BAD : BANKER_OK;
  if (n === 'party') CUTS.party.lines[1] = pianoWrecked ? PARTY_PETE_BAD : PARTY_PETE_OK;
}
// ---------------- DEATH SCREENS ----------------
const HURT = {
  shot:      { title: "YOU'VE BEEN SHOT!", reason: 'AN OUTLAW GOT YOU FIRST.', color: '#ff3b30' },
  bystander: { title: 'INNOCENT DOWN!',    reason: 'YOU SHOT A TOWNSFOLK.',    color: '#7fb2ff' },
  early:     { title: 'DREW TOO EARLY!',   reason: 'WAIT FOR THE BELL.',       color: '#ffb347' },
  duel:      { title: 'TOO SLOW, PARTNER', reason: 'MAD DOG OUTDREW YOU.',     color: '#ff3b30' },
};
const EPITAPHS = {
  shot: [
    ['HERE LIES LESTER MOORE', 'FOUR SLUGS FROM A .44', 'NO LES, NO MORE.'],
    ['HERE LIES A STRANGER.', 'SECOND FASTEST DRAW', 'IN DUSTWATER GULCH.'],
    ['HE CALLED BILL SMITH', 'A LIAR.'],
    ['I TOLD YOU', 'I WAS SICK.'],
    ['HERE LIES JACK.', 'HE DONE HIS BEST.', "IT WEREN'T ENOUGH."],
    ['HE BLINKED.'],
    ['HE WAS AIMIN', 'AT A HAT.'],
  ],
  duel: [['ALMOST FAST ENOUGH.', 'ALMOST.'], ['HE REACHED FOR IT.', 'MAD DOG REACHED', 'FASTER.']],
  early: [['HE DREW BEFORE', 'THE BELL. THE BELL', 'GOT THE LAST WORD.'], ['PATIENCE WAS NOT', 'HIS STRONG SUIT.']],
};
const WISDOM = [
  ["PLEASE DON'T SHOOT", 'THE PIANO PLAYER.', "HE'S DOING HIS BEST."],
  ['IF YOU FIND YOURSELF', 'IN A HOLE,', "QUIT DIGGIN'."],
  ['NEVER KICK A FRESH', 'COW PIE ON A', 'HOT DAY.'],
  ['ALWAYS DRINK', 'UPSTREAM', 'FROM THE HERD.'],
  ["DON'T SQUAT WITH", 'YOUR SPURS ON.'],
  ['LOOK BEFORE YOU LEAP.', 'AND BEFORE', 'YOU SHOOT.'],
];
