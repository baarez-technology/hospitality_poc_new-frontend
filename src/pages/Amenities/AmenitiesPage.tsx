import { motion } from 'framer-motion';
import {
  Wifi,
  Coffee,
  Dumbbell,
  Car,
  Waves,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  Clock,
  Wind,
  Tv,
  Baby,
  Briefcase,
  Flower2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHotelInfo } from '@/hooks/useHotelInfo';

interface Amenity {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  highlights: string[];
  color: string;
  bgColor: string;
}

const hotelAmenities: Amenity[] = [
  {
    icon: Waves,
    title: 'Swimming Pool',
    description:
      'Relax by our temperature-controlled infinity pool with panoramic views, open from sunrise to sunset.',
    highlights: ['Infinity edge', 'Poolside bar', 'Sun loungers', 'Towel service'],
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
  {
    icon: Flower2,
    title: 'Spa & Wellness',
    description:
      'Rejuvenate your senses with our world-class spa offering a full range of treatments and therapies.',
    highlights: ['Massage therapy', 'Sauna & steam', 'Facial treatments', 'Yoga sessions'],
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    icon: Dumbbell,
    title: 'Fitness Center',
    description:
      'Stay on top of your fitness goals with our state-of-the-art gym, equipped with modern machines and free weights.',
    highlights: ['24/7 access', 'Personal trainer', 'Cardio zone', 'Free weights'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: UtensilsCrossed,
    title: 'Fine Dining',
    description:
      'Experience culinary excellence at our in-house restaurant, featuring international cuisine crafted by award-winning chefs.',
    highlights: ['International cuisine', 'Private dining', 'Rooftop bar', 'Room service'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Wifi,
    title: 'High-Speed WiFi',
    description:
      'Stay connected with complimentary high-speed internet throughout the property, including all rooms and common areas.',
    highlights: ['Complimentary', 'Fiber optic', 'All areas', 'Streaming ready'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Car,
    title: 'Valet Parking',
    description:
      'Enjoy hassle-free arrivals and departures with our complimentary valet parking and secure underground garage.',
    highlights: ['Complimentary valet', 'EV charging', 'Secure garage', '24/7 security'],
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
  {
    icon: Coffee,
    title: 'Lounge & Bar',
    description:
      'Unwind in our stylish lounge with artisan coffee by day and handcrafted cocktails by night.',
    highlights: ['Artisan coffee', 'Craft cocktails', 'Live music', 'Afternoon tea'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Briefcase,
    title: 'Business Center',
    description:
      'Fully equipped business center with private meeting rooms, high-speed printing, and video conferencing facilities.',
    highlights: ['Meeting rooms', 'Printing services', 'Video conferencing', 'Secretarial support'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: ShieldCheck,
    title: '24/7 Concierge',
    description:
      'Our dedicated concierge team is available around the clock to assist with reservations, travel, and special requests.',
    highlights: ['Tour bookings', 'Restaurant reservations', 'Airport transfers', 'Local tips'],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Wind,
    title: 'Climate Control',
    description:
      'Individual climate control in every room, so you can set the perfect temperature for your comfort.',
    highlights: ['In-room control', 'Smart thermostat', 'Air purification', 'Quiet operation'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    icon: Tv,
    title: 'Entertainment',
    description:
      'Enjoy premium in-room entertainment with smart TVs, streaming services, and curated content libraries.',
    highlights: ['55" Smart TV', 'Streaming apps', 'Bluetooth speakers', 'Curated channels'],
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    icon: Baby,
    title: 'Family Friendly',
    description:
      'Traveling with little ones? We offer cribs, babysitting services, a kids club, and child-friendly menus.',
    highlights: ['Kids club', 'Babysitting', 'Cribs available', 'Children\'s menu'],
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

const roomFeatures = [
  'Luxury linens & pillow menu',
  'Nespresso coffee machine',
  'In-room safe',
  'Marble bathroom with rain shower',
  'Plush bathrobes & slippers',
  'Minibar with premium selections',
  'Blackout curtains',
  'USB charging stations',
];

export function AmenitiesPage() {
  const hotelInfo = useHotelInfo();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white border-b border-neutral-100 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100/60 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              World-Class Hospitality
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 mb-4 sm:mb-6">
              Hotel Amenities
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-500 leading-relaxed">
              Discover the exceptional amenities and services that make {hotelInfo.name} your
              home away from home. Every detail curated for your comfort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {hotelAmenities.map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <motion.div
                  key={amenity.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all group"
                >
                  <div
                    className={`w-12 h-12 ${amenity.bgColor} rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${amenity.color}`} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2">{amenity.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                    {amenity.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {amenity.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* In-Room Features */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50 border-t border-b border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-3">
              In Every Room
            </h2>
            <p className="text-neutral-500">
              All of our rooms and suites come with these thoughtful touches as standard.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roomFeatures.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 px-5 py-4"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span className="text-sm font-medium text-neutral-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4">
              Ready to Experience {hotelInfo.name}?
            </h2>
            <p className="text-neutral-500 mb-8">
              Browse our rooms and suites to find the perfect accommodation for your stay.
            </p>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              View Rooms & Suites
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
