import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Image, Share2 } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createSecureExportContent } from '@/utils/secureDOM';

interface SenatorExportModalProps {
  senator: Senator;
  trigger?: React.ReactNode;
}

interface ExportOptions {
  includePhoto: boolean;
  includeContactInfo: boolean;
  includeBio: boolean;
  includePerformance: boolean;
  includeLegislation: boolean;
  includeRatings: boolean;
}

export const SenatorExportModal: React.FC<SenatorExportModalProps> = ({
  senator,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includePhoto: true,
    includeContactInfo: false,
    includeBio: true,
    includePerformance: true,
    includeLegislation: true,
    includeRatings: true
  });

  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const generatePDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      
      // Title
      pdf.setFontSize(18);
      pdf.text(`Senator Profile: ${senator.name}`, 20, yPosition);
      yPosition += 20;
      
      // Basic Info
      pdf.setFontSize(12);
      pdf.text(`Position: ${senator.position}`, 20, yPosition);
      yPosition += 10;
      
      if (senator.region) {
        pdf.text(`Region: ${senator.region}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (senator.political_party) {
        pdf.text(`Political Party: ${senator.political_party}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Performance metrics
      if (exportOptions.includePerformance) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.text('Performance Metrics', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        if (senator.performance_score) {
          pdf.text(`Performance Score: ${senator.performance_score}%`, 20, yPosition);
          yPosition += 8;
        }
        
        if (senator.transparency_score) {
          pdf.text(`Transparency Score: ${senator.transparency_score}%`, 20, yPosition);
          yPosition += 8;
        }
        
        if (senator.civic_engagement_score) {
          pdf.text(`Civic Engagement Score: ${senator.civic_engagement_score}%`, 20, yPosition);
          yPosition += 8;
        }
      }
      
      // Legislation
      if (exportOptions.includeLegislation) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.text('Legislative Activity', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        if (senator.bills_proposed_count) {
          pdf.text(`Bills Proposed: ${senator.bills_proposed_count}`, 20, yPosition);
          yPosition += 8;
        }
        
        if (senator.bills_passed_count) {
          pdf.text(`Bills Passed: ${senator.bills_passed_count}`, 20, yPosition);
          yPosition += 8;
        }
      }
      
      // Contact Info (if Pro access)
      if (exportOptions.includeContactInfo) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.text('Contact Information', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        if (senator.email) {
          pdf.text(`Email: ${senator.email}`, 20, yPosition);
          yPosition += 8;
        }
        
        if (senator.phone) {
          pdf.text(`Phone: ${senator.phone}`, 20, yPosition);
          yPosition += 8;
        }
        
        if (senator.official_senate_url) {
          pdf.text(`Official URL: ${senator.official_senate_url}`, 20, yPosition);
          yPosition += 8;
        }
      }
      
      // Add generation timestamp
      yPosition += 20;
      pdf.setFontSize(8);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
      pdf.text('Source: CamerPulse Senate Directory', 20, yPosition + 8);
      
      // Save PDF
      pdf.save(`senator-${senator.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    
    try {
      // Create secure content container
      const exportData = {
        name: senator.name || 'Unknown Senator',
        position: senator.position || 'Senator',
        region: senator.region,
        performanceMetrics: exportOptions.includePerformance ? {
          performanceScore: senator.performance_score,
          transparencyScore: senator.transparency_score,
          civicEngagementScore: senator.civic_engagement_score
        } : undefined,
        legislativeActivity: exportOptions.includeLegislation ? {
          billsProposed: senator.bills_proposed_count,
          billsPassed: senator.bills_passed_count
        } : undefined
      };

      const tempDiv = createSecureExportContent(exportData, {
        includePerformance: exportOptions.includePerformance,
        includeLegislation: exportOptions.includeLegislation
      });

      // Position for rendering
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      document.body.removeChild(tempDiv);
      
      // Download image
      const link = document.createElement('a');
      link.download = `senator-${senator.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Image exported successfully');
    } catch (error) {
      console.error('Image export error:', error);
      toast.error('Failed to export image');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const shareProfile = async () => {
    try {
      const shareData = {
        title: `Senator ${senator.name}`,
        text: `Check out the profile of Senator ${senator.name} from ${senator.region}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Profile URL copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share profile');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Senator Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Include in Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="photo"
                  checked={exportOptions.includePhoto}
                  onCheckedChange={(checked) => updateOption('includePhoto', !!checked)}
                />
                <label htmlFor="photo" className="text-sm">Profile Photo</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact"
                  checked={exportOptions.includeContactInfo}
                  onCheckedChange={(checked) => updateOption('includeContactInfo', !!checked)}
                />
                <label htmlFor="contact" className="text-sm">Contact Information (Pro)</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bio"
                  checked={exportOptions.includeBio}
                  onCheckedChange={(checked) => updateOption('includeBio', !!checked)}
                />
                <label htmlFor="bio" className="text-sm">Biography</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="performance"
                  checked={exportOptions.includePerformance}
                  onCheckedChange={(checked) => updateOption('includePerformance', !!checked)}
                />
                <label htmlFor="performance" className="text-sm">Performance Metrics</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legislation"
                  checked={exportOptions.includeLegislation}
                  onCheckedChange={(checked) => updateOption('includeLegislation', !!checked)}
                />
                <label htmlFor="legislation" className="text-sm">Legislative Activity</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ratings"
                  checked={exportOptions.includeRatings}
                  onCheckedChange={(checked) => updateOption('includeRatings', !!checked)}
                />
                <label htmlFor="ratings" className="text-sm">Citizen Ratings</label>
              </div>
            </CardContent>
          </Card>
          
          {/* Export Actions */}
          <div className="space-y-2">
            <Button
              onClick={generatePDF}
              disabled={isExporting}
              className="w-full"
              variant="default"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? 'Generating...' : 'Export as PDF'}
            </Button>
            
            <Button
              onClick={exportAsImage}
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              <Image className="h-4 w-4 mr-2" />
              {isExporting ? 'Generating...' : 'Export as Image'}
            </Button>
            
            <Button
              onClick={shareProfile}
              className="w-full"
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};