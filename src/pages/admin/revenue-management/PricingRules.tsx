import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Play, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { revenueIntelligenceService, PricingRule } from '../../../api/services/revenue-intelligence.service';
import { useToast } from '../../../contexts/ToastContext';
import { useRMS } from '../../../context/RMSContext';
import RuleCard, { RuleSummary } from '../../../components/revenue-management/RuleCard';
import RuleEditorDrawer from '../../../components/revenue-management/RuleEditorDrawer';
import { Button } from '../../../components/ui2/Button';
import { ConfirmModal } from '../../../components/ui2/Modal';

const PricingRules = () => {
  const { showToast } = useToast();
  const { runAllRules: runAllRulesFromContext, refreshAll, refreshRules, roomTypes: rmsRoomTypes } = useRMS();

  // State for API data
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [filterActive, setFilterActive] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isActiveDropdownOpen, setIsActiveDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; rule: PricingRule | null }>({ isOpen: false, rule: null });
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch rules from API
  const fetchRules = useCallback(async () => {
    try {
      setError(null);
      const data = await revenueIntelligenceService.getPricingRules();
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pricing rules:', err);
      setError('Failed to load pricing rules');
      showToast('Failed to load pricing rules', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleRunAllRules = async () => {
    setIsRunning(true);
    try {
      // Use context's runAllRules which refreshes the rate calendar
      await runAllRulesFromContext();
      showToast('All rules executed successfully', 'success');
      // Refresh rules to get updated execution status
      await fetchRules();
      // Also refresh all data to ensure calendar is updated
      await refreshAll();
    } catch (err) {
      console.error('Failed to run rules:', err);
      showToast('Failed to run pricing rules', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setIsDrawerOpen(true);
  };

  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule);
    setIsDrawerOpen(true);
  };

  const handleDeleteRule = (rule: PricingRule) => {
    setDeleteConfirm({ isOpen: true, rule });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.rule) return;

    const ruleId = Number(deleteConfirm.rule.id);
    if (Number.isNaN(ruleId)) {
      showToast('Invalid rule. Please refresh and try again.', 'error');
      setDeleteConfirm({ isOpen: false, rule: null });
      return;
    }

    setIsDeleting(true);
    try {
      await revenueIntelligenceService.deletePricingRule(ruleId);
      showToast('Rule deleted successfully', 'success');
      setDeleteConfirm({ isOpen: false, rule: null });
      await fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
      showToast('Failed to delete rule', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRule = async (rule: PricingRule) => {
    try {
      const result = await revenueIntelligenceService.togglePricingRule(rule.id);
      const newActive = result?.is_active ?? !rule.isActive;
      const activatedAt = newActive ? new Date().toISOString() : null;
      setRules((prev) =>
        prev.map((r) => {
          if (r.id !== rule.id) return r;
          const updates: Partial<PricingRule> = { isActive: newActive };
          if (newActive) {
            updates.lastTriggered = activatedAt;
          }
          return { ...r, ...updates };
        })
      );
      showToast(
        `Rule ${newActive ? 'enabled' : 'disabled'} successfully`,
        'success'
      );
      await fetchRules();
      // Preserve lastTriggered for just-activated rule if API did not return it
      if (activatedAt) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === rule.id && !r.lastTriggered
              ? { ...r, lastTriggered: activatedAt }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
      showToast('Failed to toggle rule', 'error');
    }
  };

  const handleSaveRule = async () => {
    setIsDrawerOpen(false);
    setEditingRule(null);
    await fetchRules();
    await refreshRules();
    // Run pricing rules and refresh rate calendar so the saved rule's effect (e.g. increase) is reflected on room price view
    try {
      await runAllRulesFromContext();
    } catch (err) {
      console.error('Failed to apply rules after save:', err);
      // Don't block or toast here; rule was saved, rates will apply on next Run All or when user opens room price
    }
    // Success toast is shown by RuleEditorDrawer to avoid duplicate popups
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownRef.current && !activeDropdownRef.current.contains(event.target as Node)) {
        setIsActiveDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setIsPriorityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRules = Array.isArray(rules) ? rules.filter(rule => {
    if (filterActive === 'active' && !rule.isActive) return false;
    if (filterActive === 'inactive' && rule.isActive) return false;
    if (filterPriority !== 'all' && rule.priority !== parseInt(filterPriority)) return false;
    return true;
  }) : [];

  const sortedRules = [...filteredRules].sort((a, b) => a.priority - b.priority);

  // Convert API rules to format expected by RuleSummary
  const ruleSummaryData = Array.isArray(rules) ? rules.map(rule => ({
    ...rule,
    isActive: rule.isActive,
  })) : [];

  if (error && (!Array.isArray(rules) || rules.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">Failed to Load Rules</h2>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button onClick={fetchRules} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Pricing Rules Engine
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
              Configure automated pricing rules based on conditions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterActive(option.value)}
                  className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-200 ${
                    filterActive === option.value
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              onClick={handleRunAllRules}
              loading={isRunning}
              icon={isRunning ? RefreshCw : Play}
              variant="outline"
              disabled={!Array.isArray(rules) || rules.length === 0}
            >
              <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run All'}</span>
              <span className="sm:hidden">{isRunning ? '...' : 'Run'}</span>
            </Button>
            <Button
              onClick={handleCreateRule}
              icon={Plus}
              variant="primary"
            >
              <span className="hidden sm:inline">Create Rule</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </header>

        {/* Summary Stats */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[10px] bg-white p-4 sm:p-5 animate-pulse">
                  <div className="h-4 bg-neutral-100 rounded w-24 mb-2" />
                  <div className="h-8 bg-neutral-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <RuleSummary rules={ruleSummaryData} />
          )}
        </section>

        {/* Priority Filter */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Filter by Priority</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                Select priority level to filter rules
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterPriority('all')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all flex-shrink-0 ${
                  filterPriority === 'all'
                    ? 'bg-terra-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(String(p))}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[11px] sm:text-[12px] font-bold transition-all flex-shrink-0 ${
                    filterPriority === String(p)
                      ? p === 1 ? 'bg-rose-500 text-white'
                      : p === 2 ? 'bg-gold-500 text-white'
                      : p === 3 ? 'bg-ocean-500 text-white'
                      : 'bg-neutral-600 text-white'
                      : p === 1 ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : p === 2 ? 'bg-gold-100 text-gold-700 hover:bg-gold-200'
                      : p === 3 ? 'bg-ocean-100 text-ocean-700 hover:bg-ocean-200'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-5">
            <p className="text-[11px] sm:text-[12px] text-neutral-500">
              Showing <span className="font-semibold text-neutral-800">{filteredRules.length}</span> of {Array.isArray(rules) ? rules.length : 0} rules
            </p>
          </div>
        </section>

        {/* Rules Grid */}
        <section>
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-[10px] bg-white p-4 sm:p-6 animate-pulse">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 rounded-lg" />
                      <div>
                        <div className="h-4 sm:h-5 bg-neutral-100 rounded w-32 sm:w-40 mb-2" />
                        <div className="h-3 sm:h-4 bg-neutral-100 rounded w-48 sm:w-60" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-16 sm:w-20 h-7 sm:h-8 bg-neutral-100 rounded-lg" />
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-100 rounded-lg" />
                    </div>
                  </div>
                  <div className="h-12 sm:h-16 bg-neutral-100 rounded" />
                </div>
              ))}
            </div>
          ) : sortedRules.length === 0 ? (
            <div className="rounded-[10px] bg-white p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-lg flex items-center justify-center bg-terra-50">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500" />
              </div>
              <h3 className="font-semibold text-[14px] sm:text-[15px] mb-1 text-neutral-900">
                No Rules Found
              </h3>
              <p className="text-[12px] sm:text-[13px] mb-4 sm:mb-6 max-w-md mx-auto text-neutral-500">
                {filterActive !== 'all' || filterPriority !== 'all'
                  ? 'No rules match the current filters'
                  : 'Create your first pricing rule to automate rate adjustments'}
              </p>
              {filterActive === 'all' && filterPriority === 'all' && (
                <Button onClick={handleCreateRule} variant="primary" icon={Plus}>
                  <span className="hidden sm:inline">Create Your First Rule</span>
                  <span className="sm:hidden">Create Rule</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {sortedRules.map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={{
                    ...rule,
                    isActive: rule.isActive,
                    lastTriggeredAt: (rule as any).lastTriggeredAt ?? (rule as any).last_triggered_at,
                    executionStatus: (rule as any).executionStatus ?? (rule as any).execution_status,
                  }}
                  onEdit={() => handleEditRule(rule)}
                  onDelete={() => handleDeleteRule(rule)}
                  onToggle={() => handleToggleRule(rule)}
                  onRuleUpdated={fetchRules}
                  isSelected={selectedRule === rule.id}
                  onClick={() => setSelectedRule(selectedRule === rule.id ? null : rule.id)}
                  roomTypeList={rmsRoomTypes?.length ? rmsRoomTypes.map((r) => ({ id: r.id, name: r.name, dbId: r.dbId })) : undefined}
                />
              ))}
            </div>
          )}
        </section>

        {/* Rule Editor Drawer */}
        <RuleEditorDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingRule(null);
          }}
          rule={editingRule ? {
            ...editingRule,
            isActive: editingRule.isActive,
          } : null}
          onSave={handleSaveRule}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={deleteConfirm.isOpen}
          onClose={() => !isDeleting && setDeleteConfirm({ isOpen: false, rule: null })}
          onConfirm={confirmDelete}
          title="Delete Rule"
          description={`Are you sure you want to delete "${deleteConfirm.rule?.name}"? This action cannot be undone.`}
          variant="danger"
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          loading={isDeleting}
        />
      </main>
    </div>
  );
};

export default PricingRules;
