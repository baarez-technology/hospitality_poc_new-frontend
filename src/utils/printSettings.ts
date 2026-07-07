/**
 * Print & Preview settings helpers.
 * Converts the hotel's configured paper size / orientation / margin into a CSS
 * `@page` rule that applies to every `window.print()` call in the app.
 */

export interface PrintSettings {
  paperSize: string; // A4 | Letter | Legal | A5 | 80mm | 58mm
  orientation: string; // portrait | landscape
  margin: string; // normal | narrow | wide | none
}

export const PAPER_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
  { value: 'A5', label: 'A5 (148 × 210 mm)' },
  { value: '80mm', label: 'Thermal 80 mm (receipt)' },
  { value: '58mm', label: 'Thermal 58 mm (receipt)' }
];

export const ORIENTATION_OPTIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' }
];

export const MARGIN_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'narrow', label: 'Narrow' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' }
];

// Thermal roll sizes use a continuous-height page and ignore orientation.
const THERMAL_SIZES: Record<string, string> = {
  '80mm': '80mm auto',
  '58mm': '58mm auto'
};

const NAMED_SIZES: Record<string, string> = {
  A4: 'A4',
  Letter: 'letter',
  Legal: 'legal',
  A5: 'A5'
};

const MARGIN_VALUES: Record<string, string> = {
  normal: '12mm',
  narrow: '6mm',
  wide: '20mm',
  none: '0'
};

// Physical paper dimensions in millimetres (portrait: [width, height]).
const PAPER_MM: Record<string, [number, number]> = {
  A4: [210, 297],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
  A5: [148, 210]
};

/**
 * On-screen dimensions for a print-preview "sheet" that visually matches the
 * configured paper size + orientation. Returned as CSS `mm` values so the
 * preview reflects portrait/landscape and A4/Letter/Legal/A5 differences.
 * Thermal rolls use a fixed width and auto (continuous) height.
 */
export function getSheetDimensions(
  settings: Partial<PrintSettings> | undefined | null
): { width: string; minHeight: string } {
  const paperSize = settings?.paperSize || 'A4';
  if (THERMAL_SIZES[paperSize]) {
    return { width: paperSize === '58mm' ? '58mm' : '80mm', minHeight: 'auto' };
  }
  const [w, h] = PAPER_MM[paperSize] || PAPER_MM.A4;
  const landscape = settings?.orientation === 'landscape';
  return {
    width: `${landscape ? h : w}mm`,
    minHeight: `${landscape ? w : h}mm`
  };
}

/**
 * Build the CSS `@page` rule body (size + margin) from the print settings.
 */
export function buildPageRule(settings: Partial<PrintSettings> | undefined | null): string {
  const paperSize = settings?.paperSize || 'A4';
  const orientation = settings?.orientation === 'landscape' ? 'landscape' : 'portrait';
  const marginKey = settings?.margin || 'normal';
  const margin = MARGIN_VALUES[marginKey] ?? MARGIN_VALUES.normal;

  let size: string;
  if (THERMAL_SIZES[paperSize]) {
    // Thermal rolls have a fixed width and auto height; orientation is N/A.
    size = THERMAL_SIZES[paperSize];
  } else {
    const named = NAMED_SIZES[paperSize] || 'A4';
    size = `${named} ${orientation}`;
  }

  return `@page { size: ${size}; margin: ${margin}; }`;
}

/**
 * Returns true for the continuous-roll thermal paper sizes.
 */
export function isThermalPaper(paperSize: string | undefined | null): boolean {
  return paperSize === '80mm' || paperSize === '58mm';
}

/**
 * CSS overrides that reflow the A4 tax-invoice layout into a single-column,
 * narrow thermal receipt. The invoice markup is built for A4 (two-column grids,
 * a 7-column ledger, fixed `w-20/w-24` label cells, `truncate`d refs and
 * A4-sized fonts); crammed into an 80/58 mm roll that becomes compressed and
 * misaligned. These rules — scoped to `scope` — stack the columns, drop the
 * non-essential ledger columns, unfix the table widths and shrink the type so
 * the receipt stays aligned and readable. Returns '' for non-thermal sizes.
 *
 * @param scope CSS selector wrapping the invoice (e.g. `.preview-sheet`).
 */
export function buildThermalReceiptCss(
  scope: string,
  paperSize: string | undefined | null
): string {
  if (!isThermalPaper(paperSize)) return '';
  const narrow = paperSize === '58mm';
  const baseFont = narrow ? 8.5 : 9.5;
  const cellFont = narrow ? 7.5 : 8.5;

  return `
    ${scope} { font-size: ${baseFont}px !important; line-height: 1.35 !important; }
    /* Collapse every multi-column grid into a single stacked column. */
    ${scope} .grid { display: block !important; }
    ${scope} .grid > * + * { margin-top: 10px !important; }
    /* Stack and centre the 3-column branding header. */
    ${scope} .gb-branding { display: block !important; text-align: center !important; }
    ${scope} .gb-branding > * { width: 100% !important; text-align: center !important; }
    /* Trim the A4 paddings/margins down to the roll width. */
    ${scope} .px-8 { padding-left: 4px !important; padding-right: 4px !important; }
    ${scope} .py-6 { padding-top: 6px !important; padding-bottom: 6px !important; }
    ${scope} .space-y-6 > * + * { margin-top: 10px !important; }
    ${scope} .pt-10 { padding-top: 14px !important; }
    /* Tables: fluid layout, wrap instead of clip, drop fixed label widths. */
    ${scope} table { table-layout: auto !important; width: 100% !important; }
    ${scope} th, ${scope} td { white-space: normal !important; word-break: break-word !important; }
    ${scope} .w-16, ${scope} .w-20, ${scope} .w-24 { width: auto !important; }
    ${scope} .truncate {
      max-width: none !important; overflow: visible !important;
      text-overflow: clip !important; white-space: normal !important;
    }
    /* Ledger: tighten cells and hide non-essential columns so it fits the roll.
       Columns: 1 Date · 2 Ref · 3 SAC · 4 Description · 5 Debit · 6 Credit · 7 Balance. */
    ${scope} .gb-ledger th, ${scope} .gb-ledger td {
      padding: 2px 3px !important; font-size: ${cellFont}px !important;
    }
    ${scope} .gb-ledger th:nth-child(2), ${scope} .gb-ledger td:nth-child(2),
    ${scope} .gb-ledger th:nth-child(3), ${scope} .gb-ledger td:nth-child(3) {
      display: none !important;
    }
    /* Keep the date and monetary columns (Date · Debit · Credit · Balance) on a
       single line — the global break-word rule above otherwise splits amounts
       like "₹1500.00" into "₹150" / "0.00" and the "Balance" header into two
       lines. Only the Description column (4) is allowed to wrap. */
    ${scope} .gb-ledger th:nth-child(1), ${scope} .gb-ledger td:nth-child(1),
    ${scope} .gb-ledger th:nth-child(5), ${scope} .gb-ledger td:nth-child(5),
    ${scope} .gb-ledger th:nth-child(6), ${scope} .gb-ledger td:nth-child(6),
    ${scope} .gb-ledger th:nth-child(7), ${scope} .gb-ledger td:nth-child(7) {
      white-space: nowrap !important; word-break: keep-all !important;
    }${narrow ? `
    ${scope} .gb-ledger th:nth-child(5), ${scope} .gb-ledger td:nth-child(5),
    ${scope} .gb-ledger th:nth-child(6), ${scope} .gb-ledger td:nth-child(6) {
      display: none !important;
    }` : ''}
  `;
}
