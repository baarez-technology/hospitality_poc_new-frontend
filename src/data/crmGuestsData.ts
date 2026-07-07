// Comprehensive CRM Guest Data
// Generate 100 realistic guest profiles with full data for segmentation and forecasting

const generateGuests = () => {
  const sources = ['direct', 'booking.com', 'expedia', 'corporate', 'walk-in', 'agoda', 'airbnb'];
  const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Member'];
  const rooms = ['Presidential Suite', 'Executive Suite', 'Deluxe Suite', 'Premium Room', 'Standard Room'];

  const firstNames = ['Alexandra', 'Marcus', 'Sophia', 'Jonathan', 'Victoria', 'David', 'Isabella', 'Robert', 'Amelia', 'Thomas', 'Emma', 'James', 'Olivia', 'William', 'Charlotte', 'Michael', 'Emily', 'Daniel', 'Mia', 'Christopher', 'Sarah', 'Matthew', 'Jennifer', 'Andrew', 'Lisa', 'Joseph', 'Rachel', 'Ryan', 'Amanda', 'Kevin'];
  const lastNames = ['Harrison', 'Chen', 'Rodriguez', 'Blake', 'Laurent', 'Kumar', 'Moretti', 'Sullivan', 'Zhang', 'Fitzgerald', 'Anderson', 'Taylor', 'Wilson', 'Martinez', 'Garcia', 'Miller', 'Davis', 'Brown', 'Johnson', 'Williams', 'Jones', 'Smith', 'Lee', 'Wang', 'Kim', 'Park', 'Singh', 'Patel', 'Cohen', 'Ali'];

  const guests = [];
  const today = new Date();

  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;

    // Generate booking history
    const totalStays = Math.floor(Math.random() * 25) + 1; // 1-25 stays
    const firstVisitDaysAgo = Math.floor(Math.random() * 1095) + 90; // 90-1185 days ago (3 months to 3+ years)
    const lastVisitDaysAgo = Math.floor(Math.random() * 180); // 0-180 days ago

    const firstVisit = new Date(today.getTime() - firstVisitDaysAgo * 24 * 60 * 60 * 1000);
    const lastVisit = new Date(today.getTime() - lastVisitDaysAgo * 24 * 60 * 60 * 1000);

    // Generate spend data
    const avgSpend = 25000 + Math.floor(Math.random() * 125000); // ₹25,000-₹1,50,000 per stay
    const totalSpend = avgSpend * totalStays;

    // Source distribution
    const sourceRand = Math.random();
    const source = sourceRand < 0.25 ? 'direct' :
                   sourceRand < 0.45 ? 'booking.com' :
                   sourceRand < 0.60 ? 'expedia' :
                   sourceRand < 0.75 ? 'corporate' :
                   sourceRand < 0.85 ? 'agoda' :
                   sourceRand < 0.95 ? 'airbnb' : 'walk-in';

    // Sentiment score (0-1)
    const sentimentBase = Math.random();
    const sentimentScore = sentimentBase < 0.1 ? 0.2 + Math.random() * 0.2 : // 10% negative (0.2-0.4)
                           sentimentBase < 0.3 ? 0.4 + Math.random() * 0.2 : // 20% neutral (0.4-0.6)
                           0.6 + Math.random() * 0.4; // 70% positive (0.6-1.0)

    // Negative reviews
    const negativeReviews = sentimentScore < 0.5 ? Math.floor(Math.random() * 3) + 1 :
                            sentimentScore < 0.7 ? (Math.random() < 0.3 ? 1 : 0) : 0;

    // Loyalty tier based on spend and stays
    const tier = totalSpend > 830000 ? 'Platinum' :
                 totalSpend > 415000 ? 'Gold' :
                 totalSpend > 166000 ? 'Silver' :
                 totalStays > 1 ? 'Bronze' : 'Member';

    // Upcoming bookings
    const hasUpcomingBooking = Math.random() < 0.3; // 30% have upcoming
    const upcomingBookings = hasUpcomingBooking ? [{
      checkIn: new Date(today.getTime() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      checkOut: new Date(today.getTime() + (Math.floor(Math.random() * 90) + 3) * 24 * 60 * 60 * 1000),
      roomType: rooms[Math.floor(Math.random() * rooms.length)],
      amount: avgSpend
    }] : [];

    // Complaints
    const hasComplaints = sentimentScore < 0.5 || Math.random() < 0.15;
    const complaints = hasComplaints ? [
      { date: new Date(lastVisit.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), issue: ['room cleanliness', 'noise', 'staff service', 'amenities', 'breakfast quality'][Math.floor(Math.random() * 5)] }
    ] : [];

    guests.push({
      id: `G-${String(i + 1).padStart(4, '0')}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,

      // Stay history
      totalStays,
      firstVisit: firstVisit.toISOString(),
      lastVisit: lastVisit.toISOString(),
      daysSinceLastVisit: lastVisitDaysAgo,

      // Financial
      totalSpend,
      averageSpend: avgSpend,

      // Source & Channel
      source,
      bookingChannel: source === 'direct' ? 'website' : source === 'corporate' ? 'corporate-portal' : 'ota',

      // Satisfaction
      sentimentScore,
      negativeReviews,
      positiveReviews: Math.floor(totalStays * sentimentScore * 0.8),

      // Loyalty
      loyaltyTier: tier,
      loyaltyPoints: Math.floor(totalSpend * 0.5),
      loyaltyMember: totalStays > 1 || totalSpend > 41500,

      // Preferences
      preferredRoom: rooms[Math.floor(Math.random() * rooms.length)],
      tags: totalSpend > 415000 ? ['vip', 'high-value'] :
            source === 'corporate' ? ['corporate', 'business'] :
            totalStays > 5 ? ['frequent', 'loyal'] : ['new'],

      // Activity
      upcomingBookings,
      nextBookingDate: upcomingBookings.length > 0 ? upcomingBookings[0].checkIn : null,

      // Issues
      complaints,
      hasComplaints: complaints.length > 0,

      // Calculated fields
      visitFrequency: totalStays / (firstVisitDaysAgo / 365), // visits per year
      lifespanDays: firstVisitDaysAgo,

      // Notes
      notes: totalSpend > 664000 ? 'VIP guest - provide premium service' :
             complaints.length > 0 ? 'Previous complaints - extra attention needed' :
             totalStays > 10 ? 'Loyal frequent guest' : '',

      // Demographics (random)
      age: 25 + Math.floor(Math.random() * 50),
      country: ['USA', 'UK', 'Canada', 'Australia', 'France', 'Germany', 'Japan', 'Singapore'][Math.floor(Math.random() * 8)]
    });
  }

  return guests;
};

export const crmGuests = generateGuests();

export const guestsSummary = {
  totalGuests: crmGuests.length,
  activeGuests: crmGuests.filter(g => g.daysSinceLastVisit < 180).length,
  newGuests: crmGuests.filter(g => g.totalStays === 1).length,
  returningGuests: crmGuests.filter(g => g.totalStays > 1).length,
  vipGuests: crmGuests.filter(g => g.totalSpend > 415000 || g.totalStays > 8).length,
  atRiskGuests: crmGuests.filter(g => g.sentimentScore < 0.4 || g.daysSinceLastVisit > 180 || g.negativeReviews > 1).length,
  averageLTV: Math.round(crmGuests.reduce((sum, g) => sum + g.totalSpend, 0) / crmGuests.length),
  totalRevenue: crmGuests.reduce((sum, g) => sum + g.totalSpend, 0)
};
