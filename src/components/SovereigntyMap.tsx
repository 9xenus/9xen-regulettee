import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  RefreshCw, 
  X, 
  Cpu, 
  HardDrive, 
  Gauge, 
  Zap, 
  AlertTriangle,
  Globe,
  Database,
  Key,
  TrendingUp,
  FileCheck,
  Binary
} from 'lucide-react';

interface RegionNode {
  id: string;
  name: string;
  city: string;
  country: string;
  coords: [number, number]; // [long, lat]
  complianceScore: number;
  dataResidency: string;
  sovereigntyEnforcement: string;
  violations: number;
  encryption: string;
  avgLatency: number;
  jitter: number;
  packetLoss: number;
  edgeNodes: number;
  cloudProvider: string;
}

const REGION_NODES: RegionNode[] = [
  {
    id: 'eu-west-1',
    name: 'EU-West-1 (Ireland)',
    city: 'Dublin',
    country: 'Ireland',
    coords: [-6.2603, 53.3498],
    complianceScore: 99,
    dataResidency: 'Fully Compliant',
    sovereigntyEnforcement: 'Active (EU Sovereignty Shield)',
    violations: 0,
    encryption: 'AES-256-GCM (KMS Rotated)',
    avgLatency: 12,
    jitter: 0.8,
    packetLoss: 0.00,
    edgeNodes: 12,
    cloudProvider: 'Sovereign Cloud Ireland'
  },
  {
    id: 'eu-central-1',
    name: 'EU-Central-1 (Germany)',
    city: 'Frankfurt',
    country: 'Germany',
    coords: [8.6821, 50.1109],
    complianceScore: 100,
    dataResidency: 'Fully Compliant',
    sovereigntyEnforcement: 'Active (BSI C5 & Schrems-II Protected)',
    violations: 0,
    encryption: 'AES-256-GCM + Double Key Encryption',
    avgLatency: 18,
    jitter: 1.1,
    packetLoss: 0.00,
    edgeNodes: 15,
    cloudProvider: 'Sovereign Cloud Germany (BSI Certified)'
  },
  {
    id: 'eu-west-3',
    name: 'EU-West-3 (France)',
    city: 'Paris',
    country: 'France',
    coords: [2.3522, 48.8566],
    complianceScore: 97,
    dataResidency: 'Fully Compliant',
    sovereigntyEnforcement: 'Active (SecNumCloud Compliant)',
    violations: 0,
    encryption: 'AES-256-GCM (CHEF Rotated)',
    avgLatency: 15,
    jitter: 0.9,
    packetLoss: 0.01,
    edgeNodes: 8,
    cloudProvider: 'Sovereign Cloud France'
  },
  {
    id: 'eu-north-1',
    name: 'EU-North-1 (Sweden)',
    city: 'Stockholm',
    country: 'Sweden',
    coords: [18.0686, 59.3293],
    complianceScore: 98,
    dataResidency: 'Fully Compliant',
    sovereigntyEnforcement: 'Active (Sovereign Core)',
    violations: 0,
    encryption: 'AES-256-GCM (Local Hardware HSM)',
    avgLatency: 22,
    jitter: 1.4,
    packetLoss: 0.00,
    edgeNodes: 6,
    cloudProvider: 'Sovereign Cloud Nordics'
  },
  {
    id: 'eu-south-1',
    name: 'EU-South-1 (Italy)',
    city: 'Milan',
    country: 'Italy',
    coords: [9.1900, 45.4642],
    complianceScore: 96,
    dataResidency: 'Fully Compliant',
    sovereigntyEnforcement: 'Active (AGID Certified)',
    violations: 1,
    encryption: 'AES-256-GCM',
    avgLatency: 26,
    jitter: 1.8,
    packetLoss: 0.02,
    edgeNodes: 5,
    cloudProvider: 'Sovereign Cloud Italy'
  }
];

// Pipelines/Flows within EU
const EU_FLOWS = [
  { origin: 'eu-west-1', dest: 'eu-central-1', isHighRisk: false },
  { origin: 'eu-west-3', dest: 'eu-central-1', isHighRisk: false },
  { origin: 'eu-north-1', dest: 'eu-central-1', isHighRisk: false },
  { origin: 'eu-south-1', dest: 'eu-west-3', isHighRisk: false }
];

const WORLD_MAP_URL = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

export const SovereigntyMap: React.FC = () => {
  const [geographies, setGeographies] = useState<any[]>([]);
  const [regions, setRegions] = useState<RegionNode[]>(REGION_NODES);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>('eu-central-1');
  const selectedRegion = useMemo(() => regions.find(r => r.id === selectedRegionId) || null, [regions, selectedRegionId]);

  const [activeTab, setActiveTab] = useState<'compliance' | 'latency' | 'actions'>('compliance');
  const [mapViewMode, setMapViewMode] = useState<'residency' | 'latency'>('residency');

  const handleMapViewModeChange = (mode: 'residency' | 'latency') => {
    setMapViewMode(mode);
    if (mode === 'residency') {
      setActiveTab('compliance');
    } else {
      setActiveTab('latency');
    }
  };

  // Interactive Live Diagnostic states
  const [isPinging, setIsPinging] = useState(false);
  const [pingHistory, setPingHistory] = useState<number[]>([]);
  const [diagnosticBadge, setDiagnosticBadge] = useState<string | null>(null);

  // Key Rotation states
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [rotationProgress, setRotationProgress] = useState(0);
  const [rotationSteps, setRotationSteps] = useState<string>('');
  const [rotationSuccess, setRotationSuccess] = useState(false);

  // Live Mode states
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const refreshLatencyMetrics = React.useCallback(() => {
    setRegions(prevRegions => 
      prevRegions.map(node => {
        const latencyChange = (Math.random() - 0.5) * 6; // +/- 3ms
        const baseLatencies: Record<string, number> = {
          'eu-west-1': 12,
          'eu-central-1': 18,
          'eu-west-3': 15,
          'eu-north-1': 22,
          'eu-south-1': 26
        };
        const baseLat = baseLatencies[node.id] || 20;
        const newLatency = Math.max(5, parseFloat((baseLat + latencyChange).toFixed(1)));
        
        const newJitter = Math.max(0.2, parseFloat((node.jitter + (Math.random() - 0.5) * 0.4).toFixed(2)));
        const newPacketLoss = Math.max(0.00, parseFloat((node.packetLoss + (Math.random() - 0.5) * 0.01).toFixed(2)));

        return {
          ...node,
          avgLatency: newLatency,
          jitter: newJitter,
          packetLoss: newPacketLoss
        };
      })
    );
  }, []);

  useEffect(() => {
    if (!isLiveMode) {
      setCountdown(30);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshLatencyMetrics();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveMode, refreshLatencyMetrics]);

  useEffect(() => {
    d3.json(WORLD_MAP_URL)
      .then((data: any) => {
        const countries = feature(data, data.objects.countries) as any;
        setGeographies(countries.features);
      })
      .catch(err => {
        console.warn("Failed to load map data", err);
      });
  }, []);

  // Set up projection centered and zoomed onto Europe
  const width = 800;
  const height = 500;
  const projection = useMemo(() => {
    return d3.geoMercator()
      .center([12, 54]) // Europe Center
      .scale(650)       // Perfect EU Zoom
      .translate([width / 2 - 50, height / 2 + 50]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Run a mock active latency test
  const runLatencyTest = () => {
    if (isPinging || !selectedRegion) return;
    setIsPinging(true);
    setPingHistory([]);
    setDiagnosticBadge(null);
    
    let counter = 0;
    const baseLatency = selectedRegion.avgLatency;
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 4;
      const val = Math.max(2, parseFloat((baseLatency + variation).toFixed(1)));
      setPingHistory(prev => [...prev, val]);
      counter++;
      
      if (counter >= 10) {
        clearInterval(interval);
        setIsPinging(false);
        setDiagnosticBadge('A+ Sovereign Routing Verified');
        
        window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
          detail: {
            message: `Sovereign routing diagnostic completed for node ${selectedRegion.name}. Latency is stable at ${baseLatency}ms.`,
            type: 'success',
            category: 'Sovereignty Shield'
          }
        }));
      }
    }, 150);
  };

  // Run KMS Key rotation
  const runKeyRotation = () => {
    if (isRotatingKeys) return;
    setIsRotatingKeys(true);
    setRotationProgress(0);
    setRotationSuccess(false);

    const steps = [
      'Initializing cryptographically secure entropy source...',
      'Requesting master key lease from local regional HSM cluster...',
      'Performing secure Envelope-Decryption of regional metadata...',
      'Re-encrypting payload keys with new AES-256 master key...',
      'Broadcasting state checksum & sealing transaction logs...'
    ];

    let stepIdx = 0;
    const timer = setInterval(() => {
      setRotationProgress(prev => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(timer);
          setIsRotatingKeys(false);
          setRotationSuccess(true);
          
          window.dispatchEvent(new CustomEvent('sovereign-compliance-changed', {
            detail: {
              message: `Encryption keys successfully rotated and re-sealed for regional node ${selectedRegion ? selectedRegion.name : 'active host'}.`,
              type: 'success',
              category: 'KMS Key Rotation'
            }
          }));

          return 100;
        }
        return next;
      });
      setRotationSteps(steps[stepIdx]);
      stepIdx++;
    }, 400);
  };

  // Reset tab states when switching regions
  useEffect(() => {
    setPingHistory([]);
    setDiagnosticBadge(null);
    setIsPinging(false);
    setIsRotatingKeys(false);
    setRotationSuccess(false);
    setRotationProgress(0);
  }, [selectedRegion]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      
      {/* Map Section */}
      <div className="xl:col-span-2 bg-slate-950 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col justify-between">
        
        {/* Map Header Overlay */}
        <div className="absolute top-6 left-6 right-6 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800 text-xs font-bold text-slate-300 w-fit pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            EU SOVEREIGN NETWORK: ACTIVE
          </div>

          {/* Toggle Switches & Live Mode Pill */}
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* View Mode Switches */}
            <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-800/80 flex items-center gap-1 shadow-lg shadow-indigo-500/5">
              <button
                onClick={() => handleMapViewModeChange('residency')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  mapViewMode === 'residency'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Data Residency
              </button>
              <button
                onClick={() => handleMapViewModeChange('latency')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  mapViewMode === 'latency'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Real-time Latency
              </button>
            </div>

            {/* Live Mode Toggle Pill */}
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 shadow-md ${
                isLiveMode 
                  ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-400 font-extrabold shadow-emerald-500/5' 
                  : 'bg-slate-900/95 border-slate-800 text-slate-400 font-bold hover:text-slate-200 hover:border-slate-700'
              }`}
              title="Toggle automatic refresh of latency metrics every 30 seconds"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
              <span className="text-[10px] uppercase tracking-wider">
                {isLiveMode ? `Live Mode (${countdown}s)` : 'Live Mode'}
              </span>
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveMode ? 'animate-spin' : ''}`} style={{ animationDuration: isLiveMode ? '3s' : '0s' }} />
            </button>
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 max-w-xs space-y-2 pointer-events-none">
          <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Sovereignty Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 border border-indigo-400 ring-2 ring-indigo-500/20"></span>
              <span className="text-xs text-slate-300 font-semibold">Sovereign Cloud Region</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 bg-indigo-500/40 border-t border-dashed border-indigo-500/60 inline-block"></span>
              <span className="text-xs text-slate-300 font-semibold">Intra-EU Sovereign Pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/50 animate-ping inline-block"></span>
              <span className="text-xs text-slate-300 font-semibold">Selected Region Node</span>
            </div>
            
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="text-[10px] text-slate-400 font-medium">
                {mapViewMode === 'residency' ? (
                  <>Showing: <strong className="text-indigo-300">GDPR Compliance %</strong></>
                ) : (
                  <>Showing: <strong className="text-indigo-300">Real-time Latency (ms)</strong></>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* SVG Map Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <svg className="w-full max-h-[460px] select-none" viewBox="0 0 800 500">
            {/* World Base */}
            <g>
              {geographies.map((geo, i) => (
                <path
                  key={i}
                  d={pathGenerator(geo) || undefined}
                  className="fill-slate-900 stroke-slate-800/80 transition-all hover:fill-slate-800/60 duration-300"
                  strokeWidth={0.7}
                />
              ))}
            </g>

            {/* Flows / Pipelines */}
            <g>
              {EU_FLOWS.map((flow, idx) => {
                const originNode = regions.find(n => n.id === flow.origin);
                const destNode = regions.find(n => n.id === flow.dest);
                if (!originNode || !destNode) return null;

                const originCoords = projection(originNode.coords);
                const destCoords = projection(destNode.coords);
                if (!originCoords || !destCoords) return null;

                return (
                  <g key={`flow-${idx}`}>
                    {/* Glowing flow line */}
                    <line
                      x1={originCoords[0]}
                      y1={originCoords[1]}
                      x2={destCoords[0]}
                      y2={destCoords[1]}
                      stroke="url(#flowGradient)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                      className="opacity-60"
                    />
                    {/* Animated moving dot on path */}
                    <circle r={3} fill="#a5b4fc" className="opacity-80">
                      <animateMotion
                        path={`M ${originCoords[0]},${originCoords[1]} L ${destCoords[0]},${destCoords[1]}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}
            </g>

            {/* Region Nodes */}
            <g>
              {regions.map((node) => {
                const coords = projection(node.coords);
                if (!coords) return null;
                const isSelected = selectedRegion?.id === node.id;

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${coords[0]}, ${coords[1]})`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedRegionId(node.id)}
                  >
                    {/* Ring Outer Pulse */}
                    {isSelected && (
                      <circle
                        r={16}
                        fill="none"
                        className="stroke-indigo-500/40 animate-ping"
                        strokeWidth={1.5}
                      />
                    )}

                    {/* Node Hover Outline */}
                    <circle
                      r={10}
                      fill="none"
                      className="stroke-indigo-400/20 group-hover:stroke-indigo-400/80 group-hover:scale-125 transition-all duration-300"
                      strokeWidth={1.5}
                    />

                    {/* Core node dot */}
                    <circle
                      r={6}
                      className={`${isSelected ? 'fill-indigo-400 ring-4 ring-indigo-500/30' : 'fill-indigo-600 group-hover:fill-indigo-400'} transition-colors duration-300`}
                    />

                    {/* Label */}
                    <text
                      y={-14}
                      textAnchor="middle"
                      className={`text-[10px] font-black tracking-wide select-none pointer-events-none fill-slate-300 ${isSelected ? 'fill-indigo-400 font-extrabold scale-110' : 'opacity-80 group-hover:opacity-100'} transition-all`}
                    >
                      {node.city}
                    </text>

                    {/* Dynamic Mode-Specific Pill Badge */}
                    <g transform="translate(0, 12)" className="opacity-95 transition-all duration-300">
                      {/* Pill Background */}
                      <rect
                        x={-32}
                        y={0}
                        width={64}
                        height={16}
                        rx={8}
                        ry={8}
                        className="fill-slate-900/95 stroke-slate-800/80"
                        strokeWidth={1}
                      />
                      
                      {/* Bullet Status Dot */}
                      <circle
                        cx={-18}
                        cy={8}
                        r={3}
                        fill={
                          mapViewMode === 'residency'
                            ? (node.violations === 0 ? '#10b981' : '#f59e0b')
                            : (node.avgLatency < 15 ? '#10b981' : node.avgLatency < 25 ? '#6366f1' : '#f97316')
                        }
                        className={mapViewMode === 'latency' && node.avgLatency < 15 ? 'animate-pulse' : ''}
                      />

                      {/* Text value */}
                      <text
                        x={5}
                        y={11.5}
                        textAnchor="middle"
                        className="text-[9px] font-extrabold fill-slate-200 select-none pointer-events-none font-mono tracking-wide"
                      >
                        {mapViewMode === 'residency' 
                          ? `${node.complianceScore}%` 
                          : `${node.avgLatency}ms`}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Definitions */}
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Footer info line */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Interactive Geopolitically Localized European Nodes
        </div>
      </div>

      {/* Side Drawer & Panel Details Section */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col justify-between min-h-[520px]">
        
        <AnimatePresence mode="wait">
          {selectedRegion ? (
            <motion.div 
              key={selectedRegion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Drawer Title Area */}
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedRegion.name}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {selectedRegion.complianceScore}% Score
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    {selectedRegion.city}, {selectedRegion.country}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRegionId(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                  title="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100">
                {(['compliance', 'latency', 'actions'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === tab 
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-5 lg:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-6">
                
                {/* 1. COMPLIANCE TAB */}
                {activeTab === 'compliance' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Sovereignty Shield Status</p>
                        <p className="text-sm font-bold text-emerald-800">{selectedRegion.sovereigntyEnforcement}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Residency Mode</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{selectedRegion.dataResidency}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cross-Border Breaches</p>
                        <p className={`text-xs font-bold mt-1 ${selectedRegion.violations > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {selectedRegion.violations} Detected
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Regional Specifications</h4>
                      <div className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-xs">
                        <div className="flex items-center gap-2 font-medium text-slate-600">
                          <Lock className="w-3.5 h-3.5 text-indigo-500" />
                          Encryption Standard
                        </div>
                        <span className="font-mono text-[10px] font-extrabold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {selectedRegion.encryption}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-xs">
                        <div className="flex items-center gap-2 font-medium text-slate-600">
                          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                          Local Cloud Host
                        </div>
                        <span className="font-semibold text-slate-700">{selectedRegion.cloudProvider}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-xs">
                        <div className="flex items-center gap-2 font-medium text-slate-600">
                          <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                          Allocated Edge Nodes
                        </div>
                        <span className="font-semibold text-slate-700">{selectedRegion.edgeNodes} Active Cluster Nodes</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LATENCY TAB */}
                {activeTab === 'latency' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-center">
                        <Gauge className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Avg Latency</p>
                        <p className="text-sm font-black text-slate-800 mt-1">{selectedRegion.avgLatency}ms</p>
                      </div>
                      <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-center">
                        <Zap className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Jitter</p>
                        <p className="text-sm font-black text-slate-800 mt-1">{selectedRegion.jitter}ms</p>
                      </div>
                      <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-center">
                        <Activity className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Loss Rate</p>
                        <p className="text-sm font-black text-slate-800 mt-1">{selectedRegion.packetLoss.toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Binary className="w-3.5 h-3.5" />
                          Live Ping Diagnostics
                        </p>
                        {diagnosticBadge && (
                          <span className="text-[8px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800/80 px-2 py-0.5 rounded-full uppercase">
                            {diagnosticBadge}
                          </span>
                        )}
                      </div>

                      {/* Ping visual mini chart */}
                      <div className="h-20 flex items-end justify-between gap-1 border-b border-slate-800 pb-2 relative">
                        {pingHistory.length > 0 ? (
                          pingHistory.map((pt, i) => {
                            const maxVal = Math.max(...pingHistory, 30);
                            const percent = (pt / maxVal) * 100;
                            return (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${percent}%` }}
                                className="w-full bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-t"
                                title={`${pt}ms`}
                              />
                            );
                          })
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            No Active Test Triggered
                          </div>
                        )}
                      </div>

                      <button
                        onClick={runLatencyTest}
                        disabled={isPinging}
                        className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all text-[10px] font-black uppercase text-white tracking-widest rounded-xl"
                      >
                        {isPinging ? 'Pinging Sovereignty Cluster...' : 'Trigger Latency Diagnostic'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. ACTIONS TAB */}
                {activeTab === 'actions' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <Key className="w-4 h-4 text-indigo-500" />
                        Key Rotation Audit
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Perform a cryptographically compliant master key rollover inside the local European Hardware Security Module (HSM). This ensures continuous GDPR and BSI C5 alignment.
                      </p>

                      {isRotatingKeys ? (
                        <div className="space-y-3">
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <motion.div 
                              className="bg-indigo-600 h-2" 
                              style={{ width: `${rotationProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] font-bold text-indigo-600 animate-pulse uppercase tracking-wider font-mono">
                            {rotationSteps}
                          </p>
                        </div>
                      ) : rotationSuccess ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1.5">
                          <p className="font-extrabold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            KMS Rollover Sealing: Complete
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Entropy Source: Sealed (AES-256-GCM envelop encryption established).
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={runKeyRotation}
                          className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-[10px] font-black uppercase tracking-wider rounded-xl"
                        >
                          Rotate Sovereignty KMS Key
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">Local Jurisdictional Advisory</h4>
                        <p className="text-[11px] text-amber-700/90 leading-relaxed font-medium">
                          Any modification of physical server boundaries or data-mapping logic will trigger an immediate auto-audit notice to local European Data Protection authorities (such as the DPC and BfDI).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer Status bar */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Secure Node Channel</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Encrypted
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6 lg:p-8 text-center space-y-3 bg-slate-50/40">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">No Region Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Select any highlighted region node on the European Sovereignty Map to review granular latency analytics, local cloud specifications, and live audit checks.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};
