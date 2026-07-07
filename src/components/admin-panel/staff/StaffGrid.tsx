import StaffCard from './StaffCard';

export default function StaffGrid({ staff, onStaffClick, onAssignShift }) {
  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No staff found</h3>
        <p className="text-sm text-neutral-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-3 gap-4 tablet:gap-5 lg:gap-6">
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
