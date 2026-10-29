// =====================================================================
// PadPal · 🏸 rackets: the racket list, the doodle drawer and the sticker
// on the profile picture (left side, held by a white glove on the circle line).
// Needs auth.js first. The list lives in racket-list.js (PadPal.RACKET_LIST).
// =====================================================================
(function () {
  var INK = '#15171C', BG = '#0B1426', LIME = '#C9E52C', WHITE = '#FFFFFF';

  // Racket heads (in a 100-wide box, head from y 6 to 118, then throat + handle down to 188)
  var HEADS = {
    round:   'M50 8 C76 8 92 28 92 56 C92 82 75 103 60 118 L40 118 C25 103 8 82 8 56 C8 28 24 8 50 8 Z',
    tear:    'M50 6 C80 6 95 30 93 58 C91 82 74 102 60 118 L40 118 C26 102 9 82 7 58 C5 30 20 6 50 6 Z',
    diamond: 'M50 5 C71 5 89 15 93 34 C97 52 79 92 60 118 L40 118 C21 92 3 52 7 34 C11 15 29 5 50 5 Z'
  };
  var SHAPES = { round: '🔵 Round', tear: '💧 Teardrop', diamond: '🔷 Diamond' };
  var THROAT = 'M30 104 Q50 112 70 104 L58 142 L42 142Z';
  var GLOVE_AT = [52, 168];   // where the glove holds the handle (in the left-side drawing)

  function light(hex) {
    var n = parseInt(String(hex || '#000').slice(1), 16);
    return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255 > 0.6;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ===== The list =====
  // A saved racket is { id } (from the list) or { name, shape, c: [face, band, bottom], p } (made from a photo)
  function list() { return PadPal.RACKET_LIST || []; }
  function byId(id) { return list().filter(function (r) { return r.id === id; })[0] || null; }
  // Everything the drawer needs: { brand, model, year, shape, c: [face, band, bottom, frame, accent], p: 'band chev …' }
  function resolve(saved) {
    if (!saved) return null;
    if (saved.id) {
      var r = byId(saved.id);
      return r ? r : { brand: '', model: saved.name || 'Racket', shape: 'tear', c: ['#888888'], p: '' };
    }
    return { brand: '', model: saved.name || 'My racket', shape: HEADS[saved.shape] ? saved.shape : 'tear', c: saved.c || ['#888888'], p: saved.p || (saved.c && saved.c[1] ? 'band' : ''), photo: true };
  }
  function label(saved) {
    var r = resolve(saved);
    if (!r) return '';
    return (r.brand ? r.brand + ' ' : '') + r.model + (r.year ? ' · ' + r.year : '');
  }

  // ===== The doodle =====
  // o: { sticker: white sticker edge, glove: white glove + lime cuff, empty: dashed "add your racket" }
  var uid = 0;
  function svg(r, o) {
    o = o || {};
    var id = 'rk' + (++uid), head = HEADS[(r && r.shape) || 'tear'] || HEADS.tear;
    var box = o.glove ? '-6 -4 112 196' : '-4 0 108 192';
    var gloveG = '';
    if (o.glove) {
      var line = o.empty ? 'rgba(200,210,225,.6)' : BG, fill = o.empty ? 'rgba(200,210,225,.12)' : WHITE, dash = o.empty ? ' stroke-dasharray="4 3"' : '';
      // the glove's thumb is on the left, because the racket sits on the left of the picture
      gloveG = '<g transform="translate(100 0) scale(-1 1)">' +
        '<path d="M57 152 Q68 150 69 158 Q70 164 60 165" fill="' + fill + '" stroke="' + line + '" stroke-width="2.2" stroke-linecap="round"' + dash + '/>' +
        '<rect x="34" y="150" width="28" height="30" rx="11" fill="' + fill + '" stroke="' + line + '" stroke-width="2.4"' + dash + '/>' +
        (o.empty ? '' : '<path d="M35 158 Q41 156 47 158 M35 165 Q41 163 47 165 M35 172 Q41 170 47 172" stroke="' + line + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
          '<rect x="37" y="179" width="22" height="7" rx="3" fill="' + LIME + '" stroke="' + line + '" stroke-width="2"/>') + '</g>';
    }
    if (o.empty) {
      var c = 'rgba(200,210,225,.6)', f = 'rgba(200,210,225,.12)';
      return '<svg viewBox="' + box + '" width="100%" height="100%" aria-hidden="true">' +
        '<path d="' + head + '" fill="' + f + '" stroke="' + c + '" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round"/>' +
        '<path d="M50 40 L50 72 M34 56 L66 56" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="' + THROAT + '" fill="' + f + '" stroke="' + c + '" stroke-width="2.4" stroke-dasharray="5 4"/>' +
        '<rect x="43" y="140" width="14" height="48" rx="5" fill="' + f + '" stroke="' + c + '" stroke-width="2.4" stroke-dasharray="5 4"/>' + gloveG + '</svg>';
    }
    var col = r.c || [], face = col[0] || '#888888', band = col[1], bottom = col[2], frame = col[3] || INK, accent = col[4] || band || face;
    var p = ' ' + (r.p || '') + ' ', inner = '<rect x="0" y="0" width="100" height="130" fill="' + face + '"/>';
    if (p.indexOf(' diag ') > -1 && band) inner += '<path d="M-10 46 L110 8 L110 26 L-10 64Z" fill="' + band + '"/>';
    if (p.indexOf(' ring ') > -1 && band) inner += '<circle cx="50" cy="46" r="22" fill="none" stroke="' + band + '" stroke-width="9"/>';
    if (p.indexOf(' wave ') > -1 && band) inner += '<path d="M-5 40 Q25 22 50 40 T105 40 L105 54 Q75 36 50 54 T-5 54Z" fill="' + band + '"/>';
    if (p.indexOf(' split ') > -1 && band) inner += '<path d="M50 0 L100 0 L100 130 L50 130Z" fill="' + band + '"/>';
    if (bottom) inner += '<path d="M0 84 Q50 74 100 84 L100 130 L0 130Z" fill="' + bottom + '"/><path d="M0 75 Q50 67 100 75 L100 84 Q50 76 0 84Z" fill="' + bottom + '" opacity=".45"/>';
    if (p.indexOf(' chev ') > -1 && band) {
      var claw = 'M14 26 L30 20 L25 36 L37 44 L21 54 L31 66 L16 72 L27 84';
      inner += '<path d="' + claw + '" fill="none" stroke="' + band + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="' + claw + '" transform="translate(100 0) scale(-1 1)" fill="none" stroke="' + band + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    // brand-style shapes, drawn our own way: X (Nox), 3 stripes (Adidas), peak (Head), star (StarVie), W (Wilson)
    var stroke = ' fill="none" stroke="' + band + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>';
    if (p.indexOf(' x ') > -1 && band) inner += '<path d="M18 22 L82 90 M82 22 L18 90"' + stroke;
    if (p.indexOf(' peak ') > -1 && band) inner += '<path d="M16 62 L50 24 L84 62"' + stroke;
    if (p.indexOf(' w ') > -1 && band) inner += '<path d="M16 30 L32 72 L50 42 L68 72 L84 30"' + stroke;
    if (p.indexOf(' stripes ') > -1 && band) inner += [0, 1, 2].map(function (i) {
      var x0 = 20 + i * 20, top = 58 - i * 16;
      return '<path d="M' + x0 + ' 84 L' + (x0 + 13) + ' 84 L' + (x0 + 27) + ' ' + top + ' L' + (x0 + 14) + ' ' + top + 'Z" fill="' + band + '"/>';
    }).join('');
    if (p.indexOf(' star ') > -1 && band) inner += '<path d="M50 16 L58 42 L84 48 L58 55 L50 84 L42 55 L16 48 L42 42Z" fill="' + band + '"/>';
    var under = face;
    if (p.indexOf(' band ') > -1 && band) {
      inner += '<rect x="36" y="0" width="28" height="130" fill="' + INK + '"/><rect x="39.5" y="0" width="21" height="130" fill="' + band + '"/>';
      under = band;
    }
    var holes = '';
    for (var y = 18; y < 96; y += 9) for (var x = 14; x < 90; x += 9) holes += '<circle cx="' + (x + ((y / 9) % 2 ? 4.5 : 0)) + '" cy="' + y + '" r="2.6" fill="#FFFFFF"/>';
    var brand = r.brand ? '<text x="50" y="52" transform="rotate(-90 50 52)" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" ' +
      'font-family="Chalkboard SE, Marker Felt, Comic Sans MS, cursive" fill="' + (light(under) ? INK : WHITE) + '">' + esc(r.brand) + '</text>' : '';
    var edge = o.sticker ? '<g stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round" fill="#FFFFFF"><path d="' + head + '"/><path d="' + THROAT + '"/><rect x="43" y="140" width="14" height="48" rx="5"/>' +
      (o.glove ? '<g transform="translate(100 0) scale(-1 1)"><rect x="34" y="150" width="28" height="36" rx="11"/><path d="M57 152 Q68 150 69 158 Q70 164 60 165"/></g>' : '') + '</g>' : '';
    return '<svg viewBox="' + box + '" width="100%" height="100%" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="' + head + '"/></clipPath></defs>' + edge +
      '<g clip-path="url(#' + id + ')">' + inner + holes + brand + '</g>' +
      '<path d="' + head + '" fill="none" stroke="' + frame + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="' + THROAT + '" fill="' + frame + '"/>' +
      '<path d="M37 110 L47 114 L45.5 130Z M63 110 L53 114 L54.5 130Z" fill="' + BG + '" stroke="' + accent + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<rect x="43" y="140" width="14" height="48" rx="5" fill="' + INK + '"/>' +
      '<path d="M44 150 L56 154 M44 160 L56 164 M44 170 L56 174" stroke="#3A3F4A" stroke-width="1.6" stroke-linecap="round"/>' + gloveG + '</svg>';
  }

  // ===== The sticker on a profile picture =====
  // Sizes for a round picture of d pixels: the glove sits ON the circle line (lower left), the head points up and away.
  function place(d) {
    var w = d * 0.54, h = w * 1.75;
    var gx = (GLOVE_AT[0] + 6) / 112 * w, gy = (GLOVE_AT[1] + 4) / 196 * h;
    var tx = d / 2 - 0.94 * d / 2, ty = d / 2 + 0.34 * d / 2;   // a point on the circle, about 8 o'clock
    return { w: w, h: h, gx: gx, gy: gy, left: tx - gx, top: ty - gy, angle: -40 };
  }
  // Long press helper: tap → o.tap(), hold half a second and let go → o.hold() (works with iPhone file pickers)
  function press(el, o) {
    var timer = null, held = false, sx = 0, sy = 0;
    function reset() { clearTimeout(timer); el.classList.remove('holding'); }
    el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      held = false; sx = e.clientX; sy = e.clientY;
      clearTimeout(timer);
      if (o.hold) timer = setTimeout(function () { held = true; el.classList.add('holding'); if (navigator.vibrate) navigator.vibrate(15); }, 500);
    });
    el.addEventListener('pointermove', function (e) { if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 14) { clearTimeout(timer); } });
    el.addEventListener('pointercancel', function () { reset(); held = false; });
    el.addEventListener('pointerup', function (e) {
      e.stopPropagation();
      reset();
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 14) { held = false; return; }   // it was a scroll
      if (held) { held = false; o.hold(e); } else if (o.tap) o.tap(e);
    });
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // Put the sticker next to a picture. box = a position:relative element exactly the size of the picture.
  // o: { size, mine: true on your own profile (empty racket + hold to change), onHold }
  function attach(box, saved, o) {
    o = o || {};
    var old = box.querySelector('.racket-stk');
    if (old) old.remove();
    var oldB = box.querySelector('.racket-bubble');
    if (oldB) oldB.remove();
    var r = resolve(saved);
    if (!r && !o.mine) return null;
    var d = o.size || box.offsetWidth || 92, pl = place(d);
    var el = document.createElement('div');
    el.className = 'racket-stk' + (r ? '' : ' empty');
    el.style.cssText = 'width:' + pl.w + 'px;height:' + pl.h + 'px;left:' + pl.left + 'px;top:' + pl.top + 'px;transform-origin:' + pl.gx + 'px ' + pl.gy + 'px;transform:rotate(' + pl.angle + 'deg)';
    el.innerHTML = r ? svg(r, { sticker: true, glove: true }) : svg(null, { empty: true, glove: true });
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', r ? label(saved) : 'Add your racket');
    box.appendChild(el);
    press(el, {
      tap: function () { if (r) bubble(box, label(saved), pl); else if (o.onHold) o.onHold(); },
      hold: o.mine && o.onHold ? o.onHold : null
    });
    if (!r) bubble(box, "What's your racket?", pl, true);
    return el;
  }
  function bubble(box, text, pl, stay) {
    var b = box.querySelector('.racket-bubble');
    if (!b) { b = document.createElement('div'); b.className = 'racket-bubble'; box.appendChild(b); }
    b.textContent = text;
    b.classList.toggle('ask', !!stay);
    // just above the racket head (the head is turned with the sticker)
    var a = pl.angle * Math.PI / 180, dx = (56 / 112) * pl.w - pl.gx, dy = (8 / 196) * pl.h - pl.gy;
    b.style.left = Math.max(-40, pl.left + pl.gx + dx * Math.cos(a) - dy * Math.sin(a)) + 'px';
    b.style.top = (pl.top + pl.gy + dx * Math.sin(a) + dy * Math.cos(a) - 4) + 'px';
    // never float off the screen: keep the whole bubble 8px inside the edges
    var boxLeft = box.getBoundingClientRect().left, half = b.offsetWidth / 2;
    var centre = boxLeft + parseFloat(b.style.left), min = 8 + half, max = window.innerWidth - 8 - half;
    b.style.left = (Math.min(Math.max(centre, min), Math.max(min, max)) - boxLeft) + 'px';
    clearTimeout(b._t);
    b.classList.add('show');
    if (!stay) b._t = setTimeout(function () { b.classList.remove('show'); }, 3000);
  }

  // ===== Share pictures: draw the sticker on a canvas next to a round face (cx, cy, radius) =====
  async function drawOnCanvas(x, saved, cx, cy, radius) {
    var r = resolve(saved);
    if (!r) return;
    var pl = place(radius * 2);
    var img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(r, { sticker: true, glove: true })
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
      .replace('width="100%" height="100%"', 'width="' + Math.round(pl.w * 2) + '" height="' + Math.round(pl.h * 2) + '"'));
    try { await img.decode(); } catch (e) { return; }
    x.save();
    x.translate(cx - radius + pl.left + pl.gx, cy - radius + pl.top + pl.gy);
    x.rotate(pl.angle * Math.PI / 180);
    x.drawImage(img, -pl.gx, -pl.gy, pl.w, pl.h);
    x.restore();
  }

  // ===== 📷 A doodle from a photo: the phone finds the main colours (the photo never leaves the phone) =====
  function hex(rgb) { return '#' + rgb.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function dist(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); }
  function fromHex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  // Biggest colour groups inside a part of the picture (fractions of width/height)
  function groups(data, w, h, x0, x1, y0, y1) {
    var b = {};
    for (var y = Math.floor(y0 * h); y < y1 * h; y++) for (var x = Math.floor(x0 * w); x < x1 * w; x++) {
      var i = (y * w + x) * 4, k = (data[i] >> 5) + '-' + (data[i + 1] >> 5) + '-' + (data[i + 2] >> 5);
      var g = b[k] || (b[k] = { n: 0, s: [0, 0, 0] });
      g.n++; g.s[0] += data[i]; g.s[1] += data[i + 1]; g.s[2] += data[i + 2];
    }
    return Object.keys(b).map(function (k) { var g = b[k]; return { n: g.n, rgb: [g.s[0] / g.n, g.s[1] / g.n, g.s[2] / g.n] }; })
      .sort(function (a, c) { return c.n - a.n; });
  }
  function photoColours(file) {
    return new Promise(function (done, fail) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var w = 60, h = Math.max(20, Math.round(60 * img.height / img.width));
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var d = x.getImageData(0, 0, w, h).data;
        var face = groups(d, w, h, 0.25, 0.75, 0.15, 0.45)[0].rgb;
        var band = groups(d, w, h, 0.46, 0.54, 0.15, 0.5)[0].rgb;
        var bottom = groups(d, w, h, 0.35, 0.65, 0.5, 0.62)[0].rgb;
        var palette = [];
        groups(d, w, h, 0.15, 0.85, 0.08, 0.7).forEach(function (g) {
          if (palette.length < 8 && palette.every(function (p) { return dist(p, g.rgb) > 60; })) palette.push(g.rgb);
        });
        done({
          palette: palette.map(hex),
          c: [hex(face), dist(band, face) > 70 ? hex(band) : null, dist(bottom, face) > 70 ? hex(bottom) : null]
        });
      };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error("Couldn't read that photo. Try another one.")); };
      img.src = url;
    });
  }

  PadPal.racket = {
    SHAPES: SHAPES, list: list, byId: byId, resolve: resolve, label: label, svg: svg,
    attach: attach, press: press, drawOnCanvas: drawOnCanvas, photoColours: photoColours, fromHex: fromHex
  };
})();
