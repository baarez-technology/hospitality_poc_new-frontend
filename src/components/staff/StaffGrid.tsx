import StaffCard from './StaffCard';

export default function StaffGrid({ staff, onStaffClick, onAssignShift }) {
  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-8 sm:p-12 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-50 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-neutral-800 mb-1">No staff found</p>
        <p className="text-[11px] text-neutral-400 font-medium">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {staff.map((member) => (
        <StaffCard
          key={member.id}
          staff={member}
          onClick={onStaffClick}
          onAssignShift={onAssignShift}
        />
      ))}
    </div>
  );
}
