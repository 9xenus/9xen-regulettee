import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Edit3, Globe, CheckCircle2, ShieldAlert, Calculator, RefreshCw, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export interface RegionalTaxRule {
  id: string;
  regionCode: string;
  countryName: string;
  taxName: string;
  taxType: 'VAT' | 'GST' | 'SALES_TAX';
  rate: number;
  isActive: boolean;
  description: string;
}

export const TaxEngineManager: React.FC = () => {
  const { showToast } = useNotification();
  const [taxRules, setTaxRules] = useState<RegionalTaxRule[]>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_regional_tax_rules');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load tax rules', e);
    }
    return [
      {
        id: 'tax_de',
        regionCode: 'DE',
        countryName: 'Germany',
        taxName: 'Mehrwertsteuer (MwSt.)',
        taxType: 'VAT',
        rate: 19,
        isActive: true,
        description: 'Standard German sovereign VAT rate applied to SaaS and enterprise compliance software licenses.'
      },
      {
        id: 'tax_fr',
        regionCode: 'FR',
        countryName: 'France',
        taxName: 'Taxe sur la Valeur Ajoutée (TVA)',
        taxType: 'VAT',
        rate: 20,
        isActive: true,
        description: 'Standard French sovereign VAT rate for digital cloud services.'
      },
      {
        id: 'tax_uk',
        regionCode: 'UK',
        countryName: 'United Kingdom',
        taxName: 'UK Value Added Tax (VAT)',
        taxType: 'VAT',
        rate: 20,
        isActive: true,
        description: 'Standard UK VAT rate post-Brexit compliance enforcement.'
      },
      {
        id: 'tax_us_ca',
        regionCode: 'US-CA',
        countryName: 'United States (California)',
        taxName: 'California State & District Sales Tax',
        taxType: 'SALES_TAX',
        rate: 7.25,
        isActive: true,
        description: 'Combined California state baseline sales tax for cloud-delivered SaaS.'
      },
      {
        id: 'tax_au',
        regionCode: 'AU',
        countryName: 'Australia',
        taxName: 'Goods and Services Tax (GST)',
        taxType: 'GST',
        rate: 10,
        isActive: true,
        description: 'Australian Federal GST levied on cross-border enterprise digital supplies.'
      },
      {
        id: 'tax_ch',
        regionCode: 'CH',
        countryName: 'Switzerland',
        taxName: 'Swiss Federal MwSt / TVA',
        taxType: 'VAT',
        rate: 8.1,
        isActive: true,
        description: 'Eidgenössische Mehrwertsteuer for Swiss enterprise data enclaves.'
      }
    ];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<RegionalTaxRule>({
    id: '',
    regionCode: '',
    countryName: '',
    taxName: '',
    taxType: 'VAT',
    rate: 19,
    isActive: true,
    description: ''
  });

  // Simulator state
  const [simAmount, setSimAmount] = useState<number>(1299);
  const [simSelectedTaxId, setSimSelectedTaxId] = useState<string>('tax_de');

  useEffect(() => {
    try {
      localStorage.setItem('9xen-regulettee_regional_tax_rules', JSON.stringify(taxRules));
    } catch (e) {
      console.error('Failed to save tax rules', e);
    }
  }, [taxRules]);

  const handleAddNew = () => {
    setCurrentRule({
      id: `tax_${Date.now()}`,
      regionCode: 'EU',
      countryName: '',
      taxName: '',
      taxType: 'VAT',
      rate: 20,
      isActive: true,
      description: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (rule: RegionalTaxRule) => {
    setCurrentRule({ ...rule });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRule.countryName || !currentRule.regionCode) {
      showToast('Please fill in country name and region code.', 'error');
      return;
    }

    const exists = taxRules.some(r => r.id === currentRule.id);
    if (exists) {
      setTaxRules(taxRules.map(r => r.id === currentRule.id ? currentRule : r));
      showToast(`Tax rule for ${currentRule.countryName} updated successfully!`, 'success');
    } else {
      setTaxRules([currentRule, ...taxRules]);
      showToast(`New regional tax rule for ${currentRule.countryName} added!`, 'success');
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this regional tax rule?')) {
      setTaxRules(taxRules.filter(r => r.id !== id));
      showToast('Tax rule removed from engine.', 'success');
    }
  };

  const handleToggleActive = (id: string) => {
    setTaxRules(taxRules.map(r => {
      if (r.id === id) {
        const next = !r.isActive;
        showToast(`Tax rule ${r.countryName} (${r.rate}%) ${next ? 'enabled' : 'disabled'}`, next ? 'success' : 'info');
        return { ...r, isActive: next };
      }
      return r;
    }));
  };

  const activeTaxRule = taxRules.find(r => r.id === simSelectedTaxId) || taxRules[0];
  const calculatedTaxAmount = simAmount * ((activeTaxRule?.rate || 0) / 100);
  const calculatedTotalWithTax = simAmount + calculatedTaxAmount;

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-4 sm:p-5 lg:p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
              Autonomous Tax & VAT/GST Engine
            </span>
            <span className="text-xs text-indigo-200">Active Multi-Jurisdiction Compliance</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Regional Tax Calculation Engine</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Define sovereign Value-Added Tax (VAT), Goods and Services Tax (GST), and Sales Tax tables. The calculation engine automatically computes and attaches exact tax line items to enterprise invoices during checkout and billing generation.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Regional Tax Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tax Rules Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Configured Regional Tax Jurisdiction Tables</span>
            </span>
            <span className="text-slate-400">{taxRules.length} Sovereign Rules</span>
          </div>
          <div className="divide-y divide-slate-200 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Region / Country</th>
                  <th className="px-4 py-3">Tax Type & Title</th>
                  <th className="px-4 py-3 text-center">Rate (%)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {taxRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-xs font-extrabold rounded">
                          {rule.regionCode}
                        </span>
                        <span className="font-bold text-slate-900">{rule.countryName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 text-xs">{rule.taxName}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{rule.description}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-indigo-600 text-sm">{rule.rate}%</span>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">{rule.taxType}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(rule.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
                          rule.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(rule)}
                        title="Edit Rule"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        title="Delete Rule"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Tax Engine Simulator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Live Tax Calculation Simulator</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base Subscription / Invoice Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={simAmount}
                  onChange={(e) => setSimAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Tax Jurisdiction</label>
                <select
                  value={simSelectedTaxId}
                  onChange={(e) => setSimSelectedTaxId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {taxRules.filter(r => r.isActive).map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.countryName} ({rule.taxName} - {rule.rate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2 mt-4">
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Calculation Breakdown</div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-bold text-slate-900">€{simAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Applied Tax ({activeTaxRule?.taxName} @ {activeTaxRule?.rate}%):</span>
                  <span className="font-bold text-indigo-700">+ €{calculatedTaxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-indigo-200 pt-2 flex justify-between text-sm font-black text-indigo-950">
                  <span>Total Invoice Due:</span>
                  <span>€{calculatedTotalWithTax.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Automated Line-Item Injection</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When creating enterprise invoices or generating recurring subscription renewals, the sovereign billing engine matches tenant residency to active tax tables instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-4 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-600" />
                <span>{taxRules.some(r => r.id === currentRule.id) ? 'Edit Regional Tax Rule' : 'New Regional Tax Rule'}</span>
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Country / Jurisdiction Name</label>
                  <input
                    type="text"
                    value={currentRule.countryName}
                    onChange={(e) => setCurrentRule({ ...currentRule, countryName: e.target.value })}
                    placeholder="e.g. Germany"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Region Code</label>
                  <input
                    type="text"
                    value={currentRule.regionCode}
                    onChange={(e) => setCurrentRule({ ...currentRule, regionCode: e.target.value })}
                    placeholder="e.g. DE or US-CA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tax Title / Name</label>
                  <input
                    type="text"
                    value={currentRule.taxName}
                    onChange={(e) => setCurrentRule({ ...currentRule, taxName: e.target.value })}
                    placeholder="e.g. Mehrwertsteuer (MwSt.)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tax Type</label>
                  <select
                    value={currentRule.taxType}
                    onChange={(e) => setCurrentRule({ ...currentRule, taxType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="VAT">VAT (Value Added Tax)</option>
                    <option value="GST">GST (Goods & Services Tax)</option>
                    <option value="SALES_TAX">Sales Tax</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRule.rate}
                    onChange={(e) => setCurrentRule({ ...currentRule, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rule Status</label>
                  <select
                    value={currentRule.isActive ? 'true' : 'false'}
                    onChange={(e) => setCurrentRule({ ...currentRule, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Compliance Policy Description</label>
                <textarea
                  rows={2}
                  value={currentRule.description}
                  onChange={(e) => setCurrentRule({ ...currentRule, description: e.target.value })}
                  placeholder="Enter jurisdiction compliance notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  Save Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
