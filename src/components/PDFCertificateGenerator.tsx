import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Award, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFCertificateGeneratorProps {
  type: 'bid_receipt' | 'award_certificate' | 'participation_certificate';
  data: {
    tenderId: string;
    tenderTitle: string;
    bidderName: string;
    bidAmount?: number;
    currency?: string;
    submissionDate: string;
    awardDate?: string;
    certificateNumber: string;
  };
}

export default function PDFCertificateGenerator({ type, data }: PDFCertificateGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = (data: string) => {
    // In a real implementation, use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data)}`;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, use a PDF library like jsPDF or react-pdf
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const element = document.getElementById(`certificate-${data.certificateNumber}`);
      if (!element) throw new Error('Certificate element not found');

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${type}_${data.certificateNumber}.pdf`;
      pdf.save(filename);

      toast({
        title: "Certificate Generated",
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsGenerating(false);
  };

  const getCertificateTitle = () => {
    switch (type) {
      case 'bid_receipt':
        return 'Bid Submission Receipt';
      case 'award_certificate':
        return 'Tender Award Certificate';
      case 'participation_certificate':
        return 'Tender Participation Certificate';
      default:
        return 'Certificate';
    }
  };

  const getCertificateIcon = () => {
    switch (type) {
      case 'bid_receipt':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'award_certificate':
        return <Award className="w-8 h-8 text-yellow-600" />;
      case 'participation_certificate':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  const getCertificateColor = () => {
    switch (type) {
      case 'bid_receipt':
        return 'border-blue-200 bg-blue-50';
      case 'award_certificate':
        return 'border-yellow-200 bg-yellow-50';
      case 'participation_certificate':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const verificationUrl = `https://camertenders.com/verify/${data.certificateNumber}`;
  const qrCodeUrl = generateQRCode(verificationUrl);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Certificate Preview
            <Button onClick={generatePDF} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </CardTitle>
          <CardDescription>
            Preview of your {getCertificateTitle().toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Certificate Template */}
          <div 
            id={`certificate-${data.certificateNumber}`}
            className={`p-8 border-2 rounded-lg ${getCertificateColor()} print:border-0 print:shadow-none`}
            style={{ minHeight: '600px', fontFamily: 'serif' }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {getCertificateIcon()}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                CamerTenders
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Republic of Cameroon - Digital Tender Platform
              </p>
              <hr className="border-gray-300 mx-auto w-1/2" />
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {getCertificateTitle()}
              </h2>
              
              {type === 'award_certificate' && (
                <p className="text-lg text-gray-700 mb-4">
                  This is to certify that
                </p>
              )}
              
              <div className="text-xl font-semibold text-gray-800 bg-white p-4 rounded-lg shadow-sm border">
                {data.bidderName}
              </div>
            </div>

            {/* Certificate Content */}
            <div className="space-y-6 mb-8">
              {type === 'bid_receipt' && (
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    has successfully submitted a bid for the tender:
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-800">{data.tenderTitle}</h3>
                    <p className="text-gray-600 mt-2">Tender ID: {data.tenderId}</p>
                    {data.bidAmount && (
                      <p className="text-gray-600">
                        Bid Amount: {data.bidAmount.toLocaleString()} {data.currency}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {type === 'award_certificate' && (
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    has been awarded the contract for:
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-800">{data.tenderTitle}</h3>
                    <p className="text-gray-600 mt-2">Tender ID: {data.tenderId}</p>
                    {data.bidAmount && (
                      <p className="text-gray-600">
                        Contract Value: {data.bidAmount.toLocaleString()} {data.currency}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {type === 'participation_certificate' && (
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    participated in the tender process for:
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-800">{data.tenderTitle}</h3>
                    <p className="text-gray-600 mt-2">Tender ID: {data.tenderId}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Submission Date</p>
                  <p className="font-semibold">{new Date(data.submissionDate).toLocaleDateString()}</p>
                </div>
                {data.awardDate && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Award Date</p>
                    <p className="font-semibold">{new Date(data.awardDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div>
                <div className="mb-4">
                  <img src={qrCodeUrl} alt="Verification QR Code" className="w-20 h-20" />
                  <p className="text-xs text-gray-600 mt-1">Scan to verify</p>
                </div>
                <p className="text-xs text-gray-600">
                  Certificate No: {data.certificateNumber}
                </p>
                <p className="text-xs text-gray-600">
                  Generated on: {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="text-right">
                <div className="border-t border-gray-400 pt-2 w-48">
                  <p className="text-sm font-semibold">Digital Signature</p>
                  <p className="text-xs text-gray-600">CamerTenders Platform</p>
                </div>
              </div>
            </div>

            {/* Digital Verification Notice */}
            <div className="mt-8 text-center">
              <Badge variant="outline" className="text-xs">
                This is a digitally generated certificate. Verify authenticity at: {verificationUrl}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}