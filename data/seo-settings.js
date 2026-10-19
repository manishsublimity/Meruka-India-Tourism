// Site-wide Google settings (16 Oct 2026), edited in the admin panel under "Google & SEO".
// Empty values mean "not set": the site then uses its built-in titles and descriptions.
module.exports = {
  // Google Search Console → Settings → Ownership verification → HTML tag: the code inside content="…"
  googleVerification: '',
  // Bing Webmaster Tools (optional): the code inside content="…"
  bingVerification: '',
  // Google Analytics 4: the Measurement ID, e.g. G-XXXXXXXXXX
  googleAnalytics: '',
  // the picture shown when a page without its own photo is shared on WhatsApp, Facebook…
  defaultShareImage: '/photos/taj-mahal-feature.webp',
  // Google title and description of the fixed pages (the other pages have their own in their editor)
  pages: {
    '/': { title: '', description: '' },
    '/aboutus': { title: '', description: '' },
    '/contactus': { title: '', description: '' },
    '/testimonials': { title: '', description: '' },
    '/plan-my-trip': { title: '', description: '' }
  },
  // old address → new address (permanent 301 redirect), e.g. after a page is renamed or deleted
  redirects: []
};
