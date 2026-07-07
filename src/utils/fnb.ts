/**
 * F&B Constants and Helpers
 */

export const OUTLET_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'pool_cafe', label: 'Pool Cafe' },
  { value: 'room_service', label: 'Room Service' },
] as const;

export const TABLE_SHAPES = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'rectangle', label: 'Rectangle' },
] as const;

export const TABLE_STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; fill: string }> = {
  available: { label: 'Available', bg: 'bg-green-100', border: 'border-green-400', fill: '#22c55e' },
  occupied:  { label: 'Occupied',  bg: 'bg-red-100',   border: 'border-red-400',   fill: '#ef4444' },
  reserved:  { label: 'Reserved',  bg: 'bg-amber-100', border: 'border-amber-400', fill: '#f59e0b' },
  cleaning:  { label: 'Cleaning',  bg: 'bg-neutral-200', border: 'border-neutral-400', fill: '#9ca3af' },
};

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:       { label: 'New',       color: 'bg-orange-100 text-orange-700' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-700' },
  ready:     { label: 'Ready',     color: 'bg-green-100 text-green-700' },
  served:    { label: 'Served',    color: 'bg-neutral-100 text-neutral-700' },
  billed:    { label: 'Billed',    color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export function filterMenuItems(
  items: any[],
  query: string,
  categoryId?: number | null,
  vegOnly?: boolean
) {
  let filtered = items;
  if (categoryId) filtered = filtered.filter(i => i.category_id === categoryId);
  if (vegOnly) filtered = filtered.filter(i => i.is_veg);
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
  }
  return filtered;
}
