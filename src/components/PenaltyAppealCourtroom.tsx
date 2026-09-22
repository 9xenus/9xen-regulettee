import React, { useState } from 'react';
import { 
  Scale, 
  Gavel, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Upload, 
  Send, 
  Clock, 
  Building2, 
  Sparkles,
  ChevronRight,
  Download
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface AppealCase {
  id: string;
  entityName: string;
  supervisoryAuthority: string;
  initialFine: number;
  appealGround: string;
  status: 'Under Deliberation' | 'Brief Filed' | 'Mitigation Approved' | 'Hearing Scheduled';
  filedDate: string;
  projectedReduction: string;
}

const mockAppeals: AppealCase[] = [
  {
    id: 'APL-2026-089',
    entityName: 'VoxelAI Cognitive Robotics Oy',
    supervisoryAuthority: 'Finnish DPA (Tietosuojavaltuutettu)',
    initialFine: 1450000,
    appealGround: 'Absence of Systematic Risk & Post-Quantum Encryption Implemented Promptly',
    status: 'Under Deliberation',
    filedDate: '2026-08-25',
    projectedReduction: '-45% (€650,000 Saved)'
  },
  {
    id: 'APL-2026-092',
    entityName: 'Helios MedTech Labs GmbH',
    supervisoryAuthority: 'French CNIL',
    initialFine: 2800000,
    appealGround: 'Disproportionate Turnover Aggregation across Non-EU Parent Company',
    status: 'Hearing Scheduled',
    filedDate: '2026-08-30',
    projectedReduction: '-60% (€1,680,000 Saved)'
  }
];

export interface PenaltyAppealCourtroomProps {
  tenantContext?: any;
  [key: string]: any;
}

export const PenaltyAppealCourtroom: React.FC<PenaltyAppealCourtroomProps> = () => {
  const { showToast } = useNotification();
  const [cases, setCases] = useState<AppealCase[]>(mockAppeals);
  const [selectedCase, setSelectedCase] = useState<AppealCase>(mockAppeals[0]);
  const [newBriefText, setNewBriefText] = useState('');
  const [isFiling, setIsFiling] = useState(false);

  const handleFileBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBriefText.trim()) return;
    setIsFiling(true);
    setTimeout(() => {
      setIsFiling(false);
      showToast('Formal Supplementary Legal Defense Brief filed to the EU Supervisory Chamber.', 'success');
      setNewBriefText('');
    }, 600);
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">EU Regulatory Appeal &amp; Courtroom Hub</h3>
            <p className="text-xs text-slate-400">Administrative penalty contestation, CJEU case law alignment, and statutory mitigation defense.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-mono font-bold">
          eIDAS Legal Partner Gateway
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Appeal Docket */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Appeal Docket ({cases.length})
          </div>

          <div className="space-y-2.5">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedCase.id === c.id
                    ? 'bg-slate-950 border-emerald-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">{c.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {c.status}
                  </span>
                </div>
                <div className="font-bold text-sm text-white mt-1.5">{c.entityName}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Initial Fine: <strong className="text-red-400 font-mono">€{c.initialFine.toLocaleString()}</strong>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono font-medium">
                  {c.projectedReduction}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Selected Case Docket & Brief Submission */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-slate-400">Docket Reference: {selectedCase.id}</span>
                <h4 className="text-base font-bold text-white">{selectedCase.entityName} vs. {selectedCase.supervisoryAuthority}</h4>
              </div>
              <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg text-xs font-mono">
                Filed: {selectedCase.filedDate}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Contested Legal Grounds
              </div>
              <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                {selectedCase.appealGround}
              </p>
            </div>

            <form onSubmit={handleFileBrief} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  File Supplementary Judicial Brief / Evidence
                </label>
                <span className="text-[11px] text-indigo-400 font-mono">Quantum eIDAS Signed</span>
              </div>
              <textarea
                rows={3}
                placeholder="Insert argument references (e.g., CJEU Case C-311/18 Schrems II, EDPB Art. 83 mitigating criteria)..."
                value={newBriefText}
                onChange={(e) => setNewBriefText(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => showToast('Uploaded Cryptographic Immutable Audit Log as Evidence Exhibit A', 'info')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Evidence Hash</span>
                </button>

                <button
                  type="submit"
                  disabled={isFiling}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isFiling ? 'Transmitting to DPA Chamber...' : 'Transmit Brief to Court'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyAppealCourtroom;
