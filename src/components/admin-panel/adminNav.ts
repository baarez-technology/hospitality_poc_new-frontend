import { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowRightLeft,
  Ban,
  BarChart2,
  BedDouble,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  ClipboardCheck,
  Cog,
  Contact,
  Cpu,
  CreditCard,
  DollarSign,
  FileBarChart,
  FileText,
  Gift,
  Globe,
  Hash,
  LayoutDashboard,
  Layers,
  Link2,
  MessageSquare,
  Package,
  PieChart,
  Radio,
  Receipt,
  RefreshCw,
  ScrollText,
  Settings,
  Shield,
  Store,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  Brain,
} from 'lucide-react';
import type { PermissionModule } from '@/config/rolePermissions';

export interface NavItem {
  name: string;
  icon: LucideIcon;
  to: string;
  module?: PermissionModule;
}

export interface NavCategory {
  id: string;
  name: string;
  shortName?: string;
  icon: LucideIcon;
  items: NavItem[];
}

// Each nav item has a `module` field matching PermissionModule from rolePermissions.ts.
// The sidebar uses this to hide items the user has no view access to.
export const adminNavCategories: NavCategory[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: LayoutDashboard,
    items: [{ name: 'Dashboard', icon: LayoutDashboard, to: '/admin', module: 'dashboard' }],
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: Cog,
    items: [
      { name: 'Bookings', icon: CalendarCheck, to: '/admin/bookings', module: 'bookings' },
      { name: 'Group Booking', icon: Layers, to: '/admin/multi-room', module: 'bookings' },
      { name: 'Guests', icon: Users, to: '/admin/guests', module: 'guests' },
      { name: 'Rooms', icon: BedDouble, to: '/admin/rooms', module: 'rooms' },
      { name: 'Staff', icon: UserCheck, to: '/admin/staff', module: 'staff' },
      { name: 'Housekeeping', icon: ClipboardCheck, to: '/admin/housekeeping', module: 'housekeeping' },
      { name: 'Maintenance', icon: Wrench, to: '/admin/maintenance', module: 'maintenance' },
      { name: 'Room Moves', icon: ArrowRightLeft, to: '/admin/room-moves', module: 'rooms' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Audit',
    shortName: 'Finance',
    icon: DollarSign,
    items: [
      { name: 'Night Audit', icon: FileBarChart, to: '/admin/night-audit', module: 'finance' },
      { name: 'POS Closure', icon: Store, to: '/admin/pos-closure', module: 'finance' },
      { name: 'Audit Pack', icon: ClipboardCheck, to: '/admin/audit-pack', module: 'finance' },
      { name: 'Cashier Sessions', icon: CreditCard, to: '/admin/cashier-sessions', module: 'finance' },
      { name: 'Corporate Accounts', icon: Building2, to: '/admin/corporate-accounts', module: 'finance' },
      { name: 'AR Ledger', icon: Receipt, to: '/admin/ar-ledger', module: 'finance' },
      { name: 'Paymaster', icon: Wallet, to: '/admin/paymaster', module: 'finance' },
      { name: 'Transaction Codes', icon: Hash, to: '/admin/transaction-codes', module: 'finance' },
      { name: 'Pre-Auth Holds', icon: Shield, to: '/admin/preauth-holds', module: 'finance' },
    ],
  },
  {
    id: 'cms',
    name: 'Central Management',
    shortName: 'CMS',
    icon: Layers,
    items: [
      { name: 'Availability', icon: Calendar, to: '/admin/cms/availability', module: 'cms' },
      { name: 'Rate Plans', icon: Tag, to: '/admin/cms/rate-plans', module: 'cms' },
      { name: 'Promotions', icon: Gift, to: '/admin/cms/promotions', module: 'cms' },
    ],
  },
  {
    id: 'channel',
    name: 'Channel Manager',
    shortName: 'Channels',
    icon: Radio,
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, to: '/admin/channel-manager', module: 'channels' },
      { name: 'OTA Connections', icon: Wifi, to: '/admin/channel-manager/ota', module: 'channels' },
      { name: 'Room Mapping', icon: Link2, to: '/admin/channel-manager/mapping', module: 'channels' },
      { name: 'Rate Sync', icon: DollarSign, to: '/admin/channel-manager/rate-sync', module: 'channels' },
      { name: 'Restrictions', icon: Ban, to: '/admin/channel-manager/restrictions', module: 'channels' },
      { name: 'Promotions', icon: Gift, to: '/admin/channel-manager/promotions', module: 'channels' },
      { name: 'Sync Logs', icon: RefreshCw, to: '/admin/channel-manager/logs', module: 'channels' },
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue Management',
    shortName: 'Revenue',
    icon: BarChart2,
    items: [
      { name: 'RMS Dashboard', icon: TrendingUp, to: '/admin/revenue', module: 'revenueAI' },
      { name: 'Rate Calendar', icon: Calendar, to: '/admin/revenue/calendar', module: 'revenueAI' },
      { name: 'Pickup Analysis', icon: Activity, to: '/admin/revenue/pickup', module: 'revenueAI' },
      { name: 'Demand Forecast', icon: Zap, to: '/admin/revenue/forecast', module: 'revenueAI' },
      { name: 'Competitors', icon: Globe, to: '/admin/revenue/competitors', module: 'revenueAI' },
      { name: 'Segmentation', icon: PieChart, to: '/admin/revenue/segments', module: 'revenueAI' },
      { name: 'Pricing Rules', icon: Settings, to: '/admin/revenue/pricing', module: 'revenueAI' },
      { name: 'Revenue Analytics', icon: CreditCard, to: '/admin/revenue/payment-analytics', module: 'revenueAI' },
      { name: 'Revenue AI', icon: Brain, to: '/admin/revenue/ai', module: 'revenueAI' },
    ],
  },
  {
    id: 'ai',
    name: 'AI Intelligence',
    shortName: 'AI',
    icon: Cpu,
    items: [
      { name: 'Reputation AI', icon: MessageSquare, to: '/admin/ai/reputation', module: 'reputationAI' },
      { name: 'CRM AI', icon: Contact, to: '/admin/ai/crm', module: 'crmAI' },
      { name: 'ReConnect AI', icon: Brain, to: '/admin/ai/crm-dashboard', module: 'crmAI' },
      { name: 'A/B Testing', icon: Activity, to: '/admin/ai/ab-testing', module: 'crmAI' },
      { name: 'OTA Conversion', icon: Globe, to: '/admin/ai/ota-conversion', module: 'crmAI' },
      { name: 'Member Tiers', icon: Layers, to: '/admin/ai/member-tiers', module: 'crmAI' },
      { name: 'AI Segments', icon: PieChart, to: '/admin/ai/ai-segments', module: 'crmAI' },
      { name: 'Recovery Center', icon: RefreshCw, to: '/admin/ai/recovery', module: 'crmAI' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: FileBarChart,
    items: [
      { name: 'Reports', icon: FileText, to: '/admin/reports', module: 'reports' },
      { name: 'Rate Check', icon: BarChart2, to: '/admin/rate-check', module: 'analytics' },
    ],
  },
  {
    id: 'system',
    name: 'System',
    icon: Settings,
    items: [
      { name: 'Settings', icon: Settings, to: '/admin/settings', module: 'settings' },
      { name: 'Audit Logs', icon: ScrollText, to: '/admin/audit-logs', module: 'settings' },
    ],
  },
];
