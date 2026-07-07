import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Gift,
  DollarSign,
  Moon
} from 'lucide-react';
import { generateId, countByLoyaltyTier, formatCurrency } from '../../utils/crm';

const TIER_COLORS = [
  '#CD7F32', '#C0C0C0', '#CDB261', '#E5E4E2', '#A57865',
  '#4E5840', '#5C9BA4', '#8E6554', '#6B7280', '#FFD700'
];

const TIER_ICONS = ['🥉', '🥈', '🥇', '💎', '👑', '⭐', '🏆', '💫', '✨', '🌟'];

function TierModal({ isOpen, onClose, onSave, tier, mode }) {
  const [formData, setFormData] = useState({
    name: '',
    color: TIER_COLORS[0],
    icon: TIER_ICONS[0],
    minNights: 0,
    minRevenue: 0,
    benefits: ['']
  });

  // When modal opens or a different tier is selected for edit, pre-fill form (fixes edit mode not showing tier name)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: tier?.name ?? '',
        color: tier?.color ?? TIER_COLORS[0],
        icon: tier?.icon ?? TIER_ICONS[0],
        minNights: Math.max(0, Number(tier?.minNights) || 0),
        minRevenue: Math.max(0, Number(tier?.minRevenue) || 0),
        benefits: Array.isArray(tier?.benefits) && tier.benefits.length > 0 ? [...tier.benefits] : ['']
      });
    }
  }, [isOpen, tier?.id]);

  // ESC key handler and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleAddBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const handleRemoveBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const tierData = {
      id: tier?.id || generateId(),
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon,
      minNights: Math.max(0, parseInt(formData.minNights, 10) || 0),
      minRevenue: Math.max(0, parseFloat(formData.minRevenue) || 0),
      benefits: formData.benefits.filter(b => b.trim())
    };

    onSave(tierData);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Right-side Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:max-w-[480px] flex flex-col bg-white border-l border-neutral-200 shadow-2xl h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#CDB261]/10 flex items-center justify-center">
                <Award className="w-[18px] h-[18px] text-[#CDB261]" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-neutral-900">
                  {mode === 'create' ? 'Create Tier' : 'Edit Tier'}
                </h2>
                <p className="text-[12px] text-neutral-400 mt-0.5">Configure loyalty tier settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-[8px] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">Tier Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Gold"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">Tier Color</label>
            <div className="flex flex-wrap gap-2">
              {TIER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-[8px] transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-[#A57865] scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">Tier Icon</label>
            <div className="flex flex-wrap gap-2">
              {TIER_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-[8px] text-xl flex items-center justify-center transition-transform ${
                    formData.icon === icon
                      ? 'bg-[#A57865]/10 ring-2 ring-[#A57865] scale-110'
                      : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">
                Minimum Nights
              </label>
              <input
                type="number"
                min="0"
                value={formData.minNights}
                onChange={(e) => {
                  const v = e.target.value;
                  const num = parseInt(v, 10);
                  if (v !== '' && !Number.isNaN(num) && num < 0) return;
                  setFormData(prev => ({ ...prev, minNights: v }));
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">
                Minimum Revenue
              </label>
              <input
                type="number"
                min="0"
                value={formData.minRevenue}
                onChange={(e) => {
                  const v = e.target.value;
                  const num = parseFloat(v);
                  if (v !== '' && !Number.isNaN(num) && num < 0) return;
                  setFormData(prev => ({ ...prev, minRevenue: v }));
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">
              Benefits
            </label>
            <div className="space-y-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="e.g., 10% room discount"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] transition-colors"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-[8px] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddBenefit}
                className="flex items-center gap-1 text-[12px] font-medium text-[#A57865] hover:text-[#8E6554]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add benefit
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-[8px] text-[13px] font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className={`flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                formData.name.trim()
                  ? 'bg-[#A57865] text-white hover:bg-[#8E6554]'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {mode === 'create' ? 'Create Tier' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function LoyaltyTiers({ tiers, guests, onSave, onDelete }) {
  const [modalState, setModalState] = useState({ isOpen: false, tier: null, mode: 'create' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const tierCounts = countByLoyaltyTier(guests || [], tiers);

  const handleCreateTier = () => {
    setModalState({ isOpen: true, tier: null, mode: 'create' });
  };

  const handleEditTier = (tier) => {
    setModalState({ isOpen: true, tier, mode: 'edit' });
  };

  const handleSaveTier = (tierData) => {
    if (modalState.mode === 'create') {
      onSave([...tiers, tierData]);
    } else {
      onSave(tiers.map(t => t.id === tierData.id ? tierData : t));
    }
  };

  const handleDeleteTier = (tierId) => {
    onDelete(tierId);
    setDeleteConfirm(null);
  };

  const sortedTiers = [...tiers].sort((a, b) => a.minNights - b.minNights);

  return (
    <div className="bg-white rounded-[10px] border border-neutral-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#CDB261]/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-[18px] h-[18px] text-[#CDB261]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">Loyalty Tiers</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">{tiers.length} tiers configured</p>
            </div>
          </div>
          <button
            onClick={handleCreateTier}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#A57865] text-white rounded-[8px] text-[12px] sm:text-[13px] font-semibold hover:bg-[#8E6554] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Tier</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {sortedTiers.map((tier) => (
          <div
            key={tier.id}
            className="border border-neutral-100 rounded-[8px] p-4 bg-neutral-50 hover:border-neutral-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[8px] flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  {tier.icon}
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold" style={{ color: tier.color }}>
                    {tier.name}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Moon className="w-3 h-3" />
                      {tier.minNights}+ nights
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(tier.minRevenue)}+ spend
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-neutral-900 mr-1">
                  {tierCounts[tier.id] || 0} guests
                </span>
                <button
                  onClick={() => handleEditTier(tier)}
                  className="p-1.5 hover:bg-neutral-200 rounded-[6px] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(tier.id)}
                  className="p-1.5 hover:bg-rose-50 rounded-[6px] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            </div>

            {tier.benefits && tier.benefits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Benefits</p>
                <div className="flex flex-wrap gap-1.5">
                  {tier.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
                      style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                    >
                      <Check className="w-3 h-3" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {deleteConfirm === tier.id && (
              <div className="mt-3 pt-3 border-t border-neutral-200 bg-rose-50 -mx-4 -mb-4 p-4 rounded-b-[8px]">
                <p className="text-[13px] text-rose-800 font-medium mb-2">Delete this tier?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="px-3 py-1.5 bg-rose-600 text-white text-[11px] font-semibold rounded-[6px] hover:bg-rose-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200 rounded-[6px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <TierModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, tier: null, mode: 'create' })}
        onSave={handleSaveTier}
        tier={modalState.tier}
        mode={modalState.mode}
      />
    </div>
  );
}
