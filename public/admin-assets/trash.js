// Meruka admin: deleted items — put back
(function () {
  const A = window.ADMIN;
  document.querySelectorAll('[data-restore]').forEach(b => {
    b.onclick = async () => {
      try { await A.api('POST', '/admin/api/restore', { kind: b.dataset.kind, bin: b.dataset.bin }); A.toast('Back on the website'); b.closest('tr').remove(); }
      catch (e) { A.toast(e.message, true); }
    };
  });
})();
