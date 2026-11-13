// Meruka admin: deleted items — put back, delete for good; (6 Nov 2026, client) tick several (or all) and do it together
(function () {
  const A = window.ADMIN;
  // (23 Oct 2026) 20 to a page
  const rows = [...document.querySelectorAll('tbody tr')], table = document.querySelector('table');
  const pager = table && A.pager(rows, table);
  const bar = document.querySelector('[data-bulk]'), all = document.querySelector('[data-all]');
  const live = () => rows.filter(r => r.isConnected);
  const picked = () => live().filter(r => r.querySelector('[data-pick]').checked);
  const sync = () => {
    if (!bar) return;
    const n = picked().length, total = live().length;
    bar.hidden = !n;
    bar.querySelector('[data-bulk-n]').textContent = n + ' of ' + total + ' selected';
    all.checked = !!total && n === total; all.indeterminate = n > 0 && n < total;
    rows.forEach(r => r.classList.toggle('sel', r.querySelector('[data-pick]').checked));
    if (!total) location.reload();
  };
  const gone = r => { r.remove(); if (pager) pager.update(); sync(); };
  const one = (url, r) => A.api('POST', url, { kind: r.dataset.kind, bin: r.dataset.bin });

  document.querySelectorAll('[data-restore]').forEach(b => {
    b.onclick = async () => {
      try { await one('/admin/api/restore', b.closest('tr')); A.toast('Back on the website'); gone(b.closest('tr')); }
      catch (e) { A.toast(e.message, true); }
    };
  });
  document.querySelectorAll('[data-purge]').forEach(b => {
    b.onclick = async () => {
      if (!(await A.confirm('Delete for good?', '“' + b.dataset.name + '” is removed for ever. It cannot be put back.', 'Delete for good', true))) return;
      try { await one('/admin/api/purge', b.closest('tr')); A.toast('Deleted for good'); gone(b.closest('tr')); }
      catch (e) { A.toast(e.message, true); }
    };
  });
  if (!bar) return;

  // ticking: one row, or all rows (every page)
  document.querySelector('tbody').addEventListener('change', e => { if (e.target.matches('[data-pick]')) sync(); });
  all.onchange = () => { live().forEach(r => { r.querySelector('[data-pick]').checked = all.checked; }); sync(); };
  bar.querySelector('[data-bulk-clear]').onclick = () => { all.checked = false; all.onchange(); };

  // the same action for every ticked row, one after the other; the ones that fail stay ticked
  const many = async (url, done) => {
    const list = picked(); let ok = 0, err = '';
    bar.querySelectorAll('button').forEach(b => { b.disabled = true; });
    for (const r of list) { try { await one(url, r); r.remove(); ok++; } catch (e) { err = e.message; } }
    bar.querySelectorAll('button').forEach(b => { b.disabled = false; });
    if (pager) pager.update();
    A.toast(err ? ok + ' ' + done + ', ' + (list.length - ok) + ' not: ' + err : ok + ' ' + done, !!err);
    sync();
  };
  bar.querySelector('[data-bulk-restore]').onclick = () => many('/admin/api/restore', picked().length === 1 ? 'item put back' : 'items put back');
  bar.querySelector('[data-bulk-purge]').onclick = async () => {
    const n = picked().length;
    if (!(await A.confirm('Delete ' + n + (n === 1 ? ' item' : ' items') + ' for good?', 'They are removed for ever and cannot be put back.', 'Delete for good', true))) return;
    many('/admin/api/purge', 'deleted for good');
  };
})();
