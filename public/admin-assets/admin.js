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
      m.innerHTML = '<div class="modal-box" style="width:min(' + (o.wide ? 640 : 560) + 'px,100%)" role="dialog" aria-modal="true"><div class="modal-head"><h2></h2></div><div class="dlg-body"></div><p class="err" hidden></p><div class="dlg-foot"><button type="button" class="btn" data-x></button><button type="button" class="btn" data-ok></button></div></div>';
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
  // (4 Nov 2026, client) where a page goes, in two plain steps: 1 the region (or part of the travel guide) as buttons,
  // 2 the page it belongs to, from a list of plain names (cities a step in, under their state) with a search; the path
  // it gets on the website shows below. Used by Add and Move. o: { secs, guide, si, ri, cur: {si, ri}, ok(row), name }
  A.placePicker = (b, o) => {
    const secs = o.secs, guide = !!o.guide, lc = s => String(s || '').toLowerCase(), nm = s => String(s || '').replace(/\s*Tourism$/i, '');
    let si = o.si || 0, sel = o.ri == null ? '' : String(o.ri);
    const el = b.querySelector('[data-pp]');
    el.className = 'pp';
    el.innerHTML = '<div class="pp-step"><b>1</b>' + (guide ? 'Part of the travel guide' : 'Region') + '</div><div class="pp-tabs" data-tabs></div>' +
      '<div class="pp-step"><b>2</b>' + (guide ? 'Where it goes in it' : 'The state or city it belongs to') + '</div>' +
      '<div class="pp-box"><input class="pp-q" type="search" placeholder="Find a ' + (guide ? 'page' : 'state or city') + '…" data-q><div class="pp-list" data-list></div></div>' +
      '<p class="ap-path" data-path></p>';
    const tabs = el.querySelector('[data-tabs]'), list = el.querySelector('[data-list]'), q = el.querySelector('[data-q]'), path = el.querySelector('[data-path]');
    const here = (j, i) => o.cur && o.cur.si === (i == null ? si : i) && String(o.cur.ri) === String(j) ? '<em class="pp-here">Now here</em>' : '';
    const kind = x => guide ? (x.depth ? 'Sub-page' : 'Page') : (x.depth ? 'City / place' : 'State');
    const show = () => {
      const s = secs[si], x = sel === '' ? null : s.rows[+sel], chain = s.parents.concat(x ? x.chain.concat([{ label: x.label }]) : []);
      const name = (typeof o.name === 'function' ? o.name() : o.name) || 'the new page';
      path.innerHTML = 'On the website: <span>' + ['Home'].concat(chain.map(c => c.label)).map(A.esc).join(' › ') + ' › <b>' + A.esc(name) + '</b></span>' + (guide && !x ? '<small>Listed in the ' + A.esc(s.title) + ' menu</small>' : '');
    };
    const draw = () => {
      tabs.innerHTML = secs.map((s, i) => '<button type="button" class="pp-tab' + (i === si ? ' on' : '') + '" data-i="' + i + '">' + A.esc(nm(s.title)) + '</button>').join('');
      const s = secs[si], v = lc(q.value.trim());
      // a search looks in every region; a row found in another region says which
      const rows = (v ? secs : [s]).flatMap(z => z.rows.map((x, j) => [x, j, secs.indexOf(z)])).filter(([x]) => (!o.ok || o.ok(x)) && (!v || lc(x.label).includes(v)));
      list.innerHTML = (v ? '' : '<button type="button" class="pp-row pp-top' + (sel === '' ? ' on' : '') + '" data-j=""><span class="pp-nm">Directly in ' + A.esc(nm(s.title)) +
          '<small>' + (guide ? 'A main page of this part of the guide' : 'It becomes a new state of ' + A.esc(nm(s.title))) + '</small></span>' + here('') + '</button>') +
        rows.map(([x, j, i]) => '<button type="button" class="pp-row' + (i === si && sel === String(j) ? ' on' : '') + '" data-j="' + j + '" data-s="' + i + '" style="--d:' + (v ? 0 : x.depth) + '"><span class="pp-nm">' + A.esc(nm(x.label)) +
          (v ? '<small>in ' + A.esc([nm(secs[i].title)].concat(x.chain.map(c => nm(c.label))).join(' › ')) + '</small>' : '') + '</span>' + here(j, i) + '<span class="pp-k">' + kind(x) + '</span></button>').join('') +
        (rows.length || !v ? '' : '<p class="pp-none">Nothing found for “' + A.esc(q.value.trim()) + '”.</p>');
      const on = list.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest' });
      show();
    };
    tabs.onclick = e => { const t = e.target.closest('[data-i]'); if (!t) return; si = +t.dataset.i; sel = ''; q.value = ''; draw(); };
    list.onclick = e => { const r = e.target.closest('[data-j]'); if (!r) return; sel = r.dataset.j; if (r.dataset.s) { si = +r.dataset.s; tabs.querySelectorAll('.pp-tab').forEach((t, i) => t.classList.toggle('on', i === si)); } list.querySelectorAll('.pp-row').forEach(x => x.classList.toggle('on', x === r)); show(); };
    q.oninput = draw;
    q.onkeydown = e => { if (e.key !== 'Enter') return; e.preventDefault(); e.stopPropagation(); const r = list.querySelector('.pp-row'); if (r) r.click(); };
    draw();
    return { get: () => ({ sec: secs[si], x: sel === '' ? null : secs[si].rows[+sel], si, ri: sel }), refresh: show };
  };
  // (4 Nov 2026, client) move a text page to another place; the pages under it go with it. Resolves with the page, or null.
  A.movePage = async ({ id, url, name, group, now }) => {
    let data; try { data = await A.api('GET', '/admin/api/page-places'); } catch (e) { A.toast(e.message, true); return null; }
    const guide = group === 'guide', lc = s => String(s || '').toLowerCase();
    const secs = (guide ? data.guide : data.places.filter(s => s.parents.length));
    // never under itself or under one of its own pages
    const ok = r => lc(r.href) !== lc(url) && !r.chain.some(c => lc(c.href) === lc(url));
    const last = lc((now || [])[(now || []).length - 1] || '');
    let si = 0, ri = '';
    secs.forEach((s, i) => { if (s.parents.some(p => lc(p.href) === last)) si = i; s.rows.forEach((r, j) => { if (lc(r.href) === last) { si = i; ri = String(j); } if (lc(r.href) === lc(url) && !last) si = i; }); });
    let pk;
    const box = await A.dialog({ title: 'Move “' + name + '”', ok: 'Move here', wide: true,
      html: '<p class="hint" style="margin:0">Choose the new place of the page. The pages under it move with it.</p><div data-pp></div>',
      onOpen: b => { pk = A.placePicker(b, { secs, guide, si, ri, cur: { si, ri }, ok, name }); },
      validate: () => { const g = pk.get(); return g.si === si && g.ri === ri ? 'The page is already here. Choose another place.' : ''; } });
    if (!box) return null;
    const { sec, x } = pk.get();
    const parents = sec.parents.concat(x ? x.chain.concat([{ label: x.label, href: x.href }]) : []);
    try {
      const res = await A.api('POST', '/admin/api/item/pages/' + encodeURIComponent(id) + '/move', { parents, guideSection: guide && !x ? sec.guideSection : undefined });
      A.toast('Moved — ' + ['Home'].concat(parents.map(p => p.label), [name]).join(' › ')); return res;
    } catch (e) { A.toast(e.message, true); return null; }
  };
  A.confirm = async (title, text, ok, danger) => !!(await A.dialog({ title, html: '<p>' + A.esc(text) + '</p>', ok: ok || 'Yes', danger }));
  // (4 Nov 2026, client) unsaved changes: a click on any link of the panel asks in the panel's own popup — "Leave without
  // saving" or "Stay on this page" — instead of the browser's box (which cannot be styled and was hard to answer). The
  // browser's own box stays only for closing the tab or reloading, where nothing else is allowed.
  A.leaveGuard = isDirty => {
    let leaving = false;
    document.addEventListener('click', async e => {
      const a = e.target.closest('a[href]');
      if (!a || leaving || !isDirty() || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (/^(#|javascript:|mailto:|tel:)/i.test(href)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      const go = await A.dialog({ title: 'Leave without saving?', html: '<p>The changes on this page are not saved yet. If you leave now they are lost.</p>', ok: 'Leave without saving', cancel: 'Stay on this page', danger: true });
      if (go) { leaving = true; location.href = url.href; }
    }, true);
    window.addEventListener('beforeunload', e => { if (!leaving && isDirty()) { e.preventDefault(); e.returnValue = ''; } });
  };
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
  // (3 Nov 2026, client) every photo in one list (the uploaded ones first), each once; a search keeps only the photos
  // whose name has all the words typed
  A.allPhotos = groups => {
    const seen = new Set(), out = [];
    groups.forEach(g => g.files.forEach(f => { if (seen.has(f.src)) return; seen.add(f.src); out.push(Object.assign({ dir: g.dir, group: g.label }, f)); }));
    return out;
  };
  A.photoMatch = (f, q) => { const name = (f.name + ' ' + f.src).toLowerCase().replace(/[-_.\/]+/g, ' '); return String(q || '').toLowerCase().split(/[\s,]+/).filter(Boolean).every(w => name.includes(w)); };
  A.photoTile = (f, extra) => '<div class="mi" data-src="' + A.esc(f.src) + '" title="' + A.esc(f.name) + '"><span class="mi-ph"><img src="' + A.esc(f.src) + '" alt="" loading="lazy"></span><span class="mi-n">' + A.esc(f.name) + '</span>' + (f.dir === 'uploads' ? '<i class="mi-tag">Uploaded</i>' : '') + (extra || '') + '</div>';
  A.pickImage = function () {
    const m = document.getElementById('media-modal');
    const grid = m.querySelector('[data-grid]'), drop = m.querySelector('[data-drop]'), file = m.querySelector('[data-file]'), mq = m.querySelector('[data-mq]'), count = m.querySelector('[data-mcount]');
    let all = [];
    return new Promise(resolve => {
      const draw = () => {
        const q = mq.value.trim(), list = q ? all.filter(f => A.photoMatch(f, q)) : all;
        count.textContent = q ? list.length + ' of ' + all.length + ' photos' : all.length + ' photos';
        grid.innerHTML = list.length ? list.map(f => A.photoTile(f)).join('') : '<p class="mm-empty">' + (q ? 'No photo has “' + A.esc(q) + '” in its name.' : 'No photos yet. Upload one.') + '</p>';
      };
      const done = v => { m.hidden = true; m.onclick = null; file.onchange = null; mq.oninput = null; drop.ondrop = drop.ondragover = drop.ondragleave = null; resolve(v); };
      const load = async () => { all = A.allPhotos(await A.media()); draw(); };
      mq.value = ''; mq.oninput = draw;
      m.onclick = e => {
        if (e.target === m || e.target.closest('[data-close]')) return done(null);
        const it = e.target.closest('.mi'); if (it) done(it.dataset.src);
      };
      const up = async files => { const srcs = await A.upload(files); if (srcs.length) { mq.value = ''; await load(); if (srcs.length === 1) done(srcs[0]); } };
      file.onchange = () => up([...file.files]);
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
      drop.ondragleave = e => { if (!drop.contains(e.relatedTarget)) drop.classList.remove('over'); };
      drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); up([...e.dataTransfer.files]); };
      m.hidden = false; grid.innerHTML = '<p class="mm-empty">Loading…</p>'; load(); setTimeout(() => mq.focus(), 50);
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
  // (4 Nov 2026, client) "/" goes to the page's search box; "?" shows the keyboard shortcuts (not while typing)
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select,[contenteditable="true"]') || document.querySelector('.modal:not([hidden])')) return;
    if (e.key === '/') { const q = document.querySelector('input[type="search"]:not([hidden])'); if (q) { e.preventDefault(); q.focus(); } }
    else if (e.key === '?') { e.preventDefault(); location.href = '/admin/shortcuts'; }
  });
  // (27 Oct 2026, client video) N opens "Quick add" from any page (not while typing)
  document.addEventListener('keydown', e => {
    if (e.key !== 'n' && e.key !== 'N') return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const q = document.querySelector('.ad-new'); if (q) { e.preventDefault(); q.open = true; q.querySelector('a') && q.querySelector('a').focus(); }
  });
})();

// (26 Oct 2026) menu groups (Tours, Four Regions, Travel Guide, Footer menu): the arrow opens or closes the group
(function () {
  document.querySelectorAll('[data-tree]').forEach(t => {
    const b = t.querySelector('.ad-tree-t'), k = 'mk-tree-' + t.dataset.tree;
    try { if (!t.classList.contains('open') && localStorage.getItem(k) === '1') t.classList.add('open'); } catch (e) {}
    b.onclick = () => { const o = t.classList.toggle('open'); b.setAttribute('aria-expanded', o); try { localStorage.setItem(k, o ? '1' : '0'); } catch (e) {} };
  });
})();
