import React from 'react';
import { Radio, Bell, ExternalLink, Globe } from 'lucide-react';

export const RegulatoryNewsFeed: React.FC = () => {
  const news = [
    { id: 1, title: 'EU AI Act: Final technical standards published for high-risk systems', time: '10m ago', severity: 'HIGH' },
    { id: 2, title: 'DPA Ireland launches inquiry into large-scale neural network data scraping', time: '1h ago', severity: 'CRITICAL' },
    { id: 3, title: 'NIS2 Compliance: New cybersecurity reporting templates issued by ENISA', time: '3h ago', severity: 'MEDIUM' },
    { id: 4, title: 'Bilateral data transfer agreement reached between EU and South Korea', time: '5h ago', severity: 'LOW' },
    { id: 5, title: 'GDPR Enforcement: €1.2B fine issued to major social media platform for data exports', time: '12h ago', severity: 'CRITICAL' },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-tight">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          Regulatory Intelligence Feed
        </h3>
        <button className="text-[10px] text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest flex items-center gap-1">
          Source: EDPS
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {news.map((item) => (
          <div key={item.id} className="group border-l-2 border-slate-800 hover:border-indigo-500 pl-4 py-1 transition-all">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                item.severity === 'CRITICAL' ? 'bg-rose-500 text-white' :
                item.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                item.severity === 'MEDIUM' ? 'bg-indigo-500 text-white' :
                'bg-slate-700 text-slate-300'
              }`}>
                {item.severity}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">{item.time}</span>
            </div>
            <h4 className="text-[11px] font-bold text-slate-300 leading-snug group-hover:text-white transition-colors cursor-pointer">
              {item.title}
            </h4>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">Global Connectivity</div>
            <div className="text-[9px] text-slate-500">Monitoring 27 EU Regulatory Hubs</div>
          </div>
        </div>
      </div>
    </div>
  );
};
