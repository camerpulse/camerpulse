import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Settings, 
  DollarSign,
  Download,
  Ban,
  Shield,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ArtistApplication {
  id: string;
  stage_name: string;
  real_name: string;
  email?: string;
  phone_number?: string;
  region?: string;
  genres?: string[];
  application_status: string;
  payment_status: string;
  created_at: string;
  admin_notes?: string;
}

interface MembershipConfig {
  membership_fee: number;
  currency: string;
  payment_methods: string[];
  auto_approve_threshold: number;
  verification_required_fields: string[];
}

const ArtistManagement = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<ArtistApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [membershipConfig, setMembershipConfig] = useState<MembershipConfig>({
    membership_fee: 25000,
    currency: "FCFA",
    payment_methods: ["mobile_money", "card", "paypal", "crypto"],
    auto_approve_threshold: 0,
    verification_required_fields: ["profile_photo", "id_document", "bio_short"]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    fetchMembershipConfig();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('artist_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch applications"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_config')
        .select('*')
        .single();

      if (data) {
        setMembershipConfig({
          membership_fee: data.membership_fee,
          currency: data.currency,
          payment_methods: ["mobile_money", "card", "paypal", "crypto"],
          auto_approve_threshold: 0,
          verification_required_fields: ["profile_photo", "id_document", "bio_short"]
        });
      }
    } catch (error) {
      console.log("Using default config");
    }
  };

  const updateMembershipConfig = async () => {
    try {
      const { error } = await supabase
        .from('membership_config')
        .upsert({
          membership_fee: membershipConfig.membership_fee,
          currency: membershipConfig.currency,
          enabled_payment_methods: membershipConfig.payment_methods,
          auto_approve_threshold: membershipConfig.auto_approve_threshold,
          required_verification_fields: membershipConfig.verification_required_fields,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configuration Updated",
        description: "Membership settings have been saved"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update configuration"
      });
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('artist_applications')
        .update({
          application_status: 'approved',
          admin_notes: adminNotes,
          verified_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Generate artist membership entry
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        const { error: membershipError } = await supabase
          .from('artist_memberships')
          .insert({
            application_id: applicationId,
            real_name: application.real_name,
            stage_name: application.stage_name,
            artist_id_number: `CPA-${new Date().getFullYear()}-${Math.random().toString().substr(2, 6)}`
          });

        if (membershipError) throw membershipError;
      }

      toast({
        title: "Application Approved",
        description: "Artist ID card will be generated automatically"
      });

      fetchApplications();
      setSelectedApp(null);
      setAdminNotes("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve application"
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('artist_applications')
        .update({
          application_status: 'rejected',
          rejection_reason: rejectionReason,
          admin_notes: adminNotes
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "Rejection notification will be sent to the artist"
      });

      fetchApplications();
      setSelectedApp(null);
      setAdminNotes("");
      setRejectionReason("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject application"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'needs_changes':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Needs Changes</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Artist Applications</h3>
          <p className="text-muted-foreground">Review and manage artist registration applications</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="font-semibold">{app.stage_name}</h4>
                    {getStatusBadge(app.application_status)}
                    {getPaymentBadge(app.payment_status)}
                  </div>
                  <p className="text-muted-foreground">Real Name: {app.real_name}</p>
                  <p className="text-muted-foreground">Region: {app.region}</p>
                  <p className="text-muted-foreground">Genres: {app.genres?.join(", ")}</p>
                  <p className="text-sm text-muted-foreground">
                    Applied: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Application - {app.stage_name}</DialogTitle>
                        <DialogDescription>
                          Review application details and make approval decision
                        </DialogDescription>
                      </DialogHeader>
                      {selectedApp && (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Stage Name</Label>
                              <p>{selectedApp.stage_name}</p>
                            </div>
                            <div>
                              <Label>Real Name</Label>
                              <p>{selectedApp.real_name}</p>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <p>{selectedApp.email}</p>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <p>{selectedApp.phone_number}</p>
                            </div>
                          </div>

                          <div>
                            <Label>Admin Notes</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Internal notes about this application..."
                            />
                          </div>

                          {selectedApp.application_status === 'submitted' && (
                            <>
                              <div>
                                <Label>Rejection Reason (if rejecting)</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Reason for rejection (will be sent to artist)..."
                                />
                              </div>

                              <div className="flex gap-3">
                                <Button 
                                  onClick={() => handleApproveApplication(selectedApp.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRejectApplication(selectedApp.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                                <Button variant="outline">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Request Changes
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Membership Configuration</h3>
        <p className="text-muted-foreground">Configure artist membership settings and fees</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Membership Fee</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={membershipConfig.membership_fee}
                  onChange={(e) => setMembershipConfig(prev => ({
                    ...prev,
                    membership_fee: Number(e.target.value)
                  }))}
                />
                <Select
                  value={membershipConfig.currency}
                  onValueChange={(value) => setMembershipConfig(prev => ({
                    ...prev,
                    currency: value
                  }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCFA">FCFA</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Payment Methods</Label>
              <div className="space-y-2 mt-2">
                {[
                  { key: "mobile_money", label: "Mobile Money (MTN/Orange)" },
                  { key: "card", label: "Credit/Debit Cards" },
                  { key: "paypal", label: "PayPal" },
                  { key: "crypto", label: "Cryptocurrency" }
                ].map(method => (
                  <div key={method.key} className="flex items-center space-x-2">
                    <Switch
                      checked={membershipConfig.payment_methods.includes(method.key)}
                      onCheckedChange={(checked) => {
                        setMembershipConfig(prev => ({
                          ...prev,
                          payment_methods: checked
                            ? [...prev.payment_methods, method.key]
                            : prev.payment_methods.filter(m => m !== method.key)
                        }));
                      }}
                    />
                    <Label>{method.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Verification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Auto-Approve Threshold (Score)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={membershipConfig.auto_approve_threshold}
                onChange={(e) => setMembershipConfig(prev => ({
                  ...prev,
                  auto_approve_threshold: Number(e.target.value)
                }))}
              />
              <p className="text-sm text-muted-foreground">
                Applications with scores above this will be auto-approved (0 = manual only)
              </p>
            </div>

            <div>
              <Label>Required Verification Fields</Label>
              <div className="space-y-2 mt-2">
                {[
                  { key: "profile_photo", label: "Profile Photo" },
                  { key: "id_document", label: "ID Document" },
                  { key: "bio_short", label: "Short Bio" },
                  { key: "bio_full", label: "Full Bio" },
                  { key: "social_media", label: "Social Media Links" }
                ].map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Switch
                      checked={membershipConfig.verification_required_fields.includes(field.key)}
                      onCheckedChange={(checked) => {
                        setMembershipConfig(prev => ({
                          ...prev,
                          verification_required_fields: checked
                            ? [...prev.verification_required_fields, field.key]
                            : prev.verification_required_fields.filter(f => f !== field.key)
                        }));
                      }}
                    />
                    <Label>{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={updateMembershipConfig}>
          Save Configuration
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Artist Management</h2>
        <p className="text-muted-foreground">
          Manage artist applications, verification, and membership settings
        </p>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">
            <Users className="w-4 h-4 mr-2" />
            Applications ({applications.filter(app => app.application_status === 'submitted').length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            <Shield className="w-4 h-4 mr-2" />
            Verified Artists
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          {renderApplicationsTab()}
        </TabsContent>

        <TabsContent value="verified">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Verified artists management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="configuration">
          {renderConfigurationTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistManagement;