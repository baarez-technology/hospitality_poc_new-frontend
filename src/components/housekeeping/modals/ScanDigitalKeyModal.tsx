/**
 * ScanDigitalKeyDrawer Component
 * Side drawer for scanning digital keys - Glimmora Design System v5.0
 * Pattern matching Staff/Channel Manager drawers
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  CalendarDays,
  DoorOpen,
  Scan,
  Keyboard,
} from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ScanDigitalKeyModalProps {
  open: boolean;
  onClose: () => void;
  roomNumber?: string;
}

interface ScanResult {
  valid: boolean;
  result: string;
  message: string;
  scanned_at: string;
  key_code?: string;
  room_number?: string;
  guest_name?: string;
  guest_id?: number;
  check_in_date?: string;
  check_out_date?: string;
  booking_id?: number;
  reservation_id?: number;
  scan_count?: number;
  valid_until?: string;
}

export function ScanDigitalKeyModal({ open, onClose, roomNumber }: ScanDigitalKeyModalProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [expectedRoom, setExpectedRoom] = useState(roomNumber || '');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (roomNumber) {
      setExpectedRoom(roomNumber);
    }
  }, [roomNumber]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setScanResult(null);
      setManualInput('');
      setMode('manual');
    }
  }, [open]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error('Camera access denied. Please use manual input.');
      setMode('manual');
    }
  };

  const validateKey = async (qrData: string) => {
    if (!qrData.trim()) {
      toast.error('Please enter or scan a QR code');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await api.post('/housekeeping/digital-key/scan', {
        qr_data: qrData,
        expected_room_number: expectedRoom || null,
      });

      setScanResult(response.data);

      if (response.data.valid) {
        toast.success('Digital key validated successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.response?.data?.detail || 'Failed to validate digital key');
      setScanResult({
        valid: false,
        result: 'error',
        message: error.response?.data?.detail || 'Failed to validate digital key',
        scanned_at: new Date().toISOString(),
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateKey(manualInput);
  };

  const getResultColor = (result: string): string => {
    switch (result) {
      case 'valid':
        return 'bg-sage-50 border-sage-200';
      case 'expired':
        return 'bg-gold-50 border-gold-200';
      case 'revoked':
        return 'bg-rose-50 border-rose-200';
      case 'wrong_room':
      case 'wrong_date':
        return 'bg-gold-50 border-gold-200';
      default:
        return 'bg-rose-50 border-rose-200';
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Scan Digital Key</h2>
      <p className="text-[13px] text-neutral-500 mt-1">Verify guest's digital key QR code</p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline-neutral" size="md" onClick={handleClose}>
        Close
      </Button>
      {scanResult && (
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setScanResult(null);
            setManualInput('');
          }}
        >
          Scan Another
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={open}
      onClose={handleClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Room Number Input */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Room Number (Optional)
          </h4>
          <input
            type="text"
            placeholder="e.g., 501"
            value={expectedRoom}
            onChange={(e) => setExpectedRoom(e.target.value)}
            className="w-full h-10 px-4 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300"
          />
          <p className="text-[11px] text-neutral-500 mt-1.5">
            Enter room number to verify the key is for the correct room
          </p>
        </div>

        {/* Mode Toggle */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Scan Mode
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => {
                stopCamera();
                setMode('manual');
              }}
              className={`flex-1 h-9 sm:h-10 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all ${
                mode === 'manual'
                  ? 'bg-terra-500 text-white'
                  : 'border border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Keyboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Manual Input</span>
              <span className="sm:hidden">Manual</span>
            </button>
            <button
              onClick={startCamera}
              className={`flex-1 h-9 sm:h-10 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all ${
                mode === 'camera'
                  ? 'bg-terra-500 text-white'
                  : 'border border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Camera Scan</span>
              <span className="sm:hidden">Camera</span>
            </button>
          </div>
        </div>

        {/* Manual Input Mode */}
        {mode === 'manual' && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              QR Code Data
            </h4>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Paste QR code data here (GLIMMORA:...)"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full h-10 px-4 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all font-mono hover:border-neutral-300"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isScanning}
                className="w-full justify-center px-5 py-2 text-[13px] font-semibold"
              >
                {isScanning ? 'Validating...' : 'Validate Key'}
              </Button>
            </form>
          </div>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Camera Preview
            </h4>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-36 sm:w-48 sm:h-48 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-terra-500 rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-terra-500 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-terra-500 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-terra-500 rounded-br" />
                  </div>
                </div>
              </div>
              <p className="text-[12px] sm:text-[13px] text-center text-neutral-500 mt-2 sm:mt-3">
                Position the QR code within the frame
              </p>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Scan Result
            </h4>
            <div className={`p-3 sm:p-4 rounded-lg border ${getResultColor(scanResult.result)}`}>
              <div className="flex items-start gap-2 sm:gap-3">
                {scanResult.valid ? (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-sage-600" />
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-neutral-900 text-[14px] sm:text-[15px]">
                    {scanResult.valid ? 'Valid Digital Key' : 'Invalid Digital Key'}
                  </h4>
                  <p className="text-[12px] sm:text-[13px] mt-1 text-neutral-600">{scanResult.message}</p>

                  {scanResult.valid && scanResult.guest_name && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-700">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500" />
                        <span className="font-medium">{scanResult.guest_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-700">
                        <DoorOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500" />
                        <span>Room {scanResult.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-700">
                        <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-500" />
                        <span>
                          {new Date(scanResult.check_in_date!).toLocaleDateString()} -{' '}
                          {new Date(scanResult.check_out_date!).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-white border border-neutral-200 text-neutral-700">
                          Key: {scanResult.key_code}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-white border border-neutral-200 text-neutral-700">
                          Scans: {scanResult.scan_count}
                        </span>
                      </div>
                    </div>
                  )}

                  {!scanResult.valid && scanResult.result === 'wrong_room' && (
                    <div className="mt-2 flex items-center gap-2 text-[12px] sm:text-[13px] text-gold-700">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Key is for room {scanResult.room_number}, not {expectedRoom}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default ScanDigitalKeyModal;
