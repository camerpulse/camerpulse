import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart,
  Search,
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Bell
} from 'lucide-react';

interface PromiseData {
  id: string;
  promise_text: string;
  status: string | null;
  date_made?: string | null;
  expected_delivery_date?: string | null;
  regions_targeted?: string[] | null;
  verification_status?: string | null;
  topic_category?: string | null;
  source_type?: string | null;
  priority_level?: string | null;
  public_interest_score?: number | null;
  evidence_url?: string | null;
  description?: string | null;
  politician_name?: string;
  party_name?: string;
  promise_type: 'politician' | 'party';
  public_votes?: {
    fulfilled: number;
    unfulfilled: number;
    in_progress: number;
    no_effort: number;
    total: number;
  };
}

interface PromiseStats {
  total: number;
  fulfilled: number;
  unfulfilled: number;
  in_progress: number;
  no_effort: number;
  overdue: number;
  high_interest: number;
}

export const PromiseTracker: React.FC = () => {
  const [promises, setPromises] = useState<PromiseData[]>([]);
  const [stats, setStats] = useState<PromiseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('interest');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchPromises();
    fetchStats();
  }, [statusFilter, categoryFilter, regionFilter, sortBy]);

  const fetchPromises = async () => {
    try {
      // Fetch politician promises
      let politicianQuery = supabase
        .from('politician_promises')
        .select(`
          *,
          politicians!politician_id (
            name,
            political_parties!political_party_id (
              name
            )
          )
        `);

      // Fetch party promises
      let partyQuery = supabase
        .from('party_promises')
        .select(`
          *,
          political_parties!party_id (
            name
          )
        `);

      // Apply filters
      if (statusFilter !== 'all') {
        politicianQuery = politicianQuery.eq('status', statusFilter);
        partyQuery = partyQuery.eq('status', statusFilter);
      }

      if (categoryFilter !== 'all') {
        politicianQuery = politicianQuery.eq('topic_category', categoryFilter);
        partyQuery = partyQuery.eq('topic_category', categoryFilter);
      }

      const [politicianResult, partyResult] = await Promise.all([
        politicianQuery,
        partyQuery
      ]);

      if (politicianResult.error) throw politicianResult.error;
      if (partyResult.error) throw partyResult.error;

      // Process and combine results
      const politicianPromises = (politicianResult.data || []).map((p: any) => ({
        ...p,
        promise_type: 'politician' as const,
        politician_name: p.politicians?.name || '',
        party_name: p.politicians?.political_parties?.name || ''
      }));

      const partyPromises = (partyResult.data || []).map((p: any) => ({
        ...p,
        promise_type: 'party' as const,
        politician_name: undefined,
        party_name: p.political_parties?.name || ''
      }));

      let allPromises = [...politicianPromises, ...partyPromises];

      // Apply search filter
      if (searchTerm) {
        allPromises = allPromises.filter(p => 
          p.promise_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.politician_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.party_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply region filter
      if (regionFilter !== 'all') {
        allPromises = allPromises.filter(p => 
          p.regions_targeted?.includes(regionFilter)
        );
      }

      // Sort promises
      allPromises.sort((a, b) => {
        switch (sortBy) {
          case 'interest':
            return (b.public_interest_score || 0) - (a.public_interest_score || 0);
          case 'recent':
            return new Date(b.date_made || '').getTime() - new Date(a.date_made || '').getTime();
          case 'overdue':
            const aOverdue = a.expected_delivery_date && new Date(a.expected_delivery_date) < new Date();
            const bOverdue = b.expected_delivery_date && new Date(b.expected_delivery_date) < new Date();
            return (bOverdue ? 1 : 0) - (aOverdue ? 1 : 0);
          default:
            return 0;
        }
      });

      // Fetch public votes for each promise
      const promisesWithVotes = await Promise.all(
        allPromises.map(async (promise: any) => {
          const { data: votes } = await supabase
            .from('promise_public_votes')
            .select('vote_status')
            .eq('promise_id', promise.id)
            .eq('promise_type', promise.promise_type);

          const votesSummary = {
            fulfilled: votes?.filter(v => v.vote_status === 'fulfilled').length || 0,
            unfulfilled: votes?.filter(v => v.vote_status === 'unfulfilled').length || 0,
            in_progress: votes?.filter(v => v.vote_status === 'in_progress').length || 0,
            no_effort: votes?.filter(v => v.vote_status === 'no_effort').length || 0,
            total: votes?.length || 0
          };

          return {
            ...promise,
            public_votes: votesSummary
          } as PromiseData;
        })
      );

      setPromises(promisesWithVotes);
    } catch (error) {
      console.error('Error fetching promises:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les promesses",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      const [politicianResult, partyResult] = await Promise.all([
        supabase.from('politician_promises').select('status, expected_delivery_date, public_interest_score'),
        supabase.from('party_promises').select('status, expected_delivery_date, public_interest_score')
      ]);

      const allPromises = [
        ...(politicianResult.data || []),
        ...(partyResult.data || [])
      ];

      const total = allPromises.length;
      const fulfilled = allPromises.filter(p => p.status === 'fulfilled').length;
      const unfulfilled = allPromises.filter(p => p.status === 'unfulfilled').length;
      const in_progress = allPromises.filter(p => p.status === 'in_progress').length;
      const no_effort = allPromises.filter(p => p.status === 'no_effort').length;
      const overdue = allPromises.filter(p => 
        p.expected_delivery_date && new Date(p.expected_delivery_date) < new Date()
      ).length;
      const high_interest = allPromises.filter(p => 
        (p.public_interest_score || 0) > 70
      ).length;

      setStats({
        total,
        fulfilled,
        unfulfilled,
        in_progress,
        no_effort,
        overdue,
        high_interest
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unfulfilled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_effort':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'unfulfilled':
        return <XCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'no_effort':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

   const getStatusText = (status?: string | null) => {
     switch (status) {
       case 'fulfilled':
         return 'Fulfilled';
       case 'unfulfilled':
         return 'Unfulfilled';
       case 'in_progress':
         return 'In Progress';
       case 'no_effort':
         return 'No Effort';
       default:
         return 'Unknown';
     }
   };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">✓ Vérifié</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800">⚠ Flagged</Badge>;
      case 'disputed':
        return <Badge className="bg-yellow-100 text-yellow-800">? Contesté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>;
    }
  };

  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
              <div className="text-sm text-muted-foreground">Tenues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.unfulfilled}</div>
              <div className="text-sm text-muted-foreground">Unfulfilled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.no_effort}</div>
              <div className="text-sm text-muted-foreground">No Effort</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">En retard</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.high_interest}</div>
              <div className="text-sm text-muted-foreground">Populaires</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fulfillment Rate */}
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Taux de réalisation des promesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {((stats.fulfilled / stats.total) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Promesses tenues sur {stats.total} promesses
                </div>
              </div>
              <Progress 
                value={(stats.fulfilled / stats.total) * 100} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                 <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Statuses</SelectItem>
                 <SelectItem value="fulfilled">Fulfilled</SelectItem>
                 <SelectItem value="in_progress">In Progress</SelectItem>
                 <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                 <SelectItem value="no_effort">No Effort</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="economy">Économie</SelectItem>
                <SelectItem value="security">Sécurité</SelectItem>
                <SelectItem value="governance">Gouvernance</SelectItem>
                <SelectItem value="corruption">Anti-corruption</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Centre">Centre</SelectItem>
                <SelectItem value="Littoral">Littoral</SelectItem>
                <SelectItem value="Ouest">Ouest</SelectItem>
                <SelectItem value="Nord-Ouest">Nord-Ouest</SelectItem>
                <SelectItem value="Sud-Ouest">Sud-Ouest</SelectItem>
                <SelectItem value="Adamaoua">Adamaoua</SelectItem>
                <SelectItem value="Est">Est</SelectItem>
                <SelectItem value="Nord">Nord</SelectItem>
                <SelectItem value="Extrême-Nord">Extrême-Nord</SelectItem>
                <SelectItem value="Sud">Sud</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interest">Intérêt public</SelectItem>
                <SelectItem value="recent">Plus récentes</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setRegionFilter('all');
                setSortBy('interest');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promises List */}
      <div className="space-y-4">
        {promises.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucune promesse trouvée</p>
            </CardContent>
          </Card>
        ) : (
          promises.map((promise) => (
            <Card key={`${promise.promise_type}-${promise.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1">
                        {getStatusIcon(promise.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={getStatusColor(promise.status)}>
                            {getStatusText(promise.status)}
                          </Badge>
                          {getVerificationBadge(promise.verification_status)}
                          {isOverdue(promise.expected_delivery_date) && (
                            <Badge className="bg-red-100 text-red-800">
                              <Clock className="w-3 h-3 mr-1" />
                              En retard
                            </Badge>
                          )}
                          {promise.priority_level === 'high' && (
                            <Badge className="bg-orange-100 text-orange-800">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-foreground mb-2">
                          {promise.promise_text}
                        </h3>
                        
                        {promise.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {promise.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {promise.politician_name && (
                            <span>👤 {promise.politician_name}</span>
                          )}
                          {promise.party_name && (
                            <span>🏛️ {promise.party_name}</span>
                          )}
                          {promise.date_made && (
                            <span>📅 {new Date(promise.date_made).toLocaleDateString('en-US')}</span>
                          )}
                          {promise.expected_delivery_date && (
                            <span>⏰ Expected: {new Date(promise.expected_delivery_date).toLocaleDateString('en-US')}</span>
                          )}
                          {promise.regions_targeted && promise.regions_targeted.length > 0 && (
                            <span>📍 {promise.regions_targeted.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-64 space-y-3">
                    {/* Public Interest Score */}
                    {promise.public_interest_score !== undefined && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Intérêt public</span>
                          <span className="text-sm text-muted-foreground">
                            {promise.public_interest_score}/100
                          </span>
                        </div>
                        <Progress value={promise.public_interest_score} className="h-2" />
                      </div>
                    )}

                    {/* Public Votes */}
                    {promise.public_votes && promise.public_votes.total > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Votes citoyens ({promise.public_votes.total})
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-green-600" />
                            <span>{promise.public_votes.fulfilled}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-red-600" />
                            <span>{promise.public_votes.unfulfilled}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{promise.public_votes.in_progress}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-gray-600" />
                            <span>{promise.public_votes.no_effort}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {promise.evidence_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={promise.evidence_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Preuves
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};