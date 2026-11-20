/* ==========================================================================
 * Alcázar Chess — app shell: hash router, session, header, render loop
 * Routes:  #/  #/admin-login  #/home #/tournament #/drinks #/standings
 *          #/results #/rules #/cards   |   #/admin/{players|results|cards|orders|settings}
 * ========================================================================== */
window.AC = window.AC || {};

// View state that must survive re-renders (filters, selected tabs…)
AC.viewState = { past: { round: 'all', group: 'all', player: 'all' }, resultsGroup: 'A', newGroup: 'A', cardType: 'yellow', exportLang: null };

AC.app = (function () {
  const { h } = AC.ui, t = AC.i18n.t, S = AC.store;
  const SESSION_KEY = 'ac_session';
  let dirty = false, lastPath = null;

  const getSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; } };
  function setSession(s) { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); }
  function go(path) { if (location.hash === '#' + path) render(); else location.hash = path; }
  function logout() { setSession(null); go('/'); }

  function header(sess) {
    const langs = ['ar', 'fr', 'en'];
    return h('header', { class: 'topbar' },
      h('a', { class: 'brand', href: sess ? (sess.role === 'admin' ? '#/admin/players' : '#/home') : '#/' },
        h('img', { src: 'assets/logo.svg', alt: '', width: '34', height: '34' }), h('span', null, 'Alcázar Chess')),
      h('div', { class: 'topbar-right' },
        h('div', { class: 'lang-switch', role: 'group', 'aria-label': 'Language' }, langs.map(l =>
          h('button', { type: 'button', class: 'lang' + (AC.i18n.lang() === l ? ' active' : ''), lang: l,
            'aria-pressed': String(AC.i18n.lang() === l), onclick: () => { AC.i18n.setLang(l); render(); } }, t('lang.short.' + l)))),
        sess ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: logout }, t('nav.logout')) : null));
  }

  function shell(content, sess) {
    return h('div', { class: 'shell' }, header(sess),
      h('main', { class: 'container' }, content),
      h('footer', { class: 'footer' }, '♞ Alcázar Chess · Selouane, Morocco · Coffee Nisa'));
  }

  function resolve(path, sess) {
    const seg = path.split('/').filter(Boolean);
    const P = AC.views.participant, A = AC.views.admin, Pub = AC.views.public;

    if (seg[0] === 'admin-login') {
      if (sess && sess.role === 'admin') return { redirect: '/admin/players' };
      return { view: Pub.adminLogin() };
    }
    if (seg[0] === 'admin') {
      if (!sess || sess.role !== 'admin') return { redirect: '/admin-login' };
      return { view: A.render(seg[1] || 'players') };
    }
    if (!seg.length) {
      if (sess && sess.role === 'admin') return { redirect: '/admin/players' };
      if (sess && sess.role === 'player') return { redirect: '/home' };
      return { view: Pub.landing() };
    }
    // participant area
    if (!sess || sess.role !== 'player') return { redirect: '/' };
    const me = S.player(sess.id);
    if (!me) { setSession(null); return { redirect: '/' }; }
    const map = { home: P.home, tournament: P.tournament, drinks: P.drinks, standings: P.standings,
      results: P.pastResults, rules: P.rules, cards: P.cards };
    const fn = map[seg[0]];
    if (!fn) return { redirect: '/home' };
    return { view: fn(me) };
  }

  function render() {
    const root = document.getElementById('app');
    if (!root || !S.get()) return;
    AC.i18n.apply();
    const path = location.hash.slice(1) || '/';
    const sess = getSession();
    const r = resolve(path, sess);
    if (r.redirect) { location.replace('#' + r.redirect); return; }

    const sameRoute = path === lastPath;
    const y = window.scrollY;
    root.replaceChildren(shell(r.view, sess));
    window.scrollTo(0, sameRoute ? y : 0);
    lastPath = path;
    dirty = false;
  }

  /** Don't wipe a form the admin is typing in because of a remote update. */
  const isTyping = () => { const a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.closest('main'); };

  async function boot() {
    const root = document.getElementById('app');
    root.textContent = '…';
    try { await S.init(); }
    catch (e) {
      console.error(e);
      root.replaceChildren(h('div', { class: 'card empty boot-error' }, h('h2', null, '⚠️'), h('p', null, t('err.backend')),
        h('button', { class: 'btn btn-primary', onclick: () => location.reload() }, t('common.retry'))));
      return;
    }
    S.subscribe(src => {
      if (src === 'error') { AC.ui.toast(t('err.sync'), 'error'); return; }
      if (src === 'remote' && isTyping()) { dirty = true; return; }
      render();
    });
    document.addEventListener('focusout', () => setTimeout(() => { if (dirty && !isTyping()) render(); }, 50));
    window.addEventListener('hashchange', render);
    render();
  }

  return { boot, render, go, setSession, getSession, logout };
})();

document.addEventListener('DOMContentLoaded', () => AC.app.boot());
