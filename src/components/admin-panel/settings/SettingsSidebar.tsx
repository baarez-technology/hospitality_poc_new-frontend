import { NavLink } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Receipt,
  Shield,
  Plug,
  Bell,
  Palette,
  Users,
  Brain,
  Settings,
  CreditCard
} from 'lucide-react';

const menuItems = [
  {
    category: 'Property',
    items: [
      {
        path: '/admin/settings',
        label: 'Hotel Info',
        icon: Building2,
        end: true
      },
      {
        path: '/admin/settings/room-types',
        label: 'Room Types',
        icon: BedDouble
      },
      {
        path: '/admin/settings/taxes',
        label: 'Taxes & Fees',
        icon: Receipt
      }
    ]
  },
  {
    category: 'Security',
    items: [
      {
        path: '/admin/settings/roles',
        label: 'Roles & Permissions',
        icon: Shield
      }
    ]
  },
  {
    category: 'Connectivity',
    items: [
      {
        path: '/admin/settings/integrations',
        label: 'Integrations',
        icon: Plug
      },
      {
        path: '/admin/settings/payments',
        label: 'Payments',
        icon: CreditCard
      },
      {
        path: '/admin/settings/notifications',
        label: 'Notifications',
        icon: Bell
      }
    ]
  },
  {
    category: 'Appearance',
    items: [
      {
        path: '/admin/settings/branding',
        label: 'Branding & Theme',
        icon: Palette
      }
    ]
  },
  {
    category: 'Operations',
    items: [
      {
        path: '/admin/settings/staff-portal',
        label: 'Staff Portal',
        icon: Users
      }
    ]
  },
  {
    category: 'Intelligence',
    items: [
      {
        path: '/admin/settings/ai',
        label: 'AI Settings',
        icon: Brain
      }
    ]
  }
];

export default function SettingsSidebar() {
  return (
    <div className="w-72 min-h-full bg-white border-r border-[#E5E5E5] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A57865]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
            <p className="text-xs text-neutral-500">Manage your property</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {menuItems.map((group) => (
          <div key={group.category}>
            <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {group.category}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#A57865]/10 text-[#A57865] font-medium'
                        : 'text-neutral-600 hover:bg-[#FAF7F4] hover:text-neutral-900'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5E5E5]">
        <div className="p-3 bg-[#FAF7F4] rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Last saved</p>
          <p className="text-sm font-medium text-neutral-700">
            {new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
