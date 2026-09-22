import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { BarChart3, Clock, Zap, ShieldAlert, ArrowDown, ArrowUp, Info } from 'lucide-react';

interface TrafficDataPoint {
  hour: string;
  timestamp: string;
  success: number;
  errors: number;
  total: number;
  latencyMs: number;
}

interface TokenMeta {
  id: string;
  name: string;
  token: string;
  system: string;
  isDemo?: boolean;
}

interface TrafficSeries {
  tokenId: string;
  tokenName: string;
  tokenStr: string;
  system: string;
  endpoint: string;
  hourlyData: TrafficDataPoint[];
}

interface ApiTrafficChartProps {
  traffic: TrafficSeries[];
  tokens: TokenMeta[];
  endpoints: string[];
  mini?: boolean;
}

export const ApiTrafficChart: React.FC<ApiTrafficChartProps> = ({ traffic, tokens, endpoints, mini }) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string>('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [metric, setMetric] = useState<'requests' | 'errors' | 'latency'>('requests');
  
  // Ref for svg container and elements
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Dimensions state for responsiveness
  const [dimensions, setDimensions] = useState({ width: 600, height: mini ? 200 : 320 });
  
  // Tooltip tracking state
  const [hoveredData, setHoveredData] = useState<{
    hour: string;
    success: number;
    errors: number;
    total: number;
    latencyMs: number;
    x: number;
    y: number;
  } | null>(null);
  
  // Resize handler using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Maintain minimum width of 300px, adapt smoothly
      setDimensions({
        width: Math.max(width, 300),
        height: mini ? 200 : 320
      });
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [mini]);

  // Filter & Aggregate Data based on current state
  const getAggregatedData = (): TrafficDataPoint[] => {
    // Collect all matching series
    const filteredSeries = traffic.filter(s => {
      const matchToken = selectedTokenId === 'all' || s.tokenId === selectedTokenId;
      const matchEndpoint = selectedEndpoint === 'all' || s.endpoint === selectedEndpoint;
      return matchToken && matchEndpoint;
    });

    if (filteredSeries.length === 0) return [];

    // Aggregate by hour
    // Get unique list of hours from first series
    const hours = filteredSeries[0].hourlyData.map(d => d.hour);
    
    const aggregated = hours.map(hour => {
      let successSum = 0;
      let errorsSum = 0;
      let latencySum = 0;
      let seriesCount = 0;

      filteredSeries.forEach(s => {
        const hourData = s.hourlyData.find(d => d.hour === hour);
        if (hourData) {
          successSum += hourData.success;
          errorsSum += hourData.errors;
          latencySum += hourData.latencyMs;
          seriesCount++;
        }
      });

      return {
        hour,
        timestamp: filteredSeries[0].hourlyData.find(d => d.hour === hour)?.timestamp || '',
        success: successSum,
        errors: errorsSum,
        total: successSum + errorsSum,
        latencyMs: seriesCount > 0 ? Math.round(latencySum / seriesCount) : 0
      };
    });

    return aggregated;
  };

  const chartData = getAggregatedData();

  // D3 Render Logic
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    // Clear previous drawing
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = mini ? { top: 10, right: 10, bottom: 25, left: 35 } : { top: 20, right: 20, bottom: 45, left: 55 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Main graph group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define X & Y scales
    const hours = chartData.map(d => d.hour);
    const xScale = d3.scalePoint()
      .domain(hours)
      .range([0, width]);

    // Choose Y domain based on current active metric
    let maxVal = 10;
    if (metric === 'requests') {
      maxVal = d3.max(chartData, d => d.total) || 10;
    } else if (metric === 'errors') {
      maxVal = d3.max(chartData, d => d.errors) || 5;
    } else {
      maxVal = d3.max(chartData, d => d.latencyMs) || 100;
    }

    // Add extra padding to top of the chart (15%)
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([height, 0]);

    // Add visual gradients for areas
    const defs = svg.append('defs');
    
    // Indigo Gradient (Requests)
    const indigoGrad = defs.append('linearGradient')
      .attr('id', 'indigo-grad-mini')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    indigoGrad.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1').attr('stop-opacity', 0.4);
    indigoGrad.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1').attr('stop-opacity', 0);

    // Rose Gradient (Errors)
    const roseGrad = defs.append('linearGradient')
      .attr('id', 'rose-grad-mini')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    roseGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.4);
    roseGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0);

    // Amber Gradient (Latency)
    const amberGrad = defs.append('linearGradient')
      .attr('id', 'amber-grad-mini')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    amberGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.3);
    amberGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0);

    // Add background horizontal grid lines (clean dashboard feel)
    const yGrid = d3.axisLeft(yScale)
      .ticks(mini ? 3 : 5)
      .tickSize(-width)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid-lines')
      .call(yGrid)
      .selectAll('.tick line')
      .style('stroke', '#f1f5f9')
      .style('stroke-dasharray', '3,3');
    
    g.select('.domain').remove(); // remove border line of grid

    // Draw Axes
    // X Axis
    const xAxis = d3.axisBottom(xScale)
      // Display every 3 hours (or more in mini) to avoid text cluttering
      .tickValues(hours.filter((_, i) => i % (mini ? 6 : 3) === 0 || i === hours.length - 1));
      
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#64748b')
      .style('font-size', mini ? '9px' : '11px')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace');

    g.selectAll('.x-axis path, .x-axis line')
      .style('stroke', '#cbd5e1');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(mini ? 3 : 5);
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#64748b')
      .style('font-size', mini ? '9px' : '11px')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace');

    g.selectAll('.y-axis path, .y-axis line')
      .style('stroke', '#cbd5e1');

    // Define generators depending on metric
    if (metric === 'requests') {
      const areaGen = d3.area<TrafficDataPoint>()
        .x(d => xScale(d.hour) || 0)
        .y0(height)
        .y1(d => yScale(d.total))
        .curve(d3.curveMonotoneX);

      const lineGen = d3.line<TrafficDataPoint>()
        .x(d => xScale(d.hour) || 0)
        .y(d => yScale(d.total))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(chartData).attr('d', areaGen).style('fill', 'url(#indigo-grad-mini)');
      g.append('path').datum(chartData).attr('d', lineGen).style('fill', 'none').style('stroke', '#4f46e5').style('stroke-width', mini ? '1.5px' : '2.5px');

    } else if (metric === 'errors') {
      const areaGen = d3.area<TrafficDataPoint>()
        .x(d => xScale(d.hour) || 0)
        .y0(height)
        .y1(d => yScale(d.errors))
        .curve(d3.curveMonotoneX);

      const lineGen = d3.line<TrafficDataPoint>()
        .x(d => xScale(d.hour) || 0)
        .y(d => yScale(d.errors))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(chartData).attr('d', areaGen).style('fill', 'url(#rose-grad-mini)');
      g.append('path').datum(chartData).attr('d', lineGen).style('fill', 'none').style('stroke', '#f43f5e').style('stroke-width', mini ? '1.5px' : '2.5px');

    } else {
      const areaGen = d3.area<TrafficDataPoint>()
        .x(d => xScale(d.hour) || 0)
        .y0(height)
        .y1(d => yScale(d.latencyMs))
        .curve(d3.curveMonotoneX);

      const lineGen = d3.line<TrafficDataPoint>()
        .x(d => xScale(d.hour) || 0)
        .y(d => yScale(d.latencyMs))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(chartData).attr('d', areaGen).style('fill', 'url(#amber-grad-mini)');
      g.append('path').datum(chartData).attr('d', lineGen).style('fill', 'none').style('stroke', '#d97706').style('stroke-width', mini ? '1.5px' : '2.5px');
    }

    // Interactive elements... 
    
    // Add Interactive Hover overlay & Crosshair
    const crosshair = g.append('g')
      .attr('class', 'crosshair-elements')
      .style('display', 'none');

    crosshair.append('line')
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#94a3b8')
      .style('stroke-width', '1.5px')
      .style('stroke-dasharray', '4,4');

    crosshair.append('circle')
      .attr('r', mini ? 4 : 6)
      .style('fill', metric === 'requests' ? '#4f46e5' : metric === 'errors' ? '#e11d48' : '#d97706')
      .style('stroke', '#ffffff')
      .style('stroke-width', '2px');

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => crosshair.style('display', null))
      .on('mouseout', () => {
        crosshair.style('display', 'none');
        setHoveredData(null);
      })
      .on('mousemove', function(event) {
        const mouseX = d3.pointer(event, this)[0];
        let closestD = chartData[0];
        let minDiff = Infinity;
        
        chartData.forEach(d => {
          const xPos = xScale(d.hour) || 0;
          const diff = Math.abs(xPos - mouseX);
          if (diff < minDiff) {
            minDiff = diff;
            closestD = d;
          }
        });

        const activeX = xScale(closestD.hour) || 0;
        const activeY = metric === 'requests' ? yScale(closestD.total) : (metric === 'errors' ? yScale(closestD.errors) : yScale(closestD.latencyMs));

        crosshair.select('line').attr('x1', activeX).attr('x2', activeX);
        crosshair.select('circle').attr('cx', activeX).attr('cy', activeY);

        setHoveredData({ ...closestD, x: activeX + margin.left, y: activeY + margin.top });
      });

  }, [chartData, dimensions, metric, mini]);

  if (mini) {
    return (
      <div className="relative" ref={containerRef}>
        <div className="flex gap-2 mb-2">
          {['requests', 'latency', 'errors'].map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m as any)}
              className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all border ${
                metric === m 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-slate-300 text-[10px]">No activity logs found.</div>
        ) : (
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible select-none" />
        )}
        
        {hoveredData && (
          <div
            className="absolute z-50 bg-slate-900 text-white rounded-lg p-2 shadow-xl border border-slate-800 text-[10px] pointer-events-none"
            style={{ left: `${hoveredData.x + 10}px`, top: `${hoveredData.y - 10}px` }}
          >
            <div className="font-bold border-b border-slate-800 mb-1 pb-1">{hoveredData.hour}</div>
            <div className="grid grid-cols-2 gap-x-4">
              <span className="text-slate-400 uppercase">Requests:</span> <span className="font-bold text-right">{hoveredData.total}</span>
              <span className="text-slate-400 uppercase">Latency:</span> <span className="font-bold text-amber-400 text-right">{hoveredData.latencyMs}ms</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Aggregate Stats for Summary Cards
  const totalRequestsSum = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const totalErrorsSum = chartData.reduce((acc, curr) => acc + curr.errors, 0);
  const avgLatencyVal = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.latencyMs, 0) / chartData.length) 
    : 0;
  const errorRatePercent = totalRequestsSum > 0 
    ? ((totalErrorsSum / totalRequestsSum) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Hourly API Client Traffic
          </h3>
          <p className="text-xs text-slate-500">
            Real-time visual feed of compliance requests and endpoint health metrics.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Token Filter */}
          <div>
            <select
              value={selectedTokenId}
              onChange={(e) => setSelectedTokenId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[180px]"
            >
              <option value="all">All API Keys</option>
              {tokens.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isDemo ? '(Demo)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Endpoint Filter */}
          <div>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Endpoints</option>
              {endpoints.map(ep => (
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex border border-slate-200 rounded-lg overflow-x-auto p-0.5 bg-slate-50 shrink-0">
            <button
              onClick={() => setMetric('requests')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${metric === 'requests' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Traffic
            </button>
            <button
              onClick={() => setMetric('latency')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${metric === 'latency' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Latency
            </button>
            <button
              onClick={() => setMetric('errors')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${metric === 'errors' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Errors
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Requests Card */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Hourly Scan Volume
            </div>
            <div className="text-xl font-extrabold text-slate-800">{totalRequestsSum}</div>
            <div className="text-[10px] text-slate-500">Aggregate scans last 24h</div>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Average Latency Card */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Average Sync Latency
            </div>
            <div className="text-xl font-extrabold text-slate-800">{avgLatencyVal}ms</div>
            <div className="text-[10px] text-slate-500">Under EU DORA standard thresholds</div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Error Rate Card */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Integrity Loss / Error Rate
            </div>
            <div className="text-xl font-extrabold text-rose-600">{errorRatePercent}%</div>
            <div className="text-[10px] text-slate-500">{totalErrorsSum} failed connections flagged</div>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main D3 Chart Canvas */}
      <div className="relative">
        <div ref={containerRef} className="w-full h-[320px] rounded-lg">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Info className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
              <p className="text-sm">No request logs match the selected filters.</p>
            </div>
          ) : (
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="overflow-visible select-none"
            />
          )}
        </div>

        {/* Dynamic Tooltip Overlay */}
        {hoveredData && (
          <div
            className="absolute z-30 bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs w-[180px] pointer-events-none transition-all duration-75 space-y-2 animate-fade-in"
            style={{
              left: `${hoveredData.x + 15}px`,
              top: `${hoveredData.y - 10}px`,
            }}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="font-mono font-bold text-indigo-400">{hoveredData.hour}</span>
              <span className="text-[10px] text-slate-400">Scan Status</span>
            </div>
            <div className="space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Calls:</span>
                <span className="font-bold">{hoveredData.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Success:</span>
                <span className="text-emerald-400 font-bold">{hoveredData.success}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Failures:</span>
                <span className="text-rose-400 font-bold">{hoveredData.errors}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/50 pt-1 mt-1">
                <span className="text-slate-400">Latency:</span>
                <span className="text-amber-400 font-bold">{hoveredData.latencyMs} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Details Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
            <span>Success calls (200 OK)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span>Violations / Sync Block (403/422)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>Tunnel Latency (ms)</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-full text-[10px]">
          <Info className="w-3.5 h-3.5" />
          <span>Calculations run across fully encrypted secure WebSockets.</span>
        </div>
      </div>
    </div>
  );
};
