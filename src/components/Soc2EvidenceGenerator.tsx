import React from 'react';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EvidenceItem {
  id: string;
  control: string;
  type: string;
  value: string;
  date: string;
  status: string;
}

export const Soc2EvidenceGenerator: React.FC<{ evidenceList: EvidenceItem[] }> = ({ evidenceList }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.text('SOC2 Evidence Report - CC1-CC9 Compliance', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Control / Requirement', 'Type', 'Value', 'Date', 'Status']],
      body: evidenceList.map(item => [item.control, item.type, item.value, item.date, item.status]),
    });

    doc.save('soc2-evidence-report.pdf');
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
    >
      <FileDown className="w-4 h-4" />
      Generate SOC2 PDF
    </button>
  );
};
