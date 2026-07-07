// CBS Availability — hardcoded samples removed; data now comes from API.

export const sampleAvailability: any[] = [];

export function getAvailabilityForRange(_startDate: any, _endDate: any, _roomType: any = null): any[] {
  return [];
}

export function checkAvailability(_checkIn: any, _checkOut: any, _roomType: any, _roomsNeeded = 1) {
  return { available: false, rooms: [] };
}

export function getCalendarDates(daysCount = 30) {
  const dates: Array<{
    date: string;
    dayOfWeek: string;
    dayOfMonth: number;
    month: string;
    isToday: boolean;
    isWeekend: boolean;
  }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    // Use local-date formatting so it matches the backend `YYYY-MM-DD` keys.
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dow = d.getDay();
    dates.push({
      date: `${year}-${month}-${day}`,
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfMonth: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
      isWeekend: dow === 0 || dow === 6,
    });
  }
  return dates;
}

export const roomTypeColors: Record<string, string> = {};

export default sampleAvailability;
