/* ==========================================================================
 * Alcázar Chess — pure scoring helpers (no DOM, no storage)
 * ========================================================================== */
window.AC = window.AC || {};

AC.calc = (function () {
  const C = AC.config;

  // Result codes: W = white wins, B = black wins, D = draw,
  // FW / FB = white / black wins by forfeit (opponent absent or banned), N = void (both banned)
  const RES = { W: [1, 0], B: [0, 1], D: [0.5, 0.5], FW: [1, 0], FB: [0, 1], N: [0, 0] };

  function resultPoints(code) { return RES[code] || [0, 0]; }

  function scoreText(code) {
    return ({ W: '1 – 0', B: '0 – 1', D: '½ – ½', FW: '1 – 0 *', FB: '0 – 1 *', N: '0 – 0', BYE: 'BYE' })[code] || '—';
  }

  /** Sunday session (1..4) a round belongs to. */
  function sessionOf(round) { return Math.ceil(Math.max(round, 1) / C.ROUNDS_PER_SESSION); }

  function isSubmitted(s, round) {
    const r = s.rounds && s.rounds[round];
    return !!(r && r.submitted);
  }

  function roundMatches(s, round, group) {
    return s.matches
      .filter(m => m.round === round && (!group || m.group === group))
      .sort((a, b) => a.table - b.table);
  }

  /** The match a player has in a given round (or undefined). */
  function playerMatch(s, round, pid) {
    return s.matches.find(m => m.round === round && (m.white === pid || m.black === pid));
  }

  /**
   * Full standings. Points = match points from SUBMITTED rounds − 1 per yellow card.
   * Tie-breaks: Buchholz (sum of opponents' match points), then Elo, then name.
   */
  function standings(s) {
    const rows = {};
    s.players.forEach(p => {
      rows[p.id] = { player: p, match: 0, pen: 0, total: 0, buch: 0, yellow: 0, red: 0, opps: [], rank: 0 };
    });

    s.matches.forEach(m => {
      if (!isSubmitted(s, m.round)) return;
      const w = rows[m.white];
      if (!m.black) { if (w) w.match += C.BYE_POINTS; return; }
      const b = rows[m.black];
      const pts = resultPoints(m.result);
      if (w) { w.match += pts[0]; if (b) w.opps.push(b); }
      if (b) { b.match += pts[1]; if (w) b.opps.push(w); }
    });

    s.cards.forEach(c => {
      const r = rows[c.playerId];
      if (!r) return;
      if (c.type === 'yellow') { r.yellow++; r.pen -= 1; }
      else if (c.type === 'red') r.red++;
    });

    const list = Object.keys(rows).map(k => rows[k]);
    list.forEach(r => { r.total = r.match + r.pen; });
    list.forEach(r => { r.buch = r.opps.reduce((a, o) => a + o.match, 0); });
    list.sort((a, b) =>
      (b.total - a.total) || (b.buch - a.buch) ||
      (b.player.elo - a.player.elo) || a.player.name.localeCompare(b.player.name));
    list.forEach((r, i) => { r.rank = i + 1; });
    return list;
  }

  function standingsMap(s) {
    const m = {};
    standings(s).forEach(r => { m[r.player.id] = r; });
    return m;
  }

  /**
   * Suspensions derived from cards: 2 yellow cards in the same session
   * => banned from the round AFTER the one in which the 2nd card was issued.
   * Returns a Set of player ids banned for `round`.
   */
  function bannedForRound(s, round) {
    const out = new Set();
    const bucket = {};
    s.cards.filter(c => c.type === 'yellow')
      .sort((a, b) => a.at - b.at)
      .forEach(c => { (bucket[c.playerId + '|' + c.session] = bucket[c.playerId + '|' + c.session] || []).push(c); });
    Object.keys(bucket).forEach(k => {
      const list = bucket[k];
      if (list.length >= 2 && list[1].round + 1 === round) out.add(list[1].playerId);
    });
    return out;
  }

  /** Players who will be suspended from the next round to be drawn. */
  function nextBans(s) { return bannedForRound(s, s.currentRound + 1); }

  /** Cards grouped per player for the public lists. */
  function cardsByPlayer(s, type) {
    const map = {};
    s.cards.filter(c => c.type === type).forEach(c => {
      const p = s.players.find(x => x.id === c.playerId);
      if (!p) return;
      (map[p.id] = map[p.id] || { player: p, count: 0, items: [] });
      map[p.id].count++;
      map[p.id].items.push({ reason: c.reason, round: c.round });
    });
    return Object.keys(map).map(k => map[k])
      .sort((a, b) => b.count - a.count || a.player.name.localeCompare(b.player.name));
  }

  return { resultPoints, scoreText, sessionOf, isSubmitted, roundMatches, playerMatch,
           standings, standingsMap, bannedForRound, nextBans, cardsByPlayer };
})();
