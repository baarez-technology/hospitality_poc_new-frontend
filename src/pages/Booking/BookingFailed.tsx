import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, Mail, Phone, HelpCircle } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { BookingSummaryWidget } from '@/components/booking/BookingSummaryWidget';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
interface BookingFailedState {
  error?: string;
  errorCode?: string;
}

export const BookingFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft } = useBookingStore();

  const state = location.state as BookingFailedState | undefined;
  const errorMessage = state?.error || 'Your payment could not be processed';
  const errorCode = state?.errorCode;

  // Redirect if no booking draft exists
  useEffect(() => {
    if (!draft) {
      navigate('/rooms');
    }
  }, [draft, navigate]);

  if (!draft) {
    return null;
  }

  const handleRetry = () => {
    navigate('/booking/payment');
  };

  const handleContactSupport = () => {
    navigate('/contact', {
      state: {
        subject: 'Payment Issue',
        message: `I encountered an error while booking: ${errorMessage}`,
      },
    });
  };

  const getErrorAdvice = () => {
    if (!errorCode) return null;

    const adviceMap: Record<string, string> = {
      card_declined: 'Your card was declined. Please check with your bank or try a different card.',
      insufficient_funds: 'Insufficient funds. Please use a different payment method.',
      expired_card: 'Your card has expired. Please use a valid card.',
      incorrect_cvc: 'The CVV/CVC code is incorrect. Please check and try again.',
      processing_error: 'A processing error occurred. Please try again in a few minutes.',
      network_error: 'Network connection issue. Please check your internet and retry.',
    };

    return adviceMap[errorCode] || null;
  };

  const errorAdvice = getErrorAdvice();

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Error Message */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="text-center" padding="lg">
            <div className="text-red-600 mb-4">
              <XCircle size={64} className="mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-lg text-neutral-600 mb-4">
              {errorMessage}
            </p>
            {errorAdvice && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-yellow-800">{errorAdvice}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Actions & Help */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                What would you like to do?
              </h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<RefreshCw size={20} />}
                  onClick={handleRetry}
                  fullWidth
                >
                  Try Payment Again
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<ArrowLeft size={20} />}
                  onClick={() => navigate('/rooms')}
                  fullWidth
                >
                  Back to Rooms
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={<Mail size={20} />}
                  onClick={handleContactSupport}
                  fullWidth
                >
                  Contact Support
                </Button>
              </div>
            </Card>

            {/* Common Issues */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Common Payment Issues
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">
                    Card Declined
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Contact your bank to ensure international/online transactions are enabled.
                    Some banks require authorization for hotel bookings.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">
                    Incorrect Card Details
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Double-check your card number, expiry date, and CVV code. Make sure your
                    billing address matches your card details.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">
                    Insufficient Funds
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Ensure your account has sufficient funds to cover the booking amount plus
                    any international transaction fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">
                    3D Secure Authentication Failed
                  </h3>
                  <p className="text-sm text-neutral-600">
                    If prompted, complete your bank's security verification. Check for SMS
                    codes or authentication app notifications.
                  </p>
                </div>
              </div>
            </Card>

            {/* Alternative Payment Methods */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Alternative Payment Methods
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                If you continue to experience issues with your card, we accept:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border border-neutral-200 rounded-lg p-3">
                  <h3 className="font-medium text-neutral-900 text-sm mb-1">
                    Credit/Debit Cards
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Visa, Mastercard, American Express
                  </p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-3">
                  <h3 className="font-medium text-neutral-900 text-sm mb-1">
                    Digital Wallets
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Apple Pay, Google Pay (coming soon)
                  </p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-3">
                  <h3 className="font-medium text-neutral-900 text-sm mb-1">
                    Bank Transfer
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Contact us for bank details
                  </p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-3">
                  <h3 className="font-medium text-neutral-900 text-sm mb-1">
                    Pay at Hotel
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Available for select bookings
                  </p>
                </div>
              </div>
            </Card>

            {/* Contact Support */}
            <Card padding="lg" className="bg-primary-50 border-primary-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Need Help?
              </h2>
              <p className="text-sm text-neutral-700 mb-4">
                Our support team is here to help you complete your booking
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Email Support</p>
                    <a
                      href="mailto:support@glimmora.com"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      support@glimmora.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Phone Support</p>
                    <a
                      href="tel:+1234567890"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      +1 (234) 567-890
                    </a>
                    <p className="text-xs text-neutral-600">24/7 Available</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-100 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Your Booking Details
              </h3>
              <p className="text-sm text-neutral-600">
                Your booking information is saved. You can retry payment at any time.
              </p>
            </div>
            <BookingSummaryWidget
              booking={draft}
              showCancellationPolicy={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
