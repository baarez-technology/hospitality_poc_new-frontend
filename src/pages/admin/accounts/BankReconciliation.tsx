/**
 * Bank Reconciliation — Matches admin design. Two-panel match view.
 */
import { useState, useMemo } from 'react';
import { Check, Link2, CheckCircle } from 'lucide-react';
import { MOCK_TRANSACTIONS, MOCK_BANK_ENTRIES, type Transaction, type BankEntry } from '../../../utils/accounts';
import { formatCurrency } from '../../../utils/formatters';
import { Badge } from '../../../components/ui2/Badge';
import { Button } from '../../../components/ui2/Button';
import toast from 'react-hot-toast';

const fmt = (v: number) => formatCurrency(v, 'INR');

export default function BankReconciliation() {
  const [systemTxns] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [bankEntries, setBankEntries] = useState<BankEntry[]>(MOCK_BANK_ENTRIES);
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);

  const unmatchedBank = useMemo(() => bankEntries.filter(b => !b.matched), [bankEntries]);
  const matchedBank = useMemo(() => bankEntries.filter(b => b.matched), [bankEntries]);
  const totalMatched = matchedBank.reduce((s, b) => s + b.amount, 0);
  const totalUnmatched = unmatchedBank.reduce((s, b) => s + b.amount, 0);

  const handleMatch = () => {
    if (selectedSystem === null || selectedBank === null) return;
    setBankEntries(prev => prev.map(b => b.id === selectedBank ? { ...b, matched: true, matched_txn_id: selectedSystem } : b));
    setSelectedSystem(null);
    setSelectedBank(null);
    toast.success('Transaction matched');
  };

  const handleUnmatch = (bankId: number) => {
    setBankEntries(prev => prev.map(b => b.id === bankId ? { ...b, matched: false, matched_txn_id: undefined } : b));
    toast.success('Match removed');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Bank Reconciliation</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Match system transactions with bank statement entries.</p>
        </header>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Matched', value: String(matchedBank.length), sub: fmt(totalMatched), color: 'sage' },
            { label: 'Unmatched', value: String(unmatchedBank.length), sub: fmt(totalUnmatched), color: 'gold' },
            { label: 'Variance', value: fmt(Math.abs(totalUnmatched - totalMatched)), color: 'neutral' as const },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[10px] p-4 sm:p-5">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">{kpi.label}</p>
              <p className={`text-xl sm:text-[28px] font-semibold tracking-tight tabular-nums text-${kpi.color === 'sage' ? 'emerald' : kpi.color === 'gold' ? 'amber' : 'neutral'}-700`}>{kpi.value}</p>
              {kpi.sub && <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">{kpi.sub}</p>}
            </div>
          ))}
        </div>

        {/* Match action bar */}
        {selectedSystem !== null && selectedBank !== null && (
          <div className="bg-terra-50 border border-terra-200 rounded-[10px] px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
            <span className="text-[13px] text-terra-700 font-medium">Match selected entries?</span>
            <Button variant="primary" onClick={handleMatch} className="h-8 text-[12px]">
              <Link2 className="w-3.5 h-3.5 mr-1.5" /> Match
            </Button>
            <Button variant="outline-neutral" onClick={() => { setSelectedSystem(null); setSelectedBank(null); }} className="h-8 text-[12px]">
              Cancel
            </Button>
          </div>
        )}

        {/* Two-column panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System Transactions */}
          <div className="bg-white rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-neutral-100">
              <h3 className="text-[13px] font-semibold text-neutral-800">System Transactions</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Click to select for matching</p>
            </div>
            <div className="divide-y divide-neutral-50 max-h-[400px] overflow-auto">
              {systemTxns.filter(t => t.credit > 0).map(txn => (
                <button key={txn.id}
                  onClick={() => setSelectedSystem(selectedSystem === txn.id ? null : txn.id)}
                  className={`w-full text-left px-4 sm:px-6 py-3 flex items-center justify-between transition-colors ${
                    selectedSystem === txn.id ? 'bg-terra-50 border-l-[3px] border-l-terra-500 pl-[13px] sm:pl-[21px]' : 'hover:bg-neutral-50'
                  }`}>
                  <div>
                    <p className="text-[13px] text-neutral-700">{txn.description}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{txn.date} · {txn.reference}</p>
                  </div>
                  <span className="text-[13px] font-semibold text-emerald-600 tabular-nums flex-shrink-0 ml-3">{fmt(txn.credit)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Entries */}
          <div className="bg-white rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-neutral-100">
              <h3 className="text-[13px] font-semibold text-neutral-800">Bank Statement</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Click to select for matching</p>
            </div>
            <div className="divide-y divide-neutral-50 max-h-[400px] overflow-auto">
              {unmatchedBank.map(entry => (
                <button key={entry.id}
                  onClick={() => setSelectedBank(selectedBank === entry.id ? null : entry.id)}
                  className={`w-full text-left px-4 sm:px-6 py-3 flex items-center justify-between transition-colors ${
                    selectedBank === entry.id ? 'bg-terra-50 border-l-[3px] border-l-terra-500 pl-[13px] sm:pl-[21px]' : 'hover:bg-neutral-50'
                  }`}>
                  <div>
                    <p className="text-[13px] text-neutral-700">{entry.description}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{entry.date}</p>
                  </div>
                  <span className={`text-[13px] font-semibold tabular-nums flex-shrink-0 ml-3 ${entry.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {entry.type === 'debit' ? '-' : '+'}{fmt(entry.amount)}
                  </span>
                </button>
              ))}
              {unmatchedBank.length === 0 && (
                <div className="py-10 text-center text-neutral-400 text-[13px]">All entries matched</div>
              )}
            </div>
          </div>
        </div>

        {/* Reconciled section */}
        {matchedBank.length > 0 && (
          <div className="bg-white rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-neutral-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-[13px] font-semibold text-neutral-800">Reconciled</h3>
              <Badge variant="success" size="xs">{matchedBank.length}</Badge>
            </div>
            <div className="divide-y divide-neutral-50">
              {matchedBank.map(entry => (
                <div key={entry.id} className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] text-neutral-700">{entry.description}</p>
                      <p className="text-[10px] text-neutral-400">{entry.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[13px] font-medium text-emerald-700 tabular-nums">{fmt(entry.amount)}</span>
                    <button onClick={() => handleUnmatch(entry.id)} className="text-[10px] text-red-500 hover:text-red-600 font-semibold">Unmatch</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
