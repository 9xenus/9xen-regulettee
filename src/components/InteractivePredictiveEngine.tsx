import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  LineChart, 
  TrendingUp, 
  Sliders, 
  HelpCircle, 
  Calculator, 
  ShieldAlert, 
  Layers, 
  Coins, 
  Building2, 
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface InteractivePredictiveEngineProps {
  initialRole?: 'EU_REGULATOR' | 'TENANT_OWNER' | 'PUBLIC';
  tenantName?: string;
}

export const InteractivePredictiveEngine: React.FC<InteractivePredictiveEngineProps> = ({
  initialRole = 'PUBLIC',
  tenantName = 'Acme Corporation (EU)',
}) => {
  const { user } = useAuth();
  const resolvedRole = (initialRole || user?.user_metadata?.role || user?.user_metadata?.accountType || 'CLIENT').toUpperCase();
  const isAdmin = resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN';
  const isRegulator = resolvedRole === 'EU_REGULATOR' || resolvedRole === 'REGULATOR';
  const isClient = !isAdmin && !isRegulator;

  // Determine active view mode
  const [activeMode, setActiveMode] = useState<'CLIENT' | 'REGULATOR' | 'SYSTEM'>('CLIENT');

  // Sync role to mode on load
  useEffect(() => {
    if (isRegulator) {
      setActiveMode('REGULATOR');
    } else if (isAdmin) {
      setActiveMode('SYSTEM');
    } else {
      setActiveMode('CLIENT');
    }
  }, [resolvedRole, isAdmin, isRegulator]);

  // ---------------------------------------------------------
  // 1. STATE VARIABLES FOR SLIDERS
  // ---------------------------------------------------------
  
  // CLIENT STATE
  const [clientAuditFrequency, setClientAuditFrequency] = useState<number>(4); // times per year
  const [clientTrainingHours, setClientTrainingHours] = useState<number>(12); // hours per employee
  const [clientDataRetention, setClientDataRetention] = useState<number>(36); // months
  const [clientBudget, setClientBudget] = useState<number>(45000); // EUR per year

  // REGULATOR STATE
  const [regulatorStrictness, setRegulatorStrictness] = useState<number>(75); // % strictness index
  const [regulatorAuditSampleRate, setRegulatorAuditSampleRate] = useState<number>(15); // % of market audited
  const [regulatorStaffing, setRegulatorStaffing] = useState<number>(24); // agents
  const [regulatorFineMultiplier, setRegulatorFineMultiplier] = useState<number>(1.2); // coefficient

  // SYSTEM STATE
  const [saasGrowthRate, setSaasGrowthRate] = useState<number>(12); // % monthly tenant onboarding growth
  const [saasCommissionRate, setSaasCommissionRate] = useState<number>(8); // % SaaS cut on collected penalty reserves
  const [saasBasePrice, setSaasBasePrice] = useState<number>(1200); // EUR base monthly subscription
  const [saasActiveTenants, setSaasActiveTenants] = useState<number>(140); // current tenants

  // ---------------------------------------------------------
  // 2. REF & DIMENSIONS FOR D3 CHARTS
  // ---------------------------------------------------------
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });

  // Update SVG size on container resize
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        setDimensions({
          width: Math.max(300, chartContainerRef.current.clientWidth),
          height: 320
        });
      }
    };

    handleResize();
    const observer = new ResizeObserver(() => handleResize());
    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ---------------------------------------------------------
  // 3. MODEL CALCULATIONS (PREDICTIVE ENGINE)
  // ---------------------------------------------------------

  // A. CLIENT PREDICTIVE DATA (12-Month Projection)
  const clientProjections = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Formula calculations based on sliders:
    // More audit frequency -> less incident rate
    // More training -> less incident rate
    // Long data retention -> slightly higher leak/GDPR risk
    // More budget -> drops compliance gap faster
    
    const baseViolationProb = Math.max(2, 45 - (clientAuditFrequency * 4) - (clientTrainingHours * 1.2) - (clientBudget / 2000) + (clientDataRetention / 12));
    
    return months.map((month, idx) => {
      // Compliance improves over months as budget is deployed
      const timeFactor = Math.exp(-idx / 6);
      const predictedIncidents = Math.max(0.05, (baseViolationProb / 10) * (0.4 + 0.6 * timeFactor));
      
      // Fine Risk (€) = incidents * base fine severity (e.g. €80,000)
      const fineRisk = predictedIncidents * 75000;
      
      // Cost of Compliance = Budget allocated per month + audit expenses
      const monthlyBudgetShare = clientBudget / 12;
      const monthlyAuditCost = (clientAuditFrequency * 1800) / 12;
      const complianceCost = monthlyBudgetShare + monthlyAuditCost;
      
      // Combined total cost risk
      const totalFinancialRisk = fineRisk + complianceCost;

      // Projecting a clean Score (0 - 100)
      const complianceScore = Math.min(99.4, Math.max(45, 100 - (predictedIncidents * 20)));

      return {
        month,
        idx,
        predictedIncidents: Number(predictedIncidents.toFixed(2)),
        fineRisk: Math.round(fineRisk),
        complianceCost: Math.round(complianceCost),
        totalFinancialRisk: Math.round(totalFinancialRisk),
        complianceScore: Number(complianceScore.toFixed(1))
      };
    });
  }, [clientAuditFrequency, clientTrainingHours, clientDataRetention, clientBudget]);

  // B. REGULATOR PREDICTIVE DATA (12-Month Projection)
  const regulatorProjections = useMemo(() => {
    const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];
    
    // Strictness + sample rate increases enforcement output but requires staffing capacity
    const marketComplianceBase = 60 + (regulatorStrictness * 0.15) + (regulatorAuditSampleRate * 0.2); // Market adapts to strict regulatory rules
    const detectedInfractionsBase = 120 * (regulatorStrictness / 100) * (regulatorAuditSampleRate / 10) / (regulatorStaffing / 12);
    
    return months.map((month, idx) => {
      const timeFactor = idx / 12;
      // Over time, strictness forces better market compliance
      const marketComplianceRate = Math.min(96.5, marketComplianceBase + (timeFactor * 12));
      
      // Caught Violations = based on sample rate and strictness
      const caughtViolations = Math.round(Math.max(5, detectedInfractionsBase * (1.1 - 0.4 * timeFactor)));
      
      // Staff capacity handles some portion. Overflow becomes backlog hours
      const capacity = regulatorStaffing * 15; // 15 audits/investigations handled per staff member per month
      const backlogAudits = Math.max(0, caughtViolations - capacity);
      const backlogHours = backlogAudits * 40; // 40 hours per audit
      
      // Fine collections projection
      const fineCollections = caughtViolations * 120000 * regulatorFineMultiplier;

      return {
        month,
        idx,
        marketComplianceRate: Number(marketComplianceRate.toFixed(1)),
        caughtViolations,
        backlogHours,
        fineCollections: Math.round(fineCollections)
      };
    });
  }, [regulatorStrictness, regulatorAuditSampleRate, regulatorStaffing, regulatorFineMultiplier]);

  // C. SYSTEM PREDICTIVE DATA (12-Month Projection)
  const saasProjections = useMemo(() => {
    const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];
    
    let currentTenants = saasActiveTenants;
    const growthCoeff = 1 + (saasGrowthRate / 100);
    
    return months.map((month, idx) => {
      // Compounded tenant growth
      if (idx > 0) {
        currentTenants = Math.round(currentTenants * growthCoeff);
      }
      
      // Monthly Recurring Revenue (MRR)
      const mrr = currentTenants * saasBasePrice;
      
      // Collected commissions from tenant fine escrow pools
      // Assume a standard platform throughput of €450,000 fines solved across entire client pool monthly
      const fineReserveThroughput = currentTenants * 3200; 
      const collectedCommissions = fineReserveThroughput * (saasCommissionRate / 100);
      
      // Total SaaS Yield
      const totalYield = mrr + collectedCommissions;
      
      // Hosting & Infrastructure Costs based on storage volume and tenants
      const dbInstanceCost = 2500; // Base cluster cost
      const storageVolumeGB = currentTenants * 120 * (1 + (idx * 0.05)); // 120GB base per client growing 5% monthly
      const hostingCost = dbInstanceCost + (storageVolumeGB * 0.15); // €0.15 per GB hot backup

      return {
        month,
        idx,
        tenants: currentTenants,
        mrr: Math.round(mrr),
        collectedCommissions: Math.round(collectedCommissions),
        totalYield: Math.round(totalYield),
        hostingCost: Math.round(hostingCost),
        storageVolumeGB: Math.round(storageVolumeGB)
      };
    });
  }, [saasGrowthRate, saasCommissionRate, saasBasePrice, saasActiveTenants]);

  // ---------------------------------------------------------
  // 4. DRAW D3 GRAPHICS ON DATA/VIEW CHANGE
  // ---------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 25, right: 35, bottom: 40, left: 75 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Gridlines container
    const gridG = g.append('g').attr('class', 'grid text-slate-100 opacity-20');

    // Tooltip trigger helper
    const setupInteractiveHover = (
      xScale: any, 
      yScale1: any, 
      yScale2: any, 
      data: any[], 
      hoverCallback: (d: any) => void,
      clearCallback: () => void
    ) => {
      // Invisible overlay for precise mouse hunting
      g.append('rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'transparent')
        .on('mousemove', (event) => {
          const mouseX = d3.pointer(event)[0];
          const domain = xScale.domain();
          let nearestIdx = 0;
          let minDiff = Infinity;
          
          domain.forEach((d: any, i: number) => {
            const xPos = xScale(d) || 0;
            const diff = Math.abs(xPos - mouseX);
            if (diff < minDiff) {
              minDiff = diff;
              nearestIdx = i;
            }
          });
          
          hoverCallback(data[nearestIdx]);
        })
        .on('mouseout', () => {
          clearCallback();
        });
    };

    if (activeMode === 'CLIENT') {
      // DRAW CLIENT COST OPTIMIZATION CURVE
      // X-axis: Months
      const xScale = d3.scalePoint()
        .domain(clientProjections.map(d => d.month))
        .range([0, chartWidth])
        .padding(0.15);

      // Y-axis: Euro values (fine risk, compliance cost, total risk)
      const yMax = d3.max(clientProjections, d => Math.max(d.fineRisk, d.complianceCost, d.totalFinancialRisk)) || 100000;
      const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.05])
        .range([chartHeight, 0]);

      // Add Y-Gridlines
      gridG.call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

      // Draw X-Axis
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .attr('class', 'x-axis text-slate-500 font-mono text-[10px]')
        .call(d3.axisBottom(xScale));

      // Draw Y-Axis
      g.append('g')
        .attr('class', 'y-axis text-slate-500 font-mono text-[10px]')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `€${d3.format(',')(d)}`));

      // 1. Line & Area for Compliance Cost (Budget + Audits)
      const areaCost = d3.area<any>()
        .x(d => xScale(d.month) || 0)
        .y0(chartHeight)
        .y1(d => yScale(d.complianceCost))
        .curve(d3.curveMonotoneX);

      const lineCost = d3.line<any>()
        .x(d => xScale(d.month) || 0)
        .y(d => yScale(d.complianceCost))
        .curve(d3.curveMonotoneX);

      // Gradient for cost
      const costGrad = svg.append('defs').append('linearGradient')
        .attr('id', 'client-cost-grad')
        .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      costGrad.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.15);
      costGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0);

      g.append('path')
        .datum(clientProjections)
        .attr('fill', 'url(#client-cost-grad)')
        .attr('d', areaCost);

      g.append('path')
        .datum(clientProjections)
        .attr('fill', 'none')
        .attr('stroke', '#4f46e5')
        .attr('stroke-width', 2)
        .attr('d', lineCost);

      // 2. Line for Fine Risk (Expected Liabilities)
      const lineFine = d3.line<any>()
        .x(d => xScale(d.month) || 0)
        .y(d => yScale(d.fineRisk))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(clientProjections)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3')
        .attr('d', lineFine);

      // 3. Highlight Total Exposure (Sum curve)
      const lineTotal = d3.line<any>()
        .x(d => xScale(d.month) || 0)
        .y(d => yScale(d.totalFinancialRisk))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(clientProjections)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 3)
        .attr('d', lineTotal);

      // Label lines on chart nicely
      g.append('text')
        .attr('x', chartWidth - 15)
        .attr('y', yScale(clientProjections[clientProjections.length - 1].totalFinancialRisk) - 10)
        .attr('fill', '#10b981')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .text('Combined Exposure');

      // Add interactive circles for active points on hover
      const focusGroup = g.append('g').style('display', 'none');
      const circleTotal = focusGroup.append('circle').attr('r', 5).attr('fill', '#10b981').attr('stroke', '#fff').attr('stroke-width', 1.5);
      const circleFine = focusGroup.append('circle').attr('r', 4).attr('fill', '#ef4444').attr('stroke', '#fff').attr('stroke-width', 1.5);

      setupInteractiveHover(
        xScale, 
        yScale, 
        null, 
        clientProjections, 
        (d) => {
          focusGroup.style('display', null);
          circleTotal.attr('cx', xScale(d.month) || 0).attr('cy', yScale(d.totalFinancialRisk));
          circleFine.attr('cx', xScale(d.month) || 0).attr('cy', yScale(d.fineRisk));
        },
        () => {
          focusGroup.style('display', 'none');
        }
      );

    } else if (activeMode === 'REGULATOR') {
      // DRAW REGULATOR ENFORCEMENT & CAPACITY CHART
      // X-Axis: Months/Intervals
      const xScale = d3.scaleBand()
        .domain(regulatorProjections.map(d => d.month))
        .range([0, chartWidth])
        .padding(0.25);

      // Y1-Scale: Violations caught / investigations
      const yMaxViolations = d3.max(regulatorProjections, d => Math.max(d.caughtViolations, 30)) || 50;
      const yScaleY1 = d3.scaleLinear()
        .domain([0, yMaxViolations * 1.1])
        .range([chartHeight, 0]);

      // Y2-Scale: Backlog hours (Right side axis)
      const yMaxBacklog = d3.max(regulatorProjections, d => d.backlogHours) || 100;
      const yScaleY2 = d3.scaleLinear()
        .domain([0, Math.max(100, yMaxBacklog) * 1.1])
        .range([chartHeight, 0]);

      // Add Y-Gridlines
      gridG.call(
        d3.axisLeft(yScaleY1)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

      // Draw X-Axis
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .attr('class', 'x-axis text-slate-500 font-mono text-[10px]')
        .call(d3.axisBottom(xScale));

      // Draw Left Y-Axis (Violations)
      g.append('g')
        .attr('class', 'y-axis text-slate-500 font-mono text-[10px]')
        .call(d3.axisLeft(yScaleY1).ticks(5));

      // Draw Right Y-Axis (Backlog Hours)
      g.append('g')
        .attr('transform', `translate(${chartWidth},0)`)
        .attr('class', 'y-axis text-amber-500 font-mono text-[10px]')
        .call(d3.axisRight(yScaleY2).ticks(5).tickFormat(d => `${d}h`));

      // Draw Caught Violations as Teal Bars
      g.selectAll('.bar-violations')
        .data(regulatorProjections)
        .enter()
        .append('rect')
        .attr('class', 'bar-violations transition-all duration-300')
        .attr('x', d => xScale(d.month) || 0)
        .attr('y', d => yScaleY1(d.caughtViolations))
        .attr('width', xScale.bandwidth())
        .attr('height', d => chartHeight - yScaleY1(d.caughtViolations))
        .attr('fill', '#0d9488')
        .attr('rx', 2);

      // Draw Backlog Hours as dotted Amber Line
      const backlogLine = d3.line<any>()
        .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
        .y(d => yScaleY2(d.backlogHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(regulatorProjections)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '4,4')
        .attr('d', backlogLine);

      // Interactive hover dots
      const focusGroup = g.append('g').style('display', 'none');
      const circleBacklog = focusGroup.append('circle').attr('r', 5).attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 1.5);

      setupInteractiveHover(
        xScale, 
        yScaleY1, 
        yScaleY2, 
        regulatorProjections, 
        (d) => {
          focusGroup.style('display', null);
          circleBacklog
            .attr('cx', (xScale(d.month) || 0) + xScale.bandwidth() / 2)
            .attr('cy', yScaleY2(d.backlogHours));
        },
        () => {
          focusGroup.style('display', 'none');
        }
      );

    } else if (activeMode === 'SYSTEM') {
      // DRAW SYSTEM PLATFORM YIELD & INFRASTRUCTURE COST
      const xScale = d3.scalePoint()
        .domain(saasProjections.map(d => d.month))
        .range([0, chartWidth])
        .padding(0.15);

      // Y-Axis: Euros
      const yMaxYield = d3.max(saasProjections, d => Math.max(d.totalYield, d.hostingCost)) || 50000;
      const yScale = d3.scaleLinear()
        .domain([0, yMaxYield * 1.1])
        .range([chartHeight, 0]);

      // Add Y-Gridlines
      gridG.call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      );

      // Draw X-Axis
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .attr('class', 'x-axis text-slate-500 font-mono text-[10px]')
        .call(d3.axisBottom(xScale));

      // Draw Y-Axis
      g.append('g')
        .attr('class', 'y-axis text-slate-500 font-mono text-[10px]')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `€${d3.format(',')(d)}`));

      // Total Yield Area (MRR + Escrow Cut)
      const areaYield = d3.area<any>()
        .x(d => xScale(d.month) || 0)
        .y0(chartHeight)
        .y1(d => yScale(d.totalYield))
        .curve(d3.curveMonotoneX);

      const lineYield = d3.line<any>()
        .x(d => xScale(d.month) || 0)
        .y(d => yScale(d.totalYield))
        .curve(d3.curveMonotoneX);

      const yieldGrad = svg.append('defs').append('linearGradient')
        .attr('id', 'saas-yield-grad')
        .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      yieldGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.2);
      yieldGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0);

      g.append('path')
        .datum(saasProjections)
        .attr('fill', 'url(#saas-yield-grad)')
        .attr('d', areaYield);

      g.append('path')
        .datum(saasProjections)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.5)
        .attr('d', lineYield);

      // Infrastructure / Hosting line (Cost bottleneck overlay)
      const lineHosting = d3.line<any>()
        .x(d => xScale(d.month) || 0)
        .y(d => yScale(d.hostingCost))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(saasProjections)
        .attr('fill', 'none')
        .attr('stroke', '#8b5cf6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3')
        .attr('d', lineHosting);

      // Label lines on chart nicely
      g.append('text')
        .attr('x', chartWidth - 15)
        .attr('y', yScale(saasProjections[saasProjections.length - 1].hostingCost) - 10)
        .attr('fill', '#8b5cf6')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .text('System Infra Cost');

      // Interactive circles
      const focusGroup = g.append('g').style('display', 'none');
      const circleYield = focusGroup.append('circle').attr('r', 5).attr('fill', '#10b981').attr('stroke', '#fff').attr('stroke-width', 1.5);
      const circleHosting = focusGroup.append('circle').attr('r', 5).attr('fill', '#8b5cf6').attr('stroke', '#fff').attr('stroke-width', 1.5);

      setupInteractiveHover(
        xScale, 
        yScale, 
        null, 
        saasProjections, 
        (d) => {
          focusGroup.style('display', null);
          circleYield.attr('cx', xScale(d.month) || 0).attr('cy', yScale(d.totalYield));
          circleHosting.attr('cx', xScale(d.month) || 0).attr('cy', yScale(d.hostingCost));
        },
        () => {
          focusGroup.style('display', 'none');
        }
      );
    }

  }, [activeMode, clientProjections, regulatorProjections, saasProjections, dimensions]);

  // ---------------------------------------------------------
  // 5. METRICS ANALYSIS/RECOMS GENERATOR
  // ---------------------------------------------------------
  
  // Dynamic alerts or suggestions based on slider configurations
  const smartRecommendation = useMemo(() => {
    if (activeMode === 'CLIENT') {
      const annualExposure = clientProjections.reduce((sum, d) => sum + d.fineRisk, 0);
      const scoreTrend = clientProjections[clientProjections.length - 1].complianceScore;
      
      if (scoreTrend < 75) {
        return {
          status: 'CRITICAL',
          color: 'text-rose-600 bg-rose-50 border-rose-100',
          title: 'Immediate Fine Hazard Warning',
          text: `With low employee training hours and infrequent external audits, your predicted fine liability risk is high. Move your compliance budget to €55,000+ or raise audit intervals to at least 4x/yr to avoid up to €${(annualExposure / 1000).toFixed(0)}k in annual expected EU penalty liabilities.`
        };
      } else if (clientBudget > 70000 && scoreTrend > 95) {
        return {
          status: 'OPTIMAL',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          title: 'Maximum Compliance Assurance Achieved',
          text: `Your current budget and strategy predict a stellar 98.4% compliance score, fully mitigating regulatory interventions. You have successfully balanced employee readiness with policy coverage!`
        };
      } else {
        return {
          status: 'WARNING',
          color: 'text-amber-700 bg-amber-50 border-amber-100',
          title: 'Sub-optimal Efficiency Margin',
          text: `You have decent safeguards, but your data retention policy of ${clientDataRetention} months creates high stale-data liability. Reducing retention length to 12-18 months will immediately drop systemic privacy risks by 14% with no additional cost.`
        };
      }
    } else if (activeMode === 'REGULATOR') {
      const avgBacklog = regulatorProjections.reduce((sum, d) => sum + d.backlogHours, 0) / 12;
      const totalEnforced = regulatorProjections.reduce((sum, d) => sum + d.fineCollections, 0);

      if (avgBacklog > 200) {
        return {
          status: 'ALERT',
          color: 'text-rose-600 bg-rose-50 border-rose-100',
          title: 'Staffing Bottleneck Impeding Enforcement',
          text: `Regulatory strictness levels are demanding more investigations than your current pool of ${regulatorStaffing} agents can resolve. Projected backlog totals ${Math.round(avgBacklog * 12)} hours of work. Increase agency staffing counts or raise the audit sampling threshold to optimize throughput.`
        };
      } else {
        return {
          status: 'STABLE',
          color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
          title: 'Enforcement Operations Within Budget',
          text: `Expected fine recovery reaches €${(totalEnforced / 1000000).toFixed(1)}M over 12 months. Your investigative capacity is balanced with target compliance goals across EU jurisdictions.`
        };
      }
    } else {
      // SYSTEM
      const finalTenants = saasProjections[saasProjections.length - 1].tenants;
      const totalCommissions = saasProjections.reduce((sum, d) => sum + d.collectedCommissions, 0);
      const totalMRR = saasProjections.reduce((sum, d) => sum + d.mrr, 0);

      if (finalTenants > 250) {
        return {
          status: 'SCALE_ALERT',
          color: 'text-purple-700 bg-purple-50 border-purple-100',
          title: 'Database Partitioning Recommendation',
          text: `By month 12, the platform is projected to host ${finalTenants} active corporate tenants with over ${(finalTenants * 120 * 1.5 / 1000).toFixed(1)} TB of storage volume. To prevent telemetry latency spikes, the automated failover engine recommends activating Multi-Zone Spanner shards in Month 6.`
        };
      } else {
        return {
          status: 'EFFICIENT',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          title: 'Robust Gross Profit Margins',
          text: `Predicted SaaS ARR is projected to reach €${(totalMRR / 1000).toFixed(0)}k, supplemented by €${(totalCommissions / 1000).toFixed(0)}k in automated trust-commission reserves. Infrastructure overhead remains low at just ${(saasProjections[11].hostingCost / saasProjections[11].totalYield * 100).toFixed(1)}% of total yield.`
        };
      }
    }
  }, [activeMode, clientProjections, regulatorProjections, saasProjections, clientBudget, clientAuditFrequency, clientTrainingHours, clientDataRetention, regulatorStaffing, regulatorStrictness, regulatorAuditSampleRate, saasGrowthRate, saasActiveTenants]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col space-y-4 sm:space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-black uppercase font-mono tracking-wider flex items-center gap-1 w-max">
            <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600 animate-pulse" />
            <span>AI Predictive Simulation Engine</span>
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center gap-1.5">
            <LineChart className="w-5 h-5 text-indigo-600" />
            <span>Interactive Compliance & Revenue Forecasting</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulate 12-month projections by manipulating system compliance variables, strictness, and infrastructure growth constraints.
          </p>
        </div>

        {/* Tab Switcher */}
        {!isClient && (
          <div className="flex bg-slate-150 border border-slate-250 p-1 rounded-xl text-xs font-bold font-mono">
            <button
              onClick={() => setActiveMode('CLIENT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeMode === 'CLIENT' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Client Mode
            </button>
            <button
              onClick={() => setActiveMode('REGULATOR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeMode === 'REGULATOR' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EU Regulator
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveMode('SYSTEM')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeMode === 'SYSTEM' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                System Yields
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Left is Sliders, Right is D3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        
        {/* Sliders Area (Column span 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-slate-500" />
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider font-mono">
              Simulation Parameters
            </h4>
          </div>

          {/* Render Sliders based on current Mode */}
          {activeMode === 'CLIENT' && (
            <div className="space-y-5">
              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    Annual Budget Allowance
                    <span title="Yearly funds allocated to training, tooling, and operational audits.">
                      <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                    </span>
                  </span>
                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    €{clientBudget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="120000"
                  step="5000"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>€10k</span>
                  <span>€120k</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Audit & Scan Frequency</span>
                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {clientAuditFrequency}x / year
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={clientAuditFrequency}
                  onChange={(e) => setClientAuditFrequency(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Annual</span>
                  <span>Monthly (12x)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">GDPR/AI Act Training</span>
                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {clientTrainingHours} hours / employee
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="2"
                  value={clientTrainingHours}
                  onChange={(e) => setClientTrainingHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>2 hours</span>
                  <span>40 hours</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Data Retention Horizon</span>
                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {clientDataRetention} months
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="120"
                  step="6"
                  value={clientDataRetention}
                  onChange={(e) => setClientDataRetention(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>6 months (Fast delete)</span>
                  <span>10 years (120m)</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'REGULATOR' && (
            <div className="space-y-5">
              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Audit Strictness Index</span>
                  <span className="font-mono text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">
                    {regulatorStrictness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={regulatorStrictness}
                  onChange={(e) => setRegulatorStrictness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Subtle/Permissive</span>
                  <span>Total Enforcement</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Market Auditing Sample Rate</span>
                  <span className="font-mono text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">
                    {regulatorAuditSampleRate}% of market
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="2"
                  value={regulatorAuditSampleRate}
                  onChange={(e) => setRegulatorAuditSampleRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Random Checks (2%)</span>
                  <span>Intense Surveillance (50%)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Enforcement Staff Pool</span>
                  <span className="font-mono text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">
                    {regulatorStaffing} Investigators
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={regulatorStaffing}
                  onChange={(e) => setRegulatorStaffing(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 agents</span>
                  <span>100 agents</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Fine Severity Factor</span>
                  <span className="font-mono text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded">
                    {regulatorFineMultiplier.toFixed(1)}x coefficient
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={regulatorFineMultiplier}
                  onChange={(e) => setRegulatorFineMultiplier(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Mitigating factors (0.5x)</span>
                  <span>Max statutory cap (3.0x)</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'SYSTEM' && (
            <div className="space-y-5">
              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Compounded Tenant Growth</span>
                  <span className="font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                    +{saasGrowthRate}% / month
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={saasGrowthRate}
                  onChange={(e) => setSaasGrowthRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1% Stable</span>
                  <span>30% High Growth</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Tenant Initial Pool</span>
                  <span className="font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                    {saasActiveTenants} corporate nodes
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={saasActiveTenants}
                  onChange={(e) => setSaasActiveTenants(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>20 tenants</span>
                  <span>500 tenants</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Base Monthly Subscription</span>
                  <span className="font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                    €{saasBasePrice} / month
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="5000"
                  step="100"
                  value={saasBasePrice}
                  onChange={(e) => setSaasBasePrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>€400 Standard</span>
                  <span>€5k Enterprise</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Escrow Commission Rate</span>
                  <span className="font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                    {saasCommissionRate}% cut
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={saasCommissionRate}
                  onChange={(e) => setSaasCommissionRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1% Low margin</span>
                  <span>20% High premium</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Output Stats Cards */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Year-End Core Predictions</span>
            <div className="grid grid-cols-2 gap-2">
              {activeMode === 'CLIENT' && (
                <>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Est. Fines Risk</span>
                    <span className="text-base font-bold font-mono text-rose-600">
                      €{(clientProjections.reduce((sum, d) => sum + d.fineRisk, 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Compliance Score</span>
                    <span className="text-base font-bold font-mono text-indigo-600">
                      {clientProjections[11].complianceScore}%
                    </span>
                  </div>
                </>
              )}
              {activeMode === 'REGULATOR' && (
                <>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Fines Leveraged</span>
                    <span className="text-sm font-bold font-mono text-teal-700">
                      €{(regulatorProjections.reduce((sum, d) => sum + d.fineCollections, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Staff Backlog</span>
                    <span className="text-sm font-bold font-mono text-amber-600">
                      {Math.round(regulatorProjections.reduce((sum, d) => sum + d.backlogHours, 0))} hrs
                    </span>
                  </div>
                </>
              )}
              {activeMode === 'SYSTEM' && (
                <>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Total System ARR</span>
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      €{(saasProjections.reduce((sum, d) => sum + d.totalYield, 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Hosting Volume</span>
                    <span className="text-sm font-bold font-mono text-purple-600">
                      {(saasProjections[11].storageVolumeGB / 1000).toFixed(1)} TB
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Chart Area (Column span 8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            
            {/* Chart Title & Explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>
                    {activeMode === 'CLIENT' && 'Cost of Complying vs Fine Exposure Projections'}
                    {activeMode === 'REGULATOR' && 'Staff Backlog Overhead vs Market Audits Caught'}
                    {activeMode === 'SYSTEM' && 'System Yield Output & Cloud DB Bottlenecks'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {activeMode === 'CLIENT' && 'Shows estimated liability risks (red) decreasing as budgets (indigo) are spent, yielding total cost trajectory (green).'}
                  {activeMode === 'REGULATOR' && 'Shows regulatory caught infractions as solid bars (teal) against staffing investigator backlogs (amber dotted line).'}
                  {activeMode === 'SYSTEM' && 'Shows total platform ARR + commission yields (green area) against database cluster hot storage overhead (purple dotted line).'}
                </p>
              </div>
              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-mono px-2 py-0.5 rounded-md h-max w-max">
                Vector Scale: Active
              </span>
            </div>

            {/* SVG Render Target */}
            <div ref={chartContainerRef} className="w-full relative min-h-[320px]">
              <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="overflow-visible select-none"
              ></svg>
            </div>

            {/* Dynamic Custom Chart Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-2 pt-3 border-t border-slate-100 text-[10px] font-bold uppercase font-mono text-slate-500">
              {activeMode === 'CLIENT' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                    <span>Total Financial Exposure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span>
                    <span>Safeguard Budget Costs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0 border-t border-dashed border-rose-500"></span>
                    <span>Calculated Fine Risk</span>
                  </div>
                </>
              )}
              {activeMode === 'REGULATOR' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-teal-600"></span>
                    <span>Market Infractions Caught</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0 border-t border-dashed border-amber-500"></span>
                    <span>Investigator Case Backlog (hours)</span>
                  </div>
                </>
              )}
              {activeMode === 'SYSTEM' && (
                <>
                  <div className="bg-emerald-500/20 border border-emerald-500 w-3 h-2.5 rounded"></div>
                  <span>Compound System Yield</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0 border-t border-dashed border-purple-500"></span>
                    <span>Hot DB Instance Costs</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Recommendations / Smart Insight Alerts */}
          <div className={`border rounded-2xl p-4 flex gap-3 transition-colors duration-300 ${smartRecommendation.color}`}>
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-extrabold text-xs uppercase tracking-wider font-mono">
                {smartRecommendation.title}
              </h5>
              <p className="text-xs font-medium leading-relaxed">
                {smartRecommendation.text}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
