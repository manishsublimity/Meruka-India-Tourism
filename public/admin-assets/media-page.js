// Meruka admin: the Photos page (3 Nov 2026) — every photo in one grid: search by name, upload or drop files, click to
// copy a photo's address, delete an uploaded one. (6 Nov 2026, client) tick one or many uploaded photos (or all of
// them) and delete them together; show all / uploaded / the website's own photos
(function () {
  const A = window.ADMIN;
  const grid = document.querySelector('[data-page-grid]'), drop = document.querySelector('[data-page-drop]'), file = document.querySelector('[data-page-file]');
  const mq = document.querySelector('[data-mq]'), count = document.querySelector('[data-mcount]'), show = document.querySelector('[data-mshow]');
  const bar = document.querySelector('[data-bulk]'), mall = document.querySelector('[data-mall]'), mallT = document.querySelector('[data-mall-t]');
  let all = [];
  const sel = new Set();                                   // the ticked photos (their address)
  const DEL = '<button class="mi-del" type="button" data-del title="Delete this photo" aria-label="Delete this photo">✕</button>';
  const CK = '<label class="mi-ck" title="Select"><input type="checkbox" data-ck aria-label="Select this photo"></label>';
  const shown = () => {
    const q = mq.value.trim(), w = show.value;
    return all.filter(f => (!q || A.photoMatch(f, q)) && (!w || (w === 'up') === (f.dir === 'uploads')));
  };
  const sync = () => {
    const ups = shown().filter(f => f.dir === 'uploads'), n = sel.size;
    bar.hidden = !n;
    bar.querySelector('[data-bulk-n]').textContent = n + (n === 1 ? ' photo selected' : ' photos selected');
    const on = ups.filter(f => sel.has(f.src)).length;
    mall.disabled = !ups.length;
    mall.checked = !!ups.length && on === ups.length; mall.indeterminate = on > 0 && on < ups.length;
    mallT.textContent = ups.length ? 'Select all ' + ups.length + ' uploaded photo' + (ups.length === 1 ? '' : 's') + (mq.value.trim() ? ' found' : '') : 'No uploaded photos here to select';
    grid.querySelectorAll('.mi').forEach(t => { const c = sel.has(t.dataset.src); t.classList.toggle('sel', c); const i = t.querySelector('[data-ck]'); if (i) i.checked = c; });
  };
  const draw = () => {
    const list = shown();
    count.textContent = list.length === all.length ? all.length + ' photos' : list.length + ' of ' + all.length + ' photos';
    grid.innerHTML = list.length ? list.map(f => A.photoTile(f, f.dir === 'uploads' ? CK + DEL : '')).join('') : '<p class="mm-empty">' + (mq.value.trim() ? 'No photo has “' + A.esc(mq.value.trim()) + '” in its name.' : 'No photos here yet.') + '</p>';
    sync();
  };
  const load = async () => {
    all = A.allPhotos(await A.media());
    const have = new Set(all.map(f => f.src)); [...sel].forEach(s => { if (!have.has(s)) sel.delete(s); });
    draw();
  };
  mq.oninput = draw; show.onchange = draw;
  mall.onchange = () => { shown().filter(f => f.dir === 'uploads').forEach(f => { if (mall.checked) sel.add(f.src); else sel.delete(f.src); }); sync(); };
  bar.querySelector('[data-bulk-clear]').onclick = () => { sel.clear(); sync(); };

  const del = name => A.api('DELETE', '/admin/api/media/' + encodeURIComponent(name));
  bar.querySelector('[data-bulk-del]').onclick = async () => {
    const list = [...sel], n = list.length;
    if (!(await A.confirm('Delete ' + n + (n === 1 ? ' photo?' : ' photos?'), 'Pages that use them will show no photo. This cannot be undone.', 'Delete', true))) return;
    bar.querySelectorAll('button').forEach(b => { b.disabled = true; });
    let ok = 0, err = '';
    for (const src of list) { try { await del(src.split('/').pop()); sel.delete(src); ok++; } catch (e) { err = e.message; } }
    bar.querySelectorAll('button').forEach(b => { b.disabled = false; });
    A.toast(err ? ok + ' deleted, ' + (n - ok) + ' not: ' + err : ok + (ok === 1 ? ' photo deleted' : ' photos deleted'), !!err);
    load();
  };

  grid.onclick = async e => {
    const it = e.target.closest('.mi'); if (!it) return;
    if (e.target.closest('.mi-ck')) {
      if (e.target.matches('[data-ck]')) { if (e.target.checked) sel.add(it.dataset.src); else sel.delete(it.dataset.src); sync(); }
      return;
    }
    if (e.target.closest('[data-del]')) {
      const name = it.dataset.src.split('/').pop();
      if (!(await A.confirm('Delete ' + name + '?', 'Pages that use it will show no photo.', 'Delete', true))) return;
      try { await del(name); sel.delete(it.dataset.src); A.toast('Deleted'); load(); } catch (err) { A.toast(err.message, true); }
      return;
    }
    // while photos are ticked, a click on another uploaded photo ticks it too
    if (sel.size && it.querySelector('[data-ck]')) { if (sel.has(it.dataset.src)) sel.delete(it.dataset.src); else sel.add(it.dataset.src); sync(); return; }
    try { await navigator.clipboard.writeText(it.dataset.src); A.toast('Copied: ' + it.dataset.src); } catch (err) { prompt('Photo address:', it.dataset.src); }
  };
  const up = async files => { if ((await A.upload(files)).length) { mq.value = ''; load(); } };
  file.onchange = () => up([...file.files]);
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = e => { if (!drop.contains(e.relatedTarget)) drop.classList.remove('over'); };
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); up([...e.dataTransfer.files]); };
  load();
})();
