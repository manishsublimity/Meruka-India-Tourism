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
  if (want) { const map = { north: 0, south: 1, east: 2, west: 3, other: 4, travelers: 0, attractions: 1, tools: 2 }; if (secs[map[want]]) cur = map[want]; }
  // (27 Oct 2026, client) every part shows, one under the other; opened from the menu, that part alone
  const solo = !!want && secs.length > 1 && !!secs[cur];
  // (2 Nov 2026, client) Four Regions without a region: the region cards; a search shows the matching pages instead
  const ov = document.querySelector('[data-overview]');
  const show = () => { if (ov) { ov.hidden = false; secs.forEach(s => { s.hidden = true; }); return; } secs.forEach((s, i) => { s.hidden = solo && i !== cur; }); };
  tabs.forEach((t, i) => t.onclick = () => { cur = i; if (q) q.value = ''; rows.forEach(r => { r.hidden = false; }); show(); try { sessionStorage.setItem('mk-sec-' + T.mode, i); } catch (e) {} });
  show();
  if (solo) { const h = document.querySelector('.tr-top h1'); if (h) h.textContent = secs[cur].dataset.title; const ld = document.querySelector('.tr-top .lead'); if (ld && T.mode === 'places') ld.textContent = 'The ' + secs[cur].dataset.title + ' page, and the pages of its states and cities.';
    // (3 Nov 2026, client) the region's own page: a small pencil beside its name
    if (h && secs[cur].dataset.head) h.insertAdjacentHTML('beforeend', ' <a class="h1-edit" href="/admin/pages/' + encodeURIComponent(secs[cur].dataset.head) + '" title="Edit the ' + A.esc(secs[cur].dataset.title) + ' page itself: its text, At a glance and places"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>Edit page</a>'); secs[cur].querySelectorAll('[data-sec-h]').forEach(x => x.remove()); }
  if (q) q.oninput = () => {
    const v = q.value.trim().toLowerCase();
    rows.forEach(r => { r.hidden = !!v && !r.dataset.s.includes(v); });
    if (!v || solo) return show();
    if (ov) ov.hidden = true;
    tabs.forEach(t => t.classList.remove('on'));
    secs.forEach(s => { s.hidden = ![...s.querySelectorAll('[data-row]')].some(r => !r.hidden); });
  };

  // a new page: its name, its address (made from the name), and where it goes
  // (4 Nov 2026, client) a destination page: one box that says where it goes — the region, then the region itself (a
  // new state) or one of its states (a city of that state) — with the path it gets on the website
  const addPlace = async () => {
    let data; try { data = await A.api('GET', '/admin/api/page-places'); } catch (e) { A.toast(e.message, true); return; }
    const guide = T.mode === 'guide', secs = guide ? data.guide.filter(s => s.guideSection) : data.places.filter(s => s.parents.length);
    const now = (T.sections[cur] || {}).title, si = Math.max(0, secs.findIndex(s => s.title === now));
    let pk;
    const box = await A.dialog({ title: guide ? 'Add a travel guide page' : 'Add a destination page', ok: 'Create page', wide: true,
      html: '<label class="lb">Name of the page</label><input class="in" data-n placeholder="e.g. Ranthambore National Park"><div data-pp></div>' +
        '<p class="hint" style="margin:10px 0 0">The page is made as a draft. Write its text, then press Publish: it then shows on its region or state page by itself.</p>',
      onOpen: b => { const n = b.querySelector('[data-n]'); pk = A.placePicker(b, { secs, guide, si, name: () => n.value.trim() }); n.oninput = pk.refresh; },
      validate: b => b.querySelector('[data-n]').value.trim() ? '' : 'Type a name.' });
    if (!box) return;
    const name = box.querySelector('[data-n]').value.trim(), { sec, x } = pk.get();
    const parents = sec.parents.concat(x ? x.chain.concat([{ label: x.label, href: x.href }]) : []);
    const body = { name, slug: A.slug(name), from: guide ? 'weather' : 'delhi', parents };
    if (guide && !x) body.guideSection = sec.guideSection;
    try { const res = await A.api('POST', '/admin/api/item/pages', body); location.href = '/admin/pages/' + res.id; } catch (e) { A.toast(e.message, true); }
  };
  const add = async (section, parents) => {
    if (T.mode === 'places' || T.mode === 'guide') return addPlace();
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

  // (4 Nov 2026, client) a page to another place (another region, state or guide page)
  document.querySelectorAll('[data-move]').forEach(b => b.onclick = async () => {
    const res = await A.movePage({ id: b.dataset.move, url: b.dataset.url, name: b.dataset.name, group: T.mode, now: JSON.parse(b.dataset.now || '[]') });
    if (res) location.reload();
  });
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!(await A.confirm('Delete "' + b.dataset.name + '"?', 'It is taken off the website. You can put it back from Deleted items.', 'Delete', true))) return;
    try { await A.api('DELETE', '/admin/api/item/pages/' + b.dataset.del); b.closest('tr').remove(); A.toast('Deleted'); } catch (e) { A.toast(e.message, true); }
  });
})();
