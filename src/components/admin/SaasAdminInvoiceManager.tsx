import React, { useState, useEffect } from 'react';
import { FileText, Download, Send, Plus, Trash2, Edit3, CheckCircle2, Loader2, X, Mail, DollarSign, Filter, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';
import { useNotification } from '../../context/NotificationContext';

export interface EnterpriseInvoice {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  tenantEmail: string;
  planName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatRate: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT';
  currency: string;
  notes?: string;
}

export const SaasAdminInvoiceManager: React.FC = () => {
  const { showToast } = useNotification();
  const [invoices, setInvoices] = useState<EnterpriseInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_admin_enterprise_invoices');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load admin invoices', e);
    }
    return [
      {
        id: 'inv_101',
        invoiceNumber: 'INV-2026-9001',
        tenantName: 'Bavarian Autonomous Data GmbH',
        tenantEmail: 'finance@bavarian-data.de',
        planName: 'Enterprise Sovereign CaaS',
        issueDate: '2026-08-01',
        dueDate: '2026-08-15',
        amount: 4999.00,
        vatRate: 19,
        status: 'PAID',
        currency: 'EUR',
        notes: 'TARGET2 SEPA Sovereign Escrow Settlement. Net 14.'
      },
      {
        id: 'inv_102',
        invoiceNumber: 'INV-2026-9002',
        tenantName: 'Helvetia Quantum AI AG',
        tenantEmail: 'billing@helvetia-quantum.ch',
        planName: 'Pro Compliance Tier',
        issueDate: '2026-08-05',
        dueDate: '2026-08-19',
        amount: 1299.00,
        vatRate: 20,
        status: 'PENDING',
        currency: 'EUR',
        notes: 'Includes AI Act Automated Pipeline Add-on.'
      },
      {
        id: 'inv_103',
        invoiceNumber: 'INV-2026-8940',
        tenantName: 'Nordic Cyber Defense Oy',
        tenantEmail: 'accounts@nordicdefense.fi',
        planName: 'Starter Compliance Tier',
        issueDate: '2026-07-15',
        dueDate: '2026-07-29',
        amount: 499.00,
        vatRate: 24,
        status: 'OVERDUE',
        currency: 'EUR',
        notes: 'Final reminder notice issued before enforcement escalation.'
      }
    ];
  });

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);

  const [currentInvoice, setCurrentInvoice] = useState<EnterpriseInvoice>({
    id: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantName: '',
    tenantEmail: '',
    planName: 'Enterprise Sovereign CaaS',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    amount: 1299.00,
    vatRate: 20,
    status: 'PENDING',
    currency: 'EUR',
    notes: 'Thank you for your enterprise subscription. Remit within 14 days.'
  });

  useEffect(() => {
    try {
      localStorage.setItem('9xen-regulettee_admin_enterprise_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to persist invoices', e);
    }
  }, [invoices]);

  const handleCreateNew = () => {
    setCurrentInvoice({
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantName: '',
      tenantEmail: '',
      planName: 'Enterprise Sovereign CaaS',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      amount: 1299.00,
      vatRate: 20,
      status: 'PENDING',
      currency: 'EUR',
      notes: 'Standard Net 14 Sovereign Escrow Invoicing Agreement.'
    });
    setIsEditing(true);
  };

  const handleEdit = (inv: EnterpriseInvoice) => {
    setCurrentInvoice(JSON.parse(JSON.stringify(inv)));
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice.tenantName || !currentInvoice.invoiceNumber) {
      showToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    const exists = invoices.some(i => i.id === currentInvoice.id);
    if (exists) {
      setInvoices(invoices.map(i => i.id === currentInvoice.id ? currentInvoice : i));
      showToast('Invoice updated successfully!', 'success');
    } else {
      setInvoices([currentInvoice, ...invoices]);
      showToast('New enterprise invoice created and logged!', 'success');
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this enterprise invoice?')) {
      setInvoices(invoices.filter(i => i.id !== id));
      setSelectedIds(selectedIds.filter(selId => selId !== id));
      showToast('Invoice deleted from ledger.', 'success');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadPDF = (inv: EnterpriseInvoice) => {
    const doc = new jsPDF() as any;
    const vatAmount = inv.amount * (inv.vatRate / 100);
    const totalAmount = inv.amount + vatAmount;

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('9XEN_REGULETTEE ENTERPRISE INVOICE', 14, 26);
    
    doc.setFontSize(10);
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 140, 20);
    doc.text(`Issue Date: ${inv.issueDate}`, 140, 26);
    doc.text(`Due Date: ${inv.dueDate}`, 140, 32);

    // Tenant info
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.text('Billed To Enterprise Tenant:', 14, 55);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(inv.tenantName, 14, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.tenantEmail, 14, 68);

    doc.text(`Status: ${inv.status}`, 150, 55);

    // Items table
    doc.autoTable({
      startY: 80,
      head: [['#', 'Subscription Plan / Service Description', 'Currency', 'Amount']],
      body: [
        ['1', `${inv.planName} (SaaS Subscription & Compliance License)`, inv.currency, `${inv.currency} ${inv.amount.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 10, cellPadding: 6 }
    });

    const finalY = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(10);
    doc.text(`Subtotal: ${inv.currency} ${inv.amount.toFixed(2)}`, 130, finalY);
    doc.text(`VAT (${inv.vatRate}%): ${inv.currency} ${vatAmount.toFixed(2)}`, 130, finalY + 7);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total Due: ${inv.currency} ${totalAmount.toFixed(2)}`, 130, finalY + 16);

    if (inv.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Notes: ${inv.notes}`, 14, finalY + 28);
    }

    doc.save(`${inv.invoiceNumber}.pdf`);
    showToast(`PDF generated and downloaded for ${inv.invoiceNumber}`, 'success');
  };

  const handleSendEmail = (inv: EnterpriseInvoice) => {
    setSendingId(inv.id);
    setTimeout(() => {
      setSendingId(null);
      showToast(`Invoice ${inv.invoiceNumber} successfully dispatched via SMTP to ${inv.tenantEmail}`, 'success');
    }, 1200);
  };

  // Bulk Actions
  const handleBatchDownloadZIP = async () => {
    if (selectedIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const zip = new JSZip();
      const selectedInvoices = invoices.filter(i => selectedIds.includes(i.id));

      for (const inv of selectedInvoices) {
        const doc = new jsPDF() as any;
        const vatAmount = inv.amount * (inv.vatRate / 100);
        const totalAmount = inv.amount + vatAmount;

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 42, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('9XEN_REGULETTEE ENTERPRISE INVOICE', 14, 26);
        
        doc.setFontSize(10);
        doc.text(`Invoice No: ${inv.invoiceNumber}`, 140, 20);
        doc.text(`Issue Date: ${inv.issueDate}`, 140, 26);
        doc.text(`Due Date: ${inv.dueDate}`, 140, 32);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(12);
        doc.text('Billed To Enterprise Tenant:', 14, 55);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(inv.tenantName, 14, 62);
        doc.setFont('helvetica', 'normal');
        doc.text(inv.tenantEmail, 14, 68);

        doc.autoTable({
          startY: 80,
          head: [['#', 'Subscription Plan / Service Description', 'Currency', 'Amount']],
          body: [
            ['1', `${inv.planName} (SaaS Subscription & Compliance License)`, inv.currency, `${inv.currency} ${inv.amount.toFixed(2)}`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [15, 23, 42] },
          styles: { fontSize: 10, cellPadding: 6 }
        });

        const finalY = doc.lastAutoTable.finalY + 12;
        doc.text(`Subtotal: ${inv.currency} ${inv.amount.toFixed(2)}`, 130, finalY);
        doc.text(`VAT (${inv.vatRate}%): ${inv.currency} ${vatAmount.toFixed(2)}`, 130, finalY + 7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Total Due: ${inv.currency} ${totalAmount.toFixed(2)}`, 130, finalY + 16);

        const pdfBlob = doc.output('blob');
        zip.file(`${inv.invoiceNumber}.pdf`, pdfBlob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `9Xen Regulettee_Enterprise_Invoices_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Batch ZIP archive generated with ${selectedInvoices.length} invoices!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate batch ZIP archive.', 'error');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchSendReminders = () => {
    if (selectedIds.length === 0) return;
    setIsBatchProcessing(true);
    setTimeout(() => {
      setIsBatchProcessing(false);
      showToast(`Batch email payment reminders successfully sent to ${selectedIds.length} enterprise tenants!`, 'success');
      setSelectedIds([]);
    }, 1500);
  };

  const handleBatchMarkPaid = () => {
    if (selectedIds.length === 0) return;
    setInvoices(invoices.map(inv => selectedIds.includes(inv.id) ? { ...inv, status: 'PAID' } : inv));
    showToast(`Successfully marked ${selectedIds.length} invoices as PAID!`, 'success');
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected invoices?`)) {
      setInvoices(invoices.filter(inv => !selectedIds.includes(inv.id)));
      setSelectedIds([]);
      showToast('Selected invoices deleted from ledger.', 'success');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = filterStatus === 'ALL' || inv.status === filterStatus;
    const matchesSearch = inv.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.tenantEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.amount * (1 + i.vatRate / 100), 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount * (1 + i.vatRate / 100), 0);
  const allFilteredSelected = filteredInvoices.length > 0 && filteredInvoices.every(i => selectedIds.includes(i.id));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top metrics bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Revenue (Paid)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">€{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Invoices</div>
          <div className="text-2xl font-black text-amber-600 mt-1">€{totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ledger Records</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{invoices.length} Invoices</div>
        </div>
      </div>

      {/* Control bar with quick status filter pills */}
      <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search tenant or invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Enterprise Invoice</span>
          </button>
        </div>

        {/* Quick status filter pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Filter Status:</span>
          {[
            { label: 'All Invoices', value: 'ALL', count: invoices.length },
            { label: 'Paid', value: 'PAID', count: invoices.filter(i => i.status === 'PAID').length },
            { label: 'Pending', value: 'PENDING', count: invoices.filter(i => i.status === 'PENDING').length },
            { label: 'Overdue', value: 'OVERDUE', count: invoices.filter(i => i.status === 'OVERDUE').length },
            { label: 'Draft', value: 'DRAFT', count: invoices.filter(i => i.status === 'DRAFT').length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.value
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                filterStatus === tab.value ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="px-2.5 py-1 bg-indigo-700 rounded-lg text-xs font-black">{selectedIds.length} Selected</span>
            <span>Enterprise invoices selected for batch execution</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBatchDownloadZIP}
              disabled={isBatchProcessing}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-indigo-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isBatchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download ZIP (.zip)</span>
            </button>
            <button
              onClick={handleBatchSendReminders}
              disabled={isBatchProcessing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Batch Reminders</span>
            </button>
            <button
              onClick={handleBatchMarkPaid}
              disabled={isBatchProcessing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark as Paid</span>
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={isBatchProcessing}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Invoices table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center justify-between">
          <span>SaaS Enterprise Invoicing & Subscription Ledger</span>
          <span className="text-slate-400">{filteredInvoices.length} records found</span>
        </div>
        <div className="divide-y divide-slate-200 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Enterprise Tenant</th>
                <th className="px-4 py-3">Plan / Tier</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((inv) => {
                const total = inv.amount * (1 + inv.vatRate / 100);
                const isSelected = selectedIds.includes(inv.id);
                return (
                  <tr key={inv.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(inv.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{inv.tenantName}</div>
                      <div className="text-xs text-slate-400">{inv.tenantEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{inv.planName}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{inv.issueDate}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{inv.currency} {total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(inv)}
                        title="Edit Invoice"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        title="Download PDF"
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendEmail(inv)}
                        disabled={sendingId === inv.id}
                        title="Dispatch via Email"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors inline-flex items-center disabled:opacity-50"
                      >
                        {sendingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        title="Delete"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-4 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>{invoices.some(i => i.id === currentInvoice.id) ? 'Edit Enterprise Invoice' : 'Create Enterprise Invoice'}</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={currentInvoice.invoiceNumber}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={currentInvoice.status}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Enterprise Tenant Name</label>
                  <input
                    type="text"
                    value={currentInvoice.tenantName}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, tenantName: e.target.value })}
                    placeholder="e.g. Bavarian Autonomous Data GmbH"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tenant Billing Email</label>
                  <input
                    type="email"
                    value={currentInvoice.tenantEmail}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, tenantEmail: e.target.value })}
                    placeholder="e.g. finance@tenant.eu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subscription Plan / Description</label>
                  <input
                    type="text"
                    value={currentInvoice.planName}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, planName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentInvoice.amount}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    value={currentInvoice.vatRate}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, vatRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Issue / Due Dates</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={currentInvoice.issueDate}
                      onChange={(e) => setCurrentInvoice({ ...currentInvoice, issueDate: e.target.value })}
                      className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                    <input
                      type="date"
                      value={currentInvoice.dueDate}
                      onChange={(e) => setCurrentInvoice({ ...currentInvoice, dueDate: e.target.value })}
                      className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Payment Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={currentInvoice.notes || ''}
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Save Enterprise Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
