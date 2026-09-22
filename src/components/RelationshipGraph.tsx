import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  type: 'article' | 'policy' | 'evidence';
}

interface Link {
  source: string;
  target: string;
}

const data = {
  nodes: [
    { id: 'article-1', label: 'GDPR Article 13', type: 'article' },
    { id: 'policy-1', label: 'Data Retention Policy', type: 'policy' },
    { id: 'evidence-1', label: 'Q1 Audit Report', type: 'evidence' },
    { id: 'article-2', label: 'NIS2 Article 21', type: 'article' },
    { id: 'policy-2', label: 'Cybersecurity Policy', type: 'policy' },
  ] as Node[],
  links: [
    { source: 'article-1', target: 'policy-1' },
    { source: 'policy-1', target: 'evidence-1' },
    { source: 'article-2', target: 'policy-2' },
  ] as Link[]
};

export const RelationshipGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links as any).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        if (d.type === 'article') return '#f59e0b'; // amber
        if (d.type === 'policy') return '#3b82f6'; // blue
        return '#10b981'; // emerald
      });

    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', '12px')
      .attr('dx', 12)
      .attr('dy', 4);

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
  }, []);

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Compliance Traceability Map</h3>
      <svg ref={svgRef} width="100%" height="400" viewBox="0 0 600 400" />
    </div>
  );
};
