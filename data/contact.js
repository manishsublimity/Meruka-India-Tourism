// Contact page content — taken from "Meruka India Contact.dc.html"
const site = require('./site');
const { IMG, li } = site;

module.exports = {
  heroSrc: '/photos/handshake.jpg',   // the original contact-us.jpg is a wide banner that crops badly in the hero frame

  nav: site.nav('Contact Us'),

  infoList: ['Travel period month/year', 'No. of days for your tour', 'Total number of people travelling', 'Area of interest in India', 'Preference of hotels, or per day per person budget', 'Preference of destinations you wish to cover'],

  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  interests: ['Ayurveda', 'Yoga', 'Pilgrimage', 'Wildlife', 'Buddha', 'Beaches', 'Hill Stations', 'Adventure'],
  tourNames: ['Golden Triangle Tours', 'Rajasthan North India', 'South North India', 'Kerala Backwaters', 'Karnataka Tours', 'Tamilnadu Tours', 'South India Tours', 'Exotic Rajasthan', 'Incredible India'],

  offices: [
    { city: 'Jaipur', kind: 'Head office', name: 'Meruka India Tourism Service', sub: '( A division of india-tourism )', area: 'Subhash Nagar, Vasudev Marg', lines: ['A-30, Shopping Centre, Subhash Nagar,', 'Vasudev Marg,', 'Jaipur - 302016 (Rajasthan) India.'], phones: ['+91 99203 63777', '+91 73404 55966'], email: 'ask@india-tourism.net' },
    { city: 'Delhi', kind: 'Branch office', name: 'Delhi branch office', sub: '', area: 'Palika Place, Panchkuia Road', lines: ['UG-55, Palika Place,', 'Panchkuia Road,', 'New Delhi 110 001. India.'], phones: [], email: 'sales@india-tourism.net' },
    { city: 'Mumbai', kind: 'Branch office', name: 'Mumbai branch office', sub: '', area: 'Evershine Cosmic, Andheri (West)', lines: ['A-404, Evershine Cosmic,', 'Oshiwara Road, Opp: Infinity Mall,', 'New Link Road, Andheri (West),', 'Mumbai - 400 053. (India)'], phones: [], email: 'tour@india-tourism.net' },
    { city: 'Goa', kind: 'Branch office', name: 'Goa branch office', sub: '', area: 'Souza Enclave, Margao', lines: ['S-10, Souza Enclave,', 'Nr. KTC Bus Stand Margao,', 'Madel, Margao, Goa 403601.'], phones: ['0982192990'], email: 'info@india-tourism.net' },
    { city: 'Bangalore', kind: 'Branch office', name: 'Bangalore branch office', sub: '', area: 'Deepam Building, Domur Layout', lines: ['392, Deepam Building,', '2nd Main Road,', 'Domur Layout,', 'Bangalore - 560071'], phones: [], email: 'enquiry@india-tourism.net' },
    { city: 'Kerala', kind: 'Branch office', name: 'Kerala branch office', sub: '', area: 'Aluva, Cochin', lines: ['Connayil, Opp. Muttom Thaikavu,', 'Near North Kalamassery, NH 47,', 'Aluva, Cochin-683106. India.'], phones: [], email: 'ask@india-tourism.net' }
  ],

  guide: [
    { title: 'India Tourism Guide', img: IMG('travelguide.jpg'), items: li([['Geography', 'geography.htm'], ['History', 'history.htm'], ['Weather', 'weather.htm'], ['Communication', 'communication.htm'], ['Fairs And Festivals', 'Fairs-Festivals.htm'], ['Shopping', 'shopping.htm'], ['Music And Dance', 'music-dance.htm'], ['Traditions And Customs', 'traditions_and_customs.htm'], ['Art', 'art.htm'], ['Cuisine', 'cuisine.htm']]) },
    { title: 'India Attractions', img: IMG('india-attraction.jpg'), items: li([['Ayurveda Tourism', 'ayurveda.htm'], ['Yoga Tourism', 'yoga.htm'], ['Pilgrimage Tourism', 'pilgrimage.htm'], ['Wildlife Tourism', 'wildlife.htm'], ['Buddha Tourism', 'buddha.htm'], ['Beaches Tourism', 'beaches.htm'], ['Hill Stations Tourism', 'Hillstations.htm'], ['Adventure Tourism', 'Adventures.htm']]) },
    { title: 'Travel Tools', img: IMG('travel-tool.jpg'), items: li([['Phone Codes', 'phone_codes.htm'], ['Maps', 'maps.htm'], ['Indian Embassies', 'indian_embassies.htm'], ['Visa Information', 'visa_information.htm'], ["Traveler's Guide", 'travelers_guide.htm'], ['Other Guidelines', 'travelers-guidlines-information.htm']]) }
  ],

  footCols: site.footCols('Contact Us')
};
