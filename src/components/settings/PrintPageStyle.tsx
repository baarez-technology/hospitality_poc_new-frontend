import { useEffect } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { buildPageRule } from '../../utils/printSettings';

const STYLE_ELEMENT_ID = 'hotel-print-page-rule';

/**
 * Injects a global `@page` CSS rule derived from the hotel's configured
 * Print & Preview settings. Mounted once near the app root so every
 * `window.print()` (bills, folios, invoices, POS receipts) uses the
 * configured paper size, orientation and margins.
 */
export default function PrintPageStyle() {
  const { generalSettings } = useSettingsContext() as any;
  const printSettings = generalSettings?.printSettings;

  useEffect(() => {
    let style = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ELEMENT_ID;
      document.head.appendChild(style);
    }
    style.textContent = buildPageRule(printSettings);
  }, [printSettings?.paperSize, printSettings?.orientation, printSettings?.margin]);

  return null;
}
