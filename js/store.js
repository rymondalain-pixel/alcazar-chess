/* ==========================================================================
 * Alcázar Chess — state store
 *
 * One state object, mutated only through commit(). Every commit persists via
 * the sync adapter and notifies subscribers ('local'); updates coming from
 * other clients notify with 'remote'. No DOM code in here.
 *
 * Action methods return { ok:true, ... } or { ok:false, error:'err.key' } —
 * the UI translates the error key.
 * ========================================================================== */
window.AC = window.AC || {};

AC.store = (function () {
  const C = AC.config, Calc = AC.calc;
  let state = null, adapter = null;
  const subs = [];

  /* ---------- helpers ---------- */
  const uid = p => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  const arr = x => Array.isArray(x) ? x : (x && typeof x === 'object' ? Object.values(x) : []);
  const err = key => ({ ok: false, error: key });

  /** Strip accents / Arabic diacritics / case / extra spaces so logins are forgiving. */
  function norm(str) {
    return String(str || '').normalize('NFKD')
      .replace(/[̀-ًͯ-ٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }
  const normCode = c => String(c || '').replace(/\s+/g, '').toUpperCase();

  function defaultMenu() {
    const d = (id, emoji, ar, fr, en, sugar) => ({ id, emoji, name: { ar, fr, en }, sugar, available: true });
    return [
      d('espresso', '☕', 'قهوة إسبريسو', 'Expresso', 'Espresso', true),
      d('cafe-lait', '🥛', 'قهوة بالحليب', 'Café au lait', 'Coffee with milk', true),
      d('nous-nous', '☕', 'نص نص', 'Nous-nous', 'Half & half coffee', true),
      d('mint-tea', '🍵', 'أتاي بالنعناع', 'Thé à la menthe', 'Moroccan mint tea', true),
      d('hot-choc', '🍫', 'شوكولا ساخنة', 'Chocolat chaud', 'Hot chocolate', true),
      d('orange', '🍊', 'عصير البرتقال', "Jus d'orange", 'Orange juice', false),
      d('water', '💧', 'ماء', 'Eau minérale', 'Mineral water', false),
      d('soda', '🥤', 'مشروب غازي', 'Soda', 'Soft drink', false)
    ];
  }

  function emptyState() {
    return {
      version: 1, updatedAt: 0, demo: false,
      admin: { name: C.DEFAULT_ADMIN.name, pass: C.DEFAULT_ADMIN.pass },
      currentRound: 0,
      players: [], matches: [], rounds: {}, cards: [],
      menu: defaultMenu(), orderEpoch: 1, orders: []
    };
  }

  /** Make any loaded document safe (Firebase drops empty arrays, etc.). */
  function normalize(raw) {
    const s = Object.assign(emptyState(), raw || {});
    ['players', 'matches', 'cards', 'orders', 'menu'].forEach(k => { s[k] = arr(s[k]); });
    if (!s.menu.length) s.menu = defaultMenu();
    s.rounds = (s.rounds && typeof s.rounds === 'object') ? s.rounds : {};
    s.currentRound = +s.currentRound || 0;
    s.orderEpoch = +s.orderEpoch || 1;
    s.admin = Object.assign({}, C.DEFAULT_ADMIN, s.admin || {});
    s.players.forEach(p => { p.elo = +p.elo || 0; });
    s.matches.forEach(m => { m.round = +m.round; m.table = +m.table; });
    s.cards.forEach(c => { c.round = +c.round; c.session = +c.session; c.at = +c.at || 0; });
    return s;
  }

  /* ---------- demo data ---------- */
  function demoState() {
    const s = emptyState();
    const A = [['Youssef El Idrissi', 1650], ['Amine Benali', 1580], ['Hamza Ouazzani', 1520], ['Mehdi Bouzid', 1490],
      ['Anas Chakir', 1450], ['Soufiane Haddad', 1410], ['Ayoub Mansouri', 1380], ['Ilyas Berrada', 1340],
      ['Reda Lahlou', 1300], ['Karim Tazi', 1260], ['عثمان الفاسي', 1220], ['Zakaria Naciri', 1180]];
    const B = [['Omar Alaoui', 1600], ['Yassine Kettani', 1540], ['Walid Sabri', 1500], ['Bilal Chraibi', 1470],
      ['Nabil Skalli', 1430], ['Imad Zniber', 1390], ['Hicham Amrani', 1360], ['Saad Bennani', 1320],
      ['Fouad Guessous', 1280], ['عادل بنجلون', 1240], ['Rachid El Fassi', 1200], ['Marouane Squalli', 1160]];
    let n = 0;
    [['A', A], ['B', B]].forEach(([g, list]) => list.forEach(([name, elo]) => {
      s.players.push({ id: uid('p'), name, elo, group: g, code: 'ALC-' + (1001 + n * 37), active: true });
      n++;
    }));
    s.demo = true;
    return s;
  }

  /* ---------- lifecycle ---------- */
  function emit(src) { subs.forEach(fn => { try { fn(src); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { subs.push(fn); }

  function persist() {
    return Promise.resolve(adapter.save(state)).catch(e => { console.error(e); emit('error'); });
  }

  /** Loads the state. Throws if the backend cannot be reached (so we never overwrite remote data). */
  async function init() {
    adapter = AC.sync.create();
    const raw = await adapter.load();
    if (raw) state = normalize(raw);
    else {
      state = C.DEMO_MODE ? demoState() : emptyState();
      state.updatedAt = Date.now();
      await persist();
    }
    adapter.subscribe(remote => {
      const n = normalize(remote);
      if ((n.updatedAt || 0) <= (state.updatedAt || 0)) return; // our own echo / stale
      state = n;
      emit('remote');
    });
  }

  function commit(mutator) {
    mutator(state);
    state.updatedAt = Date.now();
    emit('local');
    return persist();
  }

  const get = () => state;
  const player = id => state.players.find(p => p.id === id);

  /* ---------- auth ---------- */
  function findPlayer(name, code) {
    const n = norm(name), c = normCode(code);
    if (!n || !c) return null;
    return state.players.find(p => norm(p.name) === n && normCode(p.code) === c) || null;
  }
  function checkAdmin(name, pass) {
    return norm(name) === norm(state.admin.name) && String(pass) === String(state.admin.pass);
  }
  function setAdminCreds(name, pass) {
    if (!String(name).trim() || String(pass).length < 4) return err('err.adminCreds');
    commit(s => { s.admin = { name: String(name).trim(), pass: String(pass) }; });
    return { ok: true };
  }

  /* ---------- players ---------- */
  function generateCode() {
    let code;
    do { code = 'ALC-' + (1000 + Math.floor(Math.random() * 9000)); }
    while (state.players.some(p => normCode(p.code) === code));
    return code;
  }

  function validatePlayer(d, selfId) {
    const name = String(d.name || '').trim();
    const elo = Number(d.elo);
    const code = normCode(d.code);
    if (!name) return err('err.nameRequired');
    if (!Number.isFinite(elo) || elo < 0 || elo > 3500) return err('err.eloInvalid');
    if (d.group !== 'A' && d.group !== 'B') return err('err.groupInvalid');
    if (!code) return err('err.codeRequired');
    if (state.players.some(p => p.id !== selfId && normCode(p.code) === code)) return err('err.codeTaken');
    const inGroup = state.players.filter(p => p.group === d.group && p.id !== selfId).length;
    if (inGroup >= C.MAX_PLAYERS_PER_GROUP) return err('err.groupFull');
    return { ok: true, name, elo: Math.round(elo), code };
  }

  function addPlayer(d) {
    const v = validatePlayer(d, null);
    if (!v.ok) return v;
    const id = uid('p');
    commit(s => { s.players.push({ id, name: v.name, elo: v.elo, group: d.group, code: v.code, active: true }); });
    return { ok: true, id };
  }

  function updatePlayer(id, d) {
    const p = player(id);
    if (!p) return err('err.notFound');
    const v = validatePlayer(d, id);
    if (!v.ok) return v;
    if (d.group !== p.group && state.matches.some(m => m.white === id || m.black === id)) return err('err.groupLocked');
    commit(s => {
      const q = s.players.find(x => x.id === id);
      q.name = v.name; q.elo = v.elo; q.group = d.group; q.code = v.code;
    });
    return { ok: true };
  }

  function setActive(id, active) {
    commit(s => { const p = s.players.find(x => x.id === id); if (p) p.active = !!active; });
  }

  function removePlayer(id) {
    if (state.matches.some(m => m.white === id || m.black === id)) return err('err.hasMatches');
    commit(s => {
      s.players = s.players.filter(p => p.id !== id);
      s.cards = s.cards.filter(c => c.playerId !== id);
      s.orders = s.orders.filter(o => o.playerId !== id);
    });
    return { ok: true };
  }

  /* ---------- draw / results ---------- */
  /**
   * Draws the next round (redo=false) or re-draws the current, not yet submitted round (redo=true).
   * Both groups are drawn together. Banned players (2 yellows) get an automatic forfeit
   * so their opponent receives the point.
   */
  function drawRound(redo) {
    const cur = state.currentRound;
    let target;
    if (redo) {
      if (cur === 0 || Calc.isSubmitted(state, cur)) return err('err.cannotRedo');
      target = cur;
    } else if (cur === 0) target = 1;
    else if (!Calc.isSubmitted(state, cur)) return err('err.finishRound');
    else if (cur >= C.TOTAL_ROUNDS) return err('err.tournamentComplete');
    else target = cur + 1;

    const active = g => state.players.filter(p => p.group === g && p.active !== false);
    if (active('A').length < 2 && active('B').length < 2) return err('err.notEnoughPlayers');

    commit(s => {
      s.matches = s.matches.filter(m => m.round !== target);
      const pts = Calc.standingsMap(s);
      const banned = Calc.bannedForRound(s, target);
      ['A', 'B'].forEach(g => {
        const list = s.players.filter(p => p.group === g && p.active !== false)
          .map(p => ({ id: p.id, name: p.name, elo: p.elo, points: pts[p.id] ? pts[p.id].total : 0 }));
        const res = AC.swiss.drawGroup(list, s.matches, target);
        res.pairs.forEach((pr, i) => {
          const m = { id: uid('m'), round: target, group: g, table: i + 1, white: pr.white, black: pr.black,
                      result: null, pending: null, auto: null };
          const wb = banned.has(pr.white), bb = banned.has(pr.black);
          if (wb || bb) { m.auto = 'ban'; m.pending = m.result = (wb && bb) ? 'N' : (wb ? 'FB' : 'FW'); }
          s.matches.push(m);
        });
        if (res.bye) s.matches.push({ id: uid('m'), round: target, group: g, table: 0, white: res.bye, black: null,
                                      result: 'BYE', pending: 'BYE', auto: 'bye' });
      });
      s.currentRound = target;
      s.rounds[target] = { submitted: false };
    });
    return { ok: true, round: target };
  }

  /** Select (or un-select by clicking again) a pending result. */
  function setPending(matchId, code) {
    const m = state.matches.find(x => x.id === matchId);
    if (!m || !m.black || m.auto === 'ban') return err('err.notFound');
    if (Calc.isSubmitted(state, m.round)) return err('err.roundLocked');
    commit(s => {
      const x = s.matches.find(y => y.id === matchId);
      x.pending = (x.pending === code) ? null : code;
    });
    return { ok: true };
  }

  function pendingCount(round) {
    const ms = Calc.roundMatches(state, round).filter(m => m.black);
    return { done: ms.filter(m => m.pending).length, total: ms.length };
  }

  /** Commit all pending results of the current round -> standings & history update. */
  function submitRound() {
    const r = state.currentRound;
    if (!r) return err('err.noRound');
    const pc = pendingCount(r);
    if (pc.done < pc.total) return err('err.incomplete');
    commit(s => {
      s.matches.filter(m => m.round === r).forEach(m => { m.result = m.pending; });
      s.rounds[r] = { submitted: true, at: Date.now() };
    });
    return { ok: true };
  }

  /** Re-open a submitted round to correct results (only the latest round). */
  function reopenRound() {
    const r = state.currentRound;
    if (!r || !Calc.isSubmitted(state, r)) return err('err.noRound');
    commit(s => { s.rounds[r] = { submitted: false }; });
    return { ok: true };
  }

  /* ---------- cards ---------- */
  function issueCard(d) {
    const p = player(d.playerId);
    if (!p) return err('err.playerRequired');
    if (d.type !== 'yellow' && d.type !== 'red') return err('err.notFound');
    const round = Math.max(state.currentRound, 1);
    const session = Calc.sessionOf(round);
    let banned = false;
    commit(s => {
      s.cards.push({ id: uid('c'), playerId: d.playerId, type: d.type, reason: String(d.reason || '').trim(),
                     round, session, at: Date.now() });
      if (d.type === 'yellow') {
        const n = s.cards.filter(c => c.type === 'yellow' && c.playerId === d.playerId && c.session === session).length;
        banned = n === 2;
      }
    });
    return { ok: true, banned, round: round + 1 };
  }

  function removeCard(id) { commit(s => { s.cards = s.cards.filter(c => c.id !== id); }); }

  /* ---------- drinks ---------- */
  const currentOrders = () => state.orders.filter(o => o.epoch === state.orderEpoch);
  const orderFor = pid => currentOrders().find(o => o.playerId === pid) || null;

  /** STRICT one drink per participant per ordering round. */
  function placeOrder(pid, drinkId, sugar) {
    if (orderFor(pid)) return err('err.alreadyOrdered');
    const d = state.menu.find(x => x.id === drinkId);
    if (!d || !d.available) return err('err.drinkUnavailable');
    if (d.sugar && !['none', 'low', 'medium', 'sweet'].includes(sugar)) return err('err.sugarRequired');
    commit(s => {
      s.orders.push({ id: uid('o'), playerId: pid, drinkId, sugar: d.sugar ? sugar : null,
                      epoch: s.orderEpoch, at: Date.now() });
    });
    return { ok: true };
  }
  function cancelOrder(id) { commit(s => { s.orders = s.orders.filter(o => o.id !== id); }); }
  /** Opens a fresh ordering window (everyone may order one drink again). */
  function newOrderRound() { commit(s => { s.orderEpoch += 1; }); }

  function addDrink(d) {
    const fr = String(d.fr || '').trim(), en = String(d.en || '').trim(), ar = String(d.ar || '').trim();
    if (!fr && !en && !ar) return err('err.nameRequired');
    commit(s => {
      s.menu.push({ id: uid('d'), emoji: d.emoji || '☕', sugar: !!d.sugar, available: true,
                    name: { ar: ar || en || fr, fr: fr || en || ar, en: en || fr || ar } });
    });
    return { ok: true };
  }
  function toggleDrink(id) { commit(s => { const d = s.menu.find(x => x.id === id); if (d) d.available = !d.available; }); }
  function removeDrink(id) { commit(s => { s.menu = s.menu.filter(x => x.id !== id); }); }

  /** Where is this player sitting in the current round? */
  function seatOf(pid) {
    const m = Calc.playerMatch(state, state.currentRound, pid);
    if (!m) return null;
    return { group: m.group, table: m.table, color: m.white === pid ? 'W' : 'B', match: m };
  }

  /* ---------- admin tools ---------- */
  function resetTournament(keepPlayers) {
    commit(s => {
      s.matches = []; s.rounds = {}; s.cards = []; s.orders = []; s.currentRound = 0; s.orderEpoch = 1;
      if (!keepPlayers) s.players = [];
    });
  }
  function loadDemo() {
    const d = demoState();
    commit(s => { Object.keys(d).forEach(k => { if (k !== 'admin') s[k] = d[k]; }); });
  }
  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    let raw;
    try { raw = JSON.parse(text); } catch (e) { return err('err.badFile'); }
    if (!raw || !Array.isArray(raw.players || [])) return err('err.badFile');
    const n = normalize(raw);
    commit(s => { Object.keys(n).forEach(k => { s[k] = n[k]; }); });
    return { ok: true };
  }

  return {
    init, subscribe, get, player, commit, norm,
    findPlayer, checkAdmin, setAdminCreds,
    generateCode, addPlayer, updatePlayer, setActive, removePlayer,
    drawRound, setPending, pendingCount, submitRound, reopenRound,
    issueCard, removeCard,
    currentOrders, orderFor, placeOrder, cancelOrder, newOrderRound, addDrink, toggleDrink, removeDrink, seatOf,
    resetTournament, loadDemo, exportJSON, importJSON
  };
})();
