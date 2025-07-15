import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import {
  MapPin,
  Users,
  BarChart3,
  TrendingUp,
  Filter,
  Download,
  AlertTriangle,
  Star,
  Activity,
  Eye,
  UserCheck,
  Crown,
  Flag,
  Gavel,
  RefreshCw
} from 'lucide-react';

// Cameroon regions
const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'West', 'North West', 'South West',
  'North', 'Adamawa', 'East', 'South', 'Far North'
];

interface RegionalData {
  region: string;
  mps: number;
  senators: number;
  ministers: number;
  totalOfficials: number;
  averageRating: number;
  genderBreakdown: {
    male: number;
    female: number;
  };
  partyBreakdown: Array<{
    party: string;
    count: number;
    percentage: number;
  }>;
  roleBreakdown: Array<{
    role: string;
    count: number;
    averageRating: number;
  }>;
  representationIndex: number; // Compare to national average
  verificationRate: number;
  topOfficials: Array<{
    name: string;
    role: string;
    party: string;
    rating: number;
    verified: boolean;
  }>;
}

interface NationalSummary {
  totalOfficials: number;
  totalMPs: number;
  totalSenators: number;
  totalMinisters: number;
  averageRepresentationPerRegion: number;
  dominantParty: string;
  leastRepresentedRegion: string;
  mostRepresentedRegion: string;
  genderBalance: {
    male: number;
    female: number;
  };
}

export const RegionRepAnalytics: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('representation');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [filterRole, setFilterRole] = useState<string>('all');
  const { toast } = useToast();

  // Fetch regional representation data
  const { data: regionalData, isLoading, refetch } = useQuery({
    queryKey: ['regional_representation', selectedRegion, filterRole],
    queryFn: async () => {
      const results: RegionalData[] = [];
      let nationalSummary: NationalSummary = {
        totalOfficials: 0,
        totalMPs: 0,
        totalSenators: 0,
        totalMinisters: 0,
        averageRepresentationPerRegion: 0,
        dominantParty: '',
        leastRepresentedRegion: '',
        mostRepresentedRegion: '',
        genderBalance: { male: 0, female: 0 }
      };

      for (const region of CAMEROON_REGIONS) {
        // Get officials for this region
        let query = supabase
          .from('politicians')
          .select(`
            id,
            name,
            role_title,
            party,
            region,
            gender,
            verified,
            civic_score,
            approval_ratings(rating),
            political_parties(name, acronym)
          `)
          .eq('region', region)
          .neq('is_archived', true);

        if (filterRole !== 'all') {
          if (filterRole === 'MP') {
            query = query.ilike('role_title', '%MP%').or('role_title.ilike.%Member%');
          } else if (filterRole === 'Senator') {
            query = query.ilike('role_title', '%senator%');
          } else if (filterRole === 'Minister') {
            query = query.ilike('role_title', '%minister%');
          }
        }

        const { data: officials, error } = await query;

        if (error) {
          console.error(`Error fetching data for ${region}:`, error);
          continue;
        }

        if (!officials) continue;

        // Calculate statistics for this region
        const mps = officials.filter(o => o.role_title?.toLowerCase().includes('mp') || o.role_title?.toLowerCase().includes('member')).length;
        const senators = officials.filter(o => o.role_title?.toLowerCase().includes('senator')).length;
        const ministers = officials.filter(o => o.role_title?.toLowerCase().includes('minister')).length;
        
        // Gender breakdown
        const genderBreakdown = {
          male: officials.filter(o => o.gender === 'Male').length,
          female: officials.filter(o => o.gender === 'Female').length
        };

        // Party breakdown
        const partyMap = new Map<string, number>();
        officials.forEach(official => {
          const party = official.political_parties?.name || official.party || 'Unknown';
          partyMap.set(party, (partyMap.get(party) || 0) + 1);
        });

        const partyBreakdown = Array.from(partyMap.entries())
          .map(([party, count]) => ({
            party,
            count,
            percentage: officials.length > 0 ? (count / officials.length) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count);

        // Role breakdown with ratings
        const roleMap = new Map<string, { count: number; totalRating: number; ratingCount: number }>();
        officials.forEach(official => {
          const role = official.role_title?.includes('Minister') ? 'Minister' : 
                     official.role_title?.includes('Senator') ? 'Senator' : 
                     (official.role_title?.includes('MP') || official.role_title?.includes('Member')) ? 'MP' : 'Other';
          
          if (!roleMap.has(role)) {
            roleMap.set(role, { count: 0, totalRating: 0, ratingCount: 0 });
          }
          
          const roleData = roleMap.get(role)!;
          roleData.count++;
          
          if (official.approval_ratings && official.approval_ratings.length > 0) {
            const ratings = official.approval_ratings.map((r: any) => r.rating);
            const avgRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
            roleData.totalRating += avgRating;
            roleData.ratingCount++;
          }
        });

        const roleBreakdown = Array.from(roleMap.entries()).map(([role, data]) => ({
          role,
          count: data.count,
          averageRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0
        }));

        // Calculate average rating
        let totalRatings = 0;
        let ratingSum = 0;
        officials.forEach(official => {
          if (official.approval_ratings && official.approval_ratings.length > 0) {
            const ratings = official.approval_ratings.map((r: any) => r.rating);
            totalRatings += ratings.length;
            ratingSum += ratings.reduce((sum: number, rating: number) => sum + rating, 0);
          }
        });
        const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;

        // Top officials by rating
        const topOfficials = officials
          .map(official => {
            const ratings = official.approval_ratings || [];
            const avgRating = ratings.length > 0 
              ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
              : 0;
            
            return {
              name: official.name,
              role: official.role_title || 'Official',
              party: official.political_parties?.acronym || official.party || 'Unknown',
              rating: avgRating,
              verified: official.verified || false
            };
          })
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);

        const verificationRate = officials.length > 0 
          ? (officials.filter(o => o.verified).length / officials.length) * 100 
          : 0;

        const regionData: RegionalData = {
          region,
          mps,
          senators,
          ministers,
          totalOfficials: officials.length,
          averageRating,
          genderBreakdown,
          partyBreakdown,
          roleBreakdown,
          representationIndex: 0, // Will calculate after all regions
          verificationRate,
          topOfficials
        };

        results.push(regionData);

        // Update national summary
        nationalSummary.totalOfficials += officials.length;
        nationalSummary.totalMPs += mps;
        nationalSummary.totalSenators += senators;
        nationalSummary.totalMinisters += ministers;
        nationalSummary.genderBalance.male += genderBreakdown.male;
        nationalSummary.genderBalance.female += genderBreakdown.female;
      }

      // Calculate representation indices
      const avgRepresentation = nationalSummary.totalOfficials / CAMEROON_REGIONS.length;
      nationalSummary.averageRepresentationPerRegion = avgRepresentation;

      results.forEach(region => {
        region.representationIndex = avgRepresentation > 0 
          ? (region.totalOfficials / avgRepresentation) * 100 
          : 100;
      });

      // Find dominant party
      const allParties = new Map<string, number>();
      results.forEach(region => {
        region.partyBreakdown.forEach(party => {
          allParties.set(party.party, (allParties.get(party.party) || 0) + party.count);
        });
      });
      
      const sortedParties = Array.from(allParties.entries()).sort((a, b) => b[1] - a[1]);
      nationalSummary.dominantParty = sortedParties[0]?.[0] || 'Unknown';

      // Find least and most represented regions
      const sortedByRepresentation = [...results].sort((a, b) => a.totalOfficials - b.totalOfficials);
      nationalSummary.leastRepresentedRegion = sortedByRepresentation[0]?.region || '';
      nationalSummary.mostRepresentedRegion = sortedByRepresentation[sortedByRepresentation.length - 1]?.region || '';

      return { regional: results, national: nationalSummary };
    }
  });

  const getSortedRegions = () => {
    if (!regionalData?.regional) return [];
    
    const regions = [...regionalData.regional];
    
    switch (sortBy) {
      case 'representation':
        return regions.sort((a, b) => b.totalOfficials - a.totalOfficials);
      case 'rating':
        return regions.sort((a, b) => b.averageRating - a.averageRating);
      case 'verification':
        return regions.sort((a, b) => b.verificationRate - a.verificationRate);
      case 'alphabetical':
        return regions.sort((a, b) => a.region.localeCompare(b.region));
      default:
        return regions;
    }
  };

  const getRepresentationColor = (index: number) => {
    if (index >= 120) return 'text-green-600 bg-green-50';
    if (index >= 80) return 'text-blue-600 bg-blue-50';
    if (index >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRepresentationLabel = (index: number) => {
    if (index >= 120) return 'Over-represented';
    if (index >= 80) return 'Well represented';
    if (index >= 60) return 'Under-represented';
    return 'Severely under-represented';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  const pieChartData = regionalData?.regional.map((region, index) => ({
    name: region.region,
    value: region.totalOfficials,
    color: COLORS[index % COLORS.length]
  })) || [];

  const barChartData = getSortedRegions().map(region => ({
    region: region.region,
    MPs: region.mps,
    Senators: region.senators,
    Ministers: region.ministers,
    Rating: region.averageRating * 20, // Scale to 0-100
    'Verification Rate': region.verificationRate
  }));

  const comparisonData = getSortedRegions().map(region => ({
    region: region.region.substring(0, 3), // Abbreviate for radar chart
    representation: region.representationIndex,
    rating: region.averageRating * 20,
    verification: region.verificationRate,
    diversity: region.partyBreakdown.length * 10 // Scale diversity metric
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Regional Representation Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of MPs, Senators, and Ministers across Cameroon's 10 regions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {CAMEROON_REGIONS.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="MP">MPs Only</SelectItem>
            <SelectItem value="Senator">Senators Only</SelectItem>
            <SelectItem value="Minister">Ministers Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="representation">Total Representation</SelectItem>
            <SelectItem value="rating">Average Rating</SelectItem>
            <SelectItem value="verification">Verification Rate</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* National Summary */}
      {regionalData?.national && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Officials</p>
                  <p className="text-2xl font-bold text-primary">
                    {regionalData.national.totalOfficials}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MPs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {regionalData.national.totalMPs}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Senators</p>
                  <p className="text-2xl font-bold text-green-600">
                    {regionalData.national.totalSenators}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ministers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {regionalData.national.totalMinisters}
                  </p>
                </div>
                <Gavel className="h-8 w-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dominant Party</p>
                  <p className="text-lg font-bold text-orange-600">
                    {regionalData.national.dominantParty}
                  </p>
                </div>
                <Flag className="h-8 w-8 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Insights */}
      {regionalData?.national && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Most Represented:</strong> {regionalData.national.mostRepresentedRegion} region has the highest number of officials
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Least Represented:</strong> {regionalData.national.leastRepresentedRegion} region needs attention for balanced representation
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <strong>Gender Balance:</strong> {Math.round((regionalData.national.genderBalance.female / (regionalData.national.genderBalance.male + regionalData.national.genderBalance.female)) * 100)}% female representation
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Analytics */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Regional Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Regional Distribution
                </CardTitle>
                <CardDescription>
                  Total officials by region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Role Distribution by Region */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Roles by Region
                </CardTitle>
                <CardDescription>
                  MPs, Senators, and Ministers distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="region" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="MPs" fill="#0088FE" />
                    <Bar dataKey="Senators" fill="#00C49F" />
                    <Bar dataKey="Ministers" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Regional Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {getSortedRegions().slice(0, 10).map((region) => (
              <Card key={region.region} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {region.region}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Officials:</span>
                    <span className="font-bold">{region.totalOfficials}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>MPs: {region.mps}</span>
                      <span>Senators: {region.senators}</span>
                    </div>
                    <div className="text-xs">Ministers: {region.ministers}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Avg Rating:</span>
                      <span className="font-medium">{region.averageRating.toFixed(1)}★</span>
                    </div>
                    <Progress value={region.averageRating * 20} className="h-1" />
                  </div>

                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRepresentationColor(region.representationIndex)}`}
                  >
                    {getRepresentationLabel(region.representationIndex)}
                  </Badge>

                  {region.partyBreakdown.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Dominant: {region.partyBreakdown[0].party} ({region.partyBreakdown[0].count})
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {/* Performance vs Verification Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance vs Verification Rate</CardTitle>
              <CardDescription>
                Comparison of average ratings and profile verification rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="region" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Rating" fill="#8884d8" name="Average Rating (%)" />
                  <Line 
                    type="monotone" 
                    dataKey="Verification Rate" 
                    stroke="#ff7300" 
                    strokeWidth={3}
                    name="Verification Rate (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Regional Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getSortedRegions().map((region) => (
              <Card key={region.region}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {region.region} Region Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Party Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-2">Political Parties</h4>
                    <div className="space-y-1">
                      {region.partyBreakdown.slice(0, 3).map((party, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{party.party}</span>
                          <div className="flex items-center gap-2">
                            <span>{party.count}</span>
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${party.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Officials */}
                  <div>
                    <h4 className="font-semibold mb-2">Top Rated Officials</h4>
                    <div className="space-y-2">
                      {region.topOfficials.slice(0, 3).map((official, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                          <div>
                            <div className="font-medium">{official.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {official.role} • {official.party}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{official.rating.toFixed(1)}</span>
                            {official.verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-2">Gender Distribution</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Male: {region.genderBreakdown.male}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-pink-500 rounded"></div>
                        <span>Female: {region.genderBreakdown.female}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {/* Radar Chart Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Multi-dimensional Regional Comparison</CardTitle>
              <CardDescription>
                Representation, rating, verification, and diversity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={comparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="region" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Representation Index"
                    dataKey="representation"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Rating Score"
                    dataKey="rating"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Verification Rate"
                    dataKey="verification"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Representation Index Ranking */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Representation Index Ranking</CardTitle>
              <CardDescription>
                Regions ranked by representation compared to national average (100% = average)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getSortedRegions()
                  .sort((a, b) => b.representationIndex - a.representationIndex)
                  .map((region, index) => (
                  <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.totalOfficials} officials • {region.averageRating.toFixed(1)}★ rating
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={getRepresentationColor(region.representationIndex)}
                      >
                        {region.representationIndex.toFixed(0)}%
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getRepresentationLabel(region.representationIndex)}
                      </div>
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