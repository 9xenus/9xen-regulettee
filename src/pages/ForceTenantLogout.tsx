import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Trash2, 
  Search, 
  Activity, 
  Radio, 
  X, 
  Check, 
  Key, 
  Lock, 
  Clock, 
  History, 
  FileSignature, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

interface ActiveSession {
  id: string;
  tenantId: string;
  tenantName: string;
  userEmail: string;
  ipAddress: string;
  region: string;
  device: string;
  loginTime: string;
  status: 'ACTIVE' | 'REVOKED';
}

interface RevocationLog {
  id: string;
  target: string;
  actionType: 'SINGLE_USER' | 'TENANT_WIDE' | 'GLOBAL';
  triggeredBy: string;
  justification: string;
  timestamp: string;
  seal: string;
}

export const ForceTenantLogout: React.FC = () => {
  const { showToast } = useNotification();
  const [searchText, setSearchText] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('ALL');
  
  // Modal states
  const [showGlobalKillModal, setShowGlobalKillModal] = useState(false);
  const [globalJustification, setGlobalJustification] = useState('');
  const [showTenantKillModal, setShowTenantKillModal] = useState<string | null>(null);
  const [tenantJustification, setTenantJustification] = useState('');
  
  const [sessions, setSessions] = useState<ActiveSession[]>([
    { id: 'sess-01', tenantId: 'org_1', tenantName: 'Acme Corporation Europe', userEmail: 'charlie.davis@acme.eu', ipAddress: '192.168.1.15', region: 'EU-CENTRAL-1', device: 'macOS / Chrome 124', loginTime: '2026-07-05 02:15:30', status: 'ACTIVE' },
    { id: 'sess-02', tenantId: 'org_1', tenantName: 'Acme Corporation Europe', userEmail: 'helena.v@acme.eu', ipAddress: '192.168.1.28', region: 'EU-CENTRAL-1', device: 'iOS / Safari', loginTime: '2026-07-05 03:00:12', status: 'ACTIVE' },
    { id: 'sess-03', tenantId: 'org_2', tenantName: 'Stark Industries GmbH', userEmail: 'banner@stark.de', ipAddress: '10.0.4.120', region: 'EU-WEST-1', device: 'Linux / Firefox Developer', loginTime: '2026-07-05 01:45:00', status: 'ACTIVE' },
    { id: 'sess-04', tenantId: 'org_3', tenantName: 'Global Finance Corp', userEmail: 'alice.v@globalfinance.eu', ipAddress: '172.16.45.89', region: 'EU-CENTRAL-1', device: 'Windows 11 / Edge', loginTime: '2026-07-05 03:10:05', status: 'ACTIVE' },
    { id: 'sess-05', tenantId: 'org_4', tenantName: 'Beta Innovations', userEmail: 'bob@betainnovations.com', ipAddress: '88.192.4.5', region: 'EU-CENTRAL-1', device: 'Android / Chrome Mobile', loginTime: '2026-07-05 02:55:18', status: 'ACTIVE' },
    { id: 'sess-06', tenantId: 'org_1', tenantName: 'Acme Corporation Europe', userEmail: 'developer.john@acme.eu', ipAddress: '192.168.1.99', region: 'EU-CENTRAL-1', device: 'macOS / VS Code Client', loginTime: '2026-07-05 03:22:47', status: 'ACTIVE' },
  ]);

  const [revocationLogs, setRevocationLogs] = useState<RevocationLog[]>([
    {
      id: 'rev-01',
      target: 'Global Finance Corp (All Users)',
      actionType: 'TENANT_WIDE',
      triggeredBy: 'Super Admin (nonacryptaiii@gmail.com)',
      justification: 'Suspicious repetitive login failures from non-EU IP address space.',
      timestamp: '2026-07-04 18:45:12',
      seal: '0x9fa4...3b1d'
    },
    {
      id: 'rev-02',
      target: 'anonymous-hacker@attacker.com',
      actionType: 'SINGLE_USER',
      triggeredBy: 'Sovereign Node AI Watchdog',
      justification: 'High-speed automated extraction attempt on core document schema.',
      timestamp: '2026-07-03 23:12:05',
      seal: '0x81b2...ef74'
    }
  ]);

  // Handle killing a single user session
  const killSingleSession = (id: string, userEmail: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'REVOKED' as const } : s));
    
    // Add revocation log
    const newLog: RevocationLog = {
      id: `rev-${Date.now()}`,
      target: userEmail,
      actionType: 'SINGLE_USER',
      triggeredBy: 'Super Admin (nonacryptaiii@gmail.com)',
      justification: 'Manual immediate session termination by Super Administrator override.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      seal: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
    };
    
    setRevocationLogs(prev => [newLog, ...prev]);
    showToast(`Session for ${userEmail} revoked successfully. Token invalidated.`, 'success');
  };

  // Handle tenant-wide session revocation
  const triggerTenantWideKill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTenantKillModal || !tenantJustification.trim()) return;

    const targetTenantId = showTenantKillModal;
    const targetTenantName = sessions.find(s => s.tenantId === targetTenantId)?.tenantName || 'Selected Tenant';

    // Terminate all sessions for this tenant
    setSessions(prev => prev.map(s => s.tenantId === targetTenantId ? { ...s, status: 'REVOKED' as const } : s));

    // Log the event
    const newLog: RevocationLog = {
      id: `rev-${Date.now()}`,
      target: `${targetTenantName} (Tenant Enclave)`,
      actionType: 'TENANT_WIDE',
      triggeredBy: 'Super Admin (nonacryptaiii@gmail.com)',
      justification: tenantJustification,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      seal: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
    };

    setRevocationLogs(prev => [newLog, ...prev]);
    showToast(`All active sessions for ${targetTenantName} have been invalidated.`, 'warning');
    setShowTenantKillModal(null);
    setTenantJustification('');
  };

  // Handle global logout termination
  const triggerGlobalKill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalJustification.trim()) return;

    // Terminate ALL sessions
    setSessions(prev => prev.map(s => ({ ...s, status: 'REVOKED' as const })));

    // Log the event
    const newLog: RevocationLog = {
      id: `rev-${Date.now()}`,
      target: 'ALL ACTIVE SESSIONS GLOBALLY',
      actionType: 'GLOBAL',
      triggeredBy: 'Super Admin (nonacryptaiii@gmail.com)',
      justification: globalJustification,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      seal: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
    };

    setRevocationLogs(prev => [newLog, ...prev]);
    showToast('GLOBAL RESET CONCLUDED: All platform authorization tokens revoked.', 'error');
    setShowGlobalKillModal(false);
    setGlobalJustification('');
  };

  // Get distinct tenants for filter list
  const tenantList = Array.from(new Set(sessions.map(s => JSON.stringify({ id: s.tenantId, name: s.tenantName }))))
    .map(s => JSON.parse(s));

  // Filters sessions to display
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.userEmail.toLowerCase().includes(searchText.toLowerCase()) || 
                          s.tenantName.toLowerCase().includes(searchText.toLowerCase()) ||
                          s.ipAddress.includes(searchText);
    const matchesTenant = selectedTenant === 'ALL' || s.tenantId === selectedTenant;
    return matchesSearch && matchesTenant;
  });

  const activeCount = sessions.filter(s => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header section with high warning accent */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rose-600 animate-pulse" />
            <span>Force Tenant Logout & Session Control</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Override cryptographic identity enclaves. Instantly revoke access tokens and force secure logouts globally or per-tenant.
          </p>
        </div>

        {/* Global Kill Override Trigger */}
        <button
          onClick={() => setShowGlobalKillModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 px-5 rounded-xl border border-rose-500 hover:border-rose-600 flex items-center gap-2 shadow-lg hover:shadow-rose-100 transition-all cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          FORCE GLOBAL EMERGENCY LOGOUT
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Active Auth Streams</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeCount}</span>
            <span className="text-xs font-bold text-slate-500">of {sessions.length} sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Active real-time WebSocket session listeners.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Sovereign Orgs</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{tenantList.length}</span>
            <span className="text-xs font-bold text-slate-500">Active Tenant Enclaves</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Isolated sandboxes connected to primary node.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Revocations Today</span>
            <Trash2 className="w-5 h-5 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {revocationLogs.filter(log => log.timestamp.includes('2026-07-05') || log.timestamp.includes('Today')).length}
            </span>
            <span className="text-xs font-bold text-slate-500">Security Actions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cryptographically sealed override entries.</p>
        </div>

        <div className="bg-slate-950 text-white border border-slate-900 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-widest font-mono">Ledger Boundary</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <div className="text-lg font-black font-mono tracking-tight text-emerald-400">0x8F92...B91E</div>
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">Active Cryptographic Seal Hash</p>
          </div>
        </div>
      </div>

      {/* Control Panels & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by user email, IP, device..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Tenant Filter */}
            <select
              value={selectedTenant}
              onChange={e => setSelectedTenant(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
            >
              <option value="ALL">All Tenants ({sessions.length} sessions)</option>
              {tenantList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Showing {filteredSessions.length} active auth sockets.</span>
          </div>
        </div>

        {/* Sessions Matrix */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <th className="p-4">Tenant / Organization</th>
                <th className="p-4">Subject Access Email</th>
                <th className="p-4">Geographic Network Info</th>
                <th className="p-4">Sign-in Device / Time</th>
                <th className="p-4">Auth Status</th>
                <th className="p-4 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No active sessions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map(sess => {
                  const isRevoked = sess.status === 'REVOKED';
                  return (
                    <tr 
                      key={sess.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isRevoked ? 'bg-rose-50/20 opacity-55' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{sess.tenantName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{sess.tenantId}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {sess.userEmail}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="font-bold text-slate-700 font-mono">{sess.ipAddress}</div>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100/50">
                          {sess.region}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5 text-slate-500">
                        <div className="font-semibold">{sess.device}</div>
                        <div className="text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {sess.loginTime}
                        </div>
                      </td>
                      <td className="p-4">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase text-rose-800 bg-rose-100 border border-rose-200 rounded-full">
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-full animate-pulse">
                            Active Socket
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={() => setShowTenantKillModal(sess.tenantId)}
                              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 text-[11px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer"
                              title="Revoke whole tenant access"
                            >
                              Kill Tenant Org
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isRevoked}
                            onClick={() => killSingleSession(sess.id, sess.userEmail)}
                            className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border shadow-xs transition-all cursor-pointer ${
                              isRevoked
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isRevoked ? 'Revoked' : 'Kill Session'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Logs Section */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Cryptographically Sealed Revocation Ledger</h3>
          </div>
          <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest">Compliance-Safe Logs</span>
        </div>

        <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
          {revocationLogs.map(log => (
            <div key={log.id} className="bg-slate-800/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all text-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-100">
                      Revocation triggered on: <span className="text-rose-400 font-extrabold">{log.target}</span>
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                      <span className="text-indigo-400 font-mono">By: {log.triggeredBy}</span>
                      <span>•</span>
                      <span>Time: {log.timestamp}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <FileSignature className="w-3.5 h-3.5 mr-1" />
                    Seal: {log.seal}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-slate-400 leading-relaxed text-[11px]">
                <strong className="text-slate-300 font-semibold uppercase text-[9px] tracking-wider block mb-0.5">Audit Justification:</strong>
                {log.justification}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: FORCE TENANT OVERRIDE */}
      <AnimatePresence>
        {showTenantKillModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Tenant Revocation Override
                </h4>
                <button 
                  onClick={() => setShowTenantKillModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={triggerTenantWideKill} className="p-5 space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  You are about to force logout <strong className="text-slate-900 font-bold">ALL active users</strong> belonging to this tenant organization.
                  This action triggers immediate JWT revocation on regional node gateways.
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Audit Log Justification (Required)</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed security justification. This is cryptographically signed and stored in the DPO Ledger."
                    value={tenantJustification}
                    onChange={e => setTenantJustification(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTenantKillModal(null);
                      setTenantJustification('');
                    }}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel Override
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm Enclave Blockade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FORCE GLOBAL LOGOUT */}
      <AnimatePresence>
        {showGlobalKillModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50">
                <h4 className="font-bold text-sm text-rose-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  GLOBAL EMERGENCY HARD LOGOUT
                </h4>
                <button 
                  onClick={() => setShowGlobalKillModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-rose-100/30 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={triggerGlobalKill} className="p-5 space-y-4 text-xs">
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-900">
                  <p className="font-black flex items-center gap-1.5 mb-1 text-rose-800 uppercase text-[10px] tracking-widest">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Critical Platform Alert
                  </p>
                  <p className="leading-relaxed font-semibold">
                    This triggers an absolute override of every active user stream and security token on the platform. All tenant databases will restrict read/write sockets until authorized.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Global Incident / Emergency Justification</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Must input specific incident response token or detailed justification statement..."
                    value={globalJustification}
                    onChange={e => setGlobalJustification(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGlobalKillModal(false);
                      setGlobalJustification('');
                    }}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Abort Override
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Execute Immediate Lockdown
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
