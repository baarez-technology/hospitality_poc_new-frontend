import { UserPlus, Download } from 'lucide-react';
import { Button } from '../ui2/Button';

export default function GuestsActions({ onAddGuest, onExport }) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" icon={Download} onClick={onExport}>
        Export
      </Button>
      <Button variant="primary" icon={UserPlus} onClick={onAddGuest}>
        Add Guest
      </Button>
    </div>
  );
}
