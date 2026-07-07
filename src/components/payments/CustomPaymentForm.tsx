/**
 * Custom Payment Form Component
 * S2S payment for saved cards, inline form for new cards
 * Supports Card, UPI, and Pay-at-Hotel options
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Banknote,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Star,
  Lock,
  QrCode,
} from 'lucide-react';
import { razorpayService } from '../../api/services/razorpay.service';
import { savedCardsService } from '../../api/services/saved-cards.service';
import { paymentQRService, type QRSettingsResponse } from '../../api/services/payment-qr.service';
import type { PaymentVerificationResponse, PaymentGatewayConfig, DirectPaymentResponse } from '../../types/razorpay.types';
import type { SavedCard } from '../../types/saved-card.types';

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMethod = 'card' | 'upi' | 'cash' | 'qr_code';

// Card brand icons
const CARD_BRAND_ICONS: Record<string, string> = {
  visa: 'https://cdn.razorpay.com/app/visa.svg',
  mastercard: 'https://cdn.razorpay.com/app/mastercard.svg',
  rupay: 'https://cdn.razorpay.com/app/rupay.svg',
  amex: 'https://cdn.razorpay.com/app/amex.svg',
  maestro: 'https://cdn.razorpay.com/app/maestro.svg',
  diners: 'https://cdn.razorpay.com/app/diners.svg',
};

interface CustomPaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  bookingId?: number;
  folioId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
  onSuccess?: (response: PaymentVerificationResponse | DirectPaymentResponse) => void;
  onError?: (error: string) => void;
  onPayAtHotel?: () => void;
  onQRCodePayment?: (paymentReference: string) => void;
  showCashOption?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function CustomPaymentForm({
  amount,
  currency = 'INR',
  description,
  bookingId,
  folioId,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  notes,
  onSuccess,
  onError,
  onPayAtHotel,
  onQRCodePayment,
  showCashOption = true,
  disabled = false,
  className = '',
}: CustomPaymentFormProps) {
  // UI State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [config, setConfig] = useState<PaymentGatewayConfig | null>(null);

  // Saved cards state
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cvv, setCvv] = useState('');
  const [useNewCard, setUseNewCard] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(true);

  // QR Code payment state
  const [qrSettings, setQrSettings] = useState<QRSettingsResponse | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  // Razorpay script loaded state
  const razorpayScriptLoaded = useRef(false);

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        razorpayScriptLoaded.current = true;
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        const checkRazorpay = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkRazorpay);
            razorpayScriptLoaded.current = true;
            resolve(true);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkRazorpay);
          resolve(false);
        }, 10000);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        razorpayScriptLoaded.current = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Load config and saved cards on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingConfig(true);
        setError(null);

        // Load QR settings first (independent of Razorpay)
        let qrData: QRSettingsResponse | null = null;
        try {
          qrData = await paymentQRService.getPublicSettings();
          setQrSettings(qrData);
        } catch (err) {
          console.log('QR settings not available');
        }

        // Load Razorpay config
        let gatewayConfig: PaymentGatewayConfig;
        try {
          gatewayConfig = await razorpayService.getConfig();
          setConfig(gatewayConfig);
        } catch (err) {
          console.error('Failed to load payment config:', err);
          gatewayConfig = {
            razorpay_enabled: false,
            razorpay_key_id: undefined,
            stripe_enabled: false,
            stripe_publishable_key: undefined,
            pay_at_hotel_enabled: true,
            default_currency: 'INR',
            supported_methods: ['cash'],
            card_enabled: false,
            upi_enabled: false,
            cash_enabled: true,
          };
          setConfig(gatewayConfig);
        }

        // Set default method - prioritize QR code if available
        const qrAvailable = qrData?.qr_code_enabled && qrData?.qr_code_image;
        if (!gatewayConfig.razorpay_enabled) {
          if (qrAvailable) setSelectedMethod('qr_code');
          else if (showCashOption) setSelectedMethod('cash');
        } else {
          if (gatewayConfig.card_enabled) setSelectedMethod('card');
          else if (gatewayConfig.upi_enabled) setSelectedMethod('upi');
          else if (qrAvailable) setSelectedMethod('qr_code');
          else if (showCashOption) setSelectedMethod('cash');

          // Pre-load Razorpay script
          loadRazorpayScript().catch(console.error);
        }

        // Load saved cards if card payments enabled
        if (gatewayConfig.razorpay_enabled && gatewayConfig.card_enabled) {
          setIsLoadingCards(true);
          try {
            const cardData = await savedCardsService.getCards();
            const validCards = cardData.cards.filter(c => c.has_token && !c.is_expired);
            setSavedCards(validCards);

            // Auto-select default card if available
            const defaultCard = validCards.find(c => c.is_default);
            if (defaultCard) {
              setSelectedCardId(defaultCard.id);
              setUseNewCard(false);
            } else if (validCards.length > 0) {
              setSelectedCardId(validCards[0].id);
              setUseNewCard(false);
            } else {
              setUseNewCard(true);
            }
          } catch (err) {
            console.error('Failed to load saved cards:', err);
            setUseNewCard(true);
          } finally {
            setIsLoadingCards(false);
          }
        }
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadData();
  }, [showCashOption]);

  const razorpayEnabled = config?.razorpay_enabled ?? false;
  const razorpayKeyId = config?.razorpay_key_id;
  const cardEnabled = razorpayEnabled;
  const upiEnabled = razorpayEnabled;
  const cashEnabled = showCashOption;
  const qrCodeEnabled = qrSettings?.qr_code_enabled && qrSettings?.qr_code_image;

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amt);
  };

  // Pay with saved card (S2S - no modal)
  const handleSavedCardPayment = async (orderId: string) => {
    if (!selectedCardId || !cvv) {
      throw new Error('Please select a card and enter CVV');
    }

    if (cvv.length < 3 || cvv.length > 4) {
      throw new Error('Please enter a valid CVV');
    }

    const response = await razorpayService.payWithSavedCard({
      order_id: orderId,
      saved_card_id: selectedCardId,
      cvv,
      email: customerEmail,
      contact: customerPhone,
    });

    if (!response.success) {
      if (response.error_code === 'CARD_TOKEN_NOT_AVAILABLE') {
        // Card doesn't have token, fall back to modal
        throw new Error('FALLBACK_TO_MODAL');
      }
      throw new Error(response.error || 'Payment failed');
    }

    return response;
  };

  // Open Razorpay Checkout for new cards
  const openRazorpayCheckout = async (
    orderId: string,
    orderAmount: number,
    keyId: string,
    enableRecurring: boolean = false
  ): Promise<{ paymentId: string; signature: string }> => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay. Please refresh and try again.');
    }

    return new Promise((resolve, reject) => {
      const options: any = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'Glimmora',
        description: description || 'Payment',
        order_id: orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: notes || {},
        theme: { color: '#c45d3a' },
        handler: function (response: any) {
          resolve({
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled'));
          },
          escape: true,
          backdropclose: false,
        },
      };

      if (enableRecurring) {
        options.recurring = '1';
      }

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response: any) {
          reject(new Error(response.error?.description || 'Payment failed'));
        });
        razorpay.open();
      } catch (err: any) {
        reject(new Error('Failed to open payment window. Please try again.'));
      }
    });
  };

  // Verify payment after checkout
  const verifyCheckoutPayment = async (
    orderId: string,
    paymentId: string,
    signature: string,
    shouldSaveCard: boolean
  ) => {
    const verification = await razorpayService.verifyPayment({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      booking_id: bookingId,
      folio_id: folioId,
    });

    if (verification.success && shouldSaveCard) {
      try {
        await savedCardsService.saveCardFromPayment({
          razorpay_payment_id: paymentId,
          save_card: true,
          is_default: savedCards.length === 0,
        });
      } catch (err) {
        console.error('Failed to save card:', err);
      }
    }

    return verification;
  };

  // Main payment handler
  const handlePayment = async () => {
    if (selectedMethod === 'cash') {
      onPayAtHotel?.();
      return;
    }

    if (selectedMethod === 'qr_code') {
      if (paymentReference.length !== 4) {
        setError('Please enter the last 4 digits of your UTR/Transaction number');
        return;
      }
      onQRCodePayment?.(paymentReference);
      return;
    }

    if (!razorpayEnabled || !razorpayKeyId) {
      setError('Online payment is currently unavailable.');
      return;
    }

    if (amount <= 0) {
      setError('Invalid payment amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create order
      const order = await razorpayService.createOrder({
        amount,
        currency,
        booking_id: bookingId,
        folio_id: folioId,
        notes: {
          ...notes,
          description: description || 'Payment',
          payment_method: selectedMethod,
        },
      });

      if (!order.order_id) {
        throw new Error('Failed to create payment order');
      }

      // Handle payment based on method
      if (selectedMethod === 'card' && !useNewCard && selectedCardId) {
        // S2S payment with saved card
        try {
          const response = await handleSavedCardPayment(order.order_id);
          setPaymentSuccess(true);
          onSuccess?.(response);
        } catch (err: any) {
          if (err.message === 'FALLBACK_TO_MODAL') {
            // Token not available, use checkout
            const checkoutResult = await openRazorpayCheckout(
              order.order_id,
              order.amount,
              order.key_id || razorpayKeyId,
              true
            );
            const verification = await verifyCheckoutPayment(
              order.order_id,
              checkoutResult.paymentId,
              checkoutResult.signature,
              true
            );
            if (verification.success) {
              setPaymentSuccess(true);
              onSuccess?.(verification);
            } else {
              throw new Error('Payment verification failed');
            }
          } else {
            throw err;
          }
        }
      } else {
        // New card or UPI - use Razorpay checkout
        const shouldSaveCard = selectedMethod === 'card' && saveNewCard;
        const checkoutResult = await openRazorpayCheckout(
          order.order_id,
          order.amount,
          order.key_id || razorpayKeyId,
          shouldSaveCard
        );

        const verification = await verifyCheckoutPayment(
          order.order_id,
          checkoutResult.paymentId,
          checkoutResult.signature,
          shouldSaveCard
        );

        if (verification.success) {
          setPaymentSuccess(true);
          onSuccess?.(verification);
        } else {
          throw new Error('Payment verification failed');
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      if (err.message === 'Payment cancelled') {
        setError('Payment was cancelled. You can try again when ready.');
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'Payment failed. Please try again.';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoadingConfig) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-terra-500" />
        <span className="ml-2 text-neutral-600">Loading payment options...</span>
      </div>
    );
  }

  // Success state
  if (paymentSuccess) {
    return (
      <div className={`p-6 bg-green-50 rounded-xl border border-green-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
            <p className="text-sm text-green-600">{formatAmount(amount)} paid successfully</p>
          </div>
        </div>
      </div>
    );
  }

  const isDemoMode = !razorpayEnabled && !qrCodeEnabled;

  // No payment methods available
  if (!razorpayEnabled && !qrCodeEnabled && !showCashOption) {
    return (
      <div className={`p-6 bg-amber-50 rounded-xl border border-amber-200 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div>
            <p className="text-amber-800 font-medium">Online payment not available</p>
            <p className="text-sm text-amber-700 mt-1">Please contact the hotel to complete your booking.</p>
          </div>
        </div>
      </div>
    );
  }

  const enabledCount = [cardEnabled, upiEnabled, qrCodeEnabled, cashEnabled].filter(Boolean).length;
  const gridCols = enabledCount === 1 ? 'grid-cols-1' : enabledCount === 2 ? 'grid-cols-2' : enabledCount === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Banknote className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">Demo Mode</p>
              <p className="text-xs text-purple-600 mt-0.5">
                Online payments not configured. Only "Pay at Hotel" is available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className={`grid ${gridCols} gap-3`}>
        {cardEnabled && (
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            disabled={disabled || isProcessing}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'card'
                ? 'border-terra-500 bg-terra-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CreditCard className={`w-6 h-6 mx-auto mb-2 ${selectedMethod === 'card' ? 'text-terra-600' : 'text-neutral-400'}`} />
            <p className={`font-semibold text-sm ${selectedMethod === 'card' ? 'text-terra-700' : 'text-neutral-600'}`}>Card</p>
          </button>
        )}

        {upiEnabled && (
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            disabled={disabled || isProcessing}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'upi'
                ? 'border-terra-500 bg-terra-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Smartphone className={`w-6 h-6 mx-auto mb-2 ${selectedMethod === 'upi' ? 'text-terra-600' : 'text-neutral-400'}`} />
            <p className={`font-semibold text-sm ${selectedMethod === 'upi' ? 'text-terra-700' : 'text-neutral-600'}`}>UPI</p>
          </button>
        )}

        {qrCodeEnabled && (
          <button
            type="button"
            onClick={() => setSelectedMethod('qr_code')}
            disabled={disabled || isProcessing}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'qr_code'
                ? 'border-violet-500 bg-violet-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <QrCode className={`w-6 h-6 mx-auto mb-2 ${selectedMethod === 'qr_code' ? 'text-violet-600' : 'text-neutral-400'}`} />
            <p className={`font-semibold text-sm ${selectedMethod === 'qr_code' ? 'text-violet-700' : 'text-neutral-600'}`}>QR Code</p>
          </button>
        )}

        {cashEnabled && (
          <button
            type="button"
            onClick={() => setSelectedMethod('cash')}
            disabled={disabled || isProcessing}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === 'cash'
                ? 'border-terra-500 bg-terra-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Banknote className={`w-6 h-6 mx-auto mb-2 ${selectedMethod === 'cash' ? 'text-terra-600' : 'text-neutral-400'}`} />
            <p className={`font-semibold text-sm ${selectedMethod === 'cash' ? 'text-terra-700' : 'text-neutral-600'}`}>Cash</p>
          </button>
        )}
      </div>

      {/* Payment Method Details */}
      <AnimatePresence mode="wait">
        {/* Card Payment */}
        {selectedMethod === 'card' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isLoadingCards ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                <span className="ml-2 text-sm text-neutral-500">Loading saved cards...</span>
              </div>
            ) : savedCards.length > 0 && !useNewCard ? (
              /* Saved Cards Section */
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-700">Select a saved card</p>

                {savedCards.map((card) => (
                  <label
                    key={card.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCardId === card.id
                        ? 'border-terra-500 bg-terra-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedCard"
                      value={card.id}
                      checked={selectedCardId === card.id}
                      onChange={() => setSelectedCardId(card.id)}
                      className="w-4 h-4 text-terra-500 border-neutral-300 focus:ring-terra-500"
                    />
                    <img
                      src={CARD_BRAND_ICONS[card.card_brand.toLowerCase()] || CARD_BRAND_ICONS.visa}
                      alt={card.card_brand}
                      className="h-6 w-auto"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800">
                        •••• {card.card_last4}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Expires {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                      </p>
                    </div>
                    {card.is_default && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                  </label>
                ))}

                {/* CVV Input for selected card */}
                {selectedCardId && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Lock className="w-4 h-4 text-neutral-400" />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-20 px-3 py-2 text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500 focus:border-terra-500"
                    />
                    <span className="text-xs text-neutral-500">Enter the 3 or 4 digit code</span>
                  </div>
                )}

                {/* Use different card link */}
                <button
                  type="button"
                  onClick={() => setUseNewCard(true)}
                  className="flex items-center gap-2 text-sm text-terra-600 hover:text-terra-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Use a different card
                </button>
              </div>
            ) : (
              /* New Card Section */
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Secure Card Payment</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Enter your card details securely. We accept Visa, Mastercard, RuPay, and more.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save card checkbox */}
                <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={saveNewCard}
                    onChange={(e) => setSaveNewCard(e.target.checked)}
                    disabled={disabled || isProcessing}
                    className="w-4 h-4 text-terra-500 border-neutral-300 rounded focus:ring-terra-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Save card for future payments</p>
                    <p className="text-xs text-neutral-500">Securely stored by Razorpay</p>
                  </div>
                </label>

                {/* Show saved cards option if available */}
                {savedCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewCard(false);
                      if (!selectedCardId && savedCards.length > 0) {
                        const defaultCard = savedCards.find(c => c.is_default);
                        setSelectedCardId(defaultCard?.id || savedCards[0].id);
                      }
                    }}
                    className="text-sm text-terra-600 hover:text-terra-700 font-medium"
                  >
                    ← Use a saved card
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* UPI Payment */}
        {selectedMethod === 'upi' && (
          <motion.div
            key="upi"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">UPI Payment</p>
                  <p className="text-xs text-green-600 mt-1">
                    Pay using Google Pay, PhonePe, Paytm, or any UPI app.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 p-3 bg-neutral-50 rounded-lg">
              <img src="https://cdn.razorpay.com/app/googlepay.svg" alt="GPay" className="h-6" />
              <img src="https://cdn.razorpay.com/app/phonepe.svg" alt="PhonePe" className="h-6" />
              <img src="https://cdn.razorpay.com/app/paytm.svg" alt="Paytm" className="h-6" />
            </div>
          </motion.div>
        )}

        {/* QR Code Payment */}
        {selectedMethod === 'qr_code' && qrSettings?.qr_code_image && (
          <motion.div
            key="qr_code"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-violet-800">Scan & Pay via QR Code</p>
                  <p className="text-xs text-violet-600 mt-1">
                    Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-violet-100">
                <img
                  src={qrSettings.qr_code_image}
                  alt="Payment QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>

            {/* Instructions */}
            {qrSettings.qr_code_instructions && (
              <div className="p-3 bg-violet-50/50 rounded-lg">
                <p className="text-xs text-violet-700">{qrSettings.qr_code_instructions}</p>
              </div>
            )}

            {/* Payment Reference Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-violet-900">
                Enter Last 4 Digits of UTR/Transaction Number *
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPaymentReference(val);
                }}
                placeholder="e.g., 1234"
                maxLength={4}
                className="w-full px-4 py-3 border border-violet-200 rounded-lg text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
              <p className="text-xs text-violet-500">
                This helps us verify your payment. Find the UTR in your UPI app's transaction history.
              </p>
            </div>
          </motion.div>
        )}

        {/* Cash Payment */}
        {selectedMethod === 'cash' && (
          <motion.div
            key="cash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 rounded-xl border border-amber-200"
          >
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Pay at Hotel</p>
                <p className="text-xs text-amber-700">Booking confirmed. Pay during check-in.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount Display */}
      <div className="p-4 bg-neutral-100 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">Total</span>
          <span className="text-2xl font-bold text-neutral-900">{formatAmount(amount)}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || isProcessing || (selectedMethod === 'card' && !useNewCard && selectedCardId && !cvv) || (selectedMethod === 'qr_code' && paymentReference.length !== 4)}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          disabled || isProcessing || (selectedMethod === 'card' && !useNewCard && selectedCardId && !cvv) || (selectedMethod === 'qr_code' && paymentReference.length !== 4)
            ? 'bg-neutral-300 cursor-not-allowed'
            : selectedMethod === 'cash'
            ? 'bg-sage-600 hover:bg-sage-700 active:bg-sage-800'
            : selectedMethod === 'qr_code'
            ? 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'
            : 'bg-terra-500 hover:bg-terra-600 active:bg-terra-700'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : selectedMethod === 'cash' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Confirm Booking
          </>
        ) : selectedMethod === 'qr_code' ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Confirm Payment
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Pay {formatAmount(amount)}
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        Secured by Razorpay • 256-bit encryption
      </p>
    </div>
  );
}

export { CustomPaymentForm };
