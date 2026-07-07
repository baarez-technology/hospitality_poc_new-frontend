import { apiClient, extractData } from '../client';

export interface AuditSignOff {
  id: number;
  role: string;
  sign_order: number;
  status: string;
  staff_id: number | null;
  staff_name: string | null;
  signed_at: string | null;
  comments: string | null;
}

export interface ApprovalStatus {
  audit_id: number;
  audit_date: string;
  approval_status: string;
  approvals: AuditSignOff[];
  fully_approved: boolean;
  next_pending_role: string | null;
}

export const auditPackService = {
  createSignOffs: (auditId: number) =>
    apiClient.post(`/api/v1/audit-pack/${auditId}/create-signoffs`).then(extractData),

  getApprovals: (auditId: number) =>
    apiClient.get(`/api/v1/audit-pack/${auditId}/approvals`).then(extractData),

  signOff: (auditId: number, role: string, comments?: string) =>
    apiClient.post(`/api/v1/audit-pack/${auditId}/sign-off/${role}`, { comments }).then(extractData),

  reject: (auditId: number, role: string, comments?: string) =>
    apiClient.post(`/api/v1/audit-pack/${auditId}/reject/${role}`, { comments }).then(extractData),

  getPreReport: (auditId: number) =>
    apiClient.get(`/api/v1/audit-pack/${auditId}/pre-report`).then(extractData),

  getPostReport: (auditId: number) =>
    apiClient.get(`/api/v1/audit-pack/${auditId}/post-report`).then(extractData),

  exportPdf: (auditId: number) =>
    apiClient.get(`/api/v1/audit-pack/${auditId}/export-pdf`, { responseType: 'blob' }),
};
