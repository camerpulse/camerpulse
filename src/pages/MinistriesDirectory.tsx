import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Building, Star, Search, Filter, TrendingUp, AlertCircle, MessageCircle, FileText, Share2, Bell, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
    badges: ['Education Leader'],
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
  },
  {
    id: 'min-5',
    name: 'Ministry of Finance',
    acronym: 'MINFI',
    minister: 'Louis Paul Motaze',
    region: 'Centre',
    rating: 3.6,
    projects: 28,
    status: 'active',
    badges: ['Budget Leader'],
    budget: '2.8T FCFA',
    budgetUtilization: 88,
    lastUpdate: '1 day ago',
    transparency: 82,
    citizenEngagement: 79,
    responseTime: '2.5 days',
    completedProjects: 38,
    population: 25000000,
    departments: 15,
    employees: 8500,
    establishedYear: 1960,
    totalRatings: 1892,
    recentActivity: 'New tax reforms announced'
  }
];

const MinistriesDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
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
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, regionFilter, statusFilter, ratingFilter, sortBy]);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Top Performing Ministry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Education Leader':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Budget Leader':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Under Audit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  const handleSendFeedback = (id: string) => {
    toast({
      title: "Feedback Form",
      description: "Feedback form would open for this ministry.",
    });
  };

  const handleStartPetition = (id: string) => {
    toast({
      title: "Petition Started",
      description: "Petition form would open for this ministry.",
    });
  };

  const handleFollowUpdates = (id: string) => {
    toast({
      title: "Following Updates",
      description: "You will now receive updates from this ministry.",
    });
  };

  const renderMinistryCard = (ministry: any) => (
    <Card key={ministry.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Building className="h-8 w-8 text-primary mt-1" />
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
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSendFeedback(ministry.id)}
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
              onClick={() => handleStartPetition(ministry.id)}
              className="text-xs px-2"
            >
              <FileText className="h-3 w-3 mr-1" />
              Petition
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleFollowUpdates(ministry.id)}
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Government Ministries</h1>
            <p className="text-muted-foreground">
              Explore and engage with Cameroon's government ministries
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            {filteredMinistries.length} Ministries
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Avg Rating: {(filteredMinistries.reduce((acc, m) => acc + m.rating, 0) / filteredMinistries.length).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search ministries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={regionFilter} onValueChange={setRegionFilter}>
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="under_audit">Under Audit</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="high">High (4.0+)</SelectItem>
            <SelectItem value="medium">Medium (3.0-3.9)</SelectItem>
            <SelectItem value="low">Low (Below 3.0)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="transparency">Transparency</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ministry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMinistries.map(renderMinistryCard)}
      </div>

      {filteredMinistries.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No ministries found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default MinistriesDirectory;