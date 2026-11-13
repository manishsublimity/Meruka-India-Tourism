// MySQL storage for everything the admin panel changes (5 Nov 2026, client: "move all the CMS data into SQL").
//
// The site's imported content stays in data/*.js (in git). What the panel writes lives in MySQL tables:
//   cms_edits      the saved edits of each page / tour / setting (laid over data/<path>.js, see lib/cms/hook.js)
//   cms_drafts     drafts not yet published            cms_revisions  the History tab (latest 25 per item)
//   cms_items      tours, categories, pages, posts added in the panel (their small data file)
//   cms_hidden     items deleted in the panel           cms_trash      Deleted items (can be put back)
//   price_log      Prices & notes → Price log           tour_codes     codes given in a tour's editor
//   users          panel users and roles                enquiries      website enquiries (Plan My Trip, Contact)
//   activity_log   who changed what                     uploads        photos uploaded in the panel (the image bytes)
//   settings       small settings (owner name, panel looks per role, import note)
//
// How it works: at start-up init() reads every table into memory (the site needs its data at once, synchronously,
// exactly as it did from files). Every change updates the memory copy at once and is written to MySQL in the
// background, in order; flush() waits for those writes (the admin API waits before it answers, so a failed write
// shows as an error in the panel). Uploaded images are not kept in memory: they are read from MySQL when asked for.
// Run ONE copy of the site per database (a second copy would not see the first one's changes until restarted).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DATA = path.join(ROOT, 'data');
const CMS = path.join(DATA, 'cms');
const SECTIONS = ['tours', 'tour-lists', 'articles', 'posts'];

// the same tiny .env reader as lib/cms/auth.js (values already in the environment win)
(function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
})();

const T = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin';
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS cms_edits (path VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL, updated_at DATETIME(3) NOT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS cms_drafts (section VARCHAR(40) NOT NULL, item_id VARCHAR(100) NOT NULL, data LONGTEXT NOT NULL, updated_at DATETIME(3) NOT NULL, PRIMARY KEY (section, item_id)) ${T}`,
  `CREATE TABLE IF NOT EXISTS cms_revisions (id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, section VARCHAR(40) NOT NULL, item_id VARCHAR(100) NOT NULL, rev VARCHAR(64) NOT NULL,
     note TEXT NULL, by_name VARCHAR(191) NULL, data LONGTEXT NOT NULL, created_at DATETIME(3) NOT NULL, UNIQUE KEY one_rev (section, item_id, rev)) ${T}`,
  `CREATE TABLE IF NOT EXISTS cms_items (section VARCHAR(40) NOT NULL, item_id VARCHAR(100) NOT NULL, source LONGTEXT NOT NULL, created_at DATETIME(3) NOT NULL, PRIMARY KEY (section, item_id)) ${T}`,
  `CREATE TABLE IF NOT EXISTS cms_hidden (section VARCHAR(40) NOT NULL, item_id VARCHAR(100) NOT NULL, hidden_at DATETIME(3) NOT NULL, PRIMARY KEY (section, item_id)) ${T}`,
  `CREATE TABLE IF NOT EXISTS cms_trash (section VARCHAR(40) NOT NULL, bin VARCHAR(160) NOT NULL, item_id VARCHAR(100) NOT NULL, name VARCHAR(255) NULL, source LONGTEXT NULL, data LONGTEXT NULL,
     deleted_at DATETIME(3) NOT NULL, PRIMARY KEY (section, bin)) ${T}`,
  `CREATE TABLE IF NOT EXISTS price_log (id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, at DATETIME(3) NOT NULL, tour_id VARCHAR(100) NULL, tour_name VARCHAR(255) NULL, by_name VARCHAR(191) NULL, data LONGTEXT NOT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS tour_codes (url VARCHAR(191) NOT NULL PRIMARY KEY, code VARCHAR(20) NOT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS users (pos INT NOT NULL PRIMARY KEY, id VARCHAR(64) NULL, email VARCHAR(191) NULL, name VARCHAR(191) NULL, role VARCHAR(40) NULL, data LONGTEXT NOT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS enquiries (pos INT NOT NULL PRIMARY KEY, received_at VARCHAR(40) NULL, name VARCHAR(191) NULL, email VARCHAR(191) NULL, status VARCHAR(40) NULL, data LONGTEXT NOT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS activity_log (id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, at DATETIME(3) NOT NULL, by_name VARCHAR(191) NULL, by_id VARCHAR(64) NULL, action TEXT NULL, what TEXT NULL, link TEXT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS uploads (name VARCHAR(191) NOT NULL PRIMARY KEY, mime VARCHAR(40) NOT NULL, size INT NOT NULL, data LONGBLOB NOT NULL, created_at DATETIME(3) NOT NULL) ${T}`,
  `CREATE TABLE IF NOT EXISTS settings (name VARCHAR(64) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL, updated_at DATETIME(3) NOT NULL) ${T}`
];

let pool = null, ready = false;
const C = { edits: new Map(), drafts: new Map(), revs: new Map(), items: new Map(), hidden: new Set(), trash: new Map(),
  priceLog: [], tourCodes: {}, lists: { users: [], enquiries: [] }, activity: [], uploads: new Map(), settings: new Map() };

// ---------- the write queue ----------
let chain = Promise.resolve(), failure = null;
function enqueue(fn) {
  chain = chain.then(fn).catch(e => { failure = e; console.error('[db] a write to MySQL failed:', e.message); });
  snapshotSoon();
  return chain;
}
// (13 Nov 2026) the content file in git (lib/db/snapshot.js): kept up to date by itself only where DB_SNAPSHOT=on (the
// computer the content is written on), three seconds after the last save; a live server never writes it
const snapshotOn = () => /^(on|1|true|yes)$/i.test(String(process.env.DB_SNAPSHOT || '').trim());
let snapTimer = null;
function snapshotSoon() {
  if (!snapshotOn() || !ready) return;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => { chain.then(() => require('./snapshot').exportSnapshot(pool)).then(changed => { if (changed) console.log('[db] database/meruka-content.json updated — commit and push it with the code'); }).catch(e => console.error('[db] could not write database/meruka-content.json:', e.message)); }, 3000);
}
const q = (sql, params) => enqueue(() => pool.query(sql, params));
const tx = fn => enqueue(async () => {
  const c = await pool.getConnection();
  try { await c.beginTransaction(); await fn(c); await c.commit(); } catch (e) { await c.rollback().catch(() => {}); throw e; } finally { c.release(); }
});
// wait for every write so far; throws if one of them failed
async function flush() {
  await chain;
  if (failure) { const e = failure; failure = null; throw Object.assign(new Error('Could not save to the database: ' + e.message), { status: 500 }); }
}

const need = () => { if (!ready) throw new Error('The database is not connected yet (lib/db init() not finished)'); };
const J = v => JSON.stringify(v === undefined ? null : v);
const P = s => JSON.parse(s);
const now = () => new Date();
const k2 = (a, b) => a + '\u0000' + b;

// ---------- documents by their old file path under data/cms/ (so lib/cms/store.js keeps its shape) ----------
//   data/cms/<path>.json            → cms_edits   (e.g. data/cms/tours/goa.json → path "tours/goa")
//   data/cms/_drafts/<sec>/<id>.json → cms_drafts
//   data/cms/tour-codes.json         → tour_codes  data/cms/role-looks.json → settings "role-looks"
function route(p) {
  const rel = path.relative(CMS, p).split(path.sep).join('/');
  if (rel.startsWith('..') || !rel.endsWith('.json')) throw new Error('[db] not a CMS document: ' + p);
  const parts = rel.slice(0, -5).split('/');
  if (parts[0] === '_drafts' && parts.length === 3) return { t: 'draft', key: k2(parts[1], parts[2]), sec: parts[1], id: parts[2] };
  if (rel === 'tour-codes.json') return { t: 'codes' };
  if (rel === 'role-looks.json') return { t: 'setting', name: 'role-looks' };
  if (/^(_revisions|trash)\//.test(rel) || rel === '_price-log.json') throw new Error('[db] use the revisions / trash / price log API for ' + rel);
  return { t: 'edit', key: rel.slice(0, -5) };
}
const doc = {
  read(p) {
    need(); const r = route(p);
    if (r.t === 'edit') { const x = C.edits.get(r.key); return x ? P(x.data) : null; }
    if (r.t === 'draft') { const x = C.drafts.get(r.key); return x ? P(x.data) : null; }
    if (r.t === 'codes') return Object.assign({}, C.tourCodes);
    return setting.get(r.name);
  },
  write(p, v) {
    need(); const r = route(p), data = J(v), at = now();
    if (r.t === 'edit') { C.edits.set(r.key, { data, at }); q('REPLACE INTO cms_edits (path, data, updated_at) VALUES (?, ?, ?)', [r.key, data, at]); }
    else if (r.t === 'draft') { C.drafts.set(r.key, { data, at }); q('REPLACE INTO cms_drafts (section, item_id, data, updated_at) VALUES (?, ?, ?, ?)', [r.sec, r.id, data, at]); }
    else if (r.t === 'codes') {
      const next = {}; Object.entries(v || {}).forEach(([u, c]) => { next[String(u)] = String(c); });
      const old = C.tourCodes; C.tourCodes = next;
      const gone = Object.keys(old).filter(u => !(u in next)), changed = Object.entries(next).filter(([u, c]) => old[u] !== c);
      if (gone.length || changed.length) tx(async c => {
        for (const u of gone) await c.query('DELETE FROM tour_codes WHERE url = ?', [u]);
        for (const [u, code] of changed) await c.query('REPLACE INTO tour_codes (url, code) VALUES (?, ?)', [u, code]);
      });
    } else setting.set(r.name, v);
  },
  exists(p) { need(); const r = route(p); return r.t === 'edit' ? C.edits.has(r.key) : r.t === 'draft' ? C.drafts.has(r.key) : true; },
  mtime(p) { need(); const r = route(p), x = r.t === 'edit' ? C.edits.get(r.key) : r.t === 'draft' ? C.drafts.get(r.key) : null; return x ? x.at : null; },
  remove(p) {
    need(); const r = route(p);
    if (r.t === 'edit' && C.edits.delete(r.key)) q('DELETE FROM cms_edits WHERE path = ?', [r.key]);
    if (r.t === 'draft' && C.drafts.delete(r.key)) q('DELETE FROM cms_drafts WHERE section = ? AND item_id = ?', [r.sec, r.id]);
  }
};

// ---------- History (revisions): names sort in time order ----------
const revs = {
  names(sec, id) { need(); return [...(C.revs.get(k2(sec, id)) || new Map()).keys()].sort(); },
  get(sec, id, rev) { need(); const m = C.revs.get(k2(sec, id)), x = m && m.get(rev); return x ? P(x) : null; },
  add(sec, id, rev, v) {
    need(); const key = k2(sec, id); if (!C.revs.has(key)) C.revs.set(key, new Map());
    const data = J(v), meta = (v && v._meta) || {};
    C.revs.get(key).set(rev, data);
    q('REPLACE INTO cms_revisions (section, item_id, rev, note, by_name, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [sec, id, rev, meta.note || null, meta.by || null, data, now()]);
  },
  remove(sec, id, rev) {
    need(); const m = C.revs.get(k2(sec, id));
    if (m && m.delete(rev)) q('DELETE FROM cms_revisions WHERE section = ? AND item_id = ? AND rev = ?', [sec, id, rev]);
  }
};

// ---------- items added in the panel: their data file, written to data/<sec>/<id>.js as well so require() finds it ----------
const itemFile = (sec, id) => path.join(DATA, sec, id + '.js');
const items = {
  has(sec, id) { need(); return C.items.has(k2(sec, id)); },
  put(sec, id, source) {
    need(); const at = now();
    C.items.set(k2(sec, id), { sec, id, source, at });
    fs.mkdirSync(path.join(DATA, sec), { recursive: true }); fs.writeFileSync(itemFile(sec, id), source);
    q('REPLACE INTO cms_items (section, item_id, source, created_at) VALUES (?, ?, ?, ?)', [sec, id, source, at]);
  },
  remove(sec, id) {
    need();
    if (C.items.delete(k2(sec, id))) q('DELETE FROM cms_items WHERE section = ? AND item_id = ?', [sec, id]);
    try { fs.unlinkSync(itemFile(sec, id)); } catch (e) { /* already gone */ }
  }
};
// deleted items: their data file may still be in git (data/<sec>/<id>.js); the website and the panel leave them out
const hidden = {
  has(sec, id) { return C.hidden.has(k2(sec, id)); },
  add(sec, id) { need(); if (C.hidden.has(k2(sec, id))) return; C.hidden.add(k2(sec, id)); q('REPLACE INTO cms_hidden (section, item_id, hidden_at) VALUES (?, ?, ?)', [sec, id, now()]); },
  remove(sec, id) { need(); if (C.hidden.delete(k2(sec, id))) q('DELETE FROM cms_hidden WHERE section = ? AND item_id = ?', [sec, id]); }
};
// the data files of a section the website shows: every data/<dir>/*.js, less the deleted ones. Every place that lists
// the tours, categories, pages or posts uses this (not fs.readdirSync), so a deleted item is gone everywhere.
function files(dir) {
  const full = path.join(DATA, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith('.js') && !C.hidden.has(k2(dir, f.slice(0, -3))));
}

// ---------- Deleted items ----------
const trash = {
  list(sec) { need(); return [...C.trash.values()].filter(t => t.sec === sec).map(t => ({ bin: t.bin, id: t.id, name: t.name, at: t.at, data: t.data ? P(t.data) : null })); },
  get(sec, bin) { need(); const t = C.trash.get(k2(sec, bin)); return t ? { bin: t.bin, id: t.id, name: t.name, source: t.source, data: t.data ? P(t.data) : null } : null; },
  add(sec, bin, id, name, source, data) {
    need(); const at = now(), d = data == null ? null : J(data);
    C.trash.set(k2(sec, bin), { sec, bin, id, name, source, data: d, at });
    q('REPLACE INTO cms_trash (section, bin, item_id, name, source, data, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [sec, bin, id, name || null, source, d, at]);
  },
  remove(sec, bin) { need(); if (C.trash.delete(k2(sec, bin))) q('DELETE FROM cms_trash WHERE section = ? AND bin = ?', [sec, bin]); }
};

// ---------- price log (newest first, the latest 2000) ----------
const priceLog = {
  all() { need(); return C.priceLog.map(x => P(x.data)); },
  add(entry) {
    need(); const data = J(entry);
    C.priceLog.unshift({ data }); C.priceLog = C.priceLog.slice(0, 2000);
    q('INSERT INTO price_log (at, tour_id, tour_name, by_name, data) VALUES (?, ?, ?, ?, ?)', [new Date(entry.at || Date.now()), entry.id || null, entry.name || null, entry.by || null, data]);
    q('DELETE FROM price_log WHERE id NOT IN (SELECT id FROM (SELECT id FROM price_log ORDER BY id DESC LIMIT 2000) keep)');
  }
};
const tourCodes = () => (ready ? C.tourCodes : {});

// ---------- lists kept in order: users, enquiries ----------
// rows are kept by their place in the list (pos); a save writes only the rows that changed
const LIST_COLS = {
  users: { cols: ['id', 'email', 'name', 'role'], vals: u => [u.id || null, u.email || null, u.name || null, u.role || null] },
  enquiries: { cols: ['received_at', 'name', 'email', 'status'], vals: e => [e.receivedAt || null, String(e.name || '').slice(0, 191) || null, String(e.email || '').slice(0, 191) || null, e._status || (e._read ? 'Replied' : 'New')] }
};
const list = name => ({
  all() { need(); return C.lists[name].map(P); },
  write(next) {
    need(); const old = C.lists[name], rows = next.map(J), spec = LIST_COLS[name];
    C.lists[name] = rows;
    const changed = rows.map((r, i) => [i, r]).filter(([i, r]) => old[i] !== r);
    if (!changed.length && rows.length >= old.length) return;
    tx(async c => {
      for (const [i, r] of changed) {
        await c.query('REPLACE INTO ' + name + ' (pos, ' + spec.cols.join(', ') + ', data) VALUES (?, ' + spec.cols.map(() => '?').join(', ') + ', ?)', [i, ...spec.vals(next[i]), r]);
      }
      if (rows.length < old.length) await c.query('DELETE FROM ' + name + ' WHERE pos >= ?', [rows.length]);
    });
  },
  append(item) { need(); const l = C.lists[name].map(P); l.push(item); this.write(l); }
});

// ---------- activity log (newest last, the latest 2000) ----------
const activity = {
  all() { need(); return C.activity.map(a => Object.assign({}, a)); },
  add(a) {
    need(); C.activity.push(a); if (C.activity.length > 2000) C.activity = C.activity.slice(-2000);
    q('INSERT INTO activity_log (at, by_name, by_id, action, what, link) VALUES (?, ?, ?, ?, ?, ?)', [new Date(a.at), a.by || null, a.byId || null, a.action || null, a.what || null, a.link || null]);
    if (Math.random() < 0.05) q('DELETE FROM activity_log WHERE id NOT IN (SELECT id FROM (SELECT id FROM activity_log ORDER BY id DESC LIMIT 2000) keep)');
  }
};

// ---------- settings ----------
const setting = {
  get(name) { need(); const x = C.settings.get(name); return x === undefined ? null : P(x); },
  set(name, v) { need(); const data = J(v); C.settings.set(name, data); q('REPLACE INTO settings (name, data, updated_at) VALUES (?, ?, ?)', [name, data, now()]); }
};

// ---------- uploaded photos (bytes in MySQL; only their names, types and dates are kept in memory) ----------
const MIME = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml' };
const uploads = {
  list() { need(); return [...C.uploads.values()].map(u => ({ name: u.name, size: u.size, mtime: u.at.getTime() })); },
  has(name) { return C.uploads.has(name); },
  add(name, buf) {
    need(); const at = now(), mime = MIME[(name.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
    C.uploads.set(name, { name, mime, size: buf.length, at });
    q('REPLACE INTO uploads (name, mime, size, data, created_at) VALUES (?, ?, ?, ?, ?)', [name, mime, buf.length, buf, at]);
  },
  remove(name) { need(); if (C.uploads.delete(name)) q('DELETE FROM uploads WHERE name = ?', [name]); },
  // the image itself, for /uploads/<name>
  async read(name) {
    const u = C.uploads.get(name); if (!u) return null;
    await chain;   // a photo just uploaded is written first
    const [rows] = await pool.query('SELECT data FROM uploads WHERE name = ?', [name]);
    return rows.length ? { mime: u.mime, data: rows[0].data, at: u.at } : null;
  }
};

// ---------- start-up ----------
function config() {
  if (process.env.DATABASE_URL) return { uri: process.env.DATABASE_URL };
  if (!process.env.DB_NAME) return null;
  return { host: process.env.DB_HOST || 'localhost', port: +(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME };
}
// (13 Nov 2026) the database itself is made on the first start when it is not there yet (utf8mb4, so every language and
// emoji is kept). A MySQL user that may not make databases (common on shared hosting) gets a clear message instead:
// make the database in the hosting panel, then start again.
async function ensureDatabase(mysql, cfg) {
  let name, conn;
  try {
    if (cfg.uri) {
      const u = new URL(cfg.uri); name = decodeURIComponent(u.pathname.replace(/^\//, '')); if (!name) return;
      u.pathname = '/'; conn = await mysql.createConnection({ uri: u.toString() });
    } else {
      name = cfg.database; const c = Object.assign({}, cfg); delete c.database;
      conn = await mysql.createConnection(c);
    }
    await conn.query('CREATE DATABASE IF NOT EXISTS ' + mysql.escapeId(name) + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    // photos up to 64 MB (MariaDB starts at 1 MB); asked before the site's own connections open, so they get it.
    // Without the right to change it the setting stays as it is (see the warning after start-up)
    const [[pk]] = await conn.query('SELECT @@global.max_allowed_packet AS n');
    if (+pk.n < 64 * 1024 * 1024) await conn.query('SET GLOBAL max_allowed_packet = 67108864').catch(() => {});
  } catch (e) {
    if (/access denied|denied to user/i.test(e.message || '')) console.warn('[db] Could not make the database "' + name + '" (' + e.message + '). Make it in the hosting panel (e.g. cPanel → MySQL Databases), then start again.');
    else throw e;
  } finally { if (conn) await conn.end().catch(() => {}); }
}
async function connect() {
  if (pool) return pool;
  const mysql = require('mysql2/promise');
  const cfg = config();
  if (!cfg) throw new Error('No database set. Put DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME (or DATABASE_URL) in .env — see ADMIN.md.');
  const opts = Object.assign({ waitForConnections: true, connectionLimit: 5, timezone: 'Z', charset: 'utf8mb4', supportBigNumbers: true }, cfg.uri ? {} : cfg);
  await ensureDatabase(mysql, cfg);
  pool = cfg.uri ? mysql.createPool(Object.assign({ uri: cfg.uri }, opts)) : mysql.createPool(opts);
  for (const s of SCHEMA) await pool.query(s);
  const [[pk]] = await pool.query('SELECT @@max_allowed_packet AS n');
  if (+pk.n < 16 * 1024 * 1024) console.warn('[db] MySQL max_allowed_packet is ' + Math.round(pk.n / 1048576) + ' MB: photos larger than that cannot be uploaded. Set it to 16M or more (64M is common).');
  return pool;
}
async function load() {
  const all = async sql => (await pool.query(sql))[0];
  C.edits = new Map((await all('SELECT path, data, updated_at FROM cms_edits')).map(r => [r.path, { data: r.data, at: r.updated_at }]));
  C.drafts = new Map((await all('SELECT section, item_id, data, updated_at FROM cms_drafts')).map(r => [k2(r.section, r.item_id), { data: r.data, at: r.updated_at }]));
  C.revs = new Map();
  for (const r of await all('SELECT section, item_id, rev, data FROM cms_revisions')) { const key = k2(r.section, r.item_id); if (!C.revs.has(key)) C.revs.set(key, new Map()); C.revs.get(key).set(r.rev, r.data); }
  C.items = new Map((await all('SELECT section, item_id, source, created_at FROM cms_items')).map(r => [k2(r.section, r.item_id), { sec: r.section, id: r.item_id, source: r.source, at: r.created_at }]));
  C.hidden = new Set((await all('SELECT section, item_id FROM cms_hidden')).map(r => k2(r.section, r.item_id)));
  C.trash = new Map((await all('SELECT section, bin, item_id, name, source, data, deleted_at FROM cms_trash')).map(r => [k2(r.section, r.bin), { sec: r.section, bin: r.bin, id: r.item_id, name: r.name, source: r.source, data: r.data, at: r.deleted_at }]));
  C.priceLog = (await all('SELECT data FROM price_log ORDER BY id DESC LIMIT 2000')).map(r => ({ data: r.data }));
  C.tourCodes = Object.fromEntries((await all('SELECT url, code FROM tour_codes')).map(r => [r.url, r.code]));
  C.lists.users = (await all('SELECT data FROM users ORDER BY pos')).map(r => r.data);
  C.lists.enquiries = (await all('SELECT data FROM enquiries ORDER BY pos')).map(r => r.data);
  C.activity = (await all('SELECT * FROM (SELECT * FROM activity_log ORDER BY id DESC LIMIT 2000) a ORDER BY id')).map(r => ({ at: new Date(r.at).toISOString(), by: r.by_name || '', byId: r.by_id || '', action: r.action || '', what: r.what || '', link: r.link || '' }));
  C.uploads = new Map((await all('SELECT name, mime, size, created_at FROM uploads')).map(r => [r.name, { name: r.name, mime: r.mime, size: r.size, at: r.created_at }]));
  C.settings = new Map((await all('SELECT name, data FROM settings')).map(r => [r.name, r.data]));
}
// the items added in the panel get their data file back on disk (a fresh server, or after a deploy)
function writeItemFiles() {
  for (const it of C.items.values()) {
    const f = itemFile(it.sec, it.id);
    let cur = null; try { cur = fs.readFileSync(f, 'utf8'); } catch (e) { /* missing */ }
    if (cur !== it.source) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, it.source); }
  }
}
// connect, create the tables, bring in the old files the first time (see scripts/db-import.js), load everything
async function init() {
  if (ready) return;
  await connect();
  if (!(await pool.query("SELECT name FROM settings WHERE name = 'imported'"))[0].length) {
    const snap = require('./snapshot');
    if (snap.hasSnapshot()) {
      // (13 Nov 2026) a new database: the panel's content from git (database/meruka-content.json)
      console.log('[db] first start: filling the new database from database/meruka-content.json…');
      const n = await snap.importSnapshot(pool);
      await pool.query('REPLACE INTO settings (name, data, updated_at) VALUES (?, ?, ?)', ['imported', JSON.stringify({ at: new Date().toISOString(), from: 'database/meruka-content.json', counts: n }), new Date()]);
      console.log('[db] filled: ' + Object.entries(n).map(([k, v]) => v + ' ' + k).join(', '));
    } else {
      const { importFiles } = require('./import');
      console.log('[db] first start with MySQL: bringing in the data saved in files (data/cms, users, enquiries, photos)…');
      const n = await importFiles(pool);
      console.log('[db] imported: ' + Object.entries(n).map(([k, v]) => v + ' ' + k).join(', '));
    }
  }
  await load();
  ready = true;
  // the computer that keeps the content file: bring it up to date at once
  if (snapshotOn()) require('./snapshot').exportSnapshot(pool).then(changed => { if (changed) console.log('[db] database/meruka-content.json updated — commit and push it with the code'); }).catch(e => console.error('[db] could not write database/meruka-content.json:', e.message));
  writeItemFiles();
  console.log('[db] MySQL ready: ' + C.edits.size + ' saved edits, ' + C.items.size + ' added items, ' + C.lists.enquiries.length + ' enquiries, ' + C.uploads.size + ' photos');
}
async function close() { clearTimeout(snapTimer); await chain.catch(() => {}); if (pool) await pool.end(); pool = null; ready = false; }

module.exports = { init, flush, close, connect, doc, revs, items, hidden, files, trash, priceLog, tourCodes, users: list('users'), enquiries: list('enquiries'),
  activity, setting, uploads, isReady: () => ready, SECTIONS, DATA, CMS, ROOT, SCHEMA };
