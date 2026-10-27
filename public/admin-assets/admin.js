// Meruka admin: shared helpers — calls to the admin API, the toast, and the photo picker (16 Oct 2026)
(function () {
  const A = window.ADMIN = {};

  A.api = async function (method, url, body) {
    const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (r.status === 401) { location.href = '/admin/login?next=' + encodeURIComponent(location.pathname); throw new Error('Please log in again'); }
    if (!r.ok || j.ok === false) throw new Error(j.error || ('Error ' + r.status));
    return j;
  };

  let tt;
  A.toast = function (msg, bad) {
    const t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), bad ? 5000 : 2600);
  };

  // a popup: { title, html, ok, cancel, danger } → resolves with the popup's box when OK is pressed, null otherwise.
  // onOpen(box) can wire up fields; validate(box) returns an error message to keep the popup open.
  A.dialog = function (o) {
    return new Promise(resolve => {
      const m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = '<div class="modal-box" style="width:min(560px,100%)" role="dialog" aria-modal="true"><div class="modal-head"><h2></h2></div><div class="dlg-body"></div><p class="err" hidden></p><div class="dlg-foot"><button type="button" class="btn" data-x></button><button type="button" class="btn" data-ok></button></div></div>';
      m.querySelector('h2').textContent = o.title || '';
      m.querySelector('.dlg-body').innerHTML = o.html || '';
      const okb = m.querySelector('[data-ok]'), xb = m.querySelector('[data-x]'), err = m.querySelector('.err');
      okb.textContent = o.ok || 'OK'; okb.classList.add(o.danger ? 'btn-d' : 'btn-p');
      xb.textContent = o.cancel || 'Cancel'; if (o.cancel === false) xb.hidden = true;
      const box = m.querySelector('.modal-box');
      const close = v => { m.remove(); document.removeEventListener('keydown', key); resolve(v); };
      const go = () => { const e = o.validate && o.validate(box); if (e) { err.textContent = e; err.hidden = false; return; } close(box); };
      const key = e => { if (e.key === 'Escape') close(null); if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); go(); } };
      okb.onclick = go; xb.onclick = () => close(null);
      m.onclick = e => { if (e.target === m) close(null); };
      document.addEventListener('keydown', key);
      document.body.appendChild(m);
      if (o.onOpen) o.onOpen(box, close);
      const first = box.querySelector('input,select,textarea'); (first || okb).focus();
    });
  };
  A.confirm = async (title, text, ok, danger) => !!(await A.dialog({ title, html: '<p>' + A.esc(text) + '</p>', ok: ok || 'Yes', danger }));
  // "Rajasthan Desert Tour" → "rajasthan-desert-tour"
  A.slug = s => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

  A.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // ---- (23 Oct 2026, client) pages of a long list: 20 to a page. Rows a search or filter leaves out carry
  // data-out="1"; the pager shows one page of the others and draws Previous / 1 2 3 … / Next under `after` ----
  A.pager = function (rows, after, size) {
    size = size || 20;
    let page = 0;
    const nav = document.createElement('nav');
    nav.className = 'pager'; nav.setAttribute('aria-label', 'Pages');
    after.insertAdjacentElement('afterend', nav);
    const btn = (label, to, on, off) => '<button type="button" class="pg' + (on ? ' on' : '') + '"' + (off ? ' disabled' : ' data-to="' + to + '"') + (on ? ' aria-current="page"' : '') + '>' + label + '</button>';
    const render = () => {
      const live = rows.filter(r => r.isConnected && !r.dataset.out);
      const pages = Math.max(1, Math.ceil(live.length / size));
      if (page > pages - 1) page = pages - 1;
      rows.forEach(r => { r.hidden = true; });
      live.forEach((r, i) => { r.hidden = Math.floor(i / size) !== page; });
      if (pages < 2) { nav.hidden = true; nav.innerHTML = ''; return; }
      nav.hidden = false;
      // the first, the last, and two either side of the current page; gaps shown as …
      const nums = [];
      for (let i = 0; i < pages; i++) if (i === 0 || i === pages - 1 || Math.abs(i - page) <= 2) nums.push(i);
      let html = btn('Previous', page - 1, false, page === 0), last = -1;
      nums.forEach(i => { if (i - last > 1) html += '<span class="pg-gap">…</span>'; html += btn(i + 1, i, i === page); last = i; });
      html += btn('Next', page + 1, false, page === pages - 1);
      html += '<span class="pg-info">Showing ' + (page * size + 1) + '–' + Math.min(live.length, (page + 1) * size) + ' of ' + live.length + '</span>';
      nav.innerHTML = html;
    };
    nav.addEventListener('click', e => {
      const b = e.target.closest('[data-to]'); if (!b) return;
      page = +b.dataset.to; render();
      after.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    render();
    return { update(toFirst) { if (toFirst) page = 0; render(); } };
  };

  // ---- photos: upload and pick ----
  A.readFile = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(f); });
  A.upload = async function (files) {
    const out = [];
    for (const f of files) {
      if (!/^image\//.test(f.type)) { A.toast(f.name + ': not an image', true); continue; }
      if (f.size > 10 * 1024 * 1024) { A.toast(f.name + ': bigger than 10 MB', true); continue; }
      try { const j = await A.api('POST', '/admin/api/media', { name: f.name, data: await A.readFile(f) }); out.push(j.src); }
      catch (e) { A.toast(f.name + ': ' + e.message, true); }
    }
    if (out.length) A.toast(out.length === 1 ? 'Photo uploaded' : out.length + ' photos uploaded');
    return out;
  };
  A.media = async () => (await A.api('GET', '/admin/api/media')).groups;

  // the picker: resolves with the chosen photo's address, or null
  A.pickImage = function () {
    const m = document.getElementById('media-modal');
    const grid = m.querySelector('[data-grid]'), tabs = m.querySelector('[data-tabs]'), drop = m.querySelector('[data-drop]'), file = m.querySelector('[data-file]');
    let groups = [], cur = 0;
    return new Promise(resolve => {
      const done = v => { m.hidden = true; m.onclick = null; file.onchange = null; drop.ondrop = drop.ondragover = drop.ondragleave = null; resolve(v); };
      const draw = () => {
        tabs.innerHTML = groups.map((g, i) => `<button type="button" class="${i === cur ? 'on' : ''}" data-t="${i}">${A.esc(g.label)} (${g.files.length})</button>`).join('');
        const g = groups[cur] || { files: [] };
        grid.innerHTML = g.files.length ? g.files.map(f => `<div class="mi" data-src="${A.esc(f.src)}"><img src="${A.esc(f.src)}" alt="" loading="lazy"><span>${A.esc(f.name)}</span></div>`).join('') : '<p class="hint">No photos here yet.</p>';
      };
      const load = async () => { groups = await A.media(); draw(); };
      m.onclick = e => {
        if (e.target === m || e.target.closest('[data-close]')) return done(null);
        const t = e.target.closest('[data-t]'); if (t) { cur = +t.dataset.t; draw(); return; }
        const it = e.target.closest('.mi'); if (it) done(it.dataset.src);
      };
      const up = async files => { const srcs = await A.upload(files); if (srcs.length) { await load(); cur = 0; draw(); if (srcs.length === 1) done(srcs[0]); } };
      file.onchange = () => up([...file.files]);
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
      drop.ondragleave = () => drop.classList.remove('over');
      drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); up([...e.dataTransfer.files]); };
      m.hidden = false; grid.innerHTML = '<p class="hint">Loading…</p>'; load();
    });
  };
})();

// (19 Oct 2026) the top bar's menu button: hides / shows the sidebar (on phones it slides in over the page)
(function () {
  const b = document.querySelector('[data-burger]'), ad = document.querySelector('.ad');
  if (!b || !ad) return;
  const phone = () => matchMedia('(max-width:980px)').matches;
  try { if (!phone() && localStorage.getItem('mk-side') === 'off') ad.classList.add('side-off'); } catch (e) {}
  b.onclick = () => {
    if (phone()) { ad.classList.toggle('side-on'); return; }
    const off = ad.classList.toggle('side-off');
    try { localStorage.setItem('mk-side', off ? 'off' : 'on'); } catch (e) {}
  };
  document.addEventListener('click', e => { if (phone() && ad.classList.contains('side-on') && !e.target.closest('.ad-side, [data-burger]')) ad.classList.remove('side-on'); });
})();

// (26 Oct 2026) the top bar's menus (+ New, notifications, your name): one open at a time, closed by a click elsewhere or Esc
(function () {
  const pops = [...document.querySelectorAll('[data-pop]')];
  pops.forEach(p => p.addEventListener('toggle', () => { if (p.open) pops.forEach(o => { if (o !== p) o.open = false; }); }));
  document.addEventListener('click', e => { pops.forEach(p => { if (p.open && !p.contains(e.target)) p.open = false; }); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') pops.forEach(p => { p.open = false; }); });
})();

// (26 Oct 2026) menu groups (Tours, Four Regions, Travel Guide, Footer menu): the arrow opens or closes the group
(function () {
  document.querySelectorAll('[data-tree]').forEach(t => {
    const b = t.querySelector('.ad-tree-t'), k = 'mk-tree-' + t.dataset.tree;
    try { if (!t.classList.contains('open') && localStorage.getItem(k) === '1') t.classList.add('open'); } catch (e) {}
    b.onclick = () => { const o = t.classList.toggle('open'); b.setAttribute('aria-expanded', o); try { localStorage.setItem(k, o ? '1' : '0'); } catch (e) {} };
  });
})();
