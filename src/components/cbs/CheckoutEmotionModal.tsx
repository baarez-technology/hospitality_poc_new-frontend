import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../ui2/Modal';
import { Button } from '../ui2/Button';

const EMOTIONS = [
  { key: 'happy', emoji: '😊', label: 'Happy', color: 'border-sage-400 bg-sage-50' },
  { key: 'neutral', emoji: '😐', label: 'Neutral', color: 'border-gold-400 bg-gold-50' },
  { key: 'unhappy', emoji: '😞', label: 'Unhappy', color: 'border-rose-400 bg-rose-50' },
] as const;

interface CheckoutEmotionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (emotion?: string, notes?: string) => void;
  guestName: string;
  loading?: boolean;
}

export default function CheckoutEmotionModal({
  open,
  onClose,
  onConfirm,
  guestName,
  loading,
}: CheckoutEmotionModalProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(selectedEmotion || undefined, notes.trim() || undefined);
    setSelectedEmotion(null);
    setNotes('');
  };

  const handleSkip = () => {
    onConfirm(undefined, undefined);
    setSelectedEmotion(null);
    setNotes('');
  };

  const handleClose = () => {
    onClose();
    setSelectedEmotion(null);
    setNotes('');
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-terra-50 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-terra-600" />
          </div>
          <div>
            <ModalTitle>Guest Checkout</ModalTitle>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{guestName}</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-4">
          {/* Emotion Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              How was the guest's experience?
            </label>
            <div className="flex gap-2">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.key}
                  type="button"
                  onClick={() => setSelectedEmotion(emotion.key)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    selectedEmotion === emotion.key
                      ? emotion.color
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-2xl block">{emotion.emoji}</span>
                  <span className="block text-xs mt-1 text-neutral-600 font-medium">
                    {emotion.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Checkout notes <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations about the stay..."
              rows={2}
              className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra-300 focus:border-transparent"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="ghost" onClick={handleSkip} disabled={loading}>
          Skip
        </Button>
        <Button variant="primary" onClick={handleConfirm} loading={loading}>
          Complete Checkout
        </Button>
      </ModalFooter>
    </Modal>
  );
}
