// =====================================================================
// PadPal · 🎾 doodle background
// Hand-drawn padel doodles (from PADPAL Logo/app-background), placed at random
// on every page, in the colours of your theme, very faint behind the content.
// Needs auth.js first (for the theme). Loaded on every page.
// =====================================================================
(function () {
  // The doodles (each roughly 150 units big, centred on 0,0) — from doodle-tile.template.svg
  var DEFS =
    '<filter id="ddHand" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<g id="dd-racket"><path d="M0 -70 C42 -70 50 -32 50 -2 C50 30 26 48 0 54 C-26 48 -50 30 -50 -2 C-50 -32 -42 -70 0 -70 Z"/><path d="M0 -62 C34 -62 42 -30 42 -2 C42 24 22 40 0 46 C-22 40 -42 24 -42 -2 C-42 -30 -34 -62 0 -62 Z"/><circle cx="0" cy="-40" r="2.6"/><circle cx="-14" cy="-28" r="2.6"/><circle cx="14" cy="-28" r="2.6"/><circle cx="-25" cy="-12" r="2.6"/><circle cx="0" cy="-14" r="2.6"/><circle cx="25" cy="-12" r="2.6"/><circle cx="-14" cy="4" r="2.6"/><circle cx="14" cy="4" r="2.6"/><circle cx="0" cy="20" r="2.6"/><path d="M-16 51 Q-8 62 -8 76 M16 51 Q8 62 8 76"/><rect x="-9" y="76" width="18" height="52" rx="4"/><path d="M-9 88 L9 94 M-9 100 L9 106 M-9 112 L9 118"/><path d="M-4 128 C-14 150 14 150 4 128"/></g>' +
    '<g id="dd-ball"><circle r="22" fill="var(--dd-accent)"/><path d="M-15 -16 C-5 -6 -5 6 -15 16 M15 -16 C5 -6 5 6 15 16"/></g>' +
    '<g id="dd-ballFly"><use href="#dd-ball"/><path d="M-32 -12 H-56 M-35 0 H-70 M-32 12 H-50"/></g>' +
    '<g id="dd-miniBall"><circle r="9"/><path d="M-6 -6 C-2 -2 -2 2 -6 6 M6 -6 C2 -2 2 2 6 6"/></g>' +
    '<g id="dd-tube"><rect x="-26" y="-56" width="52" height="116" rx="10"/><rect x="-29" y="-66" width="58" height="16" rx="5"/><circle cy="-26" r="19"/><circle cy="6" r="19" fill="var(--dd-accent)"/><circle cy="38" r="19"/><path d="M-12 -38 C-6 -32 -6 -20 -12 -14 M12 -38 C6 -32 6 -20 12 -14 M-12 26 C-6 32 -6 44 -12 50 M12 26 C6 32 6 44 12 50"/><path d="M-18 -6 C-12 0 -12 12 -18 18 M18 -6 C12 0 12 12 18 18"/></g>' +
    '<g id="dd-coffee"><path d="M-20 -25 L-15 35 H15 L20 -25 Z" fill="var(--dd-paper)"/><path d="M-19 -8 L-16.8 18 H16.8 L19 -8 Z" fill="var(--dd-accent)"/><rect x="-24" y="-34" width="48" height="10" rx="3" fill="var(--dd-paper)"/><path d="M-16 -34 Q0 -42 16 -34"/><path d="M-6 -50 C-12 -58 0 -64 -6 -74 M6 -48 C0 -56 12 -62 6 -72"/></g>' +
    '<g id="dd-sneaker"><path d="M-58 18 L-56 -10 C-55 -20 -46 -24 -38 -22 C-30 -20 -24 -24 -20 -30 L-8 -30 C-2 -16 8 -8 24 -4 C44 0 58 4 60 16 L60 18"/><path d="M-60 18 H62 C65 18 65 30 58 30 H-58 C-62 30 -62 18 -60 18 Z" fill="var(--dd-accent)"/><path d="M-12 -24 L-2 -18 M-6 -17 L4 -11 M0 -10 L10 -5"/><path d="M-44 6 C-24 -2 -4 -2 18 6"/><path d="M-56 -10 C-48 -8 -44 -2 -44 6"/></g>' +
    '<g id="dd-bottle"><rect x="-12" y="-72" width="24" height="14" rx="3"/><path d="M-12 -58 L-15 -48 M12 -58 L15 -48"/><rect x="-24" y="-48" width="48" height="112" rx="12"/><rect x="-24" y="-8" width="48" height="34" fill="var(--dd-accent)"/><path d="M-14 -36 V-20"/></g>' +
    '<g id="dd-cap"><path d="M-40 10 C-40 -30 40 -30 40 10 Z" fill="var(--dd-accent)"/><path d="M40 10 C60 10 72 16 72 22 C60 26 40 22 28 15"/><circle cx="0" cy="-20" r="3"/><path d="M0 -20 C-6 -6 -8 4 -10 10 M0 -20 C10 -8 15 2 17 10"/></g>' +
    '<g id="dd-net"><path d="M-70 -32 V42 M70 -32 V42"/><rect x="-70" y="-30" width="140" height="8"/><path d="M-56 -22 V26 M-42 -22 V26 M-28 -22 V26 M-14 -22 V26 M0 -22 V26 M14 -22 V26 M28 -22 V26 M42 -22 V26 M56 -22 V26"/><path d="M-70 -8 H70 M-70 8 H70 M-70 26 H70"/><path d="M-84 42 H84"/></g>' +
    '<g id="dd-watch"><circle r="34" fill="var(--dd-paper)"/><rect x="-7" y="-46" width="14" height="9" rx="2"/><path d="M0 -37 V-34 M25 -26 L31 -32"/><path d="M0 -28 V-24 M28 0 H24 M0 28 V24 M-28 0 H-24"/><path d="M0 0 V-19 M0 0 L13 8"/></g>' +
    '<g id="dd-trophy"><path d="M-28 -40 H28 C28 -5 16 10 0 12 C-16 10 -28 -5 -28 -40 Z" fill="var(--dd-paper)"/><path d="M-28 -32 C-46 -32 -44 -6 -22 -6 M28 -32 C46 -32 44 -6 22 -6"/><path d="M-4 12 V26 M4 12 V26"/><rect x="-18" y="26" width="36" height="12" rx="2" fill="var(--dd-accent)"/><path d="M0 -30 L4 -21 L13 -21 L6 -15 L9 -6 L0 -11 L-9 -6 L-6 -15 L-13 -21 L-4 -21 Z"/></g>' +
    '<g id="dd-tree"><path d="M-4 70 L-3 -6 M4 70 L3 -6"/><path d="M-2 26 L-20 8 M2 14 L18 -2"/><path d="M-24 -6 C-46 -4 -54 -30 -38 -40 C-42 -62 -16 -72 -6 -60 C2 -80 32 -74 30 -54 C50 -52 52 -26 36 -18 C40 0 20 6 10 -2 C0 6 -16 4 -24 -6 Z" fill="var(--dd-paper)"/><path d="M-26 -34 q3 -5 7 0 M-4 -46 q3 -5 7 0 M16 -36 q3 -5 7 0 M-12 -20 q3 -5 7 0 M12 -16 q3 -5 7 0"/><path d="M-30 70 H30"/></g>' +
    '<g id="dd-cloud"><path d="M-40 10 C-52 10 -52 -8 -38 -8 C-38 -24 -14 -26 -10 -14 C-4 -28 22 -26 22 -10 C36 -12 40 10 26 10 Z"/></g>' +
    '<g id="dd-sun"><circle r="12"/><path d="M0 -20 V-26 M0 20 V26 M-20 0 H-26 M20 0 H26 M14 -14 L18 -18 M-14 -14 L-18 -18 M14 14 L18 18 M-14 14 L-18 18"/></g>' +
    '<g id="dd-city"><path d="M-84 40 V-2 H-62 V40 M-62 -18 H-40 V40 M-40 8 H-20 V40 M-20 -46 H-6 V40 M-13 -46 V-72 M-6 -14 H16 V40 M16 -30 H40 V40 M40 2 H66 V40"/><path d="M-76 8 H-70 M-76 20 H-70 M-54 -6 H-48 M-54 6 H-48 M-54 18 H-48 M-16 -34 V-24 M-10 -34 V-24 M-16 -10 V0 M-10 -10 V0 M22 -18 H34 M22 -4 H34 M22 10 H34 M46 14 H58"/><path d="M-96 40 H80"/></g>' +
    '<g id="dd-court"><rect x="-40" y="-70" width="80" height="140" rx="3"/><path d="M-40 -46 H40 M-40 46 H40 M0 -46 V46"/><path d="M-50 0 H50" stroke-width="4"/><path d="M-46 -76 H46 M-46 76 H46"/><circle cx="16" cy="-22" r="5" fill="var(--dd-accent)"/></g>' +
    '<g id="dd-bench"><path d="M-60 -34 H60 M-60 -20 H60 M-62 0 H62 M-62 8 H62"/><path d="M-54 -40 V34 M54 -40 V34 M-48 8 V34 M48 8 V34"/><path d="M8 -34 L8 6 Q20 10 32 6 L32 -34 Z" fill="var(--dd-accent)"/><path d="M8 -22 H32"/></g>' +
    '<g id="dd-bag"><path d="M-22 -22 C-22 -58 22 -58 22 -22 M-13 -22 C-13 -46 13 -46 13 -22"/><path d="M-60 -8 C-60 -30 60 -30 60 -8 V30 C60 36 54 40 48 40 H-48 C-54 40 -60 36 -60 30 Z" fill="var(--dd-accent)"/><path d="M-50 -16 C-20 -24 20 -24 50 -16"/><rect x="-24" y="4" width="48" height="22" rx="4" fill="var(--dd-paper)"/><path d="M-14 15 H14"/></g>' +
    '<g id="dd-sparkle"><path d="M0 -12 Q1.5 -1.5 12 0 Q1.5 1.5 0 12 Q-1.5 1.5 -12 0 Q-1.5 -1.5 0 -12 Z"/></g>' +
    '<g id="dd-heart"><path d="M0 12 C-16 1 -16 -12 -8 -13 C-3 -14 -1 -10 0 -7 C1 -10 3 -14 8 -13 C16 -12 16 1 0 12 Z"/></g>';

  // Big doodles and how much to shrink each so they look about the same size
  var BIG = [['racket', 0.42], ['ballFly', 0.62], ['tube', 0.5], ['coffee', 0.6], ['sneaker', 0.55], ['bottle', 0.52], ['cap', 0.6],
             ['net', 0.42], ['watch', 0.62], ['trophy', 0.62], ['tree', 0.48], ['city', 0.42], ['court', 0.42], ['bench', 0.5], ['bag', 0.5]];
  var SMALL = [['sparkle', 0.7], ['heart', 0.7], ['miniBall', 0.8], ['cloud', 0.55], ['sun', 0.65]];

  // How faint, per theme (the UX team's pick: visible in the gaps, never fighting with text)
  var LOOK = {
    dark:  { ink: '#FFFFFF', accent: '#C9E52C', paper: '#0B1426', opacity: 0.09 },
    light: { ink: '#0F1E3C', accent: '#AAB6EC', paper: '#EEF2F7', opacity: 0.08 },
    gold:  { ink: '#D4AF6A', accent: '#D4AF6A', paper: '#0E0C09', opacity: 0.10 },
    glassDark:  { ink: '#FFFFFF', accent: '#D7F05A', paper: '#142A55', opacity: 0.12 },
    glassLight: { ink: '#0F1E3C', accent: '#AAB6EC', paper: '#F4F7FD', opacity: 0.08 }
  };
  function currentLook() {
    var t = document.documentElement.getAttribute('data-theme');
    var light = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches;
    if (t === 'glass') return LOOK[light ? 'glassLight' : 'glassDark'];   // glass follows day / night
    if (!LOOK[t]) t = light ? 'light' : 'dark';
    return LOOK[t];
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // A new random layout: a loose grid with one big doodle per cell, small ones in between
  var layout = null;
  function makeLayout(w, h) {
    var cell = 150, cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1, items = [], last = null;
    var bag = BIG.slice().sort(function () { return Math.random() - 0.5; }), k = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var d = bag[k++ % bag.length];
        if (d === last) d = bag[k++ % bag.length];
        last = d;
        var x = c * cell + (r % 2 ? cell / 2 : 0) + rnd(-22, 22), y = r * cell + rnd(-22, 22);
        items.push({ id: d[0], x: x, y: y, s: d[1] * rnd(0.85, 1.1), rot: rnd(-18, 18) });
        if (Math.random() < 0.55) {
          var sm = pick(SMALL);
          items.push({ id: sm[0], x: x + rnd(55, 85) * (Math.random() < 0.5 ? -1 : 1), y: y + rnd(55, 80), s: sm[1] * rnd(0.8, 1.1), rot: rnd(-20, 20) });
        }
      }
    }
    return { w: w, h: h, items: items };
  }

  function draw() {
    var box = document.getElementById('padpalDoodles');
    if (!box) {
      box = document.createElement('div');
      box.id = 'padpalDoodles';
      box.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(box, document.body.firstChild);
    }
    var w = Math.max(screen.width || 0, innerWidth), h = Math.max(screen.height || 0, innerHeight);
    if (!layout || layout.w < w || layout.h < h) layout = makeLayout(w, h);
    var look = currentLook();
    box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMin slice" viewBox="0 0 ' + layout.w + ' ' + layout.h + '">' +
      '<defs>' + DEFS + '</defs>' +
      '<g style="--dd-accent:' + look.accent + ';--dd-paper:' + look.paper + '" color="' + look.ink + '" opacity="' + look.opacity + '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#ddHand)">' +
      layout.items.map(function (it) {
        return '<use href="#dd-' + it.id + '" transform="translate(' + it.x.toFixed(1) + ' ' + it.y.toFixed(1) + ') rotate(' + it.rot.toFixed(1) + ') scale(' + it.s.toFixed(2) + ')"/>';
      }).join('') + '</g></svg>';
  }

  function start() {
    draw();
    // new colours when the theme changes (Settings) or the iPhone switches day/night (Auto)
    document.addEventListener('padpal-theme', draw);
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: light)');
      if (mq.addEventListener) mq.addEventListener('change', draw);
    }
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  window.PadPal = window.PadPal || {};
  PadPal.doodles = { redraw: function () { layout = null; draw(); }, LOOK: LOOK };
})();
