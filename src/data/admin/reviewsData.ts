/**
 * Reviews Data
 * Realistic review data from multiple platforms
 */

const reviewTemplates = {
  positive: [
    { text: "Absolutely stunning hotel! The staff went above and beyond to make our anniversary special. The room was immaculate and the view was breathtaking.", keywords: ["stunning", "staff", "anniversary", "immaculate", "view"] },
    { text: "Best hotel experience we've ever had. The concierge team was incredibly helpful with restaurant recommendations. Will definitely return!", keywords: ["best", "experience", "concierge", "helpful", "return"] },
    { text: "The attention to detail is exceptional. From the welcome amenities to the turndown service, everything was perfect. Highly recommend!", keywords: ["attention", "detail", "amenities", "service", "perfect"] },
    { text: "Beautiful property with amazing facilities. The spa was world-class and the breakfast buffet had incredible variety. Five stars!", keywords: ["beautiful", "facilities", "spa", "breakfast", "variety"] },
    { text: "Exceeded all expectations! The rooms are luxurious, staff is friendly, and location is perfect for exploring the city.", keywords: ["exceeded", "luxurious", "friendly", "location", "perfect"] },
    { text: "Outstanding service from check-in to check-out. The room was spotless and the bed was incredibly comfortable. Thank you!", keywords: ["outstanding", "service", "spotless", "comfortable", "thank"] },
    { text: "Fantastic stay! The rooftop bar has stunning views and the cocktails were excellent. Staff was attentive without being intrusive.", keywords: ["fantastic", "rooftop", "views", "cocktails", "attentive"] },
    { text: "This hotel is a gem! The decor is elegant, the amenities are top-notch, and the location can't be beat. Worth every penny.", keywords: ["gem", "elegant", "amenities", "location", "worth"] },
    { text: "Impeccable service and beautiful rooms. The housekeeping staff did an amazing job. We felt truly pampered during our stay.", keywords: ["impeccable", "beautiful", "housekeeping", "amazing", "pampered"] },
    { text: "Wonderful experience! The pool area is gorgeous and the gym is well-equipped. Staff made us feel like VIPs.", keywords: ["wonderful", "pool", "gorgeous", "gym", "VIPs"] }
  ],
  negative: [
    { text: "Disappointed with the room condition. The carpet was stained and the bathroom needed updating. Not worth the price.", keywords: ["disappointed", "stained", "bathroom", "updating", "price"] },
    { text: "Terrible experience. Check-in took over an hour and the staff was unhelpful. Room was not ready at 3 PM as promised.", keywords: ["terrible", "check-in", "unhelpful", "not ready", "promised"] },
    { text: "Overpriced for what you get. The room was tiny, parking was expensive, and breakfast quality was poor. Expected more.", keywords: ["overpriced", "tiny", "parking", "poor", "expected"] },
    { text: "Very noisy location. Could hear traffic all night and the walls are paper-thin. Couldn't get proper rest.", keywords: ["noisy", "traffic", "walls", "thin", "rest"] },
    { text: "Poor customer service. Front desk was rude when we asked about late checkout. Won't be returning.", keywords: ["poor", "rude", "checkout", "returning"] },
    { text: "Room was not clean when we arrived. Found hair in the bathroom and dust on surfaces. Had to request re-cleaning.", keywords: ["not clean", "hair", "bathroom", "dust", "re-cleaning"] },
    { text: "The photos online are very misleading. The actual room was much smaller and darker than advertised.", keywords: ["misleading", "photos", "smaller", "darker", "advertised"] },
    { text: "Air conditioning didn't work properly and it took maintenance 2 days to fix it. Uncomfortable stay in summer heat.", keywords: ["air conditioning", "maintenance", "fix", "uncomfortable", "heat"] }
  ],
  neutral: [
    { text: "Decent hotel for the price. Nothing spectacular but it served its purpose for a business trip. Clean and functional.", keywords: ["decent", "price", "business", "clean", "functional"] },
    { text: "Average experience. The location is convenient but the room was basic. Good for a short stay.", keywords: ["average", "convenient", "basic", "short stay"] },
    { text: "Okay hotel. Some nice features but also some areas that need improvement. Would consider staying again.", keywords: ["okay", "nice features", "improvement", "consider"] },
    { text: "Mixed feelings. Great location and helpful staff, but the room needs renovation. Fair value overall.", keywords: ["mixed", "location", "staff", "renovation", "value"] }
  ]
};

const platforms = ["Google", "Booking.com", "TripAdvisor", "Expedia", "Yelp"];
const guestNames = [
  "Sarah Johnson", "Michael Chen", "Emma Williams", "David Martinez", "Lisa Anderson",
  "James Taylor", "Maria Garcia", "Robert Wilson", "Jennifer Lee", "William Brown",
  "Patricia Davis", "John Rodriguez", "Linda Miller", "Richard Moore", "Barbara Jackson",
  "Thomas White", "Nancy Harris", "Christopher Martin", "Karen Thompson", "Daniel Clark",
  "Jessica Lewis", "Matthew Walker", "Ashley Hall", "Andrew Allen", "Sarah Young",
  "Joshua King", "Amanda Wright", "Ryan Lopez", "Melissa Hill", "Justin Scott"
];

const generateReviews = () => {
  const reviews = [];
  const today = new Date();

  // Generate 250 reviews
  for (let i = 0; i < 250; i++) {
    // Determine sentiment distribution (60% positive, 20% negative, 20% neutral)
    const rand = Math.random();
    let sentiment, rating, template;

    if (rand < 0.6) {
      sentiment = 'Positive';
      rating = Math.random() < 0.7 ? 5 : 4;
      template = reviewTemplates.positive[Math.floor(Math.random() * reviewTemplates.positive.length)];
    } else if (rand < 0.8) {
      sentiment = 'Negative';
      rating = Math.random() < 0.6 ? 1 : 2;
      template = reviewTemplates.negative[Math.floor(Math.random() * reviewTemplates.negative.length)];
    } else {
      sentiment = 'Neutral';
      rating = 3;
      template = reviewTemplates.neutral[Math.floor(Math.random() * reviewTemplates.neutral.length)];
    }

    // Random date within last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const reviewDate = new Date(today);
    reviewDate.setDate(today.getDate() - daysAgo);

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const guestName = guestNames[Math.floor(Math.random() * guestNames.length)];

    // Some reviews have replies
    const hasReply = Math.random() < 0.4; // 40% have replies

    reviews.push({
      id: i + 1,
      guestName,
      platform,
      rating,
      sentiment,
      reviewText: template.text,
      keywords: template.keywords,
      date: reviewDate.toISOString().split('T')[0],
      verified: Math.random() < 0.8, // 80% verified
      stayDate: new Date(reviewDate.getTime() - (7 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hasReply,
      reply: hasReply ? {
        text: "Thank you for your review! We appreciate your feedback and look forward to welcoming you back soon.",
        date: new Date(reviewDate.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responder: "Hotel Manager"
      } : null,
      helpful: Math.floor(Math.random() * 50)
    });
  }

  // Sort by date (newest first)
  return reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const reviewsData = generateReviews();

// Summary statistics
export const reviewsSummary = {
  totalReviews: reviewsData.length,
  averageRating: (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1),
  positiveCount: reviewsData.filter(r => r.sentiment === 'Positive').length,
  negativeCount: reviewsData.filter(r => r.sentiment === 'Negative').length,
  neutralCount: reviewsData.filter(r => r.sentiment === 'Neutral').length,
  responseRate: ((reviewsData.filter(r => r.hasReply).length / reviewsData.length) * 100).toFixed(0),
  verifiedRate: ((reviewsData.filter(r => r.verified).length / reviewsData.length) * 100).toFixed(0),
  recentTrend: '+5.2%', // vs last period
  ratingDistribution: {
    5: reviewsData.filter(r => r.rating === 5).length,
    4: reviewsData.filter(r => r.rating === 4).length,
    3: reviewsData.filter(r => r.rating === 3).length,
    2: reviewsData.filter(r => r.rating === 2).length,
    1: reviewsData.filter(r => r.rating === 1).length
  }
};
