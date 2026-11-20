/* ==========================================================================
 * Alcázar Chess — configuration
 * Everything you may want to tweak lives here.
 * ========================================================================== */
window.AC = window.AC || {};

AC.config = {
  // Seeds 24 demo players (with demo access codes) the very first time the app runs.
  // Set to false for the real tournament so the app starts empty.
  DEMO_MODE: false,

  // Where the shared tournament state lives:
  //   'local'    -> browser localStorage (demo; live-syncs between tabs of the SAME browser only)
  //   'firebase' -> Firebase Realtime Database (fill in AC.config.firebase below)
  //   'supabase' -> Supabase table + realtime  (fill in AC.config.supabase below)
  BACKEND: 'supabase',

  DEFAULT_LANG: 'ar',

  // Tournament format
  TOTAL_ROUNDS: 12,
  ROUNDS_PER_SESSION: 3,        // 3 rounds every Sunday
  TABLES_PER_GROUP: 6,
  MAX_PLAYERS_PER_GROUP: 12,
  BYE_POINTS: 1,                // only used if a group has an odd number of active players

  STORAGE_KEY: 'alcazar_chess_state_v1',

  // First-run admin credentials (change them in Admin > Settings!)
  DEFAULT_ADMIN: { name: 'admin', pass: 'alcazar2026' },

  firebase: {
    config: { apiKey: '', authDomain: '', databaseURL: '', projectId: '', appId: '' },
    path: 'alcazar/state'
  },

  supabase: {
    url: 'https://seixprfzbhxukwbrsyjx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaXhwcmZ6Ymh4dWt3YnJzeWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDEzMDIsImV4cCI6MjExMDc3NzMwMn0.LBTYFFDTAj4GvSQTv_p0iS-H9DgDM0yg_WMqaYFyHh0',
    table: 'tournament_state',  // columns: id int primary key, data jsonb, updated_at timestamptz
    rowId: 1
  }
};
