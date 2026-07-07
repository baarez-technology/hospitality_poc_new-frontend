/**
 * Accounts Dashboard — Matches admin design: KPIs + transactions table.
 */
import { useState, useMemo } from 'react';
import { DollarSign, TrendingDown, Banknote, AlertTriangle } from 'lucide-react';
import { MOCK_TRANSACTIONS, MOCK_PARTY_ACCOUNTS } from '../../../utils/accounts';
import { formatCurrency } from '../../../utils/formatters';
import { Badge } from '../../../components/ui2/Badge';
import { Input } from '../../../components/ui2/Input';

const fmt = (v: number) => formatCurrency(v, 'INR');

const MODULE_VARIANTS: Record<string, string> = {
  'POS': 'info', 'Front Office': 'success', 'Banquet': 'primary',
  'Housekeeping': 'warning', 'Purchase': 'neutral',
};

export default function AccountsDashboard() {
  const [dateFilter, setDateFilter] = useState('');

  const transactions = useMemo(() => {
    if (!dateFilter) return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter(t => t.date >= dateFilter);
  }, [dateFilter]);

  const totalReceivables = MOCK_PARTY_ACCOUNTS.reduce((s, a) => s + a.outstanding, 0);
  const totalPayables = 44000;
  const todaysCollections = MOCK_TRANSACTIONS.filter(t => t.date === '2026-04-02').reduce((s, t) => s + t.credit, 0);
  const overdue = MOCK_PARTY_ACCOUNTS.filter(a => a.status === 'overdue').reduce((s, a) => s + a.outstanding, 0);

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Accounts Dashboard</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Financial overview across all modules.</p>
          </div>
          <div className="w-40">
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} size="md" />
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Receivables', value: fmt(totalReceivables), icon: DollarSign, color: 'ocean' },
            { label: 'Total Payables', value: fmt(totalPayables), icon: TrendingDown, color: 'gold' },
            { label: "Today's Collections", value: fmt(todaysCollections), icon: Banknote, color: 'sage' },
            { label: 'Overdue Amount', value: fmt(overdue), icon: AlertTriangle, color: 'rose' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[10px] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-${kpi.color}-50`}>
                  <kpi.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${kpi.color}-600`} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{kpi.label}</p>
              </div>
              <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 tabular-nums">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-neutral-800">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Description</th>
                  <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Module</th>
                  <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Debit</th>
                  <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Credit</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Ref</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-6 text-[12px] text-neutral-500">{txn.date}</td>
                    <td className="py-3 px-3 text-[13px] text-neutral-800">{txn.description}</td>
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <Badge variant={(MODULE_VARIANTS[txn.module] || 'neutral') as any} size="xs">{txn.module}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right text-[13px] tabular-nums">
                      {txn.debit > 0 ? <span className="text-red-600 font-medium">{fmt(txn.debit)}</span> : ''}
                    </td>
                    <td className="py-3 px-3 text-right text-[13px] tabular-nums">
                      {txn.credit > 0 ? <span className="text-emerald-600 font-medium">{fmt(txn.credit)}</span> : ''}
                    </td>
                    <td className="py-3 px-4 sm:px-6 hidden md:table-cell">
                      <span className="text-[11px] text-neutral-400 font-mono">{txn.reference}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
            <p className="text-[11px] sm:text-[13px] text-neutral-500">
              Showing <span className="font-semibold text-neutral-700">{transactions.length}</span> transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
