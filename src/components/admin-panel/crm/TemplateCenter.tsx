import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { generateId, formatDate, PERSONALIZATION_TAGS } from '@/utils/admin/crm';

function TemplateModal({ isOpen, onClose, onSave, template, mode }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'email',
    subject: template?.subject || '',
    body: template?.body || ''
  });

  const [showTagsHelp, setShowTagsHelp] = useState(false);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.body.trim()) return;
    if (formData.type === 'email' && !formData.subject.trim()) return;

    const templateData = {
      id: template?.id || generateId(),
      name: formData.name.trim(),
      type: formData.type,
      subject: formData.type === 'email' ? formData.subject.trim() : null,
      body: formData.body.trim(),
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(templateData);
    onClose();
  };

  const insertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + tag
    }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              {formData.type === 'email' ? (
                <Mail className="w-5 h-5 text-[#5C9BA4]" />
              ) : (
                <MessageSquare className="w-5 h-5 text-[#5C9BA4]" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {mode === 'create' ? 'Create Template' : 'Edit Template'}
              </h2>
              <p className="text-sm text-neutral-500">
                {formData.type === 'email' ? 'Email template' : 'SMS template'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Template Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Email"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>

          {formData.type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Subject Line *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Welcome to Glimmora, {{guest.firstName}}!"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-neutral-700">Message Body *</label>
              <button
                onClick={() => setShowTagsHelp(!showTagsHelp)}
                className="flex items-center gap-1 text-xs text-[#5C9BA4] hover:text-[#5C9BA4]/80"
              >
                <Info className="w-3 h-3" />
                Personalization Tags
              </button>
            </div>

            {showTagsHelp && (
              <div className="mb-2 p-3 bg-[#5C9BA4]/5 border border-[#5C9BA4]/20 rounded-lg">
                <p className="text-xs text-neutral-600 mb-2">Click to insert:</p>
                <div className="flex flex-wrap gap-1">
                  {PERSONALIZATION_TAGS.map(({ tag, description }) => (
                    <button
                      key={tag}
                      onClick={() => insertTag(tag)}
                      title={description}
                      className="px-2 py-1 text-xs bg-white border border-neutral-200 rounded hover:bg-[#5C9BA4]/10 hover:border-[#5C9BA4] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Write your message here..."
              rows={formData.type === 'email' ? 10 : 4}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none font-mono"
            />
            {formData.type === 'sms' && (
              <p className="text-xs text-neutral-500 mt-1">
                {formData.body.length}/160 characters
              </p>
            )}
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
            disabled={!formData.name.trim() || !formData.body.trim() || (formData.type === 'email' && !formData.subject.trim())}
            className="px-6 py-2 bg-[#A57865] text-white text-sm font-medium rounded-lg hover:bg-[#A57865]/90 transition-colors disabled:opacity-50"
          >
            {mode === 'create' ? 'Create Template' : 'Save Changes'}
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

export default function TemplateCenter({ templates, onSave, onDelete }) {
  const [modalState, setModalState] = useState({ isOpen: false, template: null, mode: 'create' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const filteredTemplates = templates.filter(t => filter === 'all' || t.type === filter);

  const handleCreateTemplate = () => {
    setModalState({ isOpen: true, template: null, mode: 'create' });
  };

  const handleEditTemplate = (template) => {
    setModalState({ isOpen: true, template, mode: 'edit' });
  };

  const handleSaveTemplate = (templateData) => {
    if (modalState.mode === 'create') {
      onSave([...templates, templateData]);
    } else {
      onSave(templates.map(t => t.id === templateData.id ? templateData : t));
    }
  };

  const handleDeleteTemplate = (templateId) => {
    onDelete(templateId);
    setDeleteConfirm(null);
  };

  const handleCopyBody = (template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#5C9BA4]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Template Center</h3>
            <p className="text-sm text-neutral-500">{templates.length} templates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#A57865]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-neutral-200 rounded-xl p-4 hover:border-[#A57865]/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {template.type === 'email' ? (
                  <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#4E5840]" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#5C9BA4]" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-neutral-900">{template.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className={`px-2 py-0.5 rounded-full ${
                      template.type === 'email'
                        ? 'bg-[#4E5840]/10 text-[#4E5840]'
                        : 'bg-[#5C9BA4]/10 text-[#5C9BA4]'
                    }`}>
                      {template.type.toUpperCase()}
                    </span>
                    <span>Updated {formatDate(template.updatedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyBody(template)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Copy body"
                >
                  {copiedId === template.id ? (
                    <Check className="w-4 h-4 text-[#4E5840]" />
                  ) : (
                    <Copy className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(template.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {template.subject && (
              <p className="text-sm font-medium text-neutral-700 mb-1">
                Subject: {template.subject}
              </p>
            )}

            <p className="text-sm text-neutral-600 line-clamp-2">
              {template.body}
            </p>

            {deleteConfirm === template.id && (
              <div className="mt-3 pt-3 border-t border-neutral-100 bg-red-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                <p className="text-sm text-red-800 mb-2">Delete this template?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
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

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-500">No templates found</p>
            <button
              onClick={handleCreateTemplate}
              className="mt-2 text-sm text-[#A57865] hover:underline"
            >
              Create your first template
            </button>
          </div>
        )}
      </div>

      <TemplateModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, template: null, mode: 'create' })}
        onSave={handleSaveTemplate}
        template={modalState.template}
        mode={modalState.mode}
      />
    </div>
  );
}
