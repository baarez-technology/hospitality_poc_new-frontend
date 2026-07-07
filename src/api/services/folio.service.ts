import { apiClient, clearApiCache } from '../client';
import type {
  Folio,
  PostChargeData,
  PostPaymentData,
  PostRefundData,
  AdjustChargeData,
  TransferChargeData,
  SettleFolioData,
} from '@/types/folio.types';

const base = (bookingId: number | string) => `/api/v1/bookings/${bookingId}`;

export const folioService = {
  // ── Folio CRUD ──────────────────────────────────────────────
  listFolios: async (bookingId: number | string, forceRefresh = false) => {
    // Clear cache if force refresh requested
    if (forceRefresh) {
      clearApiCache(`/bookings/${bookingId}/folios`);
    }
    const res = await apiClient.get(`${base(bookingId)}/folios`, forceRefresh ? { noCache: true } as any : undefined);
    return res.data;
  },

  getFolio: async (bookingId: number | string, folioId: number, forceRefresh = false) => {
    if (forceRefresh) {
      clearApiCache(`/bookings/${bookingId}/folios/${folioId}`);
    }
    const res = await apiClient.get(`${base(bookingId)}/folios/${folioId}`, forceRefresh ? { noCache: true } as any : undefined);
    return res.data;
  },

  createFolio: async (bookingId: number | string, data: { folio_type?: string; window_label?: string }) => {
    const res = await apiClient.post(`${base(bookingId)}/folios`, data);
    return res.data;
  },

  autoCreateFolio: async (bookingId: number | string) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/auto-create`);
    return res.data;
  },

  // ── Charges ─────────────────────────────────────────────────
  postCharge: async (bookingId: number | string, folioId: number, data: PostChargeData) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/charges`, data);
    return res.data;
  },

  postRoomCharges: async (bookingId: number | string, folioId: number) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/room-charges`);
    return res.data;
  },

  adjustCharge: async (bookingId: number | string, folioId: number, itemId: number, data: AdjustChargeData) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/charges/${itemId}/adjust`, data);
    return res.data;
  },

  voidCharge: async (bookingId: number | string, folioId: number, itemId: number) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/charges/${itemId}/void`);
    return res.data;
  },

  splitCharge: async (bookingId: number | string, folioId: number, itemId: number, splits: Array<{ folio_id: number; amount: number }>) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/charges/${itemId}/split`, { splits });
    return res.data;
  },

  transferCharges: async (bookingId: number | string, data: TransferChargeData) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/transfer`, data);
    return res.data;
  },

  // ── Payments ────────────────────────────────────────────────
  postPayment: async (bookingId: number | string, folioId: number, data: PostPaymentData) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/payments`, data);
    return res.data;
  },

  postRefund: async (bookingId: number | string, folioId: number, data: PostRefundData) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/refunds`, data);
    return res.data;
  },

  // ── Settlement ──────────────────────────────────────────────
  settleFolio: async (bookingId: number | string, folioId: number, data?: SettleFolioData) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/settle`, data || {});
    return res.data;
  },

  settleAll: async (bookingId: number | string) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/settle-all`);
    return res.data;
  },

  // ── Statement ───────────────────────────────────────────────
  getStatement: async (bookingId: number | string, folioId: number) => {
    const res = await apiClient.get(`${base(bookingId)}/folios/${folioId}/statement`);
    return res.data;
  },

  // ── Routing Rules ───────────────────────────────────────────
  getRoutingRules: async (bookingId: number | string) => {
    const res = await apiClient.get(`${base(bookingId)}/routing-rules`);
    return res.data;
  },

  createRoutingRule: async (bookingId: number | string, data: { charge_category: string; target_folio_id: number; payment_method?: string }) => {
    const res = await apiClient.post(`${base(bookingId)}/routing-rules`, data);
    return res.data;
  },

  deleteRoutingRule: async (bookingId: number | string, ruleId: number) => {
    const res = await apiClient.delete(`${base(bookingId)}/routing-rules/${ruleId}`);
    return res.data;
  },

  // ── Cross-Booking Transfers ───────────────────────────────────
  crossBookingTransfer: async (bookingId: number | string, data: {
    line_item_ids: number[];
    target_booking_id: number;
    target_folio_id?: number;
    notes?: string;
  }) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/transfer-to-booking`, data);
    return res.data;
  },

  // ── Print / Copy of Folio ────────────────────────────────────
  printFolio: async (bookingId: number | string, folioId: number) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/${folioId}/print`);
    return res.data;
  },

  moveToPaymaster: async (bookingId: number | string, data: {
    line_item_ids: number[];
    paymaster_account_id: number;
    notes?: string;
  }) => {
    const res = await apiClient.post(`${base(bookingId)}/folios/move-to-paymaster`, data);
    return res.data;
  },
};
