import React, { useEffect, useRef, useState } from 'react';
import { Shield, Lock, Globe, Cpu, Zap, Activity, CheckCircle2, Server, Eye } from 'lucide-react';

interface ThreeDComplianceVisualProps {
  onInteract?: () => void;
}

export const ThreeDComplianceVisual: React.FC<ThreeDComplianceVisualProps> = ({ onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'EU' | 'US' | 'ME' | 'AP'>('EU');

  // 3D Canvas particle globe & node mesh animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 500;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // 3D Spherical Points
    const numPoints = 140;
    const radius = Math.min(width, height) * 0.36;
    const points: { x: number; y: number; z: number; origX: number; origY: number; origZ: number; size: number; alpha: number; color: string }[] = [];

    const colors = ['#6366F1', '#4F46E5', '#06B6D4', '#10B981', '#8B5CF6'];

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      points.push({
        x,
        y,
        z,
        origX: x,
        origY: y,
        origZ: z,
        size: Math.random() * 2 + 1.2,
        alpha: Math.random() * 0.6 + 0.3,
        color: colors[i % colors.length]
      });
    }

    // Regional Hub Markers in 3D Space
    const regionalHubs = [
      { name: 'EU (Frankfurt)', lat: 50.11, lon: 8.68, code: 'EU', color: '#4F46E5' },
      { name: 'US (N. Virginia)', lat: 38.88, lon: -77.17, code: 'US', color: '#10B981' },
      { name: 'ME (Riyadh)', lat: 24.71, lon: 46.67, code: 'ME', color: '#F59E0B' },
      { name: 'AP (Singapore)', lat: 1.35, lon: 103.81, code: 'AP', color: '#8B5CF6' }
    ];

    let rotX = 0.2;
    let rotY = 0;
    let targetRotX = 0.2;
    let targetRotY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth rotation with mouse influence
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05 + 0.005; // continuous orbital spin

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Draw Orbit Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Outer cryptographic shield rings
      for (let ring = 0; ring < 2; ring++) {
        ctx.beginPath();
        const ringRadius = radius * (1.15 + ring * 0.15);
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.35, rotY * (ring % 2 === 0 ? 0.5 : -0.5), 0, Math.PI * 2);
        ctx.strokeStyle = ring === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // Transform & Sort 3D Points for Depth (Painter's Algorithm)
      const projected = points.map(p => {
        // Y-axis rotation
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origZ * cosY + p.origX * sinY;

        // X-axis rotation
        let y1 = p.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.origY * sinX;

        // Perspective projection factor
        const fov = 400;
        const scale = fov / (fov + z2);
        const x2d = centerX + x1 * scale;
        const y2d = centerY + y1 * scale;

        return {
          ...p,
          x2d,
          y2d,
          z2,
          scale,
          visible: z2 > -radius * 0.9
        };
      });

      projected.sort((a, b) => a.z2 - b.z2);

      // Draw Connecting Latitudinal & Longitudinal Mesh Lines
      ctx.beginPath();
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dist2D = Math.hypot(p1.x2d - p2.x2d, p1.y2d - p2.y2d);
          
          if (dist2D < 42 && p1.scale > 0.7 && p2.scale > 0.7) {
            const alpha = (1 - dist2D / 42) * 0.25 * ((p1.z2 + radius) / (2 * radius));
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.strokeStyle = `rgba(99, 102, 241, ${Math.max(0, alpha)})`;
            ctx.lineWidth = 0.7;
          }
        }
      }
      ctx.stroke();

      // Draw Nodes
      projected.forEach(p => {
        if (!p.visible) return;
        const depthAlpha = Math.max(0.1, (p.z2 + radius) / (2 * radius));
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, p.size * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * depthAlpha;
        ctx.fill();

        // Glow on frontmost particles
        if (p.z2 > radius * 0.5) {
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, p.size * p.scale * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.15;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      // Draw Central Holographic Core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius * 0.75);
      coreGradient.addColorStop(0, 'rgba(79, 70, 229, 0.18)');
      coreGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mouse move tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square max-w-[420px] mx-auto select-none perspective-[1200px]"
    >
      {/* 3D Container with dynamic transform tilt */}
      <div
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `rotateY(${mousePos.x * 24}deg) rotateX(${-mousePos.y * 24}deg)`
            : 'rotateY(0deg) rotateX(0deg)'
        }}
      >
        {/* Ambient Back Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-cyan-500/15 to-purple-500/20 rounded-full blur-3xl -z-10 scale-95 animate-pulse" />

        {/* 3D Particle Canvas */}
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Center Holographic Floating Emblem in 3D */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-indigo-500/40 shadow-2xl shadow-indigo-500/30 flex flex-col items-center justify-center p-3 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-3xl blur-xs opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 mb-1 animate-bounce" />
              <span className="text-[10px] font-mono font-black tracking-widest text-cyan-300 uppercase">
                9XEN_REGULETTEE
              </span>
              <span className="text-[8px] font-mono text-slate-400 font-bold">SOVEREIGN CORE</span>
            </div>
          </div>
        </div>

        {/* Floating 3D Node Badges with Z-Depth */}
        {/* EU NODE (Top-Left) */}
        <div
          className="absolute top-4 sm:top-8 left-2 sm:left-4 z-20 transition-all duration-300"
          style={{ transform: 'translateZ(45px)' }}
        >
          <div
            onClick={() => setSelectedRegion('EU')}
            className={`p-2.5 sm:p-3 rounded-2xl backdrop-blur-md border shadow-lg cursor-pointer transition-all ${
              selectedRegion === 'EU'
                ? 'bg-slate-900/90 border-indigo-500 text-white shadow-indigo-500/30 scale-105'
                : 'bg-white/90 border-slate-200/80 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold">EU Frankfurt Enclave</span>
            </div>
            <div className="text-[10px] opacity-75 font-mono mt-0.5 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-indigo-400" /> GDPR & EU AI Act Annex III
            </div>
          </div>
        </div>

        {/* US NODE (Top-Right) */}
        <div
          className="absolute top-6 sm:top-10 right-2 sm:right-4 z-20 transition-all duration-300"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div
            onClick={() => setSelectedRegion('US')}
            className={`p-2.5 sm:p-3 rounded-2xl backdrop-blur-md border shadow-lg cursor-pointer transition-all ${
              selectedRegion === 'US'
                ? 'bg-slate-900/90 border-cyan-500 text-white shadow-cyan-500/30 scale-105'
                : 'bg-white/90 border-slate-200/80 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-xs font-mono font-bold">US N. Virginia Node</span>
            </div>
            <div className="text-[10px] opacity-75 font-mono mt-0.5 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-cyan-400" /> CCPA / CPRA & NIST RAG
            </div>
          </div>
        </div>

        {/* ME NODE (Bottom-Left) */}
        <div
          className="absolute bottom-6 sm:bottom-10 left-2 sm:left-6 z-20 transition-all duration-300"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div
            onClick={() => setSelectedRegion('ME')}
            className={`p-2.5 sm:p-3 rounded-2xl backdrop-blur-md border shadow-lg cursor-pointer transition-all ${
              selectedRegion === 'ME'
                ? 'bg-slate-900/90 border-amber-500 text-white shadow-amber-500/30 scale-105'
                : 'bg-white/90 border-slate-200/80 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-mono font-bold">ME Riyadh Sovereign</span>
            </div>
            <div className="text-[10px] opacity-75 font-mono mt-0.5 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-amber-400" /> KSA PDPL & UAE In-Country
            </div>
          </div>
        </div>

        {/* AP NODE (Bottom-Right) */}
        <div
          className="absolute bottom-4 sm:bottom-8 right-2 sm:right-6 z-20 transition-all duration-300"
          style={{ transform: 'translateZ(55px)' }}
        >
          <div
            onClick={() => setSelectedRegion('AP')}
            className={`p-2.5 sm:p-3 rounded-2xl backdrop-blur-md border shadow-lg cursor-pointer transition-all ${
              selectedRegion === 'AP'
                ? 'bg-slate-900/90 border-violet-500 text-white shadow-violet-500/30 scale-105'
                : 'bg-white/90 border-slate-200/80 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400"></span>
              <span className="text-xs font-mono font-bold">AP Singapore Vault</span>
            </div>
            <div className="text-[10px] opacity-75 font-mono mt-0.5 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-violet-400" /> India DPDP & Cross-Border
            </div>
          </div>
        </div>

        {/* Floating Telemetry Ticker (Bottom-Center) */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-sm"
          style={{ transform: 'translateX(-50%) translateZ(70px)' }}
        >
          <div className="p-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center justify-between text-white text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-300">Live 3D Telemetry:</span>
              <span className="text-emerald-400 font-bold">99.98% Synced</span>
            </div>
            <span className="text-slate-500 text-[10px]">12ms Latency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
