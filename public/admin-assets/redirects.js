// Meruka admin: Link redirection (5 Nov 2026, client). Add, change, test and remove redirects; every change is saved at
// once (to MySQL) and the website uses it straight away.
(function () {
  const A = window.ADMIN;
  let items = Array.isArray(window.REDIRECTS) ? window.REDIRECTS : [];
  let editing = -1;
  const $ = s => document.querySelector(s);
  const form = $('[data-rd-form]'), rowsEl = $('[data-rd-rows]'), q = $('[data-rd-q]'), msg = $('[data-rd-msg]');
  const fld = k => form.querySelector('[data-f="' + k + '"]');
  const saveBtn = $('[data-rd-save]'), cancelBtn = $('[data-rd-cancel]');
  const day = s => { const t = new Date(s); return isNaN(t) ? '—' : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const clean = v => { v = v.trim(); if (!v || /^https?:\/\//i.test(v)) return v; try { const u = new URL(v, location.origin); if (u.origin === location.origin && /^[a-z]+:\/\//i.test(v)) v = u.pathname + u.search; } catch (e) { /* as typed */ } return '/' + v.replace(/^\/+/, ''); };

  // the website's pages, offered in "New address"
  A.api('GET', '/admin/api/link-index').then(r => {
    $('#rd-pages').innerHTML = (r.items || []).map(it => '<option value="' + A.esc(it.url) + '">' + A.esc(it.name) + '</option>').join('');
  }).catch(() => {});

  function draw() {
    const v = q.value.trim().toLowerCase();
    const shown = items.map((r, i) => [r, i]).filter(([r]) => !v || (r.from + ' ' + r.to + ' ' + r.note).toLowerCase().includes(v));
    rowsEl.innerHTML = shown.map(([r, i], n) => '<tr data-i="' + i + '"' + (i === editing ? ' class="rd-on"' : '') + '>' +
      '<td class="n">' + (n + 1) + '</td>' +
      '<td><code class="rd-from">' + A.esc(r.from) + '</code>' + (r.note ? '<small class="rd-note">' + A.esc(r.note) + '</small>' : '') + '</td>' +
      '<td class="rd-ar" aria-hidden="true">→</td>' +
      '<td><a class="url rd-to" href="' + A.esc(r.to) + '" target="_blank" rel="noopener">' + A.esc(r.to) + ' ↗</a></td>' +
      '<td><span class="pill ' + (r.code === 302 ? 'pill-draft' : 'pill-live') + '">' + (r.code === 302 ? '302 · For a while' : '301 · For good') + '</span></td>' +
      '<td class="muted">' + day(r.at) + '</td>' +
      '<td class="acts"><a class="btn btn-s" href="' + A.esc(r.from) + '" target="_blank" rel="noopener" title="Open the old address: it should land on the new page">Test</a> ' +
      '<button type="button" class="btn btn-s btn-p" data-edit>Edit</button> <button type="button" class="btn btn-s btn-d" data-del>Delete</button></td></tr>').join('');
    $('[data-rd-count]').textContent = items.length + (items.length === 1 ? ' redirect' : ' redirects') + (v ? ' · ' + shown.length + ' found' : '');
    $('[data-rd-empty]').hidden = !!items.length;
    document.querySelector('.rd-tbl').hidden = !items.length;
  }
  function reset() {
    editing = -1; ['from', 'to', 'note'].forEach(k => { fld(k).value = ''; }); fld('code').value = '301';
    saveBtn.textContent = 'Add redirect'; cancelBtn.hidden = true; form.classList.remove('rd-editing'); msg.textContent = ''; draw();
  }
  async function save(list, done) {
    saveBtn.disabled = true;
    try { const r = await A.api('POST', '/admin/api/redirects', { items: list }); items = r.items || []; A.toast(done); reset(); return true; }
    catch (e) { msg.textContent = e.message; msg.classList.add('bad'); A.toast(e.message, true); return false; }
    finally { saveBtn.disabled = false; }
  }

  saveBtn.onclick = () => {
    msg.textContent = ''; msg.classList.remove('bad');
    const r = { from: clean(fld('from').value), to: clean(fld('to').value), code: +fld('code').value, note: fld('note').value.trim() };
    if (!r.from || r.from === '/') { msg.textContent = 'Write the old address, e.g. /old-page'; msg.classList.add('bad'); fld('from').focus(); return; }
    if (!r.to) { msg.textContent = 'Write the new address, or pick a page.'; msg.classList.add('bad'); fld('to').focus(); return; }
    const list = items.slice();
    if (editing >= 0) { list[editing] = Object.assign({}, list[editing], r); save(list, 'Redirect saved'); }
    else { list.unshift(Object.assign(r, { at: new Date().toISOString() })); save(list, 'Redirect added: ' + r.from + ' → ' + r.to); }
  };
  cancelBtn.onclick = reset;
  form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); saveBtn.click(); } });
  $('[data-rd-new]').onclick = () => { reset(); form.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => fld('from').focus(), 250); };
  q.oninput = draw;

  rowsEl.onclick = async e => {
    const tr = e.target.closest('tr[data-i]'); if (!tr) return;
    const i = +tr.dataset.i, r = items[i];
    if (e.target.closest('[data-edit]')) {
      editing = i; fld('from').value = r.from; fld('to').value = r.to; fld('code').value = String(r.code); fld('note').value = r.note || '';
      saveBtn.textContent = 'Save changes'; cancelBtn.hidden = false; form.classList.add('rd-editing'); msg.textContent = ''; draw();
      form.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => fld('to').focus(), 250);
    } else if (e.target.closest('[data-del]')) {
      if (!(await A.confirm('Delete this redirect?', r.from + ' will stop going to ' + r.to + '.', 'Delete', true))) return;
      save(items.filter((x, n) => n !== i), 'Redirect deleted');
    }
  };
  // ?from=/old-address opens the form with it filled in (a link from elsewhere in the panel)
  const pre = new URLSearchParams(location.search).get('from');
  if (pre) fld('from').value = pre;
  draw();
})();
