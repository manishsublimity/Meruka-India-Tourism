// Meruka admin: Prices & notes (2 Nov 2026, client) — every tour's prices, includes, excludes and notes in one place.
// One tour ticked: View / Edit it. Two or more: "Edit All Package Prices" (a percentage or dollars, up or down, with the
// old and new prices side by side before saving). Each tour's included / excluded / notes open on their own.
(function () {
  const A = window.ADMIN, R = window.MKRTE;
  let tours = window.PRICING || [];
  const $ = s => document.querySelector(s);
  const rowsEl = $('[data-rows]'), q = $('[data-q]'), cat = $('[data-cat]'), count = $('[data-count]'), allBox = $('[data-all]');
  const picked = new Set();
  const usd = n => 'USD ' + Number(n).toLocaleString('en-US');
  const shown = () => { const v = q.value.trim().toLowerCase(), c = cat.value; return tours.filter(t => (!v || (t.name + ' ' + t.code + ' ' + t.url).toLowerCase().includes(v)) && (!c || String(t.code).split('-')[0] === c)); };
  const fromOf = t => { const los = t.tiers.map(x => x.lo).filter(x => x != null); return los.length && t.nights ? Math.min(...los) * t.nights : 0; };
  // the three lists of a tour, by their headings
  const LISTS = [['inc', 'What’s included', /includ/i, 'This Tour Includes'], ['exc', 'What’s excluded', /exclud/i, 'This Tour Excludes'], ['note', 'Important notes', /note/i, 'Important Notes']];
  const listN = (t, re) => { const l = (t.lists || []).find(x => re.test(x.title)); return l ? l.n : 0; };

  const draw = () => {
    const list = shown();
    count.textContent = list.length + (list.length === 1 ? ' tour' : ' tours');
    rowsEl.innerHTML = list.map(t => '<tr data-id="' + A.esc(t.id) + '"' + (picked.has(t.id) ? ' class="pr-on"' : '') + '>' +
      '<td class="lst-ck"><input type="checkbox" data-pick' + (picked.has(t.id) ? ' checked' : '') + ' aria-label="Tick ' + A.esc(t.name) + '"></td>' +
      '<td><div class="pr-name">' + (t.code ? '<span class="code">' + A.esc(t.code) + '</span>' : '') + '<b>' + A.esc(t.name) + '</b></div><small class="url">' + t.nights + ' nights' + (t.hasDraft ? ' · has a draft' : '') + (t.published ? '' : ' · not published') + ' · <a href="' + A.esc(t.url) + '" target="_blank" rel="noopener">Open the page ↗</a></small></td>' +
      '<td class="pr-tiers">' + (t.tiers.length ? t.tiers.map(x => '<span><i>' + A.esc(x.label || 'Price') + '</i>' + (x.lo != null ? '$' + x.lo + (x.hi != null ? '–' + x.hi : '') : A.esc(x.rest)) + '</span>').join('') : '<span class="muted">No prices yet</span>') + '</td>' +
      '<td class="pr-from">' + (fromOf(t) ? '<b>' + usd(fromOf(t)) + '</b>' : '<span class="muted">—</span>') + '</td>' +
      '<td class="pr-lists"><div class="pr-chips">' + LISTS.map(([k, l, re]) => '<button type="button" class="pr-chip" data-list="' + k + '" title="View or edit: ' + l + '">' + { inc: 'Included', exc: 'Excluded', note: 'Notes' }[k] + ' <b>' + listN(t, re) + '</b></button>').join('') + '</div></td>' +
      '<td class="acts pr-icons"><button type="button" class="ic-btn" data-rview title="View this tour" aria-label="View ' + A.esc(t.name) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
      '<button type="button" class="ic-btn ic-edit" data-redit title="Edit prices and notes" aria-label="Edit ' + A.esc(t.name) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button></td></tr>').join('') ||
      '<tr><td colspan="6" class="muted" style="text-align:center;padding:18px">No tour found.</td></tr>';
    allBox.checked = list.length > 0 && list.every(t => picked.has(t.id));
    state();
  };
  // one tour: View and Edit; two or more: only the prices of all of them together
  const state = () => {
    const n = picked.size;
    $('[data-sel]').textContent = !n ? 'Tick two or more tours to change their prices together' : n === 1 ? '1 tour ticked — tick one more' : n + ' tours ticked';
    $('[data-sel]').classList.toggle('on', n > 0);
    $('[data-bulk]').disabled = n < 2;
    $('[data-none]').hidden = !n;
  };
  q.oninput = draw; cat.onchange = draw;
  allBox.onchange = () => { shown().forEach(t => { if (allBox.checked) picked.add(t.id); else picked.delete(t.id); }); draw(); };
  $('[data-none]').onclick = () => { picked.clear(); draw(); };
  rowsEl.onchange = e => { const c = e.target.closest('[data-pick]'); if (!c) return; const tr = c.closest('tr'), id = tr.dataset.id; if (c.checked) picked.add(id); else picked.delete(id); tr.classList.toggle('pr-on', c.checked); allBox.checked = shown().every(t => picked.has(t.id)); state(); };
  rowsEl.onclick = e => {
    const b = e.target.closest('[data-list],[data-rview],[data-redit]'); if (!b) return;
    const id = b.closest('tr').dataset.id;
    if (b.dataset.list) listBox(id, b.dataset.list); else if (b.hasAttribute('data-rview')) view(id); else open(id);
  };

  // ---------- the price lines ----------
  const PRICE_RE = /((?:US\$|\$|USD)\s*)(\d[\d,]*)(\s*(?:-|–|to)\s*(?:US\$\s*|\$\s*|USD\s*)?)(\d[\d,]*)/i, PRICE_ONE = /((?:US\$|\$|USD)\s*)(\d[\d,]*)/i;
  const isPrice = b => /pric|cost/i.test(b.title || '');
  const segsText = it => it.map(x => x.text || '').join('');
  const tierOf = it => {
    const whole = segsText(it).trim(), bl = ((it.find(x => x.bold) || {}).text || '').trim();
    const label = (bl || (whole.match(/^[^:$]+:/) || [''])[0]).replace(/:\s*$/, '').trim();
    const rest = bl ? it.filter(x => !x.bold).map(x => x.text).join('').trim() : whole.replace(/^[^:$]+:/, '').trim();
    const m = PRICE_RE.exec(rest), o = !m && PRICE_ONE.exec(rest);
    return { label, rest, lo: m ? +m[2].replace(/,/g, '') : o ? +o[2].replace(/,/g, '') : null, hi: m ? +m[4].replace(/,/g, '') : null };
  };
  const total = (lo, hi, n) => lo && n ? usd(lo * n) + (hi ? ' – ' + Number(hi * n).toLocaleString('en-US') : '') : '—';
  const get = id => A.api('GET', '/admin/api/pricing/' + encodeURIComponent(id));
  const save = (id, details) => A.api('PUT', '/admin/api/pricing/' + encodeURIComponent(id), { details });
  const refresh = (id, details) => {
    const row = tours.find(x => x.id === id); if (!row) return;
    row.tiers = (details.find(isPrice) || { items: [] }).items.map(tierOf).filter(x => x.label || x.rest);
    row.lists = details.filter(b => !isPrice(b)).map(b => ({ title: b.title, n: b.items.length }));
    draw();
  };

  // ---------- View: everything of one tour, read only ----------
  async function view(id) {
    let t; try { t = await get(id); } catch (e) { return A.toast(e.message, true); }
    const pb = t.details.find(isPrice);
    const box = await A.dialog({ title: t.name, ok: 'Edit this tour', cancel: 'Close',
      html: '<p class="muted" style="margin:0 0 10px">' + (t.code ? '<span class="code">' + A.esc(t.code) + '</span> ' : '') + t.nights + ' nights · <a href="' + A.esc(t.url) + '" target="_blank" rel="noopener">Open the tour page ↗</a></p>' +
        '<div class="pr-view"><h4>Prices per person per day</h4>' + (pb && pb.items.length ? '<table class="pr-vt">' + pb.items.map(it => { const x = tierOf(it); return '<tr><td>' + A.esc(x.label) + '</td><td>' + A.esc(x.rest) + '</td><td>' + (x.lo != null ? total(x.lo, x.hi, t.nights) : '') + '</td></tr>'; }).join('') + '</table>' : '<p class="muted">No prices yet.</p>') +
        t.details.filter(b => !isPrice(b)).map(b => '<h4>' + A.esc(b.title) + '</h4>' + (b.items.length ? '<ul>' + b.items.map(it => '<li>' + A.esc(segsText(it)) + '</li>').join('') + '</ul>' : '<p class="muted">Nothing yet.</p>')).join('') + '</div>' });
    if (box) open(id);
  }

  // ---------- one list (included, excluded or notes) of one tour ----------
  async function listBox(id, key) {
    const [, label, re, title] = LISTS.find(x => x[0] === key);
    let t; try { t = await get(id); } catch (e) { return A.toast(e.message, true); }
    const b = t.details.find(x => !isPrice(x) && re.test(x.title));
    const before = b ? b.items.map(segsText).map(x => x.trim()).filter(Boolean) : [];
    let ed = null;
    const box = await A.dialog({ title: label + ' — ' + t.name, ok: 'Save — goes live',
      html: '<p class="pt-cap">' + A.esc(b ? b.title : title) + '<span>' + before.length + (before.length === 1 ? ' point' : ' points') + '</span></p><div data-pts></div>',
      onOpen: x => {
        const cap = x.querySelector('.pt-cap span');
        window.MKRTE.setTouch(() => { const n = ed ? ed.get().length : 0; cap.textContent = n + (n === 1 ? ' point' : ' points'); });
        ed = R.rte('<ul>' + (b ? b.items : []).map(it => '<li>' + R.segHtml(it) + '</li>').join('') + '</ul>', { list: true, min: 160 });
        x.querySelector('[data-pts]').appendChild(ed.el); x.closest('.modal-box').classList.add('pt-modal');
      } });
    if (!box) return;
    const items = ed.get().map(R.segs);
    if (JSON.stringify(items.map(segsText)) === JSON.stringify(before)) return A.toast('Nothing was changed');
    const details = b ? t.details.map(x => x === b ? Object.assign({}, x, { items }) : x) : t.details.concat([{ title, text: '', items }]);
    try { await save(id, details); refresh(id, details); A.toast(label + ' saved'); } catch (e) { A.toast(e.message, true); }
  }

  // ---------- several tours: the prices together ----------
  const bb = $('[data-bulkbox]'), brows = $('[data-brows]');
  let sign = 1;
  const adj = n => { const v = (+bb.querySelector('[data-val]').value || 0) * sign; return Math.max(1, Math.round(bb.querySelector('[data-mode]').value === 'pct' ? n * (1 + v / 100) : n + v)); };
  const preview = () => {
    const v = +bb.querySelector('[data-val]').value || 0, pct = bb.querySelector('[data-mode]').value === 'pct';
    bb.querySelector('[data-unit]').textContent = pct ? '%' : 'USD';
    bb.querySelector('[data-bsum]').innerHTML = v ? '<b>' + picked.size + ' tours</b> · every price per day ' + (sign > 0 ? '<span class="up">goes up</span>' : '<span class="down">goes down</span>') + ' by <b>' + (pct ? v + '%' : 'USD ' + v) + '</b>, rounded to whole dollars' : 'Type how much to change the prices by.';
    brows.innerHTML = tours.filter(t => picked.has(t.id)).map(t => {
      const ts = t.tiers.filter(x => x.lo != null);
      if (!ts.length) return '<tr><td><b>' + A.esc(t.name) + '</b></td><td colspan="4" class="muted">No prices to change</td></tr>';
      return ts.map((x, i) => { const lo = v ? adj(x.lo) : x.lo, hi = x.hi == null ? null : v ? adj(x.hi) : x.hi;
        return '<tr' + (i ? '' : ' class="pr-first"') + '><td>' + (i ? '' : '<b>' + A.esc(t.name) + '</b><small>' + t.nights + ' nights</small>') + '</td><td>' + A.esc(x.label || 'Price') + '</td><td class="pr-old">$' + x.lo + (x.hi != null ? '–' + x.hi : '') + '</td><td class="pr-new' + (v ? (sign > 0 ? ' up' : ' down') : '') + '">$' + lo + (hi != null ? '–' + hi : '') + '</td><td>' + total(lo, hi, t.nights) + '</td></tr>'; }).join('');
    }).join('');
  };
  const closeBulk = () => { bb.hidden = true; };
  $('[data-bulk]').onclick = () => { sign = 1; bb.querySelectorAll('[data-sign]').forEach(x => x.classList.toggle('on', x.dataset.sign === '1')); bb.hidden = false; preview(); bb.querySelector('[data-val]').focus(); };
  bb.querySelectorAll('[data-bclose]').forEach(b => { b.onclick = closeBulk; });
  bb.onclick = e => { if (e.target === bb) closeBulk(); };
  bb.querySelectorAll('[data-sign]').forEach(b => { b.onclick = () => { sign = +b.dataset.sign; bb.querySelectorAll('[data-sign]').forEach(x => x.classList.toggle('on', x === b)); preview(); }; });
  bb.querySelector('[data-val]').oninput = preview; bb.querySelector('[data-mode]').onchange = preview;
  bb.querySelector('[data-bapply]').onclick = async () => {
    const v = +bb.querySelector('[data-val]').value || 0;
    if (!v) return A.toast('Type the value first', true);
    try {
      const r = await A.api('POST', '/admin/api/pricing/bulk', { ids: [...picked], mode: bb.querySelector('[data-mode]').value, value: v * sign });
      tours = r.tours || tours; picked.clear(); closeBulk(); draw(); A.toast('New prices saved for ' + r.done.length + ' tours');
    } catch (e) { A.toast(e.message, true); }
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !bb.hidden) closeBulk(); });

  // ---------- Edit: one tour in the side panel ----------
  const drawer = $('[data-drawer]'), scrim = $('[data-scrim]'), body = $('[data-dbody]');
  let dirty = false;
  const close = async () => {
    if (dirty && !(await A.confirm('Close without saving?', 'The changes in this tour are not saved yet.', 'Close without saving', true))) return;
    drawer.hidden = scrim.hidden = true; dirty = false; history.replaceState(null, '', location.pathname);
  };
  document.querySelectorAll('[data-close]').forEach(b => { b.onclick = close; }); scrim.onclick = close;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden && !document.querySelector('.modal:not(#media-modal):not([hidden])')) close(); });
  async function open(id) {
    if (!drawer.hidden && dirty && !(await A.confirm('Open another tour?', 'The changes in this tour are not saved yet.', 'Open without saving', true))) return;
    let t; try { t = await get(id); } catch (e) { return A.toast(e.message, true); }
    dirty = false; history.replaceState(null, '', '#' + id);
    $('[data-dname]').textContent = t.name;
    $('[data-dsub]').innerHTML = (t.code ? '<span class="code">' + A.esc(t.code) + '</span> ' : '') + t.nights + ' nights · <a href="' + A.esc(t.url) + '" target="_blank" rel="noopener">Open the tour page ↗</a> · <a href="/admin/tours/' + encodeURIComponent(t.id) + '#prices">Open in the tour editor</a>';
    $('[data-dnote]').textContent = t.hasDraft ? 'This tour has a draft: it gets the same change.' : '';
    const pb = t.details.find(isPrice) || { title: 'Tour Pricing Details', text: '', items: [] };
    if (!t.details.includes(pb)) t.details.unshift(pb);
    const others = t.details.filter(b => b !== pb);
    body.innerHTML = '<section class="pr-sec"><h3>Prices per person per day</h3><p class="hint">The website multiplies them by the ' + t.nights + ' nights for the whole tour (shown on the right).</p>' +
      '<div class="pr-rows" data-prows></div><button type="button" class="btn btn-s" data-addrow>+ Add a price line</button>' +
      '<label class="lb" style="margin-top:14px">Text above the prices</label><div data-ptext></div></section>' +
      others.map((b, i) => '<section class="pr-sec"><h3>' + A.esc(b.title) + '</h3><div data-lst="' + i + '"></div></section>').join('');
    window.MKRTE.setTouch(() => { dirty = true; });
    const ptext = R.rte(pb.text || '', { min: 70 }); body.querySelector('[data-ptext]').appendChild(ptext.el);
    const eds = others.map((b, i) => { const e = R.rte('<ul>' + b.items.map(it => '<li>' + R.segHtml(it) + '</li>').join('') + '</ul>', { list: true, min: 110 }); body.querySelector('[data-lst="' + i + '"]').appendChild(e.el); return e; });
    const prows = body.querySelector('[data-prows]');
    const addRow = it => {
      const x = it ? tierOf(it) : { label: '', rest: '', lo: null, hi: null };
      const r = document.createElement('div'); r.className = 'pr-row'; r._item = it || null;
      r.innerHTML = '<input class="in" data-l placeholder="e.g. 3-Star" aria-label="Hotel category">' +
        (it && x.lo == null ? '<input class="in pr-raw" data-raw aria-label="Price text">' : '<span class="pr-usd">$</span><input class="in" type="number" min="0" data-lo placeholder="From" aria-label="From (USD a day)"><span>–</span><input class="in" type="number" min="0" data-hi placeholder="To" aria-label="To (USD a day)">') +
        '<span class="pr-tot" data-tot></span><button type="button" class="pr-x" title="Remove this line" aria-label="Remove this line">✕</button>';
      r.querySelector('[data-l]').value = x.label;
      if (r.querySelector('[data-raw]')) r.querySelector('[data-raw]').value = x.rest;
      else { r.querySelector('[data-lo]').value = x.lo != null ? x.lo : ''; r.querySelector('[data-hi]').value = x.hi != null ? x.hi : ''; }
      const upd = () => { const lo = r.querySelector('[data-lo]'), hi = r.querySelector('[data-hi]'); r.querySelector('[data-tot]').textContent = lo ? 'Whole tour: ' + total(+lo.value, +hi.value, t.nights) : ''; };
      r.oninput = () => { upd(); dirty = true; }; upd();
      r.querySelector('.pr-x').onclick = () => { r.remove(); dirty = true; };
      prows.appendChild(r);
    };
    pb.items.forEach(addRow);
    body.querySelector('[data-addrow]').onclick = () => { addRow(null); dirty = true; };
    body.oninput = () => { dirty = true; };
    // the lists and the price lines back into the tour's own shape; unchanged lines keep their bold words
    $('[data-save]').onclick = async () => {
      const items = [...prows.children].map(r => {
        const label = r.querySelector('[data-l]').value.trim(), raw = r.querySelector('[data-raw]');
        if (raw) return [{ text: label + ':', bold: true }, { text: ' ' + raw.value.trim(), bold: false }];
        const lo = r.querySelector('[data-lo]').value.trim(), hi = r.querySelector('[data-hi]').value.trim();
        if (!label && !lo) return null;
        const o = r._item && tierOf(r._item);
        if (o && o.label === label && String(o.lo) === lo && String(o.hi == null ? '' : o.hi) === hi) return r._item;
        let rest = o ? o.rest : '$' + lo + (hi ? ' - $' + hi : '') + ' per person per day';
        if (o && PRICE_RE.test(rest)) rest = rest.replace(PRICE_RE, (all, a, x, mid, y) => a + lo + mid + (hi || y));
        else if (o && PRICE_ONE.test(rest)) rest = rest.replace(PRICE_ONE, (all, a) => a + lo);
        return [{ text: label + ':', bold: true }, { text: ' ' + rest, bold: false }];
      }).filter(Boolean);
      const details = t.details.map(b => {
        if (b === pb) return Object.assign({}, b, { text: /^<p>[^<]*<\/p>$/.test(ptext.get()) ? ptext.get().slice(3, -4) : ptext.get(), items });
        const v = eds[others.indexOf(b)].get().map(R.segs);
        if (JSON.stringify(v.map(segsText)) === JSON.stringify(b.items.map(segsText).map(x => x.trim()).filter(Boolean))) return b;
        return Object.assign({}, b, { items: v });
      });
      try {
        await save(t.id, details); dirty = false; refresh(t.id, details);
        drawer.hidden = scrim.hidden = true; history.replaceState(null, '', location.pathname);
        A.toast('Saved — the tour page shows the new prices');
      } catch (e) { A.toast(e.message, true); }
    };
    drawer.hidden = scrim.hidden = false; body.scrollTop = 0;
  }
  // (4 Nov 2026, client) leaving with unsaved changes asks in the panel's own popup (A.leaveGuard)
  A.leaveGuard(() => dirty);
  draw();
  if (location.hash.length > 1) open(decodeURIComponent(location.hash.slice(1)));

})();
