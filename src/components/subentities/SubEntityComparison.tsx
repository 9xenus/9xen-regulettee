import React from 'react';
import { SubEntity } from './types';
import { 
  X, 
  ArrowRightLeft, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileText,
  Server,
  Cloud,
  Globe,
  Cpu
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SubEntityComparisonProps {
  entityA: SubEntity;
  entityB: SubEntity;
  onClose: () => void;
}

export const SubEntityComparison: React.FC<SubEntityComparisonProps> = ({ entityA, entityB, onClose }) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('Infrastructure Compliance Audit Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Comparison: ${entityA.name} vs ${entityB.name}`, 14, 35);
    
    // Basic Info Table
    autoTable(doc, {
      startY: 45,
      head: [['Metric', entityA.name, entityB.name]],
      body: [
        ['Industry', entityA.industry, entityB.industry],
        ['Compliance Score', `${entityA.complianceScore}%`, `${entityB.complianceScore}%`],
        ['Status', entityA.status, entityB.status],
        ['Server Locations', entityA.infrastructure.serverLocations.join(', '), entityB.infrastructure.serverLocations.join(', ')],
      ],
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Cloud Providers
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('Cloud Provider Analysis', 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Entity', 'Provider', 'Region', 'Config', 'Status']],
      body: [
        ...entityA.infrastructure.cloudProviders.map(p => [entityA.name, p.provider, p.region, p.configType, p.status]),
        ...entityB.infrastructure.cloudProviders.map(p => [entityB.name, p.provider, p.region, p.configType, p.status]),
      ],
      headStyles: { fillColor: [14, 165, 233] }, // Sky-500
    });

    // Processing Nodes
    doc.setFontSize(14);
    doc.text('Data Processing Infrastructure', 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Entity', 'Node', 'Location', 'Type', 'Record Vol']],
      body: [
        ...entityA.infrastructure.dataProcessingNodes.map(n => [entityA.name, n.name, n.location, n.processingType, n.recordCount.toLocaleString()]),
        ...entityB.infrastructure.dataProcessingNodes.map(n => [entityB.name, n.name, n.location, n.processingType, n.recordCount.toLocaleString()]),
      ],
      headStyles: { fillColor: [139, 92, 246] }, // Violet-500
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Sovereign Compliance Platform - Confidential Audit Report - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`Compliance_Audit_${entityA.name}_vs_${entityB.name}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Critical': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] w-full max-w-6xl">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Infrastructure Discrepancy Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-1">Side-by-side technical profile comparison for stakeholder auditing.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generatePDF}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Audit PDF
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="grid grid-cols-2 gap-12 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden md:block"></div>
          
          {/* Entity A */}
          <div className="space-y-5 sm:space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Primary Subject</span>
              <h3 className="text-2xl font-black text-slate-900">{entityA.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${entityA.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {entityA.status}
                </span>
                <span className="text-xs font-bold text-slate-400">Score: {entityA.complianceScore}%</span>
              </div>
            </div>

            <section className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Regional Locations
              </h4>
              <div className="flex flex-wrap gap-2">
                {entityA.infrastructure.serverLocations.map(loc => (
                  <span key={loc} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700">
                    {loc}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5" /> Cloud Stack
              </h4>
              <div className="space-y-2">
                {entityA.infrastructure.cloudProviders.map(p => (
                  <div key={p.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">{p.provider} ({p.region})</p>
                      <p className="text-[10px] text-slate-500 font-bold">{p.configType} Topology</p>
                    </div>
                    {getStatusIcon(p.status)}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> Data Nodes
              </h4>
              <div className="space-y-2">
                {entityA.infrastructure.dataProcessingNodes.map(n => (
                  <div key={n.id} className="p-3 border border-slate-100 rounded-xl bg-white shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">{n.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{n.processingType} • {n.location}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">{(n.recordCount / 1000).toFixed(1)}k recs</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Entity B */}
          <div className="space-y-5 sm:space-y-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Comparison Baseline</span>
              <h3 className="text-2xl font-black text-slate-900">{entityB.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${entityB.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {entityB.status}
                </span>
                <span className="text-xs font-bold text-slate-400">Score: {entityB.complianceScore}%</span>
              </div>
            </div>

            <section className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Regional Locations
              </h4>
              <div className="flex flex-wrap gap-2">
                {entityB.infrastructure.serverLocations.map(loc => {
                  const isMatching = entityA.infrastructure.serverLocations.includes(loc);
                  return (
                    <span key={loc} className={`px-3 py-1 border rounded-lg text-xs font-bold ${isMatching ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                      {loc} {!isMatching && ' (Unique)'}
                    </span>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5" /> Cloud Stack
              </h4>
              <div className="space-y-2">
                {entityB.infrastructure.cloudProviders.map(p => (
                  <div key={p.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">{p.provider} ({p.region})</p>
                      <p className="text-[10px] text-slate-500 font-bold">{p.configType} Topology</p>
                    </div>
                    {getStatusIcon(p.status)}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> Data Nodes
              </h4>
              <div className="space-y-2">
                {entityB.infrastructure.dataProcessingNodes.map(n => (
                  <div key={n.id} className="p-3 border border-slate-100 rounded-xl bg-white shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">{n.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{n.processingType} • {n.location}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">{(n.recordCount / 1000).toFixed(1)}k recs</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 border-t border-slate-100 bg-slate-50 text-center rounded-b-3xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Regulatory Discrepancy Engine Output • EU Data Sovereignty Act v2.1
        </p>
      </div>
    </div>
  );
};
