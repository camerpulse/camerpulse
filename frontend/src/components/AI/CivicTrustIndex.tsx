import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Scale, 
  Building2, 
  Vote, 
  Radio, 
  Heart, 
  GraduationCap, 
  MapPin,
  Calendar,
  Star,
  MessageCircle,
  Users,
  BarChart3,
  Filter,
  Eye,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  description: string;
  region: string | null;
  is_active: boolean;
}

interface TrustScore {
  id: string;
  institution_id: string;
  date_recorded: string;
  overall_trust_score: number;
  region: string | null;
  sentiment_based_score: number | null;
  keyword_score: number | null;
  user_feedback_score: number | null;
  content_volume: number | null;
  institution?: Institution;
}

interface TrustEvent {
  id: string;
  institution_id: string;
  event_title: string;
  event_description: string | null;
  event_date: string;
  event_type: string;
  trust_impact_score: number | null;
  source_url: string | null;
  regions_affected: string[];
  institution?: Institution;
}

interface UserFeedback {
  trust_rating: number;
  comment: string;
}

const CivicTrustIndex = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [trustScores, setTrustScores] = useState<TrustScore[]>([]);
  const [trustEvents, setTrustEvents] = useState<TrustEvent[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('National');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [userFeedback, setUserFeedback] = useState<UserFeedback>({ trust_rating: 3, comment: '' });
  const [selectedInstitutionForFeedback, setSelectedInstitutionForFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const institutionIcons: Record<string, React.ReactNode> = {
    presidency: <Building2 className="h-5 w-5" />,
    parliament: <Vote className="h-5 w-5" />,
    judiciary: <Scale className="h-5 w-5" />,
    police: <Shield className="h-5 w-5" />,
    electoral_commission: <Vote className="h-5 w-5" />,
    state_media: <Radio className="h-5 w-5" />,
    public_health: <Heart className="h-5 w-5" />,
    education_ministry: <GraduationCap className="h-5 w-5" />,
    local_councils: <MapPin className="h-5 w-5" />
  };

  const regions = [
    'National', 'Adamawa', 'Centre', 'East', 'Far North', 
    'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    loadTrustData();
  }, [selectedRegion, selectedInstitution]);

  const loadTrustData = async () => {
    try {
      setIsLoading(true);

      // Load institutions
      const { data: institutionsData } = await supabase
        .from('institutions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Load trust scores with institutions
      let scoresQuery = supabase
        .from('institutional_trust_scores')
        .select(`
          *,
          institution:institutions(*)
        `)
        .order('date_recorded', { ascending: false });

      if (selectedRegion !== 'National') {
        scoresQuery = scoresQuery.eq('region', selectedRegion);
      }

      if (selectedInstitution !== 'all') {
        scoresQuery = scoresQuery.eq('institution_id', selectedInstitution);
      }

      const { data: scoresData } = await scoresQuery.limit(50);

      // Load recent trust events
      const { data: eventsData } = await supabase
        .from('trust_events')
        .select(`
          *,
          institution:institutions(*)
        `)
        .order('event_date', { ascending: false })
        .limit(20);

      setInstitutions(institutionsData || []);
      setTrustScores(scoresData || []);
      setTrustEvents(eventsData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading trust data:', error);
      setIsLoading(false);
    }
  };

  const submitUserFeedback = async () => {
    if (!selectedInstitutionForFeedback) {
      toast({
        title: "Please select an institution",
        description: "Choose an institution to rate before submitting feedback.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit feedback.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_trust_feedback')
        .upsert({
          user_id: user.id,
          institution_id: selectedInstitutionForFeedback,
          trust_rating: userFeedback.trust_rating,
          comment: userFeedback.comment,
          region: selectedRegion !== 'National' ? selectedRegion : null
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback on institutional trust."
      });

      setUserFeedback({ trust_rating: 3, comment: '' });
      setSelectedInstitutionForFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const getTrustLevel = (score: number): { level: string; color: string } => {
    if (score >= 80) return { level: 'Very High', color: 'text-green-600' };
    if (score >= 60) return { level: 'High', color: 'text-blue-600' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600' };
    if (score >= 20) return { level: 'Low', color: 'text-orange-600' };
    return { level: 'Very Low', color: 'text-red-600' };
  };

  const getTopTrusted = () => {
    const latest = trustScores.reduce((acc, score) => {
      if (!acc[score.institution_id] || 
          new Date(score.date_recorded) > new Date(acc[score.institution_id].date_recorded)) {
        acc[score.institution_id] = score;
      }
      return acc;
    }, {} as Record<string, TrustScore>);

    return Object.values(latest)
      .sort((a, b) => b.overall_trust_score - a.overall_trust_score)
      .slice(0, 5);
  };

  const getLowestTrusted = () => {
    const latest = trustScores.reduce((acc, score) => {
      if (!acc[score.institution_id] || 
          new Date(score.date_recorded) > new Date(acc[score.institution_id].date_recorded)) {
        acc[score.institution_id] = score;
      }
      return acc;
    }, {} as Record<string, TrustScore>);

    return Object.values(latest)
      .sort((a, b) => a.overall_trust_score - b.overall_trust_score)
      .slice(0, 5);
  };

  const nationalTrustAverage = trustScores.length > 0 
    ? trustScores.reduce((acc, score) => acc + score.overall_trust_score, 0) / trustScores.length
    : 50;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Civic Trust Index</span>
          </CardTitle>
          <CardDescription>
            Real-time monitoring of public trust in national institutions using sentiment analysis and citizen feedback
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">National Trust Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrustLevel(nationalTrustAverage).color}`}>
              {nationalTrustAverage.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={nationalTrustAverage} className="flex-1" />
              <Badge variant="outline" className="text-xs">
                {getTrustLevel(nationalTrustAverage).level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutions Tracked</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutions.length}</div>
            <p className="text-xs text-muted-foreground">Active monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trustEvents.length}</div>
            <p className="text-xs text-muted-foreground">Tracked this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Institution</label>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Trust Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustScores.slice(0, 9).map((score) => (
              <Card key={score.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    {institutionIcons[score.institution?.institution_type || ''] || <Building2 className="h-4 w-4" />}
                    <span className="truncate">{score.institution?.name}</span>
                  </CardTitle>
                  <Badge variant={score.overall_trust_score >= 60 ? 'default' : 
                               score.overall_trust_score >= 40 ? 'secondary' : 'destructive'}>
                    {score.overall_trust_score.toFixed(1)}%
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Progress value={score.overall_trust_score} className="mb-2" />
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Sentiment:</span>
                      <div className="font-medium">{score.sentiment_based_score?.toFixed(1) || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Keywords:</span>
                      <div className="font-medium">{score.keyword_score?.toFixed(1) || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User:</span>
                      <div className="font-medium">{score.user_feedback_score?.toFixed(1) || 'N/A'}</div>
                    </div>
                  </div>
                  {score.region && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {score.region}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Trusted */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Most Trusted Institutions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopTrusted().map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                        {institutionIcons[score.institution?.institution_type || ''] || <Building2 className="h-4 w-4" />}
                        <span className="font-medium">{score.institution?.name}</span>
                      </div>
                      <Badge variant="default">
                        {score.overall_trust_score.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lowest Trusted */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Lowest Trust Scores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getLowestTrusted().map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                        {institutionIcons[score.institution?.institution_type || ''] || <Building2 className="h-4 w-4" />}
                        <span className="font-medium">{score.institution?.name}</span>
                      </div>
                      <Badge variant="destructive">
                        {score.overall_trust_score.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Trust-Related Events</span>
              </CardTitle>
              <CardDescription>
                Events that have impacted public trust in institutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trustEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-primary pl-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {institutionIcons[event.institution?.institution_type || ''] || <Building2 className="h-4 w-4" />}
                          <span className="font-medium">{event.institution?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{event.event_title}</h4>
                        {event.event_description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.event_description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          {event.regions_affected.length > 0 && (
                            <span>Regions: {event.regions_affected.join(', ')}</span>
                          )}
                        </div>
                      </div>
                      {event.trust_impact_score && (
                        <Badge variant={event.trust_impact_score > 0 ? 'default' : 'destructive'}>
                          {event.trust_impact_score > 0 ? '+' : ''}{event.trust_impact_score.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Submit Trust Feedback</span>
              </CardTitle>
              <CardDescription>
                Rate your trust in national institutions and help improve public accountability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Institution</label>
                <Select value={selectedInstitutionForFeedback} onValueChange={setSelectedInstitutionForFeedback}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution to rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Trust Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={userFeedback.trust_rating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserFeedback(prev => ({ ...prev, trust_rating: rating }))}
                    >
                      <Star className={`h-4 w-4 ${userFeedback.trust_rating >= rating ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {userFeedback.trust_rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
                <Textarea
                  placeholder="Share your thoughts on this institution..."
                  value={userFeedback.comment}
                  onChange={(e) => setUserFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button onClick={submitUserFeedback} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicTrustIndex;