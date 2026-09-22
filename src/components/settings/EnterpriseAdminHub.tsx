import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Shield,
  Activity, 
  CreditCard, 
  Workflow, 
  Cpu, 
  Layers, 
  Eye, 
  AlertTriangle,
  Globe,
  Settings,
  ChevronRight,
  Database,
  Key,
  History,
  CheckCircle2,
  Lock,
  RefreshCw,
  TrendingUp,
  PieChart,
  MessageSquare,
  Scale
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { HierarchyManager } from './HierarchyManager';
import { AIGovernance } from './AIGovernance';
import { SecurityAdvanced } from './SecurityAdvanced';
import { BillingAdvanced } from './BillingAdvanced';
import { WorkflowBuilder } from './WorkflowBuilder';
import { IntegrationHealth } from './IntegrationHealth';
import { RBACManager } from './RBACManager';
import { ThreeTierAccessHub } from './ThreeTierAccessHub';

type EnterpriseTab = 'hierarchy' | 'rbac' | 'three-tier' | 'white-label' | 'security' | 'billing' | 'workflow' | 'residency' | 'ai-governance' | 'health';

export const EnterpriseAdminHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EnterpriseTab>('three-tier');

  const tabs = [
    { id: 'three-tier', label: 'Three-Tier Access', icon: Scale, desc: 'Regulator, Lawyer & Client unified architecture' },
    { id: 'hierarchy', label: 'Org & Entities', icon: Building2, desc: 'Manage parent-subsidiary structures' },
    { id: 'rbac', label: 'Access Control', icon: Shield, desc: 'Roles, permissions, and user assignments' },
    { id: 'white-label', label: 'White-Label', icon: Eye, desc: 'Brand and reseller configurations' },
    { id: 'security', label: 'Advanced Security', icon: ShieldCheck, desc: 'BYOK, adaptive sessions, break-glass' },
    { id: 'billing', label: 'Usage & Cost', icon: CreditCard, desc: 'Forecasting and cost allocation' },
    { id: 'workflow', label: 'Approvals', icon: Workflow, desc: 'Visual approval chain builder' },
    { id: 'residency', label: 'Data Residency', icon: Globe, desc: 'Per-module geo-pinning' },
    { id: 'ai-governance', label: 'AI Governance', icon: Cpu, desc: 'Feature control and accuracy metrics' },
    { id: 'health', label: 'System Health', icon: Activity, desc: 'Integration status and staging' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <div className="flex border-b border-gray-200 bg-white px-8 pt-6">
        <div className="flex space-x-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EnterpriseTab)}
              className={cn(
                "flex flex-col items-center pb-4 border-b-2 transition-all min-w-[120px]",
                activeTab === tab.id 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className="w-5 h-5 mb-2" />
              <span className="text-xs font-semibold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            {activeTab === 'three-tier' && <ThreeTierAccessHub />}
            {activeTab === 'hierarchy' && <HierarchyManager />}
            {activeTab === 'rbac' && <RBACManager />}
            {activeTab === 'ai-governance' && <AIGovernance />}
            {activeTab === 'security' && <SecurityAdvanced />}
            {activeTab === 'billing' && <BillingAdvanced />}
            {activeTab === 'workflow' && <WorkflowBuilder />}
            {activeTab === 'health' && <IntegrationHealth />}
            
            {activeTab === 'white-label' && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">White-Label & Reseller Mode</h2>
                    <p className="text-gray-500 mt-1">Configure partner branding and rolling up usage.</p>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Active Partner Tier</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Partner Brand Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Global Compliance Partners"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Domain (CNAME)</label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <span className="bg-gray-50 px-4 py-3 text-gray-500 border-r border-gray-300 italic">https://</span>
                        <input 
                          type="text" 
                          placeholder="compliance.yourbrand.com"
                          className="flex-1 px-4 py-3 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                      <input 
                        type="email" 
                        placeholder="support@yourbrand.com"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Layers className="w-5 h-5 mr-2 text-blue-600" />
                        Branding Preview
                      </h3>
                      <div className="aspect-video bg-white rounded-lg border border-gray-200 flex items-center justify-center p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                            <Eye className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Powered by 9Xen Regulettee</p>
                            <p className="text-xl font-black text-gray-900 tracking-tight mt-1">YOUR BRAND NAME</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div>
                        <p className="font-bold text-gray-900">Reseller Multi-Tenancy</p>
                        <p className="text-xs text-gray-500">Allow sub-accounts under this brand</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative transition-all">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200 flex justify-end space-x-4">
                  <button className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-all">Discard Changes</button>
                  <button className="px-8 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black shadow-lg hover:shadow-xl transition-all">Deploy White-Label</button>
                </div>
              </div>
            )}

            {activeTab === 'residency' && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Modular Data Residency</h2>
                    <p className="text-gray-500 mt-1">Pin specific module data to geographic regions independently.</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Run Residency Audit
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'vault', name: 'Identity Vault', region: 'Germany (EU-Central-1)', status: 'Compliant', color: 'blue' },
                    { id: 'comms', name: 'Secure Communications', region: 'Switzerland (CH-West-1)', status: 'Compliant', color: 'emerald' },
                    { id: 'billing', name: 'Financial Records', region: 'USA (US-East-1)', status: 'Exception Active', color: 'amber' },
                    { id: 'ai', name: 'AI Inference Cache', region: 'Singapore (AP-Southeast-1)', status: 'Compliant', color: 'purple' },
                  ].map((module) => (
                    <div key={module.id} className="group flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-400 transition-all">
                      <div className="flex items-center space-x-6">
                        <div className={cn("p-3 rounded-xl", `bg-${module.color}-50 text-${module.color}-600`)}>
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{module.name}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Globe className="w-4 h-4 mr-1.5" />
                            {module.region}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className={cn("text-sm font-bold uppercase tracking-wider", 
                            module.status === 'Compliant' ? 'text-emerald-600' : 'text-amber-600'
                          )}>
                            {module.status}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">Last Verified: 2h ago</p>
                        </div>
                        <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-900">Residency Conflict Detected</h4>
                      <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                        Financial Records are currently pinned to US-East-1 while the master policy requires EU-Central-1 for this tenant. 
                        A temporary regulatory exception (EX-9921) is active until Oct 21, 2026.
                      </p>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                        Resolve Residency Alignment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
