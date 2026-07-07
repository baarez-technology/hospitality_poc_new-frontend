import { useEffect, useState } from 'react';
import { ENV } from '@/config/env';

// ── Types ──────────────────────────────────────────────────────────
interface TaxSlab {
  id: number;
  tax_category_id: number;
  country: string;
  min_amount: number;
  max_amount: number | null;
  rate_pct: number;
  component_1_name: string;
  component_1_pct: number;
  component_2_name: string;
  component_2_pct: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
}

export interface GSTBreakdown {
  taxRate: number;       // e.g. 18
  taxAmount: number;     // total GST amount
  cgst: number;          // CGST amount
  sgst: number;          // SGST amount
  cgstRate: number;      // e.g. 9
  sgstRate: number;      // e.g. 9
  serviceFee: number;    // 5% service fee
  total: number;         // subtotal + taxAmount + serviceFee
}

// ── Constants ──────────────────────────────────────────────────────
const SERVICE_FEE_RATE = 0; // Service fee disabled
// GST slab: 5% for ≤₹7500/night, 18% for >₹7500/night
// Default to lower slab (5%) when API slabs unavailable
const DEFAULT_TAX_RATE = 5;
const DEFAULT_CGST = 2.5;
const DEFAULT_SGST = 2.5;

// ── Module-level cache (fetched once per session) ──────────────────
let _cachedSlabs: TaxSlab[] | null = null;
let _fetchPromise: Promise<TaxSlab[]> | null = null;

async function fetchSlabs(): Promise<TaxSlab[]> {
  if (_cachedSlabs) return _cachedSlabs;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(`${ENV.API_URL}/api/v1/tax/slabs?country=IN`)
    .then(res => {
      if (!res.ok) throw new Error(`Tax slabs fetch failed: ${res.status}`);
      return res.json();
    })
    .then((data: TaxSlab[]) => {
      _cachedSlabs = data;
      return data;
    })
    .catch(() => {
      _fetchPromise = null;
      return [] as TaxSlab[];
    });

  return _fetchPromise;
}

// ── Pure function: calculate GST from slabs ────────────────────────
function matchRoomSlab(slabs: TaxSlab[], pricePerNight: number): TaxSlab | null {
  // Filter to room_charge category slabs (category_id usually 1, but match by checking all slabs)
  // Room charge slabs are the ones with min/max amount ranges
  // We use all slabs and find the one whose range matches
  const roomSlabs = slabs.filter(s => s.is_active);

  for (const slab of roomSlabs) {
    const min = slab.min_amount;
    const max = slab.max_amount;
    if (pricePerNight >= min && (max === null || pricePerNight <= max)) {
      return slab;
    }
  }
  return null;
}

export function calculateRoomGST(
  pricePerNight: number,
  nights: number,
  slabs: TaxSlab[]
): GSTBreakdown {
  const subtotal = pricePerNight * nights;
  const slab = matchRoomSlab(slabs, pricePerNight);

  const taxRate = slab?.rate_pct ?? DEFAULT_TAX_RATE;
  const cgstRate = slab?.component_1_pct ?? DEFAULT_CGST;
  const sgstRate = slab?.component_2_pct ?? DEFAULT_SGST;

  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const cgst = Math.round(subtotal * (cgstRate / 100) * 100) / 100;
  const sgst = Math.round(subtotal * (sgstRate / 100) * 100) / 100;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + taxAmount + serviceFee) * 100) / 100;

  return { taxRate, taxAmount, cgst, sgst, cgstRate, sgstRate, serviceFee, total };
}

/** Convenience: single-night GST for room detail pages */
export function calculateRoomGSTPerNight(
  pricePerNight: number,
  slabs: TaxSlab[]
): GSTBreakdown {
  return calculateRoomGST(pricePerNight, 1, slabs);
}

// ── React hook ─────────────────────────────────────────────────────
export function useGSTCalculator() {
  const [slabs, setSlabs] = useState<TaxSlab[]>(_cachedSlabs ?? []);
  const [loading, setLoading] = useState(!_cachedSlabs);

  useEffect(() => {
    if (_cachedSlabs) {
      setSlabs(_cachedSlabs);
      setLoading(false);
      return;
    }
    fetchSlabs().then(data => {
      setSlabs(data);
      setLoading(false);
    });
  }, []);

  return {
    slabs,
    loading,
    calculateGST: (pricePerNight: number, nights: number) =>
      calculateRoomGST(pricePerNight, nights, slabs),
    calculateGSTPerNight: (pricePerNight: number) =>
      calculateRoomGSTPerNight(pricePerNight, slabs),
  };
}
