import React from 'react';
import { Globe, Server, ShieldCheck, Zap, Lock, Database, ArrowUpRight, Cpu } from 'lucide-react';
import { RegionKey, REGIONAL_FRAMEWORKS } from '../../services/regionalComplianceRulesEngine';

interface RegionalWorldMapProps {
  activeRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
}

interface NodeData {
  regionKey: RegionKey;
  label: string;
  flag: string;
  dataCenter: string;
  latencyMs: number;
  status: 'ACTIVE' | 'ENFORCED' | 'STANDBY';
  coords: { x: number; y: number }; // Percentage on map canvas
  laws: string;
}

const REGIONAL_NODES: NodeData[] = [
  { regionKey: 'USA', label: 'North America (US East)', flag: '🇺🇸', dataCenter: 'AWS us-east-1 (N. Virginia)', latencyMs: 18, status: 'ACTIVE', coords: { x: 22, y: 38 }, laws: 'CCPA / HIPAA / GLBA' },
  { regionKey: 'CANADA', label: 'Canada Sovereign', flag: '🇨🇦', dataCenter: 'AWS ca-central-1 (Montreal)', latencyMs: 24, status: 'ACTIVE', coords: { x: 24, y: 26 }, laws: 'PIPEDA / Law 25' },
  { regionKey: 'LATIN_AMERICA', label: 'Latin America', flag: '🇧🇷', dataCenter: 'AWS sa-east-1 (São Paulo)', latencyMs: 82, status: 'ACTIVE', coords: { x: 32, y: 72 }, laws: 'LGPD / ANPD' },
  { regionKey: 'EU', label: 'European Sovereign Cloud', flag: '🇪🇺', dataCenter: 'AWS eu-central-1 (Frankfurt)', latencyMs: 9, status: 'ACTIVE', coords: { x: 49, y: 32 }, laws: 'GDPR / AI Act / NIS2' },
  { regionKey: 'UK', label: 'United Kingdom', flag: '🇬🇧', dataCenter: 'AWS eu-west-2 (London)', latencyMs: 14, status: 'ACTIVE', coords: { x: 45, y: 28 }, laws: 'UK GDPR / DPA 2018' },
  { regionKey: 'SWITZERLAND', label: 'Swiss Enclave', flag: '🇨🇭', dataCenter: 'Oracle Zurich Cloud', latencyMs: 12, status: 'ACTIVE', coords: { x: 51, y: 36 }, laws: 'nFADP / FADP' },
  { regionKey: 'KSA', label: 'Kingdom of Saudi Arabia', flag: '🇸🇦', dataCenter: 'Oracle Cloud Riyadh', latencyMs: 46, status: 'ACTIVE', coords: { x: 60, y: 46 }, laws: 'PDPL / SAMA / NDMO' },
  { regionKey: 'UAE', label: 'UAE Sovereign Enclave', flag: '🇦🇪', dataCenter: 'Azure uae-north (Dubai)', latencyMs: 42, status: 'ACTIVE', coords: { x: 63, y: 48 }, laws: 'Fed Decree 45 / DIFC' },
  { regionKey: 'AFRICA', label: 'Africa Central/South', flag: '🇿🇦', dataCenter: 'AWS af-south-1 (Cape Town)', latencyMs: 110, status: 'ACTIVE', coords: { x: 54, y: 78 }, laws: 'POPIA / NDPR' },
  { regionKey: 'APAC', label: 'Asia-Pacific Core', flag: '🇸🇬', dataCenter: 'AWS ap-southeast-1 (Singapore)', latencyMs: 65, status: 'ACTIVE', coords: { x: 78, y: 56 }, laws: 'PDPA / DPDP / APPI' },
  { regionKey: 'AUSTRALIA', label: 'Australia & NZ', flag: '🇦🇺', dataCenter: 'AWS ap-southeast-2 (Sydney)', latencyMs: 95, status: 'ACTIVE', coords: { x: 88, y: 76 }, laws: 'Privacy Act / APRA CPS 234' },
];

export const RegionalWorldMap: React.FC<RegionalWorldMapProps> = ({ activeRegion, onSelectRegion }) => {
  const activeNode = REGIONAL_NODES.find(n => n.regionKey === activeRegion) || REGIONAL_NODES[3];
  const activeFramework = REGIONAL_FRAMEWORKS[activeRegion] || REGIONAL_FRAMEWORKS.EU;

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Background Graphic Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #818cf8 1px, transparent 0)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Kyber-768 Quantum Enclave Mesh
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 11 Sovereign Data Centers Online
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            Global Sovereign Enclave & Data Sharding Mesh
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Click any regional enclave node to instantly pivot the compliance engine, statutory fine limits, and data residency boundary.
          </p>
        </div>

        {/* Active Node Quick Card */}
        <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3 min-w-[260px]">
          <span className="text-2xl">{activeNode.flag}</span>
          <div className="text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white">{activeNode.label}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[11px] text-indigo-300 font-mono block mt-0.5">{activeNode.dataCenter}</span>
            <span className="text-[10px] text-slate-400 font-medium">Latency: <b className="text-emerald-400">{activeNode.latencyMs}ms</b> • {activeNode.laws}</span>
          </div>
        </div>
      </div>

      {/* Interactive World Map Canvas */}
      <div className="relative z-10 w-full h-80 sm:h-96 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
        {/* Abstract World Map Vector Silhouette SVG */}
        <svg 
          className="absolute inset-0 w-full h-full object-cover opacity-25" 
          viewBox="0 0 1000 500" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* North America */}
          <path d="M150 80 Q 220 70 280 120 Q 260 220 180 260 Q 120 200 150 80 Z" fill="#6366f1" />
          {/* South America */}
          <path d="M280 270 Q 350 300 340 420 Q 270 480 260 380 Q 250 300 280 270 Z" fill="#6366f1" />
          {/* Europe */}
          <path d="M460 100 Q 540 90 560 180 Q 480 220 440 160 Z" fill="#6366f1" />
          {/* Africa */}
          <path d="M470 200 Q 560 210 570 340 Q 520 440 480 360 Q 450 260 470 200 Z" fill="#6366f1" />
          {/* Asia */}
          <path d="M570 100 Q 820 80 840 240 Q 720 320 620 250 Q 580 160 570 100 Z" fill="#6366f1" />
          {/* Australia */}
          <path d="M780 340 Q 880 330 890 420 Q 810 460 770 400 Z" fill="#6366f1" />
          
          {/* Grid lines */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
        </svg>

        {/* Regional Enclave Pins */}
        {REGIONAL_NODES.map((node) => {
          const isSelected = node.regionKey === activeRegion;
          return (
            <button
              key={node.regionKey}
              onClick={() => onSelectRegion(node.regionKey)}
              style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 cursor-pointer focus:outline-none`}
            >
              {/* Ripple Ring when active */}
              {isSelected && (
                <span className="absolute -inset-2 rounded-full bg-indigo-500/40 animate-ping" />
              )}

              {/* Pin Pill */}
              <div className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-300 text-white shadow-lg scale-110 ring-2 ring-indigo-400/50' 
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
              }`}>
                <span>{node.flag}</span>
                <span className="hidden sm:inline text-[11px] font-mono">{node.regionKey}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-left opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-30">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>{node.regionKey} ENCLAVE</span>
                  <span className="text-emerald-400">{node.latencyMs}ms</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5">{node.label}</div>
                <div className="text-[10px] text-indigo-300 font-mono truncate">{node.dataCenter}</div>
                <div className="text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-800">{node.laws}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Enclave Switcher Chips */}
      <div className="relative z-10 flex flex-wrap gap-2 pt-1">
        {REGIONAL_NODES.map((node) => {
          const isSelected = node.regionKey === activeRegion;
          return (
            <button
              key={node.regionKey}
              onClick={() => onSelectRegion(node.regionKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{node.flag}</span>
              <span>{node.regionKey}</span>
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-900 text-slate-400'
              }`}>
                {node.latencyMs}ms
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
