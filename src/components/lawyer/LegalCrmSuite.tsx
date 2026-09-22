import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Send, 
  MoreVertical, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  Layers,
  Award,
  ChevronRight,
  MessageSquare,
  FileCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CrmClient {
  id: string;
  companyName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  stage: 'Lead Inquiry' | 'Engagement Sent' | 'Active Retainer' | 'Audit In Progress' | 'Renewal Pending';
  retainerTier: 'Standard Compliance ($2.5k/mo)' | 'Enterprise ALSP ($7.5k/mo)' | 'Sovereign Defense ($15k/mo)';
  monthlySlaHours: number;
  usedHours: number;
  healthScore: number;
  monthlyFee: number;
  joinedDate: string;
  notes: string[];
}

export interface LegalDirective {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  regulation: string;
  dueDate: string;
  status: 'PENDING_CLIENT_ACTION' | 'IN_PROGRESS' | 'VERIFIED_BY_COUNSEL' | 'COMPLETED';
  dispatchedAt: string;
  counselNotes?: string;
  clientProofText?: string;
}

export const LegalCrmSuite: React.FC<{
  onSelectClientForService?: (client: CrmClient) => void;
  triggerToast?: (msg: string) => void;
}> = ({ onSelectClientForService, triggerToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'directives' | 'retainers'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  
  // Default CRM Clients
  const [crmClients, setCrmClients] = useState<CrmClient[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_crm_clients');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'c-1',
        companyName: 'Acme Corp Europe',
        industry: 'Enterprise SaaS & Cloud',
        contactName: 'Elena Rostova (General Counsel)',
        contactEmail: 'elena.rostova@acme.eu',
        stage: 'Active Retainer',
        retainerTier: 'Enterprise ALSP ($7.5k/mo)',
        monthlySlaHours: 30,
        usedHours: 18.5,
        healthScore: 88,
        monthlyFee: 7500,
        joinedDate: '2025-11-10',
        notes: ['Client requested priority audit for EU AI Act Article 52 watermark middleware.', 'DPA addendum submitted to BfDI.']
      },
      {
        id: 'c-2',
        companyName: 'Fintech Nexus Ltd',
        industry: 'Banking & Financial Services',
        contactName: 'Marcus Vance (Chief Risk Officer)',
        contactEmail: 'mvance@fintechnexus.io',
        stage: 'Active Retainer',
        retainerTier: 'Sovereign Defense ($15k/mo)',
        monthlySlaHours: 60,
        usedHours: 42.0,
        healthScore: 92,
        monthlyFee: 15000,
        joinedDate: '2026-01-15',
        notes: ['DORA Article 26 operational resilience testing passed dry-run.', 'Monthly retainer SLA includes 24/7 incident response.']
      },
      {
        id: 'c-3',
        companyName: 'HealthTech Sovereign AI',
        industry: 'Healthcare & Life Sciences',
        contactName: 'Dr. Sarah Jenkins (Head of Medical Compliance)',
        contactEmail: 's.jenkins@healthtech.eu',
        stage: 'Audit In Progress',
        retainerTier: 'Standard Compliance ($2.5k/mo)',
        monthlySlaHours: 15,
        usedHours: 14.0,
        healthScore: 79,
        monthlyFee: 2500,
        joinedDate: '2026-03-01',
        notes: ['EHDS patient consent revocation webhook sync pending.']
      },
      {
        id: 'c-4',
        companyName: 'Global Logistics Dynamics',
        industry: 'Supply Chain & Freight',
        contactName: 'Lars Lindqvist (VP Legal)',
        contactEmail: 'lars@logisticsdyn.com',
        stage: 'Lead Inquiry',
        retainerTier: 'Enterprise ALSP ($7.5k/mo)',
        monthlySlaHours: 30,
        usedHours: 0,
        healthScore: 70,
        monthlyFee: 7500,
        joinedDate: '2026-08-01',
        notes: ['Inbound request for NIS2 supply chain vendor security audit. Proposal sent.']
      }
    ];
  });

  // Directives State
  const [directives, setDirectives] = useState<LegalDirective[]>(() => {
    const saved = localStorage.getItem('9xen-regulettee_legal_directives');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'dir-101',
        clientId: 'c-1',
        clientName: 'Acme Corp Europe',
        title: 'Inject SHA-256 Watermark Metadata on AI Model Outputs',
        description: 'Mandatory technical compliance action under EU AI Act Article 52(1). Deploy Express middleware to append cryptographic provenance signature.',
        priority: 'CRITICAL',
        regulation: 'EU AI Act',
        dueDate: '2026-08-30',
        status: 'PENDING_CLIENT_ACTION',
        dispatchedAt: '2026-08-20',
        counselNotes: 'Failure to deploy by Aug 30 triggers non-compliance alert under Art 99 statutory fine regime.'
      },
      {
        id: 'dir-102',
        clientId: 'c-2',
        clientName: 'Fintech Nexus Ltd',
        title: 'Execute DORA Circuit Breaker Dry-Run Simulation',
        description: 'Simulate third-party payment webhook timeout and verify failover route to secondary sovereign vault under DORA Article 26.',
        priority: 'HIGH',
        regulation: 'DORA',
        dueDate: '2026-09-05',
        status: 'IN_PROGRESS',
        dispatchedAt: '2026-08-18',
        counselNotes: 'Ensure dry-run log hashes are logged to CaaS Audit Ledger.'
      }
    ];
  });

  // New Client Modal State
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    companyName: '',
    industry: 'Enterprise SaaS & Cloud',
    contactName: '',
    contactEmail: '',
    retainerTier: 'Enterprise ALSP ($7.5k/mo)' as CrmClient['retainerTier'],
    initialNote: ''
  });

  // New Directive Modal State
  const [isNewDirectiveModalOpen, setIsNewDirectiveModalOpen] = useState(false);
  const [newDirectiveForm, setNewDirectiveForm] = useState({
    clientId: 'c-1',
    title: '',
    description: '',
    priority: 'HIGH' as LegalDirective['priority'],
    regulation: 'EU AI Act',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    counselNotes: ''
  });

  // Automation: Trigger automated follow-up for pending directives
  const handleAutomatedFollowUp = (directiveId: string) => {
    setDirectives(prev => prev.map(d => {
      if (d.id === directiveId) {
        const timestamp = new Date().toLocaleString();
        return {
          ...d,
          status: 'IN_PROGRESS',
          counselNotes: `${d.counselNotes || ''}\nAutomated follow-up dispatched on ${timestamp}.`
        };
      }
      return d;
    }));
    triggerToast?.('Automated follow-up dispatched');
  };

  // Save to localStorage when state updates
  useEffect(() => {
    localStorage.setItem('9xen-regulettee_crm_clients', JSON.stringify(crmClients));
  }, [crmClients]);

  useEffect(() => {
    localStorage.setItem('9xen-regulettee_legal_directives', JSON.stringify(directives));
  }, [directives]);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.companyName || !newClientForm.contactEmail) return;

    const tierFeeMap = {
      'Standard Compliance ($2.5k/mo)': 2500,
      'Enterprise ALSP ($7.5k/mo)': 7500,
      'Sovereign Defense ($15k/mo)': 15000
    };

    const tierSlaMap = {
      'Standard Compliance ($2.5k/mo)': 15,
      'Enterprise ALSP ($7.5k/mo)': 30,
      'Sovereign Defense ($15k/mo)': 60
    };

    const newClient: CrmClient = {
      id: 'c-' + Date.now(),
      companyName: newClientForm.companyName,
      industry: newClientForm.industry,
      contactName: newClientForm.contactName || 'Primary Contact',
      contactEmail: newClientForm.contactEmail,
      stage: 'Lead Inquiry',
      retainerTier: newClientForm.retainerTier,
      monthlySlaHours: tierSlaMap[newClientForm.retainerTier],
      usedHours: 0,
      healthScore: 85,
      monthlyFee: tierFeeMap[newClientForm.retainerTier],
      joinedDate: new Date().toISOString().split('T')[0],
      notes: newClientForm.initialNote ? [newClientForm.initialNote] : ['Client created in CRM.']
    };

    setCrmClients(prev => [newClient, ...prev]);
    setIsNewClientModalOpen(false);
    setNewClientForm({
      companyName: '',
      industry: 'Enterprise SaaS & Cloud',
      contactName: '',
      contactEmail: '',
      retainerTier: 'Enterprise ALSP ($7.5k/mo)',
      initialNote: ''
    });
    if (triggerToast) triggerToast(`New client ${newClient.companyName} added to Legal CRM!`);
  };

  const handleDispatchDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveForm.title || !newDirectiveForm.description) return;

    const targetClient = crmClients.find(c => c.id === newDirectiveForm.clientId);
    const clientName = targetClient ? targetClient.companyName : 'All Clients';

    const newDir: LegalDirective = {
      id: 'dir-' + Date.now(),
      clientId: newDirectiveForm.clientId,
      clientName,
      title: newDirectiveForm.title,
      description: newDirectiveForm.description,
      priority: newDirectiveForm.priority,
      regulation: newDirectiveForm.regulation,
      dueDate: newDirectiveForm.dueDate,
      status: 'PENDING_CLIENT_ACTION',
      dispatchedAt: new Date().toISOString().split('T')[0],
      counselNotes: newDirectiveForm.counselNotes
    };

    setDirectives(prev => [newDir, ...prev]);
    setIsNewDirectiveModalOpen(false);
    setNewDirectiveForm({
      clientId: 'c-1',
      title: '',
      description: '',
      priority: 'HIGH',
      regulation: 'EU AI Act',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      counselNotes: ''
    });
    if (triggerToast) triggerToast(`Legal Directive dispatched to ${clientName}'s dashboard!`);
  };

  const filteredClients = crmClients.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const totalArr = crmClients.reduce((acc, curr) => acc + (curr.monthlyFee * 12), 0);
  const totalBillableHours = crmClients.reduce((acc, curr) => acc + curr.usedHours, 0);

  return (
    <div className="space-y-6">
      {/* Executive CRM Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Portfolio ARR</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${(totalArr / 1000).toFixed(1)}k</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4% YoY
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contracted annual recurring legal retainers</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Accounts</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{crmClients.length}</span>
            <span className="text-xs text-blue-400 font-medium">
              {crmClients.filter(c => c.stage === 'Active Retainer').length} Active Retainers
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active corporate legal client accounts</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billable SLA Hours</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalBillableHours.toFixed(1)} hrs</span>
            <span className="text-xs text-purple-400 font-medium">
              of {crmClients.reduce((a, b) => a + b.monthlySlaHours, 0)} hrs total
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged counsel billable SLA time this month</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Directives</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{directives.length}</span>
            <span className="text-xs text-amber-400 font-medium">
              {directives.filter(d => d.priority === 'CRITICAL').length} Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Legal directives dispatched to client portals</p>
        </div>
      </div>

      {/* CRM Navigation Tabs & Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Client Portfolio & CRM Pipeline</span>
          </button>
          <button
            onClick={() => setActiveSubTab('directives')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'directives'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Legal Directives Dispatcher</span>
            {directives.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full font-bold">
                {directives.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('retainers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'retainers'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>ALSP Retainer Catalog & SLAs</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeSubTab === 'pipeline' && (
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Corporate Lead</span>
            </button>
          )}

          {activeSubTab === 'directives' && (
            <button
              onClick={() => setIsNewDirectiveModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-medium rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Legal Directive</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: CLIENT CRM PIPELINE */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients by name, email or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All CRM Pipeline Stages</option>
                <option value="Lead Inquiry">Lead Inquiry</option>
                <option value="Engagement Sent">Engagement Sent</option>
                <option value="Active Retainer">Active Retainer</option>
                <option value="Audit In Progress">Audit In Progress</option>
                <option value="Renewal Pending">Renewal Pending</option>
              </select>
            </div>
          </div>

          {/* Client Table / Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Client Company</th>
                    <th className="py-3 px-4">Pipeline Stage</th>
                    <th className="py-3 px-4">Retainer Plan</th>
                    <th className="py-3 px-4">Monthly SLA Hours</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4 text-right">Actions & ALSP Desk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {filteredClients.map((client) => {
                    const slaUsagePct = Math.round((client.usedHours / client.monthlySlaHours) * 100);
                    return (
                      <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400">
                              {client.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{client.companyName}</div>
                              <div className="text-[11px] text-slate-400">{client.industry} • {client.contactEmail}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            client.stage === 'Active Retainer' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            client.stage === 'Audit In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            client.stage === 'Lead Inquiry' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                            {client.stage}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{client.retainerTier}</div>
                          <div className="text-[11px] text-slate-400">${client.monthlyFee.toLocaleString()}/mo (${(client.monthlyFee * 12 / 1000).toFixed(0)}k ARR)</div>
                        </td>

                        <td className="py-3.5 px-4 w-48">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-400">{client.usedHours} / {client.monthlySlaHours} hrs</span>
                            <span className="font-semibold text-slate-300">{slaUsagePct}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                slaUsagePct > 90 ? 'bg-rose-500' : slaUsagePct > 70 ? 'bg-amber-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(slaUsagePct, 100)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`text-sm font-bold ${
                              client.healthScore >= 85 ? 'text-emerald-400' : client.healthScore >= 70 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {client.healthScore}/100
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => onSelectClientForService && onSelectClientForService(client)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-lg text-xs font-medium transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Launch ALSP Service</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LEGAL DIRECTIVES DISPATCHER */}
      {activeSubTab === 'directives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                Dispatched Legal Directives & Enforcement Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Directives dispatched here automatically sync to the client’s executive dashboard with action required badges.
              </p>
            </div>
            <button
              onClick={() => setIsNewDirectiveModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-500 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Directive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directives.map((dir) => (
              <div key={dir.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                      dir.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      dir.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {dir.priority} • {dir.regulation}
                    </span>
                    <h4 className="text-sm font-bold text-white">{dir.title}</h4>
                    <div className="text-xs text-slate-400 mt-1">Client: <span className="text-blue-300 font-semibold">{dir.clientName}</span></div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                    dir.status === 'PENDING_CLIENT_ACTION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    dir.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {dir.status === 'PENDING_CLIENT_ACTION' ? 'Client Action Required' : dir.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {dir.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleAutomatedFollowUp(dir.id)}
                    disabled={dir.status === 'COMPLETED'}
                    className="flex items-center gap-1.5 text-[10px] bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Follow-up
                  </button>
                  <div className="text-[10px] text-slate-500">Due: {dir.dueDate}</div>
                </div>

                {dir.counselNotes && (
                  <div className="mt-2 text-[11px] text-amber-300/90 italic bg-amber-950/20 border border-amber-900/30 p-2 rounded-md">
                    <strong>Counsel Note:</strong> {dir.counselNotes}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Due: <strong className="text-white">{dir.dueDate}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dispatched {dir.dispatchedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ALSP RETAINERS & SLA CATALOG */}
      {activeSubTab === 'retainers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded-full uppercase">Tier 1</span>
              <h3 className="text-lg font-bold text-white mt-3">Standard Regulatory Retainer</h3>
              <p className="text-xs text-slate-400 mt-1">For growing tech ventures requiring baseline data privacy & GDPR oversight.</p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$2,500</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 15 Billable Legal Hours / month</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Quarterly GDPR & Privacy Audits</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Standard DPA & Vendor Contract Reviews</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 48-Hour Response SLA</li>
              </ul>
            </div>

            <button className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all">
              Manage Tier Subscriptions
            </button>
          </div>

          <div className="bg-slate-900/90 border-2 border-blue-500 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-blue-500/10">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">
              Most Popular ALSP
            </div>
            <div>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded-full uppercase">Tier 2</span>
              <h3 className="text-lg font-bold text-white mt-3">Enterprise ALSP Retainer</h3>
              <p className="text-xs text-slate-400 mt-1">Full-spectrum legal copilot & AI regulation coverage (EU AI Act, DORA, NIS2).</p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$7,500</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 30 Billable Legal Hours / month</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Unlimited AI Contract Redline Audits</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Formal Legal Counsel Opinion Letters</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Directives Dispatcher to Client Dashboard</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 12-Hour Priority Response SLA</li>
              </ul>
            </div>

            <button className="mt-8 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md">
              Selected Default Retainer
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full uppercase">Tier 3</span>
              <h3 className="text-lg font-bold text-white mt-3">Sovereign Regulatory Defense</h3>
              <p className="text-xs text-slate-400 mt-1">For multinational banking, healthtech & sovereign cloud operations.</p>
              
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$15,000</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 60 Billable Legal Hours / month</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 24/7 Breach & Fine Courtroom Representation</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Cross-Border Sovereignty Arbitrage & TIA</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Dedicated Senior Partner Counsel Assigned</li>
                <li className="flex items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 1-Hour Emergency Incident SLA</li>
              </ul>
            </div>

            <button className="mt-8 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all">
              Manage Tier Subscriptions
            </button>
          </div>
        </div>
      )}

      {/* NEW CLIENT MODAL */}
      <AnimatePresence>
        {isNewClientModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  Add New Client Lead
                </h3>
                <button
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Sovereign AI Ltd"
                    value={newClientForm.companyName}
                    onChange={e => setNewClientForm(f => ({ ...f, companyName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Industry Vertical</label>
                  <select
                    value={newClientForm.industry}
                    onChange={e => setNewClientForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Enterprise SaaS & Cloud">Enterprise SaaS & Cloud</option>
                    <option value="Banking & Financial Services">Banking & Financial Services (DORA)</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences (EHDS)</option>
                    <option value="GovTech & Sovereign Infrastructure">GovTech & Sovereign Infrastructure</option>
                    <option value="E-Commerce & Supply Chain">E-Commerce & Supply Chain (NIS2)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Mercer"
                      value={newClientForm.contactName}
                      onChange={e => setNewClientForm(f => ({ ...f, contactName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@apex.ai"
                      value={newClientForm.contactEmail}
                      onChange={e => setNewClientForm(f => ({ ...f, contactEmail: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Proposed ALSP Retainer Tier</label>
                  <select
                    value={newClientForm.retainerTier}
                    onChange={e => setNewClientForm(f => ({ ...f, retainerTier: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard Compliance ($2.5k/mo)">Standard Compliance ($2.5k/mo)</option>
                    <option value="Enterprise ALSP ($7.5k/mo)">Enterprise ALSP ($7.5k/mo)</option>
                    <option value="Sovereign Defense ($15k/mo)">Sovereign Defense ($15k/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Engagement Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter compliance requirements or inquiry context..."
                    value={newClientForm.initialNote}
                    onChange={e => setNewClientForm(f => ({ ...f, initialNote: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNewClientModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                  >
                    Save Lead & Onboard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW DIRECTIVE MODAL */}
      <AnimatePresence>
        {isNewDirectiveModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-400" />
                  Dispatch Legal Counsel Directive
                </h3>
                <button
                  onClick={() => setIsNewDirectiveModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDispatchDirective} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Client Account</label>
                  <select
                    value={newDirectiveForm.clientId}
                    onChange={e => setNewDirectiveForm(f => ({ ...f, clientId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {crmClients.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName} ({c.contactEmail})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Directive Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deploy SHA-256 Watermark Middleware"
                    value={newDirectiveForm.title}
                    onChange={e => setNewDirectiveForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Regulation Framework</label>
                    <select
                      value={newDirectiveForm.regulation}
                      onChange={e => setNewDirectiveForm(f => ({ ...f, regulation: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="EU AI Act">EU AI Act</option>
                      <option value="GDPR">GDPR</option>
                      <option value="DORA">DORA</option>
                      <option value="NIS2">NIS2</option>
                      <option value="Saudi PDPL">Saudi PDPL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Priority Level</label>
                    <select
                      value={newDirectiveForm.priority}
                      onChange={e => setNewDirectiveForm(f => ({ ...f, priority: e.target.value as any }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="CRITICAL">CRITICAL (Immediate)</option>
                      <option value="HIGH">HIGH (14 Days)</option>
                      <option value="MEDIUM">MEDIUM (30 Days)</option>
                      <option value="LOW">LOW (Informational)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Detailed Actionable Directive *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide specific technical or organizational steps required by the client..."
                    value={newDirectiveForm.description}
                    onChange={e => setNewDirectiveForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Counsel Legal Warning / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Non-compliance exposes firm to Art 99 statutory fine regime."
                    value={newDirectiveForm.counselNotes}
                    onChange={e => setNewDirectiveForm(f => ({ ...f, counselNotes: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNewDirectiveModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold"
                  >
                    Dispatch Directive
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
