import React, { useState } from 'react';
import { Search, Filter, Calendar, Users, FileText, TrendingUp, AlertCircle, Heart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LegislationStats } from '@/components/legislation/LegislationStats';
import { LegislationFilters } from '@/components/legislation/LegislationFilters';
import { BillCard } from '@/components/legislation/BillCard';
import { MPVotingHeatmap } from '@/components/legislation/MPVotingHeatmap';
import { LegislativeTimeline } from '@/components/legislation/LegislativeTimeline';

export const LegislationTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sortBy, setSortBy] = useState('date_introduced');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');

  const { data: legislation, isLoading } = useQuery({
    queryKey: ['legislation', searchTerm, selectedStatus, selectedType, selectedSector, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('legislation_registry')
        .select(`
          *,
          bill_comments(count),
          bill_followers(count),
          citizen_bill_engagement(count)
        `);

      if (searchTerm) {
        query = query.or(`bill_title.ilike.%${searchTerm}%,legislative_summary.ilike.%${searchTerm}%`);
      }

      if (selectedStatus) {
        query = query.eq('status', selectedStatus as any);
      }

      if (selectedType) {
        query = query.eq('law_type', selectedType as any);
      }

      if (selectedSector) {
        query = query.contains('affected_sectors', [selectedSector]);
      }

      query = query.order(sortBy, { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['legislation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_legislation_statistics');
      if (error) throw error;
      return data as {
        total_bills: number;
        active_bills: number;
        passed_bills: number;
        rejected_bills: number;
        total_citizen_votes: number;
        avg_citizen_engagement: number;
      };
    },
  });

  const handleVote = async (billId: string, position: 'yes' | 'no') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to vote on legislation');
        return;
      }

      const { error } = await supabase
        .from('citizen_bill_engagement')
        .upsert({
          legislation_id: billId,
          user_id: user.id,
          engagement_type: 'vote',
          vote_position: position
        });

      if (error) throw error;

      toast.success(`Your ${position} vote has been recorded`);
    } catch (error) {
      toast.error('Failed to record vote');
    }
  };

  const handleFollow = async (billId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to follow legislation');
        return;
      }

      const { error } = await supabase
        .from('bill_followers')
        .insert({
          legislation_id: billId,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('You are now following this bill');
    } catch (error) {
      toast.error('Failed to follow bill');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Legislative Tracker</h1>
        <p className="text-muted-foreground text-lg">
          Follow national and local legislation, understand bills, and engage with the democratic process.
        </p>
      </div>

      <LegislationStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <LegislationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedSector={selectedSector}
            onSectorChange={setSelectedSector}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        <div className="lg:col-span-3">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grid">Bills Overview</TabsTrigger>
              <TabsTrigger value="list">Detailed List</TabsTrigger>
              <TabsTrigger value="timeline">Legislative Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {legislation?.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onVote={handleVote}
                    onFollow={() => handleFollow(bill.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="space-y-4">
                {legislation?.map((bill) => (
                  <Card key={bill.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{bill.bill_title}</h3>
                          <Badge variant={
                            bill.status === 'passed' ? 'default' :
                            bill.status === 'rejected' ? 'destructive' :
                            bill.status === 'draft' ? 'secondary' : 'outline'
                          }>
                            {bill.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{bill.law_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {bill.legislative_summary}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(bill.date_introduced).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {bill.originator_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {bill.citizen_upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4" />
                            {bill.citizen_downvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {bill.followers_count}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVote(bill.id, 'yes')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVote(bill.id, 'no')}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFollow(bill.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <LegislativeTimeline bills={legislation || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mt-8">
        <MPVotingHeatmap />
      </div>
    </div>
  );
};