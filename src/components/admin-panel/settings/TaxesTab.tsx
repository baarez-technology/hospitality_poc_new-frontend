import { useState, useEffect } from 'react';
import { Receipt, Plus, Pencil, Trash2, Percent, IndianRupee, Check, X } from 'lucide-react';
import AddFeeModal from './AddFeeModal';
import EditFeeModal from './EditFeeModal';

const STORAGE_KEY = 'glimmora_fees';

const defaultFees = [
  { id: 'fee-001', name: 'Room Tax (GST)', type: 'percentage', value: 5, description: 'GST on room charges (5% for ≤₹7,500/night, 18% for >₹7,500/night)' },
  { id: 'fee-002', name: 'Service Charge', type: 'percentage', value: 10, description: 'Service charge on total bill' },
  { id: 'fee-003', name: 'City Tax', type: 'percentage', value: 5, description: 'Municipal tax' },
  { id: 'fee-004', name: 'Extra Guest Fee', type: 'fixed', value: 1500, description: 'Per extra guest per night' },
  { id: 'fee-005', name: 'Cleaning Fee', type: 'fixed', value: 500, description: 'Deep cleaning charge' },
  { id: 'fee-006', name: 'Resort Fee', type: 'fixed', value: 2000, description: 'Access to resort amenities' }
];

export default function TaxesTab() {
  const [fees, setFees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load fees from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFees(JSON.parse(stored));
    } else {
      setFees(defaultFees);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFees));
    }
  }, []);

  // Save fees to localStorage
  const saveFees = (newFees) => {
    setFees(newFees);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFees));
  };

  const handleAddFee = (newFee) => {
    const feeWithId = {
      ...newFee,
      id: `fee-${Date.now()}`
    };
    saveFees([...fees, feeWithId]);
    setShowAddModal(false);
  };

  const handleEditFee = (updatedFee) => {
    saveFees(fees.map((f) => (f.id === updatedFee.id ? updatedFee : f)));
    setEditingFee(null);
  };

  const handleDeleteFee = (id) => {
    saveFees(fees.filter((f) => f.id !== id));
    setDeleteConfirm(null);
  };

  const formatValue = (fee) => {
    if (fee.type === 'percentage') {
      return `${fee.value}%`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(fee.value);
  };

  const percentageFees = fees.filter((f) => f.type === 'percentage');
  const fixedFees = fees.filter((f) => f.type === 'fixed');

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Taxes & Fees</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure taxes and additional charges
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#A57865] text-white rounded-lg font-medium hover:bg-[#8E6554] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tax / Fee
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Percent className="w-4 h-4 text-[#A57865]" />
            </div>
            <span className="text-sm text-neutral-500">Total Tax Rate</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {percentageFees.reduce((sum, f) => sum + f.value, 0)}%
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-[#4E5840]" />
            </div>
            <span className="text-sm text-neutral-500">Fixed Fees</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {fixedFees.length} items
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-[#5C9BA4]" />
            </div>
            <span className="text-sm text-neutral-500">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{fees.length}</p>
        </div>
      </div>

      {/* Percentage-based Taxes */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="w-5 h-5 text-[#A57865]" />
          <h2 className="text-lg font-semibold text-neutral-900">Percentage-based Taxes</h2>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
          {percentageFees.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-[#E5E5E5]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Description</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {percentageFees.map((fee) => (
                  <tr key={fee.id} className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAF7F4]">
                    <td className="py-4 px-4">
                      <span className="font-medium text-neutral-900">{fee.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-neutral-500">{fee.description}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#A57865]/10 text-[#A57865] font-semibold text-sm">
                        {fee.value}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {deleteConfirm === fee.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFee(fee.id)}
                            className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingFee(fee)}
                            className="p-1.5 rounded-lg hover:bg-[#FAF7F4] text-neutral-500 hover:text-[#A57865]"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(fee.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-neutral-500">No percentage-based taxes configured</p>
            </div>
          )}
        </div>
      </section>

      {/* Fixed Fees */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee className="w-5 h-5 text-[#4E5840]" />
          <h2 className="text-lg font-semibold text-neutral-900">Fixed Fees</h2>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
          {fixedFees.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-[#E5E5E5]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Description</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fixedFees.map((fee) => (
                  <tr key={fee.id} className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAF7F4]">
                    <td className="py-4 px-4">
                      <span className="font-medium text-neutral-900">{fee.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-neutral-500">{fee.description}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#4E5840]/10 text-[#4E5840] font-semibold text-sm">
                        {formatValue(fee)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {deleteConfirm === fee.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFee(fee.id)}
                            className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingFee(fee)}
                            className="p-1.5 rounded-lg hover:bg-[#FAF7F4] text-neutral-500 hover:text-[#A57865]"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(fee.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-neutral-500">No fixed fees configured</p>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {showAddModal && (
        <AddFeeModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddFee}
        />
      )}

      {editingFee && (
        <EditFeeModal
          fee={editingFee}
          onClose={() => setEditingFee(null)}
          onSave={handleEditFee}
        />
      )}
    </div>
  );
}
