/**
 * Reputation AI Data - Reviews, OTA Stats, Sentiment Trends
 */

// Sample reviews data
export const reviewsData = [
  {
    id: 'REV-001',
    guestName: 'Sarah Johnson',
    platform: 'booking',
    rating: 5,
    date: '2025-11-27',
    sentimentScore: 92,
    category: 'staff',
    comment: 'Absolutely wonderful stay! The staff went above and beyond to make our anniversary special. The room was immaculate and the breakfast was delicious. Will definitely be coming back!',
    highlights: ['Staff excellence', 'Clean room', 'Great breakfast'],
    responded: true,
    response: 'Thank you so much for your kind words, Sarah! We are delighted that our team made your anniversary memorable.',
    respondedAt: '2025-11-27T14:30:00Z'
  },
  {
    id: 'REV-002',
    guestName: 'Michael Chen',
    platform: 'google',
    rating: 4,
    date: '2025-11-26',
    sentimentScore: 75,
    category: 'room',
    comment: 'Great location and comfortable beds. The room was a bit smaller than expected but very clean. Check-in was smooth and efficient.',
    highlights: ['Good location', 'Comfortable beds', 'Clean'],
    responded: true,
    response: 'Thank you for your feedback, Michael! We appreciate your kind words about our location and service.',
    respondedAt: '2025-11-26T16:00:00Z'
  },
  {
    id: 'REV-003',
    guestName: 'Emma Williams',
    platform: 'tripadvisor',
    rating: 2,
    date: '2025-11-25',
    sentimentScore: 28,
    category: 'checkin',
    comment: 'Very disappointed with the check-in process. Had to wait over 45 minutes despite having a reservation. Room was fine once we got there but the first impression was terrible.',
    highlights: ['Long wait', 'Check-in issues'],
    responded: false,
    response: null,
    respondedAt: null
  },
  {
    id: 'REV-004',
    guestName: 'David Martinez',
    platform: 'expedia',
    rating: 5,
    date: '2025-11-25',
    sentimentScore: 95,
    category: 'food',
    comment: 'The restaurant exceeded all expectations! Chef\'s special was incredible. Room service was prompt and the food arrived hot. Best hotel dining experience I\'ve had in years.',
    highlights: ['Excellent food', 'Quick room service', 'Chef special'],
    responded: true,
    response: 'We are thrilled you enjoyed our culinary offerings, David! Our chef will be delighted to hear this.',
    respondedAt: '2025-11-25T10:00:00Z'
  },
  {
    id: 'REV-005',
    guestName: 'Lisa Thompson',
    platform: 'agoda',
    rating: 3,
    date: '2025-11-24',
    sentimentScore: 52,
    category: 'amenities',
    comment: 'Pool was closed for maintenance which was disappointing as it was the main reason we chose this hotel. Staff tried to compensate with spa vouchers which was appreciated.',
    highlights: ['Pool closed', 'Spa vouchers offered'],
    responded: true,
    response: 'We sincerely apologize for the inconvenience, Lisa. Thank you for understanding.',
    respondedAt: '2025-11-24T18:00:00Z'
  },
  {
    id: 'REV-006',
    guestName: 'Robert Anderson',
    platform: 'booking',
    rating: 4,
    date: '2025-11-24',
    sentimentScore: 78,
    category: 'staff',
    comment: 'Friendly staff and great service. The concierge helped us book amazing local restaurants. Only minor issue was the wifi being slow at times.',
    highlights: ['Friendly staff', 'Helpful concierge'],
    responded: false,
    response: null,
    respondedAt: null
  },
  {
    id: 'REV-007',
    guestName: 'Jennifer Lee',
    platform: 'google',
    rating: 1,
    date: '2025-11-23',
    sentimentScore: 15,
    category: 'cleanliness',
    comment: 'Found hair in the bathroom and the sheets looked like they hadn\'t been changed. Asked for a room change but was told hotel was full. Very disappointing for this price point.',
    highlights: ['Cleanliness issues', 'No room change available'],
    responded: true,
    response: 'We are deeply sorry for this experience, Jennifer. This is not our standard and we have addressed this with housekeeping.',
    respondedAt: '2025-11-23T09:00:00Z'
  },
  {
    id: 'REV-008',
    guestName: 'James Wilson',
    platform: 'tripadvisor',
    rating: 5,
    date: '2025-11-22',
    sentimentScore: 88,
    category: 'room',
    comment: 'Stunning suite with ocean view! The upgrade was a pleasant surprise. Bed was incredibly comfortable and the bathroom amenities were top-notch.',
    highlights: ['Ocean view', 'Comfortable bed', 'Great amenities'],
    responded: true,
    response: 'Thank you for the wonderful review, James! We\'re glad the upgrade made your stay special.',
    respondedAt: '2025-11-22T12:00:00Z'
  },
  {
    id: 'REV-009',
    guestName: 'Amanda Garcia',
    platform: 'expedia',
    rating: 4,
    date: '2025-11-22',
    sentimentScore: 72,
    category: 'pricing',
    comment: 'Good value for money. The breakfast buffet was extensive and included in the rate. Parking was expensive though at \u20B93,300/night.',
    highlights: ['Good value', 'Great breakfast', 'Expensive parking'],
    responded: false,
    response: null,
    respondedAt: null
  },
  {
    id: 'REV-010',
    guestName: 'Christopher Brown',
    platform: 'booking',
    rating: 3,
    date: '2025-11-21',
    sentimentScore: 45,
    category: 'checkin',
    comment: 'Room wasn\'t ready at 3pm check-in time. Had to wait an hour. Front desk staff were apologetic and offered a drink voucher. Room itself was nice once we got in.',
    highlights: ['Late room', 'Staff apologetic'],
    responded: true,
    response: 'We apologize for the delay, Christopher. We\'re working to improve our room turnaround times.',
    respondedAt: '2025-11-21T17:00:00Z'
  },
  {
    id: 'REV-011',
    guestName: 'Nicole Davis',
    platform: 'agoda',
    rating: 5,
    date: '2025-11-20',
    sentimentScore: 90,
    category: 'staff',
    comment: 'Maria at the front desk was exceptional! She arranged a surprise birthday cake for my husband and even upgraded our room. This kind of service is rare these days.',
    highlights: ['Exceptional service', 'Birthday surprise', 'Room upgrade'],
    responded: true,
    response: 'Maria will be thrilled to hear this, Nicole! Thank you for recognizing her efforts.',
    respondedAt: '2025-11-20T11:00:00Z'
  },
  {
    id: 'REV-012',
    guestName: 'Kevin Taylor',
    platform: 'google',
    rating: 2,
    date: '2025-11-20',
    sentimentScore: 32,
    category: 'amenities',
    comment: 'Gym equipment was outdated and the sauna was out of order. For a 4-star hotel, I expected better facilities. Location was good though.',
    highlights: ['Outdated gym', 'Sauna broken', 'Good location'],
    responded: false,
    response: null,
    respondedAt: null
  },
  {
    id: 'REV-013',
    guestName: 'Rachel Moore',
    platform: 'tripadvisor',
    rating: 4,
    date: '2025-11-19',
    sentimentScore: 80,
    category: 'food',
    comment: 'Loved the rooftop bar! Great cocktails and amazing city views. The appetizers were delicious too. Only wish they stayed open later.',
    highlights: ['Great cocktails', 'City views', 'Delicious appetizers'],
    responded: true,
    response: 'Thank you for enjoying our rooftop bar, Rachel! We\'ll pass along your feedback about hours.',
    respondedAt: '2025-11-19T14:00:00Z'
  },
  {
    id: 'REV-014',
    guestName: 'Steven White',
    platform: 'expedia',
    rating: 4,
    date: '2025-11-18',
    sentimentScore: 76,
    category: 'room',
    comment: 'Spacious room with a comfortable work desk - perfect for business travel. Fast wifi and good coffee machine in the room. Would stay again.',
    highlights: ['Spacious room', 'Good for business', 'Fast wifi'],
    responded: false,
    response: null,
    respondedAt: null
  },
  {
    id: 'REV-015',
    guestName: 'Michelle Harris',
    platform: 'booking',
    rating: 5,
    date: '2025-11-17',
    sentimentScore: 94,
    category: 'cleanliness',
    comment: 'Immaculately clean from the moment we walked in. You can tell the housekeeping team takes pride in their work. Fresh flowers were a lovely touch!',
    highlights: ['Immaculate cleanliness', 'Great housekeeping', 'Fresh flowers'],
    responded: true,
    response: 'Thank you, Michelle! Our housekeeping team will be so happy to read this.',
    respondedAt: '2025-11-17T09:30:00Z'
  },
  {
    id: 'REV-016',
    guestName: 'Daniel Clark',
    platform: 'agoda',
    rating: 3,
    date: '2025-11-16',
    sentimentScore: 55,
    category: 'pricing',
    comment: 'Hotel was nice but felt overpriced for what you get. Similar hotels in the area offer more amenities for less. Might not return unless there\'s a deal.',
    highlights: ['Overpriced', 'Limited amenities'],
    responded: true,
    response: 'Thank you for your honest feedback, Daniel. We\'re reviewing our pricing to ensure competitive value.',
    respondedAt: '2025-11-16T16:00:00Z'
  },
  {
    id: 'REV-017',
    guestName: 'Ashley Robinson',
    platform: 'google',
    rating: 5,
    date: '2025-11-15',
    sentimentScore: 91,
    category: 'staff',
    comment: 'Best customer service I\'ve experienced! When I mentioned I wasn\'t feeling well, they sent up soup and tea without me even asking. So thoughtful!',
    highlights: ['Exceptional service', 'Thoughtful gestures'],
    responded: true,
    response: 'We hope you\'re feeling better, Ashley! Taking care of our guests is our priority.',
    respondedAt: '2025-11-15T11:00:00Z'
  },
  {
    id: 'REV-018',
    guestName: 'Brian Lewis',
    platform: 'tripadvisor',
    rating: 2,
    date: '2025-11-14',
    sentimentScore: 25,
    category: 'room',
    comment: 'AC was extremely noisy and kept us up all night. Reported it but maintenance couldn\'t fix it. Should have been offered a room change.',
    highlights: ['Noisy AC', 'Maintenance issues', 'Poor resolution'],
    responded: false,
    response: null,
    respondedAt: null
  },
  {
    id: 'REV-019',
    guestName: 'Kimberly Walker',
    platform: 'booking',
    rating: 4,
    date: '2025-11-13',
    sentimentScore: 82,
    category: 'food',
    comment: 'Breakfast spread was impressive with lots of healthy options. The fresh-squeezed orange juice was amazing! Dinner at the restaurant was good too.',
    highlights: ['Great breakfast', 'Healthy options', 'Fresh juice'],
    responded: true,
    response: 'We\'re so glad you enjoyed our breakfast, Kimberly! Our kitchen team sources local ingredients daily.',
    respondedAt: '2025-11-13T10:00:00Z'
  },
  {
    id: 'REV-020',
    guestName: 'Matthew Young',
    platform: 'expedia',
    rating: 4,
    date: '2025-11-12',
    sentimentScore: 70,
    category: 'checkin',
    comment: 'Online check-in worked great and we went straight to our room. Key card had issues though and had to go back to the desk twice.',
    highlights: ['Easy online check-in', 'Key card issues'],
    responded: false,
    response: null,
    respondedAt: null
  }
];

// OTA Platform stats
export const otaStatsData = [
  {
    platform: 'booking',
    rating: 4.6,
    reviewCount: 1247,
    trend: 0.1,
    lastUpdated: '2025-11-27'
  },
  {
    platform: 'expedia',
    rating: 4.4,
    reviewCount: 892,
    trend: -0.2,
    lastUpdated: '2025-11-27'
  },
  {
    platform: 'agoda',
    rating: 4.5,
    reviewCount: 654,
    trend: 0.0,
    lastUpdated: '2025-11-27'
  },
  {
    platform: 'google',
    rating: 4.3,
    reviewCount: 2156,
    trend: 0.1,
    lastUpdated: '2025-11-27'
  },
  {
    platform: 'tripadvisor',
    rating: 4.2,
    reviewCount: 1834,
    trend: -0.1,
    lastUpdated: '2025-11-27'
  }
];

// Sentiment trend data (last 12 weeks)
export const sentimentTrendData = [
  { week: 'W1', sentiment: 72, rating: 4.2 },
  { week: 'W2', sentiment: 75, rating: 4.3 },
  { week: 'W3', sentiment: 71, rating: 4.1 },
  { week: 'W4', sentiment: 78, rating: 4.4 },
  { week: 'W5', sentiment: 74, rating: 4.3 },
  { week: 'W6', sentiment: 80, rating: 4.5 },
  { week: 'W7', sentiment: 76, rating: 4.3 },
  { week: 'W8', sentiment: 82, rating: 4.6 },
  { week: 'W9', sentiment: 79, rating: 4.4 },
  { week: 'W10', sentiment: 85, rating: 4.7 },
  { week: 'W11', sentiment: 81, rating: 4.5 },
  { week: 'W12', sentiment: 83, rating: 4.6 }
];

// Review sources configuration
export const reviewSourcesConfig = [
  {
    platform: 'booking',
    enabled: true,
    apiKey: '',
    importFrequency: 'daily',
    lastSync: '2025-11-27T08:00:00Z'
  },
  {
    platform: 'expedia',
    enabled: true,
    apiKey: '',
    importFrequency: 'daily',
    lastSync: '2025-11-27T08:00:00Z'
  },
  {
    platform: 'agoda',
    enabled: true,
    apiKey: '',
    importFrequency: 'weekly',
    lastSync: '2025-11-25T08:00:00Z'
  },
  {
    platform: 'google',
    enabled: true,
    apiKey: '',
    importFrequency: 'daily',
    lastSync: '2025-11-27T08:00:00Z'
  },
  {
    platform: 'tripadvisor',
    enabled: false,
    apiKey: '',
    importFrequency: 'weekly',
    lastSync: null
  }
];
