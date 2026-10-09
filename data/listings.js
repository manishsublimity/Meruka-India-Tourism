// Lists shared by the inner pages (About, tour pages) — same on every page of india-tourism.net
const { link } = require('./site');


module.exports = {
  regions: [
    ['North India', '/photos/north-india.webp', 'north_india_tour.html'],
    ['South India', '/photos/kerala-houseboat.webp', 'south_india_tours_tourism.html'],
    ['East India', '/photos/darjeeling.jpg', 'east_india_tour_tourism.html'],
    ['West India', '/photos/jaisalmer-dunes.webp', 'west_india_tour_tourism.html']
  ].map(([name, img, href]) => ({ name, img, href: link(href) }))
};
