import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Calendar, ShieldAlert } from 'lucide-react';

interface HeatmapDataPoint {
  date: string;
  category: string;
  severity: string;
  count: number;
}

export const RiskHeatmapD3: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const categories = ['Data Privacy', 'Access Control', 'Cross-Border', 'Encryption', 'IAM & Auth', 'AI Governance'];
    const daysCount = timeRange === '7d' ? 7 : 30;
    const severities = ['Low', 'Medium', 'High', 'Critical'];

    // Generate mock realistic heatmap data over time
    const data: HeatmapDataPoint[] = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      categories.forEach(cat => {
        severities.forEach(sev => {
          // Weighted random frequency
          const base = sev === 'Critical' ? 1 : sev === 'High' ? 3 : sev === 'Medium' ? 6 : 10;
          const count = Math.floor(Math.random() * base);
          if (count > 0) {
            data.push({ date: dateStr, category: cat, severity: sev, count });
          }
        });
      });
    }

    const dates = Array.from(new Set(data.map(d => d.date)));

    const margin = { top: 30, right: 30, bottom: 60, left: 120 };
    const width = 800 - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 800 320`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleBand()
      .range([0, width])
      .domain(dates)
      .padding(0.15);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .attr('transform', 'translate(-10,10)rotate(-35)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#64748b');

    // Y scale
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(categories)
      .padding(0.15);

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .style('font-size', '11px')
      .style('fill', '#334155')
      .select('.domain').remove();

    // Color scale based on frequency & severity weight
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, 15]);

    // Add squares
    svg.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.date) || 0)
      .attr('y', d => y(d.category) || 0)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => colorScale(d.count * (d.severity === 'Critical' ? 2.5 : d.severity === 'High' ? 1.8 : 1)))
      .style('stroke', '#ffffff')
      .style('stroke-width', 1)
      .on('mouseover', (event, d) => {
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltipData({
          x: mx,
          y: my,
          content: `${d.date} | ${d.category} (${d.severity}): ${d.count} violation(s)`
        });
      })
      .on('mouseout', () => {
        setTooltipData(null);
      });

  }, [timeRange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Compliance Risk & Violation Heatmap (D3.js)
          </h3>
          <p className="text-xs text-slate-500 mt-1">Frequency of violations across risk categories and timelines.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              timeRange === '7d' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              timeRange === '30d' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full h-80 min-w-[500px] sm:min-w-[650px]" />
        {tooltipData && (
          <div
            className="absolute z-10 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all"
            style={{ left: `${Math.min(tooltipData.x, 600)}px`, top: `${Math.max(tooltipData.y - 40, 10)}px` }}
          >
            {tooltipData.content}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Severity Scale:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-300"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span>High/Critical</span>
          </div>
        </div>
        <div className="font-mono text-[11px] text-slate-400">Rendered with D3 v7</div>
      </div>
    </div>
  );
};
