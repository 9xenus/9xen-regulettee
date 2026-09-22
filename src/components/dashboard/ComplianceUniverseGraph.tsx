import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Network, Boxes, Orbit, Loader2 } from 'lucide-react';

const API = '/api/v1/client-premium';

const NODE_RADIUS: Record<string, number> = {
  co: 34, fw: 26, seal: 20, pl: 14,
};
const NODE_COLOR: Record<string, string> = {
  co: '#6366f1',
  fw: '#10b981',
  seal: '#8b5cf6',
  pl: '#f59e0b',
};
const NODE_LABEL: Record<string, string> = {
  co: 'Company', fw: 'Framework', seal: 'Forensic Seal', pl: 'Pulse Event',
};

export const ComplianceUniverseGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState<any>(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/universe/graph`); const d = await r.json();
      if (d.success) setData(d); else setError(d.error || 'Failed to load universe graph.'); 
    } catch { setError('Universe graph unavailable.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  useEffect(() => {
    if (!svgRef.current || !data) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = svgRef.current.clientWidth || 800;
    const height = 480;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const nodes = data.nodes.map((n: any) => ({ ...n }));
    const links = data.links.map((l: any) => ({ ...l }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((l: any) => 140 / l.weight).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(46));

    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on('zoom', (ev) => g.attr('transform', ev.transform));
    svg.call(zoom as any);

    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#94a3b8').attr('stroke-opacity', 0.35).attr('stroke-width', (l: any) => l.weight);

    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', (ev: any, d: any) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev: any, d: any) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev: any, d: any) => { if (!ev.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.each(function (d: any) {
      const kind = String(d.id).split('_')[0];
      const gEl = d3.select(this);
      const r = NODE_RADIUS[kind] || 18;
      gEl.append('circle').attr('r', r).attr('fill', NODE_COLOR[kind] || '#64748b').attr('fill-opacity', 0.85).attr('stroke', '#fff').attr('stroke-width', 2);
      gEl.append('text').text((d: any) => d.name.slice(0, 1).toUpperCase())
        .attr('text-anchor', 'middle').attr('dy', 5).attr('fill', '#fff').attr('font-size', 18).attr('font-weight', 700).style('pointer-events', 'none');
    });

    const label = g.append('g').selectAll('text').data(nodes).join('text')
      .text((d: any) => d.name.length > 22 ? d.name.slice(0, 22) + '…' : d.name)
      .attr('text-anchor', 'middle').attr('dy', 36).attr('fill', '#334155').attr('font-size', 9).attr('font-weight', 600).style('pointer-events', 'none');

    node.on('click', (ev: any, d: any) => {
      setActive({ ...d, kind: String(d.id).split('_')[0] });
      ev.stopPropagation();
    });
    svg.on('click', () => setActive(null));

    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });

    return () => { simulation.stop(); };
  }, [data]);

  const counts = data?.meta;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { k: 'companies', v: counts?.companies, icon: Boxes, c: 'text-indigo-500' },
          { k: 'frameworks', v: counts?.frameworks, icon: Network, c: 'text-emerald-500' },
          { k: 'seals', v: counts?.seals, icon: Orbit, c: 'text-violet-500' },
          { k: 'pulseItems', v: counts?.pulseItems, icon: Orbit, c: 'text-amber-500' },
          { k: 'activationCount', v: counts?.activationCount, icon: Network, c: 'text-rose-500' },
        ].map(s => (
          <div key={s.k} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 flex items-center gap-2">
            <s.icon className={`w-4 h-4 ${s.c}`} />
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">{s.v ?? '–'}</div>
              <div className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">{s.k.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 relative overflow-hidden">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>}
        <svg ref={svgRef} className="w-full h-[480px]" onClick={() => setActive(null)} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          {Object.entries(NODE_LABEL).map(([k, v]) => (
            <span key={k} className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-1" style={{ background: NODE_COLOR[k] }}>
              <span className="w-2 h-2 rounded-full bg-white/70" /> {v}
            </span>
          ))}
        </div>
        {active && (
          <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-lg max-w-xs">
            <div className="text-[9px] font-bold uppercase text-slate-400">{NODE_LABEL[active.kind] || active.kind}</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{active.name}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">{active.id}</div>
            {active.status && <div className="text-[10px] font-bold mt-1 text-slate-600 dark:text-slate-300">Status: {active.status}</div>}
            {active.version && <div className="text-[10px] font-bold mt-1 text-slate-600 dark:text-slate-300">Version: {active.version}</div>}
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-500 px-2">{error}</div>}
    </div>
  );
};