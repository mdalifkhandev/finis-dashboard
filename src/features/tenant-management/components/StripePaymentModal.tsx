import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, CreditCard, CheckCircle2, AlertCircle, Loader2, Calendar, Shield } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { config } from '@/config/env';
import type { SubscriptionPlanApi } from '../services/subscriptionApi';

const stripePromise = loadStripe(config.stripe.publishableKey);

const elementStyleOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#0f172a',
      fontFamily: 'inherit',
      lineHeight: '24px',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

interface CheckoutFormProps {
  plan: SubscriptionPlanApi;
  interval: 'monthly' | 'yearly';
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

function CheckoutForm({ plan, interval, email, onSuccess, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const price = interval === 'yearly' ? plan.priceYearly ?? 0 : plan.priceMonthly ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements) {
      setError('Stripe is still loading. Please try again in a moment.');
      return;
    }

    if (!password) {
      setError('Please enter your account password to verify your identity.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError('Card element not found.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Request in-app subscription and get clientSecret from backend
      const res = await fetch(`${config.apiBaseUrl}/subscription/create-in-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          planId: plan.id,
          interval,
        }),
      });

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to initiate subscription');
      }

      const { clientSecret, subscriptionId } = data.data;

      // Step 2: Confirm card payment with Stripe.js right inside the modal
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { email },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment confirmation failed');
      }

      // Step 3: Notify backend to sync subscription immediately
      await fetch(`${config.apiBaseUrl}/subscription/confirm-in-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      // Step 4: Show success animation and trigger update
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Payment processing failed. Please check card details.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">Payment Successful!</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your {plan.name} subscription is now active. Refreshing workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plan Summary */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Selected Plan</span>
          <h4 className="text-base font-black text-gray-900 mt-0.5">{plan.name} Plan</h4>
          <p className="text-xs text-gray-500">
            Billed {interval} • Cancel anytime
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-gray-900">${price}</span>
          <span className="text-[11px] font-semibold text-gray-400 block">/{interval === 'yearly' ? 'year' : 'month'}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Account Email</Label>
          <Input
            value={email}
            disabled
            className="mt-1 bg-gray-100/70 border-gray-200 text-gray-700 cursor-not-allowed text-sm h-10"
          />
        </div>

        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Account Password</Label>
          <Input
            type="password"
            placeholder="Enter password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="mt-1 text-sm h-10"
            required
          />
        </div>
      </div>

      {/* Separate Card Inputs */}
      <div className="space-y-3 pt-1">
        {/* Card Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Card Number</Label>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Secure Stripe
            </span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-[#1D4F6D] focus-within:ring-1 focus-within:ring-[#1D4F6D] transition-all flex items-center gap-2.5">
            <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="w-full">
              <CardNumberElement
                options={{
                  ...elementStyleOptions,
                  showIcon: true,
                  placeholder: '1234 5678 9012 3456',
                }}
              />
            </div>
          </div>
        </div>

        {/* Expiration Date and CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
              Expiration Date
            </Label>
            <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-[#1D4F6D] focus-within:ring-1 focus-within:ring-[#1D4F6D] transition-all flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="w-full">
                <CardExpiryElement
                  options={{
                    ...elementStyleOptions,
                    placeholder: 'MM / YY',
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">
              CVC / CVV
            </Label>
            <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-[#1D4F6D] focus-within:ring-1 focus-within:ring-[#1D4F6D] transition-all flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="w-full">
                <CardCvcElement
                  options={{
                    ...elementStyleOptions,
                    placeholder: 'CVC',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading || !stripe}
          className="w-full h-12 rounded-xl bg-[#1D4F6D] text-white hover:bg-[#153a50] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay ${price} & Subscribe
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-gray-400 mt-2.5 flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" /> Payments are encrypted and securely processed by Stripe.
        </p>
      </div>
    </form>
  );
}

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlanApi | null;
  interval: 'monthly' | 'yearly';
  email: string;
  onSuccess: () => void;
}

export function StripePaymentModal({
  isOpen,
  onClose,
  plan,
  interval,
  email,
  onSuccess,
}: StripePaymentModalProps) {
  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Checkout"
      maxWidth="md"
    >
      <Elements stripe={stripePromise}>
        <CheckoutForm
          plan={plan}
          interval={interval}
          email={email}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </Elements>
    </Modal>
  );
}
