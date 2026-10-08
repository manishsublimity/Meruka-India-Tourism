# Meruka India Tourism

Website of Meruka India Tourism Service — Node.js (Express + EJS).

## Run

```
npm install
npm start
```

The site runs at http://localhost:3000 (`npm run dev` restarts on changes to `server.js`).

## Layout

- `server.js` — routes. `/` is the home page (`views/home-4.ejs`); `/home-4` is the same page kept as a design copy (not indexed). Every imported page from india-tourism.net is served at its original file name without the extension.
- `views/` — EJS pages and `partials/` (header, footer, inner-page skyline hero, …).
- `data/` — page content: `articles/` (text pages), `tours/` (itineraries), `tour-lists/` (tour categories), plus the home, about, contact and SEO data.
- `public/` — `css/` (`site.css` base, `home-4.css` home design, `inner-4.css` inner pages), `js/`, `photos/`, `images/`, `assets/`.
- `scripts/` — importers for new pages from india-tourism.net (`node scripts/import-article.js …`, `import-list.js`, `import-tour.js`).

Enquiries sent from the contact form are saved to `data/enquiries.json` (not committed).
