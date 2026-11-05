// Brings the admin panel's old files into MySQL (5 Nov 2026). Runs by itself the first time the site starts with an
// empty database, or by hand: `npm run db:import` (adds what is missing) / `npm run db:import -- --force` (empties the
// tables first). The files are only read, never changed or deleted.
//   data/cms/**.json (edits), data/cms/_drafts, data/cms/_revisions, data/cms/trash, data/cms/_price-log.json,
//   data/cms/tour-codes.json, data/cms/role-looks.json, data/<section>/*.js added in the panel (__cmsNew),
//   data/users.json, data/enquiries.json, data/activity.json, data/owner-profile.json, public/uploads/*
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DATA = path.join(ROOT, 'data');
const CMS = path.join(DATA, 'cms');
const UPLOADS = path.join(ROOT, 'public', 'uploads');
const SECTIONS = ['tours', 'tour-lists', 'articles', 'posts'];
const IMG = /\.(webp|jpe?g|png|gif|avif|svg)$/i;
const MIME = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml' };

const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const dirs = d => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name) : []);
const jsons = d => (fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.json')) : []);
const mtime = f => { try { return fs.statSync(f).mtime; } catch (e) { return new Date(); } };
const date = s => { const d = new Date(s); return isNaN(d) ? new Date() : d; };

// every edit file: data/cms/<path>.json outside the panel's own folders
function editFiles(dir, rel, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!rel && ['_drafts', '_revisions', 'trash'].includes(e.name)) continue; editFiles(path.join(dir, e.name), r, out); }
    else if (e.name.endsWith('.json') && !['_price-log.json', 'tour-codes.json', 'role-looks.json'].includes(r)) out.push(r);
  }
  return out;
}

async function importFiles(pool, opts = {}) {
  const n = { edits: 0, drafts: 0, revisions: 0, 'added items': 0, 'deleted items': 0, 'price changes': 0, 'tour codes': 0, users: 0, enquiries: 0, 'activity lines': 0, photos: 0 };
  const c = await pool.getConnection();
  const ins = (sql, p) => c.query((opts.force ? 'REPLACE' : 'INSERT IGNORE') + sql, p);
  try {
    await c.beginTransaction();
    if (opts.force) for (const t of ['cms_edits', 'cms_drafts', 'cms_revisions', 'cms_items', 'cms_hidden', 'cms_trash', 'price_log', 'tour_codes', 'users', 'enquiries', 'activity_log', 'uploads', 'settings']) await c.query('DELETE FROM ' + t);

    if (fs.existsSync(CMS)) {
      for (const r of editFiles(CMS, '', [])) {
        const f = path.join(CMS, r), v = readJson(f); if (v == null) continue;
        await ins(' INTO cms_edits (path, data, updated_at) VALUES (?, ?, ?)', [r.slice(0, -5), JSON.stringify(v), mtime(f)]); n.edits++;
      }
      for (const sec of dirs(path.join(CMS, '_drafts'))) for (const f of jsons(path.join(CMS, '_drafts', sec))) {
        const p = path.join(CMS, '_drafts', sec, f), v = readJson(p); if (v == null) continue;
        await ins(' INTO cms_drafts (section, item_id, data, updated_at) VALUES (?, ?, ?, ?)', [sec, f.slice(0, -5), JSON.stringify(v), mtime(p)]); n.drafts++;
      }
      for (const sec of dirs(path.join(CMS, '_revisions'))) for (const id of dirs(path.join(CMS, '_revisions', sec))) for (const f of jsons(path.join(CMS, '_revisions', sec, id))) {
        const p = path.join(CMS, '_revisions', sec, id, f), v = readJson(p); if (v == null) continue;
        const m = v._meta || {};
        await ins(' INTO cms_revisions (section, item_id, rev, note, by_name, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [sec, id, f.slice(0, -5), m.note || null, m.by || null, JSON.stringify(v), m.at ? date(m.at) : mtime(p)]); n.revisions++;
      }
      for (const sec of dirs(path.join(CMS, 'trash'))) for (const bin of dirs(path.join(CMS, 'trash', sec))) {
        const id = bin.split('__')[0], d = path.join(CMS, 'trash', sec, bin);
        const js = fs.existsSync(path.join(d, id + '.js')) ? fs.readFileSync(path.join(d, id + '.js'), 'utf8') : null, v = readJson(path.join(d, id + '.json'));
        const at = bin.split('__')[1] || '', when = date(at.replace(/^(\d{4}-\d\d-\d\d)T(\d\d)-(\d\d)-(\d\d)-(\d+)Z$/, '$1T$2:$3:$4.$5Z'));
        const name = String((v && (v.heading || v.title)) || id).replace(/<[^>]+>/g, '').trim().slice(0, 255);
        await ins(' INTO cms_trash (section, bin, item_id, name, source, data, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [sec, bin, id, name, js, v == null ? null : JSON.stringify(v), when]); n['deleted items']++;
        // its data file is gone from the website: if git brings it back, it stays deleted
        if (!fs.existsSync(path.join(DATA, sec, id + '.js'))) await c.query('INSERT IGNORE INTO cms_hidden (section, item_id, hidden_at) VALUES (?, ?, ?)', [sec, id, when]);
      }
      const log = readJson(path.join(CMS, '_price-log.json')) || [];
      if (!opts.force && log.length && (await c.query('SELECT COUNT(*) AS n FROM price_log'))[0][0].n) log.length = 0;   // already there
      for (const e of log.slice().reverse()) { await c.query('INSERT INTO price_log (at, tour_id, tour_name, by_name, data) VALUES (?, ?, ?, ?, ?)', [date(e.at), e.id || null, e.name || null, e.by || null, JSON.stringify(e)]); n['price changes']++; }
      for (const [u, code] of Object.entries(readJson(path.join(CMS, 'tour-codes.json')) || {})) { await ins(' INTO tour_codes (url, code) VALUES (?, ?)', [u, String(code)]); n['tour codes']++; }
      const looks = readJson(path.join(CMS, 'role-looks.json'));
      if (looks) await ins(' INTO settings (name, data, updated_at) VALUES (?, ?, ?)', ['role-looks', JSON.stringify(looks), new Date()]);
    }
    // the tours, categories, pages and posts added in the panel (their small data file)
    for (const sec of SECTIONS) {
      const d = path.join(DATA, sec); if (!fs.existsSync(d)) continue;
      for (const f of fs.readdirSync(d).filter(x => x.endsWith('.js'))) {
        const src = fs.readFileSync(path.join(d, f), 'utf8');
        if (!/__cmsNew:\s*true/.test(src)) continue;
        await ins(' INTO cms_items (section, item_id, source, created_at) VALUES (?, ?, ?, ?)', [sec, f.slice(0, -3), src, mtime(path.join(d, f))]); n['added items']++;
      }
    }
    // users, enquiries (kept in their order)
    const users = readJson(path.join(DATA, 'users.json')) || [];
    if (opts.force || !(await c.query('SELECT COUNT(*) AS n FROM users'))[0][0].n) for (const [i, u] of users.entries()) {
      await c.query('REPLACE INTO users (pos, id, email, name, role, data) VALUES (?, ?, ?, ?, ?, ?)', [i, u.id || null, u.email || null, u.name || null, u.role || null, JSON.stringify(u)]); n.users++;
    }
    const enq = readJson(path.join(DATA, 'enquiries.json')) || [];
    if (opts.force || !(await c.query('SELECT COUNT(*) AS n FROM enquiries'))[0][0].n) for (const [i, e] of enq.entries()) {
      await c.query('REPLACE INTO enquiries (pos, received_at, name, email, status, data) VALUES (?, ?, ?, ?, ?, ?)', [i, e.receivedAt || null, String(e.name || '').slice(0, 191) || null, String(e.email || '').slice(0, 191) || null, e._status || (e._read ? 'Replied' : 'New'), JSON.stringify(e)]); n.enquiries++;
    }
    const act = readJson(path.join(DATA, 'activity.json')) || [];
    if (opts.force || !(await c.query('SELECT COUNT(*) AS n FROM activity_log'))[0][0].n) for (const a of act.slice(-2000)) {
      await c.query('INSERT INTO activity_log (at, by_name, by_id, action, what, link) VALUES (?, ?, ?, ?, ?, ?)', [date(a.at), a.by || null, a.byId || null, a.action || null, a.what || null, a.link || null]); n['activity lines']++;
    }
    const prof = readJson(path.join(DATA, 'owner-profile.json'));
    if (prof) await ins(' INTO settings (name, data, updated_at) VALUES (?, ?, ?)', ['owner-profile', JSON.stringify(prof), new Date()]);
    // uploaded photos
    if (fs.existsSync(UPLOADS)) for (const f of fs.readdirSync(UPLOADS).filter(x => IMG.test(x))) {
      const p = path.join(UPLOADS, f), buf = fs.readFileSync(p);
      await ins(' INTO uploads (name, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?)', [f, MIME[f.split('.').pop().toLowerCase()] || 'application/octet-stream', buf.length, buf, mtime(p)]); n.photos++;
    }
    await c.query('REPLACE INTO settings (name, data, updated_at) VALUES (?, ?, ?)', ['imported', JSON.stringify({ at: new Date().toISOString(), counts: n }), new Date()]);
    await c.commit();
  } catch (e) { await c.rollback().catch(() => {}); throw e; } finally { c.release(); }
  return n;
}

module.exports = { importFiles };
