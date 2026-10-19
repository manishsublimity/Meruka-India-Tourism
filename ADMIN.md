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

## Where the edits are kept — back these up

- `data/cms/` — every edit (one JSON file per page or setting), new items' content and the deleted-items bin
- `data/tours/`, `data/tour-lists/`, `data/articles/` — a new item also adds a small file here
- `public/uploads/` — uploaded photos
- `data/enquiries.json` — the enquiries

The imported content in `data/` is never changed by the panel; "Undo all my edits" on a page simply removes its file in
`data/cms/`. When new code is deployed with `git pull`, keep these folders (or commit them from the server first) so
edits made on the live site are not lost.

## How it works (for developers)

- `lib/cms/hook.js` — when a data module loads, `data/cms/<same path>.json` is laid over it.
- `lib/cms/store.js` — the editable fields of each section; list / get / save / create / delete / restore.
- `lib/cms/admin.js` — the `/admin` pages and JSON API; `lib/cms/auth.js` — login, signed session cookie.
- `server.js` — `buildSite()` builds the public pages from the data; it runs again after every save.
- `public/admin-assets/editor.js` — one editor for every section: it builds the form from the data's own shape.
