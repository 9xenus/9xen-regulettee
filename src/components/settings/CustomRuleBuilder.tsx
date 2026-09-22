import React, { useState } from 'react';
import { Layers, Plus, Trash2, ArrowRight, Save, Play, Code, Database, Globe, Lock, Shield, Zap } from 'lucide-react';
import { motion, Reorder } from 'motion/react';

const blockTemplates = [
  { id: 'trigger_event', type: 'trigger', label: 'When Drift Detected', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'trigger_geo', type: 'trigger', label: 'On Geo-Access Change', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'condition_risk', type: 'condition', label: 'If Risk Score > 80', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'action_alert', type: 'action', label: 'Dispatch Slack Alert', icon: Save, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'action_block', type: 'action', label: 'Rotate API Keys', icon: Lock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export const CustomRuleBuilder: React.FC = () => {
  const [rules, setRules] = useState([
    { id: '1', name: 'Auto-Remediate High Risk Drifts', active: true, blocks: ['trigger_event', 'condition_risk', 'action_block'] },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<{name: string, blocks: string[]}>({ name: '', blocks: [] });

  const handleAddBlock = (blockId: string) => {
    setNewRule(prev => ({ ...prev, blocks: [...prev.blocks, blockId] }));
  };

  const handleSave = () => {
    if (!newRule.name || newRule.blocks.length === 0) return;
    setRules([...rules, { ...newRule, id: Date.now().toString(), active: true }]);
    setNewRule({ name: '', blocks: [] });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Composable Rule Blocks</h2>
          <p className="text-slate-500 text-xs mt-1">Design custom compliance enforcement logic using a visual, no-code block builder.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Rule
        </button>
      </div>

      {isCreating && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <input 
              type="text" 
              placeholder="Rule Name (e.g., GDPR Breach Protocol)"
              value={newRule.name}
              onChange={e => setNewRule({ ...newRule, name: e.target.value })}
              className="text-lg font-black text-slate-900 border-none focus:ring-0 placeholder:text-slate-200 p-0 w-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Palette */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Blocks</h4>
              <div className="space-y-2">
                {blockTemplates.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleAddBlock(b.id)}
                    className="w-full p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left flex items-center gap-3 group"
                  >
                    <div className={`p-1.5 rounded-lg ${b.bg} ${b.color}`}>
                      <b.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 group-hover:text-indigo-600">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Canvas</h4>
              <div className="min-h-[200px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-wrap gap-4 items-center content-start">
                {newRule.blocks.length === 0 && (
                  <p className="w-full text-center text-slate-400 text-xs py-10 font-medium">Select blocks from the palette to build your logic sequence.</p>
                )}
                {newRule.blocks.map((blockId, idx) => {
                  const b = blockTemplates.find(t => t.id === blockId)!;
                  return (
                    <React.Fragment key={idx}>
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 relative group min-w-[160px]">
                        <div className={`p-2 rounded-xl ${b.bg} ${b.color}`}>
                          <b.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-black text-slate-900 block leading-tight">{b.label}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{b.type}</span>
                        </div>
                        <button 
                          onClick={() => setNewRule(prev => ({ ...prev, blocks: prev.blocks.filter((_, i) => i !== idx) }))}
                          className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {idx < newRule.blocks.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
                >
                  Save Logic Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(rule => (
          <div key={rule.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900">{rule.name}</h4>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${rule.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                {rule.active ? 'Active' : 'Paused'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {rule.blocks.map((blockId, idx) => {
                const b = blockTemplates.find(t => t.id === blockId)!;
                return (
                  <React.Fragment key={idx}>
                    <div className={`p-2 rounded-xl ${b.bg} ${b.color} border border-transparent hover:border-current transition-all`} title={b.label}>
                      <b.icon className="w-3.5 h-3.5" />
                    </div>
                    {idx < rule.blocks.length - 1 && <ArrowRight className="w-3 h-3 text-slate-200" />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <Play className="w-3 h-3" />
                  Test
                </button>
                <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <Code className="w-3 h-3" />
                  View Code
                </button>
              </div>
              <button className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
