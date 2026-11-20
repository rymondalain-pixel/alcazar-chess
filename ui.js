/* ==========================================================================
 * Alcázar Chess — tiny UI toolkit (DOM builder, toast, modal, clipboard…)
 * All text goes through textContent, so player names can never inject HTML.
 * ========================================================================== */
window.AC = window.AC || {};

AC.ui = (function () {
  /** h('div', {class:'x', onclick:fn}, child, [children], 'text') */
  function h(tag, attrs) {
    const kids = Array.prototype.slice.call(arguments, 2);
    const el = document.createElement(tag);
    let pendingValue;
    if (attrs) Object.keys(attrs).forEach(k => {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'value') pendingValue = v;               // set after <option>s exist
      else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'disabled' || k === 'checked' || k === 'selected') el[k] = true;
      else el.setAttribute(k, v === true ? '' : v);
    });
    append(el, kids);
    if (pendingValue !== undefined) el.value = pendingValue;
    return el;
  }

  function append(el, kids) {
    kids.forEach(k => {
      if (k === null || k === undefined || k === false) return;
      if (Array.isArray(k)) append(el, k);
      else el.appendChild(k.nodeType ? k : document.createTextNode(String(k)));
    });
  }

  function toast(msg, type) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const el = h('div', { class: 'toast ' + (type || '') }, msg);
    box.appendChild(el);
    setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, 3400);
  }

  /**
   * modal(title, bodyNode, [{label, class, onclick}], onClose)
   * A button's onclick may return false to keep the modal open.
   */
  function modal(title, body, buttons, onClose) {
    let closed = false;
    function close(byUser) {
      if (closed) return;
      closed = true;
      overlay.remove();
      document.removeEventListener('keydown', esc);
      if (onClose) onClose(byUser);
    }
    function esc(e) { if (e.key === 'Escape') close(true); }
    const overlay = h('div', { class: 'modal-overlay', onclick: e => { if (e.target === overlay) close(true); } },
      h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
        h('h3', null, title),
        h('div', { class: 'modal-body' }, body),
        h('div', { class: 'modal-actions' }, (buttons || []).map(b =>
          h('button', { type: 'button', class: 'btn ' + (b.class || ''), onclick: async () => {
            const r = b.onclick ? await b.onclick() : undefined;
            if (r !== false) close(false);
          } }, b.label)))));
    document.body.appendChild(overlay);
    document.addEventListener('keydown', esc);
    const first = overlay.querySelector('input,select,textarea');
    if (first) first.focus();
    return () => close(false);
  }

  /** Promise<boolean> confirmation dialog. */
  function confirmBox(message, opts) {
    opts = opts || {};
    const t = AC.i18n.t;
    return new Promise(resolve => {
      let answered = false;
      modal(opts.title || t('common.confirm'), h('p', null, message), [
        { label: t('common.cancel'), class: 'btn-ghost', onclick: () => { answered = true; resolve(false); } },
        { label: opts.okLabel || t('common.confirm'), class: opts.danger ? 'btn-danger' : 'btn-primary',
          onclick: () => { answered = true; resolve(true); } }
      ], () => { if (!answered) resolve(false); });
    });
  }

  function copyText(text) {
    const fallback = () => {
      const ta = h('textarea', { style: 'position:fixed;opacity:0;top:0' });
      ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      ta.remove(); return ok;
    };
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => fallback());
    }
    return Promise.resolve(fallback());
  }

  /** Downloads text as a UTF-8 file (BOM so Arabic opens correctly in Notepad/Excel). */
  function download(filename, text, mime) {
    const blob = new Blob(['﻿' + text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /** Segmented button group. */
  function segmented(options, value, onChange, cls) {
    const wrap = h('div', { class: 'segmented ' + (cls || ''), role: 'group' });
    options.forEach(o => {
      wrap.appendChild(h('button', {
        type: 'button', class: 'seg' + (o.value === value ? ' active' : ''), 'aria-pressed': String(o.value === value),
        onclick: () => onChange(o.value)
      }, o.label));
    });
    return wrap;
  }

  const nameSpan = p => h('span', { class: 'pname', dir: 'auto' }, p ? p.name : '—');

  return { h, toast, modal, confirmBox, copyText, download, segmented, nameSpan };
})();
