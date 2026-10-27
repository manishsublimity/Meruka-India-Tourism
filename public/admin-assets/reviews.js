// Meruka admin: Guest reviews as a table (26 Oct 2026, client video II) — search, add, change, reorder, delete.
// Each change is published straight away (the reviews section of data/testimonials, via /admin/api/single/reviews).
(function () {
  const A = window.ADMIN, R = window.REVIEWS;
  const body = document.querySelector('[data-body]'), q = document.querySelector('[data-q]'), count = document.querySelector('[data-count]');
  let data = null;
  const cut = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const from = r => (r.details && r.details.length ? r.details.join(', ') : r.country || '');
  const draw = () => {
    const v = q.value.trim().toLowerCase();
    body.innerHTML = '';
    let shown = 0;
    data.all.forEach((r, i) => {
      if (v && !JSON.stringify([r.name, from(r), r.tour, r.quote]).toLowerCase().includes(v)) return;
      shown++;
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="n">' + (i + 1) + '</td><td><b></b><small class="url"></small></td><td class="rv-t"></td><td class="muted rv-q"></td><td class="acts">' +
        (R.canPublish ? '<button type="button" class="btn btn-s btn-p" data-edit>Edit</button><button type="button" class="btn btn-s btn-d" data-del>Delete</button>' : '<span class="muted">View only</span>') + '</td>';
      const c = tr.children;
      c[1].firstChild.textContent = r.name; c[1].lastChild.textContent = from(r); c[2].textContent = r.tour || ''; c[3].textContent = cut(r.quote, 110);
      if (R.canPublish) {
        tr.querySelector('[data-edit]').onclick = () => edit(i);
        tr.querySelector('[data-del]').onclick = async () => { if (!(await A.confirm('Delete the review by ' + r.name + '?', 'It is taken off the website. History keeps the earlier version.', 'Delete', true))) return; data.all.splice(i, 1); save('Review deleted'); };
      }
      body.appendChild(tr);
    });
    count.textContent = (v ? shown + ' of ' : '') + data.all.length + ' reviews';
  };
  const save = async msg => {
    try { const r = await A.api('PUT', '/admin/api/single/reviews', { data: { all: data.all }, publish: true }); data.all = r.data.all; draw(); A.toast(msg + ' — the website is updated'); }
    catch (e) { A.toast(e.message, true); load(); }
  };
  // the form for one review: only what the website shows
  const edit = async i => {
    const r = i == null ? { tour: '', quote: '', name: '', details: [], country: '', initials: '' } : data.all[i];
    const box = await A.dialog({
      title: i == null ? 'Add a review' : 'Change the review by ' + r.name, ok: i == null ? 'Add review' : 'Save',
      html: '<div class="f"><label class="lb">Client name</label><input class="in" data-n placeholder="e.g. Brad Berquist"></div>' +
        '<div class="f"><label class="lb">Where they are from</label><input class="in" data-c placeholder="e.g. USA, or Tour Leader, Trinidad & Tobago"><p class="hint">Shown under the name. Separate two parts with a comma.</p></div>' +
        '<div class="f"><label class="lb">Tour they took</label><input class="in" data-t placeholder="e.g. Golden Triangle Tour" list="rv-tours"></div>' +
        '<div class="f"><label class="lb">What the guest wrote</label><textarea class="in" rows="7" data-q></textarea></div>',
      onOpen: b => {
        b.querySelector('[data-n]').value = r.name; b.querySelector('[data-c]').value = from(r); b.querySelector('[data-t]').value = r.tour || ''; b.querySelector('[data-q]').value = r.quote || '';
        A.api('GET', '/admin/api/tours-index').then(x => { const dl = document.createElement('datalist'); dl.id = 'rv-tours'; dl.innerHTML = (x.items || []).map(t => '<option value="' + A.esc(t.name) + '">').join(''); b.appendChild(dl); }).catch(() => {});
      },
      validate: b => !b.querySelector('[data-n]').value.trim() ? 'Type the client’s name.' : !b.querySelector('[data-q]').value.trim() ? 'Type what the guest wrote.' : ''
    });
    if (!box) return;
    const name = box.querySelector('[data-n]').value.trim(), place = box.querySelector('[data-c]').value.trim();
    const details = place ? place.split(/\s*,\s*/).filter(Boolean) : [];
    const out = Object.assign({}, r, { name, details, country: details.join(' · '), tour: box.querySelector('[data-t]').value.trim(), quote: box.querySelector('[data-q]').value.trim(),
      initials: name.split(/\s+/).filter(w => /^[A-Za-z]/.test(w) && !/^(mr|mrs|ms|dr)\.?$/i.test(w)).map(w => w[0].toUpperCase()).slice(0, 2).join('') });
    if (i == null) data.all.unshift(out); else data.all[i] = out;
    save(i == null ? 'Review added' : 'Review saved');
  };
  const add = document.querySelector('[data-add]'); if (add) add.onclick = () => edit(null);
  const load = async () => { try { data = (await A.api('GET', '/admin/api/single/reviews')).data; draw(); if (location.hash === '#new' && R.canPublish) { history.replaceState(null, '', location.pathname); edit(null); } } catch (e) { body.innerHTML = '<tr><td colspan="5" class="err">' + A.esc(e.message) + '</td></tr>'; } };
  q.oninput = () => data && draw();
  load();
})();
