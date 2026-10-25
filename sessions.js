// =====================================================================
// PadPal · session results, shared by Play, Feed and Profile
// Draws the 🥇🥈🥉 podium, the final standings and every round's scores
// from a game's session_state (+ everyone's points change).
// =====================================================================
(function () {
  var KINDS = { americano: '🔄 Americano', mexicano: '🌮 Mexicano', mixicano: '🔀 Mixicano', team_americano: '🤝 Team Americano',
                round_robin: '⭕ Round Robin', king: '👑 King of the Court', match: '🎾 Match' };
  var REASONS = { injured: ['🤕', 'Injured'], sick: ['🤒', 'Sick'], tired: ['😴', 'Tired'], left: ['🏃', 'Had to leave'], other: ['🤷', 'Other'] };
  var MEDALS = ['🥇', '🥈', '🥉'];

  // Everyone's final result: place (ties share a place), total, games won/lost, points change
  // changes = { user id → points change } (optional)
  function rows(state, changes) {
    var s = state || {};
    var players = s.players || [];
    var wl = {};
    players.forEach(function (id) { wl[id] = { w: 0, l: 0 }; });
    (s.rounds || []).forEach(function (r) {
      (r.matches || []).forEach(function (m) {
        if (!m.score) return;
        var aWon = m.score[0] > m.score[1], bWon = m.score[1] > m.score[0];
        m.a.forEach(function (id) { if (!wl[id]) return; if (aWon) wl[id].w++; else if (bWon) wl[id].l++; });
        m.b.forEach(function (id) { if (!wl[id]) return; if (bWon) wl[id].w++; else if (aWon) wl[id].l++; });
      });
    });
    var list = players.map(function (id) {
      var c = changes && changes[id];
      return { id: id, total: (s.points || {})[id] || 0, played: (s.played || {})[id] || 0, w: wl[id].w, l: wl[id].l,
               out: s.out && s.out[id] || null, change: c == null ? null : Number(c) };
    }).sort(function (a, b) { return b.total - a.total; });
    list.forEach(function (x, i) { x.place = i > 0 && x.total === list[i - 1].total ? list[i - 1].place : i + 1; });
    return list;
  }

  function ordinal(n) { return n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'); }
  function medal(place) { return MEDALS[place - 1] || place; }
  function chg(c) { return c == null ? '' : '<span class="chg ' + (c >= 0 ? 'plus' : 'minus') + '">' + PadPal.fmtChange(c) + '</span>'; }

  // Top 3 on a podium: 2nd · 1st · 3rd. nameFn(id) and avatarFn(id) return safe HTML.
  function podium(list, nameFn, avatarFn) {
    var top = list.slice(0, 3);
    if (top.length < 3) return '';
    var order = [[top[1], 'p2'], [top[0], 'p1'], [top[2], 'p3']];
    return '<div class="s-podium">' + order.map(function (o) {
      var x = o[0];
      return '<div class="col ' + o[1] + '"><div class="avatar">' + avatarFn(x.id) + '</div>' +
        '<div class="nm">' + nameFn(x.id) + '</div><div class="sc">' + x.total + ' pts' + (x.change != null ? ' · ' + PadPal.fmtChange(x.change) : '') + '</div>' +
        '<div class="block">' + medal(x.place) + '</div></div>';
    }).join('') + '</div>';
  }

  // Full standings; meId gets highlighted
  function table(list, nameFn, meId) {
    return list.map(function (x) {
      var why = x.out ? ' ' + (REASONS[x.out.reason] || REASONS.other)[0] : '';
      return '<div class="s-row' + (x.id === meId ? ' me' : '') + '"><span class="pos">' + medal(x.place) + '</span>' +
        '<div class="who">' + nameFn(x.id) + why + '<small>' + x.w + 'W ' + x.l + 'L · ' + x.played + ' game' + (x.played === 1 ? '' : 's') +
        (x.out ? ' · ' + (REASONS[x.out.reason] || REASONS.other)[1].toLowerCase() + ' from round ' + x.out.round : '') + '</small></div>' +
        '<span class="num">' + x.total + '</span>' + chg(x.change) + '</div>';
    }).join('');
  }

  // Every round with every court's score
  function rounds(state, nameFn) {
    return (state.rounds || []).map(function (r, i) {
      return '<div class="s-round"><b>Round ' + (i + 1) + '</b>' + (r.matches || []).map(function (m) {
        return '<div class="m"><span>' + m.a.map(nameFn).join(' & ') + ' <small class="meta">vs</small> ' + m.b.map(nameFn).join(' & ') + '</span>' +
          '<span>' + (m.score ? m.score[0] + '–' + m.score[1] : '–') + '</span></div>';
      }).join('') + (r.resting && r.resting.length ? '<div class="meta" style="font-size:11px">🪑 ' + r.resting.map(nameFn).join(', ') + '</div>' : '') + '</div>';
    }).join('');
  }

  // Everything about one finished session, for a pop-up sheet
  function detail(game, changes, nameFn, avatarFn, meId) {
    var s = game.session_state;
    if (!s || !s.players) return '<p class="meta">This session has no saved rounds.</p>';
    var list = rows(s, changes);
    var when = new Date(game.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return '<h3>' + (KINDS[game.kind] || '🔄 Session') + '</h3>' +
      '<p class="meta" style="margin:-6px 0 12px">' + when + (game.place ? ' · 📍 ' + PadPal.esc(game.place) : '') +
        ' · ' + s.players.length + ' players · ' + (s.rounds || []).length + ' rounds</p>' +
      podium(list, nameFn, avatarFn) +
      '<div class="card" style="padding:4px 12px;margin-bottom:12px">' + table(list, nameFn, meId) + '</div>' +
      '<div class="label" style="font-size:13px;color:var(--text-2);font-weight:600;margin-bottom:6px">All rounds</div>' +
      '<div class="card" style="padding:4px 12px">' + rounds(s, nameFn) + '</div>';
  }

  PadPal.esc = PadPal.esc || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  PadPal.sessions = { KINDS: KINDS, REASONS: REASONS, rows: rows, podium: podium, table: table, rounds: rounds, detail: detail, ordinal: ordinal, medal: medal };
})();
