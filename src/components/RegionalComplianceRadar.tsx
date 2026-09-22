import React, { useState } from 'react';
import { Globe, MapPin, ShieldAlert, CheckCircle2, Info, ChevronRight, Search, Compass, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RegulatoryRadarWidget } from './dashboard/RegulatoryRadarWidget';

interface RegionalStatus {
  region: string;
  country: string;
  framework: string;
  status: 'Compliant' | 'Warning' | 'Critical' | 'Pending';
  score: number;
  lastAudit: string;
  details: string[];
}

const REGIONAL_DATA: RegionalStatus[] = [
  {
    region: 'European Union',
    country: 'Germany',
    framework: 'GDPR / NIS2',
    status: 'Compliant',
    score: 98,
    lastAudit: '2026-08-01',
    details: ['AWS Frankfurt Residency Verified', 'DPIA Signed', 'MFA Active']
  },
  {
    region: 'Middle East',
    country: 'Saudi Arabia',
    framework: 'KSA PDPL',
    status: 'Warning',
    score: 72,
    lastAudit: '2026-07-28',
    details: ['Local Data Residency required for PII', 'Appoint local DPO']
  },
  {
    region: 'Asia Pacific',
    country: 'India',
    framework: 'DPDP Act',
    status: 'Pending',
    score: 45,
    lastAudit: '2026-08-05',
    details: ['Consent Manager implementation incomplete', 'Breach notification SOP missing']
  },
  {
    region: 'Asia Pacific',
    country: 'Indonesia',
    framework: 'PDP Law',
    status: 'Critical',
    score: 28,
    lastAudit: '2026-08-07',
    details: ['Unauthorized cross-border transfer detected', 'No local legal rep']
  },
  {
    region: 'Americas',
    country: 'Brazil',
    framework: 'LGPD',
    status: 'Compliant',
    score: 91,
    lastAudit: '2026-07-15',
    details: ['Data Subject Rights Portal active', 'ANPD registration verified']
  },
  {
    region: 'Africa',
    country: 'Egypt',
    framework: 'PDPL',
    status: 'Warning',
    score: 64,
    lastAudit: '2026-08-02',
    details: ['License for processing pending', 'Data protection center audit scheduled']
  }
];

export const RegionalComplianceRadar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'RADAR_WIDGET' | 'TERRITORY_LIST'>('RADAR_WIDGET');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const filteredData = REGIONAL_DATA.filter(item => 
    (item.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.framework.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedRegion || item.region === selectedRegion)
  );

  const regions = Array.from(new Set(REGIONAL_DATA.map(d => d.region)));

  if (viewMode === 'RADAR_WIDGET') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setViewMode('TERRITORY_LIST')}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5" />
            Switch to Compact List View
          </button>
        </div>
        <RegulatoryRadarWidget />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full text-left">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" /> Hyper-Local Compliance Radar
              </h3>
              <button
                onClick={() => setViewMode('RADAR_WIDGET')}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-indigo-200 transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                Open Spatial Radar
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time monitoring of regional regulatory health and cross-border data residency.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-tighter">Live Telemetry</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by country or framework..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setSelectedRegion(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !selectedRegion ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              All Regions
            </button>
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === region ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4 max-h-[600px]">
        <AnimatePresence mode="popLayout">
          {filteredData.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={`${item.country}-${item.framework}`}
              className="group border border-slate-150 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/10 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    item.status === 'Compliant' ? 'bg-emerald-50 text-emerald-600' :
                    item.status === 'Warning' ? 'bg-amber-50 text-amber-600' :
                    item.status === 'Critical' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{item.country}</h4>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.region}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">{item.framework}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Last Audit: {item.lastAudit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center md:items-end flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Score</div>
                      <div className={`text-xl font-black font-mono ${
                        item.score > 80 ? 'text-emerald-600' :
                        item.score > 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {item.score}%
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      item.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      item.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      item.status === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  {item.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded text-[10px] font-medium text-slate-600 border border-slate-150">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {detail}
                    </div>
                  ))}
                  <button 
                    onClick={() => setViewMode('RADAR_WIDGET')}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                  >
                    Open Radar View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredData.length === 0 && (
          <div className="py-24 text-center">
            <Globe className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700">No regional data found</h4>
            <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 text-slate-400 text-[10px] font-mono flex justify-between items-center shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Ledger ID: reg_radar_7721</span>
          <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> 2 Unresolved Findings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Satellite Sync Active</span>
        </div>
      </div>
    </div>
  );
};
