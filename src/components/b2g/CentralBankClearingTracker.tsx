import React, { useState, useEffect } from 'react';
import { Landmark, ArrowRight, CheckCircle2, Clock, Zap, RefreshCw, Send, Lock, ShieldCheck, FileText } from 'lucide-react';

interface ClearingRecord {
  id: string;
  invoice_id: string;
  clearing_rail: 'SWIFT_MX_ISO20022' | 'TARGET2_EURO' | 'KSA_SARIE' | 'UAE_FTS';
  origin_iban: string;
  beneficiary_iban: string;
  amount_cents: number;
  currency: string;
  settlement_status: 'INITIATED' | 'ESCROW_LOCKED' | 'CENTRAL_BANK_ROUTED' | 'SETTLED' | 'FAILED';
  swift_pacs_message: string;
  transaction_reference: string;
  last_updated_at: string;
}

export const CentralBankClearingTracker: React.FC = () => {
  const [clearingRail, setClearingRail] = useState<'SWIFT_MX_ISO20022' | 'TARGET2_EURO' | 'KSA_SARIE' | 'UAE_FTS'>('SWIFT_MX_ISO20022');
  const [amountEur, setAmountEur] = useState('2500');
  const [originIban, setOriginIban] = useState('DE89370400440532013000');
  const [beneficiaryIban, setBeneficiaryIban] = useState('DE12100100100008888888');
  const [isInitiating, setIsInitiating] = useState(false);
  const [history, setHistory] = useState<ClearingRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<ClearingRecord | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/b2g/settlement/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        if (data.history.length > 0 && !activeRecord) {
          setActiveRecord(data.history[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleInitiate = async () => {
    setIsInitiating(true);
    try {
      const res = await fetch('/api/v1/b2g/settlement/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearing_rail: clearingRail,
          amount_cents: parseFloat(amountEur || '0') * 100,
          origin_iban: originIban,
          beneficiary_iban: beneficiaryIban,
          currency: clearingRail === 'KSA_SARIE' ? 'SAR' : clearingRail === 'UAE_FTS' ? 'AED' : 'EUR'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveRecord(data.clearingRecord);
        await fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitiating(false);
    }
  };

  const handleTriggerWebhook = async (status: 'CENTRAL_BANK_ROUTED' | 'SETTLED') => {
    if (!activeRecord) return;
    try {
      const res = await fetch('/api/v1/b2g/settlement/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_reference: activeRecord.transaction_reference,
          settlement_status: status,
          central_bank_confirmation_code: `CONF-SAMA-${Date.now()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveRecord(prev => prev ? { ...prev, settlement_status: status } : null);
        await fetchHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Central Bank Real-Time Settlement & Clearing Rails</h3>
            <p className="text-xs text-slate-400">Direct integration with SWIFT MX (ISO 20022), TARGET2, KSA SARIE, and UAE FTS</p>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Transactions</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Initiate Regulatory Fine Settlement
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Central Bank Clearing Rail</label>
              <select
                value={clearingRail}
                onChange={e => setClearingRail(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="SWIFT_MX_ISO20022">SWIFT MX pacs.008.001.08 (Global ISO 20022)</option>
                <option value="TARGET2_EURO">TARGET2 Real-Time Gross Settlement (Eurosystem)</option>
                <option value="KSA_SARIE">Saudi Central Bank (SAMA SARIE Instant Settlement)</option>
                <option value="UAE_FTS">CBUAE Funds Transfer System (UAE Central Bank)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Fine / Penalty Amount</label>
              <input
                type="number"
                value={amountEur}
                onChange={e => setAmountEur(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Origin IBAN Account</label>
              <input
                type="text"
                value={originIban}
                onChange={e => setOriginIban(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Central Treasury IBAN</label>
              <input
                type="text"
                value={beneficiaryIban}
                onChange={e => setBeneficiaryIban(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleInitiate}
              disabled={isInitiating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isInitiating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isInitiating ? 'Locking Escrow & Routing ISO 20022...' : 'Dispatch ISO 20022 Settlement'}</span>
            </button>
          </div>
        </div>

        {/* Live Status & Message Viewer */}
        <div className="lg:col-span-7 space-y-4">
          {activeRecord ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Transaction Reference</span>
                  <span className="font-mono font-bold text-sm text-blue-400">{activeRecord.transaction_reference}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono inline-flex items-center gap-1.5 ${
                    activeRecord.settlement_status === 'SETTLED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    activeRecord.settlement_status === 'CENTRAL_BANK_ROUTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  }`}>
                    {activeRecord.settlement_status === 'SETTLED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{activeRecord.settlement_status}</span>
                  </span>
                </div>
              </div>

              {/* State Transition Flow */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500">Step 1</div>
                  <div className="text-emerald-400 font-bold">ESCROW LOCKED</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="text-center">
                  <div className="text-[10px] text-slate-500">Step 2</div>
                  <div className={activeRecord.settlement_status !== 'ESCROW_LOCKED' ? 'text-blue-400 font-bold' : 'text-slate-600'}>
                    CENTRAL BANK ROUTED
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="text-center">
                  <div className="text-[10px] text-slate-500">Step 3</div>
                  <div className={activeRecord.settlement_status === 'SETTLED' ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                    FINAL SETTLED
                  </div>
                </div>
              </div>

              {/* Webhook Callback Simulator */}
              {activeRecord.settlement_status !== 'SETTLED' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerWebhook('CENTRAL_BANK_ROUTED')}
                    className="flex-1 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Simulate Central Bank Routing
                  </button>
                  <button
                    onClick={() => handleTriggerWebhook('SETTLED')}
                    className="flex-1 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Clearing Settlement
                  </button>
                </div>
              )}

              {/* PACS.008 ISO 20022 XML Message */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>ISO 20022 pacs.008 XML Message</span>
                </h5>
                <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-blue-300 text-[10px] font-mono overflow-x-auto max-h-40">
                  {activeRecord.swift_pacs_message}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select or initiate a transaction above.
            </div>
          )}

          {/* Transaction History */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Ledger ({history.length})</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveRecord(item)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                    activeRecord?.id === item.id ? 'bg-slate-800 border-blue-500/50 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <span>{item.transaction_reference}</span>
                    <span className="text-[10px] text-slate-500 block">{item.clearing_rail}</span>
                  </div>
                  <span className="font-bold text-blue-400">{item.settlement_status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
