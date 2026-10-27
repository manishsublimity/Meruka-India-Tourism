// Meruka admin: enquiries — status, who handles it, a note for the team; filter by status, search, 20 to a page
(function () {
  const A = window.ADMIN;
  const PILL = { New: 'pill-new', Replied: 'pill-live', 'Quote sent': 'pill-draft', Booked: 'pill-role', Closed: 'pill-off' };
  const cards = [...document.querySelectorAll('[data-enq]')];
  const pager = cards.length ? A.pager(cards, cards[0].parentNode) : null;
  const tabs = [...document.querySelectorAll('[data-enq-tabs] [data-f]')], q = document.querySelector('[data-q]');
  let f = '';
  const run = () => {
    const v = q.value.trim().toLowerCase();
    cards.forEach(c => { c.dataset.out = (f && c.dataset.st !== f) || (v && !c.dataset.s.includes(v)) ? '1' : ''; });
    if (pager) pager.update(true);
  };
  tabs.forEach(t => t.onclick = () => { f = t.dataset.f; tabs.forEach(x => x.classList.toggle('on', x === t)); run(); });
  q.oninput = run;
  const save = async (card, body, msg) => {
    try {
      const r = await A.api('PATCH', '/admin/api/enquiries/' + card.dataset.enq, body);
      card.dataset.st = r.status; card.classList.toggle('is-new', r.status === 'New');
      const p = card.querySelector('[data-pill]'); p.textContent = r.status; p.className = 'pill ' + (PILL[r.status] || '');
      A.toast(msg);
    } catch (e) { A.toast(e.message, true); }
  };
  cards.forEach(card => {
    // (26 Oct 2026) "Open" shows everything the guest wrote and the team's note
    const op = card.querySelector('[data-open]'), more = card.querySelector('.enq-more');
    if (op && more) op.onclick = () => { more.hidden = !more.hidden; op.setAttribute('aria-expanded', !more.hidden); op.textContent = more.hidden ? 'Open' : 'Close'; };
    card.querySelector('[data-status]').onchange = e => save(card, { status: e.target.value }, 'Status: ' + e.target.value);
    card.querySelector('[data-assignee]').onchange = e => save(card, { assignee: e.target.value }, e.target.value ? 'Handled by ' + e.target.selectedOptions[0].text : 'Nobody handles it now');
    let t; card.querySelector('[data-note]').oninput = e => { clearTimeout(t); t = setTimeout(() => save(card, { note: e.target.value }, 'Note saved'), 700); };
    const del = card.querySelector('[data-del]');
    if (del) del.onclick = async () => {
      if (!(await A.confirm('Delete this enquiry?', 'It cannot be brought back. Download the CSV first if you want a copy.', 'Delete', true))) return;
      try { await A.api('DELETE', '/admin/api/enquiries/' + card.dataset.enq); location.reload(); } catch (err) { A.toast(err.message, true); }
    };
  });
})();
