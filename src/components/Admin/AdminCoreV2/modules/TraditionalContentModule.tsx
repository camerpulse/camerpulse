import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Palette, Calendar, BookOpen, Users, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';

interface TraditionalContentModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

export const TraditionalContentModule: React.FC<TraditionalContentModuleProps> = ({
  hasPermission,
  logActivity
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch oral traditions
  const { data: oralTraditions, isLoading } = useQuery({
    queryKey: ['oral-traditions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oral_traditions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('traditional_content')
  });

  // Fetch traditional recipes
  const { data: recipes } = useQuery({
    queryKey: ['traditional-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traditional_recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('traditional_content')
  });

  // Fetch traditional calendar events
  const { data: calendarEvents } = useQuery({
    queryKey: ['traditional-calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traditional_calendar_events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('traditional_content')
  });

  // Fetch traditional content stats
  const { data: traditionalStats } = useQuery({
    queryKey: ['traditional-stats'],
    queryFn: async () => {
      const [traditions, recipesData, events] = await Promise.all([
        supabase.from('oral_traditions').select('id', { count: 'exact' }),
        supabase.from('traditional_recipes').select('id', { count: 'exact' }),
        supabase.from('traditional_calendar_events').select('id', { count: 'exact' })
      ]);

      return {
        totalTraditions: traditions.data?.length || 0,
        totalRecipes: recipesData.data?.length || 0,
        totalEvents: events.data?.length || 0,
        totalContributors: 45 // This would need proper calculation
      };
    },
    enabled: hasPermission('traditional_content')
  });

  // Delete tradition mutation
  const deleteTradition = useMutation({
    mutationFn: async (traditionId: string) => {
      const { error } = await supabase
        .from('oral_traditions')
        .delete()
        .eq('id', traditionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oral-traditions'] });
      queryClient.invalidateQueries({ queryKey: ['traditional-stats'] });
      toast({ title: "Tradition deleted successfully" });
      logActivity('oral_tradition_deleted', { timestamp: new Date() });
    },
    onError: (error) => {
      toast({ title: "Error deleting tradition", description: error.message, variant: "destructive" });
    }
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      folktale: 'bg-purple-100 text-purple-800',
      proverb: 'bg-blue-100 text-blue-800',
      song: 'bg-green-100 text-green-800',
      dance: 'bg-red-100 text-red-800',
      ceremony: 'bg-orange-100 text-orange-800'
    } as const;
    
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {category}
      </Badge>
    );
  };

  const getRegionBadge = (region: string) => {
    return (
      <Badge variant="outline">{region}</Badge>
    );
  };

  if (!hasPermission('traditional_content')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You don't have permission to access traditional content management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Traditional Content Management"
        description="Preserve and manage oral traditions, recipes, and cultural calendar events"
        icon={Palette}
        iconColor="text-orange-600"
        badge={{
          text: "Cultural Heritage",
          variant: "secondary"
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['oral-traditions'] });
          logActivity('traditional_content_refresh', { timestamp: new Date() });
        }}
      />

      {/* Traditional Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Oral Traditions"
          value={traditionalStats?.totalTraditions?.toString() || '0'}
          icon={BookOpen}
          description="Stories and folklore"
        />
        <StatCard
          title="Traditional Recipes"
          value={traditionalStats?.totalRecipes?.toString() || '0'}
          icon={Star}
          description="Cultural cuisine"
        />
        <StatCard
          title="Calendar Events"
          value={traditionalStats?.totalEvents?.toString() || '0'}
          icon={Calendar}
          description="Cultural celebrations"
        />
        <StatCard
          title="Contributors"
          value={traditionalStats?.totalContributors?.toString() || '0'}
          icon={Users}
          description="Community contributors"
        />
      </div>

      {/* Traditional Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traditions">Oral Traditions</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="calendar">Cultural Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Traditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {oralTraditions?.slice(0, 3).map((tradition) => (
                    <div key={tradition.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{tradition.title}</p>
                        <div className="flex gap-2 mt-1">
                          {getCategoryBadge(tradition.tradition_type || 'folktale')}
                          {getRegionBadge('Village')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Popular Recipes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipes?.slice(0, 3).map((recipe) => (
                    <div key={recipe.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{recipe.recipe_name}</p>
                        <p className="text-xs text-muted-foreground">Traditional Recipe</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calendarEvents?.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{event.event_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traditions" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Oral Traditions ({oralTraditions?.length || 0})</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tradition
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {oralTraditions?.map((tradition) => (
                  <div key={tradition.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{tradition.title}</h3>
                      <p className="text-sm text-muted-foreground">{tradition.description || 'No description available'}</p>
                      <div className="flex gap-2 mt-2">
                        {getCategoryBadge(tradition.tradition_type || 'folktale')}
                        {getRegionBadge('Village')}
                        <Badge variant="outline">
                          {new Date(tradition.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteTradition.mutate(tradition.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Traditional Recipes ({recipes?.length || 0})</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <div className="space-y-4">
                {recipes?.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{recipe.recipe_name}</h3>
                      <p className="text-sm text-muted-foreground">{recipe.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Traditional</Badge>
                        <Badge variant="secondary">{recipe.difficulty_level || 'Medium'}</Badge>
                        <Badge variant="outline">{recipe.cooking_time_minutes || '30'} mins</Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Cultural Calendar Events ({calendarEvents?.length || 0})</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <div className="space-y-4">
                {calendarEvents?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{event.event_name}</h3>
                      <p className="text-sm text-muted-foreground">{event.event_description || 'No description available'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {new Date(event.start_date).toLocaleDateString()}
                        </Badge>
                        <Badge variant="secondary">Cultural Event</Badge>
                        <Badge variant="default">Cultural Event</Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};