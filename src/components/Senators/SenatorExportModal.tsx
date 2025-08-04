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
      // Create a temporary card element for the senator
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin-bottom: 10px; color: #1a1a1a;">${senator.name}</h1>
          <p style="font-size: 18px; color: #666; margin-bottom: 5px;">${senator.position}</p>
          ${senator.region ? `<p style="font-size: 16px; color: #888;">${senator.region}</p>` : ''}
        </div>
        
        ${exportOptions.includePerformance ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Performance Metrics</h3>
            ${senator.performance_score ? `<p>Performance Score: <strong>${senator.performance_score}%</strong></p>` : ''}
            ${senator.transparency_score ? `<p>Transparency Score: <strong>${senator.transparency_score}%</strong></p>` : ''}
            ${senator.civic_engagement_score ? `<p>Civic Engagement Score: <strong>${senator.civic_engagement_score}%</strong></p>` : ''}
          </div>
        ` : ''}
        
        ${exportOptions.includeLegislation ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Legislative Activity</h3>
            ${senator.bills_proposed_count ? `<p>Bills Proposed: <strong>${senator.bills_proposed_count}</strong></p>` : ''}
            ${senator.bills_passed_count ? `<p>Bills Passed: <strong>${senator.bills_passed_count}</strong></p>` : ''}
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          Generated from CamerPulse Senate Directory - ${new Date().toLocaleDateString()}
        </div>
      `;
      
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