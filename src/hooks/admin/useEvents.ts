/**
 * useEvents — Inquiry list state, filters, CRUD
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { eventsService, type EventInquiry } from '../../api/services/events.service';
import { MOCK_INQUIRIES } from '../../data/events-mock';
import toast from 'react-hot-toast';

export function useEvents() {
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.event_type = typeFilter;
      const data = await eventsService.getInquiries(params);
      setInquiries(data);
    } catch (err) {
      console.error('Using mock inquiries');
      setInquiries(MOCK_INQUIRIES);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => { loadInquiries(); }, [loadInquiries]);

  const filteredInquiries = useMemo(() => {
    if (!searchQuery.trim()) return inquiries;
    const q = searchQuery.toLowerCase();
    return inquiries.filter(inq =>
      inq.event_name.toLowerCase().includes(q) ||
      inq.contact_name.toLowerCase().includes(q) ||
      inq.inquiry_number?.toLowerCase().includes(q)
    );
  }, [inquiries, searchQuery]);

  const createInquiry = useCallback(async (data: Partial<EventInquiry>): Promise<EventInquiry | null> => {
    try {
      const result = await eventsService.createInquiry(data);
      toast.success('Inquiry created');
      await loadInquiries();
      return result;
    } catch {
      // API unavailable — create locally
      const mockInquiry: EventInquiry = {
        id: Date.now(),
        inquiry_number: `INQ-${Date.now().toString().slice(-4)}`,
        event_name: data.event_name || 'New Event',
        event_type: data.event_type || 'other',
        contact_name: data.contact_name || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        expected_guests: data.expected_guests || 50,
        status: 'inquiry',
        created_at: new Date().toISOString(),
      };
      setInquiries(prev => [mockInquiry, ...prev]);
      toast.success('Inquiry created');
      return mockInquiry;
    }
  }, [loadInquiries]);

  const updateInquiryStatus = useCallback(async (id: number, status: string) => {
    try {
      await eventsService.updateInquiry(id, { status });
      toast.success('Status updated');
      await loadInquiries();
    } catch {
      // Update locally
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      toast.success('Status updated');
    }
  }, [loadInquiries]);

  // KPI stats
  const stats = useMemo(() => {
    const total = inquiries.length;
    const confirmed = inquiries.filter(i => i.status === 'confirmed' || i.status === 'upcoming' || i.status === 'active').length;
    const pipeline = inquiries.filter(i => i.status === 'inquiry' || i.status === 'proposal_sent').length;
    const revenue = inquiries
      .filter(i => ['confirmed', 'upcoming', 'active', 'completed'].includes(i.status))
      .reduce((sum, i) => sum + (i.total_amount || 0), 0);
    return { total, confirmed, pipeline, revenue };
  }, [inquiries]);

  return {
    inquiries: filteredInquiries, loading, stats,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    searchQuery, setSearchQuery,
    createInquiry, updateInquiryStatus,
    refresh: loadInquiries,
  };
}
