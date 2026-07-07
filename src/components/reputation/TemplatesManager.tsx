import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Save,
  Copy,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  UserCheck,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';
import { ResponseTemplate } from '@/api/services/reputation.service';
import { Drawer, ConfirmDrawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { Input, Textarea, SelectDropdown } from '../ui2/Input';

type TemplateTone = 'professional' | 'friendly' | 'empathetic' | 'apologetic';
type TemplateType = 'positive' | 'neutral' | 'negative' | 'custom';

// Use ResponseTemplate from service, but locally cast sentiment to TemplateType for UI helpers
// We don't redefine Template interface locally anymore, except maybe for UI state convenience
// But better to use the import.

const VARIABLE_BUTTONS = [
  { variable: '{{guest_name}}', label: 'Guest Name', icon: User },
  { variable: '{{hotel_name}}', label: 'Hotel Name', icon: Building },
  { variable: '{{staff_name}}', label: 'Staff Name', icon: UserCheck }
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'apologetic', label: 'Apologetic' }
];

const TYPE_OPTIONS = [
  { value: 'positive', label: 'Positive Reviews' },
  { value: 'neutral', label: 'Neutral Reviews' },
  { value: 'negative', label: 'Negative Reviews' },
  { value: 'custom', label: 'Custom Template' }
];

const TYPE_CONFIG: Record<TemplateType, { color: string; bgColor: string; borderColor: string }> = {
  positive: { color: 'text-[#4E5840]', bgColor: 'bg-[#4E5840]/10', borderColor: 'border-[#4E5840]/20' },
  neutral: { color: 'text-neutral-600', bgColor: 'bg-neutral-100', borderColor: 'border-neutral-200' },
  negative: { color: 'text-[#CDB261]', bgColor: 'bg-[#CDB261]/10', borderColor: 'border-[#CDB261]/20' },
  custom: { color: 'text-[#5C9BA4]', bgColor: 'bg-[#5C9BA4]/10', borderColor: 'border-[#5C9BA4]/20' }
};

interface TemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ResponseTemplate>) => Promise<void>;
  template?: ResponseTemplate | null;
  mode: 'create' | 'edit';
}

function TemplateDrawer({ isOpen, onClose, onSubmit, template, mode }: TemplateDrawerProps) {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState<TemplateType>((template?.sentiment as TemplateType) || 'positive');
  const [tone, setTone] = useState<TemplateTone>((template?.tone as TemplateTone) || 'professional');
  const [content, setContent] = useState(template?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setType((template.sentiment as TemplateType) || 'positive');
      setTone((template.tone as TemplateTone) || 'professional');
      setContent(template.content);
    } else {
      setName('');
      setType('positive');
      setTone('professional');
      setContent('');
    }
  }, [template, isOpen]);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + variable + content.slice(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setContent(content + variable);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        sentiment: type,  // Map UI type back to sentiment field
        tone,
        content
      });
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
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
        disabled={!name.trim() || !content.trim() || isSaving}
        className={isSaving ? '[&>svg]:animate-spin' : ''}
      >
        {isSaving ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Save Changes'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Template' : 'Edit Template'}
      subtitle={mode === 'create' ? 'Add a new response template' : 'Modify template content'}
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-1.5">Template Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Positive Review - VIP Guest"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-neutral-700 mb-1.5">Template Type</label>
            <SelectDropdown
              value={type}
              onChange={(v) => setType(v as TemplateType)}
              options={TYPE_OPTIONS}
              size="md"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-neutral-700 mb-1.5">Tone</label>
            <SelectDropdown
              value={tone}
              onChange={(v) => setTone(v as TemplateTone)}
              options={TONE_OPTIONS}
              size="md"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-2">Insert Variable</label>
          <div className="flex flex-wrap gap-2">
            {VARIABLE_BUTTONS.map(({ variable, label, icon: Icon }) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[12px] font-medium transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-neutral-700 mb-1.5">Template Content</label>
          <Textarea
            id="template-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter template content..."
            rows={10}
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Use {'{{guest_name}}'}, {'{{hotel_name}}'}, {'{{staff_name}}'} for dynamic content
          </p>
        </div>
      </div>
    </Drawer>
  );
}

interface TestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  template: ResponseTemplate | null;
}

function TestDrawer({ isOpen, onClose, template }: TestDrawerProps) {
  const [guestName, setGuestName] = useState('Sarah');
  const [hotelName, setHotelName] = useState('Glimmora Grand');
  const [staffName, setStaffName] = useState('Guest Relations Team');
  const [reviewText, setReviewText] = useState('');

  if (!template) return null;

  const getPreview = () => {
    return template.content
      .replace(/\{\{guest_name\}\}/g, guestName)
      .replace(/\{\{hotel_name\}\}/g, hotelName)
      .replace(/\{\{staff_name\}\}/g, staffName);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Test Template"
      subtitle={template.name}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
            Variable Values
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Guest Name</label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                size="sm"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Hotel Name</label>
              <Input
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                size="sm"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Staff Name</label>
              <Input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Sample Review (Optional)
          </h4>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Paste a sample review to see how the response looks..."
            rows={3}
          />
        </div>

        <div>
          <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Generated Response Preview
          </h4>
          <div className="p-4 bg-[#A57865]/5 rounded-xl border border-[#A57865]/20">
            <p className="text-[13px] text-neutral-700 whitespace-pre-line leading-relaxed">
              {getPreview()}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            icon={Copy}
            onClick={() => navigator.clipboard.writeText(getPreview())}
          >
            Copy Response
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default function TemplatesManager() {
  const {
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    templates,
    isLoading
  } = useReputation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [testDrawerOpen, setTestDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [testingTemplate, setTestingTemplate] = useState<ResponseTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ResponseTemplate | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Templates are loaded by ReputationContext on mount - only load if empty
  useEffect(() => {
    if (templates.length === 0 && !isLoading) {
      loadTemplates().catch(console.error);
    }
  }, [templates.length, isLoading, loadTemplates]);

  // Handle expanding first template once templates are loaded
  useEffect(() => {
    if (templates && templates.length > 0 && expandedIds.size === 0) {
      setExpandedIds(new Set([String(templates[0].id)]));
    }
  }, [templates]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTemplates();
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openCreateDrawer = () => {
    setEditingTemplate(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (template: ResponseTemplate) => {
    setEditingTemplate(template);
    setDrawerOpen(true);
  };

  const openTestDrawer = (template: ResponseTemplate) => {
    setTestingTemplate(template);
    setTestDrawerOpen(true);
  };

  const handleSubmit = async (data: Partial<ResponseTemplate>) => {
    // The TemplateDrawer already maps UI 'type' to 'sentiment' field
    const apiData = {
      name: data.name,
      content: data.content,
      sentiment: data.sentiment || 'positive',
      tone: data.tone || 'professional',
      is_default: data.is_default
    };

    if (editingTemplate) {
      await updateTemplate(Number(editingTemplate.id), apiData);
    } else {
      await createTemplate(apiData);
    }
  };

  const handleDelete = async () => {
    if (deletingTemplate) {
      setIsDeleting(true);
      try {
        await deleteTemplate(Number(deletingTemplate.id));
        setDeletingTemplate(null);
      } catch (error) {
        console.error('Failed to delete template:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const type = (template.sentiment as TemplateType) || 'custom';
    // Fallback to custom if sentiment does not match standard types
    const key = ['positive', 'neutral', 'negative'].includes(type) ? type : 'custom';

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(template);
    return acc;
  }, {} as Record<TemplateType, ResponseTemplate[]>);

  const typeOrder: TemplateType[] = ['positive', 'neutral', 'negative', 'custom'];

  if (isLoading && templates.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
        <div className="h-10 bg-neutral-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-[8px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200">
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A57865]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">Response Templates</h3>
              <p className="text-[13px] text-neutral-500 mt-0.5">
                {templates.length} template{templates.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={isRefreshing ? Loader2 : RefreshCw}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isRefreshing ? '[&>svg]:animate-spin' : ''}
            >
              Refresh
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateDrawer}>
              Add Template
            </Button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {typeOrder.map(type => {
          const typeTemplates = groupedTemplates[type];
          if (!typeTemplates || typeTemplates.length === 0) return null;

          const config = TYPE_CONFIG[type];
          const typeLabel = TYPE_OPTIONS.find(o => o.value === type)?.label || type;

          return (
            <div key={type} className="p-6">
              <h4 className={`text-[12px] font-semibold uppercase tracking-widest mb-4 ${config.color}`}>
                {typeLabel}
              </h4>

              <div className="space-y-3">
                {typeTemplates.map(template => {
                  const templateId = String(template.id);
                  const isExpanded = expandedIds.has(templateId);

                  return (
                    <div
                      key={templateId}
                      className={`rounded-xl border ${config.borderColor} overflow-hidden`}
                    >
                      <div
                        className={`px-4 py-3 ${config.bgColor} cursor-pointer`}
                        onClick={() => toggleExpanded(templateId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button className="text-neutral-400">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[14px] font-semibold text-neutral-900">
                                  {template.name}
                                </p>
                                {template.is_default && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-white text-neutral-500 rounded uppercase">
                                    Default
                                  </span>
                                )}
                                {/* Usage count not currently available in API response, can be added later */}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                                <span className="capitalize">{template.tone}</span>
                                <span className="text-neutral-300">|</span>
                                <span>
                                  Updated {new Date(template.updated_at || template.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => openTestDrawer(template)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#5C9BA4] hover:bg-white transition-colors"
                              title="Test template"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditDrawer(template)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-white transition-colors"
                              title="Edit template"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!template.is_default && (
                              <button
                                onClick={() => setDeletingTemplate(template)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-white transition-colors"
                                title="Delete template"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 py-4 bg-white border-t border-neutral-100">
                          <p className="text-[13px] text-neutral-600 whitespace-pre-line leading-relaxed">
                            {template.content}
                          </p>

                          <div className="mt-4 pt-4 border-t border-neutral-100">
                            <p className="text-[11px] text-neutral-400 mb-2">Variables used:</p>
                            <div className="flex flex-wrap gap-2">
                              {template.content.includes('{{guest_name}}') && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-[11px]">
                                  <User className="w-3 h-3" />
                                  guest_name
                                </span>
                              )}
                              {template.content.includes('{{hotel_name}}') && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-[11px]">
                                  <Building className="w-3 h-3" />
                                  hotel_name
                                </span>
                              )}
                              {template.content.includes('{{staff_name}}') && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-[11px]">
                                  <UserCheck className="w-3 h-3" />
                                  staff_name
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-[15px] font-medium text-neutral-600 mb-1">No templates yet</p>
          <p className="text-[13px] text-neutral-400 mb-4">Create templates to streamline your responses</p>
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateDrawer}>
            Create First Template
          </Button>
        </div>
      )}

      <TemplateDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmit}
        template={editingTemplate}
        mode={editingTemplate ? 'edit' : 'create'}
      />

      <TestDrawer
        isOpen={testDrawerOpen}
        onClose={() => {
          setTestDrawerOpen(false);
          setTestingTemplate(null);
        }}
        template={testingTemplate}
      />

      <ConfirmDrawer
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        description={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Template'}
        cancelText="Keep Template"
        variant="danger"
        icon={isDeleting ? Loader2 : Trash2}
      />
    </div>
  );
}
