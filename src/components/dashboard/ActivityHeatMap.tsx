import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Info, Filter, Calendar as CalendarIcon } from 'lucide-react';

interface ActivityData {
  date: string;
  count: number;
  scans: number;
}

interface ActivityHeatMapProps {
  data?: ActivityData[];
}

export const ActivityHeatMap: React.FC<ActivityHeatMapProps> = ({ data: externalData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate mock data for the last 6 months if not provided
  const data = useMemo(() => {
    if (externalData) return externalData;
    
    const mockData: ActivityData[] = [];
    const end = new Date();
    const start = d3.timeMonth.offset(end, -6);
    
    const dayRange = d3.timeDays(start, end);
    dayRange.forEach(date => {
      mockData.push({
        date: d3.timeFormat("%Y-%m-%d")(date),
        count: Math.floor(Math.random() * 50),
        scans: Math.floor(Math.random() * 20)
      });
    });
    return mockData;
  }, [externalData]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const height = 180 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const formattedData = data.map(d => ({
      ...d,
      parsedDate: parseDate(d.date) as Date
    }));

    const cellSize = Math.floor(width / 26); // roughly 6 months = 26 weeks
    
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.count + d.scans) || 100]);

    // Group by week and day
    const weeks = d3.timeWeeks(
      d3.timeWeek.floor(d3.min(formattedData, d => d.parsedDate)!),
      d3.timeWeek.ceil(d3.max(formattedData, d => d.parsedDate)!)
    );

    const monthLabels = svg.append("g")
      .attr("class", "month-labels");

    const weekGroups = svg.selectAll(".week")
      .data(weeks)
      .enter().append("g")
      .attr("class", "week")
      .attr("transform", (d, i) => `translate(${i * cellSize}, 0)`);

    weekGroups.selectAll(".day")
      .data(d => d3.timeDays(d, d3.timeDay.offset(d, 7)))
      .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize - 2)
      .attr("height", cellSize - 2)
      .attr("y", d => d.getDay() * cellSize)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", d => {
        const dayData = formattedData.find(fd => fd.parsedDate.getTime() === d.getTime());
        return dayData ? colorScale(dayData.count + dayData.scans) : "#f1f5f9";
      })
      .on("mouseover", function(event, d) {
        const dayData = formattedData.find(fd => fd.parsedDate.getTime() === d.getTime());
        if (!dayData) return;

        d3.select(this).attr("stroke", "#4f46e5").attr("stroke-width", 2);

        const tooltip = d3.select("#heatmap-tooltip");
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
          <div class="p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-[10px] space-y-1">
            <div class="font-black uppercase tracking-widest text-indigo-400">${d3.timeFormat("%B %d, %Y")(d)}</div>
            <div class="flex justify-between gap-4">
              <span class="text-slate-400 uppercase font-bold">Audits:</span>
              <span class="font-mono font-bold">${dayData.count}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-slate-400 uppercase font-bold">Scans:</span>
              <span class="font-mono font-bold">${dayData.scans}</span>
            </div>
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke", "none");
        d3.select("#heatmap-tooltip").transition().duration(500).style("opacity", 0);
      });

    // Day labels
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    svg.append("g")
      .selectAll("text")
      .data(days)
      .enter().append("text")
      .attr("x", -5)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("class", "text-[8px] font-black fill-slate-400 uppercase")
      .text(d => d.charAt(0));

    // Month labels
    weeks.forEach((week, i) => {
      if (week.getDate() <= 7) {
        svg.append("text")
          .attr("x", i * cellSize)
          .attr("y", -5)
          .attr("class", "text-[8px] font-black fill-slate-500 uppercase tracking-tighter")
          .text(d3.timeFormat("%b")(week));
      }
    });

  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm overflow-hidden relative group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Audit & Scan Velocity</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">6-Month Sovereignty Activity Heatmap</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
             <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
             <span className="text-[10px] font-black text-slate-600 uppercase">Last 6 Months</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto no-scrollbar pb-2">
        <svg ref={svgRef} className="mx-auto"></svg>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 px-2">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className="w-3 h-3 rounded-sm bg-blue-200" />
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <div className="w-3 h-3 rounded-sm bg-blue-600" />
          <div className="w-3 h-3 rounded-sm bg-blue-800" />
        </div>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">More</span>
      </div>

      <div id="heatmap-tooltip" className="fixed pointer-events-none opacity-0 z-[100] transition-opacity duration-200" />
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200">
           <Info className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </div>
  );
};

// Internal Activity Icon since it might not be imported in some contexts
const Activity = (props: any) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
