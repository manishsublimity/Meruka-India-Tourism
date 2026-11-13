// Write the panel's content from this computer's database into database/meruka-content.json (then commit and push it).
//   npm run db:export
// With DB_SNAPSHOT=on in .env the site does this by itself after every save. See lib/db/snapshot.js and DEPLOY.md.
const db = require('../lib/db');
const { exportSnapshot, FILE } = require('../lib/db/snapshot');

(async () => {
  const pool = await db.connect();
  const changed = await exportSnapshot(pool);
  console.log(changed ? 'Written: ' + FILE : 'Already up to date: ' + FILE);
  await pool.end();
})().catch(e => { console.error('Export failed:', e.message); process.exit(1); });
