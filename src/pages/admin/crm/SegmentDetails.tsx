import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Edit2,
  Trash2,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Award,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  filterGuestsBySegment,
  calculateAverageLTV,
  calculateRepeatRate,
  getGuestLoyaltyTier,
  formatDate,
  formatCurrency,
  exportGuestsToCSV,
  generateLTVTrendData,
  generateStayFrequencyData,
  countByLoyaltyTier
} from '../../../utils/crm';
import EditSegmentModal from '../../../components/crm/EditSegmentModal';

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#CDB261',
  platinum: '#E5E4E2'
};

// AI Insights interface
interface SegmentAIInsights {
  healthDistribution: { excellent: number; good: number; fair: number; at_risk: number; critical: number };
  churnRisk: { low: number; medium: number; high: number };
  ltvSegments: { low: number; medium: number; high: number; premium: number };
  recommendations: string[];
}

export default function SegmentDetails({
  segments,
  guests,
  loyaltyTiers,
  onUpdateSegment,
  onDeleteSegment,
  showToast,
  aiInsights,
  aiLoading
}: {
  segments: any[];
  guests: any[];
  loyaltyTiers: any;
  onUpdateSegment: (segment: any) => void;
  onDeleteSegment: (id: string) => void;
  showToast: (msg: string, type: string) => void;
  aiInsights?: SegmentAIInsights | null;
  aiLoading?: boolean;
}) {
  const { segmentId } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const itemsPerPage = 10;

  const segment = useMemo(() => {
    return segments.find(s => s.id === segmentId);
  }, [segments, segmentId]);

  const segmentGuests = useMemo(() => {
    if (!segment) return [];
    return filterGuestsBySegment(guests, segment.filters || {});
  }, [segment, guests]);

  const filteredGuests = useMemo(() => {
    let result = [...segmentGuests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g =>
        (g.name || '').toLowerCase().includes(query) ||
        (g.email || '').toLowerCase().includes(query) ||
        (g.country || '').toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'stays':
          aVal = a.totalStays || 0;
          bVal = b.totalStays || 0;
          break;
        case 'ltv':
          aVal = a.totalRevenue || 0;
          bVal = b.totalRevenue || 0;
          break;
        case 'lastStay':
          aVal = new Date(a.lastStay || 0).getTime();
          bVal = new Date(b.lastStay || 0).getTime();
          break;
        default:
          aVal = a.name || '';
          bVal = b.name || '';
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [segmentGuests, searchQuery, sortField, sortDirection]);

  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGuests.slice(start, start + itemsPerPage);
  }, [filteredGuests, currentPage]);

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);

  // Chart data
  const ltvTrendData = useMemo(() => {
    return generateLTVTrendData(segmentGuests);
  }, [segmentGuests]);

  const stayFrequencyData = useMemo(() => {
    return generateStayFrequencyData(segmentGuests);
  }, [segmentGuests]);

  const tierDistribution = useMemo(() => {
    const counts = countByLoyaltyTier(segmentGuests, loyaltyTiers);
    return Object.entries(counts).map(([tier, count]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      value: count,
      color: TIER_COLORS[tier] || '#A57865'
    })).filter(d => d.value > 0);
  }, [segmentGuests, loyaltyTiers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    const result = exportGuestsToCSV(filteredGuests);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteSegment(segment.id);
  };

  const handleUpdateSegment = (updatedSegment) => {
    onUpdateSegment(updatedSegment);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (!segment) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-600">Segment not found</p>
          <button
            onClick={() => navigate('/admin/crm')}
            className="mt-4 text-[#A57865] hover:underline"
          >
            Return to CRM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/crm')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${segment.color || '#A57865'}20` }}
            >
              <Users className="w-6 h-6" style={{ color: segment.color || '#A57865' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{segment.name}</h1>
              <p className="text-sm text-neutral-500">{segment.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-rose-200 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#A57865]" />
            </div>
            <span className="text-sm text-neutral-500">Total Guests</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{segmentGuests.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#4E5840]" />
            </div>
            <span className="text-sm text-neutral-500">Average LTV</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(calculateAverageLTV(segmentGuests))}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <span className="text-sm text-neutral-500">Repeat Rate</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {calculateRepeatRate(segmentGuests)}%
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#CDB261]" />
            </div>
            <span className="text-sm text-neutral-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(segmentGuests.reduce((sum, g) => sum + (g.totalRevenue || 0), 0))}
          </p>
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-[#5C9BA4]/5 via-[#4E5840]/5 to-[#A57865]/5 rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C9BA4] to-[#4E5840] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">AI Segment Intelligence</h3>
              <p className="text-xs text-neutral-500">Powered by ReConnect AI</p>
            </div>
            {aiLoading && (
              <div className="ml-auto w-4 h-4 border-2 border-[#5C9BA4] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Health Distribution */}
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#4E5840]" />
                <span className="text-xs font-semibold text-neutral-600 uppercase">Health Score</span>
              </div>
              <div className="space-y-2">
                {Object.entries(aiInsights.healthDistribution).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600 capitalize">{level.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, count)}%`,
                            backgroundColor: level === 'excellent' ? '#22C55E' : level === 'good' ? '#4E5840' : level === 'fair' ? '#CDB261' : level === 'at_risk' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-900 w-8 text-right">{count}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Churn Risk */}
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-neutral-600 uppercase">Churn Risk</span>
              </div>
              <div className="space-y-2">
                {Object.entries(aiInsights.churnRisk).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600 capitalize">{level}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, count)}%`,
                            backgroundColor: level === 'low' ? '#22C55E' : level === 'medium' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-900 w-8 text-right">{count}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LTV Segments */}
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-[#A57865]" />
                <span className="text-xs font-semibold text-neutral-600 uppercase">LTV Distribution</span>
              </div>
              <div className="space-y-2">
                {Object.entries(aiInsights.ltvSegments).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600 capitalize">{level}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, count)}%`,
                            backgroundColor: level === 'premium' ? '#A57865' : level === 'high' ? '#4E5840' : level === 'medium' ? '#5C9BA4' : '#CDB261'
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-neutral-900 w-8 text-right">{count}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#CDB261]" />
              <span className="text-xs font-semibold text-neutral-600 uppercase">AI Recommendations</span>
            </div>
            <div className="space-y-2">
              {aiInsights.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-[#5C9BA4] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LTV Trend */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">LTV Trend</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ltvTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Avg LTV']}
                />
                <Line
                  type="monotone"
                  dataKey="ltv"
                  stroke="#A57865"
                  strokeWidth={2}
                  dot={{ fill: '#A57865' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stay Frequency */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Stay Frequency</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stayFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#4E5840" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Tier Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900">Segment Guests</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] w-[250px]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAF7F4] border-b border-neutral-200">
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Guest <SortIcon field="name" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Country
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('stays')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Stays <SortIcon field="stays" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('ltv')}
                >
                  <div className="flex items-center justify-center gap-1">
                    LTV <SortIcon field="ltv" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Tier
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('lastStay')}
                >
                  <div className="flex items-center gap-1">
                    Last Stay <SortIcon field="lastStay" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedGuests.map((guest) => {
                const tier = getGuestLoyaltyTier(guest, loyaltyTiers);
                return (
                  <tr key={guest.id} className="hover:bg-[#FAF7F4]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-sm font-bold">
                          {guest.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="font-semibold text-neutral-900 text-sm">{guest.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-neutral-600">
                          <Mail className="w-3 h-3" />
                          {guest.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Phone className="w-3 h-3" />
                          {guest.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Globe className="w-3 h-3" />
                        {guest.country}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-neutral-900">
                        {guest.totalStays || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-[#4E5840]">
                        {formatCurrency(guest.totalRevenue || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: tier.color }}
                      >
                        {tier.icon} {tier.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600">
                        {formatDate(guest.lastStay)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredGuests.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-neutral-500">No guests found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Showing {paginatedGuests.length} of {filteredGuests.length} guests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#A57865] text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Delete Segment?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Are you sure you want to delete "{segment.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                Delete Segment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditSegmentModal
        key={segment?.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateSegment}
        onDelete={onDeleteSegment}
        segment={segment}
        guests={guests}
        loyaltyTiers={loyaltyTiers}
      />
    </div>
  );
}
