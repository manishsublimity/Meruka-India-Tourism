// Meruka admin: Destinations, Travel Guide and the text tour pages (26 Oct 2026) — search, add a page in its place
// (a region or state, a guide section, or under another page), delete
(function () {
  const A = window.ADMIN, T = window.TREE;
  const rows = [...document.querySelectorAll('[data-row]')], q = document.querySelector('[data-tq]');
  // one section at a time; a search looks in all of them
  const secs = [...document.querySelectorAll('[data-sec]')], tabs = [...document.querySelectorAll('[data-sec-i]')];
  let cur = 0;
  try { const k = +sessionStorage.getItem('mk-sec-' + T.mode); if (secs[k]) cur = k; } catch (e) {}
  // the menu's links: ?region=north … / ?section=travelers …
  const qp = new URLSearchParams(location.search), want = qp.get('region') || qp.get('section');
  if (want) { const map = { north: 0, south: 1, east: 2, west: 3, travelers: 0, attractions: 1, tools: 2 }; if (secs[map[want]]) cur = map[want]; }
  // (27 Oct 2026, client) every part shows, one under the other; opened from the menu, that part alone
  const solo = !!want && secs.length > 1 && !!secs[cur];
  const show = () => { secs.forEach((s, i) => { s.hidden = solo && i !== cur; }); };
  tabs.forEach((t, i) => t.onclick = () => { cur = i; if (q) q.value = ''; rows.forEach(r => { r.hidden = false; }); show(); try { sessionStorage.setItem('mk-sec-' + T.mode, i); } catch (e) {} });
  show();
  if (solo) { const h = document.querySelector('.tr-top h1'); if (h) h.textContent = secs[cur].dataset.title; secs[cur].querySelectorAll('[data-sec-h]').forEach(x => x.remove()); }
  if (q) q.oninput = () => {
    const v = q.value.trim().toLowerCase();
    rows.forEach(r => { r.hidden = !!v && !r.dataset.s.includes(v); });
    if (!v || solo) return show();
    tabs.forEach(t => t.classList.remove('on'));
    secs.forEach(s => { s.hidden = ![...s.querySelectorAll('[data-row]')].some(r => !r.hidden); });
  };

  // a new page: its name, its address (made from the name), and where it goes
  const add = async (section, parents) => {
    const where = T.mode === 'guide'
      ? '<label class="lb">Section of the travel guide</label><select class="in" data-w>' + T.sections.filter(s => s.guideSection).map(s => '<option' + (s.guideSection === section ? ' selected' : '') + '>' + A.esc(s.guideSection) + '</option>').join('') + '</select>'
      : '<label class="lb">Under</label><select class="in" data-w>' + T.sections.filter(s => s.parents.length).map((s, i) => '<option value="' + i + '"' + (parents && parents[0] && s.parents[0] && parents[0].href === s.parents[0].href ? ' selected' : '') + '>' + A.esc(s.title) + '</option>').join('') + '</select>';
    const under = parents && parents.length ? '<p class="hint">It goes under <b>' + A.esc(parents[parents.length - 1].label) + '</b>.</p>' : '';
    const fixed = T.mode === 'guide' && section && T.sections.length === 1;
    const box = await A.dialog({
      title: 'Add a ' + T.one, ok: 'Create page',
      html: '<label class="lb">Name of the page</label><input class="in" data-n placeholder="e.g. Ranthambore National Park">' +
(under || (fixed ? '' : '<div class="f">' + where + '</div>')) +
        '<p class="hint">The page is made as a draft. Write its text, then press Publish to put it on the website.</p>',
      validate: b => b.querySelector('[data-n]').value.trim() ? '' : 'Type a name.'
    });
    if (!box) return;
    const name = box.querySelector('[data-n]').value.trim(), w = box.querySelector('[data-w]');
    const body = { name, slug: A.slug(name), from: T.mode === 'guide' ? 'weather' : 'delhi' };
    if (T.mode === 'guide') body.guideSection = w ? w.value : section;
    else body.parents = parents && parents.length ? parents : (T.sections.filter(s => s.parents.length)[w ? +w.value : 0] || {}).parents || [];
    try { const r = await A.api('POST', '/admin/api/item/pages', body); location.href = '/admin/pages/' + r.id; } catch (e) { A.toast(e.message, true); }
  };
  // the Add button at the top adds to the region or section shown; "+ Sub-page" adds under its page
  document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => b.dataset.parents ? add(b.dataset.section || '', JSON.parse(b.dataset.parents)) : add((T.sections[cur] || {}).guideSection || '', (T.sections[cur] || {}).parents && T.sections[cur].parents.length ? T.sections[cur].parents : null));
  const openNew = () => { if (location.hash === '#new') { history.replaceState(null, '', location.pathname); add((T.sections[cur] || {}).guideSection || '', (T.sections[cur] || {}).parents && T.sections[cur].parents.length ? T.sections[cur].parents : null); } };
  window.addEventListener('hashchange', openNew); openNew();

  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!(await A.confirm('Delete "' + b.dataset.name + '"?', 'It is taken off the website. You can put it back from Deleted items.', 'Delete', true))) return;
    try { await A.api('DELETE', '/admin/api/item/pages/' + b.dataset.del); b.closest('tr').remove(); A.toast('Deleted'); } catch (e) { A.toast(e.message, true); }
  });
})();
