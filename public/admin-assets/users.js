// Meruka admin: users — add a person, change their details, role, what they may do, password, switch them off, delete
// (Owners only). (26 Oct 2026, client) a role ticks a ready-made set of permissions; the ticks can be changed per person.
(function () {
  const A = window.ADMIN, R = window.ROLES, P = window.PERMS;
  const roleOptions = sel => Object.entries(R).map(([k, r]) => '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + A.esc(r.label) + '</option>').join('');
  const all = r => R[r] && R[r].can.includes('*');
  const defaults = r => all(r) ? P.map(p => p[0]) : (R[r] ? R[r].can : []);
  const form = (u, isNew) =>
    '<div class="f"><label class="lb">Name</label><input class="in" data-n value="' + A.esc(u.name || '') + '" placeholder="e.g. Priya Sharma" autocomplete="off"></div>' +
    '<div class="f"><label class="lb">Email (used to log in)</label><input class="in" data-e type="email" value="' + A.esc(u.email || '') + '" placeholder="name@company.com" autocomplete="off"></div>' +
    '<div class="f"><label class="lb">Role</label><select class="in" data-r>' + roleOptions(u.role || 'editor') + '</select></div>' +
    '<div class="f"><label class="lb">What they can do <small class="muted" data-own></small></label><div class="perm-grid" data-perms>' +
      P.map(([k, t]) => '<label class="perm"><input type="checkbox" value="' + k + '"><span>' + A.esc(t) + '</span></label>').join('') + '</div></div>' +
    '<div class="f"><label class="lb">' + (isNew ? 'Password' : 'New password (leave empty to keep the current one)') + '</label><input class="in" data-p type="password" autocomplete="new-password" placeholder="At least 8 characters"></div>' +
    (isNew ? '' : '<div class="f"><label class="lb"><input type="checkbox" data-a' + (u.active ? ' checked' : '') + '> Can log in (untick to switch the account off)</label></div>') +
    '<p class="hint">Share the email and password with the person yourself. They can change their password in My account.</p>';
  // the ticks follow the role; changing a tick makes it this person's own choice
  const wire = (box, u) => {
    const r = box.querySelector('[data-r]'), own = box.querySelector('[data-own]'), ticks = [...box.querySelectorAll('[data-perms] input')];
    const set = list => ticks.forEach(t => { t.checked = list.includes(t.value); t.disabled = all(r.value); });
    const note = () => { const d = defaults(r.value), v = ticks.filter(t => t.checked).map(t => t.value); own.textContent = all(r.value) ? '— an Owner can do everything' : (v.length === d.length && v.every(x => d.includes(x)) ? '— as the ' + R[r.value].label + ' role' : '— own choice for this person'); };
    set(u.perms && u.perms.length ? u.perms : defaults(r.value)); note();
    r.onchange = () => { set(defaults(r.value)); note(); };
    ticks.forEach(t => t.onchange = note);
  };
  const read = (box, isNew) => {
    const out = { name: box.querySelector('[data-n]').value.trim(), email: box.querySelector('[data-e]').value.trim(), role: box.querySelector('[data-r]').value,
      perms: [...box.querySelectorAll('[data-perms] input')].filter(t => t.checked).map(t => t.value) };
    const p = box.querySelector('[data-p]').value; if (p || isNew) out.password = p;
    const a = box.querySelector('[data-a]'); if (a) out.active = a.checked;
    return out;
  };
  const check = (box, isNew) => {
    const v = read(box, isNew);
    if (!v.name) return 'Enter a name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return 'Enter a valid email address.';
    if ((isNew || v.password) && v.password.length < 8) return 'The password needs at least 8 characters.';
    if (!v.perms.length) return 'Tick at least one thing they can do.';
    return '';
  };
  document.querySelector('[data-add-user]').onclick = async () => {
    const box = await A.dialog({ title: 'Add a user', ok: 'Add user', html: form({}, true), onOpen: b => wire(b, {}), validate: b => check(b, true) });
    if (!box) return;
    try { await A.api('POST', '/admin/api/users', read(box, true)); A.toast('User added'); location.reload(); } catch (e) { A.toast(e.message, true); }
  };
  // "+ New → User" in the top bar
  const openNew = () => { if (location.hash === '#new') { history.replaceState(null, '', location.pathname); document.querySelector('[data-add-user]').click(); } };
  window.addEventListener('hashchange', openNew); openNew();
  document.querySelectorAll('[data-user]').forEach(tr => {
    const u = JSON.parse(tr.dataset.user);
    const ed = tr.querySelector('[data-edit-user]'), del = tr.querySelector('[data-del-user]');
    if (ed) ed.onclick = async () => {
      const box = await A.dialog({ title: 'Change ' + u.name, ok: 'Save', html: form(u, false), onOpen: b => wire(b, u), validate: b => check(b, false) });
      if (!box) return;
      try { await A.api('PATCH', '/admin/api/users/' + u.id, read(box, false)); A.toast('Saved'); location.reload(); } catch (e) { A.toast(e.message, true); }
    };
    if (del) del.onclick = async () => {
      if (!(await A.confirm('Delete ' + u.name + '?', 'They will not be able to log in any more. Their changes stay in the activity log.', 'Delete', true))) return;
      try { await A.api('DELETE', '/admin/api/users/' + u.id); A.toast('User deleted'); tr.remove(); } catch (e) { A.toast(e.message, true); }
    };
  });
})();
