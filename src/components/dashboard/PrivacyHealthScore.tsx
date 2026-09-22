import React, { useEffect, useRef } from "react";
/** Triggered Rebuild for Module Resolution Fix */
import { motion } from "motion/react";
import * as d3 from "d3";
import { ShieldAlert, Info } from "lucide-react";

interface PrivacyHealthScoreProps {
  metrics: {
    category: string;
    score: number; // 0 to 100
  }[];
}

export const PrivacyHealthScore: React.FC<PrivacyHealthScoreProps> = ({ metrics }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !metrics || metrics.length === 0) return;

    // Clear previous drawing
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 300;
    const height = 300;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    const features = metrics.map((m) => m.category);
    const data = metrics.map((m) => m.score);

    // Scales
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 100]);
    const angleScale = d3
      .scaleBand()
      .range([0, 2 * Math.PI])
      .domain(features);

    // Draw grid circles
    const ticks = [20, 40, 60, 80, 100];
    svg
      .selectAll(".grid-circle")
      .data(ticks)
      .enter()
      .append("circle")
      .attr("class", "grid-circle")
      .attr("r", (d) => rScale(d))
      .style("fill", "none")
      .style("stroke", "#334155")
      .style("stroke-dasharray", "3,3")
      .style("stroke-width", 1);

    // Draw axis lines
    svg
      .selectAll(".axis-line")
      .data(features)
      .enter()
      .append("line")
      .attr("class", "axis-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d) => rScale(100) * Math.cos(angleScale(d)! - Math.PI / 2))
      .attr("y2", (d) => rScale(100) * Math.sin(angleScale(d)! - Math.PI / 2))
      .style("stroke", "#334155")
      .style("stroke-width", 1);

    // Draw labels
    svg
      .selectAll(".axis-label")
      .data(features)
      .enter()
      .append("text")
      .attr("class", "axis-label")
      .attr("x", (d) => (rScale(100) + 15) * Math.cos(angleScale(d)! - Math.PI / 2))
      .attr("y", (d) => (rScale(100) + 15) * Math.sin(angleScale(d)! - Math.PI / 2))
      .text((d) => d)
      .style("text-anchor", "middle")
      .style("alignment-baseline", "middle")
      .style("fill", "#94a3b8")
      .style("font-size", "10px")
      .style("font-weight", "600");

    // Draw radar path
    const line = d3
      .lineRadial<number>()
      .angle((d, i) => angleScale(features[i])!)
      .radius((d) => rScale(d))
      .curve(d3.curveLinearClosed);

    svg
      .append("path")
      .datum(data)
      .attr("d", line)
      .style("fill", "rgba(99, 102, 241, 0.2)") // indigo-500 with opacity
      .style("stroke", "#6366f1") // indigo-500
      .style("stroke-width", 2);

    // Draw data points
    svg
      .selectAll(".data-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d, i) => rScale(d) * Math.cos(angleScale(features[i])! - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d) * Math.sin(angleScale(features[i])! - Math.PI / 2))
      .attr("r", 4)
      .style("fill", "#818cf8")
      .style("stroke", "#fff")
      .style("stroke-width", 1);
  }, [metrics]);

  const overallScore = Math.round(metrics.reduce((acc, curr) => acc + curr.score, 0) / (metrics.length || 1));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            Privacy Health Score
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time compliance vectors</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-2xl font-black text-indigo-600">{overallScore}</span>
           <span className="text-xs text-slate-400 font-bold uppercase mt-1">/ 100</span>
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col items-center justify-center relative">
        <svg ref={svgRef}></svg>
        <div className="absolute bottom-4 left-4 right-4 flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
           <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
           <p className="text-[10px] text-slate-500 leading-relaxed">
             This radar chart maps multi-dimensional compliance vectors. Expand the radius in all directions to achieve complete regulatory immunity.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
