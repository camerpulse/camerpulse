import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Star, Users, Crown, X, SlidersHorizontal, CheckCircle, GraduationCap, Heart, Globe, ChevronRight, TrendingUp, Award, Building, DollarSign, FileText, User } from 'lucide-react';
import { ServicesLayout } from '@/components/Layout/ServicesLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { InteractiveVillageMap } from '@/components/villages/InteractiveVillageMap';
import { VillageRecommendations } from '@/components/recommendations/VillageRecommendations';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  slug?: string;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  total_ratings_count: number;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  diaspora_engagement_score: number;
}

interface RankingCategory {
  category: string;
  title: string;
  icon: React.ReactNode;
  villages: Village[];
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  village_name: string;
  category: string;
  date: string;
}

interface FundraisingCampaign {
  id: string;
  title: string;
  village_name: string;
  target_amount: number;
  raised_amount: number;
  supporters: number;
  end_date: string;
}

interface VillagePetition {
  id: string;
  title: string;
  village_name: string;
  signatures: number;
  target_signatures: number;
  category: string;
  created_date: string;
}

const VillagesDirectory = () => {
  const { trackSearch, trackVillageView } = useAnalytics();
  const [villages, setVillages] = useState<Village[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredVillages, setFeaturedVillages] = useState({
    topRated: [],
    mostDeveloped: [],
    mostActive: []
  });
  const [rankingBoards, setRankingBoards] = useState<RankingCategory[]>([]);
  const [villageNews, setVillageNews] = useState<NewsItem[]>([]);
  const [fundraisingCampaigns, setFundraisingCampaigns] = useState<FundraisingCampaign[]>([]);
  const [villagePetitions, setVillagePetitions] = useState<VillagePetition[]>([]);
  const [donChiefHighlight, setDonChiefHighlight] = useState(null);

  // Advanced filter states
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    infrastructureRange: [0, 20],
    educationRange: [0, 10],
    healthRange: [0, 10],
    diasporaRange: [0, 10],
    sonsAndDaughtersMin: 0,
    viewsMin: 0,
    ratingsCountMin: 0,
    selectedDivisions: [] as string[],
    selectedSubdivisions: [] as string[]
  });

  const regions = [
    'all', 'Adamawa', 'Centre', 'East', 'Far North',
    'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchVillages();
    fetchFeaturedVillages();
    fetchRankingBoards();
    fetchVillageNews();
    fetchFundraisingCampaigns();
    fetchVillagePetitions();
    fetchDonChiefHighlight();
  }, []);

  const fetchVillages = async () => {
    try {
      let query = supabase
        .from('villages')
        .select('*')
        .order('overall_rating', { ascending: false });

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      if (searchTerm) {
        query = query.or(`village_name.ilike.%${searchTerm}%,division.ilike.%${searchTerm}%,subdivision.ilike.%${searchTerm}%`);
      }

      // Apply rating filter
      if (selectedRating !== 'all') {
        const minRating = parseFloat(selectedRating.replace('+', ''));
        query = query.gte('overall_rating', minRating);
      }

      // Apply advanced filters
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      query = query
        .gte('infrastructure_score', filters.infrastructureRange[0])
        .lte('infrastructure_score', filters.infrastructureRange[1])
        .gte('education_score', filters.educationRange[0])
        .lte('education_score', filters.educationRange[1])
        .gte('health_score', filters.healthRange[0])
        .lte('health_score', filters.healthRange[1])
        .gte('diaspora_engagement_score', filters.diasporaRange[0])
        .lte('diaspora_engagement_score', filters.diasporaRange[1])
        .gte('sons_daughters_count', filters.sonsAndDaughtersMin)
        .gte('view_count', filters.viewsMin)
        .gte('total_ratings_count', filters.ratingsCountMin);

      if (filters.selectedDivisions.length > 0) {
        query = query.in('division', filters.selectedDivisions);
      }

      if (filters.selectedSubdivisions.length > 0) {
        query = query.in('subdivision', filters.selectedSubdivisions);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVillages(data || []);
    } catch (error) {
      console.error('Error fetching villages:', error);
      toast.error('Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedVillages = async () => {
    try {
      // Top rated villages
      const { data: topRated } = await supabase
        .from('villages')
        .select('*')
        .order('overall_rating', { ascending: false })
        .limit(10);

      // Most developed (highest infrastructure score)
      const { data: mostDeveloped } = await supabase
        .from('villages')
        .select('*')
        .order('infrastructure_score', { ascending: false })
        .limit(10);

      // Most active (highest sons/daughters count)
      const { data: mostActive } = await supabase
        .from('villages')
        .select('*')
        .order('sons_daughters_count', { ascending: false })
        .limit(10);

      setFeaturedVillages({
        topRated: topRated || [],
        mostDeveloped: mostDeveloped || [],
        mostActive: mostActive || []
      });
    } catch (error) {
      console.error('Error fetching featured villages:', error);
    }
  };

  const fetchRankingBoards = async () => {
    try {
      const rankingCategories: RankingCategory[] = [
        {
          category: 'development',
          title: 'Development Leaders',
          icon: <Building className="h-5 w-5 text-blue-500" />,
          villages: []
        },
        {
          category: 'culture',
          title: 'Cultural Heritage',
          icon: <Crown className="h-5 w-5 text-purple-500" />,
          villages: []
        },
        {
          category: 'education',
          title: 'Education Champions',
          icon: <GraduationCap className="h-5 w-5 text-green-500" />,
          villages: []
        },
        {
          category: 'conflict_resolution',
          title: 'Peace & Unity',
          icon: <Heart className="h-5 w-5 text-red-500" />,
          villages: []
        }
      ];

      // Fetch top villages for each category
      for (const category of rankingCategories) {
        let orderBy = 'overall_rating';
        switch (category.category) {
          case 'development':
            orderBy = 'infrastructure_score';
            break;
          case 'education':
            orderBy = 'education_score';
            break;
          case 'culture':
          case 'conflict_resolution':
            orderBy = 'overall_rating';
            break;
        }

        const { data } = await supabase
          .from('villages')
          .select('*')
          .order(orderBy, { ascending: false })
          .limit(5);

        category.villages = data || [];
      }

      setRankingBoards(rankingCategories);
    } catch (error) {
      console.error('Error fetching ranking boards:', error);
    }
  };

  const fetchVillageNews = async () => {
    // Mock village news data
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'New Water Project Inaugurated in Bafut',
        summary: 'Community celebrates access to clean drinking water for 5,000 residents',
        village_name: 'Bafut',
        category: 'Infrastructure',
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Youth Development Initiative Launches in Bandjoun',
        summary: 'Skills training program targets 200 young people in technical trades',
        village_name: 'Bandjoun',
        category: 'Education',
        date: '2024-01-12'
      },
      {
        id: '3',
        title: 'Traditional Festival Attracts International Visitors',
        summary: 'Annual cultural celebration showcases rich heritage of Kom people',
        village_name: 'Njinikom',
        category: 'Culture',
        date: '2024-01-10'
      }
    ];
    setVillageNews(mockNews);
  };

  const fetchFundraisingCampaigns = async () => {
    // Mock fundraising campaigns
    const mockCampaigns: FundraisingCampaign[] = [
      {
        id: '1',
        title: 'Build Secondary School in Mamfe',
        village_name: 'Mamfe',
        target_amount: 50000000,
        raised_amount: 32000000,
        supporters: 156,
        end_date: '2024-06-30'
      },
      {
        id: '2',
        title: 'Health Center Renovation Project',
        village_name: 'Foumban',
        target_amount: 25000000,
        raised_amount: 18500000,
        supporters: 89,
        end_date: '2024-04-15'
      },
      {
        id: '3',
        title: 'Rural Road Construction Initiative',
        village_name: 'Wum',
        target_amount: 75000000,
        raised_amount: 15000000,
        supporters: 234,
        end_date: '2024-12-31'
      }
    ];
    setFundraisingCampaigns(mockCampaigns);
  };

  const fetchVillagePetitions = async () => {
    // Mock village petitions
    const mockPetitions: VillagePetition[] = [
      {
        id: '1',
        title: 'Improve Road Access to Bamenda-Kom',
        village_name: 'Kom',
        signatures: 1250,
        target_signatures: 2000,
        category: 'Infrastructure',
        created_date: '2024-01-01'
      },
      {
        id: '2',
        title: 'Stop Illegal Mining in Sacred Forest',
        village_name: 'Lebialem',
        signatures: 890,
        target_signatures: 1500,
        category: 'Environment',
        created_date: '2024-01-05'
      },
      {
        id: '3',
        title: 'Establish Government Hospital',
        village_name: 'Bali',
        signatures: 2340,
        target_signatures: 3000,
        category: 'Healthcare',
        created_date: '2023-12-20'
      }
    ];
    setVillagePetitions(mockPetitions);
  };

  const fetchDonChiefHighlight = async () => {
    // Mock Don/Chief profile highlight
    setDonChiefHighlight({
      name: 'His Royal Highness Fon Angwafo III',
      title: 'Fon of Mankon',
      village: 'Mankon',
      region: 'Northwest',
      achievements: [
        'Led community development for 25 years',
        'Established 3 schools and 2 health centers',
        'Promoted peace during regional conflicts'
      ],
      image: '/placeholder-chief.jpg'
    });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchVillages();
      // Track search if there's a search term
      if (searchTerm.trim()) {
        trackSearch(searchTerm, { region: selectedRegion, rating: selectedRating }, villages.length);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedRegion, selectedRating, filters]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  const resetFilters = () => {
    setFilters({
      verifiedOnly: false,
      infrastructureRange: [0, 20],
      educationRange: [0, 10],
      healthRange: [0, 10],
      diasporaRange: [0, 10],
      sonsAndDaughtersMin: 0,
      viewsMin: 0,
      ratingsCountMin: 0,
      selectedDivisions: [],
      selectedSubdivisions: []
    });
    setSelectedRegion('all');
    setSelectedRating('all');
    setSearchTerm('');
  };

  const VillageCard = ({ village, onClick }: { village: Village; onClick?: () => void }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <Link to={`/village/${village.slug || village.id}`} className="block" onClick={onClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {village.village_name}
                {village.is_verified && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {village.subdivision}, {village.division}, {village.region}
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center">
                {renderStars(village.overall_rating)}
                <span className="ml-1 text-sm font-medium">
                  {village.overall_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {village.total_ratings_count} ratings
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{village.sons_daughters_count}</div>
              <div className="text-xs text-muted-foreground">Sons & Daughters</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">{village.view_count}</div>
              <div className="text-xs text-muted-foreground">Profile Views</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">{village.infrastructure_score}/20</div>
              <div className="text-xs text-muted-foreground">Infrastructure</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Education: {village.education_score}/10
            </Badge>
            <Badge variant="outline" className="text-xs">
              Health: {village.health_score}/10
            </Badge>
            <Badge variant="outline" className="text-xs">
              Diaspora: {village.diaspora_engagement_score}/10
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <ServicesLayout serviceType="villages">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-civic py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Villages Directory</h1>
              <p className="text-xl opacity-90 mb-8">
                Discover, connect with, and celebrate villages across Cameroon
              </p>
              <div className="flex items-center justify-center gap-6 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{villages.length} Villages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span>{villages.filter(v => v.is_verified).length} Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Community Rated</span>
                </div>
              </div>
              
              {/* Village Search */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search villages by name, region, or division..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white text-black"
                    />
                  </div>
                  
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-full md:w-48 bg-white text-black">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region === 'all' ? 'All Regions' : region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger className="w-full md:w-48 bg-white text-black">
                      <SelectValue placeholder="Rating Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4+">4+ Stars</SelectItem>
                      <SelectItem value="3+">3+ Stars</SelectItem>
                      <SelectItem value="2+">2+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Link to="/villages/add">
                  <Button size="lg" variant="secondary" className="text-primary hover:text-primary-foreground">
                    <Plus className="h-5 w-5 mr-2" />
                    Add My Village
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Featured Village Slider */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Featured Villages
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVillages.topRated.slice(0, 6).map((village) => (
                <VillageCard key={village.id} village={village} />
              ))}
            </div>
          </section>

          {/* Ranking Board */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Village Rankings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rankingBoards.map((board) => (
                <Card key={board.category} className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    {board.icon}
                    <h3 className="font-semibold">{board.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {board.villages.slice(0, 3).map((village, index) => (
                      <div key={village.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">#{index + 1}</span>
                          <span className="truncate">{village.village_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(village.overall_rating).slice(0, 1)}
                          <span className="text-xs">{village.overall_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                    View Full Ranking <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* Don/Chief Profile Highlight */}
          {donChiefHighlight && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Traditional Leader Spotlight
              </h2>
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{donChiefHighlight.name}</h3>
                    <p className="text-lg text-primary mb-2">{donChiefHighlight.title}</p>
                    <p className="text-muted-foreground mb-4">
                      {donChiefHighlight.village}, {donChiefHighlight.region} Region
                    </p>
                    <div className="space-y-1">
                      {donChiefHighlight.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline">
                    View Profile <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            </section>
          )}

          {/* Fundraising Campaigns Board */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Community Fundraising
              </h2>
              <Button variant="outline" size="sm">
                View All Campaigns <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fundraisingCampaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4">
                  <h3 className="font-semibold mb-2">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{campaign.village_name}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((campaign.raised_amount / campaign.target_amount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(campaign.raised_amount / 1000000).toFixed(1)}M FCFA raised</span>
                      <span>{campaign.supporters} supporters</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Support Campaign
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* Village Petition Widget */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Community Petitions
              </h2>
              <Button variant="outline" size="sm">
                Create Petition <Plus className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {villagePetitions.map((petition) => (
                <Card key={petition.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{petition.category}</Badge>
                    <span className="text-xs text-muted-foreground">{petition.created_date}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{petition.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{petition.village_name}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Signatures</span>
                      <span>{petition.signatures} / {petition.target_signatures}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((petition.signatures / petition.target_signatures) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Sign Petition
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* News from Villages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Village News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {villageNews.map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{news.category}</Badge>
                      <span className="text-sm text-muted-foreground">{news.date}</span>
                    </div>
                    <CardTitle className="text-lg">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                    <p className="text-sm font-medium">{news.village_name}</p>
                    <Button variant="link" className="p-0 h-auto mt-2">
                      Read More <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Add Your Village CTA */}
          <section className="text-center py-12 bg-primary/5 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Add Your Village</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Help showcase your village's unique heritage, development projects, and community spirit. 
              Connect with sons and daughters worldwide.
            </p>
            <Link to="/villages/add">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Your Village
              </Button>
            </Link>
          </section>

          {/* Village Results Grid */}
          {!loading && villages.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {villages.length} Villages Found
                </h2>
                {(searchTerm || selectedRegion !== 'all' || selectedRating !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {villages.slice(0, 12).map((village) => (
                  <VillageCard 
                    key={village.id} 
                    village={village} 
                    onClick={() => trackVillageView(village.id, village.village_name)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ServicesLayout>
  );
};

export default VillagesDirectory;