// =====================================================================
// PadPal · levels: what each level means, its rewards (looks only, never points)
// and the level-up celebration. Needs auth.js first. Used on every members page.
//
//  • Avatars with data-uid="<member id>" get a ring in their level's colour,
//    and a special frame from 🥈 Pro up
//  • Names with data-uid get gold for 👑 Legends
//  • The first time you open the app after levelling up: confetti 🎊
// =====================================================================
(function () {
  var COSTS = '😓 Losses and 🧊 not playing cost points';
  // keep the emojis in sync with 17_levels.sql
  var INFO = {
    'First Timer': { title: 'Still finding the court', emojis: ['🐣'], frame: null,
      rules: ['🛡️ You never lose points', '🧊 Not playing costs nothing', '🚀 Double gains in your first 10 match days'] },
    'Newbie':   { title: 'Knows the walls exist', emojis: ['🌱', '😎'], frame: null,
      rules: ['⚠️ From here on: ' + COSTS + ' (−1 a week, −2 from week 4)'] },
    'Beginner': { title: 'Bandeja in training', emojis: ['🔥', '🎾'], frame: null, rules: [COSTS] },
    'Amateur':  { title: 'Dangerous on a good day', emojis: ['⚡', '💪'], frame: null, rules: [COSTS] },
    'Junior':   { title: 'Club regular', emojis: ['🦾', '🚀'], frame: null,
      rules: [COSTS, '🛑 Normal games stop giving points at 500', '🏆 At 500 points: official tournaments unlock (your way to 🥈 Pro)'] },
    'Pro':      { title: 'The real deal', emojis: ['🥷', '🎯'], frame: 'frame-pro',
      rules: [COSTS, '🏆 Official tournaments are the only way up from here', '🎯 Friends rate your shots 1–10 (instead of 1–7)', '🖼️ Silver profile frame'] },
    'Pro-Star': { title: 'Shining', emojis: ['💎', '🦅'], frame: 'frame-prostar',
      rules: [COSTS, '🏆 Climb with official tournaments', '🖼️ Glowing orange frame'] },
    'Star':     { title: 'Crowd favourite', emojis: ['⭐', '🌟'], frame: 'frame-star',
      rules: [COSTS, '🏆 Climb with official tournaments', '🖼️ Gold frame'] },
    'Legend':   { title: 'Living legend', emojis: ['👑', '🐐'], frame: 'frame-legend',
      rules: [COSTS, '🖼️ Animated Legend frame', '✨ Gold name everywhere in PadPal'] }
  };
  var FRAMES = ['frame-pro', 'frame-prostar', 'frame-star', 'frame-legend'];

  function info(tier) { return INFO[tier.name] || { title: '', emojis: [], rules: [] }; }
  function indexOf(tier) { return PadPal.TIERS.indexOf(tier); }

  // Every emoji with the level that unlocks it: [{ emoji, tier, open }]
  function emojiList(points) {
    var list = [];
    PadPal.TIERS.forEach(function (t) {
      info(t).emojis.forEach(function (e) { list.push({ emoji: e, tier: t, open: Number(points || 0) >= t.min }); });
    });
    return list;
  }

  // "about 36 wins at your level": a win vs your level = +2, showing up = +0.5,
  // doubled in your first 10 match days
  function nextStep(profile) {
    var pts = Number(profile.points) || 0;
    var next = PadPal.nextTier(pts);
    if (!next) return { next: null, text: '👑 Top of the ladder!', short: '👑 Top of the ladder!' };
    var gap = Math.max(0.5, Math.round((next.min - pts) * 10) / 10);
    if (pts >= 500) return { next: next, gap: gap, text: 'Next: ' + next.icon + ' ' + next.name + ', ' + PadPal.fmt(gap) + ' pts away · via 🏆 official tournaments',
                             short: '🏆 From here you climb with official tournaments' };
    var perWin = (Number(profile.match_days) || 0) < 10 ? 5 : 2.5;
    var casualGap = Math.min(next.min, 500) - pts;
    var wins = Math.max(1, Math.ceil(casualGap / perWin));
    var winsText = 'about ' + wins + ' win' + (wins === 1 ? '' : 's') + ' at your level' + (next.min > 500 ? ', then 🏆 tournaments' : '');
    return { next: next, gap: gap, wins: wins,
      text: 'Next: ' + next.icon + ' ' + next.name + ', ' + PadPal.fmt(gap) + ' pts away · ' + winsText,
      short: '🎯 That\'s ' + winsText };
  }
  // How far you are inside your level, 0–100 (same bar on Profile and Road)
  function progress(points) {
    var pts = Number(points) || 0;
    var t = PadPal.tierOf(pts), next = PadPal.nextTier(pts);
    if (!next || pts >= 500 && t.name === 'Junior') return 100;
    return Math.max(2, Math.min(100, Math.round((pts - t.min) / (next.min - t.min) * 100)));
  }
  // The rule behind "about N wins", written once
  var WINS_NOTE = 'Counted as +2 for a win against your level and +0.5 for showing up, doubled in your first 10 match days.';

  // ===== Rings, frames and gold names =====
  var pointsOf = {};   // member id → points
  function setPoints(id, points) { pointsOf[id] = Number(points) || 0; }
  function apply(el) {
    var p = pointsOf[el.getAttribute('data-uid')];
    if (p === undefined) return;
    var t = PadPal.tierOf(p);
    if (el.classList.contains('avatar')) {
      el.style.borderColor = t.color;
      FRAMES.forEach(function (f) { el.classList.remove(f); });
      if (info(t).frame) el.classList.add(info(t).frame);
    } else {
      el.classList.toggle('legend-name', t.name === 'Legend');
    }
  }
  function paint(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.hasAttribute && root.hasAttribute('data-uid')) apply(root);
    root.querySelectorAll('[data-uid]').forEach(apply);
  }

  // ===== 🎉 Level-up celebration =====
  function celebrate(tier, profile) {
    var i = info(tier);
    var box = document.createElement('div');
    box.className = 'lvl-up';
    box.innerHTML = '<canvas class="lvl-confetti"></canvas><div class="lvl-card">' +
      '<div class="lvl-kicker">LEVEL UP!</div>' +
      '<div class="lvl-icon" style="background:' + tier.color + '">' + tier.icon + '</div>' +
      '<div class="lvl-name">' + tier.name + '</div><div class="lvl-title">"' + i.title + '"</div>' +
      '<div class="lvl-unlocks"><b>You unlocked</b>' +
        '<div>😀 Profile emoji: ' + i.emojis.join(' ') + '</div>' +
        i.rules.filter(function (r) { return r !== COSTS; }).map(function (r) { return '<div>' + r + '</div>'; }).join('') + '</div>' +
      '<button class="btn btn-accent lvl-share">📸 Share</button>' +
      '<button class="btn btn-primary lvl-go">Let\'s go! 🎾</button>' +
      '<a class="lvl-road" href="road.html">See the Road to Legend ›</a></div>';
    document.body.appendChild(box);
    confetti(box.querySelector('canvas'));
    box.querySelector('.lvl-go').addEventListener('click', function () { box.remove(); });
    box.querySelector('.lvl-share').addEventListener('click', function () { shareCard(tier, profile); });
  }

  function confetti(canvas) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width = innerWidth, H = canvas.height = innerHeight;
    var colors = ['#C9E52C', '#F2C14E', '#FFFFFF', '#5FD68C', '#3B6FD8', '#F0645A'];
    var bits = [];
    for (var k = 0; k < 160; k++) bits.push({ x: Math.random() * W, y: -Math.random() * H, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, c: colors[k % colors.length] });
    var start = Date.now();
    (function frame() {
      if (!canvas.isConnected) return;
      ctx.clearRect(0, 0, W, H);
      bits.forEach(function (b) {
        b.y += b.vy; b.x += b.vx; b.r += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
      });
      if (Date.now() - start < 5000) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })();
  }

  // A picture for Instagram Stories: "I reached ⚡ Amateur on PadPal!"
  async function shareCard(tier, profile) {
    var c = document.createElement('canvas');
    c.width = 1080; c.height = 1920;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, tier.color); g.addColorStop(0.55, '#0F1E3C'); g.addColorStop(1, '#0B1426');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
    try {
      var logo = new Image();
      logo.src = 'logo-dark.svg';
      await logo.decode();
      x.drawImage(logo, 440, 140, 200, 200);
    } catch (e) {}
    x.textAlign = 'center';
    x.fillStyle = '#C9E52C'; x.font = '800 64px system-ui, -apple-system, sans-serif';
    x.fillText('PADPAL', 540, 420);
    x.fillStyle = '#FFFFFF'; x.font = '600 60px system-ui, -apple-system, sans-serif';
    x.fillText('I reached', 540, 680);
    x.font = '360px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    x.fillText(tier.icon, 540, 1080);
    x.font = '900 130px system-ui, -apple-system, sans-serif';
    x.fillText(tier.name, 540, 1290);
    x.fillStyle = '#F2C14E'; x.font = 'italic 600 56px system-ui, -apple-system, sans-serif';
    x.fillText('"' + info(tier).title + '"', 540, 1390);
    x.fillStyle = '#FFFFFF'; x.font = '600 52px system-ui, -apple-system, sans-serif';
    x.fillText((profile.display_name || profile.username) + ' · ' + PadPal.fmt(profile.points) + ' pts', 540, 1620);
    x.fillStyle = '#C9E52C'; x.font = '700 36px system-ui, -apple-system, sans-serif';
    x.fillText('PadPal · Padel with friends · Exclusive Club', 540, 1793);
    c.toBlob(async function (blob) {
      var file = new File([blob], 'padpal-' + tier.name.toLowerCase().replace(/\W+/g, '-') + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text: 'I reached ' + tier.icon + ' ' + tier.name + ' on PadPal! 🎾' }); return; }
        catch (e) { if (e.name === 'AbortError') return; }
      }
      var a = document.createElement('a');       // computers: save the picture instead
      a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
    }, 'image/png');
  }

  // Remember the highest level this phone has seen; celebrate when it goes up
  function checkLevelUp(profile) {
    var key = 'padpal_tier_' + profile.id;
    var now = indexOf(PadPal.tierOf(profile.points));
    var seen = null;
    try { seen = localStorage.getItem(key); } catch (e) {}
    try { localStorage.setItem(key, String(now)); } catch (e) {}
    if (seen !== null && now > Number(seen)) celebrate(PadPal.TIERS[now], profile);
  }

  // ===== Start on every members page =====
  document.addEventListener('DOMContentLoaded', function () {
    Promise.resolve(PadPal.me).then(async function (me) {
      if (!me || !me.profile) return;
      setPoints(me.profile.id, me.profile.points);
      try { (await PadPal.members()).forEach(function (m) { setPoints(m.id, m.points); }); } catch (e) {}
      paint(document.body);
      new MutationObserver(function (list) {
        list.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) paint(n); }); });
      }).observe(document.body, { childList: true, subtree: true });
      checkLevelUp(me.profile);
    });
  });

  PadPal.levels = { INFO: INFO, COSTS: COSTS, WINS_NOTE: WINS_NOTE, info: info, emojiList: emojiList, nextStep: nextStep, progress: progress,
                    setPoints: setPoints, paint: paint, celebrate: celebrate, shareCard: shareCard };
})();
