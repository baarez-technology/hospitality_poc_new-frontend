import { apiClient, extractData } from '../client';

export interface PosOutlet {
  id: number;
  outlet_code: string;
  outlet_name: string;
  location: string | null;
  responsible_staff_id: number | null;
  status: string;
  created_at: string;
}

export interface PosClosureStatus {
  audit_date: string;
  total_outlets: number;
  confirmed: number;
  pending: number;
  all_confirmed: boolean;
  outlets: {
    outlet_id: number;
    outlet_code: string;
    outlet_name: string;
    audit_date: string;
    close_status: string;
    closing_revenue: number | null;
    open_checks: number | null;
    confirmed_by: number | null;
    confirmed_at: string | null;
  }[];
}

export const posClosureService = {
  listOutlets: (statusFilter?: string) =>
    apiClient.get('/api/v1/pos-closure/outlets', { params: { status_filter: statusFilter } }).then(extractData),

  createOutlet: (data: { outlet_code: string; outlet_name: string; location?: string }) =>
    apiClient.post('/api/v1/pos-closure/outlets', data).then(extractData),

  updateOutlet: (id: number, data: Partial<PosOutlet>) =>
    apiClient.put(`/api/v1/pos-closure/outlets/${id}`, data).then(extractData),

  seedDefaults: () =>
    apiClient.post('/api/v1/pos-closure/seed-defaults').then(extractData),

  getStatus: (auditDate?: string) =>
    apiClient.get('/api/v1/pos-closure/status', { params: { audit_date: auditDate } }).then(extractData),

  confirmOutlet: (outletId: number, data: { closing_revenue?: number; open_checks?: number; discrepancy_notes?: string }, auditDate?: string) =>
    apiClient.post(`/api/v1/pos-closure/outlets/${outletId}/confirm`, data, { params: { audit_date: auditDate } }).then(extractData),

  checkPending: (auditDate?: string) =>
    apiClient.get('/api/v1/pos-closure/pending-check', { params: { audit_date: auditDate } }).then(extractData),
};
