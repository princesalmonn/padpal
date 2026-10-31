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

  // Everyone's final result: place, total, games won/lost, points change
  // Same points? More games won goes first, then better point difference; only a full tie shares a place (call 122)
  // changes = { user id → points change } (optional)
  function rows(state, changes) {
    var s = state || {};
    var players = s.players || [];
    var wl = {};
    players.forEach(function (id) { wl[id] = { w: 0, l: 0, d: 0, diff: 0 }; });
    (s.rounds || []).forEach(function (r) {
      (r.matches || []).forEach(function (m) {
        if (!m.score) return;
        var aWon = m.score[0] > m.score[1], bWon = m.score[1] > m.score[0];
        m.a.forEach(function (id) { if (!wl[id]) return; wl[id].diff += m.score[0] - m.score[1]; if (aWon) wl[id].w++; else if (bWon) wl[id].l++; else wl[id].d++; });
        m.b.forEach(function (id) { if (!wl[id]) return; wl[id].diff += m.score[1] - m.score[0]; if (bWon) wl[id].w++; else if (aWon) wl[id].l++; else wl[id].d++; });
      });
    });
    function better(a, b) { return (b.total - a.total) || (b.w - a.w) || (b.diff - a.diff); }
    var list = players.map(function (id) {
      var c = changes && changes[id];
      return { id: id, total: (s.points || {})[id] || 0, played: (s.played || {})[id] || 0, w: wl[id].w, l: wl[id].l, d: wl[id].d, diff: wl[id].diff,
               out: s.out && s.out[id] || null, change: c == null ? null : Number(c) };
    }).sort(better);
    list.forEach(function (x, i) { x.place = i > 0 && better(list[i - 1], x) === 0 ? list[i - 1].place : i + 1; });
    return list;
  }

  // "5W 2L" or "5W 2L 1D"
  function wlText(x) { return x.w + 'W ' + x.l + 'L' + (x.d ? ' ' + x.d + 'D' : ''); }

  // Every game one player played in a session, as a match: { won, lost, draw, partner, opp, score: [mine, theirs], round, when }
  // (session games count in everyone's W-L like normal matches; only the final place gives ranking points)
  function gamesOf(game, uid) {
    var s = game.session_state || {}, list = [];
    var start = new Date(game.scheduled_at || 0).getTime();
    (s.rounds || []).forEach(function (r, ri) {
      (r.matches || []).forEach(function (m, mi) {
        if (!m.score) return;
        var inA = m.a.indexOf(uid) > -1, inB = m.b.indexOf(uid) > -1;
        if (!inA && !inB) return;
        var mine = inA ? m.a : m.b, theirs = inA ? m.b : m.a;
        var sc = inA ? [m.score[0], m.score[1]] : [m.score[1], m.score[0]];
        list.push({ won: sc[0] > sc[1], lost: sc[0] < sc[1], draw: sc[0] === sc[1],
                    partner: mine[0] === uid ? mine[1] : mine[0], opp: theirs.slice(), score: sc,
                    round: ri + 1, court: mi + 1, when: new Date(start + (ri + 1) * 60000).toISOString() });
      });
    });
    return list;
  }

  // "Your games" list for the session pop-up: ✅ W / ❌ L / 🤝 D
  function yourGames(game, uid, nameFn) {
    var list = gamesOf(game, uid);
    if (!list.length) return '';
    return '<div class="label" style="font-size:13px;color:var(--text-2);font-weight:600;margin-bottom:6px">Your games · ' +
      wlText({ w: list.filter(function (g) { return g.won; }).length, l: list.filter(function (g) { return g.lost; }).length, d: list.filter(function (g) { return g.draw; }).length }) + '</div>' +
      '<div class="card" style="padding:4px 12px;margin-bottom:12px">' + list.map(function (g) {
        return '<div class="s-round"><div class="m"><span>' + (g.won ? '✅' : g.lost ? '❌' : '🤝') + ' <b style="display:inline;color:var(--text);font-size:13px">R' + g.round + '</b> with ' + nameFn(g.partner) +
          ' <small class="meta">vs</small> ' + g.opp.map(nameFn).join(' & ') + '</span><span>' + g.score[0] + '–' + g.score[1] + '</span></div></div>';
      }).join('') + '</div>';
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
      return '<div class="col ' + o[1] + '"><div class="avatar" data-uid="' + x.id + '">' + avatarFn(x.id) + '</div>' +
        '<div class="nm" data-uid="' + x.id + '">' + nameFn(x.id) + '</div><div class="sc">' + x.total + ' pts' + (x.change != null ? ' · ' + PadPal.fmtChange(x.change) : '') + '</div>' +
        '<div class="block">' + medal(x.place) + '</div></div>';
    }).join('') + '</div>';
  }

  // Full standings; meId gets highlighted
  function table(list, nameFn, meId) {
    return list.map(function (x) {
      var why = x.out ? ' ' + (REASONS[x.out.reason] || REASONS.other)[0] : '';
      return '<div class="s-row' + (x.id === meId ? ' me' : '') + '"><span class="pos">' + medal(x.place) + '</span>' +
        '<div class="who"><span data-uid="' + x.id + '">' + nameFn(x.id) + '</span>' + why + '<small>' + wlText(x) + ' · ' + x.played + ' game' + (x.played === 1 ? '' : 's') +
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
      (meId ? yourGames(game, meId, nameFn) : '') +
      '<div class="label" style="font-size:13px;color:var(--text-2);font-weight:600;margin-bottom:6px">Final standings</div>' +
      '<div class="card" style="padding:4px 12px;margin-bottom:12px">' + table(list, nameFn, meId) + '</div>' +
      '<div class="label" style="font-size:13px;color:var(--text-2);font-weight:600;margin-bottom:6px">All rounds</div>' +
      '<div class="card" style="padding:4px 12px">' + rounds(s, nameFn) + '</div>';
  }

  PadPal.esc = PadPal.esc || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  PadPal.sessions = { KINDS: KINDS, REASONS: REASONS, rows: rows, podium: podium, table: table, rounds: rounds, detail: detail,
                      ordinal: ordinal, medal: medal, gamesOf: gamesOf, yourGames: yourGames, wlText: wlText };
})();
