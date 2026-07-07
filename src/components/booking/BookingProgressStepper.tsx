import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Step {
  id: number;
  name: string;
  path: string;
}

interface BookingProgressStepperProps {
  currentStep: number;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { id: 1, name: 'Review', path: '/booking/review' },
  { id: 2, name: 'Payment', path: '/booking/payment' },
  { id: 3, name: 'Confirmation', path: '/booking/confirmation' },
];

export const BookingProgressStepper = ({
  currentStep,
  steps = defaultSteps,
}: BookingProgressStepperProps) => {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <li
              key={step.id}
              className={clsx('relative flex items-center', {
                'flex-1': index < steps.length - 1,
              })}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    {
                      'bg-green-500 text-white': isCompleted,
                      'bg-primary-600 text-white ring-4 ring-primary-100': isCurrent,
                      'bg-neutral-200 text-neutral-500': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? <Check size={20} /> : step.id}
                </div>
                <span
                  className={clsx('mt-2 text-sm font-medium', {
                    'text-green-600': isCompleted,
                    'text-primary-600': isCurrent,
                    'text-neutral-500': isUpcoming,
                  })}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-4 transition-all',
                    {
                      'bg-green-500': isCompleted,
                      'bg-neutral-200': !isCompleted,
                    }
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
