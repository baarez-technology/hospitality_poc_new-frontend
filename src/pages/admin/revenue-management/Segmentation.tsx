import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, RefreshCw, DollarSign } from 'lucide-react';
import { useRMS } from '../../../context/RMSContext';
import SegmentCard, { SegmentDetailPanel } from '../../../components/revenue-management/SegmentCard';
import { segments } from '../../../data/rms/sampleSegments';
import { Button } from '../../../components/ui2/Button';
import { useToast } from '../../../contexts/ToastContext';

const Segmentation = () => {
  const {
    segmentPerformance,
    segmentComparison,
    updateSegmentPerformance,
  } = useRMS();
  const toast = useToast();

  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewType, setViewType] = useState('cards'); // 'cards' | 'chart'

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateSegmentPerformance();
      toast.success('Segmentation data refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh segmentation data:', err);
      toast.error('Failed to refresh segmentation data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Prepare chart data
  const pieData = segments.map(seg => ({
    name: seg.name,
    value: segmentPerformance[seg.id]?.metrics.revenueContribution || 0,
    revenue: segmentPerformance[seg.id]?.ytd.revenue || 0,
    color: seg.color,
  })).sort((a, b) => b.value - a.value);

  const barData = segments.map(seg => ({
    name: seg.name,
    adr: segmentPerformance[seg.id]?.ytd.adr || 0,
    revPAR: segmentPerformance[seg.id]?.ytd.revPAR || 0,
    color: seg.color,
  })).sort((a, b) => b.adr - a.adr);

  // Calculate max values for bar scaling
  const maxADR = Math.max(...barData.map(d => d.adr));
  const maxRevPAR = Math.max(...barData.map(d => d.revPAR));

  const selectedSegmentData = selectedSegment
    ? segments.find(s => s.id === selectedSegment)
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Segmentation Performance
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
              Analyze revenue contribution and performance by guest segment
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
              {['cards', 'chart'].map((type) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all duration-200 ${
                    viewType === type
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  {type === 'cards' ? 'Cards' : 'Charts'}
                </button>
              ))}
            </div>
            <Button
              onClick={handleRefresh}
              loading={isRefreshing}
              icon={RefreshCw}
              variant="primary"
            >
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>
        </header>

        {/* Summary Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-[10px] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-terra-50">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Total YTD Revenue
              </p>
            </div>
            <p className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-neutral-900">
              ₹{(segmentComparison.totals.revenue / 1000000).toFixed(2)}M
            </p>
          </div>

          <div className="rounded-[10px] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-ocean-50">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Overall ADR
              </p>
            </div>
            <p className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-neutral-900">
              ₹{segmentComparison.overallADR}
            </p>
          </div>

          <div className="rounded-[10px] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-sage-50">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Total Room Nights
              </p>
            </div>
            <p className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-neutral-900">
              {segmentComparison.totals.roomNights.toLocaleString()}
            </p>
          </div>

          <div className="rounded-[10px] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-rose-50">
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Cancel Rate
              </p>
            </div>
            <p className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-neutral-900">
              {segmentComparison.overallCancelRate}%
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Side - Cards or Chart */}
          <div className="lg:col-span-2">
            {viewType === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {segments.map(segment => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    performance={segmentPerformance[segment.id]}
                    onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
                    isSelected={selectedSegment === segment.id}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Revenue Contribution by Segment - Redesigned */}
                <div className="rounded-[10px] bg-white overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 sm:py-5">
                    <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">
                      Revenue Contribution by Segment
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                      Year-to-date performance breakdown
                    </p>
                  </div>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                      {/* Donut Chart */}
                      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 mx-auto sm:mx-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [`${value}%`, props.payload.name]}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center Stats */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-neutral-400">Total</p>
                          <p className="text-lg sm:text-xl font-bold text-neutral-900">
                            ₹{(segmentComparison.totals.revenue / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>

                      {/* Legend with Progress Bars */}
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        {pieData.map((segment, index) => (
                          <div key={index} className="group">
                            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div
                                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                                  style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-[11px] sm:text-[13px] font-medium text-neutral-700">
                                  {segment.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
                                  {segment.value}%
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-neutral-400 w-14 sm:w-16 text-right">
                                  ₹{(segment.revenue / 1000).toFixed(0)}K
                                </span>
                              </div>
                            </div>
                            <div className="h-1 sm:h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${segment.value}%`,
                                  backgroundColor: segment.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADR & RevPAR by Segment - Bar Chart */}
                <div className="rounded-[10px] bg-white overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div>
                      <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">
                        ADR & RevPAR by Segment
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                        Average daily rate and revenue per available room
                      </p>
                    </div>
                    {/* Custom Legend */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-terra-500" />
                        <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">ADR</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-ocean-500" />
                        <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">RevPAR</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 sm:px-4 pb-4 sm:pb-6 h-56 sm:h-64 lg:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} barGap={4} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                          axisLine={{ stroke: '#e5e5e5' }}
                          tickLine={false}
                          dy={8}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `₹${value}`}
                          width={45}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
                                  <p className="text-[12px] font-semibold text-neutral-800 mb-2">{label}</p>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-sm bg-terra-500" />
                                        <span className="text-[11px] text-neutral-500">ADR</span>
                                      </div>
                                      <span className="text-[12px] font-semibold text-neutral-800">₹{payload[0]?.value}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-sm bg-ocean-500" />
                                        <span className="text-[11px] text-neutral-500">RevPAR</span>
                                      </div>
                                      <span className="text-[12px] font-semibold text-neutral-800">₹{payload[1]?.value}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="adr" name="ADR" fill="#A57865" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="revPAR" name="RevPAR" fill="#5C9BA4" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Detail Panel or Summary */}
          <div className="lg:col-span-1">
            {selectedSegment && selectedSegmentData ? (
              <SegmentDetailPanel
                segment={selectedSegmentData}
                performance={segmentPerformance[selectedSegment]}
              />
            ) : (
              <div className="rounded-[10px] bg-white overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                  <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Top Performers</h3>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {/* Top Revenue */}
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                      Highest Revenue
                    </p>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                          {segmentComparison.topPerformer?.segmentName}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-sage-600">
                          ₹{(segmentComparison.topPerformer?.ytd.revenue / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fastest Growing */}
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                      Fastest Growing
                    </p>
                    <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                          {segmentComparison.fastestGrowing?.segmentName}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-sage-600">
                          +{segmentComparison.fastestGrowing?.metrics.yoyVariance}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Needs Attention */}
                  {segmentComparison.needsAttention.length > 0 && (
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                        Needs Attention
                      </p>
                      <div className="space-y-2">
                        {segmentComparison.needsAttention.slice(0, 2).map(seg => (
                          <div
                            key={seg.segmentId}
                            className="p-2.5 sm:p-3 rounded-lg bg-rose-50 border border-rose-100"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800">
                                {seg.segmentName}
                              </span>
                              <span className="text-[12px] sm:text-[13px] font-bold text-rose-600">
                                {seg.metrics.yoyVariance}% YoY
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Segment Rankings */}
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
                      Segment Rankings
                    </p>
                    <div className="space-y-2.5 sm:space-y-3">
                      {segmentComparison.byRevenue.map((seg, index) => {
                        const segment = segments.find(s => s.id === seg.segmentId);
                        return (
                          <div key={seg.segmentId}>
                            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 w-4">
                                  {index + 1}
                                </span>
                                <span className="text-[12px] sm:text-[13px] font-medium text-neutral-700">
                                  {seg.segmentName}
                                </span>
                              </div>
                              <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">
                                {seg.metrics.revenueContribution}%
                              </span>
                            </div>
                            <div className="ml-5 sm:ml-6 h-1 sm:h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${seg.metrics.revenueContribution}%`,
                                  backgroundColor: segment?.color || '#A57865',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Segmentation;
