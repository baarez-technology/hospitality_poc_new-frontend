/**
 * Events Mock Data — Used as fallback when API is unavailable
 */
import type { EventInquiry, Hall } from '../api/services/events.service';

export const MOCK_INQUIRIES: EventInquiry[] = [
  { id: 1, inquiry_number: 'INQ-2026-001', event_name: 'Sharma Wedding Reception', event_type: 'wedding', contact_name: 'Rajesh Sharma', contact_phone: '+91 98765 12345', contact_email: 'rajesh@email.com', start_date: '2026-05-15', end_date: '2026-05-17', expected_guests: 350, status: 'confirmed', created_at: '2026-03-10', total_amount: 1850000 },
  { id: 2, inquiry_number: 'INQ-2026-002', event_name: 'TCS Annual Conference', event_type: 'conference', contact_name: 'Anil Mehta', contact_phone: '+91 98765 23456', contact_email: 'anil@tcs.com', start_date: '2026-04-20', end_date: '2026-04-22', expected_guests: 200, status: 'proposal_sent', created_at: '2026-03-15', total_amount: 680000 },
  { id: 3, inquiry_number: 'INQ-2026-003', event_name: 'Gupta 50th Birthday', event_type: 'birthday', contact_name: 'Neha Gupta', contact_phone: '+91 98765 34567', contact_email: 'neha@email.com', start_date: '2026-04-28', end_date: '2026-04-28', expected_guests: 80, status: 'inquiry', created_at: '2026-03-28' },
  { id: 4, inquiry_number: 'INQ-2026-004', event_name: 'Infosys Leadership Meet', event_type: 'corporate', contact_name: 'Priya Nair', contact_phone: '+91 98765 45678', contact_email: 'priya@infosys.com', start_date: '2026-05-05', end_date: '2026-05-06', expected_guests: 50, status: 'confirmed', created_at: '2026-03-20', total_amount: 320000 },
  { id: 5, inquiry_number: 'INQ-2026-005', event_name: 'Patel Engagement Ceremony', event_type: 'social', contact_name: 'Vikram Patel', contact_phone: '+91 98765 56789', contact_email: 'vikram@email.com', start_date: '2026-06-10', end_date: '2026-06-11', expected_guests: 150, status: 'inquiry', created_at: '2026-04-01' },
  { id: 6, inquiry_number: 'INQ-2026-006', event_name: 'AWS Tech Summit', event_type: 'conference', contact_name: 'Deepak Kumar', contact_phone: '+91 98765 67890', contact_email: 'deepak@aws.com', start_date: '2026-04-10', end_date: '2026-04-11', expected_guests: 120, status: 'completed', created_at: '2026-02-15', total_amount: 450000 },
  { id: 7, inquiry_number: 'INQ-2026-007', event_name: 'Jain Wedding Sangeet', event_type: 'wedding', contact_name: 'Sanjay Jain', contact_phone: '+91 98765 78901', contact_email: 'sanjay@email.com', start_date: '2026-07-20', end_date: '2026-07-23', expected_guests: 500, status: 'proposal_sent', created_at: '2026-03-30', total_amount: 2800000 },
];

export const MOCK_HALLS: Hall[] = [
  { id: 1, name: 'Grand Ballroom', capacity_theatre: 500, capacity_banquet: 300, capacity_classroom: 200, capacity_cocktail: 400, rate_per_day: 150000, status: 'available' },
  { id: 2, name: 'Crystal Hall', capacity_theatre: 200, capacity_banquet: 120, capacity_classroom: 80, capacity_cocktail: 150, rate_per_day: 75000, status: 'available' },
  { id: 3, name: 'Garden Pavilion', capacity_theatre: 300, capacity_banquet: 200, capacity_classroom: 0, capacity_cocktail: 350, rate_per_day: 100000, status: 'available' },
  { id: 4, name: 'Board Room', capacity_theatre: 30, capacity_banquet: 20, capacity_classroom: 25, capacity_cocktail: 30, rate_per_day: 25000, status: 'available' },
  { id: 5, name: 'Terrace Deck', capacity_theatre: 150, capacity_banquet: 100, capacity_classroom: 0, capacity_cocktail: 180, rate_per_day: 60000, status: 'available' },
];
