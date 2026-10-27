// Meruka admin: deleted items — put back
(function () {
  const A = window.ADMIN;
  // (23 Oct 2026) 20 to a page
  const rows = [...document.querySelectorAll('tbody tr')], table = document.querySelector('table');
  const pager = table && A.pager(rows, table);
  document.querySelectorAll('[data-restore]').forEach(b => {
    b.onclick = async () => {
      try { await A.api('POST', '/admin/api/restore', { kind: b.dataset.kind, bin: b.dataset.bin }); A.toast('Back on the website'); b.closest('tr').remove(); if (pager) pager.update(); }
      catch (e) { A.toast(e.message, true); }
    };
  });
})();
