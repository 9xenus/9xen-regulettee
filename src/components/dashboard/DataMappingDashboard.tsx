import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  Users, 
  Trash2, 
  Key, 
  Fingerprint, 
  ExternalLink, 
  Activity, 
  Play, 
  Lock, 
  FileText,
  HelpCircle,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Definitions for the visual map
interface FlowNode {
  id: string;
  label: string;
  category: 'origin' | 'storage' | 'transfer' | 'destruction';
  subText: string;
  icon: React.ComponentType<any>;
  details: {
    protocol: string;
    encryption: string;
    retention: string;
    legalBasis: string;
    owner: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    complianceStatus: 'Verified' | 'Warning' | 'Critical';
    additionalInfo: string;
  };
  supportedPii: string[]; // which PII categories flow through this node
}

interface Connection {
  from: string;
  to: string;
  piiTypes: string[];
}

export const DataMappingDashboard: React.FC = () => {
  // Available PII categories for interactive filtering
  const piiCategories = [
    { id: 'all', label: 'All PII Categories', color: 'indigo' },
    { id: 'financial', label: 'Customer Financials (IBAN, Card)', color: 'emerald' },
    { id: 'biometric', label: 'Biometric Hashes (MFA, Face)', color: 'rose' },
    { id: 'location', label: 'IoT Geolocation Data (GPS Logs)', color: 'amber' },
    { id: 'contact', label: 'User Contacts & Profiles (Email, Phone)', color: 'blue' },
    { id: 'identity', label: 'eIDAS National Identity (SSN/PID)', color: 'purple' },
  ];

  const [selectedPii, setSelectedPii] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSimulatingFlow, setIsSimulatingFlow] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [verificationProgress, setVerificationProgress] = useState<number | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

  // Nodes defining the lifecycle
  const nodes: FlowNode[] = useMemo(() => [
    // --- Source Origins (Ingress) ---
    {
      id: 'origin-mobile',
      label: 'eIDAS National Wallet',
      category: 'origin',
      subText: 'Mobile App Signups',
      icon: Fingerprint,
      supportedPii: ['identity', 'biometric', 'contact'],
      details: {
        protocol: 'OpenID4VP / SD-JWT',
        encryption: 'TLS 1.3 / Hardware Enclave',
        retention: 'Immediate session verification, no raw persistence',
        legalBasis: 'GDPR Art. 6(1)(c) - Legal Obligation',
        owner: 'Identity Management Team',
        riskLevel: 'Low',
        complianceStatus: 'Verified',
        additionalInfo: 'Direct cryptographic eIDAS v2 presentation verify with zero-knowledge age proofing.'
      }
    },
    {
      id: 'origin-web',
      label: 'SaaS Client Sign-up Portal',
      category: 'origin',
      subText: 'Web Interface Intake',
      icon: Globe,
      supportedPii: ['contact', 'financial'],
      details: {
        protocol: 'HTTPS POST / TLS 1.3',
        encryption: 'AES-256 (API Envelope)',
        retention: 'Cached < 5 minutes in worker memory',
        legalBasis: 'GDPR Art. 6(1)(b) - Contract Fulfillment',
        owner: 'Growth Engineering Group',
        riskLevel: 'Medium',
        complianceStatus: 'Verified',
        additionalInfo: 'Validated with active CSP headers and standard cookie consent requirements.'
      }
    },
    {
      id: 'origin-telemetry',
      label: 'IoT Telemetry Ingest Hub',
      category: 'origin',
      subText: 'App Background Tracking',
      icon: Activity,
      supportedPii: ['location'],
      details: {
        protocol: 'gRPC / TLS 1.3',
        encryption: 'Device Signature / AES-GCM',
        retention: 'Transit stream only',
        legalBasis: 'GDPR Art. 6(1)(a) - Explicit Consent',
        owner: 'Core Infrastructure Group',
        riskLevel: 'High',
        complianceStatus: 'Warning',
        additionalInfo: 'Explicit location consent toggles required. Subject to policy drift if opt-out hooks disconnect.'
      }
    },

    // --- Processing & Storage (Lifecycle) ---
    {
      id: 'store-sharded',
      label: 'Sovereign Sharded Database',
      category: 'storage',
      subText: 'EU-Central Region Store',
      icon: Database,
      supportedPii: ['contact', 'identity', 'location'],
      details: {
        protocol: 'PostgreSQL / Cloud SQL Proxy',
        encryption: 'TDE (AES-256) + Columnar PII Masking',
        retention: '7 Years (Audit Demands)',
        legalBasis: 'GDPR Art. 6(1)(f) - Legitimate Interest',
        owner: 'Data Platform Operations',
        riskLevel: 'Medium',
        complianceStatus: 'Verified',
        additionalInfo: 'Fully partitioned database located within Frankfurt zones. Key access strictly isolated via IAM.'
      }
    },
    {
      id: 'store-ledger',
      label: 'Immutable Audit Ledger',
      category: 'storage',
      subText: 'Cryptographic Hash Chain',
      icon: Lock,
      supportedPii: ['identity', 'financial'],
      details: {
        protocol: 'SQLite System Extended DB',
        encryption: 'SHA-256 Tamper Evident Block Chains',
        retention: 'Indefinite (Legal Hold)',
        legalBasis: 'GDPR Art. 6(1)(c) - Compliance Registry',
        owner: 'Legal Compliance Counsel',
        riskLevel: 'Low',
        complianceStatus: 'Verified',
        additionalInfo: 'Stores unalterable validation signatures to demonstrate structural compliance transparency.'
      }
    },
    {
      id: 'store-biometric',
      label: 'Isolated HSM Vault',
      category: 'storage',
      subText: 'Hardware Security Module',
      icon: Key,
      supportedPii: ['biometric', 'financial'],
      details: {
        protocol: 'PKCS#11 Mutual TLS',
        encryption: 'FIPS 140-2 Level 3 HSM',
        retention: 'Until Account Termination',
        legalBasis: 'GDPR Art. 9(2)(a) - Biometric Consent',
        owner: 'Information Security Officer',
        riskLevel: 'High',
        complianceStatus: 'Verified',
        additionalInfo: 'Raw hashes never persist outside secure HSM boundary. Decoupled from public SaaS subnet.'
      }
    },

    // --- Third-Party Transfers (Outbound Flow) ---
    {
      id: 'transfer-payment',
      label: 'SEPA Clearing / Stripe',
      category: 'transfer',
      subText: 'Outbound Bank Settlement',
      icon: Globe,
      supportedPii: ['financial'],
      details: {
        protocol: 'SEPA Direct Debit XML / HTTPS API',
        encryption: 'PCI-DSS Level 1 / TLS 1.3',
        retention: 'Governed by Stripe SLA policy',
        legalBasis: 'GDPR Art. 6(1)(b) - Contract Execution',
        owner: 'Finance Desk Operations',
        riskLevel: 'Medium',
        complianceStatus: 'Verified',
        additionalInfo: 'Protected by signed standard corporate Data Processing Agreements (DPA) and active PCI certifications.'
      }
    },
    {
      id: 'transfer-crm',
      label: 'External CRM / Cloud Analytics',
      category: 'transfer',
      subText: 'US-Affiliated SaaS Subprocessors',
      icon: Globe,
      supportedPii: ['contact', 'location'],
      details: {
        protocol: 'REST Webhook / HTTPS API',
        encryption: 'HTTPS Bearer Token',
        retention: 'Governed by vendor retention schedules',
        legalBasis: 'Standard Contractual Clauses (SCC)',
        owner: 'Sales Operations Coordinator',
        riskLevel: 'High',
        complianceStatus: 'Warning',
        additionalInfo: 'Transfers locations to US nodes. Requires continuous monitoring of EU-US Data Privacy Framework.'
      }
    },
    {
      id: 'transfer-tribunal',
      label: 'EU Central Vault / Treasury',
      category: 'transfer',
      subText: 'Regulatory Dispatches',
      icon: FileText,
      supportedPii: ['identity'],
      details: {
        protocol: 'Secure e-Delivery Gateway',
        encryption: 'AS4 / eIDAS Qualified Cryptographic Seals',
        retention: 'Sovereign archiving protocols',
        legalBasis: 'EU Regulation 2024/1689 Act',
        owner: 'State Liaison Director',
        riskLevel: 'Low',
        complianceStatus: 'Verified',
        additionalInfo: 'Authorized governmental channel for mandatory risk and certification escrow deposits.'
      }
    },

    // --- Archival & Destruction (Destruction Phase) ---
    {
      id: 'destruct-shred',
      label: 'Cryptographic Shred Engine',
      category: 'destruction',
      subText: 'Automated Erasure Service',
      icon: Trash2,
      supportedPii: ['all', 'financial', 'biometric', 'location', 'contact', 'identity'],
      details: {
        protocol: 'Zero-Fill / Key Zeroization',
        encryption: 'Destruction of envelope keys (Crypto-Shredding)',
        retention: 'Final state (Deleted)',
        legalBasis: 'GDPR Art. 17 - Right to be Forgotten',
        owner: 'Privacy Engineering Desk',
        riskLevel: 'Low',
        complianceStatus: 'Verified',
        additionalInfo: 'Triggers atomic delete operations. Deletes parent decryption keys, rendering backups mathematically unreadable.'
      }
    }
  ], []);

  // Structural connections mapping data paths
  const connections: Connection[] = [
    // Origins -> Storage
    { from: 'origin-mobile', to: 'store-sharded', piiTypes: ['contact', 'identity'] },
    { from: 'origin-mobile', to: 'store-biometric', piiTypes: ['biometric'] },
    { from: 'origin-mobile', to: 'store-ledger', piiTypes: ['identity'] },
    
    { from: 'origin-web', to: 'store-sharded', piiTypes: ['contact'] },
    { from: 'origin-web', to: 'store-ledger', piiTypes: ['financial'] },
    { from: 'origin-web', to: 'store-biometric', piiTypes: ['financial'] },
    
    { from: 'origin-telemetry', to: 'store-sharded', piiTypes: ['location'] },

    // Storage -> Transfers
    { from: 'store-sharded', to: 'transfer-crm', piiTypes: ['contact', 'location'] },
    { from: 'store-sharded', to: 'transfer-tribunal', piiTypes: ['identity'] },
    { from: 'store-sharded', to: 'destruct-shred', piiTypes: ['contact', 'location', 'identity'] },

    { from: 'store-ledger', to: 'transfer-tribunal', piiTypes: ['identity'] },
    { from: 'store-ledger', to: 'destruct-shred', piiTypes: ['identity', 'financial'] },

    { from: 'store-biometric', to: 'transfer-payment', piiTypes: ['financial'] },
    { from: 'store-biometric', to: 'destruct-shred', piiTypes: ['biometric', 'financial'] },

    // Transfers -> Destruction
    { from: 'transfer-payment', to: 'destruct-shred', piiTypes: ['financial'] },
    { from: 'transfer-crm', to: 'destruct-shred', piiTypes: ['contact', 'location'] },
    { from: 'transfer-tribunal', to: 'destruct-shred', piiTypes: ['identity'] },
  ];

  // Set initial node selection
  useEffect(() => {
    if (!selectedNodeId) {
      setSelectedNodeId('origin-mobile');
    }
  }, [selectedNodeId]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Is node visible/highlighted under current filter
  const isNodeHighlighted = (node: FlowNode) => {
    if (selectedPii === 'all') return true;
    return node.supportedPii.includes(selectedPii);
  };

  // Is connection active under current filter
  const isConnectionHighlighted = (conn: Connection) => {
    if (selectedPii === 'all') return true;
    return conn.piiTypes.includes(selectedPii);
  };

  // Simulation step list
  const simulationSteps = useMemo(() => {
    if (selectedPii === 'all') {
      return ['origin-mobile', 'origin-web', 'origin-telemetry', 'store-sharded', 'store-biometric', 'transfer-payment', 'transfer-crm', 'transfer-tribunal', 'destruct-shred'];
    }
    return nodes
      .filter(n => n.supportedPii.includes(selectedPii))
      .map(n => n.id);
  }, [selectedPii, nodes]);

  // Run periodic loop for simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingFlow) {
      setActiveStepIndex(0);
      interval = setInterval(() => {
        setActiveStepIndex(prev => {
          if (prev >= simulationSteps.length - 1) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1500);
    } else {
      setActiveStepIndex(-1);
    }
    return () => clearInterval(interval);
  }, [isSimulatingFlow, simulationSteps]);

  // Handle flow node hover/click to update details panel
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  // Run Automated Compliance Check
  const runVerificationScan = () => {
    setShowVerificationModal(true);
    setVerificationProgress(0);
    setVerificationResult(null);

    const steps = [
      'Accessing active data mapping logs...',
      'Verifying storage shard residency in Frankfurt, Germany...',
      'Cross-referencing Stripe payment paths with active PCI compliance registries...',
      'Scanning CRM webhooks for active Standard Contractual Clauses (SCCs)...',
      'Auditing right-to-be-forgotten automated delete hooks in shred engine...',
      'Mapping dynamic code drifts against latest judicial declarations...'
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev === null) return null;
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(progressInterval);
          // Complete verification
          setVerificationResult({
            score: 94,
            timestamp: new Date().toLocaleString(),
            warnings: [
              'Active transfer path found to CRM (US Region) with location coordinates. Verify additional encryption layers under GDPR Art. 44.',
              'IoT Telemetry consent tokens require scheduled automated expiry audits.'
            ],
            passes: [
              'Frankfurt sovereign sharded storage residency verified (100% compliant).',
              'Cryptographic shredding hooks verified using envelope key revocation.',
              'eIDAS SD-JWT authentication schema verified with zero raw-PII trace logs.',
              'Stripe PCI-DSS compliance contract holds a sealed DPA escrow certificate.'
            ]
          });
          return 100;
        }
        return next;
      });
      currentStep++;
    }, 400);
  };

  // SVG dimensions for coordinates
  // Origin Col: x=80, Storage Col: x=280, Transfer Col: x=480, Destruction Col: x=680
  // Rows: Row1: y=80, Row2: y=220, Row3: y=360
  const nodeCoordinates: Record<string, { x: number; y: number }> = {
    'origin-mobile': { x: 70, y: 70 },
    'origin-web': { x: 70, y: 210 },
    'origin-telemetry': { x: 70, y: 350 },

    'store-sharded': { x: 300, y: 70 },
    'store-biometric': { x: 300, y: 210 },
    'store-ledger': { x: 300, y: 350 },

    'transfer-payment': { x: 530, y: 70 },
    'transfer-crm': { x: 530, y: 210 },
    'transfer-tribunal': { x: 530, y: 350 },

    'destruct-shred': { x: 760, y: 210 },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-sans text-slate-100" id="data_mapping_dashboard_main">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-800 bg-slate-950/80 p-4 sm:p-5 lg:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/50 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              PII Compliance Flow
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              Live Audit Sync
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-2 tracking-tight">
            Interactive PII Data Mapping Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Verify real-time data flows, legal processing bases, local storage regions, and third-party egress pathways. Select a data category to isolate its cryptographic lifecycle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={runVerificationScan}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-900/20"
          >
            <Shield className="w-4 h-4" />
            Verify Flow Compliance
          </button>
          
          <button
            onClick={() => setIsSimulatingFlow(!isSimulatingFlow)}
            className={`px-4 py-2 border font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              isSimulatingFlow 
                ? 'bg-amber-950 border-amber-800 text-amber-300' 
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulatingFlow ? 'animate-pulse text-amber-400' : ''}`} />
            {isSimulatingFlow ? 'Pause Data Simulation' : 'Simulate Data Ingest'}
          </button>
        </div>
      </div>

      {/* FILTER & CONTROL PANEL */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2">Filter Lifecycle:</span>
        <div className="flex flex-wrap gap-1.5">
          {piiCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedPii(cat.id);
                // Clear simulation to prevent sync confusion
                setIsSimulatingFlow(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                selectedPii === cat.id
                  ? 'bg-slate-800 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-${cat.color}-500`} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN VISUAL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* INTERACTIVE FLOW CHART CANVAS (3 Columns on Desktop) */}
        <div className="lg:col-span-3 p-4 sm:p-5 lg:p-6 bg-[#090D1A] relative min-h-[500px] overflow-x-auto select-none flex flex-col justify-between">
          
          {/* Legend Banner */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-6 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500" /> Origins (Ingest)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500" /> Secure Storage</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500/20 border border-purple-500" /> Transfers (Egress)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500" /> Shred Engine</span>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="relative min-w-[850px] mx-auto my-4 h-[420px]" id="flow_chart_canvas">
            
            {/* SVG CONNECTIONS OVERLAY LAYER */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
                </linearGradient>
                <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
                </marker>
                <marker id="arrow-highlighted" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                </marker>
                <marker id="arrow-sim" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* DRAW CONNECTIONS */}
              {connections.map((conn, idx) => {
                const start = nodeCoordinates[conn.from];
                const end = nodeCoordinates[conn.to];
                if (!start || !end) return null;

                const isHighlighted = isConnectionHighlighted(conn);
                const isSimulatedPath = isSimulatingFlow && 
                  simulationSteps[activeStepIndex] === conn.from &&
                  simulationSteps[(activeStepIndex + 1) % simulationSteps.length] === conn.to;

                // Visual offsets so nodes center correctly (node sizes are roughly 180x60)
                const startX = start.x + 90;
                const startY = start.y + 30;
                const endX = end.x + 90;
                const endY = end.y + 30;

                // Bezier control points for sweeping smooth organic path curves
                const controlX1 = startX + (endX - startX) * 0.45;
                const controlY1 = startY;
                const controlX2 = startX + (endX - startX) * 0.55;
                const controlY2 = endY;

                const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

                return (
                  <g key={`path-${idx}`}>
                    {/* Base Path line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isHighlighted ? '#475569' : '#1e293b'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={!isHighlighted ? '4 4' : undefined}
                      markerEnd="url(#arrow)"
                      className="transition-all duration-300"
                    />

                    {/* Highlighted path line */}
                    {isHighlighted && selectedPii !== 'all' && (
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        d={pathData}
                        fill="none"
                        stroke="url(#highlightGrad)"
                        strokeWidth={3}
                        markerEnd="url(#arrow-highlighted)"
                      />
                    )}

                    {/* Animated Data Particle during Simulation */}
                    {(isHighlighted || isSimulatedPath) && (
                      <g>
                        <path
                          d={pathData}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={4}
                        />
                        <circle r="4" fill={isSimulatingFlow ? '#f59e0b' : '#818cf8'}>
                          <animateMotion
                            path={pathData}
                            dur={isSimulatingFlow ? '1.8s' : '3s'}
                            rotate="auto"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* FLOW NODES LAYER */}
            {nodes.map(node => {
              const pos = nodeCoordinates[node.id];
              const isHighlighted = isNodeHighlighted(node);
              const isSelected = selectedNodeId === node.id;
              const isStepActive = isSimulatingFlow && simulationSteps[activeStepIndex] === node.id;
              
              const IconComponent = node.icon;

              // Node category color mapping
              const categoryClasses = {
                origin: 'border-blue-500/30 hover:border-blue-500 bg-blue-950/25',
                storage: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/25',
                transfer: 'border-purple-500/30 hover:border-purple-500 bg-purple-950/25',
                destruction: 'border-rose-500/30 hover:border-rose-500 bg-rose-950/25',
              };

              const categorySelectedClasses = {
                origin: 'ring-2 ring-blue-500 border-blue-400 bg-blue-950/50 shadow-md shadow-blue-500/20',
                storage: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-950/50 shadow-md shadow-emerald-500/20',
                transfer: 'ring-2 ring-purple-500 border-purple-400 bg-purple-950/50 shadow-md shadow-purple-500/20',
                destruction: 'ring-2 ring-rose-500 border-rose-400 bg-rose-950/50 shadow-md shadow-rose-500/20',
              };

              const highlightDotColors = {
                origin: 'bg-blue-400',
                storage: 'bg-emerald-400',
                transfer: 'bg-purple-400',
                destruction: 'bg-rose-400',
              };

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: '180px',
                    height: '60px',
                  }}
                  onClick={() => handleNodeClick(node.id)}
                  className={`rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-300 cursor-pointer z-10 ${
                    !isHighlighted 
                      ? 'opacity-25 grayscale hover:opacity-40' 
                      : isSelected 
                      ? categorySelectedClasses[node.category] 
                      : categoryClasses[node.category]
                  } ${isStepActive ? 'ring-2 ring-amber-500 scale-105 border-amber-400 bg-amber-950/40 shadow-xl' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      node.category === 'origin' ? 'bg-blue-500/10 text-blue-400' :
                      node.category === 'storage' ? 'bg-emerald-500/10 text-emerald-400' :
                      node.category === 'transfer' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="truncate pr-1">
                      <div className="text-[11px] font-bold text-white tracking-tight truncate">{node.label}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">{node.subText}</div>
                    </div>
                  </div>

                  {/* Flow dots or warning badge */}
                  <div className="flex items-center justify-between text-[8px] font-mono mt-1">
                    <span className="text-slate-500">
                      {node.details.riskLevel} Risk
                    </span>
                    <span className="flex items-center gap-1">
                      {node.details.complianceStatus === 'Warning' && (
                        <AlertTriangle className="w-3 h-3 text-amber-500 animate-pulse" />
                      )}
                      <span className={`w-1.5 h-1.5 rounded-full ${highlightDotColors[node.category]}`} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          {/* Interactive footer tracker */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3 font-mono">
            <span>
              Isolating: <strong className="text-slate-200 capitalize">{selectedPii === 'all' ? 'All System Lifecycles' : `${selectedPii} profile`}</strong>
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                7 Nodes Validated
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                2 Drifts Pending Verification
              </span>
            </div>
          </div>
        </div>

        {/* METADATA DETAILS SIDE PANEL (1 Column on Desktop) */}
        <div className="p-4 sm:p-5 lg:p-6 bg-slate-950/80 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">
              Asset Properties
            </h3>

            {selectedNode ? (
              <div className="mt-4 space-y-5">
                {/* Node Title Header */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                      selectedNode.category === 'origin' ? 'bg-blue-950 text-blue-400 border border-blue-900/50' :
                      selectedNode.category === 'storage' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                      selectedNode.category === 'transfer' ? 'bg-purple-950 text-purple-400 border border-purple-900/50' :
                      'bg-rose-950 text-rose-400 border border-rose-900/50'
                    }`}>
                      {selectedNode.category}
                    </span>
                    
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                      selectedNode.details.complianceStatus === 'Verified' ? 'bg-emerald-950 text-emerald-400' :
                      selectedNode.details.complianceStatus === 'Warning' ? 'bg-amber-950 text-amber-400' :
                      'bg-rose-950 text-rose-400'
                    }`}>
                      {selectedNode.details.complianceStatus}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white mt-1.5">{selectedNode.label}</h4>
                  <p className="text-xs text-slate-400 mt-1">{selectedNode.subText}</p>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Key-Value Details Grid */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Interface Protocol:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block font-mono">{selectedNode.details.protocol}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Encryption Standard:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedNode.details.encryption}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Retention Mandate:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block flex items-center gap-1 text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedNode.details.retention}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Legal Basis (GDPR/eIDAS):</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedNode.details.legalBasis}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Operational Owner:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block font-mono">{selectedNode.details.owner}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Supported Data Profiles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.supportedPii.map(pii => (
                        <span key={pii} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
                          {pii}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Subtext description */}
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/40 text-[11px] text-slate-400 leading-normal">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[10px] uppercase font-mono tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    Compliance Context
                  </div>
                  {selectedNode.details.additionalInfo}
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-slate-500 text-xs py-12">
                Click any node in the flow diagram to query detailed asset credentials and GDPR transfer risk metadata.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5" />
              Sovereign Safeguards
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Internal mappings are cryptographically sealed and locked inside the Distributed Ledger under hash audits.
            </p>
          </div>
        </div>

      </div>

      {/* COMPLIANCE VERIFICATION PROCESSOR MODAL */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="compliance-verification-modal-overlay">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl font-sans"
            >
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 lg:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-black text-white">Continuous Flow Auditor</h3>
                </div>
                {verificationProgress === 100 && (
                  <button 
                    onClick={() => setShowVerificationModal(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                
                {/* Progress bar */}
                {verificationProgress !== null && verificationProgress < 100 && (
                  <div className="space-y-3 py-5 sm:py-8 text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <h4 className="text-sm font-semibold text-slate-200">Evaluating PII Lineage Paths...</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {verificationProgress}% Completed
                    </p>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-sm mx-auto">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${verificationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Audit results */}
                {verificationResult && (
                  <div className="space-y-5">
                    
                    {/* Score summary */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex items-center gap-5">
                      <div className="relative flex items-center justify-center w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                          <circle 
                            cx="40" cy="40" r="32" 
                            stroke="#10b981" strokeWidth="6" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 32}
                            strokeDashoffset={2 * Math.PI * 32 * (1 - verificationResult.score / 100)}
                          />
                        </svg>
                        <span className="absolute text-lg font-black text-white font-mono">{verificationResult.score}%</span>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">Data Mapping Alignment Sealed</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          No structural violations identified. Mappings perfectly correspond to active infrastructure nodes.
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono block mt-2">
                          Audit Timestamp: {verificationResult.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Checklists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 overflow-y-auto pr-1">
                      
                      {/* Passes */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase font-mono block">
                          Verified Safeguards ({verificationResult.passes.length})
                        </span>
                        {verificationResult.passes.map((pass: string, idx: number) => (
                          <div key={idx} className="bg-slate-950/30 border border-slate-900 p-2.5 rounded-lg text-xs flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300 leading-normal">{pass}</span>
                          </div>
                        ))}
                      </div>

                      {/* Warnings */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase font-mono block">
                          Potential Gaps / Drift Advisories ({verificationResult.warnings.length})
                        </span>
                        {verificationResult.warnings.map((warn: string, idx: number) => (
                          <div key={idx} className="bg-slate-950/30 border border-slate-900 p-2.5 rounded-lg text-xs flex gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300 leading-normal">{warn}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => setShowVerificationModal(false)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md"
                      >
                        Accept and File Compliance Certificate
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
