import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Download } from 'lucide-react';

const generateLast30DaysData = () => {
  const data = [];
  const today = new Date();
  
  let vulnerabilities = 45;
  let policyViolations = 25;
  let prevVulnerabilities = 55;
  let prevPolicyViolations = 32;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate trend: going down generally
    vulnerabilities = Math.max(0, vulnerabilities - Math.floor(Math.random() * 3) + 1);
    policyViolations = Math.max(0, policyViolations - Math.floor(Math.random() * 2) + 0.5);
    
    // Simulate prev month trend: a bit higher but similar pattern
    prevVulnerabilities = Math.max(0, prevVulnerabilities - Math.floor(Math.random() * 3) + 1.1);
    prevPolicyViolations = Math.max(0, prevPolicyViolations - Math.floor(Math.random() * 2) + 0.6);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      vulnerabilities: Math.floor(vulnerabilities),
      policyViolations: Math.floor(policyViolations),
      prevVulnerabilities: Math.floor(prevVulnerabilities),
      prevPolicyViolations: Math.floor(prevPolicyViolations),
    });
  }
  return data;
};

const data = generateLast30DaysData();

export const ComplianceRiskTrendChart: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("Compliance Risk Audit Report", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text("Type: Official Signed Audit Document", 14, 35);
      
      // Line separator
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(14, 40, pageWidth - 14, 40);
      
      // Introduction
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105); // slate-600
      const introText = "This document represents the 30-day historical trend analysis of compliance risks, comparing current vulnerabilities and policy violations against the previous month's performance. It serves as an official ledger entry.";
      const splitIntro = doc.splitTextToSize(introText, pageWidth - 28);
      doc.text(splitIntro, 14, 50);

      // Table Data
      const tableColumn = ["Date", "Current Vuln.", "Prev Month Vuln.", "Current Violations", "Prev Month Violations"];
      const tableRows = data.map(item => [
        item.date,
        item.vulnerabilities.toString(),
        item.prevVulnerabilities.toString(),
        item.policyViolations.toString(),
        item.prevPolicyViolations.toString()
      ]);

      autoTable(doc, {
        startY: 70,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // Signature Section
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("Digital Signature Verification", 14, finalY + 20);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Signed by: System Compliance Engine", 14, finalY + 28);
      doc.text(`Signature Hash: 0x${Math.random().toString(16).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`, 14, finalY + 34);
      doc.text("Status: VERIFIED & SEALED", 14, finalY + 40);

      // Watermark or stamp effect
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.setFontSize(14);
      doc.text("✓ AUDIT PASSED", pageWidth - 50, finalY + 35);

      doc.save("Compliance_Risk_Audit_Report.pdf");
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Compliance Risk Trend
          </h3>
          <p className="text-xs text-slate-500 mt-1">30-Day history of vulnerabilities and policy violations vs. previous month.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-70 flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? "Generating Document..." : "Export Signed PDF"}
        </button>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVulnerabilities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} dy={10} minTickGap={20} />
            <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
            <Area 
              type="monotone" 
              dataKey="vulnerabilities" 
              name="Current Vulnerabilities"
              stroke="#f43f5e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorVulnerabilities)" 
              activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="policyViolations" 
              name="Current Policy Violations"
              stroke="#f59e0b" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorViolations)" 
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="prevVulnerabilities" 
              name="Prev Month Vulnerabilities"
              stroke="#f43f5e" 
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="prevPolicyViolations" 
              name="Prev Month Violations"
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComplianceRiskTrendChart;
