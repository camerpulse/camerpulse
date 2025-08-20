import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  MessageSquare,
  BarChart3,
  Users,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileManagementPanelProps {
  entityType: 'politician' | 'senator' | 'mp' | 'minister' | 'party';
  entityId: string;
  entityData: any;
  isOwner: boolean;
}

export const ProfileManagementPanel = ({
  entityType,
  entityId,
  entityData,
  isOwner
}: ProfileManagementPanelProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(entityData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (updatedData: any) => {
      const tableName = entityType === 'party' ? 'political_parties' : 
                       entityType === 'politician' ? 'politicians' :
                       entityType === 'senator' ? 'senators' :
                       entityType === 'mp' ? 'mps' : 'ministers';

      const { data, error } = await supabase
        .from(tableName)
        .update(updatedData)
        .eq('id', entityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = async () => {
    const allowedFields = getEditableFields(entityType);
    const updateData = Object.keys(formData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {} as any);

    await updateProfile.mutateAsync(updateData);
  };

  const handleCancel = () => {
    setFormData(entityData);
    setEditMode(false);
  };

  if (!isOwner) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage this profile.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile Management
          </CardTitle>
          <CardDescription>
            Manage your claimed profile information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="default" className="gap-2">
              <Shield className="h-3 w-3" />
              Claimed Profile
            </Badge>
            <Button
              variant={editMode ? "destructive" : "outline"}
              size="sm"
              onClick={editMode ? handleCancel : () => setEditMode(true)}
            >
              {editMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region || ''}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editMode}
                  rows={4}
                />
              </div>

              {entityType === 'party' && (
                <>
                  <div>
                    <Label htmlFor="mission_statement">Mission Statement</Label>
                    <Textarea
                      id="mission_statement"
                      value={formData.mission_statement || ''}
                      onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                      disabled={!editMode}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vision_statement">Vision Statement</Label>
                    <Textarea
                      id="vision_statement"
                      value={formData.vision_statement || ''}
                      onChange={(e) => setFormData({ ...formData, vision_statement: e.target.value })}
                      disabled={!editMode}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url || formData.official_website || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [entityType === 'party' ? 'official_website' : 'website_url']: e.target.value 
                    })}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editMode}
                />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Profile Views</p>
                        <p className="text-2xl font-bold">{entityData.view_count || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Approval Rating</p>
                        <p className="text-2xl font-bold">{(entityData.approval_rating || 0).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Reviews</p>
                        <p className="text-2xl font-bold">{entityData.total_ratings || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Analytics data is updated daily. View detailed performance metrics in your full dashboard.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {editMode && (
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function getEditableFields(entityType: string): string[] {
  const baseFields = ['name', 'bio', 'contact_email', 'website_url', 'phone'];
  
  switch (entityType) {
    case 'party':
      return [...baseFields, 'mission_statement', 'vision_statement', 'ideology', 'headquarters_city', 'headquarters_region', 'official_website'];
    case 'politician':
      return [...baseFields, 'region', 'role'];
    case 'senator':
    case 'mp':
      return [...baseFields, 'region', 'constituency'];
    case 'minister':
      return [...baseFields, 'ministry', 'portfolio'];
    default:
      return baseFields;
  }
}