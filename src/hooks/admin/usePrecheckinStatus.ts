import { useState, useEffect, useCallback, useRef } from 'react';
import { precheckinService, type PreCheckInResponse } from '@/api/services/precheckin.service';

export type PrecheckinStatusValue = 'completed' | 'not_started';

export function usePrecheckinStatus() {
  const [dataMap, setDataMap] = useState<Map<number, PreCheckInResponse>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await precheckinService.list();
      const map = new Map<number, PreCheckInResponse>();
      if (Array.isArray(list)) {
        for (const item of list) {
          map.set(item.reservation_id, item);
        }
      }
      setDataMap(map);
    } catch (err) {
      console.error('[usePrecheckinStatus] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAll();
    }
  }, [fetchAll]);

  const getStatus = useCallback(
    (reservationId: number): PrecheckinStatusValue => {
      const record = dataMap.get(reservationId);
      if (!record) return 'not_started';
      return 'completed';
    },
    [dataMap]
  );

  return { getStatus, isLoading, refetch: fetchAll };
}
