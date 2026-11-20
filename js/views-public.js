/* ==========================================================================
 * Alcázar Chess — public views: landing/login + admin login
 * ========================================================================== */
window.AC = window.AC || {};
AC.views = AC.views || {};

AC.views.public = (function () {
  const { h } = AC.ui, t = AC.i18n.t, S = AC.store;

  function logo(cls) {
    return h('img', { class: 'logo ' + (cls || ''), src: 'assets/logo.svg', alt: 'Alcázar Chess', width: '120', height: '120' });
  }

  /** Landing page: brand, description, participant login, discreet Admin link. */
  function landing() {
    const err = h('p', { class: 'form-error', role: 'alert' });
    const name = h('input', { type: 'text', id: 'login-name', required: true, autocomplete: 'name',
      placeholder: t('login.namePh'), dir: 'auto' });
    const code = h('input', { type: 'text', id: 'login-code', required: true, autocomplete: 'off',
      autocapitalize: 'characters', spellcheck: 'false', placeholder: t('login.codePh'), dir: 'ltr' });

    const form = h('form', { class: 'card login-card', novalidate: true, onsubmit: e => {
      e.preventDefault();
      const p = S.findPlayer(name.value, code.value);
      if (!p) { err.textContent = t('login.error'); return; }
      AC.app.setSession({ role: 'player', id: p.id });
      AC.app.go('/home');
    } },
      h('h2', null, t('login.title')),
      h('label', { for: 'login-name' }, t('login.name')), name,
      h('label', { for: 'login-code' }, t('login.code')), code,
      h('p', { class: 'hint' }, t('login.codeHint')),
      err,
      h('button', { type: 'submit', class: 'btn btn-primary btn-block' }, t('login.submit')));

    const s = S.get();
    let demo = null;
    if (AC.config.DEMO_MODE && s.demo && s.players.length) {
      const p = s.players[1] || s.players[0];
      demo = h('div', { class: 'demo-hint' },
        h('strong', null, t('login.demo') + ': '),
        h('span', { dir: 'auto' }, p.name), ' / ', h('code', null, p.code));
    }

    return h('div', { class: 'landing' },
      h('section', { class: 'hero' },
        logo('logo-xl'),
        h('h1', null, 'Alcázar Chess'),
        h('p', { class: 'tagline' }, t('landing.tagline')),
        h('p', { class: 'lead' }, t('landing.description')),
        h('ul', { class: 'chips' },
          h('li', null, '📍 ' + t('landing.place')),
          h('li', null, '☕ Coffee Nisa'),
          h('li', null, '🎓 ' + t('landing.university')))),
      form, demo,
      h('div', { class: 'admin-entry' },
        h('a', { href: '#/admin-login', class: 'admin-link' }, t('login.adminLink'))));
  }

  /** Admin login: Admin Name + secret Admin Password. */
  function adminLogin() {
    const err = h('p', { class: 'form-error', role: 'alert' });
    const name = h('input', { type: 'text', id: 'adm-name', required: true, autocomplete: 'username', dir: 'auto' });
    const pass = h('input', { type: 'password', id: 'adm-pass', required: true, autocomplete: 'current-password' });
    const s = S.get();
    const isDefault = AC.config.DEMO_MODE && s.admin.name === AC.config.DEFAULT_ADMIN.name &&
                      s.admin.pass === AC.config.DEFAULT_ADMIN.pass;

    return h('div', { class: 'landing narrow' },
      h('section', { class: 'hero compact' }, logo('logo-md'), h('h1', null, t('admin.login.title'))),
      h('form', { class: 'card login-card', novalidate: true, onsubmit: e => {
        e.preventDefault();
        if (!S.checkAdmin(name.value, pass.value)) { err.textContent = t('admin.login.error'); return; }
        AC.app.setSession({ role: 'admin' });
        AC.app.go('/admin/players');
      } },
        h('label', { for: 'adm-name' }, t('admin.login.name')), name,
        h('label', { for: 'adm-pass' }, t('admin.login.pass')), pass,
        err,
        h('button', { type: 'submit', class: 'btn btn-primary btn-block' }, t('admin.login.submit'))),
      isDefault ? h('div', { class: 'demo-hint' }, h('strong', null, t('login.demo') + ': '),
        h('code', null, AC.config.DEFAULT_ADMIN.name + ' / ' + AC.config.DEFAULT_ADMIN.pass)) : null,
      h('div', { class: 'admin-entry' }, h('a', { href: '#/', class: 'admin-link' }, '← ' + t('common.back'))));
  }

  return { landing, adminLogin, logo };
})();
