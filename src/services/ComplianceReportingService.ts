import { fetchWithRetry } from '../lib/api-client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ComplianceReportingService
 * Fetches data from the audit ledger and generates a downloadable PDF report.
 */
export const ComplianceReportingService = {
  /**
   * Generates a PDF report of recent compliance activities.
   */
  async generateRecentActivitiesReport(tenantId: string) {
    try {
      console.log(`[ComplianceReportingService] Fetching audit ledger for tenant: ${tenantId}`);
      
      // 1. Fetch recent activities from audit ledger
      const response = await fetchWithRetry(`/api/v1/reporting/analytics/search?tenantId=${tenantId}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit ledger from analytical storage.');
      }
      
      const { logs } = await response.json();

      // 2. Initialize PDF document
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text('Compliance Audit Ledger Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Tenant ID: ${tenantId}`, 14, 30);
      doc.text(`Generated at: ${timestamp}`, 14, 35);
      doc.text('Confidential - EU Regulatory Compliance Standard', 14, 40);

      // 3. Format data for PDF Table
      const headers = [['Timestamp', 'Action', 'Module', 'Status', 'Severity']];
      const data = logs.map((log: any) => [
        new Date(log.timestamp).toLocaleString(),
        log.action_type,
        log.service_module,
        log.status,
        log.severity
      ]);

      // 4. Generate Table
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 50,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `9Xen Regulettee EU Platform - Immutable Compliance Ledger Proof - Page ${i} of ${pageCount}`,
          14,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // 5. Download the PDF
      const filename = `Compliance_Report_${tenantId}_${Date.now()}.pdf`;
      doc.save(filename);
      
      console.log(`[ComplianceReportingService] Report generated and downloaded: ${filename}`);
      return { success: true, filename };
    } catch (error: any) {
      console.error('[ComplianceReportingService] Report Generation Error:', error);
      throw error;
    }
  }
};
