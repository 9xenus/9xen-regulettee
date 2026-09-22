import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Banknote, 
  Scale, 
  Gavel, 
  FileCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  MessageSquare,
  Plus,
  User,
  Clock,
  Search,
  Filter,
  Check,
  Trash2,
  FileText,
  X,
  Info,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CaseComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface RegulatoryCase {
  id: string;
  companyName: string;
  category: string;
  status: 'In Investigation' | 'Fine Levied' | 'Resolved' | 'Under Appeal' | 'New Case';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  caseOfficer: string;
  createdAt: string;
  updatedAt: string;
  fineAmount?: number;
  comments: CaseComment[];
}

const INITIAL_CASES: RegulatoryCase[] = [
  {
    id: "CASE-2026-001",
    companyName: "Global Finance Corp",
    category: "DORA Art. 14 (ICT Resilience Deficit)",
    status: "In Investigation",
    severity: "High",
    description: "Failure to establish secondary hot-standby nodes for core credit clearance pipelines in compliance with Digital Operational Resilience Act mandates.",
    caseOfficer: "M. Barnier (EU Lead Inspector)",
    createdAt: "2026-06-15T10:00:00Z",
    updatedAt: "2026-07-02T16:45:00Z",
    fineAmount: 0,
    comments: [
      {
        id: "c1",
        author: "M. Barnier",
        text: "Initial audit confirms primary disaster recovery replica in Frankfurt has a lag time of over 45 minutes. DORA requires near-instant sync.",
        timestamp: "2026-06-15T11:20:00Z"
      },
      {
        id: "c2",
        author: "Compliance Officer",
        text: "Requested failover logs and technical layout documentation from the tenant DPO.",
        timestamp: "2026-06-20T14:30:00Z"
      }
    ]
  },
  {
    id: "CASE-2026-002",
    companyName: "Tech Startup X",
    category: "GDPR Art. 32 (Exposed S3 Backups)",
    status: "Fine Levied",
    severity: "High",
    description: "Unauthenticated cloud storage bucket containing raw password hashes and unencrypted KYC documents left exposed to the public internet.",
    caseOfficer: "S. Jelinek (DPA France)",
    createdAt: "2026-05-10T09:15:00Z",
    updatedAt: "2026-06-28T11:00:00Z",
    fineAmount: 1500000,
    comments: [
      {
        id: "c3",
        author: "S. Jelinek",
        text: "Exposed database logs secured by third-party whitehat. Over 15,000 French data subjects compromised.",
        timestamp: "2026-05-10T10:00:00Z"
      },
      {
        id: "c4",
        author: "S. Jelinek",
        text: "Article 83 Fine Calculator estimated €1.5M penalty. Official notice dispatched and signed by the Board of Directors.",
        timestamp: "2026-06-28T11:00:00Z"
      }
    ]
  },
  {
    id: "CASE-2026-003",
    companyName: "Stark Industries GmbH",
    category: "EU AI Act Art. 52 (Unmarked Biometrics)",
    status: "Resolved",
    severity: "Medium",
    description: "Neuromorphic emotion recognition scanners active in testing facilities without clear disclosure tags or opt-in consent markers.",
    caseOfficer: "R. Müller (BfDI Germany)",
    createdAt: "2026-04-02T08:30:00Z",
    updatedAt: "2026-05-15T15:20:00Z",
    fineAmount: 0,
    comments: [
      {
        id: "c5",
        author: "R. Müller",
        text: "On-site inspection initiated following complaint by employee union regarding neural telemetry scanning.",
        timestamp: "2026-04-02T14:00:00Z"
      },
      {
        id: "c6",
        author: "R. Müller",
        text: "Remediation verified. Stark Industries deployed explicit visual opt-in banners and purged unconsented emotional vectors.",
        timestamp: "2026-05-15T15:20:00Z"
      }
    ]
  },
  {
    id: "CASE-2026-004",
    companyName: "Acme Corporation Europe",
    category: "GDPR Art. 13 (Obscure Privacy Policy)",
    status: "New Case",
    severity: "Low",
    description: "Privacy policy uses unnecessarily complex legalese and lacks clear description of cross-border data routing pipelines.",
    caseOfficer: "L. Dubois (DPA Belgium)",
    createdAt: "2026-06-29T14:15:00Z",
    updatedAt: "2026-07-02T09:00:00Z",
    fineAmount: 0,
    comments: [
      {
        id: "c7",
        author: "L. Dubois",
        text: "Flagged during routine sectorial inspection. Sent compliance warning letter to the DPO.",
        timestamp: "2026-06-29T14:30:00Z"
      }
    ]
  }
];

export const OversightModule: React.FC = () => {
  // State persistence for regulatory cases
  const [cases, setCases] = useState<RegulatoryCase[]>(() => {
    const saved = localStorage.getItem('platform_regulatory_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    const saved = localStorage.getItem('platform_regulatory_cases');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed[0].id;
    }
    return "CASE-2026-001";
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // New Case Form
  const [isRegistering, setIsRegistering] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('Global Finance Corp');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [newCategory, setNewCategory] = useState('GDPR Article 32 (Data Protection by Design)');
  const [newSeverity, setNewSeverity] = useState<'Low' | 'Medium' | 'High'>('High');
  const [newDescription, setNewDescription] = useState('');
  const [newCaseOfficer, setNewCaseOfficer] = useState('EU Lead Auditor');

  // Comment Editor
  const [newCommentText, setNewCommentText] = useState('');
  const [commenterRole, setCommenterRole] = useState('EU Auditor');

  // Inline Notification Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('success');

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('platform_regulatory_cases', JSON.stringify(cases));
  }, [cases]);

  // Selected Case memoized
  const selectedCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Trigger Toast Notification
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Status Change Handler
  const handleStatusChange = (caseId: string, nextStatus: RegulatoryCase['status']) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedComments = [
          ...c.comments,
          {
            id: `sys-${Date.now()}`,
            author: "System Audit Log",
            text: `Status transitioned from '${c.status}' to '${nextStatus}'.`,
            timestamp: new Date().toISOString()
          }
        ];
        return {
          ...c,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          fineAmount: nextStatus === 'Fine Levied' ? (c.fineAmount || 250000) : c.fineAmount,
          comments: updatedComments
        };
      }
      return c;
    }));
    showToast(`Case ${caseId} status updated to ${nextStatus}`, 'success');
  };

  // Fine Amount Handler
  const handleFineAmountChange = (caseId: string, amount: number) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          fineAmount: amount,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  // Add Comment Handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedCase) return;

    const newComment: CaseComment = {
      id: `comment-${Date.now()}`,
      author: commenterRole,
      text: newCommentText.trim(),
      timestamp: new Date().toISOString()
    };

    setCases(prev => prev.map(c => {
      if (c.id === selectedCase.id) {
        return {
          ...c,
          comments: [...c.comments, newComment],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    setNewCommentText('');
    showToast("Audit comment logged successfully on sovereign ledger.", "success");
  };

  // Create Case Handler
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCompanyName = newCompanyName === 'Other' ? customCompanyName.trim() : newCompanyName;
    if (!finalCompanyName || !newDescription.trim()) {
      showToast("Please provide all required fields to register a case.", "warning");
      return;
    }

    const year = new Date().getFullYear();
    const sequence = String(cases.length + 1).padStart(3, '0');
    const nextId = `CASE-${year}-${sequence}`;

    const newCase: RegulatoryCase = {
      id: nextId,
      companyName: finalCompanyName,
      category: newCategory,
      status: 'New Case',
      severity: newSeverity,
      description: newDescription.trim(),
      caseOfficer: newCaseOfficer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fineAmount: 0,
      comments: [
        {
          id: `sys-init-${Date.now()}`,
          author: "System Registrar",
          text: `Regulatory Case Registered. Violation Reference: ${newCategory}. Assigned Officer: ${newCaseOfficer}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setCases(prev => [newCase, ...prev]);
    setSelectedCaseId(nextId);
    
    // Reset Form
    setNewDescription('');
    setCustomCompanyName('');
    setIsRegistering(false);

    showToast(`Case ${nextId} created for ${finalCompanyName}!`, "success");
  };

  // Delete Case Handler (Auditor only)
  const handleDeleteCase = (caseId: string) => {
    const remaining = cases.filter(c => c.id !== caseId);
    setCases(remaining);
    if (selectedCaseId === caseId && remaining.length > 0) {
      setSelectedCaseId(remaining[0].id);
    }
    showToast(`Case ${caseId} revoked from ledger.`, "warning");
  };

  // Filtering Logic
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesSeverity = severityFilter === 'All' || c.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [cases, searchQuery, statusFilter, severityFilter]);

  // Metric Calculation
  const metrics = useMemo(() => {
    const total = cases.length;
    const inInvestigation = cases.filter(c => c.status === 'In Investigation').length;
    const fineLevied = cases.filter(c => c.status === 'Fine Levied').length;
    const resolved = cases.filter(c => c.status === 'Resolved').length;
    const totalFines = cases.reduce((acc, c) => acc + (c.fineAmount || 0), 0);

    return { total, inInvestigation, fineLevied, resolved, totalFines };
  }, [cases]);

  return (
    <div className="space-y-4 sm:space-y-6" id="regulatory-case-management-console">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 max-w-sm ${
              toastType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              toastType === 'warning' ? 'bg-rose-50 border-rose-200 text-rose-800' :
              'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toastType === 'warning' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            {toastType === 'info' && <Info className="w-5 h-5 text-amber-600 shrink-0" />}
            <div className="text-xs font-bold leading-normal">{toastMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block">Active Cases</span>
            <div className="text-3xl font-black text-slate-800 tracking-tight mt-1">{metrics.total}</div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-medium">Tracking across sovereign enclaves</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block text-indigo-600">In Investigation</span>
            <div className="text-3xl font-black text-indigo-700 tracking-tight mt-1">{metrics.inInvestigation}</div>
          </div>
          <p className="text-[10px] text-indigo-500 mt-2 font-medium">Under active auditor audit</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block text-rose-600">Fines Levied</span>
            <div className="text-3xl font-black text-rose-700 tracking-tight mt-1">{metrics.fineLevied}</div>
          </div>
          <p className="text-[10px] text-rose-500 mt-2 font-medium">
            Total Fines: <span className="font-bold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(metrics.totalFines)}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block text-emerald-600">Resolved Cases</span>
            <div className="text-3xl font-black text-emerald-700 tracking-tight mt-1">{metrics.resolved}</div>
          </div>
          <p className="text-[10px] text-emerald-500 mt-2 font-medium">Satisfactory remediation checked</p>
        </div>
      </div>

      {/* Main Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Filter & Case List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                <Sliders className="w-4 h-4 mr-1.5 text-slate-400" />
                Case Directory
              </h3>
              
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Case</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search case, company, article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all font-medium text-slate-800"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Filters selectors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10"
                >
                  <option value="All">All Statuses</option>
                  <option value="New Case">New Case</option>
                  <option value="In Investigation">In Investigation</option>
                  <option value="Fine Levied">Fine Levied</option>
                  <option value="Under Appeal">Under Appeal</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Urgency Filter</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10"
                >
                  <option value="All">All Urgencies</option>
                  <option value="Low">Low Urgency</option>
                  <option value="Medium">Medium Urgency</option>
                  <option value="High">High Urgency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Staggered Case Cards list */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
            {filteredCases.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 lg:p-8 text-center text-slate-400 text-xs italic">
                No active compliance cases matches filter criteria.
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = c.id === selectedCaseId;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedCaseId(c.id); setIsRegistering(false); }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-50/40 border-amber-500 ring-1 ring-amber-500/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] font-extrabold text-slate-400">{c.id}</span>
                      <div className="flex items-center space-x-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                          c.severity === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          c.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {c.severity} Priority
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'In Investigation' ? 'bg-indigo-100 text-indigo-800' :
                          c.status === 'Fine Levied' ? 'bg-orange-100 text-orange-800' :
                          c.status === 'Under Appeal' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-xs truncate">{c.companyName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{c.category}</p>
                    <p className="text-[11px] text-slate-500 font-normal line-clamp-2 mt-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-3 pt-2.5 border-t border-slate-100 font-bold">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                      <span>{c.comments.length} Comments</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Details Workspace / Registration Form (7 Cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            
            {/* Create Case Form View */}
            {isRegistering ? (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCreateCase}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-slate-100 text-slate-800 rounded">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">Register New Compliance Case</h3>
                      <p className="text-[10px] text-slate-400">Initialize an official regulatory file on the sovereign database.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Organization *</label>
                    <select
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/15 focus:bg-white outline-none"
                    >
                      <option value="Global Finance Corp">Global Finance Corp</option>
                      <option value="Tech Startup X">Tech Startup X</option>
                      <option value="Acme Corporation Europe">Acme Corporation Europe</option>
                      <option value="Stark Industries GmbH">Stark Industries GmbH</option>
                      <option value="Beta Innovations">Beta Innovations</option>
                      <option value="Data Brokers Inc">Data Brokers Inc</option>
                      <option value="Other">Other (Custom Corporate Entity)</option>
                    </select>
                  </div>

                  {newCompanyName === 'Other' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Custom Entity Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dynamic Logistics S.A."
                        value={customCompanyName}
                        onChange={(e) => setCustomCompanyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/15 focus:bg-white outline-none"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Case Urgency / Priority *</label>
                    <select
                      value={newSeverity}
                      onChange={(e: any) => setNewSeverity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/15 focus:bg-white outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Violation Directive / Article Reference *</label>
                    <input
                      type="text"
                      placeholder="e.g. GDPR Art. 5(1)c (Data Minimization Creep)"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/15 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Incident Officer In Charge *</label>
                    <input
                      type="text"
                      placeholder="Auditor Name / Office ID"
                      value={newCaseOfficer}
                      onChange={(e) => setNewCaseOfficer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/15 focus:bg-white outline-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Incident Context & Evidence Description *</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the discovered system deficiencies, compromised telemetry variables, or data protection failures in detail..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500/15 focus:bg-white outline-none leading-relaxed"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Register Case File</span>
                  </button>
                </div>
              </motion.form>
            ) : selectedCase ? (
              
              /* Active Selected Case Details & Audit Workspace */
              <motion.div
                key="details-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6"
              >
                
                {/* Case Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {selectedCase.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        selectedCase.severity === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        selectedCase.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {selectedCase.severity} Priority
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-2">
                      {selectedCase.companyName}
                    </h2>
                    <p className="text-xs text-indigo-600 font-bold mt-1">
                      {selectedCase.category}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start md:self-auto">
                    <button
                      onClick={() => handleDeleteCase(selectedCase.id)}
                      className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Revoke Case File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Case Specifications & Officer */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Case Officer</span>
                    <span className="font-semibold text-slate-800 flex items-center mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      {selectedCase.caseOfficer}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block">Opened On</span>
                    <span className="font-semibold text-slate-800 flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      {new Date(selectedCase.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block">Last Compliance Update</span>
                    <span className="font-semibold text-slate-800 flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 animate-pulse" />
                      {new Date(selectedCase.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Description Context */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
                    Auditor Findings Summary
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium p-4 bg-amber-50/20 rounded-xl border border-amber-500/10">
                    {selectedCase.description}
                  </p>
                </div>

                {/* Action Controls: Assign Status Update */}
                <div className="space-y-3.5 border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Sliders className="w-4 h-4 mr-1.5 text-slate-400" />
                    Regulatory Actions & Status Assignment
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'In Investigation', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-700' },
                      { id: 'Fine Levied', color: 'border-orange-200 bg-orange-50/50 text-orange-700' },
                      { id: 'Under Appeal', color: 'border-amber-200 bg-amber-50/50 text-amber-700' },
                      { id: 'Resolved', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700' }
                    ].map((statusBtn) => {
                      const isActive = selectedCase.status === statusBtn.id;
                      return (
                        <button
                          key={statusBtn.id}
                          type="button"
                          onClick={() => handleStatusChange(selectedCase.id, statusBtn.id as any)}
                          className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            isActive 
                              ? `${statusBtn.color} ring-2 ring-indigo-500/10 font-black` 
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{statusBtn.id}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditionally reveal Fine Input if status is Fine Levied */}
                  {selectedCase.status === 'Fine Levied' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4.5 h-4.5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-orange-950 block">Assess Fine Penalty (Article 83)</span>
                          <span className="text-[10px] text-orange-700 font-medium">Input estimated fine matching the DPA assessment directives.</span>
                        </div>
                      </div>

                      <div className="relative rounded-lg max-w-xs shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-extrabold text-sm">
                          €
                        </div>
                        <input
                          type="number"
                          value={selectedCase.fineAmount || ''}
                          onChange={(e) => handleFineAmountChange(selectedCase.id, Number(e.target.value))}
                          placeholder="Amount in Euros"
                          className="w-full pl-7 pr-3 py-2 bg-white border border-orange-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        Tip: Use the **GDPR Fine Calculator** tab to compute compliant statutory fines.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Comments / Audit Log Ledger */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1.5 text-slate-400" />
                    Case History & Audit Comments ({selectedCase.comments.length})
                  </h4>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {selectedCase.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span className="text-indigo-600 font-extrabold">{comm.author}</span>
                          <span>{new Date(comm.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {comm.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input Editor */}
                  <form onSubmit={handleAddComment} className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-slate-500">Posting as:</span>
                      <select
                        value={commenterRole}
                        onChange={(e) => setCommenterRole(e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-bold text-indigo-700 focus:outline-none"
                      >
                        <option value="EU Lead Inspector">EU Lead Inspector</option>
                        <option value="DPO Liaison">DPO Liaison</option>
                        <option value="Regulatory Board">Regulatory Board</option>
                        <option value="System Audit Agent">System Audit Agent</option>
                      </select>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Log dynamic findings, note response or technical compliance logs..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/10 focus:bg-white transition-all font-medium text-slate-700"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Comment</span>
                      </button>
                    </div>
                  </form>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs italic shadow-sm">
                Select a compliance case from the left panel or click "Register Case" to initialize one.
              </div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Appeal & Court Settlement Tracker section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center space-x-2">
              <Gavel className="w-5 h-5 text-slate-500" />
              <span>EU Court Appeals Tracker (CJEU Linkage)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Cross-reference active fine disputes, track European Court of Justice hearings, and flag final judgments.</p>
          </div>
          <div>
            <button 
              onClick={() => showToast("Dispatched real-time synchronization request to CJEU case databases.", "info")}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Sync CJEU Docket
            </button>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-bold uppercase tracking-wider">Court Reference</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider">Entity Organization</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider">Dissenting Resolution Argument</th>
                <th className="px-6 py-3 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              <tr>
                <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold hover:underline cursor-pointer">CJEU-2026-F40</td>
                <td className="px-6 py-4 text-slate-800 text-xs font-bold">SocialMetrics Ltd</td>
                <td className="px-6 py-4 text-slate-500 font-normal">Disputing Article 83 proportionality, claiming mitigation on proactive self-reporting of algorithm drift.</td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded">Pending Hearing</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold hover:underline cursor-pointer">CJEU-2026-A12</td>
                <td className="px-6 py-4 text-slate-800 text-xs font-bold">DataBroker Inc</td>
                <td className="px-6 py-4 text-slate-500 font-normal">Final appeal denied. Proved willful intent to harvest and syndicate location data of minors.</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded flex items-center w-max">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Judgment Finalized
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
