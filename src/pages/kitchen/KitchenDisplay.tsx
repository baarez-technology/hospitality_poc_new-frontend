/**
 * Kitchen Display System — Enterprise, differentiated columns, responsive.
 *
 * Each column has its own subtle personality through left accent + header tint.
 * Cards are white, clean. Timer is the only loud color.
 * Responsive: 3-col on desktop, stacked tabs on mobile/small tablets.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Clock, ChefHat, CheckCircle2, Bell, ArrowRight, AlertTriangle, Flame } from 'lucide-react';
import { kitchenService } from '../../api/services/kitchen.service';
import { useFnB } from '../../contexts/FnBContext';
import type { Order } from '../../api/services/fnb.service';
import { MOCK_ORDERS } from '../../data/fnb-mock';
import toast from 'react-hot-toast';

const COLUMNS = [
  { status: 'new',       label: 'New',        fullLabel: 'New Orders',     icon: Bell,         accent: '', headerDot: 'bg-orange-500', headerTint: 'bg-orange-50/60',  tabActive: 'bg-orange-500 text-white', tabBadge: 'bg-orange-500' },
  { status: 'preparing', label: 'Preparing',   fullLabel: 'In Kitchen',     icon: Flame,        accent: '',   headerDot: 'bg-blue-500',   headerTint: 'bg-blue-50/40',    tabActive: 'bg-blue-500 text-white',   tabBadge: 'bg-blue-500' },
  { status: 'ready',     label: 'Ready',       fullLabel: 'Ready to Serve', icon: CheckCircle2, accent: '', headerDot: 'bg-emerald-500', headerTint: 'bg-emerald-50/40', tabActive: 'bg-emerald-500 text-white', tabBadge: 'bg-emerald-500' },
] as const;

type TimerTier = 'normal' | 'warning' | 'danger' | 'critical';
function getTimerTier(m: number): TimerTier { return m >= 15 ? 'critical' : m >= 12 ? 'danger' : m >= 8 ? 'warning' : 'normal'; }
const TIMER_CLR: Record<TimerTier, string> = { normal: 'text-neutral-400', warning: 'text-amber-600', danger: 'text-orange-600', critical: 'text-red-600' };

function useTimer(createdAt: string) {
  const [s, setS] = useState({ text: '0:00', mins: 0, tier: 'normal' as TimerTier });
  useEffect(() => {
    const tick = () => { const d = Math.max(0, Date.now() - new Date(createdAt).getTime()); const m = Math.floor(d / 60000); setS({ text: `${m}:${Math.floor((d % 60000) / 1000).toString().padStart(2, '0')}`, mins: m, tier: getTimerTier(m) }); };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [createdAt]);
  return s;
}

// ── Ticket Card ─────────────────────────────────────────────────────────

function Ticket({ order, accent, onAdvance, isNew }: {
  order: Order; accent: string; onAdvance: () => void; isNew: boolean;
}) {
  const t = useTimer(order.created_at);

  return (
    <div
      onClick={onAdvance}
      className={`bg-white rounded-[10px] border border-neutral-200 overflow-hidden cursor-pointer select-none transition-all hover:shadow-md active:scale-[0.98] ${
        t.tier === 'critical' ? 'border-red-200 shadow-sm' : ''
      } ${isNew ? 'animate-[ticketIn_0.3s_ease-out]' : ''}`}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-bold text-neutral-900 tracking-tight leading-none">T{order.table_number}</span>
            {order.server_name && <span className="text-[10px] text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5 font-medium">{order.server_name}</span>}
          </div>
          {order.items.length > 3 && <span className="text-[10px] text-neutral-400 mt-1 block">{order.items.length} items</span>}
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-[15px] font-mono font-semibold tabular-nums ${TIMER_CLR[t.tier]} ${t.tier === 'critical' ? 'animate-pulse' : ''}`}>
            {t.text}
          </span>
          {t.tier === 'critical' && (
            <span className="flex items-center gap-1 justify-end mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-semibold text-red-500 uppercase">{t.mins}m late</span>
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 py-[3px]">
            <span className="text-[14px] font-semibold text-neutral-400 min-w-[24px] text-right tabular-nums">{item.quantity}×</span>
            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-medium text-neutral-800">{item.name}</span>
              {item.notes && <span className="text-[11px] text-amber-600 block">★ {item.notes}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <span className="text-[10px] text-neutral-400 font-mono">{order.order_number}</span>
        <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-0.5 hover:text-neutral-700">
          Advance <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

// ── Audio ────────────────────────────────────────────────────────────────

function beep() { try { const c = new (window.AudioContext || (window as any).webkitAudioContext)(); [660, 880].forEach((f, i) => { const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = f; g.gain.value = 0.15; o.start(c.currentTime + i * 0.12); o.stop(c.currentTime + i * 0.12 + 0.1); }); } catch {} }

// ── Main ────────────────────────────────────────────────────────────────

export default function KitchenDisplay() {
  const { selectedOutlet, outlets, selectOutlet } = useFnB();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [mobileTab, setMobileTab] = useState(0); // for responsive tabs
  const prevRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const q = await kitchenService.getQueue(selectedOutlet?.id); setOrders(q);
      const nc = q.filter(o => o.status === 'new').length;
      if (nc > prevRef.current) { beep(); setNewIds(new Set(q.filter(o => o.status === 'new').map(o => o.id))); setTimeout(() => setNewIds(new Set()), 2000); }
      prevRef.current = nc;
    } catch { setOrders(MOCK_ORDERS); prevRef.current = MOCK_ORDERS.filter(o => o.status === 'new').length; }
    finally { setLoading(false); }
  }, [selectedOutlet]);

  useEffect(() => { if (!selectedOutlet && outlets.length > 0) selectOutlet(outlets[0]); }, [selectedOutlet, outlets, selectOutlet]);
  useEffect(() => { load(); const id = setInterval(load, 5000); return () => clearInterval(id); }, [load]);

  const advance = async (order: Order) => {
    const next = order.status === 'new' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'served';
    try { await kitchenService.advanceOrder(order.id); await load(); }
    catch { setOrders(p => p.map(o => o.id === order.id ? { ...o, status: next as any } : o).filter(o => o.status !== 'served')); toast.success(`→ ${next.charAt(0).toUpperCase() + next.slice(1)}`); }
  };

  const grouped = useMemo(() => ({
    new: orders.filter(o => o.status === 'new'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
  }), [orders]);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <style>{`
        @keyframes ticketIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .kds-scroll::-webkit-scrollbar { width: 4px; }
        .kds-scroll::-webkit-scrollbar-track { background: transparent; }
        .kds-scroll::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
        .kds-scroll::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
      `}</style>

      {/* ── Mobile/tablet: Tab selector (below lg) ── */}
      <div className="lg:hidden flex-shrink-0 bg-white border-b border-neutral-200 px-3 py-2 flex gap-2">
        {COLUMNS.map((col, i) => {
          const count = grouped[col.status as keyof typeof grouped]?.length || 0;
          const Icon = col.icon;
          return (
            <button key={col.status} onClick={() => setMobileTab(i)}
              className={`flex-1 h-10 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === i ? col.tabActive : 'bg-neutral-100 text-neutral-600'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {col.label}
              {count > 0 && (
                <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                  mobileTab === i ? 'bg-white/30 text-white' : `${col.tabBadge} text-white`
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Mobile/tablet: Single column view ── */}
      <div className="lg:hidden flex-1 overflow-auto kds-scroll p-3 space-y-2.5">
        {(() => {
          const col = COLUMNS[mobileTab];
          const columnOrders = grouped[col.status as keyof typeof grouped] || [];
          const Icon = col.icon;
          return columnOrders.length > 0 ? (
            columnOrders.map(order => (
              <Ticket key={order.id} order={order} accent={col.accent} onAdvance={() => advance(order)} isNew={newIds.has(order.id)} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
              <Icon className="w-10 h-10 mb-2" />
              <span className="text-[13px] text-neutral-400">No {col.label.toLowerCase()} orders</span>
            </div>
          );
        })()}
      </div>

      {/* ── Desktop: 3-column kanban ── */}
      <div className="hidden lg:flex flex-1 gap-4 p-4 min-h-0 overflow-hidden">
        {COLUMNS.map(col => {
          const columnOrders = grouped[col.status as keyof typeof grouped] || [];
          const Icon = col.icon;

          return (
            <div key={col.status} className="flex-1 flex flex-col min-w-0 min-h-0">
              {/* Column header — subtle tint, not heavy */}
              <div className={`flex-shrink-0 ${col.headerTint} rounded-t-[10px] border border-b-0 border-neutral-200 px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.headerDot}`} />
                  <span className="text-[12px] font-semibold text-neutral-700 uppercase tracking-wider">{col.fullLabel}</span>
                </div>
                <span className="text-[20px] font-bold text-neutral-800 tabular-nums">{columnOrders.length}</span>
              </div>

              {/* Tickets */}
              <div className="flex-1 overflow-auto kds-scroll rounded-b-[10px] border border-t-0 border-neutral-200 bg-neutral-50/50 p-3 space-y-3">
                {columnOrders.map(order => (
                  <Ticket key={order.id} order={order} accent={col.accent} onAdvance={() => advance(order)} isNew={newIds.has(order.id)} />
                ))}
                {columnOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-neutral-300">
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="text-[12px] text-neutral-400">No orders</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
