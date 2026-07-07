import { motion } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection';
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { Footer } from '@/components/layout/Footer';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Testimonials Carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <TestimonialsCarousel />
      </motion.div>

      {/* Newsletter Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <NewsletterSection />
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  );
};