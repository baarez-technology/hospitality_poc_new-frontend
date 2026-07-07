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
  Settings
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
    <div className="w-64 min-h-full bg-white border-r border-neutral-100 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-terra-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">Settings</h2>
            <p className="text-[10px] text-neutral-400 font-medium">Manage your property</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {menuItems.map((group) => (
          <div key={group.category}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              {group.category}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-terra-100 text-terra-700 font-medium'
                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[13px]">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-neutral-100">
        <div className="px-3 py-2.5 bg-neutral-50 rounded-lg">
          <p className="text-[10px] text-neutral-400 font-medium mb-0.5">Last saved</p>
          <p className="text-[11px] font-medium text-neutral-600">
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
