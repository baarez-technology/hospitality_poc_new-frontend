/**
 * Sample Room Mappings Data
 * Maps PMS room types to OTA room types
 */

export const sampleRoomMappings = [
  {
    id: 'map-001',
    pmsRoomType: 'Minimalist Studio',
    pmsRoomCode: 'MINST',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Studio Room',
        otaRoomCode: 'STUDIO',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Minimalist Studio',
        otaRoomCode: 'MINSTD',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'AGODA',
        otaRoomType: 'Studio Double',
        otaRoomCode: 'SD',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'MMT',
        otaRoomType: 'Studio Room',
        otaRoomCode: 'STD',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'GOOGLE',
        otaRoomType: 'Minimalist Studio',
        otaRoomCode: 'MINSTUDIO',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ],
    basePrice: 150,
    inventory: 10
  },
  {
    id: 'map-002',
    pmsRoomType: 'Coastal Retreat',
    pmsRoomCode: 'COAST',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Coastal View Room',
        otaRoomCode: 'COAST_VW',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Coastal Retreat',
        otaRoomCode: 'COASTRET',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'AGODA',
        otaRoomType: 'Ocean View Room',
        otaRoomCode: 'OVR',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'GOOGLE',
        otaRoomType: 'Coastal Retreat',
        otaRoomCode: 'COASTAL',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ],
    basePrice: 199,
    inventory: 8
  },
  {
    id: 'map-003',
    pmsRoomType: 'Urban Oasis',
    pmsRoomCode: 'URBAN',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'City View Room',
        otaRoomCode: 'CITY_VW',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Urban Oasis',
        otaRoomCode: 'URBANOASIS',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'AGODA',
        otaRoomType: 'City Oasis Room',
        otaRoomCode: 'COR',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'pending',
        lastSync: null
      }
    ],
    basePrice: 245,
    inventory: 8
  },
  {
    id: 'map-004',
    pmsRoomType: 'Sunset Vista',
    pmsRoomCode: 'SUNSET',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Sunset View Room',
        otaRoomCode: 'SUNSET_VW',
        maxGuests: 3,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Sunset Vista',
        otaRoomCode: 'SUNSETVISTA',
        maxGuests: 3,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'GOOGLE',
        otaRoomType: 'Sunset Vista',
        otaRoomCode: 'SUNSET',
        maxGuests: 3,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ],
    basePrice: 315,
    inventory: 6
  },
  {
    id: 'map-005',
    pmsRoomType: 'Pacific Suite',
    pmsRoomCode: 'PACSUITE',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Pacific Suite',
        otaRoomCode: 'PAC_STE',
        maxGuests: 4,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Ocean Suite',
        otaRoomCode: 'OCEANSUITE',
        maxGuests: 4,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'AGODA',
        otaRoomType: 'Pacific Suite',
        otaRoomCode: 'PS',
        maxGuests: 4,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'GOOGLE',
        otaRoomType: 'Pacific Suite',
        otaRoomCode: 'PACIFICSUITE',
        maxGuests: 4,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ],
    basePrice: 385,
    inventory: 6
  },
  {
    id: 'map-006',
    pmsRoomType: 'Wellness Suite',
    pmsRoomCode: 'WELLNESS',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Wellness Suite',
        otaRoomCode: 'WELL_STE',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Spa Suite',
        otaRoomCode: 'SPASUITE',
        maxGuests: 2,
        defaultRatePlan: 'OTA',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'GOOGLE',
        otaRoomType: 'Wellness Suite',
        otaRoomCode: 'WELLNESSSUITE',
        maxGuests: 2,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ],
    basePrice: 425,
    inventory: 4
  },
  {
    id: 'map-007',
    pmsRoomType: 'Family Sanctuary',
    pmsRoomCode: 'FAMILY',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Family Suite',
        otaRoomCode: 'FAM_STE',
        maxGuests: 6,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Family Sanctuary',
        otaRoomCode: 'FAMILYSANC',
        maxGuests: 6,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'AGODA',
        otaRoomType: 'Family Room',
        otaRoomCode: 'FR',
        maxGuests: 6,
        defaultRatePlan: 'OTA',
        status: 'pending',
        lastSync: null
      }
    ],
    basePrice: 485,
    inventory: 4
  },
  {
    id: 'map-008',
    pmsRoomType: 'Oceanfront Penthouse',
    pmsRoomCode: 'PENTHOUSE',
    otaMappings: [
      {
        otaCode: 'BOOKING',
        otaRoomType: 'Oceanfront Penthouse',
        otaRoomCode: 'OCEAN_PH',
        maxGuests: 6,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'EXPEDIA',
        otaRoomType: 'Penthouse Suite',
        otaRoomCode: 'PENTHOUSESTE',
        maxGuests: 6,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        otaCode: 'GOOGLE',
        otaRoomType: 'Oceanfront Penthouse',
        otaRoomCode: 'OCEANPENTHOUSE',
        maxGuests: 6,
        defaultRatePlan: 'BAR',
        status: 'active',
        lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      }
    ],
    basePrice: 750,
    inventory: 2
  }
];

export const mappingStatusConfig = {
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  error: { label: 'Error', color: 'text-rose-600', bg: 'bg-rose-100' },
  inactive: { label: 'Inactive', color: 'text-neutral-500', bg: 'bg-neutral-100' }
};

export const suggestedMappings = {
  'Minimalist Studio': {
    BOOKING: 'Studio Room',
    EXPEDIA: 'Minimalist Studio',
    AGODA: 'Studio Double',
    AIRBNB: 'Entire Place - Studio',
    MMT: 'Studio Room',
    TRIP: 'Studio Room',
    GOOGLE: 'Minimalist Studio'
  },
  'Coastal Retreat': {
    BOOKING: 'Coastal View Room',
    EXPEDIA: 'Coastal Retreat',
    AGODA: 'Ocean View Room',
    AIRBNB: 'Entire Place - Coastal',
    MMT: 'Coastal Room',
    TRIP: 'Coastal View',
    GOOGLE: 'Coastal Retreat'
  },
  'Urban Oasis': {
    BOOKING: 'City View Room',
    EXPEDIA: 'Urban Oasis',
    AGODA: 'City Oasis Room',
    AIRBNB: 'Entire Place - Urban',
    MMT: 'City Room',
    TRIP: 'Urban Room',
    GOOGLE: 'Urban Oasis'
  },
  'Sunset Vista': {
    BOOKING: 'Sunset View Room',
    EXPEDIA: 'Sunset Vista',
    AGODA: 'Sunset Room',
    AIRBNB: 'Entire Place - Sunset',
    MMT: 'Sunset Room',
    TRIP: 'Sunset View',
    GOOGLE: 'Sunset Vista'
  },
  'Pacific Suite': {
    BOOKING: 'Pacific Suite',
    EXPEDIA: 'Ocean Suite',
    AGODA: 'Pacific Suite',
    AIRBNB: 'Entire Place - Pacific Suite',
    MMT: 'Pacific Suite',
    TRIP: 'Pacific Suite',
    GOOGLE: 'Pacific Suite'
  },
  'Wellness Suite': {
    BOOKING: 'Wellness Suite',
    EXPEDIA: 'Spa Suite',
    AGODA: 'Wellness Suite',
    AIRBNB: 'Entire Place - Wellness Suite',
    MMT: 'Wellness Suite',
    TRIP: 'Spa Suite',
    GOOGLE: 'Wellness Suite'
  },
  'Family Sanctuary': {
    BOOKING: 'Family Suite',
    EXPEDIA: 'Family Sanctuary',
    AGODA: 'Family Room',
    AIRBNB: 'Entire Place - Family',
    MMT: 'Family Suite',
    TRIP: 'Family Suite',
    GOOGLE: 'Family Sanctuary'
  },
  'Oceanfront Penthouse': {
    BOOKING: 'Oceanfront Penthouse',
    EXPEDIA: 'Penthouse Suite',
    AGODA: 'Luxury Penthouse',
    AIRBNB: 'Entire Place - Penthouse',
    MMT: 'Penthouse Suite',
    TRIP: 'Oceanfront Penthouse',
    GOOGLE: 'Oceanfront Penthouse'
  }
};

export default sampleRoomMappings;
