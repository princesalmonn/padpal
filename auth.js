// PadPal login helpers, shared by every screen.
// Needs (in this order): supabase-js from the CDN, config.js, then this file.
(function () {
  var cfg = window.PADPAL_CONFIG;

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
        location.replace(p && opts.admin ? 'profile.html' : 'login.html');
        return null;
      }
      document.documentElement.style.visibility = '';
      return me;
    });
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
    if (/fetch|network/i.test(m))
      return "Can't reach PadPal. Check your internet and try again.";
    return m;
  }

  window.PadPal = {
    db: db, myProfile: myProfile, guard: guard, signOut: signOut,
    createInvite: createInvite, shareInvite: shareInvite, friendlyError: friendlyError,
    uploadPhoto: uploadPhoto, photoUrls: photoUrls,
    remembered: remembered, setRemember: setRemember
  };
})();
