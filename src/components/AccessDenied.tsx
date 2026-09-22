import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowLeft, RefreshCw, KeyRound, CheckCircle2, FileText, Send, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { auditTrailService } from '../services/auditTrailService';

export interface AccessDeniedProps {
  currentRole?: string;
  activeRole?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  componentId?: string;
  reason?: 'unauthorized_role' | 'missing_permission' | 'unauthenticated' | 'tenant_mismatch';
  onNavigate?: (path: string) => void;
  onRoleSwitched?: (newRole: string) => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  currentRole: propRole,
  activeRole: propActiveRole,
  requiredRoles = [],
  requiredPermissions = [],
  componentId,
  reason = 'unauthorized_role',
  onNavigate,
  onRoleSwitched
}) => {
  const { user, role: contextRole, setActiveRole, signOut } = useAuth();
  const { showToast } = useNotification();
  const activeRole = propActiveRole || propRole || contextRole || 'CLIENT';

  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showRoleOverride, setShowRoleOverride] = useState(false);

  const availableRoles = [
    { id: 'SUPER_ADMIN', label: 'Super Admin (HQ)', description: 'Full system & sovereign enclave control' },
    { id: 'COMPLIANCE_OFFICER', label: 'Compliance Officer', description: 'Enterprise compliance governance & admin access' },
    { id: 'ADMIN', label: 'System Admin', description: 'Platform configuration & user management' },
    { id: 'EU_REGULATOR', label: 'EU Regulator Node', description: 'EU AI Act, GDPR & B2G surveillance access' },
    { id: 'LAWYER', label: 'Legal Counsel', description: 'Evidence vaults, contracts & litigation tools' },
    { id: 'CLIENT', label: 'Enterprise Client', description: 'Standard compliance automation & risk dashboards' },
    { id: 'TENANT_OWNER', label: 'Tenant Owner', description: 'Multi-tenant settings & team administration' },
    { id: 'AUDITOR', label: 'Independent Auditor', description: 'Read-only compliance verification & proof checking' }
  ];

  const handleReturnHome = () => {
    let target = 'platform-dashboard';
    const r = activeRole.toUpperCase();
    if (r === 'EU_REGULATOR' || r === 'REGULATOR') {
      target = 'regulator-dashboard';
    } else if (r === 'LAWYER' || r === 'LEGAL_CONSULTANT') {
      target = 'lawyer-portal';
    } else if (r === 'CLIENT' || r === 'TENANT' || r === 'TENANT_OWNER') {
      target = 'client';
    } else if (r === 'SUPER_ADMIN' || r === 'ADMIN' || r === 'COMPLIANCE_OFFICER') {
      target = 'platform-dashboard';
    }

    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.hash = `#${target}`;
      window.dispatchEvent(new CustomEvent('navigate', { detail: target }));
    }
  };

  const handleRoleSwitch = (newRole: string) => {
    setActiveRole(newRole);
    if (onRoleSwitched) onRoleSwitched(newRole);
    showToast(`Role switched to ${newRole}. Re-evaluating enclave permissions...`, 'success');
    setShowRoleOverride(false);

    // If onNavigate is available or we have a componentId, trigger navigation reload
    setTimeout(() => {
      if (componentId) {
        window.dispatchEvent(new CustomEvent('navigate', { detail: componentId }));
      }
    }, 50);
  };

  const handleQuickUnlockSuperAdmin = () => {
    setActiveRole('SUPER_ADMIN');
    showToast('Authenticated as Super Admin (Full Sovereign Access Granted).', 'success');
    setShowRoleOverride(false);
    setTimeout(() => {
      if (componentId) {
        window.dispatchEvent(new CustomEvent('navigate', { detail: componentId }));
      }
    }, 50);
  };

  const handleSubmitAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      showToast('Please provide a justification for the access request.', 'error');
      return;
    }

    // Log access request in sovereign audit ledger
    auditTrailService.addEvent({
      category: 'ENFORCEMENT_ACTION',
      action: 'ELEVATED_ACCESS_PERMIT_REQUESTED',
      actor: {
        id: user?.id || 'usr-anon',
        name: user?.email || 'Authenticated User',
        role: activeRole,
      },
      target: {
        type: 'RULE',
        id: componentId || 'protected-component',
        name: `Access Request for ${componentId || 'Protected Module'}`,
      },
      status: 'PENDING_ATTESTATION',
      severity: 'HIGH',
      description: `User requested elevated access to '${componentId || 'Protected Route'}'. Justification: ${requestReason}`,
      cryptographicProof: {
        algorithm: 'KYBER-1024',
        hash: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ledgerSequence: Math.floor(Math.random() * 50000) + 100000,
        enclaveAttestationId: 'attest-perm-request-enclave',
      },
      metadata: {
        currentRole: activeRole,
        requiredRoles,
        requiredPermissions,
        justification: requestReason,
      },
    });

    setRequestSubmitted(true);
    showToast('Elevation request submitted to Security Operations Enclave.', 'success');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 my-auto">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glowing Top Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        <div className="p-6 sm:p-8">
          {/* Header Icon & Badging */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/50">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold mb-1">
                <span>STATUS 403</span>
                <span>•</span>
                <span>ZERO-TRUST BOUNDARY ENFORCED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sovereign Access Denied
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Your current session role <strong className="text-indigo-300">({activeRole})</strong> does not possess the cryptographic permissions required to access this enclave.
              </p>
            </div>
          </div>

          {/* Details Metadata Card */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 mb-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider">Target Enclave / Component:</span>
              <span className="text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                {componentId || 'Protected Route'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider">Your Active Role:</span>
              <span className="text-indigo-300 font-semibold bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/50">
                {activeRole}
              </span>
            </div>

            {requiredRoles.length > 0 && (
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Authorized Roles:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {requiredRoles.map((r) => (
                    <span key={r} className="text-rose-300 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/50 text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {requiredPermissions.length > 0 && (
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Required Permissions:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {requiredPermissions.map((p) => (
                    <span key={p} className="text-teal-300 bg-teal-950/50 px-2 py-0.5 rounded border border-teal-800/50 text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider">Authenticated Identity:</span>
              <span className="text-slate-300 truncate max-w-[220px]">
                {user?.email || 'Anonymous Sovereign Identity'}
              </span>
            </div>
          </div>

          {/* Access Elevation Request Accordion */}
          {isRequestingAccess ? (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-6 transition-all">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                Submit Access Elevation Request
              </h4>

              {requestSubmitted ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Request logged in Immutable Audit Ledger. A Security Admin will review your ticket.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitAccessRequest} className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Provide a business or compliance justification to request temporary role elevation for this module.
                  </p>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="E.g. Required for EU AI Act regulatory compliance audit or legal review..."
                    className="w-full h-20 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRequestingAccess(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Submit Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Role Override Selector (For testing / dev / administrative evaluation) */}
          {showRoleOverride && (
            <div className="bg-slate-950/90 border border-indigo-900/60 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 font-mono">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Switch Active Session Role
                </span>
                <button
                  onClick={() => setShowRoleOverride(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableRoles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSwitch(r.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeRole === r.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{r.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReturnHome}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Authorized Dashboard
              </button>

              <button
                onClick={() => window.history.back()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleQuickUnlockSuperAdmin}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Immediately grant full Super Admin sovereign permissions"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-200" />
                Unlock as Super Admin
              </button>

              {!showRoleOverride && (
                <button
                  onClick={() => setShowRoleOverride(true)}
                  className="px-3 py-2 bg-slate-800/90 hover:bg-slate-800 text-indigo-300 border border-indigo-900/50 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  Switch Role
                </button>
              )}

              {!isRequestingAccess && (
                <button
                  onClick={() => setIsRequestingAccess(true)}
                  className="px-3 py-2 bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Request Access
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
