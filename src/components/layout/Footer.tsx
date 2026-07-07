import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHotelInfo } from '@/hooks/useHotelInfo';

export const Footer = () => {
  const hotelInfo = useHotelInfo();

  const footerLinks = {
    suites: [
      { name: 'All Suites', href: '/rooms' },
      { name: 'Deluxe Suite', href: '/rooms' },
      { name: 'Executive Suite', href: '/rooms' },
      { name: 'Ocean View', href: '/rooms' },
    ],
    services: [
      { name: 'Pre-Check-In', href: '/rooms' },
      { name: 'Amenities', href: '/amenities' },
      { name: 'AI Concierge', href: '/' },
      { name: 'Business Services', href: '/contact' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/contact' },
      { name: 'Press', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/contact' },
    ],
  };

  const socialLinks = [
    hotelInfo.socialMedia.facebook && { icon: Facebook, href: hotelInfo.socialMedia.facebook, label: 'Facebook' },
    hotelInfo.socialMedia.instagram && { icon: Instagram, href: hotelInfo.socialMedia.instagram, label: 'Instagram' },
    hotelInfo.socialMedia.twitter && { icon: Twitter, href: hotelInfo.socialMedia.twitter.startsWith('http') ? hotelInfo.socialMedia.twitter : `https://twitter.com/${hotelInfo.socialMedia.twitter.replace('@', '')}`, label: 'Twitter' },
    hotelInfo.socialMedia.linkedin && { icon: Linkedin, href: hotelInfo.socialMedia.linkedin, label: 'LinkedIn' },
  ].filter(Boolean);

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6">
              {hotelInfo.logo ? (
                <img src={hotelInfo.logo} alt={hotelInfo.name} className="h-10 object-contain" />
              ) : (
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                  {hotelInfo.name}
                </h3>
              )}
            </Link>
            <p className="text-white/70 mb-6 leading-relaxed">
              Experience the perfect balance of modern luxury and natural tranquility.
              AI-powered hospitality for the mindful traveler.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/70 text-sm">
                  {hotelInfo.address.street}<br />
                  {hotelInfo.address.city}, {hotelInfo.address.state} {hotelInfo.address.zip}
                </p>
              </div>
              {hotelInfo.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <a href={`tel:${hotelInfo.phone}`} className="text-white/70 text-sm hover:text-primary-400 transition-colors">
                      {hotelInfo.phone}
                    </a>
                    {hotelInfo.phone2 && (
                      <a href={`tel:${hotelInfo.phone2}`} className="text-white/70 text-sm hover:text-primary-400 transition-colors">
                        {hotelInfo.phone2}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {hotelInfo.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <a href={`mailto:${hotelInfo.email}`} className="text-white/70 text-sm hover:text-primary-400 transition-colors">
                    {hotelInfo.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Suites</h4>
            <ul className="space-y-2">
              {footerLinks.suites.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <p>&copy; {new Date().getFullYear()} {hotelInfo.name}. Made with</p>
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <p>by {hotelInfo.name}</p>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social: any) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-primary-400 transition-all"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
