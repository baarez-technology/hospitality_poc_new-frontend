/**
 * F&B Orders — Admin view of all orders across outlets.
 * Matches Bookings page pattern: tabs + search + table + drawer.
 */
import { useState, useMemo, useEffect } from 'react';
import { ChefHat, Clock, Receipt, Eye, Search, X, RefreshCw } from 'lucide-react';
import { fnbService, type Order } from '../../../api/services/fnb.service';
import { MOCK_ORDERS } from '../../../data/fnb-mock';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';
import { Drawer } from '../../../components/ui2/Drawer';

const fmt = (v: number) => formatCurrency(v, 'INR');

const STATUS_BADGE: Record<string, { variant: string; label: string }> = {
  new:       { variant: 'warning',  label: 'New' },
  preparing: { variant: 'info',     label: 'Preparing' },
  ready:     { variant: 'success',  label: 'Ready' },
  served:    { variant: 'neutral',  label: 'Served' },
  billed:    { variant: 'primary',  label: 'Billed' },
  cancelled: { variant: 'danger',   label: 'Cancelled' },
};

function elapsed(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

export default function FnBOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fnbService.getOrders();
        setOrders(data.length > 0 ? data : MOCK_ORDERS);
      } catch {
        setOrders(MOCK_ORDERS);
      } finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    let items = orders;
    if (activeTab === 'active') items = items.filter(o => ['new', 'preparing', 'ready'].includes(o.status));
    else if (activeTab === 'completed') items = items.filter(o => ['served', 'billed'].includes(o.status));
    else if (activeTab === 'cancelled') items = items.filter(o => o.status === 'cancelled');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(o =>
        o.order_number?.toLowerCase().includes(q) ||
        o.table_number?.toString().includes(q) ||
        o.server_name?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [orders, activeTab, searchQuery]);

  const counts = useMemo(() => ({
    all: orders.length,
    active: orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).length,
    completed: orders.filter(o => ['served', 'billed'].includes(o.status)).length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }), [orders]);

  const tabs = [
    { id: 'active', label: 'Active Orders', shortLabel: 'Active', count: counts.active },
    { id: 'all', label: 'All Orders', shortLabel: 'All', count: counts.all },
    { id: 'completed', label: 'Completed', shortLabel: 'Done', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', shortLabel: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">F&B Orders</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Monitor all food and beverage orders across outlets.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={counts.active > 0 ? 'warning' : 'neutral'} size="md">
              {counts.active} active
            </Badge>
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-neutral-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                  }`}>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                      activeTab === tab.id ? 'bg-terra-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>{tab.count}</span>
                  </span>
                  {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="w-full sm:max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search by order #, table, server..." />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-neutral-200 border-t-terra-600 rounded-full animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Receipt className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Order</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Table</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Server</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Items</th>
                    <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Time</th>
                    <th className="w-10 py-3 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const badge = STATUS_BADGE[order.status] || STATUS_BADGE.new;
                    return (
                      <tr key={order.id} onClick={() => setSelectedOrder(order)}
                        className="border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-6">
                          <p className="text-[13px] font-medium text-neutral-900 font-mono">{order.order_number}</p>
                          {order.outlet_name && <p className="text-[10px] text-neutral-400 mt-0.5">{order.outlet_name}</p>}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[13px] font-semibold text-neutral-800">T{order.table_number}</span>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <span className="text-[12px] text-neutral-500">{order.server_name || '—'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[12px] text-neutral-600 tabular-nums">{order.items.length}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">{fmt(order.total)}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={badge.variant as any} size="xs">{badge.label}</Badge>
                        </td>
                        <td className="py-3 px-3 text-right hidden sm:table-cell">
                          <span className="text-[11px] text-neutral-400">{elapsed(order.created_at)}</span>
                        </td>
                        <td className="py-3 px-3">
                          <button className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filteredOrders.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[11px] sm:text-[13px] text-neutral-500">
                Showing <span className="font-semibold text-neutral-700">{filteredOrders.length}</span> of <span className="font-semibold text-neutral-700">{orders.length}</span> orders
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.order_number}` : 'Order'}
        subtitle={selectedOrder ? `Table T${selectedOrder.table_number} · ${selectedOrder.server_name || 'No server'}` : ''}
        maxWidth="max-w-md"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Status + time */}
            <div className="flex items-center justify-between">
              <Badge variant={(STATUS_BADGE[selectedOrder.status]?.variant as any) || 'neutral'} size="md">
                {STATUS_BADGE[selectedOrder.status]?.label || selectedOrder.status}
              </Badge>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {elapsed(selectedOrder.created_at)}
              </span>
            </div>

            {/* Items */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Items</label>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-start gap-2">
                      <span className="text-[13px] font-semibold text-neutral-500 tabular-nums min-w-[24px] text-right">{item.quantity}×</span>
                      <div>
                        <p className="text-[13px] font-medium text-neutral-800">{item.name}</p>
                        {item.notes && <p className="text-[11px] text-amber-600 mt-0.5">★ {item.notes}</p>}
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-neutral-700 tabular-nums">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-neutral-200 space-y-1.5">
              <div className="flex justify-between text-[12px] text-neutral-500">
                <span>Subtotal</span><span className="tabular-nums">{fmt(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-neutral-500">
                <span>GST</span><span className="tabular-nums">{fmt(selectedOrder.gst)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-semibold text-neutral-900 pt-1.5 border-t border-neutral-100">
                <span>Total</span><span className="tabular-nums">{fmt(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
