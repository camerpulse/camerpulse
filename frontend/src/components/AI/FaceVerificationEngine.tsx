import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Image,
  User,
  Shield,
  RefreshCw,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Upload,
  Search,
  Filter
} from 'lucide-react';

interface VerificationItem {
  id: string;
  image_url?: string;
  verification_status: string;
  confidence_score: number;
  created_at: string;
  admin_reviewed: boolean;
  flagged_by_users: string[];
  politicians?: { name: string; position: string; region: string };
  political_parties?: { name: string; description: string };
}

interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  flagged: number;
  missing: number;
}

export const FaceVerificationEngine: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<{
    politicians: VerificationItem[];
    logos: VerificationItem[];
  }>({ politicians: [], logos: [] });
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    verified: 0,
    pending: 0,
    flagged: 0,
    missing: 0
  });
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadVerificationData();
    loadStats();
  }, []);

  const loadVerificationData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('face-verification-engine', {
        body: { action: 'get_pending' }
      });

      if (error) throw error;

      setPendingVerifications(data);
    } catch (error) {
      console.error('Error loading verification data:', error);
      toast({
        title: "Error",
        description: "Failed to load verification data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load politician verification stats
      const { data: politicianStats } = await supabase
        .from('politicians')
        .select('image_verified, image_confidence_score');

      const verified = politicianStats?.filter(p => p.image_verified).length || 0;
      const total = politicianStats?.length || 0;
      const pending = total - verified;

      setStats({
        total,
        verified,
        pending,
        flagged: 0, // Will be calculated from verification records
        missing: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const verifyIndividualImage = async (entityId: string, entityType: 'politician' | 'party', imageUrl?: string) => {
    setLoading(true);
    try {
      const action = entityType === 'politician' ? 'verify_politician' : 'verify_party_logo';
      
      const { data, error } = await supabase.functions.invoke('face-verification-engine', {
        body: {
          action,
          entityId,
          imageUrl,
          adminNotes
        }
      });

      if (error) throw error;

      toast({
        title: "Verification Complete",
        description: `${data.status === 'verified' ? 'Verified' : 'Flagged'} with ${data.confidence}% confidence`,
        variant: data.status === 'verified' ? 'default' : 'destructive'
      });

      loadVerificationData();
      loadStats();
      setSelectedItem(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error verifying image:', error);
      toast({
        title: "Error",
        description: "Failed to verify image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runBulkVerification = async () => {
    setBulkProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('face-verification-engine', {
        body: { action: 'bulk_verify' }
      });

      if (error) throw error;

      toast({
        title: "Bulk Verification Complete",
        description: `Processed ${data.processed} entities`
      });

      loadVerificationData();
      loadStats();
    } catch (error) {
      console.error('Error running bulk verification:', error);
      toast({
        title: "Error",
        description: "Failed to run bulk verification",
        variant: "destructive"
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const approveVerification = async (verificationId: string, entityType: 'politician' | 'party') => {
    try {
      const table = entityType === 'politician' ? 'politician_image_verifications' : 'party_logo_verifications';
      
      const { error } = await supabase
        .from(table)
        .update({
          verification_status: 'verified',
          admin_reviewed: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Approved",
        description: "Verification has been approved"
      });

      loadVerificationData();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive"
      });
    }
  };

  const rejectVerification = async (verificationId: string, entityType: 'politician' | 'party') => {
    try {
      const table = entityType === 'politician' ? 'politician_image_verifications' : 'party_logo_verifications';
      
      const { error } = await supabase
        .from(table)
        .update({
          verification_status: 'rejected',
          admin_reviewed: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Verification has been rejected"
      });

      loadVerificationData();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const VerificationCard = ({ item, entityType }: { item: VerificationItem; entityType: 'politician' | 'party' }) => {
    const entity = item.politicians || item.political_parties;
    
    return (
      <Card className="hover:shadow-elegant transition-all cursor-pointer" 
            onClick={() => setSelectedItem(item)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {entityType === 'politician' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              <div>
                <h3 className="font-semibold text-sm">{entity?.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {entityType === 'politician' 
                    ? `${item.politicians?.position} - ${item.politicians?.region}`
                    : item.political_parties?.description
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(item.verification_status)}
              <Badge className={getStatusColor(item.verification_status)}>
                {item.verification_status}
              </Badge>
            </div>
          </div>

          {item.image_url && (
            <div className="mb-3">
              <img 
                src={item.image_url} 
                alt={entity?.name}
                className="w-16 h-16 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Confidence: {item.confidence_score || 0}%</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>

          {item.flagged_by_users?.length > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                <Flag className="w-3 h-3 mr-1" />
                {item.flagged_by_users.length} user flags
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const filteredPoliticians = pendingVerifications.politicians.filter(item => {
    const matchesSearch = !searchQuery || 
      item.politicians?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLogos = pendingVerifications.logos.filter(item => {
    const matchesSearch = !searchQuery || 
      item.political_parties?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Face Verification Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="w-4 h-4" />
            <AlertDescription>
              Automated face verification system to ensure authentic politician photos and party logos.
              High confidence scores indicate better verification quality.
            </AlertDescription>
          </Alert>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Flag className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={runBulkVerification}
              disabled={bulkProcessing}
              className="flex items-center gap-2"
            >
              {bulkProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {bulkProcessing ? 'Processing...' : 'Run Bulk Verification'}
            </Button>
            
            <Button variant="outline" onClick={loadVerificationData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {bulkProcessing && (
            <div className="mb-6">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">Processing verification requests...</p>
            </div>
          )}

          <Tabs defaultValue="politicians">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="politicians">
                Politicians ({filteredPoliticians.length})
              </TabsTrigger>
              <TabsTrigger value="logos">
                Party Logos ({filteredLogos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="politicians" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPoliticians.map((item) => (
                  <VerificationCard key={item.id} item={item} entityType="politician" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLogos.map((item) => (
                  <VerificationCard key={item.id} item={item} entityType="party" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Detail Modal */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Verification Details</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Entity Information</h3>
                <p><strong>Name:</strong> {selectedItem.politicians?.name || selectedItem.political_parties?.name}</p>
                <p><strong>Type:</strong> {selectedItem.politicians ? 'Politician' : 'Party'}</p>
                {selectedItem.politicians && (
                  <>
                    <p><strong>Position:</strong> {selectedItem.politicians.position}</p>
                    <p><strong>Region:</strong> {selectedItem.politicians.region}</p>
                  </>
                )}
                <p><strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedItem.verification_status)}`}>
                    {selectedItem.verification_status}
                  </Badge>
                </p>
                <p><strong>Confidence:</strong> {selectedItem.confidence_score || 0}%</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Current Image</h3>
                {selectedItem.image_url ? (
                  <img 
                    src={selectedItem.image_url} 
                    alt="Current"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Replace Image URL (optional)</label>
              <Input
                placeholder="https://example.com/new-image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Admin Notes</label>
              <Textarea
                placeholder="Add verification notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => approveVerification(selectedItem.id, selectedItem.politicians ? 'politician' : 'party')}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => rejectVerification(selectedItem.id, selectedItem.politicians ? 'politician' : 'party')}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </Button>
              
              <Button
                variant="outline"
                onClick={() => verifyIndividualImage(
                  selectedItem.politicians?.name || selectedItem.political_parties?.name || '',
                  selectedItem.politicians ? 'politician' : 'party',
                  newImageUrl || selectedItem.image_url
                )}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" />
                Re-verify
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};