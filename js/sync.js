/* ==========================================================================
 * Alcázar Chess — persistence / live-sync adapters
 *
 * Every adapter exposes the same tiny interface:
 *   async load()         -> state object | null   (null = nothing stored yet)
 *   async save(state)    -> persists the whole tournament state
 *   subscribe(callback)  -> callback(remoteState) whenever ANOTHER client saves
 *
 * 'local'    works out of the box (localStorage; live between tabs of one browser).
 * 'firebase' and 'supabase' are ready-made hooks for real multi-device live updates:
 *            fill their settings in config.js and set AC.config.BACKEND.
 *            (They load the vendor SDK from a CDN on demand.)
 *
 * NOTE: the whole tournament is stored as ONE document (last write wins).
 * See README.md for how to harden this for production (split tables / security rules).
 * ========================================================================== */
window.AC = window.AC || {};

AC.sync = (function () {
  const C = AC.config;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }

  /* ---------- local (demo) ---------- */
  function localAdapter() {
    const KEY = C.STORAGE_KEY;
    return {
      name: 'local',
      async load() {
        try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
        catch (e) { return null; }
      },
      async save(state) { localStorage.setItem(KEY, JSON.stringify(state)); },
      subscribe(cb) {
        // 'storage' fires in OTHER tabs of the same browser when localStorage changes
        window.addEventListener('storage', e => {
          if (e.key !== KEY || !e.newValue) return;
          try { cb(JSON.parse(e.newValue)); } catch (err) { /* ignore */ }
        });
      }
    };
  }

  /* ---------- Firebase Realtime Database ---------- */
  function firebaseAdapter() {
    const cfg = C.firebase;
    let ref = null;
    async function ready() {
      if (ref) return;
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
      }
      if (!firebase.apps.length) firebase.initializeApp(cfg.config);
      ref = firebase.database().ref(cfg.path);
    }
    return {
      name: 'firebase',
      async load() { await ready(); const snap = await ref.get(); return snap.exists() ? snap.val() : null; },
      async save(state) { await ready(); await ref.set(JSON.parse(JSON.stringify(state))); },
      subscribe(cb) {
        ready().then(() => ref.on('value', snap => { if (snap.exists()) cb(snap.val()); }));
      }
    };
  }

  /* ---------- Supabase ---------- */
  function supabaseAdapter() {
    const cfg = C.supabase;
    let client = null;
    async function ready() {
      if (client) return;
      if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      client = window.supabase.createClient(cfg.url, cfg.anonKey);
    }
    return {
      name: 'supabase',
      async load() {
        await ready();
        const { data, error } = await client.from(cfg.table).select('data').eq('id', cfg.rowId).maybeSingle();
        if (error) throw error;
        return data ? data.data : null;
      },
      async save(state) {
        await ready();
        const { error } = await client.from(cfg.table)
          .upsert({ id: cfg.rowId, data: state, updated_at: new Date().toISOString() });
        if (error) throw error;
      },
      subscribe(cb) {
        ready().then(() => {
          client.channel('alcazar-state')
            .on('postgres_changes', { event: '*', schema: 'public', table: cfg.table }, p => {
              if (p.new && p.new.data) cb(p.new.data);
            })
            .subscribe();
        });
      }
    };
  }

  function create() {
    switch (C.BACKEND) {
      case 'firebase': return firebaseAdapter();
      case 'supabase': return supabaseAdapter();
      default: return localAdapter();
    }
  }

  return { create };
})();
