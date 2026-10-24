// PadPal shot ratings: "Rate your co-players" pop-up, used by Play and Feed.
// Needs auth.js first. Call PadPal.openRating([member ids]).
(function () {
  var SHOTS = ['Bandeja', 'Víbora', 'Smash', 'Por 3 / Por 4', 'Chiquita', 'Lob', 'Bajada', 'Rulo', 'Volley', 'Wall exit'];
  var db = PadPal.db;
  var list = [];       // [{ p: member, max: 7|10, done: [shots rated today], picks: { shot: rating } }]

  // The pop-up lives in its own elements, so any page can use it
  var backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.style.zIndex = '64';     // above the score tracker
  var sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.style.zIndex = '65';
  sheet.innerHTML = '<div class="grab"></div><div class="rate-body"></div>';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
  });
  var body = sheet.querySelector('.rate-body');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function today() { return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); }  // YYYY-MM-DD
  function close() { sheet.classList.remove('open'); backdrop.classList.remove('open'); }
  backdrop.addEventListener('click', close);

  async function openRating(ids) {
    body.innerHTML = '<p class="meta">Loading…</p>';
    sheet.classList.add('open');
    backdrop.classList.add('open');
    var who = await PadPal.me;
    var me = who.profile;
    var members = await PadPal.members();
    var r = await db.from('shot_ratings').select('ratee_id, shot').eq('rater_id', me.id).eq('day', today());
    var doneBy = {};
    (r.data || []).forEach(function (x) { (doneBy[x.ratee_id] = doneBy[x.ratee_id] || []).push(x.shot); });
    list = ids.filter(function (id) { return id !== me.id; }).map(function (id) {
      var p = members.filter(function (m) { return m.id === id; })[0] || { id: id, username: '?', points: 0 };
      return { p: p, max: Number(p.points) >= 501 ? 10 : 7, done: doneBy[id] || [], picks: {} };
    });
    render();
  }

  function render() {
    var html = '<h3>🎯 Rate their shots</h3>' +
      '<p class="meta" style="margin:-6px 0 12px">Pick up to 3 shots per player and give each a rating. Each rating is worth a tiny bit of points (rating × 0.1). Be fair! 😇</p>';
    list.forEach(function (x, i) {
      var picked = Object.keys(x.picks);
      var left = 3 - x.done.length - picked.length;
      var t = PadPal.tierOf(x.p.points);
      html += '<div class="card rate-card">' +
        '<div class="name">' + esc(x.p.display_name || x.p.username) + ' <span class="pill">' + t.icon + ' ' + t.name + '</span></div>' +
        '<div class="meta">Scale 1–' + x.max + (x.done.length ? ' · already rated today: ' + x.done.map(esc).join(', ') : '') + '</div>' +
        (x.done.length >= 3
          ? '<p class="meta" style="margin:8px 0 0">✅ You rated 3 shots of this player today.</p>'
          : '<div class="pick" style="margin-top:8px">' + SHOTS.map(function (s) {
              var on = x.picks[s] !== undefined;
              var off = x.done.indexOf(s) > -1 || (!on && left <= 0);
              return '<button class="' + (on ? 'on' : '') + '" data-rshot="' + i + '|' + s + '"' + (off ? ' disabled style="opacity:.35"' : '') + '>' + s + '</button>';
            }).join('') + '</div>' +
            picked.map(function (s) {
              var stars = '';
              for (var v = 1; v <= x.max; v++) {
                stars += '<button class="rate-num' + (x.picks[s] === v ? ' on' : '') + '" data-rval="' + i + '|' + s + '|' + v + '">' + v + '</button>';
              }
              return '<div class="rate-row"><span>' + s + '</span><div class="rate-nums">' + stars + '</div></div>';
            }).join('')) +
        '</div>';
    });
    var ready = list.some(function (x) { return Object.keys(x.picks).some(function (s) { return x.picks[s] > 0; }); });
    html += '<button class="btn btn-primary" style="width:100%;margin-top:6px" data-rsend="1"' + (ready ? '' : ' disabled') + '>Send ratings</button>' +
      '<button class="btn btn-ghost" style="width:100%;margin-top:8px" data-rclose="1">Later</button>';
    body.innerHTML = html;
  }

  async function send(btn) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
    var sent = 0, errors = [];
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      var shots = Object.keys(x.picks).filter(function (s) { return x.picks[s] > 0; });
      if (!shots.length) continue;
      var r = await db.rpc('rate_shots', { p_ratee: x.p.id, p_shots: shots, p_ratings: shots.map(function (s) { return x.picks[s]; }) });
      if (r.error) errors.push((x.p.display_name || x.p.username) + ': ' + PadPal.friendlyError(r.error));
      else sent += shots.length;
    }
    close();
    var t = document.getElementById('toast');
    var msg = errors.length ? '⚠️ ' + errors[0] : '🎯 ' + sent + ' rating' + (sent === 1 ? '' : 's') + ' sent. Thanks!';
    if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 3000); }
  }

  sheet.addEventListener('click', function (e) {
    var el = e.target.closest('[data-rshot],[data-rval],[data-rsend],[data-rclose]');
    if (!el) return;
    e.stopPropagation();
    if (el.dataset.rshot) {
      var a = el.dataset.rshot.split('|'), x = list[+a[0]];
      if (x.picks[a[1]] !== undefined) delete x.picks[a[1]]; else x.picks[a[1]] = 0;
      render();
    } else if (el.dataset.rval) {
      var b = el.dataset.rval.split('|');
      list[+b[0]].picks[b[1]] = +b[2];
      render();
    } else if (el.dataset.rsend) send(el);
    else if (el.dataset.rclose) close();
  });

  PadPal.SHOTS = SHOTS;
  PadPal.openRating = openRating;
})();
