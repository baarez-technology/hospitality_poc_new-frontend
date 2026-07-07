import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BedDouble,
  User,
  CheckCircle,
  AlertTriangle,
  Save,
  Play,
  Sparkles,
  MessageSquare,
  Loader2,
  QrCode
} from 'lucide-react';
import { StatusBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { Textarea } from '../../../components/staff-portal/ui/Input';
import { useHousekeepingActions } from '@/hooks/staff-portal/useStaffApi';
import { housekeepingService } from '@/api/services/housekeeping.service';
import { ScanDigitalKeyModal } from '@/components/housekeeping/modals/ScanDigitalKeyModal';

// Default checklist for housekeeping
const defaultChecklist = [
  { id: '1', task: 'Make bed with fresh linens', completed: false },
  { id: '2', task: 'Vacuum carpet/mop floor', completed: false },
  { id: '3', task: 'Clean and sanitize bathroom', completed: false },
  { id: '4', task: 'Wipe down all surfaces', completed: false },
  { id: '5', task: 'Empty trash bins', completed: false },
  { id: '6', task: 'Replenish toiletries', completed: false },
  { id: '7', task: 'Check minibar and replenish', completed: false },
  { id: '8', task: 'Clean mirrors and windows', completed: false },
];

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateRoomStatus } = useHousekeepingActions();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [checklist, setChecklist] = useState(defaultChecklist);
  const [scanModalOpen, setScanModalOpen] = useState(false);

  // Fetch room data including task details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        // Fetch all rooms (now includes task details from backend)
        const rooms = await housekeepingService.getRooms();
        const foundRoom = rooms.find((r: any) => r.id === Number(id));
        if (foundRoom) {
          setRoom(foundRoom);
          // BUG-003 FIX: Load persisted checklist from backend if available
          if (Array.isArray(foundRoom.checklist) && foundRoom.checklist.length > 0) {
            setChecklist(foundRoom.checklist);
          } else if (foundRoom.status === 'clean' || foundRoom.status === 'inspected') {
            setChecklist(defaultChecklist.map(c => ({ ...c, completed: true })));
          }
          // BUG-018 FIX: Pre-fill notes from task if available
          if (foundRoom.notes) {
            setNote(foundRoom.notes);
          }
        }
      } catch (err) {
        console.error('Failed to fetch room:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading room details...</span>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-16">
        <BedDouble className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text mb-2">Room Not Found</h2>
        <p className="text-text-light mb-4">The room you're looking for doesn't exist or you don't have access.</p>
        <Button variant="outline" onClick={() => navigate('/staff/housekeeping/rooms')}>
          Back to Rooms
        </Button>
      </div>
    );
  }

  const safeChecklist = Array.isArray(checklist) ? checklist : [];
  const checklistProgress = {
    completed: safeChecklist.filter(c => c.completed).length,
    total: safeChecklist.length,
    percentage: safeChecklist.length > 0 ? Math.round((safeChecklist.filter(c => c.completed).length / safeChecklist.length) * 100) : 0
  };

  const handleChecklistToggle = (checklistId: string) => {
    setChecklist(prev => {
      const updated = prev.map(item =>
        item.id === checklistId ? { ...item, completed: !item.completed } : item
      );
      // BUG-003 FIX: Persist checklist to backend via task update
      if (room?.task_id) {
        housekeepingService.updateTask(room.task_id, { checklist: updated } as any).catch(() => {});
      }
      return updated;
    });
  };

  const handleStatusChange = async (status: string) => {
    let success = false;

    if (status === 'in_progress' && room.task_id) {
      // Use startTask API which also updates room status
      try {
        await housekeepingService.startTask(room.task_id);
        success = true;
      } catch {
        success = await updateRoomStatus(room.id, status);
      }
    } else if (status === 'clean' && room.task_id) {
      // Use completeTask API which also updates room status
      try {
        // BUG-003 FIX: Send checklist data when completing task
        await housekeepingService.completeTask(room.task_id, { checklist, notes: note || undefined });
        success = true;
      } catch {
        success = await updateRoomStatus(room.id, status);
      }
    } else if (status === 'inspected') {
      // BUG-034 FIX: Use dedicated inspect endpoint for proper inspection logic
      try {
        await housekeepingService.inspectRoom(room.id, { passed: true });
        success = true;
      } catch {
        success = await updateRoomStatus(room.id, status);
      }
    } else {
      success = await updateRoomStatus(room.id, status);
    }

    if (success) {
      setRoom((prev: any) => ({ ...prev, status }));
      // Update checklist based on new status
      if (status === 'clean' || status === 'inspected') {
        setChecklist(defaultChecklist.map(c => ({ ...c, completed: true })));
      } else if (status === 'dirty') {
        setChecklist(defaultChecklist.map(c => ({ ...c, completed: false })));
      }
    }
  };

  const handleSaveNote = async () => {
    if (!room?.task_id) return;
    setIsSavingNote(true);
    try {
      // BUG-003 FIX: Actually persist notes to the backend
      await housekeepingService.updateTask(room.task_id, { notes: note });
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCompleteAll = () => {
    const allCompleted = defaultChecklist.map(item => ({ ...item, completed: true }));
    setChecklist(allCompleted);
    // BUG-003 FIX: Persist "complete all" state to backend
    if (room?.task_id) {
      housekeepingService.updateTask(room.task_id, { checklist: allCompleted } as any).catch(() => {});
    }
  };

  return (
    <div>
      {/* Page Header — back arrow (ghost, no border) inline with title */}
      <header className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/staff/housekeeping/rooms')}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
              Room {room.number}
            </h1>
            <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">{room.room_type || 'Standard Room'}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Room Status Card */}
          <div className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0
                    ${room.status === 'dirty' ? 'bg-rose-50' :
                      room.status === 'in_progress' ? 'bg-gold-50' :
                      room.status === 'clean' ? 'bg-sage-50' :
                      'bg-ocean-50'}
                  `}>
                    <BedDouble className={`w-6 h-6 sm:w-7 sm:h-7 ${
                      room.status === 'dirty' ? 'text-rose-600' :
                      room.status === 'in_progress' ? 'text-gold-600' :
                      room.status === 'clean' ? 'text-sage-600' :
                      'text-ocean-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Room {room.number}</h2>
                    <p className="text-[12px] sm:text-[13px] text-neutral-500">{room.room_type || 'Standard'} · Floor {room.floor}</p>
                  </div>
                </div>
                <StatusBadge status={room.status} />
              </div>
            </div>

            {/* Quick Status Actions */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap gap-2">
              {room.status === 'dirty' && (
                <Button icon={Play} onClick={() => handleStatusChange('in_progress')}>
                  Start Cleaning
                </Button>
              )}
              {room.status === 'in_progress' && (
                <>
                  <Button
                    variant="success"
                    icon={Sparkles}
                    onClick={() => handleStatusChange('clean')}
                  >
                    Mark as Clean
                  </Button>
                  <Button
                    variant="outline-neutral"
                    onClick={() => handleStatusChange('dirty')}
                  >
                    Reset to Dirty
                  </Button>
                </>
              )}
              {room.status === 'clean' && (
                <>
                  <Button
                    variant="primary"
                    icon={CheckCircle}
                    onClick={() => handleStatusChange('inspected')}
                  >
                    Mark Inspected
                  </Button>
                  <Button
                    variant="outline-neutral"
                    onClick={() => handleStatusChange('dirty')}
                  >
                    Needs Re-Cleaning
                  </Button>
                </>
              )}
              {room.status === 'inspected' && (
                <div className="flex items-center gap-2 text-sage-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-[13px] font-medium">Room is ready for guest</span>
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-[10px] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">Cleaning Checklist</h3>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                  {checklistProgress.completed} of {checklistProgress.total} completed
                </p>
              </div>
              <Button
                variant="outline-neutral"
                size="sm"
                onClick={handleCompleteAll}
                disabled={checklistProgress.percentage === 100}
              >
                Complete All
              </Button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5">
              {/* Progress Bar */}
              <div className="mb-5">
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      checklistProgress.percentage === 100 ? 'bg-sage-500' :
                      checklistProgress.percentage > 50 ? 'bg-ocean-500' :
                      checklistProgress.percentage > 0 ? 'bg-gold-500' :
                      'bg-neutral-200'
                    }`}
                    style={{ width: `${checklistProgress.percentage}%` }}
                  />
                </div>
                <p className="text-right text-[11px] text-neutral-400 font-medium mt-1.5">
                  {checklistProgress.percentage}% complete
                </p>
              </div>

              {/* Checklist Items */}
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleChecklistToggle(item.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                      ${item.completed
                        ? 'bg-sage-50/50 hover:bg-sage-50'
                        : 'bg-neutral-50 hover:bg-neutral-100'}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                        ${item.completed
                          ? 'bg-sage-500 text-white'
                          : 'border-2 border-neutral-300 bg-white'}
                      `}
                    >
                      {item.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[13px] flex-1 ${item.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — sticky so it tracks with scroll and no bottom gap */}
        <div className="xl:sticky xl:top-6 space-y-4 sm:space-y-6 self-start">
          {/* Room Info */}
          <div className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-800">Room Information</h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
                  <BedDouble className="w-4 h-4 text-terra-600" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-medium">Room Type</p>
                  <p className="text-[13px] font-medium text-neutral-800">{room.room_type || 'Standard'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-ocean-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-ocean-600" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-medium">Capacity</p>
                  <p className="text-[13px] font-medium text-neutral-800">{room.capacity || 2} guests (max {room.max_occupancy || 4})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-gold-600" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-medium">Last Cleaned</p>
                  <p className="text-[13px] font-medium text-neutral-800">
                    {room.last_cleaned
                      ? new Date(room.last_cleaned).toLocaleDateString()
                      : 'Not recorded'}
                  </p>
                </div>
              </div>

              {room.bed_type && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sage-50 flex items-center justify-center flex-shrink-0">
                    <BedDouble className="w-4 h-4 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400 font-medium">Bed Type</p>
                    <p className="text-[13px] font-medium text-neutral-800">{room.bed_type}</p>
                  </div>
                </div>
              )}

              {room.view_type && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-ocean-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-ocean-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400 font-medium">View</p>
                    <p className="text-[13px] font-medium text-neutral-800">{room.view_type}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes — moved to sidebar so both columns are balanced */}
          <div className="rounded-[10px] bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-800">Notes</h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add notes about this room..."
                rows={3}
              />

              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  icon={Save}
                  onClick={handleSaveNote}
                  isLoading={isSavingNote}
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-800">Quick Actions</h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-2">
              <Button
                variant="primary"
                fullWidth
                className="justify-start"
                icon={QrCode}
                onClick={() => setScanModalOpen(true)}
              >
                Scan Digital Key
              </Button>
              <Button
                variant="outline-neutral"
                fullWidth
                className="justify-start"
                onClick={() => handleStatusChange('dirty')}
              >
                Mark as Dirty
              </Button>
              <Button
                variant="outline-neutral"
                fullWidth
                className="justify-start"
                onClick={() => handleStatusChange('out_of_order')}
              >
                Mark Out of Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Digital Key Modal */}
      <ScanDigitalKeyModal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        roomNumber={room?.number}
      />
    </div>
  );
};

export default RoomDetails;
