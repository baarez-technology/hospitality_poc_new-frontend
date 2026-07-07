import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, MapPin } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'San Francisco, CA',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    text: 'The AI-powered pre-check-in was a game-changer! I walked straight to my room and it was exactly what I wanted.',
    date: '2 weeks ago',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Los Angeles, CA',
    avatar: 'https://i.pravatar.cc/150?img=7',
    rating: 5,
    text: 'TERRA Suites combines cutting-edge technology with genuine hospitality. The AI concierge helped us plan our entire trip.',
    date: '1 month ago',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    location: 'Miami, FL',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    text: 'Absolutely stunning property! The modern design and smart room features made this the best hotel experience.',
    date: '3 weeks ago',
  },
  {
    id: 4,
    name: 'David Park',
    location: 'Seattle, WA',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    text: 'The perfect blend of luxury and technology. Every detail was thoughtfully designed. The staff went above and beyond!',
    date: '1 month ago',
  },
  {
    id: 5,
    name: 'Jessica Lee',
    location: 'New York, NY',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    text: 'Exceptional service and beautiful rooms. The seamless check-in process made our arrival stress-free.',
    date: '2 days ago',
  },
  {
    id: 6,
    name: 'Robert Martinez',
    location: 'Chicago, IL',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 5,
    text: 'Outstanding experience from start to finish. The attention to sustainability while maintaining luxury is impressive.',
    date: '1 week ago',
  },
];

export function TestimonialsCarousel() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Guest Reviews
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Hear from travelers who've experienced TERRA Suites
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-neutral-900">
                      {testimonial.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      <span>{testimonial.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                "{testimonial.text}"
              </p>

              {/* Date */}
              <p className="text-xs text-neutral-400">{testimonial.date}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12 border-t border-neutral-200"
        >
          {[
            { number: '4.9', label: 'Average Rating', suffix: '/5' },
            { number: '2,400', label: 'Happy Guests', suffix: '+' },
            { number: '98', label: 'Would Recommend', suffix: '%' },
            { number: '24', label: 'Hour Support', suffix: '/7' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stat.number}<span className="text-2xl">{stat.suffix}</span>
              </div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
