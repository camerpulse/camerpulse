import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Search, 
  Filter,
  Eye,
  DollarSign,
  Building,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';

interface CorruptionEntity {
  id: string;
  name: string;
  entity_type: 'official' | 'company' | 'institution';
  region: string;
  corruption_score: number;
  transparency_score: number;
  total_cases: number;
  verified_cases: number;
  last_updated: string;
  cases: CorruptionCase[];
}

interface CorruptionCase {
  id: string;
  title: string;
  description: string;
  amount: number;
  date_reported: string;
  status: 'investigating' | 'verified' | 'dismissed' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sources: string[];
}

const CorruptionIndex: React.FC = () => {
  const [entities, setEntities] = useState<CorruptionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchCorruptionData();
  }, []);

  const fetchCorruptionData = async () => {
    try {
      // Mock data for now - replace with actual Supabase query
      const mockData: CorruptionEntity[] = [
        {
          id: '1',
          name: 'Ministry of Public Works',
          entity_type: 'institution',
          region: 'Centre',
          corruption_score: 85,
          transparency_score: 15,
          total_cases: 12,
          verified_cases: 8,
          last_updated: '2025-01-15',
          cases: [
            {
              id: '1',
              title: 'Road Construction Tender Irregularities',
              description: 'Inflated contracts for road construction projects in Yaounde',
              amount: 2500000000,
              date_reported: '2024-12-01',
              status: 'investigating',
              severity: 'high',
              sources: ['Cameroon Tribune', 'CONAC Report']
            }
          ]
        },
        {
          id: '2',
          name: 'Port Authority Douala',
          entity_type: 'institution',
          region: 'Littoral',
          corruption_score: 72,
          transparency_score: 28,
          total_cases: 8,
          verified_cases: 5,
          last_updated: '2025-01-10',
          cases: []
        }
      ];
      
      setEntities(mockData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load corruption data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'High Risk', variant: 'destructive' as const };
    if (score >= 60) return { label: 'Medium Risk', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Low Risk', variant: 'outline' as const };
    return { label: 'Clean', variant: 'default' as const };
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || entity.region === selectedRegion;
    const matchesType = selectedType === 'all' || entity.entity_type === selectedType;
    return matchesSearch && matchesRegion && matchesType;
  });

  const nationalStats = {
    totalEntitiesMonitored: entities.length,
    averageCorruptionScore: entities.reduce((sum, e) => sum + e.corruption_score, 0) / entities.length || 0,
    totalCasesReported: entities.reduce((sum, e) => sum + e.total_cases, 0),
    totalVerifiedCases: entities.reduce((sum, e) => sum + e.verified_cases, 0),
    totalAmountInvolved: entities.reduce((sum, e) => 
      sum + e.cases.reduce((caseSum, c) => caseSum + c.amount, 0), 0
    )
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Corruption Transparency Index</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of corruption cases and transparency scores across Cameroon
              </p>
            </div>
          </div>
        </div>

        {/* National Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entities Monitored</p>
                  <p className="text-2xl font-bold">{nationalStats.totalEntitiesMonitored}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Corruption Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(nationalStats.averageCorruptionScore)}`}>
                    {nationalStats.averageCorruptionScore.toFixed(1)}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                  <p className="text-2xl font-bold">{nationalStats.totalCasesReported}</p>
                  <p className="text-sm text-green-600">{nationalStats.totalVerifiedCases} verified</p>
                </div>
                <Eye className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Involved</p>
                  <p className="text-2xl font-bold">
                    {(nationalStats.totalAmountInvolved / 1000000000).toFixed(1)}B FCFA
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="official">Officials</SelectItem>
                  <SelectItem value="company">Companies</SelectItem>
                  <SelectItem value="institution">Institutions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Entity List */}
        <div className="grid gap-4">
          {filteredEntities.map((entity) => {
            const scoreBadge = getScoreBadge(entity.corruption_score);
            return (
              <Card key={entity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{entity.name}</h3>
                        <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
                        <Badge variant="outline" className="capitalize">{entity.entity_type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {entity.region}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {entity.total_cases} cases ({entity.verified_cases} verified)
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Updated {entity.last_updated}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Corruption Score</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-2xl font-bold ${getScoreColor(entity.corruption_score)}`}>
                            {entity.corruption_score}%
                          </p>
                          <Progress 
                            value={entity.corruption_score} 
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Transparency</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-2xl font-bold ${getScoreColor(100 - entity.transparency_score)}`}>
                            {entity.transparency_score}%
                          </p>
                          <Progress 
                            value={entity.transparency_score} 
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredEntities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default CorruptionIndex;