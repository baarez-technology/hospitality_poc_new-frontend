/**
 * Housekeeping Checklist Templates
 */

export const standardChecklist = [
  { id: 1, task: 'Strip and remake bed with fresh linens', completed: false },
  { id: 2, task: 'Replace towels and toiletries', completed: false },
  { id: 3, task: 'Clean and disinfect bathroom', completed: false },
  { id: 4, task: 'Vacuum and mop floors', completed: false },
  { id: 5, task: 'Dust all surfaces and furniture', completed: false },
  { id: 6, task: 'Empty trash and replace liners', completed: false },
  { id: 7, task: 'Check and restock minibar', completed: false },
  { id: 8, task: 'Clean mirrors and windows', completed: false },
  { id: 9, task: 'Check all lights and appliances', completed: false },
  { id: 10, task: 'Final inspection and touch-ups', completed: false }
];

export const premiumChecklist = [
  { id: 1, task: 'Strip and remake bed with premium linens', completed: false },
  { id: 2, task: 'Replace all towels with luxury set', completed: false },
  { id: 3, task: 'Clean and polish bathroom fixtures', completed: false },
  { id: 4, task: 'Vacuum, mop, and buff floors', completed: false },
  { id: 5, task: 'Dust and polish all surfaces', completed: false },
  { id: 6, task: 'Empty trash and recycling', completed: false },
  { id: 7, task: 'Restock premium minibar items', completed: false },
  { id: 8, task: 'Clean and polish all glass surfaces', completed: false },
  { id: 9, task: 'Check electronics and amenities', completed: false },
  { id: 10, task: 'Arrange decorative elements', completed: false },
  { id: 11, task: 'Place welcome amenities', completed: false },
  { id: 12, task: 'Final quality inspection', completed: false }
];

export const suiteChecklist = [
  { id: 1, task: 'Strip and remake all beds with luxury linens', completed: false },
  { id: 2, task: 'Replace towels in all bathrooms', completed: false },
  { id: 3, task: 'Deep clean and disinfect all bathrooms', completed: false },
  { id: 4, task: 'Vacuum and mop all rooms', completed: false },
  { id: 5, task: 'Dust and polish living area', completed: false },
  { id: 6, task: 'Clean kitchen/kitchenette area', completed: false },
  { id: 7, task: 'Empty all trash and recycling bins', completed: false },
  { id: 8, task: 'Restock minibar and coffee station', completed: false },
  { id: 9, task: 'Clean all windows and mirrors', completed: false },
  { id: 10, task: 'Check and test all appliances', completed: false },
  { id: 11, task: 'Arrange furniture and decor', completed: false },
  { id: 12, task: 'Place VIP welcome package', completed: false },
  { id: 13, task: 'Check closet and drawer organization', completed: false },
  { id: 14, task: 'Inspect balcony/terrace if applicable', completed: false },
  { id: 15, task: 'Final walkthrough and quality check', completed: false }
];

export function getChecklistByRoomType(roomType) {
  switch (roomType) {
    case 'Standard':
      return JSON.parse(JSON.stringify(standardChecklist));
    case 'Premium':
      return JSON.parse(JSON.stringify(premiumChecklist));
    case 'Deluxe':
      return JSON.parse(JSON.stringify(premiumChecklist));
    case 'Suite':
      return JSON.parse(JSON.stringify(suiteChecklist));
    default:
      return JSON.parse(JSON.stringify(standardChecklist));
  }
}
