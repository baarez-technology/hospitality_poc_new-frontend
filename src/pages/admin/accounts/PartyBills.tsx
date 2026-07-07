/**
 * Party Bills — Matches admin design: search + table + UI2 drawer.
 */
import { useState } from 'react';
import { Building2, Phone, AlertTriangle } from 'lucide-react';
import { MOCK_PARTY_ACCOUNTS, type PartyAccount } from '../../../utils/accounts';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';
import { Drawer } from '../../../components/ui2/Drawer';

const fmt = (v: number) => formatCurrency(v, 'INR');

const STATUS_VARIANTS: Record<string, string> = {
  active: 'success', overdue: 'danger', suspended: 'neutral',
};

export default function PartyBills() {
  const [accounts] = useState<PartyAccount[]>(MOCK_PARTY_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<PartyAccount | null>(null);

  const filtered = searchQuery.trim()
    ? accounts.filter(a => a.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
    : accounts;

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        <header>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Party / Corporate Billing</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Credit accounts and outstanding balances.</p>
        </header>

        <div className="bg-white rounded-[10px] overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-full sm:max-w-md">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search companies..." />
              </div>
              <span className="text-[11px] text-neutral-400 tabular-nums hidden sm:block">{filtered.length} accounts</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Building2 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No accounts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Company</th>
                    <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Credit Limit</th>
                    <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Outstanding</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Last Payment</th>
                    <th className="text-center py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(acc => {
                    const utilPct = Math.round((acc.outstanding / acc.credit_limit) * 100);
                    return (
                      <tr key={acc.id} onClick={() => setSelectedAccount(acc)}
                        className="border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            {acc.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                            <div>
                              <p className="text-[13px] font-medium text-neutral-900">{acc.company_name}</p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">{acc.contact_person}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right hidden sm:table-cell">
                          <span className="text-[12px] text-neutral-500 tabular-nums">{fmt(acc.credit_limit)}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`text-[13px] font-semibold tabular-nums ${acc.outstanding > 0 ? 'text-neutral-900' : 'text-emerald-600'}`}>{fmt(acc.outstanding)}</span>
                          {acc.outstanding > 0 && <p className="text-[10px] text-neutral-400 mt-0.5">{utilPct}% used</p>}
                        </td>
                        <td className="py-3 px-3 text-center hidden md:table-cell">
                          <span className="text-[11px] text-neutral-400">{acc.last_payment_date}</span>
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-center">
                          <Badge variant={(STATUS_VARIANTS[acc.status] || 'neutral') as any} size="xs">
                            {acc.status.charAt(0).toUpperCase() + acc.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[11px] sm:text-[13px] text-neutral-500">
                Showing <span className="font-semibold text-neutral-700">{filtered.length}</span> of <span className="font-semibold text-neutral-700">{accounts.length}</span> accounts
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statement Drawer */}
      <Drawer
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.company_name || 'Account'}
        subtitle={selectedAccount ? `${selectedAccount.contact_person} · ${selectedAccount.phone}` : ''}
        maxWidth="max-w-lg"
      >
        {selectedAccount && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Credit Limit</p>
                <p className="text-[14px] font-semibold text-neutral-800 tabular-nums">{fmt(selectedAccount.credit_limit)}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Outstanding</p>
                <p className={`text-[14px] font-semibold tabular-nums ${selectedAccount.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmt(selectedAccount.outstanding)}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Available</p>
                <p className="text-[14px] font-semibold text-emerald-600 tabular-nums">{fmt(selectedAccount.credit_limit - selectedAccount.outstanding)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1.5 text-neutral-500"><Phone className="w-3 h-3" /> {selectedAccount.phone}</span>
              <Badge variant={(STATUS_VARIANTS[selectedAccount.status] || 'neutral') as any} size="sm">
                {selectedAccount.status.charAt(0).toUpperCase() + selectedAccount.status.slice(1)}
              </Badge>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">Statement</label>
              {selectedAccount.charges.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                  <div>
                    <p className="text-[12px] text-neutral-700">{c.description}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{c.date}</p>
                  </div>
                  <span className={`text-[13px] font-semibold tabular-nums ${c.type === 'charge' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {c.type === 'charge' ? '+' : '-'}{fmt(Math.abs(c.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
