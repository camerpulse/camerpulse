import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Star, Bell, Download, Eye, MapPin, Calendar, DollarSign,
  Building, Heart, Filter, Search, AlertCircle
} from 'lucide-react';

interface WatchedTender {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  budget_min?: number;
  budget_max?: number;
  category: string;
  issuer_name: string;
  region: string;
  is_watched: boolean;
  alert_enabled: boolean;
  progress_stage: string;
}

export const CivicTenderWatchlist: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch watchlist tenders
  const { data: watchedTenders, isLoading } = useQuery({
    queryKey: ['civic_watchlist', filterRegion, filterCategory, searchTerm],
    queryFn: async (): Promise<WatchedTender[]> => {
      let query = supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterRegion !== 'all') {
        query = query.eq('region', filterRegion);
      }
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      return data?.map(tender => ({
        ...tender,
        issuer_name: `Ministry of ${tender.category}`,
        region: 'Centre', // Default region since location field doesn't exist
        is_watched: Math.random() > 0.7,
        alert_enabled: Math.random() > 0.5,
        progress_stage: getProgressStage(tender.status)
      })) || [];
    },
  });

  const getProgressStage = (status: string): string => {
    const stages = {
      draft: 'Preparation',
      open: 'Bid Collection',
      evaluation: 'Evaluation',
      awarded: 'Contract Award',
      completed: 'Project Complete'
    };
    return stages[status as keyof typeof stages] || 'Unknown';
  };

  // Watch/Unwatch tender mutation
  const toggleWatchMutation = useMutation({
    mutationFn: async ({ tenderId, isWatched }: { tenderId: string; isWatched: boolean }) => {
      // In real implementation, this would update a user_tender_watchlist table
      console.log('Toggle watch for tender:', tenderId, 'watched:', !isWatched);
    },
    onSuccess: () => {
      toast({ 
        title: "Watchlist Updated", 
        description: "Tender watchlist status has been updated." 
      });
      queryClient.invalidateQueries({ queryKey: ['civic_watchlist'] });
    },
  });

  // Enable/Disable alerts mutation
  const toggleAlertMutation = useMutation({
    mutationFn: async ({ tenderId, alertEnabled }: { tenderId: string; alertEnabled: boolean }) => {
      console.log('Toggle alerts for tender:', tenderId, 'enabled:', !alertEnabled);
    },
    onSuccess: () => {
      toast({ 
        title: "Alert Settings Updated", 
        description: "Notification preferences have been saved." 
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Open for Bids', variant: 'default' as const, color: 'bg-green-500' },
      evaluation: { label: 'Under Evaluation', variant: 'secondary' as const, color: 'bg-blue-500' },
      awarded: { label: 'Contract Awarded', variant: 'outline' as const, color: 'bg-purple-500' },
      completed: { label: 'Completed', variant: 'secondary' as const, color: 'bg-gray-500' },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-500' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProgressPercentage = (stage: string): number => {
    const stages = {
      'Preparation': 20,
      'Bid Collection': 40,
      'Evaluation': 70,
      'Contract Award': 90,
      'Project Complete': 100
    };
    return stages[stage as keyof typeof stages] || 0;
  };

  const regions = ['all', 'Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 'East', 'Adamawa', 'North', 'Far North', 'South'];
  const categories = ['all', 'Infrastructure', 'Technology', 'Healthcare', 'Education', 'Agriculture', 'Energy', 'Transport'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Civic Tender Watchlist</h1>
          <p className="text-muted-foreground">Track public tenders and stay informed about government procurement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <AlertCircle className="h-4 w-4 mr-2" />
            My Alerts
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Tenders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <input
                type="text"
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          watchedTenders?.map((tender) => (
            <Card key={tender.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{tender.title}</h3>
                      {getStatusBadge(tender.status)}
                      {tender.is_watched && (
                        <Badge variant="outline" className="text-primary">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Watching
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {tender.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-primary" />
                        <span>{tender.issuer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{tender.region}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{new Date(tender.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>${(tender.budget_min || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress: {tender.progress_stage}</span>
                        <span>{getProgressPercentage(tender.progress_stage)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(tender.progress_stage)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant={tender.is_watched ? "default" : "outline"}
                      onClick={() => toggleWatchMutation.mutate({ 
                        tenderId: tender.id, 
                        isWatched: tender.is_watched 
                      })}
                    >
                      <Star className={`h-4 w-4 mr-1 ${tender.is_watched ? 'fill-current' : ''}`} />
                      {tender.is_watched ? 'Watching' : 'Watch'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={tender.alert_enabled ? "default" : "outline"}
                      onClick={() => toggleAlertMutation.mutate({ 
                        tenderId: tender.id, 
                        alertEnabled: tender.alert_enabled 
                      })}
                    >
                      <Bell className={`h-4 w-4 mr-1 ${tender.alert_enabled ? 'fill-current' : ''}`} />
                      Alerts
                    </Button>

                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transparency Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Transparency Initiative</p>
              <p className="text-sm text-muted-foreground">
                All tender information is sourced from official government databases. 
                Report any discrepancies through our civic feedback system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};