import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function NewsletterSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section ref={ref} className="py-24 sm:py-28 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-10 sm:p-12"
          >
            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                Stay Updated
              </h2>
              <p className="text-lg text-neutral-600">
                Subscribe to get special offers, travel tips, and exclusive deals
              </p>
            </div>

            {/* Form */}
            {!isSubscribed ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 rounded-xl bg-neutral-50 border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-base font-medium placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-3 bg-green-50 border-2 border-green-200 rounded-xl px-8 py-5"
              >
                <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2} />
                <p className="text-green-800 font-semibold text-lg">Thanks for subscribing!</p>
              </motion.div>
            )}

            {/* Privacy Note */}
            <p className="text-neutral-500 text-sm mt-6 text-center font-medium">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
