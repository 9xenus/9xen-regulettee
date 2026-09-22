import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  Send, 
  QrCode, 
  FileCheck2, 
  RefreshCw, 
  Building, 
  DollarSign, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  Globe2,
  Cpu,
  Hash
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

interface InvoiceClearance {
  id: string;
  invoice_reference: string;
  tax_authority_rail: string;
  seller_tax_id: string;
  buyer_tax_id: string;
  taxable_amount_cents: number;
  vat_amount_cents: number;
  currency: string;
  ecdsa_invoice_hash: string;
  qr_payload_tlv_base64: string;
  tax_clearance_status: string;
  tax_authority_csid_seal: string;
  cleared_at: string;
}

export const CtcEInvoicingGateway: React.FC = () => {
  const [clearances, setClearances] = useState<InvoiceClearance[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [invoiceRef, setInvoiceRef] = useState(`INV-CTC-${Date.now().toString().slice(-6)}`);
  const [taxRail, setTaxRail] = useState('SA_ZATCA_FATOORAH_P2');
  const [sellerTaxId, setSellerTaxId] = useState('310123456700003'); // ZATCA 15-digit or EU VAT
  const [buyerTaxId, setBuyerTaxId] = useState('300987654300003');
  const [taxableAmount, setTaxableAmount] = useState('4500.00');
  const [vatAmount, setVatAmount] = useState('675.00'); // 15% VAT for KSA or 20% for EU
  const [currency, setCurrency] = useState('SAR');

  const fetchClearances = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/ctc/invoices');
      const data = await res.json();
      if (data.success && Array.isArray(data.clearances)) {
        setClearances(data.clearances);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearances();
  }, []);

  const handleClearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/ctc/clear-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_reference: invoiceRef,
          tax_authority_rail: taxRail,
          seller_tax_id: sellerTaxId,
          buyer_tax_id: buyerTaxId,
          taxable_amount_cents: Math.round(parseFloat(taxableAmount || '0') * 100),
          vat_amount_cents: Math.round(parseFloat(vatAmount || '0') * 100),
          currency
        })
      });
      const data = await res.json();
      if (data.success) {
        setInvoiceRef(`INV-CTC-${Date.now().toString().slice(-6)}`);
        fetchClearances();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Continuous Transaction Controls (CTC) & Real-Time E-Invoicing
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                ZATCA & Peppol Clearance
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ECDSA-signed UBL 2.1 e-invoicing clearance with cryptographically sealed QR TLV barcodes and CSID validation.
            </p>
          </div>
        </div>

        <button
          onClick={fetchClearances}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Clearance Ledger</span>
        </button>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Invoice Real-Time Clearance Form */}
        <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              Transmit for Real-Time Tax Clearance
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              ECDSA Secp256k1
            </span>
          </div>

          <form onSubmit={handleClearanceSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Invoice Reference / UBL ID</label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tax Clearance Rail</label>
                <select
                  value={taxRail}
                  onChange={(e) => {
                    setTaxRail(e.target.value);
                    if (e.target.value.startsWith('SA_')) {
                      setCurrency('SAR');
                      setVatAmount((parseFloat(taxableAmount || '0') * 0.15).toFixed(2));
                    } else {
                      setCurrency('EUR');
                      setVatAmount((parseFloat(taxableAmount || '0') * 0.20).toFixed(2));
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="SA_ZATCA_FATOORAH_P2">Saudi ZATCA (Fatoorah Phase 2)</option>
                  <option value="EU_PEPPOL_BIS_30">Pan-EU Peppol (BIS Billing 3.0)</option>
                  <option value="FR_CHORUS_PRO">France Chorus Pro (Factur-X)</option>
                  <option value="IT_SDI_FATTURAPA">Italy SDI (FatturaPA XML)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="SAR">SAR (Saudi Riyal)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Seller Tax ID (VAT/TIN)</label>
                <input
                  type="text"
                  value={sellerTaxId}
                  onChange={(e) => setSellerTaxId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Buyer Tax ID (VAT/TIN)</label>
                <input
                  type="text"
                  value={buyerTaxId}
                  onChange={(e) => setBuyerTaxId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Taxable Net Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxableAmount}
                  onChange={(e) => {
                    setTaxableAmount(e.target.value);
                    const rate = taxRail.startsWith('SA_') ? 0.15 : 0.20;
                    setVatAmount((parseFloat(e.target.value || '0') * rate).toFixed(2));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">VAT Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={vatAmount}
                  onChange={(e) => setVatAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isSubmitting ? 'Clearing with Tax Portal...' : 'Sign & Submit for Sovereign Clearance'}</span>
            </button>
          </form>
        </div>

        {/* Right: Clearance History */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              Cleared B2G Invoices & CSID Seals ({clearances.length})
            </span>
            <span className="text-[11px] text-slate-500">Continuous Auditing Enforced</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {clearances.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No invoices cleared yet. Submit an invoice above to trigger the cryptographic clearance pipeline.
              </div>
            ) : (
              clearances.map((c) => (
                <div key={c.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-emerald-400 border border-emerald-900/40">
                        {c.invoice_reference}
                      </span>
                      <span className="text-xs font-bold text-white">{c.tax_authority_rail.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {c.tax_clearance_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Seller TIN</span>
                      <span className="text-slate-300">{c.seller_tax_id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Buyer TIN</span>
                      <span className="text-slate-300">{c.buyer_tax_id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Taxable Net</span>
                      <span className="text-slate-200 font-semibold">{c.currency} {(c.taxable_amount_cents / 100).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">VAT Total</span>
                      <span className="text-emerald-400 font-bold">{c.currency} {(c.vat_amount_cents / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800/60 space-y-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-slate-500 font-bold">ECDSA Invoice Hash:</span>
                      <span className="text-slate-300 truncate max-w-[280px]">{c.ecdsa_invoice_hash}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-slate-500 font-bold">Tax Authority CSID Seal:</span>
                      <span className="text-emerald-400 font-semibold truncate max-w-[280px]">{c.tax_authority_csid_seal}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/60">
                    <span className="text-slate-500 font-mono text-[10px]">
                      Cleared At: {new Date(c.cleared_at).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-emerald-400" />
                      TLV Base64 Embedded
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
