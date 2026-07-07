import { useState, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { filterByDepartment, filterStaff } from '@/utils/admin/staffFilter';
import { searchStaff } from '@/utils/admin/staffSearch';
import { sortStaff } from '@/utils/admin/staffSort';
import { staffService } from '@/api/services/staff.service';

/**
 * Transform API staff to frontend format
 */
function transformApiStaff(apiStaff: any) {
  // Get name from either 'name' or 'full_name' field
  const staffName = apiStaff.name || apiStaff.full_name || 'Unknown Staff';

  // Generate avatar initials from name
  const avatarInitials = staffName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  return {
    id: apiStaff.id?.toString() || `S-${Date.now()}`,
    name: staffName,
    role: apiStaff.role || 'Staff',
    department: apiStaff.department || 'general',
    status: apiStaff.status || 'active',
    phone: apiStaff.phone || '',
    email: apiStaff.email || '',
    avatar: apiStaff.avatar || avatarInitials,
    shift: apiStaff.shift || 'morning',
    specialty: apiStaff.specialty || '',
    floorAssignment: apiStaff.floor_assignment || null,
    joinDate: apiStaff.hire_date || new Date().toISOString().split('T')[0],
    tasksToday: 0,
    completedToday: 0,
    efficiency: apiStaff.performance_rating ? Math.round(apiStaff.performance_rating * 20) : 0, // Convert 0-5 to 0-100
    rating: apiStaff.performance_rating || 0,
    performance: {
      tasksCompleted: 0,
      avgResponseTime: '0 min',
      customerRating: apiStaff.performance_rating || 0,
      punctuality: 100
    },
    schedule: apiStaff.schedule || [],
    leaveHistory: [],
    aiInsights: [],
    clockedIn: apiStaff.clocked_in || false,
    hourlyRate: apiStaff.hourly_rate || 0,
    employeeId: apiStaff.employee_id || '',
  };
}

/**
 * Master hook for staff state management
 * Implements complete data pipeline: rawData → department → filter → search → sort → paginate
 *
 * Provides CRUD operations:
 * - updateStatus(id, newStatus)
 * - assignShift(id, shiftData)
 * - markLeave(id, leaveData)
 * - sendMessage(id, messageData)
 * - addStaff(newStaff)
 * - editStaff(id, updates)
 * - disableStaff(id)
 */
export function useStaff() {
  // Raw data state - start empty and fetch from API
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff from API on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiStaff = await staffService.list();
        if (Array.isArray(apiStaff) && apiStaff.length > 0) {
          const transformedStaff = apiStaff.map(transformApiStaff);
          setStaff(transformedStaff);
        }
      } catch (err) {
        console.error('Failed to fetch staff from API:', err);
        setError('Failed to load staff data. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Department/Tab state
  const [activeDepartment, setActiveDepartment] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    shift: 'all'
  });

  // Sort state
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter management functions
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: 'all',
      status: 'all',
      shift: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.role !== 'all'
      || filters.status !== 'all'
      || filters.shift !== 'all';
  };

  // Sort management
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CRUD Operations

  /**
   * Update staff status (active, off-duty, sick, leave)
   */
  const updateStatus = async (id, newStatus) => {
    try {
      // Call API to update status
      await staffService.update(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update staff status via API:', err);
    }
    // Update local state regardless
    setStaff(prev => prev.map(member =>
      member.id?.toString() === id?.toString()
        ? { ...member, status: newStatus }
        : member
    ));
  };

  /**
   * Assign shift to staff member
   * @param {string} id - Staff ID
   * @param {object} shiftData - { date, shift, startTime, endTime }
   */
  const assignShift = async (id, shiftData) => {
    try {
      // Call API to assign shift
      await staffService.assignShift(id, {
        schedule_date: shiftData.date,
        shift_type: shiftData.shift,
        start_time: shiftData.startTime || '08:00',
        end_time: shiftData.endTime || '16:00',
      });
    } catch (err) {
      console.error('Failed to assign shift via API:', err);
    }

    // Update local state regardless
    setStaff(prev => prev.map(member => {
      if (member.id?.toString() === id?.toString()) {
        // Update the default shift
        const updatedMember = { ...member, shift: shiftData.shift };

        // Add to schedule with full details
        const newScheduleEntry = {
          date: shiftData.date,
          shift: shiftData.shift,
          startTime: shiftData.startTime || '08:00',
          endTime: shiftData.endTime || '16:00',
          hours: `${shiftData.startTime || '08:00'} - ${shiftData.endTime || '16:00'}`
        };

        // Check if date already exists in schedule
        const existingIndex = member.schedule?.findIndex(s => s.date === shiftData.date) ?? -1;
        const updatedSchedule = existingIndex >= 0
          ? member.schedule.map((s, i) => i === existingIndex ? newScheduleEntry : s)
          : [...(member.schedule || []), newScheduleEntry];

        updatedMember.schedule = updatedSchedule.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return updatedMember;
      }
      return member;
    }));
  };

  /**
   * Mark leave for staff member
   * @param {string} id - Staff ID
   * @param {object} leaveData - { startDate, endDate, type, notes }
   */
  const markLeave = async (id, leaveData) => {
    try {
      // Call API to request leave
      await staffService.requestLeave(id, {
        leave_type: leaveData.type,
        start_date: leaveData.startDate,
        end_date: leaveData.endDate,
        reason: leaveData.notes,
      });
    } catch (err) {
      console.error('Failed to request leave via API:', err);
    }

    // Update local state regardless
    setStaff(prev => prev.map(member => {
      if (member.id?.toString() === id?.toString()) {
        const updatedMember = {
          ...member,
          status: 'leave',
          leaveHistory: [
            ...(member.leaveHistory || []),
            {
              startDate: leaveData.startDate,
              endDate: leaveData.endDate,
              type: leaveData.type,
              notes: leaveData.notes || ''
            }
          ]
        };
        return updatedMember;
      }
      return member;
    }));
  };

  /**
   * Send message to staff member
   * @param {string} id - Staff ID
   * @param {object} messageData - { subject, message }
   */
  const sendMessage = async (id, messageData) => {
    try {
      await staffService.sendMessage(id, {
        subject: messageData.subject,
        message: messageData.message,
        priority: messageData.priority || 'normal'
      });
      return { success: true };
    } catch (err) {
      console.error(`Failed to send message to staff ${id}:`, err);
      return { success: false, error: err };
    }
  };

  /**
   * Add new staff member
   */
  const addStaff = async (newStaffData) => {
    try {
      // Call API to create staff (password omitted = backend auto-generates temp password)
      const apiResult = await staffService.create({
        email: newStaffData.email,
        personal_email: newStaffData.personalEmail || undefined,
        full_name: newStaffData.name,
        phone: newStaffData.phone,
        role: newStaffData.role,
        department: newStaffData.department,
        shift: newStaffData.shift,
        hourly_rate: newStaffData.hourlyRate,
        permissions: newStaffData.permissions || undefined,
      });

      // Extract the response data (handles wrapped { data: ... } or raw)
      const result = apiResult?.data || apiResult;

      // Transform and add to local state
      const newStaff = transformApiStaff(result);
      setStaff(prev => [...prev, newStaff]);

      // Surface the temp password to the admin
      const tempPassword = result.temp_password || result.tempPassword;
      const emailSent = result.email_sent || result.emailSent;

      if (tempPassword) {
        // Show a persistent toast with the temp password so admin can copy it
        toast.success(
          `Staff created! Temp password: ${tempPassword}${emailSent ? ' (email sent)' : ' (email NOT sent — share manually)'}`,
          { duration: 15000 }
        );
      } else {
        toast.success('Staff member created successfully');
      }

      return { ...newStaff, tempPassword, emailSent };
    } catch (err: any) {
      console.error('Failed to add staff via API:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create staff member';
      toast.error(msg);
      throw err;
    }
  };

  /**
   * Edit staff member details
   */
  const editStaff = async (id, updates) => {
    try {
      // Call API to update staff
      await staffService.update(id, {
        full_name: updates.name,
        role: updates.role,
        department: updates.department,
        phone: updates.phone,
        status: updates.status,
        shift: updates.shift,
        avatar: updates.avatar
      });
    } catch (err) {
      console.error('Failed to update staff via API:', err);
    }
    // Update local state regardless
    setStaff(prev => prev.map(member =>
      member.id?.toString() === id?.toString()
        ? { ...member, ...updates }
        : member
    ));
  };

  /**
   * Disable staff member
   */
  const disableStaff = async (id) => {
    try {
      await staffService.update(id, { is_active: false, status: 'disabled' });
    } catch (err) {
      console.error('Failed to disable staff via API:', err);
    }
    setStaff(prev => prev.map(member =>
      member.id?.toString() === id?.toString()
        ? { ...member, status: 'disabled' }
        : member
    ));
  };

  /**
   * Delete staff member
   */
  const deleteStaff = async (id) => {
    try {
      await staffService.delete(id);
    } catch (err) {
      console.error('Failed to delete staff via API:', err);
    }
    setStaff(prev => prev.filter(member => member.id?.toString() !== id?.toString()));
  };

  /**
   * Record check-in
   */
  const recordCheckIn = async (id) => {
    const now = new Date().toISOString();
    try {
      await staffService.clockInOut(id, { action: 'clock_in' });
    } catch (err) {
      console.error('Failed to clock in via API:', err);
    }
    setStaff(prev => prev.map(member => {
      if (member.id?.toString() === id?.toString()) {
        return { ...member, status: 'active', clockedIn: true, lastCheckIn: now };
      }
      return member;
    }));
  };

  /**
   * Record check-out
   */
  const recordCheckOut = async (id) => {
    const now = new Date().toISOString();
    try {
      await staffService.clockInOut(id, { action: 'clock_out' });
    } catch (err) {
      console.error('Failed to clock out via API:', err);
    }
    setStaff(prev => prev.map(member => {
      if (member.id?.toString() === id?.toString()) {
        return { ...member, status: 'off-duty', clockedIn: false, lastCheckOut: now };
      }
      return member;
    }));
  };

  // Data processing pipeline
  const processedStaff = useMemo(() => {
    let result = filterByDepartment(staff, activeDepartment);
    result = filterStaff(result, filters);
    result = searchStaff(result, searchQuery);
    if (sortField) {
      result = sortStaff(result, sortField, sortDirection);
    }
    return result;
  }, [staff, activeDepartment, filters, searchQuery, sortField, sortDirection]);

  // Calculate department counts
  const departmentCounts = useMemo(() => {
    return {
      all: staff.length,
      frontdesk: staff.filter(s => s.department === 'frontdesk' || s.department === 'front_desk').length,
      housekeeping: staff.filter(s => s.department === 'housekeeping').length,
      management: staff.filter(s => s.department === 'management').length,
      maintenance: staff.filter(s => s.department === 'maintenance').length,
      runner: staff.filter(s => s.department === 'runner').length
    };
  }, [staff]);

  return {
    // Data
    staff: processedStaff,
    rawStaff: staff,
    isLoading,
    error,

    // Department/Tab
    activeDepartment,
    setActiveDepartment,
    departmentCounts,

    // Search
    searchQuery,
    setSearchQuery,

    // Filters
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),

    // Sort
    sortField,
    sortDirection,
    handleSort,

    // CRUD Operations
    updateStatus,
    assignShift,
    markLeave,
    sendMessage,
    addStaff,
    editStaff,
    disableStaff,
    deleteStaff,
    recordCheckIn,
    recordCheckOut
  };
}
