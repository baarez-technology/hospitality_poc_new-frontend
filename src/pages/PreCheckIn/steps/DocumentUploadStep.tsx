import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, Shield, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreCheckIn } from '@/contexts/PreCheckInContext';
import { precheckinService } from '@/api/services/precheckin.service';
import logo from '@/assets/logo.png';
import toast from 'react-hot-toast';

interface DocumentUploadStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  extractedName?: string;
  idType?: string;
  message: string;
}

export function DocumentUploadStep({ onNext, onPrevious }: DocumentUploadStepProps) {
  const navigate = useNavigate();
  const { preCheckInData, updatePreCheckInData } = usePreCheckIn();
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [idType, setIdType] = useState<string>('passport');

  const handleLogoClick = () => {
    const confirmed = window.confirm('Are you sure you want to cancel the pre-check-in? Your progress will be lost.');
    if (confirmed) {
      navigate('/');
    }
  };

  const onDropFront = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const url = URL.createObjectURL(acceptedFiles[0]);
      setFrontFile(acceptedFiles[0]);
      updatePreCheckInData({
        documents: { ...preCheckInData.documents, idFrontUrl: url }
      });
      setFrontUploaded(true);
      setVerificationResult(null); // Reset verification when new file uploaded
    }
  }, [preCheckInData.documents, updatePreCheckInData]);

  const onDropBack = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const url = URL.createObjectURL(acceptedFiles[0]);
      updatePreCheckInData({
        documents: { ...preCheckInData.documents, idBackUrl: url }
      });
      setBackUploaded(true);
    }
  }, [preCheckInData.documents, updatePreCheckInData]);

  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } = useDropzone({
    onDrop: onDropFront,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  });

  const { getRootProps: getBackRootProps, getInputProps: getBackInputProps } = useDropzone({
    onDrop: onDropBack,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  });

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Verify ID document with OpenAI
  const verifyIdDocument = async () => {
    if (!frontFile) {
      toast.error('Please upload the front side of your ID');
      return;
    }

    if (!preCheckInData?.reservationId) {
      toast.error('Reservation not found. Please restart pre-check-in.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Get or create pre-checkin to have a valid precheckin_id for verification
      let precheckin = await precheckinService.getByReservation(preCheckInData.reservationId);

      if (!precheckin) {
        // Create a basic pre-checkin record first
        precheckin = await precheckinService.create({
          reservation_id: preCheckInData.reservationId,
          email: preCheckInData.personalInfo?.email || '',
          phone: preCheckInData.personalInfo?.phone || '',
          floor_preference: preCheckInData.roomPreferences?.floor,
          view_preference: preCheckInData.roomPreferences?.view,
          bed_type_preference: preCheckInData.roomPreferences?.bedType,
          quietness_preference: preCheckInData.roomPreferences?.quietness,
        });
      }

      if (!precheckin?.id) {
        toast.error('Failed to create pre-check-in record. Please try again.');
        setIsVerifying(false);
        return;
      }

      // BUG-031 FIX: Use guest name already stored in context from booking verification step.
      // Previously called bookingService.getBooking() which requires authentication,
      // causing 401 errors for unauthenticated guests in the pre-check-in flow.
      const expectedName = preCheckInData.guestName?.trim();

      if (!expectedName) {
        toast.error('Guest name not found. Please go back and verify your booking.');
        setIsVerifying(false);
        return;
      }

      // Convert file to base64
      const imageBase64 = await fileToBase64(frontFile);

      // Call verification API with precheckin_id so it updates the database
      const result = await precheckinService.verifyDocument({
        precheckin_id: precheckin.id,
        image_url: imageBase64,
        expected_name: expectedName,
        id_type: idType,
      });

      setVerificationResult({
        verified: result.verified,
        confidence: result.confidence,
        extractedName: result.extracted_name,
        idType: result.id_type_detected,
        message: result.message,
      });

      if (result.verified) {
        toast.success('ID verified successfully!');
        // Store verification result in context
        updatePreCheckInData({
          documents: {
            ...preCheckInData.documents,
            idVerified: true,
            idVerificationConfidence: result.confidence,
            extractedName: result.extracted_name,
            idType: result.id_type_detected || idType,
          }
        });
      } else {
        toast.error(result.message || 'ID verification failed. Please upload a valid government ID that matches your booking name.');
      }
    } catch (error: any) {
      console.error('ID verification error:', error);
      toast.error('Failed to verify ID. Please try again.');
      setVerificationResult({
        verified: false,
        confidence: 0,
        message: 'Verification service unavailable. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    if (frontUploaded && backUploaded && verificationResult?.verified) {
      onNext();
    }
  };

  const steps = [
    { number: 1, label: 'Welcome', active: false },
    { number: 2, label: 'Guest Details', active: false },
    { number: 3, label: 'Room Type', active: false },
    { number: 4, label: 'Travel Details', active: false },
    { number: 5, label: 'Documents', active: true },
    { number: 6, label: 'Preferences', active: false },
    { number: 7, label: 'Special Requests', active: false },
    { number: 8, label: 'Review', active: false },
    { number: 9, label: 'Confirmation', active: false },
  ];

  const currentStepIndex = steps.findIndex(s => s.active);

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN - Vertical Stepper */}
      <div className="hidden lg:block w-[410px] min-h-screen px-12 py-12 border-r border-neutral-200 bg-white">
        <div className="sticky top-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <img
              src={logo}
              alt="Glimmora"
              className="h-10 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </motion.div>

          {/* Vertical Stepper */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4">
                {/* Step Indicator Column */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step.active
                        ? 'bg-terra-500 text-white'
                        : 'bg-transparent text-neutral-400 border border-neutral-300'
                    }`}
                  >
                    {step.active ? <div className="w-2 h-2 bg-white rounded-full" /> : step.number}
                  </motion.div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="w-px h-10 bg-neutral-200 mt-1.5" />
                  )}
                </div>

                {/* Step Label */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="pt-1 pb-8"
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      step.active ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.active && (
                    <div className="text-[11px] text-neutral-400">
                      Upload your ID document
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Content Area */}
      <div className="flex-1 min-h-screen bg-neutral-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <img
              src={logo}
              alt="Glimmora"
              className="h-8 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
            <span className="text-[13px] text-neutral-500">Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          {/* Mobile Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-1">
            <div
              className="bg-terra-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-4 py-6 lg:px-10 lg:py-8">
          {/* Previous Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onPrevious}
            className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-neutral-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-8 rounded-[10px] shadow-sm"
          >
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-lg font-semibold text-neutral-800 mb-2">
                Upload ID Document
              </h1>
              <p className="text-[13px] text-neutral-500">
                For security and verification purposes
              </p>
            </div>

            <div className="space-y-5">
              {/* Front Side Upload */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Front Side
                </label>
                <div
                  {...getFrontRootProps()}
                  className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    frontUploaded
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-neutral-300 hover:border-terra-500 hover:bg-neutral-50'
                  }`}
                >
                  <input {...getFrontInputProps()} />
                  {frontUploaded ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-sage-500 rounded-full flex items-center justify-center mb-2">
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-[13px] font-medium text-sage-800 mb-0.5">Front side uploaded!</p>
                      <p className="text-[11px] text-sage-600">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5 text-neutral-500" strokeWidth={2} />
                      </div>
                      <p className="text-[13px] font-medium text-neutral-800 mb-0.5">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[11px] text-neutral-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Side Upload */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Back Side
                </label>
                <div
                  {...getBackRootProps()}
                  className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    backUploaded
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-neutral-300 hover:border-terra-500 hover:bg-neutral-50'
                  }`}
                >
                  <input {...getBackInputProps()} />
                  {backUploaded ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-sage-500 rounded-full flex items-center justify-center mb-2">
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-[13px] font-medium text-sage-800 mb-0.5">Back side uploaded!</p>
                      <p className="text-[11px] text-sage-600">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5 text-neutral-500" strokeWidth={2} />
                      </div>
                      <p className="text-[13px] font-medium text-neutral-800 mb-0.5">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[11px] text-neutral-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Type Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  ID Document Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-[10px] text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                  <option value="other">Other Government ID</option>
                </select>
              </div>

              {/* Verification Result */}
              {verificationResult && (
                <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                  verificationResult.verified
                    ? 'bg-sage-50 border-sage-200'
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  {verificationResult.verified ? (
                    <CheckCircle className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-[13px] font-semibold mb-1 ${
                      verificationResult.verified ? 'text-sage-800' : 'text-rose-800'
                    }`}>
                      {verificationResult.verified ? 'ID Verified Successfully' : 'Verification Failed'}
                    </p>
                    <p className={`text-[11px] ${
                      verificationResult.verified ? 'text-sage-600' : 'text-rose-600'
                    }`}>
                      {verificationResult.message}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-[11px] text-neutral-600">
                        <span className="font-medium">Booking Name:</span> {preCheckInData?.guestName || 'N/A'}
                      </p>
                      {verificationResult.extractedName && (
                        <p className="text-[11px] text-neutral-600">
                          <span className="font-medium">Name on ID:</span> {verificationResult.extractedName}
                        </p>
                      )}
                      {verificationResult.idType && (
                        <p className="text-[11px] text-neutral-600">
                          <span className="font-medium">Document Type:</span> {verificationResult.idType}
                        </p>
                      )}
                      {verificationResult.confidence > 0 && (
                        <p className="text-[11px] text-neutral-600">
                          <span className="font-medium">Confidence:</span> {Math.round(verificationResult.confidence * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
                <Shield className="w-4 h-4 text-ocean-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-ocean-800">
                  <p className="font-semibold mb-0.5">Your Privacy & Security</p>
                  <p>Documents are encrypted and used only for verification. AI-powered verification ensures the name on your ID matches your booking.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                {/* Verify Button - shown when both sides uploaded but not yet verified */}
                {frontUploaded && backUploaded && !verificationResult?.verified && (
                  <button
                    onClick={verifyIdDocument}
                    disabled={isVerifying}
                    className={`w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] flex items-center justify-center gap-2 ${
                      isVerifying
                        ? 'bg-neutral-400 cursor-not-allowed'
                        : 'bg-ocean-500 hover:bg-ocean-600 active:scale-[0.98]'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying ID...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Verify ID Document
                      </>
                    )}
                  </button>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={!frontUploaded || !backUploaded || !verificationResult?.verified}
                  className={`w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] ${
                    frontUploaded && backUploaded && verificationResult?.verified
                      ? 'bg-terra-500 hover:bg-terra-600 active:scale-[0.98]'
                      : 'bg-neutral-300 cursor-not-allowed'
                  }`}
                >
                  {verificationResult?.verified ? 'Continue' : 'Upload & Verify to Continue'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
