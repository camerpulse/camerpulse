import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, Users, MapPin } from 'lucide-react';
import { usePoliticalPartyMembers, PoliticalPartyMember } from '@/hooks/usePoliticalPartyMembers';
import { VerificationBadge } from './VerificationBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PoliticalPartyMembersProps {
  partyId: string;
  partyName: string;
}

export const PoliticalPartyMembers = ({ partyId, partyName }: PoliticalPartyMembersProps) => {
  const { data: members, isLoading, error } = usePoliticalPartyMembers(partyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Party Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner size="sm" text="Loading party members..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Party Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load party members</p>
        </CardContent>
      </Card>
    );
  }

  if (!members || members.totalMembers === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Party Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No registered members found for {partyName}</p>
        </CardContent>
      </Card>
    );
  }

  const renderMemberCard = (member: PoliticalPartyMember) => (
    <Card key={`${member.entity_type}-${member.id}`} className="h-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={member.avatar_url} />
            <AvatarFallback>
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{member.name}</h4>
              <VerificationBadge 
                isClaimed={member.is_claimed} 
                size="sm"
              />
            </div>
            
            <p className="text-xs text-primary font-medium mb-1">{member.role}</p>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{member.region}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {member.entity_type.toUpperCase()}
              </Badge>
              
              <Link to={`/${member.entity_type}s/${member.id}`}>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Party Members
          </div>
          <Badge variant="secondary">
            {members.totalMembers} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {members.politicians.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Politicians
              <Badge variant="outline" className="text-xs">
                {members.politicians.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.politicians.map(renderMemberCard)}
            </div>
          </div>
        )}

        {members.senators.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Senators
              <Badge variant="outline" className="text-xs">
                {members.senators.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.senators.map(renderMemberCard)}
            </div>
          </div>
        )}

        {members.mps.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Members of Parliament
              <Badge variant="outline" className="text-xs">
                {members.mps.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.mps.map(renderMemberCard)}
            </div>
          </div>
        )}

        {members.ministers.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              Ministers
              <Badge variant="outline" className="text-xs">
                {members.ministers.length}
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.ministers.map(renderMemberCard)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};