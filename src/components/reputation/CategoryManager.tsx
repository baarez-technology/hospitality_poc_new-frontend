import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  ChevronRight,
  AlertTriangle,
  Building2,
  Clock,
  Bell,
  Ticket,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';
import { Button } from '../ui2/Button';
import { Drawer } from '../ui2/Drawer';
import { Input, Textarea } from '../ui2/Input';
import type { Category, RoutingRule } from '@/api/services/reputation.service';

interface CategoryFormData {
  name: string;
  description: string;
  keywords: string;
  sentiment_threshold: number;
  is_active: boolean;
}

interface RoutingRuleFormData {
  target_department: string;
  default_priority: 'low' | 'medium' | 'high' | 'urgent';
  auto_create_ticket: boolean;
  notify_manager: boolean;
  escalation_hours: number;
}

const PRIORITY_COLORS = {
  low: 'bg-neutral-100 text-neutral-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const DEPARTMENTS = [
  'Front Desk',
  'Housekeeping',
  'Food & Beverage',
  'Maintenance',
  'Guest Relations',
  'Management',
  'Concierge',
  'Spa & Wellness'
];

function CategoryFormDrawer({
  isOpen,
  category,
  onClose,
  onSave
}: {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    keywords: '',
    sentiment_threshold: 50,
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        keywords: category.keywords?.join(', ') || '',
        sentiment_threshold: category.sentiment_threshold || 50,
        is_active: category.is_active !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        keywords: '',
        sentiment_threshold: 50,
        is_active: true
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        icon={isSaving ? Loader2 : Save}
        onClick={handleSubmit}
        disabled={isSaving || !formData.name.trim()}
        className={isSaving ? '[&>svg]:animate-spin' : ''}
      >
        {isSaving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'New Category'}
      subtitle="Configure review category settings"
      maxWidth="max-w-lg"
      footer={footer}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Category Name
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Room Cleanliness"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this category covers..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Keywords (comma-separated)
          </label>
          <Input
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="clean, dirty, spotless, stains..."
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            AI will use these keywords to categorize reviews automatically
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Sentiment Threshold ({formData.sentiment_threshold}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.sentiment_threshold}
            onChange={(e) => setFormData({ ...formData, sentiment_threshold: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Reviews below this threshold will trigger alerts
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
          <div>
            <p className="text-[13px] font-medium text-neutral-900">Active Category</p>
            <p className="text-[11px] text-neutral-500">Enable AI categorization for this category</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.is_active ? 'bg-sage-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function RoutingRulesDrawer({
  isOpen,
  category,
  onClose,
  onSave
}: {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (rules: RoutingRuleFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<RoutingRuleFormData>({
    target_department: 'Guest Relations',
    default_priority: 'medium',
    auto_create_ticket: false,
    notify_manager: false,
    escalation_hours: 24
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category?.routing_rules) {
      const rules = category.routing_rules;
      setFormData({
        target_department: rules.target_department || 'Guest Relations',
        default_priority: rules.default_priority || 'medium',
        auto_create_ticket: rules.auto_create_ticket || false,
        notify_manager: rules.notify_manager || false,
        escalation_hours: rules.escalation_hours || 24
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save routing rules:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        icon={isSaving ? Loader2 : Save}
        onClick={handleSubmit}
        disabled={isSaving}
        className={isSaving ? '[&>svg]:animate-spin' : ''}
      >
        {isSaving ? 'Saving...' : 'Save Rules'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Routing Rules"
      subtitle={`Configure routing for "${category?.name}"`}
      maxWidth="max-w-lg"
      footer={footer}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Target Department
          </label>
          <select
            value={formData.target_department}
            onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Default Priority
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, default_priority: priority })}
                className={`px-3 py-2 rounded-lg text-[12px] font-medium capitalize transition-all ${
                  formData.default_priority === priority
                    ? PRIORITY_COLORS[priority] + ' ring-2 ring-offset-1 ring-current'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Escalation Time (hours)
          </label>
          <Input
            type="number"
            value={formData.escalation_hours}
            onChange={(e) => setFormData({ ...formData, escalation_hours: parseInt(e.target.value) || 24 })}
            min={1}
            max={168}
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Auto-escalate if not resolved within this timeframe
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-terra-500" />
              <div>
                <p className="text-[13px] font-medium text-neutral-900">Auto-Create Ticket</p>
                <p className="text-[11px] text-neutral-500">Create CRM ticket for negative reviews</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, auto_create_ticket: !formData.auto_create_ticket })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.auto_create_ticket ? 'bg-sage-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.auto_create_ticket ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-terra-500" />
              <div>
                <p className="text-[13px] font-medium text-neutral-900">Notify Manager</p>
                <p className="text-[11px] text-neutral-500">Send alerts to department manager</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, notify_manager: !formData.notify_manager })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notify_manager ? 'bg-sage-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notify_manager ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default function CategoryManager() {
  const {
    categories,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateRoutingRules,
    isLoading
  } = useReputation();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRoutingOpen, setIsRoutingOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (formData: CategoryFormData) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      sentiment_threshold: formData.sentiment_threshold,
      is_active: formData.is_active
    };

    if (selectedCategory) {
      await updateCategory(selectedCategory.id, payload);
    } else {
      await createCategory(payload);
    }
    setSelectedCategory(null);
  };

  const handleSaveRoutingRules = async (rules: RoutingRuleFormData) => {
    if (!selectedCategory) return;
    await updateRoutingRules(selectedCategory.id, rules);
    setSelectedCategory(null);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-[8px]" />
          ))}
        </div>
      </div>
    );
  }

  const activeCategories = categories.filter(c => c.is_active !== false);
  const inactiveCategories = categories.filter(c => c.is_active === false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[10px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Review Categories</h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              Configure how reviews are categorized and routed
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setSelectedCategory(null);
              setIsFormOpen(true);
            }}
          >
            Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-sage-50 rounded-lg p-4 text-center">
            <p className="text-[24px] font-bold text-sage-700">{activeCategories.length}</p>
            <p className="text-[11px] font-medium text-sage-600 uppercase tracking-wider">Active</p>
          </div>
          <div className="bg-neutral-100 rounded-lg p-4 text-center">
            <p className="text-[24px] font-bold text-neutral-700">{inactiveCategories.length}</p>
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Inactive</p>
          </div>
          <div className="bg-terra-50 rounded-lg p-4 text-center">
            <p className="text-[24px] font-bold text-terra-700">
              {categories.filter(c => c.routing_rules).length}
            </p>
            <p className="text-[11px] font-medium text-terra-600 uppercase tracking-wider">With Routing</p>
          </div>
        </div>

        {/* Category List */}
        {categories.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-medium text-neutral-500">No categories configured</p>
            <p className="text-[12px]">Create your first category to start organizing reviews</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-4 rounded-[8px] border transition-colors ${
                  category.is_active !== false
                    ? 'bg-white border-neutral-200 hover:border-neutral-300'
                    : 'bg-neutral-50 border-neutral-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-[14px] font-semibold text-neutral-900">{category.name}</h4>
                      {category.is_active === false && (
                        <span className="px-2 py-0.5 bg-neutral-200 text-neutral-500 text-[10px] font-medium rounded-full">
                          Inactive
                        </span>
                      )}
                      {category.routing_rules && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-terra-100 text-terra-700 text-[10px] font-medium rounded-full">
                          <Building2 className="w-3 h-3" />
                          {category.routing_rules.target_department}
                        </span>
                      )}
                    </div>

                    {category.description && (
                      <p className="text-[12px] text-neutral-500 mb-2">{category.description}</p>
                    )}

                    {category.keywords && category.keywords.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {category.keywords.slice(0, 6).map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                        {category.keywords.length > 6 && (
                          <span className="text-[10px] text-neutral-400">
                            +{category.keywords.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {category.routing_rules && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          PRIORITY_COLORS[category.routing_rules.default_priority || 'medium']
                        }`}>
                          {category.routing_rules.default_priority || 'Medium'} Priority
                        </span>
                        {category.routing_rules.auto_create_ticket && (
                          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                            <Ticket className="w-3 h-3" /> Auto-ticket
                          </span>
                        )}
                        {category.routing_rules.escalation_hours && (
                          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                            <Clock className="w-3 h-3" /> {category.routing_rules.escalation_hours}h escalation
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Settings2}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsRoutingOpen(true);
                      }}
                    >
                      Routing
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Edit2}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsFormOpen(true);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={deletingId === category.id ? Loader2 : Trash2}
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                      className={`text-red-500 hover:text-red-600 hover:bg-red-50 ${
                        deletingId === category.id ? '[&>svg]:animate-spin' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Info */}
      <div className="bg-ocean-50 rounded-[10px] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-ocean-700 mb-1">How Category Routing Works</p>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              When a review is detected, our AI analyzes its content and matches it against category keywords.
              Based on the routing rules you configure, negative reviews can automatically create CRM tickets,
              notify managers, and escalate if not resolved in time.
            </p>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <CategoryFormDrawer
        isOpen={isFormOpen}
        category={selectedCategory}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveCategory}
      />

      <RoutingRulesDrawer
        isOpen={isRoutingOpen}
        category={selectedCategory}
        onClose={() => {
          setIsRoutingOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveRoutingRules}
      />
    </div>
  );
}
