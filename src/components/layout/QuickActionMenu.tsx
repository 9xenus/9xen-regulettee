import React, { useState } from 'react';
import { Zap, FileText, AlertTriangle, LifeBuoy, X, Sparkles, ChevronUp, Share2, ShieldAlert } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { getNormalizedRole } from './FeatureMaskingMiddleware';

interface QuickActionMenuProps {
  onNavigate: (path: string) => void;
  role?: string;
}

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({ onNavigate, role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useNotification();
  const normalizedRole = getNormalizedRole(role);

  const isAdminOrRegulator = ['ADMIN', 'SUPER_ADMIN', 'EU_REGULATOR', 'REGULATOR'].includes(normalizedRole);
  const isLawyerOrAdmin = ['ADMIN', 'SUPER_ADMIN', 'LAWYER', 'LEGAL_CONSULTANT'].includes(normalizedRole);

  const handleAction = (actionType: string) => {
    setIsOpen(false);
    switch (actionType) {
      case 'integrations':
        showToast('Opening Zero-Downtime Integrations & Webhooks Hub...', 'success');
        onNavigate('integrations');
        break;
      case 'report':
        showToast('Generating Executive Compliance Audit Report...', 'success');
        setTimeout(() => {
          onNavigate('reports');
        }, 800);
        break;
      case 'violations':
        showToast('Navigating to Active Regulatory Violations...', 'info');
        onNavigate('violations');
        break;
      case 'ticket':
        showToast('Support Ticket portal opened.', 'info');
        onNavigate('client-dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu Popover */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">Quick Actions</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Restricted Sensitive Action: Integrations Manager */}
            {isAdminOrRegulator && (
              <button
                onClick={() => handleAction('integrations')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-all group text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100/60 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Zero-Downtime Integrations</p>
                  <p className="text-[10px] text-slate-400">9-in-1 Connectors, Webhooks &amp; e-KYC</p>
                </div>
              </button>
            )}

            {/* General Action: Generate Compliance Report */}
            <button
              onClick={() => handleAction('report')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-indigo-700 text-xs font-medium transition-all group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100/60 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">Generate Compliance Report</p>
                <p className="text-[10px] text-slate-400">Export audit package &amp; metrics</p>
              </div>
            </button>

            {/* Restricted Sensitive Action: View Violations */}
            {(isAdminOrRegulator || isLawyerOrAdmin) && (
              <button
                onClick={() => handleAction('violations')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-amber-50/70 text-slate-700 hover:text-amber-700 text-xs font-medium transition-all group text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100/60 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">View Active Violations</p>
                  <p className="text-[10px] text-slate-400">Inspect real-time risk breaches</p>
                </div>
              </button>
            )}

            {/* Standard Action: Support Ticket */}
            <button
              onClick={() => handleAction('ticket')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-all group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/60 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">Submit Support Ticket</p>
                <p className="text-[10px] text-slate-400">Contact compliance engineer</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 bg-indigo-600/95 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all duration-300 cursor-pointer group backdrop-blur-md ring-4 ring-indigo-500/20 active:scale-95 ${isOpen ? 'rotate-0' : 'hover:-translate-y-1'}`}
        title="Quick Actions Menu"
      >
        <Zap className={`w-4 h-4 text-yellow-300 transition-transform ${isOpen ? 'scale-90 opacity-70' : 'animate-pulse'}`} />
        <span className="text-xs font-semibold tracking-wide hidden sm:inline mr-1">Quick Actions</span>
        <div className={`w-5 h-5 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-black/20' : ''}`}>
          <ChevronUp className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};
