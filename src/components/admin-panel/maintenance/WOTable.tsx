import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Play,
  CheckCircle,
  Pause,
  RotateCcw,
  Eye,
  Trash2,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { PRIORITY_CONFIG, STATUS_CONFIG, WO_CATEGORIES, formatDateTime } from '@/utils/admin/maintenance';

export default function WOTable({
  workOrders,
  technicians,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  onStartWO,
  onCompleteWO,
  onHoldWO,
  onReopenWO,
  onDeleteWO,
  onAssignTech
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getPriorityBadge = (priority) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
        {priority === 'high' && <AlertTriangle className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const cat = WO_CATEGORIES.find(c => c.value === category);
    return cat?.label || category || '-';
  };

  const handleActionClick = (e, action, wo) => {
    e.stopPropagation();
    setOpenMenuId(null);
    action(wo.id);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF8F6] border-b border-neutral-200">
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  WO ID
                  <SortIcon field="id" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('room')}
              >
                <div className="flex items-center gap-1">
                  Room
                  <SortIcon field="room" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Issue
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Category
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center justify-center gap-1">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-center gap-1">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Technician
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Created
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {workOrders.map((wo) => (
              <tr
                key={wo.id}
                onClick={() => onRowClick(wo)}
                className={`hover:bg-[#FAF8F6]/50 cursor-pointer transition-colors ${
                  wo.isOOO ? 'bg-red-50/30' : ''
                }`}
              >
                {/* WO ID */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-neutral-900">{wo.id}</span>
                    {wo.isOOO && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                        OOO
                      </span>
                    )}
                  </div>
                </td>

                {/* Room */}
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">
                      {wo.roomNumber || 'Common Area'}
                    </p>
                    {wo.roomType && (
                      <p className="text-xs text-neutral-500">{wo.roomType}</p>
                    )}
                  </div>
                </td>

                {/* Issue */}
                <td className="px-4 py-3">
                  <p className="text-sm text-neutral-900 max-w-[200px] truncate" title={wo.issue}>
                    {wo.issue}
                  </p>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="text-sm text-neutral-700">{getCategoryLabel(wo.category)}</span>
                </td>

                {/* Priority */}
                <td className="px-4 py-3 text-center">
                  {getPriorityBadge(wo.priority)}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(wo.status)}
                </td>

                {/* Technician */}
                <td className="px-4 py-3">
                  {wo.technicianName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-xs font-bold">
                        {(wo.technicianName || '').split(' ').filter(n => n).map(n => n[0]).join('') || 'T'}
                      </div>
                      <span className="text-sm text-neutral-900">{wo.technicianName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400 italic">Unassigned</span>
                  )}
                </td>

                {/* Created */}
                <td className="px-4 py-3">
                  <span className="text-sm text-neutral-600">{formatDateTime(wo.createdAt)}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="relative flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === wo.id ? null : wo.id);
                      }}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-neutral-500" />
                    </button>

                    {openMenuId === wo.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onRowClick(wo);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          {wo.status === 'open' && (
                            <button
                              onClick={(e) => handleActionClick(e, onStartWO, wo)}
                              className="w-full px-4 py-2 text-left text-sm text-[#5C9BA4] hover:bg-[#5C9BA4]/10 flex items-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              Start Work
                            </button>
                          )}

                          {(wo.status === 'open' || wo.status === 'in_progress') && (
                            <button
                              onClick={(e) => handleActionClick(e, onCompleteWO, wo)}
                              className="w-full px-4 py-2 text-left text-sm text-[#4E5840] hover:bg-[#4E5840]/10 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Complete
                            </button>
                          )}

                          {wo.status === 'in_progress' && (
                            <button
                              onClick={(e) => handleActionClick(e, onHoldWO, wo)}
                              className="w-full px-4 py-2 text-left text-sm text-[#CDB261] hover:bg-[#CDB261]/10 flex items-center gap-2"
                            >
                              <Pause className="w-4 h-4" />
                              Put On Hold
                            </button>
                          )}

                          {(wo.status === 'on_hold' || wo.status === 'completed') && (
                            <button
                              onClick={(e) => handleActionClick(e, onReopenWO, wo)}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Reopen
                            </button>
                          )}

                          {!wo.assignedTo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onAssignTech(wo);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[#A57865] hover:bg-[#A57865]/10 flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4" />
                              Assign Technician
                            </button>
                          )}

                          <div className="border-t border-neutral-100 my-1" />

                          <button
                            onClick={(e) => handleActionClick(e, onDeleteWO, wo)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {workOrders.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-neutral-500">No work orders found</p>
          <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
