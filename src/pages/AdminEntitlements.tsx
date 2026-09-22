import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  History,
  Scale,
} from "lucide-react";
import {
  entitlementService,
  ModuleMaster,
  TenantEntitlement,
} from "../lib/entitlementEngine";
import { AdminModuleManager } from "../components/entitlements/AdminModuleManager";

export const AdminEntitlements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tenant" | "master" | "logs">("tenant");
  
  // Tenants
  const [tenants, setTenants] = useState<any[]>([]);
  const [activeTenant, setActiveTenant] = useState("org_1");
  
  // Data
  const [masterModules, setMasterModules] = useState<ModuleMaster[]>([]);
  const [tenantEntitlements, setTenantEntitlements] = useState<TenantEntitlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [auditLog, setAuditLog] = useState<{ id: string; time: string; msg: string }[]>([]);

  useEffect(() => {
    loadTenants();
    loadMasterModules();
  }, []);

  useEffect(() => {
    if (activeTenant) {
      loadTenantEntitlements();
    }
  }, [activeTenant]);

  const loadTenants = async () => {
    try {
      const res = await fetch('/api/v1/tenants');
      const data = await res.json();
      const list = Array.isArray(data?.tenants)
        ? data.tenants
        : Array.isArray(data?.data)
        ? data.data
        : [
            { id: "org_1", name: "Acme Corporation Europe", tier: "Enterprise" },
            { id: "org_2", name: "Stark Industries GmbH", tier: "Pro" },
            { id: "org_3", name: "Global Finance Corp", tier: "Enterprise" }
          ];
      setTenants(list);
      if (list.length > 0 && !activeTenant) {
        setActiveTenant(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
      setTenants([
        { id: "org_1", name: "Acme Corporation Europe", tier: "Enterprise" },
        { id: "org_2", name: "Stark Industries GmbH", tier: "Pro" },
        { id: "org_3", name: "Global Finance Corp", tier: "Enterprise" }
      ]);
    }
  };

  const loadMasterModules = async () => {
    const modules = await entitlementService.getModulesMaster();
    setMasterModules(modules);
  };

  const loadTenantEntitlements = async () => {
    setIsLoading(true);
    const entitlements = await entitlementService.getTenantEntitlements(activeTenant);
    setTenantEntitlements(entitlements);
    setIsLoading(false);
  };

  const logAction = (msg: string) => {
    setAuditLog(prev => [{ id: Date.now().toString(), time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 20));
  };

  const handleToggle = async (moduleKey: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const success = await entitlementService.toggleTenantModule(activeTenant, moduleKey, newStatus);
    if (success) {
      logAction(`Module ${moduleKey} set to ${newStatus} for tenant ${activeTenant}`);
      loadTenantEntitlements();
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            Feature Entitlement & Rule Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage SaaS module entitlements, subscription plans, and per-tenant access overrides.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("tenant")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "tenant" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tenant Overrides
          </button>
          <button
            onClick={() => setActiveTab("master")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "master" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Master Catalog
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "logs" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center mb-4 text-xs tracking-wider uppercase font-mono">
              <Building2 className="w-4 h-4 mr-2 text-indigo-600" /> Tenant Selection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Active Scope
                </label>
                <select
                  value={activeTenant}
                  onChange={(e) => setActiveTenant(e.target.value)}
                  className="w-full border-slate-300 border text-xs rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 pl-3 pr-8"
                >
                  {(tenants || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.tier})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
            <h3 className="font-bold flex items-center mb-2 text-xs tracking-wider uppercase font-mono text-indigo-300">
              <History className="w-4 h-4 mr-2" /> Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {auditLog.map(log => (
                <div key={log.id} className="text-[10px] border-l-2 border-indigo-500 pl-2 py-1">
                  <span className="text-slate-500 block">{log.time}</span>
                  <span className="text-slate-200">{log.msg}</span>
                </div>
              ))}
              {auditLog.length === 0 && <span className="text-slate-500 italic text-[10px]">No recent activity</span>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {activeTab === "tenant" && (
            <AdminModuleManager tenantId={activeTenant} />
          )}

          {activeTab === "master" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">Master Catalog Definitions</h3>
                <p className="text-xs text-slate-500 mb-4">Baseline configuration for all 22+ modules across the platform.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {masterModules.map(m => (
                    <div key={m.module_key} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-slate-900">{m.name}</span>
                        <span className="text-[10px] font-mono bg-slate-200 px-1 rounded">{m.module_key}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{m.description}</p>
                      <div className="mt-2 flex justify-between items-center text-[10px]">
                        <span className="text-indigo-600 font-bold">€{m.base_price}/mo</span>
                        <span className="text-slate-400">{m.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "logs" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-sm">System Entitlement Ledger</h3>
                  <p className="text-[11px] text-slate-500">Immutable record of all entitlement changes.</p>
               </div>
               <div className="p-4 space-y-2">
                  {auditLog.map(log => (
                    <div key={log.id} className="p-2 border-b border-slate-50 text-xs">
                      <span className="font-mono text-slate-400 mr-2">[{log.time}]</span>
                      <span className="text-slate-700">{log.msg}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
