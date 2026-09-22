import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Filter } from 'lucide-react';

interface ScanResult {
  id: string;
  tenantId: string;
  tenantName: string;
  industry: string;
  lawChecked: string;
  website: string;
  status: 'COMPLIANT' | 'VIOLATION_DETECTED';
  violationDetails?: string;
  timestamp: string;
  penaltyEnforced?: string;
  fineApplied?: number;
  emailSentTo?: string;
}

interface B2gPenaltyD3ChartProps {
  scanResults: ScanResult[];
}

export const B2gPenaltyD3Chart: React.FC<B2gPenaltyD3ChartProps> = ({ scanResults }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupBy, setGroupBy] = useState<'industry' | 'lawChecked' | 'region'>('industry');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Filter to only violations that resulted in a penalty or fine
    const penaltyData = scanResults.filter(
      (r) => r.status === 'VIOLATION_DETECTED' && (r.penaltyEnforced || r.fineApplied)
    );

    // Group by selected dimension
    const counts: Record<string, number> = {};
    penaltyData.forEach((r) => {
      let key = r[groupBy as keyof ScanResult] as string;
      if (groupBy === 'region') {
        // Since we don't have region natively in ScanResult, let's derive it from website or just mock it for visualization
        if (r.website.includes('.de')) key = 'Germany';
        else if (r.website.includes('.fr')) key = 'France';
        else if (r.website.includes('.es') || r.website.includes('.ai')) key = 'Spain';
        else if (r.website.includes('.be')) key = 'Belgium';
        else key = 'EU-Wide';
      } else if (groupBy === 'lawChecked') {
        key = key.split('(')[0].trim(); // Shorten law name
      }
      counts[key] = (counts[key] || 0) + 1;
    });

    const data = Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    })).sort((a, b) => b.value - a.value);

    // If no data, render an empty state
    if (data.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove();
      const svg = d3.select(svgRef.current);
      svg.append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '12px')
        .text('No active penalties found to visualize.');
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    const maxVal = d3.max(data, (d) => d.value) || 10;
    
    const y = d3
      .scaleLinear()
      .domain([0, maxVal + (maxVal * 0.2)]) // Add 20% padding to top
      .range([innerHeight, 0]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .call((g) => g.select('.domain').attr('stroke', '#e2e8f0'))
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .call(wrap, x.bandwidth()); // wrap long labels

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', '#f1f5f9').attr('stroke-dasharray', '4,4'))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .style('opacity', 0)
      .attr('class', 'absolute bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transition-opacity font-medium z-10');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.name)!)
      .attr('y', innerHeight) // Start from bottom for animation
      .attr('width', x.bandwidth())
      .attr('height', 0) // Start height 0
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 4)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#f43f5e').transition().duration(200);
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip
          .html(`<strong>${d.name}</strong><br/>${d.value} Active Penalties`)
          .style('left', event.pageX - 40 + 'px')
          .style('top', event.pageY - 60 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', 'url(#barGradient)').transition().duration(200);
        tooltip.transition().duration(500).style('opacity', 0);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => innerHeight - y(d.value));

    // Gradient Def
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#fb7185');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#e11d48');
    
    // Helper to wrap text
    function wrap(text: any, width: number) {
      text.each(function(this: SVGTextElement) {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line: string[] = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy") || "0"),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if ((tspan.node()?.getComputedTextLength() || 0) > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }

    return () => {
      d3.select(containerRef.current).selectAll('.absolute').remove();
    };
  }, [scanResults, groupBy]);

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center px-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penalty Distribution Analysis</h4>
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer pr-2"
          >
            <option value="industry">By Industry</option>
            <option value="lawChecked">By Directive/Law</option>
            <option value="region">By Sovereign Region</option>
          </select>
        </div>
      </div>
      <div ref={containerRef} className="relative w-full h-[300px]">
        <svg ref={svgRef} className="w-full h-full overflow-visible"></svg>
      </div>
    </div>
  );
};
