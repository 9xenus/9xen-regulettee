import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Shield, Sparkles, Send, CheckCircle2, 
  HelpCircle, AlertCircle, Clock, BookOpen, Search, 
  Scale, MessageSquare, PhoneCall, Mail, Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface DpoInquiry {
  id: string;
  submittedBy: string;
  topic: string;
  status: string;
  priority: string;
  question: string;
  answer: string;
  statutoryRef: string;
  responseSla: string;
}

export const DpoAdvisoryDesk: React.FC = () => {
  const [inquiries, setInquiries] = useState<DpoInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inquiry Form State
  const [topic, setTopic] = useState('Cross-Border Data Transfer & TIA');
  const [question, setQuestion] = useState('');
  const [submittedBy, setSubmittedBy] = useState('Compliance Lead');
  const [submitting, setSubmitting] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/privacy-suite/dpo/inquiries');
      const data = await res.json();
      if (data.success) setInquiries(data.inquiries);
    } catch (e) {
      console.error('Failed to fetch DPO inquiries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleAskDpo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/privacy-suite/dpo/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          question,
          submittedBy
        })
      });
      const data = await res.json();
      if (data.success) {
        setInquiries([data.inquiry, ...inquiries]);
        setQuestion('');
      }
    } catch (err) {
      console.error('Failed to submit DPO question', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GDPR Article 37-39 Mandatory DPO
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Certified EU DPO Appointed
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            External DPO as a Service & Legal Advisory Desk
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Dedicated certified Data Protection Officer (DPO) desk with instant AI statutory evaluation and rapid legal escalation.
          </p>
        </div>

        {/* DPO Profile Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            DR
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Dr. Robert Weber, LL.M.</span>
            <span className="text-[11px] text-slate-500">Certified EU DPO (CIPP/E, CIPM)</span>
            <span className="text-[10px] text-emerald-600 font-bold block">● On-Call SLA: &lt; 2 Hours</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Ask the DPO Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Submit Regulatory Inquiry
          </h3>
          <p className="text-xs text-slate-500">
            Ask any question regarding DPIA assessments, high-risk AI models, cross-border transfers, or vendor redlines.
          </p>

          <form onSubmit={handleAskDpo} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Inquiry Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-400 outline-none"
              >
                <option value="Cross-Border Data Transfer & TIA">Cross-Border Data Transfer & TIA</option>
                <option value="EU AI Act High-Risk Classification">EU AI Act High-Risk Classification</option>
                <option value="Data Protection Impact Assessment (DPIA)">Data Protection Impact Assessment (DPIA)</option>
                <option value="Vendor DPA & SCC Redline Review">Vendor DPA & SCC Redline Review</option>
                <option value="DSAR Complex Exemption (Art. 15)">DSAR Complex Exemption (Art. 15)</option>
                <option value="72h Breach Notification Feasibility">72h Breach Notification Feasibility</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Question / Scenario</label>
              <textarea
                rows={4}
                required
                placeholder="Detail your use case, tools involved, or regulatory uncertainty..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-indigo-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Evaluating Scenario...' : 'Submit to DPO Desk'}
            </button>
          </form>

          {/* Quick Authority Links */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Authoritative Case Law Sources</span>
            <div className="flex flex-wrap gap-1 text-[10px] font-medium text-indigo-700">
              <span className="px-2 py-0.5 bg-indigo-50 rounded">EDPB Guidelines</span>
              <span className="px-2 py-0.5 bg-indigo-50 rounded">CJEU Schrems II</span>
              <span className="px-2 py-0.5 bg-indigo-50 rounded">BfDI Germany</span>
              <span className="px-2 py-0.5 bg-indigo-50 rounded">CNIL France</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Inquiries Stream & Case Assessments */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            Advisory Dossiers & Legal Evaluations ({inquiries.length})
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {inq.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{inq.topic}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {inq.status} ({inq.responseSla})
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-400 text-[11px] block">Scenario Submitted:</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{inq.question}"
                  </p>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>DPO Legal Determination & Guidance</span>
                  </div>
                  <p className="text-indigo-950 font-medium leading-relaxed">
                    {inq.answer}
                  </p>
                  <span className="text-[10px] font-mono text-indigo-700 block pt-1 border-t border-indigo-200/60">
                    Statutory Authority: {inq.statutoryRef}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
