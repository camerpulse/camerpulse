import React, { useState, useEffect } from 'react';
import { Users, Crown, Star, MapPin, Calendar, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface VillageMembersProps {
  villageId: string;
}

interface Member {
  id: string;
  user_id: string;
  membership_type: string;
  status: string;
  joined_at: string;
  verified_at?: string;
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
  };
}

export const VillageMembers: React.FC<VillageMembersProps> = ({ villageId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, [villageId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('village_memberships')
        .select(`
          *,
          profiles:user_id(
            username,
            display_name,
            avatar_url,
            bio,
            location
          )
        `)
        .eq('village_id', villageId)
        .order('verified_at', { ascending: false, nullsLast: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm || 
      member.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesType = typeFilter === 'all' || member.membership_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'chief': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'elder': return <Star className="h-4 w-4 text-purple-600" />;
      default: return <Users className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMembershipBadge = (type: string, status: string) => {
    const isVerified = status === 'verified';
    const baseClasses = isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    
    switch (type) {
      case 'chief':
        return <Badge className={`${baseClasses} border-yellow-300`}>Chief</Badge>;
      case 'elder':
        return <Badge className={`${baseClasses} border-purple-300`}>Elder</Badge>;
      case 'notable':
        return <Badge className={`${baseClasses} border-blue-300`}>Notable</Badge>;
      default:
        return <Badge className={`${baseClasses} border-gray-300`}>
          {isVerified ? 'Son/Daughter' : 'Pending'}
        </Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Village Members
          </h2>
          <p className="text-muted-foreground">
            {filteredMembers.length} of {members.length} members
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="chief">Chiefs</SelectItem>
              <SelectItem value="elder">Elders</SelectItem>
              <SelectItem value="notable">Notables</SelectItem>
              <SelectItem value="son_daughter">Sons & Daughters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="text-center p-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No members found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search filters'
              : 'Be the first to join this village community!'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profiles?.avatar_url} />
                    <AvatarFallback>
                      {member.profiles?.display_name?.[0] || member.profiles?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Link 
                        to={`/profile/${member.profiles?.username}`}
                        className="font-semibold hover:text-primary truncate"
                      >
                        {member.profiles?.display_name || member.profiles?.username || 'Unknown User'}
                      </Link>
                      {getMembershipIcon(member.membership_type)}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getMembershipBadge(member.membership_type, member.status)}
                    </div>

                    {member.profiles?.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {member.profiles.bio}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>

                    {member.profiles?.location && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {member.profiles.location}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">
            {members.filter(m => m.status === 'verified').length}
          </div>
          <div className="text-sm text-muted-foreground">Verified Members</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {members.filter(m => m.membership_type === 'chief').length}
          </div>
          <div className="text-sm text-muted-foreground">Chiefs</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {members.filter(m => m.membership_type === 'elder').length}
          </div>
          <div className="text-sm text-muted-foreground">Elders</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">
            {members.filter(m => m.membership_type === 'son_daughter').length}
          </div>
          <div className="text-sm text-muted-foreground">Sons & Daughters</div>
        </Card>
      </div>
    </div>
  );
};