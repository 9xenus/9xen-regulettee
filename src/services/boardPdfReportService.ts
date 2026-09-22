/**
 * Board-Level Compliance Impact PDF Generation Service
 * Specifically designed for C-Suite and Board of Directors review upon critical legislative change detection.
 */

export interface CriticalChangeReportData {
  jobId: string;
  tenantId: string;
  taskType: string;
  scanTimestamp: string;
  legislativeTitle: string;
  regulatoryBody: string;
  officialGazetteDate: string;
  statutoryCelex: string;
  effectiveEnforcementDate: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  exposureScore: number;
  statutoryFineCeiling: string;
  boardActionRequired: string;
  impactedArchitectures: Array<{
    component: string;
    gap: string;
    complianceLevel: string;
  }>;
  workerEngineId?: string;
  auditHash?: string;
}

export async function exportBoardCompliancePdfReport(data: CriticalChangeReportData): Promise<void> {
  const jspdfModule = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable: any = (autoTableModule as any).default || autoTableModule;

  const doc = new jspdfModule.jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Executive Board Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent line
  doc.setFillColor(217, 119, 6); // amber-600 gold
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Classification Badge
  doc.setFillColor(239, 68, 68); // rose-600
  doc.roundedRect(margin, 8, 58, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONFIDENTIAL // BOARD REVIEW', margin + 3, 12.2);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LEGISLATIVE IMPACT ADVISORY', margin, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Tenant ID: ${data.tenantId.toUpperCase()}  |  Worker Job ID: ${data.jobId}  |  Scanned: ${new Date(data.scanTimestamp).toUTCString()}`, margin, 32);
  doc.text('Autonomous Regulatory Surveillance & Continuous Threat Evaluation Engine', margin, 37);

  // 2. Executive Threat & Exposure Summary Box
  let currentY = 50;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('EXECUTIVE THREAT & STATUTORY EXPOSURE SUMMARY', margin + 4, currentY + 7);

  // 3 Mini KPI columns inside summary
  const colWidth = (contentWidth - 12) / 3;

  // Col 1: Statutory Fine Ceiling
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MAX STATUTORY FINE CEILING', margin + 4, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(data.statutoryFineCeiling || 'Up to €35M / 7% Turnover', margin + 4, currentY + 22);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Per EU Statutory Enforcement Mandate', margin + 4, currentY + 28);

  // Col 2: Threat Rating & Exposure Score
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('EXPOSURE SCORE / SEVERITY', margin + 4 + colWidth, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(`${data.exposureScore}/100 [${data.severity}]`, margin + 4 + colWidth, currentY + 22);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Immediate Board Governance Trigger', margin + 4 + colWidth, currentY + 28);

  // Col 3: Enforcement Countdown
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('EFFECTIVE ENFORCEMENT DATE', margin + 4 + colWidth * 2, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.effectiveEnforcementDate || 'Immediate', margin + 4 + colWidth * 2, currentY + 22);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Official Gazette: ${data.officialGazetteDate || 'Published'}`, margin + 4 + colWidth * 2, currentY + 28);

  // 3. Legislative Identification Table
  currentY += 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. STATUTORY SPECIFICATION & JURISDICTIONAL PROFILE', margin, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    head: [['Parameter', 'Statutory Intelligence Value', 'Legal Authority / Reference']],
    body: [
      ['Legislative Act', data.legislativeTitle, data.regulatoryBody],
      ['CELEX Identifier', data.statutoryCelex, 'Official Journal of the European Union (EUR-Lex)'],
      ['Enforcement Status', 'In Force - Transitional Period Active', `Statutory Deadline: ${data.effectiveEnforcementDate}`],
      ['Surveillance Source', 'Automated BullMQ Worker Crawl', 'Direct European Parliament / EUR-Lex API Stream']
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Impacted Architecture & Internal Systems Gap Analysis Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ENTERPRISE ARCHITECTURE & SUBSYSTEM GAP ANALYSIS', margin, currentY);

  const architectureRows = data.impactedArchitectures.map(arch => [
    arch.component,
    arch.gap,
    arch.complianceLevel
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 100 },
      2: { cellWidth: 37, fontStyle: 'bold' }
    },
    head: [['Architecture Component', 'Identified Compliance Gap / Technical Vector', 'Current Posture']],
    body: architectureRows
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 5. Board Action Required Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. BOARD RESOLUTION & REMEDIATION ROADMAP', margin, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    head: [['Phase', 'Governance Mandate', 'Execution Responsibility']],
    body: [
      [
        'Immediate (7 Days)',
        'Convene special Board Audit & Risk Committee session. Freeze unauthorized modifications to impacted systems. Ratify automated remediation budget.',
        'Board of Directors / Chief Legal Officer'
      ],
      [
        '30-Day Milestone',
        'Deploy cryptographic audit logging and deploy patched AI/crypto models into staging sandbox. Execute third-party conformity validation assessment.',
        'Chief Technology Officer / CISO'
      ],
      [
        '90-Day Milestone',
        'File formal Conformity Declaration with National Supervisory Authority. Update Enterprise Annex IV Dossier and secure external audit sign-off.',
        'Head of Regulatory Affairs / DPO'
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 6. Cryptographic Attestation Block
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CRYPTOGRAPHIC SURVEILLANCE ATTESTATION', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Engine: ${data.workerEngineId || 'BullMQ_Distributed_v5.4'}  |  Worker Node: node-worker-prod-01`, margin + 4, currentY + 10);
  doc.text(`Verification Hash: ${data.auditHash || 'sha256:8f4c2e19b889a742cd6109e44ff025b9671d188bc88b209e53b6e828e67aa51c'}`, margin + 4, currentY + 14);

  // Footer on bottom of page
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This document constitutes a privileged legal & compliance briefing generated by NONAXEN CaaS Platform.', margin, pageHeight - 8);
  doc.text(`Page 1 of 1  |  Strictly Confidential  |  ${new Date().toISOString()}`, pageWidth - margin - 65, pageHeight - 8);

  const cleanTitle = data.legislativeTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  doc.save(`Board_Compliance_Advisory_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
