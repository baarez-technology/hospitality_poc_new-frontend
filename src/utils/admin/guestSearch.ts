/**
 * Multi-field search utility for guests
 * Searches across: name, email, phone, country, notes, and booking history
 */
export function searchGuests(guests, query) {
  if (!query || query.trim() === '') return guests;

  const lowerQuery = query.toLowerCase().trim();

  return guests.filter(guest => {
    const nameMatch = guest.name && typeof guest.name === 'string' && guest.name.toLowerCase().includes(lowerQuery);
    const emailMatch = guest.email && typeof guest.email === 'string' && guest.email.toLowerCase().includes(lowerQuery);
    const phoneMatch = guest.phone && typeof guest.phone === 'string' && guest.phone.toLowerCase().includes(lowerQuery);
    const countryMatch = guest.country && typeof guest.country === 'string' && guest.country.toLowerCase().includes(lowerQuery);
    const notesMatch = guest.notes && typeof guest.notes === 'string' && guest.notes.toLowerCase().includes(lowerQuery);
    const historyMatch = guest.history && Array.isArray(guest.history) && guest.history.some(h => h.date && h.date.includes(lowerQuery));

    return nameMatch || emailMatch || phoneMatch || countryMatch || notesMatch || historyMatch;
  });
}
