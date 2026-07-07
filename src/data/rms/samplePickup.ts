// RMS Pickup — hardcoded samples removed; data now comes from API.

export function generatePickupData(_startDate: any = new Date()): any[] {
  return [];
}

export function calculatePickupMetrics(_pickupData: any) {
  return { totalBookings: 0, avgPickupRate: 0, trend: 'neutral' };
}

export const samplePickupData: any[] = [];
export const pickupMetrics = { totalBookings: 0, avgPickupRate: 0, trend: 'neutral' };

export default samplePickupData;
