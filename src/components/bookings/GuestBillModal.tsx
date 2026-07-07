/**
 * GuestBillModal — Shows the itemized guest bill for a booking.
 * Formatted as a premium Hotel Management TAX INVOICE with chronological ledger.
 */

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Receipt, Printer, Eye, AlertCircle } from 'lucide-react';
import { frontdeskService } from '@/api/services/frontdesk.service';
import { useHotelInfo } from '@/hooks/useHotelInfo';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { useBranding } from '@/contexts/BrandingContext';
import { buildPageRule, getSheetDimensions, buildThermalReceiptCss, isThermalPaper } from '@/utils/printSettings';

interface GuestBillModalProps {
  isOpen: boolean;
  bookingId: number | string | null;
  guestName?: string;
  booking?: any; // Full booking object from parent
  onClose: () => void;
}

export default function GuestBillModal({ isOpen, bookingId, guestName, booking, onClose }: GuestBillModalProps) {
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const hotel = useHotelInfo();
  const { generalSettings } = useSettingsContext() as any;
  const { branding } = useBranding();

  // The logo can be set from either the settings "Hotel Info" tab
  // (generalSettings.branding.logo → hotel.logo) or the "Branding & Theme"
  // tab (BrandingContext, stored under glimmora_branding). Prefer the former,
  // fall back to the latter, so the invoice shows the logo regardless of where
  // it was uploaded. Stored as a base64 data URI, which prints reliably.
  const logoSrc = hotel.logo || branding?.logo || null;

  const hotelAddressLine = [hotel.address?.street, hotel.address?.city, hotel.address?.state]
    .filter(Boolean)
    .join(', ') + (hotel.address?.zip ? ` - ${hotel.address.zip}` : '');

  const formatDateTime = (isoString: string | null | undefined, fallback: string = '—') => {
    if (!isoString) return fallback;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const pad = (num: number) => String(num).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return isoString;
    }
  };

  const fmt = (v: number | null | undefined) => v != null ? `${Number(v).toFixed(2)}` : '0.00';

  useEffect(() => {
    if (isOpen && bookingId) {
      setLoading(true);

      // Build basic bill info from booking data (for display while loading)
      if (booking) {
        console.log('[GuestBillModal] Using booking data from parent:', booking);
        let basePrice = booking.basePrice || booking.base_price || 0;
        let taxes = booking.taxes || 0;
        const totalPrice = booking.totalPrice || booking.total_price || booking.total || booking.amount || 0;
        const amountPaid = booking.amountPaid || booking.amount_paid || booking.depositAmount || booking.deposit_amount || 0;
        const balanceDue = booking.balanceDue ?? booking.balance_due ?? booking.balance ?? (totalPrice - amountPaid);
        const nights = booking.nights || 1;
        let gstPercent = booking.tax_rate || booking.taxRate || booking.gst_percent || 0;

        if (basePrice === 0 && totalPrice > 0) {
          const estimatedBasePerNight = totalPrice / nights / 1.05;
          const derivedPct = estimatedBasePerNight > 7500 ? 18 : 5;
          gstPercent = derivedPct;
          const multiplier = 1 + (derivedPct / 100);
          basePrice = Math.round(totalPrice / multiplier);
          taxes = Math.round(basePrice * (derivedPct / 100));
          const diff = totalPrice - (basePrice + taxes);
          if (Math.abs(diff) <= 2) basePrice += diff;
        } else if (basePrice > 0 && !gstPercent) {
          gstPercent = Math.round((taxes / basePrice) * 100) || 5;
        }

        const perNightRate = nights > 0 ? basePrice / nights : basePrice;

        const transformedBill = {
          booking_id: booking.id,
          booking_number: booking.bookingNumber || booking.booking_number,
          guest_name: guestName || booking.guest || 'Guest',
          guest_address: booking.guestAddress || booking.guest_address || null,
          company_name: booking.corporateAccountName || booking.companyName || booking.company_name || null,
          company_address: booking.corporateAccountAddress || booking.companyAddress || booking.company_address || null,
          company_gstin: booking.corporateAccountGstin || booking.company_gstin || null,
          gst_number: booking.gstNumber || booking.gst_number || null,
          stay_purpose: booking.stayPurpose || booking.stay_purpose || null,
          nationality: booking.nationality || null,
          room_number: booking.room || booking.roomNumber || 'Unassigned',
          arrival_date: booking.checkIn || booking.arrivalDate,
          departure_date: booking.checkOut || booking.departureDate,
          check_in_date: booking.checkInDate || booking.check_in_date || null,
          check_out_date: booking.checkOutDate || booking.check_out_date || null,
          nights: nights,
          adults: booking.adults || 1,
          children: booking.children || 0,
          room_rate: perNightRate,
          gst_percent: gstPercent,
          is_excel_booking: (booking.tax_rate === 0.0 || booking.taxRate === 0.0) && (booking.discount_amount || booking.discountAmount || 0) > 0,
          discount_amount: booking.discount_amount || booking.discountAmount || 0.0,
          charges: [{
            date: booking.checkIn || booking.arrivalDate,
            description: `Room Charges (${nights} night${nights > 1 ? 's' : ''} @ ₹${perNightRate.toFixed(0)}/night)`,
            category: 'room',
            amount: basePrice,
            tax: taxes,
            total: totalPrice,
          }],
          payments: amountPaid > 0 ? [{
            date: booking.createdAt || new Date().toISOString().split('T')[0],
            method: booking.paymentMethod || booking.payment_method || 'Card',
            reference: booking.bookingNumber || '',
            amount: amountPaid,
          }] : [],
        };
        setBill(transformedBill);
      }

      // Fetch from API to get the authoritative, real-time bill data
      frontdeskService.getGuestBill(Number(bookingId))
        .then(rawData => {
          console.log('[GuestBillModal] Authoritative bill data from API:', rawData);
          let data = rawData;
          if (data && typeof data === 'object') {
            if ('success' in data && 'data' in data) {
              data = data.data;
            }
            if (data && 'data' in data && !('booking_id' in data) && !('summary' in data)) {
              data = data.data;
            }
          }

          if (!data || typeof data !== 'object') {
            return;
          }

          const allCharges: any[] = [];
          const allPayments: any[] = [];

          if (data.folios && Array.isArray(data.folios)) {
            data.folios.forEach((folio: any) => {
              if (folio.charges && Array.isArray(folio.charges)) {
                folio.charges.forEach((charge: any) => {
                  allCharges.push({
                    ...charge,
                    folio_window: folio.window || folio.type,
                    tax_amount: charge.tax || charge.tax_amount || 0,
                  });
                });
              }
              if (folio.payments && Array.isArray(folio.payments)) {
                folio.payments.forEach((payment: any) => {
                  allPayments.push({
                    ...payment,
                    folio_window: folio.window || folio.type,
                  });
                });
              }
            });
          }

          const transformedBill = {
            ...data,
            charges: allCharges,
            payments: allPayments,
          };
          setBill(transformedBill);
        })
        .catch((err) => {
          console.error('[GuestBillModal] Error:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setBill(null);
    }
  }, [isOpen, bookingId]);

  // Compute Ledger Rows chronologically with running balances
  const ledgerRows = useMemo(() => {
    if (!bill) return [];

    const rows: any[] = [];
    const charges = bill.charges || [];
    const payments = bill.payments || [];

    // GST can be represented either as separate 'tax' line items OR embedded as
    // tax_amount on each charge — but NOT both, or the ledger shows GST twice.
    // When separate tax items exist they are the single source of truth; embedded
    // tax on charges is ignored (mirrors ChargesTab's hasSeparateTaxItems logic).
    // The API serialises item_type as the `category` field; check both for compatibility.
    const isTaxItem = (c: any) =>
      c.item_type === 'tax' || c.category === 'tax';
    const hasSeparateTaxItems = charges.some(
      (c: any) => isTaxItem(c) && ((c.amount || 0) !== 0 || (c.tax_amount || 0) !== 0)
    );

    // Helper: emit the CGST/SGST split rows for a given tax amount
    const pushTaxRows = (c: any, taxAmt: number, dateStr: string) => {
      const isTaxCredit = taxAmt < 0;
      const absTaxAmt = Math.abs(taxAmt);

      const tax1Name = c.tax_component_1_name || 'CGST';
      const tax1Pct = c.tax_component_1_pct ?? (bill.gst_percent ? (bill.gst_percent / 2) : 2.5);
      const tax1Amt = c.tax_component_1_amount ?? (absTaxAmt / 2);

      const tax2Name = c.tax_component_2_name || 'SGST';
      const tax2Pct = c.tax_component_2_pct ?? (bill.gst_percent ? (bill.gst_percent / 2) : 2.5);
      const tax2Amt = c.tax_component_2_amount ?? (absTaxAmt - tax1Amt);

      rows.push({
        date: dateStr,
        refNo: c.reference || bill.booking_number || '',
        sacCode: 'G',
        description: `${tax1Name} @ ${tax1Pct}%`,
        debit: isTaxCredit ? 0 : Math.abs(tax1Amt),
        credit: isTaxCredit ? Math.abs(tax1Amt) : 0,
        timestamp: new Date(dateStr).getTime() + 1,
        kind: 'tax'
      });

      rows.push({
        date: dateStr,
        refNo: c.reference || bill.booking_number || '',
        sacCode: 'G',
        description: `${tax2Name} @ ${tax2Pct}%`,
        debit: isTaxCredit ? 0 : Math.abs(tax2Amt),
        credit: isTaxCredit ? Math.abs(tax2Amt) : 0,
        timestamp: new Date(dateStr).getTime() + 2,
        kind: 'tax'
      });
    };

    // 1. Process Charges (and split tax components)
    charges.forEach((c: any) => {
      const dateStr = c.date || bill.arrival_date || '';

      // Skip payment items - they're already captured in the payments array.
      // Including them here would double-count payments.
      if (c.item_type === 'payment' || c.category === 'payment') {
        return;
      }

      // Separate 'tax' line item: represent it ONLY as CGST/SGST split rows.
      // Do NOT also push a base debit row, or its amount is counted twice.
      if (isTaxItem(c)) {
        const taxAmt = c.tax_amount || c.amount || 0;
        if (taxAmt !== 0) pushTaxRows(c, taxAmt, dateStr);
        return;
      }

      const isRoom = c.category === 'room' || c.item_type === 'room_charge' || c.category === 'room_charge';
      const taxAmt = c.tax_amount || c.tax || 0;

      // A consolidated room charge bundles every night onto one line stamped with
      // the posting date — so the bill shows the same date for the whole stay.
      // Expand it into one dated row per night (using the per-night rates embedded
      // in the description when available, otherwise an even split) so each day of
      // a multi-night stay appears with its own date.
      if (isRoom && (c.amount || 0) > 0) {
        const desc = c.description || '';

        // Per-night amounts parsed from the "[Jun 25: ₹1500, ...]" breakdown.
        const bracket = desc.match(/\[([^\]]+)\]/);
        const parsedNightly = bracket
          ? (bracket[1].match(/₹\s*[\d,]+(?:\.\d+)?/g) || []).map((s) =>
              parseFloat(s.replace(/[₹,\s]/g, ''))
            )
          : [];

        // Only expand a line that is ITSELF multi-night. Checked-in folios may
        // already post one line per night (single-night lines must NOT be split
        // by the whole-stay night count). Evidence: a per-night breakdown with >1
        // entry, or an explicit "(N nights)" in this line's description.
        const nightsMatch = desc.match(/\((\d+)\s*nights?\)/i);
        const descNights = nightsMatch ? parseInt(nightsMatch[1], 10) : 0;
        const lineNights = parsedNightly.length > 1 ? parsedNightly.length : descNights;

        // Start date for this line: prefer the "YYYY-MM-DD to YYYY-MM-DD" range in
        // the description, else the line's own date, else the booking arrival.
        const rangeMatch = desc.match(/(\d{4}-\d{2}-\d{2})\s*to\s*\d{4}-\d{2}-\d{2}/);
        const startStr = rangeMatch?.[1] || c.date || bill.arrival_date || '';
        const arrivalBase = startStr ? new Date(`${startStr}T00:00:00`) : null;

        if (arrivalBase && !isNaN(arrivalBase.getTime()) && lineNights > 1) {
          const nightsCount = lineNights;
          const roomLabel = desc.split(/charges?\s*[–-]/i)[0].trim() || 'Room Tariff';
          let nightly: number[];
          if (parsedNightly.length === nightsCount) {
            nightly = parsedNightly;
          } else {
            const even = Math.round((c.amount / nightsCount) * 100) / 100;
            nightly = Array.from({ length: nightsCount }, (_, i) =>
              i === nightsCount - 1 ? Math.round((c.amount - even * (nightsCount - 1)) * 100) / 100 : even
            );
          }

          nightly.forEach((amt, i) => {
            const d = new Date(arrivalBase);
            d.setDate(d.getDate() + i);
            const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
              d.getDate()
            ).padStart(2, '0')}`;
            rows.push({
              date: ds,
              refNo: c.reference || bill.booking_number || '',
              sacCode: '996311',
              description: `${roomLabel} – ${ds}`,
              debit: amt,
              credit: 0,
              timestamp: d.getTime() + i,
              kind: 'room'
            });
          });

          // Embedded tax stays aggregated (only when there are no separate tax items).
          if (!hasSeparateTaxItems && taxAmt !== 0) {
            pushTaxRows(c, taxAmt, dateStr);
          }
          return;
        }

        // ── Single-night room charge ──────────────────────────────────────────
        // c.date = posted_at (system timestamp), which is identical for all
        // charges posted in the same batch (e.g., all at check-in time).
        // The actual per-night date is embedded in the description by the backend:
        //   "Room charge – 2026-06-25 @ ₹1500.00"
        //   "Room charge – 2026-06-25 @ Standard @ ₹1500.00/night"
        // Extract it; fall back to posted_at only if not found.
        const descDateMatch = desc.match(/[–\-]\s*(\d{4}-\d{2}-\d{2})\b/);
        const resolvedDateStr = descDateMatch?.[1] || dateStr;

        rows.push({
          date: resolvedDateStr,
          refNo: c.reference || bill.booking_number || '',
          sacCode: '996311',
          description: desc || `Room Tariff – ${resolvedDateStr}`,
          debit: c.amount || 0,
          credit: 0,
          timestamp: new Date(resolvedDateStr).getTime(),
          kind: 'room'
        });

        if (!hasSeparateTaxItems && taxAmt !== 0) {
          pushTaxRows(c, taxAmt, resolvedDateStr);
        }
        return;
      }

      const sacCode = c.sac_code || '';
      const tariffDesc = c.description;
      const isCredit = c.amount < 0;
      const isDiscount = c.item_type === 'discount' || c.category === 'discount' || isCredit;
      rows.push({
        date: dateStr,
        refNo: c.reference || bill.booking_number || '',
        sacCode: sacCode,
        description: tariffDesc,
        debit: isCredit ? 0 : (c.amount || 0),
        credit: isCredit ? Math.abs(c.amount) : 0,
        timestamp: new Date(dateStr).getTime(),
        kind: isRoom ? 'room' : (isDiscount ? 'discount' : 'service')
      });

      // Only emit embedded tax rows when there are NO separate tax line items,
      // otherwise the separate tax items already account for the GST.
      if (!hasSeparateTaxItems && taxAmt !== 0) {
        pushTaxRows(c, taxAmt, dateStr);
      }
    });

    // 2. Process Payments
    payments.forEach((p: any) => {
      const dateStr = p.date || bill.arrival_date || '';
      rows.push({
        date: dateStr,
        refNo: p.reference || '',
        sacCode: '',
        description: `Payment - ${p.method || 'Cash/Card'}`,
        debit: 0,
        credit: p.amount || 0,
        timestamp: new Date(dateStr).getTime() + 3,
        kind: 'payment'
      });
    });

    // Order like a folio: room nights (chronological) → services → GST → discount
    // → payments. Within a group, sort by timestamp. This keeps per-night room
    // rows together instead of letting arrival-dated GST/discount interleave them.
    const KIND_ORDER: Record<string, number> = {
      room: 0, service: 1, tax: 2, discount: 3, payment: 4
    };
    rows.sort((a, b) => {
      const ka = KIND_ORDER[a.kind] ?? 1;
      const kb = KIND_ORDER[b.kind] ?? 1;
      if (ka !== kb) return ka - kb;
      return a.timestamp - b.timestamp;
    });

    // Calculate running balance
    let runningBal = 0;
    rows.forEach((r) => {
      runningBal = runningBal + r.debit - r.credit;
      r.balance = runningBal;
    });

    return rows;
  }, [bill]);

  // Aggregate Tax Summary by SAC Code
  const taxSummary = useMemo(() => {
    if (!bill || !bill.charges) return null;

    let roomTaxable = 0;
    let roomCgstAmt = 0;
    let roomSgstAmt = 0;
    let roomCgstPct = 0;
    let roomSgstPct = 0;

    bill.charges.forEach((c: any) => {
      const isRoom = c.category === 'room' || c.item_type === 'room_charge';
      if (isRoom) {
        roomTaxable += c.amount || 0;
        roomCgstAmt += c.tax_component_1_amount ?? 0;
        roomSgstAmt += c.tax_component_2_amount ?? 0;
        if (c.tax_component_1_pct) roomCgstPct = c.tax_component_1_pct;
        if (c.tax_component_2_pct) roomSgstPct = c.tax_component_2_pct;
      }
    });

    if (roomTaxable === 0) return null;

    return {
      sac: '996311',
      taxableValue: roomTaxable,
      cgstPct: roomCgstPct || (bill.gst_percent ? (bill.gst_percent / 2) : 2.5),
      cgstAmt: roomCgstAmt || ((bill.total_tax || 0) / 2),
      sgstPct: roomSgstPct || (bill.gst_percent ? (bill.gst_percent / 2) : 2.5),
      sgstAmt: roomSgstAmt || ((bill.total_tax || 0) / 2),
      totalTax: (roomCgstAmt + roomSgstAmt) || (bill.total_tax || 0)
    };
  }, [bill]);

  if (!isOpen) return null;

  // Only corporate/company bookings carry company billing details. Personal bookings
  // should not mention any company info on the bill.
  // Note: If stay_purpose is 'business', show company section even if company_name is empty
  const isBusiness = bill?.stay_purpose === 'business';
  const isCompanyBooking = !!(bill && (bill.company_name || bill.company_gstin || bill.company_address || (isBusiness && bill.gst_number)));

  const handlePrint = () => {
    window.print();
  };

  // Opens the invoice in a separate window rendered on the configured paper
  // size / orientation / margins so staff can review the exact layout before
  // printing. Mirrors the global Print & Preview settings.
  const handlePreview = () => {
    const container = document.getElementById('guest-bill-print-container');
    if (!container) return;

    const clone = container.cloneNode(true) as HTMLElement;
    // Strip on-screen-only controls and modal sizing constraints.
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());
    clone.style.maxHeight = 'none';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.borderRadius = '0';
    clone.style.margin = '0';
    // Remove the modal's fixed width cap (max-w-4xl) so the invoice fills the
    // whole sheet — otherwise content stays the same width and landscape/larger
    // paper just adds empty space off-screen, making every layout look identical.
    clone.classList.remove('max-w-4xl', 'mx-4', 'overflow-hidden');
    clone.style.width = '100%';
    clone.style.maxWidth = 'none';
    clone.style.overflow = 'visible';

    // Carry over the app's stylesheets so the preview matches the on-screen layout.
    const headStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((node) => node.outerHTML)
      .join('\n');

    const printSettings = generalSettings?.printSettings;
    const pageRule = buildPageRule(printSettings);
    // Size the on-screen preview sheet to the configured paper + orientation so
    // portrait/landscape and A4/Letter/Legal/A5 are visibly different (not just
    // applied at print time via @page).
    const { width: sheetWidth, minHeight: sheetMinHeight } = getSheetDimensions(printSettings);

    // Human-readable label so staff can confirm which layout is active.
    const paperLabel = printSettings?.paperSize || 'A4';
    const isThermal = isThermalPaper(paperLabel);

    // Reflow the A4 invoice into a narrow single-column receipt when a thermal
    // roll is selected, so the preview (and its print) is properly formatted
    // instead of the compressed/misaligned A4 layout crammed into 58/80 mm.
    const thermalCss = buildThermalReceiptCss('.preview-sheet', paperLabel);

    // Scale the sheet via CSS zoom (which also resizes the layout box). Wide
    // pages shrink so they fit the preview window; a tiny thermal roll is
    // magnified instead so the receipt stays legible on screen.
    const PX_PER_MM = 96 / 25.4;
    const sheetWidthPx = (parseFloat(sheetWidth) || 210) * PX_PER_MM;
    const previewScale = isThermal
      ? Math.min(3, 720 / sheetWidthPx)
      : Math.min(1, 760 / sheetWidthPx);
    const orientationLabel = isThermal
      ? 'Continuous roll'
      : (printSettings?.orientation === 'landscape' ? 'Landscape' : 'Portrait');

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) return;

    win.document.open();
    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice Preview${guestName ? ` — ${guestName}` : ''}</title>
    ${headStyles}
    <style>
      ${pageRule}
      body { background: #f1f5f9; margin: 0; padding: 24px 16px 40px; }
      .preview-sheet {
        background: #fff;
        width: ${sheetWidth};
        min-height: ${sheetMinHeight};
        zoom: ${previewScale};
        margin: 0 auto;
        box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      }
      .preview-toolbar {
        position: sticky; top: 0; z-index: 10;
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; max-width: 880px; margin: 0 auto 16px;
        padding: 10px 14px; background: #1f2937; color: #fff;
        border-radius: 8px; font-family: system-ui, sans-serif;
      }
      .preview-toolbar button {
        border: 0; cursor: pointer; font-size: 13px; font-weight: 600;
        padding: 7px 14px; border-radius: 6px;
      }
      .preview-toolbar .btn-print { background: #fff; color: #1f2937; }
      .preview-toolbar .btn-close { background: transparent; color: #cbd5e1; }
      @media print {
        body { background: #fff; padding: 0; }
        .preview-toolbar { display: none !important; }
        /* Let @page control the printed page; the on-screen mm sizing is preview-only. */
        .preview-sheet { box-shadow: none; width: auto; min-height: 0; max-width: none; overflow: visible; zoom: 1; }
      }
      ${thermalCss}
    </style>
  </head>
  <body>
    <div class="preview-toolbar">
      <span style="font-size:13px;font-weight:600;font-family:system-ui,sans-serif;">
        Print Preview <span style="opacity:.7;font-weight:500;">· ${paperLabel} · ${orientationLabel}</span>
      </span>
      <span>
        <button class="btn-print" onclick="window.print()">Print</button>
        <button class="btn-close" onclick="window.close()">Close</button>
      </span>
    </div>
    <div class="preview-sheet">${clone.outerHTML}</div>
  </body>
</html>`);
    win.document.close();
    win.focus();
  };

  // Summary values
  const totalDebit = ledgerRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = ledgerRows.reduce((sum, r) => sum + r.credit, 0);
  const balanceDue = totalDebit - totalCredit;

  // Direct "Print Invoice" prints the in-modal container, so its @media print
  // block must also honour the configured paper size and reflow for thermal
  // rolls — otherwise only the Preview window would be correct.
  const modalPageRule = buildPageRule(generalSettings?.printSettings);
  const modalThermalCss = buildThermalReceiptCss(
    '#guest-bill-print-container',
    generalSettings?.printSettings?.paperSize
  );

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <style dangerouslySetInnerHTML={{ __html: `
        ${modalPageRule}
        @media print {
          body * {
            visibility: hidden !important;
          }
          #guest-bill-print-container, #guest-bill-print-container * {
            visibility: visible !important;
          }
          #guest-bill-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          ${modalThermalCss}
        }
      `}} />

      <div 
        id="guest-bill-print-container"
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4 overflow-hidden border border-neutral-200"
      >
        {/* Modal Header Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-neutral-700" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Tax Invoice {guestName ? `— ${guestName}` : ''}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-700 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 active:scale-95 transition-all"
              title="Print Preview"
            >
              <Eye size={14} />
              Print Preview
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-xs font-semibold hover:bg-neutral-700 active:scale-95 transition-all"
              title="Print Invoice"
            >
              <Printer size={14} />
              Print Invoice
            </button>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Body Container */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
              <p className="text-xs text-neutral-500 font-medium">Fetching billing records...</p>
            </div>
          ) : !bill ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
              <AlertCircle size={24} className="mb-2" />
              <p className="text-xs">No billing records found for this booking.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* BRANDING HEADER SECTION */}
              <div className="gb-branding flex justify-between items-start border-b border-neutral-800 pb-4">
                <div className="w-1/4">
                  <h1 className="text-xl font-bold tracking-wider text-neutral-850 uppercase">Tax Invoice</h1>
                </div>
                <div className="w-2/4 text-center">
                  {/* <h2 className="text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase">Hotel Management</h2> */}
                  <h3 className="text-base font-bold tracking-wide text-neutral-800 uppercase mt-0.5 animate-pulse">
                    {hotel.name || 'Hotel Management'}
                  </h3>
                  <p className="text-[9px] text-neutral-500 mt-1 leading-relaxed">
                    {hotelAddressLine || 'Palvancha, Telangana, India'}
                    {hotel.phone && ` | Ph: ${hotel.phone}`}
                    {hotel.email && ` | Email: ${hotel.email}`}
                  </p>
                  {hotel.gstin && (
                    <p className="text-[9px] font-bold text-neutral-700 mt-0.5">GSTIN: {hotel.gstin}</p>
                  )}
                </div>
                <div className="w-1/4 flex justify-end items-start">
                  {logoSrc && (
                    <img
                      src={logoSrc}
                      alt={`${hotel.name || 'Hotel Management'} logo`}
                      className="max-h-10 max-w-full object-contain"
                      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as any}
                    />
                  )}
                </div>
              </div>

              {/* INFORMATION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-neutral-200 pb-4 text-[11px] text-neutral-700 font-sans">
                {/* Left side: Guest and Corporate Billing Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-neutral-850 uppercase tracking-wider border-b border-neutral-200 pb-0.5 mb-1.5">
                      Guest Information
                    </h4>
                    <table className="w-full table-fixed">
                      <tbody>
                        <tr>
                          <td className="w-20 font-bold text-neutral-500 py-0.5">Name:</td>
                          <td className="text-neutral-900 font-semibold py-0.5">{bill.guest_name || '—'}</td>
                        </tr>
                        <tr>
                          <td className="font-bold text-neutral-500 py-0.5 valign-top align-top">Address:</td>
                          <td className="text-neutral-900 py-0.5 leading-relaxed break-words">{bill.guest_address || '—'}</td>
                        </tr>
                        {bill.nationality && (
                          <tr>
                            <td className="font-bold text-neutral-500 py-0.5">Nationality:</td>
                            <td className="text-neutral-900 py-0.5">{bill.nationality}</td>
                          </tr>
                        )}
                        {bill.gst_number && (
                          <tr>
                            <td className="font-bold text-neutral-500 py-0.5">Guest GSTIN:</td>
                            <td className="text-neutral-900 font-mono font-semibold py-0.5">{bill.gst_number}</td>
                          </tr>
                        )}
                        {booking?.specialRequests && (
                          <tr>
                            <td className="font-bold text-neutral-500 py-0.5 valign-top align-top">Instruction:</td>
                            <td className="text-neutral-900 py-0.5 break-words">{booking.specialRequests}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Corporate billing block — only for company bookings */}
                  {isCompanyBooking && (
                    <div>
                      <h4 className="font-bold text-neutral-850 uppercase tracking-wider border-b border-neutral-200 pb-0.5 mb-1.5">
                        Billing Details (Corporate)
                      </h4>
                      <table className="w-full table-fixed">
                        <tbody>
                          <tr>
                            <td className="w-20 font-bold text-neutral-500 py-0.5">Company:</td>
                            <td className="text-neutral-900 font-semibold py-0.5">{bill.company_name || '—'}</td>
                          </tr>
                          {bill.company_address && (
                            <tr>
                              <td className="font-bold text-neutral-500 py-0.5 valign-top align-top">Address:</td>
                              <td className="text-neutral-900 py-0.5 leading-relaxed break-words">{bill.company_address}</td>
                            </tr>
                          )}
                          {bill.company_gstin && (
                            <tr>
                              <td className="font-bold text-neutral-500 py-0.5">GSTIN:</td>
                              <td className="text-neutral-900 font-mono font-semibold py-0.5">{bill.company_gstin}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right side: Invoice Metadata */}
                <div>
                  <h4 className="font-bold text-neutral-850 uppercase tracking-wider border-b border-neutral-200 pb-0.5 mb-1.5">
                    Invoice Details
                  </h4>
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        <td className="w-24 font-bold text-neutral-500 py-1">Invoice No:</td>
                        <td className="text-neutral-950 font-mono font-bold py-1">
                          {bill.folios?.[0]?.invoice_number || `INV-${bill.booking_number}` || '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Invoice Date:</td>
                        <td className="text-neutral-900 py-1">
                          {bill.check_out_date ? formatDateTime(bill.check_out_date).split(' ')[0] : new Date().toLocaleDateString('en-CA')}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Booking Ref No:</td>
                        <td className="text-neutral-900 font-mono py-1">{bill.booking_number || '—'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Room No / Type:</td>
                        <td className="text-neutral-900 py-1 font-semibold">
                          {bill.room_number ? `${bill.room_number} (${booking?.roomType || 'Standard'})` : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Nights:</td>
                        <td className="text-neutral-900 py-1 font-semibold">{bill.nights || 0}</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Pax:</td>
                        <td className="text-neutral-900 py-1">
                          {bill.adults || 0} Adult(s) / {bill.children || 0} Child(ren)
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Arrival:</td>
                        <td className="text-neutral-900 py-1 font-mono">
                          {bill.check_in_date ? formatDateTime(bill.check_in_date) : `${bill.arrival_date} 12:00`}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-neutral-500 py-1">Departure:</td>
                        <td className="text-neutral-900 py-1 font-mono">
                          {bill.check_out_date ? formatDateTime(bill.check_out_date) : `${bill.departure_date} 11:00`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CHRONOLOGICAL LEDGER TABLE */}
              <div>
                <h4 className="font-bold text-[11px] text-neutral-850 uppercase tracking-wider mb-2">
                  Transaction Ledger Summary
                </h4>
                <table className="gb-ledger w-full text-[10.5px] text-neutral-700 border-collapse border border-neutral-300">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-neutral-800">
                      <th className="border border-neutral-300 px-3 py-2 text-left w-20">Date</th>
                      <th className="border border-neutral-300 px-3 py-2 text-left w-24">Ref No</th>
                      <th className="border border-neutral-300 px-2 py-2 text-center w-16">SAC Code</th>
                      <th className="border border-neutral-300 px-3 py-2 text-left">Description</th>
                      <th className="border border-neutral-300 px-3 py-2 text-right w-20">Debit</th>
                      <th className="border border-neutral-300 px-3 py-2 text-right w-20">Credit</th>
                      <th className="border border-neutral-300 px-3 py-2 text-right w-24">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-neutral-200 hover:bg-neutral-50/50">
                        <td className="border border-neutral-300 px-3 py-1.5 font-mono">{row.date}</td>
                        <td className="border border-neutral-300 px-3 py-1.5 font-mono text-neutral-600 truncate max-w-[96px]">
                          {row.refNo || '—'}
                        </td>
                        <td className="border border-neutral-300 px-2 py-1.5 text-center font-mono text-neutral-500">
                          {row.sacCode || '—'}
                        </td>
                        <td className="border border-neutral-300 px-3 py-1.5 font-medium text-neutral-850">
                          {row.description}
                        </td>
                        <td className="border border-neutral-300 px-3 py-1.5 text-right font-mono">
                          {row.debit > 0 ? `₹${fmt(row.debit)}` : '—'}
                        </td>
                        <td className="border border-neutral-300 px-3 py-1.5 text-right font-mono text-emerald-700">
                          {row.credit > 0 ? `₹${fmt(row.credit)}` : '—'}
                        </td>
                        <td className="border border-neutral-300 px-3 py-1.5 text-right font-mono font-bold text-neutral-950">
                          ₹{fmt(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TAX SUMMARY AND GRAND TOTALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left side: GST SAC breakdown */}
                <div>
                  {taxSummary && (
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-[9px] text-neutral-500 uppercase tracking-wider">
                        GST Tax Breakdown
                      </h5>
                      <table className="w-full text-[9px] text-neutral-600 border border-neutral-200">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 font-bold text-neutral-700">
                            <th className="border border-neutral-200 p-1.5 text-center">SAC</th>
                            <th className="border border-neutral-200 p-1.5 text-right">Taxable Val</th>
                            <th className="border border-neutral-200 p-1.5 text-right">CGST</th>
                            <th className="border border-neutral-200 p-1.5 text-right">SGST</th>
                            <th className="border border-neutral-200 p-1.5 text-right">Total Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-neutral-150">
                            <td className="border border-neutral-200 p-1.5 text-center font-mono">{taxSummary.sac}</td>
                            <td className="border border-neutral-200 p-1.5 text-right font-mono font-medium">₹{fmt(taxSummary.taxableValue)}</td>
                            <td className="border border-neutral-200 p-1.5 text-right font-mono">
                              ₹{fmt(taxSummary.cgstAmt)}<br/>
                              <span className="text-[7.5px] text-neutral-400">({taxSummary.cgstPct}%)</span>
                            </td>
                            <td className="border border-neutral-200 p-1.5 text-right font-mono">
                              ₹{fmt(taxSummary.sgstAmt)}<br/>
                              <span className="text-[7.5px] text-neutral-400">({taxSummary.sgstPct}%)</span>
                            </td>
                            <td className="border border-neutral-200 p-1.5 text-right font-mono font-bold text-neutral-800">
                              ₹{fmt(taxSummary.totalTax)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right side: Grand Summary */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2 text-[12px] text-neutral-750 h-fit">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Total Debit (Charges)</span>
                    <span className="font-semibold text-neutral-900">₹{fmt(totalDebit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-medium">Total Credit (Payments)</span>
                    <span className="font-semibold text-emerald-700 font-mono">₹{fmt(totalCredit)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-neutral-850 text-[13px]">Balance Due</span>
                    <span className={`text-[14px] font-black tracking-tight ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      ₹{fmt(balanceDue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SIGNATURES SECTION */}
              <div className="grid grid-cols-2 gap-12 pt-10 pb-4 text-[9.5px] text-neutral-600">
                <div className="text-left space-y-8">
                  <p className="leading-normal">
                    I agree that I am primarily liable for the payment of this bill in the event of the company or association failing to pay all or part of the billing amount.
                  </p>
                  <div className="border-t border-neutral-400 w-48 pt-1.5">
                    <p className="font-bold text-neutral-800 uppercase tracking-wider">Guest Signature</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end justify-between space-y-8">
                  <p className="invisible">Spacer</p>
                  <div className="border-t border-neutral-400 w-52 pt-1.5 text-center">
                    <p className="font-bold text-neutral-800 uppercase tracking-wider">For {hotel.name || 'Hotel Management'}</p>
                    <p className="text-[8.5px] text-neutral-500 mt-0.5">Authorised Signatory / Cashier</p>
                  </div>
                </div>
              </div>

              {/* TERMS & CONDITIONS FOOTER */}
              <div className="border-t border-neutral-200 pt-3 text-[8.5px] text-neutral-500 leading-relaxed space-y-1">
                <p className="font-bold uppercase text-neutral-600 tracking-wider">Terms & Conditions:</p>
                <p>1. All disputes are subject to local judicial jurisdiction of {hotel.address?.city || 'Palvancha'}.</p>
                <p>2. Interest @ 18% p.a. will be charged if this bill is not paid/settled within 15 days of presentation.</p>
                <p>3. Guests are kindly requested to return/deposit their room access keys to the front desk upon checkout.</p>
              </div>

            </div>
          )}
        </div>

        {/* Modal Controls Footer (Hidden in Print) */}
        <div className="no-print px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-1.5 text-xs text-neutral-700 font-semibold border border-neutral-350 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
