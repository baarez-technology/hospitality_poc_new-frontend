// RMS Forecast — hardcoded samples removed; data now comes from API.

export function generateForecast(_startDate: any = new Date()): any[] {
  return [];
}

export function calculateForecastSummary(_forecast: any) {
  return {
    avgOccupancy: 0,
    avgADR: 0,
    avgRevPAR: 0,
    totalRevenue: 0,
    peakDay: null,
  };
}

export function getHighImpactDays(_forecast: any, _limit = 10): any[] {
  return [];
}

export function getOpportunityDays(_forecast: any, _limit = 10): any[] {
  return [];
}

export function generateForecastInsights(_forecast: any): any[] {
  return [];
}

export const sampleForecast: any[] = [];
export const forecastSummary = {
  avgOccupancy: 0,
  avgADR: 0,
  avgRevPAR: 0,
  totalRevenue: 0,
  peakDay: null,
};
export const forecastInsights: any[] = [];
export const highImpactDays: any[] = [];
export const opportunityDays: any[] = [];

export default sampleForecast;
