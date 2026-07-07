/**
 * POS Table Selection — Full-width, tablet-first.
 * Big tappable cards. Status at a glance. Occupied tables show order preview.
 */
import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Clock, ChefHat } from 'lucide-react';
import { useFnB } from '../../contexts/FnBContext';
import type { Table, Order } from '../../api/services/fnb.service';
import { formatCurrency } from '../../utils/formatters';
import { isRoomServiceOutlet, posSpotLabel, posCapacityLabel } from '../../utils/posLabels';
import toast from 'react-hot-toast';

const fmt = (n: number) => formatCurrency(n, 'INR');

const STATUS: Record<string, { label: string; dot: string; cardBorder: string; badgeBg: string; badgeText: string }> = {
  available: { label: 'Available', dot: 'bg-emerald-500', cardBorder: 'border-neutral-200', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
  occupied:  { label: 'Occupied',  dot: 'bg-red-500',     cardBorder: 'border-red-200',     badgeBg: 'bg-red-50',     badgeText: 'text-red-700' },
  reserved:  { label: 'Reserved',  dot: 'bg-amber-500',   cardBorder: 'border-amber-200',   badgeBg: 'bg-amber-50',   badgeText: 'text-amber-700' },
  cleaning:  { label: 'Cleaning',  dot: 'bg-neutral-400', cardBorder: 'border-neutral-200',  badgeBg: 'bg-neutral-100', badgeText: 'text-neutral-500' },
};

function resolveOrder(table: Table, orders: Order[]): Order | undefined {
  if (table.current_order_id) return orders.find(o => o.id === table.current_order_id);
  return orders.find(o => o.table_id === table.id && !['billed', 'cancelled'].includes(o.status));
}

function elapsed(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'now' : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60}m`;
}

export default function TableGrid() {
  const navigate = useNavigate();
  const { tables, selectedOutlet, activeOrders, refreshTables, refreshOrders, isLoading } = useFnB();
  const isRs = isRoomServiceOutlet(selectedOutlet ?? undefined);

  const refresh = useCallback(async () => {
    await Promise.all([refreshTables(), refreshOrders()]);
  }, [refreshTables, refreshOrders]);

  useEffect(() => { refresh(); }, [selectedOutlet?.id]);
  useEffect(() => { const id = setInterval(refresh, 15000); return () => clearInterval(id); }, [refresh]);

  if (!selectedOutlet) { navigate('/pos'); return null; }

  const counts = useMemo(() => {
    const c = { available: 0, occupied: 0, reserved: 0, cleaning: 0 };
    tables.forEach(t => { if (c[t.status as keyof typeof c] !== undefined) c[t.status as keyof typeof c]++; });
    return c;
  }, [tables]);

  const handleTap = (t: Table) => {
    if (t.status === 'reserved') { toast.error(isRs ? 'Room reserved' : 'Table reserved'); return; }
    if (t.status === 'cleaning') { toast.error(isRs ? 'Room not ready' : 'Table being cleaned'); return; }
    navigate(`/pos/order/${t.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header bar — compact, one row */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 sm:px-6">
        <div className="flex items-center h-12 gap-4 max-w-[1400px] mx-auto">
          <h2 className="text-[15px] font-semibold text-neutral-900">
            {isRs ? 'Rooms' : 'Tables'}
          </h2>
          <span className="text-[12px] text-neutral-400">{tables.length} total</span>

          {/* Status dots */}
          <div className="flex items-center gap-3 ml-auto text-[11px]">
            {Object.entries(STATUS).map(([key, cfg]) => {
              const count = counts[key as keyof typeof counts];
              if (count === 0) return null;
              return (
                <span key={key} className="flex items-center gap-1 text-neutral-500">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="font-medium text-neutral-700">{count}</span>
                  <span className="hidden sm:inline">{cfg.label}</span>
                </span>
              );
            })}
          </div>

          <button onClick={refresh} disabled={isLoading}
            className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 flex-shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table grid — full width, big cards */}
      <div className="flex-1 overflow-auto bg-[#f8f7f5]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {tables.map(table => {
              const cfg = STATUS[table.status] || STATUS.available;
              const order = table.status === 'occupied' ? resolveOrder(table, activeOrders) : undefined;
              const blocked = table.status === 'reserved' || table.status === 'cleaning';

              return (
                <button key={table.id} onClick={() => handleTap(table)} disabled={blocked}
                  className={`bg-white rounded-xl border ${cfg.cardBorder} p-4 text-left transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
                    !blocked ? 'hover:shadow-lg hover:border-neutral-300' : ''
                  }`}
                >
                  {/* Table name — big and bold */}
                  <p className="text-[20px] font-bold text-neutral-900 tracking-tight mb-0.5">
                    {posSpotLabel(isRs, table.number)}
                  </p>
                  <p className="text-[11px] text-neutral-400 mb-3">{posCapacityLabel(isRs, table.capacity)}</p>

                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${cfg.badgeBg} ${cfg.badgeText}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>

                  {/* Active order preview */}
                  {order && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-1">
                        <span className="font-mono font-medium text-neutral-600">{order.order_number}</span>
                        <span className="flex items-center gap-0.5">
                          <ChefHat className="w-3 h-3" />
                          {order.status === 'ready' ? 'Ready' : order.status === 'preparing' ? 'Cooking' : 'Sent'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-0.5 text-neutral-400">
                          <Clock className="w-3 h-3" />{elapsed(order.created_at)}
                        </span>
                        <span className="font-bold text-neutral-800 tabular-nums">{fmt(order.total)}</span>
                      </div>
                    </div>
                  )}

                  {blocked && (
                    <p className="mt-2 text-[10px] text-neutral-400 italic">
                      {table.status === 'reserved' ? 'Not available' : 'Being cleaned'}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
