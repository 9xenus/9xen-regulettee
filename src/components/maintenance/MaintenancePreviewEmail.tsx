import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Mail, 
  Copy, 
  Send, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Clock, 
  Terminal, 
  Laptop, 
  Smartphone, 
  FileText,
  ChevronRight,
  ShieldAlert,
  Server,
  Volume2
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface ScheduledMaintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  gracePeriod: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface MaintenancePreviewEmailProps {
  draftAnnouncement: string;
  draftGrace: string;
  isMaintenanceActive: boolean;
  schedules: ScheduledMaintenance[];
}

export const MaintenancePreviewEmail: React.FC<MaintenancePreviewEmailProps> = ({
  draftAnnouncement,
  draftGrace,
  isMaintenanceActive,
  schedules
}) => {
  const { showToast } = useNotification();
  
  // Tabs for Banner vs Email
  const [activeTab, setActiveTab] = useState<'banner' | 'email'>('banner');
  
  // Banner Preview states
  const [previewState, setPreviewState] = useState<'active' | 'operational'>('active');
  const [customPreviewText, setCustomPreviewText] = useState(draftAnnouncement);
  const [customPreviewGrace, setCustomPreviewGrace] = useState(draftGrace);
  const [bannerNoticeIndex, setBannerNoticeIndex] = useState(0);

  // Email state variables
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('manual');
  const [emailTemplate, setEmailTemplate] = useState<'critical' | 'scheduled' | 'technical'>('critical');
  const [recipientGroup, setRecipientGroup] = useState<string>('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHeader, setEmailHeader] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailCtaText, setEmailCtaText] = useState('View System Status');
  const [isSending, setIsSending] = useState(false);

  // Mock notifications to show in Operational mode
  const mockNotices = [
    {
      title: 'PQC Cryptographic Warning',
      message: 'Quantum Risk Analyzer detected legacy RSA-2048 keys in use. Post-Quantum Cryptography migration is highly recommended.'
    },
    {
      title: 'EDPB Regulatory Update',
      message: 'EDPB has released fresh directives on AI shadow systems. Your local AI Ethics & Liability Ledger has been updated accordingly.'
    }
  ];

  // Sync state changes from parent prop drafts
  useEffect(() => {
    setCustomPreviewText(draftAnnouncement);
  }, [draftAnnouncement]);

  useEffect(() => {
    setCustomPreviewGrace(draftGrace);
  }, [draftGrace]);

  // Handle auto-population of email content based on selected template & schedule
  useEffect(() => {
    let title = 'Emergency Enclave Hardening';
    let start = 'Today at 02:00 PM UTC';
    let duration = '45';
    let desc = 'Routine scheduled platform maintenance and security patching.';
    let grace = customPreviewGrace;

    if (selectedScheduleId !== 'manual') {
      const selectedSch = schedules.find(s => s.id === selectedScheduleId);
      if (selectedSch) {
        title = selectedSch.title;
        desc = selectedSch.description;
        duration = String(selectedSch.durationMinutes);
        grace = String(selectedSch.gracePeriod);
        try {
          start = new Date(selectedSch.startTime).toLocaleString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          });
        } catch {
          start = selectedSch.startTime;
        }
      }
    } else {
      title = 'Master Maintenance Toggle Active';
      desc = customPreviewText || 'Administrative override triggered manually.';
    }

    if (emailTemplate === 'critical') {
      setEmailSubject(`[URGENT LOCKDOWN] Nonaxen System Maintenance & Data Enclave Lockdown`);
      setEmailHeader('Critical Security & Enclave Isolation Notice');
      setEmailBody(`Attention Security Administrators and Compliance Officers,

Please be advised that we will be initiating a physical enclave isolation and lockdown sequence for: **${title}**.

During this maintenance window, access boundaries will be strictly enforced:
• **Start Time:** ${start}
• **Lockdown Warning Period:** ${grace} Minutes
• **Expected Isolation Duration:** ${duration} Minutes

**Operational Objective:** ${desc}

All active connections to primary databases will be gracefully severed. Please save all live sessions to avoid compliance drift.`);
      setEmailCtaText('Access Sovereign Status Center');
    } else if (emailTemplate === 'scheduled') {
      setEmailSubject(`[SCHEDULED UPGRADE] Planned Maintenance Window: ${title}`);
      setEmailHeader('Scheduled System Maintenance Announcement');
      setEmailBody(`Dear Partner Tenants,

We have scheduled a standard maintenance window to perform critical operational upgrades on the platform.

**Scheduled Window Details:**
• **Activity:** ${title}
• **Window Starts:** ${start}
• **Estimated Downtime:** ${duration} Minutes
• **Target Zone:** EU-CENTRAL-1 (Sovereign Enclave Vaults)

**Upgrades Description:** ${desc}

No data loss is expected during this activity. The status banner in your 9Xen Regulettee dashboard will reflect real-time progress.`);
      setEmailCtaText('View Maintenance Schedule');
    } else {
      setEmailSubject(`[TECHNICAL COMPLIANCE] Cryptographic Migration Notice - ${title}`);
      setEmailHeader('Cryptographic Verification & Enclave Alignment');
      setEmailBody(`Compliance and Engineering Update,

This notification confirms that Nonaxen is conducting alignment tasks regarding Post-Quantum Cryptography (PQC) and data residency compliance.

**Tasks Scheduled:**
1. **Activity:** ${title}
2. **Execution Window:** ${start} (Duration: ${duration} mins)
3. **Regulatory Standard:** EDPB Shadow AI & GDPR Sovereignty Directives

**Activity Impact:** ${desc}

Please review your local cryptographic logs if your local gateway experiences transient proxy latencies during the update.`);
      setEmailCtaText('Download Compliance Ledger');
    }
  }, [emailTemplate, selectedScheduleId, schedules, customPreviewText, customPreviewGrace]);

  const copyEmailHtml = () => {
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #0f172a; padding: 24px; text-align: left; border-bottom: 3px solid #f59e0b;">
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px;">9XEN_REGULETTEE SECURITY TELEMETRY</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">${emailHeader}</h2>
      <div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 24px;">${emailBody}</div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://9xen-regulettee.nonaxen.eu" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">${emailCtaText}</a>
      </div>
    </div>
    <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 11px; margin: 0; font-family: monospace;">This is an automated regulatory notification sent to verified tenants in compliance with EU Sovereign Data Residency mandates.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    navigator.clipboard.writeText(htmlEmail);
    showToast('Responsive Email HTML code copied to clipboard!', 'success');
  };

  const handleSendNotification = () => {
    setIsSending(true);
    showToast(`Initializing secure TLS broadcast to: ${recipientGroup === 'all' ? 'All Active Tenants' : recipientGroup === 'admins' ? 'Sovereign Administrators' : 'DPO & Compliance Officers'}...`, 'info');
    
    setTimeout(() => {
      setIsSending(false);
      showToast('Notification email dispatched successfully to 142 recipient enclaves!', 'success');
    }, 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Communications & Preview Studio</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Visualize user alerts and distribute automated notification compliance emails.</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200/40">
          <button
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'banner'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Alert Banner Preview
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Broadcast Drafter
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5">
        
        {/* TAB 1: BANNER PREVIEW */}
        {activeTab === 'banner' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Dashboard Banner Visualizer</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">This renders EXACTLY how the active and informational banners look on active tenant screens.</p>
              </div>

              {/* Toggle simulated status */}
              <div className="flex rounded-lg overflow-x-auto border border-slate-200 p-0.5 bg-slate-100">
                <button
                  onClick={() => setPreviewState('active')}
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                    previewState === 'active'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active Override
                </button>
                <button
                  onClick={() => setPreviewState('operational')}
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                    previewState === 'operational'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Operational Mode
                </button>
              </div>
            </div>

            {/* Simulated Live Viewport */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5" /> Real-time Render Viewport (Live Preview)
              </span>

              <div className="border border-slate-200 rounded-xl overflow-x-auto bg-slate-100 p-4 shadow-inner min-h-[110px] flex items-center justify-center">
                
                {previewState === 'active' ? (
                  /* Active Lockdown Warning Banner */
                  <div className="w-full bg-[#0F172A] border border-amber-500/40 text-white rounded-lg overflow-x-auto shadow-lg relative">
                    <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 animate-pulse w-full" />
                    
                    <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2 rounded-xl flex items-center justify-center animate-pulse shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">
                              SYSTEM MAINTENANCE WARNING
                            </span>
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                              Zone: EU-CENTRAL-1
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
                            {customPreviewText || 'No custom announcement notice composed yet.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                        <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-mono shadow-inner">
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                          <span className="text-slate-400">LOCKDOWN:</span>
                          <span className="font-bold text-amber-400">
                            {customPreviewGrace}:00
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Operational Banner */
                  <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg overflow-x-auto shadow-lg relative">
                    <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                    
                    <div className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-medium">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-extrabold uppercase tracking-widest text-[9px] text-emerald-400 flex items-center gap-1 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Server className="w-2.5 h-2.5" />
                            Systems Operational
                          </span>
                          
                          <span className="text-slate-600">•</span>
                          
                          <div className="flex items-center gap-1.5 text-slate-300 truncate">
                            <Volume2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-400 text-[10px]">
                              {mockNotices[bannerNoticeIndex].title}:
                            </span>
                            <span className="truncate text-slate-300 font-medium text-[10px]">
                              {mockNotices[bannerNoticeIndex].message}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setBannerNoticeIndex(prev => (prev + 1) % mockNotices.length)}
                        className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-slate-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Quick Live Modifier */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Sandbox Controls</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Simulated Announcement Text</label>
                  <input
                    type="text"
                    value={customPreviewText}
                    onChange={(e) => setCustomPreviewText(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                    placeholder="Enter dynamic warning message to test..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Simulated Grace Period (min)</label>
                  <input
                    type="number"
                    value={customPreviewGrace}
                    onChange={(e) => setCustomPreviewGrace(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                    min="0"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: EMAIL BROADCAST DRAFTER */}
        {activeTab === 'email' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Left: Email Configurator */}
            <div className="lg:col-span-5 space-y-4 text-xs">
              
              {/* Step 1: Bind Schedule */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">1. Link Maintenance Window</label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                >
                  <option value="manual">Manual Active Override Settings</option>
                  {schedules.map(sch => (
                    <option key={sch.id} value={sch.id}>
                      [{sch.status}] {sch.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Select a scheduled window to automatically inject its parameters (times, goals) into the email draft.</p>
              </div>

              {/* Step 2: Choose Template */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">2. Communication Tone / Template</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailTemplate('critical')}
                    className={`p-2 border rounded-lg font-bold text-center transition-all cursor-pointer ${
                      emailTemplate === 'critical'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Critical Lockdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailTemplate('scheduled')}
                    className={`p-2 border rounded-lg font-bold text-center transition-all cursor-pointer ${
                      emailTemplate === 'scheduled'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Scheduled Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailTemplate('technical')}
                    className={`p-2 border rounded-lg font-bold text-center transition-all cursor-pointer ${
                      emailTemplate === 'technical'
                        ? 'bg-slate-50 border-slate-400 text-slate-800 font-black'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Technical / Compliance
                  </button>
                </div>
              </div>

              {/* Step 3: Audience Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">3. Target Audience Group</label>
                <select
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                >
                  <option value="all">All Tenant System Users (142 recipient enclaves)</option>
                  <option value="admins">Sovereign Cluster Domain Administrators (31 recipients)</option>
                  <option value="compliance">DPO & Regulatory Liability Officers (12 recipients)</option>
                </select>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Heading Block</label>
                  <input
                    type="text"
                    value={emailHeader}
                    onChange={(e) => setEmailHeader(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Narrative Body Text</label>
                  <textarea
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none leading-relaxed"
                  />
                </div>
              </div>

            </div>

            {/* Right: Rich Email Mock Client View */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" /> Desktop Client Mock Presentation
                </span>
                
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                  Responsive HTML Sandbox
                </span>
              </div>

              {/* Mock mail container */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-md bg-white">
                
                {/* Mail header bar */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200/80 text-[10px] space-y-1 font-mono text-slate-500">
                  <div className="flex justify-between">
                    <span><strong className="text-slate-700">From:</strong> Nonaxen Sovereign Cloud Delivery &lt;delivery@nonaxen.eu&gt;</span>
                    <span className="text-[9px]">12:00 PM UTC</span>
                  </div>
                  <div>
                    <span><strong className="text-slate-700">To:</strong> {recipientGroup === 'all' ? 'Sovereign-Tenants-Channel' : recipientGroup === 'admins' ? 'Domain-Admins' : 'Data-Protection-Officers'} &lt;secure-broadcast@enclave.local&gt;</span>
                  </div>
                  <div className="truncate">
                    <span><strong className="text-slate-700">Subject:</strong> <span className="text-slate-800 font-bold">{emailSubject}</span></span>
                  </div>
                </div>

                {/* Styled Newsletter Container */}
                <div className="p-4 sm:p-5 lg:p-6 bg-slate-50/50 max-h-[420px] overflow-y-auto">
                  
                  <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    
                    {/* Header accent */}
                    <div className="bg-slate-900 px-4 py-3 border-b-2 border-amber-500 text-left">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Security Telemetry Alert</span>
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider">9Xen Regulettee CAAS Ops</span>
                    </div>

                    {/* Body content */}
                    <div className="p-5 text-left">
                      <h3 className="text-xs font-black text-slate-800 mb-3 border-b border-slate-100 pb-2">
                        {emailHeader}
                      </h3>
                      
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line font-medium mb-4">
                        {emailBody}
                      </p>

                      {/* CTA Button */}
                      <div className="text-center my-4">
                        <a 
                          href="#simulate" 
                          onClick={(e) => { e.preventDefault(); showToast('Simulating secure enclave link verification...', 'info'); }}
                          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          {emailCtaText}
                        </a>
                      </div>
                    </div>

                    {/* Footer note */}
                    <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 text-center">
                      <p className="text-[9px] text-slate-400 font-mono leading-normal m-0">
                        This is an automated regulatory notification sent to verified tenants in compliance with EU Sovereign Data Residency mandates.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* Action Suite */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={copyEmailHtml}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors bg-white cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Copy HTML Code
                </button>
                <button
                  type="button"
                  onClick={handleSendNotification}
                  disabled={isSending}
                  className={`flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm ${
                    isSending ? 'animate-pulse cursor-not-allowed' : ''
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Distributing TLS Broadcast...' : 'Broadcast Notification Email'}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
