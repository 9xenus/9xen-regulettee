import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, X, CheckCircle2, AlertTriangle, Key, Cpu, 
  RefreshCw, Globe, Scale, Send, FileText, Plus, Trash2, Loader2, Lock
} from 'lucide-react';
import { TenantAccount } from '../../pages/AdminTenants';
import { useNotification } from '../../context/NotificationContext';
import { fetchWithRetry } from '../../lib/api-client';

interface TenantRegulatorConfigModalProps {
  tenant: TenantAccount;
  onClose: () => void;
  onUpdated?: () => void;
}

interface EnforcementTemplate {
  id: string;
  title: string;
  framework: string;
  penalty_cap: string;
}

interface RegulatorConfig {
  tenant_id: string;
  authority_code: string;
  mandate_scope: string;
  inspection_power_level: string;
  sanction_ceiling_eur: number;
  airgapped_vault_node: string;
  direct_stream_enabled: number | boolean;
  inspector_access_key: string;
  enforcement_templates: EnforcementTemplate[];
}

export const TenantRegulatorConfigModal: React.FC<TenantRegulatorConfigModalProps> = ({
  tenant,
  onClose,
  onUpdated
}) => {
  const { showToast } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<RegulatorConfig | null>(null);

  // New enforcement template input
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateFramework, setNewTemplateFramework] = useState('EU AI Act Art 67');
  const [newTemplateCap, setNewTemplateCap] = useState('€35,000,000');

  useEffect(() => {
    fetchRegulatorConfig();
  }, [tenant.id]);

  const fetchRegulatorConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}/regulator-config`);
      const data = await res.json();
      if (data.success && data.config) {
        setConfig({
          ...data.config,
          enforcement_templates: Array.isArray(data.config.enforcement_templates) 
            ? data.config.enforcement_templates 
            : []
        });
      }
    } catch (err) {
      console.error('Failed to load regulator config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotateKey = () => {
    if (!config) return;
    const newKey = `REG-PQC-KYBER1024-${Math.random().toString(36).substring(2, 9).toUpperCase()}-SECURE`;
    setConfig({
      ...config,
      inspector_access_key: newKey
    });
    showToast('Generated new Quantum-Safe Kyber-1024 Inspector Key.', 'info');
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle || !config) return;
    const newTpl: EnforcementTemplate = {
      id: `enf_${Date.now()}`,
      title: newTemplateTitle,
      framework: newTemplateFramework,
      penalty_cap: newTemplateCap
    };
    setConfig({
      ...config,
      enforcement_templates: [...config.enforcement_templates, newTpl]
    });
    setNewTemplateTitle('');
  };

  const handleRemoveTemplate = (id: string) => {
    if (!config) return;
    setConfig({
      ...config,
      enforcement_templates: config.enforcement_templates.filter(t => t.id !== id)
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await fetchWithRetry(`/api/v1/tenants/${tenant.id}/regulator-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        showToast(`Regulator Authority configuration saved for ${tenant.name}`, 'success');
        if (onUpdated) onUpdated();
      } else {
        showToast(data.error || 'Failed to update regulator configuration', 'error');
      }
    } catch (err) {
      showToast('Error saving regulator configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">Regulator Authority Governance &amp; Oversight Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Direct Statutory Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Authority: <strong className="text-slate-800">{tenant.name}</strong> • Jurisdiction: <span className="text-amber-800 font-semibold">{tenant.country} ({tenant.region})</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
              <p className="text-xs font-mono text-slate-500">Loading statutory oversight configurations...</p>
            </div>
          ) : config ? (
            <form onSubmit={handleSaveConfig} className="space-y-4 sm:space-y-6">
              
              {/* Statutory Identification */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-700" />
                  <span>Statutory Authority Credentials &amp; Mandate</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Statutory Authority Code
                    </label>
                    <input
                      type="text"
                      value={config.authority_code}
                      onChange={(e) => setConfig({ ...config, authority_code: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Inspection Power Level
                    </label>
                    <select
                      value={config.inspection_power_level}
                      onChange={(e) => setConfig({ ...config, inspection_power_level: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="DIRECT_ENFORCEMENT">DIRECT ENFORCEMENT &amp; AUDIT</option>
                      <option value="SANCTION_IMPOSING">SANCTION &amp; FINE IMPOSING</option>
                      <option value="OBSERVER_ONLY">CROSS-BORDER OBSERVER ONLY</option>
                      <option value="SPECIAL_INVESTIGATOR">SPECIAL DEFENSE / CYBER INVESTIGATOR</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Mandate Scope &amp; Legal Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={config.mandate_scope}
                      onChange={(e) => setConfig({ ...config, mandate_scope: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Statutory Fine / Penalty Ceiling (€ EUR)
                    </label>
                    <input
                      type="number"
                      value={config.sanction_ceiling_eur}
                      onChange={(e) => setConfig({ ...config, sanction_ceiling_eur: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Air-Gapped Sovereign Audit Node URL
                    </label>
                    <input
                      type="text"
                      value={config.airgapped_vault_node}
                      onChange={(e) => setConfig({ ...config, airgapped_vault_node: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* Direct Telemetry Stream Switch */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/80">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">Direct Realtime Inspection Data Stream</span>
                    <span className="text-[10px] text-slate-500">Allows regulator direct cryptographic live telemetry ingress into supervised tenants</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(config.direct_stream_enabled)}
                    onChange={(e) => setConfig({ ...config, direct_stream_enabled: e.target.checked ? 1 : 0 })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quantum Cryptographic Inspector Key */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Key className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">PQC Kyber-1024 Inspector Credential Key</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRotateKey}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold font-mono transition-colors"
                  >
                    Rotate Inspector Key
                  </button>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-slate-700 font-mono text-xs text-emerald-400 break-all select-all">
                  {config.inspector_access_key}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Used by accredited state inspectors for Zero-Knowledge verifiable audits on the European B2G compliance mesh.
                </p>
              </div>

              {/* Pre-configured Enforcement Templates */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Statutory Enforcement Notice Templates ({config.enforcement_templates.length})</span>
                </h3>

                <div className="space-y-2">
                  {config.enforcement_templates.map((tpl) => (
                    <div key={tpl.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{tpl.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tpl.framework} • Cap: <strong className="text-amber-800">{tpl.penalty_cap}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplate(tpl.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new template row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 items-center text-xs">
                  <input
                    type="text"
                    placeholder="New Notice Title (e.g. AI Model Safety Audit)"
                    value={newTemplateTitle}
                    onChange={(e) => setNewTemplateTitle(e.target.value)}
                    className="flex-1 min-w-[200px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Framework"
                    value={newTemplateFramework}
                    onChange={(e) => setNewTemplateFramework(e.target.value)}
                    className="w-36 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Penalty Cap"
                    value={newTemplateCap}
                    onChange={(e) => setNewTemplateCap(e.target.value)}
                    className="w-28 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddTemplate}
                    disabled={!newTemplateTitle}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Regulator Configuration'}
                </button>
              </div>
            </form>
          ) : null}
        </div>

      </div>
    </div>
  );
};
