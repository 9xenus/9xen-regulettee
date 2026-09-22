import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { ShieldAlert, TrendingDown, Activity } from 'lucide-react';

// Monte Carlo simulation function
const runSimulation = (iterations = 1000) => {
  const data = [];
  let baseValuation = 1000000000; // $1B
  
  for (let i = 0; i < iterations; i++) {
    // Simulate breach probability: 5% chance
    const breachOccurred = Math.random() < 0.05;
    let impact = 0;
    
    if (breachOccurred) {
      // Impact range: $50M - $300M
      impact = Math.random() * (300000000 - 50000000) + 50000000;
    }
    
    data.push({
      iteration: i,
      valuation: baseValuation - impact,
      liability: impact
    });
  }
  return data;
};

export const QuantumRiskAssessment: React.FC = () => {
  const [simulationData, setSimulationData] = useState<any[]>([]);

  useEffect(() => {
    setSimulationData(runSimulation());
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <ShieldAlert className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-black text-slate-900">Quantum Risk Assessment</h2>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={simulationData.slice(0, 100)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="iteration" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="valuation" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase">Avg Liability</div>
          <div className="text-2xl font-black text-rose-600">
            ${simulationData.length > 0 ? (simulationData.reduce((acc, curr) => acc + curr.liability, 0) / simulationData.length / 1000000).toFixed(1) : 0}M
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase">Risk-Adjusted Value</div>
          <div className="text-2xl font-black text-indigo-600">
            ${simulationData.length > 0 ? (simulationData.reduce((acc, curr) => acc + curr.valuation, 0) / simulationData.length / 1000000000).toFixed(2) : 0}B
          </div>
        </div>
      </div>
    </div>
  );
};
