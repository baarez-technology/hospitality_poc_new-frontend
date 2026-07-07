/**
 * RoomsTabs Component
 * Tab navigation for rooms - Glimmora Design System v5.0
 * Pill style matching Channel Manager Promotions page
 */

import { Home, Check, CheckCircle, ShieldCheck, Users, AlertTriangle, Clock, Wrench, XCircle, AlertOctagon } from 'lucide-react';

export default function RoomsTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All Rooms', shortLabel: 'All', icon: Home, count: counts?.all },
    { id: 'available', label: 'Available', shortLabel: 'Available', icon: Check, count: counts?.available },
    { id: 'occupied', label: 'Occupied', shortLabel: 'Occupied', icon: Users, count: counts?.occupied },
    { id: 'dirty', label: 'Dirty', shortLabel: 'Dirty', icon: AlertTriangle, count: counts?.dirty },
    { id: 'in_progress', label: 'In Progress', shortLabel: 'Cleaning', icon: Clock, count: counts?.in_progress },
    { id: 'clean', label: 'Clean', shortLabel: 'Clean', icon: CheckCircle, count: counts?.clean },
    { id: 'inspected', label: 'Inspected', shortLabel: 'Inspected', icon: ShieldCheck, count: counts?.inspected },
    { id: 'maintenance', label: 'Maintenance', shortLabel: 'Maint.', icon: Wrench, count: counts?.maintenance },
    { id: 'out_of_service', label: 'Out of Service', shortLabel: 'OOS', icon: XCircle, count: counts?.out_of_service },
    { id: 'out_of_order', label: 'Out of Order', shortLabel: 'OOO', icon: AlertOctagon, count: counts?.out_of_order }
  ];

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all whitespace-nowrap ${
              isActive
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tabular-nums ${
                isActive ? 'bg-terra-500 text-white' : 'bg-neutral-200 text-neutral-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
