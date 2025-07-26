import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import type { Village } from '@/hooks/useVillages';

export interface VillageTransparencyData {
  village: Village;
  transparencyData: {
    projectCompletionRate: number;
    corruptionReportsCount: number;
    verifiedCorruptionCount: number;
    citizenSatisfactionScore: number;
    transparencyScore: number;
    developmentProgressScore: number;
    civicEngagementScore: number;
    officialPerformanceScore: number;
    overallReputationScore: number;
    reputationBadge: string;
    recentProjects?: any[];
    recentVotes?: any[];
    corruptionReports?: any[];
  };
}

export const useVillageTransparencyPDF = () => {
  const { toast } = useToast();

  const generateTransparencyReport = async (data: VillageTransparencyData): Promise<void> => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color[0], color[1], color[2]);
        
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
        pdf.setTextColor(0, 0, 0); // Reset to black
      };

      // Helper function to add section header
      const addSectionHeader = (title: string) => {
        yPosition += 10;
        pdf.setFillColor(46, 125, 50); // Green background
        pdf.rect(20, yPosition - 8, pageWidth - 40, 16, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 25, yPosition + 2);
        pdf.setTextColor(0, 0, 0);
        yPosition += 20;
      };

      // Helper function to add score with colored indicator
      const addScore = (label: string, score: number, maxScore = 10) => {
        const percentage = (score / maxScore) * 100;
        const color = percentage >= 80 ? [46, 125, 50] : percentage >= 60 ? [255, 152, 0] : [244, 67, 54];
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${label}:`, 25, yPosition);
        
        // Score text
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${score}/${maxScore} (${percentage.toFixed(1)}%)`, 120, yPosition);
        
        // Progress bar
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(25, yPosition + 3, 100, 4);
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(25, yPosition + 3, (percentage / 100) * 100, 4, 'F');
        
        pdf.setTextColor(0, 0, 0);
        yPosition += 12;
      };

      // Header with Cameroon colors
      pdf.setFillColor(0, 122, 51); // Green
      pdf.rect(0, 0, pageWidth / 3, 50, 'F');
      pdf.setFillColor(206, 17, 38); // Red  
      pdf.rect(pageWidth / 3, 0, pageWidth / 3, 50, 'F');
      pdf.setFillColor(252, 209, 22); // Yellow
      pdf.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 50, 'F');

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VILLAGE TRANSPARENCY REPORT', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(data.village.village_name.toUpperCase(), pageWidth / 2, 35, { align: 'center' });

      pdf.setTextColor(0, 0, 0);
      yPosition = 65;

      // Village Basic Information
      addSectionHeader('VILLAGE INFORMATION');
      addText(`Village Name: ${data.village.village_name}`, 12, true);
      addText(`Region: ${data.village.region}`);
      addText(`Division: ${data.village.division}`);
      addText(`Subdivision: ${data.village.subdivision}`);
      addText(`Population Estimate: ${data.village.population_estimate?.toLocaleString() || 'Not Available'}`);
      addText(`Verification Status: ${data.village.is_verified ? 'Verified Village' : 'Pending Verification'}`);
      addText(`Total Ratings: ${data.village.total_ratings_count} citizen ratings`);

      // Overall Transparency Summary
      addSectionHeader('TRANSPARENCY SCORECARD');
      
      // Overall reputation with badge
      const badge = data.transparencyData.reputationBadge;
      addText(`Overall Reputation: ${data.transparencyData.overallReputationScore.toFixed(1)}/100 (${badge.toUpperCase()})`, 14, true, [46, 125, 50]);
      
      yPosition += 5;
      addScore('Transparency Score', data.transparencyData.transparencyScore, 100);
      addScore('Development Progress', data.transparencyData.developmentProgressScore, 100);
      addScore('Civic Engagement', data.transparencyData.civicEngagementScore, 100);
      addScore('Official Performance', data.transparencyData.officialPerformanceScore, 100);
      addScore('Citizen Satisfaction', data.transparencyData.citizenSatisfactionScore, 100);

      // Detailed Metrics
      addSectionHeader('DEVELOPMENT METRICS');
      addScore('Infrastructure Development', data.village.infrastructure_score);
      addScore('Education Quality', data.village.education_score);
      addScore('Health Services', data.village.health_score);
      addScore('Economic Activity', data.village.economic_activity_score);
      addScore('Peace & Security', data.village.peace_security_score);

      // Community Metrics
      addSectionHeader('COMMUNITY ENGAGEMENT');
      addScore('Social Spirit', data.village.social_spirit_score);
      addScore('Diaspora Engagement', data.village.diaspora_engagement_score);
      addScore('Civic Participation', data.village.civic_participation_score);
      addScore('Achievements Score', data.village.achievements_score);
      addScore('Governance Quality', data.village.governance_score);

      // Project & Accountability Metrics
      addSectionHeader('ACCOUNTABILITY METRICS');
      addText(`Project Completion Rate: ${data.transparencyData.projectCompletionRate.toFixed(1)}%`, 12, true);
      addText(`Corruption Reports Filed: ${data.transparencyData.corruptionReportsCount}`);
      addText(`Verified Corruption Cases: ${data.transparencyData.verifiedCorruptionCount}`);
      
      if (data.transparencyData.corruptionReportsCount > 0) {
        const corruptionRate = (data.transparencyData.verifiedCorruptionCount / data.transparencyData.corruptionReportsCount) * 100;
        addText(`Corruption Verification Rate: ${corruptionRate.toFixed(1)}%`);
      }

      // Performance Analysis
      addSectionHeader('PERFORMANCE ANALYSIS');
      
      // Calculate averages for comparison
      const avgInfrastructure = (data.village.infrastructure_score / 10) * 100;
      const avgEducation = (data.village.education_score / 10) * 100;
      const avgHealth = (data.village.health_score / 10) * 100;
      const avgGovernance = (data.village.governance_score / 10) * 100;

      addText('Strengths:', 12, true, [46, 125, 50]);
      const strengths = [];
      if (avgInfrastructure >= 80) strengths.push('Excellent infrastructure development');
      if (avgEducation >= 80) strengths.push('High-quality education services');
      if (avgHealth >= 80) strengths.push('Strong healthcare system');
      if (avgGovernance >= 80) strengths.push('Effective governance');
      if (data.village.is_verified) strengths.push('Verified village status');

      if (strengths.length === 0) {
        addText('• Village shows potential for growth across multiple sectors');
      } else {
        strengths.forEach(strength => addText(`• ${strength}`));
      }

      yPosition += 5;
      addText('Areas for Improvement:', 12, true, [255, 152, 0]);
      const improvements = [];
      if (avgInfrastructure < 60) improvements.push('Infrastructure development needs attention');
      if (avgEducation < 60) improvements.push('Education quality requires improvement');
      if (avgHealth < 60) improvements.push('Healthcare services need enhancement');
      if (avgGovernance < 60) improvements.push('Governance effectiveness needs strengthening');
      if (data.village.civic_participation_score < 6) improvements.push('Civic participation could be increased');

      if (improvements.length === 0) {
        addText('• Village demonstrates strong performance across all metrics');
      } else {
        improvements.forEach(improvement => addText(`• ${improvement}`));
      }

      // Recommendations
      addSectionHeader('RECOMMENDATIONS');
      addText('Based on the transparency analysis, we recommend:', 12, true);
      
      const recommendations = [
        'Continue monitoring and reporting on development projects',
        'Maintain transparent communication with citizens',
        'Encourage increased civic participation in village affairs',
        'Implement regular community feedback mechanisms',
        'Pursue verification if not yet achieved',
        'Focus on areas with lower scores for targeted improvement'
      ];

      recommendations.forEach(rec => addText(`• ${rec}`));

      // Data Sources and Methodology
      addSectionHeader('METHODOLOGY & DATA SOURCES');
      addText('This transparency report is generated based on:', 12, true);
      addText('• Citizen ratings and feedback collected through the CamerPulse platform');
      addText('• Community-reported development metrics and infrastructure assessments');
      addText('• Civic engagement data from village participation records');
      addText('• Governance quality indicators from community evaluations');
      addText('• Verification status from official village registration processes');
      
      yPosition += 10;
      addText('Scoring Methodology:', 12, true);
      addText('• All scores are rated on a scale of 0-10 based on community input');
      addText('• Transparency score is calculated from governance and civic participation metrics');
      addText('• Overall reputation combines all metrics with weighted importance');
      addText('• Data is continuously updated as new community feedback is received');

      // Footer
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, pageHeight - 30, pageWidth, 30, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by CamerPulse - Village Transparency Initiative', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.text(`Report generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text(`Village ID: ${data.village.id}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Generate filename
      const filename = `transparency-report-${data.village.village_name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Save the PDF
      pdf.save(filename);

      toast({
        title: "Transparency Report Generated",
        description: `Village transparency report has been generated and downloaded as ${filename}`,
      });

    } catch (error) {
      console.error('Error generating transparency report:', error);
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating the transparency report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    generateTransparencyReport
  };
};