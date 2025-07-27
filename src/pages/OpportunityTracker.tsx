import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  Filter,
  Search,
  Plus,
  ExternalLink,
  Target,
  Briefcase,
  PiggyBank,
  Award
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EconomicOpportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  region: string;
  village_id?: string;
  funding_amount?: number;
  funding_currency: string;
  application_deadline?: string;
  eligibility_criteria: string[];
  contact_info: any;
  status: string;
  priority_level: string;
  created_by?: string;
  created_at: string;
}

const OpportunityTracker: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<EconomicOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<EconomicOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const opportunityTypes = [
    { value: 'business', label: 'Business Opportunities', icon: Building2, color: 'bg-blue-500' },
    { value: 'investment', label: 'Investment Projects', icon: TrendingUp, color: 'bg-green-500' },
    { value: 'funding', label: 'Funding & Grants', icon: PiggyBank, color: 'bg-purple-500' },
    { value: 'job', label: 'Job Opportunities', icon: Briefcase, color: 'bg-orange-500' }
  ];

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  useEffect(() => {
    fetchOpportunities();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm, selectedType, selectedRegion]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('economic_opportunities')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('opportunities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'economic_opportunities'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOpportunities(prev => [payload.new as EconomicOpportunity, ...prev]);
            toast({
              title: "New Opportunity",
              description: "A new economic opportunity has been posted!",
            });
          } else if (payload.eventType === 'UPDATE') {
            setOpportunities(prev => 
              prev.map(opp => opp.id === payload.new.id ? payload.new as EconomicOpportunity : opp)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(opp => opp.opportunity_type === selectedType);
    }

    if (selectedRegion) {
      filtered = filtered.filter(opp => opp.region === selectedRegion);
    }

    setFilteredOpportunities(filtered);
  };

  const getTypeConfig = (type: string) => {
    return opportunityTypes.find(t => t.value === type) || opportunityTypes[0];
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  };

  const getStatistics = () => {
    const totalFunding = opportunities
      .filter(opp => opp.funding_amount)
      .reduce((sum, opp) => sum + (opp.funding_amount || 0), 0);

    const typeDistribution = opportunityTypes.map(type => ({
      ...type,
      count: opportunities.filter(opp => opp.opportunity_type === type.value).length
    }));

    return {
      totalOpportunities: opportunities.length,
      totalFunding,
      typeDistribution,
      urgentOpportunities: opportunities.filter(opp => 
        opp.application_deadline && isDeadlineApproaching(opp.application_deadline)
      ).length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Economic Opportunity Tracker</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl">
            Discover funding, business opportunities, and economic development projects across Cameroon
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {stats.totalOpportunities} Active Opportunities
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {formatAmount(stats.totalFunding, 'XAF')} Available Funding
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.typeDistribution.map((type) => (
            <Card key={type.value}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${type.color} text-white`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{type.count}</p>
                    <p className="text-sm text-muted-foreground">{type.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="p-2 border rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                {opportunityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                className="p-2 border rounded-md"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {user && (
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post Opportunity
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Opportunities Alert */}
        {stats.urgentOpportunities > 0 && (
          <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-800">Urgent: Deadlines Approaching</h3>
                  <p className="text-sm text-red-700">
                    {stats.urgentOpportunities} opportunities have application deadlines within 7 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opportunities Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => {
            const typeConfig = getTypeConfig(opportunity.opportunity_type);
            const isUrgent = opportunity.application_deadline && 
              isDeadlineApproaching(opportunity.application_deadline);

            return (
              <Card key={opportunity.id} className={`relative ${isUrgent ? 'ring-2 ring-red-500' : ''}`}>
                {isUrgent && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-red-500">Urgent</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${typeConfig.color} text-white`}>
                        <typeConfig.icon className="h-4 w-4" />
                      </div>
                      <Badge 
                        className={`${priorityColors[opportunity.priority_level as keyof typeof priorityColors]} text-white`}
                      >
                        {opportunity.priority_level}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {opportunity.region} Region
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {opportunity.description}
                  </p>

                  {opportunity.funding_amount && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">
                        {formatAmount(opportunity.funding_amount, opportunity.funding_currency)}
                      </span>
                    </div>
                  )}

                  {opportunity.application_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">
                        Deadline: {new Date(opportunity.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {opportunity.eligibility_criteria.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Eligibility:</p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.eligibility_criteria.slice(0, 3).map((criteria, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {criteria}
                          </Badge>
                        ))}
                        {opportunity.eligibility_criteria.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{opportunity.eligibility_criteria.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new opportunities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OpportunityTracker;