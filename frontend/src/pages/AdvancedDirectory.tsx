import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Users, Star, Search, Filter, TrendingUp, AlertCircle, MessageCircle, FileText, Share2, Download, Eye, BarChart3, Calendar, Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Enhanced mock data with more comprehensive information
const mockMinistries = [
  {
    id: 'min-1',
    name: 'Ministry of Public Health',
    acronym: 'MINSANTE',
    minister: 'Dr. Manaouda Malachie',
    region: 'Centre',
    rating: 4.2,
    projects: 23,
    status: 'active',
    badges: ['Top Performing Ministry'],
    budget: '850B FCFA',
    budgetUtilization: 78,
    lastUpdate: '2 days ago',
    transparency: 85,
    citizenEngagement: 92,
    responseTime: '2.1 days',
    completedProjects: 45,
    population: 25000000,
    departments: 8,
    employees: 2500,
    establishedYear: 1960,
    totalRatings: 1247,
    recentActivity: 'Launched new vaccination campaign'
  },
  {
    id: 'min-2',
    name: 'Ministry of Education',
    acronym: 'MINEDUB',
    minister: 'Laurent Serge Etoundi Ngoa',
    region: 'Centre',
    rating: 3.8,
    projects: 45,
    status: 'active',
    badges: ['Most Active Council'],
    budget: '1.2T FCFA',
    budgetUtilization: 82,
    lastUpdate: '1 day ago',
    transparency: 76,
    citizenEngagement: 88,
    responseTime: '3.2 days',
    completedProjects: 67,
    population: 25000000,
    departments: 12,
    employees: 15000,
    establishedYear: 1961,
    totalRatings: 2156,
    recentActivity: 'Opened 50 new schools in rural areas'
  },
  {
    id: 'min-3',
    name: 'Ministry of Transport',
    acronym: 'MINTRANS',
    minister: 'Jean Ernest Massena Ngalle Bibehe',
    region: 'Centre',
    rating: 3.2,
    projects: 18,
    status: 'under_audit',
    badges: ['Under Audit'],
    budget: '650B FCFA',
    budgetUtilization: 65,
    lastUpdate: '5 days ago',
    transparency: 62,
    citizenEngagement: 71,
    responseTime: '4.5 days',
    completedProjects: 28,
    population: 25000000,
    departments: 6,
    employees: 1800,
    establishedYear: 1972,
    totalRatings: 876,
    recentActivity: 'Infrastructure audit ongoing'
  },
  {
    id: 'min-4',
    name: 'Ministry of Agriculture',
    acronym: 'MINADER',
    minister: 'Gabriel Mbairobe',
    region: 'Centre',
    rating: 4.0,
    projects: 31,
    status: 'active',
    badges: [],
    budget: '920B FCFA',
    budgetUtilization: 71,
    lastUpdate: '3 days ago',
    transparency: 79,
    citizenEngagement: 85,
    responseTime: '2.8 days',
    completedProjects: 52,
    population: 25000000,
    departments: 9,
    employees: 3200,
    establishedYear: 1960,
    totalRatings: 1534,
    recentActivity: 'New agricultural subsidies announced'
  }
];

const mockCouncils = [
  {
    id: 'council-1',
    name: 'Yaoundé City Council',
    region: 'Centre',
    division: 'Mfoundi',
    mayor: 'Luc Messi Atangana',
    population: 3200000,
    rating: 4.1,
    projects: 15,
    status: 'active',
    badges: ['Most Active Council'],
    budget: '45B FCFA',
    budgetUtilization: 73,
    lastUpdate: '1 day ago',
    transparency: 81,
    serviceDelivery: 87,
    responseTime: '2.2 days',
    completedProjects: 32,
    area: '923 km²',
    wards: 7,
    villages: 128,
    councilors: 120,
    establishedYear: 1941,
    totalRatings: 892,
    recentActivity: 'New waste management system launched'
  },
  {
    id: 'council-2',
    name: 'Douala City Council',
    region: 'Littoral',
    division: 'Wouri',
    mayor: 'Roger Mbassa Ndine',
    population: 2800000,
    rating: 3.9,
    projects: 22,
    status: 'active',
    badges: [],
    budget: '52B FCFA',
    budgetUtilization: 68,
    lastUpdate: '2 days ago',
    transparency: 78,
    serviceDelivery: 83,
    responseTime: '2.5 days',
    completedProjects: 41,
    area: '923 km²',
    wards: 6,
    villages: 89,
    councilors: 95,
    establishedYear: 1956,
    totalRatings: 1123,
    recentActivity: 'Port modernization project approved'
  },
  {
    id: 'council-3',
    name: 'Bamenda City Council',
    region: 'Northwest',
    division: 'Mezam',
    mayor: 'Paul Achobang',
    population: 800000,
    rating: 3.4,
    projects: 8,
    status: 'flagged',
    badges: ['Flagged by Citizens'],
    budget: '18B FCFA',
    budgetUtilization: 58,
    lastUpdate: '1 week ago',
    transparency: 65,
    serviceDelivery: 72,
    responseTime: '4.1 days',
    completedProjects: 18,
    area: '923 km²',
    wards: 3,
    villages: 45,
    councilors: 68,
    establishedYear: 1963,
    totalRatings: 432,
    recentActivity: 'Security concerns being addressed'
  }
];

const AdvancedDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('ministries');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; type: 'ministry' | 'council'; id?: string }>({ open: false, type: 'ministry' });
  const [petitionDialog, setPetitionDialog] = useState<{ open: boolean; type: 'ministry' | 'council'; id?: string }>({ open: false, type: 'ministry' });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const regions = ['Centre', 'Littoral', 'Northwest', 'West', 'North', 'Far North', 'East', 'South', 'Southwest', 'Adamawa'];

  const filteredMinistries = useMemo(() => {
    let filtered = mockMinistries.filter(ministry => {
      const matchesSearch = ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ministry.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ministry.minister.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || ministry.region === regionFilter;
      const matchesStatus = statusFilter === 'all' || ministry.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === 'high' && ministry.rating >= 4) ||
        (ratingFilter === 'medium' && ministry.rating >= 3 && ministry.rating < 4) ||
        (ratingFilter === 'low' && ministry.rating < 3);
      
      return matchesSearch && matchesRegion && matchesStatus && matchesRating;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'projects':
          return b.projects - a.projects;
        case 'budget':
          return parseFloat(b.budget.replace(/[^0-9.]/g, '')) - parseFloat(a.budget.replace(/[^0-9.]/g, ''));
        case 'transparency':
          return b.transparency - a.transparency;
        case 'engagement':
          return b.citizenEngagement - a.citizenEngagement;
        case 'recent':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, regionFilter, statusFilter, ratingFilter, sortBy]);

  const filteredCouncils = useMemo(() => {
    let filtered = mockCouncils.filter(council => {
      const matchesSearch = council.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           council.mayor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           council.division.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || council.region === regionFilter;
      const matchesStatus = statusFilter === 'all' || council.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === 'high' && council.rating >= 4) ||
        (ratingFilter === 'medium' && council.rating >= 3 && council.rating < 4) ||
        (ratingFilter === 'low' && council.rating < 3);
      
      return matchesSearch && matchesRegion && matchesStatus && matchesRating;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'projects':
          return b.projects - a.projects;
        case 'budget':
          return parseFloat(b.budget.replace(/[^0-9.]/g, '')) - parseFloat(a.budget.replace(/[^0-9.]/g, ''));
        case 'transparency':
          return b.transparency - a.transparency;
        case 'engagement':
          return b.serviceDelivery - a.serviceDelivery;
        case 'population':
          return b.population - a.population;
        case 'recent':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, regionFilter, statusFilter, ratingFilter, sortBy]);

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleCompareSelected = () => {
    if (selectedItems.length < 2) {
      toast({
        title: "Selection Required",
        description: "Please select at least 2 items to compare.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to comparison view (would be implemented)
    toast({
      title: "Comparison View",
      description: `Comparing ${selectedItems.length} selected items.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared for download.",
    });
  };

  const handleSendFeedback = (type: 'ministry' | 'council', id: string) => {
    setFeedbackDialog({ open: true, type, id });
  };

  const handleStartPetition = (type: 'ministry' | 'council', id: string) => {
    setPetitionDialog({ open: true, type, id });
  };

  const handleFollowUpdates = (type: 'ministry' | 'council', id: string) => {
    toast({
      title: "Following Updates",
      description: `You will now receive updates from this ${type}.`,
    });
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Performing Ministry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Most Active Council':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Audit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Flagged by Citizens':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_audit':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'flagged':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };

  const renderAdvancedMinistryCard = (ministry: any) => (
    <Card key={ministry.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={selectedItems.includes(ministry.id)}
              onCheckedChange={() => handleSelectItem(ministry.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {ministry.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{ministry.acronym}</p>
              <p className="text-sm text-muted-foreground mt-1">Minister: {ministry.minister}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(ministry.status)}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{ministry.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">{ministry.projects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium">{ministry.completedProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transparency</span>
              <span className="font-medium">{ministry.transparency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Engagement</span>
              <span className="font-medium">{ministry.citizenEngagement}%</span>
            </div>
          </div>

          {/* Budget Utilization */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Budget: {ministry.budget}</span>
              <span className="font-medium">{ministry.budgetUtilization}%</span>
            </div>
            <Progress value={ministry.budgetUtilization} className="h-2" />
          </div>

          {/* Recent Activity */}
          <div className="p-2 bg-muted/50 rounded text-xs">
            <span className="text-muted-foreground">Recent: </span>
            <span className="font-medium">{ministry.recentActivity}</span>
          </div>
          
          {ministry.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ministry.badges.map((badge: string, index: number) => (
                <Badge key={index} className={getBadgeColor(badge)}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/directory/ministry/${ministry.id}`)}
              className="w-full"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSendFeedback('ministry', ministry.id)}
              className="w-full"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Feedback
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleStartPetition('ministry', ministry.id)}
              className="text-xs px-2"
            >
              <FileText className="h-3 w-3 mr-1" />
              Petition
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleFollowUpdates('ministry', ministry.id)}
              className="text-xs px-2"
            >
              <Bell className="h-3 w-3 mr-1" />
              Follow
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-xs px-2"
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdvancedCouncilCard = (council: any) => (
    <Card key={council.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={selectedItems.includes(council.id)}
              onCheckedChange={() => handleSelectItem(council.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {council.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{council.region} Region, {council.division} Division</p>
              <p className="text-sm text-muted-foreground mt-1">Mayor: {council.mayor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(council.status)}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{council.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Population</span>
              <span className="font-medium">{council.population.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">{council.projects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transparency</span>
              <span className="font-medium">{council.transparency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Delivery</span>
              <span className="font-medium">{council.serviceDelivery}%</span>
            </div>
          </div>

          {/* Budget Utilization */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Budget: {council.budget}</span>
              <span className="font-medium">{council.budgetUtilization}%</span>
            </div>
            <Progress value={council.budgetUtilization} className="h-2" />
          </div>

          {/* Council Info */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-1 bg-muted/50 rounded">
              <div className="font-medium">{council.wards}</div>
              <div className="text-muted-foreground">Wards</div>
            </div>
            <div className="text-center p-1 bg-muted/50 rounded">
              <div className="font-medium">{council.villages}</div>
              <div className="text-muted-foreground">Villages</div>
            </div>
            <div className="text-center p-1 bg-muted/50 rounded">
              <div className="font-medium">{council.councilors}</div>
              <div className="text-muted-foreground">Councilors</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-2 bg-muted/50 rounded text-xs">
            <span className="text-muted-foreground">Recent: </span>
            <span className="font-medium">{council.recentActivity}</span>
          </div>
          
          {council.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {council.badges.map((badge: string, index: number) => (
                <Badge key={index} className={getBadgeColor(badge)}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/directory/council/${council.id}`)}
              className="w-full"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSendFeedback('council', council.id)}
              className="w-full"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Feedback
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleStartPetition('council', council.id)}
              className="text-xs px-2"
            >
              <FileText className="h-3 w-3 mr-1" />
              Petition
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleFollowUpdates('council', council.id)}
              className="text-xs px-2"
            >
              <Bell className="h-3 w-3 mr-1" />
              Follow
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-xs px-2"
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Complete Government Directory</h1>
            <p className="text-muted-foreground">Comprehensive directory with advanced features and citizen engagement tools</p>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Primary Search Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ministries, councils, officials, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Advanced
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-4">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_audit">Under Audit</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="high">4+ Stars</SelectItem>
                    <SelectItem value="medium">3-4 Stars</SelectItem>
                    <SelectItem value="low">Below 3 Stars</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="projects">Most Projects</SelectItem>
                    <SelectItem value="budget">Largest Budget</SelectItem>
                    <SelectItem value="transparency">Most Transparent</SelectItem>
                    <SelectItem value="engagement">Best Engagement</SelectItem>
                    <SelectItem value="recent">Recent Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Filters (Collapsible) */}
              {showAdvancedFilters && (
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-medium mb-3">Advanced Filters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm">Budget Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Under 100B FCFA</SelectItem>
                          <SelectItem value="medium">100B - 500B FCFA</SelectItem>
                          <SelectItem value="large">500B+ FCFA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Project Count</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="few">1-10 Projects</SelectItem>
                          <SelectItem value="many">11-30 Projects</SelectItem>
                          <SelectItem value="most">30+ Projects</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Response Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any response time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">Under 2 days</SelectItem>
                          <SelectItem value="medium">2-4 days</SelectItem>
                          <SelectItem value="slow">4+ days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Establishment Year</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="old">Before 1970</SelectItem>
                          <SelectItem value="modern">1970-2000</SelectItem>
                          <SelectItem value="recent">After 2000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* View Mode and Selection Tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <div className="flex rounded-md border">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('comparison')}
                      className="rounded-l-none"
                    >
                      Compare
                    </Button>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.length} selected
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCompareSelected}
                      disabled={selectedItems.length < 2}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Compare
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ministries" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Ministries ({filteredMinistries.length})
          </TabsTrigger>
          <TabsTrigger value="councils" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Councils ({filteredCouncils.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ministries" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMinistries.map(renderAdvancedMinistryCard)}
          </div>
          {filteredMinistries.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No ministries found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="councils" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCouncils.map(renderAdvancedCouncilCard)}
          </div>
          {filteredCouncils.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No councils found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog({...feedbackDialog, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea 
                id="feedback-message"
                placeholder="Share your feedback..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setFeedbackDialog({...feedbackDialog, open: false});
                  toast({
                    title: "Feedback Sent",
                    description: "Thank you for your feedback. We'll review it shortly.",
                  });
                }}
                className="flex-1"
              >
                Send Feedback
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFeedbackDialog({...feedbackDialog, open: false})}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Petition Dialog */}
      <Dialog open={petitionDialog.open} onOpenChange={(open) => setPetitionDialog({...petitionDialog, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a Petition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="petition-title">Petition Title</Label>
              <Input 
                id="petition-title"
                placeholder="Enter petition title..."
              />
            </div>
            <div>
              <Label htmlFor="petition-description">Description</Label>
              <Textarea 
                id="petition-description"
                placeholder="Describe what you're petitioning for..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="petition-goal">Signature Goal</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select signature goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 signatures</SelectItem>
                  <SelectItem value="500">500 signatures</SelectItem>
                  <SelectItem value="1000">1,000 signatures</SelectItem>
                  <SelectItem value="5000">5,000 signatures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setPetitionDialog({...petitionDialog, open: false});
                  toast({
                    title: "Petition Created",
                    description: "Your petition has been created and is now live for signatures.",
                  });
                }}
                className="flex-1"
              >
                Create Petition
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPetitionDialog({...petitionDialog, open: false})}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedDirectory;