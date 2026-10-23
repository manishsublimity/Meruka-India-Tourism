// India Travel Guide hub (/guide), 23 Oct 2026 — content from the client's reference layout (Anshuman,
// meruka-india-testing.netlify.app/guide). Links point to this site's own pages; tour prices come from the tour data.
module.exports = {
  glance: [
    {
      title: "Arriving",
      rows: [
        [
          "Visa",
          "e-Visa for eligible nationalities",
          "https://indianvisaonline.gov.in/evisa/"
        ],
        [
          "Capital",
          "New Delhi"
        ],
        [
          "Time zone",
          "Indian Standard Time (UTC +5:30), one zone nationwide"
        ],
        [
          "Languages",
          "22 scheduled languages; Hindi and English widely used"
        ]
      ]
    },
    {
      title: "Money & power",
      rows: [
        [
          "Currency",
          "Indian Rupee (INR · ₹)"
        ],
        [
          "Cards & cash",
          "Cards and ATMs are common in cities; carry small notes elsewhere"
        ],
        [
          "Tipping",
          "Around 5–10% in restaurants if no service charge is added"
        ],
        [
          "Electricity",
          "230V · 50Hz · plug types C, D and M"
        ]
      ]
    },
    {
      title: "Safety & contact",
      rows: [
        [
          "Emergency",
          "Dial 112 for police, ambulance and fire"
        ],
        [
          "Tourist helpline",
          "1363 (Ministry of Tourism, multilingual)"
        ],
        [
          "Calling code",
          "+91"
        ],
        [
          "Road rules",
          "Traffic drives on the left"
        ]
      ]
    }
  ],
  seasons: [
    {
      name: "Autumn & winter",
      dates: "October – March",
      line: "Clear skies and comfortable days: the easiest window for classic routes, and the busiest.",
      tag: "Most popular",
      bestFor: [
        "Jaipur",
        "Agra",
        "Varanasi",
        "Kerala Backwaters",
        "Goa",
        "Kutch"
      ],
      weather: [
        [
          "North",
          "Cool days and cold nights; fog is common in Dec and Jan."
        ],
        [
          "South",
          "Warm and dry, ideal for backwaters, beaches and temples."
        ],
        [
          "East",
          "Mild and sunny in Kolkata and Odisha; crisp air in Sikkim."
        ],
        [
          "West",
          "Pleasant and dry. Best for Goa, Kutch and the Ajanta and Ellora caves."
        ]
      ]
    },
    {
      name: "Summer",
      dates: "April – May",
      line: "The plains get hot, so head for the hills. Hill stations stay cool and Ladakh starts to open.",
      tag: "",
      bestFor: [
        "Shimla",
        "Manali",
        "Darjeeling",
        "Munnar",
        "Sikkim",
        "Ladakh (late May)"
      ],
      weather: [
        [
          "North",
          "Very hot in the plains. The Himalaya is at its best."
        ],
        [
          "South",
          "Hot and humid on the plains. Munnar and Ooty stay cool."
        ],
        [
          "East",
          "Darjeeling and Sikkim are clear and in bloom from March to May."
        ],
        [
          "West",
          "Hot and dry inland, humid on the coast."
        ]
      ]
    },
    {
      name: "Monsoon",
      dates: "June – September",
      line: "Green landscapes, waterfalls, fewer crowds and better hotel rates. Rain varies a lot by region.",
      tag: "Lowest prices",
      bestFor: [
        "Ladakh",
        "Kerala Ayurveda",
        "Munnar",
        "Coorg",
        "Meghalaya",
        "Valley of Flowers"
      ],
      weather: [
        [
          "North",
          "Warm and humid with heavy showers. Ladakh stays dry."
        ],
        [
          "South",
          "Lush and green with heavy coastal rain. Kerala's Ayurveda season."
        ],
        [
          "East",
          "Very heavy rain, especially in the North-East. Many parks close."
        ],
        [
          "West",
          "Heavy rain along the coast; most Goa beach shacks are shut."
        ]
      ]
    }
  ],
  goodToKnow: [
    [
      "Sweet spot",
      "Oct – Nov. Clear skies before the winter peak. Dec – Jan brings fog in the north and real cold in the Himalaya."
    ],
    [
      "Peak season",
      "Dec – Jan. Book early; prices rise around Christmas and New Year."
    ],
    [
      "Summer heat",
      "Sightsee early or late in the day. Check mountain-pass opening dates before the high Himalaya."
    ],
    [
      "Monsoon travel",
      "Heavy rain can disrupt road trips in the hills and on the coast. Ladakh stays comparatively dry."
    ],
    [
      "Festivals",
      "Dates follow the lunar calendar. Check before you fix your dates."
    ],
    [
      "Wildlife parks",
      "Most tiger reserves close in the monsoon. Best sightings Nov – Apr."
    ]
  ],
  topics: [
    {
      title: "Travelers Guide",
      img: "/photos/guide-travelers.webp",
      items: [
        {
          name: "Geography",
          href: "/geography",
          line: "From the Himalaya to the tropical south: land, rivers and regions."
        },
        {
          name: "History",
          href: "/history",
          line: "Indus Valley cities to the Mughals, the Raj and independence."
        },
        {
          name: "Weather",
          href: "/weather",
          line: "Seasons, monsoon and the best months for each region."
        },
        {
          name: "Communication",
          href: "/communication",
          line: "Languages, mobile SIMs and staying online."
        },
        {
          name: "Shopping",
          href: "/shopping",
          line: "Textiles, handicrafts and jewellery, and where to buy them."
        },
        {
          name: "Music And Dance",
          href: "/music-dance",
          line: "Classical, folk and film music: what to see and hear."
        },
        {
          name: "Traditions And Customs",
          href: "/traditions_and_customs",
          line: "Greetings, dress and manners that matter on the road."
        },
        {
          name: "Art",
          href: "/art",
          line: "Miniature paintings, temple sculpture and living crafts."
        },
        {
          name: "Cuisine",
          href: "/cuisine",
          line: "Regional dishes, vegetarian traditions and eating safely."
        }
      ]
    },
    {
      title: "Attractions of India",
      img: "/photos/guide-attractions.webp",
      items: [
        {
          name: "Ayurveda Tourism",
          href: "/ayurveda",
          line: "Traditional healing and wellness retreats, strongest in Kerala."
        },
        {
          name: "Yoga Tourism",
          href: "/yoga",
          line: "Ashrams and retreats where yoga began."
        },
        {
          name: "Pilgrimage Tourism",
          href: "/pilgrimage",
          line: "Sacred rivers, temples and holy cities across faiths."
        },
        {
          name: "Wildlife Tourism",
          href: "/wildlife",
          line: "Tigers, rhinos, elephants and birds in the national parks."
        },
        {
          name: "Buddha Tourism",
          href: "/buddha",
          line: "The Buddhist circuit, from Bodh Gaya to Himalayan monasteries."
        },
        {
          name: "Beaches Tourism",
          href: "/beaches",
          line: "Goa, Kerala and the islands: sand, palms and seafood."
        },
        {
          name: "Hill Stations Tourism",
          href: "/Hillstations",
          line: "Cool escapes in the Himalaya and the Western Ghats."
        },
        {
          name: "Adventure Tourism",
          href: "/Adventures",
          line: "Trekking, rafting, skiing and safaris."
        },
        {
          name: "Fairs And Festivals",
          href: "/Fairs-Festivals",
          line: "Holi, Diwali and other celebrations worth timing a trip for."
        }
      ]
    },
    {
      title: "Travel Tools",
      img: "/photos/travel-tools-hd.webp",
      items: [
        {
          name: "Phone Codes",
          href: "/phone_codes",
          line: "Country and city dialling codes."
        },
        {
          name: "Maps",
          href: "/maps",
          line: "Maps of India and its states to plan the route."
        },
        {
          name: "Indian Embassies",
          href: "/indian_embassies",
          line: "Embassy and consulate contacts around the world."
        },
        {
          name: "Visa Information",
          href: "/visa_information",
          line: "e-Visa types, documents and how early to apply."
        },
        {
          name: "Traveler's Guide",
          href: "/travelers_guide",
          line: "Practical tips on money, health and getting around."
        },
        {
          name: "Other Guidelines",
          href: "/travelers-guidlines-information",
          line: "More rules and advice for your trip."
        }
      ]
    }
  ],
  regions: [
    {
      name: "North India",
      tagline: "Mughals, forts & the Ganges",
      href: "/north_india_tour",
      img: "/photos/golden-temple-amritsar.webp",
      bestTime: "October – March",
      weather: "Cool winters, hot summers, humid monsoon. Ladakh is best from June to September.",
      festivals: [
        [
          "Jan",
          "Lohri and Makar Sankranti"
        ],
        [
          "Jan",
          "Jaipur Literature Festival"
        ],
        [
          "Feb",
          "Jaisalmer Desert Festival"
        ],
        [
          "Mar",
          "Holi; Hola Mohalla in Punjab"
        ],
        [
          "Apr",
          "Baisakhi, Punjab"
        ],
        [
          "Jun–Jul",
          "Hemis Festival, Ladakh"
        ],
        [
          "Oct",
          "Navratri and Dussehra"
        ],
        [
          "Oct–Nov",
          "Pushkar Camel Fair; Diwali"
        ]
      ],
      sights: [
        {
          name: "Taj Mahal",
          place: "Agra",
          href: "/Uttar-Pradesh"
        },
        {
          name: "Red Fort",
          place: "Delhi",
          href: "/delhi"
        },
        {
          name: "Qutub Minar",
          place: "Delhi",
          href: "/delhi"
        },
        {
          name: "Amber Fort",
          place: "Jaipur",
          href: "/rajasthan_jaipur"
        },
        {
          name: "Jaisalmer Fort",
          place: "Jaisalmer",
          href: "/rajasthan_jaisalmer"
        },
        {
          name: "City Palace",
          place: "Udaipur",
          href: "/rajasthan_udaipur"
        },
        {
          name: "Mehrangarh Fort",
          place: "Jodhpur",
          href: ""
        },
        {
          name: "Golden Temple",
          place: "Amritsar",
          href: ""
        },
        {
          name: "Varanasi Ghats",
          place: "Varanasi",
          href: "/Uttar-Pradesh"
        },
        {
          name: "Khajuraho Temples",
          place: "Madhya Pradesh",
          href: "/khajuraho_city_tour_travel"
        },
        {
          name: "Ranthambore",
          place: "Rajasthan",
          href: ""
        },
        {
          name: "Rishikesh",
          place: "Uttarakhand",
          href: ""
        },
        {
          name: "Shimla & Manali",
          place: "Himachal Pradesh",
          href: "/Hillstations"
        },
        {
          name: "Leh & Ladakh",
          place: "Ladakh",
          href: "/lehladakh_himalaya_travel"
        }
      ],
      states: [
        {
          name: "Rajasthan",
          href: "",
          line: "Forts, palaces and desert camps",
          cities: [
            {
              name: "Jaipur",
              href: "/rajasthan_jaipur"
            },
            {
              name: "Udaipur",
              href: "/rajasthan_udaipur"
            },
            {
              name: "Jodhpur",
              href: ""
            },
            {
              name: "Jaisalmer",
              href: "/rajasthan_jaisalmer"
            },
            {
              name: "Pushkar",
              href: ""
            }
          ]
        },
        {
          name: "Uttar Pradesh",
          href: "/Uttar-Pradesh",
          line: "Mughal Agra and sacred Varanasi",
          cities: [
            {
              name: "Agra",
              href: "/Uttar-Pradesh"
            },
            {
              name: "Varanasi",
              href: "/Uttar-Pradesh"
            },
            {
              name: "Lucknow",
              href: ""
            }
          ]
        },
        {
          name: "Delhi",
          href: "/delhi",
          line: "The capital, from Mughal to colonial",
          cities: []
        },
        {
          name: "Punjab",
          href: "",
          line: "Sikh heritage and Punjabi food",
          cities: [
            {
              name: "Amritsar",
              href: ""
            }
          ]
        },
        {
          name: "Himachal & Uttarakhand",
          href: "/Hillstations",
          line: "Hill stations, yoga and treks",
          cities: [
            {
              name: "Shimla",
              href: ""
            },
            {
              name: "Manali",
              href: ""
            },
            {
              name: "Rishikesh",
              href: ""
            },
            {
              name: "Haridwar",
              href: ""
            }
          ]
        },
        {
          name: "Ladakh",
          href: "/lehladakh_himalaya_travel",
          line: "High passes and monasteries",
          cities: [
            {
              name: "Leh",
              href: "/lehladakh_himalaya_travel"
            }
          ]
        },
        {
          name: "Madhya Pradesh",
          href: "",
          line: "Temple art and tiger reserves",
          cities: [
            {
              name: "Khajuraho",
              href: "/khajuraho_city_tour_travel"
            }
          ]
        }
      ],
      tours: [
        {
          name: "Golden Triangle Tour",
          duration: "6 Nights / 7 Days",
          href: "/golden_triangle_packages"
        },
        {
          name: "Enthralling Rajasthan Tour",
          duration: "10 Nights / 11 Days",
          href: "/rajasthan_holiday_tour_packages"
        },
        {
          name: "Heart of Himalayas Tour",
          duration: "10 Nights / 11 Days",
          href: "/Heart-of-Himalayas-Tour"
        },
        {
          name: "Scenic Himachal Tour",
          duration: "9 Nights / 10 Days",
          href: "/Scenic-Himachal-Tour"
        },
        {
          name: "Splendid North India Tour",
          duration: "11 Nights / 12 Days",
          href: "/itin_rajasthan_northindia_tour"
        }
      ]
    },
    {
      name: "South India",
      tagline: "Backwaters, temples & tea",
      href: "/south_india_tours_tourism",
      img: "/photos/region-south-india.webp",
      bestTime: "October – March",
      weather: "Warm all year. Hot, humid summers; a lush monsoon, Kerala's Ayurveda season.",
      festivals: [
        [
          "Jan",
          "Pongal and Makar Sankranti"
        ],
        [
          "Mar–Apr",
          "Ugadi, Karnataka and Telangana"
        ],
        [
          "Apr–May",
          "Thrissur Pooram, Kerala"
        ],
        [
          "Aug–Sep",
          "Onam, Kerala"
        ],
        [
          "Sep–Oct",
          "Mysuru Dasara, Karnataka"
        ],
        [
          "Oct–Nov",
          "Deepavali"
        ],
        [
          "Nov–Dec",
          "Karthigai Deepam, Tiruvannamalai"
        ],
        [
          "Dec–Jan",
          "Chennai Margazhi Music and Dance Season"
        ]
      ],
      sights: [
        {
          name: "Meenakshi Amman Temple",
          place: "Madurai",
          href: "/Tamil-Nadu"
        },
        {
          name: "Brihadeeswarar Temple",
          place: "Thanjavur",
          href: "/Tamil-Nadu"
        },
        {
          name: "Shore Temple",
          place: "Mahabalipuram",
          href: "/Tamil-Nadu"
        },
        {
          name: "Hampi Monuments",
          place: "Karnataka",
          href: "/Karnataka"
        },
        {
          name: "Mysore Palace",
          place: "Mysuru",
          href: "/Karnataka"
        },
        {
          name: "Charminar",
          place: "Hyderabad",
          href: ""
        },
        {
          name: "Alleppey Backwaters",
          place: "Kerala",
          href: "/Kerala"
        },
        {
          name: "Munnar Tea Hills",
          place: "Kerala",
          href: "/Kerala"
        },
        {
          name: "Fort Kochi",
          place: "Kerala",
          href: "/Kerala"
        },
        {
          name: "Kovalam Beach",
          place: "Kerala",
          href: "/Kerala"
        },
        {
          name: "Periyar Wildlife",
          place: "Thekkady, Kerala",
          href: ""
        },
        {
          name: "Ooty & Coorg",
          place: "Western Ghats",
          href: "/Hillstations"
        },
        {
          name: "Pondicherry",
          place: "Puducherry",
          href: ""
        },
        {
          name: "Kanyakumari",
          place: "Tamil Nadu",
          href: ""
        }
      ],
      states: [
        {
          name: "Kerala",
          href: "/Kerala",
          line: "Backwaters, hills and Ayurveda",
          cities: [
            {
              name: "Kochi",
              href: "/Kerala"
            },
            {
              name: "Alleppey",
              href: "/Kerala"
            },
            {
              name: "Munnar",
              href: "/Kerala"
            },
            {
              name: "Kovalam",
              href: "/Kerala"
            },
            {
              name: "Thekkady",
              href: ""
            }
          ]
        },
        {
          name: "Tamil Nadu",
          href: "/Tamil-Nadu",
          line: "Dravidian temples and a long coast",
          cities: [
            {
              name: "Madurai",
              href: "/Tamil-Nadu"
            },
            {
              name: "Thanjavur",
              href: "/Tamil-Nadu"
            },
            {
              name: "Mahabalipuram",
              href: "/Tamil-Nadu"
            },
            {
              name: "Ooty",
              href: "/Hillstations"
            },
            {
              name: "Kanyakumari",
              href: ""
            }
          ]
        },
        {
          name: "Karnataka",
          href: "/Karnataka",
          line: "Royal Mysuru and ruined Hampi",
          cities: [
            {
              name: "Mysuru",
              href: "/Karnataka"
            },
            {
              name: "Hampi",
              href: "/Karnataka"
            },
            {
              name: "Coorg",
              href: "/Hillstations"
            },
            {
              name: "Gokarna",
              href: ""
            }
          ]
        },
        {
          name: "Telangana",
          href: "",
          line: "Hyderabad, pearls and Charminar",
          cities: [
            {
              name: "Hyderabad",
              href: ""
            }
          ]
        },
        {
          name: "Puducherry",
          href: "",
          line: "A French-colonial seaside quarter",
          cities: [
            {
              name: "Pondicherry",
              href: ""
            }
          ]
        },
        {
          name: "Andaman & Nicobar",
          href: "",
          line: "Diving and white-sand beaches",
          cities: [
            {
              name: "Port Blair",
              href: ""
            },
            {
              name: "Havelock",
              href: ""
            }
          ]
        }
      ],
      tours: [
        {
          name: "Charismatic Kerala Tour",
          duration: "6 Nights / 7 Days",
          href: "/Kerala-Hills-Wildlife-Tour"
        },
        {
          name: "Glimpses of Tamil Nadu Tour",
          duration: "8 Nights / 9 Days",
          href: "/south_india_tamilnadu_tour"
        },
        {
          name: "Golden Triangle of Karnataka and Kerala Tours",
          duration: "10 Nights / 11 Days",
          href: "/itin_southindia_tour"
        },
        {
          name: "South India Nature & Devotional Tour",
          duration: "14 Nights / 15 Days",
          href: "/itin_southindia_nature"
        },
        {
          name: "Incredible South India Tour",
          duration: "23 Nights / 24 Days",
          href: "/south-india-tour-package"
        }
      ]
    },
    {
      name: "East India",
      tagline: "Tribes, tigers & the hills",
      href: "/east_india_tour_tourism",
      img: "/photos/arunachal-losar.webp",
      bestTime: "October – April",
      weather: "Mild, sunny winters. Darjeeling and Sikkim bloom from March to May; the monsoon is very heavy.",
      festivals: [
        [
          "Jan",
          "Gangasagar Mela and Poush Sankranti, Bengal"
        ],
        [
          "Feb–Mar",
          "Losar, Sikkim and Arunachal"
        ],
        [
          "Apr",
          "Bohag Bihu, Assam"
        ],
        [
          "Jul",
          "Rath Yatra, Puri"
        ],
        [
          "Sep–Oct",
          "Durga Puja, Kolkata"
        ],
        [
          "Oct–Nov",
          "Kali Puja and Diwali"
        ],
        [
          "Nov–Dec",
          "Hornbill Festival, Nagaland"
        ]
      ],
      sights: [
        {
          name: "Konark Sun Temple",
          place: "Odisha",
          href: "/Orissa"
        },
        {
          name: "Jagannath Temple",
          place: "Puri",
          href: "/Orissa"
        },
        {
          name: "Lingaraja Temple",
          place: "Bhubaneswar",
          href: "/Orissa"
        },
        {
          name: "Victoria Memorial",
          place: "Kolkata",
          href: "/West-Bengal"
        },
        {
          name: "Bishnupur Temples",
          place: "West Bengal",
          href: "/West-Bengal"
        },
        {
          name: "Darjeeling Tea Hills",
          place: "West Bengal",
          href: "/West-Bengal"
        },
        {
          name: "Rumtek Monastery",
          place: "Sikkim",
          href: "/Sikkim"
        },
        {
          name: "Tawang Monastery",
          place: "Arunachal Pradesh",
          href: ""
        },
        {
          name: "Mahabodhi Temple",
          place: "Bodh Gaya",
          href: ""
        },
        {
          name: "Kaziranga",
          place: "Assam",
          href: "/Assam"
        },
        {
          name: "Majuli Island",
          place: "Assam",
          href: "/Assam"
        },
        {
          name: "Living-Root Bridges",
          place: "Meghalaya",
          href: ""
        },
        {
          name: "Sundarbans",
          place: "West Bengal",
          href: ""
        },
        {
          name: "Chilika Lake",
          place: "Odisha",
          href: ""
        }
      ],
      states: [
        {
          name: "Odisha",
          href: "/Orissa",
          line: "Sun temples and tribal villages",
          cities: [
            {
              name: "Puri",
              href: "/Orissa"
            },
            {
              name: "Bhubaneswar",
              href: "/Orissa"
            },
            {
              name: "Konark",
              href: "/Orissa"
            },
            {
              name: "Chilika",
              href: ""
            }
          ]
        },
        {
          name: "West Bengal",
          href: "/West-Bengal",
          line: "Kolkata, Darjeeling and the Sundarbans",
          cities: [
            {
              name: "Kolkata",
              href: "/West-Bengal"
            },
            {
              name: "Darjeeling",
              href: "/West-Bengal"
            },
            {
              name: "Bishnupur",
              href: "/West-Bengal"
            }
          ]
        },
        {
          name: "Sikkim",
          href: "/Sikkim",
          line: "Monasteries and Kanchenjunga views",
          cities: [
            {
              name: "Gangtok",
              href: "/Sikkim"
            },
            {
              name: "Pelling",
              href: "/Sikkim"
            },
            {
              name: "Rumtek",
              href: "/Sikkim"
            }
          ]
        },
        {
          name: "Assam",
          href: "/Assam",
          line: "Tea estates and one-horned rhinos",
          cities: [
            {
              name: "Kaziranga",
              href: "/Assam"
            },
            {
              name: "Majuli",
              href: "/Assam"
            },
            {
              name: "Guwahati",
              href: "/Assam"
            }
          ]
        },
        {
          name: "Meghalaya",
          href: "",
          line: "Living-root bridges and waterfalls",
          cities: [
            {
              name: "Shillong",
              href: ""
            },
            {
              name: "Cherrapunji",
              href: ""
            }
          ]
        },
        {
          name: "Arunachal Pradesh",
          href: "",
          line: "Remote Buddhist valleys",
          cities: [
            {
              name: "Tawang",
              href: ""
            }
          ]
        },
        {
          name: "Bihar",
          href: "",
          line: "Where the Buddha found enlightenment",
          cities: [
            {
              name: "Bodh Gaya",
              href: ""
            }
          ]
        }
      ],
      tours: [
        {
          name: "Sikkim Mountains and Valley Tour",
          duration: "6 Nights / 7 Days",
          href: "/sikkim_tours_travel"
        },
        {
          name: "Spiritual Sun Temple Tour",
          duration: "7 Nights / 8 Days",
          href: "/spiritual_suntemple_tour"
        },
        {
          name: "Sikkim - Valley of Wonders Tour",
          duration: "11 Nights / 12 Days",
          href: "/Sikkim-India-Tour"
        },
        {
          name: "Glorious Sun Temple with Sundarban Tour",
          duration: "12 Nights / 13 Days",
          href: "/west_bengal_orissa_tours"
        },
        {
          name: "Nagaland and Kaziranga National Park Tour",
          duration: "13 Nights / 14 Days",
          href: "/north_east_tour"
        }
      ]
    },
    {
      name: "West India",
      tagline: "Desert, caves & salt flats",
      href: "/west_india_tour_tourism",
      img: "/photos/goa-beach-palms.webp",
      bestTime: "November – February",
      weather: "Dry, pleasant winters; hot inland summers; heavy coastal monsoon.",
      festivals: [
        [
          "Jan",
          "International Kite Festival and Makar Sankranti, Gujarat"
        ],
        [
          "Feb",
          "Kala Ghoda Arts Festival, Mumbai"
        ],
        [
          "Feb–Mar",
          "Goa Carnival"
        ],
        [
          "Mar",
          "Shigmo, Goa"
        ],
        [
          "Sep",
          "Ganesh Chaturthi, Maharashtra"
        ],
        [
          "Oct",
          "Navratri and Garba, Gujarat"
        ],
        [
          "Oct–Nov",
          "Diwali"
        ],
        [
          "Nov–Mar",
          "Rann Utsav, Kutch"
        ]
      ],
      sights: [
        {
          name: "Ajanta Caves",
          place: "Maharashtra",
          href: "/Maharashtra"
        },
        {
          name: "Ellora Caves",
          place: "Maharashtra",
          href: "/Maharashtra"
        },
        {
          name: "Gateway of India",
          place: "Mumbai",
          href: "/Maharashtra"
        },
        {
          name: "Chhatrapati Shivaji Terminus",
          place: "Mumbai",
          href: "/Maharashtra"
        },
        {
          name: "Elephanta Caves",
          place: "Mumbai",
          href: ""
        },
        {
          name: "Rani ki Vav",
          place: "Patan, Gujarat",
          href: "/Gujarat"
        },
        {
          name: "Modhera Sun Temple",
          place: "Gujarat",
          href: "/Gujarat"
        },
        {
          name: "White Rann",
          place: "Kutch, Gujarat",
          href: "/Gujarat"
        },
        {
          name: "Gir National Park",
          place: "Gujarat",
          href: ""
        },
        {
          name: "Somnath Temple",
          place: "Gujarat",
          href: ""
        },
        {
          name: "Ahmedabad Old City",
          place: "Gujarat",
          href: ""
        },
        {
          name: "Basilica of Bom Jesus",
          place: "Old Goa",
          href: "/Goa"
        },
        {
          name: "Goa Beaches",
          place: "Goa",
          href: "/Goa"
        },
        {
          name: "Diu Fort",
          place: "Diu",
          href: ""
        }
      ],
      states: [
        {
          name: "Maharashtra",
          href: "/Maharashtra",
          line: "Mumbai and the great cave temples",
          cities: [
            {
              name: "Mumbai",
              href: "/Maharashtra"
            },
            {
              name: "Aurangabad",
              href: "/Maharashtra"
            },
            {
              name: "Ajanta",
              href: "/Maharashtra"
            },
            {
              name: "Ellora",
              href: "/Maharashtra"
            },
            {
              name: "Lonavala",
              href: ""
            }
          ]
        },
        {
          name: "Gujarat",
          href: "/Gujarat",
          line: "Salt desert, lions and stepwells",
          cities: [
            {
              name: "Ahmedabad",
              href: ""
            },
            {
              name: "Kutch",
              href: "/Gujarat"
            },
            {
              name: "Gir",
              href: ""
            },
            {
              name: "Patan",
              href: "/Gujarat"
            },
            {
              name: "Somnath",
              href: ""
            }
          ]
        },
        {
          name: "Goa",
          href: "/Goa",
          line: "Beaches, churches and seafood",
          cities: [
            {
              name: "North Goa",
              href: "/Goa"
            },
            {
              name: "South Goa",
              href: "/Goa"
            },
            {
              name: "Old Goa",
              href: "/Goa"
            }
          ]
        },
        {
          name: "Diu",
          href: "",
          line: "Quiet forts and island beaches",
          cities: []
        }
      ],
      tours: [
        {
          name: "Glimpses of Maharashtra Tour",
          duration: "6 Nights / 7 Days",
          href: "/itin_maharashtra_tour"
        },
        {
          name: "Maharashtra with Beaches of Goa",
          duration: "12 Nights / 13 Days",
          href: "/Maharashtra-Goa-Tour"
        },
        {
          name: "Explore Gujarat Tour",
          duration: "12 Nights / 13 Days",
          href: "/Explore-Gujarat-Tour"
        },
        {
          name: "Gujarat Heritage, Wildlife & Great Rann of Kutch Tour",
          duration: "13 Nights / 14 Days",
          href: "/gujarat-rannofkutchtours"
        },
        {
          name: "Maharashtra, Goa & Gujarat Tour",
          duration: "16 Nights / 17 Days",
          href: "/Maharashtra-Goa-Gujarat-Tour"
        }
      ]
    }
  ],
  tips: [
    {
      title: "Money & paperwork",
      items: [
        "ATM's",
        "Foreign Exchange",
        "Cash and Valuables",
        "Banks Timings",
        "Passport",
        "Photographs",
        "Insurance",
        "Student Discount"
      ]
    },
    {
      title: "Health, food & water",
      items: [
        "Food",
        "Water",
        "Toilets",
        "Vaccination"
      ]
    },
    {
      title: "Getting around",
      items: [
        "Car Hire",
        "Public Transport",
        "Ticketing",
        "Maps",
        "Check-out Time",
        "Time",
        "Travel Period",
        "Guide",
        "Sightseeing Places"
      ]
    },
    {
      title: "Safety & local manners",
      items: [
        "Beggars",
        "Bribe",
        "Local Invitation",
        "Single Woman",
        "Smoking",
        "Social Interaction",
        "Language",
        "Photography",
        "Shopping"
      ]
    },
    {
      title: "Temple & cultural etiquette",
      items: [
        "Shoes",
        "Cleanliness",
        "Alcohol",
        "Permission",
        "Dressing",
        "Mosque",
        "Leather",
        "Body Language",
        "Photography",
        "Buddhist Monastery"
      ]
    }
  ]
};
