import React, { useState, useMemo, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { 
  Compass, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Lock, 
  Settings, 
  Users, 
  RefreshCcw, 
  Sparkles, 
  Info,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Trash2,
  Plus,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ComplianceReadinessDashboard } from '../components/compliance/ComplianceReadinessDashboard';

interface Soc2Control {
  id: string;
  name: string;
  category: 'Governance' | 'Practice' | 'Reliability';
  description: string;
  details: string;
  analogy: string;
  proTip?: string;
  status: 'COMPLIANT' | 'PENDING' | 'NON_COMPLIANT';
  remediationDeadline?: string;
  checklistItems: { id: string; text: string; done: boolean }[];
}

const INITIAL_CONTROLS: Soc2Control[] = [
  {
    id: 'CC1',
    name: 'Control Environment',
    category: 'Governance',
    description: 'Sets the tone from the top by cementing integrity, ethical values, and governance.',
    details: 'Imagine announcing a zero-tolerance policy for cheating, then rewarding the biggest rule-breakers—your credibility evaporates. A robust control environment means leadership walks the talk and security values bleed into board meetings.',
    analogy: 'The bedrock of organizational culture and ethical standards.',
    status: 'COMPLIANT',
    checklistItems: [
      { id: 'cc1-1', text: 'Board-approved ethical standard operating procedures (SOPs)', done: true },
      { id: 'cc1-2', text: 'Regular leadership security alignment meetings', done: true },
      { id: 'cc1-3', text: 'Documented whistleblowing policy and secure hotline', done: true },
    ]
  },
  {
    id: 'CC2',
    name: 'Information and Communication',
    category: 'Governance',
    description: 'Makes sure the right details reach the right people at the right time.',
    details: 'It’s like giving firefighters a live feed of the blaze rather than a smoke signal—they can act fast before the whole building goes up. If your teams rely on outdated spreadsheets or "reply-all" email chains, critical vulnerabilities may slip through unnoticed.',
    analogy: 'Real-time telemetry and communication pipelines.',
    status: 'PENDING',
    checklistItems: [
      { id: 'cc2-1', text: 'Automated status feeds linked to internal communications (e.g. Slack/Teams)', done: true },
      { id: 'cc2-2', text: 'Up-to-date central GRC dashboard for all stakeholders', done: false },
      { id: 'cc2-3', text: 'Formalized incident escalation runbooks', done: true },
    ]
  },
  {
    id: 'CC3',
    name: 'Risk Assessment',
    category: 'Governance',
    description: 'Forces you to scan the horizon for incoming threats—internal or external—and adjust your sails.',
    details: 'Skipping regular risk assessments is like ignoring changing tides until your ship runs aground. By actively reviewing risk in the context of new projects or market shifts, you avoid nasty surprises.',
    analogy: 'Strategic forecasting and risk vector mitigation.',
    proTip: 'Use a simple risk matrix template that rates impact and likelihood on one page. When stakeholders can eyeball risks at a glance, risk discussions move from snooze-fest to strategic planning.',
    status: 'COMPLIANT',
    checklistItems: [
      { id: 'cc3-1', text: 'Comprehensive risk catalog updated quarterly', done: true },
      { id: 'cc3-2', text: 'Single-page visual risk impact vs likelihood matrix', done: true },
      { id: 'cc3-3', text: 'Third-party vendor risk assessment procedures', done: true },
    ]
  },
  {
    id: 'CC4',
    name: 'Monitoring Activities',
    category: 'Practice',
    description: 'Your security’s CCTV, flagging control failures and anomalies in real time.',
    details: 'If you wait for quarterly reviews, you’re playing security whack-a-mole—by the time you spot one threat, dozens more have popped up. Continuous monitoring helps you detect patterns and nip issues in the bud.',
    analogy: 'Active surveillance and automatic log telemetry.',
    status: 'PENDING',
    checklistItems: [
      { id: 'cc4-1', text: 'Real-time intrusion detection system (IDS) logs', done: true },
      { id: 'cc4-2', text: 'Continuous compliance audit tools active on server instances', done: false },
      { id: 'cc4-3', text: 'Automatic alerts on compliance configuration drift', done: false },
    ]
  },
  {
    id: 'CC5',
    name: 'Control Activities',
    category: 'Practice',
    description: 'The checkpoints that ensure policies get enforced—think approvals, reconciliations, and verifications.',
    details: 'Without these gates, rogue changes slip through like stilettos in a no-shoes club. Formalizing your control activities prevents operational drift and documents your defense in depth.',
    analogy: 'Cryptographic gateways, signatures, and procedural gates.',
    status: 'NON_COMPLIANT',
    remediationDeadline: '2026-08-15',
    checklistItems: [
      { id: 'cc5-1', text: 'Strict multi-signature approval flow for code deployments', done: false },
      { id: 'cc5-2', text: 'Automated reconcile scripts for core financial transactions', done: false },
      { id: 'cc5-3', text: 'Peer reviews mandated on all infrastructure pull requests', done: true },
    ]
  },
  {
    id: 'CC6',
    name: 'Logical and Physical Access Controls',
    category: 'Practice',
    description: 'Locks down who can enter your digital vaults and server rooms.',
    details: 'You wouldn’t leave your front door wide open, so don’t let admin credentials roam free. Granular access reviews and badge logs keep both the keyboard warriors and physical intruders at bay.',
    analogy: 'Zero-trust enclaves, biometric locks, and granular IAM rules.',
    proTip: 'Schedule automated quarterly reviews of access rights using your identity management tool. Deprovisioning stale accounts cuts the attack surface without extra headcount.',
    status: 'COMPLIANT',
    checklistItems: [
      { id: 'cc6-1', text: 'Multi-Factor Authentication (MFA) mandated on all system entries', done: true },
      { id: 'cc6-2', text: 'Automated quarterly access rights review schedule', done: true },
      { id: 'cc6-3', text: 'Biometric physical logs synced to datacenter entry databases', done: true },
    ]
  },
  {
    id: 'CC7',
    name: 'System Operations',
    category: 'Reliability',
    description: 'Covers daily maintenance like backups, incident handling, and antivirus updates.',
    details: 'Think of it as regular oil changes and tune-ups—forgetting them invites catastrophic engine failure. Documented procedures and routine tests prove to auditors you’re not just pretending to care about uptime.',
    analogy: 'Uptime resilience, automated replication, and incident responses.',
    status: 'COMPLIANT',
    checklistItems: [
      { id: 'cc7-1', text: 'Daily secure data replication with offsite secondary backups', done: true },
      { id: 'cc7-2', text: 'Active antivirus/malware scanners on container endpoints', done: true },
      { id: 'cc7-3', text: 'Incident runbooks dry-run simulated with operational teams', done: true },
    ]
  },
  {
    id: 'CC8',
    name: 'Change Management',
    category: 'Reliability',
    description: 'Ensures every tweak to your infrastructure or applications passes through a formal, secure pipeline.',
    details: 'Uncontrolled changes breed "configuration drift," like a game of telephone where instructions mutate into security gaps. A disciplined change process gives you traceability and rollback options.',
    analogy: 'Traceable release pipelines and sandbox validations.',
    status: 'PENDING',
    checklistItems: [
      { id: 'cc8-1', text: 'CI/CD pipeline with mandated static analysis (SAST) checks', done: true },
      { id: 'cc8-2', text: 'Documented roll-back plans for each active production release', done: false },
      { id: 'cc8-3', text: 'Automated drift detection alerts for Cloud Infrastructure configs', done: true },
    ]
  },
  {
    id: 'CC9',
    name: 'Risk Mitigation',
    category: 'Reliability',
    description: 'Staying vigilant about emerging threats and third-party risks while fixing known control gaps.',
    details: 'It’s the ongoing pruning that prevents your security posture from growing wild and unmanageable. Without remediation deadlines, "known issues" linger like weeds.',
    analogy: 'Constant posture auditing and proactive threat landscaping.',
    status: 'PENDING',
    checklistItems: [
      { id: 'cc9-1', text: 'Annual third-party blackbox penetration test schedules', done: true },
      { id: 'cc9-2', text: 'Active monitoring of third-party vendor SLA and compliance reports', done: false },
      { id: 'cc9-3', text: 'Established remediation deadlines with automated escalation pathways', done: true },
    ]
  }
];

interface Soc2ComplianceHubProps {
  tenantContext: any;
}

export function Soc2ComplianceHub({ tenantContext }: Soc2ComplianceHubProps) {
  const { showToast } = useNotification();
  const [activeTenantId, setActiveTenantId] = useState<string>(tenantContext?.id || 'org_1');
  const [dogfoodingAttestationOpen, setDogfoodingAttestationOpen] = useState<boolean>(true);
  const [activeHubTab, setActiveHubTab] = useState<'NAVIGATOR' | 'READINESS'>('NAVIGATOR');

  const [saasSoc2Settings, setSaasSoc2Settings] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('saas_soc2_client_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  useEffect(() => {
    setActiveTenantId(tenantContext?.id || 'org_1');
    
    const saved = localStorage.getItem('saas_soc2_client_settings');
    if (saved) {
      try {
        setSaasSoc2Settings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [tenantContext]);

  const activeConfig = useMemo(() => {
    const config = saasSoc2Settings[activeTenantId];
    if (config) return config;
    
    const defaults: Record<string, any> = {
      org_1: {
        tenantId: 'org_1',
        tenantName: 'Acme Corporation Europe',
        enabled: true,
        status: 'IN_AUDIT',
        scope: ['Security', 'Confidentiality', 'Availability'],
        auditor: '9xen Regulette Certifiers Europe',
        assignedCriteria: ['CC1', 'CC2', 'CC3', 'CC4', 'CC6', 'CC7', 'CC8', 'CC9'],
        nextAuditDeadline: '2026-08-15',
        lastAuditDate: '2025-06-10'
      },
      org_2: {
        tenantId: 'org_2',
        tenantName: 'Stark Industries GmbH',
        enabled: true,
        status: 'COMPLIANT',
        scope: ['Security', 'Confidentiality', 'Processing Integrity'],
        auditor: 'S.H.I.E.L.D. Auditing Services',
        assignedCriteria: ['CC1', 'CC2', 'CC3', 'CC4', 'CC5', 'CC6', 'CC7'],
        nextAuditDeadline: '2027-02-28',
        lastAuditDate: '2026-02-28'
      },
      org_3: {
        tenantId: 'org_3',
        tenantName: 'Global Finance Corp',
        enabled: false,
        status: 'PRE_ASSESSMENT',
        scope: ['Security'],
        auditor: 'TBD',
        assignedCriteria: ['CC1'],
        nextAuditDeadline: 'N/A',
        lastAuditDate: 'N/A'
      },
      org_4: {
        tenantId: 'org_4',
        tenantName: 'Beta Innovations',
        enabled: true,
        status: 'PRE_ASSESSMENT',
        scope: ['Security', 'Privacy'],
        auditor: 'Alpha Theta Assurance',
        assignedCriteria: ['CC1', 'CC2', 'CC3'],
        nextAuditDeadline: '2026-12-01',
        lastAuditDate: 'N/A'
      }
    };
    return defaults[activeTenantId] || {
      tenantId: activeTenantId,
      tenantName: activeTenantId === 'org_1' ? 'Acme Corporation Europe' : activeTenantId === 'org_2' ? 'Stark Industries GmbH' : activeTenantId === 'org_3' ? 'Global Finance Corp' : 'Beta Innovations',
      enabled: false,
      status: 'PRE_ASSESSMENT',
      scope: ['Security'],
      auditor: 'TBD',
      assignedCriteria: ['CC1'],
      nextAuditDeadline: 'N/A',
      lastAuditDate: 'N/A'
    };
  }, [saasSoc2Settings, activeTenantId]);

  // Load custom gates pushed by admin
  const [customGates, setCustomGates] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem(`custom_soc2_gates_${activeTenantId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to parse custom_soc2_gates_${activeTenantId}:`, e);
    }
    return [];
  });

  // Watch custom gates
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`custom_soc2_gates_${activeTenantId}`);
      setCustomGates(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error(`Failed to parse custom_soc2_gates_${activeTenantId} in useEffect:`, e);
      setCustomGates([]);
    }
  }, [activeTenantId, saasSoc2Settings]);

  const handleToggleCustomGate = (gateId: string) => {
    const nextGates = customGates.map(g => {
      if (g.id === gateId) return { ...g, done: !g.done };
      return g;
    });
    setCustomGates(nextGates);
    localStorage.setItem(`custom_soc2_gates_${activeTenantId}`, JSON.stringify(nextGates));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddLocalCustomGate = (text: string) => {
    if (!text.trim()) return;
    const nextGates = [...customGates, { id: `local-${Date.now()}`, text: text.trim(), done: false }];
    setCustomGates(nextGates);
    localStorage.setItem(`custom_soc2_gates_${activeTenantId}`, JSON.stringify(nextGates));
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemoveCustomGate = (gateId: string) => {
    const nextGates = customGates.filter(g => g.id !== gateId);
    setCustomGates(nextGates);
    localStorage.setItem(`custom_soc2_gates_${activeTenantId}`, JSON.stringify(nextGates));
    window.dispatchEvent(new Event('storage'));
  };

  const [controls, setControls] = useState<Soc2Control[]>(INITIAL_CONTROLS);
  const [selectedControlId, setSelectedControlId] = useState<string>('CC3');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Governance' | 'Practice' | 'Reliability'>('ALL');
  
  // Custom states for the interactive planner
  const [remediationTarget, setRemediationTarget] = useState<string>('');
  const [remediationDate, setRemediationDate] = useState<string>('');

  // Log level tracking (simulated historical progress charting for SOC 2 metrics)
  const chartData = useMemo(() => [
    { month: 'Jan', score: 65, threats: 12 },
    { month: 'Feb', score: 68, threats: 15 },
    { month: 'Mar', score: 72, threats: 9 },
    { month: 'Apr', score: 75, threats: 5 },
    { month: 'May', score: 81, threats: 3 },
    { month: 'Jun', score: 86, threats: 2 },
    { month: 'Jul', score: 89, threats: 1 }
  ], []);

  // Compute stats dynamically
  const stats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    
    controls.forEach(ctrl => {
      ctrl.checklistItems.forEach(item => {
        totalItems++;
        if (item.done) completedItems++;
      });
    });

    const compliantCount = controls.filter(c => c.status === 'COMPLIANT').length;
    const pendingCount = controls.filter(c => c.status === 'PENDING').length;
    const nonCompliantCount = controls.filter(c => c.status === 'NON_COMPLIANT').length;
    
    const overallScore = Math.round((completedItems / totalItems) * 100);

    return {
      overallScore,
      completedItems,
      totalItems,
      compliantCount,
      pendingCount,
      nonCompliantCount
    };
  }, [controls]);

  const activeControl = useMemo(() => {
    return controls.find(c => c.id === selectedControlId) || controls[0];
  }, [controls, selectedControlId]);

  // Toggle sub-checklist items
  const handleToggleChecklistItem = (controlId: string, itemId: string) => {
    setControls(prev => prev.map(ctrl => {
      if (ctrl.id !== controlId) return ctrl;
      
      const updatedChecklist = ctrl.checklistItems.map(item => {
        if (item.id !== itemId) return item;
        return { ...item, done: !item.done };
      });

      // Recalculate status based on completed items
      const doneCount = updatedChecklist.filter(i => i.done).length;
      let newStatus: 'COMPLIANT' | 'PENDING' | 'NON_COMPLIANT' = ctrl.status;
      
      if (doneCount === updatedChecklist.length) {
        newStatus = 'COMPLIANT';
      } else if (doneCount > 0) {
        newStatus = 'PENDING';
      } else {
        newStatus = 'NON_COMPLIANT';
      }

      return {
        ...ctrl,
        checklistItems: updatedChecklist,
        status: newStatus
      };
    }));
  };

  // Change overall status manually
  const handleChangeStatus = (controlId: string, status: 'COMPLIANT' | 'PENDING' | 'NON_COMPLIANT') => {
    setControls(prev => prev.map(ctrl => {
      if (ctrl.id !== controlId) return ctrl;
      return { ...ctrl, status };
    }));
  };

  // Set remediation deadline
  const handleSetDeadline = (controlId: string, date: string) => {
    if (!date) return;
    setControls(prev => prev.map(ctrl => {
      if (ctrl.id !== controlId) return ctrl;
      return { ...ctrl, remediationDeadline: date };
    }));
    setRemediationDate('');
  };

  const filteredControls = useMemo(() => {
    if (selectedCategory === 'ALL') return controls;
    return controls.filter(c => c.category === selectedCategory);
  }, [controls, selectedCategory]);

  if (!activeConfig.enabled) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" id="soc2-compliance-hub-root">
        {/* Premium Hero Banner */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 lg:p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                SOC 2 Audit Navigator
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                SOC 2 Common Criteria Controls
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
                "Running a SOC 2 program without understanding its core controls is like setting sail without a compass—you’ll drift aimlessly and end up off course."
              </p>
              <p className="text-xs text-indigo-300 font-mono">
                9xen Regulette Compliance Framework v4.2 • Core Common Criteria CC1 - CC9
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Tenant Simulation Enclave Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 font-mono">ACTIVE ENCLAVE CONTEXT:</span>
            <span className="text-xs font-black text-rose-400 uppercase tracking-wider bg-rose-950/30 border border-rose-900/50 px-2.5 py-0.5 rounded">
              {activeConfig.tenantName} ({activeTenantId})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'org_1', name: 'Acme Corp' },
              { id: 'org_2', name: 'Stark Ind' },
              { id: 'org_3', name: 'Global Finance' },
              { id: 'org_4', name: 'Beta Innov' }
            ].map(ten => (
              <button
                key={ten.id}
                onClick={() => {
                  setActiveTenantId(ten.id);
                  localStorage.setItem('platform_active_org_id', ten.id);
                  window.dispatchEvent(new Event('storage'));
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                  activeTenantId === ten.id 
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {ten.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 border border-slate-200 text-slate-400 rounded-full flex items-center justify-center shadow-xs">
            <Lock className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">SaaS Subscription Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The SOC 2 compliance hub module is currently <strong>not active</strong> or has been unsubscribed for <strong>{activeConfig.tenantName}</strong> by the SaaS Super-Administrator.
            </p>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-4.5 max-w-md text-left border border-slate-150 space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">How to Subscribe / Activate:</span>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              To activate this compliance engine as a service:
            </p>
            <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1.5 ml-1">
              <li>Navigate to the <strong>SaaS Command Dashboard</strong> (Super Admin role).</li>
              <li>Select the <strong>SaaS SOC 2 Control</strong> configuration tab.</li>
              <li>Toggle on the SOC 2 Service Subscription for <strong>{activeConfig.tenantName}</strong>.</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                const saved = localStorage.getItem('saas_soc2_client_settings') || '{}';
                try {
                  const parsed = JSON.parse(saved);
                  parsed[activeTenantId] = {
                    tenantId: activeTenantId,
                    tenantName: activeTenantId === 'org_1' ? 'Acme Corporation Europe' : activeTenantId === 'org_2' ? 'Stark Industries GmbH' : activeTenantId === 'org_3' ? 'Global Finance Corp' : 'Beta Innovations',
                    enabled: true,
                    status: 'PRE_ASSESSMENT',
                    scope: ['Security', 'Availability'],
                    auditor: 'Assurance Trail Group',
                    assignedCriteria: ['CC1', 'CC2', 'CC3'],
                    nextAuditDeadline: '2026-10-31',
                    lastAuditDate: 'N/A'
                  };
                  localStorage.setItem('saas_soc2_client_settings', JSON.stringify(parsed));
                  setSaasSoc2Settings(parsed);
                  window.dispatchEvent(new Event('storage'));
                } catch (e) {
                  console.error('Failed to parse saas_soc2_client_settings in self-activate:', e);
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Self-Activate Trial SaaS Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" id="soc2-compliance-hub-root">
      {/* Multi-Tenant Simulation Enclave Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-400 font-mono">ACTIVE ENCLAVE CONTEXT:</span>
          <span className="text-xs font-black text-indigo-400 uppercase tracking-wider bg-indigo-950/40 border border-indigo-900 px-2.5 py-0.5 rounded">
            {activeConfig.tenantName} ({activeTenantId})
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'org_1', name: 'Acme Corp' },
            { id: 'org_2', name: 'Stark Ind' },
            { id: 'org_3', name: 'Global Finance' },
            { id: 'org_4', name: 'Beta Innov' }
          ].map(ten => (
            <button
              key={ten.id}
              onClick={() => {
                setActiveTenantId(ten.id);
                localStorage.setItem('platform_active_org_id', ten.id);
                window.dispatchEvent(new Event('storage'));
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                activeTenantId === ten.id 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              {ten.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dogfooding & Self-Attestation Notice ("Practice What We Sell") */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 bg-indigo-500/20 border border-indigo-500/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-[9px] font-mono font-black uppercase tracking-widest text-indigo-300">
                  Dogfooding & Self-Attestation Active
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Self-Certified Enclave
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">
                "Practice What We Sell" — 9Xen Regulettee Production Enclave Attestation
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                As a sovereign privacy and compliance engine, 9Xen Regulettee CaaS enforces its own SOC 2 Type II, ISO 27001:2022, and GDPR Article 32 controls on its own runtime infrastructure. We prove every day that our system strictly adheres to the exact compliance frameworks we deliver to our enterprise customers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => showToast('Dogfooding Verification Passed: All 9 Common Criteria enclaves match root cryptographic proof ledger (sha256-verified).', 'success')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Verify Self-Compliance
            </button>
          </div>
        </div>
      </div>

      {/* SaaS Compliance Metadata Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Assigned Auditor</span>
          <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            {activeConfig.auditor || 'TBD'}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SaaS Active Scopes</span>
          <div className="flex flex-wrap gap-1">
            {activeConfig.scope.map((s: string) => (
              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Next Scheduled Review</span>
          <span className="text-sm font-mono font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {activeConfig.nextAuditDeadline || 'N/A'}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SaaS Seal Status</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
            activeConfig.status === 'COMPLIANT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            activeConfig.status === 'IN_AUDIT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            activeConfig.status === 'EXPIRED' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
            'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {activeConfig.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveHubTab('NAVIGATOR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeHubTab === 'NAVIGATOR'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          SOC 2 Control Navigator
        </button>
        <button
          onClick={() => setActiveHubTab('READINESS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeHubTab === 'READINESS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Compliance Readiness & Standards Scorecard
        </button>
      </div>

      {activeHubTab === 'READINESS' ? (
        <ComplianceReadinessDashboard />
      ) : (
        <>
          {/* Premium Hero Banner */}
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 lg:p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              SOC 2 Audit Navigator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SOC 2 Common Criteria Controls
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
              "Running a SOC 2 program without understanding its core controls is like setting sail without a compass—you’ll drift aimlessly and end up off course."
            </p>
            <p className="text-xs text-indigo-300 font-mono">
              9xen Regulette Compliance Framework v4.2 • Core Common Criteria CC1 - CC9
            </p>
          </div>

          {/* Quick Progress Wheel */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl w-full lg:w-auto shrink-0 backdrop-blur-sm">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-500"
                  strokeDasharray={`${stats.overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white font-mono">
                {stats.overallScore}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Trust Alignment</div>
              <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                {stats.completedItems}/{stats.totalItems} <span className="text-xs text-slate-400 font-normal">Controls Active</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10.5px]">
                <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {stats.compliantCount} Compliant
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                  <Clock className="w-3 h-3" /> {stats.pendingCount} Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Side: Controls Navigation List & Category Filter */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex gap-1.5 overflow-x-auto">
            {(['ALL', 'Governance', 'Practice', 'Reliability'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Criteria' : cat}
              </button>
            ))}
          </div>

          {/* Criteria Cards Navigation */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredControls.map(ctrl => {
              const isSelected = ctrl.id === selectedControlId;
              const isEnforced = activeConfig.assignedCriteria.includes(ctrl.id);
              const itemsCount = ctrl.checklistItems.length;
              const completedCount = ctrl.checklistItems.filter(i => i.done).length;
              
              return (
                <div
                  key={ctrl.id}
                  onClick={() => setSelectedControlId(ctrl.id)}
                  className={`border rounded-2xl p-4 transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-600' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  } ${!isEnforced ? 'opacity-70 bg-slate-50/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black font-mono uppercase px-2 py-0.5 rounded-md border ${
                          isEnforced 
                            ? 'text-indigo-600 bg-indigo-50 border-indigo-100' 
                            : 'text-slate-400 bg-slate-100 border-slate-200'
                        }`}>
                          {ctrl.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {isEnforced ? ctrl.category : 'Out of Scope'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        <span>{ctrl.name}</span>
                        {!isEnforced && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      </h3>
                      <p className="text-[11.5px] text-slate-500 line-clamp-1">
                        {isEnforced ? ctrl.description : 'Excluded from SaaS service scope by Super Admin.'}
                      </p>
                    </div>

                    {/* Status Dot/Indicator */}
                    <div className="shrink-0 pt-0.5">
                      {!isEnforced ? (
                        <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center text-slate-400" title="Excluded from Scope">
                          <Lock className="w-3 h-3" />
                        </span>
                      ) : ctrl.status === 'COMPLIANT' ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      ) : ctrl.status === 'PENDING' ? (
                        <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 animate-pulse">
                          <XCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono text-slate-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600">{isEnforced ? `${completedCount}/${itemsCount}` : '0/0'}</span>
                      <span>verification gates</span>
                    </div>
                    <span>{isEnforced ? `${Math.round((completedCount / itemsCount) * 100)}%` : 'Excluded'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Historical Progress Miniature Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Audit Trend Analysis</h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                +24% Progress
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 600 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 9, fontWeight: 600 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#gradientScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Focus Panel */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {(() => {
            const isEnforced = activeConfig.assignedCriteria.includes(activeControl.id);
            return (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 sm:space-y-6 relative overflow-hidden">
                
                {/* Out of scope warning */}
                {!isEnforced && (
                  <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl flex items-start gap-3">
                    <Lock className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <span className="text-xs font-black text-rose-800 uppercase tracking-wider block">Excluded from SaaS Scope</span>
                      <span className="text-xs text-rose-700 block leading-relaxed">
                        This control is currently marked <strong>Out of Scope</strong> by the platform SaaS Administrator. 
                        To activate it, navigate to the Super Admin Dashboard and toggle it on for <strong>{activeConfig.tenantName}</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {/* Top Bar inside focus panel */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black font-mono uppercase px-2.5 py-0.5 rounded-md border ${
                        isEnforced 
                          ? 'text-indigo-600 bg-indigo-50 border-indigo-100' 
                          : 'text-slate-400 bg-slate-100 border-slate-200'
                      }`}>
                        {activeControl.id}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {isEnforced ? `${activeControl.category} Criteria` : 'SaaS Inactive'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      {activeControl.name}
                    </h2>
                  </div>

                  {/* Action Buttons to adjust overall status */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl shrink-0">
                    {(['COMPLIANT', 'PENDING', 'NON_COMPLIANT'] as const).map(st => (
                      <button
                        key={st}
                        disabled={!isEnforced}
                        onClick={() => handleChangeStatus(activeControl.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          isEnforced && activeControl.status === st
                            ? st === 'COMPLIANT' ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'PENDING' ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs animate-pulse'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {st === 'PENDING' ? 'PENDING' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In-depth content descriptions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Demand & Explanation
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {activeControl.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      Real-World Context & Analogy
                    </h4>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed font-medium">
                      {activeControl.details}
                    </p>
                    <div className="pt-2 text-[11px] text-indigo-600 font-mono font-semibold">
                      Conceptual Framework: <span className="text-slate-500">{activeControl.analogy}</span>
                    </div>
                  </div>

                  {/* Dynamic Pro Tips Highlight if present */}
                  {activeControl.proTip && (
                    <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 text-amber-300 pointer-events-none">
                        <Sparkles className="w-10 h-10 stroke-[1]" />
                      </div>
                      <div className="flex gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider font-mono">
                            AUDITOR PRO TIP
                          </span>
                          <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            {activeControl.proTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Implementation Verification Checklist */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Verification Gates & Evidence Items
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {isEnforced ? 'Toggle gates to update status' : 'Checklist Disabled'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeControl.checklistItems.map(item => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                          item.done 
                            ? 'border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/20' 
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                        } ${!isEnforced ? 'opacity-65 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnforced && item.done}
                          disabled={!isEnforced}
                          onChange={() => handleToggleChecklistItem(activeControl.id, item.id)}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="space-y-0.5">
                          <span className={`text-[12.5px] font-semibold leading-relaxed ${
                            item.done && isEnforced ? 'text-slate-700 line-through decoration-slate-300' : 'text-slate-800'
                          }`}>
                            {item.text}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                            Gate Key ID: {item.id}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SaaS Admin Injected Directives */}
                {customGates.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-150">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                        SaaS Admin Custom Directives
                      </h4>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>

                    <div className="space-y-2">
                      {customGates.map(gate => (
                        <div
                          key={gate.id}
                          className={`flex items-start justify-between gap-3 p-3 border rounded-xl transition-all ${
                            gate.done 
                              ? 'border-indigo-200 bg-indigo-50/10' 
                              : 'border-slate-150 bg-slate-50/40'
                          } ${!isEnforced ? 'opacity-65' : ''}`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={gate.done}
                              disabled={!isEnforced}
                              onChange={() => handleToggleCustomGate(gate.id)}
                              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="space-y-0.5">
                              <span className={`text-[12.5px] font-semibold leading-relaxed ${
                                gate.done ? 'text-slate-700 line-through decoration-slate-300' : 'text-slate-800'
                              }`}>
                                {gate.text}
                              </span>
                              <p className="text-[10px] text-indigo-500 font-mono uppercase tracking-wider">
                                {gate.id.startsWith('local-') ? 'Local Enclave Objective' : 'Super Admin Injected Directive'}
                              </p>
                            </div>
                          </label>

                          <button
                            onClick={() => handleRemoveCustomGate(gate.id)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove Directive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Tenant Custom Gate Injector */}
                {isEnforced && (
                  <div className="space-y-2 pt-4 border-t border-slate-150">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Inject Local Evidence Task
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Add a custom self-assessment objective to your enclave checklist.
                    </p>
                    <div className="flex gap-2">
                      <input
                        id="localGateTextInput"
                        type="text"
                        placeholder="e.g. Verify dual-redundancy backup logs for Q3..."
                        className="flex-1 bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              handleAddLocalCustomGate(input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('localGateTextInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            handleAddLocalCustomGate(input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                )}

                {/* Remediation Deadline and Known Issues Tool */}
                <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider font-mono">
                        Remediation & Known Issues Registry
                      </h4>
                      <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                        Without remediation deadlines, "known issues" linger like weeds. Establish strict, audited action timeframes to present to compliance certifiers.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Deadline</div>
                      <div className="text-sm font-extrabold text-slate-800 font-mono mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {activeControl.remediationDeadline ? (
                          <span className="text-rose-600 font-bold">{activeControl.remediationDeadline}</span>
                        ) : (
                          <span className="text-slate-400 font-medium italic">No active deadline</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={remediationDate}
                        disabled={!isEnforced}
                        onChange={(e) => setRemediationDate(e.target.value)}
                        className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={() => handleSetDeadline(activeControl.id, remediationDate)}
                        disabled={!remediationDate || !isEnforced}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          remediationDate && isEnforced
                            ? 'bg-slate-900 text-white hover:bg-slate-800 border-none'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        Set Deadline
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
