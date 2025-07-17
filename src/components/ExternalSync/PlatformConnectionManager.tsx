import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Music, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformConnection {
  id: string;
  platform_type: string;
  platform_url: string;
  platform_username?: string;
  is_verified: boolean;
  sync_enabled: boolean;
  last_synced_at?: string;
  connection_status: string;
  error_message?: string;
}

const platformOptions = [
  { value: 'spotify', label: 'Spotify for Artists', icon: '🎵' },
  { value: 'youtube', label: 'YouTube Music/Channel', icon: '📺' },
  { value: 'apple_music', label: 'Apple Music for Artists', icon: '🍎' },
  { value: 'boomplay', label: 'Boomplay', icon: '🎶' },
  { value: 'audiomack', label: 'Audiomack', icon: '🎧' },
  { value: 'deezer', label: 'Deezer', icon: '🎤' },
  { value: 'soundcloud', label: 'SoundCloud', icon: '☁️' },
];

export function PlatformConnectionManager() {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [platformUrl, setPlatformUrl] = useState('');
  const [platformUsername, setPlatformUsername] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ['platform-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_platform_connections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PlatformConnection[];
    }
  });

  const addConnectionMutation = useMutation({
    mutationFn: async (connectionData: { platform_type: string; platform_url: string; platform_username?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get artist membership
      const { data: artistData, error: artistError } = await supabase
        .from('artist_memberships')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (artistError) throw new Error('Artist membership not found');

      const { data, error } = await supabase
        .from('artist_platform_connections')
        .insert({
          artist_id: artistData.id,
          user_id: user.user.id,
          platform_type: connectionData.platform_type as any,
          platform_url: connectionData.platform_url,
          platform_username: connectionData.platform_username
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Platform Connected",
        description: "Your platform has been connected successfully. We'll start syncing data shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['platform-connections'] });
      setSelectedPlatform('');
      setPlatformUrl('');
      setPlatformUsername('');
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect platform",
        variant: "destructive",
      });
    }
  });

  const toggleSyncMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('artist_platform_connections')
        .update({ sync_enabled: enabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-connections'] });
      toast({
        title: "Sync Settings Updated",
        description: "Platform sync settings have been updated.",
      });
    }
  });

  const syncNowMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.rpc('sync_platform_data', {
        p_connection_id: connectionId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description: "Platform data sync has been initiated. Check back in a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ['platform-connections'] });
    }
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('artist_platform_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Platform Disconnected",
        description: "Platform has been disconnected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['platform-connections'] });
    }
  });

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !platformUrl) return;

    addConnectionMutation.mutate({
      platform_type: selectedPlatform,
      platform_url: platformUrl,
      platform_username: platformUsername || undefined
    });
  };

  const getStatusBadge = (connection: PlatformConnection) => {
    if (connection.connection_status === 'connected' && connection.is_verified) {
      return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Connected</Badge>;
    }
    if (connection.connection_status === 'pending') {
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
    if (connection.error_message) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Error</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading platform connections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Connections</h2>
          <p className="text-muted-foreground">
            Connect your external music platforms to sync performance data automatically
          </p>
        </div>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections">Connected Platforms</TabsTrigger>
          <TabsTrigger value="add">Add Platform</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {connections && connections.length > 0 ? (
            <div className="grid gap-4">
              {connections.map((connection) => {
                const platform = platformOptions.find(p => p.value === connection.platform_type);
                return (
                  <Card key={connection.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{platform?.icon || '🎵'}</div>
                          <div>
                            <CardTitle className="text-lg">{platform?.label || connection.platform_type}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              {connection.platform_username && (
                                <span>@{connection.platform_username}</span>
                              )}
                              {getStatusBadge(connection)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(connection.platform_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncNowMutation.mutate(connection.id)}
                            disabled={syncNowMutation.isPending || !connection.sync_enabled}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteConnectionMutation.mutate(connection.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {connection.last_synced_at ? (
                            <>Last synced: {new Date(connection.last_synced_at).toLocaleDateString()}</>
                          ) : (
                            'Never synced'
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`sync-${connection.id}`} className="text-sm">Auto-sync</Label>
                          <Switch
                            id={`sync-${connection.id}`}
                            checked={connection.sync_enabled}
                            onCheckedChange={(checked) => 
                              toggleSyncMutation.mutate({ id: connection.id, enabled: checked })
                            }
                          />
                        </div>
                      </div>
                      {connection.error_message && (
                        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                          {connection.error_message}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Music className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Platforms Connected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your external music platforms to start syncing performance data
                </p>
                <Button onClick={() => (document.querySelector('[value="add"]') as HTMLElement)?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Platform</CardTitle>
              <CardDescription>
                Connect a new external music platform to sync performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddConnection} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            <span>{platform.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Platform URL</Label>
                  <Input
                    id="url"
                    placeholder="https://artists.spotify.com/your-profile"
                    value={platformUrl}
                    onChange={(e) => setPlatformUrl(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username (optional)</Label>
                  <Input
                    id="username"
                    placeholder="your-artist-name"
                    value={platformUsername}
                    onChange={(e) => setPlatformUsername(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!selectedPlatform || !platformUrl || addConnectionMutation.isPending}
                  className="w-full"
                >
                  {addConnectionMutation.isPending ? 'Connecting...' : 'Connect Platform'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}