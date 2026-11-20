/* ==========================================================================
 * Alcázar Chess — admin panel
 *   Tabs: Players & Draw · Results entry · Cards · Drink orders · Settings
 * ========================================================================== */
window.AC = window.AC || {};
AC.views = AC.views || {};

AC.views.admin = (function () {
  const { h, nameSpan, toast } = AC.ui, t = AC.i18n.t, S = AC.store, C = AC.calc, cfg = AC.config;
  const VS = () => AC.viewState;

  const TABS = [['players', '👥', 'admin.tab.players'], ['results', '✍️', 'admin.tab.results'],
    ['cards', '🟨', 'admin.tab.cards'], ['orders', '☕', 'admin.tab.orders'], ['settings', '⚙️', 'admin.tab.settings']];

  const say = res => { if (res && !res.ok) { toast(t(res.error), 'error'); return false; } return true; };
  const roundLabel = s => s.currentRound ? t('common.roundOf', { n: s.currentRound, total: cfg.TOTAL_ROUNDS }) : t('tournament.notStarted');

  function render(tab) {
    const body = ({ players: playersTab, results: resultsTab, cards: cardsTab, orders: ordersTab, settings: settingsTab }[tab] || playersTab)();
    return h('div', { class: 'admin' },
      h('nav', { class: 'admin-tabs', role: 'tablist' }, TABS.map(([k, icon, label]) =>
        h('a', { href: '#/admin/' + k, role: 'tab', class: 'atab' + (k === tab ? ' active' : '') }, icon + ' ' + t(label)))),
      body);
  }

  /* ================================================================ PLAYERS & DRAW */
  function playersTab() {
    const s = S.get();
    return h('div', null, drawPanel(s), addPlayerForm(s), groupList('A', s), groupList('B', s));
  }

  function drawPanel(s) {
    const cur = s.currentRound, submitted = C.isSubmitted(s, cur);
    const complete = cur >= cfg.TOTAL_ROUNDS && submitted;
    const nextN = cur === 0 ? 1 : cur + 1;
    const bans = [...C.nextBans(s)].map(id => S.player(id)).filter(Boolean);

    const doDraw = async redo => {
      if (redo && !(await AC.ui.confirmBox(t('draw.redoAsk', { n: cur }), { danger: true }))) return;
      const res = S.drawRound(redo);
      if (say(res)) toast(t('draw.done', { n: res.round }), 'success');
    };

    let actions;
    if (complete) actions = h('p', { class: 'notice ok' }, '🏁 ' + t('draw.complete'));
    else if (cur === 0 || submitted) {
      actions = h('button', { class: 'btn btn-gold btn-lg', type: 'button', onclick: () => doDraw(false) },
        '🎲 ' + t('admin.draw') + ' — ' + t('common.round') + ' ' + nextN);
    } else {
      actions = [h('p', { class: 'notice' }, t('draw.finishFirst', { n: cur })),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => doDraw(true) }, '🔁 ' + t('draw.redo', { n: cur }))];
    }

    return h('section', { class: 'card draw-panel' },
      h('h3', null, '🎲 ' + t('draw.title')),
      h('p', { class: 'pill' }, roundLabel(s)),
      h('p', { class: 'muted' }, nextN === 1 ? t('draw.rule1') : t('draw.rule2')),
      actions,
      bans.length ? h('p', { class: 'notice warn' }, '⛔ ' + t('draw.bansNext') + ': ', bans.map((p, i) => [i ? ', ' : '', nameSpan(p)])) : null);
  }

  function addPlayerForm(s) {
    const name = h('input', { type: 'text', required: true, placeholder: t('players.fullName'), dir: 'auto' });
    const elo = h('input', { type: 'number', min: '0', max: '3500', required: true, value: '1200', inputmode: 'numeric' });
    const group = h('select', { value: VS().newGroup }, h('option', { value: 'A' }, t('common.group') + ' A'), h('option', { value: 'B' }, t('common.group') + ' B'));
    const code = h('input', { type: 'text', required: true, value: S.generateCode(), dir: 'ltr', class: 'code-input' });
    const form = h('form', { class: 'card add-form', onsubmit: e => {
      e.preventDefault();
      VS().newGroup = group.value;
      if (say(S.addPlayer({ name: name.value, elo: elo.value, group: group.value, code: code.value }))) toast(t('players.added'), 'success');
    } },
      h('h3', null, '➕ ' + t('players.add')),
      h('div', { class: 'form-grid' },
        h('label', null, t('players.fullName'), name),
        h('label', null, t('common.elo'), elo),
        h('label', null, t('common.group'), group),
        h('label', null, t('common.code'), h('span', { class: 'inline' }, code,
          h('button', { type: 'button', class: 'btn btn-ghost btn-sm', title: t('players.newCode'),
            onclick: () => { code.value = S.generateCode(); } }, '🎲')))),
      h('button', { type: 'submit', class: 'btn btn-primary' }, t('players.add')));
    return form;
  }

  function editPlayer(p) {
    const name = h('input', { type: 'text', value: p.name, dir: 'auto' });
    const elo = h('input', { type: 'number', value: String(p.elo) });
    const group = h('select', { value: p.group }, h('option', { value: 'A' }, 'A'), h('option', { value: 'B' }, 'B'));
    const code = h('input', { type: 'text', value: p.code, dir: 'ltr' });
    const body = h('div', { class: 'form-grid one' },
      h('label', null, t('players.fullName'), name), h('label', null, t('common.elo'), elo),
      h('label', null, t('common.group'), group), h('label', null, t('common.code'), code));
    AC.ui.modal(t('players.edit'), body, [
      { label: t('common.cancel'), class: 'btn-ghost' },
      { label: t('common.save'), class: 'btn-primary',
        onclick: () => say(S.updatePlayer(p.id, { name: name.value, elo: elo.value, group: group.value, code: code.value })) ? undefined : false }
    ]);
  }

  function groupList(g, s) {
    const list = s.players.filter(p => p.group === g).sort((a, b) => b.elo - a.elo);
    return h('section', { class: 'card' },
      h('h3', { class: 'group-title g' + g }, t('common.group') + ' ' + g + ' — ' + list.length + '/' + cfg.MAX_PLAYERS_PER_GROUP),
      list.length ? h('div', { class: 'table-wrap' }, h('table', { class: 'data' },
        h('thead', null, h('tr', null, h('th', null, '#'), h('th', null, t('common.name')), h('th', { class: 'num' }, t('common.elo')),
          h('th', null, t('common.code')), h('th', null, ''))),
        h('tbody', null, list.map((p, i) => h('tr', { class: p.active === false ? 'inactive' : '' },
          h('td', null, i + 1),
          h('td', null, nameSpan(p), p.active === false ? h('span', { class: 'badge' }, t('players.withdrawn')) : null),
          h('td', { class: 'num' }, p.elo),
          h('td', null, h('code', { class: 'copyable', title: t('common.copy'), onclick: () => AC.ui.copyText(p.code).then(() => toast(t('common.copied'), 'success')) }, p.code)),
          h('td', { class: 'row-actions' },
            h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => editPlayer(p) }, '✏️'),
            h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: p.active === false ? t('players.reactivate') : t('players.withdraw'),
              onclick: () => S.setActive(p.id, p.active === false) }, p.active === false ? '↩️' : '🚪'),
            h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: t('common.delete'), onclick: async () => {
              if (await AC.ui.confirmBox(t('players.deleteAsk', { name: p.name }), { danger: true })) say(S.removePlayer(p.id));
            } }, '🗑️'))))))) : h('p', { class: 'muted' }, t('players.none')));
  }

  /* ================================================================ RESULTS ENTRY */
  function resultsTab() {
    const s = S.get(), r = s.currentRound;
    const wrap = h('div', null);
    if (!r) { wrap.appendChild(h('div', { class: 'card empty' }, t('tournament.notDrawn'))); return wrap; }

    const submitted = C.isSubmitted(s, r);
    const pc = S.pendingCount(r);
    const g = VS().resultsGroup;
    const groupCount = grp => { const ms = C.roundMatches(s, r, grp).filter(m => m.black); return ms.filter(m => m.pending).length + '/' + ms.length; };

    wrap.appendChild(h('div', { class: 'card results-head' },
      h('h3', null, '✍️ ' + t('admin.tab.results') + ' — ' + roundLabel(s)),
      h('p', { class: 'muted' }, t('results.howTo')),
      AC.ui.segmented(['A', 'B'].map(x => ({ value: x, label: t('common.group') + ' ' + x + '  (' + groupCount(x) + ')' })), g,
        v => { VS().resultsGroup = v; AC.app.render(); }, 'group-seg')));

    const tables = h('div', { class: 'rtables' });
    C.roundMatches(s, r, g).forEach(m => {
      if (!m.black) { tables.appendChild(h('div', { class: 'card muted' }, t('tournament.byeNote') + ' ', nameSpan(S.player(m.white)))); return; }
      const locked = submitted || m.auto === 'ban';
      const pick = code => { if (!locked) say(S.setPending(m.id, code)); };
      const st = m.pending;
      const wP = S.player(m.white), bP = S.player(m.black);
      tables.appendChild(h('div', { class: 'rtable-wrap' },
        h('div', { class: 'rtable' + (locked ? ' locked' : '') },
          h('button', { type: 'button', class: 'rside white' + (st === 'W' || st === 'FW' ? ' win' : ''), disabled: locked,
            onclick: () => pick('W'), 'aria-label': t('common.white') + ': ' + wP.name },
            h('small', null, '♔ ' + t('common.white')), nameSpan(wP)),
          h('button', { type: 'button', class: 'rcenter' + (st === 'D' ? ' win' : ''), disabled: locked,
            onclick: () => pick('D'), 'aria-label': t('results.draw') },
            h('span', { class: 'tnum' }, t('common.table') + ' ' + m.table),
            h('span', { class: 'tmid' }, st ? C.scoreText(st) : t('results.draw'))),
          h('button', { type: 'button', class: 'rside black' + (st === 'B' || st === 'FB' ? ' win' : ''), disabled: locked,
            onclick: () => pick('B'), 'aria-label': t('common.black') + ': ' + bP.name },
            h('small', null, '♚ ' + t('common.black')), nameSpan(bP))),
        m.auto === 'ban' ? h('p', { class: 'notice warn small' }, '⛔ ' + t('results.banForfeit'))
          : (!locked ? h('div', { class: 'absent-row' },
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => pick('FB') }, '⏱ ' + t('results.absent')),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => pick('FW') }, '⏱ ' + t('results.absent'))) : null)));
    });
    wrap.appendChild(tables);

    wrap.appendChild(h('div', { class: 'submit-bar' },
      submitted
        ? [h('span', { class: 'ok' }, '✅ ' + t('results.submitted')),
           h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => say(S.reopenRound()) }, '🔓 ' + t('results.reopen'))]
        : [h('span', null, t('results.progress', { done: pc.done, total: pc.total })),
           h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: pc.done < pc.total, onclick: async () => {
             if (say(S.submitRound())) toast(t('results.savedToast'), 'success');
           } }, '✔ ' + t('results.submit'))]));
    return wrap;
  }

  /* ================================================================ CARDS */
  function cardsTab() {
    const s = S.get();
    const sel = h('select', { required: true },
      h('option', { value: '' }, t('cards.choosePlayer')),
      ['A', 'B'].map(g => h('optgroup', { label: t('common.group') + ' ' + g },
        s.players.filter(p => p.group === g).sort((a, b) => a.name.localeCompare(b.name)).map(p => h('option', { value: p.id }, p.name)))));
    const reason = h('input', { type: 'text', placeholder: t('cards.reasonPh'), dir: 'auto' });
    let type = VS().cardType;
    const typeBox = h('div');
    const drawType = () => { typeBox.replaceChildren(AC.ui.segmented([{ value: 'yellow', label: '🟨 ' + t('cards.yellow') }, { value: 'red', label: '🟥 ' + t('cards.red') }], type, v => { type = v; VS().cardType = v; drawType(); })); };
    drawType();

    const form = h('form', { class: 'card add-form', onsubmit: e => {
      e.preventDefault();
      const res = S.issueCard({ playerId: sel.value, type, reason: reason.value });
      if (!say(res)) return;
      if (res.banned) AC.ui.modal('⛔ ' + t('cards.banTitle'), h('p', null, t('cards.banBody', { n: res.round })), [{ label: 'OK', class: 'btn-primary' }]);
      else toast(type === 'yellow' ? t('cards.yellowIssued') : t('cards.redIssued'), 'success');
    } },
      h('h3', null, '🟨🟥 ' + t('admin.tab.cards')),
      h('p', { class: 'muted small' }, t('cards.rule')),
      h('div', { class: 'form-grid' }, h('label', null, t('common.player'), sel), h('label', null, t('cards.reason'), reason)),
      typeBox, h('button', { type: 'submit', class: 'btn btn-primary' }, t('cards.issue')));

    const bans = [...C.nextBans(s)].map(id => S.player(id)).filter(Boolean);
    const list = s.cards.slice().sort((a, b) => b.at - a.at);
    return h('div', null, form,
      bans.length ? h('p', { class: 'notice warn' }, '⛔ ' + t('draw.bansNext') + ': ', bans.map((p, i) => [i ? ', ' : '', nameSpan(p)])) : null,
      h('section', { class: 'card' }, h('h3', null, t('cards.history')),
        list.length ? h('div', { class: 'table-wrap' }, h('table', { class: 'data' },
          h('thead', null, h('tr', null, h('th', null, ''), h('th', null, t('common.player')), h('th', null, t('cards.reason')), h('th', null, t('common.round')), h('th', null, ''))),
          h('tbody', null, list.map(c => h('tr', null,
            h('td', null, c.type === 'yellow' ? '🟨' : '🟥'), h('td', null, nameSpan(S.player(c.playerId))),
            h('td', null, c.reason || '—'), h('td', null, c.round),
            h('td', null, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: t('cards.undo'), onclick: async () => {
              if (await AC.ui.confirmBox(t('cards.undoAsk'), { danger: true })) S.removeCard(c.id);
            } }, '↩️'))))))) : h('p', { class: 'muted' }, t('cards.none'))));
  }

  /* ================================================================ DRINK ORDERS (waiter) */
  function orderRows(s) {
    return S.currentOrders().map(o => {
      const d = s.menu.find(x => x.id === o.drinkId);
      return { o, d, p: S.player(o.playerId), seat: S.seatOf(o.playerId) };
    }).filter(r => r.p).sort((a, b) => a.p.name.localeCompare(b.p.name));
  }

  function summarize(rows) {
    const m = {};
    rows.forEach(r => {
      const k = r.o.drinkId + '|' + (r.o.sugar || '');
      (m[k] = m[k] || { d: r.d, sugar: r.o.sugar, n: 0 }).n++;
    });
    return Object.keys(m).map(k => m[k]).sort((a, b) => b.n - a.n);
  }

  /** Plain-text order sheet for the waiter, in any language. */
  function buildOrderText(lang) {
    const s = S.get(), T = (k, v) => AC.i18n.t(k, v, lang);
    const rows = orderRows(s);
    const dn = d => d ? AC.i18n.drinkName(d, lang) : '?';
    const lines = ['☕ Coffee Nisa — Alcázar Chess', T('orders.sheetTitle', { n: Math.max(s.currentRound, 1) }), ''];
    lines.push('== ' + T('orders.summary') + ' ==');
    summarize(rows).forEach(x => lines.push('• ' + x.n + ' × ' + dn(x.d) + (x.sugar ? ' — ' + T('sugar.' + x.sugar) : '')));
    lines.push('', '== ' + T('orders.byPlayer') + ' ==');
    rows.forEach(r => lines.push((r.seat ? r.seat.group + r.seat.table : '–') + ' | ' + r.p.name + ' | ' + dn(r.d) + (r.o.sugar ? ' (' + T('sugar.' + r.o.sugar) + ')' : '')));
    lines.push('', T('orders.total', { n: rows.length }));
    return lines.join('\n');
  }

  function ordersTab() {
    const s = S.get(), rows = orderRows(s), sum = summarize(rows);
    const lang = VS().exportLang || AC.i18n.lang();
    const waiting = s.players.filter(p => p.active !== false && !S.orderFor(p.id)).length;

    const langSel = h('select', { value: lang, onchange: e => { VS().exportLang = e.target.value; AC.app.render(); } },
      ['ar', 'fr', 'en'].map(l => h('option', { value: l }, t('lang.' + l))));

    return h('div', null,
      h('section', { class: 'card' },
        h('h3', null, '☕ ' + t('orders.title')),
        h('p', { class: 'muted' }, t('orders.stats', { n: rows.length, w: waiting })),
        h('div', { class: 'export-bar' },
          h('label', null, t('orders.exportLang'), langSel),
          h('button', { class: 'btn btn-primary', type: 'button', disabled: !rows.length, onclick: () =>
            AC.ui.copyText(buildOrderText(lang)).then(ok => toast(ok ? t('common.copied') : t('orders.copyFail'), ok ? 'success' : 'error')) }, '📋 ' + t('orders.copy')),
          h('button', { class: 'btn btn-ghost', type: 'button', disabled: !rows.length, onclick: () =>
            AC.ui.download('coffee-nisa-orders-round' + Math.max(s.currentRound, 1) + '.txt', buildOrderText(lang)) }, '⬇️ ' + t('orders.download'))),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => {
          if (await AC.ui.confirmBox(t('orders.newRoundAsk'), { danger: true })) { S.newOrderRound(); toast(t('orders.newRoundDone'), 'success'); }
        } }, '🔄 ' + t('orders.newRound'))),
      h('section', { class: 'card' }, h('h3', null, t('orders.summary')),
        sum.length ? h('ul', { class: 'summary' }, sum.map(x => h('li', null, h('strong', null, x.n + ' ×'), ' ' + (x.d ? x.d.emoji + ' ' + AC.i18n.drinkName(x.d) : '?'),
          x.sugar ? h('span', { class: 'badge' }, t('sugar.' + x.sugar)) : null))) : h('p', { class: 'muted' }, t('orders.none'))),
      h('section', { class: 'card' }, h('h3', null, t('orders.byPlayer')),
        rows.length ? h('div', { class: 'table-wrap' }, h('table', { class: 'data' },
          h('thead', null, h('tr', null, h('th', null, t('common.table')), h('th', null, t('common.name')), h('th', null, t('orders.drink')), h('th', null, t('orders.sugar')), h('th', null, ''))),
          h('tbody', null, rows.map(r => h('tr', null,
            h('td', null, r.seat ? r.seat.group + r.seat.table : '–'), h('td', null, nameSpan(r.p)),
            h('td', null, r.d ? r.d.emoji + ' ' + AC.i18n.drinkName(r.d) : '?'), h('td', null, r.o.sugar ? t('sugar.' + r.o.sugar) : '—'),
            h('td', null, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: t('orders.cancel'), onclick: async () => {
              if (await AC.ui.confirmBox(t('orders.cancelAsk', { name: r.p.name }), { danger: true })) S.cancelOrder(r.o.id);
            } }, '✖'))))))) : h('p', { class: 'muted' }, t('orders.none'))));
  }

  /* ================================================================ SETTINGS */
  function settingsTab() {
    const s = S.get();

    // admin credentials
    const an = h('input', { type: 'text', value: s.admin.name, dir: 'auto' });
    const ap = h('input', { type: 'text', value: s.admin.pass, dir: 'ltr' });
    const creds = h('form', { class: 'card', onsubmit: e => { e.preventDefault(); if (say(S.setAdminCreds(an.value, ap.value))) toast(t('settings.saved'), 'success'); } },
      h('h3', null, '🔑 ' + t('settings.creds')), h('p', { class: 'muted small' }, t('settings.credsNote')),
      h('div', { class: 'form-grid' }, h('label', null, t('admin.login.name'), an), h('label', null, t('admin.login.pass'), ap)),
      h('button', { class: 'btn btn-primary', type: 'submit' }, t('common.save')));

    // drink menu
    const dAr = h('input', { type: 'text', placeholder: 'العربية', dir: 'rtl' });
    const dFr = h('input', { type: 'text', placeholder: 'Français' });
    const dEn = h('input', { type: 'text', placeholder: 'English' });
    const dSugar = h('input', { type: 'checkbox', checked: true });
    const menu = h('section', { class: 'card' },
      h('h3', null, '🍵 ' + t('settings.menu') + ' — Coffee Nisa'),
      h('ul', { class: 'menu-list' }, s.menu.map(d => h('li', { class: d.available ? '' : 'inactive' },
        h('span', null, d.emoji + ' ' + AC.i18n.drinkName(d) + (d.sugar ? ' · ' + t('settings.hasSugar') : '')),
        h('span', { class: 'row-actions' },
          h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => S.toggleDrink(d.id) }, d.available ? t('settings.hide') : t('settings.show')),
          h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: async () => { if (await AC.ui.confirmBox(t('common.confirm'), { danger: true })) S.removeDrink(d.id); } }, '🗑️')))),
      ),
      h('form', { onsubmit: e => { e.preventDefault(); if (say(S.addDrink({ ar: dAr.value, fr: dFr.value, en: dEn.value, sugar: dSugar.checked }))) toast(t('settings.saved'), 'success'); } },
        h('h4', null, t('settings.addDrink')),
        h('div', { class: 'form-grid' }, dAr, dFr, dEn),
        h('label', { class: 'check' }, dSugar, ' ' + t('settings.hasSugar')),
        h('button', { class: 'btn btn-primary', type: 'submit' }, t('settings.addDrink'))));

    // data tools
    const file = h('input', { type: 'file', accept: 'application/json,.json', class: 'hidden', onchange: async e => {
      const f = e.target.files[0]; if (!f) return;
      if (await AC.ui.confirmBox(t('settings.importAsk'), { danger: true })) say(S.importJSON(await f.text())) && toast(t('settings.saved'), 'success');
    } });
    const tools = h('section', { class: 'card' },
      h('h3', null, '🗂️ ' + t('settings.data')),
      h('p', { class: 'muted small' }, t('settings.backend', { b: cfg.BACKEND })),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => AC.ui.download('alcazar-backup.json', S.exportJSON(), 'application/json') }, '⬇️ ' + t('settings.export')),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => file.click() }, '⬆️ ' + t('settings.import')), file,
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => { if (await AC.ui.confirmBox(t('settings.demoAsk'), { danger: true })) { S.loadDemo(); toast(t('settings.saved'), 'success'); } } }, '🧪 ' + t('settings.loadDemo')),
        h('button', { class: 'btn btn-danger', type: 'button', onclick: async () => { if (await AC.ui.confirmBox(t('settings.resetAsk'), { danger: true })) { S.resetTournament(true); toast(t('settings.saved'), 'success'); } } }, '♻️ ' + t('settings.resetKeep')),
        h('button', { class: 'btn btn-danger', type: 'button', onclick: async () => { if (await AC.ui.confirmBox(t('settings.wipeAsk'), { danger: true })) { S.resetTournament(false); toast(t('settings.saved'), 'success'); } } }, '🧹 ' + t('settings.resetAll'))));

    return h('div', null, creds, menu, tools);
  }

  return { render };
})();
