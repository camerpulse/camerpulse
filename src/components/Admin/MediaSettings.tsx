import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Image,
  Video,
  Mic,
  HardDrive,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface MediaSettings {
  id: string;
  enable_all_attachments: boolean;
  enable_images_only: boolean;
  enable_voice_only: boolean;
  enable_videos: boolean;
  max_file_size_mb: number;
  auto_delete_days: number;
  enable_compression: boolean;
  created_at: string;
  updated_at: string;
}

interface MediaStats {
  total_files: number;
  total_size_mb: number;
  files_by_type: {
    image: number;
    video: number;
    audio: number;
    other: number;
  };
  expired_files: number;
}

export const MediaSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MediaSettings | null>(null);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  // Load settings and stats
  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('messenger_media_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load media settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total files and size
      const { data: files, error: filesError } = await supabase
        .from('messenger_media_files')
        .select('file_size_bytes, file_type, expires_at');

      if (filesError) throw filesError;

      if (files) {
        const totalSizeMb = files.reduce((sum, file) => sum + file.file_size_bytes, 0) / (1024 * 1024);
        const filesByType = files.reduce((acc, file) => {
          acc[file.file_type as keyof typeof acc] = (acc[file.file_type as keyof typeof acc] || 0) + 1;
          return acc;
        }, { image: 0, video: 0, audio: 0, other: 0 });

        const expiredFiles = files.filter(file => new Date(file.expires_at) < new Date()).length;

        setStats({
          total_files: files.length,
          total_size_mb: Math.round(totalSizeMb * 100) / 100,
          files_by_type: filesByType,
          expired_files: expiredFiles
        });
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<MediaSettings>) => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('messenger_media_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, ...newSettings });
      toast({
        title: "Success",
        description: "Media settings updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const cleanupExpiredFiles = async () => {
    setCleaning(true);
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_media');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: `Cleaned up ${data || 0} expired files`
      });

      // Refresh stats
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cleanup files",
        variant: "destructive"
      });
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Settings Not Found</h3>
        <p className="text-muted-foreground">Media settings could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Settings</h2>
          <p className="text-muted-foreground">
            Configure file upload and storage settings for Pulse Messenger
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Settings className="h-3 w-3" />
          <span>Admin Panel</span>
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Upload Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable All Attachments */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable All Attachments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to upload files to messenger
                </p>
              </div>
              <Switch
                checked={settings.enable_all_attachments}
                onCheckedChange={(checked) => 
                  updateSettings({ enable_all_attachments: checked })
                }
                disabled={saving}
              />
            </div>

            {/* File Type Restrictions */}
            {settings.enable_all_attachments && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>Images Only</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow image uploads (JPG, PNG, GIF, WebP)
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_images_only}
                    onCheckedChange={(checked) => 
                      updateSettings({ 
                        enable_images_only: checked,
                        enable_voice_only: checked ? false : settings.enable_voice_only
                      })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Mic className="h-4 w-4" />
                      <span>Voice Only</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow audio/voice note uploads
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_voice_only}
                    onCheckedChange={(checked) => 
                      updateSettings({ 
                        enable_voice_only: checked,
                        enable_images_only: checked ? false : settings.enable_images_only
                      })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Video className="h-4 w-4" />
                      <span>Enable Videos</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow video file uploads (MP4, WebM)
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_videos}
                    onCheckedChange={(checked) => 
                      updateSettings({ enable_videos: checked })
                    }
                    disabled={saving || settings.enable_images_only || settings.enable_voice_only}
                  />
                </div>
              </>
            )}

            {/* File Size Limit */}
            <div className="space-y-2">
              <Label htmlFor="fileSize">Max File Size (MB)</Label>
              <Input
                id="fileSize"
                type="number"
                min="1"
                max="100"
                value={settings.max_file_size_mb}
                onChange={(e) => 
                  updateSettings({ max_file_size_mb: parseInt(e.target.value) || 25 })
                }
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size allowed per upload (1-100 MB)
              </p>
            </div>

            {/* Auto Delete */}
            <div className="space-y-2">
              <Label htmlFor="autoDelete">Auto Delete After (Days)</Label>
              <Input
                id="autoDelete"
                type="number"
                min="1"
                max="365"
                value={settings.auto_delete_days}
                onChange={(e) => 
                  updateSettings({ auto_delete_days: parseInt(e.target.value) || 30 })
                }
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Files will be automatically deleted after this many days
              </p>
            </div>

            {/* Compression */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable Compression</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically compress images to save storage space
                </p>
              </div>
              <Switch
                checked={settings.enable_compression}
                onCheckedChange={(checked) => 
                  updateSettings({ enable_compression: checked })
                }
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Storage Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats ? (
              <>
                {/* Total Usage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.total_files}</div>
                    <div className="text-sm text-muted-foreground">Total Files</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.total_size_mb}</div>
                    <div className="text-sm text-muted-foreground">MB Used</div>
                  </div>
                </div>

                {/* Files by Type */}
                <div>
                  <h4 className="font-medium mb-3">Files by Type</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="h-4 w-4 text-blue-500" />
                        <span>Images</span>
                      </div>
                      <Badge variant="secondary">{stats.files_by_type.image}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-purple-500" />
                        <span>Videos</span>
                      </div>
                      <Badge variant="secondary">{stats.files_by_type.video}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mic className="h-4 w-4 text-green-500" />
                        <span>Audio</span>
                      </div>
                      <Badge variant="secondary">{stats.files_by_type.audio}</Badge>
                    </div>
                  </div>
                </div>

                {/* Cleanup Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Expired Files</span>
                    </div>
                    <Badge variant={stats.expired_files > 0 ? "destructive" : "secondary"}>
                      {stats.expired_files}
                    </Badge>
                  </div>
                  
                  {stats.expired_files > 0 && (
                    <Button
                      onClick={cleanupExpiredFiles}
                      disabled={cleaning}
                      variant="outline"
                      className="w-full"
                    >
                      {cleaning ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Clean Up Expired Files
                    </Button>
                  )}
                  
                  {stats.expired_files === 0 && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      No expired files found
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading statistics...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            {settings.enable_all_attachments ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">Media uploads are enabled</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="text-orange-600 font-medium">Media uploads are disabled</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};