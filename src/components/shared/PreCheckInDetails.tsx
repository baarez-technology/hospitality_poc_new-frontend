import {
  ClipboardCheck,
  ShieldCheck,
  ShieldX,
  Plane,
  Clock,
  Car,
  Briefcase,
  Thermometer,
  BedDouble,
  Eye,
  Layers,
  Volume2,
  Loader2,
  CalendarCheck,
  MessageSquare,
} from 'lucide-react';
import { PreCheckInBadge } from './PreCheckInBadge';
import type { PreCheckInResponse } from '@/api/services/precheckin.service';

interface PreCheckInDetailsProps {
  data: PreCheckInResponse | null;
  isLoading: boolean;
}

export function PreCheckInDetails({ data, isLoading }: PreCheckInDetailsProps) {
  if (isLoading) {
    return (
      <div className="rounded-[10px] border border-neutral-200 bg-white p-6 sm:p-8 text-center">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-400 mx-auto mb-2" />
        <p className="text-[12px] text-neutral-500">Loading pre-check-in data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[10px] border border-neutral-200 bg-white p-6 sm:p-8 text-center">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto mb-3">
          <ClipboardCheck className="w-5 h-5 text-neutral-400" />
        </div>
        <p className="text-[13px] font-medium text-neutral-600 mb-1">No Pre-Check-In</p>
        <p className="text-[11px] text-neutral-400">Guest has not started pre-check-in yet</p>
      </div>
    );
  }

  const status = 'completed' as const;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
          <ClipboardCheck className="w-3 h-3 sm:w-4 sm:h-4 text-terra-600" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Pre Check-In
        </span>
        <PreCheckInBadge status={status} />
        {data.completed_at && (
          <span className="text-[10px] text-neutral-400 ml-auto">
            {new Date(data.completed_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Room Preferences */}
      {(data.floor_preference || data.view_preference || data.bed_type_preference || data.quietness_preference) && (
        <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BedDouble className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Room Preferences
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {data.floor_preference && (
              <div>
                <span className="text-[10px] text-neutral-400 block">Floor</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800 capitalize">
                  {data.floor_preference}
                </span>
              </div>
            )}
            {data.view_preference && (
              <div>
                <span className="text-[10px] text-neutral-400 block">View</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800 capitalize">
                  {data.view_preference}
                </span>
              </div>
            )}
            {data.bed_type_preference && (
              <div>
                <span className="text-[10px] text-neutral-400 block">Bed Type</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800 capitalize">
                  {data.bed_type_preference}
                </span>
              </div>
            )}
            {data.quietness_preference && (
              <div>
                <span className="text-[10px] text-neutral-400 block">Quietness</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800 capitalize">
                  {data.quietness_preference}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Verification */}
      <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          {data.id_verified ? (
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
          ) : (
            <ShieldX className="w-3.5 h-3.5 text-neutral-400" />
          )}
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            ID Verification
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              data.id_verified
                ? 'bg-sage-50 text-sage-700 border-sage-200'
                : 'bg-neutral-50 text-neutral-500 border-neutral-200'
            }`}
          >
            {data.id_verified ? 'Verified' : 'Not Verified'}
          </span>
          {data.id_type && (
            <span className="text-[11px] text-neutral-500 capitalize">
              {data.id_type.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Travel Details */}
      {(data.arrival_time || data.flight_number || data.transportation_needed || data.purpose) && (
        <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Plane className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Travel Details
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {data.arrival_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-neutral-400" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Arrival</span>
                  <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                    {data.arrival_time}
                  </span>
                </div>
              </div>
            )}
            {data.flight_number && (
              <div className="flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-neutral-400" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Flight</span>
                  <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                    {data.flight_number}
                  </span>
                </div>
              </div>
            )}
            {data.purpose && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-neutral-400" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Purpose</span>
                  <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800 capitalize">
                    {data.purpose}
                  </span>
                </div>
              </div>
            )}
            {data.transportation_needed && (
              <div className="flex items-center gap-1.5">
                <Car className="w-3 h-3 text-neutral-400" />
                <div>
                  <span className="text-[10px] text-neutral-400 block">Transport</span>
                  <span className="text-[12px] sm:text-[13px] font-medium text-terra-600">
                    Requested
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Special Requests */}
      {(data.early_check_in || data.late_check_out || data.special_requests) && (
        <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Special Requests
            </span>
          </div>
          <div className="space-y-1.5">
            {data.early_check_in && (
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-3 h-3 text-amber-500" />
                <span className="text-[12px] font-medium text-amber-700">Early Check-In Requested</span>
              </div>
            )}
            {data.late_check_out && (
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-3 h-3 text-amber-500" />
                <span className="text-[12px] font-medium text-amber-700">Late Check-Out Requested</span>
              </div>
            )}
            {data.special_requests && (
              <p className="text-[12px] text-neutral-600 mt-1">{data.special_requests}</p>
            )}
          </div>
        </div>
      )}

      {/* Comfort Preferences */}
      {(data.temperature || data.pillow_type) && (
        <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Thermometer className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Comfort Preferences
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {data.temperature && (
              <div>
                <span className="text-[10px] text-neutral-400 block">Temperature</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                  {data.temperature}°F
                </span>
              </div>
            )}
            {data.pillow_type && (
              <div>
                <span className="text-[10px] text-neutral-400 block">Pillow Type</span>
                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                  {(() => {
                    try {
                      const parsed = JSON.parse(data.pillow_type);
                      return Array.isArray(parsed) ? parsed.join(', ') : data.pillow_type;
                    } catch {
                      return data.pillow_type;
                    }
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
