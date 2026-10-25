// =====================================================================
// PadPal · 📤 share pictures (Instagram / WhatsApp stories, 1080 × 1920)
// Match results, session podiums, shot radar, profile card, feed posts.
// Every picture has the PadPal logo and "Padel with friends · Exclusive Club".
// Needs auth.js first. Uses the iPhone share menu (or downloads on a computer).
// =====================================================================
(function () {
  var W = 1080, H = 1920;
  var NAVY = '#0F1E3C', DEEP = '#0B1426', LIME = '#C9E52C', GOLD = '#F2C14E', WHITE = '#FFFFFF', SOFT = 'rgba(255,255,255,.65)';
  var FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  var TAGLINE = 'PadPal · Padel with friends · Exclusive Club';

  function font(weight, size, italic) { return (italic ? 'italic ' : '') + weight + ' ' + size + 'px ' + FONT; }

  // A blank story with background, logo and footer; returns { c, x }
  async function canvas(accent) {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, accent || '#1F3566'); g.addColorStop(0.45, NAVY); g.addColorStop(1, DEEP);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    try {
      var logo = new Image();
      logo.src = 'logo-dark.svg';
      await logo.decode();
      x.drawImage(logo, 465, 110, 150, 150);
    } catch (e) {}
    x.textAlign = 'center';
    x.fillStyle = LIME; x.font = font(800, 54);
    x.fillText('PADPAL', W / 2, 330);
    // footer
    x.fillStyle = 'rgba(201,229,44,.15)';
    roundRect(x, 90, H - 190, W - 180, 100, 50); x.fill();
    x.fillStyle = LIME; x.font = font(700, 36);
    x.fillText(TAGLINE, W / 2, H - 127);
    return { c: c, x: x };
  }

  function roundRect(x, l, t, w, h, r) {
    x.beginPath();
    x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r);
    x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath();
  }
  // Text that wraps inside a width; returns the y after the last line
  function wrap(x, text, cx, y, maxW, lineH, maxLines) {
    var words = String(text || '').split(/\s+/), line = '', lines = 0;
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (x.measureText(test).width > maxW && line) {
        if (maxLines && lines === maxLines - 1) { x.fillText(line + '…', cx, y); return y + lineH; }
        x.fillText(line, cx, y); y += lineH; lines++; line = words[i];
      } else line = test;
    }
    if (line) { x.fillText(line, cx, y); y += lineH; }
    return y;
  }
  // A round "avatar" with the first letter (friends' photos stay private)
  function face(x, name, cx, cy, r, color) {
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2);
    x.fillStyle = '#1A2A48'; x.fill();
    x.lineWidth = Math.max(4, r / 8); x.strokeStyle = color || LIME; x.stroke();
    x.fillStyle = WHITE; x.font = font(800, r); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText((name || '?')[0].toUpperCase(), cx, cy + 2);
    x.textBaseline = 'alphabetic';
  }
  function chg(n) { var v = Math.round((Number(n) || 0) * 10) / 10; return v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '±0'; }
  function dateText(iso) { return iso ? new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : ''; }

  // Open the share menu with the picture (or download it on a computer)
  function send(c, name, text) {
    return new Promise(function (done) {
      c.toBlob(async function (blob) {
        var file = new File([blob], name + '.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], text: text || 'Padel with friends 🎾 #PadPal' }); }
          catch (e) {}
          return done('shared');
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        done('downloaded');
      }, 'image/png');
    });
  }

  // ===== 🏆 Match result =====
  // m = { a: [name, name], b: [name, name], sets: [[6,4],[6,3]], winner: 'a'|'b', when, place, changes: [[name, +2.5], …] }
  async function match(m) {
    var k = await canvas('#1F3566'), x = k.x;
    x.fillStyle = SOFT; x.font = font(600, 46);
    x.fillText('🎾 MATCH RESULT', W / 2, 470);
    var win = m.winner === 'b' ? 'b' : 'a', lose = win === 'a' ? 'b' : 'a';
    function team(names, y, won) {
      x.fillStyle = won ? 'rgba(201,229,44,.16)' : 'rgba(255,255,255,.06)';
      roundRect(x, 90, y, W - 180, 300, 40); x.fill();
      face(x, names[0], 230, y + 150, 70, won ? LIME : '#7A8599');
      face(x, names[1], 380, y + 150, 70, won ? LIME : '#7A8599');
      x.textAlign = 'left'; x.fillStyle = WHITE; x.font = font(800, 54);
      x.fillText((won ? '🏆 ' : '') + names[0], 480, y + 125);
      x.fillText(names[1], 480, y + 200);
      x.textAlign = 'center';
    }
    team(m[win], 540, true);
    team(m[lose], 1000, false);
    // the score between the teams
    var sets = (m.sets || []).map(function (s) { return win === 'a' ? s[0] + '-' + s[1] : s[1] + '-' + s[0]; }).join('   ');
    x.fillStyle = WHITE; x.font = font(900, 110);
    x.fillText(sets, W / 2, 950);
    var y = 1400;
    if (m.changes && m.changes.length) {
      x.font = font(600, 40); x.fillStyle = SOFT;
      x.fillText(m.changes.map(function (c) { return c[0].split(' ')[0] + ' ' + chg(c[1]); }).join('  ·  '), W / 2, y);
      y += 70;
    }
    x.fillStyle = SOFT; x.font = font(500, 40);
    x.fillText(dateText(m.when) + (m.place ? ' · 📍 ' + m.place : ''), W / 2, y + 20);
    return send(k.c, 'padpal-match', '🏆 ' + m[win].join(' & ') + ' won ' + sets + ' #PadPal');
  }

  // ===== 🥇 Session podium =====
  // s = { title, top: [{ name, total, place, change }], me: { name, place, n, total, w, l, d } | null, when, place }
  async function session(s) {
    var k = await canvas('#5E7A00'), x = k.x;
    x.fillStyle = SOFT; x.font = font(600, 46);
    x.fillText(s.title.toUpperCase(), W / 2, 470);
    var slots = [[s.top[1], 230, 1050, 260, '#C9D1DB'], [s.top[0], 540, 930, 380, GOLD], [s.top[2], 850, 1110, 200, '#D9A066']];
    slots.forEach(function (sl) {
      var p = sl[0];
      if (!p) return;
      face(x, p.name, sl[1], sl[2] - 260, 90, sl[4]);
      x.fillStyle = WHITE; x.font = font(800, 44);
      x.fillText(p.name.split(' ')[0], sl[1], sl[2] - 130);
      x.fillStyle = SOFT; x.font = font(600, 34);
      if (p.total !== '' && p.total != null) x.fillText(p.total + ' pts', sl[1], sl[2] - 85);
      x.fillStyle = sl[4];
      roundRect(x, sl[1] - 140, sl[2] - 50, 280, sl[3], 24); x.fill();
      x.fillStyle = NAVY; x.font = font(900, 110);
      x.fillText(['🥇', '🥈', '🥉'][p.place - 1] || String(p.place), sl[1], sl[2] + 90);
    });
    var y = 1450;
    if (s.me) {
      x.fillStyle = 'rgba(255,255,255,.08)';
      roundRect(x, 90, y - 70, W - 180, 170, 40); x.fill();
      x.fillStyle = WHITE; x.font = font(800, 48);
      x.fillText(s.me.name.split(' ')[0] + ': ' + ordinal(s.me.place) + ' of ' + s.me.n + ' · ' + s.me.total + ' pts', W / 2, y);
      x.fillStyle = SOFT; x.font = font(600, 38);
      x.fillText(s.me.w + 'W ' + s.me.l + 'L' + (s.me.d ? ' ' + s.me.d + 'D' : ''), W / 2, y + 60);
      y += 150;
    }
    x.fillStyle = SOFT; x.font = font(500, 40);
    x.fillText(dateText(s.when) + (s.place ? ' · 📍 ' + s.place : ''), W / 2, y + 40);
    return send(k.c, 'padpal-session', '🥇 ' + s.title + ' on PadPal #PadPal');
  }
  function ordinal(n) { return n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'); }

  // ===== 🎯 Shot radar =====
  // r = { name, shots: [[shot, value]], max, best: [shot, avg] | null, ratings }
  async function radar(r) {
    var k = await canvas('#7E6AA8'), x = k.x;
    x.fillStyle = SOFT; x.font = font(600, 46);
    x.fillText('🎯 ' + r.name.toUpperCase() + '\'S SHOTS', W / 2, 470);
    var cx = W / 2, cy = 960, R = 330, n = r.shots.length;
    function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v / r.max, cy + Math.sin(a) * R * v / r.max]; }
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      x.beginPath();
      r.shots.forEach(function (s, i) { var p = pt(i, f * r.max); if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); });
      x.closePath(); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 3; x.stroke();
    });
    x.beginPath();
    r.shots.forEach(function (s, i) { var p = pt(i, s[1]); if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); });
    x.closePath(); x.fillStyle = 'rgba(201,229,44,.35)'; x.fill(); x.strokeStyle = LIME; x.lineWidth = 8; x.stroke();
    r.shots.forEach(function (s, i) {
      var p = pt(i, r.max * 1.27);
      x.fillStyle = WHITE; x.font = font(700, 40);
      x.fillText(s[0], p[0], p[1]);
      x.fillStyle = LIME; x.font = font(800, 40);
      x.fillText(s[1] ? s[1].toFixed(1) : '–', p[0], p[1] + 48);
    });
    x.fillStyle = WHITE; x.font = font(800, 56);
    if (r.best) x.fillText('My best shot: ' + r.best[0] + ' ' + r.best[1].toFixed(1), W / 2, 1480);
    x.fillStyle = SOFT; x.font = font(500, 40);
    x.fillText('Rated by friends · scale 1–' + r.max + ' · ' + r.ratings + ' rating' + (r.ratings === 1 ? '' : 's'), W / 2, 1560);
    return send(k.c, 'padpal-shots', '🎯 My padel shots on PadPal #PadPal');
  }

  // ===== 📊 Profile card =====
  // p = { name, handle, tier: {icon,name,color}, title, points, matches, w, l, d, rate, streak, badges: [[icon, text]], flair }
  async function profile(p) {
    var k = await canvas(p.tier.color), x = k.x;
    face(x, p.name, W / 2, 620, 150, p.tier.color);
    x.fillStyle = WHITE; x.font = font(900, 84);
    x.fillText(p.name + (p.flair ? ' ' + p.flair : ''), W / 2, 880);
    x.fillStyle = SOFT; x.font = font(500, 42);
    x.fillText('@' + p.handle, W / 2, 945);
    x.fillStyle = GOLD; x.font = font(600, 46, true);
    x.fillText(p.tier.icon + ' ' + p.tier.name + ' · "' + p.title + '"', W / 2, 1030);
    var stats = [[PadPal.fmt(p.points), 'points'], [p.matches, 'matches'], [p.rate, 'win rate'], [p.w + '-' + p.l + (p.d ? '-' + p.d : ''), p.d ? 'W-L-D' : 'W-L']];
    stats.forEach(function (s, i) {
      var cx = 90 + (W - 180) / 4 * (i + 0.5);
      x.fillStyle = 'rgba(255,255,255,.08)';
      roundRect(x, cx - 105, 1110, 210, 190, 30); x.fill();
      x.fillStyle = WHITE; x.font = font(900, 58);
      x.fillText(String(s[0]), cx, 1210);
      x.fillStyle = SOFT; x.font = font(500, 32);
      x.fillText(s[1], cx, 1260);
    });
    var y = 1400;
    (p.badges || []).slice(0, 3).forEach(function (b) {
      x.fillStyle = 'rgba(201,229,44,.12)';
      roundRect(x, 140, y - 62, W - 280, 90, 45); x.fill();
      x.fillStyle = WHITE; x.font = font(700, 42);
      x.fillText(b[0] + ' ' + b[1], W / 2, y);
      y += 110;
    });
    return send(k.c, 'padpal-profile', p.tier.icon + ' ' + p.name + ' on PadPal #PadPal');
  }

  // ===== 📰 Feed post (photo or text) =====
  // p = { name, text, photoUrl, when }
  async function post(p) {
    var k = await canvas('#1F3566'), x = k.x;
    face(x, p.name, 170, 480, 60, LIME);
    x.textAlign = 'left'; x.fillStyle = WHITE; x.font = font(800, 50);
    x.fillText(p.name, 260, 470);
    x.fillStyle = SOFT; x.font = font(500, 36);
    x.fillText(dateText(p.when), 260, 520);
    x.textAlign = 'center';
    var y = 640;
    if (p.photoUrl) {
      try {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = p.photoUrl;
        await img.decode();
        var bw = W - 180, bh = Math.min(900, bw * img.height / img.width);
        x.save(); roundRect(x, 90, y, bw, bh, 40); x.clip();
        var scale = Math.max(bw / img.width, bh / img.height);
        x.drawImage(img, 90 + (bw - img.width * scale) / 2, y + (bh - img.height * scale) / 2, img.width * scale, img.height * scale);
        x.restore();
        y += bh + 80;
      } catch (e) { y += 20; }
    }
    if (p.text) {
      x.fillStyle = WHITE; x.font = font(700, p.photoUrl ? 46 : 64);
      wrap(x, '“' + p.text + '”', W / 2, y + (p.photoUrl ? 20 : 200), W - 220, p.photoUrl ? 62 : 86, p.photoUrl ? 3 : 8);
    }
    return send(k.c, 'padpal-post', p.text ? p.text.slice(0, 80) + ' #PadPal' : '#PadPal');
  }

  PadPal.share = { match: match, session: session, radar: radar, profile: profile, post: post, TAGLINE: TAGLINE };
})();
