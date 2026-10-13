// Vision of India Tour — from the "Incredible India Tours.docx" document (13 Oct 2026). Same format as the imported tours.
// Served at /itin_vision_tour
const site = require('../site');

module.exports = {
  file: "itin_vision_tour.html",
  url: "/itin_vision_tour",
  title: "Vision of India Tour, India Tour Package",
  description: "Private 29-day Vision of India Tour: Delhi, Patna, Nalanda, Rajgir, Bodhgaya, Varanasi, Khajuraho, Orchha, Gwalior, Agra, Jaipur, Aurangabad, Ajanta, Ellora, Mumbai, Chennai, Kanchipuram, Mahabalipuram, Pondicherry, Chidambaram, Tanjore, Trichy, Madurai, Bangalore, Srirangapatna, Mysore. Customizable India tour package with car, driver and hotels.",
  keywords: "vision of india tour, india tour package, private india tour, customized india tour, delhi tour, patna tour, nalanda tour, rajgir tour, bodhgaya tour, varanasi tour, khajuraho tour, orchha tour",
  heroSrc: site.IMG("india-tours-main.webp"),
  heroAlt: 'India Tours',
  nav: site.nav('India Tours', false),
  footCols: site.footCols(),
  listings: require('../listings'),

  breadcrumb: [
    { label: "Home", href: site.link("index.htm") },
    { label: "India Tours", href: site.link("itineraries.htm") },
    { label: "Incredible India Tours", href: site.link("incredible_india_tours.html") },
    { label: "Vision of India Tour" }
  ],
  heading: "Vision of India Tour",
  route: "Delhi - Patna - Nalanda - Rajgir - Bodhgaya - Varanasi - Khajuraho - Orchha - Gwalior - Agra - Jaipur - Delhi - Aurangabad - Ajanta - Ellora - Mumbai - Chennai - Kanchipuram - Mahabalipuram - Pondicherry - Chidambaram - Tanjore - Trichy - Madurai - Bangalore - Srirangapatna - Mysore - Bangalore",
  duration: "28 Nights · 29 Days",

  days: [
    {
      "day": "01 Day",
      "title": "Arrival at Delhi",
      "eta": "",
      "paras": [
        [
          {
            "text": "Welcome at ",
            "bold": false
          },
          {
            "text": "Indira Gandhi International Airport",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Delhi",
            "bold": true
          },
          {
            "text": ", where our representative will assist you and transfer you to the pre-booked hotel by air-conditioned car. After check-in, you will receive your tour documents and a briefing about the journey ahead. In the evening, attend the Light and Sound Show at ",
            "bold": false
          },
          {
            "text": "Red Fort",
            "bold": true
          },
          {
            "text": ", which brings episodes from Delhi’s long history to life against the backdrop of the Mughal fortress. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "02 Day",
      "title": "Delhi",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, explore Old Delhi, beginning with ",
            "bold": false
          },
          {
            "text": "Red Fort",
            "bold": true
          },
          {
            "text": ", the red sandstone residence of Mughal emperors, and ",
            "bold": false
          },
          {
            "text": "Jama Masjid",
            "bold": true
          },
          {
            "text": ", one of India’s largest historic mosques, built by Shah Jahan. Visit ",
            "bold": false
          },
          {
            "text": "Rajghat",
            "bold": true
          },
          {
            "text": ", the memorial to Mahatma Gandhi, before exploring the lanes and shops of ",
            "bold": false
          },
          {
            "text": "Chandni Chowk",
            "bold": true
          },
          {
            "text": " on foot. Continue to New Delhi to see ",
            "bold": false
          },
          {
            "text": "Rashtrapati Bhavan",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "India Gate",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Birla Mandir",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Humayun’s Tomb",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Lotus Temple",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Qutub Minar",
            "bold": true
          },
          {
            "text": ". Humayun’s Tomb is a garden mausoleum whose design influenced later Mughal architecture, including the Taj Mahal. Qutub Minar rises 72.5 metres above its surrounding historic complex. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "03 Day",
      "title": "Delhi – Patna",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and transfer to the airport for your flight to ",
            "bold": false
          },
          {
            "text": "Patna",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel and later explore the city. Visit ",
            "bold": false
          },
          {
            "text": "Takht Sri Harmandir Sahib",
            "bold": true
          },
          {
            "text": ", also known as ",
            "bold": false
          },
          {
            "text": "Patna Sahib",
            "bold": true
          },
          {
            "text": ", an important Sikh pilgrimage site associated with Guru Gobind Singh, the tenth Sikh Guru. Continue to ",
            "bold": false
          },
          {
            "text": "Golghar",
            "bold": true
          },
          {
            "text": ", a large domed granary built for grain storage, and ",
            "bold": false
          },
          {
            "text": "Jalan Museum",
            "bold": true
          },
          {
            "text": " at Qila House, known for its collection of antiques, paintings, silverware and jade objects. If time permits, visit the ",
            "bold": false
          },
          {
            "text": "Bihar Institute of Handicraft and Design",
            "bold": true
          },
          {
            "text": ", which works to develop traditional regional crafts, including Mithila painting. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "04 Day",
      "title": "Patna – Nalanda – Rajgir – Bodhgaya",
      "eta": "(190 km, approximately 5 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and drive towards ",
            "bold": false
          },
          {
            "text": "Bodhgaya",
            "bold": true
          },
          {
            "text": ", visiting ",
            "bold": false
          },
          {
            "text": "Nalanda",
            "bold": true
          },
          {
            "text": " and ",
            "bold": false
          },
          {
            "text": "Rajgir",
            "bold": true
          },
          {
            "text": " en route. At ",
            "bold": false
          },
          {
            "text": "Nalanda Mahavihara",
            "bold": true
          },
          {
            "text": ", explore the brick monasteries, courtyards and remains of one of the ancient world’s great centres of Buddhist learning. Visit the ",
            "bold": false
          },
          {
            "text": "Nalanda Archaeological Museum",
            "bold": true
          },
          {
            "text": " for sculptures and archaeological finds from the region. Continue to ",
            "bold": false
          },
          {
            "text": "Rajgir",
            "bold": true
          },
          {
            "text": ", the ancient capital of Magadha, and visit ",
            "bold": false
          },
          {
            "text": "Gridhakuta Hill",
            "bold": true
          },
          {
            "text": ", also called Vulture’s Peak, associated with the Buddha’s teachings and meditation. The area is also linked with ",
            "bold": false
          },
          {
            "text": "Jivakamaravana Monastery",
            "bold": true
          },
          {
            "text": " and Jain traditions. Later, continue to Bodhgaya and transfer to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "05 Day",
      "title": "Bodhgaya",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, explore ",
            "bold": false
          },
          {
            "text": "Bodhgaya",
            "bold": true
          },
          {
            "text": ", one of the most important pilgrimage destinations in Buddhism. Visit ",
            "bold": false
          },
          {
            "text": "Mahabodhi Temple",
            "bold": true
          },
          {
            "text": ", a UNESCO World Heritage Site marking the place where Gautama Buddha attained enlightenment, and the sacred ",
            "bold": false
          },
          {
            "text": "Mahabodhi Tree",
            "bold": true
          },
          {
            "text": " within the complex. Continue to the ",
            "bold": false
          },
          {
            "text": "Great Buddha Statue",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Muchalinda Lake",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Animesh Lochana Chaitya",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Cankamana",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Ratnaghara",
            "bold": true
          },
          {
            "text": ", and the ",
            "bold": false
          },
          {
            "text": "Ajapala Nigrodha",
            "bold": true
          },
          {
            "text": " and ",
            "bold": false
          },
          {
            "text": "Rajayatna Trees",
            "bold": true
          },
          {
            "text": ", all associated with Buddhist tradition. Visit the ",
            "bold": false
          },
          {
            "text": "Chinese Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Indosan Nippon Japanese Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Royal Bhutan Monastery",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Thai Monastery",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Vietnamese Temple",
            "bold": true
          },
          {
            "text": ". Their varied architecture reflects Bodhgaya’s importance to Buddhist communities across Asia. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "06 Day",
      "title": "Bodhgaya – Varanasi",
      "eta": "(250 km, approximately 6 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and drive to ",
            "bold": false
          },
          {
            "text": "Varanasi",
            "bold": true
          },
          {
            "text": ", stopping at ",
            "bold": false
          },
          {
            "text": "Sarnath",
            "bold": true
          },
          {
            "text": ", where the Buddha delivered his first sermon after attaining enlightenment. Visit ",
            "bold": false
          },
          {
            "text": "Dhamek Stupa",
            "bold": true
          },
          {
            "text": ", marking the traditional site of this teaching, and the remains of ",
            "bold": false
          },
          {
            "text": "Dharmarajika Stupa",
            "bold": true
          },
          {
            "text": ". Continue to the ",
            "bold": false
          },
          {
            "text": "Sarnath Archaeological Museum",
            "bold": true
          },
          {
            "text": ", known for its Buddhist sculptures and the celebrated Lion Capital of Ashoka, whose four lions form the basis of India’s national emblem. The surrounding archaeological grounds include remains of monasteries and ancient religious structures. After sightseeing, continue to Varanasi and transfer to the hotel. The evening is free to relax before the next day’s exploration. Overnight stay in Varanasi.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "07 Day",
      "title": "Varanasi",
      "eta": "",
      "paras": [
        [
          {
            "text": "Begin early with a ",
            "bold": false
          },
          {
            "text": "boat ride on the Ganges",
            "bold": true
          },
          {
            "text": ", when the riverfront comes alive with morning prayers, bathing rituals and offerings to the rising sun. After breakfast, explore ",
            "bold": false
          },
          {
            "text": "Manikarnika Ghat",
            "bold": true
          },
          {
            "text": " and ",
            "bold": false
          },
          {
            "text": "Harishchandra Ghat",
            "bold": true
          },
          {
            "text": ", both associated with Hindu cremation traditions. Visit ",
            "bold": false
          },
          {
            "text": "Bharat Mata Temple",
            "bold": true
          },
          {
            "text": ", known for its large relief map of the Indian subcontinent, ",
            "bold": false
          },
          {
            "text": "Sankat Mochan Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Tulsi Manas Mandir",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Durga Temple",
            "bold": true
          },
          {
            "text": ". Continue to ",
            "bold": false
          },
          {
            "text": "Banaras Hindu University",
            "bold": true
          },
          {
            "text": " and ",
            "bold": false
          },
          {
            "text": "Kashi Vishwanath Temple",
            "bold": true
          },
          {
            "text": ", one of Hinduism’s most revered Shiva shrines, recognised by its golden spire. In the evening, attend the ",
            "bold": false
          },
          {
            "text": "Ganga Aarti",
            "bold": true
          },
          {
            "text": ", when priests perform prayers with brass lamps, accompanied by devotional chants and the gathering crowds along the river. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "08 Day",
      "title": "Varanasi – Khajuraho",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and transfer to the airport for your flight to ",
            "bold": false
          },
          {
            "text": "Khajuraho",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel and, depending on the arrival time, visit ",
            "bold": false
          },
          {
            "text": "Raneh Falls",
            "bold": true
          },
          {
            "text": ", where the Ken River cuts through a dramatic canyon of colourful volcanic rock formations. Continue to the ",
            "bold": false
          },
          {
            "text": "Archaeological Museum",
            "bold": true
          },
          {
            "text": ", which displays stone sculptures and architectural fragments associated with the Chandela temples. In the evening, attend the ",
            "bold": false
          },
          {
            "text": "Khajuraho Light and Sound Show",
            "bold": true
          },
          {
            "text": ", which recounts the history of the Chandela rulers and the construction of their celebrated temples. The combination of carved monuments, regional history and distinctive geology introduces the area before the following day’s temple tour. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "09 Day",
      "title": "Khajuraho",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, explore the ",
            "bold": false
          },
          {
            "text": "Western Group of Temples",
            "bold": true
          },
          {
            "text": ", the best-known part of Khajuraho’s UNESCO World Heritage Site. Visit ",
            "bold": false
          },
          {
            "text": "Kandariya Mahadev Temple",
            "bold": true
          },
          {
            "text": ", dedicated to Shiva and distinguished by its soaring spire and intricate carvings, and ",
            "bold": false
          },
          {
            "text": "Lakshmana Temple",
            "bold": true
          },
          {
            "text": ", dedicated to Vishnu. See the ",
            "bold": false
          },
          {
            "text": "Lakshmi Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Varaha Temple",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Chausath Yogini Temple",
            "bold": true
          },
          {
            "text": ". Continue to the ",
            "bold": false
          },
          {
            "text": "Eastern Group of Temples",
            "bold": true
          },
          {
            "text": ", which includes Hindu and Jain monuments. Visit ",
            "bold": false
          },
          {
            "text": "Parsvanath Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Adinath Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Shantinath Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Vamana Temple",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Brahma/Hanuman Temple",
            "bold": true
          },
          {
            "text": ". The sculptures depict deities, celestial figures, musicians, dancers and scenes of daily life, revealing the artistic skill and religious traditions of the Chandela period. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "10 Day",
      "title": "Khajuraho – Orchha",
      "eta": "(175 km, approximately 4 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and drive to ",
            "bold": false
          },
          {
            "text": "Orchha",
            "bold": true
          },
          {
            "text": ", a historic Bundela town beside the Betwa River. On arrival, transfer to the hotel and later visit ",
            "bold": false
          },
          {
            "text": "Jhansi",
            "bold": true
          },
          {
            "text": ", around 18 km away. Explore ",
            "bold": false
          },
          {
            "text": "Jhansi Fort",
            "bold": true
          },
          {
            "text": " and ",
            "bold": false
          },
          {
            "text": "Rani Jhansi’s Palace",
            "bold": true
          },
          {
            "text": ", associated with Rani Lakshmibai and the uprising of 1857. Return to Orchha for the ",
            "bold": false
          },
          {
            "text": "Light and Sound Show",
            "bold": true
          },
          {
            "text": ", which presents the history of the town and its Bundela rulers. Orchha’s heritage includes royal palaces, temples and riverside cenotaphs, many clustered around the former royal complex. The town’s setting beside the Betwa River adds to the character of its historic monuments. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "11 Day",
      "title": "Orchha – Gwalior – Agra",
      "eta": "(approximately 250 km, 5–6 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, enjoy the riverside scenery around ",
            "bold": false
          },
          {
            "text": "Orchha",
            "bold": true
          },
          {
            "text": ", including the ",
            "bold": false
          },
          {
            "text": "Chhatris",
            "bold": true
          },
          {
            "text": " beside the Betwa River and ",
            "bold": false
          },
          {
            "text": "Ram Raja Temple",
            "bold": true
          },
          {
            "text": ", where Rama is worshipped as a king. Check out and drive towards ",
            "bold": false
          },
          {
            "text": "Agra",
            "bold": true
          },
          {
            "text": ", stopping at ",
            "bold": false
          },
          {
            "text": "Gwalior Fort",
            "bold": true
          },
          {
            "text": ", a hilltop complex of palaces and temples. Visit the ",
            "bold": false
          },
          {
            "text": "Sas-Bahu Temples",
            "bold": true
          },
          {
            "text": ", known for their intricate stone carvings, and ",
            "bold": false
          },
          {
            "text": "Teli-ka-Mandir",
            "bold": true
          },
          {
            "text": ", which combines northern and southern architectural styles. Continue to ",
            "bold": false
          },
          {
            "text": "Man Singh Palace",
            "bold": true
          },
          {
            "text": ", with colourful tilework on its exterior and decorated interiors featuring painted designs and ornamental details. Proceed to Agra and check in at the hotel. In the evening, visit ",
            "bold": false
          },
          {
            "text": "Oswal Emporium",
            "bold": true
          },
          {
            "text": " to see its Taj Mahal replica and attend the ",
            "bold": false
          },
          {
            "text": "Mohabbat – The Taj",
            "bold": true
          },
          {
            "text": " show, which presents the story associated with the famous mausoleum. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "12 Day",
      "title": "Agra",
      "eta": "",
      "paras": [
        [
          {
            "text": "Start early with a sunrise visit to the ",
            "bold": false
          },
          {
            "text": "Taj Mahal",
            "bold": true
          },
          {
            "text": ", one of the Seven Wonders of the World, built in white marble by Emperor Shah Jahan in memory of Mumtaz Mahal. Continue to ",
            "bold": false
          },
          {
            "text": "Agra Fort",
            "bold": true
          },
          {
            "text": ", a major Mughal stronghold with palaces, courtyards and audience halls. See ",
            "bold": false
          },
          {
            "text": "Jahangir Mahal",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Moti Masjid",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Macchhi Bhawan",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Nagina Masjid",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Diwan-i-Khas",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Sheesh Mahal",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Diwan-i-Am",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Meena Bazaar",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Musamman Burj",
            "bold": true
          },
          {
            "text": ", where Shah Jahan spent his final years in confinement with a view towards the Taj Mahal. Later, visit ",
            "bold": false
          },
          {
            "text": "Itimad-ud-Daulah’s Tomb",
            "bold": true
          },
          {
            "text": ", often called the Baby Taj, admired for its delicate marble inlay and detailed stonework. Return to the hotel for an overnight stay. ",
            "bold": false
          },
          {
            "text": "Note:",
            "bold": true
          },
          {
            "text": " The Taj Mahal is closed every Friday.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "13 Day",
      "title": "Agra – Fatehpur Sikri – Jaipur",
      "eta": "(240 km, approximately 5–6 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and drive to ",
            "bold": false
          },
          {
            "text": "Jaipur",
            "bold": true
          },
          {
            "text": ", stopping at ",
            "bold": false
          },
          {
            "text": "Fatehpur Sikri",
            "bold": true
          },
          {
            "text": ", the former Mughal capital built by Emperor Akbar. Explore ",
            "bold": false
          },
          {
            "text": "Diwan-i-Khas",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Panch Mahal",
            "bold": true
          },
          {
            "text": ", the ",
            "bold": false
          },
          {
            "text": "Tomb of Sheikh Salim Chishti",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Buland Darwaza",
            "bold": true
          },
          {
            "text": ", the monumental gateway to the complex. Continue to ",
            "bold": false
          },
          {
            "text": "Abhaneri",
            "bold": true
          },
          {
            "text": " to visit ",
            "bold": false
          },
          {
            "text": "Chand Baori",
            "bold": true
          },
          {
            "text": ", a magnificent stepwell with around 3,500 steps arranged in a striking geometric pattern, and the nearby ",
            "bold": false
          },
          {
            "text": "Harshat Mata Temple",
            "bold": true
          },
          {
            "text": ". Chand Baori’s deep, symmetrical flights of stairs demonstrate how traditional architecture combined water storage with careful design. Continue to Jaipur and transfer to the hotel on arrival. Overnight stay in Jaipur.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "14 Day",
      "title": "Jaipur",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, explore ",
            "bold": false
          },
          {
            "text": "Amber Fort",
            "bold": true
          },
          {
            "text": ", known for its courtyards, palace rooms and ",
            "bold": false
          },
          {
            "text": "Sheesh Mahal",
            "bold": true
          },
          {
            "text": ", decorated with intricate mirror work. Continue to ",
            "bold": false
          },
          {
            "text": "Nahargarh Fort",
            "bold": true
          },
          {
            "text": " for views over Jaipur. Visit ",
            "bold": false
          },
          {
            "text": "City Palace",
            "bold": true
          },
          {
            "text": ", associated with Jaipur’s royal family, and ",
            "bold": false
          },
          {
            "text": "Jantar Mantar",
            "bold": true
          },
          {
            "text": ", a UNESCO World Heritage Site containing large astronomical instruments built for observing celestial movements. Stop at ",
            "bold": false
          },
          {
            "text": "Hawa Mahal",
            "bold": true
          },
          {
            "text": ", whose five-storey pink sandstone façade features 953 small windows designed to allow royal women to observe street life while remaining screened from public view. Visit ",
            "bold": false
          },
          {
            "text": "Birla Mandir",
            "bold": true
          },
          {
            "text": ", built in white marble. In the evening, attend the ",
            "bold": false
          },
          {
            "text": "Amber Fort Light and Sound Show",
            "bold": true
          },
          {
            "text": " and visit ",
            "bold": false
          },
          {
            "text": "Chokhi Dhani",
            "bold": true
          },
          {
            "text": " for Rajasthani food, folk dances and puppet shows. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "15 Day",
      "title": "Jaipur – Neemrana – Delhi (260 km, approximately 6 hours) – Aurangabad",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and drive towards ",
            "bold": false
          },
          {
            "text": "Delhi",
            "bold": true
          },
          {
            "text": ", stopping at ",
            "bold": false
          },
          {
            "text": "Neemrana Fort Palace",
            "bold": true
          },
          {
            "text": ", a historic fort converted into a heritage hotel on the Aravalli hills. Explore its courtyards and terraces, or enjoy lunch at the property. The ",
            "bold": false
          },
          {
            "text": "Neemrana Zip Tour",
            "bold": true
          },
          {
            "text": " offers a different view of the surrounding landscape, crossing the hills on a series of zip lines. Continue to Delhi airport for your scheduled flight to ",
            "bold": false
          },
          {
            "text": "Aurangabad",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel and check in. This is a long travel day combining a road journey, a stop at Neemrana and an intercity flight, so the visit to the fort will need to fit around the onward journey. Overnight stay in Aurangabad.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "16 Day",
      "title": "Aurangabad – Ajanta – Aurangabad",
      "eta": "(105 km, approximately 2 hours each way)",
      "paras": [
        [
          {
            "text": "After an early breakfast, take an excursion to the ",
            "bold": false
          },
          {
            "text": "Ajanta Caves",
            "bold": true
          },
          {
            "text": ", a UNESCO World Heritage Site carved into a horseshoe-shaped cliff above the Waghora River. Explore the Buddhist monasteries and prayer halls, admired for their murals, sculptures and depictions of the Buddha and Jataka stories. Return towards Aurangabad and visit ",
            "bold": false
          },
          {
            "text": "Daulatabad Fort",
            "bold": true
          },
          {
            "text": ", with its ",
            "bold": false
          },
          {
            "text": "Jami Masjid",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Bharatmata Mandir",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Chand Minar",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Elephant Tank",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Chini Mahal",
            "bold": true
          },
          {
            "text": ". Continue to ",
            "bold": false
          },
          {
            "text": "Khuldabad",
            "bold": true
          },
          {
            "text": ", the burial place of Mughal emperor Aurangzeb. Later, see ",
            "bold": false
          },
          {
            "text": "Bibi Ka Maqbara",
            "bold": true
          },
          {
            "text": ", often called the Taj of the Deccan for its resemblance to the Taj Mahal, and ",
            "bold": false
          },
          {
            "text": "Panchakki",
            "bold": true
          },
          {
            "text": ", a historic water mill powered by a traditional water channel. Overnight stay in Aurangabad.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "17 Day",
      "title": "Aurangabad – Ellora (30 km, approximately 30 minutes) – Mumbai",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, visit the ",
            "bold": false
          },
          {
            "text": "Ellora Caves",
            "bold": true
          },
          {
            "text": ", a UNESCO World Heritage Site with 34 Buddhist, Hindu and Jain cave monuments carved into a basalt hillside. Explore the cave groups and ",
            "bold": false
          },
          {
            "text": "Kailasa Temple",
            "bold": true
          },
          {
            "text": ", a remarkable monolithic structure dedicated to Shiva and carved from a single rock mass. Its courtyards, pillars and sculpted panels depict scenes from Hindu epics, including the Ramayana and Mahabharata. The caves also contain Buddhist monasteries and Jain shrines, reflecting the artistic traditions of different religious communities. After sightseeing, check out of the hotel and transfer to the airport for your flight to ",
            "bold": false
          },
          {
            "text": "Mumbai",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "18 Day",
      "title": "Mumbai",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, visit the ",
            "bold": false
          },
          {
            "text": "Gateway of India",
            "bold": true
          },
          {
            "text": " and take a boat ride to ",
            "bold": false
          },
          {
            "text": "Elephanta Caves",
            "bold": true
          },
          {
            "text": ", a UNESCO World Heritage Site known for its rock-cut shrines dedicated primarily to Shiva. The ",
            "bold": false
          },
          {
            "text": "Trimurti sculpture",
            "bold": true
          },
          {
            "text": ", depicting three aspects of Shiva, is among the caves’ most celebrated works. Return by boat and visit ",
            "bold": false
          },
          {
            "text": "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
            "bold": true
          },
          {
            "text": ", formerly the Prince of Wales Museum, with its collections of art and historical objects. Continue to ",
            "bold": false
          },
          {
            "text": "Parliament House",
            "bold": true
          },
          {
            "text": " from outside, ",
            "bold": false
          },
          {
            "text": "Nariman Point",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Marine Drive",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Dhobi Ghat",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Mani Bhavan",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Chhatrapati Shivaji Maharaj Terminus",
            "bold": true
          },
          {
            "text": ", and the ",
            "bold": false
          },
          {
            "text": "Bandra-Worli Sea Link",
            "bold": true
          },
          {
            "text": ". In the evening, explore Mumbai’s restaurants, pubs and bars independently. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "19 Day",
      "title": "Mumbai – Chennai",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and transfer to the airport for your flight to ",
            "bold": false
          },
          {
            "text": "Chennai",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel and check in. The remainder of the day is free for relaxation or individual activities. In the evening, explore a local ",
            "bold": false
          },
          {
            "text": "flower and fruit market",
            "bold": true
          },
          {
            "text": ", where vendors supply households, shops and temples with fresh produce and garlands. Chennai’s markets offer an introduction to everyday Tamil life, while its food stalls and neighbourhood shops provide opportunities to try local snacks and browse regional products. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "20 Day",
      "title": "Chennai",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, take a sightseeing tour of ",
            "bold": false
          },
          {
            "text": "Chennai",
            "bold": true
          },
          {
            "text": ". Visit ",
            "bold": false
          },
          {
            "text": "Fort St. George",
            "bold": true
          },
          {
            "text": ", the historic British fort complex that includes the Fort Museum and St. Mary’s Church, one of the oldest Anglican churches in India. Continue to ",
            "bold": false
          },
          {
            "text": "Santhome Cathedral",
            "bold": true
          },
          {
            "text": ", associated with the tradition of St. Thomas, and ",
            "bold": false
          },
          {
            "text": "Kapaleeswarar Temple",
            "bold": true
          },
          {
            "text": ", a major Shiva temple recognised by its colourful Dravidian-style gopuram. Visit ",
            "bold": false
          },
          {
            "text": "Parthasarathy Temple",
            "bold": true
          },
          {
            "text": ", dedicated to Lord Krishna and known for its long-standing Vaishnavite traditions. Continue to the ",
            "bold": false
          },
          {
            "text": "Snake Park",
            "bold": true
          },
          {
            "text": ", home to snakes and other reptiles and an educational centre for wildlife awareness. These visits bring together Chennai’s colonial history, temple architecture and wildlife conservation. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "21 Day",
      "title": "Chennai – Kanchipuram – Mahabalipuram",
      "eta": "(130 km, approximately 4 hours driving)",
      "paras": [
        [
          {
            "text": "After an early breakfast, check out and drive to ",
            "bold": false
          },
          {
            "text": "Kanchipuram",
            "bold": true
          },
          {
            "text": ", a historic centre of Pallava architecture and silk weaving. Visit ",
            "bold": false
          },
          {
            "text": "Kailasanathar Temple",
            "bold": true
          },
          {
            "text": ", known for its sandstone carvings, followed by ",
            "bold": false
          },
          {
            "text": "Vaikunta Perumal",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Ekambareswarar",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Kamakshi Amman",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Sakishwarar Temples",
            "bold": true
          },
          {
            "text": ". Explore the local silk markets, known for Kanchipuram sarees woven with traditional motifs and contrasting borders. Continue to ",
            "bold": false
          },
          {
            "text": "Mahabalipuram",
            "bold": true
          },
          {
            "text": ", a UNESCO World Heritage Site celebrated for its Pallava-era rock-cut and structural monuments. Visit the ",
            "bold": false
          },
          {
            "text": "Shore Temple",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Pancha Rathas",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Arjuna’s Penance",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Krishna Mandapa",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Mahishasuramardini Cave",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Varaha Mandapa",
            "bold": true
          },
          {
            "text": ", and other mandapams. The carvings and monolithic shrines illustrate the development of South Indian temple architecture. Overnight stay in Mahabalipuram.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "22 Day",
      "title": "Mahabalipuram – Pondicherry",
      "eta": "(100 km, approximately 3 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and drive to ",
            "bold": false
          },
          {
            "text": "Pondicherry",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel and explore the former French colonial settlement. Visit the ",
            "bold": false
          },
          {
            "text": "Sri Aurobindo Ashram",
            "bold": true
          },
          {
            "text": " and the ",
            "bold": false
          },
          {
            "text": "École Française d’Extrême-Orient",
            "bold": true
          },
          {
            "text": ", associated with research in Asian languages, history and archaeology. Continue to ",
            "bold": false
          },
          {
            "text": "Immaculate Conception Cathedral",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Our Lady of Angels Church",
            "bold": true
          },
          {
            "text": ", and the ",
            "bold": false
          },
          {
            "text": "Chapel of Our Sisters of Cluny",
            "bold": true
          },
          {
            "text": ", reflecting the town’s Catholic heritage. Visit ",
            "bold": false
          },
          {
            "text": "Auroville",
            "bold": true
          },
          {
            "text": ", an international community founded around the ideal of human unity. In the evening, walk along the ",
            "bold": false
          },
          {
            "text": "Promenade",
            "bold": true
          },
          {
            "text": ", seeing the statues of ",
            "bold": false
          },
          {
            "text": "Mahatma Gandhi",
            "bold": true
          },
          {
            "text": ", ",
            "bold": false
          },
          {
            "text": "Joan of Arc",
            "bold": true
          },
          {
            "text": ", and ",
            "bold": false
          },
          {
            "text": "Duplex",
            "bold": true
          },
          {
            "text": ", the ",
            "bold": false
          },
          {
            "text": "French War Memorial",
            "bold": true
          },
          {
            "text": ", the heritage ",
            "bold": false
          },
          {
            "text": "Mairie",
            "bold": true
          },
          {
            "text": ", and the old lighthouse. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "23 Day",
      "title": "Pondicherry – Chidambaram – Thanjavur",
      "eta": "(165 km, approximately 4 hours driving)",
      "paras": [
        [
          {
            "text": "After an early breakfast, check out and drive towards ",
            "bold": false
          },
          {
            "text": "Thanjavur",
            "bold": true
          },
          {
            "text": ", stopping at ",
            "bold": false
          },
          {
            "text": "Chidambaram",
            "bold": true
          },
          {
            "text": " to visit ",
            "bold": false
          },
          {
            "text": "Nataraja Temple",
            "bold": true
          },
          {
            "text": ", one of Tamil Nadu’s major Shiva temples. Dedicated to Shiva as the cosmic dancer, Nataraja, the complex is known for its towering gopurams, pillared halls and gold-plated roof above the central shrine. Its traditions associate Shiva with the element of space, represented by the Chidambaram Rahasyam. After the visit, continue to Thanjavur, a former Chola capital and an important centre of Tamil art, music and temple culture. On arrival, transfer to the hotel and check in. The rest of the evening is free for relaxation. Overnight stay in Thanjavur.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "24 Day",
      "title": "Thanjavur – Trichy – Madurai",
      "eta": "(190 km, approximately 5 hours driving)",
      "paras": [
        [
          {
            "text": "After breakfast, visit ",
            "bold": false
          },
          {
            "text": "Brihadisvara Temple",
            "bold": true
          },
          {
            "text": " in ",
            "bold": false
          },
          {
            "text": "Thanjavur",
            "bold": true
          },
          {
            "text": ", a UNESCO-listed Great Living Chola Temple known for its towering vimana and monumental stone architecture. Continue to ",
            "bold": false
          },
          {
            "text": "Thanjavur Palace",
            "bold": true
          },
          {
            "text": ", with its spacious halls and historic towers, and the ",
            "bold": false
          },
          {
            "text": "Saraswathi Mahal Library",
            "bold": true
          },
          {
            "text": ", known for its rare manuscripts and books. Drive to ",
            "bold": false
          },
          {
            "text": "Tiruchirappalli (Trichy)",
            "bold": true
          },
          {
            "text": " and visit ",
            "bold": false
          },
          {
            "text": "Rock Fort Temple",
            "bold": true
          },
          {
            "text": ", reached by rock-cut steps leading to shrines dedicated to Shiva and Ganesha. Continue to ",
            "bold": false
          },
          {
            "text": "Sri Ranganathaswamy Temple",
            "bold": true
          },
          {
            "text": " at Srirangam, an extensive temple complex dedicated to Vishnu, and ",
            "bold": false
          },
          {
            "text": "Jambukeswarar Temple",
            "bold": true
          },
          {
            "text": ", associated with Shiva and the element of water. After sightseeing, drive to ",
            "bold": false
          },
          {
            "text": "Madurai",
            "bold": true
          },
          {
            "text": " and transfer to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "25 Day",
      "title": "Madurai",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, visit ",
            "bold": false
          },
          {
            "text": "Meenakshi Amman Temple",
            "bold": true
          },
          {
            "text": ", the great temple complex dedicated to Meenakshi and Sundareshwarar, known for its colourful gopurams, sculpted pillars and active ritual life. Explore the temple precincts and surrounding markets, where shops sell flowers, brassware, textiles and religious items. Continue to ",
            "bold": false
          },
          {
            "text": "Tiruparankundram Murugan Temple",
            "bold": true
          },
          {
            "text": ", an important pilgrimage shrine partly carved into rock, and ",
            "bold": false
          },
          {
            "text": "Pazhamudircholai Murugan Temple",
            "bold": true
          },
          {
            "text": ", set amid wooded hills. Visit ",
            "bold": false
          },
          {
            "text": "Thirumalai Nayakkar Palace",
            "bold": true
          },
          {
            "text": ", known for its grand courtyard, tall pillars and decorative arches. In the evening, return to ",
            "bold": false
          },
          {
            "text": "Meenakshi Amman Temple",
            "bold": true
          },
          {
            "text": " to witness the evening worship ceremony, with lamps, music and traditional rituals. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "26 Day",
      "title": "Madurai – Bangalore",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, check out and transfer to the airport for your flight to ",
            "bold": false
          },
          {
            "text": "Bangalore",
            "bold": true
          },
          {
            "text": ". On arrival, transfer to the hotel and begin sightseeing after some refreshment. Visit ",
            "bold": false
          },
          {
            "text": "ISKCON Temple",
            "bold": true
          },
          {
            "text": ", situated on Hare Krishna Hill, and ",
            "bold": false
          },
          {
            "text": "Bull Temple",
            "bold": true
          },
          {
            "text": ", known for its large monolithic Nandi image carved from granite. Continue to ",
            "bold": false
          },
          {
            "text": "Gavi Gangadhareshwara Temple",
            "bold": true
          },
          {
            "text": ", a rock-cut cave temple dedicated to Shiva, recognised for its natural rock setting and distinctive courtyard. Visit the ",
            "bold": false
          },
          {
            "text": "Visvesvaraya Industrial and Technological Museum",
            "bold": true
          },
          {
            "text": ", with interactive displays on science and engineering, and see ",
            "bold": false
          },
          {
            "text": "Vidhana Soudha",
            "bold": true
          },
          {
            "text": ", the imposing seat of Karnataka’s legislature. If time permits, visit ",
            "bold": false
          },
          {
            "text": "Ulsoor Lake",
            "bold": true
          },
          {
            "text": " for a walk beside the water. Return to the hotel for an overnight stay in Bangalore.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "27 Day",
      "title": "Bangalore – Srirangapatna – Mysore",
      "eta": "(150 km, approximately 4 hours driving)",
      "paras": [
        [
          {
            "text": "After an early breakfast, check out and drive towards ",
            "bold": false
          },
          {
            "text": "Mysore",
            "bold": true
          },
          {
            "text": ", stopping at ",
            "bold": false
          },
          {
            "text": "Srirangapatna",
            "bold": true
          },
          {
            "text": ", an island town in the Kaveri River associated with Hyder Ali and Tipu Sultan. Visit ",
            "bold": false
          },
          {
            "text": "Srirangapatna Fort",
            "bold": true
          },
          {
            "text": " and ",
            "bold": false
          },
          {
            "text": "Ranganathaswamy Temple",
            "bold": true
          },
          {
            "text": ", dedicated to Lord Ranganatha, a form of Vishnu. The town’s monuments reflect its importance under several South Indian dynasties and during the Anglo-Mysore conflicts. Continue to Mysore and check in at the hotel. Later, visit ",
            "bold": false
          },
          {
            "text": "Brindavan Gardens",
            "bold": true
          },
          {
            "text": ", known for its landscaped terraces, ornamental gardens and musical fountains. Explore the local ",
            "bold": false
          },
          {
            "text": "flower and sandalwood markets",
            "bold": true
          },
          {
            "text": " and the ",
            "bold": false
          },
          {
            "text": "Handicrafts Museum",
            "bold": true
          },
          {
            "text": ", which showcases traditional regional crafts. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "28 Day",
      "title": "Mysore",
      "eta": "",
      "paras": [
        [
          {
            "text": "After breakfast, visit ",
            "bold": false
          },
          {
            "text": "Mysore Palace",
            "bold": true
          },
          {
            "text": ", the former residence of the Wodeyar rulers, known for its ornate halls, arches, domes and blend of Indo-Saracenic and other architectural influences. Continue to ",
            "bold": false
          },
          {
            "text": "St. Philomena’s Cathedral",
            "bold": true
          },
          {
            "text": ", a prominent neo-Gothic church with twin spires and stained-glass windows depicting scenes from the life of Christ. Drive up ",
            "bold": false
          },
          {
            "text": "Chamundi Hill",
            "bold": true
          },
          {
            "text": " to visit ",
            "bold": false
          },
          {
            "text": "Chamundeshwari Temple",
            "bold": true
          },
          {
            "text": ", dedicated to the goddess who is believed to have defeated the demon Mahishasura. Enjoy panoramic views over Mysore and stop at the large ",
            "bold": false
          },
          {
            "text": "Nandi Bull",
            "bold": true
          },
          {
            "text": " statue on the way down. The evening is free for leisure or a visit to the local market to sample regional food and browse handicrafts. Return to the hotel for an overnight stay.",
            "bold": false
          }
        ]
      ],
      "note": null
    },
    {
      "day": "29 Day",
      "title": "Mysore – Bangalore (140 km, approximately 3 hours) – Hometown",
      "eta": "(by air)",
      "paras": [
        [
          {
            "text": "After breakfast, check out of the hotel and drive to ",
            "bold": false
          },
          {
            "text": "Bangalore Airport",
            "bold": true
          },
          {
            "text": " for your flight to your hometown. Allow sufficient time for the road journey and airport check-in. On departure, the tour concludes with happy memories.",
            "bold": false
          }
        ]
      ],
      "note": null
    }
  ],

  details: [
    {
      "title": "Tour Pricing Details",
      "text": "The final cost of a customized tour varies depending on accommodation choices, travel period, number of travellers and individual preferences. While an exact quotation can be provided upon finalization of details, the following indicative price range will help you plan your holiday (based on a minimum of two persons sharing a double room together).",
      "items": [
        [
          {
            "text": "3-Star:",
            "bold": true
          },
          {
            "text": " $85–$100 per person per day",
            "bold": false
          }
        ],
        [
          {
            "text": "4-Star:",
            "bold": true
          },
          {
            "text": " $110–$170 per person per day",
            "bold": false
          }
        ],
        [
          {
            "text": "5-Star:",
            "bold": true
          },
          {
            "text": " $175–$250+ per person per day",
            "bold": false
          }
        ]
      ]
    },
    {
      "title": "This Tour Includes",
      "text": "",
      "items": [
        [
          {
            "text": "Hotel accommodation on twin sharing with buffet breakfast.",
            "bold": false
          }
        ],
        [
          {
            "text": "Air-conditioned car with an English-speaking driver throughout the tour for transfers, sightseeing and intercity travel.",
            "bold": false
          }
        ],
        [
          {
            "text": "Car services from airport pickup through departure.",
            "bold": false
          }
        ],
        [
          {
            "text": "Driver allowance, including food and stay.",
            "bold": false
          }
        ],
        [
          {
            "text": "Toll taxes, entry permits and parking charges.",
            "bold": false
          }
        ],
        [
          {
            "text": "English/multilingual guide during sightseeing.",
            "bold": false
          }
        ],
        [
          {
            "text": "Elephant ride ascending Amber Fort in Jaipur.",
            "bold": false
          }
        ],
        [
          {
            "text": "One dinner at Chokhi Dhani, a village-themed resort with folk dances and puppet shows.",
            "bold": false
          }
        ],
        [
          {
            "text": "Delhi, Jaipur and Khajuraho Light and Sound Show tickets.",
            "bold": false
          }
        ],
        [
          {
            "text": "Boat ride on the Ganges in Varanasi.",
            "bold": false
          }
        ]
      ]
    },
    {
      "title": "This Tour Excludes",
      "text": "",
      "items": [
        [
          {
            "text": "Government tax of 5% on the tour package.",
            "bold": false
          }
        ],
        [
          {
            "text": "International or domestic air/train fares.",
            "bold": false
          }
        ],
        [
          {
            "text": "Monument and sightseeing entry charges.",
            "bold": false
          }
        ],
        [
          {
            "text": "Personal expenses such as laundry, tips, phone calls, insurance, portage, soft/hard drinks and meals unless specified.",
            "bold": false
          }
        ],
        [
          {
            "text": "Anything not mentioned in the inclusions.",
            "bold": false
          }
        ]
      ]
    },
    {
      "title": "Important Notes",
      "text": "",
      "items": [
        [
          {
            "text": "This is a customized private tour, and the itinerary and services can be modified as required.",
            "bold": false
          }
        ],
        [
          {
            "text": "Special-interest tours, conferences, seminars, shopping, national events, fairs and festivals, meetings with local people, safaris, excursions, meal plans and accommodation changes can be arranged at additional cost where applicable.",
            "bold": false
          }
        ],
        [
          {
            "text": "During national ceremonies, major sports events, New Year, Christmas, fairs and festivals, package costs will be calculated accordingly.",
            "bold": false
          }
        ]
      ]
    }
  ],

  enquire: { label: "Enquire Now", href: '/contactus?tour=' + encodeURIComponent("Vision of India Tour") + '#enquiry' }
};
