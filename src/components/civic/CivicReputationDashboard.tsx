import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ReputationWidget } from './ReputationWidget';
import { ScoreBreakdown } from './ScoreBreakdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Home,
  User,
  MapPin,
  Calendar,
  Download,
  Flag,
  Eye,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface ReputationEntity {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  total_score: number;
  reputation_badge: string;
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
  engagement_score: number;
  response_speed_score: number;
  negative_flags_penalty: number;
  total_ratings: number;
  average_rating: number;
  last_calculated_at: string;
  trend_direction?: 'up' | 'down' | 'stable';
  region?: string;
  role?: string;
}

interface DashboardStats {
  total_entities: number;
  officials_count: number;
  projects_count: number;
  villages_count: number;
  excellent_percentage: number;
  poor_percentage: number;
  average_score: number;
}

export function CivicReputationDashboard() {
  const [entities, setEntities] = useState<ReputationEntity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<ReputationEntity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_entities: 0,
    officials_count: 0,
    projects_count: 0,
    villages_count: 0,
    excellent_percentage: 0,
    poor_percentage: 0,
    average_score: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('total_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('politicians');
  const { toast } = useToast();

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const entityTypes = [
    { value: 'politician', label: 'Politicians' },
    { value: 'ministry', label: 'Ministries' },
    { value: 'village', label: 'Villages' },
    { value: 'project', label: 'Projects' },
    { value: 'citizen', label: 'Citizens' }
  ];

  useEffect(() => {
    fetchReputationData();
  }, []);

  useEffect(() => {
    filterAndSortEntities();
  }, [entities, searchTerm, selectedRegion, selectedRole, selectedStatus, scoreRange, sortBy, sortOrder, activeTab]);

  const fetchReputationData = async () => {
    try {
      setLoading(true);

      // Fetch all reputation scores
      const { data: reputationData, error } = await supabase
        .from('civic_reputation_scores')
        .select('*')
        .order('total_score', { ascending: false });

      if (error) throw error;

      const processedEntities = (reputationData || []).map(entity => ({
        ...entity,
        trend_direction: calculateTrend(entity.total_score, entity.last_calculated_at),
        region: getEntityRegion(entity.entity_type, entity.entity_name),
        role: getEntityRole(entity.entity_type, entity.entity_name)
      }));

      setEntities(processedEntities);

      // Calculate dashboard stats
      const totalEntities = processedEntities.length;
      const excellentCount = processedEntities.filter(e => e.total_score >= 80).length;
      const poorCount = processedEntities.filter(e => e.total_score < 50).length;
      const averageScore = processedEntities.reduce((sum, e) => sum + e.total_score, 0) / totalEntities;

      const officialTypes = ['politician', 'minister', 'governor', 'senator', 'mp'];
      const officials = processedEntities.filter(e => 
        officialTypes.some(type => e.entity_type.toLowerCase().includes(type))
      );

      setStats({
        total_entities: totalEntities,
        officials_count: officials.length,
        projects_count: processedEntities.filter(e => e.entity_type.toLowerCase().includes('project')).length,
        villages_count: processedEntities.filter(e => e.entity_type.toLowerCase().includes('village')).length,
        excellent_percentage: (excellentCount / totalEntities) * 100,
        poor_percentage: (poorCount / totalEntities) * 100,
        average_score: averageScore
      });

    } catch (error) {
      console.error('Error fetching reputation data:', error);
      toast({
        title: "Error",
        description: "Failed to load reputation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (score: number, lastCalculated: string): 'up' | 'down' | 'stable' => {
    // Simplified trend calculation - in real implementation, compare with historical data
    const daysSinceUpdate = Math.floor((Date.now() - new Date(lastCalculated).getTime()) / (1000 * 60 * 60 * 24));
    if (score >= 80) return 'up';
    if (score < 50) return 'down';
    return 'stable';
  };

  const getEntityRegion = (entityType: string, entityName: string): string => {
    // Extract region from entity name or type - simplified implementation
    const regionMatch = regions.find(region => 
      entityName.toLowerCase().includes(region.toLowerCase())
    );
    return regionMatch || 'Unknown';
  };

  const getEntityRole = (entityType: string, entityName: string): string => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1);
  };

  const filterAndSortEntities = () => {
    let filtered = entities;

    // Filter by active tab
    if (activeTab === 'politicians') {
      filtered = filtered.filter(e => 
        ['politician', 'senator', 'mp', 'minister', 'governor'].includes(e.entity_type.toLowerCase())
      );
    } else if (activeTab === 'villages') {
      filtered = filtered.filter(e => e.entity_type.toLowerCase() === 'village');
    } else if (activeTab === 'ministries') {
      filtered = filtered.filter(e => e.entity_type.toLowerCase() === 'ministry');
    } else if (activeTab === 'citizens') {
      filtered = filtered.filter(e => e.entity_type.toLowerCase() === 'citizen');
    } else if (activeTab === 'declining') {
      filtered = filtered.filter(e => e.trend_direction === 'down' || e.total_score < 50);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entity =>
        entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(entity => entity.region === selectedRegion);
    }

    // Apply role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(entity => entity.entity_type === selectedRole);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(entity => entity.reputation_badge === selectedStatus);
    }

    // Apply score range filter
    filtered = filtered.filter(entity => 
      entity.total_score >= scoreRange[0] && entity.total_score <= scoreRange[1]
    );

    // Sort entities
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof ReputationEntity];
      const bValue = b[sortBy as keyof ReputationEntity];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEntities(filtered);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (badge: string) => {
    const badgeStyles = {
      excellent: 'bg-green-100 text-green-800 border-green-200',
      trusted: 'bg-blue-100 text-blue-800 border-blue-200',
      under_watch: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      flagged: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return badgeStyles[badge as keyof typeof badgeStyles] || badgeStyles.under_watch;
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const exportData = () => {
    const csvData = filteredEntities.map(entity => ({
      Name: entity.entity_name,
      Type: entity.entity_type,
      Region: entity.region,
      Score: entity.total_score,
      Status: entity.reputation_badge,
      'Total Ratings': entity.total_ratings,
      'Last Updated': new Date(entity.last_calculated_at).toLocaleDateString()
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'civic-reputation-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reputation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🧿 Civic Reputation Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor transparency, performance, and public trust across Cameroon's civic entities
          </p>
        </div>
        <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Hero Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total_entities.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Rated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.officials_count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Officials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.villages_count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Villages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.average_score.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg. Trust Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            National Civic Trust Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Excellent (80-100)
              </span>
              <span>{stats.excellent_percentage.toFixed(1)}%</span>
            </div>
            <Progress value={stats.excellent_percentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Average (50-79)
              </span>
              <span>{(100 - stats.excellent_percentage - stats.poor_percentage).toFixed(1)}%</span>
            </div>
            <Progress 
              value={100 - stats.excellent_percentage - stats.poor_percentage} 
              className="h-2" 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Poor (0-49)
              </span>
              <span>{stats.poor_percentage.toFixed(1)}%</span>
            </div>
            <Progress value={stats.poor_percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Region Filter */}
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="trusted">Trusted</SelectItem>
                <SelectItem value="under_watch">Under Watch</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_score">Score</SelectItem>
                <SelectItem value="entity_name">Name</SelectItem>
                <SelectItem value="total_ratings">Ratings</SelectItem>
                <SelectItem value="last_calculated_at">Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Range Slider */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Score Range: {scoreRange[0]} - {scoreRange[1]}</label>
            <Slider
              value={scoreRange}
              onValueChange={setScoreRange}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="politicians">Top Politicians</TabsTrigger>
          <TabsTrigger value="villages">Top Villages</TabsTrigger>
          <TabsTrigger value="ministries">Top Ministries</TabsTrigger>
          <TabsTrigger value="citizens">Top Citizens</TabsTrigger>
          <TabsTrigger value="declining">Trending Declines</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEntities.length} entities
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Lowest First' : 'Highest First'}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredEntities.map((entity) => (
              <Card key={entity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Entity Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{entity.entity_name}</h3>
                        <Badge className={getScoreBadge(entity.reputation_badge)}>
                          {entity.reputation_badge.replace('_', ' ')}
                        </Badge>
                        {getTrendIcon(entity.trend_direction)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {entity.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {entity.region}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(entity.last_calculated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Reputation Widget */}
                    <div className="flex items-center gap-4">
                      <ReputationWidget
                        score={entity.total_score}
                        level={entity.reputation_badge === 'excellent' ? 'excellent' : entity.reputation_badge === 'trusted' ? 'good' : 'average'}
                        trend={entity.trend_direction === 'up' ? 'rising' : entity.trend_direction === 'down' ? 'falling' : 'stable'}
                        entityName={entity.entity_name}
                        entityType={entity.entity_type}
                        compact={true}
                      />
                      
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getScoreColor(entity.total_score)}`}>
                          {entity.total_score}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entity.total_ratings} ratings
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Score History
                      </Button>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <Separator className="my-4" />
                  <ScoreBreakdown
                    entityType={entity.entity_type}
                    entityId={entity.entity_id}
                    entityName={entity.entity_name}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEntities.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entities found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}