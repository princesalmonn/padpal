// PadPal's connection to Supabase.
// These two values are meant to be public (they ship inside the app).
// The data stays safe because of the security rules in supabase/01_members.sql.
// NEVER put the "secret" / "service_role" key or the database password here.
window.PADPAL_CONFIG = {
  supabaseUrl: 'https://cbakwbftxrxcojuohdrl.supabase.co',
  supabaseKey: 'sb_publishable_BlvuZgQiwyPDyDgecTsosg_3HrvtAPx'
};
