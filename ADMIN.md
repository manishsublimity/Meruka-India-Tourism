# Admin panel (CMS)

The website has its own admin panel at **/admin**. Everything edited there shows on the website as soon as it is
saved — no restart, no deploy.

## Set up (once, on the server)

1. Copy `.env.example` to `.env` and fill in:
   - `ADMIN_USER` — the login name
   - `ADMIN_PASSWORD` — a long password
   - `SESSION_SECRET` — long random text (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
2. Start the site as usual (`npm start`, or with PM2: `pm2 start server.js --name meruka`).
3. Serve it over **HTTPS** (the login cookie is marked Secure on HTTPS).

Without `ADMIN_PASSWORD` the panel stays closed. Five wrong passwords from one address lock the login for 15 minutes.

## What can be edited

| Section | What |
|---|---|
| Tours | Heading, photo, route, duration, every day (title, distance, text, note), price tiers, includes / excludes / notes, banner, breadcrumb, Google title & description. Add (blank or as a copy), delete. |
| Tour categories | Heading, description, the tours in each group and their order (the first tour of the main categories is the one shown in "Most Popular Tours"), banner, Google text. Add, delete. |
| Pages & guides | The 117 text pages (destinations, travel guide…) in a simple word processor, with photos and links. Add, delete. |
| Home page & footer | How it works, FAQs, travel guide links, destinations by state, footer link columns, "Popular searches". |
| Social media links | Facebook / Instagram / YouTube / X addresses (an icon shows in the footer once filled in). |
| Guest reviews | Heading, introduction, every review, closing line. |
| About us · Contact & offices | Their texts; offices with address, phones, email (the first office's phone is also the WhatsApp and footer number). |
| Google settings | Search Console, Analytics, share picture, main pages' Google text, redirects (see below). |
| Dashboard | Charts: enquiries over time (last 7 / 30 / 90 days, 12 months, all time) with the change on the period before, which form and country they come from, trip length and hotels asked for; tours by region, length and starting price; Google readiness by section; recently changed pages. Every chart shows its numbers on hover and as a table. |
| Photos | Upload (WebP / JPG / PNG / GIF / AVIF, up to 10 MB), browse, copy an address, delete uploaded photos. |
| Enquiries | Everything sent from the website's forms; mark read / new, delete, download as CSV for Excel. |
| Deleted items | Deleted tours / categories / pages can be put back. |

Fixed design text (for example the home page's headings and the layout itself) is part of the templates in `views/`
and is changed in code, not in the panel.

## Google (SEO)

- **Google tab on every tour, category and page:** a live preview of how the page shows in Google, character
  counters for the Google title (best 30–60) and description (best 120–160), a checklist, a focus phrase for tips,
  "Hide this page from Google" (adds `noindex` and leaves the page out of the sitemap) and a picture for sharing.
- **Google & SEO check** (`/admin/seo`): every page with its Google title and description, marked good / could be
  better / needs attention, with what to improve and an "Improve" button. Same titles on two pages are flagged.
- **Google settings:** Google Search Console verification code, Google Analytics 4 ID (G-…), Bing code, the default
  share picture, the Google title and description of the Home / About / Contact / Guest Reviews / Plan My Trip pages,
  and redirects (old address → new address, permanent 301) for renamed or deleted pages.
- Already on every page: sitemap.xml, robots.txt, canonical address, Open Graph / Twitter cards, and schema.org data
  (travel agency, tours with price, FAQs, breadcrumbs).

## Where the edits are kept: MySQL (since 5 Nov 2026)

Everything the panel saves is in a MySQL (or MariaDB) database. Set it in `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=meruka
DB_PASSWORD=…
DB_NAME=meruka_cms
```

(or one `DATABASE_URL=mysql://user:password@host:3306/meruka_cms`). **Everything else happens by itself** (since 13 Nov
2026): at start-up the site makes the database (if the MySQL user may), its tables, and fills a new, empty database
with the panel's content kept in git, `database/meruka-content.json` — the pages, tours, categories, drafts, history,
deleted items, price log and photos. Server set-up step by step: **[DEPLOY.md](DEPLOY.md)**.

- On the computer where the content is written, `DB_SNAPSHOT=on` in `.env` keeps `database/meruka-content.json` up to
  date after every save; commit and push it with the code. By hand: `npm run db:export`.
- A live server never writes that file, so `git pull` never stops on it. A database that already has content is never
  overwritten by a pull; to replace its content with the one in git: `npm run db:seed -- --yes` (users, enquiries and
  the activity log stay).
- Not in git, on purpose: enquiries (guests' personal data), the panel's users (passwords) and the activity log.
- The old files (`data/cms/`, `data/users.json`, …) are still read once by a database that has no content file to start
  from (`npm run db:import`).

| Table | What it holds |
|---|---|
| `cms_edits` | the saved edits of each page, tour, category, post and setting |
| `cms_drafts` | drafts not yet published |
| `cms_revisions` | the History tab (latest 25 versions per item) |
| `cms_items` | tours, categories, pages and posts added in the panel |
| `cms_hidden`, `cms_trash` | deleted items, and the Deleted items bin |
| `price_log`, `tour_codes` | Prices & notes → Price log; codes given in a tour's editor |
| `users`, `enquiries`, `activity_log` | panel users, website enquiries, who changed what |
| `uploads` | photos uploaded in the panel (served at `/uploads/<name>`) |
| `settings` | owner's name, panel look per role, import note |

- **Back up the database** (`mysqldump meruka_cms > backup.sql`, or your host's backup tool). That one backup holds
  every edit, enquiry and uploaded photo.
- `git pull` is now safe: deploying code does not touch the edits. An added item's small file
  (`data/tours/<id>.js`, …) is written again from `cms_items` at every start.
- MySQL's `max_allowed_packet` must be at least 16M for 10 MB photos. The site asks MySQL for 64M when it starts; when
  the MySQL user may not change it, set `max_allowed_packet=64M` in `my.cnf` / `my.ini` (the site warns at start-up).
- Run **one** copy of the site per database (`pm2 start server.js`, not cluster mode). The site keeps the data in
  memory and writes changes through to MySQL, so a second copy would not see the first one's changes until it restarts.
- The site does not start without the database. If MySQL is down, start it first.

The imported content in `data/` is never changed by the panel; "Undo all my edits" on a page simply removes its row in
`cms_edits`.

## How it works (for developers)

- `lib/db/index.js` — MySQL: the tables, the in-memory copy, the write queue; `lib/db/import.js` — the old files into MySQL.
- `lib/cms/hook.js` — when a data module loads, its saved edits (`cms_edits`, named `data/cms/<same path>.json`) are laid over it.
- `lib/cms/store.js` — the editable fields of each section; list / get / save / create / delete / restore.
- `lib/cms/admin.js` — the `/admin` pages and JSON API; `lib/cms/auth.js` — login, signed session cookie.
- `server.js` — `buildSite()` builds the public pages from the data; it runs again after every save.
- `public/admin-assets/editor.js` — one editor for every section: it builds the form from the data's own shape.
