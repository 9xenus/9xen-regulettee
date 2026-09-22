import React, { useState } from 'react';
import { 
  Globe2, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Activity, 
  Filter, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface ThreatNode {
  id: string;
  region: string;
  country: string;
  city: string;
  threatType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'BLOCKED' | 'INVESTIGATING' | 'CONTAINED';
  timestamp: string;
}

const mockThreats: ThreatNode[] = [
  {
    id: 'THR-881',
    region: 'EU-WEST',
    country: 'Ireland',
    city: 'Dublin',
    threatType: 'Unauthorized Cross-Border Token Exfiltration Attempt',
    severity: 'CRITICAL',
    status: 'BLOCKED',
    timestamp: 'Just now'
  },
  {
    id: 'THR-882',
    region: 'EU-CENTRAL',
    country: 'Germany',
    city: 'Frankfurt',
    threatType: 'Unsigned LLM Parameter Extraction Probe',
    severity: 'HIGH',
    status: 'CONTAINED',
    timestamp: '4 mins ago'
  },
  {
    id: 'THR-883',
    region: 'EU-NORTH',
    country: 'Sweden',
    city: 'Stockholm',
    threatType: 'DSR Brute-Force Automated Scraper Request',
    severity: 'MEDIUM',
    status: 'BLOCKED',
    timestamp: '12 mins ago'
  },
  {
    id: 'THR-884',
    region: 'EU-SOUTH',
    country: 'Italy',
    city: 'Milan',
    threatType: 'Non-Compliant Edge Cache Ingestion Spike',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    timestamp: '28 mins ago'
  }
];

export const ThreatMap: React.FC = () => {
  const { showToast } = useNotification();
  const [threats, setThreats] = useState<ThreatNode[]>(mockThreats);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = threats.filter(t => filterSeverity === 'ALL' || t.severity === filterSeverity);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-700/60 rounded-xl text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Pan-European Sovereign Threat &amp; Breach Map</h3>
            <p className="text-xs text-slate-400">Live surveillance of unauthorized data exfiltration and perimeter attacks across EU enclaves.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-time Radar Active
          </span>
        </div>
      </div>

      {/* Interactive Map Visual Grid */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">EU-Central (Frankfurt)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">100% Secure</div>
            <div className="text-[10px] text-slate-500 mt-1">0 active breaches</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">EU-West (Dublin)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">100% Shielded</div>
            <div className="text-[10px] text-slate-500 mt-1">1 exfiltration blocked</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">EU-North (Stockholm)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">Nominal State</div>
            <div className="text-[10px] text-slate-500 mt-1">Encrypted cold vaults intact</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">EU-South (Milan)</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">Under Audit</div>
            <div className="text-[10px] text-slate-500 mt-1">1 ingestion probe flagged</div>
          </div>
        </div>
      </div>

      {/* Threat Stream Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detected Threat Vectors ({filtered.length})
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                  filterSeverity === sev ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  item.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                  item.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {item.severity}
                </span>
                <div>
                  <div className="text-xs font-bold text-white">{item.threatType}</div>
                  <div className="text-[11px] text-slate-400">
                    Location: {item.city}, {item.country} ({item.region}) &bull; {item.timestamp}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  {item.status}
                </span>
                <button
                  type="button"
                  onClick={() => showToast(`Executed Zero-Trust Quarantining protocol for ${item.id}`, 'info')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                >
                  Isolate Node
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;
