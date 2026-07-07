import { apiClient, extractData } from '../client';

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  old_value: any;
  new_value: any;
  workstation_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export const auditLogService = {
  list: async (params?: {
    action?: string;
    entity_type?: string;
    entity_id?: number;
    user_id?: number;
    workstation_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    const res = await apiClient.get('/api/v1/audit-logs', { params });
    return extractData(res)?.items || [];
  },

  get: async (id: number) => {
    const res = await apiClient.get(`/api/v1/audit-logs/${id}`);
    return extractData(res);
  },
};
