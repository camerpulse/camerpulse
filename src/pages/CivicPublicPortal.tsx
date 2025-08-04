import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileForm, MobileFormField, MobileInput, MobileTextarea, MobileButton } from '@/components/ui/mobile-form';
import { MobileFAB } from '@/components/ui/mobile-fab';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardTitle } from '@/components/ui/mobile-card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { AdminConfigPanel } from '@/components/CivicPortal/AdminConfigPanel';
import { DataVisualization } from '@/components/CivicPortal/DataVisualization';
import { 
  TrendingUp, 
  MapPin, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  Send,
  Shield,
  Globe,
  Clock,
  Smartphone,
  Wifi,
  Signal,
  Lock,
  Info,
  Users,
  Building2,
  Star,
  CheckCircle,
  XCircle,
  Target,
  FileText,
  Download,
  Filter,
  Search,
  BarChart3,
  Award,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Mail,
  Plus,
  Share2,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Link } from 'react-router-dom';

interface CivicReport {
  location: string;
  issue: string;
  emotion: string;
  description: string;
  isAnonymous: boolean;
}

interface RegionalMood {
  region: string;
  sentiment: number;
  dangerLevel: string;
  topIssues: string[];
}

interface TrendingIssue {
  issue: string;
  emotionBreakdown: {
    anger: number;
    hope: number;
    sadness: number;
    fear: number;
  };
  volume: number;
}

interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  approval_rating: number;
  total_ratings: number;
  mps_count: number;
  senators_count: number;
  mayors_count: number;
  political_leaning?: string;
  headquarters_region?: string;
  promises_fulfilled: number;
  promises_total: number;
}

interface Politician {
  id: string;
  name: string;
  role_title?: string;
  region?: string;
  party?: string;
  profile_image_url?: string;
  civic_score: number;
  average_rating?: number;
  total_ratings?: number;
  promises_fulfilled: number;
  promises_total: number;
  verified: boolean;
}

interface TransparencyReport {
  id: string;
  title: string;
  description: string;
  file_url?: string;
  report_type: string;
  published_date: string;
  author: string;
  download_count: number;
}

const CivicPublicPortal = () => {
  const [nationalSentiment, setNationalSentiment] = useState(0);
  const [diasporaSentiment, setDiasporaSentiment] = useState(0);
  const [trendingIssues, setTrendingIssues] = useState<TrendingIssue[]>([]);
  const [regionalMoods, setRegionalMoods] = useState<RegionalMood[]>([]);
  const [politicalParties, setPoliticalParties] = useState<PoliticalParty[]>([]);
  const [topPoliticians, setTopPoliticians] = useState<Politician[]>([]);
  const [transparencyReports, setTransparencyReports] = useState<TransparencyReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRegion, setUserRegion] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [isAdminView, setIsAdminView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [report, setReport] = useState<CivicReport>({
    location: '',
    issue: '',
    emotion: '',
    description: '',
    isAnonymous: true
  });
  const { toast } = useToast();
  
  // Use visibility controls
  const { isModuleVisible, getRestrictedMessage, userRole, loading: visibilityLoading } = useModuleVisibility(userRegion);

  useEffect(() => {
    if (!visibilityLoading) {
      loadPublicData();
      const interval = setInterval(loadPublicData, 60000);
      return () => clearInterval(interval);
    }
  }, [visibilityLoading]);

  const loadPublicData = async () => {
    try {
      // Load sentiment data
      if (isModuleVisible('trending_topics')) {
        const { data: sentiments } = await supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('sentiment_score, region_detected')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (sentiments && sentiments.length > 0) {
          const nationalAvg = sentiments.reduce((acc, s) => acc + (s.sentiment_score || 0), 0) / sentiments.length;
          setNationalSentiment(nationalAvg);
          setDiasporaSentiment(nationalAvg + 0.1);
        }
      }

      // Load regional data  
      if (isModuleVisible('regional_sentiment')) {
        const { data: regional } = await supabase
          .from('camerpulse_intelligence_regional_sentiment')
          .select('*')
          .gte('date_recorded', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (regional) {
          const moods = regional.map(r => ({
            region: r.region,
            sentiment: r.overall_sentiment || 0,
            dangerLevel: r.threat_level || 'low',
            topIssues: r.top_concerns || []
          }));
          setRegionalMoods(moods);
        }
      }

      // Load trending topics
      if (isModuleVisible('trending_topics')) {
        const { data: trending } = await supabase
          .from('camerpulse_intelligence_trending_topics')
          .select('topic_text, emotional_breakdown, volume_score')
          .order('volume_score', { ascending: false })
          .limit(5);

        if (trending) {
          const issues = trending.map(t => ({
            issue: t.topic_text,
            emotionBreakdown: typeof t.emotional_breakdown === 'object' && t.emotional_breakdown !== null ? 
              t.emotional_breakdown as { anger: number; hope: number; sadness: number; fear: number; } : 
              { anger: 20, hope: 30, sadness: 25, fear: 25 },
            volume: t.volume_score || 0
          }));
          setTrendingIssues(issues);
        }
      }

      // Load political parties
      const { data: parties } = await supabase
        .from('political_parties')
        .select('*')
        .eq('is_active', true)
        .order('approval_rating', { ascending: false })
        .limit(6);

      if (parties) {
        const partiesWithPromises = await Promise.all(
          parties.map(async (party) => {
            const { data: promises } = await supabase
              .from('politician_promises')
              .select('status')
              .in('politician_id', 
                await supabase
                  .from('politicians')
                  .select('id')
                  .eq('political_party_id', party.id)
                  .then(({ data }) => data?.map(p => p.id) || [])
              );

            const fulfilled = promises?.filter(p => p.status === 'fulfilled').length || 0;
            const total = promises?.length || 0;

            return {
              ...party,
              promises_fulfilled: fulfilled,
              promises_total: total
            };
          })
        );
        setPoliticalParties(partiesWithPromises);
      }

      // Load top politicians
      const { data: politicians } = await supabase
        .from('politicians')
        .select(`
          *,
          politician_promises(status)
        `)
        .eq('is_archived', false)
        .order('civic_score', { ascending: false })
        .limit(8);

      if (politicians) {
        const politiciansWithPromises = politicians.map(p => {
          const promises = p.politician_promises || [];
          const fulfilled = promises.filter(pr => pr.status === 'fulfilled').length;
          const total = promises.length;

          return {
            ...p,
            promises_fulfilled: fulfilled,
            promises_total: total,
            politician_promises: undefined
          };
        });
        setTopPoliticians(politiciansWithPromises);
      }

      // Load transparency reports (mock data for now)
      const mockReports: TransparencyReport[] = [
        {
          id: '1',
          title: 'National Budget 2024 - Transparency Report',
          description: 'Comprehensive analysis of national budget allocation and spending transparency across all ministries.',
          report_type: 'Budget Analysis',
          published_date: '2024-01-15',
          author: 'Ministry of Finance',
          download_count: 1250
        },
        {
          id: '2',
          title: 'Municipal Development Projects - Progress Report',
          description: 'Quarterly update on municipal infrastructure projects and their completion status.',
          report_type: 'Development',
          published_date: '2024-01-10',
          author: 'Local Development Ministry',
          download_count: 890
        },
        {
          id: '3',
          title: 'Electoral Commission Financial Audit',
          description: 'Independent audit of ELECAM financial management and election expenditures.',
          report_type: 'Audit',
          published_date: '2024-01-05',
          author: 'Supreme State Audit',
          download_count: 2100
        },
        {
          id: '4',
          title: 'Healthcare System Performance Metrics',
          description: 'Annual report on healthcare delivery, hospital performance, and medical supply chains.',
          report_type: 'Healthcare',
          published_date: '2023-12-20',
          author: 'Ministry of Public Health',
          download_count: 750
        },
        {
          id: '5',
          title: 'Education Sector Transparency Initiative',
          description: 'Report on school funding, teacher deployment, and educational infrastructure development.',
          report_type: 'Education',
          published_date: '2023-12-15',
          author: 'Ministry of Basic Education',
          download_count: 620
        },
        {
          id: '6',
          title: 'Anti-Corruption Commission Annual Report',
          description: 'Overview of corruption cases investigated, prosecutions initiated, and asset recovery.',
          report_type: 'Anti-Corruption',
          published_date: '2023-12-01',
          author: 'CONAC',
          download_count: 1800
        }
      ];
      setTransparencyReports(mockReports);

    } catch (error) {
      console.error('Error loading public data:', error);
    }
  };

  const submitCivicReport = async () => {
    if (!report.description || !report.location || !report.issue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .insert({
          content_text: report.description,
          platform: 'Civic_Public_Portal',
          sentiment_polarity: 'neutral',
          region_detected: report.location,
          content_category: [report.issue],
          emotional_tone: [report.emotion],
          author_handle: report.isAnonymous ? 'anonymous_citizen' : 'verified_citizen',
          flagged_for_review: true
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your civic report has been submitted for review. Thank you for contributing to our national dialogue.",
      });

      setReport({
        location: '',
        issue: '',
        emotion: '',
        description: '',
        isAnonymous: true
      });

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-success';
    if (score > 0) return 'text-warning';
    return 'text-destructive';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score > 0) return 'Neutral';
    return 'Negative';
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDangerLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Critical';
      case 'high': return 'High Alert';
      case 'medium': return 'Watch';
      case 'low': return 'Safe';
      default: return 'Unknown';
    }
  };

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const civicIssues = [
    'Education', 'Healthcare', 'Security', 'Infrastructure',
    'Fuel/Energy', 'Employment', 'Governance', 'Elections',
    'Environment', 'Economy', 'Justice', 'Transportation'
  ];

  const emotions = [
    'Hope', 'Anger', 'Sadness', 'Fear', 'Frustration',
    'Joy', 'Concern', 'Optimism', 'Disappointment'
  ];

  const ratePolitician = async (politicianId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('approval_ratings')
        .upsert({
          politician_id: politicianId,
          user_id: '00000000-0000-0000-0000-000000000000', // Anonymous rating
          rating: rating
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!"
      });

      loadPublicData(); // Refresh data
    } catch (error) {
      console.error('Error rating politician:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    }
  };

  const RatingStars = ({ politicianId, averageRating = 0, readOnly = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readOnly && ratePolitician(politicianId, star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
            className={`w-4 h-4 ${
              star <= (hoverRating || averageRating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${!readOnly ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {averageRating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Filter and sort functions
  const filterPoliticians = (politicians: Politician[]) => {
    return politicians.filter(politician => {
      const matchesSearch = politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           politician.role_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           politician.region?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = regionFilter === 'all' || politician.region === regionFilter;
      const matchesPerformance = performanceFilter === 'all' || 
                                (performanceFilter === 'high' && (politician.civic_score || 0) >= 70) ||
                                (performanceFilter === 'medium' && (politician.civic_score || 0) >= 40 && (politician.civic_score || 0) < 70) ||
                                (performanceFilter === 'low' && (politician.civic_score || 0) < 40);
      
      return matchesSearch && matchesRegion && matchesPerformance;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'civic_score':
          return (b.civic_score || 0) - (a.civic_score || 0);
        case 'promises':
          return (b.promises_fulfilled / Math.max(b.promises_total, 1)) - (a.promises_fulfilled / Math.max(a.promises_total, 1));
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filterParties = (parties: PoliticalParty[]) => {
    return parties.filter(party => {
      const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           party.acronym?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = regionFilter === 'all' || party.headquarters_region === regionFilter;
      
      return matchesSearch && matchesRegion;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.approval_rating || 0) - (a.approval_rating || 0);
        case 'promises':
          return (b.promises_fulfilled / Math.max(b.promises_total, 1)) - (a.promises_fulfilled / Math.max(a.promises_total, 1));
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  // Prepare visualization data
  const visualizationData = {
    sentimentData: [
      { date: '2024-01', sentiment: 0.2, volume: 1200 },
      { date: '2024-02', sentiment: 0.1, volume: 1350 },
      { date: '2024-03', sentiment: -0.1, volume: 1450 },
      { date: '2024-04', sentiment: 0.3, volume: 1600 },
      { date: '2024-05', sentiment: 0.15, volume: 1550 },
      { date: '2024-06', sentiment: 0.4, volume: 1800 },
    ],
    regionalData: regionalMoods.map(mood => ({
      region: mood.region,
      sentiment: mood.sentiment,
      population: Math.floor(Math.random() * 1000000) + 500000
    })),
    politicalData: politicalParties.slice(0, 6).map(party => ({
      party: party.acronym || party.name.substring(0, 10),
      approval: party.approval_rating || 0,
      seats: party.mps_count + party.senators_count
    })),
    trendingTopics: trendingIssues.map(issue => ({
      topic: issue.issue.substring(0, 15),
      volume: issue.volume,
      sentiment: Object.values(issue.emotionBreakdown).reduce((a, b) => a + b, 0) / 4
    })),
    emotionData: [
      { emotion: 'Hope', value: 65 },
      { emotion: 'Anger', value: 45 },
      { emotion: 'Fear', value: 35 },
      { emotion: 'Joy', value: 55 },
      { emotion: 'Sadness', value: 40 },
      { emotion: 'Trust', value: 60 }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header - Responsive */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                  Civic Transparency Portal
                </h1>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl">
                Comprehensive civic insights, political transparency, and citizen engagement platform for Cameroon
              </p>
            </div>
            
            {/* Admin Toggle */}
            <div className="flex items-center space-x-4">
              <Button
                variant={isAdminView ? "secondary" : "outline"}
                onClick={() => setIsAdminView(!isAdminView)}
                className="text-xs"
              >
                {isAdminView ? 'Public View' : 'Admin View'}
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto text-center">
              Real-time civic intelligence and democratic transparency
            </p>
            
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mt-4">
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50 text-xs sm:text-sm">
                <Target className="h-3 w-3 mr-1" />
                Transparency
              </Badge>
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50 text-xs sm:text-sm">
                <Users className="h-3 w-3 mr-1" />
                Civic Engagement
              </Badge>
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50 text-xs sm:text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Accountability
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Mobile-Native Mood Overview - Stacked on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg">National Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${getSentimentColor(nationalSentiment)}`}>
                {getSentimentLabel(nationalSentiment)}
              </div>
              <Progress value={(nationalSentiment + 1) * 50} className="mb-2 h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Score: {nationalSentiment.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg">Diaspora Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${getSentimentColor(diasporaSentiment)}`}>
                {getSentimentLabel(diasporaSentiment)}
              </div>
              <Progress value={(diasporaSentiment + 1) * 50} className="mb-2 h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Score: {diasporaSentiment.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg">Mood Comparison</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold">
                  {Math.abs(nationalSentiment - diasporaSentiment) < 0.1 ? 'Aligned' : 
                   nationalSentiment > diasporaSentiment ? 'Home Higher' : 'Diaspora Higher'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Difference: {Math.abs(nationalSentiment - diasporaSentiment).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Native Navigation Tabs - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className={`grid w-full ${isAdminView ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-9' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'} min-w-fit h-auto p-1`}>
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="parties" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Building2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Parties</span>
              </TabsTrigger>
              <TabsTrigger value="politicians" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Politicians</span>
              </TabsTrigger>
              <TabsTrigger value="promises" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Target className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Promises</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="regions" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Regions</span>
              </TabsTrigger>
              <TabsTrigger value="civic-report" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Report</span>
              </TabsTrigger>
              {isAdminView && (
                <TabsTrigger value="admin" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Admin Configuration Panel */}
          {isAdminView && (
            <TabsContent value="admin" className="space-y-4">
              <AdminConfigPanel />
            </TabsContent>
          )}

          {/* Data Visualization Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Professional Data Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataVisualization {...visualizationData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Advanced Search and Filters */}
            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Search & Filter</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              {showMobileFilters && (
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search politicians, parties, regions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {cameroonRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Performance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Performance</SelectItem>
                        <SelectItem value="high">High (70%+)</SelectItem>
                        <SelectItem value="medium">Medium (40-70%)</SelectItem>
                        <SelectItem value="low">Low (&lt;40%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="civic_score">Civic Score</SelectItem>
                      <SelectItem value="promises">Promise Fulfillment</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              )}
            </Card>
            {/* National Mood Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <MobileCard className="transition-all duration-200 hover:shadow-md">
                <MobileCardHeader className="text-center pb-3">
                  <MobileCardTitle className="text-base sm:text-lg">National Mood</MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent className="text-center pt-0">
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${getSentimentColor(nationalSentiment)}`}>
                    {getSentimentLabel(nationalSentiment)}
                  </div>
                  <Progress value={(nationalSentiment + 1) * 50} className="mb-2 h-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Score: {nationalSentiment.toFixed(2)}
                  </p>
                </MobileCardContent>
              </MobileCard>

              <MobileCard className="transition-all duration-200 hover:shadow-md">
                <MobileCardHeader className="text-center pb-3">
                  <MobileCardTitle className="text-base sm:text-lg">Active Parties</MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent className="text-center pt-0">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-primary">
                    {politicalParties.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Political parties monitored
                  </p>
                </MobileCardContent>
              </MobileCard>

              <MobileCard className="transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
                <MobileCardHeader className="text-center pb-3">
                  <MobileCardTitle className="text-base sm:text-lg">Officials Tracked</MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent className="text-center pt-0">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-secondary">
                    {topPoliticians.length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Active politicians
                  </p>
                </MobileCardContent>
              </MobileCard>
            </div>

            {/* Trending Issues */}
            {!isModuleVisible('trending_topics') ? (
              <Alert className="border-l-4 border-l-orange-500 bg-orange-50">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Restricted Content:</strong> {getRestrictedMessage('trending_topics')}
                </AlertDescription>
              </Alert>
            ) : (
              <MobileCard>
                <MobileCardHeader className="pb-4">
                  <MobileCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Top Civic Issues</span>
                  </MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {trendingIssues.slice(0, 3).map((issue, idx) => (
                      <div key={idx} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate flex-1 pr-2">
                            {issue.issue}
                          </h3>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            Vol: {issue.volume}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="text-center p-2 rounded bg-muted/50">
                            <div className="text-destructive font-semibold text-sm sm:text-base">{issue.emotionBreakdown.anger}%</div>
                            <div className="text-muted-foreground text-xs">Anger</div>
                          </div>
                          <div className="text-center p-2 rounded bg-muted/50">
                            <div className="text-success font-semibold text-sm sm:text-base">{issue.emotionBreakdown.hope}%</div>
                            <div className="text-muted-foreground text-xs">Hope</div>
                          </div>
                          <div className="text-center p-2 rounded bg-muted/50">
                            <div className="text-primary font-semibold text-sm sm:text-base">{issue.emotionBreakdown.sadness}%</div>
                            <div className="text-muted-foreground text-xs">Sadness</div>
                          </div>
                          <div className="text-center p-2 rounded bg-muted/50">
                            <div className="text-warning font-semibold text-sm sm:text-base">{issue.emotionBreakdown.fear}%</div>
                            <div className="text-muted-foreground text-xs">Fear</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('regions')}>
                      View All Trending Issues
                    </Button>
                  </div>
                </MobileCardContent>
              </MobileCard>
            )}
          </TabsContent>

          {/* Political Parties Tab */}
          <TabsContent value="parties" className="space-y-4">
            <MobileCard>
              <MobileCardHeader className="pb-4">
                <MobileCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Political Parties</span>
                </MobileCardTitle>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Search parties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/political-parties">View All Parties</Link>
                  </Button>
                </div>
              </MobileCardHeader>
              <MobileCardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {politicalParties
                    .filter(party => 
                      searchTerm === '' || 
                      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      party.acronym?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 6)
                    .map((party) => (
                    <div key={party.id} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        {party.logo_url ? (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={party.logo_url} alt={party.name} />
                            <AvatarFallback>{party.acronym?.substring(0, 2) || party.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{party.acronym || party.name}</h3>
                          <p className="text-xs text-muted-foreground">{party.name}</p>
                          {party.headquarters_region && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {party.headquarters_region}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
                        <div>
                          <div className="font-semibold text-primary">{party.mps_count || 0}</div>
                          <div className="text-muted-foreground">MPs</div>
                        </div>
                        <div>
                          <div className="font-semibold text-secondary">{party.senators_count || 0}</div>
                          <div className="text-muted-foreground">Senators</div>
                        </div>
                        <div>
                          <div className="font-semibold text-accent">{party.mayors_count || 0}</div>
                          <div className="text-muted-foreground">Mayors</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{party.approval_rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-muted-foreground">({party.total_ratings || 0})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {party.promises_fulfilled}/{party.promises_total} promises kept
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCardContent>
            </MobileCard>
          </TabsContent>

          {/* Politicians Tab */}
          <TabsContent value="politicians" className="space-y-4">
            <MobileCard>
              <MobileCardHeader className="pb-4">
                <MobileCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Top Performing Officials</span>
                </MobileCardTitle>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Search politicians..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                    />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/politicians">View All Politicians</Link>
                  </Button>
                </div>
              </MobileCardHeader>
              <MobileCardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {topPoliticians
                    .filter(politician => 
                      searchTerm === '' || 
                      politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      politician.party?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 6)
                    .map((politician) => (
                    <div key={politician.id} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={politician.profile_image_url} alt={politician.name} />
                          <AvatarFallback>{politician.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{politician.name}</h3>
                            {politician.verified && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{politician.role_title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {politician.region}
                            {politician.party && (
                              <>
                                <span className="mx-1">•</span>
                                {politician.party}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs text-center mb-3">
                        <div>
                          <div className="font-semibold text-primary">{politician.civic_score}</div>
                          <div className="text-muted-foreground">Civic Score</div>
                        </div>
                        <div>
                          <div className="font-semibold text-secondary">{politician.average_rating?.toFixed(1) || '0.0'}</div>
                          <div className="text-muted-foreground">Rating</div>
                        </div>
                        <div>
                          <div className="font-semibold text-accent">{politician.promises_fulfilled}/{politician.promises_total}</div>
                          <div className="text-muted-foreground">Promises</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <RatingStars 
                          politicianId={politician.id} 
                          averageRating={politician.average_rating || 0}
                        />
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCardContent>
            </MobileCard>
          </TabsContent>

          {/* Promise Tracker Tab */}
          <TabsContent value="promises" className="space-y-4">
            <MobileCard>
              <MobileCardHeader className="pb-4">
                <MobileCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Promise Tracker</span>
                </MobileCardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Track political promises and their fulfillment status across parties and regions.
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/promises">View Full Promise Tracker</Link>
                  </Button>
                </div>
              </MobileCardHeader>
              <MobileCardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {politicalParties.slice(0, 6).map((party) => (
                    <div key={party.id} className="border rounded-lg p-3 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={party.logo_url} alt={party.name} />
                          <AvatarFallback className="text-xs">{party.acronym?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm">{party.acronym || party.name}</h4>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Fulfilled
                          </span>
                          <span className="font-semibold">{party.promises_fulfilled}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            Unfulfilled
                          </span>
                          <span className="font-semibold">{party.promises_total - party.promises_fulfilled}</span>
                        </div>
                        <div className="pt-2">
                          <Progress 
                            value={party.promises_total > 0 ? (party.promises_fulfilled / party.promises_total) * 100 : 0} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {party.promises_total > 0 ? 
                              `${Math.round((party.promises_fulfilled / party.promises_total) * 100)}% kept` : 
                              'No promises tracked'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCardContent>
            </MobileCard>
          </TabsContent>

          {/* Transparency Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <MobileCard>
              <MobileCardHeader className="pb-4">
                <MobileCardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Transparency Reports</span>
                </MobileCardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Access public transparency reports, budget documents, and accountability publications.
                </p>
              </MobileCardHeader>
              <MobileCardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {transparencyReports.slice(0, 6).map((report) => (
                    <div key={report.id} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {report.report_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.published_date).toLocaleDateString()}
                        </span>
                        <span>By {report.author}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {report.download_count} downloads
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {report.file_url && (
                            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCardContent>
            </MobileCard>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            {!isModuleVisible('regional_sentiment') ? (
              <Alert className="border-l-4 border-l-orange-500 bg-orange-50">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Restricted Content:</strong> {getRestrictedMessage('regional_sentiment')}
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Regional Safety & Mood</span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {regionalMoods.map((mood, idx) => (
                    <div key={idx} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm sm:text-base">{mood.region}</h3>
                        <Badge className={`text-xs whitespace-nowrap ${getDangerColor(mood.dangerLevel)}`}>
                          {getDangerLabel(mood.dangerLevel)}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">Mood:</span>
                          <span className={`font-semibold text-xs sm:text-sm ${getSentimentColor(mood.sentiment)}`}>
                            {getSentimentLabel(mood.sentiment)}
                          </span>
                        </div>
                        <Progress value={(mood.sentiment + 1) * 50} className="h-2" />
                        {mood.topIssues.length > 0 && (
                          <div className="text-xs sm:text-sm space-y-2">
                            <span className="font-medium text-muted-foreground">Top Concerns:</span>
                            <div className="flex flex-wrap gap-1">
                              {mood.topIssues.slice(0, 3).map((issue, issueIdx) => (
                                <Badge key={issueIdx} variant="outline" className="text-xs">
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="civic-report" className="space-y-4">
            {!isModuleVisible('civic_reports') ? (
              <Alert className="border-l-4 border-l-orange-500 bg-orange-50">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Restricted Content:</strong> {getRestrictedMessage('civic_reports')}
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Submit Civic Report</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Share your observations, concerns, or civic issues anonymously. All reports are reviewed before publication.
                  </p>
                </CardHeader>
              <CardContent className="pt-0">
                <MobileForm className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MobileFormField label="Location/Region" required>
                      <Select value={report.location} onValueChange={(value) => setReport({...report, location: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameroonRegions.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </MobileFormField>

                    <MobileFormField label="Issue Category" required>
                      <Select value={report.issue} onValueChange={(value) => setReport({...report, issue: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="What is this about?" />
                        </SelectTrigger>
                        <SelectContent>
                          {civicIssues.map((issue) => (
                            <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </MobileFormField>
                  </div>

                  <MobileFormField label="Your Emotion">
                    <Select value={report.emotion} onValueChange={(value) => setReport({...report, emotion: value})}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="How does this make you feel?" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </MobileFormField>

                  <MobileFormField label="Your Report" required>
                    <MobileTextarea
                      placeholder="Describe what you want to report..."
                      value={report.description}
                      onChange={(e) => setReport({...report, description: e.target.value})}
                      rows={4}
                    />
                  </MobileFormField>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="anonymous"
                      checked={report.isAnonymous}
                      onCheckedChange={(checked) => setReport({...report, isAnonymous: !!checked})}
                    />
                    <Label htmlFor="anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Submit anonymously (recommended)
                    </Label>
                  </div>

                  <Alert className="border-l-4 border-l-primary">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Privacy Notice:</strong> All reports are reviewed by our team before being included in public analysis. 
                      No personal information is stored or shared without explicit consent.
                    </AlertDescription>
                  </Alert>

                  <MobileButton 
                    onClick={submitCivicReport} 
                    disabled={isSubmitting}
                    className="w-full transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </MobileButton>
                </MobileForm>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Current Safety Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {regionalMoods.filter(mood => mood.dangerLevel !== 'low').length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-success" />
                      <h3 className="text-lg font-semibold text-success mb-2">All Clear</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No critical safety alerts across Cameroon regions at this time.
                      </p>
                    </div>
                  ) : (
                    regionalMoods
                      .filter(mood => mood.dangerLevel !== 'low')
                      .map((mood, idx) => (
                        <Alert key={idx} className="border-l-4 border-l-current">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm sm:text-base">{mood.region} Region</h4>
                                <Badge className={`text-xs ${getDangerColor(mood.dangerLevel)}`}>
                                  {getDangerLabel(mood.dangerLevel)}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm">
                                {mood.dangerLevel === 'critical' ? 
                                  'Critical situation detected. Monitor local news and follow official guidance.' :
                                  mood.dangerLevel === 'high' ?
                                  'Elevated tensions detected. Stay informed and exercise caution.' :
                                  'Monitoring ongoing situation. Stay alert.'
                                }
                              </p>
                              {mood.topIssues.length > 0 && (
                                <div className="text-xs sm:text-sm space-y-2">
                                  <span className="font-medium">Related Issues:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {mood.topIssues.slice(0, 3).map((issue, issueIdx) => (
                                      <Badge key={issueIdx} variant="outline" className="text-xs">
                                        {issue}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile-Optimized Footer */}
        <div className="text-center py-6 sm:py-8 text-muted-foreground border-t mt-8">
          <div className="flex items-center justify-center mb-3">
            <Target className="h-4 w-4 mr-2" />
            <Shield className="h-4 w-4 mr-2" />
            <Users className="h-4 w-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium">
            Civic Transparency Portal - Promoting accountability and civic engagement
          </p>
          <p className="text-xs mt-2 text-muted-foreground/80">
            Real-time data • Public access • Citizens first • Democratic transparency
          </p>
          <p className="text-xs mt-1 text-muted-foreground/60">
            Mobile-optimized • Accessible everywhere • Youth-friendly interface
          </p>
        </div>

        {/* Floating Action Button for Mobile */}
        <MobileFAB 
          onClick={() => setActiveTab('civic-report')}
          icon={<Plus className="h-6 w-6" />}
          className="bg-primary hover:bg-primary/90"
        />
      </div>
    </div>
  );
};

export default CivicPublicPortal;