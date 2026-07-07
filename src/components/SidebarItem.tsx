import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function SidebarItem({ item }) {
  const { isDark } = useTheme();
  const Icon = item.icon;

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/admin/dashboard'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
            isActive
              ? isDark
                ? 'bg-gradient-to-r from-[#A57865]/20 via-[#A57865]/10 to-transparent text-white font-medium'
                : 'bg-gradient-to-r from-[#A57865]/15 via-[#A57865]/8 to-transparent text-[#A57865] font-semibold'
              : isDark
                ? 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                : 'text-neutral-500 hover:text-[#A57865] hover:bg-[#A57865]/[0.04]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Active indicator - premium vertical bar */}
            {isActive && (
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-b from-[#CDB261] via-[#A57865] to-[#CDB261] shadow-sm shadow-[#CDB261]/50'
                  : 'bg-gradient-to-b from-[#A57865] via-[#8E6554] to-[#A57865]'
              }`} />
            )}

            {/* Icon container */}
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              isActive
                ? isDark
                  ? 'bg-gradient-to-br from-[#A57865]/30 to-[#A57865]/10'
                  : 'bg-gradient-to-br from-[#A57865]/20 to-[#A57865]/5'
                : isDark
                  ? 'bg-white/[0.03] group-hover:bg-[#A57865]/10'
                  : 'bg-neutral-100/50 group-hover:bg-[#A57865]/10'
            }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                isActive
                  ? isDark ? 'text-[#CDB261]' : 'text-[#A57865]'
                  : 'group-hover:scale-110'
              }`} />
            </div>

            {/* Label */}
            <span className="text-[13px] font-medium flex-1 transition-all duration-300">
              {item.name}
            </span>

            {/* Active arrow indicator */}
            {isActive && (
              <ChevronRight className={`w-3.5 h-3.5 transition-all duration-300 ${
                isDark ? 'text-[#CDB261]/60' : 'text-[#A57865]/60'
              }`} />
            )}

            {/* Hover gradient overlay */}
            {!isActive && (
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                isDark
                  ? 'bg-gradient-to-r from-[#A57865]/5 via-transparent to-transparent'
                  : 'bg-gradient-to-r from-[#A57865]/5 via-transparent to-transparent'
              }`} />
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}
