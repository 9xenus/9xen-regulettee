import React, { useState } from 'react';
import { X, ArrowLeftRight, ShieldAlert, CheckCircle2, AlertTriangle, Server, Globe, Lock, Shield, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DigitalAsset {
  id: string;
  name: string;
  type: 'Cloud Account' | 'Domain / URL' | 'Database Cluster' | 'Storage Bucket' | 'API Gateway';
  identifier: string;
  region: string;
  status: 'Secure' | 'Vulnerability Detected' | 'Unmonitored';
  encryption: 'AES-256' | 'TLS 1.3' | 'Unencrypted' | 'Standard';
}

interface CompanyEntity {
  id: string;
  name: string;
  legalName: string;
  registrationId: string;
  country: string;
  region: string;
  type: 'Parent Company' | 'Subsidiary' | 'Joint Venture' | 'Regional Branch';
  employees: number;
  dpoName: string;
  dpoEmail: string;
  status: 'Compliant' | 'Review Needed' | 'Action Required';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  digitalAssets: DigitalAsset[];
  notes: string;
}

interface InfrastructureComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyEntity[];
}

export const InfrastructureComparisonModal: React.FC<InfrastructureComparisonModalProps> = ({
  isOpen,
  onClose,
  companies
}) => {
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>(
    companies.length >= 2 ? [companies[0].id, companies[1].id] : companies.map(c => c.id).slice(0, 2)
  );

  if (!isOpen) return null;

  const selectedEntities = companies.filter(c => selectedEntityIds.includes(c.id));

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const timestamp = new Date().toLocaleString();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Infrastructure Compliance Audit Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${timestamp}`, 14, 30);
    doc.text('Confidential - 9Xen Regulettee Compliance-as-a-Service', 14, 35);

    // Table Data
    const head = [['Parameter', ...selectedEntities.map(e => e.name)]];
    
    const body = [
      ['Entity Type', ...selectedEntities.map(e => e.type)],
      ['Jurisdiction', ...selectedEntities.map(e => `${e.country} (${e.region})`)],
      ['Registration ID', ...selectedEntities.map(e => e.registrationId)],
      ['Compliance Status', ...selectedEntities.map(e => e.status)],
      ['Risk Level', ...selectedEntities.map(e => e.riskLevel)],
      ['Asset Count', ...selectedEntities.map(e => `${e.digitalAssets.length} Nodes`)],
      ['Infrastructure Profile', ...selectedEntities.map(e => 
        e.digitalAssets.map(a => `- ${a.name} (${a.type}): ${a.encryption} - ${a.status}`).join('\n')
      )],
      ['DPO Contact', ...selectedEntities.map(e => `${e.dpoName}\n${e.dpoEmail}`)]
    ];

    autoTable(doc, {
      startY: 45,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', fillColor: [248, 250, 252] }
      },
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      alternateRowStyles: { fillColor: [252, 252, 252] }
    });

    // Save
    doc.save(`9Xen Regulettee_Infra_Audit_${Date.now()}.pdf`);
  };

  const handleToggleEntity = (id: string) => {
    if (selectedEntityIds.includes(id)) {
      if (selectedEntityIds.length > 1) {
        setSelectedEntityIds(selectedEntityIds.filter(eId => eId !== id));
      }
    } else {
      if (selectedEntityIds.length < 3) {
        setSelectedEntityIds([...selectedEntityIds, id]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col overflow-hidden border border-slate-200 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Sub-Entity Infrastructure Side-by-Side Comparison</h2>
              <p className="text-xs text-slate-400">Identify configuration discrepancies, encryption gaps, and data processing variances across entities.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Selector Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Entities to Compare (Max 3):</span>
          <div className="flex flex-wrap gap-2">
            {companies.map(c => {
              const isSelected = selectedEntityIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => handleToggleEntity(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-slate-300'}`} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Matrix Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-6">
          {selectedEntities.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              Please select at least one subsidiary entity above to view the infrastructure comparison profile.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 border-b border-slate-200 w-48 sticky left-0 z-10">
                      Configuration Parameter
                    </th>
                    {selectedEntities.map(entity => (
                      <th key={entity.id} className="p-4 text-left border-b border-l border-slate-200 bg-slate-50 min-w-[280px]">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-sm">{entity.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {entity.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          {entity.country} • ID: {entity.registrationId}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-200 font-medium">
                  {/* Row: Region & Jurisdiction */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                      Cloud Region / Jurisdiction
                    </td>
                    {selectedEntities.map(entity => (
                      <td key={entity.id} className="p-4 border-l border-slate-200 bg-white">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Globe className="w-4 h-4 text-indigo-600" />
                          {entity.region}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Compliance Risk & Status */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                      Compliance & Risk Posture
                    </td>
                    {selectedEntities.map(entity => (
                      <td key={entity.id} className="p-4 border-l border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            entity.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            entity.status === 'Review Needed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {entity.status}
                          </span>
                          <span className="text-slate-500 text-[11px]">Risk: <strong className="text-slate-800">{entity.riskLevel}</strong></span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Digital Asset Inventory Count */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                      Monitored Digital Assets
                    </td>
                    {selectedEntities.map(entity => (
                      <td key={entity.id} className="p-4 border-l border-slate-200 bg-white">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Server className="w-4 h-4 text-indigo-600" />
                          {entity.digitalAssets.length} Infrastructure Nodes
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Detailed Digital Assets Breakdown */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0 z-10 align-top">
                      Asset & Encryption Discrepancies
                    </td>
                    {selectedEntities.map(entity => (
                      <td key={entity.id} className="p-4 border-l border-slate-200 bg-white align-top space-y-2">
                        {entity.digitalAssets.map(asset => {
                          const isUnsecure = asset.encryption === 'Unencrypted' || asset.status !== 'Secure';
                          return (
                            <div key={asset.id} className={`p-2.5 rounded-lg border text-xs ${
                              isUnsecure ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">{asset.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  asset.encryption === 'AES-256' || asset.encryption === 'TLS 1.3' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {asset.encryption}
                                </span>
                              </div>
                              <div className="text-[11px] text-indigo-600 font-mono mt-0.5">{asset.identifier}</div>
                              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                                <span>{asset.type}</span>
                                <span className={asset.status === 'Secure' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{asset.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    ))}
                  </tr>

                  {/* Row: DPO Contact */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
                      Assigned DPO / Personnel
                    </td>
                    {selectedEntities.map(entity => (
                      <td key={entity.id} className="p-4 border-l border-slate-200 bg-white">
                        <div className="font-bold text-slate-900">{entity.dpoName}</div>
                        <div className="text-[11px] text-indigo-600 font-mono mt-0.5">{entity.dpoEmail}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{entity.employees} staff members</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" />
              Comparison engine analyzing real-time digital asset telemetry &amp; compliance postures.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export PDF Audit Report
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
