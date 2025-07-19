import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Music, Trash2, Edit, Share2, Lock, Unlock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_public: boolean;
  is_collaborative: boolean;
  total_tracks: number;
  total_duration_seconds: number;
  created_at: string;
  user_id: string;
}

interface PlaylistManagerProps {
  currentUser?: any;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ currentUser }) => {
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
    is_public: false,
    is_collaborative: false,
  });

  useEffect(() => {
    if (currentUser) {
      fetchPlaylists();
    }
  }, [currentUser]);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      toast({
        title: "Error",
        description: "Playlist name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("playlists")
        .insert({
          ...newPlaylist,
          user_id: currentUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPlaylists(prev => [data, ...prev]);
      setNewPlaylist({ name: "", description: "", is_public: false, is_collaborative: false });
      setShowCreateDialog(false);

      toast({
        title: "Success",
        description: "Playlist created successfully",
      });
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({
        title: "Error",
        description: "Failed to create playlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    }
  };

  const togglePlaylistVisibility = async (playlistId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from("playlists")
        .update({ is_public: !isPublic })
        .eq("id", playlistId)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      setPlaylists(prev => prev.map(p => 
        p.id === playlistId ? { ...p, is_public: !isPublic } : p
      ));

      toast({
        title: "Success",
        description: `Playlist is now ${!isPublic ? "public" : "private"}`,
      });
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast({
        title: "Error",
        description: "Failed to update playlist",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <Music size={48} className="mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Sign In Required</h3>
            <p className="text-muted-foreground">Please sign in to manage your playlists</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Playlists</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlaylist.is_public}
                    onChange={(e) => setNewPlaylist(prev => ({ ...prev, is_public: e.target.checked }))}
                  />
                  Make public
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlaylist.is_collaborative}
                    onChange={(e) => setNewPlaylist(prev => ({ ...prev, is_collaborative: e.target.checked }))}
                  />
                  Allow collaboration
                </label>
              </div>
              <Button onClick={createPlaylist} disabled={loading} className="w-full">
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <Card key={playlist.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{playlist.name}</CardTitle>
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {playlist.is_public ? (
                    <Unlock size={16} className="text-green-500" />
                  ) : (
                    <Lock size={16} className="text-muted-foreground" />
                  )}
                  {playlist.is_collaborative && (
                    <Users size={16} className="text-blue-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{playlist.total_tracks} tracks</span>
                  <span>{formatDuration(playlist.total_duration_seconds)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={playlist.is_public ? "default" : "secondary"}>
                    {playlist.is_public ? "Public" : "Private"}
                  </Badge>
                  {playlist.is_collaborative && (
                    <Badge variant="outline">Collaborative</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlaylistVisibility(playlist.id, playlist.is_public)}
                  >
                    {playlist.is_public ? <Lock size={14} /> : <Unlock size={14} />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePlaylist(playlist.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {playlists.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Music size={64} className="mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">No playlists yet</h3>
              <p className="text-muted-foreground">Create your first playlist to organize your favorite tracks</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};