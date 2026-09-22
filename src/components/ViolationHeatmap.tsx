import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { RegulatorBreach } from '../types';
import { Filter, MapPin } from 'lucide-react';

const ARTICLES = ['Article 32', 'Article 33', 'Article 34', 'Other'];
const SECTORS = ['Finance', 'Healthcare', 'Technology', 'Retail'];

export const ViolationHeatmap: React.FC<{ breaches: RegulatorBreach[] }> = ({ breaches }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [articleFilter, setArticleFilter] = useState<string>('All');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [minSeverity, setMinSeverity] = useState<number>(1);

  // Simulate real-time data updates removed

  const filteredBreaches = useMemo(() => {
    return breaches.filter(b => 
      (articleFilter === 'All' || b.article === articleFilter) &&
      (sectorFilter === 'All' || b.sector === sectorFilter) &&
      (b.severity >= minSeverity)
    );
  }, [breaches, articleFilter, sectorFilter, minSeverity]);

  const stats = useMemo(() => {
    const totalBreaches = breaches.length;
    const selectedCount = filteredBreaches.length;
    const euAverage = totalBreaches / SECTORS.length;
    return { selectedCount, euAverage };
  }, [breaches, filteredBreaches]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;

    // Simple projection
    const projection = d3.geoMercator()
      .center([10, 50])
      .scale(300)
      .translate([width / 2, height / 2]);

    // Draw circles for breaches
    svg.selectAll('circle')
      .data(filteredBreaches)
      .enter()
      .append('circle')
      .attr('cx', d => projection([d.lng, d.lat] as [number, number])![0])
      .attr('cy', d => projection([d.lng, d.lat] as [number, number])![1])
      .attr('r', d => d.severity * 1.5)
      .attr('fill', d => d.severity > 7 ? '#ef4444' : d.severity > 4 ? '#f59e0b' : '#10b981')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
  }, [filteredBreaches]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          Violation Heatmap (EU)
        </h3>
        <div className="flex gap-2">
            <select className="text-xs bg-slate-100 p-1 rounded" value={articleFilter} onChange={e => setArticleFilter(e.target.value)}>
                <option value="All">All Articles</option>
                {ARTICLES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="text-xs bg-slate-100 p-1 rounded" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
                <option value="All">All Sectors</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-2 text-xs bg-slate-100 p-1 rounded">
                <label>Min Severity:</label>
                <input type="range" min="1" max="10" value={minSeverity} onChange={e => setMinSeverity(Number(e.target.value))} />
                <span>{minSeverity}</span>
            </div>
        </div>
      </div>
      <div className="relative">
        <svg ref={svgRef} width="400" height="300" className="bg-slate-50 rounded-lg" />
        {sectorFilter !== 'All' && (
          <div className="absolute top-2 left-2 bg-white/90 p-3 rounded-lg shadow-sm border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Sector Performance: {sectorFilter}</div>
              <div className="text-sm font-bold text-slate-900">{stats.selectedCount} breaches</div>
              <div className="text-[10px] text-slate-400">EU Avg: {stats.euAverage.toFixed(1)}</div>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Low</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Medium</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> High</div>
      </div>
    </div>
  );
};
