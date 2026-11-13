// Fill this server's database with the panel's content from git (database/meruka-content.json).
// A new, empty database is filled by itself on the first start; this is for a database that already has content and
// should be replaced by the content in git. The panel's users, the enquiries and the activity log are kept.
//   npm run db:seed -- --yes
const db = require('../lib/db');
const { importSnapshot, hasSnapshot, FILE } = require('../lib/db/snapshot');

(async () => {
  if (!hasSnapshot()) throw new Error('No ' + FILE + ' — pull it from git first.');
  if (!process.argv.includes('--yes')) {
    console.log('This replaces the pages, tours, drafts, history, deleted items, price log and photos in this database with the ones in\n  ' + FILE + '\nUsers, enquiries and the activity log stay. Run again with --yes to go ahead:  npm run db:seed -- --yes');
    return;
  }
  const pool = await db.connect();
  const n = await importSnapshot(pool);
  await pool.query('REPLACE INTO settings (name, data, updated_at) VALUES (?, ?, ?)', ['imported', JSON.stringify({ at: new Date().toISOString(), from: 'database/meruka-content.json', counts: n }), new Date()]);
  console.log('Filled from ' + FILE + ': ' + Object.entries(n).map(([k, v]) => v + ' ' + k).join(', ') + '\nRestart the website to show it.');
  await pool.end();
})().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
