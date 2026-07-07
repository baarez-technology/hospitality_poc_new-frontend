import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { AIRoomSelectionStep } from './steps/AIRoomSelectionStep';
import { TravelDetailsStep } from './steps/TravelDetailsStep';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { SpecialRequestsStep } from './steps/SpecialRequestsStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

const steps = [
  { id: 1, name: 'Welcome', component: WelcomeStep },
  { id: 2, name: 'Personal Info', component: PersonalInfoStep },
  { id: 3, name: 'Room Selection', component: AIRoomSelectionStep },
  { id: 4, name: 'Travel Details', component: TravelDetailsStep },
  { id: 5, name: 'Documents', component: DocumentUploadStep },
  { id: 6, name: 'Preferences', component: PreferencesStep },
  { id: 7, name: 'Special Requests', component: SpecialRequestsStep },
  { id: 8, name: 'Review', component: ReviewSubmitStep },
  { id: 9, name: 'Confirmation', component: ConfirmationStep },
];

export function PreCheckInPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const CurrentStepComponent = steps.find(s => s.id === currentStep)?.component;

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="">
        <AnimatePresence mode="wait">
          {CurrentStepComponent && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                onNext={() => setCurrentStep(currentStep + 1)}
                onPrevious={() => setCurrentStep(Math.max(1, currentStep - 1))}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}