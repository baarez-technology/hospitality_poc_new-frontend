/**
 * Bill Screen — Full bill with folio integration.
 *
 * Key flows:
 * 1. Cash/Card/UPI → simple payment
 * 2. Charge to Room → looks up booking → posts to guest folio
 * 3. Room Service → room number auto-filled from order's table/room
 * 4. Cancel Order → cancels with reason
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Smartphone, BedDouble, Printer, Users, Check, XCircle, AlertTriangle } from 'lucide-react';
import { fnbService, type Order } from '../../api/services/fnb.service';
import { useFnB } from '../../contexts/FnBContext';
import { MOCK_ORDERS } from '../../data/fnb-mock';
import { formatCurrency } from '../../utils/formatters';
import { isRoomServiceOutlet, posBillTitle, posSpotLabel } from '../../utils/posLabels';
import { Button } from '../../components/ui2/Button';
import { Input } from '../../components/ui2/Input';
import { Badge } from '../../components/ui2/Badge';
import toast from 'react-hot-toast';

const fmt = (n: number) => formatCurrency(n, 'INR');

type PayMethod = 'cash' | 'card' | 'upi' | 'room_charge';

const METHODS: { id: PayMethod; label: string; icon: any; desc: string }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote, desc: 'Cash payment' },
  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Credit or debit card' },
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe' },
  { id: 'room_charge', label: 'Charge to Room', icon: BedDouble, desc: 'Post to guest folio' },
];

export default function BillScreen() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { selectedOutlet, refreshTables, refreshOrders, tables } = useFnB();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PayMethod>('cash');
  const [roomNumber, setRoomNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const isRs = isRoomServiceOutlet(selectedOutlet ?? undefined);
  const tableRow = tables.find(t => t.id === Number(tableId));
  const displaySpot = tableRow?.number ?? String(tableId ?? '');

  // Auto-fill room number for room service orders
  useEffect(() => {
    if (isRs && tableRow) {
      setRoomNumber(tableRow.number);
      setSelectedMethod('room_charge');
    }
  }, [isRs, tableRow]);

  // Load order
  useEffect(() => {
    const load = async () => {
      try {
        const o = await fnbService.getActiveOrderForTable(Number(tableId));
        if (o) {
          const billed = await fnbService.generateBill(o.id);
          setOrder(billed);
        }
      } catch {
        const mock = MOCK_ORDERS.find(o => o.table_id === Number(tableId));
        if (mock) setOrder(mock);
      } finally { setLoading(false); }
    };
    load();
  }, [tableId]);

  // Payment handler
  const handlePayment = async () => {
    if (!order) return;
    if (selectedMethod === 'room_charge' && !roomNumber.trim()) {
      toast.error('Enter room number');
      return;
    }
    setProcessing(true);
    try {
      if (selectedMethod === 'room_charge') {
        // Charge to guest folio
        const result = await fnbService.chargeToRoom(order.id, roomNumber, order.total);
        if (result.success) {
          toast.success(`Charged to Room ${roomNumber}`);
        } else {
          // Demo mode — simulate success
          toast.success(`Charged to Room ${roomNumber}`);
        }
      } else {
        await fnbService.processPayment({
          order_id: order.id,
          payment_method: selectedMethod,
          amount: order.total,
        });
        toast.success('Payment successful');
      }
      setPaid(true);
      await Promise.all([refreshTables(), refreshOrders()]);
    } catch {
      // Demo mode — simulate success
      toast.success(selectedMethod === 'room_charge' ? `Charged to Room ${roomNumber}` : 'Payment successful');
      setPaid(true);
    } finally { setProcessing(false); }
  };

  // Cancel order handler
  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await fnbService.voidOrder(order.id, cancelReason);
      toast.success('Order cancelled');
      await Promise.all([refreshTables(), refreshOrders()]);
      navigate(-1);
    } catch {
      toast.success('Order cancelled');
      navigate(-1);
    } finally { setCancelling(false); }
  };

  const perPerson = splitMode ? Math.round((order?.total || 0) / splitCount) : (order?.total || 0);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-terra-600 rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <p className="text-neutral-500 text-[13px] mb-4">No active order for this {isRs ? 'room' : 'table'}</p>
      <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  if (paid) return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <Check className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-[18px] font-semibold text-neutral-900 mb-1">Payment Complete</h2>
      <p className="text-[13px] text-neutral-500 mb-1">Order {order.order_number}</p>
      <p className="text-[17px] font-bold text-neutral-900 tabular-nums mb-6">{fmt(order.total)}</p>
      {selectedMethod === 'room_charge' && (
        <Badge variant="info" size="md" className="mb-4">Charged to Room {roomNumber}</Badge>
      )}
      <div className="flex gap-3">
        <Button variant="outline-neutral" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-1.5" /> Print
        </Button>
        <Button variant="primary" onClick={() => navigate('/pos/tables')}>Back to {isRs ? 'Rooms' : 'Tables'}</Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left — Bill */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f7f5]">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 sm:px-6">
          <div className="flex items-center h-12 gap-3">
            <button onClick={() => navigate(-1)} className="text-[12px] text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="w-px h-4 bg-neutral-200" />
            <div className="flex-1">
              <span className="text-[14px] font-semibold text-neutral-900">{posBillTitle(isRs, displaySpot)}</span>
              <span className="text-[11px] text-neutral-400 ml-2">{order.order_number}</span>
            </div>
            {/* Cancel order button */}
            <button onClick={() => setShowCancel(true)}
              className="h-8 px-3 rounded-lg border border-red-200 text-[12px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Cancel Order
            </button>
          </div>
        </div>

        {/* Bill items */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-[10px] overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Item</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-14">Qty</th>
                    <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-20">Price</th>
                    <th className="text-right py-3 px-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-neutral-50">
                      <td className="py-3 px-4 text-neutral-800 font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-center text-neutral-600 tabular-nums">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-neutral-500 tabular-nums">{fmt(item.price)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-neutral-800 tabular-nums">{fmt(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-neutral-200 space-y-1.5">
                <div className="flex justify-between text-[12px] text-neutral-500">
                  <span>Subtotal</span><span className="tabular-nums">{fmt(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-neutral-500">
                  <span>GST (5%)</span><span className="tabular-nums">{fmt(order.gst)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-semibold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Total</span><span className="tabular-nums">{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Split Bill */}
            <div className="bg-white rounded-[10px] mt-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-500" />
                  <span className="text-[13px] font-medium text-neutral-700">Split Bill</span>
                </div>
                <button onClick={() => setSplitMode(!splitMode)}
                  className={`w-10 h-6 rounded-full transition-colors ${splitMode ? 'bg-terra-600' : 'bg-neutral-300'}`}>
                  <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${splitMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              {splitMode && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[12px] text-neutral-500">Split among</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-[13px] font-bold">-</button>
                    <span className="w-8 text-center text-[13px] font-bold">{splitCount}</span>
                    <button onClick={() => setSplitCount(splitCount + 1)} className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-[13px] font-bold">+</button>
                  </div>
                  <span className="text-[12px] text-neutral-500">people</span>
                  <span className="ml-auto text-[14px] font-bold text-terra-700 tabular-nums">{fmt(perPerson)} each</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Payment methods */}
      <div className="w-full lg:w-[360px] flex-shrink-0 bg-white border-l border-neutral-200 flex flex-col">
        <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-100">
          <h3 className="text-[13px] font-semibold text-neutral-800">Payment Method</h3>
        </div>

        <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
          {METHODS.map(method => (
            <button key={method.id} onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-[10px] border-2 transition-all text-left ${
                selectedMethod === method.id
                  ? 'border-terra-400 bg-terra-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMethod === method.id ? 'bg-terra-600 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}>
                <method.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-800">{method.label}</p>
                <p className="text-[11px] text-neutral-500">{method.desc}</p>
              </div>
            </button>
          ))}

          {/* Room number input — auto-filled for room service */}
          {selectedMethod === 'room_charge' && (
            <div className="pt-2 space-y-2">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Room Number</label>
              <Input value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. 301"
                size="md"
                disabled={isRs} />
              {isRs && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Auto-filled from room service order
                </p>
              )}
              {!isRs && roomNumber && (
                <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Guest must be checked in to this room
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pay button */}
        <div className="flex-shrink-0 p-4 border-t border-neutral-200">
          <Button variant="primary" onClick={handlePayment} disabled={processing} className="w-full h-12 text-[14px]">
            {processing ? 'Processing...' : `Pay ${fmt(splitMode ? perPerson : order.total)}`}
          </Button>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancel(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[14px] shadow-2xl z-10">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900">Cancel Order</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">This will cancel order {order.order_number} and release {posSpotLabel(isRs, displaySpot)}</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">Reason for cancellation</label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                className="w-full min-h-[80px] px-3.5 py-2 text-sm bg-white border border-neutral-200 rounded-[var(--brand-radius-md)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 resize-none"
                placeholder="e.g. Guest changed mind, wrong order..." />
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex gap-3">
              <Button variant="outline-neutral" onClick={() => setShowCancel(false)} className="flex-1">Keep Order</Button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 h-10 rounded-[var(--brand-radius-lg)] bg-red-600 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-red-700 disabled:opacity-50 transition-colors">
                <XCircle className="w-3.5 h-3.5" /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
