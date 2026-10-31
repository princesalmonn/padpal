// PadPal big-button score keeper (padel scoring: 15-30-40, golden point, tiebreak at 6-6).
// Usage: PadPal.scoreMatch({ names: ['Team A', 'Team B'], setsToWin: 1, title: 'Final' })
//        → Promise of { sets: [[6,4],[7,5]], winner: 'a' | 'b' }, or null if closed.
(function () {
  var css = document.createElement('style');
  css.textContent =
    '.pp-tracker{position:fixed;inset:0;z-index:62;background:var(--bg);display:flex;flex-direction:column;max-width:440px;margin:0 auto;' +
      'padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom);user-select:none;-webkit-user-select:none}' +
    '.pp-tracker .bar{display:flex;align-items:center;gap:8px;padding:10px 12px}' +
    '.pp-tracker .bar .title{flex:1;text-align:center;font-weight:700;font-size:14px}' +
    '.pp-tracker .bar button{border:0;background:var(--card);border-radius:10px;padding:8px 12px;font-size:14px;font-weight:600;color:var(--text)}' +
    '.pp-tracker .zone{flex:1;margin:6px 12px;border-radius:22px;border:0;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}' +
    '.pp-tracker .zone.a{background:linear-gradient(160deg,#D6F04A,#9DB816);color:#0F1E3C}' +
    '.pp-tracker .zone.b{background:linear-gradient(160deg,#1F3566,#0F1E3C);border:2px solid #C9E52C;color:#fff}' +
    '.pp-tracker .nm{font-size:16px;font-weight:600;padding:0 12px;text-align:center}' +
    '.pp-tracker .pt{font-size:96px;font-weight:800;line-height:1;margin:6px 0;font-variant-numeric:tabular-nums}' +
    '.pp-tracker .gm{font-size:14px;opacity:.85}' +
    '.pp-tracker .flag{position:absolute;top:12px;right:14px;font-size:12px;font-weight:700;background:rgba(0,0,0,.3);color:#fff;padding:3px 9px;border-radius:999px}' +
    '.pp-tracker .mid{text-align:center;font-size:13px;color:var(--text-2);padding:2px}' +
    '.pp-tracker .foot{display:flex;gap:8px;padding:8px 12px 12px}.pp-tracker .foot button{flex:1}' +
    '.pp-tracker .done{position:absolute;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center}' +
    '.pp-tracker .done .big{font-size:60px}.pp-tracker .done .final{font-size:28px;font-weight:800}.pp-tracker .done .btn{width:100%;max-width:320px}' +
    // 🖥️ iPad / computer: a big scoreboard (sideways: the two teams next to each other)
    '@media (min-width:768px){.pp-tracker{max-width:none}.pp-tracker .bar{padding:14px 20px}.pp-tracker .bar .title{font-size:18px}' +
      '.pp-tracker .zone{margin:8px 20px;border-radius:30px}.pp-tracker .nm{font-size:26px}.pp-tracker .pt{font-size:min(200px,22vh);margin:10px 0}' +
      '.pp-tracker .gm{font-size:22px}.pp-tracker .flag{font-size:16px;top:18px;right:22px}.pp-tracker .mid{font-size:18px;padding:6px}' +
      '.pp-tracker .foot{padding:10px 20px 20px}.pp-tracker .foot button{padding:18px;font-size:20px}}' +
    '@media (min-width:768px) and (orientation:landscape){.pp-tracker{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr auto auto}' +
      '.pp-tracker>:not(.zone){grid-column:1/-1}.pp-tracker>.zone{grid-row:2}}';
  document.head.appendChild(css);

  var LABELS = ['0', '15', '30', '40'];

  function scoreMatch(opts) {
    return new Promise(function (resolve) {
      var S = { pts: [0, 0], games: [0, 0], sets: [], won: [0, 0], tb: false, over: false, golden: true };
      var undo = [];
      var el = document.createElement('div');
      el.className = 'pp-tracker';
      el.innerHTML =
        '<div class="bar"><button data-x>✕</button><div class="title"></div><button data-mode></button></div>' +
        '<button class="zone a" data-p="0"><span class="flag" hidden></span><div class="nm"></div><div class="pt">0</div><div class="gm"></div></button>' +
        '<div class="mid"></div>' +
        '<button class="zone b" data-p="1"><span class="flag" hidden></span><div class="nm"></div><div class="pt">0</div><div class="gm"></div></button>' +
        '<div class="foot"><button class="btn btn-ghost" data-undo>↩️ Undo</button></div>';
      document.body.appendChild(el);
      el.querySelector('.title').textContent = opts.title || 'Match';
      var zones = el.querySelectorAll('.zone');
      zones[0].querySelector('.nm').textContent = opts.names[0];
      zones[1].querySelector('.nm').textContent = opts.names[1];
      var need = opts.setsToWin || 1;

      function label(t) {
        var p = S.pts, o = 1 - t;
        if (S.tb) return String(p[t]);
        if (p[0] >= 3 && p[1] >= 3) return p[t] > p[o] ? 'AD' : '40';
        return LABELS[p[t]];
      }
      function winGame(t) {
        var o = 1 - t;
        S.games[t]++; S.pts = [0, 0];
        if (S.tb || (S.games[t] >= 6 && S.games[t] - S.games[o] >= 2)) {
          S.sets.push(S.games.slice()); S.won[t]++; S.games = [0, 0]; S.tb = false;
          if (S.won[t] === need) S.over = true;
        } else if (S.games[0] === 6 && S.games[1] === 6) S.tb = true;
      }
      function point(t) {
        if (S.over) return;
        undo.push(JSON.stringify(S));
        var o = 1 - t;
        S.pts[t]++;
        if (S.tb) { if (S.pts[t] >= 7 && S.pts[t] - S.pts[o] >= 2) winGame(t); }
        else if ((S.pts[t] >= 4 && S.pts[t] - S.pts[o] >= 2) || (S.golden && S.pts[t] === 4 && S.pts[o] === 3)) winGame(t);
        if (navigator.vibrate) navigator.vibrate(15);
        draw();
      }
      function draw() {
        for (var t = 0; t < 2; t++) {
          zones[t].querySelector('.pt').textContent = label(t);
          zones[t].querySelector('.gm').textContent = 'Games ' + S.games[t] + ' · Sets ' + S.won[t];
          var f = zones[t].querySelector('.flag');
          f.textContent = S.tb ? 'TIEBREAK' : (S.golden && S.pts[0] === 3 && S.pts[1] === 3) ? 'GOLDEN POINT' : '';
          f.hidden = !f.textContent;
        }
        el.querySelector('[data-mode]').textContent = S.golden ? '⚡ Golden' : '🔁 Advantage';
        el.querySelector('.mid').textContent = (need === 1 ? '1 set' : 'Best of 3') + ' · sets: ' + (S.sets.map(function (s) { return s[0] + '-' + s[1]; }).join('  ') || '–');
        var done = el.querySelector('.done');
        if (S.over && !done) {
          var w = S.won[0] > S.won[1] ? 0 : 1;
          done = document.createElement('div');
          done.className = 'done';
          done.innerHTML = '<div class="big">🏆</div><h3 style="margin:0"></h3><div class="final"></div>' +
            '<button class="btn btn-primary" data-save>💾 Save result</button><button class="btn btn-ghost" data-undo>↩️ Undo last point</button>';
          done.querySelector('h3').textContent = opts.names[w] + ' win!';
          done.querySelector('.final').textContent = S.sets.map(function (s) { return s[0] + '-' + s[1]; }).join('  ');
          el.appendChild(done);
        } else if (!S.over && done) done.remove();
      }
      var armed = false;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-p],[data-undo],[data-x],[data-mode],[data-save]');
        if (!b) return;
        if (b.dataset.p !== undefined) point(+b.dataset.p);
        else if (b.hasAttribute('data-undo')) { if (undo.length) { S = JSON.parse(undo.pop()); draw(); } }
        else if (b.hasAttribute('data-mode')) { S.golden = !S.golden; draw(); }
        else if (b.hasAttribute('data-save')) { el.remove(); resolve({ sets: S.sets, winner: S.won[0] > S.won[1] ? 'a' : 'b' }); }
        else if (b.hasAttribute('data-x')) {
          var started = S.sets.length || S.games[0] + S.games[1] + S.pts[0] + S.pts[1];
          if (started && !armed) { armed = true; b.textContent = 'Sure?'; setTimeout(function () { armed = false; b.textContent = '✕'; }, 3000); return; }
          el.remove(); resolve(null);
        }
      });
      draw();
    });
  }

  window.PadPal = window.PadPal || {};
  PadPal.scoreMatch = scoreMatch;
})();
