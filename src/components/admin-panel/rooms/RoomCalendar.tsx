import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Bed, User, AlertTriangle } from 'lucide-react';

/**
 * Room Calendar View - 14-day availability grid
 * Shows rooms on Y-axis and dates on X-axis
 */
export default function RoomCalendar({ rooms, bookings = [], onRoomClick, onDateClick }) {
  const [startDate, setStartDate] = useState(new Date());

  // Generate 14 days starting from startDate
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      result.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: date.getTime() === today.getTime(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return result;
  }, [startDate]);

  // Get room status for each day
  const getRoomDayStatus = (room, day) => {
    // Check if room is out of service
    if (room.status === 'out_of_service') {
      return { status: 'blocked', label: 'Out of Service', color: 'bg-neutral-300' };
    }

    // Check if room has a booking on this day
    const booking = bookings.find(b => {
      if (b.room !== room.roomNumber) return false;
      if (b.status === 'CANCELLED') return false;

      const checkIn = new Date(b.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(b.checkOut);
      checkOut.setHours(0, 0, 0, 0);
      const currentDay = day.date;

      return currentDay >= checkIn && currentDay < checkOut;
    });

    if (booking) {
      // Check if it's check-in day
      const checkIn = new Date(booking.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(booking.checkOut);
      checkOut.setHours(0, 0, 0, 0);

      const isCheckIn = day.date.getTime() === checkIn.getTime();
      const isCheckOut = day.date.getTime() === checkOut.getTime();

      return {
        status: 'booked',
        label: booking.guest || 'Guest',
        bookingId: booking.id,
        color: 'bg-[#A57865]',
        isCheckIn,
        isCheckOut,
        booking
      };
    }

    // Room is available
    return { status: 'available', label: 'Available', color: 'bg-[#4E5840]/20' };
  };

  // Navigate dates
  const handlePrevWeek = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() - 7);
    setStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + 7);
    setStartDate(newDate);
  };

  const handleToday = () => {
    setStartDate(new Date());
  };

  // Sort rooms by floor and room number
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return parseInt(a.roomNumber) - parseInt(b.roomNumber);
    });
  }, [rooms]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-[#FAF8F6]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#A57865]" />
            <h3 className="text-lg font-semibold text-neutral-900">Room Availability Calendar</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-medium text-[#A57865] bg-[#A57865]/10 rounded-lg hover:bg-[#A57865]/20 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <span className="text-sm font-medium text-neutral-700 min-w-[160px] text-center">
              {days[0]?.month} {days[0]?.dayNum} - {days[13]?.month} {days[13]?.dayNum}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#4E5840]/20 border border-[#4E5840]/30"></div>
            <span className="text-neutral-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#A57865] border border-[#A57865]"></div>
            <span className="text-neutral-600">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-neutral-300 border border-neutral-400"></div>
            <span className="text-neutral-600">Out of Service</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-neutral-50">
              <th className="sticky left-0 bg-neutral-50 z-10 px-4 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider border-r border-neutral-200 w-32">
                Room
              </th>
              {days.map((day, idx) => (
                <th
                  key={idx}
                  className={`px-2 py-3 text-center text-xs font-medium min-w-[70px] ${
                    day.isToday ? 'bg-[#A57865]/10' : day.isWeekend ? 'bg-neutral-100' : ''
                  }`}
                >
                  <div className={`${day.isToday ? 'text-[#A57865] font-bold' : 'text-neutral-500'}`}>
                    {day.dayName}
                  </div>
                  <div className={`text-lg ${day.isToday ? 'text-[#A57865] font-bold' : 'text-neutral-900'}`}>
                    {day.dayNum}
                  </div>
                  <div className="text-neutral-400 text-[10px]">{day.month}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedRooms.map((room) => (
              <tr key={room.id} className="hover:bg-neutral-50/50">
                {/* Room Info */}
                <td
                  className="sticky left-0 bg-white z-10 px-4 py-3 border-r border-neutral-200 cursor-pointer hover:bg-[#FAF8F6]"
                  onClick={() => onRoomClick && onRoomClick(room)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#A57865]/10 rounded-lg flex items-center justify-center">
                      <Bed className="w-4 h-4 text-[#A57865]" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">{room.roomNumber}</p>
                      <p className="text-xs text-neutral-500">{room.type}</p>
                    </div>
                  </div>
                </td>

                {/* Day Cells */}
                {days.map((day, idx) => {
                  const dayStatus = getRoomDayStatus(room, day);

                  return (
                    <td
                      key={idx}
                      className={`px-1 py-2 text-center ${
                        day.isToday ? 'bg-[#A57865]/5' : day.isWeekend ? 'bg-neutral-50' : ''
                      }`}
                      onClick={() => onDateClick && onDateClick(room, day, dayStatus)}
                    >
                      <div
                        className={`mx-auto h-8 rounded-md flex items-center justify-center cursor-pointer transition-all hover:opacity-80 ${
                          dayStatus.status === 'booked'
                            ? 'bg-[#A57865] text-white'
                            : dayStatus.status === 'blocked'
                            ? 'bg-neutral-300 text-neutral-600'
                            : 'bg-[#4E5840]/10 text-[#4E5840] hover:bg-[#4E5840]/20'
                        }`}
                        title={dayStatus.label}
                      >
                        {dayStatus.status === 'booked' && (
                          <User className="w-3.5 h-3.5" />
                        )}
                        {dayStatus.status === 'blocked' && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedRooms.length === 0 && (
        <div className="p-12 text-center">
          <Bed className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">No rooms to display</p>
          <p className="text-sm text-neutral-400 mt-1">Add rooms to see the calendar view</p>
        </div>
      )}
    </div>
  );
}
