// AP Plastic ERP connection settings.
// mode "device": records are kept in the browser of each computer or phone (no cloud, no sign-in).
// Save a backup file often (Settings > Backup).
//
// To use a cloud database again later: remove the mode line and put the Supabase address and the
// publishable (anon / public) key here, like this:
//   url: "https://<project>.supabase.co",
//   key: "sb_publishable_..."
// The publishable key is safe to publish. Never put the service_role (secret) key here.
window.AP_CONFIG = {
  mode: "device"
};
