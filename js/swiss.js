/* ==========================================================================
 * Alcázar Chess — Swiss pairing engine (pure logic, no DOM)
 *
 * Round 1   : sort by Elo, pair neighbours (1-2, 3-4 …) -> close ratings.
 * Round 2+  : sort by points (then Elo), pair highest with nearest-score opponent.
 *             * no rematches whenever a full pairing without them exists
 *               (a depth-first search with backtracking; rematches are only
 *               allowed, as few as possible, when mathematically unavoidable —
 *               e.g. round 12 in a 12-player group)
 *             * colours alternate: each pairing prefers opponents whose colour
 *               needs differ, the player owed White gets White, and nobody gets
 *               the same colour three times in a row when avoidable.
 * ========================================================================== */
window.AC = window.AC || {};

AC.swiss = (function () {
  const NODE_LIMIT = 300000;

  /** Per-player history built from matches played BEFORE `target` round. */
  function history(matches, target) {
    const h = {};
    const get = id => (h[id] = h[id] || { opps: {}, colors: [], bye: false });
    matches.filter(m => m.round < target)
      .sort((a, b) => a.round - b.round)
      .forEach(m => {
        const w = get(m.white);
        if (!m.black) { w.bye = true; return; }
        const b = get(m.black);
        w.opps[m.black] = (w.opps[m.black] || 0) + 1;
        b.opps[m.white] = (b.opps[m.white] || 0) + 1;
        w.colors.push('W');
        b.colors.push('B');
      });
    return { h, get };
  }

  /** Positive => player is owed White; negative => owed Black. */
  function pref(hs) {
    const k = hs.colors;
    let d = 0;
    k.forEach(c => { d += c === 'B' ? 1 : -1; });
    const last = k[k.length - 1];
    if (last === 'B') d += 0.5; else if (last === 'W') d -= 0.5;
    if (k.length >= 2 && k[k.length - 1] === k[k.length - 2]) d += (last === 'B' ? 1.5 : -1.5);
    return d;
  }

  function streak(hs, c) {
    const k = hs.colors;
    return k.length >= 2 && k[k.length - 1] === c && k[k.length - 2] === c;
  }

  const byElo = (a, b) => (b.elo - a.elo) || a.name.localeCompare(b.name);

  /** Decide who plays White in a pair. a is the higher-ranked player. */
  function assignColors(a, b, hist, round) {
    const ha = hist.get(a.id), hb = hist.get(b.id);
    const pa = pref(ha), pb = pref(hb);
    let white = a, black = b;
    if (pb > pa) { white = b; black = a; }
    else if (pa === pb && round % 2 === 1) { white = b; black = a; }
    // never give three identical colours in a row if the swap avoids it
    const wh = hist.get(white.id), bh = hist.get(black.id);
    if (streak(wh, 'W') && !streak(bh, 'B')) { const t = white; white = black; black = t; }
    else if (streak(bh, 'B') && !streak(wh, 'W')) { const t = white; white = black; black = t; }
    return { white, black };
  }

  /**
   * Draw one group.
   * @param players  [{id, name, elo, points}]  active players of the group
   * @param matches  every match of the tournament so far (rounds >= round are ignored)
   * @param round    round number being drawn
   * @returns {pairs:[{white, black}] (ids, in table order), bye: id|null}
   */
  function drawGroup(players, matches, round) {
    const hist = history(matches, round);
    players.forEach(p => hist.get(p.id));
    if (players.length < 2) return { pairs: [], bye: players[0] ? players[0].id : null };

    // ---- Round 1: Elo neighbours --------------------------------------------
    if (round === 1) {
      const list = players.slice().sort(byElo);
      let bye = null;
      if (list.length % 2) bye = list.pop().id;
      const pairs = [];
      for (let i = 0; i < list.length; i += 2) {
        const hi = list[i], lo = list[i + 1];
        // alternate who gets White down the tables so colours balance
        pairs.push((i / 2) % 2 === 0 ? { white: hi.id, black: lo.id } : { white: lo.id, black: hi.id });
      }
      return { pairs, bye };
    }

    // ---- Round 2+: points ---------------------------------------------------
    const pool = players.slice().sort((a, b) => (b.points - a.points) || byElo(a, b));
    let bye = null;
    if (pool.length % 2) {
      let idx = -1;
      for (let i = pool.length - 1; i >= 0; i--) { if (!hist.get(pool[i].id).bye) { idx = i; break; } }
      if (idx < 0) idx = pool.length - 1;
      bye = pool.splice(idx, 1)[0].id;
    }

    const n = pool.length;
    const prefs = pool.map(p => pref(hist.get(p.id)));
    const cost = (i, j) => {
      const diff = Math.abs(pool[i].points - pool[j].points);
      const conflict = prefs[i] * prefs[j] > 0 ? Math.min(Math.abs(prefs[i]), Math.abs(prefs[j])) : 0;
      return diff * 100 + conflict * 10 + (j - i);
    };
    const met = (i, j) => hist.h[pool[i].id].opps[pool[j].id] || 0;

    let used, result, nodes;
    function dfs(budget) {
      const i = used.indexOf(false);
      if (i < 0) return true;
      if (++nodes > NODE_LIMIT) return false;
      used[i] = true;
      const cands = [];
      for (let j = i + 1; j < n; j++) if (!used[j]) cands.push({ j, m: met(i, j), c: cost(i, j) });
      cands.sort((x, y) => (x.m * 100000 + x.c) - (y.m * 100000 + y.c));
      for (const cd of cands) {
        if (cd.m > 0 && budget <= 0) continue;
        used[cd.j] = true; result.push([i, cd.j]);
        if (dfs(budget - (cd.m > 0 ? 1 : 0))) return true;
        result.pop(); used[cd.j] = false;
      }
      used[i] = false;
      return false;
    }

    let found = false;
    for (let budget = 0; budget <= n / 2 && !found; budget++) {
      used = new Array(n).fill(false); result = []; nodes = 0;
      found = dfs(budget);
    }
    if (!found) { // extremely unlikely safety net: plain neighbours
      result = [];
      for (let i = 0; i < n; i += 2) result.push([i, i + 1]);
    }

    const pairs = result.map(([i, j]) => {
      const a = pool[i], b = pool[j];
      const c = assignColors(a, b, hist, round);
      return { white: c.white.id, black: c.black.id, strength: [Math.max(a.points, b.points), a.points + b.points] };
    });
    pairs.sort((x, y) => (y.strength[0] - x.strength[0]) || (y.strength[1] - x.strength[1]));
    return { pairs: pairs.map(p => ({ white: p.white, black: p.black })), bye };
  }

  return { drawGroup, history, pref };
})();
