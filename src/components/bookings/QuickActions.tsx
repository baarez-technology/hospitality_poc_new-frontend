import { Plus, Download } from 'lucide-react';
import { Button } from '../ui2/Button';

export default function QuickActions({ onNewBooking, onExport }) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" icon={Download} onClick={onExport}>
        Export
      </Button>
      <Button variant="primary" icon={Plus} onClick={onNewBooking}>
        New Booking
      </Button>
    </div>
  );
}
