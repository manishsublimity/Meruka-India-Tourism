// Meruka admin: the Photos page (3 Nov 2026) — every photo in one grid: search by name, upload or drop files, click to
// copy a photo's address, delete an uploaded one
(function () {
  const A = window.ADMIN;
  const grid = document.querySelector('[data-page-grid]'), drop = document.querySelector('[data-page-drop]'), file = document.querySelector('[data-page-file]');
  const mq = document.querySelector('[data-mq]'), count = document.querySelector('[data-mcount]');
  let all = [];
  const DEL = '<button class="mi-del" type="button" data-del title="Delete this photo" aria-label="Delete this photo">✕</button>';
  const draw = () => {
    const q = mq.value.trim(), list = q ? all.filter(f => A.photoMatch(f, q)) : all;
    count.textContent = q ? list.length + ' of ' + all.length + ' photos' : all.length + ' photos';
    grid.innerHTML = list.length ? list.map(f => A.photoTile(f, f.dir === 'uploads' ? DEL : '')).join('') : '<p class="mm-empty">' + (q ? 'No photo has “' + A.esc(q) + '” in its name.' : 'No photos yet.') + '</p>';
  };
  const load = async () => { all = A.allPhotos(await A.media()); draw(); };
  mq.oninput = draw;
  grid.onclick = async e => {
    const it = e.target.closest('.mi'); if (!it) return;
    if (e.target.closest('[data-del]')) {
      const name = it.dataset.src.split('/').pop();
      if (!(await A.confirm('Delete ' + name + '?', 'Pages that use it will show no photo.', 'Delete', true))) return;
      try { await A.api('DELETE', '/admin/api/media/' + encodeURIComponent(name)); A.toast('Deleted'); load(); } catch (err) { A.toast(err.message, true); }
      return;
    }
    try { await navigator.clipboard.writeText(it.dataset.src); A.toast('Copied: ' + it.dataset.src); } catch (err) { prompt('Photo address:', it.dataset.src); }
  };
  const up = async files => { if ((await A.upload(files)).length) { mq.value = ''; load(); } };
  file.onchange = () => up([...file.files]);
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = e => { if (!drop.contains(e.relatedTarget)) drop.classList.remove('over'); };
  drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); up([...e.dataTransfer.files]); };
  load();
})();
