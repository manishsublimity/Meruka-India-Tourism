// Meruka admin: a section's list — search, add (as a copy of another), delete
(function () {
  const A = window.ADMIN, L = window.LIST;
  const q = document.querySelector('[data-q]'), count = document.querySelector('[data-count]');
  const rows = [...document.querySelectorAll('[data-row]')];
  // search + category + Google check together
  const cat = document.querySelector('[data-cat]'), google = document.querySelector('[data-google]');
  const filter = () => {
    const v = q.value.trim().toLowerCase(), c = cat ? cat.value : '', g = google.value; let n = 0;
    rows.forEach(r => {
      r.hidden = !!((v && !r.dataset.s.includes(v)) || (c && r.dataset.code.split('-')[0] !== c) || (g && r.dataset.seo !== g));
      if (r.hidden) r.querySelector('[data-pick]').checked = false; else n++;
    });
    count.textContent = n + ' ' + L.one + (n === 1 ? '' : 's');
    all.checked = false;
  };
  q.oninput = filter; google.onchange = filter; if (cat) cat.onchange = filter;

  // select all (the rows shown) and bulk delete
  const all = document.querySelector('[data-all]');
  all.onchange = () => rows.forEach(r => { if (!r.hidden) r.querySelector('[data-pick]').checked = all.checked; });
  document.querySelector('[data-bulk-go]').onclick = async () => {
    const act = document.querySelector('[data-bulk]').value;
    const picked = rows.filter(r => r.isConnected && r.querySelector('[data-pick]').checked);
    if (!act) return A.toast('Choose a bulk action first.', true);
    if (!picked.length) return A.toast('Tick one or more ' + L.one + 's first.', true);
    if (act === 'delete') {
      if (!(await A.confirm('Delete ' + picked.length + ' ' + L.one + (picked.length === 1 ? '' : 's') + '?', 'They will be taken off the website. You can put them back from "Deleted items".', 'Delete', true))) return;
      let done = 0;
      for (const r of picked) {
        try { await A.api('DELETE', '/admin/api/item/' + L.kind + '/' + r.dataset.id); r.remove(); done++; }
        catch (e) { A.toast(r.dataset.name + ': ' + e.message, true); }
      }
      if (done) A.toast(done + ' deleted — they are in "Deleted items"');
    }
  };

  // the "new" popup: a name; the web address is made from it (and can be changed)
  const create = async (from, fromName) => {
    const options = rows.map(r => { const a = r.querySelector('a[href^="/admin/"]'); return [a.getAttribute('href').split('/').pop(), a.textContent]; });
    const box = await A.dialog({
      title: 'Add a new ' + L.one, ok: 'Create ' + L.one,
      html: '<div class="f"><label class="lb">Name of the ' + L.one + '</label><input class="in" data-n placeholder="e.g. Rajasthan Desert & Forts Tour"></div>' +
        '<div class="f"><label class="lb">Start from (its text and layout are copied, then you change them)</label><select class="in" data-f>' +
        options.map(([id, n]) => '<option value="' + A.esc(id) + '"' + (id === from ? ' selected' : '') + '>' + A.esc(n) + '</option>').join('') + '</select></div>' +
        '<div class="f"><label class="lb">Web address</label><div style="display:flex;align-items:center;gap:6px"><span class="muted">' + location.host + '/</span><input class="in" data-s></div><p class="hint">Made from the name. Letters, numbers and - only.</p></div>',
      onOpen: box => {
        const n = box.querySelector('[data-n]'), s = box.querySelector('[data-s]'); let touched = false;
        if (fromName) n.value = fromName + ' (copy)';
        s.value = A.slug(n.value);
        n.oninput = () => { if (!touched) s.value = A.slug(n.value); };
        s.oninput = () => { touched = true; };
      },
      validate: box => !box.querySelector('[data-n]').value.trim() ? 'Please type a name.' : !/^[a-z0-9][a-z0-9_-]*$/i.test(box.querySelector('[data-s]').value) ? 'The web address can only have letters, numbers and -.' : ''
    });
    if (!box) return;
    try {
      const j = await A.api('POST', '/admin/api/item/' + L.kind, { name: box.querySelector('[data-n]').value.trim(), slug: box.querySelector('[data-s]').value.trim(), from: box.querySelector('[data-f]').value });
      location.href = '/admin/' + L.kind + '/' + j.id;
    } catch (e) { A.toast(e.message, true); }
  };
  document.querySelector('[data-new]').onclick = () => create('', '');
  document.querySelectorAll('[data-copy]').forEach(b => { b.onclick = () => create(b.dataset.copy, b.dataset.name); });
  const openNew = () => { if (location.hash === '#new') { history.replaceState(null, '', location.pathname); create('', ''); } };
  openNew(); window.addEventListener('hashchange', openNew);   // "Add …" in the menu while already on this list
  document.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = async () => {
      if (!(await A.confirm('Delete this ' + L.one + '?', '"' + b.dataset.name + '" will be taken off the website. You can put it back from "Deleted items".', 'Delete', true))) return;
      try { await A.api('DELETE', '/admin/api/item/' + L.kind + '/' + b.dataset.del); b.closest('tr').remove(); A.toast('Deleted — it is in "Deleted items"'); }
      catch (e) { A.toast(e.message, true); }
    };
  });
})();
