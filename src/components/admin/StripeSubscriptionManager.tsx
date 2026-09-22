import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';

const stripePromise = loadStripe((typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_STRIPE_PUBLISHABLE_KEY) || 'pk_test_<preview>');

export const StripeSubscriptionManager: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [loading, setLoading] = useState(false);

  const plans = [
    { id: 'price_starter', name: 'Starter Plan', price: '€499' },
    { id: 'price_pro', name: 'Pro Enterprise', price: '€1,299' },
    { id: 'price_sovereign', name: 'Sovereign Enterprise', price: '€4,999' },
  ];

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/stripe/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, priceId }),
      });
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await (stripe as any).redirectToCheckout({ sessionId });
        if (error) console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <CreditCard className="w-5 h-5 text-indigo-600 mr-2" />
        Sovereign Stripe Billing Portal
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="font-bold text-slate-800 mb-1">{plan.name}</div>
            <div className="text-xl font-black text-indigo-600 mb-3">{plan.price}<span className="text-xs text-slate-500 font-medium">/mo</span></div>
            <button 
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : `Select ${plan.name.split(' ')[0]}`}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] text-slate-400 italic">
        * Admin-initiated checkout will redirect to secure Stripe portal for final payment method verification.
      </p>
    </div>
  );
};
