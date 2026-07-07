// RMS Competitors — hardcoded samples removed; data now comes from API.

export const competitors: any[] = [];
export const otaSources: any[] = [];

export function generateCompetitorRates(_startDate: any = new Date(), _ourRates: any = {}): any[] {
  return [];
}

export function checkRateParity(_competitorRates: any): any[] {
  return [];
}

export function getCompetitorInsights(_competitorRates: any) {
  return { avgCompetitorRate: 0, ourPosition: 'n/a', insights: [] };
}

export const sampleCompetitorRates: any[] = [];
export const competitorInsights = { avgCompetitorRate: 0, ourPosition: 'n/a', insights: [] };
export const parityIssues: any[] = [];

export default sampleCompetitorRates;
