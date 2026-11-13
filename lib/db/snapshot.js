// (13 Nov 2026) The panel's content as one file in git: database/meruka-content.json.
//
// - A new server fills its empty database from this file on its first start (database and tables are made by
//   themselves), so the website shows the same pages, tours, photos and history as the computer it came from.
// - The computer where the content is written keeps the file up to date by itself after every save
//   (DB_SNAPSHOT=on in its .env); commit and push it with the code.
// - A live server never writes it (no DB_SNAPSHOT there), so "git pull" never meets a changed file.
//
// Left out on purpose: enquiries (the guests' names, emails and phones), the panel's users (their passwords) and the
// activity log — personal data stays in each server's own database and never goes into git.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'database', 'meruka-content.json');
// table → the columns that make a row unique (for the import's order), in the order they are filled
const TABLES = ['settings', 'tour_codes', 'cms_edits', 'cms_items', 'cms_hidden', 'cms_drafts', 'cms_revisions', 'cms_trash', 'price_log', 'uploads'];
const ORDER = { settings: 'name', tour_codes: 'url', cms_edits: 'path', cms_items: 'section, item_id', cms_hidden: 'section, item_id', cms_drafts: 'section, item_id',
  cms_revisions: 'id', cms_trash: 'section, bin', price_log: 'id', uploads: 'name' };
// the marker "this database has been filled once" is not content
const SKIP_SETTING = ['imported'];

// a row to JSON and back: dates as {$date}, photos (binary) as {$b64}
const out = v => v instanceof Date ? { $date: v.toISOString() } : Buffer.isBuffer(v) ? { $b64: v.toString('base64') } : v;
const back = v => v && typeof v === 'object' ? ('$date' in v ? new Date(v.$date) : '$b64' in v ? Buffer.from(v.$b64, 'base64') : v) : v;

async function exportSnapshot(pool) {
  const tables = {};
  for (const t of TABLES) {
    const [rows] = await pool.query('SELECT * FROM ' + t + ' ORDER BY ' + ORDER[t]);
    tables[t] = rows.filter(r => !(t === 'settings' && SKIP_SETTING.includes(r.name))).map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, out(v)])));
  }
  const snap = { about: 'Meruka India Tourism — the admin panel content. Written by itself; do not edit by hand. See DEPLOY.md.', version: 1, tables };
  const text = JSON.stringify(snap, null, 1) + '\n';
  let cur = ''; try { cur = fs.readFileSync(FILE, 'utf8'); } catch (e) { /* none yet */ }
  if (cur === text) return false;
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE + '.tmp', text); fs.renameSync(FILE + '.tmp', FILE);   // never a half-written file
  return true;
}

const hasSnapshot = () => fs.existsSync(FILE);
// fill the database from the file: every content table is emptied and filled again, all at once (or not at all)
async function importSnapshot(pool) {
  const snap = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const counts = {}, skipped = [];
  // a big photo needs MySQL to take big packets (MariaDB's default is 1 MB; lib/db asks for 64 MB when it starts). A
  // row bigger than this MySQL takes is left out (and named) before it is sent — MySQL would drop the connection
  const c = await pool.getConnection();
  const [[pk]] = await c.query('SELECT @@max_allowed_packet AS n');
  const room = +pk.n - 64 * 1024;
  const sizeOf = vals => vals.reduce((s, v) => s + (Buffer.isBuffer(v) ? v.length * 2 : Buffer.byteLength(String(v == null ? '' : v)) * 2), 1024);
  try {
    await c.beginTransaction();
    for (const t of TABLES) {
      const rows = (snap.tables && snap.tables[t]) || [];
      await c.query('DELETE FROM ' + t + (t === 'settings' ? " WHERE name NOT IN ('imported')" : ''));
      let n = 0;
      for (const r of rows) {
        const cols = Object.keys(r), vals = cols.map(x => back(r[x]));
        if (sizeOf(vals) > room) { skipped.push(t + ': ' + (r.name || r.path || r.item_id || r.id)); continue; }
        await c.query('INSERT INTO ' + t + ' (' + cols.map(x => '`' + x + '`').join(', ') + ') VALUES (' + cols.map(() => '?').join(', ') + ')', vals); n++;
      }
      counts[t] = n;
    }
    await c.commit();
  } catch (e) { await c.rollback().catch(() => {}); throw e; } finally { c.release(); }
  if (skipped.length) console.warn('[db] too big for this MySQL (max_allowed_packet), left out: ' + skipped.join(', ') + '. Set max_allowed_packet=64M in my.cnf / my.ini, restart MySQL, then run: npm run db:seed -- --yes');
  return counts;
}

module.exports = { FILE, TABLES, exportSnapshot, importSnapshot, hasSnapshot };
