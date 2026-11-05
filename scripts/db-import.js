// Bring the admin panel's old files (data/cms, users, enquiries, activity, uploaded photos) into MySQL.
//   npm run db:import              adds what is not in the database yet
//   npm run db:import -- --force   empties the CMS tables first, then imports the files again
// The site does this by itself the first time it starts with an empty database. See lib/db/import.js.
const db = require('../lib/db');
const { importFiles } = require('../lib/db/import');

(async () => {
  const force = process.argv.includes('--force');
  const pool = await db.connect();
  const n = await importFiles(pool, { force });
  console.log((force ? 'Re-imported' : 'Imported') + ': ' + Object.entries(n).map(([k, v]) => v + ' ' + k).join(', '));
  await pool.end();
})().catch(e => { console.error('Import failed:', e.message); process.exit(1); });
