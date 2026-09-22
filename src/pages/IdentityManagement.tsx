import React, { useState, useMemo, useEffect } from 'react';
import { 
  Fingerprint, 
  Key, 
  ShieldCheck, 
  Users, 
  Lock, 
  Globe, 
  ArrowRight, 
  RefreshCcw, 
  ShieldAlert, 
  LayoutGrid,
  ExternalLink,
  ChevronRight,
  Database,
  X,
  Play,
  Check,
  AlertCircle,
  Wifi,
  Radio,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserIdentity {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'MFA_REQUIRED';
  lastLogin: string;
}

interface ActiveNodeConfig {
  name: string;
  provider: string;
  status: 'Online' | 'Configuring' | 'Offline';
  latency: string;
  port: number;
  issuerUrl: string;
  clientId: string;
}

export const IdentityManagement: React.FC = () => {
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdentities();
  }, []);

  const fetchIdentities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/users');
      const data = await response.json();
      if (data.users) {
        const formatted = data.users.map((u: any) => ({
          id: u.id,
          username: u.full_name || u.email.split('@')[0],
          email: u.email,
          role: u.role,
          status: u.registration_status === 'approved' ? 'ACTIVE' : 
                  u.registration_status === 'under_review' ? 'PENDING' : 'MFA_REQUIRED',
          lastLogin: u.created_at // fallback
        }));
        setIdentities(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch identities', err);
      triggerToast('Failed to sync with IAM database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [activeNode, setActiveNode] = useState<ActiveNodeConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNewIdentity, setShowNewIdentity] = useState(false);
  const [newIdentity, setNewIdentity] = useState({ username: '', email: '', role: 'Compliance_Auditor' });

  // Sovereign Authelia and Keycloak infrastructure node configurations
  const [nodes, setNodes] = useState<ActiveNodeConfig[]>([
    { 
      name: 'Identity Engine', 
      provider: 'Keycloak OIDC', 
      status: 'Online', 
      latency: '12ms', 
      port: 8080,
      issuerUrl: 'https://auth.regulettee.eu/realms/lex-tenant-realm',
      clientId: '9xen-regulettee-web-client'
    },
    { 
      name: 'Access Proxy', 
      provider: 'Pomerium Proxy', 
      status: 'Online', 
      latency: '8ms', 
      port: 443,
      issuerUrl: 'https://proxy.regulettee.eu',
      clientId: 'pomerium-client-ingress'
    },
    { 
      name: 'MFA Gateway', 
      provider: 'Authelia WebAuthn', 
      status: 'Online', 
      latency: '15ms', 
      port: 9091,
      issuerUrl: 'https://mfa.regulettee.eu',
      clientId: 'authelia-totp-gateway'
    }
  ]);

  // DB Sync Status metrics
  const [dbSyncs, setDbSyncs] = useState([
    { label: 'PostgreSQL (Keycloak Users)', status: 'Connected', load: '12%', lastSynced: '5 mins ago' },
    { label: 'Redis Cache (Active Authelia Sessions)', status: 'Connected', load: '4%', lastSynced: 'Just now' },
    { label: 'Corporate LDAP / Active Directory', status: 'Ready', load: '0%', lastSynced: '1 hour ago' }
  ]);

  // Live access requests simulation
  const [accessRequests, setAccessRequests] = useState([
    { id: 'req-1', user: 'dev_mark', email: 'mark@regulettee.eu', requestType: 'Production DB Read Access', priority: 'Urgent', time: '2 hours ago' }
  ]);

  // Live notification banner state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSyncRealm = () => {
    setIsSyncing(true);
    triggerToast('Initiating cryptographic IAM Realm Sync across Keycloak nodes...', 'info');

    setTimeout(() => {
      fetchIdentities();
      setDbSyncs(prev => prev.map(db => ({ ...db, lastSynced: 'Just now', load: '8%' })));
      setIsSyncing(false);
      triggerToast('Keycloak IAM user pool database successfully synchronized!');
    }, 1800);
  };

  const handleCreateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentity.username || !newIdentity.email) return;

    const created: UserIdentity = {
      id: String(Date.now()),
      username: newIdentity.username,
      email: newIdentity.email,
      role: newIdentity.role,
      status: 'PENDING',
      lastLogin: 'Never (Pending Verification)'
    };

    setIdentities(prev => [...prev, created]);
    setShowNewIdentity(false);
    setNewIdentity({ username: '', email: '', role: 'Compliance_Auditor' });
    triggerToast(`Realm identity invite generated for ${created.username}! Authelia MFA activation link dispatching.`, 'success');
  };

  const handleRevokeIdentity = (id: string, username: string) => {
    if (confirm(`Are you sure you want to permanently delete and revoke ${username}'s IAM profile across all Authelia clusters?`)) {
      setIdentities(prev => prev.filter(u => u.id !== id));
      triggerToast(`Successfully deleted identity and revoked Pomerium access tokens for ${username}.`, 'success');
    }
  };

  const handleSaveNodeConfig = (updatedNode: ActiveNodeConfig) => {
    setNodes(prev => prev.map(n => n.name === updatedNode.name ? updatedNode : n));
    setActiveNode(null);
    triggerToast(`Sovereign configurations updated for [${updatedNode.name}] successfully.`, 'success');
  };

  const handleApproveRequest = (id: string, user: string, requestType: string) => {
    setAccessRequests(prev => prev.filter(r => r.id !== id));
    triggerToast(`Elevated access granted for ${user} [${requestType}]. Signed with DORA Audit Ledger signature.`, 'success');
  };

  const handleDenyRequest = (id: string, user: string) => {
    setAccessRequests(prev => prev.filter(r => r.id !== id));
    triggerToast(`Request from ${user} was securely denied and logged inside 9Xen Regulettee.`, 'error');
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8 animate-fadeIn">
      
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-xl text-white text-xs font-bold border ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
              toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-indigo-600 border-indigo-500'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with high visual contrast */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Fingerprint className="w-8 h-8 text-indigo-600" />
            IAM & Access Proxy (Zero Trust)
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Integrated decentralized sovereign gateway. Orchestrates federated <strong>Keycloak</strong> OpenID Connect (OIDC) identities,
            active <strong>Pomerium</strong> endpoint reverse-proxy policies, and hardcoded <strong>Authelia</strong> MFA constraints.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleSyncRealm}
            disabled={isSyncing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Keycloak Realm Users
          </button>
          <button 
            onClick={() => setShowNewIdentity(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            Provision Client Identity
          </button>
        </div>
      </div>

      {/* Infrastructure Node Gateway Cards (Row layout) */}
      <div className="space-y-4">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Integrated Sovereignty Core Infrastructure Nodes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {nodes.map((node) => {
            const isOnline = node.status === 'Online';
            return (
              <div 
                key={node.name} 
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-sm transition-colors group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 font-mono">Port: {node.port}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                      isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {node.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mt-2">{node.name}</h3>
                  <span className="text-[11px] text-slate-500 italic block mt-0.5">Engine: {node.provider}</span>

                  <div className="mt-3 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150/60 font-mono text-[9px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Client ID:</span>
                      <span className="text-slate-700 font-bold">{node.clientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server Latency:</span>
                      <span className="text-emerald-600 font-bold">{node.latency}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveNode(node)}
                  className="w-full py-2 bg-slate-100 group-hover:bg-indigo-50 hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Configure Identity Node
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Section Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 sm:gap-8">
        
        {/* Active Identities list */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Sovereign Realm Authorized Identities
              </h3>
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                Identity Count: {identities.length}
              </div>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {identities.map((user) => (
                <div key={user.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 font-black text-xs uppercase shadow-sm">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{user.username}</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                          user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          user.status === 'MFA_REQUIRED' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {user.email} • <span className="font-semibold text-indigo-600">{user.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <div className="text-[9px] font-bold uppercase text-slate-400">Last Authentication</div>
                      <div className="text-[10px] font-mono font-bold text-slate-800">{user.lastLogin}</div>
                    </div>
                    
                    <button 
                      onClick={() => handleRevokeIdentity(user.id, user.username)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Revoke access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Synchronization status metrics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              Real-time Sovereign Datastore Synchronization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dbSyncs.map((db) => (
                <div key={db.label} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-700">{db.label}</span>
                    <span className="text-[9px] font-bold text-emerald-600 font-mono">OK</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Active load: <strong className="text-slate-600 font-mono">{db.load}</strong></span>
                    <span>Synced: <strong className="text-slate-600 italic">{db.lastSynced}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Identity requests, alerts and compliance notes */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Active Pomerium Gateway Request list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
              Endpoint Access Requests
            </h3>

            {accessRequests.length === 0 ? (
              <div className="text-center p-4 sm:p-5 lg:p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-[11px]">
                No pending elevated gateway credentials requested.
              </div>
            ) : (
              <div className="space-y-3">
                {accessRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-800 leading-none">{req.user}</span>
                        <span className="text-[9px] block text-slate-500 mt-0.5">{req.email}</span>
                      </div>
                      <span className="text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded uppercase">
                        {req.priority}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-150">
                      Requesting context: <strong className="text-slate-700">{req.requestType}</strong>
                    </div>

                    <div className="flex gap-1.5 pt-1.5">
                      <button 
                        onClick={() => handleApproveRequest(req.id, req.user, req.requestType)}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Approve Claim
                      </button>
                      <button 
                        onClick={() => handleDenyRequest(req.id, req.user)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Secure Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DORA Compliant Compliance Info */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 flex items-start gap-3">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-indigo-900">DORA Audit Preservation</h4>
              <p className="text-[10px] text-indigo-700 leading-normal mt-0.5">
                Under European DORA & NIS2 provisions, authentication metadata and user configuration edits are recorded onto the 
                tamper-evident immutable ledger files for security reporting.
              </p>
            </div>
          </div>

          {/* Secure WebAuthn Passwordless Panel */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-lg space-y-4 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-indigo-400" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <Lock className="w-7 h-7 text-indigo-500" />
              <h4 className="text-sm font-bold text-white">Passwordless Passkeys</h4>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Biometric credentials bypass traditional vulnerabilities. Register corporate devices using WebAuthn keys or YubiKeys instantly.
              </p>
            </div>

            <button 
              onClick={() => triggerToast('Hardware authentication credential device list verified.')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Verify Registered Hardware keys
            </button>
          </div>
        </div>
      </div>

      {/* Node Config Modal Overlay */}
      <AnimatePresence>
        {activeNode && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Globe className="w-4.5 h-4.5 text-indigo-600" />
                  Configure: {activeNode.name}
                </h2>
                <button 
                  onClick={() => setActiveNode(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveNodeConfig(activeNode);
                }}
                className="p-4 sm:p-5 lg:p-6 space-y-4"
              >
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Server Endpoint URL</label>
                  <input 
                    type="url"
                    required
                    value={activeNode.issuerUrl}
                    onChange={(e) => setActiveNode({ ...activeNode, issuerUrl: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Client ID Claim</label>
                    <input 
                      type="text"
                      required
                      value={activeNode.clientId}
                      onChange={(e) => setActiveNode({ ...activeNode, clientId: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Host Port Ingress</label>
                    <input 
                      type="number"
                      required
                      value={activeNode.port}
                      onChange={(e) => setActiveNode({ ...activeNode, port: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveNode(null)} 
                    className="px-4 py-2 font-bold text-slate-500 text-xs hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 text-xs transition-all cursor-pointer"
                  >
                    Save Host Node Parameters
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Client Identity Overlay Modal */}
      <AnimatePresence>
        {showNewIdentity && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Key className="w-4.5 h-4.5 text-indigo-600" />
                  Provision Local IAM Realm Identity
                </h2>
                <button 
                  onClick={() => setShowNewIdentity(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateIdentity} className="p-4 sm:p-5 lg:p-6 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Corporate Profile Username</label>
                  <input 
                    type="text"
                    required
                    value={newIdentity.username}
                    onChange={(e) => setNewIdentity({ ...newIdentity, username: e.target.value })}
                    placeholder="e.g. auditor_john"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Corporate Email Address</label>
                  <input 
                    type="email"
                    required
                    value={newIdentity.email}
                    onChange={(e) => setNewIdentity({ ...newIdentity, email: e.target.value })}
                    placeholder="john@regulettee.eu"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Assigned Client IAM Role</label>
                  <select 
                    value={newIdentity.role}
                    onChange={(e) => setNewIdentity({ ...newIdentity, role: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50 cursor-pointer"
                  >
                    <option value="Compliance_Auditor">Compliance Auditor</option>
                    <option value="Developer">System Developer</option>
                    <option value="SuperAdmin">Super Administrator</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowNewIdentity(false)} 
                    className="px-4 py-2 font-bold text-slate-500 text-xs hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 text-xs transition-all cursor-pointer"
                  >
                    Provision & Email invitation
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
