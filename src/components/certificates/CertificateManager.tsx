import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Award, 
  Download, 
  Eye, 
  Plus, 
  Settings, 
  Users, 
  CheckCircle, 
  Clock,
  UserCheck,
  FileText,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CertificateTemplate } from './CertificateTemplate';

interface CertificateData {
  id: string;
  event_id: string;
  user_id: string;
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
  event_name: string;
  event_date: string;
  civic_events?: {
    name: string;
    start_date: string;
  } | null;
}

interface CertificateManagerProps {
  eventId: string;
  eventName: string;
  isOrganizer?: boolean;
}

export const CertificateManager: React.FC<CertificateManagerProps> = ({
  eventId,
  eventName,
  isOrganizer = false
}) => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for new certificate
  const [newCertificate, setNewCertificate] = useState({
    certificate_type: 'participation' as const,
    template_design: 'modern' as const,
    recipient_name: '',
    recipient_role: 'Attendee',
    custom_text: ''
  });

  useEffect(() => {
    if (eventId) {
      fetchCertificates();
      fetchSettings();
    }
  }, [eventId]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('event_certificates')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(cert => ({
        ...cert,
        event_name: eventName,
        event_date: new Date().toISOString(),
        civic_events: null
      }));
      
      setCertificates(transformedData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('event_certificate_settings')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: any) => {
    try {
      const { data, error } = await supabase
        .from('event_certificate_settings')
        .upsert({
          event_id: eventId,
          ...newSettings
        });

      if (error) throw error;
      setSettings(newSettings);
      toast.success('Certificate settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const createCertificate = async () => {
    if (!newCertificate.recipient_name) {
      toast.error('Please enter recipient name');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('event_certificates')
        .insert({
          event_id: eventId,
          user_id: user?.id,
          certificate_type: newCertificate.certificate_type,
          certificate_status: 'issued',
          template_design: newCertificate.template_design,
          certificate_title: `Certificate of ${newCertificate.certificate_type} - ${eventName}`,
          recipient_name: newCertificate.recipient_name,
          recipient_role: newCertificate.recipient_role,
          organizer_name: 'CamerPulse',
          custom_text: newCertificate.custom_text,
          issued_by: user?.id
        });

      if (error) throw error;
      
      toast.success('Certificate created successfully');
      fetchCertificates();
      setNewCertificate({
        certificate_type: 'participation',
        template_design: 'modern',
        recipient_name: '',
        recipient_role: 'Attendee',
        custom_text: ''
      });
    } catch (error) {
      console.error('Error creating certificate:', error);
      toast.error('Failed to create certificate');
    } finally {
      setIsCreating(false);
    }
  };

  const previewCertificateData = (cert: CertificateData) => {
    const certificateData = {
      id: cert.id,
      certificate_title: cert.certificate_title,
      recipient_name: cert.recipient_name,
      recipient_role: cert.recipient_role,
      event_name: cert.event_name,
      event_date: cert.event_date,
      organizer_name: cert.organizer_name,
      verification_code: cert.verification_code,
      template_design: cert.template_design,
      custom_text: cert.custom_text || ''
    };
    
    setPreviewCertificate(certificateData);
    setShowPreview(true);
  };

  const deleteCertificate = async (certificateId: string) => {
    try {
      const { error } = await supabase
        .from('event_certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;
      
      toast.success('Certificate deleted');
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: 'secondary',
      issued: 'default',
      claimed: 'default',
      revoked: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading certificates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Event Certificates
          </CardTitle>
          <CardDescription>
            Manage certificates for {eventName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="certificates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              {isOrganizer && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="certificates" className="space-y-4">
              {isOrganizer && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {certificates.length} certificates issued
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Certificate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Certificate</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="recipient_name">Recipient Name</Label>
                          <Input
                            id="recipient_name"
                            value={newCertificate.recipient_name}
                            onChange={(e) => setNewCertificate(prev => 
                              ({ ...prev, recipient_name: e.target.value })
                            )}
                            placeholder="Enter full name"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="certificate_type">Certificate Type</Label>
                          <Select
                            value={newCertificate.certificate_type}
                            onValueChange={(value) => setNewCertificate(prev => 
                              ({ ...prev, certificate_type: value as any })
                            )}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="participation">Participation</SelectItem>
                              <SelectItem value="speaker">Speaker</SelectItem>
                              <SelectItem value="organizer">Organizer</SelectItem>
                              <SelectItem value="education_completion">Education Completion</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="recipient_role">Role</Label>
                          <Input
                            id="recipient_role"
                            value={newCertificate.recipient_role}
                            onChange={(e) => setNewCertificate(prev => 
                              ({ ...prev, recipient_role: e.target.value })
                            )}
                            placeholder="e.g., Attendee, Speaker"
                          />
                        </div>

                        <div>
                          <Label htmlFor="template_design">Template Design</Label>
                          <Select
                            value={newCertificate.template_design}
                            onValueChange={(value) => setNewCertificate(prev => 
                              ({ ...prev, template_design: value as any })
                            )}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">Modern</SelectItem>
                              <SelectItem value="classic">Classic</SelectItem>
                              <SelectItem value="official">Official</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="custom_text">Custom Message (Optional)</Label>
                          <Textarea
                            id="custom_text"
                            value={newCertificate.custom_text}
                            onChange={(e) => setNewCertificate(prev => 
                              ({ ...prev, custom_text: e.target.value })
                            )}
                            placeholder="Additional text for certificate"
                            rows={3}
                          />
                        </div>

                        <Button 
                          onClick={createCertificate} 
                          disabled={isCreating}
                          className="w-full"
                        >
                          {isCreating ? 'Creating...' : 'Create Certificate'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {certificates.map((certificate) => (
                    <Card key={certificate.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{certificate.recipient_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {certificate.recipient_role} • {certificate.certificate_type}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(certificate.certificate_status)}
                            <span className="text-xs text-muted-foreground">
                              {certificate.verification_code}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previewCertificateData(certificate)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          
                          {isOrganizer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCertificate(certificate.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {certificates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No certificates have been issued for this event yet.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {isOrganizer && (
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Certificate Settings</CardTitle>
                    <CardDescription>
                      Configure how certificates are issued for this event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="certificates_enabled">Enable Certificates</Label>
                        <div className="text-sm text-muted-foreground">
                          Allow certificates to be issued for this event
                        </div>
                      </div>
                      <Switch
                        id="certificates_enabled"
                        checked={settings?.certificates_enabled || false}
                        onCheckedChange={(checked) => 
                          updateSettings({ ...settings, certificates_enabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto_issue">Auto-Issue Certificates</Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically issue certificates to confirmed attendees
                        </div>
                      </div>
                      <Switch
                        id="auto_issue"
                        checked={settings?.auto_issue || false}
                        onCheckedChange={(checked) => 
                          updateSettings({ ...settings, auto_issue: checked })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="template_design">Default Template</Label>
                      <Select
                        value={settings?.template_design || 'modern'}
                        onValueChange={(value) => 
                          updateSettings({ ...settings, template_design: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="official">Official</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="certificate_message">Custom Message</Label>
                      <Textarea
                        id="certificate_message"
                        value={settings?.certificate_message || ''}
                        onChange={(e) => 
                          updateSettings({ ...settings, certificate_message: e.target.value })
                        }
                        placeholder="Custom message to include on certificates"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
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
                <Button>
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