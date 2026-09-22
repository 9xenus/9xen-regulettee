import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Zap, 
  ShieldAlert, 
  Building2, 
  Mail, 
  MessageSquare, 
  Landmark, 
  Gavel, 
  BarChart3, 
  Download, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  ExternalLink,
  Loader2,
  Trash2,
  Send,
  FileText,
  MapPin,
  ChevronRight,
  Database,
  TrendingUp,
  LayoutList,
  XCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { useNotification } from '../../context/NotificationContext';

interface RegionalScanResult {
  id: string;
  targetName: string;
  targetUrl: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  region: string;
  country: string;
  violationType: string;
  lawReference: string;
  riskScore: number;
  penaltyCharge: number;
  status: 'PENDING_NOTIFY' | 'NOTIFIED' | 'ENFORCED' | 'CLEAN' | 'SUPPRESSED' | 'ACCEPTED';
  notes?: string;
  dispatchLogs: {
    party: string;
    type: 'EMAIL' | 'SMS';
    status: 'SENT' | 'FAILED' | 'PENDING';
    timestamp?: string;
  }[];
}

interface SovereignRegionalScannerProps {
  onClose?: () => void;
}

export const SovereignRegionalScanner: React.FC<SovereignRegionalScannerProps> = ({ onClose }) => {
  const { showToast } = useNotification();
  const [activeStep, setActiveStep] = useState<'SETUP' | 'SCANNING' | 'RESULTS'>('SETUP');
  const [viewMode, setViewMode] = useState<'LIST' | 'ANALYTICS'>('LIST');
  const [selectedRegion, setSelectedRegion] = useState('EU-WEST-1 (Ireland/Germany)');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['GDPR', 'EU AI Act']);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [results, setResults] = useState<RegionalScanResult[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedResultForNotes, setSelectedResultForNotes] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Mock historical trend data for visualization
  const historicalTrends = [
    { month: 'Jan', penalties: 1200000, violations: 45, risk: 65 },
    { month: 'Feb', penalties: 1800000, violations: 58, risk: 72 },
    { month: 'Mar', penalties: 1500000, violations: 52, risk: 68 },
    { month: 'Apr', penalties: 2400000, violations: 84, risk: 85 },
    { month: 'May', penalties: 2100000, violations: 76, risk: 80 },
    { month: 'Jun', penalties: 3800000, violations: 112, risk: 92 },
  ];

  const regionalDistribution = [
    { name: 'EU-WEST', count: 42, value: 1850000 },
    { name: 'EU-CENTRAL', count: 35, value: 1200000 },
    { name: 'EU-SOUTH', count: 28, value: 950000 },
    { name: 'NON-EU', count: 18, value: 450000 },
  ];

  const regions = [
    { id: 'eu-west', name: 'EU-WEST-1 (Ireland/Germany)', countries: ['Germany', 'Ireland', 'France'] },
    { id: 'eu-central', name: 'EU-CENTRAL-1 (Benelux/Nordics)', countries: ['Netherlands', 'Belgium', 'Sweden', 'Denmark'] },
    { id: 'eu-south', name: 'EU-SOUTH-2 (Mediterranean)', countries: ['Italy', 'Spain', 'Greece', 'Portugal'] },
    { id: 'global-compliance', name: 'Non-EU Sovereignty Zone', countries: ['Switzerland', 'UK', 'Norway'] }
  ];

  const frameworks = [
    { id: 'GDPR', name: 'GDPR (Data Privacy)' },
    { id: 'AI_ACT', name: 'EU AI Act (Algorithms)' },
    { id: 'NIS2', name: 'NIS2 (Cybersecurity)' },
    { id: 'DORA', name: 'DORA (Fintech)' },
    { id: 'DSA', name: 'DSA (Content Moderation)' }
  ];

  const handleToggleFramework = (id: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const startRegionalScan = () => {
    if (selectedFrameworks.length === 0) {
      showToast('Please select at least one compliance framework to scan.', 'warning');
      return;
    }

    setActiveStep('SCANNING');
    setScanProgress(0);
    setScanLogs(['[INIT] Initializing Sovereign Crawler Cluster v4.2...']);

    const mockLogs = [
      `[AUTH] Handshake with ${selectedRegion} Liaison Gateway... [OK]`,
      `[DISCOVER] Querying regional DNS registries for .eu and local TLDs...`,
      `[DISCOVER] Found 142 distinct application endpoints in specified zone.`,
      `[SCAN] Auditing SSL/TLS certificate chains for PII transport security...`,
      `[SCAN] Parsing privacy policy manifests for EU AI Act compliance tokens...`,
      `[SCAN] Executing headless DOM probes for non-compliant cookie drop behaviors...`,
      `[EVALUATE] Analyzing owner metadata from WHOIS and Corporate registries...`,
      `[EVALUATE] Calculating penalty weights based on regional GDP-index multipliers...`,
      `[FINALIZE] Compiling regional sovereignty health report...`
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < mockLogs.length) {
        setScanLogs(prev => [...prev, mockLogs[currentLog]]);
        setScanProgress(((currentLog + 1) / mockLogs.length) * 100);
        currentLog++;
      } else {
        clearInterval(interval);
        generateMockResults();
        setActiveStep('RESULTS');
        showToast(`Regional scan for ${selectedRegion} completed.`, 'success');
      }
    }, 800);
  };

  const generateMockResults = () => {
    const regionObj = regions.find(r => r.name === selectedRegion) || regions[0];
    const mockResults: RegionalScanResult[] = [
      {
        id: 'scan-001',
        targetName: 'MedTech-Alpha Solutions',
        targetUrl: 'https://medtech-alpha.de',
        ownerName: 'Hans Schmidt',
        ownerEmail: 'h.schmidt@medtech-alpha.de',
        ownerPhone: '+49 170 1234567',
        region: selectedRegion,
        country: regionObj.countries[0],
        violationType: 'Sensitive Health Data Leakage',
        lawReference: 'GDPR Article 9 (Special Categories)',
        riskScore: 88,
        penaltyCharge: 450000,
        status: 'PENDING_NOTIFY',
        dispatchLogs: [
          { party: 'Enterprise Owner', type: 'EMAIL', status: 'PENDING' },
          { party: 'SaaS Administration', type: 'EMAIL', status: 'PENDING' },
          { party: 'BfDI (Germany Gov)', type: 'EMAIL', status: 'PENDING' },
          { party: 'Regional Financial Authority', type: 'SMS', status: 'PENDING' },
          { party: 'Third Party Auditor', type: 'EMAIL', status: 'PENDING' }
        ]
      },
      {
        id: 'scan-002',
        targetName: 'FinStream Global',
        targetUrl: 'https://finstream.ie',
        ownerName: 'Sarah O\'Connor',
        ownerEmail: 'sarah@finstream.global',
        ownerPhone: '+353 85 9876543',
        region: selectedRegion,
        country: regionObj.countries[1] || regionObj.countries[0],
        violationType: 'Inadequate DR Failover',
        lawReference: 'DORA Chapter II (Resiliency)',
        riskScore: 72,
        penaltyCharge: 125000,
        status: 'PENDING_NOTIFY',
        dispatchLogs: [
          { party: 'Enterprise Owner', type: 'EMAIL', status: 'PENDING' },
          { party: 'Central Bank of Ireland', type: 'EMAIL', status: 'PENDING' },
          { party: 'SaaS Administration', type: 'SMS', status: 'PENDING' },
          { party: 'Regional Finance Hub', type: 'EMAIL', status: 'PENDING' }
        ]
      },
      {
        id: 'scan-003',
        targetName: 'Retail-Smart AI',
        targetUrl: 'https://retail-smart.fr',
        ownerName: 'Jean Dupont',
        ownerEmail: 'j.dupont@retail-smart.fr',
        ownerPhone: '+33 6 12 34 56 78',
        region: selectedRegion,
        country: regionObj.countries[2] || regionObj.countries[0],
        violationType: 'Unregistered Biometric Model',
        lawReference: 'EU AI Act Chapter III',
        riskScore: 94,
        penaltyCharge: 850000,
        status: 'PENDING_NOTIFY',
        dispatchLogs: [
          { party: 'Enterprise Owner', type: 'EMAIL', status: 'PENDING' },
          { party: 'CNIL (France Auth)', type: 'EMAIL', status: 'PENDING' },
          { party: 'EU AI Office', type: 'EMAIL', status: 'PENDING' },
          { party: 'SaaS Administration', type: 'EMAIL', status: 'PENDING' },
          { party: 'Third Party Ethics Board', type: 'SMS', status: 'PENDING' }
        ]
      }
    ];
    setResults(mockResults);
  };

  const dispatchAutomatedNotifications = async () => {
    if (isDispatching) return;
    setIsDispatching(true);
    showToast('Initiating multi-party notification dispatch...', 'info');

    const updatedResults = [...results];
    
    for (let i = 0; i < updatedResults.length; i++) {
      const result = updatedResults[i];
      if (result.status === 'CLEAN') continue;

      // Update dispatch logs to "SENT" one by one
      for (let j = 0; j < result.dispatchLogs.length; j++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        result.dispatchLogs[j].status = 'SENT';
        result.dispatchLogs[j].timestamp = new Date().toISOString();
        setResults([...updatedResults]);
      }
      
      result.status = 'NOTIFIED';
      setResults([...updatedResults]);
    }

    setIsDispatching(false);
    showToast('All regional compliance dispatches sent successfully!', 'success');
  };

  const handleSaveNote = () => {
    if (!selectedResultForNotes) return;
    setResults(prev => prev.map(r => r.id === selectedResultForNotes ? { ...r, notes: noteInput } : r));
    setSelectedResultForNotes(null);
    setNoteInput('');
    showToast('Remediation note saved.', 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
      
      {/* Header */}
      <div className="bg-slate-900 px-4 sm:px-6 py-5 flex items-center justify-between text-white border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Globe className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Sovereign Regional Compliance Scanner</h2>
            <p className="text-xs text-slate-400 font-medium">B2G Automated Discovery & Enforcement Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {activeStep === 'RESULTS' && (
            <button 
              onClick={() => setActiveStep('SETUP')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 bg-slate-50/50">
        
        {/* Step: Setup */}
        {activeStep === 'SETUP' && (
          <div className="max-w-4xl mx-auto w-full space-y-5 sm:space-y-8 py-5 sm:py-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Regional Compliance Configuration</h3>
              <p className="text-sm text-slate-500">Configure your target sovereignty zone and compliance parameters for deep scanning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              {/* Region Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Target Sovereignty Zone
                </label>
                <div className="space-y-3">
                  {regions.map(region => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.name)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedRegion === region.name ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-600/5' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-bold text-sm ${selectedRegion === region.name ? 'text-indigo-900' : 'text-slate-800'}`}>{region.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Countries: {region.countries.join(', ')}</p>
                        </div>
                        {selectedRegion === region.name && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Framework Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-rose-600" />
                  Compliance Frameworks
                </label>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  {frameworks.map(fw => (
                    <button
                      key={fw.id}
                      onClick={() => handleToggleFramework(fw.id)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${selectedFrameworks.includes(fw.id) ? 'bg-rose-50 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span className="text-xs">{fw.name}</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFrameworks.includes(fw.id) ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'}`}>
                        {selectedFrameworks.includes(fw.id) && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                    <strong>Scanning Policy:</strong> This operation utilizes the B2G Gateway. Fines and notifications will be calculated based on regional standard multipliers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={startRegionalScan}
                className="bg-slate-900 text-white font-bold px-12 py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center space-x-3 active:scale-95"
              >
                <Search className="w-5 h-5" />
                <span>Initialize Regional Sovereign Scan</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Scanning */}
        {activeStep === 'SCANNING' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-5 sm:space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse rounded-full" />
              <div className="relative bg-white p-4 sm:p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-2xl">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-black text-slate-900">Regional Discovery in Progress</h3>
              <p className="text-xs text-slate-500">Currently scanning {selectedRegion} web infrastructure for compliance infractions.</p>
              
              <div className="w-full h-2 bg-slate-200 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono font-bold text-indigo-600 mt-2">{Math.round(scanProgress)}% COMPLETE</p>
            </div>

            <div className="w-full max-w-2xl bg-slate-950 rounded-2xl p-4 font-mono text-[10px] text-emerald-400 h-48 overflow-y-auto border border-slate-800 shadow-inner">
              {scanLogs.map((log, idx) => (
                <div key={idx} className="flex space-x-2 border-b border-slate-900 py-1 last:border-0">
                  <span className="text-slate-600">[{idx.toString().padStart(2, '0')}]</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="animate-pulse">_</div>
            </div>
          </div>
        )}

        {/* Step: Results */}
        {activeStep === 'RESULTS' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-4 sm:space-y-6">
            
            {/* Results Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Scanned</p>
                  <p className="text-xl font-black text-slate-900">142 sites</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Violations</p>
                  <p className="text-xl font-black text-rose-600">{results.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Penalties</p>
                  <p className="text-xl font-black text-emerald-600">€{results.reduce((acc, curr) => acc + curr.penaltyCharge, 0).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={dispatchAutomatedNotifications}
                disabled={isDispatching || results.every(r => r.status === 'NOTIFIED')}
                className={`p-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95 ${isDispatching || results.every(r => r.status === 'NOTIFIED') ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                <Send className={`w-5 h-5 ${isDispatching ? 'animate-bounce' : ''}`} />
                <span className="font-bold text-xs">Dispatch Notifications</span>
              </button>
            </div>

            {/* Results Header & Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'LIST' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <LayoutList className="w-4 h-4" />
                  <span>Detailed Ledger</span>
                </button>
                <button
                  onClick={() => setViewMode('ANALYTICS')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'ANALYTICS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Visual Intelligence</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Intelligence feed</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>

            {viewMode === 'LIST' ? (
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Regional Infraction Ledger</h4>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-[10px] font-bold text-slate-500">
                      <MapPin className="w-3 h-3 mr-1" /> {selectedRegion}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Owner / Target</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Infraction Details</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Penalty Charge</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Liaison Status</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Dispatch Log</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.map(result => (
                        <tr key={result.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                <Building2 className="w-5 h-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900">{result.targetName}</p>
                                <p className="text-[10px] text-slate-500 flex items-center">
                                  <User className="w-3 h-3 mr-1" /> {result.ownerName}
                                </p>
                                <p className="text-[10px] text-indigo-600 font-mono flex items-center hover:underline cursor-pointer">
                                  <ExternalLink className="w-3 h-3 mr-1" /> {result.targetUrl}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-rose-600">{result.violationType}</p>
                              <p className="text-[10px] text-slate-500 font-medium italic">{result.lawReference}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex-1 h-1 bg-slate-100 rounded-full w-20">
                                  <div 
                                    className={`h-full rounded-full ${result.riskScore > 80 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${result.riskScore}%` }}
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">{result.riskScore}% Risk</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="text-sm font-black text-slate-900">€{result.penaltyCharge.toLocaleString()}</p>
                              <span className="text-[9px] font-bold text-emerald-600 uppercase">Calculated base</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${
                              result.status === 'CLEAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              result.status === 'NOTIFIED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                              result.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              result.status === 'SUPPRESSED' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {result.status.replace('_', ' ')}
                            </span>
                            {result.notes && (
                              <div className="mt-1 flex items-center gap-1 text-[9px] text-amber-600 font-bold italic">
                                <MessageSquare className="w-2.5 h-2.5" />
                                Notes attached
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start space-y-1">
                              {result.dispatchLogs.map((log, lIdx) => (
                                <div key={lIdx} className="flex items-center space-x-1.5">
                                  <span className="text-[9px] font-bold text-slate-400">{log.party}:</span>
                                  {log.status === 'SENT' ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Loader2 className="w-3 h-3 text-slate-300 animate-spin" />
                                  )}
                                  <span className={`text-[9px] font-black ${log.status === 'SENT' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {log.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {(result.status === 'PENDING_NOTIFY' || result.status === 'NOTIFIED') && (
                                <>
                                  <button 
                                    onClick={() => {
                                      setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'ACCEPTED' } : r));
                                      showToast(`Infraction for ${result.targetName} accepted as resolved.`, 'success');
                                    }}
                                    className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="Accept (Resolved)"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setResults(prev => prev.map(r => r.id === result.id ? { ...r, status: 'SUPPRESSED' } : r));
                                      showToast(`Infraction for ${result.targetName} suppressed.`, 'info');
                                    }}
                                    className="p-1.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Suppress (False Positive)"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => {
                                  setSelectedResultForNotes(result.id);
                                  setNoteInput(result.notes || '');
                                }}
                                className={`p-1.5 border rounded-lg transition-colors ${result.notes ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                title="Remediation Notes"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              {result.status === 'NOTIFIED' && (
                                <button 
                                  onClick={() => showToast(`Escalating ${result.targetName} to 8-Level Enforcement Cascade...`, 'warning')}
                                  className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                  title="Escalate to 8-Level Enforcement"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 italic">Regional scan results are cached for 24h as per B2G regulatory guidelines.</p>
                  <div className="flex items-center space-x-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto pr-2 pb-6">
                
                {/* Penalty Charge Trend */}
                <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Penalty Enforcement Trend (6M)</h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+24% YoY</span>
                  </div>
                  <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalTrends}>
                        <defs>
                          <linearGradient id="colorPenalties" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          tickFormatter={(value) => `€${value / 1000000}M`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 800 }}
                          labelStyle={{ fontSize: '12px', fontWeight: 900, marginBottom: '4px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="penalties" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorPenalties)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Regional Distribution */}
                <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                   <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Regional Violation Distribution</h4>
                    </div>
                  </div>
                  <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionalDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                          {regionalDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'][index % 4]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Progression */}
                <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:col-span-2">
                   <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">Sovereignty Risk Factor Progression</h4>
                    </div>
                  </div>
                  <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        />
                        <Area 
                          type="stepAfter" 
                          dataKey="risk" 
                          stroke="#e11d48" 
                          strokeWidth={2} 
                          fill="#fff1f2" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* Remediation Notes Modal */}
      <AnimatePresence>
        {selectedResultForNotes && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="bg-slate-900 p-4 sm:p-5 lg:p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Remediation Documentation</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Finding ID: {selectedResultForNotes}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedResultForNotes(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Detailed Remediation Notes</label>
                  <textarea 
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Document remediation steps, false positive justification, or evidence of compliance..."
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedResultForNotes(null)}
                    className="px-6 py-3 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSaveNote}
                    className="px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Commit Note to Ledger
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
