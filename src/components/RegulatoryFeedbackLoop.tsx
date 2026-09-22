import { fetchWithRetry } from '../lib/api-client';
import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Search, Clock, FileText, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Region } from '../lib/types';

export const RegulatoryFeedbackLoop: React.FC = () => {
  const [tenantId, setTenantId] = useState('tnt-corp-001');
  const [region, setRegion] = useState<Region>('EU');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [dueDate, setDueDate] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !tenantId) {
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          severity,
          status: 'todo',
          region,
          assigned_to: 'Compliance Officer',
          due_date: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          regulator_notes: `Flagged via ${region} Regulatory Feedback Loop`,
          tenant_id: tenantId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch task');
      
      setStatusMsg({ type: 'success', text: `Regional compliance gap task successfully dispatched to tenant ${tenantId} in ${region}.` });
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const regions: Region[] = ['EU', 'USA', 'AUSTRALIA', 'NEW_ZEALAND', 'APAC'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 md:p-8 shadow-sm text-left">
      <div className="flex items-start gap-4 mb-8">
        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Regional Regulatory Feedback Loop</h2>
          <p className="text-sm text-slate-500 mt-1">
            Directly flag compliance gaps to a tenant's internal task management system with regional jurisdiction context.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Target Tenant ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                placeholder="e.g. tnt-corp-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Jurisdiction Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            >
              <option value="Critical">Critical (Immediate Action)</option>
              <option value="High">High (7 Days)</option>
              <option value="Medium">Medium (30 Days)</option>
              <option value="Low">Low (Quarterly)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" /> Issue Title
          </label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            placeholder="e.g. Missing GDPR Article 28 DPA Clause"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Description & Regulatory Context
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            placeholder="Provide specific details about the gap and regulatory clauses violated..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" /> Deadline
            </label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex-1">
            {statusMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 text-sm font-medium ${statusMsg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}
              >
                {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {statusMsg.text}
              </motion.div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Dispatch Formal Task
          </button>
        </div>
      </form>
    </div>
  );
};
