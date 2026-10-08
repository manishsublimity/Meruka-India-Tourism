// "South and North India Religious Tour" — a tour designed by Meruka India Tourism Service for a
// US-based guest, December 2026 (source: "South and North India Religious Tour With Cost for
// Mr. Pundit 28th Sept 2026.pdf"). Wording as in the PDF; the guest's name is left out of the page.
// Served at /south_north_india_religious_tour
const site = require('../site');
const t = s => [{ text: s, bold: false }];                      // plain paragraph
const lead = (b, s) => [{ text: b, bold: true }, { text: s, bold: false }];   // bold label + text

module.exports = {
  file: 'south_north_india_religious_tour.html',
  url: '/south_north_india_religious_tour',
  title: 'South and North India Religious Tour with Cost',
  description: 'South and North India Religious Tour: Bangalore, Puttaparthi, Tirupati, Varanasi and Mumbai in 7 nights and 8 days, with hotels, domestic flights and tour cost.',
  keywords: 'south india religious tour, north india religious tour, Puttaparthi, Tirupati Balaji darshan, Varanasi Ganga Aarti, Sarnath, Kashi Vishwanath, pilgrimage tour India',
  heroSrc: '/photos/south-india-b.jpg',
  heroAlt: 'A South Indian temple at sunset',
  photo: '/photos/south-india-b.jpg',
  nav: site.nav('India Tours', false),
  footCols: site.footCols(),
  listings: require('../listings'),

  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'India Tours', href: '/itineraries' },
    { label: 'South - North India Tours', href: '/south_north_india_tours' },
    { label: 'South and North India Religious Tour' }
  ],
  heading: 'South and North India Religious Tour',
  route: 'Bangalore – Puttaparthi – Tirupati – Varanasi – Mumbai – Home Town',
  duration: '7 Nights · 8 Days',

  days: [
    {
      day: '01 Day', title: '11th Dec: Arrival Bangalore', eta: '',
      paras: [
        t("Welcome and assistance on arrival at Kempe Gowda International Airport, Bangalore, by British Airways flight BA 206/BA 131, arriving late at night at 12:40 am (12th Dec) Transfer to the pre-booked hotel by private car. By this time dinner at the hotel will be over, if you wish, on the way , the driver can assist you for TAKE AWAY food from restaurants or food joints. After check-in, you can discuss tomorrow's plan with the driver. Overnight at the hotel in Bangalore."),
        lead('Bangalore:', ' Capital of Karnataka State, Bangalore is famously known as the city of gardens. It is one of the most attractive cities in India with its beautiful parks, avenues, and impressive buildings. Bangalore is renowned as much for its industrial plants as for its silk saris, and for the sprawling Cubbon Park, which lies at the heart of the city, as also for its prestigious race course. It is now part of the great Silicon Valley and is a beautiful city filled with the tranquillity of its greenery. The Lalbagh Garden is particularly beautiful and well laid out. It has one of the largest collections of exotic Indian Tropical and subtropical vegetation, lakes, and Lotus-filled pools. Cubbon Park, Bull Temple, and Mysore Arts & Crafts Centre are worth visiting.')
      ],
      note: null
    },
    {
      day: '02 Day', title: '12th Dec: Bangalore - Puttaparthi', eta: '(155 kms: 3 hrs)',
      paras: [
        t('Today morning, after breakfast check out of the hotel and drive to Puttaparthi. On arrival, check into the hotel; afterwards, visit Prasanthi Nilayam, the main ashram of Sathya Sai Baba, which literally translates to "Abode of the Highest Peace". At the age of seventeen, Sathya Sai Baba told one devotee, "The Sai Pravesh" (the advent of Sai) will transform that region into Prasanthi Pradesh (a region of highest peace). Visiting Sri Sathya Sai Space Theatre. This planetarium was launched in the year 1985. Chaitanya Jyoti Museum was opened in the year 2000. The museum houses collections of various artefacts that depict Sai Baba\'s life since the time he was a child. Anjaneya Hanuman Swamy Temple: This temple is situated on the Gopuram road. A marvellous Shiva Lingam adorns the entrance of the temple. In the evening, you can opt to visit the Chitravathi River, which is considered the new Ganges by the devotees of Sai Baba. Dinner and overnight at the hotel in Puttaparthi.'),
        lead('Puttaparthi', " is popularly known by the world as the birthplace of Sri Shri Sathya Sai Baba. Venerated as a reincarnation of Shirdi Sai Baba, a mystic saint who lived at the beginning of the 20th century, this Sai Baba has a large following worldwide and is a pilgrimage centre for devotees. His ability to produce ash or 'Vibhuti' out of thin air added much to the god-like stature he enjoys amongst his devotees. This erstwhile nondescript village where Sai Baba was born is now equipped with schools, a state-of-the-art health care centre, a sports complex and a university.")
      ],
      note: null
    },
    {
      day: '03 Day', title: '13th Dec: Puttparthi - Lepakshi - Tirupati', eta: '(300 kms: 6 - 7 hrs)',
      paras: [
        t('After an early breakfast, you may opt to visit Prasanthi Nilayam for morning prayers and the peaceful Vata Vriksha (Meditation Tree) on the nearby hillock. Later, check out of the hotel and drive to Tirupati; en-route, you can opt to visit Lepakshi, known for Veerbhadra Temple, intricate Vijayanagar architecture and the huge monolithic Nandi. Afterwards, continue to drive to Tirupati; on arrival, check in at the hotel. The rest of the evening is free for relaxation, dinner and overnight at the hotel.'),
        lead('The Tirumala Hills', ' are part of the Seshachalam Hills range. The hills are 853m above sea level. The hills comprise seven peaks, representing the seven heads of Adisesha. The temple lies on the seventh peak -Venkatadri, on the southern banks of Sri Swami Pushkarini, a holy water tank. Hence, the temple is also referred to as "Temple of Seven Hills". Tirupati\'s presiding deity, Lord Venkateswara, is famous all over the world as the giver of boons, and is paid homage by people across all religions and races. The Temple is dedicated to Lord Venkateswara, an incarnation of Vishnu, who is believed to have appeared here to save mankind from the trials and troubles of Kali Yuga.')
      ],
      note: null
    },
    {
      day: '04 Day', title: '14th Dec: Tirupati', eta: '',
      paras: [
        t('Today, early morning Visit for Holy Darshan of Lord Balaji - The crown jewel of Tirumala. This opulent temple is dedicated to Lord Vishnu. Witness the ornate architecture, intricate carvings, and experience the awe-inspiring darshan (holy visit) of the revered Tirupati Balaji, enroute to Tirupati Balaji visit Kapileswara Swamy Temple situated at the foothills of Tirumala, then visit the Padmavati Lakshmi Mandir, Sri Anjaneya swami Temple. Afterwards, return to the hotel for dinner and an overnight stay.')
      ],
      note: null
    },
    {
      day: '05 Day', title: '15th Dec: Tirupati – Varanasi', eta: '(By Air)',
      paras: [
        t('This morning, after breakfast, the day is free for leisure. Later, check out of the hotel and transfer to the domestic airport to board Flight Indigo 6E 7212 departing at 12.15 hours and arriving at 17.40 hours in Varanasi, assistance on arrival and transfer to the hotel by private car. After relaxation, in the evening, you can opt to visit the banks of the Ganga River to witness the spectacular Aarti (worship) ceremony, as this beautiful ritual performed with brass lamps and chanting of mantras in the presence of the crowd fills you with spiritual thoughts and feelings. Later, return to the hotel for dinner and overnight stay.'),
        lead('Ganga Aarti Ceremony:', ' The magnificent Ganga Aarti is an evening ceremony in Varanasi that should not be missed. As the aarti begins along the sacred banks of the Ganges, the atmosphere fills with devotion and spiritual energy. Priests perform the ritual with beautifully arranged brass lamps, accompanied by the chanting of sacred mantras and the ringing of bells. At intervals, conch shells are blown, creating a powerful and resonant atmosphere amid the gathering crowd. The ceremony continues with incense and multi-tiered brass lamps, with camphor flames illuminating the riverfront. As the final prayers conclude, the atmosphere gradually settles into a profound sense of peace and silence.')
      ],
      note: null
    },
    {
      day: '06 Day', title: '16th Dec: (Wed) Varanasi', eta: '',
      paras: [
        t('This morning, proceed for an excursion to the Sarnath, approximately 13 kms from Varanasi, where Gautama Buddha gave his first sermon to his five disciples after attaining enlightenment. Places to see in Sarnath include Dhamek Stupa, Dharmaraj Ika Stupa, Ashokan Pillar, Votive Stupas, old Buddhist monasteries and the Archaeological Museum, which houses a collection of ancient Buddhist relics and antiques, including numerous Buddha and bodhisattva images. Later, return to Varanasi and proceed for a visit to the famous Kashi Vishvanath Temple, also known as the Golden Temple, followed by the Annapurna Temple. In the evening, proceed to the banks of the River Ganges to witness the famous Ganga Aarti, performed by priests with heavy brass lamps, religious prayers, chants and the echoing sounds of blowing conch shells. Later, return to the hotel for dinner and overnight stay.'),
        lead('Varanasi:', ' Located between the rivers Varuna and Ashi as they join the Ganges, Varanasi takes its name from its location. It is also called Kashi, the city of light, but the British, in an endeavour to simplify matters, coined their own name for the place - Benaras. Varanasi is the city of a thousand temples. The main object of all devotees is the Kasi Vishwanath Temple. According to Hindu belief, Benaras or Varanasi as it is known, is the cosmic centre of the Universe. Varanasi was already old when Rome was founded, a flourishing trade centre when the Buddha came to Sarnath to preach his first sermon. It was a city of great wealth and religious importance when the Chinese traveller Hiuen Tsang visited in the 7th century. The renowned American novelist Mark Twain once wrote, "Benaras is older than history, older than tradition, older even than legend and looks twice as old as all of them put together.')
      ],
      note: null
    },
    {
      day: '07 Day', title: '17th Dec: (Thru): Varanasi', eta: '',
      paras: [
        t("Early morning boat ride on the holy River Ganges; during the sunrise, people bathe early to offer prayers to the rising sun. During the boat ride, you will see the historic ghats of Varanasi, including the cremation ghats of Manikarnika and Harishchandra. Later, return to the hotel for breakfast and proceed with a sightseeing tour of Varanasi. Visit the Kal Bhairav Temple, followed by the Sankat Mochan Temple and Tulsi Manas Mandir. Later, visit Banaras Hindu University, one of Asia's largest residential universities, spread across approximately 1,300 acres. In the evening, explore the atmospheric old-city lanes and Vishwanath Gali, with its bustling markets famous for Banarasi silk and traditional handicrafts. Later, return to the hotel for dinner and overnight stay.")
      ],
      note: null
    },
    {
      day: '08 Day', title: '18th Dec: Varanasi- Mumbai', eta: '(By Air)',
      paras: [
        t('This morning, after breakfast, check out of the hotel and transfer to Varanasi Airport to board Indigo flight 6E-6544 to Mumbai at 11:50 hrs. Assistance on arrival in Mumbai at 14:25 hrs. After a refreshment, you can opt to visit ISKCON, Siddhi Vinayak and Mahalaxmi Temple, and if time permits, you can visit Bandra or Andheri for shopping. Later, have dinner at local restaurants around 11 pm; transfer to the Mumbai International Airport to board the British Airways Flight BA138 / BA1525 scheduled to depart at 2:15 am (19th Dec). On departure, the tour concludes with happy memories.')
      ],
      note: null
    }
  ],

  details: [
    {
      title: 'Tour Cost',
      text: '(inclusive of all: Hotels/Meals/Transportation/Domestic Air Tickets as mentioned in A, B, & C sections)',
      items: [lead('Tour Cost:', ' $ 5875 for 2 pax')]
    },
    {
      title: 'Services Includes',
      text: '',
      items: [
        t('Hotel accommodation 2 Single rooms with breakfast and dinner for 7 nights from 11th December to 17th Dec -26 as specified (Ex. Bangalore)'),
        t('Bangalore hotel with breakfast only, due to your arrival after dinner time.'),
        t("Puttparthi hotel doesn't provide rooms with dinner, dinner at à la carte, payable by us as per the bill."),
        t('All luxury taxes on meals and accommodation of the suggested hotels'),
        t('Air-conditioned Innova CRYSTA (Deluxe AC SUV) with English speaking driver for all transfers, sightseeing, intercity travel, including 4 airport transfers, etc. as per the above tour at disposal as per the tour plan.'),
        t('Transportation services include fuel cost, driver allowance (food and stay), state permit, toll taxes, parking etc.'),
        t('The day-to-day sightseeing can be modified according to preference and convenience of the guest within the city limits.')
      ]
    },
    {
      title: 'Excludes',
      text: '',
      items: [
        t('5% GST on the total tour cost.'),
        t('Any International and domestic Air fare.'),
        t('Tirupati Darshan Tickets.'),
        t('Expenditure pertaining to personal nature: like mineral water, portage, laundry, tips, phone calls etc.,'),
        t('Meals unless specified.'),
        t('Guide and monuments charges, directly payable by the guest on actual basis, unless specifically mentioned in "Services Included".')
      ]
    },
    {
      title: 'Note',
      text: '',
      items: [
        t('In case of non-availability of the above hotels similar category of hotels will be provided.'),
        t('Any cost arising due to natural calamities like, landslides, road blockage, political disturbances (strikes), etc (to be borne by the client, directly payable on the spot).'),
        t('Any increase in cost beyond our control such as fuel and airfare increase, fluctuation in USD exchange rates, government levies and taxes etc. The cost will be varied and applicable accordingly.'),
        t('As per Government rules, we request all the guests to carry a valid photo-Identity card'),
        t('Foreign Nationals are requested to present their passport and valid visa at the time of Check In at hotel.'),
        t('In case of mechanical fault or miss happening, we will be requiring the time to reach there so as to replace the vehicles.')
      ]
    }
  ],

  // A) Hotel Accommodation
  hotels: {
    title: 'Hotel Accommodation',
    text: '5 Star premium hotels (2 Single Rooms) with breakfast and dinner inclusive of all luxury taxes:',
    columns: ['Destination', 'Hotel', 'Category', 'Nights', 'Meal Plan'],
    rows: [
      ['Bangalore', 'Holiday Inn', '5 Star', '1', 'CPAI'],
      ['Puttaparthi', 'Sai Towers*', '3 Star', '1', 'MAPAI'],
      ['Tirupati', 'Taj Tirupati', '5 Star Deluxe', '2', 'MAPAI'],
      ['Varanasi', 'Taj Ganges', '5 Star Premium', '3', 'MAPAI']
    ],
    note: '*Sai Towers: No 5/4 Star hotels available in Puttaparthi, 3 Star is the best option.'
  },

  // C) Domestic Air Tickets
  flights: {
    title: 'Domestic Air Tickets for 2 pax',
    columns: ['Date', 'Flight No.', 'From', 'To', 'Departure', 'Arrival', 'Travel Time', 'Remark'],
    rows: [
      ['15 Dec -26', '6E 2575', 'Tirupati', 'Hyderabad', '12:15', '13:20', '1h 05m', '2h 30m at Hyderabad'],
      ['15 Dec -26', '6E 501', 'Hyderabad', 'Varanasi', '15:50', '17:40', '1h 50m', 'Direct'],
      ['18 Dec - 26', '6E 6544', 'Varanasi', 'Mumbai', '11:50', '14:25', '2h 35m', 'Direct']
    ]
  },

  enquire: { label: 'Enquire Now', href: '/contactus?tour=' + encodeURIComponent('South and North India Religious Tour') + '#enquiry' }
};
