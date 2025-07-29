import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flag, Users, TrendingUp, Calendar } from 'lucide-react';

interface PoliticalPartiesManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PoliticalPartiesManager: React.FC<PoliticalPartiesManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { data: parties, isLoading } = useQuery({
    queryKey: ['admin-political-parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleApproveParty = async (partyId: string) => {
    const { error } = await supabase
      .from('political_parties')
      .update({ claim_status: 'verified' })
      .eq('id', partyId);
    
    if (!error) {
      logActivity('party_approved', { party_id: partyId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Flag className="h-6 w-6 mr-2 text-blue-600" />
          Political Parties Management
        </h2>
        <p className="text-muted-foreground">Manage political party registrations and verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{parties?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Parties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {parties?.filter(p => p.claim_status === 'verified').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {parties?.filter(p => p.claim_status === 'pending').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((parties?.reduce((sum, p) => sum + (p.approval_rating || 0), 0) || 0) / (parties?.length || 1))}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Political Parties Directory</CardTitle>
          <CardDescription>Review and manage registered political parties</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading parties...</div>
          ) : parties?.length ? (
            <div className="space-y-4">
              {parties.map((party) => (
                <div key={party.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">{party.name}</h3>
                      <p className="text-sm text-muted-foreground">{party.acronym}</p>
                    </div>
                    <Badge variant={party.claim_status === 'verified' ? 'default' : 'secondary'}>
                      {party.claim_status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {party.claim_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveParty(party.id)}
                      >
                        Approve
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Flag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Political Parties</h3>
              <p className="text-muted-foreground">No political parties registered yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};