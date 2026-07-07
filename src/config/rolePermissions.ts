/**
 * Glimmora RBAC – Role-Based Access Control Configuration
 * Central config for the 10 staff roles and 17 permission modules.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type StaffRole =
  | 'admin'
  | 'general_manager'
  | 'front_office_manager'
  | 'duty_manager'
  | 'receptionist'
  | 'reservation_manager'
  | 'housekeeping_manager'
  | 'housekeeper'
  | 'revenue_manager'
  | 'accounts_manager'
  | 'fnb_server'
  | 'kitchen_staff';

export type PermissionModule =
  | 'dashboard'
  | 'bookings'
  | 'guests'
  | 'rooms'
  | 'staff'
  | 'housekeeping'
  | 'maintenance'
  | 'finance'
  | 'cms'
  | 'channels'
  | 'revenueAI'
  | 'aiAssistant'
  | 'reputationAI'
  | 'crmAI'
  | 'analytics'
  | 'reports'
  | 'settings'
  | 'fnb'
  | 'events'
  | 'inventory'
  | 'accounts';

export interface ModulePermission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export type PermissionMap = Record<PermissionModule, ModulePermission>;

// ── Role metadata ────────────────────────────────────────────────────────────

export interface RoleMeta {
  value: StaffRole;
  label: string;
  department: string;
  description: string;
}

export const STAFF_ROLES: RoleMeta[] = [
  { value: 'admin',                label: 'Administrator',         department: 'management',   description: 'Full system access with all permissions' },
  { value: 'general_manager',      label: 'General Manager',       department: 'management',   description: 'Senior management with broad operational access' },
  { value: 'front_office_manager', label: 'Front Office Manager',  department: 'frontdesk',    description: 'Manages front desk operations and guest services' },
  { value: 'duty_manager',         label: 'Duty Manager',          department: 'operations',   description: 'On-duty operational oversight and incident handling' },
  { value: 'receptionist',         label: 'Receptionist',          department: 'frontdesk',    description: 'Handles check-ins, check-outs and guest queries' },
  { value: 'reservation_manager',  label: 'Reservation Manager',   department: 'reservations', description: 'Manages bookings, availability and channel distribution' },
  { value: 'housekeeping_manager', label: 'Housekeeping Manager',  department: 'housekeeping', description: 'Oversees room cleaning and housekeeping staff' },
  { value: 'housekeeper',          label: 'Housekeeper',           department: 'housekeeping', description: 'Performs room cleaning and maintenance tasks' },
  { value: 'revenue_manager',      label: 'Revenue Manager',       department: 'revenue',      description: 'Manages pricing, revenue optimization and analytics' },
  { value: 'accounts_manager',     label: 'Accounts Manager',      department: 'finance',      description: 'Handles financial reporting and billing operations' },
  { value: 'fnb_server',           label: 'F&B Server',            department: 'fnb',          description: 'Takes orders and manages table service' },
  { value: 'kitchen_staff',        label: 'Kitchen Staff',         department: 'fnb',          description: 'Prepares food orders and manages kitchen display' },
];

// ── Module metadata (for UI display) ─────────────────────────────────────────

export interface ModuleMeta {
  id: PermissionModule;
  label: string;
  icon?: string; // lucide icon name for reference
}

export const PERMISSION_MODULES: ModuleMeta[] = [
  // Overview
  { id: 'dashboard',     label: 'Dashboard',       icon: 'LayoutDashboard' },
  // Operations
  { id: 'bookings',      label: 'Bookings',        icon: 'CalendarCheck' },
  { id: 'guests',        label: 'Guests',          icon: 'Users' },
  { id: 'rooms',         label: 'Rooms & Moves',   icon: 'BedDouble' },
  { id: 'staff',         label: 'Staff',           icon: 'UserCheck' },
  { id: 'housekeeping',  label: 'Housekeeping',    icon: 'ClipboardCheck' },
  { id: 'maintenance',   label: 'Maintenance',     icon: 'Wrench' },
  // Finance
  { id: 'finance',       label: 'Finance',         icon: 'Banknote' },
  // Distribution
  { id: 'cms',           label: 'CMS',             icon: 'Globe' },
  { id: 'channels',      label: 'Channels',        icon: 'Share2' },
  // Revenue
  { id: 'revenueAI',     label: 'Revenue',         icon: 'BarChart3' },
  // AI Tools
  { id: 'aiAssistant',   label: 'AI Assistant',    icon: 'Sparkles' },
  { id: 'reputationAI',  label: 'Reputation AI',   icon: 'MessageSquare' },
  { id: 'crmAI',         label: 'CRM AI',          icon: 'Contact' },
  // Analytics
  { id: 'analytics',     label: 'Analytics',       icon: 'TrendingUp' },
  { id: 'reports',       label: 'Reports',         icon: 'FileText' },
  // System
  { id: 'settings',      label: 'Settings & System', icon: 'Settings' },
  // New modules
  { id: 'fnb',           label: 'Food & Beverage',   icon: 'UtensilsCrossed' },
  { id: 'events',        label: 'Events & Banquets', icon: 'CalendarDays' },
  { id: 'inventory',     label: 'Inventory',         icon: 'Package' },
  { id: 'accounts',      label: 'Accounts',          icon: 'Calculator' },
];

// ── Helper ───────────────────────────────────────────────────────────────────

const p = (view: boolean, edit: boolean, del: boolean): ModulePermission => ({ view, edit, delete: del });
const NONE = p(false, false, false);
const V    = p(true,  false, false);
const VE   = p(true,  true,  false);
const VED  = p(true,  true,  true);

// ── Default permission matrix per role ───────────────────────────────────────

export const DEFAULT_PERMISSIONS: Record<StaffRole, PermissionMap> = {
  admin: {
    dashboard: VED, bookings: VED, guests: VED, rooms: VED,
    staff: VED, housekeeping: VED, maintenance: VED,
    finance: VED, cms: VED, channels: VED, revenueAI: VED,
    aiAssistant: VED, reputationAI: VED, crmAI: VED,
    analytics: VED, reports: VED, settings: VED,
    fnb: VED, events: VED, inventory: VED, accounts: VED,
  },
  general_manager: {
    dashboard: VE, bookings: VED, guests: VED, rooms: VED,
    staff: VE, housekeeping: VE, maintenance: VE,
    finance: VED, cms: VED, channels: VED, revenueAI: VED,
    aiAssistant: VE, reputationAI: VE, crmAI: VE,
    analytics: VED, reports: VED, settings: V,
    fnb: VED, events: VED, inventory: VE, accounts: VE,
  },
  front_office_manager: {
    dashboard: V, bookings: VED, guests: VED, rooms: VE,
    staff: V, housekeeping: NONE, maintenance: NONE,
    finance: VE, cms: V, channels: V, revenueAI: V,
    aiAssistant: V, reputationAI: V, crmAI: VE,
    analytics: V, reports: V, settings: NONE,
    fnb: V, events: V, inventory: NONE, accounts: NONE,
  },
  duty_manager: {
    dashboard: V, bookings: VE, guests: VE, rooms: VE,
    staff: V, housekeeping: NONE, maintenance: VE,
    finance: V, cms: NONE, channels: NONE, revenueAI: NONE,
    aiAssistant: V, reputationAI: V, crmAI: NONE,
    analytics: V, reports: V, settings: NONE,
    fnb: V, events: NONE, inventory: NONE, accounts: NONE,
  },
  receptionist: {
    dashboard: V, bookings: VE, guests: VE, rooms: V,
    staff: NONE, housekeeping: NONE, maintenance: NONE,
    finance: V, cms: NONE, channels: NONE, revenueAI: NONE,
    aiAssistant: V, reputationAI: NONE, crmAI: NONE,
    analytics: NONE, reports: NONE, settings: NONE,
    fnb: NONE, events: NONE, inventory: NONE, accounts: NONE,
  },
  reservation_manager: {
    dashboard: V, bookings: VED, guests: VE, rooms: VE,
    staff: NONE, housekeeping: NONE, maintenance: NONE,
    finance: V, cms: VED, channels: VE, revenueAI: V,
    aiAssistant: V, reputationAI: NONE, crmAI: VE,
    analytics: V, reports: V, settings: NONE,
    fnb: NONE, events: V, inventory: NONE, accounts: NONE,
  },
  housekeeping_manager: {
    dashboard: V, bookings: V, guests: V, rooms: VE,
    staff: V, housekeeping: VED, maintenance: VE,
    finance: NONE, cms: NONE, channels: NONE, revenueAI: NONE,
    aiAssistant: V, reputationAI: NONE, crmAI: NONE,
    analytics: NONE, reports: V, settings: NONE,
    fnb: NONE, events: NONE, inventory: NONE, accounts: NONE,
  },
  housekeeper: {
    dashboard: NONE, bookings: NONE, guests: NONE, rooms: V,
    staff: NONE, housekeeping: VE, maintenance: VE,
    finance: NONE, cms: NONE, channels: NONE, revenueAI: NONE,
    aiAssistant: V, reputationAI: NONE, crmAI: NONE,
    analytics: NONE, reports: NONE, settings: NONE,
    fnb: NONE, events: NONE, inventory: NONE, accounts: NONE,
  },
  revenue_manager: {
    dashboard: V, bookings: VE, guests: NONE, rooms: V,
    staff: NONE, housekeeping: NONE, maintenance: NONE,
    finance: VE, cms: VED, channels: VED, revenueAI: VED,
    aiAssistant: V, reputationAI: V, crmAI: V,
    analytics: VED, reports: VED, settings: NONE,
    fnb: NONE, events: NONE, inventory: NONE, accounts: NONE,
  },
  accounts_manager: {
    dashboard: V, bookings: VE, guests: VE, rooms: NONE,
    staff: NONE, housekeeping: NONE, maintenance: NONE,
    finance: VED, cms: NONE, channels: NONE, revenueAI: V,
    aiAssistant: NONE, reputationAI: NONE, crmAI: NONE,
    analytics: VE, reports: VED, settings: NONE,
    fnb: NONE, events: NONE, inventory: V, accounts: VED,
  },
  fnb_server: {
    dashboard: V, bookings: NONE, guests: NONE, rooms: NONE,
    staff: NONE, housekeeping: NONE, maintenance: NONE,
    finance: NONE, cms: NONE, channels: NONE, revenueAI: NONE,
    aiAssistant: NONE, reputationAI: NONE, crmAI: NONE,
    analytics: NONE, reports: NONE, settings: NONE,
    fnb: VE, events: NONE, inventory: NONE, accounts: NONE,
  },
  kitchen_staff: {
    dashboard: NONE, bookings: NONE, guests: NONE, rooms: NONE,
    staff: NONE, housekeeping: NONE, maintenance: NONE,
    finance: NONE, cms: NONE, channels: NONE, revenueAI: NONE,
    aiAssistant: NONE, reputationAI: NONE, crmAI: NONE,
    analytics: NONE, reports: NONE, settings: NONE,
    fnb: V, events: NONE, inventory: NONE, accounts: NONE,
  },
};

// ── Sidebar route → module mapping ───────────────────────────────────────────

export const ROUTE_MODULE_MAP: Record<string, PermissionModule> = {
  // Overview
  '/admin':                    'dashboard',
  '/admin/dashboard':          'dashboard',
  // Operations
  '/admin/bookings':           'bookings',
  '/admin/guests':             'guests',
  '/admin/rooms':              'rooms',
  '/admin/room-moves':         'rooms',
  '/admin/staff':              'staff',
  '/admin/housekeeping':       'housekeeping',
  '/admin/maintenance':        'maintenance',
  '/admin/runner':             'maintenance',
  // Finance
  '/admin/night-audit':        'finance',
  '/admin/pos-closure':        'finance',
  '/admin/audit-pack':         'finance',
  '/admin/cashier-sessions':   'finance',
  '/admin/corporate-accounts': 'finance',
  '/admin/ar-ledger':          'finance',
  '/admin/paymaster':          'finance',
  '/admin/transaction-codes':  'finance',
  '/admin/preauth-holds':      'finance',
  // CMS
  '/admin/cms':                'cms',
  // Channels
  '/admin/channel-manager':    'channels',
  // Revenue
  '/admin/revenue':            'revenueAI',
  '/admin/rms':                'revenueAI',
  // AI tools
  '/admin/ai/reputation':      'reputationAI',
  '/admin/ai/crm':             'crmAI',
  '/admin/ai/crm-dashboard':   'crmAI',
  '/admin/ai/ab-testing':      'crmAI',
  '/admin/ai/ota-conversion':  'crmAI',
  '/admin/ai/member-tiers':    'crmAI',
  '/admin/ai/ai-segments':     'crmAI',
  '/admin/ai/recovery':        'crmAI',
  // Analytics
  '/admin/rate-check':         'analytics',
  '/admin/analytics':          'analytics',
  // Reports
  '/admin/reports':            'reports',
  // System
  '/admin/settings':           'settings',
  '/admin/audit-logs':         'settings',
  '/admin/multi-room':         'settings',
  // F&B
  '/admin/fnb':                'fnb',
  '/admin/fnb/menu':           'fnb',
  '/admin/fnb/floor-plan':     'fnb',
  '/admin/fnb/orders':         'fnb',
  '/admin/fnb/reports':        'fnb',
  // Events
  '/admin/events':             'events',
  '/admin/events/inquiries':   'events',
  '/admin/events/builder':     'events',
  '/admin/events/reports':     'events',
  // Inventory
  '/admin/inventory':          'inventory',
  '/admin/inventory/catalog':  'inventory',
  '/admin/inventory/purchase-orders': 'inventory',
  '/admin/inventory/vendors':  'inventory',
  '/admin/inventory/stock':    'inventory',
  // Accounts
  '/admin/accounts':           'accounts',
  '/admin/accounts/dashboard': 'accounts',
  '/admin/accounts/party-bills': 'accounts',
  '/admin/accounts/bank-recon': 'accounts',
  '/admin/accounts/period-close': 'accounts',
};

// ── Utility functions ────────────────────────────────────────────────────────

/** Get default permissions for a role */
export function getDefaultPermissions(role: StaffRole): PermissionMap {
  return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS[role]));
}

/** Check if a permission map differs from the role's defaults */
export function hasCustomOverrides(role: StaffRole, permissions: PermissionMap): boolean {
  const defaults = DEFAULT_PERMISSIONS[role];
  for (const mod of PERMISSION_MODULES) {
    const def = defaults[mod.id];
    const cur = permissions[mod.id];
    if (def.view !== cur.view || def.edit !== cur.edit || def.delete !== cur.delete) {
      return true;
    }
  }
  return false;
}

/** Check if a specific module permission differs from the role default */
export function isOverridden(
  role: StaffRole,
  module: PermissionModule,
  permission: keyof ModulePermission,
  currentValue: boolean
): boolean {
  return DEFAULT_PERMISSIONS[role][module][permission] !== currentValue;
}

/**
 * Resolve permissions for a role, checking Settings customizations first.
 * Priority: user.permissions > localStorage glimmora_roles > DEFAULT_PERMISSIONS
 */
export function resolveRolePermissions(role: StaffRole): PermissionMap {
  try {
    const stored = localStorage.getItem('glimmora_roles');
    if (stored) {
      const roles = JSON.parse(stored) as { id: string; permissions?: PermissionMap }[];
      const match = roles.find(r => r.id === role);
      if (match?.permissions) {
        // Merge with defaults to ensure all 13 modules exist
        const merged = { ...DEFAULT_PERMISSIONS[role] };
        for (const mod of PERMISSION_MODULES) {
          if (match.permissions[mod.id]) {
            merged[mod.id] = match.permissions[mod.id];
          }
        }
        return merged;
      }
    }
  } catch {
    // localStorage parse error — fall through to defaults
  }
  return DEFAULT_PERMISSIONS[role];
}

/** Get the module for a given route path (longest/most-specific prefix wins) */
export function getModuleForRoute(path: string): PermissionModule | null {
  // Exact match first
  if (ROUTE_MODULE_MAP[path]) return ROUTE_MODULE_MAP[path];
  // Prefix match — find the longest matching route for specificity
  let bestMatch: PermissionModule | null = null;
  let bestLen = 0;
  for (const [route, mod] of Object.entries(ROUTE_MODULE_MAP)) {
    if (path.startsWith(route + '/') && route.length > bestLen) {
      bestMatch = mod;
      bestLen = route.length;
    }
  }
  return bestMatch;
}

/** Check if user has view access to a given module */
export function canViewModule(permissions: PermissionMap | undefined, module: PermissionModule): boolean {
  if (!permissions) return false;
  return permissions[module]?.view === true;
}

/** Check if user has edit access to a given module */
export function canEditModule(permissions: PermissionMap | undefined, module: PermissionModule): boolean {
  if (!permissions) return false;
  return permissions[module]?.edit === true;
}

/** Check if user has delete access to a given module */
export function canDeleteModule(permissions: PermissionMap | undefined, module: PermissionModule): boolean {
  if (!permissions) return false;
  return permissions[module]?.delete === true;
}

/** Get role label from value */
export function getRoleLabel(role: StaffRole): string {
  return STAFF_ROLES.find(r => r.value === role)?.label || role;
}

/**
 * Ordered list of admin routes to try as fallback landing pages.
 * When a user's default landing page (dashboard) is blocked, redirect to the first accessible route.
 */
const FALLBACK_LANDING_ROUTES: { route: string; module: PermissionModule }[] = [
  { route: '/admin/bookings',      module: 'bookings' },
  { route: '/admin/rooms',         module: 'rooms' },
  { route: '/admin/guests',        module: 'guests' },
  { route: '/admin/housekeeping',  module: 'housekeeping' },
  { route: '/admin/staff',         module: 'staff' },
  { route: '/admin/maintenance',   module: 'maintenance' },
  { route: '/admin/night-audit',   module: 'finance' },
  { route: '/admin/cms/availability', module: 'cms' },
  { route: '/admin/channel-manager',  module: 'channels' },
  { route: '/admin/revenue',       module: 'revenueAI' },
  { route: '/admin/reports',       module: 'reports' },
  { route: '/admin/settings',      module: 'settings' },
  { route: '/admin/fnb/menu',      module: 'fnb' },
  { route: '/admin/events',        module: 'events' },
  { route: '/admin/inventory/catalog', module: 'inventory' },
  { route: '/admin/accounts/dashboard', module: 'accounts' },
];

/** Find the first admin route the user has view access to (used when dashboard is blocked) */
export function getFirstAccessibleRoute(permissions: PermissionMap): string | null {
  for (const { route, module } of FALLBACK_LANDING_ROUTES) {
    if (canViewModule(permissions, module)) return route;
  }
  return null;
}
