import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Network,
  Share2,
  ShieldAlert,
  Search,
  Download,
  FileText,
  AlertTriangle,
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Hash,
  Globe,
  Building2,
  User,
  MapPin,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  Filter,
  SlidersHorizontal,
  Move,
  Target,
  Sparkles,
  Info,
  PanelRightOpen,
  ArrowRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EntityNodeInspectorDrawer } from './EntityNodeInspectorDrawer';

interface GraphNodeUI {
  id: string;
  label: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  pinned?: boolean;
}

interface GraphEdgeUI {
  id: string;
  type: string;
  fromNodeId: string;
  toNodeId: string;
  properties: Record<string, any>;
}

export const EntityNetworkExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'serial' | 'cycles' | 'clusters' | 'findings'>('graph');
  const [nodes, setNodes] = useState<GraphNodeUI[]>([]);
  const [edges, setEdges] = useState<GraphEdgeUI[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNodeUI | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('ent_bkash_agent_01');
  const [depth, setDepth] = useState<number>(2);

  // Path finding state
  const [pathSource, setPathSource] = useState<string>('');
  const [pathTarget, setPathTarget] = useState<string>('');
  const [pathResult, setPathResult] = useState<any>(null);

  // Analytics states
  const [serialOps, setSerialOps] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<any>(null);

  // Canvas Viewport & Interaction States
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNodeUI | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNodeUI | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  // Dynamic Legend Filters & Highlights
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isInspectorDrawerOpen, setIsInspectorDrawerOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Helper: Categorize node for dynamic legend & filtering
  const getNodeCategory = useCallback((node: GraphNodeUI): string => {
    if (node.label === 'Entity') {
      const risk = node.properties?.risk_tier || 'LOW';
      if (risk === 'CRITICAL') return 'entity_critical';
      if (risk === 'HIGH') return 'entity_high';
      if (risk === 'MEDIUM') return 'entity_medium';
      return 'entity_low';
    }
    if (node.label === 'Person') return 'person';
    if (node.label === 'Identifier') return 'identifier';
    if (node.label === 'Violation') return 'violation';
    if (node.label === 'Website') return 'website';
    return 'other';
  }, []);

  // Compute dynamic counts for legend items
  const legendStats = useMemo(() => {
    const stats: Record<string, number> = {
      entity_low: 0,
      entity_medium: 0,
      entity_high: 0,
      entity_critical: 0,
      person: 0,
      identifier: 0,
      violation: 0,
      website: 0,
    };
    nodes.forEach(n => {
      const cat = getNodeCategory(n);
      if (stats[cat] !== undefined) stats[cat]++;
    });
    return stats;
  }, [nodes, getNodeCategory]);

  // Fit to Screen Calculation
  const fitToScreen = useCallback((targetNodes: GraphNodeUI[] = nodes) => {
    if (targetNodes.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const canvas = canvasRef.current;
    const canvasWidth = canvas?.width || 900;
    const canvasHeight = canvas?.height || 520;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    targetNodes.forEach(n => {
      if (n.x !== undefined && n.y !== undefined) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      }
    });

    if (minX === Infinity) return;

    const graphWidth = Math.max(maxX - minX + 120, 300);
    const graphHeight = Math.max(maxY - minY + 120, 200);

    const scaleX = canvasWidth / graphWidth;
    const scaleY = canvasHeight / graphHeight;
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.85, 0.4), 1.8);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(targetZoom);
    setPan({
      x: canvasWidth / 2 - centerX * targetZoom,
      y: canvasHeight / 2 - centerY * targetZoom,
    });
  }, [nodes]);

  // Center on Selected Node
  const centerOnNode = useCallback((node: GraphNodeUI | null = selectedNode) => {
    if (!node || node.x === undefined || node.y === undefined) return;
    const canvas = canvasRef.current;
    const canvasWidth = canvas?.width || 900;
    const canvasHeight = canvas?.height || 520;

    setPan({
      x: canvasWidth / 2 - node.x * zoom,
      y: canvasHeight / 2 - node.y * zoom,
    });
  }, [selectedNode, zoom]);

  // Zoom preset helper
  const handleZoomPreset = (newZoom: number) => {
    const canvas = canvasRef.current;
    const canvasWidth = canvas?.width || 900;
    const canvasHeight = canvas?.height || 520;
    const currentCenterX = (canvasWidth / 2 - pan.x) / zoom;
    const currentCenterY = (canvasHeight / 2 - pan.y) / zoom;

    setZoom(newZoom);
    setPan({
      x: canvasWidth / 2 - currentCenterX * newZoom,
      y: canvasHeight / 2 - currentCenterY * newZoom,
    });
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.3), 3.0);

    const graphX = (mouseX - pan.x) / zoom;
    const graphY = (mouseY - pan.y) / zoom;

    setZoom(newZoom);
    setPan({
      x: mouseX - graphX * newZoom,
      y: mouseY - graphY * newZoom,
    });
  };

  const loadOverview = async () => {
    try {
      const res = await fetch('/api/v1/intel/graph/overview');
      const data = await res.json();
      if (data.success) {
        setOverviewStats(data.stats);
      }
    } catch (e) {
      console.warn('Could not load graph overview:', e);
    }
  };

  const queryNetwork = async (entityId: string, searchDepth: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/intel/graph/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'entity-network',
          entityId,
          depth: searchDepth,
        }),
      });
      const data = await res.json();
      if (data.success && data.nodes) {
        const width = 900;
        const height = 520;
        const count = data.nodes.length;

        // Position nodes in concentric clusters with organic angular offset
        const positionedNodes = data.nodes.map((n: GraphNodeUI, idx: number) => {
          if (idx === 0) {
            return { ...n, x: width / 2, y: height / 2, vx: 0, vy: 0 };
          }
          const ring = Math.floor((idx - 1) / 6) + 1;
          const totalInRing = Math.min(count - 1, 6 * ring);
          const angle = (((idx - 1) % (6 * ring)) / totalInRing) * 2 * Math.PI + (ring * 0.4);
          const radius = 130 * ring + (((idx - 1) % 3) * 20);
          return {
            ...n,
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
          };
        });

        setNodes(positionedNodes);
        setEdges(data.edges || []);
        if (positionedNodes.length > 0) {
          setSelectedNode(positionedNodes[0]);
        }
        fitToScreen(positionedNodes);
      }
    } catch (e) {
      console.error('Failed to query graph:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const [resSerial, resCycles, resClusters, resFindings] = await Promise.all([
        fetch('/api/v1/intel/graph/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'serial-operators' }),
        }),
        fetch('/api/v1/intel/graph/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'shell-candidates' }),
        }),
        fetch('/api/v1/intel/graph/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clusters' }),
        }),
        fetch('/api/v1/intel/graph/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'findings' }),
        }),
      ]);

      const [dataSerial, dataCycles, dataClusters, dataFindings] = await Promise.all([
        resSerial.json(),
        resCycles.json(),
        resClusters.json(),
        resFindings.json(),
      ]);

      if (dataSerial.success) setSerialOps(dataSerial.serialOperators || dataSerial.data || []);
      if (dataCycles.success) setCycles(dataCycles.shellCycles || dataCycles.data || []);
      if (dataClusters.success) setClusters(dataClusters.clusters || dataClusters.data || []);
      if (dataFindings.success) setFindings(dataFindings.findings || []);
    } catch (e) {
      console.error('Error loading analytics:', e);
    }
  };

  // Load Overview & Initial Graph on Mount
  useEffect(() => {
    loadOverview();
    queryNetwork(searchQuery, depth);
  }, []);

  const seedDemoNetwork = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/intel/graph/seed-demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadOverview();
        await queryNetwork('ent_bkash_agent_01', 2);
        loadAnalyticsData();
      }
    } catch (e) {
      console.error('Failed to seed demo:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePath = async () => {
    if (!pathSource || !pathTarget) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/intel/graph/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shortest-path',
          e1: pathSource.trim(),
          e2: pathTarget.trim(),
        }),
      });
      const data = await res.json();
      setPathResult(data);
      if (data.nodes && data.nodes.length > 0) {
        const width = 900;
        const height = 520;
        const positioned = data.nodes.map((n: GraphNodeUI, idx: number) => ({
          ...n,
          x: 120 + (idx / Math.max(data.nodes.length - 1, 1)) * 660,
          y: height / 2 + (idx % 2 === 0 ? -40 : 40),
        }));
        setNodes(positioned);
        setEdges(data.edges || []);
        fitToScreen(positioned);
      }
    } catch (e) {
      console.error('Error finding shortest path:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFinding = async (findingId: string, status: string) => {
    try {
      const res = await fetch('/api/v1/intel/graph/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review-finding',
          findingId,
          status,
          reviewer: 'authority_officer_01',
          reviewNotes: `Marked as ${status} via Entity Network Explorer workbench.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings(prev => prev.map(f => f.id === findingId ? { ...f, status } : f));
        loadOverview();
      }
    } catch (e) {
      console.error('Review finding error:', e);
    }
  };

  // MiniMap Rendering
  const renderMiniMap = useCallback(() => {
    const miniCanvas = miniMapRef.current;
    if (!miniCanvas || !showMiniMap || nodes.length === 0) return;
    const miniCtx = miniCanvas.getContext('2d');
    if (!miniCtx) return;

    miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      if (n.x !== undefined && n.y !== undefined) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      }
    });

    const padding = 100;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const gWidth = Math.max(maxX - minX, 200);
    const gHeight = Math.max(maxY - minY, 200);
    const scale = Math.min(miniCanvas.width / gWidth, miniCanvas.height / gHeight);

    // Draw background
    miniCtx.fillStyle = '#090d16';
    miniCtx.fillRect(0, 0, miniCanvas.width, miniCanvas.height);

    // Draw Mini Nodes
    nodes.forEach(n => {
      if (n.x === undefined || n.y === undefined) return;
      const mx = (n.x - minX) * scale;
      const my = (n.y - minY) * scale;
      miniCtx.beginPath();
      miniCtx.arc(mx, my, 2.5, 0, Math.PI * 2);
      miniCtx.fillStyle = n.label === 'Entity' ? (n.properties?.risk_tier === 'CRITICAL' ? '#f43f5e' : '#10b981') : '#6366f1';
      miniCtx.fill();
    });

    // Draw Viewport Rect on MiniMap
    const canvas = canvasRef.current;
    if (canvas) {
      const vLeft = (-pan.x / zoom - minX) * scale;
      const vTop = (-pan.y / zoom - minY) * scale;
      const vWidth = (canvas.width / zoom) * scale;
      const vHeight = (canvas.height / zoom) * scale;

      miniCtx.strokeStyle = '#38bdf8';
      miniCtx.lineWidth = 1.5;
      miniCtx.strokeRect(vLeft, vTop, vWidth, vHeight);
      miniCtx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      miniCtx.fillRect(vLeft, vTop, vWidth, vHeight);
    }
  }, [nodes, showMiniMap, pan, zoom]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw Dark Forensic Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = -2000; x < 3000; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -2000);
      ctx.lineTo(x, 3000);
      ctx.stroke();
    }
    for (let y = -2000; y < 3000; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-2000, y);
      ctx.lineTo(3000, y);
      ctx.stroke();
    }

    // Draw Edges
    edges.forEach(edge => {
      const from = nodes.find(n => n.id === edge.fromNodeId);
      const to = nodes.find(n => n.id === edge.toNodeId);
      if (!from || !to || from.x === undefined || from.y === undefined || to.x === undefined || to.y === undefined) return;

      const isFromFiltered = activeCategoryFilter ? getNodeCategory(from) === activeCategoryFilter : true;
      const isToFiltered = activeCategoryFilter ? getNodeCategory(to) === activeCategoryFilter : true;
      const isEdgeDimmed = activeCategoryFilter && !isFromFiltered && !isToFiltered;

      ctx.save();
      if (isEdgeDimmed) {
        ctx.globalAlpha = 0.15;
      }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (edge.type === 'VIOLATED') {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
      } else if (edge.type === 'SAME_AS') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 3]);
      } else if (edge.type === 'OWNED_BY' || edge.type === 'DIRECTOR_OF') {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Edge Label Badge
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(midX - 32, midY - 8, 64, 16);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(midX - 32, midY - 8, 64, 16);

      ctx.font = '9px monospace';
      ctx.fillStyle = isEdgeDimmed ? '#475569' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.type.replace('_', ' '), midX, midY);

      ctx.restore();
    });

    // Draw Nodes
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const category = getNodeCategory(node);
      const isMatchedByFilter = !activeCategoryFilter || category === activeCategoryFilter;

      ctx.save();
      if (!isMatchedByFilter) {
        ctx.globalAlpha = 0.2;
      }

      const radius = isSelected ? 26 : isHovered ? 24 : 22;

      // Glow Aura for Selected, Hovered, or Critical nodes
      if (isSelected || isHovered || node.properties?.risk_tier === 'CRITICAL') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? 'rgba(99, 102, 241, 0.4)'
          : isHovered
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(244, 63, 94, 0.3)';
        ctx.fill();
      }

      // Active category filter pulse ring
      if (activeCategoryFilter && isMatchedByFilter) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

      // Node Color Assignment
      if (node.label === 'Entity') {
        const risk = node.properties?.risk_tier;
        if (risk === 'CRITICAL') ctx.fillStyle = '#be123c';
        else if (risk === 'HIGH') ctx.fillStyle = '#c2410c';
        else if (risk === 'MEDIUM') ctx.fillStyle = '#b45309';
        else ctx.fillStyle = '#047857';
      } else if (node.label === 'Person') {
        ctx.fillStyle = '#7e22ce';
      } else if (node.label === 'Identifier') {
        ctx.fillStyle = '#0284c7';
      } else if (node.label === 'Violation') {
        ctx.fillStyle = '#e11d48';
      } else if (node.label === 'Website') {
        ctx.fillStyle = '#4f46e5';
      } else {
        ctx.fillStyle = '#334155';
      }

      ctx.fill();
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeStyle = isSelected ? '#ffffff' : '#64748b';
      ctx.stroke();

      // Node Short Type Glyph
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial =
        node.label === 'Entity'
          ? 'ENT'
          : node.label === 'Person'
          ? 'DIR'
          : node.label === 'Identifier'
          ? 'ID'
          : node.label === 'Violation'
          ? 'VIO'
          : 'WEB';
      ctx.fillText(initial, node.x, node.y);

      // Node Display Label Text Below
      const displayName =
        node.properties?.name ||
        node.properties?.value ||
        node.properties?.domain ||
        node.properties?.law_section ||
        node.id;
      const truncated = displayName.length > 20 ? displayName.substring(0, 18) + '...' : displayName;

      ctx.fillStyle = isMatchedByFilter ? '#f8fafc' : '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText(truncated, node.x, node.y + radius + 14);

      // If Pinned Indicator
      if (node.pinned) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(node.x + radius - 4, node.y - radius + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();

    renderMiniMap();
  }, [nodes, edges, selectedNode, hoveredNode, zoom, pan, activeCategoryFilter, getNodeCategory, renderMiniMap]);

  // Canvas Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const graphX = (clientX - pan.x) / zoom;
    const graphY = (clientY - pan.y) / zoom;

    const clicked = nodes.find(n => {
      if (n.x === undefined || n.y === undefined) return false;
      const dist = Math.hypot(n.x - graphX, n.y - graphY);
      return dist <= 26;
    });

    if (clicked) {
      setSelectedNode(clicked);
      setDraggedNode(clicked);
      setIsInspectorDrawerOpen(true);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const graphX = (clientX - pan.x) / zoom;
    const graphY = (clientY - pan.y) / zoom;

    if (draggedNode && draggedNode.x !== undefined && draggedNode.y !== undefined) {
      setNodes(prev =>
        prev.map(n => (n.id === draggedNode.id ? { ...n, x: graphX, y: graphY, pinned: true } : n))
      );
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      const hovered = nodes.find(n => {
        if (n.x === undefined || n.y === undefined) return false;
        const dist = Math.hypot(n.x - graphX, n.y - graphY);
        return dist <= 24;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  // Export PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `network_graph_${searchQuery}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Export Court Dossier PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toISOString();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(244, 63, 94);
    doc.text('FORENSIC GRAPH INTELLIGENCE DOSSIER', 14, 20);

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`REGULATORY EVIDENCE BUNDLE | TIMESTAMP (UTC): ${now}`, 14, 27);
    doc.text(`TARGET ENTITY / QUERY: ${searchQuery.toUpperCase()} | SEARCH DEPTH: ${depth} HOPS`, 14, 32);

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 14, 38, 182, 85);
      } catch (e) {
        console.warn('Could not attach canvas to PDF:', e);
      }
    }

    const nodeRows = nodes.map(n => [
      n.id,
      n.label,
      n.properties?.risk_tier || 'N/A',
      n.properties?.compliance_score !== undefined ? `${n.properties.compliance_score}/100` : 'N/A',
      n.properties?.name || n.properties?.value || n.properties?.domain || '-'
    ]);

    (doc as any).autoTable({
      startY: 130,
      head: [['Node ID', 'Type', 'Risk Tier', 'Score', 'Primary Identifier']],
      body: nodeRows,
      theme: 'grid',
      styles: { fontSize: 8, textColor: [226, 232, 240], fillColor: [30, 41, 59] },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 200;

    doc.setFontSize(11);
    doc.setTextColor(244, 63, 94);
    doc.text('AUDIT FINDINGS & DETECTED PATTERNS', 14, finalY + 12);

    const findingRows = findings.map(f => [
      f.id,
      f.finding_type,
      f.severity,
      f.status?.toUpperCase() || 'NEW',
      (f.explanation || '').substring(0, 75) + '...'
    ]);

    (doc as any).autoTable({
      startY: finalY + 18,
      head: [['Finding Ref', 'Type', 'Severity', 'Status', 'XAI Natural Language Explanation']],
      body: findingRows,
      theme: 'grid',
      styles: { fontSize: 8, textColor: [226, 232, 240], fillColor: [30, 41, 59] },
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255] }
    });

    doc.save(`court_dossier_network_${searchQuery}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Top Controls & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-400 font-mono">TOTAL NODES</div>
          <div className="text-xl font-black text-white">{overviewStats?.totalNodes ?? nodes.length}</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-400 font-mono">RELATIONSHIPS</div>
          <div className="text-xl font-black text-indigo-400">{overviewStats?.totalEdges ?? edges.length}</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-rose-400 font-mono">SERIAL OPERATORS</div>
          <div className="text-xl font-black text-rose-400">{overviewStats?.serialOperatorsCount ?? serialOps.length}</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-amber-400 font-mono">SHELL LOOPS</div>
          <div className="text-xl font-black text-amber-400">{overviewStats?.shellLoopsCount ?? cycles.length}</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-orange-400 font-mono">RISK CLUSTERS</div>
          <div className="text-xl font-black text-orange-400">{overviewStats?.riskClustersCount ?? clusters.length}</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-center">
          <button
            onClick={seedDemoNetwork}
            disabled={loading}
            className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Seed Network</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'graph' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Entity Force Graph</span>
        </button>
        <button
          onClick={() => { setActiveTab('serial'); loadAnalyticsData(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'serial' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Serial Operators</span>
        </button>
        <button
          onClick={() => { setActiveTab('cycles'); loadAnalyticsData(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'cycles' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Shell Cycles</span>
        </button>
        <button
          onClick={() => { setActiveTab('clusters'); loadAnalyticsData(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'clusters' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Risk Clusters</span>
        </button>
        <button
          onClick={() => { setActiveTab('findings'); loadAnalyticsData(); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'findings' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Findings Queue</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visual Canvas (Col 3) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
            {/* Search & Actions Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Query Entity ID / Name (e.g. ent_bkash_agent_01)..."
                  className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={depth}
                  onChange={e => setDepth(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value={1}>1 Hop</option>
                  <option value={2}>2 Hops</option>
                  <option value={3}>3 Hops</option>
                </select>
                <button
                  onClick={() => queryNetwork(searchQuery, depth)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Explore
                </button>
              </div>

              {/* Action Buttons: PNG & PDF Exporters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPNG}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  title="Export High-Res PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
                  title="Generate Court Dossier PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Court Dossier (PDF)</span>
                </button>
              </div>
            </div>

            {/* Canvas Container with Overlays & Navigation Controls */}
            <div
              className={`relative w-full ${isTheaterMode ? 'h-[750px]' : 'h-[560px]'} bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none transition-all duration-300`}
            >
              <canvas
                ref={canvasRef}
                width={isTheaterMode ? 1200 : 900}
                height={isTheaterMode ? 750 : 560}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                className={`w-full h-full ${draggedNode ? 'cursor-grabbing' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              />

              {/* FLOATING INTERACTION CONTROLS BAR (Top Right) */}
              <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl flex items-center gap-1.5 text-xs text-slate-300 z-10 font-mono">
                {/* Zoom In */}
                <button
                  onClick={() => handleZoomPreset(Math.min(zoom + 0.2, 3.0))}
                  className="p-1.5 bg-slate-800/80 hover:bg-indigo-600 hover:text-white rounded-lg transition cursor-pointer"
                  title="Zoom In (+20%)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Zoom Out */}
                <button
                  onClick={() => handleZoomPreset(Math.max(zoom - 0.2, 0.3))}
                  className="p-1.5 bg-slate-800/80 hover:bg-indigo-600 hover:text-white rounded-lg transition cursor-pointer"
                  title="Zoom Out (-20%)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Zoom Level Indicator & Quick Presets */}
                <div className="px-2 py-1 bg-slate-950 rounded-lg text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                  <span>{(zoom * 100).toFixed(0)}%</span>
                </div>

                <button
                  onClick={() => handleZoomPreset(1)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                    Math.abs(zoom - 1) < 0.05 ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Reset to 100% scale"
                >
                  1x
                </button>

                {/* Fit to Screen */}
                <button
                  onClick={() => fitToScreen()}
                  className="p-1.5 bg-slate-800/80 hover:bg-indigo-600 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1"
                  title="Fit All Nodes to Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Center on Selected */}
                <button
                  onClick={() => centerOnNode()}
                  disabled={!selectedNode}
                  className="p-1.5 bg-slate-800/80 hover:bg-indigo-600 hover:text-white rounded-lg transition cursor-pointer disabled:opacity-40"
                  title="Center & Focus on Selected Node"
                >
                  <Target className="w-4 h-4" />
                </button>

                {/* Theater Mode Toggle */}
                <button
                  onClick={() => setIsTheaterMode(prev => !prev)}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    isTheaterMode ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isTheaterMode ? 'Exit Expanded Mode' : 'Expand Canvas Theater Mode'}
                >
                  {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                </button>
              </div>

              {/* DYNAMIC INTERACTIVE LEGEND (Bottom Left Overlay) */}
              <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] space-y-2 text-slate-300 shadow-2xl z-10 max-w-[280px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[10px] tracking-wider font-mono">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dynamic Legend</span>
                  </div>
                  {activeCategoryFilter && (
                    <button
                      onClick={() => setActiveCategoryFilter(null)}
                      className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
                  {/* Entity Low */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'entity_low' ? null : 'entity_low')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'entity_low' ? 'bg-emerald-950 border border-emerald-600 text-emerald-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">Compliant</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.entity_low})</span>
                  </button>

                  {/* Entity Medium */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'entity_medium' ? null : 'entity_medium')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'entity_medium' ? 'bg-amber-950 border border-amber-600 text-amber-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">Med Risk</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.entity_medium})</span>
                  </button>

                  {/* Entity High */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'entity_high' ? null : 'entity_high')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'entity_high' ? 'bg-orange-950 border border-orange-600 text-orange-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                      <span className="truncate">High Risk</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.entity_high})</span>
                  </button>

                  {/* Entity Critical */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'entity_critical' ? null : 'entity_critical')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'entity_critical' ? 'bg-rose-950 border border-rose-600 text-rose-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                      <span className="truncate">Critical</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.entity_critical})</span>
                  </button>

                  {/* Director / Person */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'person' ? null : 'person')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'person' ? 'bg-purple-950 border border-purple-600 text-purple-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                      <span className="truncate">Director</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.person})</span>
                  </button>

                  {/* Identifier */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'identifier' ? null : 'identifier')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'identifier' ? 'bg-cyan-950 border border-cyan-600 text-cyan-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-cyan-600 shrink-0" />
                      <span className="truncate">TIN / Phone</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.identifier})</span>
                  </button>

                  {/* Violation */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'violation' ? null : 'violation')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'violation' ? 'bg-rose-950 border border-rose-500 text-rose-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="truncate">Violation</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.violation})</span>
                  </button>

                  {/* Website */}
                  <button
                    onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'website' ? null : 'website')}
                    className={`flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-left transition cursor-pointer ${
                      activeCategoryFilter === 'website' ? 'bg-indigo-950 border border-indigo-500 text-indigo-300' : 'hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span className="truncate">Website</span>
                    </span>
                    <span className="text-[9px] text-slate-400">({legendStats.website})</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800/80 text-[9px] text-slate-500 flex items-center justify-between">
                  <span>Click legend to filter</span>
                  <span>Drag or scroll to pan/zoom</span>
                </div>
              </div>

              {/* MINIMAP VIEWPORT NAVIGATOR (Bottom Right Overlay) */}
              {showMiniMap && (
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl z-10">
                  <div className="flex items-center justify-between px-1 pb-1 text-[9px] font-mono text-slate-400">
                    <span>OVERVIEW MAP</span>
                    <button
                      onClick={() => setShowMiniMap(false)}
                      className="text-slate-500 hover:text-white cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                  <canvas
                    ref={miniMapRef}
                    width={110}
                    height={75}
                    className="rounded border border-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Shortest Path Analyzer Bar */}
            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">Shortest Path Analyzer:</span>
                <input
                  type="text"
                  placeholder="Source e1 (e.g. ent_bkash_agent_01)"
                  value={pathSource}
                  onChange={e => setPathSource(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white text-[11px]"
                />
                <span className="text-slate-500 font-bold">➔</span>
                <input
                  type="text"
                  placeholder="Target e2 (e.g. ent_bkash_agent_02)"
                  value={pathTarget}
                  onChange={e => setPathTarget(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white text-[11px]"
                />
                <button
                  onClick={handleCalculatePath}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition cursor-pointer"
                >
                  Find Path
                </button>
              </div>
              {pathResult && (
                <div className="text-[11px] font-mono text-slate-300">
                  {pathResult.pathLength >= 0 ? (
                    <span className="text-emerald-400 font-bold">Path Distance: {pathResult.pathLength} hops</span>
                  ) : (
                    <span className="text-rose-400 font-bold">No path found between nodes</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Node Inspector Side Panel (Col 1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Node Inspector</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedNode && (
                  <>
                    <button
                      onClick={() => setIsInspectorDrawerOpen(true)}
                      className="text-[10px] font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition font-bold shadow-sm"
                      title="Open full slide-out side panel"
                    >
                      <PanelRightOpen className="w-3 h-3" />
                      <span>Slide-Out</span>
                    </button>
                    <button
                      onClick={() => centerOnNode(selectedNode)}
                      className="text-[10px] font-mono bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 flex items-center gap-1 cursor-pointer transition"
                      title="Center camera on this node"
                    >
                      <Target className="w-3 h-3" />
                      <span>{selectedNode.label}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] font-mono">PRIMARY IDENTIFIER</div>
                  <div className="text-white font-bold text-sm break-all">
                    {selectedNode.properties?.name || selectedNode.properties?.value || selectedNode.properties?.domain || selectedNode.id}
                  </div>
                </div>

                {selectedNode.properties?.risk_tier && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Risk Severity:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        selectedNode.properties.risk_tier === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        selectedNode.properties.risk_tier === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        selectedNode.properties.risk_tier === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {selectedNode.properties.risk_tier}
                      </span>
                    </div>
                    {selectedNode.properties.compliance_score !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Compliance Score:</span>
                        <span className="text-white font-mono font-bold">
                          {selectedNode.properties.compliance_score} / 100
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Blacklisted:</span>
                      <span className={`font-bold ${selectedNode.properties.blacklisted ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedNode.properties.blacklisted ? 'YES (Sanctioned)' : 'NO'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Primary Slide-out Trigger Banner */}
                <button
                  onClick={() => setIsInspectorDrawerOpen(true)}
                  className="w-full py-2 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800/80 hover:to-purple-800/80 text-white rounded-xl border border-indigo-700/60 flex items-center justify-between px-3 text-xs font-mono font-bold transition cursor-pointer group shadow-lg"
                >
                  <span className="flex items-center gap-1.5">
                    <PanelRightOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Deep Relational Dossier</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Properties Inspector */}
                <div className="space-y-1.5">
                  <div className="text-slate-400 text-[10px] font-mono uppercase">Node Properties</div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                    {selectedNode.properties && Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 border-b border-slate-900 pb-0.5">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-200 text-right truncate">{JSON.stringify(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Chain Reference */}
                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/50 space-y-1">
                  <div className="text-[10px] font-mono text-indigo-300 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Evidence Vault Ref</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 break-all">
                    {selectedNode.properties?.evidence_ref || 'EV_VAULT_NODE_SHA256_' + selectedNode.id}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Click any node on the canvas to inspect its relational metadata, violations, and evidence vault hashes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Serial Operators Tab */}
      {activeTab === 'serial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Shared-Identifier Serial Operators (&ge;3 Entities)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Entities sharing a single Phone number, TIN, Domain, or Bank Account indicating a centralized operator network.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-950/80 px-3 py-1 rounded-lg border border-rose-800">
              {serialOps.length} Networks Detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serialOps.map((op, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded">
                    {op.identifierType}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Fan-out: {op.fanOutCount}x</span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-mono">SHARED VALUE</div>
                  <div className="text-white font-mono font-bold text-sm">{op.identifierValue}</div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Linked Entities: <strong>{op.linkedEntityIds?.join(', ')}</strong></div>
                  <div className="text-rose-400 font-bold">Violating Entities: {op.violatingEntityCount}</div>
                </div>
                <button
                  onClick={() => {
                    if (op.linkedEntityIds?.[0]) {
                      setSearchQuery(op.linkedEntityIds[0]);
                      setActiveTab('graph');
                      queryNetwork(op.linkedEntityIds[0], 2);
                    }
                  }}
                  className="w-full py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect in Graph</span>
                </button>
              </div>
            ))}
            {serialOps.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500 text-xs">
                No serial operator fan-outs detected. Click "Seed Network" above to populate sample topologies.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shell Cycles Tab */}
      {activeTab === 'cycles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Circular Ownership Shell Company Loops</span>
              </h3>
              <p className="text-xs text-slate-400">
                Closed loops in OWNED_BY or DIRECTOR_OF relationships spanning 2+ entities.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800">
              {cycles.length} Loops Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cycles.map((cyc, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-bold">Cycle Length: {cyc.length} nodes</span>
                  <span className="text-xs font-mono text-slate-400">DFS Verified</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                  {cyc.cyclePath?.join(' ➔ ')}
                </div>
                <div className="text-xs text-slate-400">
                  Entities involved: {cyc.entityIds?.join(', ')}
                </div>
              </div>
            ))}
            {cycles.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                No circular ownership loops detected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Clusters Tab */}
      {activeTab === 'clusters' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-400" />
                <span>Connected Risk Clusters (&ge;50% Violation Density)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Interconnected entity components where high violation density signals structural compliance contagion.
              </p>
            </div>
            <span className="text-xs font-mono text-orange-400 bg-orange-950/80 px-3 py-1 rounded-lg border border-orange-800">
              {clusters.length} High-Risk Clusters
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((cl, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-orange-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-400">
                    Density: {((cl.violationDensity || 0) * 100).toFixed(0)}%
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    cl.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300' : 'bg-orange-950 text-orange-300'
                  }`}>
                    {cl.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Total Entities: <strong>{cl.totalEntities}</strong></div>
                  <div>Total Violations: <strong>{cl.totalViolations}</strong></div>
                  <div className="text-slate-400 font-mono text-[11px] truncate">Members: {cl.entityIds?.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Findings Queue Tab */}
      {activeTab === 'findings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Graph Intelligence Findings & Authority Review Queue</span>
              </h3>
              <p className="text-xs text-slate-400">
                All algorithmic graph findings stored in <code className="text-indigo-400 font-mono">intel_graph_findings</code> with XAI explanations.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
              {findings.length} Records
            </span>
          </div>

          <div className="space-y-3">
            {findings.map(f => (
              <div key={f.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{f.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {f.finding_type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      f.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300' : 'bg-orange-950 text-orange-300'
                    }`}>
                      {f.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({((f.confidence || 0) * 100).toFixed(0)}% confidence)</span>
                  </div>
                  <div className="text-xs text-slate-200">{f.explanation}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Status: <strong className="text-white uppercase">{f.status}</strong> | Created: {f.created_at}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleReviewFinding(f.id, 'confirmed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => handleReviewFinding(f.id, 'dismissed')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-out Backdrop Overlay */}
      {isInspectorDrawerOpen && selectedNode && (
        <div
          onClick={() => setIsInspectorDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-Out Side Panel Drawer */}
      <EntityNodeInspectorDrawer
        node={selectedNode}
        edges={edges}
        allNodes={nodes}
        isOpen={isInspectorDrawerOpen}
        onClose={() => setIsInspectorDrawerOpen(false)}
        onCenterOnNode={(targetNode) => {
          centerOnNode(targetNode);
        }}
        onSelectNode={(newNode) => {
          setSelectedNode(newNode);
        }}
        onSetPathSource={(nodeId) => {
          setPathSource(nodeId);
          setActiveTab('graph');
        }}
        onSetPathTarget={(nodeId) => {
          setPathTarget(nodeId);
          setActiveTab('graph');
        }}
        onQuerySubNetwork={(nodeId) => {
          setSearchQuery(nodeId);
          queryNetwork(nodeId, 2);
          setActiveTab('graph');
        }}
      />
    </div>
  );
};
