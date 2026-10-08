// About page content — taken from https://india-tourism.net/aboutus.htm
const site = require('./site');
const { IMG } = site;

module.exports = {
  listings: require('./listings'),
  heroSrc: IMG('about-us.jpg'),
  nav: site.nav('About Us'),
  footCols: site.footCols('About Us'),

  // The nine paragraphs from the original page, word for word and in order.
  // The first one opens with the company name in bold, as on the original.
  leadName: 'Meruka India Tourism Service',
  paragraphs: [
    'is a full fledged travel company and inbound tour operators. Our reputation for excellence is earned every day by providing the ultimate in value and personal attention. Today we are one of India’s premier tour operator management companies. It all started eleven years ago, with the need to create, a travel service with a difference. A travel agency, which would provide complete travel solutions to its clients, providing luxury and budget tours whilst still being competitively priced.',
    'It all started with a small step by Mr. Ashok Pareek who had been into advertising industry for many years, with a vision of creativity, deadlines, innovative ideas, strategy and a foresight to provide flawless services and promoting tourism in India. Penning down the credentials of, our agency is like turning the arch-lights on yourself and there lies the challenges of presenting a case without an iota of self praise.',
    'We have striven to make travel simple, worry-free with pleasure for our corporate and leisure customers alike. Your complete satisfaction is only the first of our goals - we want your travel experience to be memorable in positive ways, and to expand and enrich your life as nothing else can.',
    'We pledge our full resources to the successful completion of every trip we help plan, regardless of its distance or duration.',
    'Our team spirit occupies a high seat and young talent gets the highest marks. Managed by a young and professional staff, our mission statement is "providing uncompromising services".',
    "India, with it's mystifying legacy of thousands of years and millions of men, breathtaking natural beauty and exotic locales, has always attracted and welcomed visitors to its shores. We relive this tradition of 'Atithi Devo Bhava' (Guest is God) welcoming tourists from across the world. That is why, our guests from across the world have reposed their faith and confidence in us, making it the most reliable, cost-effective & safe to travel.",
    'We provide complete services to the tourist and business traveller right from the arrival into India, till their departure from the country. Utmost care and attention is given for selecting appropriate hotels and specific services requested for. Through our nation wide network of agents in India and Nepal, efforts are made to ensure that any trip with us, to this part of world becomes a memorable one.',
    'We invite you to explore India with us. We believe service begins with simple relationships: agent and traveller, agency and client. We welcome you to discover our world.',
    'Please let us know your feedback about tour plan and rest assured we will make a memorable tour for you.'
  ],

  // Short phrases lifted verbatim from the paragraphs above, used as highlights.
  mission: 'providing uncompromising services',
  founder: 'Mr. Ashok Pareek',
  atithi: { phrase: 'Atithi Devo Bhava', meaning: 'Guest is God' }

};
