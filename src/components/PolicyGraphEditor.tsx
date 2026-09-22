import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Rule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

interface Props {
  rules: Rule[];
}

export const PolicyGraphEditor: React.FC<Props> = ({ rules }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 400;

    const nodes = [
      { id: 'start', label: 'START', type: 'system' },
      ...rules.map(r => ({ id: r.id, label: r.attribute, type: 'rule' })),
      { id: 'end', label: 'ALLOW/DENY', type: 'system' }
    ];

    const links = [
      { source: 'start', target: rules[0]?.id || 'end' },
      ...rules.slice(0, -1).map((r, i) => ({ source: r.id, target: rules[i + 1].id })),
      ...(rules.length > 0 ? [{ source: rules[rules.length - 1].id, target: 'end' }] : [])
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', (d: any) => d.type === 'system' ? '#312e81' : '#4f46e5');

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d: any) => d.label)
      .attr('font-size', '10px')
      .attr('fill', '#1e293b')
      .attr('text-anchor', 'middle')
      .attr('dy', 35);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

  }, [rules]);

  return (
    <svg ref={svgRef} width="100%" height="400" viewBox="0 0 600 400" className="bg-slate-50 rounded-xl" />
  );
};
