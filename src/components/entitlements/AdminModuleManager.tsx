import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Settings, 
  Layers, 
  Check, 
  X, 
  ChevronDown, 
  AlertCircle,
  RefreshCw,
  Package
} from 'lucide-react';
import { entitlementService, TenantEntitlement } from '../../lib/entitlementEngine';

interface AdminModuleManagerProps {
  tenantId: string;
}

export const AdminModuleManager: React.FC<AdminModuleManagerProps> = ({ tenantId }) => {
  const [entitlements, setEntitlements] = useState<TenantEntitlement[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entData, planData] = await Promise.all([
        entitlementService.getTenantEntitlements(tenantId),
        entitlementService.getPlans()
      ]);
      setEntitlements(entData);
      setPlans(planData);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to synchronize module state.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleToggle = async (moduleKey: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setUpdating(moduleKey);
    try {
      const success = await entitlementService.toggleTenantModule(tenantId, moduleKey, newStatus);
      if (success) {
        setEntitlements(prev => prev.map(e => 
          e.module_key === moduleKey ? { ...e, status: newStatus as any } : e
        ));
        setMessage({ type: 'success', text: `Module ${moduleKey} ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed.' });
    } finally {
      setUpdating(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleApplyPlan = async (planKey: string) => {
    setLoading(true);
    try {
      const success = await entitlementService.applyPlan(tenantId, planKey);
      if (success) {
        await fetchData();
        setMessage({ type: 'success', text: `Subscription preset "${planKey}" applied successfully.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to apply plan preset.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const categories = Array.from(new Set(entitlements.map(e => e.category)));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Plan Presets */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Module Provisioning
          </h3>
          <p className="text-sm text-slate-500">Configure feature availability for tenant: <span className="font-mono text-blue-700">{tenantId}</span></p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Apply Preset:</label>
          <div className="relative group">
            <select 
              onChange={(e) => e.target.value && handleApplyPlan(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 cursor-pointer transition-all hover:bg-slate-100"
              defaultValue=""
            >
              <option value="" disabled>Select Plan Tier...</option>
              {plans.map(plan => (
                <option key={plan.plan_key} value={plan.plan_key}>{plan.name} Tier</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      {/* Module Grid by Category */}
      <div className="space-y-5 sm:space-y-8">
        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entitlements.filter(e => e.category === category).map((module) => (
                <div 
                  key={module.module_key}
                  className={`relative p-5 rounded-xl border transition-all duration-200 bg-white ${
                    module.status === 'ACTIVE' 
                      ? 'border-blue-200 shadow-sm' 
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${module.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    
                    <button
                      onClick={() => handleToggle(module.module_key, module.status)}
                      disabled={updating === module.module_key}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        module.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          module.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <h5 className="font-semibold text-slate-900 mb-1">{module.name}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[32px]">{module.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                    <span className="text-xs font-mono text-slate-400">{module.module_key}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      module.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {module.status}
                    </span>
                  </div>

                  {updating === module.module_key && (
                    <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
