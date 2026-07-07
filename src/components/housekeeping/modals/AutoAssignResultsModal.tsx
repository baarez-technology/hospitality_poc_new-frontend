/**
 * AutoAssignResultsModal Component
 * Shows detailed results after auto-assign operation
 * Glimmora Design System v5.0
 */

import { CheckCircle, XCircle, User, DoorOpen, Sparkles, X } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';

interface Assignment {
  roomId: number;
  roomNumber?: string;
  staffId: number;
  staffName: string;
  score?: number;
}

interface AutoAssignResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    assignments: Assignment[];
    summary: string;
    totalAssigned: number;
    failed?: number;
  } | null;
}

export default function AutoAssignResultsModal({
  isOpen,
  onClose,
  results
}: AutoAssignResultsModalProps) {
  if (!results) return null;

  const { assignments, summary, totalAssigned, failed = 0 } = results;

  // Group assignments by staff member
  const groupedByStaff = assignments.reduce((acc, assignment) => {
    const staffName = assignment.staffName || 'Unknown Staff';
    if (!acc[staffName]) {
      acc[staffName] = [];
    }
    acc[staffName].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-terra-500" />
        <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
          Auto-Assign Complete
        </h2>
      </div>
      <p className="text-[13px] text-neutral-500">
        {summary}
      </p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end">
      <Button variant="primary" size="md" onClick={onClose}>
        Done
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 rounded-xl bg-sage-50 border border-sage-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-sage-700">
                Assigned
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-sage-800">{totalAssigned}</p>
          </div>
          {failed > 0 && (
            <div className="p-3 sm:p-4 rounded-xl bg-rose-50 border border-rose-100">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                  Failed
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-rose-800">{failed}</p>
            </div>
          )}
        </div>

        {/* Assignments by Staff */}
        {Object.keys(groupedByStaff).length > 0 ? (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Assignment Details
            </h3>
            <div className="space-y-3">
              {Object.entries(groupedByStaff).map(([staffName, staffAssignments]) => (
                <div
                  key={staffName}
                  className="p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-terra-100 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
                    </div>
                    <div>
                      <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">
                        {staffName}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500">
                        {staffAssignments.length} room{staffAssignments.length !== 1 ? 's' : ''} assigned
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {staffAssignments.map((assignment) => (
                      <div
                        key={assignment.roomId}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-white border border-neutral-200"
                      >
                        <DoorOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500" />
                        <span className="text-[11px] sm:text-[12px] font-medium text-neutral-700">
                          {assignment.roomNumber || `Room ${assignment.roomId}`}
                        </span>
                        {assignment.score && (
                          <span className="text-[9px] sm:text-[10px] text-neutral-400 ml-1">
                            ({Math.round(assignment.score * 100)}%)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
            </div>
            <p className="text-[12px] sm:text-[13px] font-medium text-neutral-600">
              No assignments were made
            </p>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">
              All rooms may already be assigned or no staff available
            </p>
          </div>
        )}

        {/* Tip */}
        {totalAssigned > 0 && (
          <div className="p-3 rounded-lg bg-terra-50 border border-terra-100">
            <p className="text-[11px] text-terra-700">
              <span className="font-semibold">Tip:</span> You can view and manage all assignments in the room list.
              Click on any room card to see assignment details or reassign staff.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
