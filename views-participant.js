/* ==========================================================================
 * Alcázar Chess — participant views (the 6 sections + welcome dashboard)
 * ========================================================================== */
window.AC = window.AC || {};
AC.views = AC.views || {};

AC.views.participant = (function () {
  const { h, nameSpan } = AC.ui, t = AC.i18n.t, S = AC.store, C = AC.calc, cfg = AC.config;

  const back = () => h('a', { class: 'btn btn-ghost back', href: '#/home' }, '← ' + t('nav.home'));
  const pageHead = (icon, title, sub) =>
    h('div', { class: 'page-head' }, back(), h('h2', null, icon + ' ' + title), sub ? h('p', { class: 'sub' }, sub) : null);
  const empty = msg => h('div', { class: 'empty card' }, msg);
  const roundLabel = s => s.currentRound ? t('common.roundOf', { n: s.currentRound, total: cfg.TOTAL_ROUNDS }) : t('tournament.notStarted');

  /* ------------------------------------------------------------------ HOME */
  function home(me) {
    const s = S.get();
    const tiles = [
      ['/tournament', '♟️', 'home.tournament', 'home.tournamentDesc'],
      ['/drinks', '☕', 'home.drinks', 'home.drinksDesc'],
      ['/standings', '🏆', 'home.standings', 'home.standingsDesc'],
      ['/results', '📋', 'home.results', 'home.resultsDesc'],
      ['/rules', '📜', 'home.rules', 'home.rulesDesc'],
      ['/cards', '🟨', 'home.cards', 'home.cardsDesc']
    ];

    // "your game" banner for the live round
    let game = null;
    const seat = S.seatOf(me.id);
    if (seat) {
      const m = seat.match;
      if (m.black) {
        const opp = S.player(m.white === me.id ? m.black : m.white);
        game = h('div', { class: 'game-banner' },
          h('strong', null, t('home.yourGame') + ' — ' + roundLabel(s)),
          h('div', null, t('common.group') + ' ' + seat.group + ' · ' + t('common.table') + ' ' + seat.table + ' · ',
            seat.color === 'W' ? t('common.white') : t('common.black'), ' · ' + t('home.vs') + ' ', nameSpan(opp)));
      } else game = h('div', { class: 'game-banner' }, h('strong', null, t('home.bye')));
    } else if (s.currentRound) {
      game = h('div', { class: 'game-banner muted' }, t('home.noGame'));
    }

    return h('div', { class: 'home' },
      h('section', { class: 'welcome' },
        AC.views.public.logo('logo-md'),
        h('h1', null, t('welcome')),
        h('p', { class: 'who' }, t('home.hello') + ' ', nameSpan(me), ' · ' + t('common.group') + ' ' + me.group),
        h('p', { class: 'pill' }, roundLabel(s))),
      game,
      h('nav', { class: 'tiles' }, tiles.map(([href, icon, k, d]) =>
        h('a', { class: 'tile', href: '#' + href },
          h('span', { class: 'tile-icon' }, icon),
          h('span', { class: 'tile-text' }, h('strong', null, t(k)), h('small', null, t(d)))))));
  }

  /* ------------------------------------------------------------ 1. TOURNAMENT */
  function tournament(me) {
    const s = S.get(), r = s.currentRound;
    const wrap = h('div', null, pageHead('♟️', t('home.tournament'), roundLabel(s)));
    if (!r) { wrap.appendChild(empty(t('tournament.notDrawn'))); return wrap; }

    ['A', 'B'].forEach(g => {
      const ms = C.roundMatches(s, r, g);
      const bye = ms.find(m => !m.black);
      const grid = h('div', { class: 'table-grid' });
      for (let n = 1; n <= cfg.TABLES_PER_GROUP; n++) {
        const m = ms.find(x => x.table === n && x.black);
        if (!m) { grid.appendChild(h('div', { class: 'tcard missing' }, h('div', { class: 'tcard-head' }, t('common.table') + ' ' + n), h('p', { class: 'muted' }, '—'))); continue; }
        const mine = m.white === me.id || m.black === me.id;
        const done = C.isSubmitted(s, r);
        grid.appendChild(h('div', { class: 'tcard' + (mine ? ' mine' : '') },
          h('div', { class: 'tcard-head' }, h('span', null, t('common.table') + ' ' + n),
            mine ? h('span', { class: 'badge you' }, t('tournament.you')) : null,
            done ? h('span', { class: 'badge score' }, C.scoreText(m.result)) : null,
            m.auto === 'ban' ? h('span', { class: 'badge warn' }, t('tournament.banned')) : null),
          h('div', { class: 'seat white' }, h('span', { class: 'dot w' }), h('small', null, t('common.white')), nameSpan(S.player(m.white))),
          h('div', { class: 'seat black' }, h('span', { class: 'dot b' }), h('small', null, t('common.black')), nameSpan(S.player(m.black)))));
      }
      wrap.appendChild(h('section', { class: 'group-block' },
        h('h3', { class: 'group-title g' + g }, t('common.group') + ' ' + g), grid,
        bye ? h('p', { class: 'muted' }, t('tournament.byeNote') + ' ', nameSpan(S.player(bye.white))) : null));
    });
    return wrap;
  }

  /* ---------------------------------------------------------------- 2. DRINKS */
  function drinks(me) {
    const s = S.get();
    const wrap = h('div', null, pageHead('☕', t('home.drinks'), t('drinks.subtitle')));
    const existing = S.orderFor(me.id);

    if (existing) {
      const d = s.menu.find(x => x.id === existing.drinkId);
      wrap.appendChild(h('div', { class: 'card order-done' },
        h('div', { class: 'big-icon' }, '✅'),
        h('h3', null, t('drinks.confirmed')),
        h('p', { class: 'order-line' }, (d ? d.emoji + ' ' + AC.i18n.drinkName(d) : '—') +
          (existing.sugar ? ' · ' + t('sugar.' + existing.sugar) : '')),
        h('p', { class: 'muted' }, t('drinks.locked'))));
      return wrap;
    }

    const avail = s.menu.filter(d => d.available);
    if (!avail.length) { wrap.appendChild(empty(t('drinks.none'))); return wrap; }

    let drinkId = null, sugar = null;
    const list = h('div', { class: 'drink-list' });
    const sugarBox = h('div', { class: 'sugar-box' });
    const confirmBtn = h('button', { class: 'btn btn-primary btn-block', type: 'button', disabled: true }, t('drinks.confirmBtn'));

    function refresh() {
      const d = avail.find(x => x.id === drinkId);
      list.querySelectorAll('.drink').forEach(el => el.classList.toggle('selected', el.dataset.id === drinkId));
      sugarBox.replaceChildren();
      if (d && d.sugar) {
        sugarBox.appendChild(h('h4', null, t('drinks.sugarLevel')));
        sugarBox.appendChild(AC.ui.segmented(
          ['none', 'low', 'medium', 'sweet'].map(v => ({ value: v, label: t('sugar.' + v) })),
          sugar, v => { sugar = v; refresh(); }, 'sugar-seg'));
      }
      confirmBtn.disabled = !d || (d.sugar && !sugar);
    }

    avail.forEach(d => list.appendChild(h('button', { type: 'button', class: 'drink', 'data-id': d.id,
      onclick: () => { drinkId = d.id; sugar = null; refresh(); } },
      h('span', { class: 'drink-emoji' }, d.emoji), h('span', null, AC.i18n.drinkName(d)))));

    confirmBtn.addEventListener('click', async () => {
      const d = avail.find(x => x.id === drinkId);
      const label = AC.i18n.drinkName(d) + (d.sugar ? ' — ' + t('sugar.' + sugar) : '');
      const ok = await AC.ui.confirmBox(t('drinks.confirmAsk', { drink: label }), { okLabel: t('drinks.confirmBtn') });
      if (!ok) return;
      const res = S.placeOrder(me.id, drinkId, sugar);
      if (!res.ok) AC.ui.toast(t(res.error), 'error'); else AC.ui.toast(t('drinks.confirmed'), 'success');
    });

    wrap.appendChild(h('div', { class: 'notice' }, '☝️ ' + t('drinks.limit')));
    wrap.appendChild(list); wrap.appendChild(sugarBox); wrap.appendChild(confirmBtn);
    refresh();
    return wrap;
  }

  /* -------------------------------------------------------------- 3. STANDINGS */
  function standings(me) {
    const rows = C.standings(S.get());
    const wrap = h('div', null, pageHead('🏆', t('home.standings'), t('standings.note')));
    if (!rows.length) { wrap.appendChild(empty(t('standings.empty'))); return wrap; }
    wrap.appendChild(h('div', { class: 'table-wrap card' }, h('table', { class: 'data standings' },
      h('thead', null, h('tr', null, h('th', null, t('common.rank')), h('th', null, t('common.name')),
        h('th', null, t('common.group')), h('th', { class: 'num' }, t('common.points')))),
      h('tbody', null, rows.map(r => h('tr', { class: (r.player.id === me.id ? 'me ' : '') + (r.rank <= 3 ? 'top' + r.rank : '') },
        h('td', { class: 'rank' }, r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank),
        h('td', null, nameSpan(r.player),
          r.yellow ? h('span', { class: 'mini-card y', title: t('cards.yellow') }, '🟨' + (r.yellow > 1 ? '×' + r.yellow : '')) : null,
          r.red ? h('span', { class: 'mini-card r', title: t('cards.red') }, '🟥') : null,
          r.player.active === false ? h('span', { class: 'badge' }, t('players.withdrawn')) : null),
        h('td', null, h('span', { class: 'group-tag g' + r.player.group }, r.player.group)),
        h('td', { class: 'num pts' }, r.total)))))));
    return wrap;
  }

  /* ---------------------------------------------------------- 4. PAST RESULTS */
  function pastResults(me) {
    const s = S.get();
    const vs = AC.viewState.past;
    const rounds = Object.keys(s.rounds).map(Number).filter(r => C.isSubmitted(s, r)).sort((a, b) => b - a);
    const wrap = h('div', null, pageHead('📋', t('home.results'), t('results.sub')));
    if (!rounds.length) { wrap.appendChild(empty(t('results.empty'))); return wrap; }

    const list = h('div', { class: 'results-list' });
    function draw() {
      list.replaceChildren();
      let any = false;
      rounds.filter(r => vs.round === 'all' || String(r) === vs.round).forEach(r => {
        const blocks = ['A', 'B'].filter(g => vs.group === 'all' || vs.group === g).map(g => {
          const rows = C.roundMatches(s, r, g).filter(m => m.black)
            .filter(m => vs.player === 'all' || m.white === vs.player || m.black === vs.player);
          if (!rows.length) return null;
          any = true;
          return h('div', { class: 'res-group' }, h('h4', { class: 'g' + g }, t('common.group') + ' ' + g),
            rows.map(m => h('div', { class: 'mrow' + (m.white === me.id || m.black === me.id ? ' mine' : '') },
              h('span', { class: 'mt' }, 'T' + m.table),
              h('span', { class: 'mw' }, nameSpan(S.player(m.white))),
              h('span', { class: 'ms res-' + m.result }, C.scoreText(m.result)),
              h('span', { class: 'mb' }, nameSpan(S.player(m.black))))));
        }).filter(Boolean);
        if (blocks.length) list.appendChild(h('section', { class: 'card round-card' }, h('h3', null, t('common.round') + ' ' + r), blocks));
      });
      if (!any) list.appendChild(empty(t('results.noMatch')));
    }

    const sel = (key, opts) => h('select', { onchange: e => { vs[key] = e.target.value; draw(); }, value: vs[key] },
      opts.map(o => h('option', { value: o[0] }, o[1])));
    const players = s.players.slice().sort((a, b) => a.name.localeCompare(b.name));
    wrap.appendChild(h('div', { class: 'filters card' },
      h('label', null, t('common.round'), sel('round', [['all', t('common.all')]].concat(rounds.map(r => [String(r), t('common.round') + ' ' + r])))),
      h('label', null, t('common.group'), sel('group', [['all', t('common.all')], ['A', 'A'], ['B', 'B']])),
      h('label', null, t('common.player'), sel('player', [['all', t('common.all')]].concat(players.map(p => [p.id, p.name]))))));
    wrap.appendChild(list);
    wrap.appendChild(h('p', { class: 'muted small' }, t('results.forfeitNote')));
    draw();
    return wrap;
  }

  /* ------------------------------------------------------------------ 5. RULES */
  function rules() {
    const sections = AC.i18n.get('rules.sections') || [];
    const icons = ['⏱️', '🤝', '🕘', '💶'];
    return h('div', null, pageHead('📜', t('home.rules'), t('rules.sub')),
      sections.map((sec, i) => h('details', { class: 'card rule-sec', open: true },
        h('summary', null, h('span', { class: 'ri' }, icons[i] || '•'), ' ', sec.title),
        h('ul', null, sec.items.map(it => h('li', null, it))))));
  }

  /* ------------------------------------------------------------------ 6. CARDS */
  function cards() {
    const s = S.get();
    const block = (type, icon) => {
      const rows = C.cardsByPlayer(s, type);
      return h('section', { class: 'card card-list ' + type },
        h('h3', null, icon + ' ' + t('cards.' + type) + ' (' + rows.reduce((a, r) => a + r.count, 0) + ')'),
        type === 'yellow' ? h('p', { class: 'muted small' }, t('cards.yellowNote')) : null,
        rows.length ? rows.map(r => h('div', { class: 'card-row' },
          h('div', { class: 'cr-head' }, nameSpan(r.player), h('span', { class: 'count' }, '×' + r.count)),
          h('ul', null, r.items.map(i => h('li', null, (i.reason || t('cards.noReason')) + ' · ' + t('common.round') + ' ' + i.round)))))
          : h('p', { class: 'muted' }, t('cards.none')));
    };
    return h('div', null, pageHead('🟨🟥', t('home.cards'), null),
      h('div', { class: 'two-col' }, block('yellow', '🟨'), block('red', '🟥')));
  }

  return { home, tournament, drinks, standings, pastResults, rules, cards };
})();
