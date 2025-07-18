import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Award, 
  Download, 
  Eye, 
  Share2, 
  Search,
  Calendar,
  Trophy,
  FileText,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CertificateTemplate } from './CertificateTemplate';
import { format } from 'date-fns';

interface UserCertificate {
  id: string;
  event_id: string;
  certificate_type: string;
  certificate_status: string;
  template_design: 'modern' | 'classic' | 'official';
  certificate_title: string;
  recipient_name: string;
  recipient_role: string;
  organizer_name: string;
  verification_code: string;
  custom_text?: string;
  issued_at: string;
  download_count: number;
  civic_events?: {
    name: string;
    start_date: string;
    venue_name?: string;
  } | null;
}

export const UserCertificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserCertificates();
    }
  }, [user]);

  const fetchUserCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates((data || []).map(cert => ({
        ...cert,
        civic_events: null
      })));
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.certificate_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.recipient_role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCertificates = {
    participation: filteredCertificates.filter(c => c.certificate_type === 'participation'),
    speaker: filteredCertificates.filter(c => c.certificate_type === 'speaker'),
    organizer: filteredCertificates.filter(c => c.certificate_type === 'organizer'),
    education_completion: filteredCertificates.filter(c => c.certificate_type === 'education_completion')
  };

  const previewCertificateData = (cert: UserCertificate) => {
    const certificateData = {
      id: cert.id,
      certificate_title: cert.certificate_title,
      recipient_name: cert.recipient_name,
      recipient_role: cert.recipient_role,
      event_name: 'Event Name',
      event_date: new Date().toISOString(),
      organizer_name: cert.organizer_name,
      verification_code: cert.verification_code,
      template_design: cert.template_design,
      custom_text: cert.custom_text
    };
    
    setPreviewCertificate(certificateData);
    setShowPreview(true);
  };

  const downloadCertificate = async (certificateId: string) => {
    try {
      // Update download count
      const { error } = await supabase
        .from('event_certificates')
        .update({ 
          download_count: certificates.find(c => c.id === certificateId)?.download_count + 1 || 1,
          downloaded_at: new Date().toISOString()
        })
        .eq('id', certificateId);

      if (error) throw error;
      
      toast.success('Certificate download started');
      // Here you would implement actual PDF generation/download
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async (certificate: UserCertificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate?code=${certificate.verification_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificate.certificate_title,
          text: `Check out my certificate`,
          url: shareUrl
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Certificate link copied to clipboard');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Certificate link copied to clipboard');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      issued: 'default',
      claimed: 'default',
      revoked: 'destructive'
    };
    const variant = variants[status as keyof typeof variants] as "default" | "secondary" | "destructive";
    return <Badge variant={variant || 'secondary'}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speaker':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'organizer':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'education_completion':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <Award className="w-5 h-5 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading your certificates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            My Certificates
          </CardTitle>
          <CardDescription>
            View and manage your civic event certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {certificates.length} total certificates
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({filteredCertificates.length})</TabsTrigger>
              <TabsTrigger value="participation">Participation ({groupedCertificates.participation.length})</TabsTrigger>
              <TabsTrigger value="speaker">Speaker ({groupedCertificates.speaker.length})</TabsTrigger>
              <TabsTrigger value="organizer">Organizer ({groupedCertificates.organizer.length})</TabsTrigger>
              <TabsTrigger value="education">Education ({groupedCertificates.education_completion.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <CertificateList 
                certificates={filteredCertificates}
                onPreview={previewCertificateData}
                onDownload={downloadCertificate}
                onShare={shareCertificate}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            </TabsContent>

            <TabsContent value="participation" className="space-y-4">
              <CertificateList 
                certificates={groupedCertificates.participation}
                onPreview={previewCertificateData}
                onDownload={downloadCertificate}
                onShare={shareCertificate}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            </TabsContent>

            <TabsContent value="speaker" className="space-y-4">
              <CertificateList 
                certificates={groupedCertificates.speaker}
                onPreview={previewCertificateData}
                onDownload={downloadCertificate}
                onShare={shareCertificate}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            </TabsContent>

            <TabsContent value="organizer" className="space-y-4">
              <CertificateList 
                certificates={groupedCertificates.organizer}
                onPreview={previewCertificateData}
                onDownload={downloadCertificate}
                onShare={shareCertificate}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <CertificateList 
                certificates={groupedCertificates.education_completion}
                onPreview={previewCertificateData}
                onDownload={downloadCertificate}
                onShare={shareCertificate}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Certificate Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {previewCertificate && (
            <div className="space-y-4">
              <CertificateTemplate certificate={previewCertificate} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadCertificate(previewCertificate.id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CertificateListProps {
  certificates: UserCertificate[];
  onPreview: (cert: UserCertificate) => void;
  onDownload: (id: string) => void;
  onShare: (cert: UserCertificate) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getTypeIcon: (type: string) => React.ReactNode;
}

const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  onPreview,
  onDownload,
  onShare,
  getStatusBadge,
  getTypeIcon
}) => {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No certificates found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((certificate) => (
        <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(certificate.certificate_type)}
                <div className="text-sm font-medium capitalize">
                  {certificate.certificate_type.replace('_', ' ')}
                </div>
              </div>
              {getStatusBadge(certificate.certificate_status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold truncate" title={certificate.certificate_title}>
                {certificate.certificate_title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {certificate.recipient_role}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(certificate.issued_at), 'MMM dd, yyyy')}
              </span>
            </div>

            <div className="text-xs text-muted-foreground font-mono">
              {certificate.verification_code}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(certificate)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(certificate.id)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(certificate)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};