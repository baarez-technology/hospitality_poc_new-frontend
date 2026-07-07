import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, UserCheck, UserX, AlertTriangle, Timer, Users,
  Download, Search, X, RefreshCw, Eye, Loader2, ClipboardList,
  ChevronUp, ChevronDown, ChevronsUpDown, Calendar
} from 'lucide-react';
import { useAttendance } from '../../hooks/admin/useAttendance';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/bookings/Pagination';
import { Button, IconButton } from '../../components/ui2/Button';
import DatePicker from '../../components/ui2/DatePicker';

// ── Custom FilterSelect (matching Bookings FiltersBar pattern) ──
function FilterSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? placeholder : selectedOption?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-[13px] bg-white border transition-all duration-150 flex items-center gap-1.5 sm:gap-2 focus:outline-none w-full sm:min-w-[140px] ${isOpen
          ? 'border-terra-400 ring-2 ring-terra-500/10'
          : value !== 'all'
            ? 'border-terra-300 bg-terra-50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={value !== 'all' ? 'text-terra-700 font-medium' : 'text-neutral-500'}>
          {displayLabel}
        </span>
        <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${value !== 'all' ? 'text-terra-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden min-w-[160px]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
                {value === option.value && (
                  <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Status badge config (with border for Bookings-style badges) ──
const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  present:     { bg: 'bg-sage-50',    text: 'text-sage-700',    border: 'border-sage-200',    label: 'Present' },
  absent:      { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200',    label: 'Absent' },
  late:        { bg: 'bg-gold-50',    text: 'text-gold-700',    border: 'border-gold-200',    label: 'Late' },
  overtime:    { bg: 'bg-ocean-50',   text: 'text-ocean-700',   border: 'border-ocean-200',   label: 'Overtime' },
  early_leave: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Early Leave' },
  on_leave:    { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200', label: 'On Leave' },
  sick:        { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200',    label: 'Sick' },
};

function getStatusBadge(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.absent;
}

// ── Shift badge config ──
const SHIFT_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  morning: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Morning' },
  evening: { bg: 'bg-ocean-50',  text: 'text-ocean-700',  border: 'border-ocean-200',  label: 'Evening' },
  night:   { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-200', label: 'Night' },
};

// ── CSV Export helper ──
function exportToCSV(entries: any[], selectedDate: string) {
  if (!entries.length) return;

  const headers = ['Staff Name', 'Role', 'Department', 'Shift', 'Date', 'Clock In', 'Clock Out', 'Status', 'Total Hours'];
  const rows = entries.map((e) => [
    e.staff_name,
    e.staff_role,
    e.department,
    e.shift_type,
    e.date,
    e.clock_in || '--',
    e.clock_out || '--',
    e.status,
    e.total_hours != null ? `${e.total_hours}h` : '--',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `attendance_${selectedDate}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ── Sort helper ──
type SortField = 'staff_name' | 'staff_role' | 'shift_type' | 'date' | 'clock_in' | 'clock_out' | 'status' | 'total_hours';
type SortDirection = 'asc' | 'desc';

function sortEntries(entries: any[], field: SortField | null, direction: SortDirection) {
  if (!field) return entries;
  return [...entries].sort((a, b) => {
    let aVal = a[field] ?? '';
    let bVal = b[field] ?? '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ── Filter option configs ──
const DEPARTMENT_OPTIONS = (departments: string[]) => [
  { value: 'all', label: 'All Departments' },
  ...departments.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
];

const SHIFT_OPTIONS = [
  { value: 'all', label: 'All Shifts' },
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'early_leave', label: 'Early Leave' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'sick', label: 'Sick' },
];

// ── Embeddable Attendance Content (used inside Staff page tabs) ──
export function AttendanceContent() {
  const navigate = useNavigate();
  const {
    entries,
    summary,
    isLoading,
    selectedDate,
    setSelectedDate,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    shiftFilter,
    setShiftFilter,
    searchQuery,
    setSearchQuery,
    departments,
    clearFilters,
    hasActiveFilters,
    refresh,
  } = useAttendance();

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEntries = useMemo(() => sortEntries(entries, sortField, sortDirection), [entries, sortField, sortDirection]);

  const {
    currentPageData,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    canGoPrev,
    canGoNext,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedEntries, 15);

  // KPI card config (matching Maintenance WOKPI exactly)
  const kpiCards = useMemo(() => [
    { label: 'Present',         value: summary.present,         icon: UserCheck,     iconBg: 'bg-[#4E5840]/10', iconColor: 'text-[#4E5840]' },
    { label: 'Absent',          value: summary.absent,          icon: UserX,         iconBg: 'bg-rose-50',      iconColor: 'text-rose-600' },
    { label: 'Late',            value: summary.late,            icon: AlertTriangle, iconBg: 'bg-[#CDB261]/10', iconColor: 'text-[#CDB261]' },
    { label: 'Early Leave',     value: summary.early_leave,     icon: Timer,         iconBg: 'bg-amber-50',     iconColor: 'text-amber-600' },
    { label: 'Overtime',        value: summary.overtime,        icon: Clock,         iconBg: 'bg-[#5C9BA4]/10', iconColor: 'text-[#5C9BA4]' },
    { label: 'Total Scheduled', value: summary.total_scheduled, icon: Users,         iconBg: 'bg-[#A57865]/10', iconColor: 'text-[#A57865]' },
  ], [summary]);

  const handleExport = () => exportToCSV(entries, selectedDate);

  const SortIndicator = ({ field }: { field: SortField }) => {
    const sorted = sortField === field ? sortDirection : null;
    const Icon = sorted === 'asc' ? ChevronUp : sorted === 'desc' ? ChevronDown : ChevronsUpDown;
    return <Icon className={`w-3.5 h-3.5 ${sorted ? 'text-terra-500' : 'text-neutral-300'}`} />;
  };

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── KPI Summary Cards (matching Maintenance WOKPI) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-[10px] p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.iconColor}`} />
                </div>
                <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  {card.label}
                </p>
              </div>
              <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                {isLoading ? '--' : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Actions Row ── */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-neutral-700">
          Attendance Records
        </p>
        <div className="flex items-center gap-2">
          <IconButton
            icon={RefreshCw}
            variant="ghost"
            size="sm"
            label="Refresh"
            onClick={refresh}
          />
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {/* ── Main Table Card (Filters + Table + Pagination inside) ── */}
      <div className="bg-white rounded-[10px] overflow-hidden">

        {/* ── Filters ── */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div className="relative w-full lg:w-[280px] lg:flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 text-[13px] bg-white rounded-lg border border-neutral-200
                  focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400
                  hover:border-neutral-300 transition-all duration-150
                  text-neutral-900 placeholder-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden lg:block lg:flex-1" />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="w-[calc(50%-4px)] sm:w-auto">
                <DatePicker
                  value={selectedDate}
                  onChange={(v) => setSelectedDate(v || new Date().toISOString().split('T')[0])}
                  placeholder="Select date"
                  className="w-full"
                />
              </div>

              <div className="w-[calc(50%-4px)] sm:w-auto">
                <FilterSelect
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  options={DEPARTMENT_OPTIONS(departments)}
                  placeholder="Department"
                />
              </div>

              <div className="w-[calc(50%-4px)] sm:w-auto">
                <FilterSelect
                  value={shiftFilter}
                  onChange={setShiftFilter}
                  options={SHIFT_OPTIONS}
                  placeholder="Shift"
                />
              </div>

              <div className="w-[calc(50%-4px)] sm:w-auto">
                <FilterSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                  placeholder="Status"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-terra-500 mb-3" />
            <p className="text-[13px] text-neutral-400">Loading attendance data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <colgroup>
                <col style={{ width: '200px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '50px' }} />
              </colgroup>
              <thead>
                <tr className="bg-neutral-50/30 border-b border-neutral-100">
                  <th
                    onClick={() => handleSort('staff_name')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Staff Name <SortIndicator field="staff_name" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('staff_role')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Role <SortIndicator field="staff_role" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('shift_type')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Shift <SortIndicator field="shift_type" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Date <SortIndicator field="date" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('clock_in')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Clock In <SortIndicator field="clock_in" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('clock_out')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Clock Out <SortIndicator field="clock_out" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Status <SortIndicator field="status" />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('total_hours')}
                    className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      Hours <SortIndicator field="total_hours" />
                    </span>
                  </th>
                  <th className="px-2 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap sticky right-0 bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-terra-50 flex items-center justify-center mb-4">
                          <ClipboardList className="w-5 h-5 text-terra-500" />
                        </div>
                        <p className="text-[13px] font-semibold text-neutral-800 mb-1">
                          No attendance records
                        </p>
                        <p className="text-[11px] text-neutral-500 font-medium">
                          {hasActiveFilters ? 'Try adjusting your filters or search query' : `No data available for ${selectedDate}`}
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="mt-3 text-[13px] font-semibold text-terra-500 hover:text-terra-600 transition-colors"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((entry: any) => {
                    const badge = getStatusBadge(entry.status);
                    const shift = SHIFT_CONFIG[entry.shift_type] || SHIFT_CONFIG.morning;
                    return (
                      <tr
                        key={entry.id || `${entry.staff_id}-${entry.date}`}
                        className="group bg-white hover:bg-neutral-50/30 transition-colors duration-100"
                      >
                        {/* Staff Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/staff/${entry.staff_id}`)}
                            className="text-sm font-semibold text-neutral-900 group-hover:text-terra-600 transition-colors text-left"
                          >
                            {entry.staff_name}
                          </button>
                          <p className="text-[11px] text-neutral-400 capitalize">{entry.department}</p>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-neutral-700 font-medium">{entry.staff_role}</span>
                        </td>

                        {/* Shift */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${shift.bg} ${shift.text} ${shift.border}`}>
                            {shift.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-neutral-500 font-mono">{entry.date}</span>
                        </td>

                        {/* Clock In */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-mono ${entry.clock_in ? 'text-neutral-700 font-medium' : 'text-neutral-300'}`}>
                            {entry.clock_in || '--:--'}
                          </span>
                        </td>

                        {/* Clock Out */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-mono ${entry.clock_out ? 'text-neutral-700 font-medium' : 'text-neutral-300'}`}>
                            {entry.clock_out || '--:--'}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Total Hours */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-neutral-900">
                            {entry.total_hours != null ? `${entry.total_hours}h` : '--'}
                          </span>
                        </td>

                        {/* Action - Sticky column */}
                        <td className="px-2 py-4 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                          <button
                            onClick={() => navigate(`/admin/staff/${entry.staff_id}`)}
                            className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4 text-neutral-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onGoToPage={goToPage}
            />
          </div>
        )}

        {/* ── Mobile Export (shown at bottom on small screens) ── */}
        {!isLoading && entries.length > 0 && (
          <div className="sm:hidden px-3 py-3 border-t border-neutral-100">
            <Button variant="outline" icon={Download} onClick={handleExport} fullWidth>
              Export CSV
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}

// ── Standalone page export (kept for backwards compatibility) ──
export default function Attendance() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Attendance Management
            </h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Monitor daily staff attendance, clock-in/out status, and trends
            </p>
          </div>
        </header>
        <AttendanceContent />
      </div>
    </div>
  );
}
