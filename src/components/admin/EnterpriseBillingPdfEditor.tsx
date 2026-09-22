import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Plus, Trash2, Download, Printer, Save, CheckCircle2, 
  Building2, Calendar, DollarSign, Edit3, Eye, Search, Filter, RefreshCw, 
  Send, ShieldCheck, FileCheck, ArrowRight, Sparkles, Copy
} from 'lucide-react';
import { subscriptionBillingEngine, TenantSubscription } from '../../services/SubscriptionBillingEngine';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface EnterpriseInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  billingAddress: string;
  taxId: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: 'USD' | 'EUR' | 'BDT';
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE';
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate: number; // percentage e.g. 10
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  companyHeader: string;
  issuingAddress: string;
  bankDetails: string;
  signatureName: string;
  notes: string;
}

const DEFAULT_INVOICE_TEMPLATE: EnterpriseInvoice = {
  id: '',
  invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
  tenantId: 'tenant_1',
  tenantName: 'Sovereign Bank Corp',
  billingAddress: 'Sovereign Plaza, 14 Financial District, London, UK',
  taxId: 'GB992831411',
  poNumber: 'PO-SOV-9921',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  paymentTerms: 'Net 30',
  currency: 'USD',
  status: 'PENDING',
  items: [
    { id: '1', description: 'Enterprise Sovereign Tier Annual SaaS License', quantity: 1, unitPrice: 1499, amount: 1499 },
    { id: '2', description: 'Dedicated Isolated Database Replica Host', quantity: 1, unitPrice: 500, amount: 500 },
    { id: '3', description: 'Automated e-KYC Verification Volume Pack (25,000 calls)', quantity: 25000, unitPrice: 0.02, amount: 500 }
  ],
  subtotal: 2499,
  taxRate: 10,
  taxAmount: 249.9,
  discountAmount: 100,
  grandTotal: 2648.9,
  companyHeader: '9Xen Sovereign Regulatory Cloud Services',
  issuingAddress: '100 Silicon Tower, Financial Square, San Francisco CA 94105',
  bankDetails: 'Bank of America | IBAN: US91BOFA100293182 | SWIFT: BOFAUS3N',
  signatureName: 'Elena Rostova, Chief Revenue Officer',
  notes: 'Payment due within 30 days of issue date. Please reference invoice number in wire transfer details.'
};

export const EnterpriseBillingPdfEditor: React.FC = () => {
  const [invoices, setInvoices] = useState<EnterpriseInvoice[]>([]);
  const [tenants, setTenants] = useState<TenantSubscription[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<EnterpriseInvoice>(DEFAULT_INVOICE_TEMPLATE);
  const [viewMode, setViewMode] = useState<'LIST' | 'EDIT' | 'PREVIEW'>('EDIT');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const printRef = useRef<HTMLDivElement>(null);

  // Load Invoices & Tenants from backend database API
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/saas/billing/invoices');
      if (res.ok) {
        const data = await res.json();
        if (data.invoices) setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    try {
      const subs = subscriptionBillingEngine.getAllSubscriptions();
      setTenants(subs);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Calculate Subtotal and Grand Total whenever items/tax/discount change
  const recalculateInvoice = (inv: EnterpriseInvoice): EnterpriseInvoice => {
    const sub = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (sub * (inv.taxRate || 0)) / 100;
    const total = Math.max(0, sub + tax - (inv.discountAmount || 0));
    return {
      ...inv,
      subtotal: Math.round(sub * 100) / 100,
      taxAmount: Math.round(tax * 100) / 100,
      grandTotal: Math.round(total * 100) / 100
    };
  };

  // Line Item Handlers
  const handleItemChange = (id: string, field: keyof InvoiceLineItem, value: any) => {
    const updatedItems = activeInvoice.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
        }
        return updated;
      }
      return item;
    });
    setActiveInvoice(recalculateInvoice({ ...activeInvoice, items: updatedItems }));
  };

  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: Date.now().toString(),
      description: 'Custom Enterprise Line Item',
      quantity: 1,
      unitPrice: 100,
      amount: 100
    };
    setActiveInvoice(recalculateInvoice({
      ...activeInvoice,
      items: [...activeInvoice.items, newItem]
    }));
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = activeInvoice.items.filter(item => item.id !== id);
    setActiveInvoice(recalculateInvoice({ ...activeInvoice, items: updatedItems }));
  };

  // Preset Line Item Templates
  const addPresetItem = (presetType: string) => {
    let preset: InvoiceLineItem;
    if (presetType === 'KYC_OVERAGE') {
      preset = { id: Date.now().toString(), description: 'e-KYC Verification Volume Pack (10,000 calls)', quantity: 10000, unitPrice: 0.03, amount: 300 };
    } else if (presetType === 'AML_PACK') {
      preset = { id: Date.now().toString(), description: 'AI AML Real-time Screening Pack (50,000 checks)', quantity: 1, unitPrice: 250, amount: 250 };
    } else if (presetType === 'SLA_SUPPORT') {
      preset = { id: Date.now().toString(), description: '24/7 Enterprise SLA & Dedicated Technical Account Manager', quantity: 1, unitPrice: 400, amount: 400 };
    } else {
      preset = { id: Date.now().toString(), description: 'Custom Regulatory Compliance Audit', quantity: 1, unitPrice: 1000, amount: 1000 };
    }
    setActiveInvoice(recalculateInvoice({
      ...activeInvoice,
      items: [...activeInvoice.items, preset]
    }));
  };

  // Save Invoice to Database API
  const handleSaveInvoice = async () => {
    setLoading(true);
    try {
      const isNew = !activeInvoice.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/v1/saas/billing/invoices' : `/api/v1/saas/billing/invoices/${activeInvoice.id}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeInvoice)
      });

      if (res.ok) {
        const data = await res.json();
        setSaveStatus('Invoice saved successfully to database API!');
        if (data.invoice) {
          setActiveInvoice(data.invoice);
        }
        fetchInvoices();
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('Failed to save invoice.');
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Browser Printable PDF Document
  const handlePrintPdf = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${activeInvoice.invoiceNumber} - 9Xen Sovereign Regulatory Cloud</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { font-family: system-ui, sans-serif; padding: 20px; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 p-8">
          ${printContent.innerHTML}
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Select Tenant autofills address
  const handleSelectTenant = (tenantId: string) => {
    const found = tenants.find(t => t.tenantId === tenantId);
    if (found) {
      setActiveInvoice({
        ...activeInvoice,
        tenantId: found.tenantId,
        tenantName: found.tenantName,
        billingAddress: `${found.domain} | Enterprise Headquarters`
      });
    }
  };

  // Filtered list of invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.poNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-indigo-500/30">
            <FileText className="w-3 h-3 text-indigo-400" /> Enterprise Billing Engine
          </div>
          <h3 className="text-lg font-black text-white">Enterprise Invoice PDF Editor &amp; Database API</h3>
          <p className="text-xs text-slate-400">
            Design corporate PDF billing statements, custom line-item overages, Net-30 payment instructions, and official tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode('EDIT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'EDIT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" /> PDF Editor
          </button>
          <button
            onClick={() => setViewMode('PREVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'PREVIEW'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" /> Live PDF Preview
          </button>
          <button
            onClick={() => { setViewMode('LIST'); fetchInvoices(); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === 'LIST'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Invoice Records ({invoices.length})
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* VIEW MODE 1: EDIT FORM */}
      {viewMode === 'EDIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Invoice Form Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header & Tenant Information */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Tenant &amp; Invoice Header Details
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveInvoice(DEFAULT_INVOICE_TEMPLATE)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 font-bold bg-slate-100 dark:bg-slate-800 rounded-lg"
                  >
                    Reset Form
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Tenant</label>
                  <select
                    value={activeInvoice.tenantId}
                    onChange={(e) => handleSelectTenant(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {tenants.map(t => (
                      <option key={t.tenantId} value={t.tenantId}>{t.tenantName} ({t.domain})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={activeInvoice.invoiceNumber}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">PO / Reference Number</label>
                  <input
                    type="text"
                    value={activeInvoice.poNumber}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, poNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tenant Tax ID / VAT</label>
                  <input
                    type="text"
                    value={activeInvoice.taxId}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, taxId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Issue Date</label>
                  <input
                    type="date"
                    value={activeInvoice.invoiceDate}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={activeInvoice.dueDate}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
                  <select
                    value={activeInvoice.paymentTerms}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Status</label>
                  <select
                    value={activeInvoice.status}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Tenant Billing Address</label>
                <textarea
                  rows={2}
                  value={activeInvoice.billingAddress}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Dynamic Line Item Table Editor */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Line Items &amp; Metered Overages
                  </h4>
                  <p className="text-[11px] text-slate-500">Add custom license fees, usage overage tiers, and professional services.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>
              </div>

              {/* Quick Presets Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                <span className="font-bold text-slate-400 uppercase text-[9px] shrink-0">Quick Presets:</span>
                <button onClick={() => addPresetItem('KYC_OVERAGE')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 font-bold rounded-lg shrink-0">
                  + KYC Overage
                </button>
                <button onClick={() => addPresetItem('AML_PACK')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 font-bold rounded-lg shrink-0">
                  + AML Check Pack
                </button>
                <button onClick={() => addPresetItem('SLA_SUPPORT')} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 font-bold rounded-lg shrink-0">
                  + 24/7 SLA Support
                </button>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                {activeInvoice.items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Description #{index + 1}</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg font-medium border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2 font-mono font-bold text-right pr-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Amount</label>
                      <span className="text-slate-900 dark:text-white">${item.amount.toLocaleString()}</span>
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer mt-3"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Adjustments Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">VAT / Tax Rate (%)</label>
                  <input
                    type="number"
                    value={activeInvoice.taxRate}
                    onChange={(e) => setActiveInvoice(recalculateInvoice({ ...activeInvoice, taxRate: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Discount Amount ($ USD)</label>
                  <input
                    type="number"
                    value={activeInvoice.discountAmount}
                    onChange={(e) => setActiveInvoice(recalculateInvoice({ ...activeInvoice, discountAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 border rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Currency</label>
                  <select
                    value={activeInvoice.currency}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, currency: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Quick Summary */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Grand Total &amp; Actions
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${activeInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({activeInvoice.taxRate}%):</span>
                  <span>+${activeInvoice.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-${activeInvoice.discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${activeInvoice.grandTotal.toLocaleString()} {activeInvoice.currency}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-3">
                <button
                  onClick={handleSaveInvoice}
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Invoice to Database</span>
                </button>

                <button
                  onClick={handlePrintPdf}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Export PDF</span>
                </button>

                <button
                  onClick={() => setViewMode('PREVIEW')}
                  className="w-full py-2.5 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Letterhead Preview</span>
                </button>
              </div>
            </div>

            {/* Corporate Letterhead & Payment Customization */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs shadow-xs">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                Corporate Letterhead Setup
              </h4>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Header Title</label>
                <input
                  type="text"
                  value={activeInvoice.companyHeader}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, companyHeader: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Wiring Details</label>
                <input
                  type="text"
                  value={activeInvoice.bankDetails}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, bankDetails: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Authorized Signature Name &amp; Title</label>
                <input
                  type="text"
                  value={activeInvoice.signatureName}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, signatureName: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: LIVE PDF PREVIEW */}
      {viewMode === 'PREVIEW' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" /> A4 Printable Corporate PDF Invoice Preview
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrintPdf}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" /> Print / Export PDF
              </button>
              <button
                onClick={() => setViewMode('EDIT')}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Back to Editor
              </button>
            </div>
          </div>

          {/* Printable Letterhead Document Box */}
          <div className="flex justify-center p-2 sm:p-6 bg-slate-200/80 dark:bg-slate-950 rounded-2xl overflow-x-auto">
            <div
              ref={printRef}
              className="w-full max-w-3xl bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-xl space-y-8 font-sans border border-slate-200"
            >
              {/* Document Header / Company Logo */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">{activeInvoice.companyHeader}</h1>
                  <p className="text-xs text-slate-500 mt-1">{activeInvoice.issuingAddress}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">VAT Reg: EU992812001 | Tax ID: 94-8192031</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-700 uppercase tracking-wider">INVOICE</div>
                  <div className="text-sm font-mono font-bold text-slate-800 mt-1">{activeInvoice.invoiceNumber}</div>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black rounded uppercase mt-2 ${
                    activeInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeInvoice.status}
                  </span>
                </div>
              </div>

              {/* Bill To & Invoice Info */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <div className="font-bold uppercase text-[10px] text-slate-400 tracking-wider mb-1">Billed To Tenant:</div>
                  <div className="font-black text-sm text-slate-900">{activeInvoice.tenantName}</div>
                  <div className="text-slate-600 mt-1 whitespace-pre-line">{activeInvoice.billingAddress}</div>
                  {activeInvoice.taxId && <div className="font-mono text-slate-500 mt-1">Tax ID: {activeInvoice.taxId}</div>}
                </div>

                <div className="text-right space-y-1 font-mono">
                  <div><span className="text-slate-400 font-bold">Issue Date:</span> {activeInvoice.invoiceDate}</div>
                  <div><span className="text-slate-400 font-bold">Payment Due Date:</span> {activeInvoice.dueDate}</div>
                  <div><span className="text-slate-400 font-bold">Payment Terms:</span> {activeInvoice.paymentTerms}</div>
                  {activeInvoice.poNumber && <div><span className="text-slate-400 font-bold">PO #:</span> {activeInvoice.poNumber}</div>}
                </div>
              </div>

              {/* Printable Line Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>${activeInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax ({activeInvoice.taxRate}%):</span>
                    <span>+${activeInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  {activeInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-${activeInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-indigo-700">${activeInvoice.grandTotal.toFixed(2)} {activeInvoice.currency}</span>
                  </div>
                </div>
              </div>

              {/* Bank Details & Signature Footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 items-end text-xs">
                <div>
                  <div className="font-bold text-slate-900 mb-1">Payment Wire Instructions:</div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700">
                    {activeInvoice.bankDetails}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">{activeInvoice.notes}</p>
                </div>

                <div className="text-right space-y-3">
                  <div className="inline-block p-2 border-2 border-emerald-600 rounded-lg text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50">
                    Official Sovereign Cloud Digital Stamp
                  </div>
                  <div className="border-b border-slate-400 w-48 ml-auto"></div>
                  <div className="font-bold text-slate-900">{activeInvoice.signatureName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: INVOICE RECORDS DATABASE LIST */}
      {viewMode === 'LIST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" /> Enterprise Invoices Database
            </h4>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search invoice #, tenant, PO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Tenant Name</th>
                  <th className="p-3">Issue / Due Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="p-3 font-bold">{inv.tenantName}</td>
                    <td className="p-3 font-mono text-slate-500">{inv.invoiceDate} / {inv.dueDate}</td>
                    <td className="p-3 font-mono font-bold">${inv.grandTotal.toLocaleString()} {inv.currency}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => { setActiveInvoice(inv); setViewMode('PREVIEW'); }}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg cursor-pointer"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() => { setActiveInvoice(inv); setViewMode('EDIT'); }}
                        className="px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
