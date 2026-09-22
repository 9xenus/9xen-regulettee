import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Activity, 
  Euro, 
  Globe, 
  ChevronRight, 
  RefreshCw, 
  Smartphone, 
  Key, 
  Lock, 
  BellRing,
  ShieldCheck,
  Send,
  Zap,
  Building2,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NexiConfig {
  merchantId: string;
  terminalId: string;
  apiKey: string;
  apiSecret: string;
  environment: 'TEST' | 'PRODUCTION';
  contractNumber: string;
  defaultCurrency: string;
  webhookSecret: string;
  enabledPaymentMethods: {
    bancomatPay: boolean;
    cbVisaMastercard: boolean;
    myBank: boolean;
    satispay: boolean;
    sepaInstant: boolean;
    appleGooglePay: boolean;
  };
  complianceSettlement: {
    psd2ScaEnforced: boolean;
    psd3EscrowDirect: boolean;
    italyEInvoicingSdi: boolean;
    doraTspAudited: boolean;
    gdprZeroRetentionPii: boolean;
  };
}

interface NexiOrder {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    fiscalCodeOrVat?: string;
    pecEmail?: string;
    sdiCode?: string;
  };
  paymentMethod: string;
  status: string;
  securityAttestation: {
    macSignature: string;
    scaExemptionType?: string;
    threeDSecureVersion: string;
    doraResilienceNode: string;
    sdiInvoiceReference?: string;
  };
  createdAt: string;
}

export const NexiGatewayConfigurator: React.FC = () => {
  const [config, setConfig] = useState<NexiConfig | null>(null);
  const [orders, setOrders] = useState<NexiOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Quick payment simulation state
  const [simAmount, setSimAmount] = useState<number>(3500);
  const [simName, setSimName] = useState<string>('Unicredit Enterprise IT SpA');
  const [simEmail, setSimEmail] = useState<string>('tesoreria@unicredit-group.it');
  const [simMethod, setSimMethod] = useState<'BANCOMAT_PAY' | 'MYBANK_SEPA' | 'SATISPAY' | 'CARDS_SCA'>('BANCOMAT_PAY');
  const [simVat, setSimVat] = useState<string>('IT00348170101');
  const [simSdi, setSimSdi] = useState<string>('UCR9921');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSuccessReceipt, setSimSuccessReceipt] = useState<any | null>(null);

  // Fetch Nexi config and order history
  const fetchNexiData = async () => {
    try {
      setIsLoading(true);
      const [cfgRes, ordRes] = await Promise.all([
        fetch('/api/v1/payments/nexi/config'),
        fetch('/api/v1/payments/nexi/orders')
      ]);
      const cfgData = await cfgRes.json();
      const ordData = await ordRes.json();
      if (cfgData.success) {
        setConfig(cfgData.config);
      }
      if (ordData.success) {
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      console.error('Failed to load Nexi data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNexiData();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/payments/nexi/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/v1/payments/nexi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('Nexi XPay configuration saved and verified with DORA resilience nodes.');
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch (err: any) {
      setSaveMessage('Error saving configuration: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimSuccessReceipt(null);
    try {
      const res = await fetch('/api/v1/payments/nexi/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: simAmount,
          currency: 'EUR',
          description: 'Autonomous Regulatory Fine Settlement & E-Invoicing Archive',
          customerInfo: {
            name: simName,
            email: simEmail,
            fiscalCodeOrVat: simVat,
            sdiCode: simSdi
          },
          paymentMethod: simMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimSuccessReceipt(data);
        fetchNexiData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Synchronizing with Nexi XPay Sovereign Clearing Rails...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/70 rounded-2xl border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-xs tracking-wider uppercase">
              Nexi XPay
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              European PayTech Leader (IT / DE / NORDICS / SEPA)
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            Nexi Sovereign Merchant Gateway Integration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliant with European Banking Authority PSD3, Italian Agenzia delle Entrate SDI e-Invoicing, and DORA Critical TSP guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Pinging Node...' : 'Test Cryptographic Ping'}
          </button>
        </div>
      </div>

      {/* Test Connection Output Alert */}
      {testResult && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border text-xs ${
            testResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{testResult.gateway} — {testResult.status} ({testResult.latencyMs}ms Latency)</span>
              </div>
              <p className="text-slate-600 font-mono">
                DORA Node: {testResult.nodeAttestation?.doraComplianceStatus} | MAC: {testResult.nodeAttestation?.macChecksum}
              </p>
              <div className="flex gap-2 mt-1">
                {testResult.nodeAttestation?.supportedProtocols?.map((p: string, idx: number) => (
                  <span key={idx} className="bg-emerald-100/80 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setTestResult(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-2"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {saveMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          {saveMessage}
        </div>
      )}

      {/* Main Grid: Config Form & Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Config Parameters */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Nexi XPay Credentials & Enclave Keys
            </h4>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              ENV: {config.environment}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Merchant Alias / ID
              </label>
              <input
                type="text"
                value={config.merchantId}
                onChange={(e) => setConfig({ ...config, merchantId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" /> Terminal ID (TID)
              </label>
              <input
                type="text"
                value={config.terminalId}
                onChange={(e) => setConfig({ ...config, terminalId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-400" /> Nexi API Key (XPay)
              </label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> MAC Secret / SHA-256 Key
              </label>
              <input
                type="password"
                value={config.apiSecret}
                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Enabled Payment Methods Matrix */}
          <div className="pt-2 border-t border-slate-100">
            <h5 className="text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-3 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              Pan-European Payment Methods Active on Terminal
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">BANCOMAT Pay® (Italy Mobile)</span>
                <input
                  type="checkbox"
                  checked={config.enabledPaymentMethods.bancomatPay}
                  onChange={(e) => setConfig({
                    ...config,
                    enabledPaymentMethods: { ...config.enabledPaymentMethods, bancomatPay: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">MyBank SEPA Instant Wire</span>
                <input
                  type="checkbox"
                  checked={config.enabledPaymentMethods.myBank}
                  onChange={(e) => setConfig({
                    ...config,
                    enabledPaymentMethods: { ...config.enabledPaymentMethods, myBank: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Satispay (Smart App Pay)</span>
                <input
                  type="checkbox"
                  checked={config.enabledPaymentMethods.satispay}
                  onChange={(e) => setConfig({
                    ...config,
                    enabledPaymentMethods: { ...config.enabledPaymentMethods, satispay: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Visa / Mastercard / CB 3DS2</span>
                <input
                  type="checkbox"
                  checked={config.enabledPaymentMethods.cbVisaMastercard}
                  onChange={(e) => setConfig({
                    ...config,
                    enabledPaymentMethods: { ...config.enabledPaymentMethods, cbVisaMastercard: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Statutory EU Compliance Checkbox Matrix */}
          <div className="pt-2 border-t border-slate-100">
            <h5 className="text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sovereign PSD3 & Tax Compliance Rules
            </h5>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.complianceSettlement.italyEInvoicingSdi}
                  onChange={(e) => setConfig({
                    ...config,
                    complianceSettlement: { ...config.complianceSettlement, italyEInvoicingSdi: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 font-medium">
                  <strong>Italian SDI e-Invoicing:</strong> Auto-transmit XML Fattura Elettronica to Agenzia delle Entrate on capture
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.complianceSettlement.psd2ScaEnforced}
                  onChange={(e) => setConfig({
                    ...config,
                    complianceSettlement: { ...config.complianceSettlement, psd2ScaEnforced: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 font-medium">
                  <strong>PSD2/PSD3 Strong Customer Authentication:</strong> Enforce 3DS 2.2 biometric challenges
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.complianceSettlement.doraTspAudited}
                  onChange={(e) => setConfig({
                    ...config,
                    complianceSettlement: { ...config.complianceSettlement, doraTspAudited: e.target.checked }
                  })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 font-medium">
                  <strong>DORA Compliance:</strong> Route through certified EU sovereign clearing nodes in Milan & Frankfurt
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {isSaving ? 'Synchronizing Rails...' : 'Save & Enforce Nexi Config'}
            </button>
          </div>
        </form>

        {/* Right Col: Instant Settlement Simulation & Real Orders */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Transaction Simulator */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Interactive Test Bench
              </span>
              <span className="text-xs text-slate-400 font-mono">XPay Instant Rail</span>
            </div>
            <h4 className="text-sm font-bold mb-1">Simulate Nexi Regulatory Settlement</h4>
            <p className="text-xs text-slate-400 mb-4">Test PSD3 authentication, SDI invoice stamping, and Bancomat Pay rails.</p>

            <form onSubmit={handleSimulatePayment} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Settlement Amount (€ EUR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">EUR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Payment Rail
                  </label>
                  <select
                    value={simMethod}
                    onChange={(e: any) => setSimMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="BANCOMAT_PAY">BANCOMAT Pay®</option>
                    <option value="MYBANK_SEPA">MyBank SEPA</option>
                    <option value="SATISPAY">Satispay Mobile</option>
                    <option value="CARDS_SCA">Eurocard (3DS2.2)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    SDI Codice Destinatario
                  </label>
                  <input
                    type="text"
                    value={simSdi}
                    onChange={(e) => setSimSdi(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Enterprise Client Name
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full mt-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isSimulating ? 'Executing Nexi Cryptographic MAC...' : 'Execute Sovereign Settlement'}
              </button>
            </form>

            {simSuccessReceipt && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3.5 bg-blue-950/60 border border-blue-500/40 rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Order Authorized & Captured
                  </span>
                  <span>€{simSuccessReceipt.order?.amount?.toLocaleString()}</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px]">
                  TX: {simSuccessReceipt.order?.transactionId}
                </p>
                <p className="text-slate-400 font-mono text-[10px] truncate">
                  MAC: {simSuccessReceipt.checkout?.mac}
                </p>
                {simSuccessReceipt.order?.securityAttestation?.sdiInvoiceReference && (
                  <div className="pt-1 text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    SDI Stamped: {simSuccessReceipt.order.securityAttestation.sdiInvoiceReference}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Live Nexi Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent Nexi Settled Orders ({orders.length})
              </h4>
              <button 
                onClick={fetchNexiData}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {orders.map((ord) => (
                <div key={ord.orderId} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{ord.customerInfo?.name}</span>
                    <span className="font-mono font-black text-blue-600">€{ord.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>{ord.paymentMethod} • {ord.orderId}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                      {ord.status}
                    </span>
                  </div>
                  {ord.securityAttestation?.sdiInvoiceReference && (
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                      <span>SDI: {ord.securityAttestation.sdiInvoiceReference}</span>
                      <span className="text-slate-400">{new Date(ord.createdAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexiGatewayConfigurator;
