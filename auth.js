// PadPal login helpers, shared by every screen.
// Needs (in this order): supabase-js from the CDN, config.js, then this file.
(function () {
  var cfg = window.PADPAL_CONFIG;
  var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);

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

  // Turn technical errors into plain words
  function friendlyError(err) {
    var m = (err && (err.message || err.msg || err.code)) || String(err);
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
    if (/fetch|network/i.test(m))
      return "Can't reach PadPal. Check your internet and try again.";
    return m;
  }

  window.PadPal = {
    db: db, myProfile: myProfile, guard: guard, signOut: signOut,
    createInvite: createInvite, shareInvite: shareInvite, friendlyError: friendlyError
  };
})();
