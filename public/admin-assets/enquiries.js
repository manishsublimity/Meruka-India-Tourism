// Meruka admin: enquiries — mark read / new, delete
(function () {
  const A = window.ADMIN;
  document.querySelectorAll('[data-enq]').forEach(card => {
    const i = card.dataset.enq;
    card.querySelector('[data-read]').onclick = async e => {
      const read = e.target.dataset.read === '1';
      try { await A.api('PATCH', '/admin/api/enquiries/' + i, { read }); location.reload(); } catch (err) { A.toast(err.message, true); }
    };
    card.querySelector('[data-del]').onclick = async () => {
      if (!confirm('Delete this enquiry? This cannot be undone.')) return;
      try { await A.api('DELETE', '/admin/api/enquiries/' + i); location.reload(); } catch (err) { A.toast(err.message, true); }
    };
  });
})();
