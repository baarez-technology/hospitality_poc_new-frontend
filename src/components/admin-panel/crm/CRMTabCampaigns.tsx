import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  Users,
  Eye,
  Play,
  Pause,
  BarChart2
} from 'lucide-react';
import { generateId, formatDate, CAMPAIGN_TYPES, CAMPAIGN_STATUS } from '@/utils/admin/crm';

function CampaignModal({ isOpen, onClose, onSave, campaign, mode, segments, templates }) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    type: campaign?.type || 'email',
    status: campaign?.status || 'draft',
    segmentId: campaign?.segmentId || '',
    templateId: campaign?.templateId || '',
    subject: campaign?.subject || '',
    scheduleDate: campaign?.scheduleDate || ''
  });

  const selectedSegment = segments.find(s => s.id === formData.segmentId);
  const filteredTemplates = templates.filter(t => t.type === formData.type);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.segmentId) return;

    const campaignData = {
      id: campaign?.id || generateId(),
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      segmentId: formData.segmentId,
      segmentName: selectedSegment?.name || '',
      templateId: formData.templateId,
      subject: formData.subject.trim(),
      scheduleDate: formData.scheduleDate || null,
      metrics: campaign?.metrics || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0
      },
      createdAt: campaign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(campaignData);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-[#4E5840]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {mode === 'create' ? 'Create Campaign' : 'Edit Campaign'}
              </h2>
              <p className="text-sm text-neutral-500">Configure campaign settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Holiday Season Promotion"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, templateId: '' }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {CAMPAIGN_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Target Segment *</label>
            <select
              value={formData.segmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, segmentId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
            >
              <option value="">Select a segment...</option>
              {segments.map(seg => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} ({seg.guestCount || 0} guests)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Message Template</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
            >
              <option value="">Select a template...</option>
              {filteredTemplates.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
              ))}
            </select>
          </div>

          {formData.type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject..."
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Schedule Date</label>
            <input
              type="datetime-local"
              value={formData.scheduleDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          {selectedSegment && (
            <div className="bg-[#FAF7F4] rounded-xl p-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-2">Target Audience</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#A57865]">{selectedSegment.guestCount || 0}</p>
                  <p className="text-xs text-neutral-500">Recipients</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#4E5840]">₹{(selectedSegment.avgRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-neutral-500">Avg LTV</p>
                </div>
              </div>
            </div>
          )}
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
            disabled={!formData.name.trim() || !formData.segmentId}
            className="px-6 py-2 bg-[#A57865] text-white text-sm font-medium rounded-lg hover:bg-[#A57865]/90 transition-colors disabled:opacity-50"
          >
            {mode === 'create' ? 'Create Campaign' : 'Save Changes'}
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

export default function CRMTabCampaigns({ campaigns, segments, templates, onSave, onDelete }) {
  const [modalState, setModalState] = useState({ isOpen: false, campaign: null, mode: 'create' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredCampaigns = campaigns.filter(c => filter === 'all' || c.status === filter);

  const handleCreateCampaign = () => {
    setModalState({ isOpen: true, campaign: null, mode: 'create' });
  };

  const handleEditCampaign = (campaign) => {
    setModalState({ isOpen: true, campaign, mode: 'edit' });
  };

  const handleSaveCampaign = (campaignData) => {
    if (modalState.mode === 'create') {
      onSave([...campaigns, campaignData]);
    } else {
      onSave(campaigns.map(c => c.id === campaignData.id ? campaignData : c));
    }
  };

  const handleDeleteCampaign = (campaignId) => {
    onDelete(campaignId);
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    const updatedCampaign = { ...campaign, status: newStatus, updatedAt: new Date().toISOString() };
    onSave(campaigns.map(c => c.id === campaign.id ? updatedCampaign : c));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-[#4E5840]" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-[#5C9BA4]" />;
      case 'push':
        return <Bell className="w-5 h-5 text-[#CDB261]" />;
      default:
        return <Send className="w-5 h-5 text-neutral-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
            <Send className="w-5 h-5 text-[#4E5840]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Campaigns</h3>
            <p className="text-sm text-neutral-500">{campaigns.length} campaigns</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <button
            onClick={handleCreateCampaign}
            className="flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#A57865]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredCampaigns.map((campaign) => {
          const statusConfig = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft;
          const metrics = campaign.metrics || {};
          const openRate = metrics.sent > 0 ? Math.round((metrics.opened / metrics.sent) * 100) : 0;
          const clickRate = metrics.opened > 0 ? Math.round((metrics.clicked / metrics.opened) * 100) : 0;

          return (
            <div
              key={campaign.id}
              className="border border-neutral-200 rounded-xl p-4 hover:border-[#A57865]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    {getTypeIcon(campaign.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{campaign.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.segmentName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <button
                      onClick={() => handleToggleStatus(campaign)}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.status === 'active'
                          ? 'hover:bg-[#CDB261]/10 text-[#CDB261]'
                          : 'hover:bg-[#4E5840]/10 text-[#4E5840]'
                      }`}
                      title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-neutral-500" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(campaign.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Schedule Info */}
              {campaign.scheduleDate && (
                <div className="flex items-center gap-2 text-xs text-neutral-600 mb-3">
                  <Calendar className="w-3 h-3" />
                  Scheduled: {formatDate(campaign.scheduleDate)}
                </div>
              )}

              {/* Metrics */}
              {(campaign.status === 'active' || campaign.status === 'completed') && (
                <div className="grid grid-cols-4 gap-2 bg-neutral-50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900">{metrics.sent || 0}</p>
                    <p className="text-xs text-neutral-500">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900">{metrics.delivered || 0}</p>
                    <p className="text-xs text-neutral-500">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#4E5840]">{openRate}%</p>
                    <p className="text-xs text-neutral-500">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#5C9BA4]">{clickRate}%</p>
                    <p className="text-xs text-neutral-500">Click Rate</p>
                  </div>
                </div>
              )}

              {deleteConfirm === campaign.id && (
                <div className="mt-3 pt-3 border-t border-neutral-100 bg-red-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                  <p className="text-sm text-red-800 mb-2">Delete this campaign?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
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
          );
        })}

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-500">No campaigns found</p>
            <button
              onClick={handleCreateCampaign}
              className="mt-2 text-sm text-[#A57865] hover:underline"
            >
              Create your first campaign
            </button>
          </div>
        )}
      </div>

      <CampaignModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, campaign: null, mode: 'create' })}
        onSave={handleSaveCampaign}
        campaign={modalState.campaign}
        mode={modalState.mode}
        segments={segments}
        templates={templates}
      />
    </div>
  );
}
