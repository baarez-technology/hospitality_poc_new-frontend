/**
 * RoutingTab - Charge routing rules management
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { folioService } from '@/api/services/folio.service';
import type { Folio, RoutingRule } from '@/types/folio.types';

const CHARGE_CATEGORIES = [
  'room_charge', 'minibar', 'spa', 'restaurant', 'parking',
  'phone', 'laundry', 'newspaper', 'late_checkout', 'service', 'damage', 'misc',
];

interface RoutingTabProps {
  bookingId: number | string;
  folios: Folio[];
}

export default function RoutingTab({ bookingId, folios }: RoutingTabProps) {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState('minibar');
  const [newTargetFolioId, setNewTargetFolioId] = useState<number>(folios[0]?.id || 0);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await folioService.getRoutingRules(bookingId);
      setRules(res.rules || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadRules(); }, [bookingId]);

  const handleAdd = async () => {
    try {
      await folioService.createRoutingRule(bookingId, {
        charge_category: newCategory,
        target_folio_id: newTargetFolioId,
      });
      setShowAdd(false);
      loadRules();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to create rule');
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (!window.confirm('Delete this routing rule?')) return;
    try {
      await folioService.deleteRoutingRule(bookingId, ruleId);
      loadRules();
    } catch { /* ignore */ }
  };

  if (folios.length < 2) {
    return (
      <div className="text-center py-12">
        <p className="text-[13px] text-neutral-400">Routing requires at least 2 folio windows.</p>
        <p className="text-[11px] text-neutral-400 mt-1">Create a second folio window first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-neutral-900">
          Charge Routing Rules
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-terra-700 bg-terra-50 hover:bg-terra-100 rounded-lg border border-terra-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Rule
        </button>
      </div>

      {/* Add rule form */}
      {showAdd && (
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1">Charge Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none"
              >
                {CHARGE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-center">
              <ArrowRight className="w-5 h-5 text-neutral-300 mb-2" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1">Target Folio</label>
              <select
                value={newTargetFolioId}
                onChange={e => setNewTargetFolioId(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none"
              >
                {folios.map(f => (
                  <option key={f.id} value={f.id}>Window {f.window_label} — {f.folio_type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-[12px] text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAdd} className="px-3 py-1.5 text-[12px] font-medium text-white bg-terra-600 hover:bg-terra-700 rounded-lg transition-colors">Save Rule</button>
          </div>
        </div>
      )}

      {/* Rules table */}
      {loading ? (
        <div className="text-center py-8 text-neutral-400 text-[13px]">Loading...</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-[13px]">
          No routing rules configured
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Category</th>
                <th className="text-center px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]"></th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Target Folio</th>
                <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => {
                const targetFolio = folios.find(f => f.id === rule.target_folio_id);
                return (
                  <tr key={rule.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                    <td className="px-3 py-2.5 text-neutral-900 font-medium capitalize">{rule.charge_category.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2.5 text-center"><ArrowRight className="w-4 h-4 text-neutral-300 mx-auto" /></td>
                    <td className="px-3 py-2.5 text-neutral-700">Window {targetFolio?.window_label || '?'} ({targetFolio?.folio_type || ''})</td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={() => handleDelete(rule.id)} className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
