/**
 * POS copy — outlet-aware labels (room service uses rooms, not tables).
 * API still uses `tables` / `table_id`; only UI strings change.
 */

export function isRoomServiceOutlet(outlet: { type: string } | null | undefined): boolean {
  return outlet?.type === 'room_service';
}

/** Floor list screen title */
export function posFloorScreenTitle(isRoomService: boolean): string {
  return isRoomService ? 'Rooms' : 'Floor';
}

/** e.g. "12 tables" vs "12 rooms" */
export function posFloorCountLabel(isRoomService: boolean, count: number): string {
  const u = isRoomService ? 'room' : 'table';
  return `${count} ${count === 1 ? u : `${u}s`}`;
}

/** Primary label on cards / order header: "T3" vs "Room 3" */
export function posSpotLabel(isRoomService: boolean, number: number | string): string {
  return isRoomService ? `Room ${number}` : `T${number}`;
}

/** Short label where space is tight */
export function posSpotShort(isRoomService: boolean, number: number | string): string {
  return isRoomService ? `R${number}` : `T${number}`;
}

export function posCapacityLabel(isRoomService: boolean, capacity: number): string {
  if (isRoomService) {
    return capacity <= 1 ? '1 guest' : `${capacity} guests max`;
  }
  return capacity <= 1 ? '1 seat' : `${capacity} seats`;
}

/** Back link from order → floor list */
export function posBackToFloorLabel(isRoomService: boolean): string {
  return isRoomService ? 'Rooms' : 'Tables';
}

/** Bill screen heading — uses guest-facing number (room / table number), not DB id */
export function posBillTitle(isRoomService: boolean, displayNumber: string): string {
  return `Bill — ${posSpotLabel(isRoomService, displayNumber)}`;
}
