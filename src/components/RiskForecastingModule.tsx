import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  Users, 
  Search,
  Filter,
  BarChart2,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Legend
} from 'recharts';

interface TenantRiskProfile {
  id: string;
  name: string;
  sector: string;
  historicalViolations: number;
  currentStressScore: number;
  predictedStressScore: number;
  riskTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  primaryRiskFactor: string;
}

const MOCK_TENANTS: TenantRiskProfile[] = [
  { id: 't_1', name: 'Global Health Systems', sector: 'Healthcare', historicalViolations: 4, currentStressScore: 68, predictedStressScore: 85, riskTrend: 'INCREASING', primaryRiskFactor: 'High Volume Biometric Processing' },
  { id: 't_2', name: 'FinTech Nexus', sector: 'Finance', historicalViolations: 2, currentStressScore: 45, predictedStressScore: 42, riskTrend: 'STABLE', primaryRiskFactor: 'Cross-border Data Transfers' },
  { id: 't_3', name: 'NeuroTech Labs', sector: 'AI Labs', historicalViolations: 7, currentStressScore: 82, predictedStressScore: 94, riskTrend: 'INCREASING', primaryRiskFactor: 'Unregistered Foundation Models' },
  { id: 't_4', name: 'EuroRetail Network', sector: 'E-commerce', historicalViolations: 1, currentStressScore: 30, predictedStressScore: 25, riskTrend: 'DECREASING', primaryRiskFactor: 'Cookie Consent Drift' },
  { id: 't_5', name: 'GovCloud Services', sector: 'Public Sector', historicalViolations: 0, currentStressScore: 15, predictedStressScore: 18, riskTrend: 'STABLE', primaryRiskFactor: 'Data Sovereignty Alignment' },
];

const TIME_SERIES_DATA = [
  { month: 'Jan', historicalFines: 12, predictedStress: 10, actualStress: 12 },
  { month: 'Feb', historicalFines: 15, predictedStress: 14, actualStress: 16 },
  { month: 'Mar', historicalFines: 11, predictedStress: 18, actualStress: 15 },
  { month: 'Apr', historicalFines: 22, predictedStress: 25, actualStress: 24 },
  { month: 'May', historicalFines: 18, predictedStress: 22, actualStress: 19 },
  { month: 'Jun', historicalFines: 25, predictedStress: 28, actualStress: 26 },
  { month: 'Jul', historicalFines: 0, predictedStress: 35, actualStress: null },
  { month: 'Aug', historicalFines: 0, predictedStress: 42, actualStress: null },
  { month: 'Sep', historicalFines: 0, predictedStress: 48, actualStress: null },
  { month: 'Oct', historicalFines: 0, predictedStress: 65, actualStress: null },
];

export const RiskForecastingModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredTenants = MOCK_TENANTS.filter(t => {
    if (selectedSector !== 'ALL' && t.sector !== selectedSector) return false;
    if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.predictedStressScore - a.predictedStressScore);

  const triggerAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/20 border border-indigo-500/30 p-2.5 rounded-xl">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                ML Risk Forecasting
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                AI-driven predictive models analyzing historical violations to forecast upcoming tenant compliance stress.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={triggerAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span>{isAnalyzing ? 'Recalculating Weights...' : 'Run Prediction Matrix'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 text-indigo-500 mr-2" />
                Ecosystem Compliance Stress Forecast
              </h3>
              <div className="flex items-center space-x-4 text-xs font-medium">
                <span className="flex items-center text-slate-500"><div className="w-3 h-3 bg-slate-200 rounded-full mr-1.5" /> Historical Fines</span>
                <span className="flex items-center text-indigo-600"><div className="w-3 h-3 bg-indigo-500 rounded-full mr-1.5" /> Predicted Stress</span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={TIME_SERIES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="historicalFines" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line type="monotone" dataKey="predictedStress" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
             <div className="bg-rose-100 p-3 rounded-full shrink-0">
               <AlertTriangle className="w-6 h-6 text-rose-600" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-slate-800">Critical Forecast Alert</h4>
               <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                 The model indicates a <strong>65% probability</strong> of a systemic compliance failure in the <strong>AI Labs</strong> sector by October 2026. This correlates strongly with historical patterns preceding the enforcement of the EU AI Act Chapter III. Immediate preemptive audits are recommended.
               </p>
             </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-16rem)] lg:h-auto">
          <div className="mb-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 text-indigo-500 mr-2" />
              High-Risk Tenants Monitor
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search monitored tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {['ALL', 'Healthcare', 'Finance', 'AI Labs', 'E-commerce'].map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedSector === sector
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 relative">
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl"
                >
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                  <span className="text-sm font-bold text-indigo-900">Running Neural Weights...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredTenants.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium">No tenants match the criteria.</p>
              </div>
            ) : (
              filteredTenants.map((tenant) => (
                <div key={tenant.id} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{tenant.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{tenant.sector}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-black font-mono ${
                        tenant.predictedStressScore >= 80 ? 'text-rose-600' :
                        tenant.predictedStressScore >= 50 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {tenant.predictedStressScore}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Predicted Risk</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Current Stress:</span>
                      <span className="font-mono font-bold text-slate-700">{tenant.currentStressScore}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Historical Violations:</span>
                      <span className="font-mono font-bold text-slate-700">{tenant.historicalViolations}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <TrendingUp className={`w-3.5 h-3.5 ${
                          tenant.riskTrend === 'INCREASING' ? 'text-rose-500' :
                          tenant.riskTrend === 'DECREASING' ? 'text-emerald-500' : 'text-slate-400'
                        }`} />
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                          {tenant.primaryRiskFactor}
                        </span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 hover:text-indigo-800 p-1">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
