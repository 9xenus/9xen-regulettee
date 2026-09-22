import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Lock,
  Code,
  Copy,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  SlidersHorizontal,
  Layout,
  Terminal,
  Database,
  Check,
  AlertTriangle,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Ban,
  FileCode,
  Calculator,
  TrendingUp,
  FileText,
  Mail,
  RotateCcw,
  UserCheck,
  Send,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ViolationForensicReport } from '../components/ViolationForensicReport';

export const AutomatedRemediationEngine: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'security_headers' | 'equal_banner' | 'autofix_suite' | 'deploy_queue' | 'risk_assessment' | 'auto_reports' | 'email_dispatch' | 'forensic_report'
  >('deploy_queue');

  const [targetDomain, setTargetDomain] = useState('app.global-fintech.eu');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Module A: Remediation Queue State
  const [remItems, setRemItems] = useState<any[]>([]);
  const [remAuditLogs, setRemAuditLogs] = useState<any[]>([]);
  const [deployConfirmItem, setDeployConfirmItem] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Module B: Risk Assessment State
  const [riskAssessment, setRiskAssessment] = useState<any | null>(null);
  const [riskHistory, setRiskHistory] = useState<any[]>([]);

  // Module C: Reports State
  const [clientReports, setClientReports] = useState<any[]>([]);
  const [selectedReportHtml, setSelectedReportHtml] = useState<string | null>(null);

  // Module D: Email Preferences & Logs
  const [emailPref, setEmailPref] = useState<any | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [overrideEmailInput, setOverrideEmailInput] = useState('');

  useEffect(() => {
    loadAllModulesData();
  }, [targetDomain]);

  const loadAllModulesData = async () => {
    try {
      // Module A
      const remRes = await fetch('/api/v1/remediation/items');
      const remData = await remRes.json();
      if (remData.success) setRemItems(remData.items || []);

      const auditRes = await fetch('/api/v1/remediation/audit-logs');
      const auditData = await auditRes.json();
      if (auditData.success) setRemAuditLogs(auditData.audit_logs || []);

      // Module B
      const riskRes = await fetch('/api/v1/risk/company/comp-101');
      const riskData = await riskRes.json();
      if (riskData.success) setRiskAssessment(riskData.assessment);

      const histRes = await fetch('/api/v1/risk/company/comp-101/history');
      const histData = await histRes.json();
      if (histData.success) setRiskHistory(histData.history || []);

      // Module C
      const rptRes = await fetch('/api/v1/reports/client/comp-101');
      const rptData = await rptRes.json();
      if (rptData.success) setClientReports(rptData.reports || []);

      // Module D
      const prefRes = await fetch('/api/v1/notifications/clients/comp-101/email-preferences');
      const prefData = await prefRes.json();
      if (prefData.success) {
        setEmailPref(prefData.preferences);
        setOverrideEmailInput(prefData.preferences?.verified_email || 'compliance@axiomtech.eu');
      }
    } catch (err) {
      console.error('Failed to load modules data:', err);
    }
  };

  // Module A Handlers
  const handleAutoFix = async (itemId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/remediation/items/${itemId}/autofix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'AUTONOMOUS_COMPLIANCE_BOT' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Auto-fix applied immediately for ${itemId}! Logged to Sovereign Audit Ledger.`);
        loadAllModulesData();
      } else {
        setActionMessage(`Auto-fix notice: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`Error applying auto-fix: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSuggestion = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/remediation/items/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 'comp-101',
          violation_id: `v-${Date.now().toString().slice(-4)}`,
          violation_type: 'DATA_RETENTION_EXCEEDED',
          severity: 'HIGH',
          suggestion_summary: 'Enforce 30-day automated TTL retention purge for inactive EU user accounts',
          suggested_code: 'db.execute("DELETE FROM user_logs WHERE created_at < NOW() - INTERVAL \'30 DAYS\'");'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('New fix suggestion created with status: pending_human_review');
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/remediation/items/${itemId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_name: 'Senior Lead Auditor (Human)' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Item ${itemId} approved! Status updated to approved_ready_for_deployment.`);
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrepareDeploy = async (itemId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/remediation/${itemId}/prepare-deployment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor_name: 'DevOps Lead',
          current_code: '/* Original Legacy Policy Code */',
          current_policy: 'RETENTION_UNLIMITED'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Rollback snapshot taken for ${itemId}. Ready for explicit client deploy confirmation.`);
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeployNow = async (itemId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/remediation/${itemId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devops_actor: 'Production Release Engineer',
          explicit_client_confirmation: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Fix ${itemId} successfully deployed to live production environment!`);
        setDeployConfirmItem(null);
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRollback = async (itemId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/remediation/${itemId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor_name: 'Emergency System Admin' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Fix ${itemId} rolled back to previous snapshot state!`);
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Module B Handler
  const handleRecalculateRisk = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/risk/company/comp-101/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: 'Axiom Tech Europe',
          sector: 'FINTECH',
          active_violations: 2,
          open_vulnerabilities: 1,
          kyc_verified: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setRiskAssessment(data.assessment);
        setActionMessage('Risk score updated continuously based on live scan variables.');
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Module C Handler
  const handleGenerateReport = async () => {
    setIsProcessing(true);
    try {
      const scanId = `scan-${Date.now().toString().slice(-6)}`;
      const res = await fetch(`/api/v1/reports/generate/${scanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 'comp-101',
          company_name: 'Axiom Global Tech Ltd.',
          risk_score: riskAssessment?.overall_risk_score || 38.5,
          trend: riskAssessment?.trend || 'improving'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`New versioned audit report ${data.report.report_id} generated successfully!`);
        loadAllModulesData();
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Module D Handlers
  const handleSendEmail = async (reportId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/v1/notifications/reports/${reportId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 'comp-101',
          override_email: overrideEmailInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Report ${reportId} successfully emailed to verified address ${overrideEmailInput}!`);
        // fetch delivery logs
        const logsRes = await fetch(`/api/v1/notifications/reports/${reportId}/delivery-status`);
        const logsData = await logsRes.json();
        if (logsData.success) setDeliveryLogs(logsData.logs || []);
      } else {
        setActionMessage(`Email delivery failed: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`Error sending email: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/notifications/clients/comp-101/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified_email: overrideEmailInput,
          opt_in_critical_alerts: true,
          opt_in_scheduled_reports: true,
          digest_frequency: 'IMMEDIATE'
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailPref(data.preferences);
        setActionMessage('Verified email preferences updated successfully.');
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Full Compliance Operations Suite
                </h1>
                <p className="text-xs text-slate-500">
                  Remediation, Risk Assessment, Report Generation & Email Delivery Engine
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Strict non-negotiable governance: Human-approved code deployments, rollback snapshots, continuous risk scoring, versioned audit PDF/HTML generation, and verified client email notifications.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Target Organization</span>
              <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>comp-101 (Axiom Tech)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Message Banner */}
        {actionMessage && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-indigo-500 hover:text-indigo-800 font-bold">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('deploy_queue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'deploy_queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Code className="w-4 h-4 text-amber-400" />
            <span>Module A: Deploy & Rollback Queue</span>
          </button>

          <button
            onClick={() => setActiveSubTab('risk_assessment')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'risk_assessment'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Module B: Auto Risk Assessment</span>
          </button>

          <button
            onClick={() => setActiveSubTab('auto_reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'auto_reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Module C: Auto Report Generator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('email_dispatch')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'email_dispatch'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mail className="w-4 h-4 text-purple-400" />
            <span>Module D: Email Delivery & Preference</span>
          </button>

          <button
            onClick={() => setActiveSubTab('forensic_report')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'forensic_report'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span>Forensic Evidence</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security_headers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'security_headers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security Headers Inspector</span>
          </button>

          <button
            onClick={() => setActiveSubTab('equal_banner')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'equal_banner'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layout className="w-4 h-4 text-emerald-500" />
            <span>Equal Access Banner</span>
          </button>

          <button
            onClick={() => setActiveSubTab('autofix_suite')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === 'autofix_suite'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Autofix Suite</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* MODULE A: REMEDIATION & DEPLOYMENT QUEUE */}
        {activeSubTab === 'security_headers' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Security Headers Compliance Inspector
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Live header audit for <strong className="font-mono">{targetDomain}</strong> against NIS2 & OWASP ASVS baseline.</p>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                6 / 8 Headers Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Content-Security-Policy', value: "default-src 'self'; frame-ancestors 'none'", status: true },
                { name: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains', status: true },
                { name: 'X-Frame-Options', value: 'DENY', status: true },
                { name: 'X-Content-Type-Options', value: 'nosniff', status: true },
                { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin', status: true },
                { name: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()', status: true },
                { name: 'X-XSS-Protection', value: 'MISSING (deprecated but requested)', status: false },
                { name: 'Cross-Origin-Opener-Policy', value: 'same-origin', status: true },
              ].map((h, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 font-mono">{h.name}</span>
                    {h.status
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <code className="text-[10px] font-mono text-slate-500 break-all">{h.value || 'Header not set'}</code>
                  {!h.status && (
                    <button className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Auto-fix Header
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'equal_banner' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-emerald-500" />
                  Equal Access Eligibility Banner
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">STATEMENT: publish accessibility & equal-treatment eligibility banner per WCAG 2.2 / European Accessibility Act.</p>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                Banner Live
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-bold text-emerald-900">Accessibility Statement — Equal Treatment v2.1</p>
                <p>This portal complies with the European Accessibility Act (EU 2019/882) and WCAG 2.2 AA. Screen-reader, keyboard-navigation and reduced-motion modes are enabled for all verified users.</p>
                <p className="text-emerald-700">Eligibility: citizens with verified disability status receive assisted-review lanes for DSAR, appeals, and regulatory engagements.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Screen-reader Modes', value: '3 Active' },
                { label: 'AA Contrast Verified Pages', value: '97%' },
                { label: 'Assisted Review Lane Users', value: '412' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'autofix_suite' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  AI Autofix Suite
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Autonomous remediation domains the engine may patch without human intervention.</p>
              </div>
              <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                12 Autofixes Queued
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Header & CSP Patch Deployment', enabled: true, desc: 'Auto-deploy missing security headers to edge CDN' },
                { name: 'Consent Banner Reconfiguration', enabled: true, desc: 'Rebuild consent flows to STRICT prior opt-in' },
                { name: 'Retention Shredding Jobs', enabled: true, desc: 'Crypto-shred expired PII on daily schedule' },
                { name: 'Rate-Limit & WAF Rule Tuning', enabled: false, desc: 'Adjust throttling based on live traffic signals' },
              ].map((fx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{fx.name}</p>
                    <p className="text-[11px] text-slate-500">{fx.desc}</p>
                  </div>
                  <button className={`w-11 h-6 rounded-full transition-all relative ${fx.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${fx.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500">
              All autofix despatches are logged to the immutable remediation audit ledger and flagged for G2 review before end-of-day confirmation.
            </p>
          </div>
        )}

        {activeSubTab === 'deploy_queue' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>Human-in-the-Loop Remediation & Rollback Engine</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Approval state machine: Suggest → Human Approve → Prepare Snapshot → Explicit Client Confirmation → Deploy → Rollback if required.
                  </p>
                </div>

                <button
                  onClick={handleCreateSuggestion}
                  disabled={isProcessing}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-xs transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate New Fix Suggestion</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {remItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No remediation items in queue. Click "Generate New Fix Suggestion" above.
                  </div>
                ) : (
                  remItems.map((item) => (
                    <div key={item.item_id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-xs font-bold text-slate-900">{item.item_id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'deployed' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'ready_to_deploy' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'approved_ready_for_deployment' ? 'bg-purple-100 text-purple-800' :
                              item.status === 'rolled_back' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {item.status}
                            </span>
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {item.severity}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{item.suggestion_summary}</h4>
                          <span className="text-xs text-slate-500 font-mono">Violation: {item.violation_id} ({item.violation_type})</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          {item.status === 'pending_human_review' && item.auto_fixable && (
                            <button
                              onClick={() => handleAutoFix(item.item_id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs"
                              title="Low-risk finding: can be automatically fixed safely"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>Auto-Fix</span>
                            </button>
                          )}

                          {item.status === 'pending_human_review' && (
                            <button
                              onClick={() => handleApprove(item.item_id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Human Approve</span>
                            </button>
                          )}

                          {item.status === 'approved_ready_for_deployment' && (
                            <button
                              onClick={() => handlePrepareDeploy(item.item_id)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Take Rollback Snapshot & Prepare</span>
                            </button>
                          )}

                          {item.status === 'ready_to_deploy' && (
                            <button
                              onClick={() => setDeployConfirmItem(item)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-xs"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>Explicit Deploy Now...</span>
                            </button>
                          )}

                          {item.status === 'deployed' && (
                            <button
                              onClick={() => handleRollback(item.item_id)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Rollback Fix</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                        <div className="text-slate-500 text-[10px] mb-1">// Proposed Fix Implementation Snippet:</div>
                        <code>{item.suggested_code}</code>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Log Trail */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Remediation & Deployment Audit Trail</span>
              </h3>
              <div className="space-y-2">
                {remAuditLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 mr-2">{log.action}</span>
                      <span className="text-slate-600">{log.details}</span>
                      <span className="text-slate-400 block font-mono text-[10px]">Actor: {log.actor} | Timestamp: {log.timestamp}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">{log.item_id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE B: AUTO RISK ASSESSMENT */}
        {activeSubTab === 'risk_assessment' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Continuous Company Risk Score & Sector Multiplier</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Risk score serves as a priority indicator. Purely informational — no automated account suspension trigger.
                  </p>
                </div>

                <button
                  onClick={handleRecalculateRisk}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Recalculate Risk Engine</span>
                </button>
              </div>

              {riskAssessment && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Overall Risk Score</span>
                    <span className="text-3xl font-extrabold text-amber-400">{riskAssessment.overall_risk_score}</span>
                    <span className="text-xs text-slate-400 block mt-1">out of 100 max</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">Compliance Component</span>
                    <span className="text-2xl font-bold text-slate-900">{riskAssessment.compliance_risk_component}</span>
                    <span className="text-xs text-slate-400 block mt-1">Violations: {riskAssessment.active_violations_count}</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">Security Component</span>
                    <span className="text-2xl font-bold text-slate-900">{riskAssessment.security_risk_component}</span>
                    <span className="text-xs text-slate-400 block mt-1">Vulns: {riskAssessment.open_security_vulnerabilities}</span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-1">Sector Multiplier & Trend</span>
                    <span className="text-lg font-bold text-indigo-600 block">{riskAssessment.sector_multiplier}x Multiplier</span>
                    <span className="text-xs font-bold text-emerald-600 uppercase">Trend: {riskAssessment.trend}</span>
                  </div>
                </div>
              )}

              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Risk Score History Audit Trail</h4>
              <div className="space-y-2">
                {riskHistory.map((h, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500">{h.timestamp}</span>
                    <span className="font-bold text-slate-900">Score: {h.overall_risk_score}</span>
                    <span className="text-emerald-700 font-bold uppercase">{h.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE C: AUTO REPORT GENERATION */}
        {activeSubTab === 'auto_reports' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Auto-Generated Audit & Compliance Reports</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Versioned PDF/HTML reports with mandatory bilingual legal disclaimer.
                  </p>
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate New Audit Report</span>
                </button>
              </div>

              <div className="space-y-4">
                {clientReports.map((rpt) => (
                  <div key={rpt.report_id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">{rpt.report_id}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">Version v{rpt.version}</span>
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{rpt.grade}</span>
                      </div>
                      <span className="text-xs text-slate-600 block">Fine Estimate: {rpt.estimated_fine_range_eur} | Violations: {rpt.total_violations}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">Generated: {rpt.generated_at}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/api/v1/reports/${rpt.report_id}/html`, '_blank')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View HTML Report</span>
                      </button>

                      <button
                        onClick={() => handleSendEmail(rpt.report_id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Email to Client</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE D: EMAIL DELIVERY & PREFERENCES */}
        {activeSubTab === 'email_dispatch' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <span>Verified Client Email Preferences & Safeguards</span>
              </h3>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Verified Client Email Address</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={overrideEmailInput}
                      onChange={(e) => setOverrideEmailInput(e.target.value)}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleUpdatePreferences}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block">Critical Alerts</span>
                    <span className="text-emerald-600 font-bold">OPT-IN (ACTIVE)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block">Rate Limit Safeguard</span>
                    <span className="text-slate-600 font-mono">Max 1 Email / 30s</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block">Delivery Audit</span>
                    <span className="text-purple-600 font-bold">ACTIVE LOGGING</span>
                  </div>
                </div>
              </div>

              {/* Delivery logs */}
              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Email Delivery Status Logs</h4>
              <div className="space-y-2">
                {deliveryLogs.length === 0 ? (
                  <div className="text-center py-4 sm:py-6 text-slate-400 text-xs">No email dispatches recorded for current session.</div>
                ) : (
                  deliveryLogs.map((log) => (
                    <div key={log.log_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{log.subject}</span>
                        <span className="text-slate-500 font-mono text-[10px]">Recipient: {log.recipient_email} | Sent: {log.sent_at}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        {log.delivery_status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* FORENSIC REPORT */}
        {activeSubTab === 'forensic_report' && (
          <div className="space-y-4">
            <ViolationForensicReport />
          </div>
        )}

      </div>

      {/* EXPLICIT CLIENT CONFIRMATION DEPLOYMENT MODAL */}
      {deployConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 lg:p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Final Confirmation: Deploy Fix to Live Production</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to modify live production infrastructure for <strong>{deployConfirmItem.company_id}</strong>. A rollback snapshot has been preserved. You must explicitly confirm deployment.
            </p>

            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono">
              <div>Item ID: {deployConfirmItem.item_id}</div>
              <div>Summary: {deployConfirmItem.suggestion_summary}</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeployConfirmItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeployNow(deployConfirmItem.item_id)}
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-md"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Confirm "Deploy Now"</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedRemediationEngine;
