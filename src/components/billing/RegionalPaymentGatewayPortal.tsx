import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Wallet, 
  Landmark, 
  RefreshCw, 
  CheckCircle, 
  Shield, 
  FileText, 
  ArrowRight, 
  Globe, 
  Info, 
  HelpCircle,
  Clock,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { useRegionalCompliance } from '../../context/RegionalComplianceContext';
import { RegionKey } from '../../services/regionalComplianceRulesEngine';

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  region: string;
  paymentMethod: string;
  timestamp: string;
  gateway: string;
  clearingReference: string;
  status: string;
  settlementMessage: string;
  zatcaCompliance?: {
    zatcaPhase2Cleared: boolean;
    invoiceHash: string;
    cryptographicStamp: string;
    vatRate: string;
    vatCalculated: number;
    totalSettledSar: number;
  };
  psd3Compliance?: {
    strongCustomerAuthentication: string;
    psd3ProtocolVersion: string;
    vatRate: string;
    vatCalculated: number;
    euEscrowVerified: boolean;
  };
  usCompliance?: {
    achRoutingVerified: boolean;
    regECompliant: boolean;
    ofacSanctionsChecked: boolean;
    ofacStatus: string;
  };
  uaeCompliance?: {
    vatRate: string;
    vatCalculated: number;
    uaeCentralBankCleared: boolean;
  };
  ukCompliance?: {
    vatRate: string;
    vatCalculated: number;
    fasterPaymentsApproved: boolean;
  };
  apacCompliance?: {
    masSovereignChecked: boolean;
    cbprApproved: boolean;
  };
}

export const RegionalPaymentGatewayPortal: React.FC<{
  baseAmountEur?: number;
  onPaymentSuccess?: (receipt: PaymentResult) => void;
  title?: string;
  subtitle?: string;
}> = ({ 
  baseAmountEur = 1299, 
  onPaymentSuccess,
  title = "Sovereign Multi-Gateway Payment Portal",
  subtitle = "Dynamic compliance-first regional settlement engine"
}) => {
  const { activeRegion, framework, allRegions, setActiveRegion } = useRegionalCompliance();
  
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [payerName, setPayerName] = useState<string>('Acme Regulatory Corp');
  const [payerEmail, setPayerEmail] = useState<string>('finance@acme-compliance.org');
  
  // Local card / account states
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [bankRouting, setBankRouting] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  
  // Loading & Result States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Convert Base EUR amount to Local Currency
  const localAmount = Math.round(baseAmountEur * framework.eurConversionRate);

  // Get available payment options depending on region
  const getRegionalPaymentOptions = (region: RegionKey) => {
    switch (region) {
      case 'KSA':
        return [
          { id: 'mada', name: 'mada National Debit Card', type: 'card', icon: CreditCard, subtitle: 'SAMA National Rail clearance', logo: '🇸🇦 mada' },
          { id: 'stcpay', name: 'STC Pay Digital Wallet', type: 'wallet', icon: Wallet, subtitle: 'Instant mobile validation', logo: 'stc pay' },
          { id: 'sepa_debit', name: 'ZATCA Escrow Wire', type: 'bank', icon: Landmark, subtitle: 'Corporate central account', logo: 'ZATCA Wire' }
        ];
      case 'EU':
        return [
          { id: 'nexi_xpay', name: 'Nexi XPay / BANCOMAT Pay®', type: 'card', icon: CreditCard, subtitle: 'Italian & Pan-EU Sovereign PayTech, SDI & DORA cleared', logo: '🇮🇹 Nexi' },
          { id: 'sepa_debit', name: 'SEPA Direct Debit / Instant Transfer', type: 'bank', icon: Landmark, subtitle: 'PSD3 & TARGET2 Instant Clearing', logo: '🇪🇺 SEPA' },
          { id: 'credit_card', name: 'Eurocard / CB Visa / Mastercard', type: 'card', icon: CreditCard, subtitle: 'SCA 3D-Secure authenticated', logo: 'Stripe EU' }
        ];
      case 'USA':
        return [
          { id: 'ach_wire', name: 'FedWire / ACH Direct Deposit', type: 'bank', icon: Landmark, subtitle: 'OFAC & Regulation E cleared', logo: 'FedWire ACH' },
          { id: 'credit_card', name: 'Corporate Credit Card', type: 'card', icon: CreditCard, subtitle: 'Stripe US SEC compliant', logo: 'Visa/MC' }
        ];
      case 'UAE':
        return [
          { id: 'mada', name: 'Moro Pay Gateway', type: 'wallet', icon: Wallet, subtitle: 'G42 Sovereign secure network', logo: '🇦🇪 Moro Pay' },
          { id: 'sepa_debit', name: 'CBUAE National Bank Transfer', type: 'bank', icon: Landmark, subtitle: 'Central Bank clearance rail', logo: 'CBUAE Wire' }
        ];
      case 'UK':
        return [
          { id: 'sepa_debit', name: 'UK Faster Payments / BACS', type: 'bank', icon: Landmark, subtitle: 'Real-time GBP direct clearing', logo: '🇬🇧 FPS' },
          { id: 'credit_card', name: 'UK Visa / Mastercard', type: 'card', icon: CreditCard, subtitle: 'FCA & SCA certified gateway', logo: 'Stripe UK' }
        ];
      case 'APAC':
        return [
          { id: 'stcpay', name: 'Singapore PayNow / FAST', type: 'wallet', icon: Wallet, subtitle: 'MAS sovereign instant rail', logo: 'PayNow FAST' },
          { id: 'grabpay', name: 'GrabPay Enterprise', type: 'wallet', icon: Wallet, subtitle: 'Regional digital wallet clearing', logo: 'GrabPay' },
          { id: 'sepa_debit', name: 'Cross-Border APAC Bank Wire', type: 'bank', icon: Landmark, subtitle: 'MAS sovereign currency corridor', logo: 'APAC Swift' }
        ];
      default:
        return [
          { id: 'credit_card', name: 'International Multi-Card Gateway', type: 'card', icon: CreditCard, subtitle: 'Automated regional tax proxy', logo: 'Stripe Global' },
          { id: 'sepa_debit', name: 'Swift Global Wire Transfer', type: 'bank', icon: Landmark, subtitle: 'Standard corporate invoice', logo: 'Swift Escrow' }
        ];
    }
  };

  const options = getRegionalPaymentOptions(activeRegion);

  // Select default payment option when region changes
  useEffect(() => {
    if (options.length > 0) {
      setPaymentMethod(options[0].id);
    }
    // Clear previous transaction results when switching regions
    setPaymentResult(null);
    setPaymentError(null);
  }, [activeRegion]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);
    setPaymentResult(null);

    try {
      const response = await fetch('/api/v1/regional-rules/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: localAmount,
          currency: framework.currency,
          region: activeRegion,
          paymentMethod,
          payerName,
          payerEmail,
          metadata: {
            cardNumber: paymentMethod === 'mada' || paymentMethod === 'credit_card' ? '**** **** **** ' + cardNumber.slice(-4) : undefined,
            mobileNumber: paymentMethod === 'stcpay' || paymentMethod === 'grabpay' ? mobileNumber : undefined,
            bankAccount: paymentMethod === 'sepa_debit' || paymentMethod === 'ach_wire' ? '**** ' + bankAccount.slice(-4) : undefined,
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPaymentResult(data);
        if (onPaymentSuccess) {
          onPaymentSuccess(data);
        }
      } else {
        setPaymentError(data.error || 'Gateway processing failed. Please check regional compliance standards.');
      }
    } catch (err: any) {
      setPaymentError('Network failure connecting to regional sovereign payment rails.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="regional-payment-gateway-portal" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header Banner */}
      <div className="bg-slate-900 px-5 py-6 sm:px-6 lg:px-8 text-white relative">
        <div className="absolute top-4 right-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Regionalized Rails Active</span>
        </div>
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <span>{framework.primaryFlag}</span>
          <span>{title}</span>
        </h3>
        <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Payment Configuration Options */}
        <div className="lg:col-span-7 p-5 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide">Detected registered jurisdiction</span>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <span>{framework.primaryFlag}</span>
                <span>{framework.displayName} ({activeRegion})</span>
              </div>
            </div>
            
            {/* Region quick switch within payment portal */}
            <div className="flex gap-1.5 flex-wrap">
              {(['EU', 'USA', 'KSA', 'UAE', 'UK', 'APAC'] as RegionKey[]).map((reg) => (
                <button
                  key={reg}
                  onClick={() => setActiveRegion(reg)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-md transition-all cursor-pointer border ${
                    activeRegion === reg 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-5">
            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">1. Select Sovereign Payment Channel</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(opt.id);
                        setPaymentResult(null);
                        setPaymentError(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-28 relative ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500/20' 
                          : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-600/10 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                          {opt.logo}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-bold text-slate-900 leading-tight">{opt.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-normal truncate">{opt.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Details */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">2. Payer & Secure Authorization Credentials</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Company / Authorized Payer Name</label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Billing Notification Email</label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Payment Method Fields */}
              <AnimatePresence mode="wait">
                {(paymentMethod === 'mada' || paymentMethod === 'credit_card' || paymentMethod === 'nexi_xpay') && (
                  <motion.div
                    key="card_fields"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100"
                  >
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CVV / Secure Pin</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </motion.div>
                )}

                {(paymentMethod === 'stcpay' || paymentMethod === 'grabpay') && (
                  <motion.div
                    key="wallet_fields"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 space-y-2"
                  >
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Registered Mobile Wallet Number</label>
                    <div className="flex gap-2">
                      <span className="bg-slate-200 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono font-bold flex items-center">
                        {activeRegion === 'KSA' ? '+966' : activeRegion === 'UAE' ? '+971' : '+65'}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="50 000 0000"
                        maxLength={12}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'sepa_debit' && (
                  <motion.div
                    key="bank_fields"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Corporate Bank BIC / SWIFT Code</label>
                      <input
                        type="text"
                        required
                        placeholder="DEUTDEDBXXX"
                        value={bankRouting}
                        onChange={(e) => setBankRouting(e.target.value.toUpperCase())}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">IBAN / Corporate Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="DE89 3704 0044 0532 0130 00"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value.toUpperCase())}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'ach_wire' && (
                  <motion.div
                    key="ach_fields"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">ABA Routing Transit Number</label>
                      <input
                        type="text"
                        required
                        maxLength={9}
                        placeholder="021000021"
                        value={bankRouting}
                        onChange={(e) => setBankRouting(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="123456789"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <span className="font-bold">Authorization Failure: </span>
                  {paymentError}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isProcessing 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100 active:scale-[0.98]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Clearing Payment with Sovereign Nodes...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Process {framework.currencySymbol}{localAmount.toLocaleString()} {framework.currency}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Note */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Cryptographically sealed & compliant with local sovereign data-privacy laws and Central Bank standards.</span>
          </div>
        </div>

        {/* Real-time Tax Calculation & Digital Compliance Receipt */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-8 bg-slate-50/60 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Order & Statutory Taxation Summary</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Calculated in compliance with the {framework.regionKey} regime</p>
            </div>

            {/* Visual Pricing breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Subscription Base Amount (EUR)</span>
                <span className="font-mono text-slate-700">€{baseAmountEur.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Sovereign Conversion Rate</span>
                <span className="font-mono text-slate-700">1 EUR = {framework.eurConversionRate} {framework.currency}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-100">
                <span className="text-slate-800 font-semibold">Subtotal ({framework.currency})</span>
                <span className="font-mono text-slate-800 font-bold">{framework.currencySymbol}{localAmount.toLocaleString()}.00</span>
              </div>

              {/* Dynamic VAT / Taxes */}
              <div className="flex justify-between items-center text-xs text-indigo-600 font-medium">
                <span className="flex items-center gap-1">
                  <span>Sovereign VAT / Sales Tax</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 rounded">
                    {activeRegion === 'KSA' ? '15%' : activeRegion === 'EU' ? '19%' : activeRegion === 'UK' ? '20%' : activeRegion === 'UAE' ? '5%' : '0%'}
                  </span>
                </span>
                <span className="font-mono">
                  {framework.currencySymbol}
                  {Math.round(localAmount * (activeRegion === 'KSA' ? 0.15 : activeRegion === 'EU' ? 0.19 : activeRegion === 'UK' ? 0.20 : activeRegion === 'UAE' ? 0.05 : 0)).toLocaleString()}.00
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-slate-200">
                <span className="text-slate-900 font-black uppercase text-[10px] tracking-wider">Total Sovereign Invoice</span>
                <span className="font-mono text-slate-900 font-black text-lg">
                  {framework.currencySymbol}
                  {Math.round(localAmount * (1 + (activeRegion === 'KSA' ? 0.15 : activeRegion === 'EU' ? 0.19 : activeRegion === 'UK' ? 0.20 : activeRegion === 'UAE' ? 0.05 : 0))).toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* Clearances Display */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Local Gateway Safeguards</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 font-medium truncate">
                    {activeRegion === 'EU' ? 'PSD3 SCA Valid' : activeRegion === 'KSA' ? 'ZATCA Clearance' : 'OFAC Screening'}
                  </span>
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 font-medium truncate">
                    {activeRegion === 'KSA' ? 'SAMA Approved' : 'PCI DSS Level 1'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Render Result Receipt Receipt if Cleared */}
          <AnimatePresence>
            {paymentResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 bg-emerald-950 text-emerald-300 rounded-xl p-4 border border-emerald-500/30 text-xs space-y-3 relative overflow-hidden shadow-lg"
              >
                {/* Confetti watermark decoration */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
                
                <div className="flex items-center gap-2 text-white font-bold">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="uppercase tracking-tight">Sovereign Transaction Cleared</span>
                </div>

                <div className="space-y-1.5 font-mono text-[10px] text-emerald-400/90 leading-tight">
                  <div><span className="text-white">Transaction Hash:</span> {paymentResult.transactionId}</div>
                  <div><span className="text-white">Gateway:</span> {paymentResult.gateway}</div>
                  <div><span className="text-white">Clearing Ref:</span> {paymentResult.clearingReference}</div>
                  <div><span className="text-white">Settlement Status:</span> {paymentResult.settlementMessage}</div>
                  
                  {/* ZATCA Phase 2 E-Invoice Specifics */}
                  {paymentResult.zatcaCompliance && (
                    <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 space-y-1 text-slate-300">
                      <div className="text-white font-bold uppercase text-[9px] tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <span>Saudi ZATCA Compliant E-Invoice</span>
                      </div>
                      <div>Invoice Hash: {paymentResult.zatcaCompliance.invoiceHash}</div>
                      <div className="truncate">Cryptographic Stamp: {paymentResult.zatcaCompliance.cryptographicStamp}</div>
                      <div>Total (incl. 15% VAT): SAR {paymentResult.zatcaCompliance.totalSettledSar.toLocaleString()}</div>
                    </div>
                  )}

                  {/* PSD3 Specifics */}
                  {paymentResult.psd3Compliance && (
                    <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 space-y-1 text-slate-300">
                      <div className="text-white font-bold uppercase text-[9px] tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>EU PSD3 Payment Protocol</span>
                      </div>
                      <div>SCA Status: {paymentResult.psd3Compliance.strongCustomerAuthentication}</div>
                      <div>Protocol Version: {paymentResult.psd3Compliance.psd3ProtocolVersion}</div>
                      <div>Sovereign Escrow Verified: {paymentResult.psd3Compliance.euEscrowVerified ? 'Yes' : 'No'}</div>
                    </div>
                  )}

                  {/* USA Specifics */}
                  {paymentResult.usCompliance && (
                    <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 space-y-1 text-slate-300">
                      <div className="text-white font-bold uppercase text-[9px] tracking-wider mb-1">
                        🇺🇸 US FED Clearing Attestation
                      </div>
                      <div>ACH Verified: {paymentResult.usCompliance.achRoutingVerified ? 'YES' : 'NO'}</div>
                      <div>OFAC Status: {paymentResult.usCompliance.ofacStatus} (Passed)</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] text-white/80 font-bold border-t border-emerald-500/20">
                  <span>Invoice & Audit Dossier Logged</span>
                  <button 
                    type="button"
                    onClick={() => {
                      const text = `9Xen Regulettee Sovereign Receipt\nTransaction: ${paymentResult.transactionId}\nAmount: ${paymentResult.amount} ${paymentResult.currency}\nCleared On: ${paymentResult.timestamp}\nReference: ${paymentResult.clearingReference}\nSovereign Nodes Verified.`;
                      const blob = new Blob([text], {type: 'text/plain'});
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Receipt_${paymentResult.transactionId}.txt`;
                      a.click();
                    }}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Download Receipt
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
