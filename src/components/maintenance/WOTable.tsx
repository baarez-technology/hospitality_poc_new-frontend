import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { WO_CATEGORIES, formatDateTime } from '../../utils/maintenance';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions, TableEmpty } from '../ui2/Table';
import { IconButton } from '../ui2/Button';
import { Badge, StatusBadge } from '../ui2/Badge';

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
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  const buttonRefs = useRef({});

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        const isButtonClick = Object.values(buttonRefs.current).some(
          btn => btn && btn.contains(e.target)
        );
        if (!isButtonClick) {
          setOpenMenuId(null);
          setMenuPosition(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update menu position on scroll/resize
  useEffect(() => {
    if (!openMenuId) return;

    const updatePosition = () => {
      const button = buttonRefs.current[openMenuId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 6,
          left: rect.right - 176
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openMenuId]);

  const handleMenuClick = (e, woId) => {
    e.stopPropagation();
    if (openMenuId === woId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const button = buttonRefs.current[woId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 6,
          left: rect.right - 176
        });
      }
      setOpenMenuId(woId);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  // Map priority to Badge variant
  const getPriorityVariant = (priority) => {
    const variantMap = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'success',
      'normal': 'neutral'
    };
    return variantMap[priority] || 'neutral';
  };

  // Map status to StatusBadge
  const getStatusBadgeStatus = (status) => {
    const statusMap = {
      'open': 'pending',
      'in_progress': 'cleaning',
      'on_hold': 'maintenance',
      'completed': 'inspected',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || status;
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              width="140px"
              sortable
              sorted={sortField === 'id' ? sortDirection : null}
              onSort={() => handleSort('id')}
            >
              WO ID
            </TableHead>
            <TableHead
              width="110px"
              sortable
              sorted={sortField === 'room' ? sortDirection : null}
              onSort={() => handleSort('room')}
            >
              Room
            </TableHead>
            <TableHead width="180px">Issue</TableHead>
            <TableHead width="110px">Category</TableHead>
            <TableHead
              width="100px"
              align="center"
              sortable
              sorted={sortField === 'priority' ? sortDirection : null}
              onSort={() => handleSort('priority')}
            >
              Priority
            </TableHead>
            <TableHead
              width="120px"
              align="center"
              sortable
              sorted={sortField === 'status' ? sortDirection : null}
              onSort={() => handleSort('status')}
            >
              Status
            </TableHead>
            <TableHead width="180px">Technician</TableHead>
            <TableHead
              width="130px"
              sortable
              sorted={sortField === 'createdAt' ? sortDirection : null}
              onSort={() => handleSort('createdAt')}
            >
              Created
            </TableHead>
            <TableHead width="50px" align="center" sticky>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableEmpty
              icon={ClipboardList}
              title="No work orders found"
              description="No work orders match your current filters"
            />
          ) : (
            workOrders.map((wo) => (
              <TableRow
                key={wo.id}
                clickable
                onClick={() => onRowClick(wo)}
                className={wo.isOOO ? 'bg-rose-50/30' : ''}
              >
                {/* WO ID */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-neutral-900">{wo.displayId || wo.id}</span>
                    {wo.isOOO && (
                      <Badge variant="danger-solid" size="xs">OOO</Badge>
                    )}
                  </div>
                </TableCell>

                {/* Room */}
                <TableCell>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">
                      {wo.roomNumber || 'Common Area'}
                    </p>
                    {wo.roomType && (
                      <p className="text-xs text-neutral-500">{wo.roomType}</p>
                    )}
                  </div>
                </TableCell>

                {/* Issue */}
                <TableCell truncate>
                  <span title={wo.issue}>{wo.issue}</span>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <span className="text-sm text-neutral-700">{getCategoryLabel(wo.category)}</span>
                </TableCell>

                {/* Priority */}
                <TableCell align="center">
                  <Badge
                    variant={getPriorityVariant(wo.priority)}
                    size="sm"
                    icon={wo.priority === 'high' ? AlertTriangle : undefined}
                  >
                    {wo.priority ? wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1) : 'Normal'}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <StatusBadge status={getStatusBadgeStatus(wo.status)} size="sm" />
                </TableCell>

                {/* Technician */}
                <TableCell>
                  {wo.technicianName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 text-xs font-bold">
                        {(wo.technicianName || '').split(' ').filter(n => n).map(n => n[0]).join('') || 'T'}
                      </div>
                      <span className="text-sm font-medium text-neutral-700">{wo.technicianName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">Unassigned</span>
                  )}
                </TableCell>

                {/* Created */}
                <TableCell>
                  <span className="text-sm text-neutral-600">{formatDateTime(wo.createdAt)}</span>
                </TableCell>

                {/* Actions */}
                <TableActions sticky>
                  <div className="relative">
                    <div ref={(el) => { buttonRefs.current[wo.id] = el; }}>
                      <IconButton
                        icon={MoreVertical}
                        size="sm"
                        variant="ghost"
                        label="Actions"
                        onClick={(e) => handleMenuClick(e, wo.id)}
                      />
                    </div>

                    {openMenuId === wo.id && menuPosition && createPortal(
                      <div
                        ref={menuRef}
                        style={{
                          position: 'fixed',
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`,
                          zIndex: 9999
                        }}
                        className="w-44 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onRowClick(wo);
                          }}
                          className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          View Details
                        </button>

                        {wo.status === 'open' && (
                          <button
                            onClick={(e) => handleActionClick(e, onStartWO, wo)}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Start Work
                          </button>
                        )}

                        {(wo.status === 'open' || wo.status === 'in_progress') && (
                          <button
                            onClick={(e) => handleActionClick(e, onCompleteWO, wo)}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}

                        {wo.status === 'in_progress' && (
                          <button
                            onClick={(e) => handleActionClick(e, onHoldWO, wo)}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Put On Hold
                          </button>
                        )}

                        {(wo.status === 'on_hold' || wo.status === 'completed') && (
                          <button
                            onClick={(e) => handleActionClick(e, onReopenWO, wo)}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
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
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Assign Technician
                          </button>
                        )}

                        <div className="border-t border-neutral-100 my-1" />

                        <button
                          onClick={(e) => handleActionClick(e, onDeleteWO, wo)}
                          className="w-full px-4 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                </TableActions>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
