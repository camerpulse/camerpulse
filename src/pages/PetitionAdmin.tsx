import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  MessageSquare,
  Flag,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Mail,
  Download,
  Calendar
} from 'lucide-react';

interface Petition {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  target_institution: string;
  goal_signatures: number;
  current_signatures: number;
  location: string;
  created_at: string;
  deadline: string;
  creator_id: string;
}

interface PetitionStats {
  total: number;
  pending: number;
  active: number;
  closed: number;
  totalSignatures: number;
}

export default function PetitionAdmin() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [stats, setStats] = useState<PetitionStats>({
    total: 0,
    pending: 0, 
    active: 0,
    closed: 0,
    totalSignatures: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPetitions();
    fetchStats();
  }, []);

  const fetchPetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPetitions(data || []);
    } catch (error) {
      console.error('Error fetching petitions:', error);
      toast({
        title: "Error",
        description: "Failed to load petitions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: petitionData } = await supabase
        .from('petitions')
        .select('status, current_signatures');

      if (petitionData) {
        const stats = petitionData.reduce((acc, petition) => {
          acc.total++;
          acc[petition.status as keyof typeof acc]++;
          acc.totalSignatures += petition.current_signatures || 0;
          return acc;
        }, {
          total: 0,
          pending: 0,
          active: 0,
          closed: 0,
          totalSignatures: 0
        });
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePetitionAction = async (petitionId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      const newStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'suspended';
      
      const { error } = await supabase
        .from('petitions')
        .update({ status: newStatus })
        .eq('id', petitionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Petition ${action}d successfully`,
      });

      fetchPetitions();
      fetchStats();
      setSelectedPetition(null);
    } catch (error) {
      console.error(`Error ${action}ing petition:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} petition`,
        variant: "destructive",
      });
    }
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    // Mock export functionality
    toast({
      title: "Export Started",
      description: `Exporting petition data as ${format.toUpperCase()}...`,
    });
  };

  const filteredPetitions = petitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || petition.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Petition Administration</h1>
          <p className="text-muted-foreground">Manage petitions, monitor activity, and moderate content</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Petitions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Signatures</p>
                  <p className="text-2xl font-bold">{stats.totalSignatures.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Flag className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="petitions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="petitions">Petitions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="petitions" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search petitions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => exportData('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Petitions List */}
            <div className="space-y-4">
              {filteredPetitions.map((petition) => (
                <Card key={petition.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{petition.title}</h3>
                          <Badge variant={
                            petition.status === 'active' ? 'default' :
                            petition.status === 'pending' ? 'secondary' :
                            petition.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {petition.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {petition.description}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>📍 {petition.location}</span>
                          <span>🎯 {petition.target_institution}</span>
                          <span>✍️ {petition.current_signatures} / {petition.goal_signatures} signatures</span>
                          <span>📅 {new Date(petition.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/petitions/${petition.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {petition.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePetitionAction(petition.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePetitionAction(petition.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Petition Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Track petition performance, signature trends, and regional analytics
                  </p>
                  <Button>View Detailed Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Flag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Moderation Queue</h3>
                  <p className="text-muted-foreground mb-4">
                    Review reported content, moderate comments, and manage user reports
                  </p>
                  <Button>Open Moderation Queue</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notification Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Communication Hub</h3>
                  <p className="text-muted-foreground mb-4">
                    Send updates to petition signers and manage notification campaigns
                  </p>
                  <Button>Configure Notifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Platform Configuration</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure petition policies, approval workflows, and system settings
                  </p>
                  <Button>Manage Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}