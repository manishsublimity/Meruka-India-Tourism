// Meruka admin: the Photos page — upload, browse, copy an address, delete uploaded photos
(function () {
  const A = window.ADMIN;
  const grid = document.querySelector('[data-page-grid]'), tabs = document.querySelector('[data-page-tabs]');
  const drop = document.querySelector('[data-page-drop]'), file = document.querySelector('[data-page-file]');
  let groups = [], cur = 0;
  const draw = () => {
    tabs.innerHTML = groups.map((g, i) => `<button type="button" class="${i === cur ? 'on' : ''}" data-t="${i}">${A.esc(g.label)} (${g.files.length})</button>`).join('');
    const g = groups[cur] || { files: [], dir: '' };
    grid.innerHTML = g.files.length ? g.files.map(f => `<div class="mi" data-src="${A.esc(f.src)}" title="Click to copy the address"><img src="${A.esc(f.src)}" alt="" loading="lazy"><span>${A.esc(f.name)}</span>${g.dir === 'uploads' ? `<button class="del" type="button" data-del="${A.esc(f.name)}" title="Delete">✕</button>` : ''}</div>`).join('') : '<p class="hint">No photos here yet.</p>';
  };
  const load = async () => { groups = await A.media(); draw(); };
  tabs.onclick = e => { const t = e.target.closest('[data-t]'); if (t) { cur = +t.dataset.t; draw(); } };
  grid.onclick = async e => {
    const d = e.target.closest('[data-del]');
    if (d) {
      if (!confirm('Delete ' + d.dataset.del + '? Pages that use it will show no photo.')) return;
      try { await A.api('DELETE', '/admin/api/media/' + encodeURIComponent(d.dataset.del)); A.toast('Deleted'); load(); } catch (err) { A.toast(err.message, true); }
      return;
    }
    const it = e.target.closest('.mi'); if (!it) return;
    try { await navigator.clipboard.writeText(it.dataset.src); A.toast('Copied: ' + it.dataset.src); } catch (err) { prompt('Photo address:', it.dataset.src); }
  };
  const up = async files => { if ((await A.upload(files)).length) { cur = 0; load(); } };
  file.onchange = () => up([...file.files]);
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); up([...e.dataTransfer.files]); };
  load();
})();
