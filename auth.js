// PadPal login helpers, shared by every screen.
// Needs (in this order): supabase-js from the CDN, config.js, then this file.
(function () {
  var cfg = window.PADPAL_CONFIG;

  // ===== 🎨 Theme: auto (follows the iPhone), dark, light or gold — saved on this phone =====
  // Runs right away (this file is in <head>), so the page never flashes the wrong colours.
  var THEME_BG = { dark: '#0B1426', light: '#EEF2F7', gold: '#0E0C09' };
  function getTheme() { try { return localStorage.getItem('padpal_theme') || 'auto'; } catch (e) { return 'auto'; } }
  function applyTheme(t) {
    var root = document.documentElement;
    if (t === 'dark' || t === 'light' || t === 'gold') root.setAttribute('data-theme', t);
    else root.removeAttribute('data-theme');
    var shown = THEME_BG[t] ? t : (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_BG[shown]);   // the iPhone's top bar matches
  }
  function setTheme(t) {
    try { localStorage.setItem('padpal_theme', t); } catch (e) {}
    applyTheme(t);
  }
  applyTheme(getTheme());

  // "Remember me": ON = stay logged in (localStorage), OFF = logged out when the app/browser closes (sessionStorage)
  function remembered() {
    try { return localStorage.getItem('padpal_remember') !== 'no'; } catch (e) { return true; }
  }
  function setRemember(on) {
    try { localStorage.setItem('padpal_remember', on ? 'yes' : 'no'); } catch (e) {}
  }
  var loginStorage = {
    getItem: function (k) {
      try { var v = localStorage.getItem(k); return v !== null ? v : sessionStorage.getItem(k); } catch (e) { return null; }
    },
    setItem: function (k, v) {
      try {
        if (remembered()) { localStorage.setItem(k, v); sessionStorage.removeItem(k); }
        else { sessionStorage.setItem(k, v); localStorage.removeItem(k); }
      } catch (e) {}
    },
    removeItem: function (k) {
      try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {}
    }
  };

  var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { storage: loginStorage, persistSession: true, autoRefreshToken: true }
  });

  // Who is logged in, and their PadPal profile (null if nobody)
  async function myProfile() {
    var session = (await db.auth.getSession()).data.session;
    if (!session) return null;
    var r = await db.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    return { session: session, profile: r.data };
  }

  // Members-only screens call this first. Everyone else goes to the login screen.
  function guard(opts) {
    opts = opts || {};
    document.documentElement.style.visibility = 'hidden';
    return myProfile().then(function (me) {
      var p = me && me.profile;
      var ok = p && p.status === 'approved' && p.username && (!opts.admin || p.is_admin);
      if (!ok) {
        // remember where you wanted to go (e.g. a game join link), so login can bring you back
        if (!(p && opts.admin)) {
          try { localStorage.setItem('padpal_next', location.pathname.split('/').pop() + location.search); } catch (e) {}
        }
        location.replace(p && opts.admin ? 'profile.html' : 'login.html');
        return null;
      }
      document.documentElement.style.visibility = '';
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountBell);
      else mountBell();
      return me;
    });
  }

  // ===== 🔔 The bell in the top bar of every screen =====
  function mountBell() {
    var bar = document.querySelector('.topbar-inner');
    if (!bar || document.getElementById('padpalBell') || /notifications\.html/.test(location.pathname)) return;
    var box = document.createElement('div');
    box.className = 'top-actions';
    var bell = document.createElement('a');
    bell.id = 'padpalBell';
    bell.className = 'icon-btn bell';
    bell.href = 'notifications.html';
    bell.setAttribute('aria-label', 'Notifications');
    bell.innerHTML = '🔔<b class="bell-count" hidden></b>';
    var right = bar.children.length > 1 ? bar.lastElementChild : null;
    if (right) bar.replaceChild(box, right);
    else bar.appendChild(box);
    box.appendChild(bell);
    if (right) box.appendChild(right);
    refreshBell();
    setInterval(refreshBell, 30000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') refreshBell(); });
  }
  async function refreshBell() {
    var el = document.querySelector('#padpalBell .bell-count');
    if (!el) return;
    try {
      var r = await db.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
      var n = r.count || 0;
      el.textContent = n > 9 ? '9+' : n;
      el.hidden = !n;
    } catch (e) {}
  }

  async function signOut() {
    await db.auth.signOut();
  }

  // Make a new one-time invite and return its link
  async function createInvite() {
    var me = await myProfile();
    var r = await db.from('invites').insert({ created_by: me.session.user.id }).select('code').single();
    if (r.error) throw r.error;
    return new URL('login.html?invite=' + r.data.code, location.href).href;
  }

  // Share the link with the phone's share sheet, or copy it
  async function shareInvite() {
    var link = await createInvite();
    var text = 'Join me on PadPal 🎾 (this link works once)';
    if (navigator.share) {
      try { await navigator.share({ title: 'PadPal invite', text: text, url: link }); return 'shared'; }
      catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
    }
    try { await navigator.clipboard.writeText(link); return 'copied'; }
    catch (e) { return link; }
  }

  // ===== Photos =====

  // Shrink a phone photo (often 3–5 MB) to a small JPEG (~100–300 KB)
  function shrinkPhoto(file, maxSide) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          blob ? resolve(blob) : reject(new Error("Couldn't read that photo. Try another one."));
        }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Couldn't read that photo. Try another one.")); };
      img.src = url;
    });
  }

  // Shrink + upload into your own folder. Returns where it was saved.
  async function uploadPhoto(file, kind, maxSide) {
    var me = await myProfile();
    var blob = await shrinkPhoto(file, maxSide || 1080);
    var path = me.session.user.id + '/' + kind + '-' + Date.now() + '.jpg';
    var r = await db.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
    if (r.error) throw r.error;
    return path;
  }

  // Photos are private, so we ask for short-lived links to show them
  async function photoUrls(paths) {
    paths = paths.filter(Boolean);
    if (!paths.length) return {};
    var r = await db.storage.from('photos').createSignedUrls(paths, 60 * 60);
    if (r.error) throw r.error;
    var map = {};
    r.data.forEach(function (x) { if (x.signedUrl) map[x.path] = x.signedUrl; });
    return map;
  }

  // ===== Tiers and members =====

  var TIERS = [
    { min: 0,   name: 'First Timer', icon: '🐣', color: '#6B7280' },
    { min: 100, name: 'Newbie',      icon: '🌱', color: '#6E8B5B' },
    { min: 200, name: 'Beginner',    icon: '🎾', color: '#4F7CAC' },
    { min: 300, name: 'Amateur',     icon: '⚡', color: '#7E6AA8' },
    { min: 400, name: 'Junior',      icon: '🥉', color: '#B87333' },
    { min: 501, name: 'Pro',         icon: '🥈', color: '#A8B0BA' },
    { min: 626, name: 'Pro-Star',    icon: '💎', color: '#D9822B' },
    { min: 751, name: 'Star',        icon: '⭐', color: '#C9A24A' },
    { min: 876, name: 'Legend',      icon: '👑', color: '#B3261E' }
  ];
  function tierOf(points) {
    var t = TIERS[0];
    TIERS.forEach(function (x) { if ((points || 0) >= x.min) t = x; });
    return t;
  }
  // Points can have one decimal (+0.5 for showing up): 12 → "12", 12.5 → "12.5"
  function fmt(n) {
    var v = Math.round((Number(n) || 0) * 10) / 10;
    return String(v);
  }
  // A change with its sign: +2.5 / −2 / ±0
  function fmtChange(n) {
    var v = Math.round((Number(n) || 0) * 10) / 10;
    return v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '±0';
  }
  function nextTier(points) {
    return TIERS.filter(function (x) { return x.min > (points || 0); })[0] || null;
  }

  // ONE ranking rule for the whole app (Ranks, Profile, …):
  // most points first; equal points share the same place (1, 1, 1, 4 …); equal points are listed A–Z
  function rankPlayers(list, valueOf) {
    var rows = list.map(function (p) { return { p: p, value: Math.round((Number(valueOf(p)) || 0) * 10) / 10 }; });
    rows.sort(function (a, b) {
      return b.value - a.value || (a.p.display_name || a.p.username || '').localeCompare(b.p.display_name || b.p.username || '');
    });
    rows.forEach(function (x, i) { x.rank = i > 0 && x.value === rows[i - 1].value ? rows[i - 1].rank : i + 1; });
    rows.forEach(function (x) { x.tied = rows.filter(function (y) { return y.rank === x.rank; }).length; });
    return rows;
  }

  // All approved members (small friends group, so we load them all at once)
  async function members() {
    var r = await db.from('profiles')
      .select('id, username, display_name, gender, avatar_url, points, last_played')
      .eq('status', 'approved').not('username', 'is', null)
      .order('points', { ascending: false });
    if (r.error) throw r.error;
    return r.data;
  }

  // ===== Inactivity: when will you lose points if you don't play? =====
  // Returns null for First Timers or people who never played.
  async function inactivity(profile) {
    if (!profile.last_played || Number(profile.points) < 100) return null;
    var s = { decay_points: 1, decay_points_long: 2 };
    try { var r = await db.from('settings').select('decay_points, decay_points_long').eq('id', 1).maybeSingle(); if (r.data) s = r.data; } catch (e) {}
    var todayJkt = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) + 'T00:00:00');
    var idle = Math.round((todayJkt - new Date(profile.last_played + 'T00:00:00')) / 86400000);
    var next = idle < 7 ? 7 : (Math.floor(idle / 7) + 1) * 7;   // the next idle day that costs points
    var lossDay = new Date(todayJkt.getTime() + (next - idle) * 86400000);
    return {
      idle: idle,
      daysLeft: next - idle,
      amount: Number(next >= 28 ? s.decay_points_long : s.decay_points),
      deadline: lossDay.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
    };
  }

  // Turn technical errors into plain words
  function friendlyError(err) {
    var m = (err && (err.message || err.msg || err.code)) || String(err);
    if (/invalid login credentials/i.test(m))
      return 'Wrong email or password. Forgot it? Tap "Forgot password?".';
    if (/already registered|already been registered/i.test(m))
      return 'This email already has an account. Log in instead.';
    if (/email not confirmed/i.test(m))
      return 'Confirm your email first: tap the link in the email we sent (check spam too).';
    if (/password should be|password.*(at least|characters)|weak password/i.test(m))
      return 'Password is too short or too easy. Use at least 8 characters.';
    if (/same.*password|different from the old/i.test(m))
      return 'That is your current password. Choose a new one.';
    if (/saving new user|invite-only/i.test(m))
      return "PadPal is invite-only 🎟️ This invite link isn't valid or was already used. Ask a member for a new one.";
    if (/rate limit|too many/i.test(m))
      return 'Too many emails right now. The free email service only sends a few per hour, so try again a bit later.';
    if (/expired|invalid.*(otp|token)|token.*(expired|invalid)/i.test(m))
      return 'That code is wrong or expired. Use the newest email, or send a new code.';
    if (/duplicate key|23505/i.test(m))
      return 'That username is already taken. Try another one.';
    if (/check constraint|23514/i.test(m))
      return 'Username: 3–20 characters, only lowercase letters, numbers, dots and underscores.';
    if (/6 pinned photos/i.test(m))
      return 'You already have 6 pinned photos. Remove one first.';
    if (/bucket not found|row-level security.*objects|new row violates/i.test(m))
      return "Photos aren't set up yet. Run 02_photos.sql in Supabase first.";
    if (/could not find the function|save_game_match|create_game|join_game/i.test(m))
      return "Games aren't set up yet. Run 04_matches.sql and then 05_lobby.sql in Supabase.";
    if (/fetch|network/i.test(m))
      return "Can't reach PadPal. Check your internet and try again.";
    return m;
  }

  window.PadPal = {
    db: db, myProfile: myProfile, guard: guard, signOut: signOut,
    createInvite: createInvite, shareInvite: shareInvite, friendlyError: friendlyError,
    uploadPhoto: uploadPhoto, photoUrls: photoUrls,
    remembered: remembered, setRemember: setRemember,
    TIERS: TIERS, tierOf: tierOf, nextTier: nextTier, members: members, rankPlayers: rankPlayers, fmt: fmt, fmtChange: fmtChange,
    inactivity: inactivity, refreshBell: refreshBell, mountBell: mountBell,
    getTheme: getTheme, setTheme: setTheme
  };
})();
