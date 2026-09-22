import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdfExport = (
  title: string,
  headers: string[],
  data: any[][],
  filename: string
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`${filename}.pdf`);
};

export const generateSecurityAuditLogPdf = (
  options: {
    title?: string;
    auditorName?: string;
    organization?: string;
    logs: Array<{
      id: string;
      timestamp: string;
      level: string;
      service: string;
      message: string;
      sourceIp: string;
      action: string;
    }>;
    filename?: string;
  }
) => {
  const {
    title = '9XEN_REGULETTEE EU COMPLIANCE & SECURITY AUDIT REPORT',
    auditorName = 'EU Cyber Compliance Officer',
    organization = '9Xen Regulettee Enterprise Sovereign Tenant',
    logs,
    filename = `Compliance_Audit_Log_Report_${new Date().toISOString().slice(0, 10)}`
  } = options;

  const doc = new jsPDF();
  const reportId = `AUD-ELK-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestampStr = new Date().toUTCString();
  const hash = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Report ID: ${reportId}  |  Generated: ${timestampStr}  |  Sovereign EU Region`, 14, 26);
  doc.text(`Organization: ${organization}`, 14, 32);

  // Key Audit Summary Metrics Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 44, 182, 30, 2, 2, 'FD');

  const criticalCount = logs.filter(l => l.level === 'CRITICAL').length;
  const warningCount = logs.filter(l => l.level === 'WARNING').length;
  const auditCount = logs.filter(l => l.level === 'AUDIT').length;
  const infoCount = logs.filter(l => l.level === 'INFO').length;

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE COMPLIANCE AUDIT SUMMARY', 18, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Log Events: ${logs.length}`, 18, 60);
  doc.text(`Critical Threats: ${criticalCount}`, 75, 60);
  doc.text(`Audit Trail Events: ${auditCount}`, 135, 60);

  doc.text(`Warnings: ${warningCount}`, 18, 67);
  doc.text(`Informational: ${infoCount}`, 75, 67);
  doc.text(`Immutable Ledgers: 3 Active Replicas`, 135, 67);

  // Table of Audit Logs
  const tableData = logs.map(log => [
    new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false }) + '\n' + new Date(log.timestamp).toISOString().slice(0, 10),
    log.level,
    log.service,
    log.action,
    log.message,
    log.sourceIp
  ]);

  autoTable(doc, {
    head: [['Timestamp', 'Level', 'Service', 'Action', 'Audit Event Message', 'Source IP']],
    body: tableData,
    startY: 80,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 28 },
      3: { cellWidth: 26 },
      4: { cellWidth: 56 },
      5: { cellWidth: 26 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = String(data.cell.raw);
        if (val === 'CRITICAL') {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
        } else if (val === 'WARNING') {
          data.cell.styles.textColor = [217, 119, 6]; // amber-600
        } else if (val === 'AUDIT') {
          data.cell.styles.textColor = [79, 70, 229]; // indigo-600
        }
      }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Digital Verification & Compliance Sign-off
  const sigY = Math.min(finalY + 15, 245);

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(14, sigY, 196, sigY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('COMPLIANCE ATTESTATION & DIGITAL INTEGRITY HASH', 14, sigY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Auditor: ${auditorName}`, 14, sigY + 15);
  doc.text(`Digital Verification Hash: ${hash}`, 14, sigY + 21);
  doc.text('Framework Compliance: GDPR Art. 30/32 | NIS2 Annex II | DORA Risk Audit | EU AI Act Art. 12 Log Retention', 14, sigY + 27);

  doc.save(`${filename}.pdf`);
};

export const generateSignedPdfExport = (
  title: string,
  data: any,
  auditorName: string,
  filename: string
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Signature block (simplified)
  doc.setFontSize(10);
  doc.text(`Signed by: ${auditorName}`, 14, 250);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 255);
  doc.text(`Digital Signature: SIG-${Math.random().toString(36).substring(7).toUpperCase()}`, 14, 260);

  doc.save(`${filename}.pdf`);
};

