import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Landmark, Percent, RefreshCw, AlertCircle, 
  CheckCircle2, Globe, Building2, ShieldCheck, Database, Sliders
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface RegulatorBillingConfig {
  regulator_id: number;
  regulator_name: string;
  commission_rate: number;
  base_subscription_fee_cents: number;
  billing_cycle: 'MONTHLY' | 'YEARLY';
}

export const RegulatorBillingConfigManager: React.FC = () => {
  const { showToast } = useNotification();
  const [configs, setConfigs] = useState<RegulatorBillingConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RegulatorBillingConfig | null>(null);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/finance/platform/regulators/configs');
      const data = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleStartEdit = (config: RegulatorBillingConfig) => {
    setEditingId(config.regulator_id);
    setEditForm({ ...config });
  };

  const handleSave = async () => {
    if (!editForm) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/finance/platform/regulator/${editForm.regulator_id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: editForm.commission_rate,
          baseSubscriptionFeeCents: editForm.base_subscription_fee_cents,
          billingCycle: editForm.billing_cycle
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchConfigs();
        showToast('Regulator billing configuration updated successfully.', 'success');
      }
    } catch (err) {
      console.error('Failed to update config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Regulator Monetization Engine
          </h2>
          <p className="text-sm text-slate-500">Configure global commission rates and SaaS service fees for partner regulators.</p>
        </div>
        <button 
          onClick={fetchConfigs}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors border-0 bg-transparent cursor-pointer"
        >
          <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <span className="text-sm text-slate-400">Loading monetization profiles...</span>
          </div>
        ) : configs.length === 0 ? (
          <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
             <p className="text-sm text-slate-400">No regulator configurations found.</p>
          </div>
        ) : (
          configs.map((config) => (
            <motion.div 
              key={config.regulator_id}
              layout
              className={`p-6 bg-white border rounded-2xl shadow-xs transition-all ${
                editingId === config.regulator_id ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{config.regulator_name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded uppercase tracking-wider border border-indigo-100">
                        Regulator ID: {config.regulator_id}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase tracking-wider border border-slate-200">
                        {config.billing_cycle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Commission Rate</label>
                    {editingId === config.regulator_id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          step="0.1"
                          value={editForm?.commission_rate}
                          onChange={e => setEditForm(prev => prev ? ({...prev, commission_rate: Number(e.target.value)}) : null)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    ) : (
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {config.commission_rate.toFixed(1)}%
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Base Monthly Fee</label>
                    {editingId === config.regulator_id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">€</span>
                        <input 
                          type="number"
                          value={editForm ? editForm.base_subscription_fee_cents / 100 : 0}
                          onChange={e => setEditForm(prev => prev ? ({...prev, base_subscription_fee_cents: Number(e.target.value) * 100}) : null)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    ) : (
                      <div className="text-lg font-black text-slate-900 font-mono text-emerald-600">
                        €{(config.base_subscription_fee_cents / 100).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:block space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Billing Cycle</label>
                    {editingId === config.regulator_id ? (
                      <select 
                        value={editForm?.billing_cycle}
                        onChange={e => setEditForm(prev => prev ? ({...prev, billing_cycle: e.target.value as any}) : null)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    ) : (
                      <div className="text-sm font-bold text-slate-700 mt-1">
                        {config.billing_cycle === 'MONTHLY' ? 'Every 30 Days' : 'Annual Settlement'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {editingId === config.regulator_id ? (
                    <>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all border-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleStartEdit(config)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all border-0 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      Configure Rules
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
          <strong>Settlement Policy:</strong> Commission rates are applied instantly upon successful penalty collection from enterprises. 
          Base subscription fees are deducted from the regulator's cleared vault balance on the first of every month. 
          All monetization adjustments are logged in the sovereign audit trail for transparency reconciliation.
        </p>
      </div>
    </div>
  );
};
