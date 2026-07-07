import { Eye, Calendar, TrendingUp, Star, CheckCircle, User, Briefcase } from 'lucide-react';

export default function StaffCard({ staff, onClick, onAssignShift }) {
  // Status styling
  const getStatusStyle = (status) => {
    const styles = {
      active: 'ring-[#4E5840]',
      'off-duty': 'ring-neutral-400',
      sick: 'ring-red-500',
      leave: 'ring-amber-500'
    };
    return styles[status] || 'ring-neutral-400';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30',
      'off-duty': 'bg-neutral-50 text-neutral-700 border-neutral-200',
      sick: 'bg-red-50 text-red-700 border-red-200',
      leave: 'bg-amber-50 text-amber-700 border-amber-200'
    };

    const labels = {
      active: 'Active',
      'off-duty': 'Off Duty',
      sick: 'Sick',
      leave: 'On Leave'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Calculate task completion percentage
  const completionRate = staff.tasksToday > 0
    ? Math.round((staff.completedToday / staff.tasksToday) * 100)
    : 0;

  // Get avatar initials from name if avatar is not provided
  const getAvatarInitials = () => {
    if (staff.avatar && typeof staff.avatar === 'string') {
      return staff.avatar;
    }
    if (staff.name && typeof staff.name === 'string') {
      return staff.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'ST';
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:border-[#A57865]/30 transition-all duration-200 group flex flex-col">
      {/* Header with Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`relative flex-shrink-0 w-16 h-16 rounded-full ring-4 ${getStatusStyle(staff.status)} bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold text-xl shadow-md`}>
          {getAvatarInitials()}
          {/* Clock status indicator */}
          <span
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${staff.clockedIn ? 'bg-emerald-500' : 'bg-neutral-300'}`}
            title={staff.clockedIn ? 'Clocked In' : 'Clocked Out'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-serif font-bold text-neutral-900 truncate mb-1">
            {staff.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
            <p className="text-sm text-neutral-600">{staff.role}</p>
          </div>
          {getStatusBadge(staff.status)}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Tasks Today */}
        <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-[#A57865]" />
            </div>
          </div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Tasks Today</p>
          <p className="text-2xl font-bold text-neutral-900 mb-2">
            {staff.completedToday}/{staff.tasksToday}
          </p>
          {staff.tasksToday > 0 && (
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-[#A57865] h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          )}
        </div>

        {/* Efficiency */}
        <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#4E5840]" />
            </div>
          </div>
          <p className="text-xs font-medium text-neutral-600 mb-1">Efficiency</p>
          <p className="text-2xl font-bold text-neutral-900 mb-2">
            {staff.efficiency}%
          </p>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                staff.efficiency >= 90 ? 'bg-[#4E5840]' :
                staff.efficiency >= 75 ? 'bg-[#A57865]' :
                'bg-amber-500'
              }`}
              style={{ width: `${staff.efficiency}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-4 p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
          <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-700 mb-0.5">Rating</p>
          <p className="text-lg font-bold text-amber-900">{(staff.rating || 0).toFixed(1)}</p>
        </div>
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onClick(staff)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#A57865] hover:bg-[#8E6554] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-[1.02] active:scale-95"
        >
          <Eye className="w-4 h-4" />
          View Profile
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignShift(staff);
          }}
          className="px-4 py-3 bg-white hover:bg-neutral-50 border-2 border-neutral-200 hover:border-[#A57865]/30 text-neutral-700 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
