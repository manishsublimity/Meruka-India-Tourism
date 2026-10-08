// Copy the hand-picked photos from the design folder into public/photos with web-safe names.
// .jfif files are JPEGs, so they are saved as .jpg. Run: node scripts/copy-photos.js
const fs = require('fs');
const path = require('path');

const SRC = 'E:/Desing projects/india-tourism/Images';
const OUT = path.join(__dirname, '..', 'public', 'photos');

const PICK = {
  'jaipur-amber-fort.jpg': 'JAIPUR AMBER FORT A.jpg',
  'jaipur-hawa-mahal.webp': 'JAIPUR HAWAMAHAL.webp',
  'jaipur-city-palace.jpg': 'JAIPUR CITY PALACE.jfif',
  'jaisalmer-dunes.webp': 'Jaisamer Sand dunes.webp',
  'jaisalmer-dunes-wide.jpg': 'A home page Jaisalmer Sand Dunes best pic.jpg',
  'thar-desert.jpg': 'Thar Desert.jpg',
  'jaisalmer-fort-night.jpg': 'Tour Pacakge Rajasthan Jaisalmer Fort Night pic.jpg',
  'jodhpur-umaid-bhawan.jpg': 'Jodhpur Ummed Bhawan Palace pic.jpeg',
  'jodhpur-jaswant-thada.jpg': 'Jodhpur Jaswant Thada Mahrangarh Fort.jpg',
  'udaipur-lake-pichola.jpg': 'UDAIPUR LAKE PICHOLA NIGHT VIEW.jpg',
  'bikaner-junagarh-fort.jpg': 'Tour Pacage Rajasthan Bikaner Junagarh Fort Pic.jpg',
  'rajasthan-forts.jpg': 'fort-palaces-of-mughals-rajputs_iN7jm.jpeg',
  'taj-mahal-wide.jpg': 'Taj Mahal Horizental.jpg',
  'taj-mahal-feature.webp': 'Taj-Mahal-feature.webp',
  'delhi-red-fort.jpg': 'Delhi Red fort.jpg',
  'kerala-houseboat.webp': 'Kerala houseboat premium.webp',
  'kerala-backwaters.jpg': 'A Home Page Kerala.jpg',
  'madurai.webp': 'Madurai.jpg.webp',
  'south-india.jpg': 'South India1.jpg',
  'south-india-b.jpg': 'B South India.jpg',
  'mysore-palace.jpg': 'Karnataka- palace.jpg',
  'goa-beach.jpg': 'Tour Pacakges for beach destintaions. Goa.jpg',
  'west-india-beach.jpg': 'Tour Packages for west India beaches.jpg',
  'gujarat.jpg': 'Tour Package gujrat-tours.jpg',
  'ladakh-nubra.avif': 'Leh Khardung-La-Nubra-Valley- Horizental.avif',
  'ladakh-shanti-stupa.webp': 'Ladakh Shanti Sputa.webp',
  'ladakh.jpg': 'A home page Ladakh.jpg',
  'manali-balloon.jpg': 'MANALI baloon.jpg',
  'hill-station.jpg': 'hill-station.jpg',
  'darjeeling.jpg': 'Sikkim - Darjeeling Scenary.jpg',
  'nagaland-festival.webp': 'Nagaland-Fest.webp',
  'east-india.avif': 'B East India.avif',
  'varanasi-ghats.jpg': 'UP Varanasi Ghat Prayers.jpg',
  'tiger.jpg': 'Tigers best pic.jpg',
  'bengal-tiger.jpg': 'Royal-Bengal-Tiger.jpg',
  'diwali.jpg': 'diwali-indian-festivals-karma-group-blog.jpg',
  'pushkar-fair.jpg': 'pushkar-camel-fair-indian-festivals-karma-group-blog.jpg',
  'onam.jpg': 'onam-kerala-indian-festivals-karma-group-blog.jpg',
  'north-india.jpg': 'North India.jpg',
  'north-india-b.webp': 'B North India.webp',
  'west-india.jpg': 'B westindia-state.jpg',
  'maharashtra.jpg': 'mahatours.jpg',
  'yoga-ayurveda.jpg': 'yoga-auyrveda.jpg',
  'buddhism.jpg': 'buddism.jpg',
  'india-main.jpg': 'A a Home Page Main Pic.jpg',
  'travel-guide.webp': 'Travel Guide B.webp'
};

fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [to, from] of Object.entries(PICK)) {
  const src = path.join(SRC, from);
  if (!fs.existsSync(src)) { console.log('missing:', from); continue; }
  fs.copyFileSync(src, path.join(OUT, to));
  n++;
}
console.log('copied', n, 'photos to public/photos');
