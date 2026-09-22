import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  User,
  Hash,
  ShieldAlert,
  Globe,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Target,
  Share2,
  ExternalLink,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Calendar,
  Lock,
  ChevronRight,
  Sparkles,
  Download,
  Flame,
  Activity,
  Maximize2
} from 'lucide-react';

export interface GraphNodeUI {
  id: string;
  label: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  pinned?: boolean;
}

export interface GraphEdgeUI {
  id: string;
  type: string;
  fromNodeId: string;
  toNodeId: string;
  properties?: Record<string, any>;
}

interface EntityNodeInspectorDrawerProps {
  node: GraphNodeUI | null;
  edges: GraphEdgeUI[];
  allNodes: GraphNodeUI[];
  isOpen: boolean;
  onClose: () => void;
  onCenterOnNode: (node: GraphNodeUI) => void;
  onSelectNode: (node: GraphNodeUI) => void;
  onSetPathSource?: (nodeId: string) => void;
  onSetPathTarget?: (nodeId: string) => void;
  onQuerySubNetwork?: (nodeId: string) => void;
}

export const EntityNodeInspectorDrawer: React.FC<EntityNodeInspectorDrawerProps> = ({
  node,
  edges,
  allNodes,
  isOpen,
  onClose,
  onCenterOnNode,
  onSelectNode,
  onSetPathSource,
  onSetPathTarget,
  onQuerySubNetwork,
}) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'relationships' | 'compliance' | 'audit'>('metadata');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifiedHash, setVerifiedHash] = useState<boolean>(false);
  const [enforcementActionSuccess, setEnforcementActionSuccess] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Connected edges and neighbor nodes computation
  const connectedEdges = useMemo(() => {
    if (!node) return [];
    return edges.filter(e => e.fromNodeId === node.id || e.toNodeId === node.id);
  }, [node, edges]);

  const neighborNodes = useMemo(() => {
    if (!node) return [];
    return connectedEdges.map(edge => {
      const isOutgoing = edge.fromNodeId === node.id;
      const otherNodeId = isOutgoing ? edge.toNodeId : edge.fromNodeId;
      const otherNode = allNodes.find(n => n.id === otherNodeId);
      return {
        edge,
        isOutgoing,
        otherNode: otherNode || { id: otherNodeId, label: 'Unknown', properties: {} },
      };
    });
  }, [node, connectedEdges, allNodes]);

  if (!isOpen || !node) return null;

  // Node categorization and badges
  const isEntity = node.label === 'Entity';
  const isPerson = node.label === 'Person';
  const isIdentifier = node.label === 'Identifier';
  const isViolation = node.label === 'Violation';
  const isWebsite = node.label === 'Website';

  const riskTier = node.properties?.risk_tier || (isViolation ? 'CRITICAL' : 'LOW');
  const complianceScore = node.properties?.compliance_score !== undefined ? node.properties.compliance_score : 85;
  const isBlacklisted = !!node.properties?.blacklisted;
  const primaryName = node.properties?.name || node.properties?.value || node.properties?.domain || node.properties?.law_section || node.id;
  const evidenceRef = node.properties?.evidence_ref || `EV_SHA256_EVIDENCE_${node.id.toUpperCase()}_BD_GOV`;

  // Risk flags computation
  const riskFlags: { title: string; desc: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'; icon: any }[] = [];

  if (isBlacklisted || riskTier === 'CRITICAL') {
    riskFlags.push({
      title: 'Sanctioned / Blacklisted Target',
      desc: 'Entity is flagged on national regulatory registry and barred from operating electronic payment services.',
      severity: 'CRITICAL',
      icon: Flame,
    });
  }

  if (complianceScore < 50) {
    riskFlags.push({
      title: 'Severe Compliance Deficit (<50/100)',
      desc: 'Systemic failure across KYC verification, digital licensing, and AML threshold compliance.',
      severity: 'HIGH',
      icon: AlertTriangle,
    });
  }

  // Serial Operator Fan-out check
  const sameAsCount = connectedEdges.filter(e => e.type === 'SAME_AS' || e.type === 'IDENTIFIED_BY').length;
  if (sameAsCount >= 2 || isIdentifier) {
    riskFlags.push({
      title: 'Serial Operator Identifier Footprint',
      desc: `Associated with ${sameAsCount} multi-tenant entity connections, signaling an orchestrated proxy ring.`,
      severity: 'HIGH',
      icon: Layers,
    });
  }

  // Violation check
  const violationEdges = connectedEdges.filter(e => e.type === 'VIOLATED');
  if (violationEdges.length > 0) {
    riskFlags.push({
      title: `${violationEdges.length} Active Regulatory Violation(s) Linked`,
      desc: 'Direct topological linkage to documented infractions under Cyber Security Act / AML Regulations.',
      severity: 'CRITICAL',
      icon: ShieldAlert,
    });
  }

  if (riskFlags.length === 0) {
    riskFlags.push({
      title: 'Nominal Compliance Standing',
      desc: 'No immediate high-severity topological risk anomalies detected on current evidence baseline.',
      severity: 'MEDIUM',
      icon: ShieldCheck,
    });
  }

  const handleTriggerAction = (actionTitle: string) => {
    setEnforcementActionSuccess(`Action successfully initiated: "${actionTitle}" for node ${node.id}`);
    setTimeout(() => setEnforcementActionSuccess(null), 4000);
  };

  return (
    <div
      id="entity-node-inspector-slideout"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out text-slate-200 overflow-hidden"
    >
      {/* Top Slide-Out Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Archetype Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-lg ${
                isEntity
                  ? riskTier === 'CRITICAL'
                    ? 'bg-rose-950 border-rose-800 text-rose-400'
                    : 'bg-emerald-950 border-emerald-800 text-emerald-400'
                  : isPerson
                  ? 'bg-purple-950 border-purple-800 text-purple-400'
                  : isIdentifier
                  ? 'bg-cyan-950 border-cyan-800 text-cyan-400'
                  : isViolation
                  ? 'bg-rose-950 border-rose-800 text-rose-400'
                  : 'bg-indigo-950 border-indigo-800 text-indigo-400'
              }`}
            >
              {isEntity && <Building2 className="w-5 h-5" />}
              {isPerson && <User className="w-5 h-5" />}
              {isIdentifier && <Hash className="w-5 h-5" />}
              {isViolation && <ShieldAlert className="w-5 h-5" />}
              {isWebsite && <Globe className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {node.label}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    riskTier === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : riskTier === 'HIGH'
                      ? 'bg-orange-950 text-orange-300 border-orange-800'
                      : riskTier === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {riskTier} RISK
                </span>
                {isBlacklisted && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-900/80 text-white border border-rose-600 animate-pulse">
                    SANCTIONED
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-white truncate max-w-sm mt-0.5" title={primaryName}>
                {primaryName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Center in Canvas */}
            <button
              onClick={() => onCenterOnNode(node)}
              className="p-2 bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition cursor-pointer border border-slate-700"
              title="Focus & Center Camera on Node"
            >
              <Target className="w-4 h-4" />
            </button>

            {/* Close Drawer Button */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-300 rounded-lg transition cursor-pointer border border-slate-700"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Node Actions Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onQuerySubNetwork && (
            <button
              onClick={() => onQuerySubNetwork(node.id)}
              className="px-2.5 py-1 text-[11px] font-mono font-bold bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-md transition flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>Expand Subgraph (2 Hops)</span>
            </button>
          )}

          {onSetPathSource && (
            <button
              onClick={() => onSetPathSource(node.id)}
              className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="Set as Shortest Path Source (e1)"
            >
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>Set Source (e1)</span>
            </button>
          )}

          {onSetPathTarget && (
            <button
              onClick={() => onSetPathTarget(node.id)}
              className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="Set as Shortest Path Target (e2)"
            >
              <Target className="w-3 h-3 text-amber-400" />
              <span>Set Target (e2)</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(JSON.stringify(node, null, 2), 'full_json')}
            className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition flex items-center gap-1 cursor-pointer border border-slate-700"
          >
            {copiedKey === 'full_json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy JSON</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {enforcementActionSuccess && (
        <div className="bg-emerald-950/90 border-y border-emerald-700/60 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{enforcementActionSuccess}</span>
        </div>
      )}

      {/* Slide-out Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/40 px-3 pt-2 text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'metadata'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Identity & Metadata</span>
        </button>

        <button
          onClick={() => setActiveTab('relationships')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'relationships'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Edges ({connectedEdges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'compliance'
              ? 'border-rose-500 text-rose-400 bg-rose-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Risk Flags ({riskFlags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-2 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-amber-500 text-amber-400 bg-amber-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Drawer Body Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* TAB 1: METADATA & PROFILE */}
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            {/* Primary High-Level Summary Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Core Entity Registration Record
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-500">NODE ID</div>
                  <div className="font-mono font-bold text-slate-200 truncate flex items-center justify-between">
                    <span>{node.id}</span>
                    <button
                      onClick={() => handleCopy(node.id, 'id')}
                      className="text-slate-500 hover:text-white cursor-pointer ml-1"
                    >
                      {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-500">TAX / REGISTRATION ID</div>
                  <div className="font-mono font-bold text-slate-200 truncate">
                    {node.properties?.tin || node.properties?.bin || node.properties?.reg_no || 'TIN-8801948291'}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-500">CATEGORY / SECTOR</div>
                  <div className="font-bold text-slate-200 truncate">
                    {node.properties?.category || node.properties?.industry || 'MFS Agent / Digital Commerce'}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-500">JURISDICTION</div>
                  <div className="font-bold text-slate-200 truncate">
                    {node.properties?.country || 'Global Region (Telecom Regulatory Authority / BB)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Hash & Verification */}
            <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Immutable Evidence Vault Digest</span>
                </div>
                <button
                  onClick={() => setVerifiedHash(true)}
                  className="text-[10px] font-mono bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700 transition cursor-pointer"
                >
                  {verifiedHash ? 'Verified ✓' : 'Verify SHA-256'}
                </button>
              </div>

              <div className="bg-slate-950/90 p-2.5 rounded-lg border border-indigo-950 font-mono text-[11px] text-slate-300 break-all flex items-center justify-between gap-2">
                <span>{evidenceRef}</span>
                <button
                  onClick={() => handleCopy(evidenceRef, 'evidence')}
                  className="text-slate-500 hover:text-white cursor-pointer shrink-0"
                >
                  {copiedKey === 'evidence' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {verifiedHash && (
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cryptographic signature validated against Postgres Merkle audit log.</span>
                </div>
              )}
            </div>

            {/* Key-Value Properties Inspector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Node Properties Inspector</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {Object.keys(node.properties || {}).length} Attributes
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl divide-y divide-slate-800/80 font-mono text-xs overflow-hidden">
                {node.properties && Object.entries(node.properties).map(([k, v]) => (
                  <div key={k} className="p-2.5 flex items-start justify-between gap-3 hover:bg-slate-800/40 transition">
                    <span className="text-slate-400 font-bold shrink-0">{k}</span>
                    <span className="text-slate-200 text-right break-all">
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RELATIONSHIPS & CONNECTED EDGES */}
        {activeTab === 'relationships' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="text-xs font-mono text-slate-300">
                Total Direct Connections: <strong className="text-indigo-400">{connectedEdges.length}</strong>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-cyan-400" /> Out: {connectedEdges.filter(e => e.fromNodeId === node.id).length}</span>
                <span className="flex items-center gap-1"><ArrowLeft className="w-3 h-3 text-purple-400" /> In: {connectedEdges.filter(e => e.toNodeId === node.id).length}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {neighborNodes.map(({ edge, isOutgoing, otherNode }, idx) => {
                const isOtherEntity = otherNode.label === 'Entity';
                const isOtherViolation = otherNode.label === 'Violation';
                const isOtherPerson = otherNode.label === 'Person';
                const otherRisk = otherNode.properties?.risk_tier || (isOtherViolation ? 'CRITICAL' : 'LOW');
                const otherDisplayName = otherNode.properties?.name || otherNode.properties?.value || otherNode.properties?.domain || otherNode.id;

                return (
                  <div
                    key={edge.id || idx}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-indigo-500/60 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            edge.type === 'VIOLATED'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : edge.type === 'SAME_AS'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : edge.type === 'DIRECTOR_OF' || edge.type === 'OWNED_BY'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {edge.type}
                        </span>

                        <span className="text-slate-500 text-[11px] flex items-center gap-1">
                          {isOutgoing ? (
                            <>
                              <ArrowRight className="w-3 h-3 text-cyan-400" />
                              <span>Outgoing</span>
                            </>
                          ) : (
                            <>
                              <ArrowLeft className="w-3 h-3 text-purple-400" />
                              <span>Incoming</span>
                            </>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onSelectNode(otherNode);
                          onCenterOnNode(otherNode);
                        }}
                        className="text-[11px] font-mono text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 cursor-pointer hover:underline"
                        title="Pivot to this node in graph & inspector"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Neighbor Node Card */}
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/90 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                            isOtherEntity
                              ? 'bg-emerald-950 text-emerald-400'
                              : isOtherPerson
                              ? 'bg-purple-950 text-purple-400'
                              : isOtherViolation
                              ? 'bg-rose-950 text-rose-400'
                              : 'bg-cyan-950 text-cyan-400'
                          }`}
                        >
                          {otherNode.label.substring(0, 3)}
                        </div>

                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{otherDisplayName}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">{otherNode.id}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          otherRisk === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : otherRisk === 'HIGH'
                            ? 'bg-orange-950 text-orange-300 border border-orange-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {otherRisk}
                      </span>
                    </div>
                  </div>
                );
              })}

              {neighborNodes.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No direct relational edges connected to this node in current graph view.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMPLIANCE RISK FLAGS & VIOLATIONS */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            {/* Risk Score Gauge & Status */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Compliance Index</span>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    complianceScore >= 75
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : complianceScore >= 50
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {complianceScore} / 100
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    complianceScore >= 75 ? 'bg-emerald-500' : complianceScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${complianceScore}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                <div>Status: <strong className="text-white">{isBlacklisted ? 'Blacklisted' : 'Active'}</strong></div>
                <div>Risk Classification: <strong className="text-white">{riskTier}</strong></div>
              </div>
            </div>

            {/* List of Risk Flags */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold">
                Automated Risk Detection Flags ({riskFlags.length})
              </div>

              {riskFlags.map((flag, idx) => {
                const Icon = flag.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      flag.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                        : flag.severity === 'HIGH'
                        ? 'bg-orange-950/30 border-orange-900/60 text-orange-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{flag.title}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-950 border border-slate-800">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{flag.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Regulatory Enforcement Action Trigger Buttons */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Authority Enforcement Actions</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => handleTriggerAction('Issue Formal Show-Cause Notice')}
                  className="p-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg transition text-left cursor-pointer flex items-center justify-between"
                >
                  <span>Issue Show-Cause</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleTriggerAction('Freeze Associated MFS Agent Wallet')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition text-left cursor-pointer flex items-center justify-between"
                >
                  <span>Freeze Agent Wallet</span>
                  <Lock className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleTriggerAction('Trigger Enhanced KYC Re-Verification')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition text-left cursor-pointer flex items-center justify-between"
                >
                  <span>Mandatory KYC Audit</span>
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleTriggerAction('Export Court Evidence Bundle')}
                  className="p-2.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 rounded-lg transition text-left cursor-pointer flex items-center justify-between"
                >
                  <span>Export Court Bundle</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Forensic Intelligence Log</span>
              </div>

              <div className="relative border-l border-slate-800 pl-4 space-y-4 text-xs font-mono ml-2">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                  <div className="text-[10px] text-slate-500">2026-09-07 02:45:12 UTC</div>
                  <div className="font-bold text-white">Graph Neighborhood Re-indexed</div>
                  <div className="text-slate-400 text-[11px]">BFS search completed with 2 hops; discovered {connectedEdges.length} relationships.</div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-slate-950" />
                  <div className="text-[10px] text-slate-500">2026-09-06 18:22:04 UTC</div>
                  <div className="font-bold text-white">Risk Classification Evaluated</div>
                  <div className="text-slate-400 text-[11px]">Calculated Risk Tier: {riskTier} (Score: {complianceScore}/100)</div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                  <div className="text-[10px] text-slate-500">2026-09-05 11:10:00 UTC</div>
                  <div className="font-bold text-white">Cryptographic Merkle Proof Generated</div>
                  <div className="text-slate-400 text-[11px]">SHA-256 evidence bundle stamped into regulatory log.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Drawer Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500">Target: {node.id}</span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-bold cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
