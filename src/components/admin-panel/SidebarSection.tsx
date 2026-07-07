import SidebarItem from './SidebarItem';

export default function SidebarSection({ category }) {
  return (
    <div>
      {/* Section Title */}
      <div className="mt-6 mb-2 px-4">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          {category.name}
        </h3>
      </div>

      {/* Section Items */}
      <ul className="space-y-1">
        {category.items.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </ul>
    </div>
  );
}
