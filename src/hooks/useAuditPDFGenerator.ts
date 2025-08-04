import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export interface AuditReportData {
  audit: {
    document_title: string;
    entity_audited: string;
    fiscal_year: number;
    audit_summary: string;
    audit_score?: number;
    source_type: string;
    region: string;
    created_at: string;
    tags: string[];
  };
  statistics?: {
    view_count: number;
    download_count: number;
    watchlist_count: number;
    comment_count: number;
  };
  findings?: string;
  recommendations?: string[];
}

export const useAuditPDFGenerator = () => {
  const { toast } = useToast();

  const generateAuditReport = async (data: AuditReportData): Promise<void> => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += fontSize * 0.6;
        });
        yPosition += 5;
      };

      // Header
      pdf.setFillColor(0, 123, 255);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AUDIT REPORT', 20, 25);
      pdf.setTextColor(0, 0, 0);
      yPosition = 50;

      // Title
      addText(data.audit.document_title, 16, true);

      // Basic Information
      addText('AUDIT INFORMATION', 14, true);
      addText(`Entity Audited: ${data.audit.entity_audited}`);
      addText(`Fiscal Year: ${data.audit.fiscal_year}`);
      addText(`Region: ${data.audit.region}`);
      addText(`Source Type: ${data.audit.source_type.replace('_', ' ').toUpperCase()}`);
      addText(`Report Date: ${new Date(data.audit.created_at).toLocaleDateString()}`);
      
      if (data.audit.audit_score) {
        addText(`Audit Score: ${data.audit.audit_score}/100`);
      }
      
      yPosition += 10;

      // Tags
      if (data.audit.tags && data.audit.tags.length > 0) {
        addText('TAGS', 14, true);
        addText(`#${data.audit.tags.join(', #')}`);
        yPosition += 10;
      }

      // Summary
      addText('EXECUTIVE SUMMARY', 14, true);
      addText(data.audit.audit_summary);
      yPosition += 10;

      // Detailed Findings
      if (data.findings) {
        addText('DETAILED FINDINGS', 14, true);
        addText(data.findings);
        yPosition += 10;
      }

      // Recommendations
      if (data.recommendations && data.recommendations.length > 0) {
        addText('RECOMMENDATIONS', 14, true);
        data.recommendations.forEach((rec, index) => {
          addText(`${index + 1}. ${rec}`);
        });
        yPosition += 10;
      }

      // Statistics
      if (data.statistics) {
        addText('DOCUMENT STATISTICS', 14, true);
        addText(`Views: ${data.statistics.view_count.toLocaleString()}`);
        addText(`Downloads: ${data.statistics.download_count.toLocaleString()}`);
        addText(`Watching: ${data.statistics.watchlist_count.toLocaleString()}`);
        addText(`Comments: ${data.statistics.comment_count.toLocaleString()}`);
        yPosition += 10;
      }

      // Footer
      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${currentDate} from CamerPulse Audit Registry`, 20, pageHeight - 10);

      // Generate filename
      const filename = `audit-report-${data.audit.entity_audited.replace(/[^a-zA-Z0-9]/g, '-')}-${data.audit.fiscal_year}.pdf`;

      // Save the PDF
      pdf.save(filename);

      toast({
        title: "PDF Generated",
        description: `Audit report has been generated and downloaded as ${filename}`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateAuditSummary = async (audits: any[]): Promise<void> => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += fontSize * 0.6;
        });
        yPosition += 5;
      };

      // Header
      pdf.setFillColor(0, 123, 255);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AUDIT REGISTRY SUMMARY', 20, 25);
      pdf.setTextColor(0, 0, 0);
      yPosition = 50;

      // Summary Statistics
      addText('SUMMARY STATISTICS', 16, true);
      addText(`Total Audits: ${audits.length}`);
      
      const avgScore = audits
        .filter(a => a.audit_score)
        .reduce((sum, a) => sum + a.audit_score, 0) / audits.filter(a => a.audit_score).length;
      
      if (!isNaN(avgScore)) {
        addText(`Average Audit Score: ${avgScore.toFixed(1)}/100`);
      }

      // Group by entity
      const entitiesMap = new Map();
      audits.forEach(audit => {
        const entity = audit.entity_audited;
        if (!entitiesMap.has(entity)) {
          entitiesMap.set(entity, []);
        }
        entitiesMap.get(entity).push(audit);
      });

      addText(`Entities Audited: ${entitiesMap.size}`);
      yPosition += 10;

      // Top entities by audit count
      addText('TOP AUDITED ENTITIES', 14, true);
      const sortedEntities = Array.from(entitiesMap.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10);

      sortedEntities.forEach(([entity, entityAudits]) => {
        addText(`${entity}: ${entityAudits.length} audit${entityAudits.length !== 1 ? 's' : ''}`);
      });

      yPosition += 10;

      // Recent audits
      addText('RECENT AUDITS', 14, true);
      const recentAudits = audits
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      recentAudits.forEach(audit => {
        addText(`• ${audit.document_title} (${audit.entity_audited})`, 10);
        addText(`  ${new Date(audit.created_at).toLocaleDateString()}`, 9);
      });

      // Footer
      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${currentDate} from CamerPulse Audit Registry`, 20, pageHeight - 10);

      // Save the PDF
      const filename = `audit-registry-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "Summary Generated",
        description: `Audit registry summary has been generated and downloaded as ${filename}`,
      });

    } catch (error) {
      console.error('Error generating summary PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the summary PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    generateAuditReport,
    generateAuditSummary
  };
};