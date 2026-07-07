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
import { generateId, countByLoyaltyTier, formatCurrency } from '@/utils/admin/crm';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <span className="text-xl">{formData.icon}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {mode === 'create' ? 'Create Tier' : 'Edit Tier'}
              </h2>
              <p className="text-sm text-neutral-500">Configure loyalty tier settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tier Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Gold"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tier Color</label>
            <div className="flex flex-wrap gap-2">
              {TIER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-[#A57865] scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tier Icon</label>
            <div className="flex flex-wrap gap-2">
              {TIER_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-transform ${
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <Moon className="w-4 h-4 inline mr-1" />
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
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
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
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Gift className="w-4 h-4 inline mr-1" />
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
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddBenefit}
                className="flex items-center gap-1 text-sm text-[#A57865] hover:text-[#A57865]/80"
              >
                <Plus className="w-4 h-4" />
                Add benefit
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
            className="px-6 py-2 bg-[#A57865] text-white text-sm font-medium rounded-lg hover:bg-[#A57865]/90 transition-colors disabled:opacity-50"
          >
            {mode === 'create' ? 'Create Tier' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
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
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-[#CDB261]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Loyalty Tiers</h3>
            <p className="text-sm text-neutral-500">{tiers.length} tiers configured</p>
          </div>
        </div>
        <button
          onClick={handleCreateTier}
          className="flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#A57865]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tier
        </button>
      </div>

      <div className="space-y-3">
        {sortedTiers.map((tier) => (
          <div
            key={tier.id}
            className="border border-neutral-200 rounded-xl p-4 hover:border-[#A57865]/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  {tier.icon}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900" style={{ color: tier.color }}>
                    {tier.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
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

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">
                  {tierCounts[tier.id] || 0} guests
                </span>
                <button
                  onClick={() => handleEditTier(tier)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(tier.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {tier.benefits && tier.benefits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <p className="text-xs font-medium text-neutral-500 mb-2">Benefits:</p>
                <div className="flex flex-wrap gap-2">
                  {tier.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
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
              <div className="mt-3 pt-3 border-t border-neutral-100 bg-red-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                <p className="text-sm text-red-800 mb-2">Delete this tier?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
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
