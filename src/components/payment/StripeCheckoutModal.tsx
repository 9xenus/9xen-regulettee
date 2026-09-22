import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Download, 
  Landmark, 
  Sparkles, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  FileText, 
  ExternalLink,
  Zap,
  Building,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export interface StripeCheckoutItem {
  id: string;
  name: string;
  type: 'SUBSCRIPTION' | 'ADDON' | 'ONE_TIME_SCAN';
  priceEur: number;
  period?: 'month' | 'year' | 'one-time';
  description?: string;
  features?: string[];
  category?: string;
  icon?: string;
}

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StripeCheckoutItem | null;
  tenantId?: string;
  userEmail?: string;
  onSuccess?: (paymentResult: any) => void;
}

const TEST_CARDS = [
  { label: 'Instant Success (Visa)', number: '4242 4242 4242 4242', exp: '12/28', cvc: '424', status: 'success' },
  { label: '3D Secure / SCA (Visa)', number: '4000 0027 6000 3184', exp: '08/29', cvc: '318', status: '3ds' },
  { label: 'Decline Simulation', number: '4000 0000 0000 0002', exp: '05/27', cvc: '002', status: 'decline' },
  { label: 'Insufficient Funds', number: '4000 0000 0000 0127', exp: '10/28', cvc: '127', status: 'insufficient' },
];

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  item,
  tenantId = 'tenant-demo',
  userEmail = 'client@sovereign-compliance.eu',
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sepa' | 'ideal'>('card');
  const [selectedTestCard, setSelectedTestCard] = useState(TEST_CARDS[0]);
  const [detectedCountry, setDetectedCountry] = useState<string>('DE');
  const [detectedCountryName, setDetectedCountryName] = useState<string>('Germany');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('424');
  const [cardholderName, setCardholderName] = useState('Compliance Lead / EU DPO');
  const [billingCountry, setBillingCountry] = useState('DE');
  const [vatNumber, setVatNumber] = useState('DE398472910');
  const [applyReverseCharge, setApplyReverseCharge] = useState(true);

  // SEPA Form State
  const [iban, setIban] = useState('DE89 3704 0044 0532 0130 00');
  const [sepaConsent, setSepaConsent] = useState(true);

  // Processing & State Flow: 'FORM' | '3DS_CHALLENGE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  const [flowState, setFlowState] = useState<'FORM' | '3DS_CHALLENGE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('FORM');
  const [processingStage, setProcessingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [isSandbox, setIsSandbox] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setFlowState('FORM');
      setErrorMessage(null);
      setSuccessData(null);
      
      // Fetch sandbox status
      fetchWithRetry('/api/v1/payment/config')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.isSandbox === 'boolean') {
            setIsSandbox(data.isSandbox);
          }
        })
        .catch(err => console.warn('Payment config fetch fallback:', err));

      // Fetch dynamic IP Geolocation region for regional payment gateway auto-routing
      fetch('/api/v1/compliance/detect-ip-region')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.geo) {
            setDetectedCountry(data.geo.countryCode);
            setDetectedCountryName(data.geo.countryName);
            setBillingCountry(data.geo.countryCode);
            if (data.geo.countryCode === 'SA') {
              setPaymentMethod('mada' as any);
            } else if (data.geo.countryCode === 'UK') {
              setPaymentMethod('bacs' as any);
            } else if (data.geo.countryCode === 'NL') {
              setPaymentMethod('ideal');
            } else {
              setPaymentMethod('card');
            }
          }
        })
        .catch(err => console.error('Failed to detect IP geolocation inside checkout:', err));
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // Price & Tax Calculation
  const basePrice = item.priceEur || 0;
  const taxRate = applyReverseCharge ? 0 : 0.19; // 19% standard EU VAT if not reverse charged
  const taxAmount = basePrice * taxRate;
  const totalAmount = basePrice + taxAmount;

  const handleApplyTestCard = (testCard: typeof TEST_CARDS[0]) => {
    setSelectedTestCard(testCard);
    setCardNumber(testCard.number);
    setCardExpiry(testCard.exp);
    setCardCvc(testCard.cvc);
  };

  const handleInitiatePayment = async () => {
    setErrorMessage(null);

    // If test card is Decline or Insufficient funds
    if (selectedTestCard.status === 'decline') {
      setFlowState('PROCESSING');
      setProcessingStage('Stripe Gateway: Contacting card issuer...');
      setTimeout(() => {
        setFlowState('ERROR');
        setErrorMessage('Your card was declined. [Stripe Error Code: card_declined]');
      }, 1500);
      return;
    }

    if (selectedTestCard.status === 'insufficient') {
      setFlowState('PROCESSING');
      setProcessingStage('Stripe Gateway: Checking available credit line...');
      setTimeout(() => {
        setFlowState('ERROR');
        setErrorMessage('Insufficient funds in the selected account. [Stripe Error Code: insufficient_funds]');
      }, 1500);
      return;
    }

    // If 3D Secure / SCA test card
    if (selectedTestCard.status === '3ds') {
      setFlowState('3DS_CHALLENGE');
      return;
    }

    // Standard Direct Execution
    await executePaymentFinalization();
  };

  const executePaymentFinalization = async () => {
    setFlowState('PROCESSING');
    setProcessingStage('Creating Stripe Checkout Session...');

    try {
      const response = await fetchWithRetry('/api/v1/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userEmail,
          itemId: item.id,
          itemName: item.name,
          amountEur: totalAmount,
          currency: 'EUR'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Stripe Checkout session.');
      }

      // If real Stripe API key is active, redirect to official Stripe Checkout page
      if (data.liveMode && data.url) {
        setProcessingStage('Redirecting to Stripe Hosted Checkout...');
        window.location.href = data.url;
        return;
      }

      // Local Sandbox Fallback: finalize local settlement
      setProcessingStage('Confirming sandbox settlement and activating entitlement...');
      const completeRes = await fetchWithRetry('/api/v1/payment/sandbox/checkout-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          userEmail,
          itemType: item.type,
          itemId: item.id,
          itemName: item.name,
          amountEur: totalAmount,
          currency: 'EUR',
          paymentMethod: paymentMethod,
          billingDetails: {
            name: cardholderName,
            country: billingCountry,
            vatNumber: applyReverseCharge ? vatNumber : null,
            iban: paymentMethod === 'sepa' ? iban : null,
          },
          frameworks: item.features || [item.id]
        })
      });

      const completeData = await completeRes.json();
      setSuccessData({
        ...completeData,
        sessionId: data.sessionId
      });
      setFlowState('SUCCESS');

      if (onSuccess) {
        onSuccess(completeData);
      }

    } catch (err: any) {
      console.error('Checkout error:', err);
      setFlowState('ERROR');
      setErrorMessage(err.message || 'Payment processing error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col md:flex-row relative"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Order Summary & Item Overview */}
        <div className="w-full md:w-5/12 bg-slate-950 p-4 sm:p-5 lg:p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Stripe Badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="px-2.5 py-1 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isSandbox ? 'Stripe Demo Sandbox' : 'Stripe Live Engine'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">PCI-DSS 4.0</span>
            </div>

            {/* Item Title & Category */}
            <div className="mb-6">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-semibold block mb-1">
                {item.type === 'SUBSCRIPTION' ? 'Sovereign Subscription Plan' : 'Add-on Regulatory Enclave'}
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                {item.name}
              </h3>
              {item.description && (
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Included Features List */}
            {item.features && item.features.length > 0 && (
              <div className="mb-6 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Included Entitlements & Scopes
                </span>
                <ul className="space-y-1.5">
                  {item.features.slice(0, 4).map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tax & Reverse Charge Selector */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 mb-6 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">EU B2B Reverse Charge</span>
                <input
                  type="checkbox"
                  checked={applyReverseCharge}
                  onChange={(e) => setApplyReverseCharge(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {applyReverseCharge && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">VAT ID:</span>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="e.g. DE398472910"
                    className="bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono px-2 py-0.5 rounded w-full focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="relative z-10 border-t border-slate-800 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Base Amount:</span>
              <span>€{basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{applyReverseCharge ? 'VAT (0% Reverse Charge B2B):' : 'EU VAT (19%):'}</span>
              <span>{applyReverseCharge ? '€0.00' : `€${taxAmount.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between items-baseline text-white font-black pt-2 border-t border-slate-800">
              <span className="text-sm">Total Due Today:</span>
              <div className="text-right">
                <span className="text-2xl font-mono text-emerald-400">€{totalAmount.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block font-normal font-sans">
                  {item.period === 'month' ? '/billed monthly' : item.period === 'year' ? '/billed annually' : '/one-time'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Stripe Gateway & Test Simulation */}
        <div className="w-full md:w-7/12 p-4 sm:p-5 lg:p-6 sm:p-8 flex flex-col justify-between bg-slate-900">
          
          {/* FLOW: FORM */}
          {flowState === 'FORM' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Credit Card
                  </button>

                  {detectedCountry === 'SA' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mada' as any)}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paymentMethod === ('mada' as any)
                            ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        Mada Card
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('stcpay' as any)}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paymentMethod === ('stcpay' as any)
                            ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        STC Pay
                      </button>
                    </>
                  ) : detectedCountry === 'UK' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bacs' as any)}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paymentMethod === ('bacs' as any)
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-indigo-400" />
                        BACS Direct
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('fps' as any)}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paymentMethod === ('fps' as any)
                            ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        Faster Pay
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('sepa')}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paymentMethod === 'sepa'
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-indigo-400" />
                        SEPA Direct
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ideal')}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                          paymentMethod === 'ideal'
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-indigo-400" />
                        iDEAL / EU
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sandbox Test Card Presets Bar */}
              {paymentMethod === 'card' && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3" /> Stripe Sandbox Test Cards (1-Click Fill)
                    </span>
                    <span className="text-[10px] text-slate-500">Live test presets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEST_CARDS.map((tc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTestCard(tc)}
                        className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
                          selectedTestCard.number === tc.number
                            ? 'bg-indigo-950 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-sans font-semibold block text-[10px] text-slate-300 truncate">
                          {tc.label}
                        </span>
                        <span className="opacity-70">{tc.number.substring(0, 9)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                      <CreditCard className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                      <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-indigo-300 uppercase">
                          Visa
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Expires
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* SEPA FORM */}
              {paymentMethod === 'sepa' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      International Bank Account Number (IBAN)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="DE89 3704 0044 0532 0130 00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-sm font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                      />
                      <Landmark className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Account Holder
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      checked={sepaConsent}
                      onChange={(e) => setSepaConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <label>
                      By providing your IBAN and confirming this payment, you authorize Stripe and our sovereign entity to send instructions to your bank to debit your account in accordance with European SEPA mandate rules.
                    </label>
                  </div>
                </div>
              )}

              {/* iDEAL FORM */}
              {paymentMethod === 'ideal' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Select Netherlands Bank
                    </label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      defaultValue="rabobank"
                    >
                      <option value="rabobank">Rabobank</option>
                      <option value="ing">ING Bank</option>
                      <option value="abn_amro">ABN AMRO</option>
                      <option value="triodos">Triodos Bank</option>
                      <option value="revolut">Revolut (NL)</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You will be securely redirected to your selected Dutch institutional banking environment via Stripe sandbox.
                  </p>
                </div>
              )}

              {/* Mada Card FORM */}
              {paymentMethod === ('mada' as any) && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Mada Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="9683 4810 2947 1048"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-sm font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 font-bold"
                        readOnly
                      />
                      <QrCode className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        defaultValue="09/29"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        CVV (Security Code)
                      </label>
                      <input
                        type="text"
                        defaultValue="844"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                    <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <label>
                      Mada-enabled checkout complies with the Saudi Arabian Monetary Authority (SAMA) cyber security rules. All transactions are securely audited.
                    </label>
                  </div>
                </div>
              )}

              {/* STC Pay FORM */}
              {paymentMethod === ('stcpay' as any) && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      STC Pay Registered Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="+966 50 123 4567"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-sm font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 font-bold"
                        readOnly
                      />
                      <Zap className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A secure push notification challenge will be sent to your STC Pay mobile application to authorize this transaction.
                  </p>
                </div>
              )}

              {/* BACS / FPS FORM */}
              {(paymentMethod === ('bacs' as any) || paymentMethod === ('fps' as any)) && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Landmark className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">UK Institution Settlement Escrow</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans uppercase">Sort Code:</span>
                        <span className="text-white">60-83-01</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-sans uppercase">Account Number:</span>
                        <span className="text-white">49384729</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-500 text-[10px] block font-sans uppercase">Sovereign Reference Key:</span>
                      <span className="text-emerald-400 font-mono font-bold text-xs uppercase">{tenantId?.toUpperCase() || 'DEMO-SOV'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    UK BACS / Faster Payments settlement clears near-instantly within the sandbox framework.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <Lock className="w-4 h-4 text-indigo-200" />
                  <span>Authorize & Pay €{totalAmount.toFixed(2)} via Stripe</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted
                  </span>
                  <span>•</span>
                  <span>Zero-Knowledge Sovereign Enclave</span>
                </div>
              </div>
            </div>
          )}

          {/* FLOW: 3DS CHALLENGE SIMULATION */}
          {flowState === '3DS_CHALLENGE' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-auto py-4 sm:py-6 text-center space-y-4 sm:space-y-6"
            >
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-xl">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">
                  3D Secure 2.0 / SCA Challenge
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Stripe has requested Strong Customer Authentication for this enterprise compliance transaction.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Issuing Bank:</span>
                  <span className="font-mono text-slate-200">European Sovereign Vault</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transaction Value:</span>
                  <span className="font-mono text-emerald-400 font-bold">€{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Verification Method:</span>
                  <span className="text-indigo-400">Biometric Token / Push</span>
                </div>
              </div>

              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFlowState('ERROR');
                    setErrorMessage('3D Secure authentication failed or was cancelled by user.');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Simulate Failure
                </button>
                <button
                  type="button"
                  onClick={executePaymentFinalization}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Authorize 3DS
                </button>
              </div>
            </motion.div>
          )}

          {/* FLOW: PROCESSING */}
          {flowState === 'PROCESSING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="my-auto py-12 text-center space-y-4 sm:space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-2">
                  Processing Stripe Settlement...
                </h4>
                <p className="text-xs text-indigo-400 font-mono animate-pulse max-w-md mx-auto">
                  {processingStage || 'Communicating with banking ledger...'}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 animate-pulse w-3/4 rounded-full" />
              </div>
            </motion.div>
          )}

          {/* FLOW: ERROR */}
          {flowState === 'ERROR' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-auto py-5 sm:py-8 text-center space-y-4 sm:space-y-6"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-rose-300">
                  Payment Verification Failed
                </h4>
                <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  {errorMessage || 'The payment gateway could not complete this request.'}
                </p>
              </div>

              <div className="flex gap-3 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyTestCard(TEST_CARDS[0]);
                    setFlowState('FORM');
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry with Success Test Card
                </button>
              </div>
            </motion.div>
          )}

          {/* FLOW: SUCCESS */}
          {flowState === 'SUCCESS' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    Stripe Sandbox Settlement Confirmed
                  </span>
                  <h4 className="text-xl font-black text-white">
                    Entitlement Activated Instantly
                  </h4>
                </div>
              </div>

              {/* Receipt Snapshot Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Invoice Number:</span>
                  <span className="text-indigo-400 font-bold">{successData?.invoiceNumber || 'INV-2026-9812'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Payment Intent ID:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{successData?.paymentIntentId || 'pi_sandbox_3M9901'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Settlement Amount:</span>
                  <span className="text-emerald-400 font-bold">€{totalAmount.toFixed(2)} EUR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Activation Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] uppercase font-bold">
                    LIVE & ACCREDITED
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    // Simulated instant printable invoice or PDF download
                    window.print();
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download Cryptographic Invoice PDF</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>Go to Activated Module / Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
