import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Trash2, Star, Loader2, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { savedCardsService, CardVerificationOrderResponse } from '@/api/services/saved-cards.service';
import type { SavedCard } from '@/types/saved-card.types';
import { getCardBrandName } from '@/types/saved-card.types';
import CardBrandIcon from '@/components/ui/CardBrandIcon';
import { useAuth } from '@/hooks/useAuth';

// Load Razorpay script
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
};

export function PaymentsTab() {
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'loading' | 'checkout' | 'saving'>('idle');

  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    try {
      setIsLoading(true);
      const response = await savedCardsService.getCards();
      const cards = response?.cards || [];
      setSavedCards(cards);
    } catch (error) {
      console.error('Failed to load saved cards:', error);
      setSavedCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = useCallback(async () => {
    setIsAddingCard(true);
    setVerificationStep('loading');

    try {
      // Step 1: Load Razorpay script
      await loadRazorpayScript();

      // Step 2: Create verification order
      const order: CardVerificationOrderResponse = await savedCardsService.createVerificationOrder();

      console.log('Verification order created:', order);

      if (!order.key_id) {
        throw new Error('Missing Razorpay key in order response');
      }

      setVerificationStep('checkout');

      // Step 3: Open Razorpay Checkout (Card only)
      const razorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Glimmora',
        description: order.description,
        order_id: order.order_id,
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#A57865',
        },
        // Restrict to card payments only
        method: {
          card: true,
          upi: false,
          netbanking: false,
          wallet: false,
          paylater: false,
          emi: false,
        },
        modal: {
          backdropclose: false,
          escape: false,
          confirm_close: true,
          ondismiss: () => {
            setIsAddingCard(false);
            setVerificationStep('idle');
            toast.error('Card verification cancelled');
          },
        },
        handler: async (response: any) => {
          setVerificationStep('saving');

          try {
            // Step 4: Save card from payment and auto-refund
            await savedCardsService.saveCardFromPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              save_card: true,
              is_default: savedCards.length === 0,
              auto_refund: true,
            });

            toast.success('Card added successfully!');
            await loadSavedCards();
          } catch (error: any) {
            console.error('Failed to save card:', error);
            toast.error(error?.response?.data?.detail || 'Failed to save card');
          } finally {
            setIsAddingCard(false);
            setVerificationStep('idle');
          }
        },
      };

      console.log('Razorpay options:', razorpayOptions);

      const razorpay = new (window as any).Razorpay(razorpayOptions);

      razorpay.on('payment.failed', (response: any) => {
        setIsAddingCard(false);
        setVerificationStep('idle');
        toast.error(response.error?.description || 'Card verification failed');
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Failed to start card verification:', error);
      toast.error(error?.response?.data?.detail || error?.message || 'Failed to start card verification');
      setIsAddingCard(false);
      setVerificationStep('idle');
    }
  }, [user, savedCards.length]);

  const handleSetDefault = async (cardId: number) => {
    try {
      await savedCardsService.setDefaultCard(cardId);
      await loadSavedCards();
      toast.success('Default card updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update');
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    const card = savedCards.find(c => c.id === cardId);
    if (card?.is_default && savedCards.length > 1) {
      toast.error('Set another card as default first');
      return;
    }

    if (confirm('Remove this card?')) {
      try {
        await savedCardsService.deleteCard(cardId);
        await loadSavedCards();
        toast.success('Card removed');
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || 'Failed to remove');
      }
    }
  };

  // Filter to show only tokenized cards
  const tokenizedCards = savedCards.filter(card => card.has_token);
  const nonTokenizedCards = savedCards.filter(card => !card.has_token);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Saved Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-neutral-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-neutral-900">Saved Cards</h3>
          <button
            onClick={handleAddCard}
            disabled={isAddingCard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingCard ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {verificationStep === 'loading' && 'Preparing...'}
                {verificationStep === 'checkout' && 'Verifying...'}
                {verificationStep === 'saving' && 'Saving...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Card
              </>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <>
            {/* Tokenized Cards List */}
            {tokenizedCards.length > 0 && (
              <div className="space-y-3 mb-5">
                {tokenizedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      card.is_expired
                        ? 'border-red-200 bg-red-50'
                        : card.is_default
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 flex items-center justify-center">
                        <CardBrandIcon brand={card.card_brand} size="md" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 text-sm">
                            {getCardBrandName(card.card_brand)} •••• {card.card_last4}
                          </span>
                          {card.is_default && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-100 text-primary-700 rounded">
                              DEFAULT
                            </span>
                          )}
                          {card.is_expired && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 rounded">
                              EXPIRED
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">
                          {card.cardholder_name} • {card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year.toString().slice(-2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!card.is_default && !card.is_expired && (
                        <button
                          onClick={() => handleSetDefault(card.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Non-tokenized cards warning */}
            {nonTokenizedCards.length > 0 && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {nonTokenizedCards.length} card(s) need re-verification
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      These cards were saved without verification and can't be used for payments.
                      Please add them again using the "Add Card" button.
                    </p>
                    <div className="mt-2 space-y-1">
                      {nonTokenizedCards.map(card => (
                        <div key={card.id} className="flex items-center justify-between text-xs">
                          <span className="text-amber-800">
                            {getCardBrandName(card.card_brand)} •••• {card.card_last4}
                          </span>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-amber-700 hover:text-red-600 underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {savedCards.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-600 font-medium">No saved cards</p>
                <p className="text-sm text-neutral-500 mb-4">Add a card for faster checkout</p>
                <button
                  onClick={handleAddCard}
                  disabled={isAddingCard}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isAddingCard ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Your First Card
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Security Info */}
            {savedCards.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mt-4">
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Your cards are securely tokenized by Razorpay. We never store your full card number.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
