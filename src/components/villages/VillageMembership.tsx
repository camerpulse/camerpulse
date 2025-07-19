import React, { useState, useEffect } from 'react';
import { Heart, Crown, Users, Check, X, Clock, UserPlus, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Membership {
  id: string;
  user_id: string;
  membership_type: string;
  verification_status: string;
  relationship_to_village: string;
  years_lived_there?: number;
  contribution_level: string;
  claimed_at: string;
  verified_at?: string;
  verified_by?: string;
  bio?: string;
  profile_photo?: string;
  display_name?: string;
}

interface VillageMembershipProps {
  villageId: string;
  villageName: string;
}

export const VillageMembership: React.FC<VillageMembershipProps> = ({ villageId, villageName }) => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [userMembership, setUserMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [membershipForm, setMembershipForm] = useState({
    membership_type: 'son_daughter',
    relationship_to_village: '',
    years_lived_there: '',
    bio: '',
    display_name: ''
  });

  const membershipTypes = [
    { value: 'son_daughter', label: 'Son/Daughter of Village', icon: Heart },
    { value: 'current_resident', label: 'Current Resident', icon: Users },
    { value: 'former_resident', label: 'Former Resident', icon: Clock },
    { value: 'friend_supporter', label: 'Friend/Supporter', icon: UserPlus }
  ];

  const contributionLevels = [
    { value: 'low', label: 'Occasional Support', color: 'outline' },
    { value: 'medium', label: 'Regular Contributor', color: 'secondary' },
    { value: 'high', label: 'Major Contributor', color: 'warning' },
    { value: 'exceptional', label: 'Exceptional Benefactor', color: 'success' }
  ];

  useEffect(() => {
    fetchMemberships();
    checkUserMembership();
  }, [villageId]);

  const fetchMemberships = async () => {
    // Demo mode - using sample data
    setMemberships(sampleMembers);
    setLoading(false);
  };

  const checkUserMembership = async () => {
    // Demo mode - no user membership by default
    setUserMembership(null);
  };

  const handleClaimMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to claim membership');
        return;
      }

      if (userMembership) {
        toast.error('You have already claimed membership for this village');
        return;
      }

      const membershipData = {
        village_id: villageId,
        user_id: user.id,
        membership_type: membershipForm.membership_type,
        relationship_to_village: membershipForm.relationship_to_village,
        years_lived_there: membershipForm.years_lived_there ? parseInt(membershipForm.years_lived_there) : null,
        bio: membershipForm.bio,
        display_name: membershipForm.display_name || user.email?.split('@')[0] || 'Anonymous',
        verification_status: 'pending',
        contribution_level: 'low'
      };

      const { error } = await supabase
        .from('village_memberships')
        .insert(membershipData);

      if (error) throw error;

      toast.success('Membership claim submitted for verification!');
      setClaimDialogOpen(false);
      setMembershipForm({
        membership_type: 'son_daughter',
        relationship_to_village: '',
        years_lived_there: '',
        bio: '',
        display_name: ''
      });
      checkUserMembership();
    } catch (error) {
      console.error('Error claiming membership:', error);
      toast.error('Failed to claim membership');
    }
  };

  const getMembershipTypeInfo = (type: string) => {
    return membershipTypes.find(t => t.value === type) || membershipTypes[0];
  };

  const getContributionInfo = (level: string) => {
    return contributionLevels.find(l => l.value === level) || contributionLevels[0];
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success"><Check className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Sample verified members for demo
  const sampleMembers: Membership[] = [
    {
      id: '1',
      user_id: 'sample1',
      membership_type: 'son_daughter',
      verification_status: 'verified',
      relationship_to_village: 'Born and raised in the village',
      years_lived_there: 25,
      contribution_level: 'high',
      claimed_at: '2024-01-15T10:00:00Z',
      verified_at: '2024-01-16T14:30:00Z',
      bio: 'Proud son of this village, currently working in tech to give back to my community.',
      display_name: 'Emmanuel K.',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '2',
      user_id: 'sample2',
      membership_type: 'current_resident',
      verification_status: 'verified',
      relationship_to_village: 'Moved here 10 years ago, active in community development',
      years_lived_there: 10,
      contribution_level: 'medium',
      claimed_at: '2024-01-20T09:00:00Z',
      verified_at: '2024-01-21T11:15:00Z',
      bio: 'Teacher at the local school, passionate about education and youth development.',
      display_name: 'Marie T.',
      profile_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    },
    {
      id: '3',
      user_id: 'sample3',
      membership_type: 'son_daughter',
      verification_status: 'verified',
      relationship_to_village: 'Grandfather was village chief, living abroad but supporting development',
      contribution_level: 'exceptional',
      claimed_at: '2024-02-01T16:00:00Z',
      verified_at: '2024-02-02T10:00:00Z',
      bio: 'Diaspora member funding education projects and infrastructure development.',
      display_name: 'Dr. Paul M.',
      profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
    }
  ];

  const displayMembers = memberships.length > 0 ? memberships : sampleMembers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Village Membership</h3>
          <p className="text-muted-foreground">
            {displayMembers.length} verified members • Connect with your community
          </p>
        </div>
        
        {!userMembership ? (
          <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Heart className="h-4 w-4 mr-2" />
                Claim Membership
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Claim Membership to {villageName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="membership_type">Membership Type</Label>
                  <Select value={membershipForm.membership_type} onValueChange={(value) => 
                    setMembershipForm(prev => ({ ...prev, membership_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={membershipForm.display_name}
                    onChange={(e) => setMembershipForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="How should your name appear?"
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Your Connection to the Village</Label>
                  <Textarea
                    id="relationship"
                    value={membershipForm.relationship_to_village}
                    onChange={(e) => setMembershipForm(prev => ({ ...prev, relationship_to_village: e.target.value }))}
                    placeholder="Describe your relationship to this village..."
                    rows={3}
                  />
                </div>

                {(membershipForm.membership_type === 'current_resident' || membershipForm.membership_type === 'former_resident') && (
                  <div>
                    <Label htmlFor="years_lived">Years Lived in Village</Label>
                    <Input
                      id="years_lived"
                      type="number"
                      value={membershipForm.years_lived_there}
                      onChange={(e) => setMembershipForm(prev => ({ ...prev, years_lived_there: e.target.value }))}
                      placeholder="How many years?"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="bio">Short Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={membershipForm.bio}
                    onChange={(e) => setMembershipForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell the community about yourself..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleClaimMembership} className="flex-1">
                    Submit Claim
                  </Button>
                  <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-sm">
                {getMembershipTypeInfo(userMembership.membership_type).label}
              </Badge>
              {getVerificationStatusBadge(userMembership.verification_status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {userMembership.verification_status === 'pending' 
                ? 'Your membership is being reviewed'
                : userMembership.verification_status === 'verified'
                ? 'You are a verified member'
                : 'Membership verification required'
              }
            </p>
          </div>
        )}
      </div>

      {/* Membership Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {membershipTypes.map(type => {
          const count = displayMembers.filter(m => m.membership_type === type.value).length;
          const Icon = type.icon;
          return (
            <Card key={type.value} className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-sm text-muted-foreground">{type.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Members List */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Verified Members</h4>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayMembers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Verified Members Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to join this village community!
              </p>
              <Button onClick={() => setClaimDialogOpen(true)}>
                <Heart className="h-4 w-4 mr-2" />
                Claim Membership
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayMembers.map((member) => {
              const membershipType = getMembershipTypeInfo(member.membership_type);
              const contributionInfo = getContributionInfo(member.contribution_level);
              const MemberIcon = membershipType.icon;

              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profile_photo} alt={member.display_name} />
                        <AvatarFallback>
                          {member.display_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{member.display_name}</h4>
                          <MemberIcon className="h-4 w-4 text-primary" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {membershipType.label}
                          </Badge>
                          <Badge variant={contributionInfo.color as any} className="text-xs">
                            {contributionInfo.label}
                          </Badge>
                        </div>

                        {member.relationship_to_village && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {member.relationship_to_village}
                          </p>
                        )}

                        {member.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {member.bio}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>
                            Member since {new Date(member.claimed_at).toLocaleDateString()}
                          </span>
                          {member.years_lived_there && (
                            <span>{member.years_lived_there} years in village</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};