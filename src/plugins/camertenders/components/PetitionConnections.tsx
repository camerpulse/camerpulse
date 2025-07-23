import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  ExternalLink, 
  ThumbsUp, 
  Plus, 
  Link as LinkIcon,
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react';

interface PetitionConnection {
  id: string;
  petition_id: string;
  petition_title: string;
  petition_description: string;
  petition_status: string;
  petition_votes: number;
  petition_url?: string;
  connection_type: string;
  auto_created: boolean;
  created_at: string;
  petition_deadline?: string;
}

interface PetitionConnectionsProps {
  tenderId: string;
}

export const PetitionConnections: React.FC<PetitionConnectionsProps> = ({ tenderId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [newPetition, setNewPetition] = useState({
    title: '',
    description: '',
    connection_type: 'related'
  });
  const [linkPetitionId, setLinkPetitionId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch petition connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['petition_connections', tenderId],
    queryFn: async (): Promise<PetitionConnection[]> => {
      const { data, error } = await supabase
        .from('petition_connections')
        .select('*')
        .eq('tender_id', tenderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching petition connections:', error);
        return [];
      }

      return data || [];
    }
  });

  // Create petition mutation
  const createPetitionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('petition-engine-sync', {
        body: {
          action: 'create',
          tender_id: tenderId,
          petition_data: newPetition
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Petition created successfully" });
      setIsCreateDialogOpen(false);
      setNewPetition({ title: '', description: '', connection_type: 'related' });
      queryClient.invalidateQueries({ queryKey: ['petition_connections', tenderId] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create petition", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Link petition mutation
  const linkPetitionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('petition-engine-sync', {
        body: {
          action: 'link',
          tender_id: tenderId,
          petition_id: linkPetitionId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Petition linked successfully" });
      setIsLinkDialogOpen(false);
      setLinkPetitionId('');
      queryClient.invalidateQueries({ queryKey: ['petition_connections', tenderId] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to link petition", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Sync petition mutation
  const syncPetitionMutation = useMutation({
    mutationFn: async (petitionId: string) => {
      const { data, error } = await supabase.functions.invoke('petition-engine-sync', {
        body: {
          action: 'sync',
          petition_id: petitionId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Petition data synchronized" });
      queryClient.invalidateQueries({ queryKey: ['petition_connections', tenderId] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to sync petition", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreatePetition = () => {
    if (newPetition.title.trim() && newPetition.description.trim()) {
      createPetitionMutation.mutate();
    }
  };

  const handleLinkPetition = () => {
    if (linkPetitionId.trim()) {
      linkPetitionMutation.mutate();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'related': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Related Petitions ({connections?.length || 0})
          </h3>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LinkIcon className="w-4 h-4 mr-2" />
                Link Existing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Existing Petition</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Petition ID</label>
                  <Input
                    value={linkPetitionId}
                    onChange={(e) => setLinkPetitionId(e.target.value)}
                    placeholder="Enter petition ID from external platform"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleLinkPetition}
                    disabled={!linkPetitionId.trim() || linkPetitionMutation.isPending}
                  >
                    Link Petition
                  </Button>
                  <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Petition
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Petition</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Petition Title</label>
                  <Input
                    value={newPetition.title}
                    onChange={(e) => setNewPetition({...newPetition, title: e.target.value})}
                    placeholder="Enter petition title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newPetition.description}
                    onChange={(e) => setNewPetition({...newPetition, description: e.target.value})}
                    placeholder="Describe the petition"
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Connection Type</label>
                  <Select
                    value={newPetition.connection_type}
                    onValueChange={(value) => setNewPetition({...newPetition, connection_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="related">Related Issue</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="support">Support Tender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCreatePetition}
                    disabled={!newPetition.title.trim() || !newPetition.description.trim() || createPetitionMutation.isPending}
                  >
                    Create Petition
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : connections && connections.length > 0 ? (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{connection.petition_title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(connection.petition_status)}>
                        {connection.petition_status}
                      </Badge>
                      <Badge className={getConnectionTypeColor(connection.connection_type)}>
                        {connection.connection_type}
                      </Badge>
                      {connection.auto_created && (
                        <Badge variant="outline">Auto-created</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncPetitionMutation.mutate(connection.petition_id)}
                      disabled={syncPetitionMutation.isPending}
                    >
                      Sync Data
                    </Button>
                    {connection.petition_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={connection.petition_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{connection.petition_description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{connection.petition_votes.toLocaleString()} votes</span>
                    </div>
                    {connection.petition_deadline && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Deadline: {new Date(connection.petition_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    Created {new Date(connection.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No petitions connected to this tender</p>
            <p className="text-sm text-muted-foreground">
              Create a new petition or link an existing one to increase transparency and civic engagement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};