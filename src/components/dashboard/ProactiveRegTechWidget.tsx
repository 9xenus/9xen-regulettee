import React, { useState, useEffect } from 'react';
import { BrainCircuit, Activity, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export const ProactiveRegTechWidget: React.FC = () => {
  const chartData = [
    { name: 'Jan', risk: 15 }, { name: 'Feb', risk: 18 }, { name: 'Mar', risk: 14 }, 
    { name: 'Apr', risk: 22 }, { name: 'May', risk: 25 }, { name: 'Jun', risk: 45 },
  ];

  const handleLaunchEngine = () => {
    // Navigate via History API to trigger App.tsx routing
    window.history.pushState({}, '', '/proactive-regtech-engine');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            Proactive RegTech AI
          </h3>
          <p className="text-xs text-slate-500 mt-1">Predictive AML Violation Forecast</p>
        </div>
        <span className="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-xs font-bold rounded flex items-center gap-1 animate-pulse">
          <Activity className="w-3 h-3" /> +35% Risk
        </span>
      </div>

      <div className="h-[120px] w-full -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRiskWidget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ stroke: '#f43f5e', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRiskWidget)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <button 
          onClick={handleLaunchEngine}
          className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Cpu className="w-4 h-4 text-indigo-500" />
          Run "What-If" Simulation
        </button>
        <button 
          onClick={handleLaunchEngine}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          Open AI Control Center <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
