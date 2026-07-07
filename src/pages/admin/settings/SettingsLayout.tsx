import HotelInfoTab from '../../../components/settings/HotelInfoTab';

export default function SettingsLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
          <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
            Manage your property configuration and preferences.
          </p>
        </header>

        {/* Hotel Info content */}
        <div className="bg-white rounded-[10px] p-4 sm:p-6">
          <HotelInfoTab />
        </div>
      </div>
    </div>
  );
}
