import { NavLink } from 'react-router-dom';

export default function SidebarItem({ item }) {
  const Icon = item.icon;

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/admin'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
            isActive
              ? 'bg-[#A57865]/10 text-[#A57865]'
              : 'text-[#6A6A6A] hover:bg-[#A57865]/5'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Active left border accent */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#A57865] rounded-r"></div>
            )}

            <Icon
              className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                isActive ? 'text-[#A57865]' : 'text-[#6A6A6A] group-hover:text-[#A57865]'
              }`}
            />

            <span className={`text-sm font-medium transition-colors duration-200 ${
              isActive ? 'text-[#A57865]' : 'group-hover:text-[#A57865]'
            }`}>
              {item.name}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}
