import { useTheme } from '../contexts/ThemeContext';
import SidebarItem from './SidebarItem';

export default function SidebarSection({ category }) {
  const { isDark } = useTheme();

  return (
    <div className="relative">
      {/* Section Title */}
      <div className="px-3 mb-2.5 flex items-center gap-2">
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
          isDark ? 'text-white/30' : 'text-neutral-400'
        }`}>
          {category.name}
        </h3>
        <div className={`flex-1 h-[1px] ${
          isDark
            ? 'bg-gradient-to-r from-white/10 to-transparent'
            : 'bg-gradient-to-r from-neutral-200 to-transparent'
        }`} />
      </div>

      {/* Section Items */}
      <ul className="space-y-0.5">
        {category.items.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </ul>
    </div>
  );
}
