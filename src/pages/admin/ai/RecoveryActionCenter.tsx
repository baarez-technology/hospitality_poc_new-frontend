/**
 * Recovery Action Center - CRM AI Feature
 * Dashboard for managing guest recovery actions and service recovery workflows
 */
import React, { useState } from 'react';
import {
  Heart,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  Plus,
  Filter,
  MessageSquare,
  Gift,
  Phone,
  Mail,
  TrendingUp,
  ArrowUpRight,
  XCircle,
  Zap,
  Target,
} from 'lucide-react';

interface RecoveryCase {
  id: string;
  guestName: string;
  guestEmail: string;
  issueType: 'service' | 'billing' | 'room' | 'amenity' | 'staff';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_progress' | 'pending_guest' | 'resolved' | 'closed';
  description: string;
  detectedAt: string;
  assignedTo: string | null;
  recommendedActions: string[];
  recoveryValue: number;
  guestLTV: number;
}

const mockCases: RecoveryCase[] = [
  {
    id: '1',
    guestName: 'Robert Martinez',
    guestEmail: 'r.martinez@email.com',
    issueType: 'service',
    severity: 'critical',
    status: 'new',
    description: 'Guest complained about slow room service and cold food delivery. This is their third stay and they have high LTV.',
    detectedAt: '2024-01-20T08:30:00Z',
    assignedTo: null,
    recommendedActions: ['Personal apology call', 'Complimentary dinner', 'Room upgrade for next stay'],
    recoveryValue: 2500,
    guestLTV: 8900,
  },
  {
    id: '2',
    guestName: 'Jennifer Lee',
    guestEmail: 'j.lee@email.com',
    issueType: 'room',
    severity: 'high',
    status: 'in_progress',
    description: 'AC malfunction reported during peak summer. Guest had to wait 2 hours for resolution.',
    detectedAt: '2024-01-19T16:45:00Z',
    assignedTo: 'Sarah Chen',
    recommendedActions: ['Spa credit', 'Partial refund', 'Follow-up survey'],
    recoveryValue: 1200,
    guestLTV: 4500,
  },
  {
    id: '3',
    guestName: 'Michael Brown',
    guestEmail: 'm.brown@email.com',
    issueType: 'billing',
    severity: 'medium',
    status: 'pending_guest',
    description: 'Incorrect charges on final bill. Guest disputed minibar items they claim not to have used.',
    detectedAt: '2024-01-18T10:00:00Z',
    assignedTo: 'John Smith',
    recommendedActions: ['Review charges', 'Issue credit if valid', 'Loyalty points bonus'],
    recoveryValue: 350,
    guestLTV: 2100,
  },
  {
    id: '4',
    guestName: 'Amanda Wilson',
    guestEmail: 'a.wilson@email.com',
    issueType: 'amenity',
    severity: 'low',
    status: 'resolved',
    description: 'Pool was closed for maintenance during guest stay without prior notice.',
    detectedAt: '2024-01-17T14:20:00Z',
    assignedTo: 'Emily Davis',
    recommendedActions: ['Free day pass for future visit', 'Apology email'],
    recoveryValue: 150,
    guestLTV: 1800,
  },
];

const severityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors = {
  new: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-blue-100 text-blue-700',
  pending_guest: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-neutral-100 text-neutral-700',
};

const issueTypeIcons = {
  service: MessageSquare,
  billing: Target,
  room: Heart,
  amenity: Gift,
  staff: Users,
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'amber' | 'red';
}) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 text-blue-600',
    green: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600',
    red: 'from-red-500/10 to-red-600/10 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const CaseCard = ({ recoveryCase }: { recoveryCase: RecoveryCase }) => {
  const IssueIcon = issueTypeIcons[recoveryCase.issueType];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <IssueIcon className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{recoveryCase.guestName}</h3>
            <p className="text-sm text-neutral-500">{recoveryCase.guestEmail}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[recoveryCase.severity]}`}>
            {recoveryCase.severity}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[recoveryCase.status]}`}>
            {recoveryCase.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{recoveryCase.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500">Recovery Value</p>
          <p className="text-lg font-bold text-emerald-600">₹{recoveryCase.recoveryValue.toLocaleString()}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500">Guest LTV</p>
          <p className="text-lg font-bold text-neutral-900">₹{recoveryCase.guestLTV.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-neutral-500 mb-2">AI RECOMMENDED ACTIONS</p>
        <div className="space-y-1">
          {recoveryCase.recommendedActions.slice(0, 2).map((action, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-neutral-600">
              <Zap className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
              {action}
            </div>
          ))}
          {recoveryCase.recommendedActions.length > 2 && (
            <p className="text-xs text-[#A57865]">+{recoveryCase.recommendedActions.length - 2} more</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Clock className="w-3 h-3" />
          {new Date(recoveryCase.detectedAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {recoveryCase.status === 'new' && (
            <button className="px-3 py-1.5 bg-[#A57865] text-white text-xs font-medium rounded-lg hover:bg-[#8E6554] transition-colors">
              Take Action
            </button>
          )}
          <button className="text-xs font-medium text-[#A57865] hover:text-[#8E6554] flex items-center gap-1">
            Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RecoveryActionCenter() {
  const [cases] = useState<RecoveryCase[]>(mockCases);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');

  const filteredCases = cases.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const newCases = cases.filter((c) => c.status === 'new').length;
  const inProgressCases = cases.filter((c) => c.status === 'in_progress').length;
  const resolvedCases = cases.filter((c) => c.status === 'resolved').length;
  const totalRecoveryValue = cases.reduce((sum, c) => sum + c.recoveryValue, 0);

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Recovery Action Center</h1>
            <p className="text-sm text-neutral-500">
              Manage guest recovery cases and service recovery workflows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white rounded-xl text-sm font-medium hover:from-[#8E6554] hover:to-[#7D5443] transition-colors">
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="New Cases"
          value={newCases}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="In Progress"
          value={inProgressCases}
          subtitle="Being handled"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved"
          value={resolvedCases}
          subtitle="This month"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Recovery Value"
          value={`₹${totalRecoveryValue.toLocaleString()}`}
          subtitle="Potential saved revenue"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Call Guest</p>
              <p className="text-xs text-neutral-500">Direct outreach</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Send Email</p>
              <p className="text-xs text-neutral-500">Apology template</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Offer Comp</p>
              <p className="text-xs text-neutral-500">Credits & upgrades</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Live Chat</p>
              <p className="text-xs text-neutral-500">Real-time support</p>
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            All Cases
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'new' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'in_progress' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'resolved' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCases.map((recoveryCase) => (
          <CaseCard key={recoveryCase.id} recoveryCase={recoveryCase} />
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No cases found</h3>
          <p className="text-sm text-neutral-500">No recovery cases match your current filter.</p>
        </div>
      )}
    </div>
  );
}
