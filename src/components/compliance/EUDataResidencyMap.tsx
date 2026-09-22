import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Shield, MapPin, Server, Activity, Info, X } from 'lucide-react';

interface EUResidencyData {
  countryCode: string;
  countryName: string;
  provider: string;
  volume: string;
  complianceStatus: 'EXCELLENT' | 'GOOD' | 'WARNING';
  encryption: string;
  dataTypes: string[];
  lastAudit: string;
}

const MOCK_EU_DATA: EUResidencyData[] = [
  { countryCode: 'FRA', countryName: 'France', provider: 'Nonaxen Sovereign Vault (Paris)', volume: '1.4 PB', complianceStatus: 'EXCELLENT', encryption: 'AES-256-GCM (Sovereign Managed)', dataTypes: ['PII', 'Financial', 'Healthcare'], lastAudit: '2026-06-15' },
  { countryCode: 'DEU', countryName: 'Germany', provider: 'AWS Sovereign Cloud (Frankfurt)', volume: '2.8 PB', complianceStatus: 'EXCELLENT', encryption: 'AES-256 (KMS Controlled)', dataTypes: ['PII', 'Operational', 'Logs'], lastAudit: '2026-07-01' },
  { countryCode: 'IRL', countryName: 'Ireland', provider: 'Azure EU North (Dublin)', volume: '0.9 PB', complianceStatus: 'GOOD', encryption: 'AES-256 (Provider Managed)', dataTypes: ['Backups', 'Archive'], lastAudit: '2026-05-20' },
  { countryCode: 'ESP', countryName: 'Spain', provider: 'Google Sovereign (Madrid)', volume: '0.4 PB', complianceStatus: 'GOOD', encryption: 'AES-256 (CMEK)', dataTypes: ['User Profiles'], lastAudit: '2026-06-10' },
  { countryCode: 'POL', countryName: 'Poland', provider: 'Equinix Sovereign (Warsaw)', volume: '1.1 PB', complianceStatus: 'EXCELLENT', encryption: 'AES-256 (Sovereign Managed)', dataTypes: ['PII', 'Financial'], lastAudit: '2026-07-10' },
  { countryCode: 'NLD', countryName: 'Netherlands', provider: 'Iron Mountain (Amsterdam)', volume: '0.7 PB', complianceStatus: 'WARNING', encryption: 'AES-256', dataTypes: ['Logs', 'Temp'], lastAudit: '2026-04-12' },
];

export const EUDataResidencyMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<EUResidencyData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove(); // Clear previous render

    // Projection for Europe
    const projection = d3.geoAzimuthalEqualArea()
      .rotate([-10, -52])
      .scale(width * 1.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world atlas
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((topology: any) => {
      const countries = topojson.feature(topology, topology.objects.countries) as any;
      
      // List of ISO codes for EU countries (roughly)
      // Note: world-atlas uses numerical IDs, but properties.name is available.
      // We'll use name matching or ID mapping for this demonstration.
      
      const g = svg.append('g');

      // Draw background ocean
      svg.insert('rect', 'g')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#f8fafc');

      g.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('class', 'country')
        .attr('fill', (d: any) => {
          const countryName = d.properties.name;
          const data = MOCK_EU_DATA.find(item => item.countryName === countryName);
          if (data) {
            if (data.complianceStatus === 'EXCELLENT') return '#4f46e5'; // Indigo-600
            if (data.complianceStatus === 'GOOD') return '#818cf8'; // Indigo-400
            return '#fbbf24'; // Amber-400
          }
          return '#e2e8f0'; // Slate-200
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .style('cursor', (d: any) => {
          const countryName = d.properties.name;
          return MOCK_EU_DATA.find(item => item.countryName === countryName) ? 'pointer' : 'default';
        })
        .on('mouseover', function(event, d: any) {
          const countryName = d.properties.name;
          const data = MOCK_EU_DATA.find(item => item.countryName === countryName);
          if (data) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', '#4338ca'); // Indigo-700
            setHoveredCountry(countryName);
          }
        })
        .on('mouseout', function(event, d: any) {
          const countryName = d.properties.name;
          const data = MOCK_EU_DATA.find(item => item.countryName === countryName);
          if (data) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', () => {
                if (data.complianceStatus === 'EXCELLENT') return '#4f46e5';
                if (data.complianceStatus === 'GOOD') return '#818cf8';
                return '#fbbf24';
              });
            setHoveredCountry(null);
          }
        })
        .on('click', (event, d: any) => {
          const countryName = d.properties.name;
          const data = MOCK_EU_DATA.find(item => item.countryName === countryName);
          if (data) {
            setSelectedCountry(data);
          }
        });

      // Add labels for active countries
      g.selectAll('.label')
        .data(countries.features.filter((d: any) => MOCK_EU_DATA.find(item => item.countryName === d.properties.name)))
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('transform', (d: any) => `translate(${path.centroid(d)})`)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text((d: any) => {
          const data = MOCK_EU_DATA.find(item => item.countryName === d.properties.name);
          return data ? data.volume : '';
        });
    }).catch(err => {
      console.warn("EUDataResidencyMap topology fetch failed:", err);
    });

  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
      <div className="flex-1 p-4 sm:p-5 lg:p-6 relative min-h-[500px]" ref={containerRef}>
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            EU Regional Data Residency Map
          </h3>
          <p className="text-xs text-slate-500 font-medium">Interactive physical storage localization tracker for GDPR adequacy reporting.</p>
        </div>

        <svg ref={svgRef} className="w-full h-full"></svg>

        <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <span className="text-[10px] font-bold text-slate-600">Sovereign Compliance (Excellent)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
            <span className="text-[10px] font-bold text-slate-600">Adequacy Verified (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <span className="text-[10px] font-bold text-slate-600">Audit Pending / Warning</span>
          </div>
        </div>

        <AnimatePresence>
          {hoveredCountry && !selectedCountry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-24 right-6 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 z-10 pointer-events-none"
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider">{hoveredCountry}</span>
              </div>
              <p className="text-[10px] text-slate-400">Click for residency specifications</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full lg:w-80 bg-slate-50 border-l border-slate-200 p-4 sm:p-5 lg:p-6 flex flex-col">
        {selectedCountry ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-black text-slate-900 leading-tight">{selectedCountry.countryName}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${selectedCountry.complianceStatus === 'EXCELLENT' ? 'bg-emerald-500' : selectedCountry.complianceStatus === 'GOOD' ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{selectedCountry.complianceStatus} RESIDENCY</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Facility</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{selectedCountry.provider}</p>
                <div className="mt-2 flex justify-between items-end">
                  <div className="text-2xl font-black text-indigo-600">{selectedCountry.volume}</div>
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">STORAGE LOAD</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Encryption Protocol</span>
                    <span className="text-xs font-semibold text-slate-700">{selectedCountry.encryption}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Last Compliance Audit</span>
                    <span className="text-xs font-semibold text-slate-700">{selectedCountry.lastAudit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Encapsulated Data Types</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCountry.dataTypes.map(type => (
                      <span key={type} className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
              <Info className="w-3.5 h-3.5" />
              DOWNLOAD ADEQUACY REPORT
            </button>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Select a Region</h4>
            <p className="text-xs text-slate-500 max-w-[200px]">Click on an active member state on the map to view detailed data residency specifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};
