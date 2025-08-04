import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitCompare, Search, TrendingUp, Users, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileComparisonProps {
  currentProfile: any;
}

interface CompareProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  profile_type: string;
  civic_influence_score: number;
  polls_created: number;
  post_count: number;
  events_attended: number;
  verification_status: string;
  contribution_level: string;
}

export const ProfileComparison: React.FC<ProfileComparisonProps> = ({
  currentProfile
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CompareProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CompareProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const searchProfiles = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, display_name, avatar_url, profile_type,
          civic_influence_score, polls_created, post_count, events_attended,
          verification_status, contribution_level
        `)
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .neq('id', currentProfile.id)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast({
        title: "Search failed",
        description: "Failed to search profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logComparison = async (compareWithProfile: CompareProfile) => {
    try {
      await supabase
        .from('profile_comparisons')
        .insert({
          comparer_id: user?.id,
          profile_a_id: currentProfile.id,
          profile_b_id: compareWithProfile.id,
          comparison_data: {
            timestamp: new Date().toISOString(),
            profiles_compared: {
              profile_a: currentProfile.username,
              profile_b: compareWithProfile.username
            }
          }
        });
    } catch (error) {
      console.error('Error logging comparison:', error);
    }
  };

  const handleCompare = (profile: CompareProfile) => {
    setSelectedProfile(profile);
    logComparison(profile);
  };

  const ComparisonMetric = ({ 
    label, 
    currentValue, 
    compareValue, 
    icon: Icon,
    isHigherBetter = true 
  }: {
    label: string;
    currentValue: number;
    compareValue: number;
    icon: any;
    isHigherBetter?: boolean;
  }) => {
    const currentIsWinner = isHigherBetter ? currentValue > compareValue : currentValue < compareValue;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`text-center p-2 rounded ${currentIsWinner ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="font-bold text-lg">{currentValue}</div>
            <div className="text-xs text-muted-foreground">{currentProfile.username}</div>
          </div>
          <div className={`text-center p-2 rounded ${!currentIsWinner ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="font-bold text-lg">{compareValue}</div>
            <div className="text-xs text-muted-foreground">{selectedProfile?.username}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitCompare className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Comparison</DialogTitle>
        </DialogHeader>

        {!selectedProfile ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search profiles to compare with..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchProfiles()}
              />
              <Button onClick={searchProfiles} disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {searchResults.map((profile) => (
                <Card key={profile.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleCompare(profile)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatar_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`}
                        alt={profile.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{profile.display_name || profile.username}</div>
                        <div className="text-sm text-muted-foreground">@{profile.username}</div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {profile.profile_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Headers */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <img
                    src={currentProfile.avatar_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`}
                    alt={currentProfile.username}
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                  <div className="font-semibold">{currentProfile.display_name || currentProfile.username}</div>
                  <div className="text-sm text-muted-foreground">@{currentProfile.username}</div>
                  <Badge variant="default" className="mt-2 capitalize">
                    {currentProfile.contribution_level || 'bronze'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <img
                    src={selectedProfile.avatar_url || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`}
                    alt={selectedProfile.username}
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                  <div className="font-semibold">{selectedProfile.display_name || selectedProfile.username}</div>
                  <div className="text-sm text-muted-foreground">@{selectedProfile.username}</div>
                  <Badge variant="default" className="mt-2 capitalize">
                    {selectedProfile.contribution_level || 'bronze'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComparisonMetric
                label="Civic Influence Score"
                currentValue={currentProfile.civic_influence_score || 0}
                compareValue={selectedProfile.civic_influence_score || 0}
                icon={TrendingUp}
              />

              <ComparisonMetric
                label="Polls Created"
                currentValue={currentProfile.polls_created || 0}
                compareValue={selectedProfile.polls_created || 0}
                icon={Award}
              />

              <ComparisonMetric
                label="Posts Shared"
                currentValue={currentProfile.post_count || 0}
                compareValue={selectedProfile.post_count || 0}
                icon={Users}
              />

              <ComparisonMetric
                label="Events Attended"
                currentValue={currentProfile.events_attended || 0}
                compareValue={selectedProfile.events_attended || 0}
                icon={Award}
              />
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                Compare with Another
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};