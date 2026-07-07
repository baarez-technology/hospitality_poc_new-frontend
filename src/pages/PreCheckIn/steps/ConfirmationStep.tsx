import { motion } from 'framer-motion';
import { CheckCircle, Download, Smartphone, Key, Calendar, MapPin, Mail, Phone, Clock, Sparkles } from 'lucide-react';
import { usePreCheckIn } from '@/contexts/PreCheckInContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useRef } from 'react';
import logo from '@/assets/logo.png';

interface ConfirmationStepProps {
  onNext: () => void;
}

export function ConfirmationStep({ }: ConfirmationStepProps) {
  const { preCheckInData } = usePreCheckIn();
  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);

  // Download digital key as PNG image
  const handleDownloadKey = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create canvas to render QR code with key info
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const qrSize = 300;
    const headerHeight = 80;
    const footerHeight = 100;
    const totalWidth = qrSize + (padding * 2);
    const totalHeight = qrSize + headerHeight + footerHeight + (padding * 2);

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Background - Using terra color
    ctx.fillStyle = '#B17A6A';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // White card area
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding, 16);
    ctx.fill();

    // Header text
    ctx.fillStyle = '#B17A6A';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Glimmora Hotel', totalWidth / 2, padding + 30);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Digital Room Key', totalWidth / 2, padding + 55);

    // Convert SVG to image and draw
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Draw QR code
      ctx.drawImage(img, padding, headerHeight + padding / 2, qrSize, qrSize);

      // Footer with key info
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      const footerY = headerHeight + qrSize + padding;
      ctx.fillText(`${typeof preCheckInData?.selectedRoom === 'object' ? preCheckInData?.selectedRoom?.name : preCheckInData?.selectedRoom || 'Room assigned at check-in'}`, totalWidth / 2, footerY + 20);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText(`Key ID: ${preCheckInData?.digitalKey?.keyId || 'N/A'}`, totalWidth / 2, footerY + 45);

      // Check-in dates
      ctx.font = '11px Arial';
      const checkIn = preCheckInData?.checkInDate ? format(new Date(preCheckInData.checkInDate), 'MMM dd') : '';
      const checkOut = preCheckInData?.checkOutDate ? format(new Date(preCheckInData.checkOutDate), 'MMM dd, yyyy') : '';
      if (checkIn && checkOut) {
        ctx.fillText(`${checkIn} - ${checkOut}`, totalWidth / 2, footerY + 65);
      }

      // Download
      const link = document.createElement('a');
      link.download = `glimmora-digital-key-${preCheckInData?.digitalKey?.keyId || 'room'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Logo */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
          <img
            src={logo}
            alt="Glimmora"
            className="h-8 sm:h-10 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Success Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle className="w-10 h-10 text-sage-600" strokeWidth={2} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-2"
            >
              Pre-Check-In Complete!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[15px] text-neutral-500"
            >
              Welcome to Glimmora, {preCheckInData?.guestName || preCheckInData?.personalInfo?.email?.split('@')[0] || 'Guest'}! Your room is ready and waiting.
            </motion.p>
          </div>

          {/* Digital Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-terra-500 to-terra-600 rounded-[14px] border border-terra-600 shadow-sm p-4 sm:p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Your Digital Key</h2>
                  <p className="text-[13px] text-white/80">{typeof preCheckInData?.selectedRoom === 'object' ? preCheckInData?.selectedRoom?.name : preCheckInData?.selectedRoom || 'Room assigned at check-in'}</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-white/60" />
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4 sm:mb-5" ref={qrRef}>
              <div className="p-3 bg-white rounded-lg">
                <QRCode
                  value={preCheckInData?.digitalKey?.qrCode || 'GLIMMORA-DIGITAL-KEY'}
                  size={140}
                  level="H"
                  includeMargin={false}
                  className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px]"
                />
              </div>
            </div>

            {/* Key ID */}
            <div className="text-center mb-4 sm:mb-5">
              <div className="text-[11px] text-white/70 mb-0.5">Key ID</div>
              <div className="text-[13px] font-mono font-semibold">
                {preCheckInData?.digitalKey?.keyId || 'DK-XXXXXXXX'}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadKey}
              className="w-full h-10 bg-white text-terra-600 font-semibold rounded-lg hover:bg-neutral-50 transition-all text-[13px] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download Digital Key
            </button>
          </motion.div>

          {/* Booking Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
          >
            {/* Stay Details */}
            <div className="bg-white border border-neutral-200 rounded-[14px] shadow-sm p-4 sm:p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">Stay Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-terra-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-terra-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-neutral-400 mb-0.5">Check-in / Check-out</div>
                    <div className="text-[13px] font-medium text-neutral-800">
                      {preCheckInData?.checkInDate && format(new Date(preCheckInData.checkInDate), 'MMM dd, yyyy')}
                      {' - '}
                      {preCheckInData?.checkOutDate && format(new Date(preCheckInData.checkOutDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-terra-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-terra-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-neutral-400 mb-0.5">Estimated Arrival</div>
                    <div className="text-[13px] font-medium text-neutral-800">
                      {preCheckInData?.travelDetails?.arrivalTime || '3:00 PM'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-terra-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-terra-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-neutral-400 mb-0.5">Room Type</div>
                    <div className="text-[13px] font-medium text-neutral-800">
                      {typeof preCheckInData?.selectedRoom === 'object'
                        ? preCheckInData?.selectedRoom?.name
                        : preCheckInData?.selectedRoom || 'Assigned at check-in'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-neutral-200 rounded-[14px] shadow-sm p-4 sm:p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-terra-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-terra-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-neutral-400 mb-0.5">Email</div>
                    <div className="text-[13px] font-medium text-neutral-800">
                      {preCheckInData?.personalInfo?.email || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-terra-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-terra-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-neutral-400 mb-0.5">Phone</div>
                    <div className="text-[13px] font-medium text-neutral-800">
                      {preCheckInData?.personalInfo?.phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sage-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-sage-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-neutral-400 mb-0.5">Confirmation Sent</div>
                    <div className="text-[13px] font-medium text-sage-600">
                      Email & SMS confirmation sent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Instructions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-ocean-50 border border-ocean-200 rounded-[14px] shadow-sm p-4 sm:p-5"
          >
            <h3 className="text-[13px] font-semibold text-ocean-800 mb-3">What happens next?</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-ocean-600 font-medium mt-0.5">1.</span>
                <p className="text-[13px] text-ocean-800">
                  <strong>Save your digital key</strong> - Download or screenshot the QR code above
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-ocean-600 font-medium mt-0.5">2.</span>
                <p className="text-[13px] text-ocean-800">
                  <strong>Skip the front desk</strong> - Go directly to your room upon arrival
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-ocean-600 font-medium mt-0.5">3.</span>
                <p className="text-[13px] text-ocean-800">
                  <strong>Scan to enter</strong> - Use your digital key at the room door
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4"
          >
            <button
              onClick={() => window.print()}
              className="flex-1 h-10 bg-white border border-neutral-200 hover:border-terra-500 text-neutral-800 font-semibold rounded-lg transition-all text-[13px] shadow-sm active:scale-[0.98]"
            >
              Print Summary
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 h-10 bg-terra-500 hover:bg-terra-600 text-white font-semibold rounded-lg transition-all text-[13px] shadow-sm active:scale-[0.98]"
            >
              Back to Home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
