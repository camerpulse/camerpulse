import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReputationWidget } from './ReputationWidget';
import { Search, Filter, TrendingUp, TrendingDown, Crown, Award, AlertTriangle } from 'lucide-react';

export function CivicReputationDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Fetch top-rated entities from existing reputation system
  const { data: topEntities } = useQuery({
    queryKey: ['civic-reputation-top', selectedEntityType, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('civic_reputation_scores')
        .select('*')
        .order('total_score', { ascending: false });

      const { data, error } = await query.limit(20);
      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
  });

  // Fetch reputation statistics
  const { data: stats } = useQuery({
    queryKey: ['civic-reputation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_reputation_scores')
        .select('total_score, reputation_badge');

      if (error && error.code !== 'PGRST116') {
        return {
          total: 0,
          excellent: 0,
          rising: 0,
          falling: 0,
          averageScore: 0
        };
      }

      const avgScore = data?.length 
        ? data.reduce((sum, item) => sum + item.total_score, 0) / data.length
        : 0;

      return {
        total: data?.length || 0,
        excellent: data?.filter(item => item.reputation_badge === 'excellent').length || 0,
        rising: 0, // Not available in current schema
        falling: 0, // Not available in current schema
        averageScore: Math.round(avgScore)
      };
    },
  });

  // Fetch entities by type (using existing politicians/senators data)
  const { data: entitiesByType } = useQuery({
    queryKey: ['civic-reputation-by-type'],
    queryFn: async () => {
      const [politiciansResult, senatorsResult] = await Promise.all([
        supabase
          .from('politicians')
          .select('id, name, civic_score, verified')
          .order('civic_score', { ascending: false })
          .limit(5),
        supabase
          .from('senators')
          .select('id, name, performance_score, transparency_score')
          .order('performance_score', { ascending: false })
          .limit(5)
      ]);

      return {
        politicians: politiciansResult.data?.map(p => ({
          id: p.id,
          entity_name: p.name,
          entity_type: 'politician',
          total_score: p.civic_score || 0,
          reputation_badge: p.civic_score >= 80 ? 'excellent' : p.civic_score >= 60 ? 'trusted' : 'under_watch'
        })) || [],
        senators: senatorsResult.data?.map(s => ({
          id: s.id,
          entity_name: s.name,
          entity_type: 'senator',
          total_score: s.performance_score || 0,
          reputation_badge: s.performance_score >= 80 ? 'excellent' : s.performance_score >= 60 ? 'trusted' : 'under_watch'
        })) || []
      };
    },
  });

  const filteredEntities = topEntities?.filter(entity =>
    searchTerm === '' || 
    entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getEntityTypeLabel = (type: string) => {
    const labels = {
      politician: 'Politicians',
      senator: 'Senators', 
      minister: 'Ministers',
      mayor: 'Mayors',
      institution: 'Institutions',
      project: 'Projects',
      village: 'Villages',
      user: 'Citizens'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'politician':
      case 'senator':
      case 'minister':
      case 'mayor':
        return <Crown className="h-4 w-4" />;
      case 'institution':
        return <Award className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Civic Reputation Dashboard</h1>
          <p className="text-muted-foreground">
            Platform-wide trust and accountability metrics for public officials and institutions
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entities</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Excellent Rated</p>
                <p className="text-2xl font-bold text-green-600">{stats?.excellent || 0}</p>
              </div>
              <Crown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rising Scores</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.rising || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Falling Scores</p>
                <p className="text-2xl font-bold text-red-600">{stats?.falling || 0}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{stats?.averageScore || 0}/100</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="politician">Politicians</SelectItem>
                <SelectItem value="senator">Senators</SelectItem>
                <SelectItem value="minister">Ministers</SelectItem>
                <SelectItem value="mayor">Mayors</SelectItem>
                <SelectItem value="institution">Institutions</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="village">Villages</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="rankings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rankings">Top Rankings</TabsTrigger>
          <TabsTrigger value="by-type">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reputation Rankings</CardTitle>
              <CardDescription>
                Highest-rated public officials and institutions based on performance and transparency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntities.map((entity, index) => (
                  <div key={entity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getEntityTypeIcon(entity.entity_type)}
                        <h3 className="font-semibold">{entity.entity_name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {entity.entity_type}
                        </Badge>
                      </div>
                      <ReputationWidget
                        score={entity.total_score}
                        level={entity.reputation_badge === 'excellent' ? 'excellent' : entity.reputation_badge === 'trusted' ? 'good' : 'average'}
                        trend="stable"
                        entityName={entity.entity_name}
                        entityType={entity.entity_type}
                        compact={true}
                      />
                    </div>
                  </div>
                ))}
                {filteredEntities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No entities found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-type" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(entitiesByType || {}).map(([type, entities]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getEntityTypeIcon(type)}
                    {getEntityTypeLabel(type)}
                  </CardTitle>
                  <CardDescription>
                    Top-rated {getEntityTypeLabel(type).toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entities.slice(0, 5).map((entity: any, index: number) => (
                      <div key={`${entity.entity_type}-${entity.entity_id}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium truncate">{entity.entity_name}</span>
                        </div>
                        <ReputationWidget
                          score={entity.total_score}
                          level={entity.reputation_badge === 'excellent' ? 'excellent' : entity.reputation_badge === 'trusted' ? 'good' : 'average'}
                          trend="stable"
                          entityName={entity.entity_name}
                          entityType={entity.entity_type}
                          compact={true}
                        />
                      </div>
                    ))}
                    {entities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No {getEntityTypeLabel(type).toLowerCase()} rated yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}