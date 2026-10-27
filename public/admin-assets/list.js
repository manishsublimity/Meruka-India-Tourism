// Meruka admin: a section's list — search, add (as a copy of another), delete
(function () {
  const A = window.ADMIN, L = window.LIST;
  const q = document.querySelector('[data-q]'), count = document.querySelector('[data-count]');
  const rows = [...document.querySelectorAll('[data-row]')];
  // search + category + Google check together
  const cat = document.querySelector('[data-cat]'), google = document.querySelector('[data-google]'), stateSel = document.querySelector('[data-state]');
  // (23 Oct 2026) 20 to a page: the filters mark the rows they leave out, the pager shows one page of the rest
  const pager = A.pager(rows, document.querySelector('.lst-wrap'));
  // (26 Oct 2026) Pages: one group at a time (Destinations, Travel guide, Old tour plans)
  const GROUP_HELP = { '': 'Every text page of the website.', places: 'The four regions, the states and the cities, as in the Destinations menu.', guide: 'The India Travel Guide topics: geography, festivals, wildlife, visa, phone codes and more.', tours: 'Tour plans written as text pages on the old website. New tours go in Tours.' };
  const groupBtns = [...document.querySelectorAll('[data-groups] [data-g]')], groupHelp = document.querySelector('[data-group-help]');
  let grp = '';
  groupBtns.forEach(b => b.onclick = () => { grp = b.dataset.g; groupBtns.forEach(x => x.classList.toggle('on', x === b)); if (groupHelp) groupHelp.textContent = GROUP_HELP[grp] || ''; filter(); });
  if (groupHelp) groupHelp.textContent = GROUP_HELP[''];
  const filter = () => {
    const v = q.value.trim().toLowerCase(), c = cat ? cat.value : '', g = google ? google.value : '', st = stateSel ? stateSel.value : ''; let n = 0;
    rows.forEach(r => {
      const out = !!((grp && r.dataset.group !== grp) || (v && !r.dataset.s.includes(v)) || (c && r.dataset.code.split('-')[0] !== c) || (g && r.dataset.seo !== g) || (st && r.dataset.state !== st));
      r.dataset.out = out ? '1' : '';
      const pk = r.querySelector('[data-pick]');
      if (out) { if (pk) pk.checked = false; } else n++;
    });
    count.textContent = n + ' ' + (n === 1 ? L.one : L.one === 'category' ? 'categories' : L.one + 's');
    if (all) all.checked = false;
    number(); pager.update(true);
  };
  q.oninput = filter; if (google) google.onchange = filter; if (cat) cat.onchange = filter; if (stateSel) stateSel.onchange = filter;

  // (26 Oct 2026, client video II) no tick boxes: each row shows its number in the list as filtered
  const all = null;
  const number = () => { let n = 0; rows.forEach(r => { const c = r.querySelector('[data-n]'); if (c) c.textContent = r.dataset.out ? '' : ++n; }); };
  number();

  // the "new" popup: a name; the web address is made from it (and can be changed)
  const create = async (from, fromName) => {
    const options = rows.filter(r => !r.dataset.text).map(r => { const a = r.querySelector('a[href^="/admin/"]'); return [a.getAttribute('href').split('/').pop(), a.textContent]; });
    // (27 Oct 2026, client) a new tour starts empty and its categories are ticked here; "Copy" copies a tour as it is
    const blank = L.kind === 'tours' && !from;
    let cats = [];
    if (blank) { try { cats = (await A.api('GET', '/admin/api/tour-categories/_new')).items || []; } catch (e) { cats = []; } }
    const groups = [...new Set(cats.map(c => c.group))];
    const box = await A.dialog({
      title: fromName ? 'Copy “' + fromName + '”' : 'Add a new ' + L.one, ok: 'Create ' + L.one + ' as a draft',
      html: '<div class="f"><label class="lb">Name of the ' + L.one + '</label><input class="in" data-n placeholder="e.g. Rajasthan Desert & Forts Tour"></div>' +
        (blank ? (cats.length ? '<div class="f"><label class="lb">Show it in these categories</label><div class="nc-cats">' + groups.map(g => '<div class="nc-g"><h5>' + A.esc(g) + '</h5>' +
            cats.filter(c => c.group === g).map(c => '<label><input type="checkbox" value="' + A.esc(c.id) + '"><span>' + A.esc(c.name) + '</span>' + (c.code ? '<i class="code-b">' + A.esc(c.code) + '</i>' : '') + '</label>').join('') + '</div>').join('') + '</div></div>' : '') :
          '<div class="f"><label class="lb">Start from (its text and layout are copied, then you change them)</label><select class="in" data-f>' +
          options.map(([id, n]) => '<option value="' + A.esc(id) + '"' + (id === from ? ' selected' : '') + '>' + A.esc(n) + '</option>').join('') + '</select></div>') +
        '<p class="hint">' + (blank ? 'The tour starts empty, as a draft: fill in its days and prices, then publish it.' : 'It starts as a draft: visitors see it once it is published.') + '</p>',
      // (26 Oct 2026, client) no address box: the address is made from the name
      onOpen: box => { const n = box.querySelector('[data-n]'); if (fromName) n.value = fromName + ' (copy)'; },
      validate: box => !box.querySelector('[data-n]').value.trim() ? 'Please type a name.' : !A.slug(box.querySelector('[data-n]').value) ? 'Use letters or numbers in the name.' : ''
    });
    if (!box) return;
    try {
      const fsel = box.querySelector('[data-f]');
      const j = await A.api('POST', '/admin/api/item/' + L.kind, { name: box.querySelector('[data-n]').value.trim(), slug: A.slug(box.querySelector('[data-n]').value), from: fsel ? fsel.value : '',
        blank, categories: [...box.querySelectorAll('.nc-cats input:checked')].map(x => x.value) });
      location.href = '/admin/' + L.kind + '/' + j.id;
    } catch (e) { A.toast(e.message, true); }
  };
  const newBtn = document.querySelector('[data-new]'); if (newBtn) newBtn.onclick = () => create('', '');
  document.querySelectorAll('[data-copy]').forEach(b => { b.onclick = () => create(b.dataset.copy, b.dataset.name); });
  const openNew = () => { if (location.hash === '#new') { history.replaceState(null, '', location.pathname); create('', ''); } };
  openNew(); window.addEventListener('hashchange', openNew);   // "Add …" in the menu while already on this list
  document.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = async () => {
      if (!(await A.confirm('Delete this ' + L.one + '?', '"' + b.dataset.name + '" will be taken off the website. You can put it back from "Deleted items".', 'Delete', true))) return;
      try { await A.api('DELETE', '/admin/api/item/' + L.kind + '/' + b.dataset.del); b.closest('tr').remove(); pager.update(); A.toast('Deleted — it is in "Deleted items"'); }
      catch (e) { A.toast(e.message, true); }
    };
  });
})();
