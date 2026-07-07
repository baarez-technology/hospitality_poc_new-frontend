/**
 * Guest Chat Widget
 * A comprehensive chatbot interface for hotel guests
 * Features:
 * - Booking verification
 * - Service requests (housekeeping, maintenance, room service)
 * - Task status tracking
 * - Quick action buttons
 * - Persistent chat history
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Bot,
  Sparkles,
  ChevronDown,
  Home,
  Wrench,
  UtensilsCrossed,
  HelpCircle,
  Phone,
  Search,
  Calendar,
  BedDouble,
  UserCheck,
  DollarSign,
  Mail,
  MapPin,
  Award,
  Star,
  ChevronLeft,
  XCircle,
} from 'lucide-react';
import { useChat, Message, BookingContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

// ============== Sub-components ==============

interface QuickActionButtonProps {
  label: string;
  action: string;
  icon?: React.ReactNode;
  onClick: (action: string) => void;
}

const QuickActionButton = ({ label, action, icon, onClick }: QuickActionButtonProps) => (
  <button
    onClick={() => onClick(action)}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full border border-primary-200 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface TaskStatusBadgeProps {
  status?: string;
  estimatedTime?: number;
  assignedStaff?: string;
  // Enhanced task details
  priority?: 'critical' | 'high' | 'medium' | 'low';
  title?: string;
  description?: string;
  category?: string;
  detectedIssue?: string;
  requiredSkills?: string[];
  assignedStaffRole?: string;
  taskType?: string;
}

const TaskStatusBadge = ({
  status,
  estimatedTime,
  assignedStaff,
  priority,
  title,
  description,
  category,
  detectedIssue,
  requiredSkills,
  assignedStaffRole,
  taskType,
}: TaskStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, text: 'Completed', color: 'text-green-600 bg-green-50', borderColor: 'border-green-200' };
      case 'in_progress':
        return { icon: Loader2, text: 'In Progress', color: 'text-blue-600 bg-blue-50', borderColor: 'border-blue-200', animate: true };
      case 'assigned':
        return { icon: Clock, text: 'Assigned', color: 'text-amber-600 bg-amber-50', borderColor: 'border-amber-200' };
      default:
        return { icon: AlertCircle, text: 'Pending', color: 'text-neutral-600 bg-neutral-50', borderColor: 'border-neutral-200' };
    }
  };

  const getPriorityConfig = () => {
    switch (priority) {
      case 'critical':
        return { text: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' };
      case 'high':
        return { text: 'High Priority', color: 'bg-orange-100 text-orange-700 border-orange-300' };
      case 'medium':
        return { text: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      case 'low':
        return { text: 'Low', color: 'bg-green-100 text-green-700 border-green-300' };
      default:
        return null;
    }
  };

  const getTaskTypeIcon = () => {
    switch (taskType) {
      case 'maintenance':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'housekeeping':
        return <Home className="w-3.5 h-3.5" />;
      case 'room_service':
        return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'concierge':
        return <User className="w-3.5 h-3.5" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  const config = getStatusConfig();
  const priorityConfig = getPriorityConfig();
  const Icon = config.icon;

  return (
    <div className={cn('mt-3 p-3 rounded-lg text-sm border', config.color, config.borderColor)}>
      {/* Header with status and priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.animate && 'animate-spin')} />
          <span className="font-semibold">{config.text}</span>
        </div>
        {priorityConfig && (
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', priorityConfig.color)}>
            {priorityConfig.text}
          </span>
        )}
      </div>

      {/* Task title and category */}
      {(title || category) && (
        <div className="mb-2 pb-2 border-b border-current/10">
          {title && (
            <div className="flex items-center gap-2">
              {getTaskTypeIcon()}
              <span className="font-medium">{title}</span>
            </div>
          )}
          {category && (
            <p className="text-xs opacity-70 mt-0.5 ml-5">{category}</p>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs opacity-80 mb-2">{description}</p>
      )}

      {/* Staff assignment */}
      {assignedStaff && (
        <div className="flex items-center gap-2 text-xs">
          <UserCheck className="w-3.5 h-3.5" />
          <span>
            <span className="font-medium">{assignedStaff}</span>
            {assignedStaffRole && <span className="opacity-70"> ({assignedStaffRole})</span>}
          </span>
        </div>
      )}

      {/* Estimated time */}
      {estimatedTime && status !== 'completed' && (
        <div className="flex items-center gap-2 text-xs mt-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Est. arrival: ~{estimatedTime} min</span>
        </div>
      )}

      {/* Required skills */}
      {requiredSkills && requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {requiredSkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 text-[10px] bg-white/50 rounded capitalize"
            >
              {skill.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Detected issue indicator */}
      {detectedIssue && status !== 'completed' && (
        <div className="mt-2 pt-2 border-t border-current/10">
          <p className="text-[10px] opacity-60">
            Issue detected: {detectedIssue.replace('_', ' ')}
          </p>
        </div>
      )}
    </div>
  );
};

interface BookingInfoCardProps {
  bookingInfo: NonNullable<Message['bookingInfo']>;
}

const BookingInfoCard = ({ bookingInfo }: BookingInfoCardProps) => (
  <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
    <div className="flex items-center gap-2 mb-2">
      <Home className="w-4 h-4 text-primary-600" />
      <span className="font-medium text-primary-700">Booking Info</span>
    </div>
    <div className="text-sm text-primary-800 space-y-1">
      <p>Confirmation: {bookingInfo.confirmationCode}</p>
      {bookingInfo.roomNumber && <p>Room: {bookingInfo.roomNumber}</p>}
      {bookingInfo.guestName && <p>Guest: {bookingInfo.guestName}</p>}
      {bookingInfo.status && (
        <p className="capitalize">Status: {bookingInfo.status.replace('_', ' ')}</p>
      )}
    </div>
  </div>
);

// Room Search Results Card
interface RoomSearchResultsCardProps {
  results: NonNullable<Message['roomSearchResults']>;
  onQuickAction: (action: string) => void;
}

const RoomSearchResultsCard = ({ results, onQuickAction }: RoomSearchResultsCardProps) => (
  <div className="mt-2 space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
      <Search className="w-4 h-4" />
      <span>Available Rooms ({results.length})</span>
    </div>
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {results.map((room) => (
        <div
          key={room.id}
          className="p-3 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-neutral-900">{room.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <BedDouble className="w-3 h-3" />
                  Max {room.max_occupancy} guests
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {room.available_count} available
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary-600">₹{room.price_per_night}</span>
              <span className="text-xs text-neutral-500 block">/night</span>
            </div>
          </div>
          {room.description && (
            <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{room.description}</p>
          )}
          <button
            onClick={() => onQuickAction(`book_room_${room.id}`)}
            className="mt-2 w-full py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            Book This Room
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Profile Info Card
interface ProfileInfoCardProps {
  profile: NonNullable<Message['profileInfo']>;
}

const ProfileInfoCard = ({ profile }: ProfileInfoCardProps) => (
  <div className="mt-2 p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
    <div className="flex items-center gap-2 mb-3">
      <UserCheck className="w-4 h-4 text-primary-600" />
      <span className="font-medium text-primary-700">Your Profile</span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      {profile.name && (
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">{profile.name}</span>
        </div>
      )}
      {profile.email && (
        <div className="flex items-center gap-2 col-span-2">
          <Mail className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700 truncate">{profile.email}</span>
        </div>
      )}
      {profile.phone && (
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">{profile.phone}</span>
        </div>
      )}
      {profile.country && (
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">{profile.country}</span>
        </div>
      )}
    </div>
    {(profile.loyalty_tier || profile.loyalty_points !== undefined) && (
      <div className="mt-3 pt-3 border-t border-primary-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">{profile.loyalty_tier || 'Member'}</span>
        </div>
        {profile.loyalty_points !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">{profile.loyalty_points.toLocaleString()} pts</span>
          </div>
        )}
      </div>
    )}
    {profile.total_stays !== undefined && (
      <p className="text-xs text-primary-600 mt-2">Total stays: {profile.total_stays}</p>
    )}
  </div>
);

// Bookings List Card
interface BookingsListCardProps {
  bookings: NonNullable<Message['bookingsList']>;
  onQuickAction: (action: string) => void;
}

const BookingsListCard = ({ bookings, onQuickAction }: BookingsListCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'checked_in':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
        <Calendar className="w-4 h-4" />
        <span>Your Bookings ({bookings.length})</span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-3 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors cursor-pointer"
            onClick={() => onQuickAction(`view_booking_${booking.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-neutral-900">{booking.confirmation_code}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {booking.room_type_name || 'Room assignment pending'}
                </p>
              </div>
              <span className={cn('px-2 py-0.5 text-xs rounded-full capitalize', getStatusColor(booking.status))}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(booking.arrival_date).toLocaleDateString()} - {new Date(booking.departure_date).toLocaleDateString()}
              </span>
              {booking.total_price !== undefined && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ₹{booking.total_price}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pre-checkin Progress Card
interface PrecheckinProgressCardProps {
  precheckin: NonNullable<Message['precheckinInfo']>;
  onQuickAction: (action: string) => void;
}

const PrecheckinProgressCard = ({ precheckin, onQuickAction }: PrecheckinProgressCardProps) => {
  const getStepNumber = (step?: string) => {
    const steps = ['verify', 'contact', 'preferences', 'room_select', 'complete'];
    return step ? steps.indexOf(step) + 1 : 1;
  };

  return (
    <div className="mt-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-700">Pre-Check-in</span>
        </div>
        {precheckin.progress !== undefined && (
          <span className="text-xs font-medium text-blue-600">{precheckin.progress}% complete</span>
        )}
      </div>

      {/* Progress bar */}
      {precheckin.progress !== undefined && (
        <div className="w-full h-2 bg-blue-200 rounded-full mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${precheckin.progress}%` }}
          />
        </div>
      )}

      {/* Step indicator */}
      <div className="flex justify-between mb-3">
        {['Verify', 'Contact', 'Preferences', 'Room', 'Complete'].map((label, idx) => (
          <div
            key={label}
            className={cn(
              'flex flex-col items-center',
              idx + 1 <= getStepNumber(precheckin.step) ? 'text-blue-600' : 'text-neutral-400'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1',
                idx + 1 < getStepNumber(precheckin.step)
                  ? 'bg-blue-600 text-white'
                  : idx + 1 === getStepNumber(precheckin.step)
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                  : 'bg-neutral-100 text-neutral-400'
              )}
            >
              {idx + 1 < getStepNumber(precheckin.step) ? <CheckCircle className="w-3 h-3" /> : idx + 1}
            </div>
            <span className="text-[10px]">{label}</span>
          </div>
        ))}
      </div>

      {/* Room assignment info */}
      {precheckin.room_number && (
        <div className="p-2 bg-white rounded-lg mt-2">
          <p className="text-sm text-neutral-700">
            <span className="font-medium">Assigned Room:</span> {precheckin.room_number}
          </p>
        </div>
      )}

      {/* Recommended rooms */}
      {precheckin.recommended_rooms && precheckin.recommended_rooms.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-blue-700 mb-2">Recommended Rooms:</p>
          <div className="space-y-1">
            {precheckin.recommended_rooms.slice(0, 3).map((room) => (
              <button
                key={room.id}
                onClick={() => onQuickAction(`select_room_${room.id}`)}
                className="w-full p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900">Room {room.room_number}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600">{room.score}% match</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Flow Progress Indicator
interface FlowProgressIndicatorProps {
  flowState: NonNullable<Message['flowState']>;
  onGoBack: () => void;
  onCancel: () => void;
}

const FlowProgressIndicator = ({ flowState, onGoBack, onCancel }: FlowProgressIndicatorProps) => (
  <div className="mt-2 p-2 bg-neutral-100 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {flowState.canGoBack && (
          <button
            onClick={onGoBack}
            className="p-1 hover:bg-neutral-200 rounded transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-600" />
          </button>
        )}
        <span className="text-xs font-medium text-neutral-600">
          {flowState.stepLabel} ({flowState.currentStep}/{flowState.totalSteps})
        </span>
      </div>
      {flowState.canCancel && (
        <button
          onClick={onCancel}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
          title="Cancel"
        >
          <XCircle className="w-4 h-4 text-neutral-500 hover:text-red-500" />
        </button>
      )}
    </div>
    <div className="w-full h-1.5 bg-neutral-200 rounded-full">
      <div
        className="h-full bg-primary-500 rounded-full transition-all duration-300"
        style={{ width: `${flowState.progress}%` }}
      />
    </div>
  </div>
);

// Auth Error Card
interface AuthErrorCardProps {
  error: string;
}

const AuthErrorCard = ({ error }: AuthErrorCardProps) => (
  <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
    <div className="flex items-center gap-2 text-red-700">
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm font-medium">Authorization Required</span>
    </div>
    <p className="text-xs text-red-600 mt-1">{error}</p>
  </div>
);

interface ChatMessageProps {
  message: Message;
  onQuickAction: (action: string) => void;
}

const ChatMessage = ({ message, onQuickAction }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'housekeeping':
        return <Home className="w-3 h-3" />;
      case 'maintenance':
        return <Wrench className="w-3 h-3" />;
      case 'room_service':
        return <UtensilsCrossed className="w-3 h-3" />;
      case 'faq':
        return <HelpCircle className="w-3 h-3" />;
      case 'front_desk':
        return <Phone className="w-3 h-3" />;
      case 'room_search':
      case 'find_rooms':
        return <Search className="w-3 h-3" />;
      case 'my_bookings':
      case 'view_bookings':
        return <Calendar className="w-3 h-3" />;
      case 'precheckin':
      case 'start_precheckin':
        return <UserCheck className="w-3 h-3" />;
      case 'view_profile':
      case 'my_profile':
        return <User className="w-3 h-3" />;
      case 'make_booking':
      case 'book_room':
        return <BedDouble className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2 mb-4', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn('max-w-[80%]', isUser && 'order-first')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
          )}
        >
          {/* Message Text - preserve newlines */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Task Status */}
          {message.taskInfo && (
            <TaskStatusBadge
              status={message.taskInfo.status}
              estimatedTime={message.taskInfo.estimatedTime}
              assignedStaff={message.taskInfo.assignedStaffName}
              taskType={message.taskInfo.taskType}
              priority={message.taskInfo.priority}
              title={message.taskInfo.title}
              description={message.taskInfo.description}
              category={message.taskInfo.category}
              detectedIssue={message.taskInfo.detectedIssue}
              requiredSkills={message.taskInfo.requiredSkills}
              assignedStaffRole={message.taskInfo.assignedStaffRole}
            />
          )}

          {/* Booking Info */}
          {message.bookingInfo && (
            <BookingInfoCard bookingInfo={message.bookingInfo} />
          )}

          {/* Room Search Results */}
          {message.roomSearchResults && message.roomSearchResults.length > 0 && (
            <RoomSearchResultsCard results={message.roomSearchResults} onQuickAction={onQuickAction} />
          )}

          {/* Profile Info */}
          {message.profileInfo && (
            <ProfileInfoCard profile={message.profileInfo} />
          )}

          {/* Bookings List */}
          {message.bookingsList && message.bookingsList.length > 0 && (
            <BookingsListCard bookings={message.bookingsList} onQuickAction={onQuickAction} />
          )}

          {/* Pre-checkin Progress */}
          {message.precheckinInfo && (
            <PrecheckinProgressCard precheckin={message.precheckinInfo} onQuickAction={onQuickAction} />
          )}

          {/* Flow Progress Indicator */}
          {message.flowState && message.flowState.flowType && (
            <FlowProgressIndicator
              flowState={message.flowState}
              onGoBack={() => onQuickAction('go_back')}
              onCancel={() => onQuickAction('cancel_flow')}
            />
          )}

          {/* Auth Error */}
          {message.authError && (
            <AuthErrorCard error={message.authError} />
          )}
        </div>

        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.quickActions.map((action, idx) => (
              <QuickActionButton
                key={idx}
                label={action.label}
                action={action.action}
                icon={getActionIcon(action.action)}
                onClick={onQuickAction}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={cn('text-[10px] mt-1 opacity-50', isUser ? 'text-right' : 'text-left')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
          <User className="w-4 h-4 text-neutral-600" />
        </div>
      )}
    </motion.div>
  );
};

// ============== Booking Input Modal ==============

interface BookingInputProps {
  onSubmit: (bookingNumber: string) => void;
  onCancel: () => void;
}

const BookingInput = ({ onSubmit, onCancel }: BookingInputProps) => {
  const [bookingNumber, setBookingNumber] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingNumber.trim()) {
      onSubmit(bookingNumber.trim().toUpperCase());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 bg-primary-50 border-t border-primary-100"
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-primary-800 mb-2">
          Enter your booking confirmation number:
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={bookingNumber}
            onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
            placeholder="e.g., GLIM123456"
            className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm uppercase"
          />
          <button
            type="submit"
            disabled={!bookingNumber.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-primary-600 mt-2">
          You can find this in your booking confirmation email
        </p>
      </form>
    </motion.div>
  );
};

// ============== Main Component ==============

export function GuestChatWidget() {
  const {
    messages,
    isOpen,
    isTyping,
    unreadCount,
    bookingContext,
    sendMessage,
    toggleChat,
    closeChat,
    clearHistory,
    lookupBooking,
    handleQuickAction,
  } = useChat();

  const [input, setInput] = useState('');
  const [showBookingInput, setShowBookingInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    if (input.trim() && !isTyping) {
      // Check if this looks like a booking number
      const bookingPattern = /^[A-Z0-9]{6,12}$/i;
      if (bookingPattern.test(input.trim())) {
        lookupBooking(input.trim());
      } else {
        sendMessage(input.trim());
      }
      setInput('');
    }
  }, [input, isTyping, sendMessage, lookupBooking]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onQuickAction = useCallback((action: string) => {
    if (action === 'enter_booking') {
      setShowBookingInput(true);
    } else {
      handleQuickAction(action);
    }
  }, [handleQuickAction]);

  const handleBookingSubmit = async (bookingNumber: string) => {
    setShowBookingInput(false);
    await lookupBooking(bookingNumber);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Chat with us
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeChat}
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 z-50 w-full h-[100dvh] lg:bottom-6 lg:right-6 lg:w-[400px] lg:h-[600px] lg:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Guest Assistant</h3>
                    <p className="text-xs text-white/80">
                      {bookingContext?.roomNumber
                        ? `Room ${bookingContext.roomNumber}`
                        : 'Here to help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearHistory}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closeChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-neutral-50">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onQuickAction={onQuickAction}
                  />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-neutral-100 rounded-2xl px-4 py-2.5 rounded-bl-md">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Booking Input */}
              <AnimatePresence>
                {showBookingInput && (
                  <BookingInput
                    onSubmit={handleBookingSubmit}
                    onCancel={() => setShowBookingInput(false)}
                  />
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-4 border-t border-neutral-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Suggestions */}
                {messages.length <= 2 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {!bookingContext && (
                      <button
                        onClick={() => setShowBookingInput(true)}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors flex items-center gap-1"
                      >
                        <Home className="w-3 h-3" />
                        Enter Booking
                      </button>
                    )}
                    <button
                      onClick={() => handleQuickAction('room_search')}
                      className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      Find Rooms
                    </button>
                    <button
                      onClick={() => handleQuickAction('my_bookings')}
                      className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      My Bookings
                    </button>
                    <button
                      onClick={() => handleQuickAction('precheckin')}
                      className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      Pre-Check-In
                    </button>
                    <button
                      onClick={() => handleQuickAction('faq')}
                      className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      FAQ
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default GuestChatWidget;
