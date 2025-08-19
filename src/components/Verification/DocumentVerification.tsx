import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface DocumentVerificationProps {
  userId?: string;
  verificationType: 'identity' | 'address' | 'income' | 'education' | 'medical';
  onVerificationComplete?: (status: string) => void;
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  userId,
  verificationType,
  onVerificationComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const { toast } = useToast();

  const documentTypes = {
    identity: ['National ID', 'Passport', 'Voter Card', 'Driver License'],
    address: ['Utility Bill', 'Bank Statement', 'Rental Agreement', 'Tax Notice'],
    income: ['Salary Slip', 'Bank Statement', 'Tax Return', 'Employment Letter'],
    education: ['Diploma', 'Certificate', 'Transcript', 'Degree'],
    medical: ['Medical Certificate', 'Health Card', 'Insurance Card', 'Prescription']
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing information",
        description: "Please select a file and document type",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Simulate upload and verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationStatus('pending');
      toast({
        title: "Document uploaded",
        description: "Your document is being reviewed. You'll be notified within 24 hours.",
      });
      
      onVerificationComplete?.('pending');
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {verificationType.charAt(0).toUpperCase() + verificationType.slice(1)} Verification
        </CardTitle>
        <CardDescription>
          Upload documents to verify your {verificationType} information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {verificationStatus && (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(verificationStatus)}
              <div>
                <p className="font-medium">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  {verificationStatus === 'pending' && 'Under review'}
                  {verificationStatus === 'approved' && 'Approved and verified'}
                  {verificationStatus === 'rejected' && 'Additional information required'}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(verificationStatus)}>
              {verificationStatus.toUpperCase()}
            </Badge>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes[verificationType]?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Upload Document</Label>
            <div className="mt-2 flex items-center space-x-4">
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Document Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Clear, high-quality image or PDF</li>
              <li>• All corners and text must be visible</li>
              <li>• Document must be valid and not expired</li>
              <li>• File size must be under 5MB</li>
            </ul>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !documentType || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};