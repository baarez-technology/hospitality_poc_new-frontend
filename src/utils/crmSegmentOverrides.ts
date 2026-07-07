/**
 * Persist CRM segment edits locally when the server does not support update (404/405/400).
 * Merged into segment list/detail on load so changes survive refresh.
 * Also persist locally-deleted segment IDs so deleted segments stay hidden after refresh.
 */

const STORAGE_KEY = 'glimmora_crm_segment_overrides';
const DELETED_IDS_KEY = 'glimmora_crm_segment_deleted_ids';

export function getSegmentOverrides(): Record<string, Record<string, unknown>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function setSegmentOverride(id: string, data: Record<string, unknown>): void {
  try {
    const overrides = getSegmentOverrides();
    overrides[id] = { ...data, id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

export function clearSegmentOverride(id: string): void {
  try {
    const overrides = getSegmentOverrides();
    delete overrides[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

/** IDs of segments the user deleted locally (so they stay hidden even if server still returns them). */
export function getDeletedSegmentIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addDeletedSegmentId(id: string): void {
  try {
    const ids = getDeletedSegmentIds();
    if (ids.includes(id)) return;
    ids.push(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}
