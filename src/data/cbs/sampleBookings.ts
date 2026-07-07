// CBS Bookings — hardcoded samples removed; data now comes from API.

export const sampleBookings: any[] = [];

export const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmed', color: 'green' },
  pending: { label: 'Pending', color: 'amber' },
  cancelled: { label: 'Cancelled', color: 'red' },
  checked_in: { label: 'Checked In', color: 'blue' },
  checked_out: { label: 'Checked Out', color: 'gray' },
  no_show: { label: 'No Show', color: 'red' },
};

export const sourceConfig: Record<string, { label: string; color: string }> = {
  direct: { label: 'Direct', color: 'blue' },
  ota: { label: 'OTA', color: 'purple' },
  corporate: { label: 'Corporate', color: 'indigo' },
  travel_agent: { label: 'Travel Agent', color: 'orange' },
  walk_in: { label: 'Walk-in', color: 'gray' },
};

export default sampleBookings;
